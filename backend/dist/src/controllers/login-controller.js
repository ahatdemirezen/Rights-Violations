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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.refreshAccessToken = exports.LoginControl = void 0;
const dotenv = __importStar(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user-model"); // UserModel'i içe aktar
const bcryptjs_1 = __importDefault(require("bcryptjs")); // Şifre karşılaştırma için bcrypt kullanıyoruz
dotenv.config();
// .env dosyasındaki verileri kullanabilmek için dotenv'i başlatıyoruz
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = "15m"; // Access token süresi 2 dakika
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET; // Refresh token için ayrı bir secret
const jwtRefreshExpiresIn = "1d"; // Refresh token süresi 1 gün
// Access token oluşturma
const createAccessToken = (userId, name, roles) => {
    if (!jwtSecret)
        throw new Error("JWT secret not found");
    return jsonwebtoken_1.default.sign({ userId, name, roles }, jwtSecret, { expiresIn: jwtExpiresIn });
};
// Refresh token oluşturma
const createRefreshToken = (userId, name, roles) => {
    if (!jwtRefreshSecret)
        throw new Error("JWT refresh secret not found");
    return jsonwebtoken_1.default.sign({ userId, name, roles }, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn });
};
// Kullanıcı girişi
const LoginControl = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, password } = req.body;
    try {
        // Kullanıcıyı veritabanında kontrol et
        const user = yield user_model_1.UserModel.findOne({ name });
        if (!user) {
            // Kullanıcı adı bulunamazsa hata fırlat
            return res.status(404).json({
                message: "User not found. Please check your username and try again.",
            });
        }
        // Şifreyi kontrol et
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
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
            httpOnly: true, // javascript saldırısı önlemek için kullanılmıştır document.Cookie().
            secure: process.env.NODE_ENV == "production" ? true : false,
            maxAge: 15 * 60 * 1000, // 15 dakika
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // CSRF saldırılarını önlemek için başka tarayıcıdan gelen istekleri reddeder.
        });
        // Refresh token'ı HTTP-Only cookie olarak ekle
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV == "production" ? true : false,
            maxAge: 24 * 60 * 60 * 1000, // 1 gün
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // CSRF saldırılarını önlemek için başka tarayıcıdan gelen istekleri reddeder.
        });
        // Başarılı giriş mesajı
        res.status(200).json({
            message: "Login successful",
            role: user.roles, // Kullanıcının rolünü frontend'e gönderiyoruz
            name: user.name,
        });
    }
    catch (error) {
        // Beklenmeyen hata durumunda
        next(error);
    }
});
exports.LoginControl = LoginControl;
// Access token yenileme
// Extra Security 
const refreshAccessToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
    }
    try {
        // Refresh token doğrulama
        const payload = jsonwebtoken_1.default.verify(refreshToken, jwtRefreshSecret);
        // Yeni access token oluşturma
        const newAccessToken = createAccessToken(payload.userId, payload.name, payload.roles);
        // Yeni access token'ı HTTP-Only cookie olarak ekliyoruz
        res.cookie("token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV == "production" ? true : false,
            maxAge: 15 * 60 * 1000, // 15 dakika
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // CSRF saldırılarını önlemek için başka tarayıcıdan gelen istekleri reddeder.
        });
        res.status(200).json({ message: "Access token refreshed successfully" });
    }
    catch (error) {
        next(error); // Hata durumunda next ile Express'e hatayı bildiriyoruz
    }
});
exports.refreshAccessToken = refreshAccessToken;
// Kullanıcı çıkışı
const logoutUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Access token ve refresh token çerezlerini temizliyoruz
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV == "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV == "production" ? true : false,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });
        res.status(200).json({ message: "Logout successful" });
    }
    catch (error) {
        next(error);
    }
});
exports.logoutUser = logoutUser;
