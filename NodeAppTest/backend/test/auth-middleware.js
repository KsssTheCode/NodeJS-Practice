const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const sinon = require('sinon');

const authMiddleware = require('../middleware/is-auth');

describe('Auth middleware', function(){
    //오류가 빌생했을 때 성공할 수 있는 테스트
    it('should throw an error if no authorization header is present', function() {
        //권한 헤더를 얻는 더미 요청 객체
        const req = {
            get: function(headerName){
                //값이 중요한게 아니라, 헤더가 없는 상황을 시뮬레이션하기위함으로 null을 반환하도록함
                //get('Authorization')에 대해 값을 반환하지 않음
                return null;
            }
        };
    
        //auth.js파일의 메소드(유닛) 하나 그대로의 형식에 chai메소드를 이어붙인 형태
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw('Not authenticated.'); //throw에러메세지는 실제 에러메세지와 똑같아야함 
    });
    
    it('should throw an error if the authorization header is only one string', function() {
        const req = {
            get: function(headerName){
                return 'dummy value';
            }
        };
    
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(); //정확한 오류메세지가 아니라면 throw()메소드의 인수를 비워줌으로써 오류의 출력 여부만 확인
    });

    //jwt패키지의 verify()메소드를 검사할 수 없으므로, 오류를 유도하는 방향 선택함
    it('should throw an error if the token cannot be verified', function(){
        const req = {
            get: function(headerName){
                return 'Bearer abc'; //잘못된 토큰을 임의로 생성하여 오류 유도
            }
        };

        //잘못된 토큰(오류)를 유도했기때문에 throw()에서 오류를 감지하게되고 성공하게됨
        expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
    });

    //jwt패키지의 verify()메소드를 검사할 수 없으므로, decodedToken을 검사하는 방향으로 선택 
    //하지만, 이 로직의 가장 큰 단점은 유효하지 않은 토큰이 있을 때 오류를 출력해야하는 테스트인데,
    //      위 토큰보다 먼저 실행된다면 테스트에 실패하게됨

    //verify를 통과해야지만 try-catch문을 빠져나와 decodedToken을 생성하여 req.userId라는 객체를 덮어쓸 수 있기때문
    it('should yield a userid after decoding the token', function(){
        const req = {
            get: function(headerName){
                return 'Bearer abcdefg'; //잘못된 토큰
                                         //어차피 더미 토큰이 지나치게 짧아 변경되고, verify()메소드의 기준을 충족하지 않기 때문에 오류가 발생함
            }
        };
        /***************************************************************************************************
        1. 어차피 더미 토큰이 지나치게 짧아 변경되고, verify()메소드의 기준을 충족하지 않기 때문에 오류가 발생함
        2. 따라서, verify()메소드르 비활성화하고 userId를 끌어내는 방법을 찾아야함
        3. 그 대안으로 검증 메소드(verify())를 보다 단순한 메소드로 교체하는 방식
        아래는 임시로 생성한 function으로 verify()메소드를 대체하였고 userId만 바로 호출하는 방식으로 is-auth파일에서 실행되게됨
        3*. 단, 실행 순서에 따라 기존의 verify()메소드가 필요한 테스트들도 아래 임의의 function으로 실행하게되어 테스트에 실패함
        4. 따라서, sinon패키지의 stub를 이용하여 원본함수를 복원해야함
        *****************************************************************************************************/
        sinon.stub(jwt, 'verify'); //복원하고자하는객체, '복원하고자하는메소드'

        // jwt.verify = function() {
        //     return { userId: 'abc'};
        // }
        //sinon은 함수호출을 등록하는 등의 기능이 있어 실행되는 요소의 종류와 관계없이 이 함수가 호출될지의 여부 등을 테스트 할 수 있음
        //따라서, 임의로 교체했던 function을 아래와 같이 변경
        jwt.verify.returns({userId: 'abc'});

        //authMiddleware를 수동으로 호출하여 요청과 응답(req), 요청( {} ), next()함수( () )를 전달하는 더미 요청
        authMiddleware(req, {}, () => {});
        //위 구문을 통해 얻은 req가 userId를 가지고 있는지 예측함
        expect(req).to.have.property('userId');
        expect(req).to.have.property('userId', 'abc'); // ??? 중복인데 무슨의미인지 모르겠음
        expect(jwt.verify.called).to.be.true; //verify()메소드가 호출되었는지 확인

        //원본함수를 복원
        jwt.verify.restore(); 
    });
});

