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
exports.uploadToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
// AWS S3 istemcisi, kimlik bilgileri ve bölge bilgisiyle oluşturuluyor
const s3 = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const uploadToS3 = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
        throw new Error("AWS Bucket adı env ayarlarından alınamadı.");
    }
    const fileKey = `${(0, uuid_1.v4)()}-${file.originalname}`;
    const params = {
        Bucket: bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
    };
    try {
        yield s3.send(new client_s3_1.PutObjectCommand(params)); // Dosya S3'ye yükleniyor
        const signedUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3, new client_s3_1.GetObjectCommand({ Bucket: bucketName, Key: fileKey }), { expiresIn: 604800 } // 7 gün (7 * 24 * 60 * 60)
        );
        return {
            key: fileKey,
            signedUrl,
        };
    }
    catch (error) {
        console.error("S3 Yükleme Hatası:", error);
        throw new Error("Dosya yüklenemedi.");
    }
});
exports.uploadToS3 = uploadToS3;
