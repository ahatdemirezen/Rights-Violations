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
exports.deleteApplication = exports.updateApplication = exports.getDocumentTypes = exports.getApplicationById = exports.getAllApplications = exports.createApplication = void 0;
const application_model_1 = require("../models/application-model");
const document_model_1 = require("../models/document-model");
const S3_controller_1 = require("../controllers/S3-controller");
const application_service_1 = require("../services/application-service"); // Service katmanı import ediliyor
const createApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const applicationData = req.body;
        const files = req.files;
        const result = yield (0, application_service_1.createApplicationService)(applicationData, files); // Service fonksiyonu çağrılıyor
        res.status(201).json({
            message: "Başvuru başarıyla oluşturuldu.",
            application: result,
        });
    }
    catch (error) {
        console.error("Başvuru oluşturulurken hata:", error);
        // Hata tipini kontrol et
        if (error instanceof Error) {
            // TC Kimlik Numarası için özel hata kontrolü
            if (error.message === "Bu TC Kimlik Numarası ile zaten bir başvuru yapılmıştır.") {
                res.status(400).json({ success: false, error: error.message });
                return;
            }
            // Dosya yüklenememe hatası için özel kontrol
            if (error.message.includes("Dosya yüklenemedi")) {
                res.status(500).json({
                    success: false,
                    error: "Dosya yüklenemedi. Bu isimde bir dosya mevcut olabilir.",
                });
                return;
            }
            // Genel hata kontrolü
            res.status(500).json({ success: false, error: "Başvuru oluşturulurken bir hata oluştu." });
        }
        else {
            // Error nesnesi değilse genel hata mesajı
            res.status(500).json({ success: false, error: "Bilinmeyen bir hata oluştu." });
        }
    }
});
exports.createApplication = createApplication;
const getAllApplications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { documentType } = req.query;
        const applications = yield (0, application_service_1.getAllApplicationsService)(documentType); // Service çağrısı
        if (!applications.length) {
            res.status(404).json({ message: "Hiç başvuru bulunamadı." });
            return;
        }
        res.status(200).json({ applications });
    }
    catch (error) {
        console.error("Hata:", error);
        res.status(500).json({ error: "Başvurular getirilirken hata oluştu." });
    }
});
exports.getAllApplications = getAllApplications;
const getApplicationById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const { application, s3Files } = yield (0, application_service_1.getApplicationByIdService)(id); // Service çağrısı
        if (!application) {
            throw createHttpError(404, "Başvuru bulunamadı.");
        }
        res.status(200).json({
            message: "Başvuru bilgileri başarıyla alındı.",
            application,
            s3Files,
        });
    }
    catch (error) {
        console.error("Başvuru bilgileri getirilirken hata oluştu:", error);
        next(error);
    }
});
exports.getApplicationById = getApplicationById;
const getDocumentTypes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Sabit tür listesini tanımlayın
        const documentTypes = [
            "Media Screening",
            "NGO Data",
            "Bar Commissions",
            "Public Institutions",
            "Other",
        ];
        // Tür listesini dön
        res.status(200).json({ documentTypes });
    }
    catch (error) {
        console.error("Hata:");
        res.status(500).json({ error: "Dosya türleri alınamadı." });
    }
});
exports.getDocumentTypes = getDocumentTypes;
const updateApplication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const { updatedApplication, message } = yield (0, application_service_1.updateApplicationService)(req, id);
        res.status(200).json({
            message,
            application: updatedApplication,
        });
    }
    catch (error) {
        console.error("Başvuru güncellenirken hata oluştu:", error.message);
        res.status(error.message.includes("Dosya zaten mevcut") ? 400 : 500).json({
            error: error.message || "Başvuru güncellenirken bir hata oluştu.",
        });
    }
});
exports.updateApplication = updateApplication;
const deleteApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const application = yield application_model_1.ApplicationModel.findById(id).populate("documents");
        if (!application) {
            res.status(404).json({ error: "Başvuru bulunamadı." });
            return;
        }
        for (const documentId of application.documents) {
            const document = yield document_model_1.DocumentModel.findById(documentId);
            if (document) {
                for (const doc of document.documents) {
                    if (doc.documentUrl) {
                        yield (0, S3_controller_1.deleteFileFromS3)(doc.documentUrl);
                    }
                }
                yield document_model_1.DocumentModel.findByIdAndDelete(documentId);
            }
        }
        yield application_model_1.ApplicationModel.findByIdAndDelete(id);
        res.status(200).json({ message: "Başvuru ve ilgili dokümanlar başarıyla silindi." });
    }
    catch (error) {
        console.error("Hata:", error.message);
        res.status(500).json({ error: "Başvuru silinirken hata oluştu.", details: error.message });
    }
});
exports.deleteApplication = deleteApplication;
function createHttpError(arg0, arg1) {
    throw new Error("Function not implemented.");
}
