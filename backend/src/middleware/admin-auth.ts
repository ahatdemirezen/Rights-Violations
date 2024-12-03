import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import * as dotenv from "dotenv";

// .env dosyasındaki verileri kullanabilmek için dotenv'i başlatıyoruz
dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

// Request tipini genişletiyoruz
interface CustomRequest extends Request {
  user?: string | JwtPayload;
}

export const authenticateToken = (req: CustomRequest, res: Response, next: NextFunction) => {
  // Eğer Authorization başlığı yoksa cookie'den token'ı al
  const cookieToken = req.cookies.token;
  console.log("Cookie Token:", cookieToken); // Çerezdeki token'ı loglayın

  // Token yoksa hata döndür
  if (!cookieToken) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }

  try {
    // Token doğrulama
    const verifiedToken = jwt.verify(cookieToken, jwtSecret || "") as JwtPayload;

    // Token içerisindeki role kontrolü
    if (verifiedToken.role === "admin") {
      next(); // Eğer role "admin" ise devam et
    } else {
      res.status(403).json({ message: "Forbidden: You do not have admin access" }); // Role admin değilse hata döndür
    }
  } catch (error) {
    res.status(401).json({ message: "Unauthorized request" });
    return;
  }
};
