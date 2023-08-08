const express = require('express')
const userRoute = express()
const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const validate = require('../middleware/authMiddleware')
const categoryController = require('../controllers/categoryController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const profileController = require('../controllers/profileController')
userRoute.use(express.json())
userRoute.use(express.urlencoded({extended:true}))
const session = require('express-session');
const cookie = require('cookie-parser')
const nocache = require('nocache')
userRoute.use(nocache())

userRoute.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));

userRoute.use(cookie())

userRoute.set('view engine','ejs')
userRoute.set('views','./views/users')

//Check user
userRoute.all('*',validate.checkUser)

//Home
userRoute.get('/',userController.loadHome)

//Sign up
userRoute.get('/signup',userController.signUp)
userRoute.post('/signup',userController.insertUser)
userRoute.post('/verifyOtp',userController.verifyOtp)

//Login
userRoute.get('/login',userController.logIn)
userRoute.post('/login',userController.verifyLogin)
userRoute.get('/logout',userController.logout)

//shop
userRoute.get('/shop',userController.displayProduct)
userRoute.get('/productPage',productController.productPage)
userRoute.get('/categoryShop',categoryController.categoryPage)

//Forgot Password
userRoute.get('/forgotPassword',userController.loadForgotPassword)
userRoute.post('/forgotPasswordOtp',userController.forgotPasswordOtp)
userRoute.post('/forgotPassword',userController.resetPasswordOtpVerify)
userRoute.post('/setNewPassword',userController.setNewPassword)

//profile
userRoute.get('/profileDetails',validate.requireAuth,profileController.profile)
userRoute.get('/profileAddress',validate.requireAuth,profileController.profileAdress)

//cart
userRoute.get('/cart',validate.requireAuth,cartController.loadCart)
userRoute.post('/addToCart/:id',validate.requireAuth,cartController.addToCart)

userRoute.put('/change-product-quantity',cartController.updateQuantity)
userRoute.delete("/delete-product-cart",cartController.deleteProduct);

//CheckOut
userRoute.get('/checkOut',validate.requireAuth,orderController.checkOut)
userRoute.post('/checkOut',validate.requireAuth,orderController.postCheckOut)
userRoute.post('/checkOutAddress',validate.requireAuth,profileController.checkOutAddress)
userRoute.post('/changeDefaultAddress',orderController.changePrimary)

//order
userRoute.get('/orderDetails',validate.requireAuth,orderController.orderDetails)
userRoute.get('/profileorderList',validate.requireAuth,orderController.orderList)

//cancelOrder
userRoute.put('/cancelOrder',orderController.cancelOrder)   




module.exports = userRoute