"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const applicationForLawyer_controller_1 = require("../controllers/applicationForLawyer-controller");
const user_auth_1 = require("../middleware/user-auth");
const router = express_1.default.Router();
router.get("/", user_auth_1.authenticateToken, applicationForLawyer_controller_1.getAllApplicationByLawyer);
router.get("/:applicationId", user_auth_1.authenticateToken, applicationForLawyer_controller_1.getApplicationDetailsByLawyer);
exports.default = router;
