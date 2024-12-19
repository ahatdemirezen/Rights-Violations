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
exports.updateLawsuitArchiveStatusService = exports.updateLawsuitWithFilesService = exports.getAllLawsuitsService = exports.getLawsuitByIdService = exports.createLawsuitWithFilesService = void 0;
const application_model_1 = require("../models/application-model");
const files_model_1 = require("../models/files-model");
const lawsuitTracking_model_1 = require("../models/lawsuitTracking-model");
const S3_controller_1 = require("../controllers/S3-controller");
const mongoose_1 = __importDefault(require("mongoose"));
const http_errors_1 = __importDefault(require("http-errors"));
const createLawsuitWithFilesService = (applicationId, body, files) => __awaiter(void 0, void 0, void 0, function* () {
    const { caseSubject, fileNumber, court, courtFileNo, caseNumber, // Esas numarası
    lawsuitDate, // Dava tarihi
     } = body;
    const fileDescriptions = JSON.parse(body.fileDescriptions || "[]");
    const fileTypes = JSON.parse(body.fileTypes || "[]");
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // 1. `applicationId` doğrulama
        const applicationExists = yield application_model_1.ApplicationModel.findById(applicationId);
        if (!applicationExists) {
            throw (0, http_errors_1.default)(404, "Application with the provided applicationId does not exist.");
        }
        const applicationNumber = applicationExists.applicationNumber;
        const applicantName = applicationExists.applicantName || "";
        const organizationName = applicationExists.organizationName || ""; // Eklenen kısım
        // 2. Dosyaları S3'e yükle ve FileModel'e kaydet
        const uploadedFiles = yield Promise.all(files.map((file, index) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const s3Response = yield (0, S3_controller_1.uploadToS3)(file);
            const fileUrl = (_a = s3Response.files[0]) === null || _a === void 0 ? void 0 : _a.url;
            if (!fileUrl) {
                throw new Error("S3 yanıtından dosya URL'si alınamadı.");
            }
            const newFile = new files_model_1.FileModel({
                fileType: fileTypes[index] || null,
                fileUrl,
                description: fileDescriptions[index] || null,
            });
            const savedFile = yield newFile.save({ session });
            return savedFile._id;
        })));
        // 3. Yeni dava oluştur ve dosyaları ilişkilendir
        const newLawsuit = new lawsuitTracking_model_1.LawsuitTrackingModel({
            applicationId,
            applicationNumber,
            applicantName,
            organizationName, // Eklenen kısım
            caseSubject,
            fileNumber,
            courtFileNo,
            court,
            caseNumber: caseNumber || null,
            lawsuitDate: lawsuitDate || new Date(),
            files: uploadedFiles,
        });
        const savedLawsuit = yield newLawsuit.save({ session });
        // 4. Application'daki lawsuitCreated alanını güncelle
        yield application_model_1.ApplicationModel.findByIdAndUpdate(applicationId, { lawsuitCreated: true }, // `lawsuitCreated` alanını `true` yap
        { session, new: true } // Transaction ile güvenli güncelleme
        );
        // Transaction'ı tamamla
        yield session.commitTransaction();
        session.endSession();
        return savedLawsuit;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.createLawsuitWithFilesService = createLawsuitWithFilesService;
const getLawsuitByIdService = (lawsuitId) => __awaiter(void 0, void 0, void 0, function* () {
    // Dava bilgilerini getir ve applicationId içindeki lawyer bilgilerini populate et
    const lawsuit = yield lawsuitTracking_model_1.LawsuitTrackingModel.findById(lawsuitId)
        .populate("files") // Dosyaları getir
        .populate({
        path: "applicationId", // Application referansını getir
        populate: {
            path: "lawyer", // Application'daki lawyer referansını getir
            select: "name", // Sadece name bilgisini getir
        },
    });
    if (!lawsuit) {
        throw (0, http_errors_1.default)(404, "Lawsuit with the provided ID does not exist.");
    }
    return lawsuit.toObject(); // Tüm bilgileri JSON olarak döndür
});
exports.getLawsuitByIdService = getLawsuitByIdService;
const getAllLawsuitsService = () => __awaiter(void 0, void 0, void 0, function* () {
    // Tüm davaları al ve applicationId üzerinden lawyer bilgilerini de getir
    const lawsuits = yield lawsuitTracking_model_1.LawsuitTrackingModel.find()
        .select("applicationNumber applicantName organizationName caseSubject fileNumber court courtFileNo caseNumber lawsuitDate createdAt updatedAt archive") // Sadece gerekli alanları seç
        .populate({
        path: "applicationId", // Application bilgilerini getir
        populate: {
            path: "lawyer", // Lawyer bilgilerini getir
            select: "name email", // Lawyer'dan sadece name ve email bilgilerini al
        },
    });
    // Application null olan kayıtları kontrol et
    const nullApplications = lawsuits.filter((lawsuit) => lawsuit.applicationId === null);
    if (nullApplications.length > 0) {
        console.warn(`Uyarı: ${nullApplications.length} dava, applicationId alanı boş olduğu için lawyer bilgisi getirilemedi.`);
    }
    if (!lawsuits || lawsuits.length === 0) {
        throw (0, http_errors_1.default)(404, "Hiçbir dava bulunamadı.");
    }
    return lawsuits;
});
exports.getAllLawsuitsService = getAllLawsuitsService;
const updateLawsuitWithFilesService = (lawsuitId, body, files) => __awaiter(void 0, void 0, void 0, function* () {
    const { caseSubject, fileNumber, court, description, fileType, courtFileNo, lawsuitDate, caseNumber, resultDescription, resultStage, } = body;
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // 1. Mevcut dava kontrolü
        const lawsuit = yield lawsuitTracking_model_1.LawsuitTrackingModel.findById(lawsuitId);
        if (!lawsuit) {
            throw (0, http_errors_1.default)(404, "Lawsuit with the provided ID does not exist.");
        }
        // 2. Yeni dosyaları S3'e yükle ve FileModel'e kaydet
        let newUploadedFiles = [];
        if (files && files.length > 0) {
            newUploadedFiles = yield Promise.all(files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                const s3Response = yield (0, S3_controller_1.uploadToS3)(file);
                const fileUrl = (_a = s3Response.files[0]) === null || _a === void 0 ? void 0 : _a.url;
                if (!fileUrl) {
                    throw new Error("S3 yanıtından dosya URL'si alınamadı.");
                }
                const newFile = new files_model_1.FileModel({
                    fileType,
                    fileUrl,
                    description: description || null,
                });
                const savedFile = yield newFile.save({ session });
                return savedFile._id;
            })));
        }
        // 3. Mevcut dava bilgilerini güncelle
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
        // Transaction'ı tamamla
        yield session.commitTransaction();
        session.endSession();
        return updatedLawsuit;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.updateLawsuitWithFilesService = updateLawsuitWithFilesService;
const updateLawsuitArchiveStatusService = (lawsuitId, archive) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof archive !== "boolean") {
        throw (0, http_errors_1.default)(400, "Archive status must be a boolean value.");
    }
    // Dava bilgilerini güncelle
    const updatedLawsuit = yield lawsuitTracking_model_1.LawsuitTrackingModel.findByIdAndUpdate(lawsuitId, { archive }, { new: true } // Güncellenmiş belgeyi döndür
    );
    if (!updatedLawsuit) {
        throw (0, http_errors_1.default)(404, "Lawsuit with the provided ID does not exist.");
    }
    return updatedLawsuit;
});
exports.updateLawsuitArchiveStatusService = updateLawsuitArchiveStatusService;
