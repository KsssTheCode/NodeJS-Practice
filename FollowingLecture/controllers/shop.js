//const products = [];
// 클래스 Product import
const Product = require('../models/product');
//직접적으로 Cart를 호출하지 않으므로 주석처리
//const Cart = require('../models/cart');
//MongoDB사용으로 인한 주석처리 //Mongoose에서 다시사용 
const Order = require('../models/order');
const { request } = require('express');


//Starting Page
/* Mongoose version ***********************/
exports.getIndex = (req, res, next) => {
    //저장된 모든 products들을 불러오는 구문
    Product
        .find()
        .then(products => {
            res.render('shop/index', { 
                prods : products, 
                pageTitle : 'Shop', 
                path:'/'
            });
        })
        .catch(err => {
            console.log(err);
        });
};
/* Sequelize, MongoDB version **************
exports.getIndex = (req, res, next) => {
    //저장된 모든 products들을 불러오는 구문
    Product
        .fetchAll()
        .then(products => {
            res.render('shop/index', { 
                prods : products, 
                pageTitle : 'Shop', 
                path:'/'
            });
        })
        .catch(err => {
            console.log(err);
        });
};
*******************************************/
/* Pure version *********************************************************
    Product.fetchAll()
    .then(([rows]) => {
        //destructering : 보유한 인수 목록에 인수로서 수신하는 값의 정보를 끌어냄 
        //DB사용으로 인한 메소드 변경으로 해당 render메소드를 밖으로 then()내부로 이동
        // 상단에 products배열 생성하여 다른 곳에서 불러올 필요 없음
        // ==> 이미 addProduct를 진행하며 products에 입력된 product들이 담겨있음
        //const products = adminData.products;
        res.render('shop/index', { 
            prods : rows, 
            pageTitle : 'Shop', 
            path:'/'
            // handlebars에서 사용하는 구문 
            // hasProducts : products.length > 0, 
            // activeShop : true,
            // productCSS : true
            // layout : false // 기본레이아웃설정을 하지 않을 때 
        });
    })
    .catch(err => {
        console.log(err);
    });
};
*************************************************************************/

//Product List
/* Mongoose version *****************************/
exports.getProducts = (req, res, net) => {
    Product
        .find() // MongoDB version의 경우 cursor를 반환하지만, Mongoose는 products를 반환함에따라
        .then(products => {
            res.render('shop/product-list', {
                prods: products, 
                pageTitle: 'All Products',
                path: '/products'
            });
        })
        .catch(err => console.log(err));
}

/* MongoDB version ****************************
exports.getProducts = (req, res, next) => {
    Product
        .fetchAll()
        .then(products => {
            res.render('shop/product-list', { 
                prods : products, 
                pageTitle : 'All products', 
                path:'/'
            });
        })
        .catch(err => {
            console.log(err);
        });
};
***********************************************/
/* Sequelize 사용으로 인한 주석처리 *****************
exports.getProducts = (req, res, next) => {
    Product.fetchAll()
        .then(([rows]) => {
            res.render('shop/product-list', { 
                prods : rows, 
                pageTitle : 'All products', 
                path:'/'
            });
        })
        .catch(err => {
            console.log(err);
    });
};
*************************************************/

//Product Detail
/* Mongoose version********************************************/
exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product
        .findById(prodId) //Mongoose내장 메소드
        .then(product => {
            res.render('shop/product-detail', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            });
        })
        .catch(err => console.log(err));
};
/* Pure, Sequelize version****************************************************************************
exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;

    // findAll()버전 : findByPk()와 다른점은 조건에 해당 배열이 반환되므로 product[0]처럼 배열의 항목을 호출해야함
    // Product.findAll({
    //     where : {
    //         id : prodId
    //     }
    //     })
    //sequelize, non-sequelize버전 모두 사용가능하므로 그대로 작성
    Product
        .findByPk(prodId)
        .then((product) => { //non-sequelize : 행을 배열로 return, sequelize : 객체 return
            res.render('shop/product-detail', {
                product: product, //non-sequelize일 시 product[0]
                pageTitle: product.title, //non-sequelize일 시 product[0].title
                //navigation.ejs 중 products항목을 active상태로 변경해주기 위함 (람다식으로 조건이 달려있기때문)
                path: '/products'
            });
        }) 
        .catch(err => console.log(err));
};
*****************************************************************************************************/

//Cart List
/* Mongoose version **************************/
exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        //populate다음 then이 오기위해 promise를 부여하지만 이 버전에서는 X
        //.execPopulate() 
        .then(user => {
            const products = user.cart.items;
            res.render('shop/cart', { 
                pageTitle : 'Your Cart', 
                path:'/cart',
                products : products
            }); 
        })
        .catch(err => console.log(err));
};
/* MongoDB version *****************************************
exports.getCart = (req, res, next) => {
    //req.user.cart는 작동하지 않음 => User.getCart()로 호출해야함
    //console.log(req.user.cart);
    req.user
        .getCart()
        .then(products => {
            res.render('shop/cart', { 
                pageTitle : 'Your Cart', 
                path:'/cart',
                products : products
            }); 
        })
        .catch(err => console.log(err));
};
***********************************************************/
/* Sequelize version ******************************************
exports.getCart = (req, res, next) => {
    req.user.cart는 작동하지 않음 => User.getCart()로 호출해야함
    console.log(req.user.cart);
    req.user
        .getCart()
        .then(cart => {
            return cart
                .getProducts()
                .then(products => {
                    res.render('shop/cart', { 
                        pageTitle : 'Your Cart', 
                        path:'/cart',
                        products : products
                    });
                })
                .catch(err => console.log(err));    
        })
        .catch(err => console.log(err));
**************************************************************/
/* Pure version *******************************************************************************
    Cart.getCart(cart => {
        //제품정보 불러오기
        Product.fetchAll(products => {
            const cartProducts = [];
            //상품 정보 불러오기
            for(product of products) {
                //상품의 수량을 확인하기 위해 cart의 정보 불러오기
                const cartProductData = cart.products.find(prod => prod.id === product.id);
                //존재하는 상품의 상세정보(from Product) 장바구니에 담긴 수량(from Cart)을 새로운 배열에 담기
                if(cart.products.find(prod => prod.id === product.id)){
                    cartProducts.push({productData : product, qty : cartProductData.qty});
                }
            }
            res.render('shop/cart', { 
                pageTitle : 'Your Cart', 
                path:'/cart',
                //새로운 배열에 담은 상품들 반환
                products : cartProducts
            });
        });
    //});
//};
************************************************************************************************/


//Add Product To Cart
exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product
        .findById(prodId) // DB에서 해당 id를 가진 product를 찾은 뒤,
        .then(product => {
            return req.user.addToCart(product); //user객체의 addToCart()메소드를 실행시킨 결과를 반환
        })
        .then(result => {
            console.log(result);
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
};
/* Sequelize version  ************************************************************************************
exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;

    //다른 blockscope에서도 사용가능하도록 cart선언
    let fetchedCart;
    //모든 블록스코프에 newQuantity를 사용할 수 있도록 선언
    let newQuantity = 1;
    req.user
        .getCart()
        .then(cart => {
            fetchedCart = cart;
            return cart.getProducts({where: {id: prodId}});
        })
        .then(products => {
            let product;
            if(products.length > 0){
                product = products[0];
            }
            //기준객체.add연결객체(); : Sequelize에 의해 추가된 다대다 관계 메소드
            //동일한 제품이 장바구니에 추가된다면 quantity가 증가하므로 {through: {quantity: newQuatity}}을 통해 전달함
            if(product){
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1;
                //아래 then구문으로 한 번에 작성하기 위해 변경
                return product;
                // return fetchedCart.addProduct(product, {through: {quatity: newQuantity}});
            }
            //동일한 제품이 장바구니에 없다면, 상품이 추가된채로 전달(newQuantity가 1이기 떄문에 수량은 1로 반환됨)
            return Product.findByPk(prodId);
                //아래 then구문으로 한 번에 작성
                // .then(product => {
                //     return fetchedCart.addProduct(product, {through: {quantity: newQuantity}});
                // })
                // .catch(err => console.log(err));
        })
        .then(product => { //여기서의 data는 product와 quatity를 모두 포함
            //이미 동일한 제품이 존재한다면 수량을 기존수량+1로 전달
            //동일한 제품이 없다면 수량을 1로 전달
            return fetchedCart.addProduct(product, {through: {quantity: newQuantity}});
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
**********************************************************************************************************/
/* Pure version **********************************************************************************************************
Product.findById(prodId, (product) => { //추가요청이 들어온 상품id로 상품이 있는지를 검사한 후, 이를 바탕으로 얻은 product를 이용하여 콜백실행
    Cart.addProduct(prodId, product.price); //cart추가에 필요한 상품id와 price추출
});
res.redirect('/');
}; 
**************************************************************************************************************************/


//Checkout List
/* Sequelize 버전 *****************************
exports.getCheckout = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('shop/checkout', { 
            pageTitle : 'Checkout', 
            path:'/checkout'
        });
    });
};
**********************************************/


//Delete Cart Item
/* Mongoose version ***********************************/
exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
        .deleteItemFromCart(prodId)
        .then(result => {
                res.redirect('/cart');
            })
            .catch(err => {console.log(err)});
};
/* MongoDB version ***********************************
exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
    .deleteItemFromCart(prodId)
    .then(result => {
            res.redirect('/cart');
        })
        .catch(err => {console.log(err)});
};
*******************************************************/
/* Sequelize version *******************************************
exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
    .getCart()
    .then(cart => {
        return cart.getProducts({where : {id: prodId}});
    })
    .then(products => {
        const product = products[0];
        return product.cartItem.destroy();
    })
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => console.log(err));
    //Sequelize사용으로 인한 주석처리 
    //Product로 부터 price정보 불러오기
    // Product.findById(productId, product => {
        //     Cart.deleteProduct(productId, product.price);
        //     res.redirect('/cart');
        // }); 
}
**************************************************************/


// Add into ordered list
/* MongoDB version ************************/
exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            console.log(user.cart.items);
            const products = user.cart.items.map(i => {
                //원하는 데이터만을 저장하는 객체 반환 (수량, 제품정보)
                //return {quantity: i.quantity, product: i.productId}
                //이렇게 하면 제품에 대한 정보가 모두 담기지 않으므로 
                //아래와 같이 Mongoose의 _doc기능(.앞의 정보 안에 있는 데이터에만 접근가능)을 사용
                return {quantity: i.quantity, product: {...i.productId._doc}}

            });
            const order = new Order({
                //위에서 반환한 원하는 데이터만을 가진 객체
                products: products,
                user: {
                    name: req.user.name,
                    userId: req.user //user객체를 지정해주기만해도 해당 ID를 선택함
                }
            });
            return order.save();
        })
        .then(result => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
}

/* Sequelize version ******************************************************************************
    exports.postOrder = (req, res, next) => {
        req.user
        .getCart()
        .then(cart => {
            //장바구니를 비우기 위해 생성한 변수
            fetchedCart = cart;
            return cart.getProducts();
        })
        .then(products => {
            return req.user
            .createOrder()
            .then(order => {
                //주문수량 지정 
                //map() : order에 의해 생성된 products들을 map형식으로 변환 (JS메소드)
                return order.addProducts(products.map(product => {
                    //cart로부터 받아온 product의 orderItem 필드값(quantity)을 cartItem의 quantity로 설정
                    product.orderItem = {quantity: product.cartItem.quantity};
                    return product;
                }));
            })
            .catch(err => console.log(err));
        })
        .then(result => {
            //주문완료 후 장바구니 비워주기
            fetchedCart.setProducts(null);
        })
        .then(result => {
            //주문, 장바구니비워주기 완료 후 화면
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
    };
************************************************************************************************/ 

//Ordered List
/* Mongoose version ************************/
exports.getOrders = (req, res, next) => {
    Order
        .find({'user.userId': req.user._id})
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle : 'Your Orders',
                orders: orders
            })
        })
        .catch(err => console.log(err));
};
/* MongoDB version ************************
exports.getOrders = (req, res, next) => {
    req.user
        .getOrders()
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle : 'Your Orders',
                orders: orders
            })
        })
        .catch(err => console.log(err));
};
********************************************/
/* Sequelize version *****************************************************************
exports.getOrders = (req, res, next) => {
    req.user
        //sequelize에서
        //app.js에서 Order.belongsToMany(Product)를 실행하며 객체명을 product로 설정되었고,
        //product.js에서 Product 하나의 객체를 product로 설정되어
        //개념을 통해 product라는 객체가 중복되어 생성되었음
        //=> sequelize의 Eager Loading이라는 개념을 이용하여
        //   Sequelize가 orders를 가져올 때,관련된 products까지 가져와서 order와 그 해당하는 제품을 포함한 배열을 제공하도록 함
        //   ==>> 각 주문마다 products배열이 들어감
        .getOrders({include: ['products']})
        .then(orders => {
            res.render('shop/orders', { 
                pageTitle : 'Your Orders', 
                path:'/orders',
                orders: orders
            });
        })
        .catch(err => console.log(err));
};
************************************************************************************************/ 

//Delete Product
exports.delete = (req, res, next) => {
};