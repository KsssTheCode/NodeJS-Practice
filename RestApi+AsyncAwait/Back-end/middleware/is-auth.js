const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if(!authHeader){
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }

    //get()메소드로 header밸류를 호출 (=> Bearer : 토큰 형식으로 호출)
    //split으로 토큰만 추출
    //const token = req.get('Authorization').split(' ')[1];
    const token = authHeader.split(' ')[1];

    let decodedToken;

    try{
        decodedToken = jwt.verify(token, 'supersecret') //해독 후 확인하는 과정 (verify(토큰))
    } catch (err) { //해독 실패 시
        err.statusCode = 500;
        throw err;
    }

    if(!decodedToken) {//토큰 verify실패 시
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }

    //위 verify를 통과하게 되면, 해당 Token을 번역하여 내부의 payload(data)에 접근 가능
    req.userId = decodedToken.userId;
    next();
};