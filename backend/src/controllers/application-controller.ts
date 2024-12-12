import { NextFunction, Request, Response } from "express";
import { ApplicationModel } from "../models/application-model";
import { DocumentModel } from "../models/document-model";
import { deleteFileFromS3, uploadToS3 } from "../controllers/S3-controller";
import { Types } from "mongoose"; // `Types` import edildi
import mongoose from "mongoose";

import { UserModel ,UserRole } from "../models/user-model";

// Yardımcı Fonksiyon: DocumentModel Kaydet
const saveDocument = async (
  documentType: "files" | "link",
  documentData: {
    description: string;
    type: string;
    url?: string;
    source?: string;
  }
): Promise<Types.ObjectId> => {
  const { description, type, url, source } = documentData;
  console.log("saveDocument çağrıldı:", documentType, documentData);

  const documentObject = {
    documentType,
    documentDescription: description,
    type,
    ...(documentType === "files" && url ? { documentUrl: url } : {}),
    ...(documentType === "link" && source ? { documentSource: source } : {}),
  };

  const newDocument = new DocumentModel({
    documents: [documentObject],
  });

  const savedDocument = await newDocument.save();
  return savedDocument._id as Types.ObjectId;
};

// Yeni Başvuru Oluşturma
export const createApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      applicantName,
      receivedBy,
      nationalID,
      applicationType,
      applicationDate,
      address,
      phoneNumber,
      complaintReason,
      eventCategories, // eventCategories alındı
      links = [],
      descriptions = [],
      types = [],
    } = req.body;

    // Zorunlu Alan Kontrolü
    if (!applicantName || !nationalID || !applicationType || !applicationDate || !eventCategories) {
      res.status(400).json({ error: "Zorunlu alanlar eksik!" });
      return; // Fonksiyondan çık
    }

    // eventCategories doğrulama
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
      res.status(400).json({ error: "Geçersiz eventCategories değeri!" });
      return;
    }

    const lastApplication = await ApplicationModel.findOne().sort({ applicationNumber: -1 });
    const applicationNumber = lastApplication ? lastApplication.applicationNumber + 1 : 1;
    const documents: Types.ObjectId[] = [];

    // Dosyaları İşleme
    if (req.files) {
      const uploadedFiles = Array.isArray(req.files) ? req.files : [req.files];
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
          res.status(500).json({ error: "Dosya yüklenemedi." });
        }
      }
    }

    // Linkleri İşleme
    if (links && links.length > 0) {
      const parsedLinks = Array.isArray(links) ? links : [links];
      for (const link of parsedLinks) {
        const { documentDescription, type, documentSource } = link;

        if (!documentSource) {
          res.status(400).json({ error: "Her link için 'documentSource' zorunludur." });
          return;
        }

        const documentId = await saveDocument("link", {
          description: documentDescription || "Link",
          type: type || "Other",
          source: documentSource,
        });
        documents.push(documentId);
      }
    }

    // Başvuru Oluşturma
    const newApplication = new ApplicationModel({
      applicationNumber,
      applicantName,
      receivedBy, // Başvuruyu alan kişi ekleniyor
      nationalID,
      applicationType,
      applicationDate,
      address,
      phoneNumber,
      complaintReason,
      eventCategories, // eventCategories kaydediliyor
      documents,
    });

    const savedApplication = await newApplication.save();
    const populatedApplication = await ApplicationModel.findById(savedApplication._id).populate("documents");

    res.status(201).json({
      message: "Başvuru başarıyla oluşturuldu.",
      application: populatedApplication,
    });
  } catch (error) {
    console.error("Başvuru oluşturulurken hata:", error);
    res.status(500).json({ error: "Başvuru oluşturulurken hata oluştu." });
  }
};


export const getAllApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentType } = req.query;

    const documentFilter = documentType ? { "documents.type": documentType } : {};
    const applications = await ApplicationModel.find(documentFilter)
      .populate("eventCategories", "name")
      .populate("documents");

    if (!applications.length) {
      res.status(404).json({ message: "Hiç başvuru bulunamadı." });
      return;
    }

    res.status(200).json({ applications });
  } catch (error: any) {
    console.error("Hata:", error.message);
    res.status(500).json({ error: "Başvurular getirilirken hata oluştu." });
  }
};

export const getApplicationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  try {
    // Başvuruyu veritabanından al ve belgeleri populate et
    const application = await ApplicationModel.findById(id).populate({
      path: "documents",
      select: "documents.documentUrl documents.documentDescription documents.documentSource", // Alt belgeleri al
    });

    if (!application) {
      throw createHttpError(404, "Başvuru bulunamadı.");
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

    // Yanıtı döndür
    res.status(200).json({
      message: "Başvuru bilgileri başarıyla alındı.",
      application: application.toObject(), // Başvuru verisi
      s3Files, // S3 dosya bilgileri
    });
  } catch (error: any) {
    console.error("Başvuru bilgileri getirilirken hata oluştu:", error);
    next(error);
  }
};



export const getDocumentTypes = async (req: Request, res: Response): Promise<void>  => {
  try {
    // Sabit tür listesini tanımlayın
    const documentTypes = [
      "Media Screening",
      "NGO Data",
      "Bar Commissions",
      "Public Institutions",
      "Other",
    ];

    // Tür listesini dön
    res.status(200).json({ documentTypes });
  } catch (error) {
    console.error("Hata:");
    res.status(500).json({ error: "Dosya türleri alınamadı." });
  }
};



export const updateApplication = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Gelen veriyi kontrol edin
    console.log("Gelen Body:", req.body);
    console.log("Gelen Files:", req.files);

    const updatedFields = { ...req.body };

    // Mevcut başvuruyu veritabanından alın
    const existingApplication = await ApplicationModel.findById(id).populate("documents");
    if (!existingApplication) {
      res.status(404).json({ error: "Başvuru bulunamadı." });
      return;
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
      console.log("Gönderilen Lawyer ID:", lawyerId);
      console.log("ObjectId geçerli mi:", mongoose.Types.ObjectId.isValid(lawyerId));
      // Lawyer ID'sini ObjectId olarak kontrol edin
      if (!mongoose.Types.ObjectId.isValid(lawyerId)) {
        res.status(400).json({ error: "Geçerli bir avukat ID'si girilmelidir." });
        return;
      }

      // Avukatın varlığını ve rolünü kontrol edin
      const lawyer = await UserModel.findById(lawyerId);
      if (!lawyer || !lawyer.roles.includes(UserRole.Lawyer)) {
        res.status(400).json({ error: "Geçerli bir avukat ID'si girilmelidir." });
        return;
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
      res.status(404).json({ error: "Başvuru güncellenemedi. Belirtilen ID'ye sahip başvuru bulunamadı." });
      return;
    }

    console.log("Güncellenmiş Başvuru:", updatedApplication);

    res.status(200).json({ message: "Başvuru başarıyla güncellendi.", application: updatedApplication });
  } catch (error: any) {
    console.error("Hata oluştu:", error.message);
    res.status(500).json({ error: "Başvuru güncellenirken hata oluştu.", details: error.message });
  }
};


export const deleteApplication = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const application = await ApplicationModel.findById(id).populate("documents");

    if (!application) {
      res.status(404).json({ error: "Başvuru bulunamadı." });
      return;
    }

    for (const documentId of application.documents) {
      const document = await DocumentModel.findById(documentId);

      if (document) {
        for (const doc of document.documents) {
          if (doc.documentUrl) {
            await deleteFileFromS3(doc.documentUrl);
          }
        }

        await DocumentModel.findByIdAndDelete(documentId);
      }
    }

    await ApplicationModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Başvuru ve ilgili dokümanlar başarıyla silindi." });
  } catch (error: any) {
    console.error("Hata:", error.message);
    res.status(500).json({ error: "Başvuru silinirken hata oluştu.", details: error.message });
  }
};

const processDocuments = async (
  descriptions: { files: string[]; links: string[] },
  types: { files: string[]; links: string[] },
  files: Express.Multer.File[],
  links: string[] = []
): Promise<Types.ObjectId[]> => {
  const savedDocuments: Types.ObjectId[] = [];

  // Dosyaları İşle
  for (let i = 0; i < files.length; i++) {
    const description = descriptions.files[i] || `Document ${i + 1}`;
    const type = types.files[i] || "Other";

    const s3Response = await uploadToS3(files[i]);
    const documentUrl = s3Response.files[0]?.url;

    const newDocument = new DocumentModel({
      documents: [{ documentDescription: description, type, documentUrl }],
    });

    const savedDocument = await newDocument.save();
    savedDocuments.push(savedDocument._id as Types.ObjectId);
  }

  // Linkleri İşle
  for (let i = 0; i < links.length; i++) {
    const description = descriptions.links[i] || `Link ${i + 1}`;
    const type = types.links[i] || "Other";

    const documentUrl = links[i];
    if (!documentUrl) continue; // Boş link varsa atla

    const newDocument = new DocumentModel({
      documents: [
        {
          documentType: "link",
          documentSource: documentUrl,
          documentUrl,
          documentDescription: description,
          type,
        },
      ],
    });

    const savedDocument = await newDocument.save();
    savedDocuments.push(savedDocument._id as Types.ObjectId);
  }

  return savedDocuments;
};


function createHttpError(arg0: number, arg1: string) {
  throw new Error("Function not implemented.");
}

