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
exports.getFileIdFromS3 = exports.deleteFileFromS3 = exports.getFileFromS3 = exports.getFilesFromS3 = exports.uploadToS3 = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const uploadToS3 = (file) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const project = process.env.Project;
    const bucket = process.env.BUCKET_NAME; // env den gerekli verileri alıyoruz 
    const accessKey = process.env.ACCESS_KEY;
    const link = process.env.Link;
    if (!project || !bucket || !accessKey || !link) {
        throw new Error('Env ayarlarından gerekli bilgiler alınamadı.');
    }
    try {
        const formData = new form_data_1.default();
        formData.append('file', file.buffer, file.originalname);
        formData.append('bucket', bucket);
        formData.append('project', project);
        formData.append('accessKey', accessKey);
        const response = yield axios_1.default.post(link, formData, {
            headers: formData.getHeaders(),
        });
        const s3Response = response.data; // ekleme işeleminde dönecek veriler
        const fileUrl = (_a = s3Response.files[0]) === null || _a === void 0 ? void 0 : _a.url; // url kontrolü
        if (!fileUrl) {
            throw new Error('S3 yanıtından geçerli bir URL alınamadı.');
        }
        return s3Response;
    }
    catch (error) {
        console.error("S3 Yükleme Hatası:", ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
        // Hata objesini olduğu gibi geri döndür
        if (error.response) {
            throw error.response.data; // Response verisini direkt geri döner
        }
        else {
            throw { message: "S3 yüklemesinde bilinmeyen bir hata oluştu.", details: error.message };
        }
    }
});
exports.uploadToS3 = uploadToS3;
const getFilesFromS3 = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const project = process.env.Project;
    const bucket = process.env.BUCKET_NAME; // env den gerekli verileri alıyoruz 
    const accessKey = process.env.ACCESS_KEY;
    const link = process.env.Link;
    if (!project || !bucket || !accessKey || !link) {
        throw new Error('Env ayarlarından gerekli bilgiler alınamadı.');
    }
    try {
        const response = yield axios_1.default.get(`${link}/${project}/${bucket}/${accessKey}`); // burada s3 sistemine nasıl get atıyorsak burada da aynı işlem gerçekleşiyor 
        return response.data; // S3 yanıtını döndür
    }
    catch (error) {
        console.error('S3 Getirme Hatası:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw new Error('S3\'ten dosyalar getirilirken hata oluştu.');
    }
});
exports.getFilesFromS3 = getFilesFromS3;
const getFileFromS3 = (fileUrl) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!fileUrl) {
        throw new Error("Dosya URL'si sağlanmadı.");
    }
    try {
        // S3'ten dosya bilgisi almak için URL kullan
        const response = yield axios_1.default.get(fileUrl);
        return response.data; // S3 yanıtını döndür
    }
    catch (error) {
        console.error("S3 Getirme Hatası:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw new Error("S3'ten dosyalar getirilirken hata oluştu.");
    }
});
exports.getFileFromS3 = getFileFromS3;
const deleteFileFromS3 = (fileId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const project = process.env.Project;
    const bucket = process.env.BUCKET_NAME; // env den gerekli verileri alıyoruz 
    const accessKey = process.env.ACCESS_KEY;
    const link = process.env.Link;
    if (!project || !bucket || !accessKey || !link) {
        throw new Error('Env ayarlarından gerekli bilgiler alınamadı.');
    }
    try {
        // S3 API'ye DELETE isteği gönder
        const response = yield axios_1.default.delete(`${link}/${project}/${bucket}/${accessKey}/${fileId}`); // S3 sistemindeki Silme işlemi mantığındaki api düzeni
        return { success: true };
    }
    catch (error) {
        console.error('S3 Silme Hatası:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        return { success: false };
    }
});
exports.deleteFileFromS3 = deleteFileFromS3;
const getFileIdFromS3 = (fileName) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const project = process.env.Project;
    const bucket = process.env.BUCKET_NAME; // env den gerekli verileri alıyoruz 
    const accessKey = process.env.ACCESS_KEY;
    const link = process.env.Link;
    if (!project || !bucket || !accessKey || !link) {
        throw new Error('Env ayarlarından gerekli bilgiler alınamadı.');
    }
    try {
        const response = yield axios_1.default.get(`${link}/${project}/${bucket}/${accessKey}`); // S3 API'sine GET isteği gönder
        const files = response.data.files;
        // Gelen verilerden fileName ile eşleşen dosyayı bul
        const matchedFile = files.find((file) => file.fileName === fileName);
        if (!matchedFile) {
            console.error('S3 dosyası bulunamadı:', fileName);
            return null;
        }
        // Eşleşen dosyanın `_id` (fileId) alanını döndür
        return matchedFile._id || null;
    }
    catch (error) {
        console.error('S3 Dosya ID Alma Hatası:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        return null;
    }
});
exports.getFileIdFromS3 = getFileIdFromS3;
