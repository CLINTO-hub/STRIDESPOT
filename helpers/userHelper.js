const bcrypt = require('bcrypt')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
require('dotenv').config();// Module to Load environment variables from .env file

const maxAge = 3*24*60*60;
const createToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET_KEY,{
        expiresIn: maxAge
    })
}

const verifyLogin = (data)=>{
    return new Promise((resolve,reject)=>{
        User.findOne({email:data.email}) 
         .then((userData)=>{
            if (userData){
              bcrypt.compare(data.password,userData.password)
              .then((passwordMatch)=>{
                if(passwordMatch){
                    if(userData.is_blocked){
                        resolve({error:"your account is blocked"})
                    }else{
                        const token = createToken(userData._id)
                        resolve({token})
                    }
                    
                }else{
                    resolve({ error: "Email and Password are Incorrect" });
                }
            })
            .catch((error)=>{
                reject(error);
            })
        }
            else{
                resolve({ error: "Email and Password are Incorrect" });
            }
        })
        .catch((error)=>{
            reject(error);
        })
     
    })
}
module.exports={
    verifyLogin
}

