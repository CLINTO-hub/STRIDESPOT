const jwt = require('jsonwebtoken')
const Admin = require('../models/adminModel')

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwtAdmin;
  
    // check json web token exists & is verified
    if (token) {
      jwt.verify(token, 'my-secret', (err, decodedToken) => {
        if (err) {
          console.log(err.message);
          res.redirect('/admin');
        } else {
          next();
        }
      });
    } else {
      res.redirect('/admin');
    }
  };

  module.exports={
    requireAuth
  }