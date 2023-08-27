const fs = require('fs');
const path = require('path');

const router = require("../routes/feed");
const {validationResult} = require('express-validator/check');
const Post = require('../models/post');
const User = require('../models/user');

/* Async-await Mode *********************************************************************/
exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1; //쿼리정보가 없을 시, 1페이지로 간주
    const perPage = 2; //한 페이지에 표시할 게시물 (하드코딩)

    //pagination
    let totalItems;

    try { //Async의 경우 try-catch문 사용
        //.exec()의 경우, 실제로 Mongoose가 Promise '유사' 객체를 반환하게 되는 것을 실제 Promise객체를 반환하도록 함
        const totalItems = await Post.find().countDocuments().exec();
        const posts = await Post
                                .find()
                                .skip((currentPage -1) * perPage)
                                .limit(perPage);
        res
            .status(200)
            .json({
                message: 'Posts feteched', 
                posts: posts, 
                totalItems: totalItems
            });
    } catch (err) {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

/* None async-await Mode *********************************************************************
exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1; //쿼리정보가 없을 시, 1페이지로 간주
    const perPage = 2; //한 페이지에 표시할 게시물 (하드코딩)

    //pagination
    let totalItems;

    Post // 1. 모든 post를 찾고, 2.갯수를 새어, 3.totalItems변수에 담고, 4.pagination에 알맞은 게시물만 반환
        .find()
        .countDocuments()
        .then(count => {
            totalItems = count;
            return Post.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(posts => {
            res
                .status(200)
                .json({
                    message: 'Posts feteched', 
                    posts: posts, 
                    totalItems: totalItems
                });
        })
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });

    //더미post
    // res
    //     .status(200) //성공
    //     .json({
    //         posts: [{
    //             _id: 'mysunghun',
    //             title: 'First Post', 
    //             content: 'This is the first post!', 
    //             imageUrl: 'images/duck1.jpeg',
    //             creator: {
    //                 name: 'Kang Sunghoon',
    //             },
    //             createdAt: new Date()
    //             //도메인은 프론트단에 있음
    //         }]
    // });
};
*****************************************************************************************/

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;

    Post
        .findById(postId)
        .then(post => {
            if(!post){
                const error = new Error('Could not find post');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({message: 'Post fetched', post: post}); //성공코드와 함게 메세지 전달
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req); //유효성 검사로 모은 모든 오류들을 추출, errors에 값이 있다면 오류가 발생했음을 의미
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect');
        error.statusCode = 422;
        throw error; 
        //throw로 함수를 종료시키고, express의 오류처리함수(또는 미들웨어)로 이동
        //엄밀히 말하자면, 해당 미들웨어의 catch블럭(마지막)으로 바로 넘어감

        //return res.status(422).json({message: 'Validation failed, entered data is incorrect', errors: errors.array()}); //수동으로 에러 넘기기
    }
    if(!req.file){ //이미지파일이 없을 경우(validation error)보낼 에러
        const error = new Error('No image provided');
        err.statusCode = 422;
        throw error;
    }

    const imageUrl = req.file.path; //file객체의 저장경로는 자동적으로 path라는 변수에 들어있음
    const title = req.body.title;
    const content = req.body.content;
    let creator;

    const post = new Post({
        title: title, 
        content: content, 
        imageUrl: imageUrl,
        creator: req.userId //{name: 'Kang Sunghoon'}
        //_id는 mongoose에서 자동생성하기때문에 필요없음
        //postSchema객체에 timestamp속성이 있으므로, createdAt변수는 필요없음
    });

    post //DB에 post생성
        .save()
        .then(result => {
            return User.findById(req.userId);
        })
        .then(user => {
            creator = user;
            user.posts.push(post); //생성한 user객체 안으로 post를 push
            return user.save();
        })
        .then(result => {
            res
                .status(201) //리소스 생성 성공 
                .json({
                    message: 'Post created successfully!',
                    post: post,
                    creator: { _id: creator._id, name: creator.name }
                });
        })
        .catch(err => {
            if(!err.statusCode){ //위에서 422에러가 발생하지 않았다면 서버측에러이므로 500에러 전달
                err.statusCode = 500;
            }
            //throw err; 를 하게되면 비동기식의 특성에 따라 에러처리함수(또는 미들웨어)로 이동하지 않고 종료되므로, next함수에 err를 담아 넘김
            next(err);
        });
};

exports.updatePost = (req, res, next) => {
    const errors = validationResult(req); //유효성 검사로 모은 모든 오류들을 추출, errors에 값이 있다면 오류가 발생했음을 의미
    if(!errors.isEmpty()){
        const error = new Error('Validation failed, entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }

    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;

    //이미지를 받아오는 방법 2가지
    //방법1. 요청 본문의 텍스트로 가지고오기
    //      단, 새로운 파일이 추가되지 않을 경우에만 가능 (새 파일이 없다면 프론트엔드 코드 논리가 기존 URL을 유지)
    let imageUrl = req.body.image;

    //방법2. req객체 내 file객체에서 가지고오기
    //      새로운 파일이 추가되었을 경우 사용
    if(req.file){ //새 파일을 발견하면 파일을 선택하도록 설정
        imageUrl = req.file.path;
    }

    if(!imageUrl){
        const error = new Error('No image picked');
        error.statusCode = 422;
        throw error;
    }

    Post
        .findById(postId)
        .then(post => {
            if(!post){
                const error = new Error('Could not find post');
                error.statusCode = 404;
                throw error;
            }

            //현재 사용자와 생성자가 동일한지 토큰을 통해 확인
            if(post.creator.toString() !== req.userId){
                const error = new Error('Not authorized');
                error.statusCode = 403;
                throw error;
            }

            if(imageUrl !== post.imageUrl){ //기존의 사진과 현재의 사진이 다르다면 == 업데이트가 되었다면,
                clearImage(post.imageUrl); // 기존의 사진 삭제
            }
            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl;
            return post.save();
        })
        .then(result => {
            res.status(200).json({message: 'Post updated', post: result});
        })
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;
    Post
        .findById(postId)
        .then(post => {
            if(!post){
                const error = new Error('Could not find post');
                error.statusCode = 404;
                throw error;
            }

            //현재 사용자와 생성자가 동일한지 토큰을 통해 확인
            if(post.creator.toString() !== req.userId){
                const error = new Error('Not authorized');
                error.statusCode = 403;
                throw error;
            }

            clearImage(post.imageUrl);
            return Post.findByIdAndDelete(postId);
        })
        .then(result => {
            return User.findById(req.userId); //사용자의 아이디를 찾아
        })
        .then(user => {
            user.posts.pull(postId);
            return user.save();
        })
        .then(() => {
            res.status(200).json({message: 'Deleted post'});
        })
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });
}

//(HELPER)post 업데이트 중 image변경 시, 기존의 Image파일 폴더에서 삭제
const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}