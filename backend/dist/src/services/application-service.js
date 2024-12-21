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
exports.updateApplicationService = exports.getApplicationByIdService = exports.getAllApplicationsService = exports.createApplicationService = void 0;
const application_model_1 = require("../models/application-model");
const helper_1 = require("../helper/helper");
const S3_controller_1 = require("../controllers/S3-controller");
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = require("../models/user-model");
const createApplicationService = (applicationData, files) => __awaiter(void 0, void 0, void 0, function* () {
    const { applicantName, receivedBy, nationalID, applicationType, applicationDate, organizationName, address, phoneNumber, email, complaintReason, eventCategories, links = [], descriptions = [], types = [], } = applicationData;
    const existingApplication = yield application_model_1.ApplicationModel.findOne({ nationalID });
    if (existingApplication) {
        throw new Error("Bu TC Kimlik Numarası ile zaten bir başvuru yapılmıştır.");
    }
    // Event categories doğrulama
    const validCategories = [
        "Aile ve Özel Yaşam Hakkı",
        "Ayrımcılık",
        "Basın Özgürlüğü",
        "Kadına Karşı Şiddet ve Taciz",
        "Çocuğa Karşı Şiddet ve Taciz",
        "Örgütlenme Özgürlüğü",
        "İşkence ve Kötü Muamele",
        "Eğitim Hakkı",
        "Düşünce ve İfade Özgürlüğü",
    ];
    if (!validCategories.includes(eventCategories)) {
        throw new Error("Geçersiz eventCategories değeri!");
    }
    const lastApplication = yield application_model_1.ApplicationModel.findOne().sort({ applicationNumber: -1 });
    const applicationNumber = lastApplication ? lastApplication.applicationNumber + 1 : 1;
    const documents = [];
    // Dosyaları işleme
    if (files) {
        const uploadedFiles = Array.isArray(files) ? files : [files];
        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            const description = Array.isArray(descriptions) ? descriptions[i] : descriptions || `Document ${i + 1}`;
            const type = Array.isArray(types) ? types[i] : types || "Other";
            try {
                const { signedUrl } = yield (0, S3_controller_1.uploadToS3)(file); // Signed URL alınıyor
                const documentId = yield (0, helper_1.saveDocument)("files", {
                    description,
                    type,
                    url: signedUrl,
                });
                documents.push(documentId);
            }
            catch (error) {
                console.error("Dosya yüklenirken hata:", error);
                throw new Error("Dosya yüklenemedi.");
            }
        }
    }
    // Linkleri işleme
    if (links && links.length > 0) {
        const parsedLinks = Array.isArray(links) ? links : [links];
        for (const link of parsedLinks) {
            const { documentDescription, type, documentSource } = link;
            if (!documentSource) {
                throw new Error("Her link için 'documentSource' zorunludur.");
            }
            const documentId = yield (0, helper_1.saveDocument)("link", {
                description: documentDescription || "Link",
                type: type || "Other",
                source: documentSource,
            });
            documents.push(documentId);
        }
    }
    // Başvuru oluşturma
    const newApplication = new application_model_1.ApplicationModel({
        applicationNumber,
        applicantName,
        organizationName,
        receivedBy,
        nationalID,
        applicationType,
        applicationDate,
        address,
        phoneNumber,
        email,
        complaintReason,
        eventCategories,
        documents,
    });
    const savedApplication = yield newApplication.save();
    const populatedApplication = yield application_model_1.ApplicationModel.findById(savedApplication._id).populate("documents");
    return populatedApplication;
});
exports.createApplicationService = createApplicationService;
const getAllApplicationsService = (query) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Sayfalama ve limit parametrelerini al
        const page = parseInt(query.page) || 1; // Default olarak 1. sayfa
        const limit = parseInt(query.limit) || 10; // Default olarak 10 öğe
        // Başlangıç noktasını hesapla
        const skip = (page - 1) * limit;
        // Belge türüne göre filtreleme
        const documentFilter = query.documentType ? { "documents.type": query.documentType } : {};
        // Başvuruları veritabanından çekme ve ilişkili verileri populate etme
        const applications = yield application_model_1.ApplicationModel.find(documentFilter)
            .populate("eventCategories", "name")
            .populate("documents")
            .skip(skip) // Sayfalama için atlama
            .limit(limit); // Sayfa başına öğe sayısı
        // Toplam kayıt sayısını al
        const totalApplications = yield application_model_1.ApplicationModel.countDocuments(documentFilter);
        // Toplam sayfa sayısını hesapla
        const totalPages = Math.ceil(totalApplications / limit);
        return {
            applications, // Sayfa verileri
            currentPage: page, // Geçerli sayfa
            totalPages, // Toplam sayfa sayısı
            totalApplications, // Toplam kayıt sayısı
        };
    }
    catch (error) {
        console.error("Başvurular getirilirken hata oluştu:", error);
        throw new Error("Başvurular getirilirken bir hata oluştu.");
    }
});
exports.getAllApplicationsService = getAllApplicationsService;
const getApplicationByIdService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Başvuruyu veritabanından al ve belgeleri populate et
        const application = yield application_model_1.ApplicationModel.findById(id).populate({
            path: "documents",
            select: "documents.documentUrl documents.documentDescription documents.documentSource documents.type", // Alt belgeleri al, türü de ekledik
        });
        if (!application) {
            return { application: null, s3Files: [] }; // Başvuru bulunamazsa boş değer döndür
        }
        // Documents içindeki bilgileri kontrol et
        const s3Files = application.documents.map((doc) => {
            const docDetails = doc.documents[0]; // İlk alt belge
            return {
                documentUrl: (docDetails === null || docDetails === void 0 ? void 0 : docDetails.documentUrl) || "URL bulunamadı",
                documentSource: (docDetails === null || docDetails === void 0 ? void 0 : docDetails.documentSource) || "", // documentSource'u ekliyoruz
                documentDescription: (docDetails === null || docDetails === void 0 ? void 0 : docDetails.documentDescription) || "Dosya",
                type: (docDetails === null || docDetails === void 0 ? void 0 : docDetails.type) || "Tür belirtilmedi", // Yeni: Tür alanını ekledik
            };
        });
        return { application: application.toObject(), s3Files }; // Başvuru ve S3 bilgilerini döndür
    }
    catch (error) {
        console.error("Başvuru bilgileri getirilirken hata oluştu:", error);
        throw new Error("Başvuru bilgileri alınırken bir hata oluştu.");
    }
});
exports.getApplicationByIdService = getApplicationByIdService;
const updateApplicationService = (req, id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const updatedFields = Object.assign({}, req.body);
    // Mevcut başvuruyu alın
    const existingApplication = yield application_model_1.ApplicationModel.findById(id).populate("documents");
    if (!existingApplication) {
        throw new Error("Başvuru bulunamadı.");
    }
    let existingDocuments = existingApplication.documents;
    // Yeni dosyaları işleyip belgeleri ekleyin
    if (req.files && Array.isArray(req.files)) {
        try {
            const newDocumentIds = yield (0, helper_1.processDocuments)({
                files: ((_a = req.body.descriptions) === null || _a === void 0 ? void 0 : _a.files) || [],
                links: ((_b = req.body.descriptions) === null || _b === void 0 ? void 0 : _b.links) || [],
            }, {
                files: ((_c = req.body.types) === null || _c === void 0 ? void 0 : _c.files) || [],
                links: ((_d = req.body.types) === null || _d === void 0 ? void 0 : _d.links) || [],
            }, req.files, req.body.links || []);
            // Mevcut ve yeni belgeleri birleştir
            existingDocuments = [...existingDocuments, ...newDocumentIds];
        }
        catch (error) {
            console.error("Dosyalar işlenirken hata:", error);
            throw new Error("Dosyalar yüklenemedi.");
        }
    }
    // Güncellenmiş belgeleri ekleyin
    updatedFields.documents = existingDocuments;
    // Lawyer alanını kontrol edin ve ObjectId formatına çevirin
    if (req.body.lawyer) {
        const lawyerId = req.body.lawyer;
        if (!mongoose_1.default.Types.ObjectId.isValid(lawyerId)) {
            throw new Error("Geçerli bir avukat ID'si girilmelidir.");
        }
        // Avukatın varlığını ve rolünü kontrol edin
        const lawyer = yield user_model_1.UserModel.findById(lawyerId);
        if (!lawyer || !lawyer.roles.includes(user_model_1.UserRole.Lawyer)) {
            throw new Error("Geçerli bir avukat ID'si girilmelidir.");
        }
        // Lawyer ID'sini updatedFields'a ekleyin
        updatedFields.lawyer = new mongoose_1.default.Types.ObjectId(lawyerId);
    }
    // Başvuruyu güncelleyin
    const updatedApplication = yield application_model_1.ApplicationModel.findByIdAndUpdate(id, updatedFields, { new: true, runValidators: true });
    if (!updatedApplication) {
        throw new Error("Başvuru güncellenemedi. Belirtilen ID'ye sahip başvuru bulunamadı.");
    }
    return {
        updatedApplication,
        message: "Başvuru başarıyla güncellendi.",
    };
});
exports.updateApplicationService = updateApplicationService;
