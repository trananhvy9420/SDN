var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const authRouter = require("./routes/authRoute");
const memberRouter = require("./routes/memberRoute");
const playerRouter = require("./routes/playerRoute");
const teamRouter = require("./routes/teamRoute");
const commentRouter = require("./routes/commentRoute");
const mongoose = require("mongoose");
const Member = require("./models/member");
const Player = require("./models/player");
const Team = require("./models/team");
const Comment = require("./models/comment");
const connect = require("./db/connect");
const session = require("express-session");
const passport = require("passport");
require("./config/passport-setup");
const port = process.env.PORT || 3000;
// CÁCH VIẾT ĐÚNG: Dấu ngoặc nhọn sẽ chỉ "bóc" lấy đúng hàm có tên là protectedRoute ra khỏi file
const {
  protectedRoute,
  protectedRoutePage,
  isAdmin,
  isAdminPage,
} = require("./middlewares/validation.middleware");
connect.then((db) => {
  console.log("Connected to DB successfully!");
  console.log("PORT" + port);
});

var app = express();
app.use(express.static(path.join(__dirname, "public")));
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Chỉ lưu session khi có thay đổi
    cookie: { secure: false }, // Đặt là true nếu dùng HTTPS
  })
);

// Khởi tạo Passport
app.use(passport.initialize());
app.use(passport.session());
app.get("/auth", (req, res) => {
  res.render("auth", { title: "Trang Đăng Nhập" });
});
// Route này chỉ cần render trang, JavaScript sẽ tự lấy dữ liệu
app.get("/user", async (req, res, next) => {
  res.render("user", {
    title: "Danh sách cầu thủ",
    // Không cần truyền players hay pagination ở đây nữa
  });
});

app.get("/profile", (req, res) => {
  res.render("profile", {
    title: "Trang cá nhân",
    isLoggedIn: true,
    member: {},
  });
});
app.get("/profileAdmin", (req, res) => {
  res.render("profileAdmin", {
    title: "Trang cá nhân của admin",
    isLoggedIn: true,
    member: {},
  });
});
app.get("/admin", (req, res, next) => {
  res.render("admin", {
    title: "Trang admin",
  });
});
app.get("/players", (req, res) => {
  res.render("players", {
    title: "Danh sách cầu thủ",
    isLoggedIn: true,
  });
});
app.get("/auth", (req, res) => {
  res.render("auth"); // Tên file là 'auth.ejs'
});
app.get("/register", (req, res) => {
  res.render("register", {
    title: "Đăng ký",
  });
});
app.get("/", (req, res) => {
  res.redirect("/user");
});
app.get("/profile", (req, res) => {
  res.redirect("/profile");
});
app.get("/profileAdmin", (req, res) => {
  res.redirect("/profileAdmin");
});
app.get("/user", (req, res) => {
  res.redirect("/user");
});
app.get("/admin", (req, res) => {
  res.redirect("/admin");
});
app.get("/players", (req, res) => {
  res.redirect("/players");
});
app.get("/register", (req, res) => {
  res.redirect("/register");
});
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api/auth", authRouter);
app.use("/api/member", memberRouter);
app.use("/api/player", playerRouter);
app.use("/api/team", teamRouter);
app.use("/api/comment", commentRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
module.exports = app;
