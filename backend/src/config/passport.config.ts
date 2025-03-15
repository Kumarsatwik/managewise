import passport from "passport";
import { Request } from "express";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth2";
import { Strategy as LocalStrategy } from "passport-local";
import { NotFoundException } from "../utils/appError";
import { ProviderEnum } from "../enums/account.provider.enum";
import { loginOrCreateAccountService, verifyUserService } from "../services/auth.service";

interface User {
  id: string;
  email: string;
  displayName: string;
  picture?: string;
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ["profile", "email"],
      passReqToCallback: true,
    },
    async (
      req: Request,
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: VerifyCallback
    ) => {
      try {
        const { email, sub: googleId, picture } = profile._json;
        console.log(googleId, "profile", profile);
        if (!googleId) {
          throw new NotFoundException("Google ID (sub) is missing");
        }
        const { user } = await loginOrCreateAccountService({
          provider: ProviderEnum.GOOGLE,
          providerId: googleId,
          displayName: profile.displayName,
          picture: picture,
          email: email,
        });
        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password", session: true },
    async (email, password, done) => {
      try {
        const user = await verifyUserService({email,password});
        return done(null,user);
        done(null, user);
      } catch (error:any) {
        done(error, false,{message:error?.message});
      }
    }
  )
);

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));
