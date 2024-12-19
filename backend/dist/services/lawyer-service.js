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
exports.getLawyerNameByUserIdService = exports.getLawyerByIdService = exports.deleteLawyerService = exports.getAllLawyersService = exports.createUserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_model_1 = require("../models/user-model");
const createUserService = (userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, password, gender, nationalID } = userData;
    // Gerekli alanların kontrolü
    if (!name || !password || !gender || !nationalID) {
        throw new Error('All fields are required');
    }
    // TC kimlik numarasının geçerli uzunlukta olup olmadığını kontrol et
    if (nationalID.length !== 11 || isNaN(Number(nationalID))) {
        throw new Error('Invalid national ID');
    }
    // Gender alanının sadece "male" veya "female" değerini kabul etmesi
    if (!Object.values(user_model_1.Gender).includes(gender)) {
        throw new Error('Invalid gender value');
    }
    // Şifreyi hashleme
    const saltRounds = 10; // Hashleme zorluk derecesi
    const hashedPassword = yield bcryptjs_1.default.hash(password, saltRounds);
    // Yeni bir kullanıcı oluştur
    const newUser = new user_model_1.UserModel({
        name, // İsim kullanıcıdan alınır
        password: hashedPassword, // Hashlenmiş şifre veritabanına kaydedilir
        roles: [user_model_1.UserRole.Lawyer], // Rol otomatik olarak 'lawyer' olarak atanır
        gender, // Cinsiyet kullanıcıdan alınır
        nationalID, // TC kimlik numarası kullanıcıdan alınır
    });
    // Kullanıcıyı veritabanına kaydet
    const savedUser = yield newUser.save();
    return {
        id: savedUser._id,
        name: savedUser.name,
        roles: savedUser.roles,
        gender: savedUser.gender,
        nationalID: savedUser.nationalID,
    };
});
exports.createUserService = createUserService;
const getAllLawyersService = () => __awaiter(void 0, void 0, void 0, function* () {
    // Rolü "lawyer" olan kullanıcıları getir
    const lawyers = yield user_model_1.UserModel.find({ roles: user_model_1.UserRole.Lawyer });
    // Kullanıcıları belirli bir yapıda döndür
    return lawyers.map((lawyer) => ({
        id: lawyer._id,
        name: lawyer.name,
        gender: lawyer.gender,
        nationalID: lawyer.nationalID,
        roles: lawyer.roles,
        createdAt: lawyer.createdAt,
        updatedAt: lawyer.updatedAt,
    }));
});
exports.getAllLawyersService = getAllLawyersService;
const deleteLawyerService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Veritabanında kullanıcıyı ara ve sil
    const deletedLawyer = yield user_model_1.UserModel.findByIdAndDelete(id);
    if (!deletedLawyer) {
        throw new Error('Lawyer not found'); // Avukat bulunamazsa hata fırlat
    }
    return {
        id: deletedLawyer._id,
        name: deletedLawyer.name,
        gender: deletedLawyer.gender,
        nationalID: deletedLawyer.nationalID,
        roles: deletedLawyer.roles,
    };
});
exports.deleteLawyerService = deleteLawyerService;
const getLawyerByIdService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    // Veritabanında avukatı ID'ye göre bul
    const lawyer = yield user_model_1.UserModel.findById(id);
    if (!lawyer) {
        throw new Error('Lawyer not found'); // Avukat bulunamazsa hata fırlat
    }
    return {
        id: lawyer._id,
        name: lawyer.name,
        gender: lawyer.gender,
        nationalID: lawyer.nationalID,
        roles: lawyer.roles,
        createdAt: lawyer.createdAt,
        updatedAt: lawyer.updatedAt,
    };
});
exports.getLawyerByIdService = getLawyerByIdService;
const getLawyerNameByUserIdService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lawyer = yield user_model_1.UserModel.findById(userId, "name"); // Sadece name alanını getir
        if (!lawyer) {
            return null;
        }
        return lawyer.name; // Avukatın ismini döner
    }
    catch (error) {
        throw new Error("Error fetching lawyer name");
    }
});
exports.getLawyerNameByUserIdService = getLawyerNameByUserIdService;
