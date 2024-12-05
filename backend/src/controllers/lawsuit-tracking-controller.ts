import { Request, Response, NextFunction } from "express";
import { LawsuitTrackingModel } from "../models/lawsuitTracking-model";
import { ApplicationModel } from "../models/application-model";
import { FileModel } from "../models/files-model";
import { uploadToS3 , getFileFromS3} from "../controllers/S3-controller";
import mongoose from "mongoose";
import createHttpError from "http-errors";

export const createLawsuitWithFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { applicationId } = req.params; // URL'den `applicationId` alınır
  const { caseSubject, lawyer, fileNumber, court, description, fileType , courtFileNo } = req.body;
  const files = req.files as Express.Multer.File[]; // Yüklenen dosyalar
console.log("files" , files)
  if (!files || files.length === 0) {
    return next(createHttpError(400, "En az bir dosya yüklemelisiniz."));
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. `applicationId` doğrulama
    const applicationExists = await ApplicationModel.findById(applicationId);
    if (!applicationExists) {
      throw createHttpError(404, "Application with the provided applicationId does not exist.");
    }

    const applicationNumber = applicationExists.applicationNumber; // Başvuru numarası alınır
    const applicantName = applicationExists.applicantName
    // 2. Dosyaları S3'e yükle ve FileModel'e kaydet
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const s3Response = await uploadToS3(file);
        const fileUrl = s3Response.files[0]?.url;

        if (!fileUrl) {
          throw new Error("S3 yanıtından dosya URL'si alınamadı.");
        }

        const newFile = new FileModel({
          fileType,
          fileUrl,
          description: description || null,
        });

        const savedFile = await newFile.save({ session });
        return savedFile._id; // Kaydedilen dosyanın ObjectId'sini al
      })
    );

    // 3. Yeni dava oluştur ve dosyaları ilişkilendir
    const newLawsuit = new LawsuitTrackingModel({
      applicationId,
      applicationNumber,
      applicantName,
      caseSubject,
      lawyer: lawyer || null,
      fileNumber,
      courtFileNo,
      court,
      files: uploadedFiles, // Dosya ID'lerini ilişkilendir
    });

    const savedLawsuit = await newLawsuit.save({ session });

    // 4. Transaction'ı tamamla
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Dava ve dosyalar başarıyla oluşturuldu.",
      lawsuit: savedLawsuit,
    });
  } catch (error) {
    console.error("Dava oluşturma sırasında hata:", error);
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
export const getLawsuitById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { lawsuitId } = req.params;

  try {
    // 1. Dava bilgilerini getir
    const lawsuit = await LawsuitTrackingModel.findById(lawsuitId).populate("files");

    if (!lawsuit) {
      throw createHttpError(404, "Lawsuit with the provided ID does not exist.");
    }

    // 2. Yanıt oluştur ve döndür
    res.status(200).json({
      message: "Dava bilgileri başarıyla alındı.",
      lawsuit: lawsuit.toObject(), // `files` içinde zaten `fileUrl` bilgisi mevcut
    });
  } catch (error) {
    console.error("Dava bilgileri getirilirken hata oluştu:", error);
    next(error);
  }
};



export const getAllLawsuits = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Tüm davaları al (files hariç)
    const lawsuits = await LawsuitTrackingModel.find()
      .select(
        "applicationNumber applicantName caseSubject lawyer fileNumber court courtFileNo createdAt updatedAt"
      ); // Sadece gerekli alanları seç

    if (!lawsuits || lawsuits.length === 0) {
      throw createHttpError(404, "Hiçbir dava bulunamadı.");
    }

    // 2. Yanıtı döndür
    res.status(200).json({
      message: "Tüm davalar başarıyla alındı.",
      lawsuits,
    });
  } catch (error) {
    console.error("Tüm davalar getirilirken hata oluştu:", error);
    next(error);
  }
};
export const updateLawsuitWithFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { lawsuitId } = req.params; // URL'den `lawsuitId` alınır
  const { caseSubject, lawyer, fileNumber, court, description, fileType, courtFileNo } = req.body;
  const files = req.files as Express.Multer.File[]; // Yüklenen dosyalar

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Mevcut dava kontrolü
    const lawsuit = await LawsuitTrackingModel.findById(lawsuitId);
    if (!lawsuit) {
      throw createHttpError(404, "Lawsuit with the provided ID does not exist.");
    }

    // 2. Yeni dosyaları S3'e yükle ve FileModel'e kaydet
    let newUploadedFiles: mongoose.Types.ObjectId[] = [];
    if (files && files.length > 0) {
      newUploadedFiles = await Promise.all(
        files.map(async (file): Promise<mongoose.Types.ObjectId> => {
          const s3Response = await uploadToS3(file);
          const fileUrl = s3Response.files[0]?.url;
    
          if (!fileUrl) {
            throw new Error("S3 yanıtından dosya URL'si alınamadı.");
          }
    
          const newFile = new FileModel({
            fileType,
            fileUrl,
            description: description || null,
          });
    
          const savedFile = await newFile.save({ session });
          
          // `savedFile._id` değerini açıkça `mongoose.Types.ObjectId` türüne dönüştürüyoruz.
          return savedFile._id as mongoose.Types.ObjectId;
        })
      );
    }
    
    // 3. Mevcut dava bilgilerini güncelle
    lawsuit.caseSubject = caseSubject || lawsuit.caseSubject;
    lawsuit.lawyer = lawyer || lawsuit.lawyer;
    lawsuit.fileNumber = fileNumber || lawsuit.fileNumber;
    lawsuit.court = court || lawsuit.court;
    lawsuit.courtFileNo = courtFileNo || lawsuit.courtFileNo;

    // Yeni dosyaları mevcut dosya listesine ekle
    lawsuit.files = [...(lawsuit.files || []), ...newUploadedFiles];

    // Güncellenmiş davayı kaydet
    const updatedLawsuit = await lawsuit.save({ session });

    // 4. Transaction'ı tamamla
    await session.commitTransaction();
    session.endSession();

    // Yanıt döndür
    res.status(200).json({
      message: "Dava başarıyla güncellendi.",
      lawsuit: updatedLawsuit,
    });
  } catch (error) {
    console.error("Dava güncelleme sırasında hata oluştu:", error);
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
