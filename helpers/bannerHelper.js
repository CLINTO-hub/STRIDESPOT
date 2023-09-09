const { resolve } = require('path')
const Banner = require('../models/bannerModel')
const mongoose = require('mongoose')
const{ObjectId} = require('mongodb')


const bannerListHelper= async()=>{
    return new Promise(async(resolve,reject)=>{
        await Banner.find().then((response)=>{
            resolve(response)

        })
    })
}

const addBannerHelper= async(texts,Image)=>{
    return new Promise(async(resolve,reject)=>{
        const banner = new Banner({
        title: texts.title,
        link: texts.link,
        image: Image,
    })
    await banner.save().then((response)=>{
        resolve(response)
    })
    })
}


const deleteBannerHelper =async(deleteId)=>{
    try {
        return new Promise(async (resolve, reject) => {
            await Banner.deleteOne({ _id: deleteId }).then(() => {
                resolve();
            });
        });
    } catch (error) {
        console.log(error.message);
    }
}

const unListBanner = (query) => {
    return new Promise((resolve, reject) => {
      const id = query;
      Banner.updateOne({ _id: id }, { isBannerListed: false })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.log(error.message);
          reject(error);
        });
    });
  };
  
  const reListBanner= (query) => {
    return new Promise((resolve, reject) => {
      const id = query;
      Banner.updateOne({ _id: id }, { isBannerListed: true })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          console.log(error.message);
          reject(error);
        });
    });
  };


module.exports={
    bannerListHelper,
    addBannerHelper,
    deleteBannerHelper,
    unListBanner,
    reListBanner
}


