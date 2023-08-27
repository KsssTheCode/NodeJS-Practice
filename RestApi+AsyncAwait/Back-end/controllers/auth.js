const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    bcrypt
        .hash(password, 12) //12솔트(강도)로 password 해쉬화
        .then(hashedPassword => {
            const user = new User({
                email: email, 
                password: hashedPassword, 
                name: name
            });
            return user.save();
        })
        .then(result => {
            res.status(201).json({message: 'User created', userId: result._id});
        })
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    User
        .findOne({email: email})
        .then(user => {
            if(!user){
                const error = new Error('A user with this email could not found');
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            if(!isEqual){
                const error = new Error('Wrong password');
                error.statusCode = 401;
                throw error;
            }

            //JWT(JSON Web Token)생성 : jsonwebtoken패키지 사용
            const token = jwt.sign({ //새로운 서명을 만들고 JWT에 포함시키는 메소드 : sign({입력할정보:정보의값}, '비공개키(무작위입력가능)', {유효기간:'기간'})
                                email: loadedUser.email, 
                                userId: loadedUser._id.toString()
                          },
                          'supersecret', //추후 프론트엔드에서 받아온 토큰을 인증(검사)하기 위한 비공개 키
                          {expiresIn: '1h'}
                          );
            res
                .status(200)
                .json({
                    message: 'Login succeed', 
                    token: token, 
                    userId: loadedUser._id.toString()
                });
        })
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });
};