import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
//import session from "express-session"; // Changed from cookie-session
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/errorhandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asynchandler.middleware";
import "./config/passport.config";
import passport from "passport";
import authRoutes from "./routes/auth.routes";
import morgan from "morgan";
import userRoutes from "./routes/user.routes";
import isAuthenticated from "./middlewares/isauthenticated.middleware";
import workspaceRoutes from "./routes/workspace.routes";
import memberRoutes from "./routes/member.routes";
import projectRoutes from "./routes/project.routes";
import taskRoutes from "./routes/task.routes";
import { passportAuthenticateJWT } from "./config/passport.config";
const app = express();
const BASE_PATH = config.BASE_PATH;
console.log("BASE_PATH", BASE_PATH);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// app.use(
//   session({
//     secret: config.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       maxAge: 24 * 60 * 60 * 1000, // 1 day
//       secure: config.NODE_ENV === "production",
//       httpOnly: true,
//       sameSite: "lax",
//     },
//   })
// );

app.use(passport.initialize());
//app.use(passport.session());

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
app.use(`${BASE_PATH}/user`, passportAuthenticateJWT,userRoutes);
app.use(`${BASE_PATH}/workspace`, passportAuthenticateJWT,workspaceRoutes);
app.use(`${BASE_PATH}/member`, passportAuthenticateJWT,memberRoutes);
app.use(`${BASE_PATH}/project`, passportAuthenticateJWT,projectRoutes);
app.use(`${BASE_PATH}/task`, passportAuthenticateJWT,taskRoutes);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(
    `Server is running on port ${config.PORT} in ${config.NODE_ENV} mode`
  );
  await connectDatabase();
});
