import { Types } from "mongoose";
import { ApplicationModel } from "../models/application-model";
import { uploadToS3 } from "../controllers/S3-controller";
import { saveDocument } from "../helper/helper";

export const createApplicationCitizenService = async (data: any, files?: Express.Multer.File[]) => {
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
    eventCategories,
    links = [],
    descriptions = [],
    types = [],
  } = data;

  // National ID Kontrolü
  const existingApplication = await ApplicationModel.findOne({ nationalID });
  if (existingApplication) {
    throw new Error("Bu T.C. Kimlik Numarası ile zaten bir başvuru yapılmış.");
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
    throw new Error("Geçersiz eventCategories değeri!");
  }

  const lastApplication = await ApplicationModel.findOne().sort({ applicationNumber: -1 });
  const applicationNumber = lastApplication ? lastApplication.applicationNumber + 1 : 1;

  const documents: Types.ObjectId[] = [];

  // Dosyaları İşleme
  if (files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const description = Array.isArray(descriptions) ? descriptions[i] : descriptions || `Document ${i + 1}`;
      const type = Array.isArray(types) ? types[i] : types || "Other";

      const s3Response = await uploadToS3(file);
      const documentUrl = s3Response.files?.[0]?.url;
      if (!documentUrl) throw new Error("S3 URL alınamadı.");

      const documentId = await saveDocument("files", {
        description,
        type,
        url: documentUrl,
      });
      documents.push(documentId);
    }
  }

  // Linkleri İşleme
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

  // Yeni başvuru oluştur
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
    eventCategories,
    documents,
  });

  const savedApplication = await newApplication.save();
  return ApplicationModel.findById(savedApplication._id).populate("documents");
};
