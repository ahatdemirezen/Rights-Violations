import { Request, Response, NextFunction } from "express";
import { ApplicationModel } from "../models/application-model";
import { getApplicationsByLawyer , getApplicationDetails } from "../services/applicationForLawyer-service";


export const getAllApplicationByLawyer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // `req.user` içerisindeki userId'yi al
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(400).json({ message: "User ID not found in request" });
      return;
    }

    // Servis dosyasından başvuruları al
    const applications = await getApplicationsByLawyer(userId);

    // Başvuruları geri döndür
    res.status(200).json({
      message: "Applications retrieved successfully",
      data: applications,
    });
  } catch (error) {
    // Hata durumunda next ile error handler'a gönder
    next(error);
  }
};

export const getApplicationDetailsByLawyer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // `req.user` içerisindeki userId'yi al
    const userId = (req as any).user?.userId;

    if (!userId) {
      res.status(400).json({ message: "User ID not found in request" });
      return;
    }

    // URL'den `applicationId` al
    const { applicationId } = req.params;

    // Servis dosyasından başvuru detaylarını al
    const application = await getApplicationDetails(userId, applicationId);

    // Başvuru detaylarını geri döndür
    res.status(200).json({
      message: "Application retrieved successfully",
      data: application,
    });
  } catch (error) {
    // Hata durumunda next ile error handler'a gönder
    next(error);
  }
};