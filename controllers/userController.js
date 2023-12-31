const User= require('../models/userModel')
const userHelper= require('../helpers/userHelper')
const otpHelper = require('../helpers/otpHelper')
const Product = require('../models/productModel')
const Banner=require('../models/bannerModel')
const Category = require('../models/categoryModel')
require('dotenv').config();// Module to Load environment variables from .env file

const bcrypt= require('bcrypt')
const jwt = require('jsonwebtoken')

const maxAge = 3*24*60*60;
const createToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET_KEY,{
        expiresIn: maxAge
    })
}


const securePassword = async(password)=>{
    try{
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash
    }catch(error){
        console.log(error.message);
    }
}


const loadHome = async(req,res)=>{
    try {
        const banner=await Banner.find({ isBannerListed: true })
        
        res.render('index',{banner})
    } catch (error) {
        console.log(error.message); 
    }
}
const signUp = (req,res)=>{
    try {
        res.render('signup')
    } catch (error) {
        console.log(error.message)
        
    }
}
const logIn = (req,res)=>{
    try {


        if(res.locals.user!=null){
            res.redirect('/')
        }
        else{
            
        res.render('login')
        }
    } catch (error) {
        console.log(error.message)
        
    }
}
const insertUser = async(req,res)=>{

    const email = req.body.email;
    const mobileNumber = req.body.mno
    const existingUser = await User.findOne({email:email})
    if (!req.body.fname || req.body.fname.trim().length === 0) {
        return res.render("signup", { message: "Name is required" });
    }
    if (/\d/.test(req.body.fname) || /\d/.test(req.body.lname)) {
        return res.render("signup", { message: "Name should not contain numbers" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)){
        return res.render("signup", { message: "Email Not Valid" });
    }
    if(existingUser){
      return res.render("signup",{message:"Email already exists"})
    }
    const mobileNumberRegex = /^\d{10}$/;
    if (!mobileNumberRegex.test(mobileNumber)) {
        return res.render("signup", { message: "Mobile Number should have 10 digit" });

    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if(!passwordRegex.test(req.body.password)){
        return res.render("signup", { message: "Password Should Contain atleast 8 characters,one number and a special character" });
    }
    // console.log(req.body.password)
    // console.log(req.body.confpassword)


    if(req.body.password!=req.body.confPassword){
        return res.render("signup", { message: "Password and Confirm Password must be same" });
    }
    // const otp=otpHelper.generateOtp()
    // console.log(`Otp is ${otp}`);
    await otpHelper.sendOtp(mobileNumber)


    try {
        req.session.userData=req.body
        req.session.mobile = mobileNumber 
        res.render('verifyOtp');

    } catch (error) {
        console.log(error.message);
    }


    

 }

 const verifyOtp = async(req,res)=>{
    const otp = req.body.otp
    try {
    const userData = req.session.userData;
    const verified = await otpHelper.verifyCode(userData.mno,otp)

    if(verified){
    const spassword =await securePassword(userData.password)
        const user = new User({
            fname:userData.fname,
            lname:userData.lname,
            email:userData.email,
            mobile:userData.mno,
            password:spassword,
            is_admin:0
        })
        const userDataSave = await user.save()
        if(userDataSave){
            const token = createToken(user._id);
            res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
            res.redirect('/')
        }else{
            res.render('register',{message:"Registration Failed"})
        }
      }else{
        res.render('verifyOtp',{ message: 'Wrong Otp' });

      }


    } catch (error) {
        console.log(error.message);
     
    }
}


 const resendOTP = async (req, res) => {
    const mobileNumber = req.session.mobile
    try {
      // Retrieve user data from session storage
      const userData = req.session.userData;
      
  
      if (!userData) {

       

        res.status(400).json({ message: 'Invalid or expired session' });
      }
      await otpHelper.sendOtp(mobileNumber)
  
      // Generate and send new OTP using Twilio


    //   const otp=otpHelper.generateOtp()
    // console.log(`Otp is ${otp}`);
      
  
      res.render('verifyOtp',{ message: 'OTP resent successfully' });
    } catch (error) {
      console.error('Error: ', error);
      res.render('verifyOtp',{ message: 'Failed to send otp' });
    }
  };


const verifyLogin = async(req,res)=>{
    const data = req.body;
    const result= await userHelper.verifyLogin(data);
    if(result.error){
        res.render('login',{message: result.error});

    }else{ 
        const token = result.token;
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.redirect('/');
      }

}
    
const loadForgotPassword = async(req,res)=>{
        try {
            res.render('forgotPassword')
        } catch (error) { 
            console.log(error.message)
        }
    }

    const forgotPasswordOtp = async(req, res)=>{       
        const user = await User.findOne({mobile : req.body.mobile})                                     
        // req.session.number = number
        if(!user){
            res.render('forgotPassword',{message:"User Not Registered"})
        }else{
            const OTP = otpHelper.generateOtp()
            // await otpHelper.sendOtp(user.mobile,OTP)
            console.log(`Forgot Password otp is --- ${OTP}`) 
            req.session.otp = OTP
            req.session.email = user.email
            res.render('forgotPasswordOtp')
        }
         
    }

    const resetPasswordOtpVerify = async (req,res)  => {
        try{
            const mobile = req.session.mobile
            const otp = req.session.otp
            const reqOtp = req.body.otp
    
            const otpHolder = await User.find({ mobile : req.body.mobile })
            if(otp==reqOtp){
                res.render('resetPassword')
            }
            else{
                res.render('forgotPasswordOtp',{message:"Your OTP was Wrong"})
            }
        }catch(error){
            console.log(error);
            return console.log("an error occured");
        }
    }
    const setNewPassword = async (req ,res) => {
        const newpw = req.body.newpassword
        const confpw = req.body.confpassword
    
        const mobile = req.session.mobile
        const email = req.session.email
    
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if(!passwordRegex.test(req.body.newpassword)){
            return res.render("resetPassword", { message: "Password Should Contain atleast 8 characters,one number and a special character" });
        }
    
        if(newpw === confpw){
    
            const spassword =await securePassword(newpw)
            const newUser = await User.updateOne({ email:email }, { $set: { password: spassword } });
    
            res.redirect('/login')
        }else{
            res.render('resetPassword',{message:'Password and Confirm Password is not matching'})
        }
    }    

    const displayProduct = async (req, res) => {
        try {
          const category = await Category.find({});
          const page = parseInt(req.query.page) || 1;
          const limit = 6;
          const skip = (page - 1) * limit; // Calculate the number of products to skip
          const searchQuery = req.query.search || ''; // Get the search query from request query parameters
          const sortQuery = req.query.sort || 'default'; // Get the sort query from request query parameters (default value is 'default')
          const minPrice = parseFloat(req.query.minPrice); // Get the minimum price from request query parameters
          const maxPrice = parseFloat(req.query.maxPrice)
    
      
          // Build the search filter
          const searchFilter = {
            $and: [
              { isListed: true },
              { isProductListed: true },
              {
                $or: [
                  { name: { $regex: new RegExp(searchQuery, 'i') } },
                ],
              },
            ],
          };
          if (!isNaN(minPrice) && !isNaN(maxPrice)) {
            searchFilter.$and.push({ price: { $gte: minPrice, $lte: maxPrice } });
          }
    
          let sortOption = {};
          if (sortQuery === 'price_asc' ||sortQuery === 'default' ) {
            sortOption = { price: 1 }; 
          } else if (sortQuery === 'price_desc') {
            sortOption = { price: -1 }; 
          }
      
          const totalProducts = await Product.countDocuments(searchFilter); // Get the total number of products matching the search query
          const totalPages = Math.ceil(totalProducts / limit); // Calculate the total number of pages
      
          const products = await Product.find(searchFilter)
            .skip(skip)
            .limit(limit)
            .sort(sortOption)
            .populate('category');

        if(searchQuery!=''){
            res.render('categoryShop',{product: products,category, currentPage: page, totalPages })

        }else{
            res.render('shop', { product: products, category, currentPage: page, totalPages });

        }
      
         
        } catch (error) {
          console.log(error.message);
          res.redirect('/error-500')
    
        }
      };
const profile = async(req,res)=>{
    try {
        res.render('profile')
    } catch (error) {
        console.log(error.message);
    }
}
      
    

const logout = (req,res) =>{
    res.cookie('jwt', '' ,{maxAge : 1})
    res.redirect('/')
}


const error404 = async(req,res)=>{
  try {
    res.render('errorPages/error-404')
    
  } catch (error) {
    console.log(error.message);
    
  }
}

module.exports = {
    loadHome,
    signUp,
    logIn,
    insertUser,
    verifyLogin,
    verifyOtp,
    loadForgotPassword,
    forgotPasswordOtp,
    resetPasswordOtpVerify,
    setNewPassword,
    displayProduct,
    profile,
    resendOTP,
    logout,
    error404
};
