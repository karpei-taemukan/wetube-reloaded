// commentSection을 사용할 template(pug)에서 script(src="/static/js/commentSection.js")을 사용해야함
const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteButton = document.querySelectorAll(".deleteButton");
const videoComment = document.querySelector(".video__comment");

const addComment = (text, id) => {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    newComment.className = "video__comment";
    const icon = document.createElement("i");
    icon.className = "fas fa-comment";
    newComment.appendChild(icon);
    const span =  document.createElement("span");
    span.innerText = ` ${text}`;
    const span2 = document.createElement("span");
    span2.innerText = "❌";
    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(span2);
    videoComments.prepend(newComment);
}

const handleSubmit = async (event) => {
event.preventDefault();
const textarea = form.querySelector("textarea");

const text = textarea.value;
/*console.log(videoContainer.dataset);//DOMStringMap {id: '62c4603ee8481225261b08b1'}
console.log(videoContainer.dataset.id);//62c4603ee8481225261b08b1*/
const videoId = videoContainer.dataset.id;
// 어떤 비디오에 댓글을 달지에 대한 정보는 dataset에 있다 
if (text === ""){
    return;
}
const response = await fetch(`/api/videos/${videoId}/comment`,{ // -> fetch는 URL 변경없이 JS를 통해서 request를 보낼 수 있게 해준다
    method: "POST",
    headers: { // express는 app.use(express.json());을 이용해,
        // 사용자의 string을 받아서 json으로 바꿀때, 사용자는 express에게 json을 보내고 있다고 알려줘야함 
        "Content-Type": "application/json", 
    },
    body: JSON.stringify({text}),  // html(pug)에 있는 form으로부터 req.body가 만들어졌다면, fetch는 body만 보내도 된다
// app.use(express.text()); body:text, ==> 한가지만 보낼수있다
});
//console.log(response)
//const json = await response.json();
//console.log(json)
//window.location.reload();
if(response.status === 201){
    textarea.value = ""; // textarea.value는 getter(값을 받는다)인 동시에 setter(값을 지정)이다
  const { newCommentId } = await response.json();
    addComment(text, newCommentId);
}
};
// 사용자가 JS object( ex) const obj = {text: "lalala"})를 보낼 수 없다 
//이유는 브라우저와 서버는 JS object를 받아서 string으로 바꾼다 string은 [object Object]로 변환돼 나타남

const handleDelete = async (event) => {
    const deleteTarget = event.target.parentElement;
     //console.log(deleteTarget,deleteTarget.dataset.id);
     
    const commentId = deleteTarget.dataset.id;
    
  await fetch(`/api/comment/${commentId}/delete`, {
         method: "DELETE",
     });
    deleteTarget.remove();
 };

if (form){
form.addEventListener("submit", handleSubmit); 
}

/* form.video__comment-form#commentForm
        button Add Comment   
    위와 같이 button 혹은 input(type="submit")이 form안에 있다면 JS는 form을 제출한다 
즉, btn.addEventListener("click", handleSubmit); 와 처럼 button의 click을 감지할 이유가 없고,
form.addEventListener("submit", handleSubmit); 와 처럼 form을 제출하는 것을 감지해야된다

자꾸 새로고침이 된다면 브라우저가 항상하는 것으로 알려진 기본 동작(default behavior)을 막아야함  
 만약, a tag로 링크를 만드는데 anchor의 기본 동작은 href로 이동하는 건데 브라우저의 기본동작을 막으면 브라우저는 어딘가로 이동을 하지않음
*/ 

 deleteButton.forEach((i)=>i.addEventListener("click", handleDelete));
 // 민약 네트워크 보류중 -->sendStatus