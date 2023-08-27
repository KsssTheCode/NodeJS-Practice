const path = require('path');

const express = require('express');

const { body, check } = require('express-validator/check');

const adminController = require('../controllers/admin');

//Authentication검사를 실행하는 미들웨어(구문)을 필요한 라우터에서 실행하도록 함
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
    '/add-product', 
    [
        body('title')
            .isString()
            .isLength({min:3, max:30})
            .trim(),

        //file-picker사용으로 인한 주석처리 
        // body('imageUrl')
        //     .isURL(),
        
        body('price')
            .isNumeric()
            .isLength({min:3})
            .trim(),

        body('description')
            .isLength({min:15, max:300 })
            .trim()
    ],
    isAuth, 
    adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post(
    '/edit-product', 
    [
        body('title')
            .isString()
            .isLength({min:3, max:30})
            .trim(),

        //file-picker사용으로 인한 주석처리 
        // body('imageUrl')
        //     .isURL(),
        
        body('price')
            .isNumeric()
            .isLength({min:3})
            .trim(),

        body('description')
            .isLength({min:15, max:300 })
            .trim()
    ],
    isAuth, 
    adminController.postEditProduct);

//비동기식 요청을 사용하기위한 주석처리
//router.post('/delete-product', isAuth, adminController.postDeleteProduct);
//post라는 http메소드를 사용해도 상관없지만, 의도의 명확하게 보여주기위해 delete()사용
router.delete('/product/:productId', isAuth, adminController.deleteProduct);

module.exports = router;
