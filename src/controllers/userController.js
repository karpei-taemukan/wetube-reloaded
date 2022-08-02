import User from "../models/User";
import Video from "../models/Video";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import session from "express-session";
import res from "express/lib/response";


export const getJoin = (req, res) => res.render("join", {pageTitle:"join"});
export const postJoin = async (req, res) => {
    const { email, username,password, password2, name,location} = req.body;
    const pageTitle = "Join";
    if (password !== password2) {
        return res.status(400).render("join", {
          pageTitle,
          errorMessage: "Password confirmation does not match.",
        });
      }
    const exists = await User.exists({$or: [{username},{email}]});
    if(exists){
        return res.status(400).render("join", {pageTitle, errorMessage: "This username/email is already taken"});
    }
    try{
    await User.create({
        email,
        username,
        password,
        name,
        location,
    });
  
    //console.log(req.body);
   return res.redirect("/login");
  }
  catch(error){
    return res.render("join", {pageTitle, errorMessage: "ERROR"})
  }
};
export const getLogin = (req, res) => res.render("login", {pageTitle:"Login"});

export const postLogin = async(req, res) => {
  const {username, password} = req.body;
  const pageTitle = "Login";
  //const exists = await User.exists({$or:[{username}]});
const user = await User.findOne({username, socialOnly: false});
  if (!user){
 return res.status(400).render("login",{pageTitle, errorMessage: "An account with this username does not exists."})
  }
const ok = await bcrypt.compare(password, user.password);
if(!ok){
  return res.status(400).render("login",{pageTitle, errorMessage: "Wrong password"})
}
req.session.loggedIn = true;  // session을 초기화하는 부분
req.session.user = user;      // session을 초기화하는 부분
  return res.redirect("/");
}

export const startGithubLogin = (req, res) => {
const baseUrl = "https://github.com/login/oauth/authorize";
const config = {
client_id: process.env.GH_CLIENT,
allow_signup: false,
scope:"read:user user:email",
};
const params = new URLSearchParams(config).toString();
const finalUrl = `${baseUrl}?${params}`;
return res.redirect(finalUrl);
};

export const finishGithubLogin = async(req, res) => {
   const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
    };
    //console.log(config);
const params = new URLSearchParams(config).toString();
const finalUrl = `${baseUrl}?${params}`;
const tokenRequest = await(await fetch(finalUrl,{
  method:"POST", // fetch로 finalUrl에 POST 요청을 보내고 fetch를 통해 data를 받아오고 그 data에서 json("키-값 쌍"으로 이루어진 데이터 오브젝트를 전달하기 위해 인간이 읽을 수 있는 텍스트를 사용하는 개방형 표준 포맷) 추출
  headers: {
  Accept: "application/json", // json을 return받기위해서 보내야함
},
})).json();

//res.send(JSON.stringify(tokenRequest));

if ("access_token" in tokenRequest){
  //access api
  const apiUrl = "https://api.github.com";
const {access_token} = tokenRequest;
const userData = await(await fetch(`${apiUrl}/user`, {
  headers: {
    Authorization: `token ${access_token}`,  
  }
})).json();
//console.log(userData);


const emailData = await(await fetch(`${apiUrl}/user/emails`, {
  headers: {
    Authorization: `token ${access_token}`,  
  }
})).json();
//console.log(emailData);

const emailObj = emailData.find((email) => email.primary === true && email.verified === true);
if (!emailObj){
  return res.redirect("/login");
}

let user = await User.findOne({email: emailObj.email});
if (!user){
  //create an account
   user = await User.create({
    avatarUrl: userData.avatar_url,
    name: userData.name,
    username: userData.login,
    email: emailObj.email,
    password: "",
    socialOnly: true,
    location: userData.location,
  });
}
  req.session.loggedIn = true; 
  req.session.user = user;
  return res.redirect("/");
}
else {
  return res.redirect("/login");
}
};
export const logout = (req, res) => {
  //req.session.destroy();
  req.session.user = null;
  req.session.loggedIn = false;
  req.flash("info", "See you again");
  return res.redirect("/");
}
export const getEdit = (req, res) => {
return res.render("edit-profile", {pageTitle: "Edit Profile"})
}

export const postEdit = async (req, res) => {

  const {session: {
    user:{ _id, avatarUrl }, 
  },
    body: {
      name, email, username, location
    },
  file,
  } = req;
 //console.log(file);
 const updatedUser = await User.findByIdAndUpdate(_id, {
  avatarUrl: file ? file.path : avatarUrl, 
  name, 
  email,
  username, 
  location,
 },{new: true}); // 만약 {new: true} 없이 쓴다면 updatedUser가 형성이 안된다
 // 기본적으로 findByIdAndUpdate()는 update 되기전의 data를 return해주고,
 // {new: true}를 설정하면 findByIdAndUpdate()가 update된 data를 return 해준다
 req.session.user = updatedUser;
 return res.redirect("/users/edit");
 /*req.session.user = { session을 업데이트하려고 하나 다흔 특성들도 다 업데이트해야됨 (avatar_url 같은 것들)
  ...req.session.user  --> req.session.user안에 있는 내용 전달
  name, 
  email, 
  username, 
  location,
 } --> DB랑 session을 똑같이 유지할수 있는 방법 중 한가지    */
 /*if (req.session.user.email !== updatedUser.email)
 {
  req.session.user = updatedUser;
return res.redirect("/users/edit"); // redirect는  {pageTitle: "Edit Profile", errorMessage: "nothing change"} 같은 걸 보내지 못함 
}
  else{
    return res.status(400).render("edit-profile", {pageTitle: "Edit Profile", errorMessage: "nothing change"});
  }*/
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true){
    req.flash("error", "Can't change password.");
    return res.redirect("/");
  }
return res.render("users/change-password", {pageTitle: "Change Password"});
}
export const postChangePassword = async (req, res) => {
 
  const {session: {
    user:{ _id }, 
  },
    body: {
      oldPassword,
      newPassword,
      newPasswordConfirmaion,
    },
  } = req;
  const user = await User.findById(_id);
  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok){
    return res.status(400).render("users/change-password",
     {pageTitle: "Change Password", 
    errorMessage: "The current password is incorrect",});
  }
 if (newPassword !== newPasswordConfirmaion){
   return res.status(400).render("users/change-password", 
   {pageTitle: "Change Password", 
   errorMessage: "The new password does not match the confirmation",});
 }

 //console.log(user.password)
 user.password = newPassword;
 //console.log(user.password)
 await user.save(); // pre save 작동 (새로운 비밀번호 hash하기 위함) // await를 작성한 이유는 DB에 저장하는데 시간이 걸림
 //console.log(user.password)

  //send notification
  req.flash("info", "Password updated");
  return res.redirect("/users/logout");
}

export const see = async (req, res) => {
    //console.log(req.params);
    // return res.send(`See User # ${req.params.id}`);};

    const {id} = req.params;
    const user = await User.findById(id).populate({
      path: "videos",
      populate: {
        path: "owner",
        model: "User",
      },
    });
   // console.log(user);
    if(!user){
      return res.status(404).render("404", {pageTitle:"User not found."});
    }
   // const videos = await Video.find({owner: user._id});
   
    return res.render("users/profile", {pageTitle: `${user.name}'s Profile`, user/*, videos*/});
// user session에서 id를 가져오지 않을거다 이유는 이 페이지는 누구나한테나 공개가능해야함
  }
