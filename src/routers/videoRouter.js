import express from "express";
import { watch ,getEdit, postEdit, getUpload, postUpload, deleteVideo, } from "../controllers/videoController";
import {protectorMiddleware, videoUpload} from "../middleware";

const videoRouter = express.Router();

//videoRouter.route("/upload").get(getUpload).post(postUpload); 맨위에 /upload가 없다면 express는 /upload를 id로 착각
videoRouter.route("/:id([0-9a-f]{24})").get(watch);
videoRouter.route("/:id([0-9a-f]{24})/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
videoRouter.route("/:id([0-9a-f]{24})/delete").all(protectorMiddleware).get(deleteVideo);
videoRouter.route("/upload").all(protectorMiddleware).get(getUpload).post(videoUpload.fields([{ name: "video" }, { name: "thumb" }]), postUpload);
// : -> parameter: url안에 변수를 포함시킬 수 있게 해줌    (/:id, /:potato 등 이름은 자유)
export default videoRouter;