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
exports.sendPasswordChangedEmail = exports.sendPasswordResetEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Nodemailer yapılandırması
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail', // Gmail kullanıyorsanız
    auth: {
        user: process.env.EMAIL_USER, // Çevre değişkenlerinden e-posta adresi
        pass: process.env.EMAIL_PASSWORD, // Çevre değişkenlerinden uygulama şifresi
    },
});
// Şifre sıfırlama e-postasını gönderme fonksiyonu
const sendPasswordResetEmail = (email, resetLink) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Şifre Sıfırlama İsteği',
        text: `Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın: ${resetLink}`,
        html: `<p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
           <a href="${resetLink}">Şifre Sıfırla</a>`,
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log(`Şifre sıfırlama e-postası ${email} adresine gönderildi.`);
    }
    catch (error) {
        console.error('E-posta gönderimi başarısız:', error);
        throw new Error('E-posta gönderimi sırasında bir hata oluştu.');
    }
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
// Şifre değişikliği bildirimi gönderme fonksiyonu
const sendPasswordChangedEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Şifreniz Başarıyla Değiştirildi',
        text: `
        Merhaba,
        Şifreniz başarıyla değiştirildi. Eğer bu işlemi siz yapmadıysanız, hemen bizimle iletişime geçin.
        Teşekkürler.
      `,
    };
    try {
        yield transporter.sendMail(mailOptions);
        console.log(`Şifre değişikliği bildirimi ${email} adresine gönderildi.`);
    }
    catch (error) {
        console.error('E-posta gönderimi başarısız:', error);
        throw new Error('Şifre değişikliği bildirimi gönderilemedi.');
    }
});
exports.sendPasswordChangedEmail = sendPasswordChangedEmail;
