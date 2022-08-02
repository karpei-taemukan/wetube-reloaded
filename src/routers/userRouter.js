import express from "express";
import { getEdit,postEdit,logout,see, startGithubLogin,finishGithubLogin, getChangePassword, postChangePassword } from "../controllers/userController";
import {protectorMiddleware, publicOnlyMiddleware,avatarUpload} from "../middleware";

const userRouter = express.Router();


userRouter.get("/logout", protectorMiddleware, logout);
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(avatarUpload.single("avatar"),postEdit);
// 유저가 /edit로 form을 보내면 avatarUpload.single('avatar') 미들웨어가 사진을 시스템에 저장, req.file 추가하고  postEdit 컨트롤러를 실행시키면 req.file, req.body 사용가능
// .post(postEdit,avatarUpload.single('avatar')) 이었다면 postEdit에서 req.file을 사용할수없다 middleware의 순서는 매우 중요
//all은 get,post, put, delete 등 모든 http method에 적용
userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);

userRouter.get("/:id", see);

export default userRouter;