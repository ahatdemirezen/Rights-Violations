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
  } catch (error) {
    console.error("Dava oluşturma sırasında hata:", error);
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

    // Yanıt döndür
    res.status(200).json({
      message: "Dava başarıyla güncellendi.",
      lawsuit: updatedLawsuit,
    });
  } catch (error) {
    console.error("Dava güncelleme sırasında hata oluştu:", error);
    next(error);
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