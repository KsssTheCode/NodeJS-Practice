const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required: true
    },
    cart : {
        items : [
            {
                productId : { 
                    type: Schema.Types.ObjectId, 
                    ref: 'Product', 
                    required: true
                },
                quantity: {
                    type: Number, 
                    required: true
                }
            }
        ]
    }
});

userSchema.methods.addToCart = function(product){
    //여기서 this는 Schema를 의미
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString(); // -1이외의 값이 나오면 이미 카트 내에존재하는 상품
    })
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items]; //기존 요소들을 모두 복사하는 새로운 배열 생성
    
    if(cartProductIndex >= 0) { //추가하고자하는 product가 cart에 이미 존재할 때
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else { //추가하고자하는 product가 기존 cart에 존재하지 않을 때
        //정보를 가진 객체를 추가
        updatedCartItems.push({productId : product._id , quantity: newQuantity})
    }

    const updatedCart = {items: updatedCartItems};

    this.cart = updatedCart;
    return this.save();
}

userSchema.methods.deleteItemFromCart = function (productId) {
    const updatedCartItems = this.cart.items.filter(item => {
        return item.productId.toString () !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    //return updatedCartItems.save(); updatedCartItems는 Mongoose객체가 아니기때문에 save메소드 사용 불가
    //따라서, productId를 지칭하는 this로 save()메소드 사용
    return this.save();
}

userSchema.methods.clearCart = function() {
    this.cart = {items: []};
    return this.save();
}

module.exports = mongoose.model('User', userSchema);

// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// const ObjectId = mongodb.ObjectId;

// class User { 
//     constructor(username, email, cart, id) { //하나의 사용자가 하나의 cart를 가지므로 생성자에 추가
//         this.name = username;
//         this.email = email;
//         this.cart = cart; // {items: [1, 2, 3,...]} 형태의 객체
//         this._id = id;
//     }

//     save() {
//         const db = getDb();
//         return db.collection('users').insertOne(this);

//     }

//     //cart와 user가 1:1관계이기 때문에 MongoDB에서는 관계테이블 같은 개념없이도됨
//     addToCart(product) {
//         //추가하려는 제품과 동일한 ID를 가진 제품의 index를 카트에서 검색
//         //(수량추가인지, 카드에 생성인지 판단하기위함)
//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             // Controller에서 넘어온 product객체는 string타입으로 '간주'될 뿐, 실제 string타입이 아님
//             // 따라서, string타입으로 사용하고자한다면 
//             //       1. .toString()메소드를 붙여 string타입 객체로 변환시켜 사용하거나,
//             //       2. == 비교로 사용해야 함
//             return cp.productId.toString() === product._id.toString(); // -1이외의 값이 나오면 이미 카트 내에존재하는 상품
//         })
//         let newQuantity = 1;
//         const updatedCartItems = [...this.cart.items]; //기존 요소들을 모두 복사하는 새로운 배열 생성
        
//         if(cartProductIndex >= 0) { //추가하고자하는 product가 cart에 이미 존재할 때
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//             updatedCartItems[cartProductIndex].quantity = newQuantity;
//         } else { //추가하고자하는 product가 기존 cart에 존재하지 않을 때
//             //정보를 가진 객체를 추가
//             updatedCartItems.push({productId : new ObjectId(product._id), quantity: newQuantity})
//         }

//         const updatedCart = {items: updatedCartItems}

//         const db = getDb();
//         return db
//             .collection('users')
//             //this의 아이디와 같은 데이터를 선택하여, 해당 user의 cart에 update된 카트를 덮으씀 (병합X)
//             .updateOne({_id : new ObjectId(this._id)}, {$set : {cart: updatedCart}});
//     }

//     getCart() { // user객체에 내장된 cart객체에 각 정보들을 담아 반환
//         const db = getDb();
//         const productIds = this.cart.items.map(i => {
//             return i.productId; //string타입의 productId만 return 
//         })
//         return db
//             .collection('products') // 제품 정보를 지니고 있는 products객체에 접근
//             .find({_id : {$in : productIds}}) // id가 productIds배열안에 있다면 DB에서 추출
//             .toArray() //전달받은 객체들을 배열 형태로 변환
//             .then(products => { //전달받은 배열에 수량정보를 추가하여 전달
//                 return products.map(p => { //map형태로 매핑된 p를 전달
//                     //기존 product의 속성에 quantity속성을 추가하여 전달
//                     return {...p, quantity : this.cart.items.find(i => {
//                         return i.productId.toString() === p._id.toString();
//                         }).quantity
//                     }
//                 });
//             })
//     }

//     deleteItemFromCart(productId) {
//         //아이디가 일치하지 않는 것만을 필터링하여 updatedCartItem에 담아둠
//         const updatedCartItems = this.cart.items.filter(item => {
//             return item.productId.toString() !== productId.toString();
//         });
//         const db = getDb();
//         return db
//             .collection('users')
//             //this의 아이디와 같은 데이터를 선택하여, 해당 user의 cart에 update된 카트를 덮으씀 (병합X)
//             .updateOne({_id : new ObjectId(this._id)}, {$set : { cart : {items: updatedCartItems}}});
//     }

//     addOrder() {
//         const db = getDb();
//         //getCart()메소드로 수량을 포함한 모든 제품 정보 호출
//         return this
//             .getCart()
//             .then(products => {
//                 const order = {
//                     items : products, // <- 제품정보와 수량을 포함한 products 
//                     user : {_id : new ObjectId(this._id), name: this.name},
//                 }
//                 return db //'orders'컬렉션에 order를 삽입
//                     .collection('orders')
//                     .insertOne(order)
//             })
//             .then(result => { //주문이 완료되면 카트를 비워주고,
//                 this.cart = {items: []};
//                 //DB에서 카드정보 삭제
//                 return db
//                     .collection('users')
//                     //this의 아이디와 같은 데이터를 선택하여, 해당 user의 cart에 update된 카트를 덮으씀 (병합X)
//                     .updateOne(
//                         {_id : new ObjectId(this._id)}, 
//                         {$set : { cart : {items: []}}}
//                     );
//             });
//     }

//     getOrders() {
//         const db = getDb();
//         return db
//             //사용자의 주문에 대한 배열을 반환
//             .collection('orders')
//             .find({'user._id' : new ObjectId(this._id)})
//             .toArray(); 
//     }

//     static findById(userId) {
//         const db = getDb();
//         return db
//             .collection('users')
//             //.find일 시 next(), .findOne일 시 next()불필요
//             .findOne({_id : new ObjectId(userId)})
//             // .find({id : {_id : new ObjectId(userId)}})
//             // .next();
//             // .then(user => {
//             //     console.log(user);
//             // })
//             .catch(err => console.log(err));
//     }
// }

// /* MongoDB사용으로 인한 주석처리****************************
// const Sequelize = require('sequelize');
// const sequelize = require('../util/database');

// const User = sequelize.define('user', {
//     id : {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey : true
//     },
//     name : Sequelize.STRING,
//     email: Sequelize.STRING
// });
// ******************************************************/
// module.exports = User;