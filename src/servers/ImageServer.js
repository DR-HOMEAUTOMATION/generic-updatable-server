const config = require('../../config')

const express = require('express')
const router = express.Router(); 
const { JpegCam }= require('libcamera-js')

const successImageCapture = (res,code) =>{
    res.sendFile(`${process.cwd()}/${config.jpeg_cam_config['-o']}`)
    console.log(code)
}

const failedImageCapture = (res,err) =>{
    res.json('An error has occurred while taking a new Image')
    console.log(err)
}

try{
    const jpegCam = new JpegCam(config.jpeg_cam_config)
    router.get('/image',(req,res)=>{
        jpegCam.getNewImage((code)=>successImageCapture(res,code),(err)=>failedImageCapture(res,err))
    })
}catch(err){
    console.log(err)
}

module.exports = router