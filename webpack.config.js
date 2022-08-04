const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const path = require("path");

const BASE_JS = "./src/client/js/";

module.exports = {
    entry: {//entry는 처리하고 싶은 파일(소스코드)
        main: BASE_JS + "main.js",
        videoPlayer: BASE_JS + "videoPlayer.js",
        recorder: BASE_JS + "recorder.js",
        commentSection: BASE_JS + "commentSection.js",
    }, 
    plugins: [new MiniCssExtractPlugin({
        filename: "css/styles.css",
})],
//watch: true, // npm run assets을 매번 실행 안해도 됌 development에서만 watch: true 실행해야됨
//mode: "development",//mode 설정을 안해주면 webpack은 prodution mode
    // 그렇게되면 코드를 다 압축함 개발중에는 그러면 안됨
    output: { 
        filename: "js/[name].js", // 결과물을 위해 파일명 지정
        path: path.resolve(__dirname, "assets"),  // webpack이 접근할 수 있는 경로를 처음부터 끝까지 작성해야함
        //./src/client/js/main.js에 있는 파일(세련된 코드)을
        // 지루한 기본 JS코드로 바꾸는 작업뒤, 파일을 어디에 저장할 지 지정   
     // entry와 output은 고정  
     clean: true, // output folder의 build를 시작하기전에 clean하고 시작
    },
    //--------------------------파일 압축----------------------------
    module: {
        rules:[{ // rules는 우리가 각각의 파일 종류에 따라 어떤 전환을 할 건지 결정
            test: /\.js$/,
            use: { 
                loader: "babel-loader", // loader는 파일들을 변환하는 장치
                options: {
                    presets: [
                      ["@babel/preset-env", { targets: "defaults" }]]
                  },
            },
            //test를 가져다 use로 변형
        }, 
        {
             test: /\.scss$/,
             use:[MiniCssExtractPlugin.loader, "css-loader","sass-loader"]
             //sass-loader: Loads a Sass/SCSS file and compiles it to CSS.
//style-loader: Inject CSS into the DOM.

//style-loader은 브라우저에    
//<head><style>body {
  //background-color: black;
 // color: white;
//}</style></head>
//형식으로 주입한다 즉, JS와 CSS 분리가 안됨 
            //css-loader: interprets @import and url() like import/require() and will resolve them.
//MiniCssExtractPlugin.loader:This plugin extracts CSS into separate files. It creates a CSS file per JS file which contains CSS.

        },
    ],
    },
}