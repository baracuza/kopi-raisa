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


passport.use('facebook-link', new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'emails', 'picture.type(large)'],
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        // contoh ambil userId dari query (sementara)
        const userId = req.query.userId;

        // atau bisa cari user dari DB berdasarkan facebookId
        const user = {
            id: userId,
            name: profile.displayName,
            accessToken: accessToken
        };

        done(null, user); // penting! supaya req.user bisa terisi
    } catch (error) {
        done(error);
    }
}));



passport.serializeUser((user, done) => {
    done(null, user.id); // hanya simpan user.id ke session
});

passport.deserializeUser((id, done) => {
    // Ambil user dari DB berdasarkan id
    const { findUserByID} = require('../auth/user.repository');
    findUserByID(id)
        .then(user => done(null, user))
        .catch(err => done(err));
});