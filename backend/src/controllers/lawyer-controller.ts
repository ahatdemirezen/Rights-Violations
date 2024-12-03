import { Request, Response, NextFunction } from 'express';
import { UserModel, UserRole } from '../models/user-model'; // UserModel ve UserRole'i içe aktar
import bcrypt from 'bcryptjs'; // Şifre hashleme için bcrypt kütüphanesi

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, password } = req.body;

  try {
    // Şifreyi hashleme
    const saltRounds = 10; // Hashleme zorluk derecesi
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Yeni bir kullanıcı oluştur
    const newUser = new UserModel({
      name, // İsim kullanıcıdan alınır
      password: hashedPassword, // Hashlenmiş şifre veritabanına kaydedilir
      roles: [UserRole.Lawyer], // Rol otomatik olarak 'lawyer' olarak atanır
    });

    // Kullanıcıyı veritabanına kaydet
    const savedUser = await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: savedUser._id,
        name: savedUser.name,
        roles: savedUser.roles,
      },
    });
  } catch (error) {
    next(error); // Hata durumunda error middleware'e yönlendirme
  }
};
