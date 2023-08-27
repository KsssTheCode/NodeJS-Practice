// 순수 Node.js만 사용한 방식
// //const http = require('http');

// const routes = require('./routes'); // 사용자 지정 파일임을 명시,
//                                     // ,/  : 같은 파일 내

// const server = http.createServer(routes.handler);
// //또는 
// //const server = http.createServer(routes.exText);

// server.listen(3000);

/********************************************************/

// Express.js
const path = require('path');

const express = require('express');
// Cmd + 'express'클릭을 하여 백그라운드를 보게되면 e를 내보내고 있음 => 현재 'express' = e 라고 유추할 수 있음

// 입력에 대한 분석을 위한 제3자 패키지를 사용하기 위함
const bodyParser = require('body-parser');

//Mongoose는 다른 util파일없이도 호출하는 것만으로 사용이 가능함
const mongoose = require('mongoose');

//const rootDir = require('./util/path');

// 콜백함수 [controllers] - products.js로 이관 후 불러오기
// app.use((req, res, next) => {
//   /* status() : 요청 상태값을 보낼 수 있는 메소드 **********************************************
//      - status, setHeader 등과 메소드 체이닝이 가능하지만, 마지막은 응답을 보내는 send()메소드 이어야 함
//   **************************************************************************************/
//   //res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
//   //res.status(404).sendFile(path.join(rootDir, 'views', '404.html'));
//   res.status(404).render('404', {pageTitle: 'Page Not Found'})
// });
const errorController = require('./controllers/error.js');

const User = require('./models/user');
/* Mongoose사용으로 인한 주석처리 *************************************
const mongoConnect = require('./util/database').mongoConnect;
*****************************************************************/


/**********MongoDB (NoSQL)사용으로 인한 주석처리**********/
//Connection Pool (기존 db -> sequelize로 변경)
// const sequelize = require('./util/database');

// const Product = require('./models/product');
// const User = require('./models/user');
// const CartItem = require('./models/cart-item');
// const Cart = require('./models/cart');
// const Order = require('./models/order');
// const OrderItem = require('./models/order-item');
/**********MongoDB (NoSQL)사용으로 인한 주석처리***********/

const app = express();
// 따라서, express를 함수로 실행하게되면 새로운 객체를 초기 설정하게 되는데,
//       프레임워크(express.js)가 보이지 않는 곳에서 많은 내용을 저장 및 관리하게 됨을 의미

/* app.set(속성명, '템플릿엔진명'); ****************************************************************
   - 전체 구성 값을 설정하는 메소드
   - Express 애플리케이션 전체에 어떤 값이든 설정가능 (Express가 이해할 수 없는 키 또는 구성항목도  가능)
   - app.get()을 사용하면 app객체에서 읽을 수 있음

   - ('view engine', '템플릿엔진') : Express에게 렌더링하려고 하는 동적 템플릿을 실시하기위한 함수를 등록하는 엔진을 통해 사용하도록함
   - ('views', '경로') : 렌더링하려는 동적 템플릿의 위치를 알리는 기능 (Default값으로 메인디렉토리의 views폴더)

   + 아무 엔진이나 읽히는 것이 아니므로 개발자 문저에서 사용법을 숙지한 후 사용해야 함
     pug : express 내장엔진이므로 app.set으로 바로 등록
     handlebars : express 외부엔진 => app.engine();으로 등록 
     ***********************************************************************************************/
    // pug사용을 위한 엔진 등록
// app.set('view engine', 'pug');
// app.set('views', 'views'); //기본값과 동일하므로 생략도 가능 


/* handlebar엔진 설정 ********************************************************** 
   - import한 객체를 메소드화하여 실행하면서 객체로 전달 시 설정값 전달이 가능함
   
   - layoutDir : layout파일의 디렉토리 
     -> layoutDir : '경로' / 경로의 Default Value는 views - layouts 이므로 생략해도됨
     -> defaultLayout : '기본레이아웃파일' / 모든 파일에 적용될 레이아웃 정의
******************************************************************************/

// handlebars 사용을 위한 변수
// const expressHbs = require('express-handlebars');

/* app.engine('설정할엔진의명칭', '엔진실행함수') *****************************************************
   - express.js에 내장되어 있지 않은 엔진의 경우 engine함수로 실행
   - 설정된 엔진의 명칭으로 파일 생성이 가능함 (ex: hbs -> main.hbs)
   - 위에서 import한 expressHbs변수를 expressHbs()를 호출함으로써 초기 설정된 뷰 엔진을 반환해주어 엔진으로 등록
***********************************************************************************************/
// handlebars 사용을 위한 엔진 등록
// app.engine('hbs', expressHbs({
//   layoutDir : 'views/layouts/', 
//   defaultLayout : 'main-layout',
//   extname : 'hbs' // 레이아웃에 대한 확장 설정
// }));
// app.set('view engine', 'hbs');
// app.set('views', 'views'); // 기본값과 동일하므로 생략도 가능 

/* EJS ******************************
   - HTML기반으로 사용 가능
   - Vanilla JS 코드 그대로 사용가능
   - handlebar와는 달리 논리 실행이 가능
   - 레이아웃을 지원하지 않지만, 일부 블록들을 재활용 가능
*************************************/

// EJS 사용을 위한 엔진 등록
app.set('view engine', 'ejs');
app.set('views', 'views'); // 기본값과 동일하므로 생략도 가능 




// 코드 이관에 따른 admin.js import구문
//const adminRoutes = require('./route/admin');
// 아래구문(const adminData)으로 변경

// [routes]의 admin.js에서 exports하는 모든 데이터(products, routes)를 받기위해 설정한 변수
// const adminData = require('./route/admin');
// MVC패턴화를 위해 adminData -> adminRoutes로 변수명 변경 
// 콜백함수를 이관하여 Data를 내보내는 것이 아닌, Router만 내보내기때문
const adminRoutes = require('./route/admin');
// 코드 이관에 따른 shop.js import구문
const shopRoutes = require('./route/shop');

/* use(); */
/* express.use(path, (req, res, next) => {}); **************************************************
   - 미들웨어 함수를 추가하는 메소드 
   - 모든 http메소드에 반응
   - path : 전달할 경로 (도메인 뒤에 오는 전체 경로가 '/'라는 것이 아닌, '/'로 시작해야한다는 의미)
          : 요청을 여러 Middleware로 routing해주는 역할
   - next : 함수형태로 전달되는 매개변수
     : Express.js를 통해 전달되는 함수
     : 다음함수로 이동할 수 있도록 실행되어야 함 */

// app.use('/', (req, res, next) => {
//     /* next(); *************************************************
//        다음함수로 이동하도록하는 메소드
//        만약, next();를 호출하지 않아 다음 함수로 넘어가지 않는 경우 요청에 실패하게되므로,
//             응답을 보낼 수 있는 곳으로 도달하게 해야함 */
//     next();
// });

/* bodyParser.urlencoded(); *************************************************
   - 기본적으로 res객체는 들어오는 입력을 분석해주지 않기 때문에 따로 분석하도록 하는 구문(제3자 패키지 'body-parser')
   - 입력에 대한 경로처리 미들웨어 전에 실행해야 함 

   - res.send()와 다르게 전달하는 유형을 자동으로 설정해주지 않지만, form을 통해 전달된 입력은 분석함 
     만약, 다른 유형을 분석하고자하면 적절한 제3자 패키지를 추가로 사용하면 됨
   - 매개변수로 비표준 대상의 분석이 가능한지를 보여주는 extended를 사용함
   - bodyParser.urlencode(); 구문은 자동으로 마지막에 next();를 실행함 */
app.use(bodyParser.urlencoded({extended : false}));

// 정적 서비스 방식 - 읽기전용으로 엑세스 허용
app.use(express.static(path.join(__dirname, 'public')));

//순서 주의!!!! (admin.js로 접근하기 전에 실행되어야 admin.js에서 사용가능)
//미들웨어는 들어오는 요청에 한해서만 등록됨(시작하자마자 실행 X)
//app.listen()이 실행된 후에 접근 가능

/* Mongoose version *********************************************************/
app.use((req, res, next) => {
   User
      .findById('63c4d04b0e91229e61653ef8')
      .then(user => {

         //아래 실행 구문에서 full Mongoose 모델을 지정했으므로, user객체에서 Mongoose의 메소드를 사용가능
         req.user = user;
         next();
      })
      .catch(err => console.log(err));
 });
/* MongoDB version **************************************************************
app.use((req, res, next) => {
   User
      .findById('63bcd785e30477b41bf6ac82')
      .then(user => {
         //단순히 정보를 포함하는 JS객체가 아니라,
         //DB의 값을 포함하는 sequelize객체이므로 정보 + sequelize객체 메소드사용이 가능한 객체
         req.user = new User(user.name, user.email, user.cart, user._id);
         next();
      })
      .catch(err => console.log(err));
 });
*******************************************************************************/
// 코드를 이관함에 따라 해당 이관된 파일을 import해주고, 호출함으로써 기존의 메소드 그대로 사용 가능
// 다만, 이전과 동일한 위치에 작성해야 실행됨
// adminData는 [admin.js]에서 exports되는 모든 데이터(routes, products))
// '/admin' 과 같이 url필터링을 했다면, 사용할 때에는 앞에 /admin이 붙어야 404에러가 발생하지 않음
// app.use('/admin', adminData.routes);
// MVC패턴화를 위해 상단의 adminData -> adminRoutes로 변수명 변경
app.use('/admin', adminRoutes);

/* admin용 route를 [route] > admin.js로 이관 후 import ************************************************************
******************************************************************************************************/
// app.use('/add-product', (req, res, next) => {
//     res.send('<form action="/product" method="POST"><input type="text" name="title"><button type="submit">Add Product</button></form>');
// });

// /* app.get(); / app.post(); *************************************************
//    - app.use();와 모두 동일하지만, GET(get();), POST(post();)요청에만 반응할 수 있도록하는 메소드 
//    - get과 post외에도 delete, patch, put등도 있으나, 일반적인 html문서에서는 사용하기 어려움  */
// app.get('/product', (req, res, next) => {
//     console.log(req.body);
//     /* res.redirect(); **************************************************/
//     res.redirect('/');
// });
/******************************************************************************************************
*******************************************************************************************************/

app.use(shopRoutes);
/* user용 route를 [route] > shop.js로 이관 후 import ************************************************************
******************************************************************************************************/
// app.use('/', (req, res, next) => {
//     /* res.send(); **************************************************/
//     /* res.write()와 res.setHeader() 같이 응답을 전달하는 메소드
//        전달하는 유형에 따라 Content-type을 자동으로 설정하는 특징이 있음 (Express에서 제공하는 기능) */
//     res.send('<h1>Hello From Express!</h1>');
// });
/******************************************************************************************************
*******************************************************************************************************/

/* DB 사용 방법 *********************************************************************
  - 쿼리실행
   * query('쿼리문') : execute보다 안전성이 떨어져 execute 사용할 예정
   * execute('쿼리문') ********************************************************************
      execute('쿼리문')
         .then(() => {})
         .catch(()) => {});

    - promise()의 일환으로 then()과 catch()가 있음
    - promise()는 JavaScript언어로 브라우저에서 비동기적 코드를 작업할 수 있도록 해줌
      (MySQL패키징에도 사용할 수 있는 콜백이 있으나, promise가 더 가독성 높은 코드를 작성하도록 함)
      ㄴ then() : 익명함수를 가져와 실행
      ㄴ catch() : 오류가 발생할 경우의 함수를 실행
   ********************************************************************************

  - DB종료
   * end()
 ***********************************************************************************/
/*DB테스트용 코드
db.execute('SELECT * FROM products').
   then(result => {
      console.log(result[0], result[1]);
   }).
   catch(err => {
      console.log(err);
   }); */


app.use(errorController.get404);
mongoose.set("strictQuery", false);
mongoose
   .connect('mongodb+srv://KangSunghoon:Tjdgnsqkqh12!@myfirstmongodb.ptwvaft.mongodb.net/shop?retryWrites=true')
   .then(user =>   {
      User.findOne()
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
      app.listen(3000);
   })
   .catch(err => console.log(err));
/* Mongoose사용으로인한 주석처리 ***
//연결한 뒤 실행될 함수 전달
mongoConnect(() => {
   app.listen(3000);
});
******************************/



/**************************MongoDB (NoSQL)사용으로 인한 주석처리*************************************/
// const http = require('http');
// const server = http.createServer(app);
// server.listen(3000);
// Cmd + listen클릭을 하여 백그라운드를 보면 express객체에서 listen()이라는 메소드는 위 두 가지 방법을 포함하고 있음

// //Association부여 및 속성 부여
// Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
// //관계설정
// //(User) 1 : 다 (Product)  : 하나의 admin이 여러개의 상품을 등록
// User.hasMany(Product);

// //(User) 1 : 1 (Cart) : 하나의 사용자는 하나의 장바구나만 보유
// User.hasOne(Cart);           
// Cart.belongsTo(User);

// //(Cart) 다 : 다 (Product) : 존재하는 여러개의 카트에는 여러개의 상품이 담길 수 있음
// // => 중개테이블이 있어야 작동
// Cart.belongsToMany(Product, { through: CartItem}); 
// Product.belongsToMany(Cart, { through: CartItem});
// // 위 두 구문으로 인해 연결객체를 생성할 수 있는 구문을 sequelize에서 제공해줌 (create연결객체())

// //(User) 1 : 다 (Order) : 하나의 사용자가 다수의 Order가능
// Order.belongsTo(User);
// User.hasMany(Order);
// Order.belongsToMany(Product, {through: OrderItem});


// sequelize
//    .sync(/*{force: true}*/) //위 두 구문으로 인해 sync가 실행되며 DB내부에 관계를 설정해줌
//    .then(result => {
//       return User.findByPk(1);
//    })
//    .then(user => {
//       if (!user) { //user가 없다면 생성
//          return User.create({name:'Max', email:'test@gamil.com'});
//       }
//       return user;
//    })
//    .then(user => {
//       return user.createCart();
//    })
//    .then(user => {
//       app.listen(3000); //DB내용이 불러와지고 계속되어야하기때문에 .then메소드 안으로 이동
//    })
//    .catch(err => {
//       console.log(err);
//    });
/**************************MongoDB (NoSQL)사용으로 인한 주석처리*************************************/