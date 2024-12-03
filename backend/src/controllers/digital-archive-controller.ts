import { Request, Response, NextFunction } from "express";
import { DigitalArchiveModel } from "../models/digitalArchive.model";

// Get All Archives
export const getAllArchives = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const archives = await DigitalArchiveModel.find().populate("eventCategory"); // Olay kategorisini populate et
    res.status(200).json(archives);
  } catch (error) {
    next(error);
  }
};


// Get Archives by Type
export const getArchivesByType = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { type } = req.params;
  try {
    const archives = await DigitalArchiveModel.find({ type });
    res.status(200).json(archives);
  } catch (error) {
    next(error); // Hata durumunda Express'e iletilir
  }
};

// Create New Archive
export const createArchive = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const newArchive = new DigitalArchiveModel(req.body);
    await newArchive.save();
    res.status(201).json(newArchive);
  } catch (error) {
    next(error); // Hata durumunda Express'e iletilir
  }
};

// Update Archive
export const updateArchive = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { id } = req.params;
  try {
    const updatedArchive = await DigitalArchiveModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedArchive) {
      res.status(404).json({ message: "Archive not found" });
    } else {
      res.status(200).json(updatedArchive);
    }
  } catch (error) {
    next(error); // Hata durumunda Express'e iletilir
  }
};

// Delete Archive
export const deleteArchive = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { id } = req.params;
  try {
    const deletedArchive = await DigitalArchiveModel.findByIdAndDelete(id);
    if (!deletedArchive) {
      res.status(404).json({ message: "Archive not found" });
    } else {
      res.status(200).json({ message: "Archive deleted successfully" });
    }
  } catch (error) {
    next(error); // Hata durumunda Express'e iletilir
  }
};