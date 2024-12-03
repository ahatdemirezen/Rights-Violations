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
const createAccessToken = (name: string, role: string) => {
  return jwt.sign({ name, role }, jwtSecret!, { expiresIn: jwtExpiresIn });
};
console.log("JWT_SECRET:", process.env.JWT_SECRET);
// Refresh token oluşturma
const createRefreshToken = (name: string, role: string) => {
  return jwt.sign({ name, role }, jwtRefreshSecret!, { expiresIn: jwtRefreshExpiresIn });
};

// Kullanıcı girişi
export const LoginControl = async (req: Request, res: Response, next: NextFunction) => {
  const { name, password } = req.body;

  try {
    // Veritabanından kullanıcıyı kontrol et
    const user = await UserModel.findOne({ name });

    if (!user) {
      throw createHttpError(401, "User not found");
    }

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createHttpError(401, "Invalid password");
    }

    // Access token ve refresh token oluştur
    const accessToken = createAccessToken(user.name, user.roles[0]); // İlk rolü kullanıyoruz
    const refreshToken = createRefreshToken(user.name, user.roles[0]);

    // Access token'ı HTTP-Only cookie olarak ekliyoruz
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 2 * 60 * 1000, // 2 dakika
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    // Refresh token'ı başka bir HTTP-Only cookie olarak ekliyoruz
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 gün
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
};

// Access token yenileme
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
    const payload = jwt.verify(refreshToken, jwtRefreshSecret!) as { name: string; role: string };

    // Yeni access token oluşturma
    const newAccessToken = createAccessToken(payload.name, payload.role);

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
