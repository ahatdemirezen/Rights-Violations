import { Request, Response, NextFunction } from "express";
import * as dotenv from "dotenv";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";

// .env dosyasındaki verileri kullanabilmek için dotenv'i başlatıyoruz
dotenv.config();

const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = '2m'; // Access token süresi 2 dakika
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET; // Refresh token için ayrı bir secret
const jwtRefreshExpiresIn = '1d'; // Refresh token süresi 1 gün

// Access token oluşturma
const createAccessToken = (email: string) => {
  return jwt.sign(
    { email },
    jwtSecret!,
    { expiresIn: jwtExpiresIn }
  );
};

// Refresh token oluşturma
const createRefreshToken = (email: string) => {
  return jwt.sign(
    { email },
    jwtRefreshSecret!, // Refresh token için farklı bir secret
    { expiresIn: jwtRefreshExpiresIn  } // Refresh token 7 gün geçerli olabilir
  );
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    if (email === adminEmail && password === adminPassword) {
      // Access token ve refresh token oluştur
      const accessToken = createAccessToken(email);
      const refreshToken = createRefreshToken(email);

      // Access token'ı HTTP-Only cookie olarak ekliyoruz
      res.cookie('token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV == "production" ? true : false,
        maxAge: 2 * 60 * 1000, // 2 dakika
        sameSite: process.env.NODE_ENV == "production" ? "none" : "lax",
      });

      // Refresh token'ı başka bir HTTP-Only cookie olarak ekliyoruz
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV == "production" ? true : false,
        maxAge: 24 * 60 * 60 * 1000, // 1 gün
        sameSite: process.env.NODE_ENV == "production" ? "none" : "lax",
      });

      res.status(200).json({
        message: "Login successful",
      });
    } else {
      throw createHttpError(401, "Invalid email or password");
    }
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) : Promise<any> => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    // Refresh token doğrulama
    const payload = jwt.verify(refreshToken, jwtRefreshSecret!) as { email: string };

    // Yeni access token oluşturma
    const newAccessToken = createAccessToken(payload.email);

    // Yeni access token'ı HTTP-Only cookie olarak ekliyoruz
    res.cookie('token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production" ? true : false,
      maxAge: 2 * 60 * 1000, // 2 dakika
      sameSite: process.env.NODE_ENV == "production" ? "none" : "lax",
    });

    res.status(200).json({ message: "Access token refreshed successfully" });
  } catch (error) {
    next(error); // Hata durumunda next ile Express'e hatayı bildiriyoruz
  }
};


export const logoutUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Access token ve refresh token çerezlerini temizliyoruz
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production" ? true : false,
      sameSite: process.env.NODE_ENV == "production" ? "none" : "lax",
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production" ? true : false,
      sameSite: process.env.NODE_ENV == "production" ? "none" : "lax"
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};
