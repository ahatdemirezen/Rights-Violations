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
exports.getApplicationDetails = exports.getApplicationsByLawyer = void 0;
const application_model_1 = require("../models/application-model");
const getApplicationsByLawyer = (lawyerId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!lawyerId) {
        throw new Error("Lawyer ID is required");
    }
    // ApplicationModel üzerinde `lawyer` alanı userId ile eşleşen başvuruları getir
    const applications = yield application_model_1.ApplicationModel.find({ lawyer: lawyerId });
    if (!applications || applications.length === 0) {
        throw new Error("No applications found for this lawyer");
    }
    return applications;
});
exports.getApplicationsByLawyer = getApplicationsByLawyer;
const getApplicationDetails = (lawyerId, applicationId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!lawyerId) {
        throw new Error("Lawyer ID is required");
    }
    if (!applicationId) {
        throw new Error("Application ID is required");
    }
    // ApplicationModel üzerinde `lawyer` alanı userId ile eşleşen ve `_id` değerine sahip başvuruyu getir
    const application = yield application_model_1.ApplicationModel.findOne({
        _id: applicationId,
        lawyer: lawyerId,
    }).populate({
        path: "documents",
        select: "documents.documentUrl documents.documentDescription documents.documentSource", // Belgelerin detaylarını al
    });
    if (!application) {
        throw new Error("No application found with the given ID for this lawyer");
    }
    // Documents içindeki bilgileri kontrol et ve düzenle
    const populatedDocuments = application.documents.map((doc) => {
        const docDetails = doc.documents[0]; // İlk alt belge
        return {
            documentUrl: (docDetails === null || docDetails === void 0 ? void 0 : docDetails.documentUrl) || null,
            documentSource: (docDetails === null || docDetails === void 0 ? void 0 : docDetails.documentSource) || null,
            documentDescription: (docDetails === null || docDetails === void 0 ? void 0 : docDetails.documentDescription) || "Belge açıklaması yok",
        };
    });
    return Object.assign(Object.assign({}, application.toObject()), { populatedDocuments }); // Application ve belgelerle birlikte döndür
});
exports.getApplicationDetails = getApplicationDetails;
