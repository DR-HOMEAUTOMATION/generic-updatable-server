const config = require('../../config')
const fs = require('fs')
const express = require('express')
const router = express.Router(); 
const {VidCam} = require('../../libcamera/index')

let [getImage,exit] = new VidCam().createSegmentedMJPEGVideoStream({'-o':'test.jpeg','--framerate':10,'-t':50,'-n':''})
router.get('/',(req,res)=>{
    console.log('\x1b[31m',`GETTING IMAGE NOW`,'\x1b[0m')
    getImage(res)
})

router.get('/stop',(req,res)=>{
    exit()
    res.json({message:'stopping the video stream'})
})

router.get('/start',(req,res)=>{
    res.json({message:'starting the video stream'})
    [getImage,exit] = new VidCam().createSegmentedMJPEGVideoStream({'-o':'test.jpeg','--framerate':10,'-t':'0','-n':''})
})


module.exports = router
// const { JpegCam }= require('libcamera-js')

// const successImageCapture = (res,code) =>{
//     res.json({data:fs.readFileSync(`${process.cwd()}/${config.jpeg_cam_config['-o']}`)})
//     console.log(code)
// }

// const failedImageCapture = (res,err) =>{
//     console.log(err)
// }

// try{
//     const jpegCam = new JpegCam(config.jpeg_cam_config)
//     router.get('/image',(req,res)=>{
//         jpegCam.getNewImage((code)=>successImageCapture(res,code))
//     })
// }catch(err){
//     console.log(err)
// }

// module.exports = router