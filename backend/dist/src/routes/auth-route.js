"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth-controller");
const ratelimit_middleware_1 = require("../middleware/ratelimit-middleware"); // Middleware ayrı dosyada olabilir.
const router = express_1.default.Router();
// Şifre sıfırlama isteği için route
router.post('/forgot-password', ratelimit_middleware_1.resetPasswordLimiter, auth_controller_1.requestPasswordReset);
// Şifre sıfırlama işlemi için route
router.put('/reset-password', auth_controller_1.resetPassword);
exports.default = router;
