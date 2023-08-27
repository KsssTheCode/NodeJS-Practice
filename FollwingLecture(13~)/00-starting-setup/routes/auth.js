const express = require('express');
//express-validator의 check패키지 (유효성 검사 논리 추가)
//배열변수 내에 필요한 객체만 작성하면서 전체 패키지 중 해당 객체만 추출해서 사용이 가능(JS차세대문법)
//check : body, parameter, query parameter등에 대한 유효성 검사
//그 외에도 body, param, query, cookie, header만 선택하여 각 위치에 대한 유효성검사로 사용 가능
const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');
const router = express.Router();



/* controllers/auth.js에 화면전환 메소드를 작성하여 ***아래 구문 한 줄로 변형 ***********
router.get('/login', (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login'
    });
});
****************************************************************************/
router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);
router.post(
    '/login',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email address.')
            .normalizeEmail(),

        body('password', 'Password has to be valid.')
            .isLength({ min: 5,max: 15})
            .isAlphanumeric()
            .trim() //공백제거
    ],
    authController.postLogin);

//check('검사할필드이름' 또는 필드배열)
//check메소드(유효성검사)는 최종적으로 미들웨어를 반환
//isAplhanumeric (숫자와 문자만을 포함하는지 검사)
//custom (자신만의 유효성검사 생성)
//다양한 유효성 검사 메소드들은 validator-express 공식문서에서 확인가능
router.post(
    '/signup',
    [ //유효성 검사들을 일종의 그룹으로 묶어줌
        check('email') //'email'이라는 항목에 대한 검사
            .isEmail() // 이메일 형식인지 확인
            .withMessage('Please enter a valid email') //첨부할 메세지 (생략 시, 기본 메세지전송)
            .custom((value, {req}) => { //나만의 유효성 검사 생성 (true/false ,throwen error/promise를 반환)
            //임시 중복검사, 또는 특정 email사용불가처리 구문 
            // if(value === 'test@test.com'){ //'test@test.com이 아니라면
            //     throw new Error('This email adddress is forbidden.') //검사를 통과하지 못할 시, 제공할 에러와 그에 대한 구문
            // }
            // return true;

            //중복검사
                return User
                .findOne({email : value})
                .then(userDocument => {
                    if(userDocument){
                        //reject : promise 내부에 오류를 출력하고, reject()안에 작성된 오류 메세지로 전달
                        //express-validator가 reject를 탐지해 오류로 저장하여 reject() 내부의 오류메세지를 오류메세지로 저장
                        return Promise.reject('E-Mail exists already, please pick a different one.');
                    }
                });
        })
        .normalizeEmail(), 

        //body영역의 'password'에 대해서만 검사, 2번째 매개변수로 메세지를 담으면 기본 오류 메세지로 사용됨
        body('password', 'Please enter a password with only numbers and text and at least 5 characters')
            .isLength({min: 5, max: 15}) //최소길이 5, 최대길이 15인지 확인
            .isAlphanumeric()
            .trim(), //숫자나 일반 문자열로만 이루어져있는지 검사

        body('confirmPassword')
            .custom((value, { req }/*{req}라는 구조분해구문으로 요청 추출*/) => {
                if(value !== req.body.password){
                    throw new Error('Passwords have to match!');
                }
                return true;
            })
    ],
    authController.postSignup);
router.post('/logout', authController.postLogout);
router.get('/reset', authController.getReset); 
router.post('/reset', authController.postReset);
router.get('/new-password/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);
module.exports = router;