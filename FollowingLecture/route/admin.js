const path = require('path');

const express = require('express');

// MVC패턴 사용으로 불필요해진 변수
//const rootDir = require('../util/path');
// MVC패턴 사용으로 불필요해진 변수 => products.js로 이동
// const products = [];

const adminController = require('../controllers/admin');

const router = express.Router();


// 시작경로(path)를 공유하더라도, 메소드가 다르면 반복해서 사용 가능 (메소드가 다르면 route도 다르기때문)
// 만약 router를 호출하는 구문(app.js)에서 겹치는 경로('/admin')를 이미 필터링했다면 겹치는 경로의 파일만 사용 가능 (생략가능)
// ex) [admin.js] router.get('/admin/add-product',~~) -> [app.js] app.use(adminRoutes) (O)
//     [admin.js] router.get('/add-product',~~) -> [app.js] app.use('/admin/adminRoutes) (O)

// /admin/add-product => GET
// 콜백함수를 [controllers] - products.js로 이관 후 불러오기
router.get('/add-product', adminController.getAddProduct);//(req, res, next) => {
    // PUG엔진, EJS엔진 모두에서 사용가능
    // view파일이 들어갈 매개변수에는 확장자까지 입력하지 않아도됨
    // res.render('add-product', {
    //     pageTitle:'Add Product', 
    //     path:'/admin/add-product',  
        // handlebars에서 사용하는 구문 
        // formsCSS : true, 
        // productCSS : true, 
        // activeAddProduct : true
    // });

//     //res.sendFile(path.join(__dirname, '../', 'views', 'add-product.html'));
//     //res.sendFile(path.join(rootDir, 'views', 'add-product.html'));
// });


// /admin/add-product => POST
// 콜백함수를 [controllers] - products.js로 이관 후 불러오기
router.post('/add-product', adminController.postAddProduct);//(req, res, next) => {
// //     products.push({ title : req.body.title });
// //     res.redirect('/');
// // });


// /* MongoDB사용으로 인한 주석처리 *************************************/
router.get('/products', adminController.getProducts);
// // // " : " = 동적 경로 세그먼트
// // // get방식에서만 사용가능, post에서는 설정하지 않아도 데이터를 가지고 넘어감
router.get('/edit-product/:productId', adminController.getEditProduct);
router.post('/edit-product', adminController.postEditProduct);

router.post('/delete-product', adminController.postDeleteProduct);


// [controllers] - products.js로 이관 후 변경 (Data가 아닌 Router만 내보내기)
// exports.routes = router;
// exports.products = products;
module.exports = router;
