"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const document_controller_1 = require("../controllers/document-controller");
const router = express_1.default.Router();
// Tüm dökümanları getirme endpointi
router.get("/", document_controller_1.getAllDocuments);
exports.default = router;
