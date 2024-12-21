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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLawyerNameByUserId = exports.getLawyerById = exports.deleteLawyer = exports.getAllLawyers = exports.createUser = void 0;
const lawyer_service_1 = require("../services/lawyer-service");
const mongoose_1 = __importDefault(require("mongoose"));
const createUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, password, gender, nationalID, email } = req.body;
        // Service katmanını çağır ve kullanıcıyı oluştur
        const user = yield (0, lawyer_service_1.createUserService)({ name, password, gender, nationalID, email });
        res.status(201).json({
            message: 'User created successfully',
            user,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Unknown error occurred' });
        }
    }
});
exports.createUser = createUser;
const getAllLawyers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Service katmanını çağır ve avukatları getir
        const lawyers = yield (0, lawyer_service_1.getAllLawyersService)();
        res.status(200).json({
            message: 'Lawyers fetched successfully',
            lawyers,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Unknown error occurred' });
        }
    }
});
exports.getAllLawyers = getAllLawyers;
const deleteLawyer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Silinecek avukatın ID'sini al
    try {
        // Service katmanını çağır ve avukatı sil
        const deletedLawyer = yield (0, lawyer_service_1.deleteLawyerService)(id);
        res.status(200).json({
            message: 'Lawyer deleted successfully',
            lawyer: deletedLawyer,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Lawyer not found') {
                res.status(404).json({ message: error.message });
            }
            else {
                res.status(500).json({ message: error.message });
            }
        }
        else {
            res.status(500).json({ message: 'Unknown error occurred' });
        }
    }
});
exports.deleteLawyer = deleteLawyer;
const getLawyerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // Avukatın ID'sini al
    try {
        // Service katmanını çağır ve avukat detaylarını al
        const lawyer = yield (0, lawyer_service_1.getLawyerByIdService)(id);
        res.status(200).json({
            message: 'Lawyer fetched successfully',
            lawyer,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Lawyer not found') {
                res.status(404).json({ message: error.message });
            }
            else {
                res.status(500).json({ message: error.message });
            }
        }
        else {
            res.status(500).json({ message: 'Unknown error occurred' });
        }
    }
});
exports.getLawyerById = getLawyerById;
const getLawyerNameByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(400).json({ message: "User ID not found in request" });
    }
    // ObjectId doğrulama
    if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
    }
    try {
        const lawyerName = yield (0, lawyer_service_1.getLawyerNameByUserIdService)(userId);
        if (!lawyerName) {
            return res.status(404).json({ message: "Lawyer not found" });
        }
        res.status(200).json({
            message: "Lawyer name fetched successfully",
            name: lawyerName,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: "Unknown error occurred" });
        }
    }
});
exports.getLawyerNameByUserId = getLawyerNameByUserId;
