// config/passport-setup.js

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const Member = require("../models/member"); // Đảm bảo đường dẫn đúng

// Cấu hình serialize và deserialize user
// Passport sẽ lưu user.id vào session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Khi có request, Passport sẽ lấy id từ session và tìm user trong DB
passport.deserializeUser((id, done) => {
  Member.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      // Các tùy chọn cho Google Strategy
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      scope: [
        "profile",
        "email",
        "https://www.googleapis.com/auth/user.birthday.read",
      ], // Phải khớp với URI trong Google Console
    },
    async (accessToken, refreshToken, profile, done) => {
      // Hàm callback này sẽ chạy sau khi user đăng nhập thành công với Google
      // 'profile' chứa thông tin user từ Google
      console.log("Google profile:", profile);

      try {
        // Tìm xem user đã tồn tại trong DB của bạn chưa
        const existingMember = await Member.findOne({ googleId: profile.id });
        let yearOfBirth = null;
        if (
          profile._json &&
          profile._json.birthdays &&
          profile._json.birthdays.length > 0
        ) {
          // Lấy năm sinh từ phần tử đầu tiên trong mảng birthdays
          yearOfBirth = profile._json.birthdays[0].date.year;
        }
        if (existingMember) {
          // Nếu đã tồn tại, gọi done() với user đó để đăng nhập
          console.log("User already exists:", existingMember);
          return done(null, existingMember);
        }

        // Nếu user chưa tồn tại, tạo một user mới trong DB
        const newMember = new Member({
          googleId: profile.id, // Lưu googleId để tìm kiếm lần sau
          membername: profile.displayName,
          name: profile.displayName, // Lấy tên từ Google
          email: profile.emails[0].value,
          YOB: yearOfBirth, // Lấy email
          // avatar: profile.photos[0].value, // Nếu bạn có trường avatar
          // Các trường khác có thể để mặc định hoặc trống, vì user không đăng ký bằng form
        });

        await newMember.save();
        console.log("Created new user:", newMember);
        done(null, newMember); // Đăng nhập cho user vừa tạo
      } catch (error) {
        console.error("Error in Google Strategy", error);
        done(error, null);
      }
    }
  )
);
