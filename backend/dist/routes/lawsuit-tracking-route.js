"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const lawsuit_tracking_controller_1 = require("../controllers/lawsuit-tracking-controller");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post("/:applicationId", (req, res, next) => {
    console.log("Router Seviyesi: Gelen Request:");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body); // req.body burada genelde boş olur (çünkü multer'dan önce işlenmemiştir).
    next(); // Bir sonraki middleware'e geç
}, upload.array("files"), // Multer middleware
(req, res, next) => {
    console.log("Router Seviyesi: Multer Middleware Sonrası:");
    console.log("Body:", req.body);
    console.log("Files:", req.files);
    next(); // Controller'a geç
}, lawsuit_tracking_controller_1.createLawsuitWithFiles);
router.put("/:lawsuitId/archive", lawsuit_tracking_controller_1.updateLawsuitArchiveStatus);
router.get("/:lawsuitId", lawsuit_tracking_controller_1.getLawsuitById);
router.get("/", lawsuit_tracking_controller_1.getAllLawsuits);
router.put("/:lawsuitId", upload.array("files"), // Güncelleme sırasında da dosya yükleme yapılabilir
lawsuit_tracking_controller_1.updateLawsuitWithFiles);
exports.default = router;
