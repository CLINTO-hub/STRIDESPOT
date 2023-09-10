const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://clintogeorge007:pv9ohQA6dnvkIczS@cluster0.zh3fhfm.mongodb.net/')

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