import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import apiRouter from "./routers/apiRouter";
import { localsMiddleware } from "./middleware";
//console.log(process.env.COOKIE_SECRET, process.env.DB_URL);
const app = express();

//console.log(process.cwd());
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + '/src/views');
app.use(logger);
app.use(express.urlencoded({extended:true}));
//app.use(express.text());
app.use(express.json()); // 브라우저나 서버가 바꾼 string을 JS object로 되돌림

app.use(
    session({
    secret: process.env.COOKIE_SECRET, // secret은 유저가 쿠키에 sign할때 사용하는 String(쿠키에 sign하는 이유는 백엔드가 쿠키를 줬다는 걸 표시)
    //Domain은 쿠키를 만든 백엔드가 누구인지 알려줌 즉, 도메인은 쿠키가 어디에서 왔는지, 어디로 가야하는 지 알려줌 
    resave: false,
    saveUninitialized: false, // false로 설정하면 세션을 수정할때만 세션을 DB에 저장하고 쿠키 넘겨줌 (초기화가 될 때만 저장, 즉 백엔드가 로그인한 유저에게만 쿠키를 주도록 설정)
    /*cookie:{
      maxAge:3000,   
    },*/
    store: MongoStore.create({mongoUrl:process.env.DB_URL}),
}))
/*app.use((req, res, next) => {
   // res.locals.sexy = "you"; // template(모든 pug 파일)와 data를 공유(middleware를 router에 적용 했을때 한해서)
    // locals object는 이미 모든 pug template에 import된 object이다 
    req.sessionStore.all((error, sessions) //벡엔드가 기억하고 있는 모든 사람 보기  => {
        console.log(sessions);
        next();
    });
    //console.log(req.headers);
});*/

/*app.get("/add-one", (req,res,next) => {
    req.session.potato += 1;
    return res.send(`${req.session.id}\n${req.session.potato}`);
});*/
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    next();
});
app.use(flash()); // flash()가 session에 연결해서 사용자에게 메세지를 남김 // flash()미들웨어를 설치한 순간부터 req.flash함수 사용가능 
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads")); //express.static은 express한테 
app.use("/static", express.static("assets"));//사람들이 이 폴더 안에 있는 파일들을 볼 수 있게 해달라고 요청
app.use("/",rootRouter);
app.use("/users",userRouter);
app.use("/videos",videoRouter);
app.use("/api",apiRouter);
export default app;


 // app.use()는 global middleware를 만들수있게해줌(어느 URL에도 작동하는 middleware) -->작성 순서에 따라 미들웨어의 실행결과에 영향을 준다  
 // app.get()은 누군가가 어떤 route로 get request를 보낸다면 반응하느 콜백함수를 실행