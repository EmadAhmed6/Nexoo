import passport from "passport";
import { Strategy as GoogleStrategy, } from "passport-google-oauth20";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { User } from "../modules/Users/user.model.js";
const clientID = process.env.GOOGLE_CLIENT_ID || "";
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
const callbackURL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback";
passport.use(new GoogleStrategy({
    clientID,
    clientSecret,
    callbackURL,
}, async (_accessToken, _refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value?.toLowerCase().trim();
        if (!email) {
            return done(new Error("No email associated with Google account"));
        }
        // 1. Check if user already exists
        let user = await User.findOne({ email }).select("+refreshToken");
        if (user) {
            // Verify ban status
            if (user.isBanned) {
                if (user.banExpires && user.banExpires < new Date()) {
                    user.isBanned = false;
                    user.banExpires = undefined;
                    await user.save();
                }
                else {
                    return done(new Error("Your account has been banned"));
                }
            }
            // Pre-verify email since it's confirmed by Google OAuth
            let needsUpdate = false;
            if (!user.isVerified) {
                user.isVerified = true;
                needsUpdate = true;
            }
            // Sync profile picture if missing
            const photoUrl = profile.photos?.[0]?.value;
            if (photoUrl && (!user.profilePicture || !user.profilePicture.url)) {
                user.profilePicture = {
                    url: photoUrl,
                    publicId: "",
                };
                needsUpdate = true;
            }
            if (needsUpdate) {
                await user.save();
            }
            return done(null, user);
        }
        // 2. Generate a valid, collision-resistant username
        const sanitizedDisplayName = (profile.displayName || "")
            .replace(/[^a-zA-Z0-9_]/g, "")
            .trim();
        const emailPrefix = (email.split("@")[0] || "user")
            .replace(/[^a-zA-Z0-9_]/g, "")
            .trim();
        const baseUsername = (sanitizedDisplayName || emailPrefix || "user").slice(0, 20);
        let username = baseUsername.length >= 3 ? baseUsername : `${baseUsername}_nex`;
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            username = `${username.slice(0, 15)}_${crypto.randomBytes(3).toString("hex")}`;
        }
        // 3. Generate a secure random placeholder password
        const randomPassword = crypto.randomBytes(32).toString("hex");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);
        // 4. Construct full name (schema requires min 4 characters)
        const displayName = profile.displayName?.trim();
        const nameFromParts = `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim();
        let fullName = displayName || nameFromParts || username;
        if (fullName.length < 4) {
            fullName = `${fullName} User`;
        }
        const photoUrl = profile.photos?.[0]?.value || "";
        // 5. Create new Google-authenticated user
        user = new User({
            username,
            fullName: fullName.slice(0, 100),
            email,
            password: hashedPassword,
            provider: "google",
            isVerified: true,
            isActive: true,
            role: "User",
            profilePicture: {
                url: photoUrl,
                publicId: "",
            },
        });
        await user.save();
        return done(null, user);
    }
    catch (err) {
        return done(err);
    }
}));
export default passport;
//# sourceMappingURL=passport.js.map