import { Request, Response, NextFunction } from 'express';
import { createUserService , getAllLawyersService , deleteLawyerService , getLawyerByIdService} from '../services/lawyer-service';

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { name, password, gender, nationalID } = req.body;

    // Service katmanını çağır ve kullanıcıyı oluştur
    const user = await createUserService({ name, password, gender, nationalID });

    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Unknown error occurred' });
    }
  }
};

export const getAllLawyers = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Service katmanını çağır ve avukatları getir
    const lawyers = await getAllLawyersService();

    res.status(200).json({
      message: 'Lawyers fetched successfully',
      lawyers,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Unknown error occurred' });
    }
  }
};

export const deleteLawyer = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { id } = req.params; // Silinecek avukatın ID'sini al

  try {
    // Service katmanını çağır ve avukatı sil
    const deletedLawyer = await deleteLawyerService(id);

    res.status(200).json({
      message: 'Lawyer deleted successfully',
      lawyer: deletedLawyer,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Lawyer not found') {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    } else {
      res.status(500).json({ message: 'Unknown error occurred' });
    }
  }
};

export const getLawyerById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { id } = req.params; // Avukatın ID'sini al

  try {
    // Service katmanını çağır ve avukat detaylarını al
    const lawyer = await getLawyerByIdService(id);

    res.status(200).json({
      message: 'Lawyer fetched successfully',
      lawyer,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Lawyer not found') {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    } else {
      res.status(500).json({ message: 'Unknown error occurred' });
    }
  }
};
