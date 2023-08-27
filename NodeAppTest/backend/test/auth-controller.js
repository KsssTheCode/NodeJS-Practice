const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const AuthController = require('../controllers/auth');
const user = require('../models/user');

describe('Auth Controller - login', function(){
    before(function(done) {
        mongoose
        .connect(
            //실제 production DB가 아닌, test-message라는 테스트환경을 조성해주어야 함
            'mongodb+srv://KangSunghoon:Tjdgnsqkqh12!@myfirstmongodb.ptwvaft.mongodb.net/test-messages?retryWrites=true'
        )
        //성공 시, app연결이 아닌 테스트를 실행
        //지금하는 테스트는 올바른 사용자를 이용하여 응답객체가 올바르게 설정되는지 확인하는게 목적
        .then(result => { //dummy user생성
            const user = new User({
                email: 'test@test.com',
                password: 'qwe123',
                name: 'Test',
                posts: [],
                _id: '5c0f66b979af55031b34728a'
            })
            return user.save();
        })
        .then(() => {
            done();
        })
    });
    it('should throw an error with code 500 if accessing the database fails', function(done){ //done을 인수로 전달하여 호출할 수 있도록 함(Async를 위해)
                                                                                              //done을 인수로 전달하게 되면 Mocha가 기본값으로 비동기식이 있는지 확인함
        sinon.stub(User, 'findOne');
        User.findOne.throws();

        const req = {
            body: {
                email: 'test@test.com',
                password: 'test'
            }
        };

        AuthController.login(req, {}, () => {}).then(result => {
            //console.log(result);
            expect(result).to.be.an('error'); //'error'이외에도 String, Object, null, Promise등이 있음 
            
            //위 코드에서 오류가 발생할 것을 예상하고, (auth.js본문에 json데이터로 보낸 후 return문을 강제로 실행했기때문)
            expect(result).to.have.property('statusCode', 500);
            done(); //Mocha에게 이 코드의 실행을 기다리라고 신호함
        });

        User.findOne.restore();
    });

    //Db와 연결된 테스트
    it('should send a response with a valid user status for an existing user', function(done) {
        // before()메소드 사용으로 인해 주석처리
        // mongoose
        // .connect(
        //     //실제 production DB가 아닌, test-message라는 테스트환경을 조성해주어야 함
        //     'mongodb+srv://KangSunghoon:Tjdgnsqkqh12!@myfirstmongodb.ptwvaft.mongodb.net/test-messages?retryWrites=true'
        // )
        // //성공 시, app연결이 아닌 테스트를 실행
        // //지금하는 테스트는 올바른 사용자를 이용하여 응답객체가 올바르게 설정되는지 확인하는게 목적
        // .then(result => { //dummy user생성
        //     const user = new User({
        //         email: 'test@test.com',
        //         password: 'qwe123',
        //         name: 'Test',
        //         posts: [],
        //         _id: '5c0f66b979af55031b34728a'
        //     })
        //     return user.save();
        // })
        //
        const req = {userId: '5c0f66b979af55031b34728a'};
        const res = {
            statusCode: 500,
            userStatus: null,
            status: function(code) {
                this.statusCode = code;
                return this;
            },
            json: function(data) { //data는 user.status인 status키를 가진 객체
                this.userStatus = data.status;
            }
        };

        //controller > auth.js의 getUserStatus()메소드를 실행
        AuthController.getUserStatus(req, res, () => {}).then(() => {
            expect(res.statusCode).to.be.equal(200); //추출 시에 성공하도록 200
            expect(res.userStatus).to.be.equal('I am new!');
            done();
            // after()메소드 사용으로 인해 주석처리
            // User.deleteMany({}) //테스트완료 후, 모든 사용자 삭제
            //     .then(() => {  
            //         mongoose
            //          .disconnect() //DB와의 연결끊기
            //          .then(() => { //done()으로 Mocha에게 모든 프로세스의 종료를 알림
            //              done();
            //          })
            //      });
        });
        // })
        // .catch(err => console.log(err));
    });

    after(function(done) {
        User.deleteMany({}) //테스트완료 후, 모든 사용자 삭제
            .then(() => {  
                return mongoose.disconnect() //DB와의 연결끊기
            })
            .then(() => { //done()으로 Mocha에게 모든 프로세스의 종료를 알림
                done();
            });
    });
});