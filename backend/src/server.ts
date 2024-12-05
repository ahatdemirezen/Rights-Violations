import express, { Request, Response, NextFunction } from "express";
import connectDB from "./config/db";
import * as dotenv from "dotenv";
import cors from "cors";
import loginRoute from "./routes/baro-login-route";
import cookieParser from "cookie-parser"; // Cookie-parser'ı import ediyoruz
import lawyerRoute from "./routes/lawyer-route"
import digitalArchiveRoutes from "./routes/digital-archive-route";
import eventCategoryRoutes from "./routes/event-category-route";
import lawsuitTrackingRoutes from "./routes/lawsuit-tracking-route"
import lawsuitInformationRoutes from "./routes/lawsuit-information-route"
import applicationRoutes from "./routes/application-route"

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
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
app.use("/api/lawyer", lawyerRoute);
app.use("/api/digital-archives", digitalArchiveRoutes);
app.use("/api/event-categories", eventCategoryRoutes);
app.use("/api/lawsuittracking" , lawsuitTrackingRoutes)
app.use("/api/lawsuitinformation" , lawsuitInformationRoutes)
app.use('/api/applications', applicationRoutes);


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
