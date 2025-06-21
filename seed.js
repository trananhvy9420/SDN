const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

// 1. IMPORT TẤT CẢ CÁC MODEL CẦN THIẾT
const Member = require("./models/member");
const Team = require("./models/team");
const Player = require("./models/player");

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
    // XÓA TẤT CẢ DỮ LIỆU CŨ TRONG CÁC COLLECTION
    console.log("Deleting old data...");
    await Member.deleteMany({});
    await Team.deleteMany({});
    await Player.deleteMany({});
    console.log("Old data deleted!");

    // ==========================================================
    // 2. TẠO DỮ LIỆU CHO MEMBERS (USERS)
    // ==========================================================
    const seedMembers = [
      {
        membername: "admin",
        password: "adminpassword",
        name: "Trần Quản Trị",
        YOB: 1990,
        isAdmin: true,
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

    const membersWithHashedPasswords = await Promise.all(
      seedMembers.map(async (member) => {
        const hashedPassword = await bcrypt.hash(member.password, 12);
        return { ...member, password: hashedPassword };
      })
    );

    const createdMembers = await Member.insertMany(membersWithHashedPasswords);
    console.log(`${createdMembers.length} members created.`);

    // ==========================================================
    // 3. TẠO DỮ LIỆU CHO TEAMS
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
    // 4. TẠO DỮ LIỆU CHO PLAYERS VÀ CÁC COMMENTS ĐƯỢC NHÚNG
    // ==========================================================
    const seedPlayers = [
      {
        playerName: "Lionel Messi",
        image: "https://example.com/messi.jpg", // Thay bằng URL ảnh thật
        cost: 150,
        isCaptain: true,
        information:
          "An Argentine professional footballer who plays as a forward for and captains both Major League Soccer club Inter Miami and the Argentina national team.",
        team: createdTeams.find((t) => t.teamName === "Inter Miami CF")._id, // Gán _id của team
        comments: [
          // Mảng các comment được nhúng
          {
            rating: 3, // Rating từ 1-3 theo schema của bạn
            content: "Greatest of all time!",
            author: createdMembers.find((m) => m.membername === "anhvy")._id, // Gán _id của author
          },
          {
            rating: 2,
            content: "Amazing dribbler.",
            author: createdMembers.find((m) => m.membername === "baonam")._id,
          },
        ],
      },
      {
        playerName: "Cristiano Ronaldo",
        image: "https://example.com/ronaldo.jpg",
        cost: 140,
        isCaptain: false,
        information:
          "A Portuguese professional footballer who plays as a forward for and captains both Saudi Pro League club Al-Nassr and the Portugal national team.",
        team: createdTeams.find((t) => t.teamName === "Al-Nassr")._id,
        comments: [
          {
            rating: 3,
            content: "Incredible goal scorer.",
            author: createdMembers.find((m) => m.membername === "minhtuan")._id,
          },
        ],
      },
      {
        playerName: "Neymar Jr",
        image: "https://example.com/neymar.jpg",
        cost: 120,
        isCaptain: false,
        information:
          "A Brazilian professional footballer who plays as a forward for Saudi Pro League club Al-Hilal and the Brazil national team.",
        team: createdTeams.find((t) => t.teamName === "Paris Saint-Germain")
          ._id, // Giả sử vẫn ở PSG cho ví dụ
        comments: [], // Cầu thủ này chưa có comment nào
      },
      {
        playerName: "Marcus Rashford",
        image: "https://example.com/rashford.jpg",
        cost: 110,
        isCaptain: false,
        information:
          "An English professional footballer who plays as a forward for Premier League club Manchester United and the England national team.",
        team: createdTeams.find((t) => t.teamName === "Manchester United")._id,
        comments: [
          {
            rating: 2,
            content: "So fast!",
            author: createdMembers.find((m) => m.membername === "admin")._id,
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
    // Đóng kết nối sau khi hoàn tất
    mongoose.connection.close();
    console.log("MONGO CONNECTION CLOSED.");
  }
};

// Chạy hàm seedDB
seedDB();
