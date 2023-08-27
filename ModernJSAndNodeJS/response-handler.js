/* #Origin case ******************************************/
// const fs = require('fs');

// const resHandler = (req, res, next) => {
//     fs.readFile('my-page.html', 'utf8', (err, data) => {
//       res.send(data);
//     });
// };

// module.exports = resHandler;
//여러개를 export해야한다면 exports.~~ 사용
/**********************************************************/

/***********************************************************
 * fs와 fs/promises의 차이 (origincase와 case1,2 모두 포함된 내용)

 * Promise기반 API 접근 방법
  - require문 => require('fs').promises; (fs객체의 promises속성)
  - import문 => require('fs/promises');
***********************************************************/


//기존의 코드와 다르게, 사용하는 파일에서 Import할 때 확장자명까지 명시해주어야함
/* #case1 : 변수 앞에 export 작성 ****************************/
//import fs from 'fs';
//promises를 사용하기위해 아래구문으로 변경
import fs from 'fs/promises';


/* 절대경로입력을 위한 import ***************************************************/

//최신 ES모듈 구문에는 전역구문이 존재하지 않음
//따라서, dirname, fileName, require, export, import 등의 구문이 사용 불가함
//이를 Known Issue라 부르며, 해당 구문들을 확보할 수 있는 대안들이 공식참고자료에 나와있음

// import path from 'path';
// import { dirname } from 'path';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
//import.meta.url은 일종의 전역 변수로 'response-handler.js'파일명의 경로를 제공
//fileURLToPath는 'import.meta.url'을 변환하여 path패키지가 작업할 수 있는 경로로 바꿔줌

const __dirname = dirname(__filename);
//위 '__filename'이라는 경로를 현재 파일로 가져다가 해당 파일이 존재하는 폴더로의 경로를 제공
/***************************************************************************/

export const resHandler = (req, res, next) => {
    /*File System(fs)에 파일을 읽어서 진행하는 방식******************/
        //파일을 읽는 등 코어 노드 모듈과 관련된 작업을 할 때
        //콜백 대신 프로미스를 사용하는 것이 좋음
        //(기존에는 비주류 언어라 불가했으나, 현재는 가능)
    // fs.readFile('my-page.html', 'utf8', (err, data) => {
    //   res.send(data);
    // });
    // => 
    fs.readFile('my-page.html', 'utf-8')
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        console.log(err);
      });

    /*********************************************************/

    /*express에서 노출한 response객체의 sendFile()메소드 사용***************************/
    // res.sendFile(path.join(__dirname, 'my-page.html')); // sendFile('절대경로');
    /****************************************************************************/
};
/********************************************************************************/

/* #case2 : export default로 export ***********************/
// import fs from 'fs';

// const resHandler = (req, res, next) => {
//     fs.readFile('my-page.html', 'utf8', (err, data) => {
//       res.send(data);
//     });
// };

// export default resHandler;
//export default는 파일 당 1번만 사용가능 
//(여러개를 export해야한다면 case1사용)
/**********************************************************/
