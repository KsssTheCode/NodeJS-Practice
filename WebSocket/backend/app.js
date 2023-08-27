const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    'mongodb+srv://KangSunghoon:Tjdgnsqkqh12!@myfirstmongodb.ptwvaft.mongodb.net/messages?'
  )
  .then(result => {
    //노드 서버 (socket사용을 위한 변경)
    //app.listen(3002);
    const server = app.listen(3002);

    /* 대기중인 소켓/포트 연결 및 확보 */    
    //socket.io는 일반적인 http요청과 다른 프로토콜을 사용하기때문에 이 위치에 선언
    //require문으로 반환받은 함수를 실행하기 위해 (server)로 서버에 전달
    //(상단에 http서버를 기반으로 사용하는 'server'로 웹소켓 연결 구축)
    const io = require('./socket').init(server); //socket.js파일의 io객체 호출 후 init메소드 실행

    //EventListener를 통해 실행
    //connection : 새로운 연결을 대기하여 새 클라이언트가 연결될 때마다
    //socket : 클라이언트를 가져오는 함수 실행 (인수로서 연결하게됨)
    //       : 서버와 클라이언트 사이의 연결부에 해당
    io.on('connection', socket => {
        console.log('Client connected');
    });
  })
  .catch(err => console.log(err));
