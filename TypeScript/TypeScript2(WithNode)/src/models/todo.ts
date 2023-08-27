//interface는 순수 TypeScript기능이기때문에 JS코드로 생성되지 않지만,
//interface의 경우 유형정의로만 사용되기때문에 코드가 여전히 작동함
export interface Todo {
    id: string;
    text: string;
};