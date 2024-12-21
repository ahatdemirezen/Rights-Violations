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
exports.updateLawsuitArchiveStatus = exports.updateLawsuitWithFiles = exports.getAllLawsuits = exports.getLawsuitById = exports.createLawsuitWithFiles = void 0;
const lawsuit_tracking_service_1 = require("../services/lawsuit-tracking-service");
const createLawsuitWithFiles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { applicationId } = req.params;
    const files = req.files; // Yüklenen dosyalar
    try {
        const lawsuit = yield (0, lawsuit_tracking_service_1.createLawsuitWithFilesService)(applicationId, req.body, files);
        res.status(201).json({
            message: "Dava ve dosyalar başarıyla oluşturuldu.",
            lawsuit,
        });
    }
    catch (error) {
        console.error("Dava oluşturma sırasında hata:", error);
        // Hata kontrolü: S3 yükleme hatası veya başka bir hata
        const errorMessage = (error === null || error === void 0 ? void 0 : error.message) || "Dava oluşturulurken bir hata oluştu.";
        res.status(500).json({
            success: false,
            message: "Dava oluşturma sırasında hata meydana geldi. Bu isimde bir dosya mevcut olabilir.",
            error: errorMessage,
            details: error.details || null, // Detaylı hata açıklamasını döner
        });
    }
});
exports.createLawsuitWithFiles = createLawsuitWithFiles;
const getLawsuitById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { lawsuitId } = req.params;
    try {
        // Servis dosyasından dava bilgilerini al
        const lawsuit = yield (0, lawsuit_tracking_service_1.getLawsuitByIdService)(lawsuitId);
        // Yanıt oluştur ve döndür
        res.status(200).json({
            message: "Dava bilgileri başarıyla alındı.",
            lawsuit,
        });
    }
    catch (error) {
        console.error("Dava bilgileri getirilirken hata oluştu:", error);
        next(error);
    }
});
exports.getLawsuitById = getLawsuitById;
const getAllLawsuits = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Servis dosyasından tüm davaları al
        const lawsuits = yield (0, lawsuit_tracking_service_1.getAllLawsuitsService)();
        // Yanıtı döndür
        res.status(200).json({
            message: "Tüm davalar başarıyla alındı.",
            lawsuits,
        });
    }
    catch (error) {
        console.error("Tüm davalar getirilirken hata oluştu:", error);
        next(error);
    }
});
exports.getAllLawsuits = getAllLawsuits;
const updateLawsuitWithFiles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { lawsuitId } = req.params;
    const files = req.files;
    try {
        // Servis katmanını çağır ve dava güncelleme işlemini gerçekleştir
        const updatedLawsuit = yield (0, lawsuit_tracking_service_1.updateLawsuitWithFilesService)(lawsuitId, req.body, files);
        // Başarılı yanıt döndür
        res.status(200).json({
            message: "Dava başarıyla güncellendi.",
            lawsuit: updatedLawsuit,
        });
    }
    catch (error) {
        console.error("Dava güncelleme sırasında hata oluştu:", error);
        // Hata durumunda uygun response döndür
        const statusCode = error.status || 500;
        const errorMessage = error.message || "Dava güncellenirken beklenmeyen bir hata oluştu.";
        res.status(statusCode).json({
            message: "Dava güncellenemedi.",
            error: errorMessage,
            details: error.details || null,
        });
    }
});
exports.updateLawsuitWithFiles = updateLawsuitWithFiles;
const updateLawsuitArchiveStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { lawsuitId } = req.params;
    const { archive } = req.body;
    try {
        // Servis katmanını çağır ve dava arşiv durumu güncelleme işlemini gerçekleştir
        const updatedLawsuit = yield (0, lawsuit_tracking_service_1.updateLawsuitArchiveStatusService)(lawsuitId, archive);
        // Yanıt döndür
        res.status(200).json({
            message: "Dava arşiv durumu başarıyla güncellendi.",
            lawsuit: updatedLawsuit,
        });
    }
    catch (error) {
        console.error("Dava arşiv durumu güncellenirken hata oluştu:", error);
        next(error);
    }
});
exports.updateLawsuitArchiveStatus = updateLawsuitArchiveStatus;
