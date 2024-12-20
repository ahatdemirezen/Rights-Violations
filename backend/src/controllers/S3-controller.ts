import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";


// AWS S3 istemcisi, kimlik bilgileri ve bölge bilgisiyle oluşturuluyor
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadToS3 = async (file: Express.Multer.File): Promise<any> => {
  const bucketName = process.env.S3_BUCKET_NAME;

  if (!bucketName) {
    throw new Error("AWS Bucket adı env ayarlarından alınamadı.");
  }

  const fileKey = `${uuidv4()}-${file.originalname}`;
  const params = {
    Bucket: bucketName,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3.send(new PutObjectCommand(params)); // Dosya S3'ye yükleniyor

    const signedUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: bucketName, Key: fileKey }),
      { expiresIn: 604800 } // 7 gün (7 * 24 * 60 * 60)
    );

    return {
      key: fileKey,
      signedUrl,
    };
  } catch (error) {
    console.error("S3 Yükleme Hatası:", error);
    throw new Error("Dosya yüklenemedi.");
  }
};
