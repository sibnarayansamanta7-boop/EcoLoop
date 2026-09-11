const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            college
        } = req.body || {};

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const existingUser = await User.findOne({
            email
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            college:
                college?.trim() ||
                "Guru Nanak Institute of Technology"
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                college: user.college
            }
        });
    } catch (error) {
        console.error(
            "Registration error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error during registration"
        });
    }
};

const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required"
            });
        }

        const user = await User.findOne({
            email
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });
        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password"
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                college:
                    user.college ||
                    "Guru Nanak Institute of Technology"
            }
        });
    } catch (error) {
        console.error(
            "Login error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Server error during login"
        });
    }
};

module.exports = {
    register,
    login
};