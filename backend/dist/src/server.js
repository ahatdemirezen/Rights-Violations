"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./config/db"));
const dotenv = __importStar(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const baro_login_route_1 = __importDefault(require("./routes/baro-login-route"));
const cookie_parser_1 = __importDefault(require("cookie-parser")); // Cookie-parser'ı import ediyoruz
const lawyer_route_1 = __importDefault(require("./routes/lawyer-route"));
const lawsuit_tracking_route_1 = __importDefault(require("./routes/lawsuit-tracking-route"));
const application_route_1 = __importDefault(require("./routes/application-route"));
const applicationForLawyer_route_1 = __importDefault(require("./routes/applicationForLawyer-route"));
const lawsuit_trackingForLawyer_route_1 = __importDefault(require("./routes/lawsuit-trackingForLawyer-route"));
const document_route_1 = __importDefault(require("./routes/document-route"));
const citizen_route_1 = __importDefault(require("./routes/citizen-route"));
const admin_auth_1 = require("./middleware/admin-auth");
const auth_route_1 = __importDefault(require("./routes/auth-route"));
dotenv.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [process.env.FRONTEND_URL || "https://rights-violations.vercel.app", process.env.WEB_URL || "https://rights-violations-citizien.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Credentials ile ilgili isteklere izin ver
}));
// Middleware: JSON body parsing
app.use(express_1.default.json()); // JSON verileri alabilmek için
app.use((0, cookie_parser_1.default)()); // Cookie'leri kullanabilmek için cookie parser middleware'i kullan
// Ana sayfa rotası
app.get("/", (req, res) => {
    res.send("Welcome to the Homepage!");
});
// API rotaları
app.use("/api/login", baro_login_route_1.default);
app.use("/api/lawyer", admin_auth_1.authenticateAdmin, lawyer_route_1.default);
app.use("/api/lawsuittracking", admin_auth_1.authenticateAdmin, lawsuit_tracking_route_1.default);
app.use('/api/applications', admin_auth_1.authenticateAdmin, application_route_1.default);
app.use('/api/lawyerapplication', applicationForLawyer_route_1.default);
app.use("/api/citizen/create", citizen_route_1.default);
app.use('/api/lawyer-lawsuits', lawsuit_trackingForLawyer_route_1.default);
app.use('/api/documents', admin_auth_1.authenticateAdmin, document_route_1.default);
app.use('/api/auth', auth_route_1.default);
// Hataları yakalayan middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Hatanın detaylarını konsola yazdır
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message, // Hatanın mesajını kullanıcıya dönebiliriz
    });
});
// 404 hatalarını yakalayan middleware
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: "The requested resource was not found.",
    });
});
// Sunucuyu başlat
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, db_1.default)();
    console.log(`Server is running on port ${PORT}`);
}));
