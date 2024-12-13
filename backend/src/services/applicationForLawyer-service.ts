import { ApplicationModel } from "../models/application-model";

export const getApplicationsByLawyer = async (lawyerId: string) => {
  if (!lawyerId) {
    throw new Error("Lawyer ID is required");
  }

  // ApplicationModel üzerinde `lawyer` alanı userId ile eşleşen başvuruları getir
  const applications = await ApplicationModel.find({ lawyer: lawyerId });

  if (!applications || applications.length === 0) {
    throw new Error("No applications found for this lawyer");
  }

  return applications;
};

export const getApplicationDetails = async (lawyerId: string, applicationId: string) => {
  if (!lawyerId) {
    throw new Error("Lawyer ID is required");
  }

  if (!applicationId) {
    throw new Error("Application ID is required");
  }

  // ApplicationModel üzerinde `lawyer` alanı userId ile eşleşen ve `_id` değerine sahip başvuruyu getir
  const application = await ApplicationModel.findOne({
    _id: applicationId,
    lawyer: lawyerId,
  }).populate({
    path: "documents",
    select: "documents.documentUrl documents.documentDescription documents.documentSource", // Belgelerin detaylarını al
  });

  if (!application) {
    throw new Error("No application found with the given ID for this lawyer");
  }

  // Documents içindeki bilgileri kontrol et ve düzenle
  const populatedDocuments = application.documents.map((doc: any) => {
    const docDetails = doc.documents[0]; // İlk alt belge
    return {
      documentUrl: docDetails?.documentUrl || null,
      documentSource: docDetails?.documentSource || null,
      documentDescription: docDetails?.documentDescription || "Belge açıklaması yok",
    };
  });

  return { ...application.toObject(), populatedDocuments }; // Application ve belgelerle birlikte döndür
};
