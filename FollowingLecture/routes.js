const fs = require('fs');

const requestHandler = (req, res) => {
    const url = req.url;
    const method = req.method;

    if(url === '/'){
        res.write('<html>');
        res.write('<head><title>Enter Message</title></head>');
        res.write('<body><form action="/message" method="POST"><input type="text" name="message"><button type="submit">Send</button></body>');
        res.write('</html>');
        return res.end();
    }
    
    if(url === '/message' && method === 'POST'){
        const body = [];
        
        req.on('data', (chunk) => { // data이벤트와 실행할 콜백구문(chunk전달)
        console.log(chunk);
        body.push(chunk);
        });

        return req.on('end', () => { // end이벤트와 실행할 콜백구문
            const parsedBody = Buffer.concat(body).toString();
            const message = parsedBody.split('=')[1]
  
            fs.writeFile('Basic/message.txt', message, (err) => { // 경로+파일명, 입력값, 오류 시 실행구문을 설정하여 입력이 들어올 시, 생성할 파일에 입력되도록 함
                res.statusCode = 302; // 다음 경로를 302상태코드로 설정
                res.setHeader('Location', '/'); // Default Header로 설정
                // res.writeHead(302, { 'Location' : '/'}); //로도 표현 가능함
                return res.end();
            });
        });
    }

    res.setHeader('Content-type', 'text/html'); // Content-type과 전달할 객체 유형 설정
  
    res.write('<html>');
    res.write('<head><title>My first page</title></head>');
    res.write('<body><h1>Hello from my Node.js Server!</h1></body>');
    res.write('</html>');
    res.end(); // 요소 입력 종료
};

/* 내보내기 방법1
   requestHandler가 실행되며 내보낼 것들은 module.exports에 담아둠
   키-밸류 형식의 객체를 담을 수도 있음 ( => module.exports = { a : A };)
   NodeJS가 module.exports에 담긴 것이 있는지 확인
   => app.js의 routes객체는 함수가 될 것임 */
//module.exports = requestHandler;

/* 내보내기 방법2
   여러개의 응답을 하나로 그룹화하여 보낼 때 사용
   => app.js의 routes객체는 객체가 될 것임
      따라서, 사용할 때에는 routes.handler 또는 routes.exText로 사용해야함 */
// module.exports = {
//     handler : requestHandler,
//     exText : 'haha!'
// }

/* 내보내기 방법 3
   각각 선언하여 내보내기 */
//module.exports.handler = requestHandler;
//module.exports.exText = 'haha!';

// NodeJS에 의해 특별히 지정된 단축키로 module.은 생략해도 가능함
exports.handler = requestHandler;
exports.exText = 'haha!';
