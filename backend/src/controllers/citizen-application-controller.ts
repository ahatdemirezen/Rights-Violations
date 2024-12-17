import { Request, Response } from "express";
import { ApplicationModel } from "../models/application-model";
import { DocumentModel } from "../models/document-model";
import { uploadToS3 } from "./S3-controller";
import { Types } from "mongoose"; // `Types` import edildi  

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
export const createApplicationcitizen = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      applicantName,
      nationalID,
      email,
      applicationType,
      applicationDate,
      organizationName,
      address,
      phoneNumber,
      complaintReason,
      eventCategories, // eventCategories alındı
      links = [],
      descriptions = [],
      types = [],
    } = req.body;

    // Zorunlu Alan Kontrolü
    if ( !nationalID || !applicationType || !applicationDate || !eventCategories) {
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
      organizationName,
      nationalID,
      email,
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


export default createApplicationcitizen;