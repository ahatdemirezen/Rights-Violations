import { ApplicationModel } from "../models/application-model";
import { LawsuitTrackingModel } from "../models/lawsuitTracking-model";
import createHttpError from "http-errors";
import { IApplication } from "../models/application-model";

export const getLawsuitsByLawyerService = async (userId: string) => {
  if (!userId) {
    throw createHttpError(400, "User ID not found in request");
  }

  // Lawyer'a atanmış başvuruları al
  const applications = await ApplicationModel.find({ lawyer: userId }).select("_id");

  if (!applications || applications.length === 0) {
    throw createHttpError(404, "No applications found for this lawyer");
  }

  // Başvurulara bağlı davaları al
  const applicationIds = applications.map((app) => app._id);

  const lawsuits = await LawsuitTrackingModel.find({
    applicationId: { $in: applicationIds },
  })
    .populate({
      path: "applicationId", // Başvuru bilgilerini doldur
      select: "applicantName applicationNumber", // Sadece gerekli alanları getir
    })
    .exec();
  
  if (!lawsuits || lawsuits.length === 0) {
    throw createHttpError(404, "No lawsuits found for the given lawyer's applications");
  }

  return lawsuits;
};


export const getLawsuitByIdService = async (
    lawsuitId: string,
    userId: string
  ) => {
    // 1. Dava bilgilerini getir ve applicationId içindeki lawyer ile eşleştirme yap
    const lawsuit = await LawsuitTrackingModel.findOne({
      _id: lawsuitId,
    })
      .populate({
        path: "applicationId", // Başvuru detaylarını getir
        populate: {
          path: "lawyer", // Lawyer bilgilerini getir
        },
      })
      .populate("files"); // Dosyaları getir
  
    if (!lawsuit) {
      throw createHttpError(
        404,
        "Lawsuit with the provided ID does not exist or access is denied."
      );
    }
  
    const application = lawsuit.applicationId as IApplication;
  
    // 2. Avukatın bu davaya erişim yetkisi olup olmadığını kontrol et
    if (application.lawyer?._id.toString() !== userId) {
      throw createHttpError(403, "Access denied. You are not authorized to view this lawsuit.");
    }
  
    return lawsuit;
  };