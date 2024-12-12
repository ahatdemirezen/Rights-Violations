import { Request, Response, NextFunction } from "express";
import { EventCategoryModel } from "../models/eventCategory-model";
// Create a new event category
export const createEventCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name} = req.body;
    const newCategory = new EventCategoryModel({ name});
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
};
// Get all event categories
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await EventCategoryModel.find();
    if (!categories.length) {
      res.status(404).json({ message: "Hiç kategori bulunamadı." });
      return;
    }

    res.status(200).json({ categories });
  } catch (error: any) {
    console.error("Hata:", error.message);
    res.status(500).json({ error: "Kategoriler getirilirken hata oluştu." });
  }
};
// Update an event category
export const updateEventCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const { name} = req.body;
  try {
    const updatedCategory = await EventCategoryModel.findByIdAndUpdate(
      id,
      { name},
      { new: true }
    );
    if (!updatedCategory) {
      res.status(404).json({ message: "Category not found" });
    } else {
      res.status(200).json(updatedCategory);
    }
  } catch (error) {
    next(error);
  }
};
// Delete an event category
export const deleteEventCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  try {
    const deletedCategory = await EventCategoryModel.findByIdAndDelete(id);
    if (!deletedCategory) {
      res.status(404).json({ message: "Category not found" });
    } else {
      res.status(200).json({ message: "Category deleted successfully" });
    }
  } catch (error) {
    next(error);
  }
};