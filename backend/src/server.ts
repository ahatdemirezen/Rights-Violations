import express, { Request, Response, NextFunction } from "express";
import connectDB from "./config/db";
import dotenv from "dotenv";
import cors from "cors";
import loginRoute from "./routes/baro-login-route";
import { authenticateToken } from "./middleware/auth";
import cookieParser from "cookie-parser"; // Cookie-parser'ı import ediyoruz

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL || "https://live-interview-delta.vercel.app", process.env.WEB_URL || "https://live-interview-web.vercel.app" ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Credentials ile ilgili isteklere izin ver
  })
);


// Middleware: JSON body parsing
app.use(express.json()); // JSON verileri alabilmek için
app.use(cookieParser()); // Cookie'leri kullanabilmek için cookie parser middleware'i kullan

// Ana sayfa rotası
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Homepage!");
});

// API rotaları
app.use("/api/login", loginRoute);

// Hataları yakalayan middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack); // Hatanın detaylarını konsola yazdır
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message, // Hatanın mesajını kullanıcıya dönebiliriz
  });
});

// 404 hatalarını yakalayan middleware
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested resource was not found.",
  });
});

// Sunucuyu başlat
const PORT = process.env.PORT || 5002;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});
