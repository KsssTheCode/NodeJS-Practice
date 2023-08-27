//들어오는 쿼리를 위해 실행되는 로직(논리)를 정의
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Post = require('../models/post');

const { clearImage } = require('../util/file');

module.exports = {
    // createUser(args, req) { //args == UserInputData
    //     const email = args.userInput.email;
    //     const password = args.userInput.password;
    //     const name =args.userInput.name;
    // }

    //args매개변수(userInput)을 구조 분해를 통해 {userInput}로 받아 코드 축약
    // +
    //Async + Await구문 사용
    createUser: async function({userInput}, req) {
        const email = userInput.email;
        const name = userInput.name;
        const password = userInput.password;

        const errors = [];
        
        //유효성검사 
        if(!validator.isEmail(email)){
            errors.push({message: 'E-mail is invalid'});
        }
        if(validator.isEmpty(password) || !validator.isLength(password, {min:5})){
            errors.push({message: 'Password too short'});
        }
        if(errors.length > 0){
            const error = new Error('Invalid input');
            error.data = errors;
            error.code = 422; //http오류코드가 아닌 고유의 코딩시스템으로 설정도 가능
            throw error;
        }

        //동일한 이메일의 사용자 검사
        const existingUser = await User.findOne({email: email});
        if(existingUser){ //있을 시, 에러 전송
            const error = new Error('User exists already');
            throw error;
        }

        //없을 시, 사용자 생성 후 DB에 저장
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email: email,
            name: name,
            password: hashedPassword
        });

        const createdUser = await user.save();

        //Schema의 형태에 맞게 전송해야함
        //email, name, password정보와 함께 user객체를 생성하면 부여된 id도 함께 제공
        return {...createdUser._doc, _id: createdUser._id.toString()};
    },

    login: async function({email, password}) {
        const user = await User.findOne({email: email});
        if(!user){
            const error = new Error('User not found');
            error.code = 401;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password);
        if(!isEqual){
            const error = new Error('Pssword is incorrect');
            error.code = 401;
            throw error;
        }

        const token = jwt.sign({
            userId: user._id.toString(),
            email: user.email
            }, 
            'supersecret', 
            { expiresIn: '1h'}
        );

        //schema에서 AuthData는 token과 userId로 이루어져있으므로 해당 값들을 객체로써 반환
        return { token: token, userId: user._id.toString() };
    },

    createPost: async function({postInput}, req) {
        //Authenication
        if(!req.isAuth) {
            const error = new Error('Not authentication');
            error.code = 401;
            throw error;
        }
        const errors = [];
        if(validator.isEmpty(postInput.title) || !validator.isLength(postInput.title, {min: 5})) {
            errors.push({message: 'Title is invalid'});
        }
        if(validator.isEmpty(postInput.content) || !validator.isLength(postInput.content, {min: 5})){
            errors.push({message: 'Content is invalid'});
        }
        if(errors.length > 0){
            const error = new Error('Invalid input');
            error.data = errors;
            error.code = 422; //http오류코드가 아닌 고유의 코딩시스템으로 설정도 가능
            throw error;
        }
        
        const user = await User.findById(req.userId);
        if(!user){
            const error = new Error('Invalid user');
            error.code = 401;
            throw error;
        }
        
        //게시물 생성
        const post = new Post({
            title: postInput.title,
            content: postInput.content,
            imageUrl: postInput.imageUrl,
            creator: user
        });
        
        //생성된 게시물 DB에 저장
        const createdPost = await post.save();
        
        //사용자에 종속된 게시물로 저장
        user.posts.push(createdPost);

        await user.save();

        //post 추가 시 필요한 데이터 반환
        return {
            ...createdPost._doc, 
            _id: createdPost._id.toString(), 
            createdAt: createdPost.createdAt.toISOString(), 
            updatedAt: createdPost.updatedAt.toISOString()
        };
    },

    posts: async function({page}, req) {
        if(!req.isAuth) {
            const error = new Error('Not authentication');
            error.code = 401;
            throw error;
        }
        //Pagination
        if(!page) { //특정 페이지로 시작하지 않으면 default값으로 1번 페이지
            page = 1;
        }
        const perPage = 2; //한 페이지에 보일 게시물의 수
        
        const totalPosts = await Post.find().countDocuments();
        const posts = await Post
                                .find()
                                .sort({createdAt: -1})
                                .skip((page - 1) * perPage)
                                .limit(perPage)
                                .populate('creator');

        return {posts: posts.map(p => {
            return {...p._doc, 
                    _id: p._id.toString(), 
                    createdAt: p.createdAt.toISOString(), 
                    updatedAt: p.updatedAt.toISOString()
                    };
        }), totalPosts: totalPosts};
    },

    post: async function({id}, req){
        if(!req.isAuth) {
            const error = new Error('Not authentication');
            error.code = 401;
            throw error;
        }

        const post = await Post.findById(id).populate('creator');
        if(!post) {
            const error = new Error('No post found');
            error.code = 404;
            throw error;
        }

        return  {
            ...post._doc, 
            _id: post._id.toString(), 
            createdAt: post.createdAt.toISOString(), 
            updatedAt: post.updatedAt.toISOString() 
        }
    },

    updatePost: async function({ id, postInput }, req) {
        if (!req.isAuth) {
          const error = new Error('Not authenticated!');
          error.code = 401;
          throw error;
        }
    
        //해당 id로 검색되는 게시물이 없을 시,
        const post = await Post.findById(id).populate('creator');
        if (!post) {
          const error = new Error('No post found!');
          error.code = 404;
          throw error;
        }
        if (post.creator._id.toString() !== req.userId.toString()) {
          const error = new Error('Not authorized!');
          error.code = 403;
          throw error;
        }

        //유효성 검사
        const errors = [];
        if (
          validator.isEmpty(postInput.title) ||
          !validator.isLength(postInput.title, { min: 5 })
        ) {
          errors.push({ message: 'Title is invalid.' });
        }
        if (
          validator.isEmpty(postInput.content) ||
          !validator.isLength(postInput.content, { min: 5 })
        ) {
          errors.push({ message: 'Content is invalid.' });
        }
        if (errors.length > 0) {
          const error = new Error('Invalid input.');
          error.data = errors;
          error.code = 422; //http오류코드가 아닌 고유의 코딩시스템으로 설정도 가능
          throw error;
        }

        post.title = postInput.title;
        post.content = postInput.content;
        //편집모드에서 첨부된 사진이 있다면, (새로운 사진을 선택했다면)
        if (postInput.imageUrl !== 'undefined') {
            clearImage(post.imageUrl);
            post.imageUrl = postInput.imageUrl;
        }

        const updatedPost = await post.save();
        return {
          ...updatedPost._doc,
          _id: updatedPost._id.toString(),
          createdAt: updatedPost.createdAt.toISOString(),
          updatedAt: updatedPost.updatedAt.toISOString()
        };
    },

    deletePost: async function({ id }, req){
        if (!req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }

        const post = await Post.findById(id);
        if (!post) {
            const error = new Error('No post found!');
            error.code = 404;
            throw error;
        }
        if (post.creator.toString() !== req.userId.toString()) {
            const error = new Error('Not authorized!');
            error.code = 403;
            throw error;
        }

        //게시물 사진파일 삭제
        clearImage(post.imageUrl);

        //게시물 삭제
        await Post.findByIdAndRemove(id);
        
        //사용자의 작성게시물에서 삭제
        const user = await User.findById(req.userId);
        user.posts.pull(id);
        await user.save();

        //성공 시 true반환
        return true;
    },

    user: async function(args, req) {
        if (!req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }

        const user = await User.findById(req.userId);
        if(!user){
            const error = new Error('No user found');
            error.code = 404;
            throw error;
        }
        return {
            ...user._doc,
            _id: user._id.toString()
        }
    },

    updateStatus: async function({status}, req){
        if (!req.isAuth) {
            const error = new Error('Not authenticated!');
            error.code = 401;
            throw error;
        }

        const user = await User.findById(req.userId);
        if(!user){
            const error = new Error('No user found');
            error.code = 404;
            throw error;
        }

        user.status = status;
        await user.save();
        return {
            ...user._doc,
            _id: user._id.toString()
        }
    }
};