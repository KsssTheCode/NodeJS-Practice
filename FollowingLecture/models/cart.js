//Cart는 Product와 구별되는 독립적인 개체이므로 클래스로 생성함

const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Cart = sequelize.define('cart', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    }
});

module.exports = Cart; 

/* DB와의 연결로 전체 주석처리 ***************************************************************************************
const fs = require('fs');
const path = require('path');
const p = path.join(path.dirname(require.main.filename), 'data', 'cart.json'); //객체를 생성하게되면 정보를 담아둘 파일

module.exports = class Cart {
    //추가될때마다 Cart가 생성되는 것이 아니므로, 하나의 Cart에 추가되고 삭제되는 형식으로 접근해야함
    static addProduct(id, productPrice){
        //1. 기존의 Cart를 검사
        fs.readFile(p, (err, fileContent) => {
            let cart = {products: [], totalPrice: 0};

            if(!err){ //Cart가 존재할 시, 
                //cart에 들어갈 내용은 데이터가 저장된 파일(JSON)을 파싱한 것이 될 것
                cart = JSON.parse(fileContent);
            }
            //2. 추가하려는 상품이 Cart에 있는지 검사
            //각 prod를 순회하며 상품아이디가 매치되는 것이 있는지 검사하여 인덱스반환
            const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
            //반환받는 Index를 이용하여 상품 지칭
            const existingProduct = cart.products[existingProductIndex];

            let updatedProduct;
            //3-1. (있을 시) 수량 증가
            if(existingProduct){
                //기존의 카트에 상품은 추가되지 않으므로(중복X), updatedProduct와 existingProduct는 동일함
                updatedProduct = { ...existingProduct};

                //기존 updatedProduct의 qty(수량)에 +1
                updatedProduct.qty = updatedProduct.qty + 1;

                //중복없는 cart
                cart.products = [...cart.products];
                //수량이 증가된 updatedProduct를 해당상품에 대입
                cart.products[existingProductIndex] = updatedProduct;
            } else { //3-2. (없을 시) 상품을 Cart에 등록(추가)
                //updatedProduct에 id속성과 qty속성을 가진 객체 대입 (새로 추가된 것이므로 qty: 1, id는 추가되려는 상품의 id)
                updatedProduct = { id: id, qty: 1};
                
                //기존의 products(중복X)에 새로운 product추가하여 대입
                cart.products = [ ...cart.products, updatedProduct];
            }
            //추가되었을 시, 기존의 금액에 추가된 상품의 금액 추가 (String이므로 +를 붙여 숫자로 변환)
            cart.totalPrice = cart.totalPrice + +productPrice;

            //업데이트된 cart객체를 stringify하여 다시 기존의 경로에 업데이트
            fs.writeFile(p, JSON.stringify(cart), err => {
                console.log(err);
            });
        });

    }

    static deleteProduct(id, productPrice){
        fs.readFile(p, (err, fileContent) => {
            if(err){//장바구니가 없다면 삭제될 상품이 없으므로 넘어감
                return;
            } else {
                const updatedCart = {...JSON.parse(fileContent)};
                //삭제하고자하는 Cart의 상품 선택
                const product = updatedCart.products.findIndex(prod => prod.id === id);
                if (!product) {
                    return;
                }
                //삭제하고자하는 상품의 가격
                const productQty = product.qty;
                //삭제하고자하는 상품이 제외된 상품의 Cart배열
                updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);
                //삭제하고자하는 상품이 제외된 상품들의 총 가격 (총가격 - 삭제할상품가격 * 수량)
                updatedCart.totalPrice = updatedCart.totalPrice - productPrice * productQty;

                //삭제된 후의 Cart배열로 덮어쓰기
                fs.writeFile(p, JSON.stringify(updatedCart), err => {
                    console.log(err);
                });
            }
        });
    }

    static getCart(cb){
        fs.readFile(p, (err, fileContent) => {
            const cart = JSON.parse(fileContent);
            if(err){
                cb(null);
            } else {
                cb(cart);
            }
        });
    }
} *****************************************************************************************************************/