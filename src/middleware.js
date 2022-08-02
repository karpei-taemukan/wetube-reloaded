import multer from "multer";
export const localsMiddleware = (req, res, next) => {
    //console.log(req.session); <-- session{cookie:{~~}loggedIn: true, user:{_id:~,name:~,username:~, email:~, password:~, location: ~} }
    // localsMiddleware가 session middlesware 다음에 오기 때문에 session 접근가능 
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "Wetube";
    res.locals.loggedInUser = req.session.user || {}; // loggedInUser는  req.session.user인데 이게 undefined 일 수 있다
    //console.log(res.locals);
    //console.log(req.session.user);
    res.locals.file = req.file;
    next();
}

export const protectorMiddleware = (req, res, next) => { // login 돼야 실행 허용
 if(req.session.loggedIn){
     next();
 }
 else{
     req.flash("error", "Login first");
     // 메세지를 한번 보여지고 나면 express가 메세지를 cache에서 삭제
     return res.redirect("/login");
 }
};

export const publicOnlyMiddleware = (req, res, next) => { // logout 돼야 실행 허용
if (!req.session.loggedIn){
    return next();
}
else{
    req.flash("error", "Not authorized");
    return res.redirect("/");
}
};

export const avatarUpload = multer({
    dest:"uploads/avatars/",
    limits:{
    fileSize: 3000000,
},  });
export const videoUpload = multer({
    dest:"uploads/videos/",
    limits:{
    fileSize:10000000,
}, });