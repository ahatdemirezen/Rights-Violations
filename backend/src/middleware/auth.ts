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
  // Bearer token ya da cookie token yoksa hata döndür
  if (!cookieToken) {
    res.status(401).json({message : "Invalid or expired token"})
    return
  }
  console.log
  // Bearer token ya da cookie token ile doğrulama yap
  const verifiedToken: any = jwt.verify(cookieToken, jwtSecret || "")
  
  if (verifiedToken) {
    next()
  } else {
    res.status(401).json({message : "Unauthorized request"})
    return
  }
};