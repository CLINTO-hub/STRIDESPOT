const express = require('express')
const adminRoute = express()
const adminController = require('../controllers/adminController')
const categoryController = require('../controllers/categoryController')
const validate1 = require('../middleware/adminAuth')
const productController = require('../controllers/productController')
const couponController = require('../controllers/couponController')
const bannerController = require('../controllers/bannerController')
const multer = require("../multer/multer");



const session = require('express-session');
const cookieparser = require('cookie-parser');
adminRoute.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  }));
  

  //view engine
  adminRoute.set('view engine','ejs')
  adminRoute.set('views','./views/admin')

  //parsing
  adminRoute.use(express.json())  
  adminRoute.use(express.urlencoded({extended:true}))   
  adminRoute.use(cookieparser())

  //home page 
  adminRoute.get('/',adminController.loadLogin) 

  adminRoute.get('/dashboard',validate1.requireAuth,adminController.loadDashboard)
  
  adminRoute.get('/logOut',adminController.logout)
  adminRoute.post('/login',adminController.verifyLogin)
  adminRoute.get('/users',adminController.loadUsers)
  adminRoute.get('/blockUser',adminController.blockUser)
  adminRoute.get('/unBlockUser',adminController.unBlockUser)

  //category
  adminRoute.get('/category',validate1.requireAuth,categoryController.loadCategory)
  adminRoute.get('/addCategory',validate1.requireAuth,categoryController.loadAddCategory)
  adminRoute.post('/addCategory',validate1.requireAuth,categoryController.createCategory)
  adminRoute.get('/editCategory',validate1.requireAuth,categoryController.loadUpdateCategory)
  adminRoute.post('/editCategory',validate1.requireAuth,categoryController.updateCategory)
  adminRoute.get('/unListCategory',validate1.requireAuth,categoryController.unListCategory)
  adminRoute.get('/reListCategory',validate1.requireAuth,categoryController.reListCategory)
  
  //Product
  adminRoute.get('/product',validate1.requireAuth,productController.loadProducts) 
  adminRoute.post('/addProduct',multer.upload,productController.createProduct)
  adminRoute.get('/displayProduct',validate1.requireAuth,productController.displayProduct)
  adminRoute.get('/unListProduct',productController.unListProduct)
  adminRoute.get('/reListProduct',productController.reListProduct)
  adminRoute.get('/updateProduct',validate1.requireAuth,productController.loadUpdateProduct)
  adminRoute.post('/updateProduct',multer.upload,productController.updateProduct)
  

  //order
  adminRoute.get('/orderList',validate1.requireAuth,adminController.orderList)
  adminRoute.get('/orderDetails',validate1.requireAuth,adminController.orderDetails)

  adminRoute.put('/orderStatus',adminController.changeStatus)  
  adminRoute.put('/cancelOrder',adminController.cancelOrder)
  adminRoute.put('/returnOrder',adminController.returnOrder)

  //coupon
  adminRoute.get('/addCoupon',validate1.requireAuth,couponController.loadCouponAdd)
  adminRoute.post('/addCoupon',couponController.addCoupon)
  adminRoute.get('/generate-coupon-code',validate1.requireAuth,couponController.generateCouponCode)
  

  adminRoute.get('/couponList',validate1.requireAuth,couponController.couponList)

  //Banner
  adminRoute.get('/bannerList',validate1.requireAuth,bannerController.bannerList)
  adminRoute.post('/addBanner',validate1.requireAuth,multer.addBannerupload,bannerController.addBannerPost)
  adminRoute.get('/addBanner',validate1.requireAuth,bannerController.addBannerGet)


  adminRoute.get('/unListBanner',bannerController.unListBanner)
  adminRoute.get('/reListBanner',bannerController.reListBanner)

  adminRoute.get('/deleteBanner',bannerController.deleteBanner)




  //SalesReport
  adminRoute.get('/salesReport',validate1.requireAuth,adminController.getSalesReport)
  adminRoute.post('/salesReport',validate1.requireAuth,adminController.postSalesReport)
  








  module.exports = adminRoute;  