import { Request, Response, NextFunction } from "express";
import { DocumentModel } from "../models/document-model";

export const getAllDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Veritabanından tüm dökümanları al
    const documents = await DocumentModel.find();

    // Eğer hiç döküman yoksa 404 döndür
    if (!documents || documents.length === 0) {
      res.status(404).json({ message: "Hiç döküman bulunamadı." });
      return;
    }

    // Başarıyla dökümanları döndür
    res.status(200).json({ documents });
  } catch (error: any) {
    console.error("Dökümanları alırken hata:", error.message);
    res.status(500).json({ error: "Dökümanları getirirken bir hata oluştu." });
  }
};
