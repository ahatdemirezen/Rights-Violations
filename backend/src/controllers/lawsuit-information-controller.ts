import { Request, Response, NextFunction } from "express";
import { LawsuitInformationModel } from "../models/lawsuitInformation-model";
import { LawsuitTrackingModel } from "../models/lawsuitTracking-model";
import createHttpError from "http-errors";

export const createLawsuitInformation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { lawsuitTrackinId, resultDescription, resultStage } = req.body;

  try {
    // 1. `lawsuitTrackinId` doğrulama
    const lawsuitExists = await LawsuitTrackingModel.findById(lawsuitTrackinId);
    if (!lawsuitExists) {
      throw createHttpError(404, "Lawsuit with the provided ID does not exist.");
    }

    // 2. Yeni dava bilgisi oluşturma
    const newLawsuitInformation = new LawsuitInformationModel({
      lawsuitTrackinId,
      resultDescription: resultDescription || null,
      resultStage: resultStage || null,
    });

    // 3. Veritabanına kaydet
    const savedLawsuitInformation = await newLawsuitInformation.save();

    // 4. Başarılı yanıt döndür
    res.status(201).json({
      message: "Dava bilgileri başarıyla kaydedildi.",
      lawsuitInformation: savedLawsuitInformation,
    });
  } catch (error) {
    console.error("Dava bilgisi oluşturma sırasında hata:", error);
    next(error);
  }
};


export const getLawsuitInformation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { lawsuitTrackinId } = req.params; // URL'den `lawsuitTrackinId` alınır
  
    try {
      // 1. `lawsuitTrackinId` doğrulama
      const lawsuitInformation = await LawsuitInformationModel.find({ lawsuitTrackinId })
        .populate({
          path: "lawsuitTrackinId", // `LawsuitTracking` şemasıyla bağlantı kur
          select: "fileNumber court courtFileNo", // Sadece bu alanları al
        });
  
      if (!lawsuitInformation || lawsuitInformation.length === 0) {
        throw createHttpError(404, "Lawsuit information for the provided ID does not exist.");
      }
  
      // 2. Başarılı yanıt döndür
      res.status(200).json({
        message: "Dava bilgileri başarıyla alındı.",
        lawsuitInformation,
      });
    } catch (error) {
      console.error("Dava bilgisi alma sırasında hata:", error);
      next(error);
    }
  };
  