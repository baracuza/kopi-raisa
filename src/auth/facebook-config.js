const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
const prisma = require('../db');
const dotenv = require('dotenv');

dotenv.config();

// Untuk POST /facebook/link (via token)
passport.use('facebook-token',new FacebookTokenStrategy({
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


// passport.use('facebook-link', new FacebookStrategy({
//     clientID: process.env.FB_CLIENT_ID,
//     clientSecret: process.env.FB_CLIENT_SECRET,
//     callbackURL: process.env.FB_CALLBACK_URL,
//     profileFields: ['id', 'displayName', 'photos', 'email'],
//     enableProof: false
// }, async (accessToken, refreshToken, profile, done) => {
//     try {
//         console.log('FB Profile:', profile);
//         profile.accessToken = accessToken;

//         // Di sini hanya kirim ke route, data disimpan di sana
//         return done(null, profile);
//     } catch (error) {
//         done(error, null);
//     }
// }));


passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((obj, done) => {
    done(null, obj);
});