//query, mutation 등의 GraphQl서비스 유형 정의
const { buildSchema } = require('graphql');

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]!
    }

    type AuthData {
        token: String!
        userId: String!
    }

    type PostData {
        posts: [Post!]!
        totalPosts: Int!
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    input PostInputData {
        title: String!
        content: String!
        imageUrl: String!
    }
    
    type RootQuery {
        login(email: String!, password: String!): AuthData!
        posts(page: Int): PostData!
        post(id: ID!): Post!
        user: User!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
        updatePost(id: ID!, postInput: PostInputData): Post!
        deletePost(id: ID!): Boolean
        updateStatus(status: String): User!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);

/*
    input : 입력값, 즉 인수로 사용된 데이터를 위한 키워드

    ID : GraphQL이 제공하는 데이터타입 유형

    type RootMutation {
        createUser(email: String, password: String ...): User!
    }
    형식으로 풀어서 작성도 가능
*/

/*  기존 테스트 예시

    hello쿼라에 들어갈 데이터 유형
    text와 views는 resolvers.js에서 정의됨
    type TestData {
        text: String!
        views: Int!
    }

    type : 객체를 생성하는 명령어
    만들 수 있는 모든 유형의 쿼리
    hello: String! => hello라는 쿼리는 문자열 반환형 (!는 reuiqred속성과 동일)
                  => hello로 인해 반환되는 String은 Resolver에서 결정됨
    type RootQuery {
        hello: TestData!
    }

    모든 쿼리를 가진 객체
    query는 실질적으로 데이터를 받는 부분으로 허용하고자하는 모든 쿼리를 의미
    query: RootQuery => query의 반환형은 RootQuery
    schema {
        query: RootQuery
    }

*/