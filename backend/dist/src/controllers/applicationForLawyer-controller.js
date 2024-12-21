"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApplicationDetailsByLawyer = exports.getAllApplicationByLawyer = void 0;
const applicationForLawyer_service_1 = require("../services/applicationForLawyer-service");
const getAllApplicationByLawyer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // `req.user` içerisindeki userId'yi al
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(400).json({ message: "User ID not found in request" });
            return;
        }
        // Servis dosyasından başvuruları al
        const applications = yield (0, applicationForLawyer_service_1.getApplicationsByLawyer)(userId);
        // Başvuruları geri döndür
        res.status(200).json({
            message: "Applications retrieved successfully",
            data: applications,
        });
    }
    catch (error) {
        // Hata durumunda next ile error handler'a gönder
        next(error);
    }
});
exports.getAllApplicationByLawyer = getAllApplicationByLawyer;
const getApplicationDetailsByLawyer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // `req.user` içerisindeki userId'yi al
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(400).json({ message: "User ID not found in request" });
            return;
        }
        // URL'den `applicationId` al
        const { applicationId } = req.params;
        // Servis dosyasından başvuru detaylarını al
        const application = yield (0, applicationForLawyer_service_1.getApplicationDetails)(userId, applicationId);
        // Başvuru detaylarını geri döndür
        res.status(200).json({
            message: "Application retrieved successfully",
            data: application,
        });
    }
    catch (error) {
        // Hata durumunda next ile error handler'a gönder
        console.error("Başvuru detayları getirilirken hata oluştu:", error);
        next(error);
    }
});
exports.getApplicationDetailsByLawyer = getApplicationDetailsByLawyer;
