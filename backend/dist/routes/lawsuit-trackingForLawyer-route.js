"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lawsuit_trackingForLawyer_controller_1 = require("../controllers/lawsuit-trackingForLawyer-controller");
const user_auth_1 = require("../middleware/user-auth");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
// Tüm davaları getir
router.get("/", user_auth_1.authenticateToken, lawsuit_trackingForLawyer_controller_1.getLawsuitsByLawyer);
router.get("/calendar", user_auth_1.authenticateToken, lawsuit_trackingForLawyer_controller_1.getLawsuitsForCalendar);
router.put("/:lawsuitId", user_auth_1.authenticateToken, upload.array("files"), // Güncelleme sırasında da dosya yükleme yapılabilir
lawsuit_trackingForLawyer_controller_1.updateLawsuitWithFiles);
router.get("/:lawsuitId", user_auth_1.authenticateToken, lawsuit_trackingForLawyer_controller_1.getLawsuitById);
exports.default = router;
