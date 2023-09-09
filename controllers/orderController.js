const Address = require("../models/AddressModel");
const Cart = require('../models/cartModel');
const { ObjectId } = require("mongodb");
const fs = require("fs");
const Order = require('../models/orderModel');
const { Readable } = require('stream');
const path=require('path')
const orderHelper = require('../helpers/orderHelper')
const adminHelper = require('../helpers/adminHelper')
const couponHelper = require('../helpers/couponHelper')
const easyinvoice = require('easyinvoice')
const User = require('../models/userModel')
const checkOut = async (req,res)=>{         
    try {
        const user = res.locals.user
        const total = await Cart.findOne({ user: user.id });
        const address = await Address.findOne({user:user._id}).lean().exec()
        const userData =  await user.wallet
        
        
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
        res.render('checkOut',{address:address.addresses,cart,total,userData}) 
      }else{
        res.render('checkOut',{address:[],cart,total})
      }
    } catch (error) {
        console.log(error.message)
        
    }
}

const postCheckOut  = async (req, res) => {
  try {
    const userId = res.locals.user._id;
    const data = req.body;
    const userData = await User.findById(userId);
    
    const couponCode = data.couponCode
    await couponHelper.addCouponToUser(couponCode, userId);

    req.session.wallet=data.wall1
   
    try { 
      
      const checkStock = await orderHelper.checkStock(userId)
     


      if(checkStock){
      if (data.paymentOption === "cod") { 
        const updatedStock = await orderHelper.updateStock(userId)
        const response = await orderHelper.placeOrder(data,userId);
        await Cart.deleteOne({ user:userId  })
        res.json({ codStatus: true });
      } 
        else if (data.paymentOption === "wallet") {
          const updatedStock = await orderHelper.updateStock(userId)
          const response = await orderHelper.placeOrder(data,userId);
          res.json({ orderStatus: true, message: "order placed successfully" });
          await Cart.deleteOne({ user:userId  })
      }else if (data.paymentOption === "razorpay") {
        const response = await orderHelper.placeOrder(data,userId);
        const order = await orderHelper.generateRazorpay(userId,data.total);
        res.json(order);
       
      }
    }else{
      await Cart.deleteOne({ user:userId  })  
      res.json({ status: 'OrderFailed' });
    }

    } catch (error) {
      console.log({ error: error.message }, "22");
      res.json({ status: false, error: error.message });
    } 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}


const walletStatus = async(req,res)=>{
  const id= res.locals.user._id;
  try {
    const user= await User.findOne({_id:id})
    const cart = await Cart.findOne({ user:id });
   const wallet=user.wallet
   const total=cart.total
     user.wallet=0;
     await user.save()



    if(checkBox.checked){
    const userData = await User.findById(user1);
    userData.wallet = 0;
    }
    else{
      userData.wallet = user1.wallet
    }
    

  } catch (error) {
    console.log(error.message);
  }

}



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
    const currentDate = new Date() 

    // const order = await Order.findOne({user:user._id})
    const orders = await Order.aggregate([
      {$match:{user:user._id}},
      { $unwind: "$orders" },
      { $sort: { "orders.createdAt": -1 } },
    ])
    const datess = currentDate-orders[0].orders.createdAt
    await(datess / (1000 * 3600 * 24))
    res.render('profileOrder',{orders,currentDate})

    
   
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
  const reason = req.body.reason
  console.log("reason",reason);

  orderHelper.cancelOrder(orderId, status,reason).then((response) => {
    console.log("res",response);
   
    res.send(response);

  });


}

const applyCoupon =  async (req, res) => {
  const couponCode = req.params.id 
  const userId = res.locals.user._id
  const total = await orderHelper.totalCheckOutAmount(userId) 
  couponHelper.applyCoupon(couponCode, total).then((response) => {
      res.send(response)
  }) 
}

const verifyCoupon = (req, res) => {
  const couponCode = req.params.id
  const userId = res.locals.user._id
  couponHelper.verifyCoupon(userId, couponCode).then((response) => {
      res.send(response)
  })
}

const verifyPayment = async (req, res) => {
  const userId = res.locals.user._id;
  const data = req.session.wallet;
  console.log("razorwall"+data);
  
  if(data=="1"){
    const userData = await User.findById(userId);
    const wallet=userData.wallet
    const walletTransaction = {
      date: new Date(),
      type: 'Debit',
      amount: userData.wallet,
  };
    userData.wallet = 0;
        await userData.save();

       
        
        await User.updateOne(
            { _id: userId },
            { $push: { walletTransaction: walletTransaction } }
        );
  


  }
  const orderId = req.body.order.receipt

  orderHelper.verifyPayment(req.body).then(() => {
    orderHelper
      .changePaymentStatus(res.locals.user._id, req.body.order.receipt,req.body.payment.razorpay_payment_id)
      .then(() => {
        res.json({ status: true });
      })
      .catch((err) => {
        res.json({ status: false });
      });
  }).catch(async(err)=>{
    
    console.log(err);

  });
}

const paymentFailed = async(req,res)=>{
  try {
    const order = req.body
    const deleted = await Order.updateOne(
      { "orders._id": new ObjectId(order.order.receipt) },
      { $pull: { orders: { _id:new ObjectId(order.order.receipt) } } }

    )
    res.send({status:true})
  } catch (error) {
    
  }
  
}

const downloadInvoice = async (req, res) => {
  try {
    const id = req.query.id
    userId = res.locals.user._id;

    result = await orderHelper.findOrder(id, userId);
    const date = result[0].createdAt.toLocaleDateString();
    const product = result[0].productDetails;

    const order = {
      id: id,
      orderNumber:result[0].orderNumber,
      total:parseInt( result[0].totalPrice),
      date: date,
      payment: result[0].paymentMethod,
      name: result[0].shippingAddress.item.name,
      street: result[0].shippingAddress.item.address,
      locality: result[0].shippingAddress.item.locality,
      city: result[0].shippingAddress.item.city,
      state: result[0].shippingAddress.item.state,
      pincode: result[0].shippingAddress.item.pincode,
      product: result[0].productDetails,
    };

    const products = order.product.map((product) => ({
      "quantity":parseInt( product.quantity),
      "description": product.productName,
      "tax-rate":0,
      "price": parseInt(product.productPrice),
    }));

  
    var data = {
      customize: {},
      images: {
        // logo: "https://public.easyinvoice.cloud/img/logo_en_original.png",

        background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
      },


      sender: {
        company: "Stride Spot",
        address: "Brototype",
        zip: "686633",
        city: "Maradu",
        country: "India",
      },

      client: {
        company: order.name,
        address: order.street,
        zip: order.pincode,
        city: order.city,
        // state:" <%=order.state%>",
        country: "India",
      },
      information: {
        number: order.orderNumber,
       

        

        date: order.date,
        // Invoice due date
        "due-date": "Nil",
      },
      

      products: products,
      // The message you would like to display on the bottom of your invoice
      "bottom-notice": "Thank you,Keep shopping.",
    };
    (data.information.number);
    (order);

    easyinvoice.createInvoice(data, async function (result) {
      //The response will contain a base64 encoded PDF file
      await fs.writeFileSync("invoice.pdf", result.pdf, "base64");


       // Set the response headers for downloading the file
       res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
       res.setHeader('Content-Type', 'application/pdf');
 
       // Create a readable stream from the PDF base64 string
       const pdfStream = new Readable();
       pdfStream.push(Buffer.from(result.pdf, 'base64'));
       pdfStream.push(null);
 
       // Pipe the stream to the response
       pdfStream.pipe(res);

      
    });
  } catch (error) {
    console.log(error.message);
  }
};


module.exports={
    checkOut,
    changePrimary,
    postCheckOut,
    orderList,
    orderDetails,
    cancelOrder,
    applyCoupon,
    verifyCoupon,
    verifyPayment,
    paymentFailed,
    downloadInvoice,
    walletStatus
}