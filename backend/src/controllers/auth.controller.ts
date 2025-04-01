import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asynchandler.middleware";
import { config } from "../config/app.config";
import { registerSchema } from "../validations/auth.validation";
import { HTTPSTATUS } from "../config/http.config";
import { registerUserService } from "../services/auth.service";
import passport from "passport";
import { getCurrentUserService } from "../services/user.service";
import { signJwtToken } from "../utils/jwt";

export const googleLoginCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const jwt = req.jwt;
    const currentWorkspace = req.user?.currentWorkspace;

    if (!jwt) {
      return res.redirect(
        `${config.FRONTEND_GOOGLE_CALLBACK_URL}/login?error=failed`
      );
    }
    // return res.redirect(
    //   `${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}`
    // );
    return res.redirect(
      `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=success&access_token=${jwt}&current_workspace=${currentWorkspace}`
    );
  }
);

export const registerUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse({ ...req.body });
    await registerUserService(body);
    return res
      .status(HTTPSTATUS.CREATED)
      .json({ message: "User created successfully" });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      (
        err: Error | null,
        user: Express.User | false,
        info: { message: string | undefined }
      ) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(HTTPSTATUS.UNAUTHORIZED).json({
            message: info?.message || "Invalid email or password",
          });
        }
        // req.logIn(user, (err) => {
        //   if (err) {
        //     return next(err);
        //   }
        //   return res
        //     .status(HTTPSTATUS.OK)
        //     .json({ message: "Login successful", user });
        // });

        const access_token = signJwtToken({ userId: user._id });

        return res.status(HTTPSTATUS.OK).json({
          message: "Logged in successfully",
          access_token,
          user,
        });
      }
    )(req, res, next);
  }
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(HTTPSTATUS.OK).json({ message: "Already logged out" });
    }

    req.logout((err) => {
      if (err) {
        console.log("Logout Error", err);
        return res
          .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
          .json({ message: "Logout failed" });
      }

      // Only destroy the session after logout is complete
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.log("Session destruction error", err);
            return res
              .status(HTTPSTATUS.INTERNAL_SERVER_ERROR)
              .json({ message: "Logout failed" });
          }
          return res
            .status(HTTPSTATUS.OK)
            .json({ message: "Logout successful" });
        });
      } else {
        return res.status(HTTPSTATUS.OK).json({ message: "Logout successful" });
      }
    });
  }
);

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { user } = await getCurrentUserService(userId);
    return res.status(HTTPSTATUS.OK).json({
      message: "User fetch successfully",
      user,
    });
  }
);
