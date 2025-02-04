import { Request, Response, NextFunction } from "express";
import { LawsuitTrackingModel } from "../models/lawsuitTracking-model";
import { ApplicationModel, IApplication } from "../models/application-model";
import mongoose from "mongoose";
import { FileModel } from "../models/files-model";
import { uploadToS3} from "../controllers/S3-controller";
import createHttpError from "http-errors";
import { getLawsuitsByLawyerService , getLawsuitByIdService} from "../services/lawsuit-trackingForLawyer-service";
import { loggerLawyer } from "../../utils/loggerForLawyer";

export const getLawsuitsByLawyer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Middleware'den gelen userId (avukat ID'si)
    const userId = (req as any).user?.userId;

    // Servis katmanını çağır ve davaları al
    const lawsuits = await getLawsuitsByLawyerService(userId);

    // Davaları yanıt olarak döndür
    res.status(200).json({
      message: "Lawsuits retrieved successfully",
      data: lawsuits,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error retrieving lawsuits:", error.message);
      return res.status(500).json({ message: error.message });
    }

    console.error("Unexpected error:", error);
    next(error);
  }
};


export const updateLawsuitWithFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { lawsuitId } = req.params; // URL'den `lawsuitId` alınır
  const userId = (req as any).user?.userId; // Middleware'den gelen userId alınır

  if (!userId) {
    return res.status(400).json({ message: "User ID not found in request" });
  }

  const {
    caseSubject,
    fileNumber,
    court,
    description,
    fileType,
    courtFileNo,
    lawsuitDate,
    caseNumber,
    resultDescription,
    resultStage,
  } = req.body; // Ek alanlar alındı

  const files = req.files as Express.Multer.File[]; // Yüklenen dosyalar

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Dava ve avukat eşleşmesini kontrol et
    const lawsuit = await LawsuitTrackingModel.findOne({
      _id: lawsuitId,
    })
      .populate({
        path: "applicationId",
        populate: {
          path: "lawyer",
        },
      });

    if (!lawsuit) {
      throw createHttpError(
        404,
        "Lawsuit with the provided ID does not exist or access is denied."
      );
    }

    // 2. Avukatın erişim yetkisini kontrol et
    const application = lawsuit.applicationId as IApplication;
    if (application.lawyer?._id.toString() !== userId) {
      throw createHttpError(403, "Access denied. You are not authorized to view this lawsuit.");
    }

    // 3. Yeni dosyaları S3'e yükle ve FileModel'e kaydet
    let newUploadedFiles: mongoose.Types.ObjectId[] = [];
    if (files && files.length > 0) {
      newUploadedFiles = await Promise.all(
        files.map(async (file, index): Promise<mongoose.Types.ObjectId> => {
          try {
            const s3Response = await uploadToS3(file); // AWS S3'e dosya yükleme
            const fileUrl = s3Response.signedUrl; // Signed URL alınıyor

            if (!fileUrl) {
              throw new Error("S3 yanıtından dosya URL'si alınamadı.");
            }

            const newFile = new FileModel({
              fileType: fileType || null,
              fileUrl,
              description: description || null,
            });

            const savedFile = await newFile.save({ session });
            return savedFile._id as mongoose.Types.ObjectId;
          } catch (error) {
            console.error(`Dosya (${file.originalname}) yüklenirken hata:`, error);
            throw new Error(`Dosya yüklenemedi: ${file.originalname}`);
          }
        })
      );
    }

    // 4. Mevcut dava bilgilerini güncelle
    lawsuit.caseSubject = caseSubject || lawsuit.caseSubject;
    lawsuit.fileNumber = fileNumber || lawsuit.fileNumber;
    lawsuit.court = court || lawsuit.court;
    lawsuit.courtFileNo = courtFileNo || lawsuit.courtFileNo;
    lawsuit.lawsuitDate = lawsuitDate || lawsuit.lawsuitDate;
    lawsuit.caseNumber = caseNumber || lawsuit.caseNumber;
    lawsuit.resultDescription = resultDescription || lawsuit.resultDescription;
    lawsuit.resultStage = resultStage || lawsuit.resultStage;

    // Yeni dosyaları mevcut dosya listesine ekle
    lawsuit.files = [...(lawsuit.files || []), ...newUploadedFiles];

    // Güncellenmiş davayı kaydet
    const updatedLawsuit = await lawsuit.save({ session });

    // 5. Transaction'ı tamamla
    await session.commitTransaction();
    session.endSession();

   loggerLawyer.info(`Avukat (ID: ${userId} dava (ID: ${lawsuitId} güncellendi.` , {
    lawyerId: userId,
      lawsuitId,
      updatedFields: {
        caseSubject,
        fileNumber,
        court,
        courtFileNo,
        lawsuitDate,
        caseNumber,
        resultDescription,
        resultStage,
      },
      uploadedFiles: newUploadedFiles.length,
      status: "Success",
   })

    // Yanıt döndür
    res.status(200).json({
      message: "Dava başarıyla güncellendi.",
      lawsuit: updatedLawsuit,
    });
  } catch (error) {
    console.error("Dava güncelleme sırasında hata oluştu:", error);

    await session.abortTransaction();
    session.endSession();

    loggerLawyer.error(`Avukat (ID: ${userId}) dava (ID: ${lawsuitId}) güncellerken hata oluştu.`, {
      lawyerId: userId,
      lawsuitId,
      error: error instanceof Error ? error.message : String(error),
      status: "Failed",
    });
    
    if (error instanceof Error) {
      return res.status(500).json({
        message: "Dava güncellenirken bir hata oluştu.",
        error: error.message,
      });
    }

    return res.status(500).json({
      message: "Dava güncellenirken bilinmeyen bir hata oluştu.",
      error: String(error),
    });
  }
};




export const getLawsuitById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { lawsuitId } = req.params;
  const userId = (req as any).user?.userId; // Middleware'den gelen userId alınır

  if (!userId) {
    return res.status(400).json({ message: "User ID not found in request" });
  }

  try {
    // Service katmanını çağır
    const lawsuit = await getLawsuitByIdService(lawsuitId, userId);

    // 3. Yanıt oluştur ve döndür
    res.status(200).json({
      message: "Dava bilgileri başarıyla alındı.",
      lawsuit: lawsuit.toObject(),
    });
  } catch (error) {
    console.error("Dava bilgileri getirilirken hata oluştu:", error);
    next(error);
  }
};

export const getLawsuitsForCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(400).json({ message: "User ID not found in request" });
      return;
    }

    // Avukata ait davaları getir
    const lawsuits = await getLawsuitsByLawyerService(userId);

    // Takvim için gerekli bilgileri hazırlayın
    const calendarEvents = lawsuits.map((lawsuit) => {
      // Tarih formatından yalnızca tarihi al
      const lawsuitDate = lawsuit.lawsuitDate
        ? new Date(lawsuit.lawsuitDate.toISOString().split("T")[0]) // Saat kısmını kaldır
        : new Date();

      return {
        id: lawsuit._id,
        title: lawsuit.caseSubject || "Dava Konusu Yok",
        start: lawsuitDate, // Başlangıç tarihi
        end: lawsuitDate,   // Bitiş tarihi (aynı tarih)
        applicantName: (lawsuit.applicationId as IApplication)?.applicantName || "Başvuran Adı Yok",
        applicationNumber: (lawsuit.applicationId as IApplication)?.applicationNumber || "Başvuru No Yok",
      };
    });

    console.log("Takvim Verileri (saat kaldırıldı):", calendarEvents);

    res.status(200).json({
      message: "Takvim verileri başarıyla alındı.",
      events: calendarEvents,
    });
  } catch (error) {
    console.error("Takvim verileri alınırken hata oluştu:", error);
    next(error);
  }
};
