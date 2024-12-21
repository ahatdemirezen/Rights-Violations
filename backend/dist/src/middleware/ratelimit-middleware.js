"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.resetPasswordLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 5, // Maksimum 5 istek
    message: {
        message: "Çok fazla şifre sıfırlama isteği gönderildi. Lütfen 15 dakika sonra tekrar deneyin.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
