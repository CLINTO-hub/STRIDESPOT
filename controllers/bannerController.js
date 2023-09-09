const bannerHelper = require('../helpers/bannerHelper')
const Banner = require('../models/bannerModel')


const bannerList = async(req,res)=>{

    try{
        bannerHelper.bannerListHelper().then((response)=> {
            res.render('bannerList',{banners:response})

        })
        
    }
    catch(error){
        console.log(error);
    }
}

const addBannerGet = async(req,res)=>{
    try {
        res.render('addBanner')
        
    } catch (error) {
        console.log(error.message);
    }
}

const addBannerPost = async(req,res)=>{
    bannerHelper.addBannerHelper(req.body,req.file.filename).then((response)=>{
        if(response){
            res.redirect('/admin/bannerList')
        }
    })
}

const deleteBanner = async(req,res)=>{
    bannerHelper.deleteBannerHelper(req.query.id).then(() => {
        res.redirect("/admin/bannerList")
    });
}

const unListBanner = async(req,res)=>{
    try {
      await bannerHelper.unListBanner(req.query.id)
  
        res.redirect('/admin/bannerList')
        
    } catch (error) {
        console.log(error.message);
    }
  }

  const reListBanner = async(req,res)=>{
    try {

        await bannerHelper.reListBanner(req.query.id)
        res.redirect('/admin/bannerList')
    } catch (error) {
        console.log(error.message);
    }
  }



module.exports={
    bannerList,
    addBannerGet,
    addBannerPost,
    deleteBanner,
    unListBanner,
    reListBanner
    
}