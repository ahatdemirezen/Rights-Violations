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
exports.createApplicationCitizenService = void 0;
const application_model_1 = require("../models/application-model");
const S3_controller_1 = require("../controllers/S3-controller");
const helper_1 = require("../helper/helper");
const createApplicationCitizenService = (data, files) => __awaiter(void 0, void 0, void 0, function* () {
    const { applicantName, nationalID, email, applicationType, applicationDate, organizationName, address, phoneNumber, complaintReason, eventCategories, links = [], descriptions = [], types = [], } = data;
    // National ID Kontrolü
    const existingApplication = yield application_model_1.ApplicationModel.findOne({ nationalID });
    if (existingApplication) {
        throw new Error("Bu T.C. Kimlik Numarası ile zaten bir başvuru yapılmış.");
    }
    // eventCategories doğrulama
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
    // Dosyaları İşleme
    if (files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
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
    // Linkleri İşleme
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
    // Yeni başvuru oluştur
    const newApplication = new application_model_1.ApplicationModel({
        applicationNumber,
        applicantName,
        organizationName,
        nationalID,
        email,
        applicationType,
        applicationDate,
        address,
        phoneNumber,
        complaintReason,
        eventCategories,
        documents,
    });
    const savedApplication = yield newApplication.save();
    return application_model_1.ApplicationModel.findById(savedApplication._id).populate("documents");
});
exports.createApplicationCitizenService = createApplicationCitizenService;
