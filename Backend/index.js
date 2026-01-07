import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRouter from "./routes/authRoute.js";
import departmentRouter from "./routes/departmentRoute.js";
import employeeRouter from "./routes/employeeRoute.js";
import clientRouter from "./routes/clientRoute.js";
import leaveRouter from "./routes/leaveRoute.js";
import settingRouter from "./routes/settingRoute.js";
import attendanceRouter from "./routes/attendanceRoute.js"
import dashboardRouter from "./routes/dashboardRoute.js";
import holidayRouter from "./routes/holidayRoute.js";
import connectToDatabase from "./db/db.js";

connectToDatabase();

const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors());

// serve public folder
app.use(express.static(path.join(__dirname, "public")));

// serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

app.use("/api/auth", authRouter);
app.use("/api/department", departmentRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/client", clientRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/setting", settingRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/holiday", holidayRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server is Running on port ${process.env.PORT}`);
});
