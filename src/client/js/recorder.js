import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
const a = document.createElement("a");
a.href = fileUrl;
//a.download: 사용자로 하여금 URL을 통해 어디로 보내주는 게 아니라 URL을 저장하게 해줌
a.download = fileName;
document.body.appendChild(a);
a.click(); // 사용자가 링크를 클릭한 것처럼 작동
};

const handleDownload = async () => {

actionBtn.removeEventListener("click", handleDownload);
actionBtn.innerText = "Transcoding..";
actionBtn.disabled = true;

// FFmpeg는 오디오, 비디오, 자막 및 관련 메타데이터와 같은 멀티미디어 콘텐츠를 처리하기 위한 라이브러리와 도구 모음입니다.
// WebAssembly프로그래밍 언어를 위한 이식 가능한 컴파일 대상으로 설계되어 클라이언트 및 서버 응용 프로그램을 위해 웹에 배포할 수 있습니다.

//ffmpeg.wasm은 비디오를 변환하기 위해 사용자의 컴퓨터(브라우저) 사용

// 예를 들어 웹사이트를 만들고 다운로드할때마다 webm을 mp4로 변환한다면 백엔드가 모든일 처리, 서버를 이용하므로 비용발생 
// 그래서 서버대신 웹사이트에서 사용

const ffmpeg = createFFmpeg({log:true}); //log:true 무슨 일이 벌어지고 있는 지 콘솔에서 확인
await ffmpeg.load(); // await을 하는 이유는 사용자가 software를 사용할 것이기 떄문(software가 무거울 수 있기 때문)
// npm을 이용해 설치 후, 사용자가 JS코드가 아닌 코드를 사용, 사용자의 웹사이트에서 다른 software 사용

ffmpeg.FS("writeFile", files.input,await fetchFile(videoFile))//ffmpeg의 가상컴퓨터에 파일 생성 // FS(파일 시스템)
// 백엔드에서 multer가 파일을 만들고 업로드하면 uploads폴더에 아바타 파일 생성하는 것처럼
// 프론트 엔드에도 uploads폴더와 같은 폴더가 생긴다고 보면 된다(폴더와 파일이 가상 컴퓨터 메모리에 저장)

await ffmpeg.run("-i", files.input,"-r","60", files.output);
// 가상컴퓨터에 있는 파일을 input(-i)으로 받는다// "-r","60" -> 영상을 초당 60프레임으로 인코딩
// 가상 파일 시스템에 output.mp4라는 파일을 얻음
await ffmpeg.run("-i", files.input,"-ss","00:00:01", "-frames:v", "1", files.thumb);
// "-ss": 영상의 특정 시간대로 갈수 있게 해줌 // "-frames:v", "1": 첫 프레임의 스크린 샷을 찍어준다
const mp4File = ffmpeg.FS("readFile", files.output);
//mp4File은 Uint8Array(array of 8-bit unsigned integers) 타입  unsigned integers: 양의 정수
// Uint8Array은 byte를 삭제하거나 두 개의 파일을 하나로 만든다든지 등 사용자가 하고싶은대로 할수있는 파일
// JS에서 파일을 표현하는 방법은 [4,654,8,1,0,6,9,56,3] 처럼 양의 숫자배열로 표현
//console.log(mp4File);
//console.log(mp4File.buffer);// mp4File의 binary data(실제파일)에 접근하려면 mp4File buffer가 필요
// Uint8Array.prototype(mp4File).buffer는 ArrayBuffer(raw binary data를 나타내는 object)를 반환 
// 영상을 나타내는 bytes의 배열
const thumbFile = ffmpeg.FS("readFile", files.thumb);

// blob은 실제파일
const mp4Blob = new Blob([mp4File.buffer], {type: "video/mp4"});
const mp4Url =  URL.createObjectURL(mp4Blob);

const thumbBlob = new Blob([thumbFile.buffer], {type: "image/jpg"});
const thumbUrl =  URL.createObjectURL(thumbBlob);

downloadFile(mp4Url, "Myrecording.mp4");
downloadFile(thumbUrl, "MyThumbnail.jpg");

//브라우저 속도를 위해 파일을 계속 들고있지않고 파일의 링크를 해체할 수 있다
// 즉, 파일과 URL 모두 삭제 해야됨
ffmpeg.FS("unlink", files.input); // recording.webm(소스 파일) 삭제
ffmpeg.FS("unlink", files.output);
ffmpeg.FS("unlink", files.thumb);

URL.revokeObjectURL(mp4Url);
URL.revokeObjectURL(thumbUrl);
URL.revokeObjectURL(videoFile);

actionBtn.disabled = false;
actionBtn.innerText = "Record Again";
actionBtn.addEventListener("click", handleStart);
};

/*const handleStop = () => {
  actionBtn.innerText = "Download recording";
  actionBtn.removeEventListener("click", handleStop);
  actionBtn.addEventListener("click", handleDownload);
  recorder.stop();
};*/

const handleStart = () => {
  actionBtn.innerText = "Recording";
  actionBtn.disabled = true;
  actionBtn.removeEventListener("click", handleStart);
  
  //handleStart를 클릭하면 EventListener를 제거해야한다 이유는 handleStart를 계속해서 클릭하고싶지않음
  //actionBtn.addEventListener("click", handleStop);
  recorder = new MediaRecorder(stream, {mimeType: "video/webm"});
  recorder.ondataavailable = (event) => {
     //console.log(event.data); // -> Blob(데이터베이스 관리 시스템의 하나의 엔티티로서 저장되는 이진 데이터의 모임이다. ).
      videoFile = URL.createObjectURL(event.data);
     // ->videoFile은 blob으로 시작하는 URL인데 브라우저에 의해 만들어짐, 오직 브라우저 상에서만 존재 
     // ->videoFile은 접근할 수 있는 파일을 가르키고 있다 즉, 파일은 브라우저의 메모리 상에 있다
     // video.src = videoFile;처럼 파일을 갖고 뭔가 해볼려면 파일에 blob으로 시작하는 URL을 넣어서 접근하도록 만든다
     
     // 브라우저의 메모리 상에 우리가 접근하고자 하는 파일이 있고 blob으로 시작하는 URL 접근 가능
    video.srcObject = null;// 비디오는 src가 없는 것처럼 보이지만 srcObject가 있다
    video.src = videoFile; 
    video.loop = true;
    video.play();
    actionBtn.innerText = "Download";
    actionBtn.disabled = false;
    actionBtn.addEventListener("click", handleDownload);
  };
  recorder.start();
    setTimeout(()=>{
      recorder.stop();
    }, 5000);
  //console.log(recorder); -> state: inactive
  //recorder.start(); // MediaRecorder event((예)ondataavailable)를 사용하지않으면 의미없다
  //console.log(recorder); -> state: recording
  /*setTimeout(()=>{
  recorder.stop(); // -> 녹화가 중지하면,Blob을 포함하는 dataavailable event가 발생
  //dataavailable event는 Media Recorder가 미디어 데이터를 응용 프로그램에 전송하여 사용할 때 발생
  }, 10000);*/
};

const init = async () => {
 stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 1024,
      height: 576,
    },
  });
      // navigator에서 카메라와 오디오를 가져다 준다 
    //getUserMedia라는 function을 호출하면 데이터의 stream을 불러온다
 // console.log(stream);
 video.srcObject = stream;
 video.play();
};
init(); // video의 기능이 먼저 실행되어야함
actionBtn.addEventListener("click", handleStart);