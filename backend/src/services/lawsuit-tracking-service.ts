import { ApplicationModel } from "../models/application-model";
import { FileModel } from "../models/files-model";
import { LawsuitTrackingModel } from "../models/lawsuitTracking-model";
import { uploadToS3 } from "../controllers/S3-controller";
import mongoose from "mongoose";
import createHttpError from "http-errors";

export const createLawsuitWithFilesService = async (
  applicationId: string,
  body: any,
  files: Express.Multer.File[]
) => {
  const {
    caseSubject,
    fileNumber,
    court,
    courtFileNo,
    caseNumber, // Esas numarası
    lawsuitDate, // Dava tarihi
  } = body;

  const fileDescriptions = JSON.parse(body.fileDescriptions || "[]");
  const fileTypes = JSON.parse(body.fileTypes || "[]");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. `applicationId` doğrulama
    const applicationExists = await ApplicationModel.findById(applicationId);
    if (!applicationExists) {
      throw createHttpError(404, "Application with the provided applicationId does not exist.");
    }

    const applicationNumber = applicationExists.applicationNumber;
    const applicantName = applicationExists.applicantName || "";
    const organizationName = applicationExists.organizationName || ""; // Eklenen kısım

    // 2. Dosyaları S3'e yükle ve FileModel'e kaydet
    const uploadedFiles = await Promise.all(
      files.map(async (file, index) => {
        const s3Response = await uploadToS3(file);
        const fileUrl = s3Response.files[0]?.url;

        if (!fileUrl) {
          throw new Error("S3 yanıtından dosya URL'si alınamadı.");
        }

        const newFile = new FileModel({
          fileType: fileTypes[index] || null,
          fileUrl,
          description: fileDescriptions[index] || null,
        });

        const savedFile = await newFile.save({ session });
        return savedFile._id;
      })
    );

    // 3. Yeni dava oluştur ve dosyaları ilişkilendir
    const newLawsuit = new LawsuitTrackingModel({
      applicationId,
      applicationNumber,
      applicantName,
      organizationName, // Eklenen kısım
      caseSubject,
      fileNumber,
      courtFileNo,
      court,
      caseNumber: caseNumber || null,
      lawsuitDate: lawsuitDate || new Date(),
      files: uploadedFiles,
    });

    const savedLawsuit = await newLawsuit.save({ session });

    // 4. Application'daki lawsuitCreated alanını güncelle
    await ApplicationModel.findByIdAndUpdate(
      applicationId,
      { lawsuitCreated: true }, // `lawsuitCreated` alanını `true` yap
      { session, new: true } // Transaction ile güvenli güncelleme
    );

    // Transaction'ı tamamla
    await session.commitTransaction();
    session.endSession();

    return savedLawsuit;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getLawsuitByIdService = async (lawsuitId: string) => {
    // Dava bilgilerini getir ve applicationId içindeki lawyer bilgilerini populate et
    const lawsuit = await LawsuitTrackingModel.findById(lawsuitId)
      .populate("files") // Dosyaları getir
      .populate({
        path: "applicationId", // Application referansını getir
        populate: {
          path: "lawyer", // Application'daki lawyer referansını getir
          select: "name", // Sadece name bilgisini getir
        },
      });
  
    if (!lawsuit) {
      throw createHttpError(404, "Lawsuit with the provided ID does not exist.");
    }
  
    return lawsuit.toObject(); // Tüm bilgileri JSON olarak döndür
  };

  export const getAllLawsuitsService = async () => {
    // Tüm davaları al ve applicationId üzerinden lawyer bilgilerini de getir
    const lawsuits = await LawsuitTrackingModel.find()
      .select(
        "applicationNumber applicantName organizationName caseSubject fileNumber court courtFileNo caseNumber lawsuitDate createdAt updatedAt archive"
      ) // Sadece gerekli alanları seç
      .populate({
        path: "applicationId", // Application bilgilerini getir
        populate: {
          path: "lawyer", // Lawyer bilgilerini getir
          select: "name email", // Lawyer'dan sadece name ve email bilgilerini al
        },
      });
  
    // Application null olan kayıtları kontrol et
    const nullApplications = lawsuits.filter(
      (lawsuit) => lawsuit.applicationId === null
    );
  
    if (nullApplications.length > 0) {
      console.warn(
        `Uyarı: ${nullApplications.length} dava, applicationId alanı boş olduğu için lawyer bilgisi getirilemedi.`
      );
    }
  
    if (!lawsuits || lawsuits.length === 0) {
      throw createHttpError(404, "Hiçbir dava bulunamadı.");
    }
  
    return lawsuits;
  };

  export const updateLawsuitWithFilesService = async (
    lawsuitId: string,
    body: any,
    files: Express.Multer.File[]
  ): Promise<any> => {
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
    } = body;
  
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
            return savedFile._id as mongoose.Types.ObjectId;
          })
        );
      }
  
      // 3. Mevcut dava bilgilerini güncelle
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
  
      // Transaction'ı tamamla
      await session.commitTransaction();
      session.endSession();
  
      return updatedLawsuit;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  };


  export const updateLawsuitArchiveStatusService = async (
    lawsuitId: string,
    archive: boolean
  ): Promise<any> => {
    if (typeof archive !== "boolean") {
      throw createHttpError(400, "Archive status must be a boolean value.");
    }
  
    // Dava bilgilerini güncelle
    const updatedLawsuit = await LawsuitTrackingModel.findByIdAndUpdate(
      lawsuitId,
      { archive },
      { new: true } // Güncellenmiş belgeyi döndür
    );
  
    if (!updatedLawsuit) {
      throw createHttpError(404, "Lawsuit with the provided ID does not exist.");
    }
  
    return updatedLawsuit;
  };