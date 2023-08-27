const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');

//서버를 시작하는 시점에 초기화하고, 최소한의 세션 미들웨어를 초기화해줌으로써 들어오는 모든 요청에 대해 세션 사용가능
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session); //session객체를 함수로 전달
const csrf = require('csurf');

//storage 속성을 사용하기 위한 fileStorage
//multer.diskStorage()는 multer와 함께 사용할 수 있는 저장소 엔진을 생성하는 구문으로
//                      JS객체를 전달하여 구성할 수 있음
const fileStorage = multer.diskStorage({
   destination: (req, file, cb) => { //파일의 저장 위치 제어, multer와 상호작용하기 위한 매개변수임
      //첫번째 매개변수가
      //null일 경우, multer에게 저장하라는 메세지로 간주
      //공백일 경우, 문제 파일이므로 multer에게 저장하지 말라는 오류메세지로 간주
      //두번째 매개변수는 파일을 저장할 경로
      cb(null, 'images');
   }, 
   filename: (req, file, cb) => { //저장할 파일 이름 제어
      //첫번째 매개변수가
      //null일 경우, multer에게 저장하라는 메세지로 간주
      //공백일 경우, 문제 파일이므로 multer에게 저장하지 말라는 오류메세지로 간주
      //두번째 매개변수는 저장할 파일의 이름 (확장자까지포함가능)
      cb(null, new Date().toISOString() + '-' + file.originalname); //originalname에는 확장자까지 담겨있어 결국 확장자도 설정이됨
   }
});

//storage속성을 사용하기위한 fileFilter (함수로 사용)
const fileFilter = (req, file, cb) => {
   //png, jpg, jpeg일 경우만 수락 후 저장
   if(file.mimetype === 'image/png' || 
      file.mimetype === 'image/jpg' || 
      file.mimetype === 'image/jpeg'
   ){
      //두번째 매개변수로
      //해당 파일을 수락하고 저장할 경우 true, 아닐경우 false
      cb(null, true);
   } else {
      cb(null, false);
   }
}

//오류메세지 전송을 위한 패키지
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const User = require('./models/user');

// 나중에 다시 사용할 상수값이라는 것을 표시하기위해 uppercase로 작성
const MONGODB_URI = 'mongodb+srv://KangSunghoon:Tjdgnsqkqh12!@myfirstmongodb.ptwvaft.mongodb.net/shop';

const app = express();
// 위에서 선언과 동시에 실행한 함수의 결과를 MongoDBStore에 저장했기 때문에
// 새로운 생성자를 생성하여금 설정 가능하도록 함
const store = new MongoDBStore({
   uri : MONGODB_URI,// 연결 문자열, 어느 DB서버에 저장할지 파악하기 위함
   collection : 'sessions'// 어느 collection에 저장할지 파악하기 위함
});

//CSRF공격을 막기위한 CSRF토큰 사용
//매개변수로 객체형태의 속성이 있는 기본값은 session, 추가정보는 패키지 공식문서확인
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

//데이터를 텍스트로써 본문에 취합하는 미들웨어 (imageUrl)
app.use(bodyParser.urlencoded({ extended: false }));

//multer패키지는 파일에 대한 들어오는 요청을 분석
//따라서, 파일(또는 텍스트+파일)(enctype=multipart)형식의 데이터를 탐색하고,
//      텍스트와 파일 모두를 분석할 수 있음 
/****************************************************************************************
 * multer는 들어오는 데이터를 수락하고, 파일을 추출하여 저장한 뒤, 파일 업로드에 관한 정보를 저장
 * multer() : multer는 메소드형식으로 호출해야함
            : ()안에 {}형식으로 설정을 할 수 있음 (생략도가능)
 
 * multer설정
   - dest ( => {dest: '파일명'}) : 버퍼를 2진수로 변형하여 해당 '파일이름'의 폴더에 저장
                               : 2진수는 랜덤(해시)화되어 생성되며, 파일확장자의 이름을 붙이지 않고 저장
   - storage ( => {storage: '저장소명'})
   - fileFilter (=> {fileFilter: })

 * multer().single('name의밸류값') : 1개의 파일을 받아올 경우
*****************************************************************************************/
//app.use(multer({dest: 'images'}).single('image'));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));

//JSON데이터 파싱을 위한 parser

//Express에게 마일이 마치 root폴더에 있는 것처럼 해당 폴더로부터 파일을 제공하라고 알려줌
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({
   secret: 'any String inside here!',
   resave: false, 
   saveUninitialized: false, 
   store: store
}));

//csrf활성화 (미들웨어로 등록)
app.use(csrfProtection);

//connect-flash를 등록
app.use(flash());

app.use((req,  res, next) => {
   //locals: 뷰에 입력할 로컬변수(렌더링될 뷰에만 존재함)를 설정할 수 있도록 함
   res.locals.isAuthenticated = req.session.isLoggedIn;
   res.locals.csrfToken = req.csrfToken();
   next();
})

//MongoDB는 Mongoose 모든 메소드가 아닌 순수한 데이터만 가져오기때문에 해당 작업을 해야 사용가능
app.use((req, res, next) => {
   if(!req.session.user){
      return next();
   }

   User.findById(req.session.user._id)
   .then(user => {
      if(!user){
         return next();
      }
         req.user = user; 
         next();
    })
   .catch(err => {
      //throw new Error(err);
      //오류가 발생하면 express에 의해 오류처리 미들웨어로 전달되지만,
      //콜백함수, promise구문 안에서는 작동하지 않음.
      
      //따라서, next()를 이용하여 catch이후에 코드가 계속 실행되게 해주고,
      //      콜백함수나 promise구문 밖으로 나와서 err를 전달할 수 있도록 해야함
      next(new Error(err));
   })
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

app.use('/500', errorController.get500);

//오류처리 미들웨어
app.use((error, req, res, next) => {
   //res.status(error.httpStatusCode).render(...); //error.httpStatusCode를 이용한 방법
   //res.redirect('/500'); //무한루프에 빠질 수 있는 가능성 배제
   res
    .status(500)
    .render('500', { 
        pageTitle: 'Error!',
        path: '/500',
        isAuthenticated : req.isLoggedIn
    });
})

mongoose.set("strictQuery", false);
mongoose
   .connect(MONGODB_URI)
   .then(result => {
      /* 회원가입기능 생성으로 인한 주석처리 ******
      User
         .findOne()
         .then(user => {
            if(!user){
               const user = new User({
                  name: 'sunghoon',
                  email: 'sunghoon@myfirstmongoose.com',
                  cart : { items : []}
            });
            user.save();
            }
         });
      ************************************/
      app.listen(3001);
   })
   .catch(err => console.log(err));
