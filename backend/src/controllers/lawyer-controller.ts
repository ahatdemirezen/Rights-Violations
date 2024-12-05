import { Request, Response, NextFunction } from 'express';
import { UserModel, UserRole, Gender } from '../models/user-model'; // UserModel, UserRole ve Gender'ı içe aktar
import bcrypt from 'bcryptjs'; // Şifre hashleme için bcrypt kütüphanesi

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { name, password, gender, nationalID } = req.body; // Yeni alanlar ekleniyor

  try {
    // Gerekli alanların kontrolü
    if (!name || !password || !gender || !nationalID) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // TC kimlik numarasının geçerli uzunlukta olup olmadığını kontrol et
    if (nationalID.length !== 11 || isNaN(Number(nationalID))) {
      return res.status(400).json({ message: 'Invalid national ID' });
    }

    // Gender alanının sadece "male" veya "female" değerini kabul etmesi
    if (!Object.values(Gender).includes(gender)) {
      return res.status(400).json({ message: 'Invalid gender value' });
    }

    // Şifreyi hashleme
    const saltRounds = 10; // Hashleme zorluk derecesi
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Yeni bir kullanıcı oluştur
    const newUser = new UserModel({
      name, // İsim kullanıcıdan alınır
      password: hashedPassword, // Hashlenmiş şifre veritabanına kaydedilir
      roles: [UserRole.Lawyer], // Rol otomatik olarak 'lawyer' olarak atanır
      gender, // Cinsiyet kullanıcıdan alınır
      nationalID, // TC kimlik numarası kullanıcıdan alınır
    });

    // Kullanıcıyı veritabanına kaydet
    const savedUser = await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        roles: savedUser.roles,
        gender: savedUser.gender,
        nationalID: savedUser.nationalID,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Unknown error occurred' });
    }
  }  
};
export const getAllLawyers = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Rolü "lawyer" olan kullanıcıları getir
    const lawyers = await UserModel.find({ roles: UserRole.Lawyer });

    res.status(200).json({
      message: 'Lawyers fetched successfully',
      lawyers: lawyers.map((lawyer) => ({
        id: lawyer._id,
        name: lawyer.name,
        gender: lawyer.gender,
        nationalID: lawyer.nationalID,
        roles: lawyer.roles,
        createdAt: lawyer.createdAt,
        updatedAt: lawyer.updatedAt,
      })),
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
    // Veritabanında kullanıcıyı ara ve sil
    const deletedLawyer = await UserModel.findByIdAndDelete(id);

    if (!deletedLawyer) {
      return res.status(404).json({ message: 'Lawyer not found' }); // Avukat bulunamazsa hata döndür
    }

    res.status(200).json({
      message: 'Lawyer deleted successfully',
      lawyer: {
        id: deletedLawyer._id,
        name: deletedLawyer.name,
        gender: deletedLawyer.gender,
        nationalID: deletedLawyer.nationalID,
        roles: deletedLawyer.roles,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Unknown error occurred' });
    }
  }
};

export const getLawyerById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { id } = req.params; // Avukatın ID'sini al

  try {
    // Veritabanında avukatı ID'ye göre bul
    const lawyer = await UserModel.findById(id);

    if (!lawyer) {
      return res.status(404).json({ message: 'Lawyer not found' }); // Avukat bulunamazsa hata döndür
    }

    // Avukat bilgilerini döndür
    res.status(200).json({
      message: 'Lawyer fetched successfully',
      lawyer: {
        id: lawyer._id,
        name: lawyer.name,
        gender: lawyer.gender,
        nationalID: lawyer.nationalID,
        roles: lawyer.roles,
        createdAt: lawyer.createdAt,
        updatedAt: lawyer.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Unknown error occurred' });
    }
  }
};
