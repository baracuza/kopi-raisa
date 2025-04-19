const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
const prisma = require('../db');
const dotenv = require('dotenv');

dotenv.config();

// Untuk POST /facebook/link (via token)
passport.use('facebook-token', new FacebookTokenStrategy({
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_CLIENT_SECRET,
    callbackURL: process.env.FB_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'photos'],
    enableProof: false
}, async (accessToken, refreshToken, profile, done) => {
    console.log('[passport-facebook-token] Token:', accessToken);
    console.log('[passport-facebook-token] Profile:', profile);
    profile.accessToken = accessToken;
    return done(null, profile);
}));

try {
    const clientID = process.env.FB_CLIENT_ID;
    const clientSecret = process.env.FB_CLIENT_SECRET;
    const callbackURL = process.env.FB_CALLBACK_URL;

    // Cek dulu apakah semua environment variabel sudah ada
    if (!clientID || !clientSecret || !callbackURL) {
        console.warn('[Facebook Auth] CLIENT_ID, CLIENT_SECRET, atau CALLBACK_URL belum di-set. Facebook auth dimatikan.');
        return; // Tidak pasang strategi kalau tidak lengkap
    }

    passport.use('facebook-link', new FacebookStrategy({
        clientID,
        clientSecret,
        callbackURL,
        profileFields: ['id', 'displayName', 'emails', 'picture.type(large)'],
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, profile, done) => {
        try {
            const userId = req.query.userId;
            const user = {
                id: userId,
                name: profile.displayName,
                accessToken: accessToken
            };
            done(null, user);
        } catch (error) {
            done(error);
        }
    }));

    console.log('[Facebook Auth] Strategi berhasil diinisialisasi.');
} catch (err) {
    console.error('[Facebook Auth] Gagal memuat strategi:', err.message);
}

passport.serializeUser((user, done) => {
    done(null, user.id); // hanya simpan user.id ke session
});

passport.deserializeUser((id, done) => {
    // Ambil user dari DB berdasarkan id
    const { findUserByID } = require('../auth/user.repository');
    findUserByID(id)
        .then(user => done(null, user))
        .catch(err => done(err));
});