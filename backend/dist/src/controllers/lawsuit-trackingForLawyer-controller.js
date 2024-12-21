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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLawsuitsForCalendar = exports.getLawsuitById = exports.updateLawsuitWithFiles = exports.getLawsuitsByLawyer = void 0;
const lawsuitTracking_model_1 = require("../models/lawsuitTracking-model");
const mongoose_1 = __importDefault(require("mongoose"));
const files_model_1 = require("../models/files-model");
const S3_controller_1 = require("../controllers/S3-controller");
const http_errors_1 = __importDefault(require("http-errors"));
const lawsuit_trackingForLawyer_service_1 = require("../services/lawsuit-trackingForLawyer-service");
const getLawsuitsByLawyer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Middleware'den gelen userId (avukat ID'si)
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // Servis katmanını çağır ve davaları al
        const lawsuits = yield (0, lawsuit_trackingForLawyer_service_1.getLawsuitsByLawyerService)(userId);
        // Davaları yanıt olarak döndür
        res.status(200).json({
            message: "Lawsuits retrieved successfully",
            data: lawsuits,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error retrieving lawsuits:", error.message);
            return res.status(500).json({ message: error.message });
        }
        console.error("Unexpected error:", error);
        next(error);
    }
});
exports.getLawsuitsByLawyer = getLawsuitsByLawyer;
const updateLawsuitWithFiles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { lawsuitId } = req.params; // URL'den `lawsuitId` alınır
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId; // Middleware'den gelen userId alınır
    if (!userId) {
        return res.status(400).json({ message: "User ID not found in request" });
    }
    const { caseSubject, fileNumber, court, description, fileType, courtFileNo, lawsuitDate, caseNumber, resultDescription, resultStage, } = req.body; // Ek alanlar alındı
    const files = req.files; // Yüklenen dosyalar
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // 1. Dava ve avukat eşleşmesini kontrol et
        const lawsuit = yield lawsuitTracking_model_1.LawsuitTrackingModel.findOne({
            _id: lawsuitId,
        })
            .populate({
            path: "applicationId",
            populate: {
                path: "lawyer",
            },
        });
        if (!lawsuit) {
            throw (0, http_errors_1.default)(404, "Lawsuit with the provided ID does not exist or access is denied.");
        }
        // 2. Avukatın erişim yetkisini kontrol et
        const application = lawsuit.applicationId;
        if (((_b = application.lawyer) === null || _b === void 0 ? void 0 : _b._id.toString()) !== userId) {
            throw (0, http_errors_1.default)(403, "Access denied. You are not authorized to view this lawsuit.");
        }
        // 3. Yeni dosyaları S3'e yükle ve FileModel'e kaydet
        let newUploadedFiles = [];
        if (files && files.length > 0) {
            newUploadedFiles = yield Promise.all(files.map((file, index) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const s3Response = yield (0, S3_controller_1.uploadToS3)(file); // AWS S3'e dosya yükleme
                    const fileUrl = s3Response.signedUrl; // Signed URL alınıyor
                    if (!fileUrl) {
                        throw new Error("S3 yanıtından dosya URL'si alınamadı.");
                    }
                    const newFile = new files_model_1.FileModel({
                        fileType: fileType || null,
                        fileUrl,
                        description: description || null,
                    });
                    const savedFile = yield newFile.save({ session });
                    return savedFile._id;
                }
                catch (error) {
                    console.error(`Dosya (${file.originalname}) yüklenirken hata:`, error);
                    throw new Error(`Dosya yüklenemedi: ${file.originalname}`);
                }
            })));
        }
        // 4. Mevcut dava bilgilerini güncelle
        lawsuit.caseSubject = caseSubject || lawsuit.caseSubject;
        lawsuit.fileNumber = fileNumber || lawsuit.fileNumber;
        lawsuit.court = court || lawsuit.court;
        lawsuit.courtFileNo = courtFileNo || lawsuit.courtFileNo;
        lawsuit.lawsuitDate = lawsuitDate || lawsuit.lawsuitDate;
        lawsuit.caseNumber = caseNumber || lawsuit.caseNumber;
        lawsuit.resultDescription = resultDescription || lawsuit.resultDescription;
        lawsuit.resultStage = resultStage || lawsuit.resultStage;
        // Yeni dosyaları mevcut dosya listesine ekle
        lawsuit.files = [...(lawsuit.files || []), ...newUploadedFiles];
        // Güncellenmiş davayı kaydet
        const updatedLawsuit = yield lawsuit.save({ session });
        // 5. Transaction'ı tamamla
        yield session.commitTransaction();
        session.endSession();
        // Yanıt döndür
        res.status(200).json({
            message: "Dava başarıyla güncellendi.",
            lawsuit: updatedLawsuit,
        });
    }
    catch (error) {
        console.error("Dava güncelleme sırasında hata oluştu:", error);
        yield session.abortTransaction();
        session.endSession();
        if (error instanceof Error) {
            return res.status(500).json({
                message: "Dava güncellenirken bir hata oluştu.",
                error: error.message,
            });
        }
        return res.status(500).json({
            message: "Dava güncellenirken bilinmeyen bir hata oluştu.",
            error: String(error),
        });
    }
});
exports.updateLawsuitWithFiles = updateLawsuitWithFiles;
const getLawsuitById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { lawsuitId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId; // Middleware'den gelen userId alınır
    if (!userId) {
        return res.status(400).json({ message: "User ID not found in request" });
    }
    try {
        // Service katmanını çağır
        const lawsuit = yield (0, lawsuit_trackingForLawyer_service_1.getLawsuitByIdService)(lawsuitId, userId);
        // 3. Yanıt oluştur ve döndür
        res.status(200).json({
            message: "Dava bilgileri başarıyla alındı.",
            lawsuit: lawsuit.toObject(),
        });
    }
    catch (error) {
        console.error("Dava bilgileri getirilirken hata oluştu:", error);
        next(error);
    }
});
exports.getLawsuitById = getLawsuitById;
const getLawsuitsForCalendar = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            res.status(400).json({ message: "User ID not found in request" });
            return;
        }
        // Avukata ait davaları getir
        const lawsuits = yield (0, lawsuit_trackingForLawyer_service_1.getLawsuitsByLawyerService)(userId);
        // Takvim için gerekli bilgileri hazırlayın
        const calendarEvents = lawsuits.map((lawsuit) => {
            var _a, _b;
            // Tarih formatından yalnızca tarihi al
            const lawsuitDate = lawsuit.lawsuitDate
                ? new Date(lawsuit.lawsuitDate.toISOString().split("T")[0]) // Saat kısmını kaldır
                : new Date();
            return {
                id: lawsuit._id,
                title: lawsuit.caseSubject || "Dava Konusu Yok",
                start: lawsuitDate, // Başlangıç tarihi
                end: lawsuitDate, // Bitiş tarihi (aynı tarih)
                applicantName: ((_a = lawsuit.applicationId) === null || _a === void 0 ? void 0 : _a.applicantName) || "Başvuran Adı Yok",
                applicationNumber: ((_b = lawsuit.applicationId) === null || _b === void 0 ? void 0 : _b.applicationNumber) || "Başvuru No Yok",
            };
        });
        console.log("Takvim Verileri (saat kaldırıldı):", calendarEvents);
        res.status(200).json({
            message: "Takvim verileri başarıyla alındı.",
            events: calendarEvents,
        });
    }
    catch (error) {
        console.error("Takvim verileri alınırken hata oluştu:", error);
        next(error);
    }
});
exports.getLawsuitsForCalendar = getLawsuitsForCalendar;
