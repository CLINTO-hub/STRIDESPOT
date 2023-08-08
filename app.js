const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/Stride_Spot')

const express = require('express');
const app = express();
app.use(express.static(__dirname+'/public'));


// User Route

const userRoute = require('./routes/userRoute')
app.use('/',userRoute)

//Admin Route

const adminRoute = require('./routes/adminRoute')

app.use('/admin',adminRoute)







app.listen(3000,()=>{
    console.log("Server Started on http://localhost:3000")
})