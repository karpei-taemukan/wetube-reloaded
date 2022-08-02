const video = document.querySelector("video");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");

const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");

const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");

const volumeRange = document.getElementById("volume");

const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const timeline = document.getElementById("timeline");

const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenBtnIcon = fullScreenBtn.querySelector("i");

const textarea = document.querySelector("textarea");

const formatTime = (seconds) => {
 return   new Date(seconds*1000).toISOString().substring(14,19);
}

let volumeValue = 0.5;
let controlsTimeout = null;
let controlsMovementTimeout = null;


const handlePlayClick = (e) => {
    if(video.paused){
        video.play();
    }
    else{
    video.pause();
    }
    playBtnIcon.classList = video.paused ? "fas fa-play":"fas fa-pause";
}

const handlePlayWindow = (e) => {
    /*console.log(e)
    console.log(e.code)
    console.log(e.target)*/
   // e.preventDefault();

    /*for (x=65; x<91; x++){
        let x = [];
     console.log(x);
    }*/
    
    if (e.keyCode === 32 && (e.target === textarea)){
        //console.log(e)
    handlePlayClick();
    }
};

const handleMuteClick  = (e) => {
    if(video.muted){
        video.muted = false; //video.play();처럼 같은 역할이나 함수가 아님
    }
    else{
        video.muted = true;
    }
    muteBtnIcon.classList = video.muted ? "fas fa-volume-mute":"fas fa-volume-up";

    volumeRange.value = video.muted ? 0:volumeValue;
}


const handleVolumeChange = (event) => {
    const {target: {value}} = event;
    //console.log(value)
    if(video.muted){
        video.muted = false;
        //muteBtn.innerText="Mute";
        muteBtnIcon.classList = "fas fa-volume-up";
    }
    if(volumeRange.value === "0"){
        muteBtnIcon.classList = "fas fa-volume-mute";
    }
    if (volumeRange.value !== "0"){
        muteBtnIcon.classList = "fas fa-volume-up";
       }
    volumeValue = value;
    video.volume = value;
}

const handleLoadedMetadata = () => {
totalTime.innerText = formatTime(Math.floor(video.duration));
timeline.max = Math.floor(video.duration);
}

const handleTimeUpdate = () => {
currentTime.innerText = formatTime(Math.floor(video.currentTime));
timeline.value = Math.floor(video.currentTime);
}

const handleTimelineChange = (event) => {
const {
    target: {value},
} = event; 
video.currentTime = value;
//video.currentTime = timeline.value;
}

const handleFullScreen = () => {
   const fullscreen = document.fullscreenElement;
   if(fullscreen){
       document.exitFullscreen();
   fullScreenBtnIcon.classList = "fas fa-expand";
   }
   else{
    videoContainer.requestFullscreen();
    fullScreenBtnIcon.classList = "fas fa-compress";
   }
}

const hideControls = () => videoControls.classList.remove("showing");

const handleMouseMove = () => {
if (controlsTimeout){
clearTimeout(controlsTimeout);
controlsTimeout = null;
}
if(controlsMovementTimeout){
    clearTimeout(controlsMovementTimeout);
    //controlsMovementTimeout = null;
}
videoControls.classList.add("showing");
controlsMovementTimeout=setTimeout(hideControls, 1000);
}
// 마우스가 비디오 영상 안에 있을때는 비디오 컨드롤러들이 유지되야함 즉, showing클래스가 추가되어야함
//=> showing이 삭제된 상태(hideControls)를 setTimeout으로 받은 id로 clearTimeout를 통해 취소한다

//마우스가 비디오 영상 밖에 있을떄는 비디오 컨드롤러들이 없어져야힘 즉, showing클래스가 식제되어야함
//=> 마우스의 움직임이 없다면 showing이 삭제된 상태를 유지한다
const handleMouseLeave = () => {
controlsTimeout = setTimeout(hideControls, 1000);

}
const handleKeyDown = () => {
    if(video.paused){
        video.play();
    }
    else{
    video.pause();
    }
    playBtnIcon.classList = video.paused ? "fas fa-play":"fas fa-pause";
}
//console.log(videoContainer.dataset)
const handleEnded = () => { 
    const {id} = videoContainer.dataset;
    //fetch(`/api/videos/${id}/view`); --> 이렇게하면 fetch는 GET요청을 보냄
    fetch(`/api/videos/${id}/view`,{
        method:"POST",
    });
//handleEnded function은 비디오의 id를 알지 못한다 
//(프론트엔드에서 JS가 알도록) 렌더링하는 pug한테 비디오에 대한 정보를 남겨야한다
// => pug한테 비디오 id정보를 HTML의 어딘가 저장하라고 알려줘야함 

//영상 조회수를 기록하는 기능에서는  "조회수가 안올라감"과 같은 에러를 보여줄 필요가 없다
//그래서 GET요청을 할 필요가 없다
};

playBtn.addEventListener("click", handlePlayClick);
window.addEventListener("keydown", handlePlayWindow);
muteBtn.addEventListener("click", handleMuteClick);
volumeRange.addEventListener("input", handleVolumeChange);

video.addEventListener("loadedmetadata", handleLoadedMetadata);//  metadata는 비디오를 제외한 모든 것
video.addEventListener("timeupdate", handleTimeUpdate);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);

videoContainer.addEventListener("mousemove", handleMouseMove);
videoContainer.addEventListener("mouseleave", handleMouseLeave);
video.addEventListener("click", handlePlayClick);
document.addEventListener("keydown", handleKeyDown);
video.addEventListener("ended", handleEnded);