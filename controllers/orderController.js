const Address = require("../models/AddressModel");
const Cart = require('../models/cartModel');
const { ObjectId } = require("mongodb");
const fs = require("fs");
const Order = require('../models/orderModel');
const { Readable } = require('stream');
const path=require('path')
const orderHelper = require('../helpers/orderHelper')
const adminHelper = require('../helpers/adminHelper')

const checkOut = async (req,res)=>{         
    try {
        const user = res.locals.user
        const total = await Cart.findOne({ user: user.id });
        const address = await Address.findOne({user:user._id}).lean().exec()
        
        const cart = await Cart.aggregate([
            {
              $match: { user: user.id }
            },
            {
              $unwind: "$cartItems"
            },
            {
              $lookup: {
                from: "products",
                localField: "cartItems.productId",
                foreignField: "_id",
                as: "carted"
              }
            },
            {
              $project: {
                item: "$cartItems.productId",
                quantity: "$cartItems.quantity",
                total: "$cartItems.total",
                carted: { $arrayElemAt: ["$carted", 0] }
              }
            }
          ]);
      if(address){
        res.render('checkOut',{address:address.addresses,cart,total}) 
      }else{
        res.render('checkOut',{address:[],cart,total})
      }
    } catch (error) {
        console.log(error.message)
        
    }
}

const postCheckOut = async (req, res) => {
  try {
    const userId = res.locals.user._id;
    const data = req.body;

    try {
      const checkStock = await orderHelper.checkStock(userId);
      if (checkStock) {
        if (data.paymentOption === "cod") {
          const updatedStock = await orderHelper.updateStock(userId);
          const response = await orderHelper.placeOrder(data, userId);
          await Cart.deleteOne({ user: userId });
          res.json({ codStatus: true });
        } else {
          await Cart.deleteOne({ user: userId });
          res.json({ status: 'OrderFailed' });
        }
      } else {
        await Cart.deleteOne({ user: userId });
        res.json({ status: 'OrderFailed' });
      }
    } catch (error) {
      console.log({ error: error.message }, "22");
      res.json({ status: false, error: error.message });
    }
  } catch (error) {
    console.error(error.message);
  }
};


const changePrimary = async (req, res) => {
  try {
    const userId = res.locals.user._id
    const result = req.body.addressRadio;
    const user = await Address.find({ user: userId.toString() });

    const addressIndex = user[0].addresses.findIndex((address) =>
      address._id.equals(result)
    );
    if (addressIndex === -1) {
      throw new Error("Address not found");
    }

    const removedAddress = user[0].addresses.splice(addressIndex, 1)[0];
    user[0].addresses.unshift(removedAddress);

    const final = await Address.updateOne(
      { user: userId },
      { $set: { addresses: user[0].addresses } }
    );

    res.redirect("/checkOut");
  } catch (error) {
    console.log(error.message);
  }
};

const orderList  = async(req,res)=>{
  try {
    const user  = res.locals.user
    // const order = await Order.findOne({user:user._id})
    const orders = await Order.aggregate([
      {$match:{user:user._id}},
      { $unwind: "$orders" },
      { $sort: { "orders.createdAt": -1 } },
    ])
    res.render('profileOrder',{orders})

    
   
  } catch (error) {
    console.log(error.message);
    
  }


}

const orderDetails = async (req,res)=>{
  try {
    const user = res.locals.user
    const id = req.query.id
    orderHelper.findOrder(id, user._id).then((orders) => {
      const address = orders[0].shippingAddress
      const products = orders[0].productDetails 
      res.render('orderDetails',{orders,address,products})
    });      
  } catch (error) {
    console.log(error.message);
  }

}
const cancelOrder = async(req,res)=>{

  const orderId = req.body.orderId
  const status = req.body.status
  orderHelper.cancelOrder(orderId, status).then((response) => {
    res.send(response);
  });


}





module.exports={
    checkOut,
    changePrimary,
    postCheckOut,
    orderList,
    orderDetails,
    cancelOrder
}