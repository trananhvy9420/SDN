// routes/authRoute.js - PHIÊN BẢN SỬA LỖI

const express = require("express");
const authRoute = express.Router();
const authController = require("../controllers/auth.controller");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const {
  registerRules,
  validate,
  loginRules,
} = require("../middlewares/validation.middleware");

//--- HÀM TẠO TOKEN ---
const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

//--- CÁC ROUTE ĐĂNG NHẬP/ĐĂNG KÝ THÔNG THƯỜNG (GIỮ NGUYÊN) ---
authRoute.route("/").post(loginRules(), validate, authController.signIn);
authRoute
  .route("/register")
  .post(registerRules(), validate, authController.signUp);

//--- CÁC ROUTE MỚI CHO GOOGLE OAUTH ---
authRoute.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

authRoute.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/auth?form=login",
    session: false,
  }),
  (req, res) => {
    if (!req.user) {
      return res.redirect("/auth?error=authentication_failed");
    }
    const payload = {
      id: req.user._id,
      membername: req.user.membername,
      isAdmin: req.user.isAdmin,
    };
    const { accessToken, refreshToken } = generateTokens(payload);

    // DÒNG THAY ĐỔI DUY NHẤT LÀ ĐÂY
    // Chuyển hướng về trang /auth thay vì /
    res.redirect(
      `/auth?access_token=${accessToken}&refresh_token=${refreshToken}&isAdmin=${payload.isAdmin}`
    );
  }
);

//--- ROUTE ĐỂ ĐĂNG XUẤT (GIỮ NGUYÊN) ---
authRoute.get("/logout", (req, res, next) => {
  res.status(200).send("Logout successful");
});

module.exports = authRoute;
