//mongoose에게 우리 애플리케이션 데이터들이 어떻게 생겼는지 알려줘야함
//예를 들면 Video에는 제목이 있고 그건 문자형이다 라는 식
import mongoose from "mongoose";

//model 형태 정의
const videoSchema = new mongoose.Schema({
title: {type: String, required: true, trim: true, maxLength:80},
fileUrl: {type: String, required: true},
thumbUrl: {type: String, required: true},
description: {type: String, required: true, trim: true, minLength:2},
createdAt: {type:Date, required: true, default: Date.now},
hashtags: [{type: String, trim: true}],
meta: {
    views:{type: Number, default: 0, required: true},
    rating: {type: Number, default: 0, required: true},
}, 
comments:[{type: mongoose.Schema.Types.ObjectId, required: true, ref: "Comment"}],
owner: {type: mongoose.Schema.Types.ObjectId, required: true, ref: "User"},
//video와 user를 연결하려면 id를 이용한다 이유는 id는 하나밖에 없는 랜덤 숫자이다
});

//middle ware는 무조건 model이 생성되기전에 만들어야함 
/*videoSchema.pre("save", async function(){
    this.hashtags = this.hashtags[0]
    .split(",")
    .map(word=>word.startsWith("#")?word:`#${word}`);
});*/

videoSchema.static("formatHashtags", function(hashtags){
    return hashtags.split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
})

const Video = mongoose.model("Video", videoSchema);
export default Video;