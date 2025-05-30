const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const Scene = require('../models/Scene');


module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const { id, displayName, emails } = profile;
        let user = await User.findOne({ googleId: id });

        if (!user) {
          user = new User({
            googleId: id,
            name: displayName,
            email: emails[0].value,
            provider: 'google',
          });
          await user.save();
        }

        done(null, user);
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
  });
};
