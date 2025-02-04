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
    const savedDocuments = [];
    // Dosyaları işle
    for (let i = 0; i < files.length; i++) {
        const description = descriptions.files[i] || `Document ${i + 1}`;
        const type = types.files[i] || "Other";
        const s3Response = yield (0, S3_controller_1.uploadToS3)(files[i]); // AWS S3'e yükle
        const documentUrl = s3Response.signedUrl;
        const newDocument = new document_model_1.DocumentModel({
            documents: [
                {
                    documentType: "files", // Dosya türünü otomatik olarak 'files' yap
                    documentUrl,
                    documentDescription: description,
                    type,
                },
            ],
        });
        const savedDocument = yield newDocument.save();
        savedDocuments.push(savedDocument._id);
    }
    // Linkleri işle
    for (let i = 0; i < links.length; i++) {
        const description = descriptions.links[i] || `Link ${i + 1}`;
        const type = types.links[i] || "Other";
        const documentSource = links[i];
        const newDocument = new document_model_1.DocumentModel({
            documents: [
                {
                    documentType: "link",
                    documentSource,
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
