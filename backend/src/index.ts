import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import session from "express-session"; // Changed from cookie-session
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { error } from "console";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import "./config/passport.config";
import passport from "passport";
import authRoutes from "./routes/auth.routes";
import morgan from "morgan";
import userRoutes from "./routes/user.routes";
import isAuthenticated from "./middlewares/isAuthenticated.middleware";
const app = express();
const BASE_PATH = config.BASE_PATH;
console.log("BASE_PATH", BASE_PATH);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: config.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(HTTPSTATUS.OK).json({
      message: "Hello world",
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes); 
app.use(`${BASE_PATH}/user`, isAuthenticated,userRoutes);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(
    `Server is running on port ${config.PORT} in ${config.NODE_ENV} mode`
  );
  await connectDatabase();
});
