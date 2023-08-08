const Address = require("../models/AddressModel")
const User = require("../models/userModel")
const profiletHelper = require("../helpers/profileHelper")





const checkOutAddress = async (req, res) => {
    try {
      const userId = res.locals.user._id;
      const name = req.body.name;
      const mobileNumber = req.body.mno;
      const address = req.body.address;
      const locality = req.body.locality;
      const city = req.body.city;
      const pincode = req.body.pincode;
      const state = req.body.state;
  
      const newAddress = {
        name: name,
        mobileNumber: mobileNumber,
        address: address,
        locality: locality,
        city: city,
        pincode: pincode,
        state: state,
      };
  
      const updatedUser = await profiletHelper.updateAddress(userId, newAddress);
      if (!updatedUser) {
        await profiletHelper.createAddress(userId, newAddress);
      }
  
  
      res.redirect("/checkOut"); 
    } catch (error) {
      console.log(error.message);
    }
  };

  const profile = async (req, res) => {
    try {
      let arr = []
      const user = res.locals.user;
      res.render("profileDetails", { user, arr });
    } catch (error) {
      console.log(error.message);
    }
  };

  const profileAdress = async (req, res) => {
    try {
      let arr = []
      const user = res.locals.user;
      const address = await Address.find({user:user._id.toString()});
      if(address){
        const ad = address.forEach((x) => {
          return (arr = x.addresses);
        });
        res.render("profileAdress", { user, arr });
      }
      
    } catch (error) {
      console.log(error.message);
    }
  };


  const submitAddress = async (req, res) => {
    try {
      const userId = res.locals.user._id;
      const name = req.body.name;
      const mobileNumber = req.body.mno;
      const address = req.body.address;
      const locality = req.body.locality;
      const city = req.body.city;
      const pincode = req.body.pincode;
      const state = req.body.state;
  
      // Create a new address object
      const newAddress = {
        name: name,
        mobileNumber: mobileNumber,
        address: address,
        locality: locality,
        city: city,
        pincode: pincode,
        state: state,
      };
  
      const updatedUser = await profiletHelper.updateAddress(userId, newAddress);
      if (!updatedUser) {
        // No matching document found, create a new one
        await profiletHelper.createAddress(userId, newAddress);
      }
  
      res.json({ message: "Address saved successfully!" });
  
      res.redirect("/profile"); // Redirect to the profile page after saving the address
    } catch (error) {
      console.log(error.message);
    }
  };
   

  module.exports={
    checkOutAddress,
    profileAdress,
    submitAddress,
    profile
  }