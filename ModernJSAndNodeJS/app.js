import express from 'express';
//const express = require('express');


/* #case1일 때 *************************************/
import { resHandler } from './response-handler.js';
//case1사용 시, export되는 변수나 메소드의 이름과 동일해야함
/***************************************************/

/* #case2일 때 *************************************/
//import resHandler from './response-handler.js';
/***************************************************/
//기존의 require구문과 다르게 .js라는 확장자까지 표시해주어야 함
//만약 위 case1과 case2 (ES module) 사용 시, package.json파일에 "type": "module"를 추가해주어야함

const app = express();

app.get('/', resHandler);

app.listen(3003);

/* #Origin case ***********************************/
// const express = require('express');

// const resHandler = require('./response-handler');

// const app = express();

// app.get('/', resHandler);

// app.listen(3003);
/***************************************************/