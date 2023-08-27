const fs = require('fs');
const path = require('path');

//결제를 위한 stripe패키지 임포팅 후 Secret Key전달
const stripe = require('stripe')('sk_test_51MTmUeFFbm4alzO2PPtm11vh7Ti7Wx8zIJn1UW2DOMc4epOHtcIO6e8gl5ZxsDjEJ22zUfFuG3UovdOiUMjaq3G800bmEWpIPd');

//PDFkit
const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');
const session = require('express-session');

//pagination을 위한 상수
const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  //pagination
  const page = +req.query.page || 1; // ?page=x가 없는 url에도 적용시키기 위함
  let totalItems;
  
  //pagination
  Product
    .find()
    .countDocuments()
    .then(numProducts => { //데이터의 총 갯수
      totalItems = numProducts;
      return Product
                  .find()
                  //skip과 limit는 MongoDB(또는 Mongoose)의 메소드이며, 서버 측에서 데이터필터링을 하는 것이 아니라 DB서버 자체를 필터링하는 것임
                  .skip((page - 1) * ITEMS_PER_PAGE) //몇 개의 데이터를 건너뛰고 불러올 지
                  .limit(ITEMS_PER_PAGE); //몇개를 가져올 지
    })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage : page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
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

exports.getIndex = (req, res, next) => {
  //pagination
  const page = +req.query.page || 1; // ?page=x가 없는 url에도 적용시키기 위함
  let totalItems;
  
  //pagination
  Product
    .find()
    .countDocuments()
    .then(numProducts => { //데이터의 총 갯수
      totalItems = numProducts;
      return Product
                  .find()
                  .skip((page - 1) * ITEMS_PER_PAGE) //몇 개의 데이터를 건너뛰고 불러올 지
                  .limit(ITEMS_PER_PAGE); //몇개를 가져올 지
    })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage : page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
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

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;

  req.user
    .populate('cart.items.productId') //모든 제품 정보를 포함한 product
    .then(user => {
      products = user.cart.items;
      total = 0;
      products.forEach(p => {
        total += p.quantity * p.productId.price;
      })
      //결제에 필요한 sessionId생성
      return stripe.checkout.session.create({
        payment_method_types: ['card'], //배열형태로 card를 추가하면 카드결제를 가능하도록 함
        line_items: products.map(p => { //계산할 항목 설정 (각 제품을 따로 다룰 수 있도록 map형태로 변환)
          return { //Stripe에서 요구하는 형식대로 객체를 가공하여 반환
            name: p.productId.title,
            description: p.productId.description,
            amount: p.productId.price * 100,
            currency: 'usd',
            quantity: p.quantity
          };
        }),
        //거래 성공 또는 실패시 redirect할 화면 (동적으로 뿌려주기위해 아래 구문들 사용)
        success_url: req.protocol + '://' + req.get('host') + '/checkout/success', // => http + :// + localhost:3001 + /checkout/success
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel' // => http + :// + localhost:3001 + /checkout/cancel
      });
    })
    .then(session => {
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        totalSum: total,
        sessionId: session.id //sessionId 렌더링
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
}

//결제기능 추가로 인한 메소드 변경 (기존 postOrder라우터 삭제 -> getCheckoutSuccess라우터 생성)
//exports.postOrder = (req, res, next) => {
exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
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

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  //사용권한 확인
  Order
    .findById(orderId)
    .then(order => {
      if(!order){
        return next(new Error('No Order Found'));
      }
      //본인의 주문만 확인할 수 있도록 비교
      if(order.user.userId.toString() !== req.user._id.toString()){
        return next(new Error('Unauthorized'));
      }
      
      const invoiceName = 'invoice-' + orderId + '.pdf';
      const invoicePath = path.join('data', 'invoices', invoiceName);
      
      //PDFKit을 이용한 pdf파일 생성
      const pdfDoc = new PDFDocument();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');

      //클라이언트에게 pdf파일을 제공할 뿐만 아니라, 서버에도 저장됨
      pdfDoc.pipe(fs.createWriteStream(invoicePath));//pdf파일을 작성하는 스트림 생성
      pdfDoc.pipe(res);//클라이언트에게 응답으로 pdf파일 제공

      //pdf파일 내용 구성
      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      });

      pdfDoc.text('-------------------------------------');

      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title + 
            ' - ' + 
            prod.quantity + 
            ' x $' + 
            prod.product.price);
      });
      pdfDoc.text('-------------------------------------');
      pdfDoc
        .text('Total Price : $' + totalPrice)
        .fontSize(20);

      pdfDoc.end(); //end()로 파일작성을 끝내는 동시에 WriteStream이 닫히며 저장하고 전송을 실행

      
      /* pdf파일 사용으로 인한 주석처리 ***********************************************************
      //chunk단위로 읽어오기위해 stream생성 (읽기 가능한 스트림)
      const file = fs.createReadStream(invoicePath);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');

      //읽어들인 데이터를 chunk단위로 내보내기위해 pipe생성
      file.pipe(res);
      *************************************************************************************/
      /* 파일 스트리밍 전 방법 ******************************************************************
      //파일을 읽은 후, 응답으로 파일을 제공하는 방식
      // => 파일의 용량이 크다면 서버의 메모리가 오버플로우될 수 있음
      fs.readFile(invoicePath, (err, data) => {
        if(err){
          return next(err);
        }
        //다운로드할 파일의 확장자를 설정하는 코드
        res.setHeader('Content-Type', 'application/pdf');

        //클라이언트에게 컨텐츠가 제공되는 방식 정의 ('Content-Dispoistion')
        //inline : 브라우저에서 띄우기
        //attachment : 다운로드
        res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"');

        //send() : express내장 메소드
        res.send(data);
      });
      *****************************************************************************************/
    })
    .catch(err => next(err));
}
