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
exports.processDocuments = exports.saveDocument = void 0;
const document_model_1 = require("../models/document-model");
const S3_controller_1 = require("../controllers/S3-controller");
// Yardımcı Fonksiyon: DocumentModel Kaydet
const saveDocument = (documentType, documentData) => __awaiter(void 0, void 0, void 0, function* () {
    const { description, type, url, source } = documentData;
    const documentObject = Object.assign(Object.assign({ documentType, documentDescription: description, type }, (documentType === "files" && url ? { documentUrl: url } : {})), (documentType === "link" && source ? { documentSource: source } : {}));
    const newDocument = new document_model_1.DocumentModel({
        documents: [documentObject],
    });
    const savedDocument = yield newDocument.save();
    return savedDocument._id;
});
exports.saveDocument = saveDocument;
const processDocuments = (descriptions_1, types_1, files_1, ...args_1) => __awaiter(void 0, [descriptions_1, types_1, files_1, ...args_1], void 0, function* (descriptions, types, files, links = []) {
    var _a;
    const savedDocuments = [];
    // Dosyaları İşle
    for (let i = 0; i < files.length; i++) {
        const description = descriptions.files[i] || `Document ${i + 1}`;
        const type = types.files[i] || "Other";
        const s3Response = yield (0, S3_controller_1.uploadToS3)(files[i]);
        const documentUrl = (_a = s3Response.files[0]) === null || _a === void 0 ? void 0 : _a.url;
        const newDocument = new document_model_1.DocumentModel({
            documents: [{ documentDescription: description, type, documentUrl }],
        });
        const savedDocument = yield newDocument.save();
        savedDocuments.push(savedDocument._id);
    }
    // Linkleri İşle
    for (let i = 0; i < links.length; i++) {
        const description = descriptions.links[i] || `Link ${i + 1}`;
        const type = types.links[i] || "Other";
        const documentUrl = links[i];
        if (!documentUrl)
            continue; // Boş link varsa atla
        const newDocument = new document_model_1.DocumentModel({
            documents: [
                {
                    documentType: "link",
                    documentSource: documentUrl,
                    documentUrl,
                    documentDescription: description,
                    type,
                },
            ],
        });
        const savedDocument = yield newDocument.save();
        savedDocuments.push(savedDocument._id);
    }
    return savedDocuments;
});
exports.processDocuments = processDocuments;
