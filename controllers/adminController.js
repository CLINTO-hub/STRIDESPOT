const Admin = require('../models/adminModel')
const User = require('../models/userModel')
const orderHelper = require('../helpers/orderHelper')
const adminHelper = require('../helpers/adminHelper')

const jwt = require('jsonwebtoken');

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'my-secret', {
    expiresIn: maxAge
  });
};

const loadLogin = async(req,res)=>{
   try {

    res.render('login')
   } catch (error) {
    console.log(error.message);
   }
}

const verifyLogin = async(req,res)=>{
  try{
    const username = req.body.username
    const password = req.body.password

    const adminData = await Admin.findOne({userName:username})

    if(adminData.password === password){
      if(adminData){
        const token = createToken(adminData._id);
        res.cookie('jwtAdmin', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.redirect('/admin/users')
    }else{
        res.render('login',{message:"Email and Password are Incorrect"});
    }
    
}else{
    res.render('login',{message:"Email and Password are Incorrect"});
}

} catch (error) {
console.log(error.message);
}
}

const loadUsers = async (req, res) => {
  try {
      var search = ''
      if (req.query.search) {
          search = req.query.search
      }
      
      const usersData = await User.find({
          $or: [
              { fname: { $regex: '.*' + search + '.*' } },
              { lname: { $regex: '.*' + search + '.*' } },
              { email: { $regex: '.*' + search + '.*' } },
              { mobile: { $regex: '.*' + search + '.*' } },
          ]
      });

      res.render('users', {
          user: usersData
      });
  } catch (error) {
      console.log(error.message);
  }
}
const blockUser = async(req,res)=>{
  
  try {
    const id = req.query.id
    await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:true}})
    res.redirect('/admin/users')
  } catch (error) {
    console.log(error.message);
  }
}

const unBlockUser = async(req,res)=>{
  try {
    const id = req.query.id
    await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:false}})
    res.redirect('/admin/users')
  } catch (error) {
    console.log(error.message)
  }
}

const orderList = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  orderHelper
    .getOrderList(page, limit)
    .then(({ orders, totalPages, page: currentPage, limit: itemsPerPage }) => {
      res.render("orderList", {
        orders,
        totalPages,
        page: currentPage,
        limit: itemsPerPage,
      });
    })
    .catch((error) => {
      console.log(error.message);
    });
};


const orderDetails = async (req,res)=>{
  try {
    const id = req.query.id
    adminHelper.findOrder(id).then((orders) => {
      const address = orders[0].shippingAddress
      const products = orders[0].productDetails 
      res.render('orderDetails',{orders,address,products}) 
    });
      
  } catch (error) {
    console.log(error.message);
  }

}

const cancelOrder = async(req,res)=>{
  const userId = req.body.userId

  const orderId = req.body.orderId
  const status = req.body.status

  adminHelper.cancelOrder(orderId,userId,status).then((response) => {
    res.send(response);
  });

}


const returnOrder = async(req,res)=>{
  const orderId = req.body.orderId
  const status = req.body.status
  const userId = req.body.userId


  adminHelper.returnOrder(orderId,userId,status).then((response) => {
    res.send(response);
  });

}   


const changeStatus = async(req,res)=>{
  const orderId = req.body.orderId
  const status = req.body.status
  adminHelper.changeOrderStatus(orderId, status).then((response) => {
    res.json(response);
  });

}

const logout = (req,res) =>{
  res.cookie('jwtAdmin', '' ,{maxAge : 1})
  res.redirect('/admin')
}



module.exports={
  loadLogin,
  verifyLogin,
  loadUsers,
  blockUser,
  unBlockUser,
  orderList,
  orderDetails,
  cancelOrder,
  returnOrder,
  changeStatus,
  logout
}