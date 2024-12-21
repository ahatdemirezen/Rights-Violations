import { NextFunction, Request, Response } from "express";
import { createApplicationService , getAllApplicationsService , getApplicationByIdService , updateApplicationService} from "../services/application-service"; // Service katmanı import ediliyor


export const createApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const applicationData = req.body;
    const files = req.files;

    const result = await createApplicationService(applicationData, files); // Service fonksiyonu çağrılıyor

    res.status(201).json({
      message: "Başvuru başarıyla oluşturuldu.",
      application: result,
    });
  } catch (error) {
    console.error("Başvuru oluşturulurken hata:", error);

    // Hata tipini kontrol et
    if (error instanceof Error) {
      // TC Kimlik Numarası için özel hata kontrolü
      if (error.message === "Bu TC Kimlik Numarası ile zaten bir başvuru yapılmıştır.") {
        res.status(400).json({ success: false, error: error.message });
        return;
      }

      // Dosya yüklenememe hatası için özel kontrol
      if (error.message.includes("Dosya yüklenemedi")) {
        res.status(500).json({
          success: false,
          error: "Dosya yüklenemedi. Bu isimde bir dosya mevcut olabilir.",
        });
        return;
      }

      // Genel hata kontrolü
      res.status(500).json({ success: false, error: "Başvuru oluşturulurken bir hata oluştu." });
    } else {
      // Error nesnesi değilse genel hata mesajı
      res.status(500).json({ success: false, error: "Bilinmeyen bir hata oluştu." });
    }
  }
};



export const getAllApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    // Query parametrelerini al
    const { documentType, page, limit } = req.query;

    // Service çağrısı
    const result = await getAllApplicationsService({
      documentType: documentType as string,
      page: parseInt(page as string) || 1, // Varsayılan: 1. sayfa
      limit: parseInt(limit as string) || 10, // Varsayılan: 10 öğe
    });

    if (!result.applications.length) {
      res.status(404).json({ message: "Hiç başvuru bulunamadı." });
      return;
    }

    // Başvuruları ve pagination bilgilerini döndür
    res.status(200).json(result);
  } catch (error) {
    console.error("Hata:", error);
    res.status(500).json({ error: "Başvurular getirilirken hata oluştu." });
  }
};


export const getApplicationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  try {
    const { application, s3Files } = await getApplicationByIdService(id); // Service çağrısı

    if (!application) {
      throw createHttpError(404, "Başvuru bulunamadı.");
    }

    res.status(200).json({
      message: "Başvuru bilgileri başarıyla alındı.",
      application,
      s3Files,
    });
  } catch (error) {
    console.error("Başvuru bilgileri getirilirken hata oluştu:", error);
    next(error);
  }
};


export const updateApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  try {
    const { updatedApplication, message } = await updateApplicationService(req, id);
    res.status(200).json({
      message,
      application: updatedApplication,
    });
  } catch (error: any) {
    console.error("Başvuru güncellenirken hata oluştu:", error.message);
    res.status(error.message.includes("Dosya zaten mevcut") ? 400 : 500).json({
      error: error.message || "Başvuru güncellenirken bir hata oluştu.",
    });
  }
};


function createHttpError(arg0: number, arg1: string) {
  throw new Error("Function not implemented.");
}

