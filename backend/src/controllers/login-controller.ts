import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user-model"; // UserModel'i içe aktar
import bcrypt from "bcryptjs"; // Şifre karşılaştırma için bcrypt kullanıyoruz

dotenv.config();

// .env dosyasındaki verileri kullanabilmek için dotenv'i başlatıyoruz
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = "2m"; // Access token süresi 2 dakika
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET; // Refresh token için ayrı bir secret
const jwtRefreshExpiresIn = "1d"; // Refresh token süresi 1 gün

// Access token oluşturma
const createAccessToken = (userId: string, name: string, roles: string[]) => {
  if (!jwtSecret) throw new Error("JWT secret not found");
  return jwt.sign({ userId, name, roles }, jwtSecret, { expiresIn: jwtExpiresIn });
};

// Refresh token oluşturma
const createRefreshToken = (userId: string, name: string, roles: string[]) => {
  if (!jwtRefreshSecret) throw new Error("JWT refresh secret not found");
  return jwt.sign({ userId, name, roles }, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn });
};


// Kullanıcı girişi
export const LoginControl = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { name, password } = req.body;

  try {
    // Kullanıcıyı veritabanında kontrol et
    const user = await UserModel.findOne({ name });

    if (!user) {
      // Kullanıcı adı bulunamazsa hata fırlat
      return res.status(404).json({
        message: "User not found. Please check your username and try again.",
      });
    }

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Şifre yanlışsa hata fırlat
      return res.status(401).json({
        message: "Invalid password. Please check your password and try again.",
      });
    }

    // Access token ve refresh token oluştur
   const accessToken = createAccessToken(user._id.toString(), user.name, user.roles);
const refreshToken = createRefreshToken(user._id.toString(), user.name, user.roles);


    // Access token'ı HTTP-Only cookie olarak ekle
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 2 * 60 * 1000, // 2 dakika
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    // Refresh token'ı HTTP-Only cookie olarak ekle
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 gün
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    // Başarılı giriş mesajı
    res.status(200).json({
      message: "Login successful",
      role: user.roles, // Kullanıcının rolünü frontend'e gönderiyoruz

    });
  } catch (error) {
    // Beklenmeyen hata durumunda
    next(error);
  }
};


// Access token yenileme
// Extra Security 
export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  } 

  try {
    // Refresh token doğrulama
    const payload = jwt.verify(refreshToken, jwtRefreshSecret!) as { userId: string; name: string; roles: string[] };

    // Yeni access token oluşturma
    const newAccessToken = createAccessToken(payload.userId, payload.name, payload.roles);

    // Yeni access token'ı HTTP-Only cookie olarak ekliyoruz
    res.cookie("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 2 * 60 * 1000, // 2 dakika
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({ message: "Access token refreshed successfully" });
  } catch (error) {
    next(error); // Hata durumunda next ile Express'e hatayı bildiriyoruz
  }
};


// Kullanıcı çıkışı
export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Access token ve refresh token çerezlerini temizliyoruz
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};
