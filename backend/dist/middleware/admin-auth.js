"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv = __importStar(require("dotenv"));
// .env dosyasındaki verileri kullanabilmek için dotenv'i başlatıyoruz
dotenv.config();
const jwtSecret = process.env.JWT_SECRET;
const authenticateAdmin = (req, res, next) => {
    // Eğer Authorization başlığı yoksa cookie'den token'ı al
    const cookieToken = req.cookies.token;
    // Token yoksa hata döndür
    if (!cookieToken) {
        res.status(401).json({ message: "Invalid or expired token" });
        return;
    }
    try {
        // Token doğrulama
        const verifiedToken = jsonwebtoken_1.default.verify(cookieToken, jwtSecret || "");
        // Token içerisinden roles bilgilerini al ve req.user'a ekle
        req.user = {
            roles: verifiedToken.roles, // Roles array olarak ekleniyor
        };
        // Roles içerisinde "admin" rolü olup olmadığını kontrol et
        if (!req.user.roles.some((role) => role.toLowerCase() === "admin")) {
            res.status(403).json({ message: "Forbidden: You do not have admin access" });
            return;
        }
        next(); // Her şey doğruysa bir sonraki middleware'e geç
    }
    catch (error) {
        res.status(401).json({ message: "Unauthorized request" });
        return;
    }
};
exports.authenticateAdmin = authenticateAdmin;
