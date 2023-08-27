const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

const fileStorage = multer.diskStorage({ //이미지를 저장할 공간 설정
    destination: (req, file, cb) => {
        cb(null, 'images'); //에러는 없고 images폴더 지칭
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname);
    }
})
const fileFilter = (req, file, cb) => { //이미지 확장자를 설정하는 필터
    if(file.mimetype === 'image/png' || 'image/jpg' || 'image/jpeg'){
        cb(null, true); //파일 확장자요건이 충족한다면, 2번째 매개변수를 true
    } else {
        cb(null, false); //파일 확장자요건이 충족하지 못한다면, 2번쨰 매개변수를 false
    }
}

//app.use(bodyParser.urlencoded()); //들어오는 요청으로부터 www형식의 url 내 form태그를 분석 
app.use(bodyParser.json()); //들어오는 요청으로부터 JSON데이터를 분석
app.use(
    multer({storage: fileStorage, fileFilter: fileFilter})
    .single('image') //image라는 필드에 단일 파일을 추출한다는 의미 (singe('image'))
); 
app.use('/images', express.static(path.join(__dirname, 'images'))); //정적으로 이미지 로드

//Cross Origin Resource Sharing(CORS)에러 방지를 위한 설정
//클라이언트와 서버가 소통할 수 있도록 함
app.use((req, res, next) => {
    //1번째 매개변수 : 허용 형태 , 2번째 매개변수 : 허용할 url
    // => 특정 출처에서 데이터를 엑세스할 수 있도록 허용
    res.setHeader('Access-Control-Allow-Origin', '*');

    //1번째 매개변수 : 허용할 http기능(속성) , 2번째 매개변수 : 외부에서 사용 가능하도록 할 메소드
    // => 위의 허용한 Origin에서 특정 http메소드 사용 허용
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');

    //1번째 매개변수 : 클라이언트 요청을 설정할 수 있는 헤더 종류 , 2번째 매개변수 : 허용할 헤더의 종류
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    next();
});

//'/feed'로 들어온 요청들은 feedRoutes의 getPosts로 보냄
app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

//오류처리함수(오류처리미들웨어)
app.use((error, req, res, next) => { //err가 throw되거나, next로 전달될때마다 실행되는 함수
    console.log(error);
    const status = error.statusCode || 500; //statusCode가 정의되지 않았을 경우 500
    const message = error.message; //error객체의 message변수는 자동으로 생성되며, 입력할 메시지를 담고 있음
    const data = error.data; //선택사항이지만, 원본 오류를 보관하고 프론트로 전달하는 방법
    res.status(status).json({message: message, data: data});
})

mongoose
    .connect('mongodb+srv://KangSunghoon:Tjdgnsqkqh12!@myfirstmongodb.ptwvaft.mongodb.net/messages?retryWrites=true')
    .then(result => {

        //노드 서버 (socket사용을 위한 변경)
        //app.listen(3002);
        const server = app.listen(3002);
    
        /* 대기중인 소켓/포트 연결 및 확보 */    
        //socket.io는 일반적인 http요청과 다른 프로토콜을 사용하기때문에 이 위치에 선언
        //require문으로 반환받은 함수를 실행하기 위해 (server)로 서버에 전달
        //(상단에 http서버를 기반으로 사용하는 'server'로 웹소켓 연결 구축)
        const io = require('socket.io')(server);
    
        //EventListener를 통해 실행
        //connection : 새로운 연결을 대기하여 새 클라이언트가 연결될 때마다
        //socket : 클라이언트를 가져오는 함수 실행 (인수로서 연결하게됨)
        //       : 서버와 클라이언트 사이의 연결부에 해당
        io.on('connection', socket => {
            console.log('Client connected');
        });
    })
    .catch(err => console.log(err));