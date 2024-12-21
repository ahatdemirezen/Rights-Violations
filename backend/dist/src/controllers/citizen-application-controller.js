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
exports.createApplicationcitizen = void 0;
const citizen_application_service_1 = require("../services/citizen-application-service");
const createApplicationcitizen = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = req.files; // Yüklenen dosyalar
        const savedApplication = yield (0, citizen_application_service_1.createApplicationCitizenService)(req.body, files);
        // Başarılı yanıt
        res.status(201).json({
            success: true,
            message: "Başvuru başarıyla oluşturuldu.",
            application: savedApplication,
        });
    }
    catch (error) {
        console.error("Başvuru oluşturulurken hata:", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
});
exports.createApplicationcitizen = createApplicationcitizen;
exports.default = exports.createApplicationcitizen;
