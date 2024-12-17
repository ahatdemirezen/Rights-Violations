import { NextFunction, Request, Response } from "express";
import { ApplicationModel } from "../models/application-model";
import { DocumentModel } from "../models/document-model";
import { deleteFileFromS3 } from "../controllers/S3-controller";
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
  }  catch (error) {
    console.error("Başvuru oluşturulurken hata:", error);

    // Hata tipini kontrol et
    if (error instanceof Error) {
      // TC Kimlik Numarası için özel hata kontrolü
      if (error.message === "Bu TC Kimlik Numarası ile zaten bir başvuru yapılmıştır.") {
        res.status(400).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: "Başvuru oluşturulurken bir hata oluştu." });
    } else {
      // Error nesnesi değilse genel hata mesajı
      res.status(500).json({ error: "Bilinmeyen bir hata oluştu." });
    }
  }
};


export const getAllApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentType } = req.query;

    const applications = await getAllApplicationsService(documentType as string); // Service çağrısı

    if (!applications.length) {
      res.status(404).json({ message: "Hiç başvuru bulunamadı." });
      return;
    }

    res.status(200).json({ applications });
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



export const getDocumentTypes = async (req: Request, res: Response): Promise<void>  => {
  try {
    // Sabit tür listesini tanımlayın
    const documentTypes = [
      "Media Screening",
      "NGO Data",
      "Bar Commissions",
      "Public Institutions",
      "Other",
    ];

    // Tür listesini dön
    res.status(200).json({ documentTypes });
  } catch (error) {
    console.error("Hata:");
    res.status(500).json({ error: "Dosya türleri alınamadı." });
  }
};



export const updateApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  try {
    const { updatedApplication, message } = await updateApplicationService(req, id); // Service çağrısı

    res.status(200).json({
      message,
      application: updatedApplication,
    });
  } catch (error: any) {
    console.error("Başvuru güncellenirken hata oluştu:", error.message);
    res.status(500).json({
      error: "Başvuru güncellenirken hata oluştu.",
      details: error.message,
    });
  }
};


export const deleteApplication = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const application = await ApplicationModel.findById(id).populate("documents");

    if (!application) {
      res.status(404).json({ error: "Başvuru bulunamadı." });
      return;
    }

    for (const documentId of application.documents) {
      const document = await DocumentModel.findById(documentId);

      if (document) {
        for (const doc of document.documents) {
          if (doc.documentUrl) {
            await deleteFileFromS3(doc.documentUrl);
          }
        }

        await DocumentModel.findByIdAndDelete(documentId);
      }
    }

    await ApplicationModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Başvuru ve ilgili dokümanlar başarıyla silindi." });
  } catch (error: any) {
    console.error("Hata:", error.message);
    res.status(500).json({ error: "Başvuru silinirken hata oluştu.", details: error.message });
  }
};


function createHttpError(arg0: number, arg1: string) {
  throw new Error("Function not implemented.");
}

