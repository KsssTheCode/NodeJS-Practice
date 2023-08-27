//피드라우트는 새로운 메세지를 생성하거나, 기존 메세지를 표시하는 등의 작업을 하는 공간
const express = require('express');
const { body } = require('express-validator/check');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/posts', isAuth, feedController.getPosts);

router.post(
    '/post', 
    isAuth, 
    [
        body('title')
            .trim()
            .isLength({min: 5}),
        
        body('content')
            .trim()
            .isLength({min: 5})
    ],
    feedController.createPost
);

router.get('/post/:postId', isAuth, feedController.getPost);

//put방식은 일반적인 브라우저 양식에서는 사용할 수 없지만, JS에 의해 유발된 비동기식 요청에서는 가능
//put방식은 post요청처럼 요청 본문이 있음
router.put(
    '/post/:postId', 
    isAuth, 
    [
        body('title')
            .trim()
            .isLength({min: 5}),
        
        body('content')
            .trim()
            .isLength({min: 5})
    ],
    feedController.updatePost
);

router.delete('/post/:postId', isAuth, feedController.deletePost);

module.exports = router;

