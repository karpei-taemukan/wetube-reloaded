import mongoose from "mongoose";
//console.log(process.env.COOKIE_SECRET, process.env.DB_URL);
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
const handleOpen = ()=> console.log("Connected to DB");
const handleError = (error)=>console.log("DB Error", error);
db.on("error", handleError);
//on은 여러번 계속 발생 가능
db.once("open",handleOpen);
//once는 오로지 한번만 실행
