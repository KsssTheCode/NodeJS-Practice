const expect = require('chai').expect;
const mongoose = require('mongoose');

const User = require('../models/user');
const FeedController = require('../controllers/feed');

describe('Feed Controller', function() {
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
            });
            return user.save();
        })
        .then(() => {
            done();
        });
    });

    it('should add a created post to the posts of the creator', function(done) {
        const req = {
            body: {
                title: 'test post',
                content: 'testing'
            },
            file: {
                path: 'abc'
            },
            userId: '5c0f66b979af55031b34728a'
        };

        const res = { 
            status: function() {
                return this;
            }, 
            json: function() {}
        };

        FeedController
            .createPost(req, res, () => {})
            .then(savedUser => {
                expect(savedUser).to.have.property('posts');
                expect(savedUser.posts).to.have.length(1); //게시물이 1개가 추가되었기 때문
                done();
            });
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