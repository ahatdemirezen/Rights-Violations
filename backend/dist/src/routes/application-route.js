"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const application_controller_1 = require("../controllers/application-controller");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() }); // Bellekte dosyaları sakla
// Yeni başvuru oluşturma
router.post("/", upload.array("files"), application_controller_1.createApplication);
// Tüm başvuruları listeleme
router.get("/applications", application_controller_1.getAllApplications);
// ID'ye göre başvuru getirme
router.get("/:id", application_controller_1.getApplicationById);
// Başvuru düzenleme
router.put("/:id", upload.array("files"), application_controller_1.updateApplication);
exports.default = router;
