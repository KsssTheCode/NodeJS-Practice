const Product = require('../models/product');

//postEditProduct에서 생성자에 그냥 prodId만 전달하며 아래 두 구문 삭제
//const mongodb = require('mongodb');
//const ObjectId = mongodb.ObjectId;

// Move to Add-product view
// MVC패턴을 위한 이관한 후 exports로 내보내기
exports.getAddProduct = (req, res, next) => {
        res.render('admin/edit-product', {
                pageTitle:'Add Product', 
                // 특정 네비게이션 항목을 강조할 때 사용하므로, add-product.ejs가 없음에도 유지
                // 쉽게 말해서 실제 연결되는 파일은 edit-product.ejs이더라도, 경로는 add-product가 가능하도록 함
                path:'/admin/add-product' ,
                // handlebars에서 사용하는 구문 
                // formsCSS : true, 
                // productCSS : true, 
                // activeAddProduct : true
        
                //edit이라는 쿼리문이 없을 때
                editing: false
            });
        }

//Add Product
/* Mongoose version ******/
exports.postAddProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    //Mongoose사용 시, 전체 매개변수를 보내 생성자를 생성하는 것이 아니라, 하나의 JS객체만 전달해주면 됨
    const product = new Product({title: title, price: price, description: description, imageUrl: imageUrl, userId : req.user._id});
    
    product
        .save() //Mongoose에서 제공되는 메소드 (이 전처럼 model객체에 따로 생성할 필요가 없음)
        .then(result => {
        // console.log(result);
        console.log('Created Product');
        res.redirect('/admin/products');
        })
        .catch(err => {
        console.log(err);
        });
};
/* MongoDB version ****************************************************************************************
exports.postAddProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    //이 시점에서는 productId는 자동으로 생성되기때문에 null로 설정
    //const product = new Product(title, price, description, imageUrl, null, new ObjectId(prodId));
    product
        .save()
        .then(result => {
        // console.log(result);
        console.log('Created Product');
        res.redirect('/admin/products');
        })
        .catch(err => {
        console.log(err);
        });
};
***********************************************************************************************************/ 
/* Sequelize version ************************************************************
exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    
    Product.create({
            title: title,
            price: price,
            description: description,
            imageUrl: imageUrl,
            userId : req.user.id //sequelize객체, DB에서 가져온 userId
    }).then(result => {
        console.log('Created Product');
        res.redirect('/admin/products');
    }).catch(err => {
        console.log(err);
    });
}
****************************************************************************/
/* Pure version *************************************************************
exports.postAddProduct = (req, res, next) => {
    // 이 js파일에서 생성된 products객체가 아닌 Product객체(클래스)로 변경
    // products.push({ title : req.body.title });

    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

    //null은 아이디가 들어갈 자리 (아래 save()메소드로 추가해줌)
    const product = new Product(null, title, imageUrl, price, description); 
    product
    .save()
    .then(() => {
        res.redirect('/')
    })
    .catch({

    });
};
****************************************************************************/      

//Move to Edit-product view

/* MongoDB, Mongoose version **********************/
exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if(!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product
        .findById(prodId)
        .then(product => {
            if(!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle:'Edit Product', 
                path:'/admin/edit-product',
                editing : editMode,
                product: product
            })
        })
        .catch(err => console.log(err));
};
/* Sequelize version *****************************************************************************************
exports.getEditProduct = (req, res, next) => {
    //edit이라는 키(쿼리문)이 있을 때 editMode = true (boolean타입이기때문에 false일 시, 값이 없는 것으로 간주(undefined))
    const editMode = req.query.edit;
    if(!editMode){ // edit이라는 쿼리문이 없을 시
        return res.redirect('/');
    }
    const prodId = req.params.productId;

    req.user
        .getProducts({where: {id :prodId}})
    //위 구문으로 대체
    //(Sequelize객체에 존재하는 getProducts메소드로 조건제시하여 검색)
    //Product.findByPk(prodId)
       .then(products => {
            //sequelize구문으로 변경함에 따라 getProducts는 배열로 불러와지기 때문에 
            //특정 상품을 지정해주어야 함 (하나만 선택하는 경우라면)
            const product = products[0];
            if(!product){
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle:'Edit Product', 
                path:'/admin/edit-product',
                editing : editMode,
                product: product
            })
        })
       .catch(err => console.log(err));
};
**********************************************************************************************************/
/* pure version *******************************************************************************************
exports.getEditProduct = (req, res, next) => {
    //edit이라는 키(쿼리문)이 있을 때 editMode = true (boolean타입이기때문에 false일 시, 값이 없는 것으로 간주(undefined))
    const editMode = req.query.edit;
    if(!editMode){ // edit이라는 쿼리문이 없을 시
        return res.redirect('/');
    }
    const prodId = req.params.productId;

    Product.findById(prodId, product => {
        if(!product){
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            pageTitle:'Edit Product', 
            path:'/admin/edit-product',
            //view editing에 추가 정보 필드를 전달하고, if조건으로 확인할 수 있도록 함
            editing : editMode,
            product: product
        });
    });
}
************************************************************************************************************/

//Edit Product
/* MongoDB version ***************************************************/
exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;

    Product
        .findById(prodId)
        .then(product => {
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDescription;
            product.imageUrl = updatedImageUrl;
            return product.save(); // Mongoose내장 메소드
        })
        .then(result => {
            console.log('UPDATED PRODUCT!');
            res.redirect('/admin/products');
        })
        //코드 가독성향상으로 인한 2중 then구문 모두에 대한 err를 확인해줌
        .catch(err => console.log(err));
}
/* MongoDB version ***************************************************
exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    const product = new Product(updatedTitle
                              , updatedPrice
                              , updatedDescription
                              , updatedImageUrl
                              //prodId로 대체 (위 import구문 삭제)
                              //, new ObjectId(prodId));
                              , prodId
                              //app.js의 미들웨어에서 user의 _id정보 호출
                              , req.user._id);
    product //Product에서 새롭게 생성한 product의 메소드로 대체 
        .save()
        .then(result => {
            console.log('UPDATED PRODUCT!');
            res.redirect('/admin/products');
        })
        //코드 가독성향상으로 인한 2중 then구문 모두에 대한 err를 확인해줌
        .catch(err => console.log(err));
}
**********************************************************************/
/* Sequelize version **********************************************************************************************
 * exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;

    Product
        .findById(prodId)
        .then(productData => {
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDescription;
            product.imageUrl = updatedImageUrl;
            
            //promise제약이 걸려있어 직접 작성도 가능하지만, 복잡한 구조를 피하기 위해 작성하지 않고 return후 메소드체이닝으로 promise실행
            return product.save();
        })
        .then(result => {
            console.log('UPDATED PRODUCT!');
            res.redirect('/admin/products');
        })
        //코드 가독성향상으로 인한 2중 then구문 모두에 대한 err를 확인해줌
        .catch(err => console.log(err));
}
******************************************************************************************************************/
// exports.postEditProduct = (req, res, next) => {
//     //post방식의 경우 req.body로 form내부의 정보를 가져올 수 있음 (name값과 일치))
//     const prodId = req.body.productId;
//     const updatedTitle = req.body.title;
//     const updatedImageUrl = req.body.imageUrl;
//     const updatedPrice = req.body.price;
//     const updatedDescription = req.body.description;
    
//     //sequelize구문으로 변경
//     //Product.findByPk(prodId)
//     req.user
//         .getProducts({where: {id : prodId}})
//         .then(products => {
//             const product = products[0]
//             product.title = updatedTitle;
//             product.price = updatedPrice;
//             product.description = updatedDescription;
//             product.imageUrl = updatedImageUrl;
            
//             //promise제약이 걸려있어 직접 작성도 가능하지만, 복잡한 구조를 피하기 위해 작성하지 않고 return후 메소드체이닝으로 promise실행
//             return product.save();
//         })
//         //return product.save()에 대한 promise
//         .then(product => {
//             console.log('UPDATED PRODUCT!');
//             res.redirect('/admin/products');
//         })
//         //코드 가독성향상으로 인한 2중 then구문 모두에 대한 err를 확인해줌
//         .catch(err => console.log(err));

//     //여기서 redirect가 실행된다면, 위의 then구문이 완료되기 전 redirect되므로 변경사항들이 반영되지 않음.
//     //따라서, redirect는 위의 then블록 안으로 들어가야함
//     //res.redirect('/admin/products');
    
//     /* non-sequelize버전
//     const updatedProduct = new Product(prodId, updatedTitle, updatedImageUrl, updatedPrice, updatedDescription);
//     updatedProduct.save(); */

//     res.redirect('/admin/products');
// }


//Move to Admin-products
/* Mongoose version **************************/
exports.getProducts = (req, res, next) => {
    Product
        .find()
        //.select('title price -_id')
        //.populate('userId', 'name') //'userId.user처럼 중첩된 경로로도 지정 가능
        .then(products => {
            console.log(products);
            res.render('admin/products', { 
                prods : products,
                pageTitle : 'Admin Products', 
                path:'/admin/products'
            });
        })
        .catch(err => console.log(err));
}
/* MongoDB version **************************
exports.getProducts = (req, res, next) => {
    Product
        .fetchAll()
        .then(products => {
            res.render('admin/products', { 
                prods : products,
                pageTitle : 'Admin Products', 
                path:'/admin/products'
            });
        })
        .catch(err => console.log(err));
}
**********************************************/
/* Sequelize version ************************
exports.getProducts = (req, res, next) => {
    req.user
        .getProducts()
        .then(products => {
            res.render('admin/products', { 
                prods : products,
                pageTitle : 'Admin Products', 
                path:'/admin/products'
            });
        })
        .catch(err => console.log(err));
};
**********************************************/
/* Pure version ******************************
exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render('admin/products', { 
            prods : products,
            pageTitle : 'Admin Products', 
            path:'/admin/products'
        });
    });
};
**********************************************/


//Delete product
/* Mongoose version **********************************/
exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findByIdAndRemove(prodId) //Mongoose내장 메소드
        .then(() => {
            console.log('DESTROYED PRODUCT');
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
}
/* MongoDB version *************************************
exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteById(prodId)
        .then(() => {
            console.log('DESTROYED PRODUCT');
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
}
******************************************************/
/* pure version ****************************************
// exports.postDeleteProduct = (req, res, next) => {
//     const prodId = req.body.productId;

//     //sequelize구문으로 변경하지 않아도 잘 작동
//     Product
//         .findByPk(prodId)
//         .then(product => {
//             return product.destroy();
//         })
//         .then(result => {//삭제가 완료된 후 실행될 구문
//             console.log('DESTROYED PRODUCT');
//             res.redirect('/admin/products');
//         })
//         .catch(err => console.log(err));
    
//     res.redirect('/admin/products');
// }
*******************************************************/