const { body, validationResult } = require("express-validator");
const Member = require("../models/member");
const jwt = require("jsonwebtoken");
const registerRules = () => {
  return [
    body("membername")
      .trim()
      .notEmpty()
      .withMessage("Membername is required")
      .isLength({ min: 10 })
      .withMessage("Membername must be at least 10 characters"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 10 })
      .withMessage("Password must be at least 10 characters"),
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 10 })
      .withMessage("Name must be at least 10 characters "),
    body("YOB")
      .notEmpty()
      .withMessage("Year of birth is required")
      .isISO8601()
      .withMessage("YOB must be a valid date in YYYY-MM-DD format")
      .toDate(),
  ];
};
const loginRules = () => {
  return [
    body("membername").trim().notEmpty().withMessage("Membername is required"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ];
};
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(422).json({ errors: extractedErrors });
};
const protectedRoute = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      req.member = await Member.findById(decoded.id).select("-password");

      if (!req.member) {
        return res.status(401).json({ message: "Member not found" });
      }

      return next(); // Quan trọng: gọi next khi tất cả hợp lệ
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // Nếu không có header hoặc không đúng định dạng Bearer
  return res.status(401).json({ message: "Not authorized, no token" });
};

const isAdmin = async (req, res, next) => {
  if (req.member && req.member.isAdmin) {
    next();
  } else {
    return res.status(403).json({
      message: "Forbidden: You do not have permission to perform this action.",
    });
  }
};

// Bạn PHẢI dùng cùng một chuỗi bí mật đã dùng để tạo token lúc đăng nhập
const JWT_SECRET = process.env.JWT_SECRET || "your-very-strong-secret-key";

const verifyToken = (req, res, next) => {
  // Lấy token từ header, thường có dạng "Bearer <token>"
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    // Nếu không có header, trả về lỗi 403 (Forbidden) hoặc redirect tới trang đăng nhập
    return res
      .status(403)
      .render("error", { message: "Yêu cầu cần có token để xác thực." });
  }

  // Tách chữ 'Bearer ' để lấy phần token
  const token = authHeader.split(" ")[1];

  if (!token) {
    // Nếu có header nhưng không có token
    return res
      .status(403)
      .render("error", { message: "Định dạng token không hợp lệ." });
  }

  try {
    // Giải mã token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Lưu thông tin đã giải mã (payload chứa membername, id, v.v.) vào đối tượng req
    // để các route handler sau có thể sử dụng
    req.member = decoded; // Ở đây `decoded` sẽ là object bạn đã dùng để tạo token, ví dụ: { id: '...', membername: '...' }
  } catch (err) {
    // Nếu token không hợp lệ (hết hạn, sai chữ ký)
    console.error("Token không hợp lệ:", err.message);
    // Có thể render trang lỗi hoặc redirect về trang đăng nhập
    return res.status(401).render("login", {
      error: "Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
    });
  }

  // Nếu mọi thứ ổn, cho phép request đi tiếp
  return next();
};

const protectedRoutePage = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      req.member = await Member.findById(decoded.id).select("-password");

      if (!req.member) {
        return res.status(401).json({ message: "Member not found" });
      }

      return next(); // Quan trọng: gọi next khi tất cả hợp lệ
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // Nếu không có header hoặc không đúng định dạng Bearer
  return (res.redirect = "/login");
};

module.exports = verifyToken;
module.exports = {
  validate,
  verifyToken,
  loginRules,
  registerRules,
  protectedRoute,
  isAdmin,
  protectedRoutePage,
};
