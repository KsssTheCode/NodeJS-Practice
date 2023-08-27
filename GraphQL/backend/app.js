const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const {graphqlHTTP} = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const auth = require('./middleware/auth');
const { clearImage } = require('./util/file');

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
  if(req.method === 'OPTIONS'){ //POST 이 외의 요청을 거절하는 GraphQL의 특성에 맞게 
                                //자주 발생되는 OPTIONS의 경우 200오류 전송하여 엔드포인트에 도달할 수는 없지만, 유효한 응답을 받을 수 있도록 함
    return res.sendStatus(200);
  }
  next();
});

app.use(auth);

//GraphQL이미지 불러오기
//GraphQL은 JSON데이터밖에 불러오지 못하기때문에 파일을 보낼 라우터 생성
app.put('/post-image', (req, res, next) => {
  //왜자꾸 여기서 에러가 걸리지?
  if(!req.isAuth) {
    throw new Error('Not authenticated');
  }
  if(!req.file) {
    //새로운 사진을 첨부하지 않은 편집의 경우에도 가능하도록 200코드를 보내 그대로 진행하도록 함
    return res.status(200).json({message: 'No file provided'});
  }
  if(req.body.oldPath){ //편집 당시 사진이 바뀌었을 때, 기존의 파일 삭제
    clearImage(req.body.oldPath);
  }
  return res.status(201).json({message:'File Stored', filePath: req.file.path});
});


//GraphQL을 사용하여 아래 라우트를 제외한 모든 라우트를 삭제함
//따라서, 유효성검사와 같은 라우터들 모두 엔드포인트가 있는 resolver.js파일에 작성하게됨
//post가 아닌 use메소드를 사용하는 이유 : 
app.use(
  '/graphql',
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true, //graphiQl을 사용할 수 있도록 하는 설정
    formatError(err){//에러를 감지하여 내가 만든 포맷으로 오류를 반환하도록 함
      if(!err.originalError) { //에러가 없다면 발생한 에러를 반환하여 다음코드 실행
                               //originalError은 express-graphQl이 사용자나 다른 패키지의 오류를 감지했을 떄 생성됨
                               //쿼리에 글자가 누락되는 등의 기술적인 오류가 생겼을 경우에는 생성되지 않음
        return err;
      }
      const data = err.originalError.data;
      const message = err.message || 'An error occurred';
      const code = err.originalError.code || 500;
      return { message: message, status: code, data: data };
    } 
  })
);

// app.use((error, req, res, next) => {
//   console.log(error);
//   const status = error.statusCode || 500;
//   const message = error.message;
//   const data = error.data;
//   res.status(status).json({ message: message, data: data });
// });

mongoose
  .connect(
    'mongodb+srv://KangSunghoon:Tjdgnsqkqh12!@myfirstmongodb.ptwvaft.mongodb.net/messages?'
  )
  .then(result => {
    app.listen(3002);
  })
  .catch(err => console.log(err));
  
