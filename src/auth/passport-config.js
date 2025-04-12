const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const dotenv = require('dotenv');
const prisma = require('../db');
const jwt = require('jsonwebtoken');

dotenv.config();
const JWT_EXPIRES = process.env.JWT_EXPIRES;

// === Google OAuth ===
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { email: profile.emails[0].value }
        });

        if (!user) {
            const newUser = await prisma.user.create({
                data: {
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    image: profile.photos[0].value,
                    google_id: profile.id,
                    verified: true
                }
            });
            return done(null, newUser);
        }

        const token = jwt.sign({ id: user.id, admin: user.admin }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES });

        return done(null, { id: user.id, admin: user.admin, token });
    } catch (error) {
        return done(error, null);
    }
}));