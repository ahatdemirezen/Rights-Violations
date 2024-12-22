import { Request, Response, NextFunction } from "express";
import { DocumentModel } from "../models/document-model";

export const getAllDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Query parametrelerinden sayfa ve limit değerlerini al
    const page = parseInt(req.query.page as string) || 1; // Varsayılan: 1. sayfa
    const limit = parseInt(req.query.limit as string) || 16; // Varsayılan: 10 belge
    
    // Sayfalama için başlangıç noktası (skip değeri) hesapla
    const skip = (page - 1) * limit;

    // Toplam döküman sayısını al (pagination için toplam sayfa hesaplaması)
    const totalDocuments = await DocumentModel.countDocuments();

    // Veritabanından dökümanları getir (skip ve limit ile)
    const documents = await DocumentModel.find()
      .skip(skip)
      .limit(limit);

    // Eğer hiç döküman yoksa 404 döndür
    if (!documents || documents.length === 0) {
      res.status(404).json({ message: "Hiç döküman bulunamadı." });
      return;
    }

    // Toplam sayfa sayısını hesapla
    const totalPages = Math.ceil(totalDocuments / limit);

    // Başarıyla dökümanları döndür
    res.status(200).json({
      documents,
      pagination: {
        currentPage: page,
        totalPages,
        totalDocuments,
        limit,
      },
    });
  } catch (error: any) {
    console.error("Dökümanları alırken hata:", error.message);
    res.status(500).json({ error: "Dökümanları getirirken bir hata oluştu." });
  }
};
