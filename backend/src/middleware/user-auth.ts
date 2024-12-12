import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

interface CustomRequest extends Request {
  user?: { userId: string; roles: string[] }; // JWT payload için kullanıcı bilgileri
}

export const authenticateToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const cookieToken = req.cookies.token;

  if (!cookieToken) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }

  try {
    // Token doğrulama
    const verifiedToken = jwt.verify(cookieToken, jwtSecret || "") as JwtPayload;
    console.log("Verified Token Content:", verifiedToken);
    console.log("Verified Token Roles:", verifiedToken.roles);

    // Token içerisinden userId ve roles bilgilerini al ve req.user'a ekle
    req.user = {
      userId: verifiedToken.userId,
      roles: verifiedToken.roles as string[], // Roles array olarak ekleniyor
    };

    // Roles içerisinde "Lawyer" rolü olup olmadığını kontrol et
    if (!req.user.roles.some((role) => role.toLowerCase() === "lawyer")) {
      res.status(403).json({ message: "Forbidden: You do not have lawyer access" });
      return;
    }
    
    
    
    next(); // Her şey doğruysa bir sonraki middleware'e geç
  } catch (error) {
    res.status(401).json({ message: "Unauthorized request" });
    return;
  }
};
