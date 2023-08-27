const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  //REST API와 동일하게 header설정
  const authHeader = req.get('Authorization');
  //REST API와 다르게 미들웨어에서는 토큰의 true/false값만 지정해주고,
  //해당 실행 resolver까지 넘어가서 검사
  if (!authHeader) {
    // const error = new Error('Not authenticated.');
    // error.statusCode = 401;
    // throw error;
    //REST API와 다르게 에러를 전송하지 않고, decode가 되지 않도록만 설정
    req.isAuth = false;
    return next();
  }

  const token = authHeader.split(' ')[1];

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'supersecret');
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  console.log(decodedToken);
  req.userId = decodedToken.userId;
  //위 모든 검사를 통과했다면 isAuth를 true로 설정
  req.isAuth = true;
  next();
};
