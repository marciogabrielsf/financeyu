import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/authRoutes";
import cardRoutes from "./routes/cardRoutes";
import debtorRoutes from "./routes/debtorRoutes";
import debtRoutes from "./routes/debtRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/cards", cardRoutes);
app.use("/debtors", debtorRoutes);
app.use("/debts", debtRoutes);
app.use("/dashboard", dashboardRoutes);

// Swagger (Placeholder for now)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(undefined));

export default app;
