import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { getUserData, gmailLogin, metamaskLogin } from '../controller/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Google Auth Routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google Auth Routes
router.post('/gmail-login',
  gmailLogin
);

router.post('/metamask',
  metamaskLogin
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.redirect(`${process.env.VITE_WEB_URL}/auth-success?token=${token}`);
  }
);

// GitHub Auth Routes
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.redirect(`${process.env.VITE_WEB_URL}/auth-success?token=${token}`);
  }
);

// Logout Route
router.get('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Logged out successfully' });
});

router.get('/user-data', authenticateToken, getUserData);

export default router;
