"use strict";
////id를 통한 접근이기때문에 TypeScript가 어떤 요소가 해당 ID를 가질지 모르기 때문에 
//'as HTMLInputElement'(일반적인 DOM유형)와 같이 형변환(Typecasting)을 해야함 
const num1Element = document.getElementById('num1');
const num2Element = document.getElementById('num2');
//ctrl을 누른 후 마우스를 올려보면 뒤에 ' : HTMLButtonElement라고 자동으로 적용되어있음
//이는 TypeScript가 알아서 유형을 추론할 수 있기떄문에 자동으로 적용시킴
//(해당 상수에 어떤 유형의 값이 저장될지 코드에 기반해서 추론)
// => 추후 buttonElement에 EventListener를 추가할 때 미리 알고 있어 추천을 해줌
const buttonElement = document.querySelector('button');
//Array타입은 Generic타입의 좋은 유형으로 주석처리된 구문은 shortcut이고, 아래 구문이 정식적인 구문임
// const numResults: number[]= [];
// const textResults: string[] = [];
const numResults = [];
const textResults = [];
function add(num1, num2) {
    if (typeof num1 === 'number' && typeof num2 === 'number') {
        return num1 + num2;
    }
    else if (typeof num1 === 'string' && typeof num2 === 'string') {
        return num1 + ' ' + num2;
    }
    return +num1 + +num2;
}
function printResult(resultObj) {
    console.log(resultObj.val);
}
buttonElement.addEventListener('click', () => {
    //형변환 전에는 value값이 무엇인지 알지 못했으나, 형변환 이후 DOM객체에 대한 value속성이라는 것은 인지함
    const num1 = num1Element.value;
    const num2 = num2Element.value;
    //num1과 num2는 '.value'에 의해 value속성에 저장된 유형이라 어떠한 경우에도 String타입을 반환함
    //위의 add()에 ':number'로 num1과 num2를 지정해주었으므로, '+'기호를 붙여 number타입이라고 명시해야함
    // => 이로써 변환을 잊거나 건너뛰지 못하게 함
    const result = add(+num1, +num2);
    const stringResult = add(num1, num2);
    // console.log(result);
    // console.log(stringResult);
    numResults.push(result); //numResults배열에 result값(number타입)을 첫번쨰로 push
    textResults.push(stringResult); //textResults배열에 stringResult값(string타입)을 첫번쨰로 push
    console.log(numResults, textResults);
    //val속성은 number타입의 result값이고, timestamp속성은 새로운 Date타입의 새로운 값을 생성하여 printResult()메소드 실행
    printResult({ val: result, timestamp: new Date() });
});
//Promise타입은 TypeScript의 기능이 아니기때문에 구버전 JS에서 작동할 수 없도록 컴파일 될 수 없음
//따라서, Promise타입 사용을 위해 tsconfig.json파일에 우리가 지원하고자 하는 기능이 어떤 유형인지를 알려주어야 함
//Basic Option > "target": "es6이상의 버전"으로 설정해주면 사용 가능 
const myPromise1 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('Promise1 ??');
    }, 1000);
});
myPromise1.then((result) => {
    console.log(result);
    //이 구문은 TypeScript가 result가 string이라는 것을 이해하지 못하기때문에 
    //아래('myPromise2')와 같이 generic타입(Promise가 Resolve될 유형)을 string이라고 명시해주어야 함
    //console.log(result.split(' '));
});
const myPromise2 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('Promise2 !!');
    }, 2000);
});
myPromise2.then((result) => {
    console.log(result.split(' '));
});
