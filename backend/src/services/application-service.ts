import { ApplicationModel } from "../models/application-model";
import { saveDocument , processDocuments } from "../helper/helper";
import { uploadToS3 } from "../controllers/S3-controller";
import { Types } from "mongoose";
import mongoose from "mongoose";
import { UserModel ,UserRole } from "../models/user-model";
import { Request } from "express";

export const createApplicationService = async (applicationData: any, files: any): Promise<any> => {
  const {
    applicantName,
    receivedBy,
    nationalID,
    applicationType,
    applicationDate,
    organizationName,
    address,
    phoneNumber,
    complaintReason,
    eventCategories,
    links = [],
    descriptions = [],
    types = [],
  } = applicationData;

  // Zorunlu alan kontrolü
  if (!nationalID || !applicationType || !applicationDate || !eventCategories) {
    throw new Error("Zorunlu alanlar eksik!");
  }

  // Event categories doğrulama
  const validCategories = [
    "Aile ve Özel Yaşam Hakkı",
    "Ayrımcılık",
    "Basın Özgürlüğü",
    "Kadına Karşı Şiddet ve Taciz",
    "Çocuğa Karşı Şiddet ve Taciz",
    "Örgütlenme Özgürlüğü",
    "İşkence ve Kötü Muamele",
    "Eğitim Hakkı",
    "Düşünce ve İfade Özgürlüğü",
  ];
  if (!validCategories.includes(eventCategories)) {
    throw new Error("Geçersiz eventCategories değeri!");
  }

  const lastApplication = await ApplicationModel.findOne().sort({ applicationNumber: -1 });
  const applicationNumber = lastApplication ? lastApplication.applicationNumber + 1 : 1;
  const documents: Types.ObjectId[] = [];

  // Dosyaları işleme
  if (files) {
    const uploadedFiles = Array.isArray(files) ? files : [files];
    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i] as Express.Multer.File;
      const description = Array.isArray(descriptions) ? descriptions[i] : descriptions || `Document ${i + 1}`;
      const type = Array.isArray(types) ? types[i] : "Other";

      try {
        const s3Response = await uploadToS3(file);
        const documentUrl = s3Response.files?.[0]?.url;
        if (!documentUrl) throw new Error("S3 URL alınamadı.");

        const documentId = await saveDocument("files", {
          description,
          type,
          url: documentUrl,
        });
        documents.push(documentId);
      } catch (error) {
        console.error("Dosya yüklenirken hata:", error);
        throw new Error("Dosya yüklenemedi.");
      }
    }
  }

  // Linkleri işleme
  if (links && links.length > 0) {
    const parsedLinks = Array.isArray(links) ? links : [links];
    for (const link of parsedLinks) {
      const { documentDescription, type, documentSource } = link;

      if (!documentSource) {
        throw new Error("Her link için 'documentSource' zorunludur.");
      }

      const documentId = await saveDocument("link", {
        description: documentDescription || "Link",
        type: type || "Other",
        source: documentSource,
      });
      documents.push(documentId);
    }
  }

  // Başvuru oluşturma
  const newApplication = new ApplicationModel({
    applicationNumber,
    applicantName,
    organizationName,
    receivedBy,
    nationalID,
    applicationType,
    applicationDate,
    address,
    phoneNumber,
    complaintReason,
    eventCategories,
    documents,
  });

  const savedApplication = await newApplication.save();
  const populatedApplication = await ApplicationModel.findById(savedApplication._id).populate("documents");

  return populatedApplication;
};

export const getAllApplicationsService = async (documentType?: string) => {
    try {
      // Belge türüne göre filtreleme
      const documentFilter = documentType ? { "documents.type": documentType } : {};
  
      // Başvuruları veritabanından çekme ve ilişkili verileri populate etme
      const applications = await ApplicationModel.find(documentFilter)
        .populate("eventCategories", "name")
        .populate("documents");
  
      return applications;
    } catch (error) {
      console.error("Başvurular getirilirken hata oluştu:", error);
      throw new Error("Başvurular getirilirken bir hata oluştu.");
    }
  };

  export const getApplicationByIdService = async (id: string) => {
    try {
      // Başvuruyu veritabanından al ve belgeleri populate et
      const application = await ApplicationModel.findById(id).populate({
        path: "documents",
        select: "documents.documentUrl documents.documentDescription documents.documentSource", // Alt belgeleri al
      });
  
      if (!application) {
        return { application: null, s3Files: [] }; // Başvuru bulunamazsa boş değer döndür
      }
  
      // Documents içindeki bilgileri kontrol et
      const s3Files = application.documents.map((doc: any) => {
        const docDetails = doc.documents[0]; // İlk alt belge
        return {
          documentUrl: docDetails?.documentUrl || "URL bulunamadı",
          documentSource: docDetails?.documentSource || "", // documentSource'u ekliyoruz
          documentDescription: docDetails?.documentDescription || "Dosya",
        };
      });
  
      return { application: application.toObject(), s3Files }; // Başvuru ve S3 bilgilerini döndür
    } catch (error) {
      console.error("Başvuru bilgileri getirilirken hata oluştu:", error);
      throw new Error("Başvuru bilgileri alınırken bir hata oluştu.");
    }
  };   

  export const updateApplicationService = async (req: Request, id: string) => {
    const updatedFields = { ...req.body };
  
    // Mevcut başvuruyu alın
    const existingApplication = await ApplicationModel.findById(id).populate("documents");
    if (!existingApplication) {
      throw new Error("Başvuru bulunamadı.");
    }
  
    let existingDocuments = existingApplication.documents as any[];
  
    // Dosyaları işleyin ve yeni belgeleri ekleyin
    if (req.files && Array.isArray(req.files)) {
      const newDocumentIds = await processDocuments(
        req.body.descriptions || [],
        req.body.types || [],
        req.files as Express.Multer.File[],
        req.body.links || []
      );
  
      // Mevcut ve yeni belgeleri birleştir
      existingDocuments = [...existingDocuments, ...newDocumentIds];
    }
  
    // Güncellenmiş belgeleri ekleyin
    updatedFields.documents = existingDocuments;
  
    // Lawyer alanını kontrol edin ve ObjectId formatına çevirin
    if (req.body.lawyer) {
      const lawyerId = req.body.lawyer;
  
      if (!mongoose.Types.ObjectId.isValid(lawyerId)) {
        throw new Error("Geçerli bir avukat ID'si girilmelidir.");
      }
  
      // Avukatın varlığını ve rolünü kontrol edin
      const lawyer = await UserModel.findById(lawyerId);
      if (!lawyer || !lawyer.roles.includes(UserRole.Lawyer)) {
        throw new Error("Geçerli bir avukat ID'si girilmelidir.");
      }
  
      // Lawyer ID'sini updatedFields'a ekleyin
      updatedFields.lawyer = new mongoose.Types.ObjectId(lawyerId);
    }
  
    // Başvuruyu güncelleyin
    const updatedApplication = await ApplicationModel.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true, runValidators: true }
    );
  
    if (!updatedApplication) {
      throw new Error("Başvuru güncellenemedi. Belirtilen ID'ye sahip başvuru bulunamadı.");
    }
  
    return {
      updatedApplication,
      message: "Başvuru başarıyla güncellendi.",
    };
  };