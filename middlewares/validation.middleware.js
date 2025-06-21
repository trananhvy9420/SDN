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
const protect = async (req, res, next) => {
  let token;

  // 1. Đọc token từ header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // 2. Xác thực token
      // Sửa lại trong middleware `protect`
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Phải khớp với key lúc sign
      // 3. Lấy _id từ payload và tìm user, sau đó gắn vào req
      // `-password` để loại bỏ trường password khỏi kết quả trả về
      req.member = await Member.findById(decoded.id).select("-password");

      if (!req.member) {
        return res.status(401).json({ message: "Member not found" });
      }

      // Nếu mọi thứ hợp lệ, cho phép request đi tiếp đến controller
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};
module.exports = {
  validate,
  loginRules,
  registerRules,
  protect,
};
