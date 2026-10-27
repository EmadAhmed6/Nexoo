import "dotenv/config";
import passportGoogle, {
  type Profile as GoogleProfile,
} from "passport-google-oauth20";
import passport from "passport";
import { User } from "../modules/Users/user.model.js";
import bcrypt from "bcrypt";

const GoogleStrategy = passportGoogle.Strategy;

const clientID = process.env.GOOGLE_CLIENT_ID || "";
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
const callbackURL = `${process.env.BACKEND_URL || "http://localhost:5000"}/auth/google/callback`;

if (clientID && clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: GoogleProfile,
        done: (error: any, user?: any, info?: any) => void,
      ) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase()?.trim();
          if (!email) {
            return done(new Error("No email found from Google account"), false);
          }
          const googlePhoto = profile.photos?.[0]?.value ?? "";
          let user = await User.findOne({ email });
          if (user) {
            if ((!user.profilePicture?.url || user.profilePicture.url === "") && googlePhoto) {
              user.profilePicture = { url: googlePhoto, publicId: "" };
              await user.save({ validateBeforeSave: false });
            }
          } else {
            const hashedPassword = await bcrypt.hash(
              Math.random().toString(36).slice(-10),
              10,
            );
            let baseUsername =
              (email.split("@")[0] || profile.displayName || "user")
                .toLowerCase()
                .replace(/[^a-zA-Z0-9_]/g, "") || `user_${Date.now()}`;

            let username = baseUsername;
            if (await User.findOne({ username })) {
              username = `${username}_${Math.floor(Math.random() * 1000)}`;
            }
            user = await User.create({
              fullName: profile.displayName || "Google User",
              username,
              email,
              password: hashedPassword,
              provider: "google",
              isVerified: true,
              profilePicture: {
                url: googlePhoto,
                publicId: "",
              },
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}

export default passport;
