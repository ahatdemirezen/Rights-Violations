import nodemailer from 'nodemailer';

// Nodemailer yapılandırması
const transporter = nodemailer.createTransport({
  service: 'gmail', // Gmail kullanıyorsanız
  auth: {
    user: process.env.EMAIL_USER, // Çevre değişkenlerinden e-posta adresi
    pass: process.env.EMAIL_PASSWORD, // Çevre değişkenlerinden uygulama şifresi
  },
});

// Şifre sıfırlama e-postasını gönderme fonksiyonu
export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Şifre Sıfırlama İsteği',
    text: `Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın: ${resetLink}`,
    html: `<p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
           <a href="${resetLink}">Şifre Sıfırla</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Şifre sıfırlama e-postası ${email} adresine gönderildi.`);
  } catch (error) {
    console.error('E-posta gönderimi başarısız:', error);
    throw new Error('E-posta gönderimi sırasında bir hata oluştu.');
  }
};


// Şifre değişikliği bildirimi gönderme fonksiyonu
export const sendPasswordChangedEmail = async (email: string) => {
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
      await transporter.sendMail(mailOptions);
      console.log(`Şifre değişikliği bildirimi ${email} adresine gönderildi.`);
    } catch (error) {
      console.error('E-posta gönderimi başarısız:', error);
      throw new Error('Şifre değişikliği bildirimi gönderilemedi.');
    }
  };