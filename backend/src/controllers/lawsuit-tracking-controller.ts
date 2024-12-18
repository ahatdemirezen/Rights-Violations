import { Request, Response, NextFunction } from "express";
import { createLawsuitWithFilesService , getLawsuitByIdService , getAllLawsuitsService , updateLawsuitWithFilesService , updateLawsuitArchiveStatusService} from "../services/lawsuit-tracking-service";


export const createLawsuitWithFiles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { applicationId } = req.params;
  const files = req.files as Express.Multer.File[]; // Yüklenen dosyalar

  try {
    const lawsuit = await createLawsuitWithFilesService(applicationId, req.body, files);

    res.status(201).json({
      message: "Dava ve dosyalar başarıyla oluşturuldu.",
      lawsuit,
    });
  } catch (error: any) {
    console.error("Dava oluşturma sırasında hata:", error);

    // Hata kontrolü: S3 yükleme hatası veya başka bir hata
    const errorMessage = error?.message || "Dava oluşturulurken bir hata oluştu.";

    res.status(500).json({
      success: false,
      message: "Dava oluşturma sırasında hata meydana geldi. Bu isimde bir dosya mevcut olabilir.",
      error: errorMessage,
      details: error.details || null, // Detaylı hata açıklamasını döner
    });
  }
};


export const getLawsuitById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { lawsuitId } = req.params;

  try {
    // Servis dosyasından dava bilgilerini al
    const lawsuit = await getLawsuitByIdService(lawsuitId);

    // Yanıt oluştur ve döndür
    res.status(200).json({
      message: "Dava bilgileri başarıyla alındı.",
      lawsuit,
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
    // Servis dosyasından tüm davaları al
    const lawsuits = await getAllLawsuitsService();

    // Yanıtı döndür
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
  const { lawsuitId } = req.params;
  const files = req.files as Express.Multer.File[];

  try {
    // Servis katmanını çağır ve dava güncelleme işlemini gerçekleştir
    const updatedLawsuit = await updateLawsuitWithFilesService(
      lawsuitId,
      req.body,
      files
    );

    // Başarılı yanıt döndür
    res.status(200).json({
      message: "Dava başarıyla güncellendi.",
      lawsuit: updatedLawsuit,
    });
  } catch (error: any) {
    console.error("Dava güncelleme sırasında hata oluştu:", error);

    // Hata durumunda uygun response döndür
    const statusCode = error.status || 500;
    const errorMessage =
      error.message || "Dava güncellenirken beklenmeyen bir hata oluştu.";

    res.status(statusCode).json({
      message: "Dava güncellenemedi.",
      error: errorMessage,
      details: error.details || null,
    });
  }
};


export const updateLawsuitArchiveStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { lawsuitId } = req.params;
  const { archive } = req.body;

  try {
    // Servis katmanını çağır ve dava arşiv durumu güncelleme işlemini gerçekleştir
    const updatedLawsuit = await updateLawsuitArchiveStatusService(
      lawsuitId,
      archive
    );

    // Yanıt döndür
    res.status(200).json({
      message: "Dava arşiv durumu başarıyla güncellendi.",
      lawsuit: updatedLawsuit,
    });
  } catch (error) {
    console.error("Dava arşiv durumu güncellenirken hata oluştu:", error);
    next(error);
  }
};