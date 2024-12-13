import bcrypt from 'bcryptjs';
import { UserModel, UserRole, Gender } from '../models/user-model';

export const createUserService = async (userData: {
  name: string;
  password: string;
  gender: Gender;
  nationalID: string;
}): Promise<any> => {
  const { name, password, gender, nationalID } = userData;

  // Gerekli alanların kontrolü
  if (!name || !password || !gender || !nationalID) {
    throw new Error('All fields are required');
  }

  // TC kimlik numarasının geçerli uzunlukta olup olmadığını kontrol et
  if (nationalID.length !== 11 || isNaN(Number(nationalID))) {
    throw new Error('Invalid national ID');
  }

  // Gender alanının sadece "male" veya "female" değerini kabul etmesi
  if (!Object.values(Gender).includes(gender)) {
    throw new Error('Invalid gender value');
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

  return {
    id: savedUser._id,
    name: savedUser.name,
    roles: savedUser.roles,
    gender: savedUser.gender,
    nationalID: savedUser.nationalID,
  };
};

export const getAllLawyersService = async (): Promise<any[]> => {
    // Rolü "lawyer" olan kullanıcıları getir
    const lawyers = await UserModel.find({ roles: UserRole.Lawyer });
  
    // Kullanıcıları belirli bir yapıda döndür
    return lawyers.map((lawyer) => ({
      id: lawyer._id,
      name: lawyer.name,
      gender: lawyer.gender,
      nationalID: lawyer.nationalID,
      roles: lawyer.roles,
      createdAt: lawyer.createdAt,
      updatedAt: lawyer.updatedAt,
    }));
  };

  export const deleteLawyerService = async (id: string): Promise<any | null> => {
    // Veritabanında kullanıcıyı ara ve sil
    const deletedLawyer = await UserModel.findByIdAndDelete(id);
  
    if (!deletedLawyer) {
      throw new Error('Lawyer not found'); // Avukat bulunamazsa hata fırlat
    }
  
    return {
      id: deletedLawyer._id,
      name: deletedLawyer.name,
      gender: deletedLawyer.gender,
      nationalID: deletedLawyer.nationalID,
      roles: deletedLawyer.roles,
    };
  };

  export const getLawyerByIdService = async (id: string): Promise<any | null> => {
    // Veritabanında avukatı ID'ye göre bul
    const lawyer = await UserModel.findById(id);
  
    if (!lawyer) {
      throw new Error('Lawyer not found'); // Avukat bulunamazsa hata fırlat
    }
  
    return {
      id: lawyer._id,
      name: lawyer.name,
      gender: lawyer.gender,
      nationalID: lawyer.nationalID,
      roles: lawyer.roles,
      createdAt: lawyer.createdAt,
      updatedAt: lawyer.updatedAt,
    };
  };

  export const getLawyerNameByUserIdService = async (userId: string): Promise<string | null> => {
    try {
      const lawyer = await UserModel.findById(userId, "name"); // Sadece name alanını getir
      if (!lawyer) {
        return null;
      }
      return lawyer.name; // Avukatın ismini döner
    } catch (error) {
      throw new Error("Error fetching lawyer name");
    }
  };