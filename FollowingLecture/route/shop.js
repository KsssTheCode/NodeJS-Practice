const path = require('path');

const express = require('express');

// MVC패턴 사용으로 불필요해진 변수
// const rootDir = require('../util/path');
// MVC패턴 사용으로 불필요해진 변수
// const adminData = require('./admin');

const router = express.Router();

const shopController = require('../controllers/shop')

//get();를 사용하여 실행 제한
//만약, use()를 사용하였다면 실행 순서에 각별한 주의가 요구됨  
// 콜백함수 [controllers] - products.js로 이관 후 불러오기
router.get('/', shopController.getIndex);//(req, res, next) => {
//     /* __dirname ***********************************
//        - 운영체제의 절대경로를 이 프로젝트 폴더로 고정해주는 역할
//        - 자신이 사용된 파일의 경로를 알려줌 (route폴더)
//     ************************************************/
//     //res.sendFile(path.join(__dirname, '../', 'views', 'shop.html'));
//     // path.join()메소드가 windows와 linux모두 사용가능하도록 고안된 방식이기때문에 '/'는 사용하지 않음
//     //adminData.products로 export된 객체 사용
//     const products = adminData.products;

//     //일반 html파일을 렌더링하는 경우
//     //res.sendFile(path.join(rootDir, 'views', 'shop.html'));

//     /* res.render('렌더링할pug파일', {키:밸류, ...}); ***************
//        - pug파일을 렌더링하는 경우,
//          pug 엔진의 views가 views폴더 안에 있음을 이미 정의했으므로
//          경로를 구축할 필요없이 views파일 내의 shop만 입력해주면 됨
//        - 매개변수로 제시된 키-밸류 값에 대해서만 해당 pug파일 내에서 사용 가능

//        - <%- : Unescaped HTML Code
//              : 사이트 간 스크립팅 공격을 피해 HTML코드를 렌더링 할 수 있도록 함
//        - <%= : HTML코드를 텍스트형식으로 렌더링함
//     ************************************************************/
//     //hasProducts키 값의 경우 handlebars구문에 사용하기 위해 products.length > 0 이라는 자체를 의미
//     res.render('shop', { 
//         prods : products, 
//         pageTitle : 'Shop', 
//         path:'/',
//         // handlebars에서 사용하는 구문 
//         // hasProducts : products.length > 0, 
//         // activeShop : true,
//         // productCSS : true
//         // layout : false // 기본레이아웃설정을 하지 않을 때 
//     });
// });

router.get('/products', shopController.getProducts);
router.get('/products/:productId', shopController.getProduct);
// //동적라우터요청보다 지정라우터요청이 더 앞으로 와야 runtime에러가 발생하지 않음
// // router.get('/products/delete');
router.get('/cart', shopController.getCart);
router.post('/cart-delete-item', shopController.postCartDeleteProduct);
router.post('/cart', shopController.postCart);
// // //router.get('/checkout', shopController.getCheckout);
router.get('/orders', shopController.getOrders);
router.post('/create-order', shopController.postOrder);

module.exports = router;