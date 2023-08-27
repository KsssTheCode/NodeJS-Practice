const Product = require('../models/product');
const { validationResult } = require('express-validator/check');
const fileHelper = require('../util/file');

exports.getAddProduct = (req, res, next) => {
  /**********************************
  //미로그인 시 라우트 접근 제한 (수동)
  if(!req.session.isLoggedIn){
    return res.redirect('/login');
  }
  **********************************/
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  //file-picker사용 전
  //들어오는 요청의 콘텐츠를 추출하기위해, app.js에 urlendcoded parser(데이터를 텍스트로써 본문에 취합)를 사용한 케이스
  //const imageUrl = req.body.imageUrl;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
 
  if(!image) {
    return res
      .status(422)
      .render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: true,
        product: {
          title: title,
          price: price,
          description: description
        },
        errorMessage: 'Attached file is not an image',
        validationErrors: []
      });
  }
  
  const errors = validationResult(req);
  
  if(!errors.isEmpty()){
    return res
    .status(422)
    .render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      product: {
        title: title,
        imageUrl: imageUrl,
        price: price,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  //내 운영체제의 이미지의 경로를 불러와 DB에 저장하기 위한 변수
  const imageUrl = image.path;

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });

  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      //발생한 err을 포함한 Error객체를 생성 한 뒤,
      const error = new Error(err);
      //.httpStatusCode()를 통해 오류코드를 알리고,
      error.httpStatusCode = 500;
      //다음 실행코드가 생성한 Error객체를 사용할 수 있도록 반환
      //이 떄, express에 오류가 있음을 알리게되는데, 이로써 다른 모든 미들웨어를 건너뛰고 오류처리 미들웨어로 이동하게됨
      //app.js의 오류처리 미들웨어로 이동
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        //locals로 지역변수 등록으로 인한 주석처리
        //isAuthenticated: req.session.isLoggedIn
        //csrfToken : req.csrfToken()
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;
  const errors = validationResult(req);

  if(!errors.isEmpty()){
    return res
      .status(422)
      .render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: true,
        hasError: true,
        product: {
          title: updatedTitle,
          price: updatedPrice,
          description: updatedDesc,
          _id: prodId
        },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array()
      });
}

  Product.findById(prodId)
    .then(product => {
      if(product.userId.toString() !== req.user._id.toString()){
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if(image){
        fileHelper.deleteFile(product.imageUrl); //해당이름의 파일을 서버에서 삭제
        product.imageUrl = image.path;
      }
      return product
              .save()
              .then(result => {
                console.log('UPDATED PRODUCT!');
                res.redirect('/admin/products');
              });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};


exports.getProducts = (req, res, next) => {
  Product.find({userId: req.user._id})
  // .select('title price -_id')
  // .populate('userId', 'name')
  .then(products => {
    console.log(products);
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
      //locals로 지역변수 등록으로 인한 주석처리
      //isAuthenticated: req.session.isLoggedIn
      //csrfToken : req.csrfToken()
    });
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then(product => {
      if(!product){
        return next(new Error('Product Not Found'));
      }
      //DB에서 제품이미지 삭제
      fileHelper.deleteFile(product.imageUrl);
      //제품아이디와 생성자아이디가 동일한 한 제품을 삭제한 후의 전체 제품 반환
      return Product.deleteOne({_id: prodId, userId: req.user._id}); 
    })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      //비동기식 요청이기때문에 JSON데이터로 반환 (렌더링하지 않고 데이터만 반환)
      //json()이 JS객체를 자동으로 JSON객체로 변환해줌
      //JSON전에는 200메세지 전달 (JSON데이터도 디폴트로 상테코드 200을 받는데, 이 경우 리다이렉트 등을 통해 자동으로 상태코드를 받지 않기 떄문에 명확하게 해주기 위함)
      res.status(200).json({message: 'Success!'});
    })
    .catch(err => {
      res.status(500).json({message: 'Deleting Product Failed!'});
    });
}
/* 비동기식 요청으로 인한 주석처리 ****************************************************
exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  //제약조건(생성자가 아닐 시, 삭제불가)을 위한 주석처리
  //Product.findByIdAndRemove(prodId)

  Product
    .findById(prodId)
    .then(product => {
      if(!product){
        return next(new Error('Product Not Found'));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({_id: prodId, userId: req.user._id});
    })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  // 위 구문으로 대체 
  // Product
  //   .deleteOne({_id: prodId, userId: req.user._id}) //두가지 조건 모두 충족해야함
  //   .then(() => {
  //     console.log('DESTROYED PRODUCT');
  //     res.redirect('/admin/products');
  //   })
  //   .catch(err => {
  //     const error = new Error(err);
  //     error.httpStatusCode = 500;
  //     return next(error);
  //   });
};
********************************************************************************/
