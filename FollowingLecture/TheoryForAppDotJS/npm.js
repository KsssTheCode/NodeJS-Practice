/*

* NPM (Node Project Manager) 
  - NodeJS 기본 내장 기능
  - 코어모듈(http,fs,path,os, ..)은 기본적으로 제공되나, 제3 패키지를 사용할 경우 따로 등록해주어야 함
  
* NPM 등록하기
  - node init으로 configuration파일 생성
  - configuration파일(package.json)의 script속성에 "명령어이름" : "파일경로를포함한이름" 추가
  - 터미널에 npm start(또는 run) 입력 시 해당 파일 실행 (start는 특수한 경우에만 실행하는 명령어)

* 제3자 패키지 설치 ( npm install )
  - Node.js에 내장되어있지 않은 외부의 기능이나 코드를 사용하고 싶을 경우 등록하여 사용
  - 패키지들을 사용함으로써 들어오는 요청을 파싱하고 사용자입력 유효성 검사 등의 작업에 도움을 받을 수 있음
  - npmjs 등의 클라우드 저장소를 통해 npm의 종류 선택 및 확인이 가능

  - 설치방법 정의 : 개발에 도움이되는 패키지(Development Package)와 서버에서 실행중인 앱에 도움이되는 패키지(Production dependency)를 구별해야함
               : Development Package로 설치할 경우 -> ~~~ --save-dev
               : Production Dependency로 설치할 경우 -> ~~~ --save
               : Global Usage로 설치할 경우 -> ~~~ -g
               ( +tip! : ~~~ --save abc 로 저장할 경우 다른 파일에서 const abs = require('abs')로 import하여 사용가능함)

  - 설치된 파일 확인하는 방법 : node_modules파일 -> 설치 npm폴더 -> package.json
  - 프로젝트 작업을 진행할 때 "npm install"명렁어를 실행하면 다시 설치되므로 node_modules폴더는 용량이 부족할 경우 지워도 상관없음

  - 변경사항 자동저장 및 실행 패키지 : nodemon

* [package.json]의 "devDependencies"속성의 설치파일 버전이 ^로 되어있는 경우,
  해당 패키지가 어떻게 업데이트될지를 정의해주고, 이후 npm install만 실행하도 같이 업데이트 및 실행되도록 해줌

* [package.json]의 스크립트 중 start속성의 value값을 node app.js 에서 nodemon app.js 로 변경하게되면 npm start 입력 시, nodemon이 자동으로 실행됨
  단, nodemon app.js로 검색하게되면 터미널이 전역에서 찾기때문에 발견하지 못함

*/

/*

* 에러

 - Syntax Errors : 오타, 괄호 미완료로 인한 에러       => IDE의 기능 사용!
 - Runtime Errors : 코드 순서 미흡과 같은 코드 상의 에러
 - Logical Errors : 로직 에러 => IDE와 잘 맞는 Debugger사용!

*/