import { Request, Response, NextFunction } from "express";
import { ComplaintReasonModel } from "../models/complaintReason-model";

// Yeni Şikayet Nedeni Ekle
export const createComplaintReason = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { reasons } = req.body;

    if (!reasons || !Array.isArray(reasons)) {
      return res.status(400).json({ message: "Reasons must be an array." });
    }

    const newReason = new ComplaintReasonModel({ reasons });
    await newReason.save();

    res.status(201).json(newReason);
  } catch (error) {
    next(error);
  }
};
export const addReason = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params; // ComplaintReasonModel'ın ana `_id`si
    const { reason } = req.body; // Eklenecek reason içeriği
  
    try {
      const updatedComplaintReason = await ComplaintReasonModel.findByIdAndUpdate(
        id,
        { $push: { reasons: { reason: reason } } }, // Yeni reason objesi ekle
        { new: true } // Güncellenmiş dökümanı döndür
    );
  
      if (!updatedComplaintReason) {
        return res.status(404).json({ message: "ComplaintReason not found." });
      }
  
      res.status(201).json(updatedComplaintReason);
    } catch (error) {
      next(error);
    }
  };
  
// Şikayet Nedeni Güncelle
export const updateReason = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params; // reasons dizisindeki `_id`
    const { reason } = req.body; // Yeni reason içeriği
  
    try {
      const updatedReason = await ComplaintReasonModel.findOneAndUpdate(
        { "reasons._id": id }, // reasons içinde `_id`'yi bul
        { $set: { "reasons.$.reason": reason } }, // Bulunan `_id`'nin reason alanını güncelle
        { new: true }
      );
  
      if (!updatedReason) {
        return res.status(404).json({ message: "Reason not found." });
      }
  
      res.status(200).json(updatedReason);
    } catch (error) {
      next(error);
    }
  };
  

// Şikayet Nedeni Sil
export const deleteReason = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { id } = req.params; // reasons dizisindeki `_id`
  
    try {
      const updatedComplaintReason = await ComplaintReasonModel.findOneAndUpdate(
        { "reasons._id": id }, // reasons içinde `_id`'yi bul
        { $pull: { reasons: { _id: id } } }, // `_id`'ye sahip reason'ı sil
        { new: true }
      );
  
      if (!updatedComplaintReason) {
        return res.status(404).json({ message: "Reason not found." });
      }
  
      res.status(200).json(updatedComplaintReason);
    } catch (error) {
      next(error);
    }
  };
  