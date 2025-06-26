const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

// 1. IMPORT CÁC MODEL CẦN THIẾT
const Member = require("./models/member");
const Team = require("./models/team");
const Player = require("./models/player");
// Thêm Comment model vào vì ta sẽ dùng schema của nó
const Comment = require("./models/comment");

// Kết nối tới MongoDB
const uri = process.env.MONGO_URI;
mongoose
  .connect(uri)
  .then(() => {
    console.log("MONGO CONNECTION OPEN!!!");
  })
  .catch((err) => {
    console.log("OH NO MONGO CONNECTION ERROR!!!!");
    console.log(err);
  });

const seedDB = async () => {
  try {
    console.log("Deleting old data...");
    // Xóa cả các collection cũ
    await Member.deleteMany({});
    await Team.deleteMany({});
    await Player.deleteMany({});
    // Không cần xóa Comment riêng lẻ nếu nó chỉ được nhúng (embedded)
    console.log("Old data deleted!");

    // ==========================================================
    // 2. TẠO DỮ LIỆU CHO MEMBERS (Đã cập nhật theo schema mới)
    // ==========================================================
    const seedMembers = [
      {
        membername: "admin", // Đổi từ membername -> username
        email: "admin@example.com", // Thêm email
        password: "adminpassword",
        name: "Trần Quản Trị",
        YOB: new Date("1999-01-01"), // Đổi từ YOB sang định dạng Date
        isAdmin: true,
      },
      {
        membername: "anhvy", // Đổi từ membername -> username
        email: "anhvy@example.com", // Thêm email
        password: "password123",
        name: "Nguyễn Thị Ánh Vy",
        YOB: new Date("1999-01-01"),
        isAdmin: false,
      },
      {
        membername: "baonam", // Đổi từ membername -> username
        email: "baonam@example.com", // Thêm email
        password: "password456",
        name: "Lê Bảo Nam",
        YOB: new Date("1999-01-01"),
        isAdmin: false,
      },
      {
        membername: "minhtuan", // Đổi từ membername -> username
        email: "minhtuan@example.com", // Thêm email
        password: "password789",
        name: "Phạm Minh Tuấn",
        YOB: new Date("1999-01-01"),
        isAdmin: false,
      },
    ];

    const membersWithHashedPasswords = await Promise.all(
      seedMembers.map(async (member) => {
        const hashedPassword = await bcrypt.hash(member.password, 12);
        return { ...member, password: hashedPassword };
      })
    );
    const createdMembers = await Member.insertMany(membersWithHashedPasswords);
    console.log(`${createdMembers.length} members created.`);

    // ==========================================================
    // 3. TẠO DỮ LIỆU CHO TEAMS (Giữ nguyên)
    // ==========================================================
    const seedTeams = [
      { teamName: "Manchester United" },
      { teamName: "Paris Saint-Germain" },
      { teamName: "Al-Nassr" },
      { teamName: "Inter Miami CF" },
    ];
    const createdTeams = await Team.insertMany(seedTeams);
    console.log(`${createdTeams.length} teams created.`);

    // ==========================================================
    // 4. TẠO DỮ LIỆU CHO PLAYERS (Đã thêm Comments)
    // ==========================================================
    const seedPlayers = [
      {
        playerName: "Lionel Messi",
        image:
          "https://b.fssta.com/uploads/application/soccer/headshots/885.png",
        cost: 150,
        isCaptain: true,
        information:
          "An Argentine professional footballer who plays as a forward for and captains both Major League Soccer club Inter Miami and the Argentina national team.",
        team: createdTeams.find((t) => t.teamName === "Inter Miami CF")._id,
        comments: [
          {
            rating: 3,
            content: "Cầu thủ vĩ đại nhất mọi thời đại!",
            author: createdMembers[1]._id, // ID của anhvy
          },
          {
            rating: 2,
            content: "Phong độ vẫn đỉnh cao dù đã lớn tuổi.",
            author: createdMembers[2]._id, // ID của baonam
          },
        ],
      },
      {
        playerName: "Cristiano Ronaldo",
        image:
          "https://b.fssta.com/uploads/application/soccer/headshots/711.png",
        cost: 140,
        isCaptain: false,
        information:
          "A Portuguese professional footballer who plays as a forward for and captains both Saudi Pro League club Al-Nassr and the Portugal national team.",
        team: createdTeams.find((t) => t.teamName === "Al-Nassr")._id,
        comments: [
          {
            rating: 3,
            content: "Một cỗ máy săn bàn thực thụ.",
            author: createdMembers[3]._id, // ID của minhtuan
          },
        ],
      },
      {
        playerName: "Neymar Jr",
        image:
          "https://b.fssta.com/uploads/application/soccer/headshots/2138.png",
        cost: 120,
        isCaptain: false,
        information:
          "A Brazilian professional footballer who plays as a forward for Saudi Pro League club Al-Hilal and the Brazil national team.",
        team: createdTeams.find((t) => t.teamName === "Paris Saint-Germain")
          ._id,
        comments: [
          // Thêm mảng rỗng nếu không có comment
        ],
      },
      {
        playerName: "Marcus Rashford",
        image:
          "https://b.fssta.com/uploads/application/soccer/headshots/25333.png",
        cost: 110,
        isCaptain: false,
        information:
          "An English professional footballer who plays as a forward for Premier League club Manchester United and the England national team.",
        team: createdTeams.find((t) => t.teamName === "Manchester United")._id,
        comments: [
          {
            rating: 1,
            content: "Cần cải thiện sự ổn định.",
            author: createdMembers[1]._id, // ID của anhvy
          },
        ],
      },
    ];

    const createdPlayers = await Player.insertMany(seedPlayers);
    console.log(`${createdPlayers.length} players created.`);

    console.log("----------------------");
    console.log("DATABASE SEEDING COMPLETE!");
    console.log("----------------------");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.connection.close();
    console.log("MONGO CONNECTION CLOSED.");
  }
};

seedDB();
