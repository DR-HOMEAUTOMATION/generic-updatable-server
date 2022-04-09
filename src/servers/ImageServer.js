const config = require('../../config')
const fs = require('fs')
const express = require('express')
const router = express.Router(); 
const { JpegCam }= require('libcamera-js')

const successImageCapture = (res,code) =>{
    res.json({data:fs.readFileSync(`${process.cwd()}/${config.jpeg_cam_config['-o']}`)})
    console.log(code)
}

const failedImageCapture = (res,err) =>{
    console.log(err)
}

try{
    const jpegCam = new JpegCam(config.jpeg_cam_config)
    router.get('/image',(req,res)=>{
        jpegCam.getNewImage((code)=>successImageCapture(res,code))
    })
}catch(err){
    console.log(err)
}

module.exports = router