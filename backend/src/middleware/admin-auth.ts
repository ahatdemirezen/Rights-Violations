import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import * as dotenv from "dotenv";

// .env dosyasındaki verileri kullanabilmek için dotenv'i başlatıyoruz
dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

// Request tipini genişletiyoruz
interface CustomRequest extends Request {
  user?: { roles: string[] }; // JWT payload için kullanıcı bilgileri
}

export const authenticateAdmin = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // Eğer Authorization başlığı yoksa cookie'den token'ı al
  const cookieToken = req.cookies.token;

  // Token yoksa hata döndür
  if (!cookieToken) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }

  try {
    // Token doğrulama
    const verifiedToken = jwt.verify(cookieToken, jwtSecret || "") as JwtPayload;

    // Token içerisinden roles bilgilerini al ve req.user'a ekle
    req.user = {
      roles: verifiedToken.roles as string[], // Roles array olarak ekleniyor
    };

    // Roles içerisinde "admin" rolü olup olmadığını kontrol et
    if (!req.user.roles.some((role) => role.toLowerCase() === "admin")) {
      res.status(403).json({ message: "Forbidden: You do not have admin access" });
      return;
    }

    next(); // Her şey doğruysa bir sonraki middleware'e geç
  } catch (error) {
    res.status(401).json({ message: "Unauthorized request" });
    return;
  }
};
