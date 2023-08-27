/*

* NodeJS의 Core Modules

  - http : Hyper Text Transfer Protocol
         : 서버 출시하거나 요청을 보내는 것과같은 작업에 도움을 줌
         : Node.js앱이 다른 서버로 요청을 보내 여러 서버 간 소통을 가능하게 함
  - https : Hyper Text Transfer Protocol Secure
  - fs : 
  - path : 경로를 국축하는데 사용 (OS에 따라 다름)
  - os : Operating System, 운영체게 관련 도움을 줌

* NodeJS의 Web구동 방식(순서)
  - Client -> Request -> server -> Reponse -> Client

* 

*/

/*

* NodeJS의 Event Loop
  - Single Thread Javascript
  - Core Node Aplication이 Event Loop에 의해 관리됨
  - 시스템이 종료되지 않고 실행되기 위한 관리 체계 (만약 시스템 종료를 원한다면 process.exit메소드 사용가능)

*/

/*

* Stream & Buffers
  - 입력받은 값을 Stream을 통해 Chunk단위로 Parsing하는 작업을 거치게 되는데, 
    Node.js같은 경우 입력받은 값이 얼마나 큰 지를 모르고 입력값이 파싱되기까지 기다릴 수 없기 때문에
    Buffer를 이용하여 이미 파싱된 데이터(Chunk)를 미리 다룰 수 있도록 함
  - 코드작성으로 Chunk를 선택하여 사용할 수 없이 때문에 들어오는 Chunk를 체계화하기 위해 Buffer를 사용함

  - Buffer : 버스 정류장의 개념
           : 여러개의 Chunk를 보유하고, 파싱이 끝나기 전에 사용할 수 있도록 함

*/

/*

* Single Thread, Event Loop & Blocking Code
  - Thread : 운영체제에서의 프로세스로 실행되는 흐름의 단위
  - 여러 개의 요청을 하나의 Thread로 처리하는 방법
  - 파일을 처리할 때 상당한 시간이 소요되는데, 만약 크기가 큰 파일을 처리하게된다면 처리될 때까지 그 다음 요청은 거절되거나 지연됨

* Event Loop과 Worker Pool에서의 연산
  - Event Loop에서의 연산처리 (이벤트, 콜백함수)
    : 우선적으로 Event Loop가 자동으로 실행되며 코드를 파악하게됨. (호이스팅)
    : 이후, 파악된 이벤트를 바탕으로 요청에 맞는 이벤트를 실행할 수 있도록 함 (콜백포함)
    : 이벤트는 연산단위가 작아서 실행에 문제가 되지 않음
  - Worker Pool에서의 연산처리 (파일연산)
    : File System에 의해 자동으로 실행되며 앱을 실행하는 운영 체제와 깊은 연관이 있음 
    : Javascript와 분리되어 실행되며 다른 여러 스레드에서 작동할 수 있고(Multi Thread), 코드로부터 분리되어있음
    : 파일 연산이 완료된 후에는 Trigger Callback에 의해 Event Loop로 전송됨

  => 연산이 가벼운 이벤트나 콜백함수는 Event Loop에서 실행
     무거운 연산이 요구되는 파일 연산은 Worker Pool에서 실행
     Worker Pool에서 파일연산이 완료된 후 Event Pool로 전송하여 적합한 이벤트 실행

  ==> 모두 Node.js에 내장된 기능으로 개별적인 코드작성이 필요없음

* Event Loop의 연산과정
  1. Timers => Timer Callback
     반복이 시작되기 전 Timer Callback이 있는지 확인하고, Timer가 종료되었다면 해당 Callback함수 실행
     (Timer Callbacks : SetTimeout, SetInterval)

  2. Pending Callbacks  => 대기 Callback, I/O Event Callback
     다른 Callback 확인하고, 연산이 끝난 I/O에 관련된 Callback함수 실행
     만약, 아직 처리되지 않은 Callback이 많이 남았다면 남은 Callback은 다음 반복에서 실행하도록 미룸
     (I/O : Input/Output연산으로 주로 오래 걸리는 블로킹 연산(ex. 파일연산, 네트워크연산))
     
  3. Poll => 기타 이벤트 Callback, Opening Callback
     NodeJS가 새로운 I/O이벤트를 확인하고, 해당 이벤트의 콜백을 최대한 빨리 실행하도록 함
     만약, 처리가 불가하다면 실행을 미루고 Pending Callbacks로 미룸

     Timer 시간이 다 되어 실행해야하는 Callback을 확인하고, 있다면 반복을 돌지 않고 즉시 해당 Callback을 처리

  4. Check => SetImmediate Callback
     SetImmediate Callback을 실행하지만, 반드시 Opening Callback이 모두 실행된 다음에 실행
     SetImmediate Callback의 경우, 보통 setTimeout보다 근소하게 빠르지만 현재 주기가 끝나거나 현재의 반복에 생성된 콜백을 처리한 후에 실행됨

  5. Close Callback
     닫는 이벤트 콜백이 모두 실행됨(종료이벤트)
  
  6. Check Rest Callback
     등록한 이벤트 핸들러가 남았는지 확인
     (내부적으로 Opening 이벤트 리스너 추적하여 남은 갯수를 카운팅 함)
     (무한반복으로 가동했을 경우, 남은 갯수는 항상 1 이상)

  7. 남은 연산 수가 0일 경우, process.exit();

*/

// Importing HTTP Module
// 모든 파일에서 읽을 수 있어야하므로 require(); (노드JS 기본 탑재 메소드)
const http = require('http');
const fs = require('fs');

/*  createServer(req, res);  ***************************************************************/
// 서버를 실행하도록 하는 메소드
// createServer메소드에 필요한 request와 response를 생성

// function rqListener(req, res) {

// }
// http.createServer(rqListener);

//익명함수로도 사용가능
//http.createServer(rqListener(req, res));

//화살표함수
const server = http.createServer((req,res)=>{
  console.log(req.url, req.method, req.headers);
  //process.exit();
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
    // Chunk를 담을 body
      const body = [];
    
    /*  on(이벤트명, 실행할코드);  ***************************************************************/
      req.on('data', (chunk) => {
        console.log(chunk);
        body.push(chunk);
    });  
    return req.on('end', () => {
      // 파싱된 Chunk들을 담은 body객체의 내용물들을 이어주고(concat()) 문자열로 만들어줌(toString())
      const parsedBody = Buffer.concat(body).toString();
      console.log(parsedBody);
      const message = parsedBody.split('=')[1]
      /*  writeFileSync (경로+파일명, 입력할 값)  ***************************************************************/
      // 해당 경로에 해당 이름의 파일을 생성하고, 입력할 값을 적어주는 메소드
      // Sync(Synchronous)(동기화) : 파일이 생성되기 전까지 코드 실행을 막는 메소드
      //                         : sync구문이 완료될 때까지 다른 요청들이 받아들여지지 않으므로 Node.js에서는 사용하지 않는 것을 권장
      //fs.writeFileSync('Basic/message.txt', message ); 
      
      /*  writeFile (경로+파일명, 입력할 값, 오류가발생했을 때의 실행구문)  ***************************************************************/
      // 성공했을 경우 그 다음 코드 실행
      fs.writeFile('Basic/message.txt', message, (err) => {

        /*  statusCode  ***************************************************************/
        // 다음 경로를 재지정하는 상태코드
        res.statusCode = 302;
        
        /*  Location  ***************************************************************/
        // 브라우저에서 제공하는 Default Header
        // ' / '로 설정하게되면 실행되고있는 Host(localhost)를 자동으로 사용하게 됨
        res.setHeader('Location', '/');
        
        // res.writeHead(302, { 'Location' : '/'}); //로도 표현 가능함
        return res.end();
      });
    })

  }

  /*  res.setHeader('Content-Type', 'application/json');  ***************************************************************/
  // Content-type과 전달할 객체를 설정하는 메소드
  res.setHeader('Content-type', 'text/html');

  /*  res.write();  ***************************************************************/
  // 입력받아 전달해주는 메소드
  /*  res.end();  ***************************************************************/
  // 입력받을 요소를 끝맺어주는 메소드
  res.write('<html>');
  res.write('<head><title>My first page</title></head>');
  res.write('<body><h1>Hello from my Node.js Server!</h1></body>');
  res.write('</html>');
  res.end();

});

/*  listen(port No);  **********************************************************************/
//코드가 종료되더라도 node server가 종료되지않고 무한으로 대기할 수 있도록 하기 위함
//listen메소드가 잘 작동하고 있다면, 터미널에 해당 파일 실행 시 종료되지 않고 커서가 계속 깜빡임
server.listen(3000);