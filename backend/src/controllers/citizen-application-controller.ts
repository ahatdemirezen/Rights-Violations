import { Request, Response } from "express";
import { createApplicationCitizenService } from "../services/citizen-application-service";

export const createApplicationcitizen = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[]; // Yüklenen dosyalar
    const savedApplication = await createApplicationCitizenService(req.body, files);

    // Başarılı yanıt
    res.status(201).json({
      success: true,
      message: "Başvuru başarıyla oluşturuldu.",
      application: savedApplication,
    });
  } catch (error: any) {
    console.error("Başvuru oluşturulurken hata:", error.message);
    res.status(400).json({ success: false, error: error.message });
  }
};

export default createApplicationcitizen;
