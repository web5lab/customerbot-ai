import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.schema.js';
import Platform from '../models/Platform.schema.js';
import { createOrUpdateSubscription } from '../services/subscriptionService.js';
import mongoose from 'mongoose';
import { recoverTypedSignature, SignTypedDataVersion } from '@metamask/eth-sig-util'

// Simple random word generator
const getRandomWord = () => {
    const words = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Gamma', 'Helix', 'Nimbus', 'Orion'];
    return words[Math.floor(Math.random() * words.length)];
};

export const gmailLogin = async (req, res) => {
    const { email, password, name } = req.body; // 'name' is optional

    try {
        // Check if user exists
        let user = await User.findOne({ email, provider: 'email' });

        let platform;

        if (!user) {
            // If user not found, register them
            if (!password) {
                return res.status(400).json({ message: 'Password is required for registration' });
            }

            // Generate random name if not provided
            const randomName = name || `${getRandomWord()}_${Math.floor(Math.random() * 1000)}`;

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new user
            user = new User({
                email,
                name: randomName,
                password: hashedPassword,
                provider: 'email',
                lastLogin: new Date()
            });
            await user.save();

            // Create Platform with 100 credits
            platform = new Platform({
                userId: user._id,
                name: `${randomName}'s Platform`,
                trainingData: '',
                remainingCredits: 100,
                icon: '' // Set default or allow frontend to upload
            });
            await platform.save();

            // Create default free subscription
            await createOrUpdateSubscription(user._id, 'free');
        } else {
            // If user exists, verify password
            const isMatch = bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            console.log(user._id);
            platform = await Platform.find({ userId: new mongoose.Types.ObjectId(user._id) });
            // Update last login
            console.log("platform =>", platform);
            user.lastLogin = new Date();
            await user.save();
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({ token, user, platform });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const metamaskLogin = async (req, res) => {
    const { address, message, signature } = req.body;
    console.log("🔹 MetaMask Auth Request Received");

    if (!address || !message || !signature) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        // ✅ Verify EIP-712 Signature
        const recoveredAddress = recoverTypedSignature({
            data: message,  // message should be structured EIP-712 data
            signature,
            version: SignTypedDataVersion.V4
        });

        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            return res.status(400).json({ message: 'Invalid signature' });
        }

        // 🔍 Check if user exists
        let user = await User.findOne({ address }).lean();

        let platform;
        if (!user) {
            // 🆕 Register new user
            const randomName = `User_${Math.floor(Math.random() * 100000)}`;

            user = new User({
                address,
                name: randomName,
                provider: 'metamask',
                lastLogin: new Date(),
            });
            await user.save();

            // 🛠️ Create a default platform for the user
            platform = new Platform({
                userId: user._id,
                name: `${randomName}'s Platform`,
                trainingData: '',
                remainingCredits: 100,
                icon: '',
            });
            await platform.save();

            // Create default free subscription
            await createOrUpdateSubscription(user._id, 'free');
        } else {
            // ⏳ Fetch existing platforms
            platform = await Platform.find({ userId: new mongoose.Types.ObjectId(user._id) });

            // ⏳ Update last login
            await User.updateOne({ _id: user._id }, { lastLogin: new Date() });
        }

        // 🔑 Generate JWT token
        const tokenPayload = { id: user._id, address: user.address };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

        // ✅ Respond with user data & token
        res.status(200).json({ token, user, platform });

    } catch (error) {
        console.error("⚠️ MetaMask Login Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const otpCode = generateOTP();

        // Save OTP to the database
        const otpEntry = await OtpStore.findOneAndUpdate(
            { email },
            { code: otpCode, expiresAt: Date.now() + 10 * 60 * 1000 },
            { upsert: true, new: true }
        );

        // Configure NodeMailer transporter
        const transporter = nodemailer.createTransport({
            host: "smtp.hostinger.com",
            port: 465,
            secure: true,
            auth: {
                user: "",
                pass: "",
            },

        });

        // Mail options
        const mailOptions = {
            from: 'hello@buildonbolt.com', // Sender address
            to: email, // Recipient email
            subject: '🚀 Build and Share Your Bolt.new Project!', // Subject line
            text: `Quickly build your next project with Bolt.new using pre-configured starter templates, and share your creations effortlessly. Your OTP code is ${otpCode}. It is valid for 10 minutes.`, // Plain text body
            html: `
            <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); border: 1px solid #e6e6e6;">
                <!-- Header -->
                <header style="background: linear-gradient(90deg, #007BFF, #6EB7FF); padding: 20px; text-align: center; color: #ffffff;">
                    <h1 style="font-size: 28px; margin: 0;">✨ BuildOnBolt</h1>
                    <p style="font-size: 16px; margin: 5px 0;">Empowering Innovation with Bolt.new</p>
                </header>
                
                <!-- Body -->
                <main style="background-color: #ffffff; padding: 20px 30px; text-align: center; color: #333333;">
                    <h2 style="font-size: 22px; margin-bottom: 15px;">Explore & Share Your Next Project</h2>
                    <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                        Quickly build your next project with <strong>Bolt.new</strong> using our pre-configured starter templates. Create and share your innovative ideas effortlessly!
                    </p>
                    
                    <!-- OTP Section -->
                    <div style="margin: 30px auto; padding: 20px; background-color: #F0F8FF; border: 2px solid #007BFF; border-radius: 8px; width: fit-content; text-align: center;">
                        <p style="font-size: 18px; color: #007BFF; font-weight: bold; margin: 0;">Your OTP Code</p>
                        <p style="font-size: 36px; font-weight: bold; color: #333333; margin: 10px 0;">${otpCode}</p>
                        <p style="font-size: 14px; color: #666666; margin: 0;">This code is valid for 10 minutes.</p>
                    </div>
                    
                    <!-- Call to Action -->
                    <a href="https://buildonbolt.com" style="display: inline-block; margin-top: 20px; padding: 12px 24px; font-size: 16px; font-weight: bold; text-decoration: none; color: #ffffff; background-color: #007BFF; border-radius: 6px;">
                        Explore Templates
                    </a>
                </main>
                
                <!-- Footer -->
                <footer style="background-color: #F9FAFC; text-align: center; padding: 15px 30px; font-size: 14px; color: #888888;">
                    <p style="margin: 0;">Need help? <a href="mailto:support@buildonbolt.com" style="color: #007BFF; text-decoration: none;">Contact Support</a></p>
                    <p style="margin: 5px 0;">© ${new Date().getFullYear()} BuildOnBolt. All rights reserved.</p>
                    <a href="https://buildonbolt.com" style="text-decoration: none; color: #007BFF;">Visit our website</a>
                </footer>
            </div>
        ` // HTML body
        };


        // Send mail
        await transporter.sendMail(mailOptions);

        console.log('Development OTP:', otpEntry.code); // Log OTP for development/testing
        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP. Please try again later.' });
    }
};

export const getUserData = async (req, res) => {
    try {
        const id = req.user.userId;
        const user = await User.findOne({ _id:new mongoose.Types.ObjectId(id)});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const platform = await Platform.find({ userId: new mongoose.Types.ObjectId(id) });
        res.status(200).json({ user, platform });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}