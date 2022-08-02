import Video from "../models/Video";
import Comment from "../models/Comment";
import User from "../models/User";

export const home = async(req, res) => { 
  const videos = await Video.find({}).sort({createdAt:"desc"}).populate("owner");
  return res.render("home", { pageTitle: "Home", videos });
};
  /*   Call back의 코드
  export const home = async(req, res) => { 
         console.log("I start");
    Video.find({}, (error, videos)=>{ // call back은 어떤 동작이 끝나면 특정 function을 부르도록 만들어짐
        if(error){
            return res.render("server-error");
        }
        console.log("I finished");
        console.log("error", error);
        console.log("videos", videos);
        return res.render("home", { pageTitle: "Home", videos:[] });
    }); 
  };
    

   promise의 코드
  export const home = async(req, res) => { 
  try{
    console.log("I start");
    const videos = await Video.find({}); // await는 database에게 결과값을 받을 때까지  JS를 계속 기다린다
    // await는 asynchronous function 안에서 사용 가능
    console.log("I finished");
    console.log(videos);
    console.log("render once");
    return res.render("home", {pageTitle:"Home", videos});
  }
  catch(error){
    return res.render("server-error",{error});
  }
};
 */


export const watch = async(req, res) => {

    const {id} = req.params;
    const video = await Video.findById(id).populate("owner").populate("comments");
    // const video = await Video.exists({_id: id}); 사용 불가
    //object를 edit template에 보내줘야 함
    //console.log(video);
    //const owner = await User.findById(video.owner);
    //console.log(video);
   console.log(video)
    if(!video){
      return res.status(404).render("404", {pageTitle: "Video not found"});
    }
  
    return res.render("watch", {pageTitle: video.title, video/*, owner*/})
  };

export const getEdit = async(req, res) => {
  const {
    user: {_id},
} = req.session;
    const {id} = req.params;
    const video = await Video.findById(id);
    if(!video){
      return res.status(404).render("404", {pageTitle: "Video not found"});
    }
    console.log(typeof video.owner, typeof _id); // 서로 id는 같아도 type이 다름 
    if(String(video.owner) !== String(_id)){
      req.flash("error", "Not authorized");
      return res.status(403).redirect("/");
    }
    return res.render("edit", {pageTitle: video.title, video})
  };


export const postEdit = async(req, res) => {
  const {
    user: {_id},
} = req.session; // 로그인 안한 유저가 URL(http://localhost:4000/videos/62ab4ea0d1975a1c9b15c44a/edit)로 들어올수있는 경우 차단 
    const {id} = req.params;
    //const video = await Video.findById(id);
    const video = await Video.exists({_id: id}); // video object를 다 받는 대신 true, false를 받는다
    const {title, description, hashtags} = req.body;
    if(!video){
      return res.status(404).render("404", {pageTitle: "Video not found"});
    } // pug에서 video를 사용안하기때문에 .exits()을 사용한다 굳이 video객체를 findById()를 통해 전체를 가져올 필요가 없다 
    /*video.title=title;
    video.description = description;
    video.hashtags = hashtags.split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
    await video.save();*/
    if(String(video.owner) !== String(_id)){
      req.flash("error", "Not authorized");
      return res.status(403).redirect("/");
    }
    await Video.findByIdAndUpdate(id, {
      title, 
      description, 
      hashtags:Video.formatHashtags(hashtags),
    });
    req.flash("success","Changes saved");
    return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
return res.render("upload", {pageTitle: "Upload Video"});
};

export const postUpload = async(req, res) => {
  const {user:{_id}} = req.session;
  const { video, thumb }= req.files;
  //console.log(video, thumb );
    const {title, description, hashtags} = req.body;
    //console.log(title, description, hashtags);
    /*const video = new Video({     (object를 database에 저장하는 방식)
      title,
      description,
      hashtags: hashtags.split(",").map((word)=>`#${word}`).
      });// --> JS안에서만 존재
      const dbVideo = await video.save();//(object를 database에 저장하는 방식)
      //|->--> save가 되는 순간 기다려야함 database에 저장되는 시간 필요
      return redirect("/");
*/
    try{
    const newVideo = await Video.create({
      title,
      fileUrl: video[0].path.replaceAll("\\","/"),
      thumbUrl: thumb[0].path.replaceAll("\\","/"),
      owner: _id,
      description,
      hashtags:Video.formatHashtags(hashtags),
    });  
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
   return res.redirect("/");
 
  }catch(error){
    console.log(error)
    return res.status(400).render("upload", {
      pageTitle: "Upload Video", 
      errorMessage: error._message,
  });
  }
};

export const deleteVideo = async(req, res)=>{
  const {id} = req.params;
  const {
    user: {_id},
} = req.session;
const video = await Video.findById(id);
//const video = await Video.findById(id).populate("owner")를 쓰지 않은이유는 
//충분히 Video id로 코딩이 가능하기 때문에 User의 모든걸 로드하는 populate를 쓰지 않아도 된다
if(!video){
  return res.status(404).render("404", {pageTitle: "Video not found"});
}
if(String(video.owner) !== String(_id)){
  req.flash("error", "Not authorized"); //req.flash()을 rendering할때도 쓸 수 있지만 보통 redirect할때 쓴다 
  // flash 미들웨어를 설치하면 messages속성을 만들어줌 
  // locals(loggedIn, siteName, loggedInUesr처럼 템플릿에서 사용할 수 있는 것)
  return res.status(403).redirect("/");
}
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
} 

export const search = async (req, res) => {
  const {keyword} = req.query;
  let videos = [];
  if(keyword){
   videos = await Video.find({
    title: {
      $regex: new RegExp(`${keyword}$`,"i"),
   
    },
  }).populate("owner");
  }
  return res.render("search", {pageTitle:"Search", videos});
}

export const registerView = async (req, res) => {
  const {id} = req.params;
  const video = await Video.findById(id);
  if (!video){
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  return res.status(201).json({ newCommentId: comment._id });
};


export const deleteComment = async (req, res) => {
  const {
    params:{id},
  } = req;

const comment = await Comment.findById(id).populate("owner");
if(!comment){
  return res.sendStatus(404);
}

await Comment.findByIdAndDelete(id);
return res.sendStatus(201);
};