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
exports.getAllDocuments = void 0;
const document_model_1 = require("../models/document-model");
const getAllDocuments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Veritabanından tüm dökümanları al
        const documents = yield document_model_1.DocumentModel.find();
        // Eğer hiç döküman yoksa 404 döndür
        if (!documents || documents.length === 0) {
            res.status(404).json({ message: "Hiç döküman bulunamadı." });
            return;
        }
        // Başarıyla dökümanları döndür
        res.status(200).json({ documents });
    }
    catch (error) {
        console.error("Dökümanları alırken hata:", error.message);
        res.status(500).json({ error: "Dökümanları getirirken bir hata oluştu." });
    }
});
exports.getAllDocuments = getAllDocuments;
