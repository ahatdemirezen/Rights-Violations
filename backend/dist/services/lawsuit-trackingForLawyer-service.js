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
exports.getLawsuitByIdService = exports.getLawsuitsByLawyerService = void 0;
const application_model_1 = require("../models/application-model");
const lawsuitTracking_model_1 = require("../models/lawsuitTracking-model");
const http_errors_1 = __importDefault(require("http-errors"));
const getLawsuitsByLawyerService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userId) {
        throw (0, http_errors_1.default)(400, "User ID not found in request");
    }
    // Lawyer'a atanmış başvuruları al
    const applications = yield application_model_1.ApplicationModel.find({ lawyer: userId }).select("_id");
    if (!applications || applications.length === 0) {
        throw (0, http_errors_1.default)(404, "No applications found for this lawyer");
    }
    // Başvurulara bağlı davaları al
    const applicationIds = applications.map((app) => app._id);
    const lawsuits = yield lawsuitTracking_model_1.LawsuitTrackingModel.find({
        applicationId: { $in: applicationIds },
    })
        .populate({
        path: "applicationId", // Başvuru bilgilerini doldur
        select: "applicantName applicationNumber", // Sadece gerekli alanları getir
    })
        .exec();
    if (!lawsuits || lawsuits.length === 0) {
        throw (0, http_errors_1.default)(404, "No lawsuits found for the given lawyer's applications");
    }
    return lawsuits;
});
exports.getLawsuitsByLawyerService = getLawsuitsByLawyerService;
const getLawsuitByIdService = (lawsuitId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // 1. Dava bilgilerini getir ve applicationId içindeki lawyer ile eşleştirme yap
    const lawsuit = yield lawsuitTracking_model_1.LawsuitTrackingModel.findOne({
        _id: lawsuitId,
    })
        .populate({
        path: "applicationId", // Başvuru detaylarını getir
        populate: {
            path: "lawyer", // Lawyer bilgilerini getir
        },
    })
        .populate("files"); // Dosyaları getir
    if (!lawsuit) {
        throw (0, http_errors_1.default)(404, "Lawsuit with the provided ID does not exist or access is denied.");
    }
    const application = lawsuit.applicationId;
    // 2. Avukatın bu davaya erişim yetkisi olup olmadığını kontrol et
    if (((_a = application.lawyer) === null || _a === void 0 ? void 0 : _a._id.toString()) !== userId) {
        throw (0, http_errors_1.default)(403, "Access denied. You are not authorized to view this lawsuit.");
    }
    return lawsuit;
});
exports.getLawsuitByIdService = getLawsuitByIdService;
