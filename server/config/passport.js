import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.schema.js';
import passport from 'passport';
import dotenv from 'dotenv';
import PlatformSchema from '../models/Platform.schema.js';
dotenv.config();
const CALLBACK_BASE = process.env.SERVER_URL;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${CALLBACK_BASE}/auth/google/callback`,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails[0].value });

      if (!user) {
        user = await User.create({
          email: profile.emails[0].value,
          name: profile.displayName,
          profilePicture: profile.photos[0].value,
          provider: 'google',
          providerId: profile.id,
        });
        let platform = await PlatformSchema.create({
          name: profile.displayName,
          userId: user._id,
          remainingCredits: 100,
          platformId: profile.id,
        });
        platform.save();
      }

      user.lastLogin = new Date();
      await user.save();
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
));

passport.use(new GitHubStrategy(
  {
    clientID: process.env.GITAUTH_CLIENT_ID,
    clientSecret: process.env.GITAUTH_CLIENT_SECRET,
    callbackURL: `${CALLBACK_BASE}/auth/github/callback`,
    scope: ['user:email'],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {


      // Get primary email from GitHub profile
      const email =
        profile.emails && profile.emails.length > 0
          ? profile.emails[0].value
          : `${profile.username}@github.com`;

      let user = await User.findOne({ email: email });

      if (!user) {
        user = await User.create({
          email: email,
          name: profile.displayName || profile.username,
          profilePicture: profile._json.avatar_url,
          provider: 'github',
          providerId: profile.id,
        });
        let platform = await PlatformSchema.create({
          name: profile.displayName || profile.username,
          userId: user._id,
          remainingCredits: 100,
          platformId: profile.id,
        });
        platform.save();
      }


      user.lastLogin = new Date();
      await user.save();
      done(null, user);
    } catch (error) {
      done(error);
    }
  }
));

export default passport;