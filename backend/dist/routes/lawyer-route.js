"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lawyer_controller_1 = require("../controllers/lawyer-controller");
const user_auth_1 = require("../middleware/user-auth");
const router = express_1.default.Router();
// POST isteği için rota
router.post("/", lawyer_controller_1.createUser);
router.get('/', lawyer_controller_1.getAllLawyers);
router.delete("/:id", lawyer_controller_1.deleteLawyer);
router.get("/:id", lawyer_controller_1.getLawyerById);
router.get("/name", user_auth_1.authenticateToken, lawyer_controller_1.getLawyerNameByUserId);
exports.default = router;
