import axios from 'axios';
import FormData from 'form-data';

export const uploadToS3 = async (file: Express.Multer.File): Promise<any> => { // S3 dosya gönderme işleminin gerçekleştiriği fonksiyon

  const project = process.env.Project;
  const bucket = process.env.BUCKET_NAME;  // env den gerekli verileri alıyoruz 
  const accessKey = process.env.ACCESS_KEY;
  const link = process.env.Link;

  if (!project || !bucket || !accessKey || !link) {
    throw new Error('Env ayarlarından gerekli bilgiler alınamadı.');
  }

  try {
    const formData = new FormData();
    formData.append('file', file.buffer, file.originalname);
    formData.append('bucket', bucket);
    formData.append('project', project);
    formData.append('accessKey', accessKey);

    const response = await axios.post(link, formData, { // burada s3 e nasıl dosya atıyorsa buradaki yapı da aynı linke formData da ki verileri gönderiyoruz 
      headers: formData.getHeaders(),
    });

    const s3Response = response.data; // ekleme işeleminde dönecek veriler

    const fileUrl = s3Response.files[0]?.url; // url kontrolü
    if (!fileUrl) {
      throw new Error('S3 yanıtından geçerli bir URL alınamadı.');
    }

    return s3Response; 

  } catch (error: any) {
    console.error("S3 Yükleme Hatası:", error.response?.data || error.message);
  
    // Hata objesini olduğu gibi geri döndür
    if (error.response) {
      throw error.response.data; // Response verisini direkt geri döner
    } else {
      throw { message: "S3 yüklemesinde bilinmeyen bir hata oluştu.", details: error.message };
    }
  }
};

export const getFilesFromS3 = async (): Promise<any> => { // S3 den Tüm dosyaları çektirecğimiz fonksiyon
  const project = process.env.Project;
  const bucket = process.env.BUCKET_NAME;  // env den gerekli verileri alıyoruz 
  const accessKey = process.env.ACCESS_KEY;
  const link = process.env.Link;

    if (!project || !bucket || !accessKey || !link) {
      throw new Error('Env ayarlarından gerekli bilgiler alınamadı.');
    }
  
    try {
      
      const response = await axios.get(`${link}/${project}/${bucket}/${accessKey}`); // burada s3 sistemine nasıl get atıyorsak burada da aynı işlem gerçekleşiyor 
  
      return response.data; // S3 yanıtını döndür
    } catch (error: any) {
      console.error('S3 Getirme Hatası:', error.response?.data || error.message);
      throw new Error('S3\'ten dosyalar getirilirken hata oluştu.');
    }
};

export const getFileFromS3 = async (fileUrl: string): Promise<any> => {
  if (!fileUrl) {
    throw new Error("Dosya URL'si sağlanmadı.");
  }

  try {
    // S3'ten dosya bilgisi almak için URL kullan
    const response = await axios.get(fileUrl);
    return response.data; // S3 yanıtını döndür
  } catch (error: any) {
    console.error("S3 Getirme Hatası:", error.response?.data || error.message);
    throw new Error("S3'ten dosyalar getirilirken hata oluştu.");
  }
};


export const deleteFileFromS3 = async (fileId: string): Promise<{ success: boolean }> => { // S3 den dosya sildirme fonksiyonu
  const project = process.env.Project;
  const bucket = process.env.BUCKET_NAME;  // env den gerekli verileri alıyoruz 
  const accessKey = process.env.ACCESS_KEY;
  const link = process.env.Link;

  if (!project || !bucket || !accessKey || !link) {
    throw new Error('Env ayarlarından gerekli bilgiler alınamadı.');
  }

  try {
    // S3 API'ye DELETE isteği gönder
    const response = await axios.delete(`${link}/${project}/${bucket}/${accessKey}/${fileId}`); // S3 sistemindeki Silme işlemi mantığındaki api düzeni

    return { success: true };
  } catch (error: any) {
    console.error('S3 Silme Hatası:', error.response?.data || error.message);
    return { success: false };
  }
};

export const getFileIdFromS3 = async (fileName: string): Promise<string | null> => { // Atılan dosyanın S3 sistemindeki ID değerini veren fonksiyon
  const project = process.env.Project;
  const bucket = process.env.BUCKET_NAME;  // env den gerekli verileri alıyoruz 
  const accessKey = process.env.ACCESS_KEY;
  const link = process.env.Link;

  if (!project || !bucket || !accessKey || !link) {
    throw new Error('Env ayarlarından gerekli bilgiler alınamadı.');
  }

  try {
    const response = await axios.get(`${link}/${project}/${bucket}/${accessKey}`); // S3 API'sine GET isteği gönder
    const files = response.data.files;

    // Gelen verilerden fileName ile eşleşen dosyayı bul
    const matchedFile = files.find((file: any) => file.fileName === fileName);

    if (!matchedFile) {
      console.error('S3 dosyası bulunamadı:', fileName);
      return null;
    }

    // Eşleşen dosyanın `_id` (fileId) alanını döndür
    return matchedFile._id || null;
  } catch (error: any) {
    console.error('S3 Dosya ID Alma Hatası:', error.response?.data || error.message);
    return null;
  }
}; 