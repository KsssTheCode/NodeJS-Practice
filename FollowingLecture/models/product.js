const mongoose = require('mongoose');

//Schema생성자를 사용하여 새로운 스키마 생성
const Schema = mongoose.Schema;

const productSchema = new Schema({
    //객체는 키-밸류 한 쌍으로 스키마를 정의
    //_id의 경우 ObjectId로 자동 추가되기때문에 작성하지 않음
    title: {
        type: String,
        required: true //반드시 있어야할 항목
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    userId : {
        type : Schema.Types.ObjectId,
        //ref : 실제 연관된 다른 Mongoose모델이 무엇인지 정의
        ref : 'User',
        required : true
    }
});

//Mongoose에서 Collection명을 첫 번째 인수의 소문자형 + 복수형으로 변환하여 설정함
module.exports = mongoose.model('Product', productSchema);





/* Mongoose사용으로 인한 전체 주석처리 ********************************************************************************************************/
// //MongoDB에서 관리하는 ObjectId를 사용하기 위해 Import
// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;
// //const mongoConntect = require('../util/database');
// //mongoConnect 객체를 import하지 않고, DB와 연결해주는 getDB객체 import
// //getDb객체를 호출함으로써 DB에 접근이 가능하고, DB와 상호작용할 수 있음



// class Product {
//     constructor(title, price, description, imageUrl, id, userId) {
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageUrl = imageUrl;
//         this._id = id ? new mongodb.ObjectId(id) : null;
//         this.userId = userId;
//     } 

//   //저장을 위한 save메소드
//     save() {
//         const db = getDb();
//         let dbOperation;
//         //ObjectId가 비어있거나, 자동생성될 때 문제가 발생하는데,
//         //생성자에서 this._id를 람다식을 통해 비어있다면 null로 설정해줌
//         if(this._id) { //this._id가 있다면 Update Product (새로 생성된 product일 경우 새로운 id가 부여되므로)
//             dbOperation = db
//                 .collection('products')
//                 .updateOne({_id: this._id}, {$set: this});
                            
//         } else { //this._id가 없다면 새로운 항목 생성
//             dbOperation = db
//                 .collection('products')
//                 .insertOne(this/*{name : 'A Book', price : 12000}*/) //작업을 진행할 컬렉션을 지정, 존재하지 않는 Collection일 경우 생성함
//         }
//         return dbOperation
//             .catch(err => {
//                 console.log(err);
//             });
//     }

//     static fetchAll() {
//         const db = getDb();
//         //find()는 promise를 반환하는 대신, cursor를 반환
//         //(cursor : MongoDB에서 제공하는 객체로 단계별로 요소와 문서를 탐색함)
//         return db
//             .collection('products')
//             .find()
//             .toArray()
//             .then(products => {
//                 return products;
//             })
//             .catch(err => console.log(err));
//     }

//     static findById(prodId) {
//         const db = getDb();
//         return db
//             .collection('products')
//             //MongoDB는 id는 ObjectId이기 떄문에 (MongoDB에서 BSON으로 전환해서 생긴 id)
//             //_id와 값을 비교할 수 없음
//             //따라서, 새로운 mongodb객체의 ObjectId(실제아이디)로 find메소드 실행
//             .find({_id: new mongodb.ObjectId(prodId)})
//             .next()
//             .then(product => {
//                 return product;
//             })
//             .catch(err => console.log(err));
//     }

//     static deleteById(prodId){
//         const db = getDb();
//         return db.collection('products').deleteOne({_id : new mongodb.ObjectId(prodId)})
//             .then(result => {
//                 console.log('DELTED!');
//             }) 
//             .catch(err => console.log(err));
//     }

//   /* MongoDB사용으로 인한 주석처리 *********************************************************************************/
// //아래 두 구문으로 Sequelize가 모델들을 정의할 수 있도록 함
// // const Sequelize = require('sequelize');
// // const sequelize = require('../util/database');


// // //전과 달리 class가 아닌 sequelize로 정의

// // //define('모델명(소문자)', 모델이가지는속성또는필드에대한정의) ,모델이가지는 속성 또는 필드에 대한 정의는 docs.sequelizejs.com참고
// // //sequelize에 의해 DB에서 생성될 시, 테이블명은 복수형으로 만들어짐 (product -> products)
// // const Product = sequelize.define('product'/*모델명은관례적으로소문자*/, {
// //     id: {
// //         type: Sequelize.INTEGER,//DataType설정 (INTEGER)
// //         primaryKey: true,//PK속성 활성화
// //         autoIncrement: true, //AI속성 활성화
// //         allowNull: false//NN속성 활성화
// //     },
// //     title: {
// //         type: Sequelize.STRING,
// //         allowNull: false
// //     },
// //     price: {
// //         type: Sequelize.DOUBLE,
// //         allowNull: false
// //     },
// //     description: {
// //         type: Sequelize.STRING,
// //         allowNull: false
// //     },
// //     imageUrl: {
// //         type: Sequelize.STRING,
// //         allowNull: false
// //     }
// //     //필드에 대한 속성 type밖에 없는 경우, ex)price: Sequelize.DOUBLE 과 같이 사용 가능
// // });

// // module.exports = Product;
// // // 이후, app.js(최초실행파일)에서 sequelize.sync()로 실행





// // Sequelize사용으로 인한 전체 주석처리
// // //더미변수로 저장하지 않고 헬퍼function사용을 위해 변경
// // //const products = [];

// // /*DB설정으로 변경하므로, 주석처리
// // 파일의 데이터를 불러오기 위한 전역변수
// // const fs = require('fs');
// // const path = require('path'); */

// // const router = require('../route/admin');
// // const Cart = require('./cart');

// // //DB Connection Pool과 연결하기 위한 전역변수
// // const db = require('../util/database');

// // /*DB설정으로 변경하므로, 주석처리
// // //리팩토링을 위한 전역함수화
// // const p = path.join(path.dirname(require.main.filename), 'data', 'products.json'); */

// // /* DB설정으로 변경하므로, 주석처리
// // //리팩토링을 위한 헬퍼함수
// // //실행완료 후 최종적으로 회신할 cb을 매개변수로 설정
// // const getProductsFromFile = cb => {
// //     fs.readFile(p, (err, fileContent) => {
// //         if(err) {
// //             cb();
// //         } else {
// //             cb(JSON.parse(fileContent));
// //         } 
// //     }); 
// // } */

// // module.exports = class Product {
// //     //생성자 함수 : 제품에 대한 이름을 전달받고, 컨트롤러 내부에서 생성하는 방식
// //     constructor(id, title, imageUrl, price, description) {
// //         this.id = id;
// //         this.title = title;
// //         this.imageUrl = imageUrl;
// //         this.price = price;
// //         this.description = description;
// //     }
    
// //     // 생성된 객체를 products배열에 push하기 위한 메소드
// //     save() {
// //         // DB설정으로 변경하므로, 주석처리
// //         // getProductsFromFile(products => {
// //         //     if(this.id) { //id가 이미 존재한다면 === 이미 등록되어있는 상품이라면 === editProduct
// //         //         const existingProductIndex = products.findIndex(prod => prod.id === this.id);
// //         //         const updatedProducts = [...products];
// //         //         updatedProducts[existingProductIndex] = this;
// //         //         fs.writeFile(p, JSON.stringify(updatedProducts), err => {
// //         //             console.log(err);
// //         //         });
// //         //     } else { //새로운 상품 등록
// //         //         //기존에 등록되어 있던 제품들을 호출한 후 뒤에 이어주는 형식의 로직때문에 아래 메소드 호출
// //         //         //전달해주는 cb함수는 필요없으므로 설정하지 않음
// //         //         //String타입의 랜덤숫자 아이디 부여
// //         //         this.id = Math.random().toString();
// //         //         //getProductsFromFile 메소드로 부터 전달받은 products 뒤에 새로 추가된 제품을 push
// //         //         products.push(this);

// //         //         //JSON.stringify(); : JSON형식이 아닌파일을 JSON으로 변환
// //         //         fs.writeFile(p, JSON.stringify(products), err => {
// //         //             console.log(err);
// //         //         });
// //         //     } 
// //         // });

// //         //헬퍼함수를 이용하고, [data]폴더의 [products.json]에 저장
// //         //전역변수화함
// //         // const p = path.join(path.dirname(require.main.filename), 'data', 'products.json');

// //         /* fs.readFile(경로[, 옵션], 콜백함수]) *****
// //            - createStream()으로 효율적인 사용도 가능
// //         ****************************************/
// //         // getProductsFromFile메소드 안으로 이동
// //         // fs.readFile(p, (err, fileContent) => {
// //         //     products.push(this);

// //         //     //JSON.stringify(); : JSON형식이 아닌파일을 JSON으로 변환
// //         //     fs.writeFile(p, JSON.stringify(products), err => {
// //         //         console.log(err);
// //         //     });
// //         // });

// //         return db.execute('INSERT INTO products (title, price, description, imageUrl) VALUES (?, ?, ?, ?)', 
// //                           [this.title, this.price, this.description, this.imageUrl]);
// //     }

// //     static deleteById(id) {
// //         //DB설정으로 변경하므로, 주석처리
// //         // getProductsFromFile(products => {
// //         //     const product = products.find(prod => prod.id === id);
// //         //     /* filter() *************************************************************
// //         //        - 조건에 맞지 않는 모든 요소를 새로운 배열로 반환
// //         //          즉, 조건이 prod.id === id라면 해당하는 id의 상품만을 골라 새로운 배열로 반환
// //         //              조건이 prod.id !== id라면 해당하지 않는 id의 상품만을 골라 새로운 배열로 반환
// //         //     *************************************************************************/
// //         //     const updatedProducts = products.filter(prod => prod.id !== id);
// //         //     fs.writeFile(p, JSON.stringify(updatedProducts), err => {
// //         //         if(!err){
// //         //             Cart.deleteProduct(id, product.price);
// //         //         }
// //         //     });
// //         // });
// //     }


// //     //전역에서 직접 호출할 수 있도록 전역화(static)
// //     //호출한 변수 전달을 위해 callback실행 
// //     static fetchAll(){ // (cb) cb이 아닌 promise를 사용하므로 삭제
// //         return db.execute('SELECT * FROM products');
// //             //promise를 실행하지 않고 반환된 데이터를 모두 다른 곳에서 사용하기위해 return하므로 아래구문 생략
// //             // .then()
// //             // .cathc(err => {});

// //         //리팩토링을 위해 상단의 getProductsFromFile함수로 이동 
// //         // const p = path.join(path.dirname(require.main.filename), 'data', 'products.json');
// //         // fs.readFile(p, (err, fileContent) => {
// //         //     if(err) {
// //         //         cb([]);
// //         //     }
// //         //     cb(JSON.parse(fileContent));
// //         // });
        
// //         //DB설정으로 변경하므로, 주석처리
// //         // getProductsFromFile(cb);
// //     }

// //     static findById(id /*, cb DB사용으로 cb제거*/) {
// //         return db.execute('SELECT * FROM products WHERE products.id=?',[id]);
// //         //DB설정으로 변경하므로, 주석처리
// //         // getProductsFromFile(products => {
// //         //     //매개변수를 하나만 전달하는 화살표함수의 경우,
// //         //     //한 줄의 구문만이 존재하고 결과를 회신하는 경우에 한해서 return이 생략되어있어 {}가 생략가능함
// //         //     const product = products.find(p => p.id === id);
// //         //     cb(product);
// //         // });
// //     }
// // }
// }

// module.exports = Product; 
/* Mongoose사용으로 인한 전체 주석처리 ********************************************************************************************************/