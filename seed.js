const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Member = require("./models/member"); // <-- SỬA LẠI ĐƯỜNG DẪN TỚI FILE MEMBER MODEL CỦA BẠN
require("dotenv").config();
// THAY THẾ CHUỖI KẾT NỐI NÀY BẰNG CHUỖI KẾT NỐI MONGODB CỦA BẠN
const uri = process.env.MONGO_URI;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MONGO CONNECTION OPEN!!!");
  })
  .catch((err) => {
    console.log("OH NO MONGO CONNECTION ERROR!!!!");
    console.log(err);
  });

// Mảng chứa dữ liệu thô
const seedMembers = [
  {
    membername: "admin",
    password: "adminpassword",
    name: "Trần Quản Trị",
    YOB: 1990,
    isAdmin: true, // Một tài khoản admin
  },
  {
    membername: "anhvy",
    password: "password123",
    name: "Nguyễn Thị Ánh Vy",
    YOB: 2002,
    isAdmin: false,
  },
  {
    membername: "baonam",
    password: "password456",
    name: "Lê Bảo Nam",
    YOB: 1998,
    isAdmin: false,
  },
  {
    membername: "minhtuan",
    password: "password789",
    name: "Phạm Minh Tuấn",
    YOB: 2001,
    isAdmin: false,
  },
];

const seedDB = async () => {
  // Xóa toàn bộ dữ liệu cũ để tránh trùng lặp
  await Member.deleteMany({});
  console.log("Deleted old members.");

  // Lặp qua mảng dữ liệu thô và tạo mới
  for (let member of seedMembers) {
    // Băm mật khẩu với salt round là 12
    const hashedPassword = await bcrypt.hash(member.password, 12);

    const newMember = new Member({
      membername: member.membername,
      password: hashedPassword, // Lưu mật khẩu đã được băm
      name: member.name,
      YOB: member.YOB,
      isAdmin: member.isAdmin,
    });
    await newMember.save();
    console.log(`Created member: ${newMember.membername}`);
  }
};

// Chạy hàm seedDB và đóng kết nối sau khi hoàn tất
seedDB().then(() => {
  console.log("Seeding complete!");
  mongoose.connection.close();
});
