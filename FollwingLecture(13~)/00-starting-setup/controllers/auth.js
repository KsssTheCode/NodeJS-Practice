const User = require("../models/user");
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator/check');

//Node.js 내장 암호 라이브러리 : 고유한 무작위 값을 생성해줌
const crypto = require('crypto');

const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const user = require("../models/user");

//import된 nodemailer가 createTransport메소드를 통해 import된 sendgridTransport변수를 사용할 수 있게 해줌
//import된 sendgridTransport로 환경 설정값을 설정함
const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        //아래 두 값은 SendGrid계정에서 확인 가능
        api_user : 'TW6GR7KKTgKwfy0ufRBxUg',
        api_key : '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'
    }
}));

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    //session사용으로 인한 주석처리
    //const isLoggedIn = req.get('Cookie').split('=')[1];
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage : message,
        //locals로 지역변수 등록으로 인한 주석처리
        //isAuthenticated: req.session.isLoggedIn
        //csrfToken : req.csrfToken()
        oldInput: {
            email: '',
            password: ''
        },
        validationErrors: []
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message,
        //locals로 지역변수 등록으로 인한 주석처리
        //isAuthenticated: req.session.isLoggedIn
        //csrfToken : req.csrfToken()
        oldInput: {
            email: '', 
            password: '', 
            confirmPassword: ''
        },
        //에러메세지
        validationErrors: []
    });
  };

exports.postLogin = (req, res, next) => {
    /*
        로그인 테스트를 위해 항상 true로 하여 로그인이 가능하도록 함
        //req.isLoggedIn = true; 
        isLoggedin에 대한 정보는 같은 요청을 다루는 동안에만 우효함
        따라서, redirect되어 shop.js의 getIndex를 거치게되면 해당 데이터는 사라지게됨
    */
    // session사용으로 인한 주석처리
    // res.setHeader('Set-Cookie', '키=밸류; 키-밸류; ...') , 
    //res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly');

    //req.session.키값 = 밸류값;으로 설정 가능
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if(!errors.isEmpty()){ //errors변수에 오류가 수집되었다면, (유효성검사를 통과하지 못했다면)
        //422오류 : 유효성 부적합 오류
        return res
                .status(422)
                .render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    //발생한 오류들을 배열로 반환
                    errorMessage: errors.array()[0].msg,
                    oldInput: {
                        email: email, 
                        password: password
                    },
                    validationErrors: errors.array()
                });
    }

    /* 회원가입 구현으로 인한 주석처리 *****************
    User.findById('63c4d04b0e91229e61653ef8') 
    ********************************************/
    User.findOne({email: email})
    .then(user => {
        if(!user){
            return res
                .status(422)
                .render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    //발생한 오류들을 배열로 반환
                    errorMessage: 'Invalid email or password!',
                    oldInput: {
                        email: email, 
                        password: password
                    },
                    validationErrors: []
                });
        }
        //compare(입력된값, 비교할값), 동일하다면 true반환 
        bcrypt
            .compare(password, user.password)
            .then(doMatch => {
                if(doMatch){ //일치한다면
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    //redirect('/');는 DB와 관계없이 독립적으로 실행되기때문에
                    //뷰에 모든 파일이 로딩되는데 시간이 소요되거나, refresh해야 보여지는 경우를 대비하여
                    //session을 저장한 이후 redirect하도록 함
                    return req.session.save(err => {
                        console.log(err);
                        return res.redirect('/');
                    });
                }
                //일치하지 않는다면
                return res
                    .status(422)
                    .render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        //발생한 오류들을 배열로 반환
                        errorMessage: 'Invalid email or password!',
                        oldInput: {
                            email: email, 
                            password: password
                        },
                        validationErrors: []
                    });
                res.redirect('/login');
            })
            .catch(err => {
                console.log(err);
                res.redriect('/login');
            })
        })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    //req에서 validationResult()를 호출하면 해당 실행 라우트 전 라우트의 오류를 추출
    const errors = validationResult(req);

    if(!errors.isEmpty()){ //errors변수에 오류가 수집되었다면, (유효성검사를 통과하지 못했다면)
        //422오류 : 유효성 부적합 오류
        return res
                .status(422)
                .render('auth/signup', {
                    path: '/signup',
                    pageTitle: 'Signup',
                    //발생한 오류들을 배열로 반환
                    errorMessage: errors.array()[0].msg,
                    oldInput: {
                        email: email, 
                        password: password, 
                        confirmPassword: confirmPassword
                    },
                    //errors.array()는 [location: ~~, param: 'email', 'password', ~~]과 같은 형식으로 출력되므로
                    //프론트에서 해당 param으로 유효성검사를 통과하지 못한 부문을 선택할 수 있도록 함
                    validationErrors: errors.array()
                });
    }

    // 유효성검사에서 중복여부 확인 진행하므로 주석처리
    // User
    //     .findOne({email : email})
    //     .then(userDocument => {
    //         if(userDocument){
    //             req.flash('error', 'E-Mail exists already, please pick a different one.');
    //             return res.redirect('/signup');
    //         }
    //       return bcrypt
    //2번째 매개변수는 몇 차례의 해싱을 적용할 것인지 지정
    bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
        const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: []}
        })
        return user.save();
    })
    .then(result => {
        //transporter.sendMail 메소드의 .then()블록으로 redirect를 보내도 되지만,
        //의존성을 없애기위해 사용하지 않고 해당 메소드를 return문과 분리하여 redirect하는 방식선택
        res.redirect('/login');

        //transporter를 이용해 메일을 전송하는 메소드
        return transporter.sendMail({
            to: email, //수신인
            from: 'mysunghun585@gmail.com', //발신자
            subject: 'Signup Succeeded', //제목
            html: '<h1>Successfully signed up!</h1>' //내용
        });
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
}

exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    res.render('auth/reset', {
        path: '/reset',
        pageTitle : 'Reset Password',
        errorMessage: message
    });
}

exports.postReset = (req, res, next) => {
    //보안을 위한 토큰 생성 (Reset Password가 클릭될 시 생성되도록)
    //crypto.randomBytes(byte수, 콜백함수) :byte수만큼의 무작위수를 생성
    crypto.randomBytes(32, (err, buffer) => {
        if(err) {
            console.log(err);
            return res.redirect('/reset');
        }
        //buffer는 16진수를 갖기때문에 아스키문자로 변환하기위해 toString()사용
        const token = buffer.toString('hex');
        User
            .findOne({email: req.body.email})
            .then(user => {
                if(!user) { //동일한 이메일을 가진 유저가 없을 때
                    req.flash('error', 'No account with that email found.');
                    return res.redirect('/reset');
                }
                //있을 경우, 유저에게 resetToken부여
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(result => { //위 과정 성공 시 이메일 전송
                res.redirect('/');
                transporter.sendMail({
                    to: req.body.email, //수신인
                    from: 'mysunghun585@gmail.com', //발신자
                    subject: 'Password reset', //제목
                    html: `
                        <p>You requested the password reset</p>
                        <p>Click this <a href="//localhost:3001/reset/${token}">Link</a> to set a new password.</p>   
                    `
                });
            })
            .catch(err => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    });
}

exports.getNewPassword = (req, res, next) => {
    //토큰 보유 여부 검사
    const token = req.params.token;
    User
        .findOne({ 
            resetToken: token, 
            resetTokenExpiration: { 
                $gt: Date
                        .now()//토큰의 기간(1시간)이 유효한지 검사하고,
                        .then(user => { //토큰에 맞는 사용자를 찾음
                            let message = req.flash('error');
                            if(message.length > 0) {
                                message = message[0];
                            } else {
                                message = null;
                            }
                        
                            res.render('auth/new-password', {
                                path: '/new-password',
                                pageTitle : 'New Password',
                                errorMessage: message,
                                userId: user._id.toString(), //BSON타입의 id를 string으로 변환
                                passwordToken: token
                            });
                        })
                        .catch(err => {
                            const error = new Error(err);
                            error.httpStatusCode = 500;
                            return next(error);
                        })
            }
    });
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken; //getNewPassword에서 rendering시 첨부한 passwordToken
    let resetUser;
    
    User.findOne({
        resetToken: passwordToken, 
        resetTokenExpiration: {$gt: Date.now()},
        _id: userId
    })
    .then(user => {
        resetUser = user; //비밀번호가 변경될 user의 정보를 resetUser에 담음
        return bcrypt.hash(newPassword, 12)
    })
    .then(hasedPassword => {
        resetUser.password = hashedPassword;
        //resetToken은 더 이상 값을 저장할 필요가 없으므로 undefined로 없애줌
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    })
    .then(result => { //완료 후 로그인 페이지로 렌더링
        res.redirect('/login');
    })
    .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}