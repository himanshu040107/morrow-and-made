import bycrypt from "bcrypt";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import Blacklist from "../models/blacklist.model.js";

// Register User Controller
const registerUserController = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role = "user" } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (!["user", "seller"].includes(role)) {
      return res.status(400).json({ message: "Choose a valid account type." });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already exists,Please Login" });
    }

    //generate new User
    const newUser = await User.create({
      name,
      email,
      role,
      passwordHash: await bycrypt.hash(password, 10),
    });

    const accessToken = jwt.sign(
      { id: newUser._id },
      config.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign(
      { id: newUser._id },
      config.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" },
    );

    newUser.refreshToken = refreshToken;
    await newUser.save();
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "none", path: "/" });
    res
      .status(201)
      .json({ message: "User registered successfully", data: { accessToken } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Login User Controller
const loginUserController = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found,Please Register" });
  }

  const isPasswordValid = await bycrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid email or Password" });
  }
  const accessToken = jwt.sign({ id: user._id }, config.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: user._id }, config.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  user.refreshToken = refreshToken;
  await user.save();
  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "none", path: "/" });
  res.status(200).json({
    message: "User logged in successfully",
    data: { userId: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
  });
};

// Rotate Refresh Token Controller
const refreshTokenController = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh Token not found, Please Login",
    });
  }

  const user = await User.findOne({ refreshToken });

  if (!user) {
    return res.status(403).json({
      message: "No user exists with this refresh token",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);

    if (user._id.toString() !== decoded.id) {
      return res.status(403).json({
        message: "Invalid Refresh Token",
      });
    }

    const accessToken = jwt.sign({ id: user._id }, config.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });

    const newRefreshToken = jwt.sign(
      { id: user._id },
      config.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" },
    );

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, { httpOnly: true, secure: true, sameSite: "none", path: "/" });

    return res.status(200).json({
      message: "Tokens Rotated Successfully",
      accessToken,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid Refresh Token, Please Login again",
    });
  }
};

// Logout Controller
const logoutController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh Token not found",
      });
    }

    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    // Blacklist access token
    if (accessToken) {
      await Blacklist.create({
        token: accessToken,
      });
    }

    // Invalidate refresh token
    user.refreshToken = null;
    await user.save();

    // Clear refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    return res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    console.log("Logout error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// getMeController
const getMeController = async (req, res) => {
  const { id } = req.user;
  const user = await User.findById(id).select("-passwordHash -refreshToken");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.status(200).json({ message: "User fetched successfully", data: user });
};

export {
  registerUserController,
  loginUserController,
  refreshTokenController,
  logoutController,
  getMeController,
};
