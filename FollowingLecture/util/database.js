const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

/* 하나의 연결을 처리, 반환 한 뒤 필요한 곳으로 요청을 반환시키 형식 ***********************************************/
//MongoDB는 배후에서 Connection Pooling이라는 과정을 관리하는데,
//DB와 여러개의 상호작용을 동시에 가능하게 함
const mongoConnect = callback => {
   MongoClient
      //아래 Url주소뒤에 접근할 데이터베이스의 이름을 입력하면 해당 DB와 연결하게됨
      //해당 DB가 존재하지 않는다면 생성하게되는 유연성을 지님 (MongoDB의 유연성)
      .connect('mongodb+srv://KangSunghoon:Tjdgnsqkqh12!@myfirstmongodb.ptwvaft.mongodb.net/shop?retryWrites=true')
      .then(client => {
         console.log('Connected!');
         _db = client.db(); // db로의 접근을 변수로 남겨둠, 현재 shop DB에 대한 접근이 담겨있음
         callback();
      })

      .catch(err => {
         console.log(err);
         throw err; //이 지점에서 실패할 경우 다시 오류를 출력
      });
}

const getDb = () => {
   if(_db) { //_db에 DB와 연결객체가 들어있을 시 (연결성공),
      return _db;
   }
   throw 'No database found!'; //_db가 빈 값일 시 (연결실패),
}

exports.mongoConnect = mongoConnect; // DB로의 연결을 저장하는 용도
exports.getDb = getDb; // DB가 존재하는 경우, 접근을 반환하는 용도


/* 매 작업마다 MongoDB에 연결하는 형식 (작업 후 해제하지 못함) ***********************************************
const mongoConnect = (callback) => {
   MongoClient
   //connect(url); : DB에 접근할 수 있게 하는 클라이언트 객체 생성
   .connect('mongodb+srv://KangSunghoon:Tjdgnsqkqh12!@myfirstmongodb.ptwvaft.mongodb.net/test')
   .then(client => {
      console.log('Connected!');
      callback(client);
   })
   .catch(err => console.log(err));
}
module.exports = mongoConnect;
************************************************************************************************/


/* MongoDB (NoSQL)사용으로 인한 주석처리 ******************************************************************************
const Sequelize = require('sequelize');

//Sequelize('DB명', 'username', 'password', {options: ~~});
//커넥션 풀은 자동으로 생성됨
const sequelize = new Sequelize('myFirstMySQL', 'root', 'Tjdgnsqkqh12!', {dialect: 'mysql', host:'localhost'});

module.exports = sequelize;
*****************************************************************************************************************/

/* Sequelize사용으로 주석처리
const mysql = require('mysql2'); */

/* DB와 연결하는 2가지 방법 *****************************
   1. 연결을 설정한 다음, 쿼리를 실행
     - DB로 부터 호출 할 때 연결해야하고, 완료한 다음에는 항상 연결을 닫아야함
     - 데이터를 가져오고, 쓰고, 삭제하는 과정에서 쿼리가 많이 발생하는 단점
     => 비효율적인 방법

   2. 커넥션 풀 (Connection Pool)
    * mysql.createConnection({host:'host명',
                         user:'root(초기값)',
                         database:'DB서버명',
                         password:'DB패스워드
      }) 
     -단일연결이 가능하록 하나의 연결을 허용하는 메소드

     * mysql.createConnection({host:'host명',
                         user:'root(초기값)',
                         database:'DB서버명',
                         password:'DB패스워드
      }) 
     - 다중연결이 가능하도록 하는 메소드
     - (각 쿼리마다 개별적인 연결이 필요하므로)다중연결을 관리하는 풀에서 새로운 연결을 받아오게되면,
       다수의 쿼리를 동시에 실행할 수 있음
     - 쿼리가 실행 오나료되면 다음 연결을 다시 풀로 되돌려주게 되고, 새로운 쿼리를 사용할 수 있음
     - 풀은 어플리케이션이 종료되면 함께 종료됨
*/

/* Sequelize사용으로 주석처리
const pool = mysql.createPool({
    host: 'localhost', 
    user: 'root', 
    database: 'myFirstMySQL',
    password: 'Tjdgnsqkqh12!'
}); */

/* Suquelize 패키지 (Object-Relational Mapping Libarary) **********************************
   - 백그라운드에서 JavaScript객체로 맵핑하여 실제 SQL코드를 처리하는 패키지로 SQL문을 직접 작성할 필요가 없음
   - 객체가 Sequelize에 의해 DB에 맵핑되면 테이블, 관계 등을 자동으로 생성되는 형식
   - 외부패키지로 기본적으로 mysql2패키지가 install되어 있어야함
******************************************************************************************/


/* promise() ***************************** 
   - 비동기적 데이터를 다룰 수 있도록하는 메소드
   - 코드를 좀 더 체계화된 방식으로 작성할 수 있도록 하여, 다수의 중첩된 콜백은 피하는 것이 좋음
******************************************/
/* Sequelize사용으로 주석처리
module.exports = pool.promise();*/

/* MySQL *************************** 
   - 컬럼 생성 조건
      ㄴ PK (Primary Key)
      ㄴ NN (Not Null)
      ㄴ UQ (Unique)
      ㄴ BIN (Binary) : 이진법으로 데이터 보관
      ㄴ UN (Unsign) : 부호가 없는 경우, 음수값이 없을 경우 체크
      ㄴ ZF (Zero Field) : 0채우기
      ㄴ AI (Auto Increase) : 자동 증가 여부 
      ㄴ G (?) : ? Mark column as Generated column ?

   - DataType
     ㄴ INT : 정수
     ㄴ DOUBLE : 소수
     ㄴ VARCHAR() : 문자열(byte단위)
     ㄴ TEXT : 제한이 없는 문자열 (VARCHAR보다 김)
*/

