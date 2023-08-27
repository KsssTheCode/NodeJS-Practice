"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//require문은 Node코드를 실행할 때만 사용할 수 있으므로, 브라우저에서 실행하려고 한다면 존재하지 않게됨
//IDE에 내장된 TypeScript는 이 코드를 어디서 실행할지를 모른다는 것을 탐지함
//TypeScript가 이 Node 모듈(require)로 실행되는 JS코드라는 것을 탐지할 수 있도록 npm i --save-dev @types/node 실행해주어야 함
const express = require("express");
//아래 import구문은 클라이언트 측에서 알고 최종적으로 브라우저에서 알 수 있는 import구문으로
//Node.js태생적으로 지원되기때문에 package.json을 수정하지않고도 사용 가능 (결국 require문으로 바뀌긴 함)
//import express from 'express';
const body_parser_1 = __importDefault(require("body-parser"));
const todos_1 = __importDefault(require("./routes/todos"));
const app = express();
app.use(body_parser_1.default.json());
app.use(todos_1.default);
app.listen(3004);
