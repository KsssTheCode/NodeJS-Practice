// const fs = require('fs');

// fs.writeFileSync('hello.txt', 'Hello from NodeJS');

/*********************************************************************************************/

// const add= (a,b) => {
//     return a+b;
// }

// const add= (a,b) => a + b;
// console.log(add(1,2));

// const addOne= (a) => a + 1;
// console.log(addOne(100));

// const addRandom = () => 1+2;
// console.log(addRandom());

/*********************************************************************************************/

var userName = 'kangsunghoon';
var userAge = '27';
var address = 'Seoul city';

// const client = (name,age,address) => {
//     return 'Hello my name is ' + name + ', I\'m ' + age + 'years old. And I\'m living in  ' + address;
// }

// function client(name, age, address){
//     return 'Hello my name is ' + name + ', I\'m ' + age + 'years old. And I\'m living in  ' + address;
// }

// console.log(client(userName, userAge, address));

const person = {
    name: userName,
    age: userAge,
    bloodType: 'AB',
    greet(){ console.log('Hi, I am ' + this.name + ' and I am ' + this.age + ' years old.')}
}
//person.greet();

// const printName = ({name}) => {
//     console.log(name);
// }

//printName(person);

// const {age, bloodType} = person;
// console.log(bloodType, age);
// console.log(name, greet()); // X : const변수에는 name과 age만 담겨있기 떄문

/*********************************************************************************************/

const hobbies = ['play football', 'play the game'];
// for(let hobby of hobbies) {
//     console.log(hobbies.indexOf(hobby)+1 + '번째 hobby : ' + hobby);
// }

// const [hobby1] = hobbies;
// console.log(hobby1);

// const [hobby2, hobby3] = hobbies;
// console.log(hobby2, hobby3);

// console.log(hobbies.map(hobby => {
//     return 'Hobby : ' + hobby;
// }));

// console.log(hobbies.map(hobby => hobbies.indexOf(hobby)+1 + '번째 Hobby : ' + hobby));
// console.log(hobbies);

const foods = ['apple', 'noodle', 'desert'];
// for(let food of foods){
//     console.log(foods.indexOf(food)+1 + '번쨰 음식 : ' + food);
// }

// console.log(foods.map(food => {
//     return foods.indexOf(food)+1 + '번째 음식 : ' + food;
// }))

//console.log(foods.map(food => foods.indexOf(food) + 1 + '번째 음식 : ' + food));


let newHobbies = hobbies.push('Programming');

// const copiedArray1 = [hobbies];
// const copiedArray2 = [...hobbies];
//  console.log(copiedArray1);
//console.log(copiedArray2);

// const a = 1;
// const b = 2;
// const c = 3;
// const d = 4;

// const restArray = (arg1, arg2, arg3) => {
//     return [arg1, arg2, arg3];
// }
// console.log(restArray(a,b,c));

// const spreadArray = (...args) => {
//     return args;
// }
// console.log(spreadArray(a,b,c,d));

const me = {
    name : '강성훈',
    age : 27,
    bloodType : 'AB RH+',
    help() { return 'Help me! My name is ' + this.name + 'and I\'m ' + this.age + ' years old. Please send me the blood of ' + this.bloodType; }
}

// const helpMe = (me) => { 
//     console.log(me) 
// }
// helpMe(me);
// me.help();

/*********************************************************************************************/

// const fetchData = () => {
//     const promise = new Promise((resolve, reject) => {
//         setTimeout(() => {
//             resolve('Done!');
//         }, 1500);
//     });
//     return promise;
// }


// setTimeout(() => {
//     console.log('Timer is done!');
//     fetchData().then(text => {
//         console.log(text)
//     });
// }, 2000);

// console.log('Hi');
// console.log('Hello');

var test = () => {
    console.log('a');
}

test();

// function callBackTest(callback) {
//     callback();
// }

// callBackTest(test);