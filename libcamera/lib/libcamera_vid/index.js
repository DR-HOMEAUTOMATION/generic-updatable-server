/** 
* Simple Node.js wrapper for `libcamera-apps` : [libcamera-vid] 
* @module VidCam 
*/

const {spawn}  = require('child_process');
const fs = require('fs')


class VidCam{
    constructor(args){
        if(args){
            Object.keys(args).forEach(key=>this[key]=args[key])
        }
    }

    createSegmentedVideoStream(args,errorCB){
        if(!args['-o']) throw new Error('-o is a required arg')
        args['--segment']=1
        this.vid = spawn('libcamera-vid',Object.entries(args).join(',').split(','))
        this.vid.on('error',errorCB || Function.prototype)
        this.vid.on('data',(data)=>console.log('\x1b[33m',`data: ${data}`,'\x1b[0m'))
        return[
            //  (res) => res.send(fs.readFile(`${process.cwd()}/${args['-o']}`)),
            (res)=>fs.createReadStream(`${process.cwd()}/${args['-o']}`).pipe(res), // [0] = getImg
            (code,onClosed)=>{
                this.vid.on('close',onClosed || Function.prototype)
                this.vid.emit('exit',code || 1)
            }     // [1] = stop recording
        ]
    }

    createSegmentedMJPEGVideoStream(args={},errorCB){
        args['--codec'] = 'mjpeg';
        return this.createSegmentedVideoStream(args,errorCB)
    }
    createSegmentedYUV420VideoStream(args={},errorCB){
        args['--codec'] = 'yuv420';
        return this.createSegmentedVideoStream(args,errorCB)
    }
    createSegmentedH264VideoStream(args={},errorCB){
        args['--codec'] = 'h264';
        return this.createSegmentedVideoStream(args,errorCB)
    }
}

module.exports = VidCam


// class VidCam{
//     /** 
//     * @param {Object} videoConfig
//     * @property {String} dash_o file name 
//     * @property {String} dash_n no preview  
//     * @property {String} dash_t timeout time to wait [default 5000 (5 seconds)]  
//     */
// 	constructor(videoConfig){
// 		this.videoArgs = Object.entries(videoConfig).join(',').split(','); 
// 	}
	
    
    
//     /** 
//     * 
//     * @property {String} dash_dash_segment specify how often to break the video into separate files    
//     * @property {String} dash_dash_inline no preview  
//     * @property {String} dash_dash_circular record onto a circular buffer  
//     * @property {String} dash_dash_codec specify the video codec [default h264]
//      */
    
//     /** 
//      * @callback onCloseCB 
//      * @callback onErrorCB 
//      */
    
//     /** 
//      * @function
//      * @param {NodeJS.WriteableStream} writeStream writable stream that should receive the video stream data... 
//      * @param {onCloseCB} onCloseCb callback function which receives the exit code of the program 
//      * @param {onErrorCB} errCb  callback function which receives the stderr && error emitted 
//      */
//     // create a circular buffer and pipe the output into the writable stream
//     createMpegVideoStream(writeStream,onCloseCb,errCb){
//         /** 
//          * @todo Be more elaborate here: --circular and other options do not cooperate well with this object to arr format. 
//          * @property {String} dash_dash_inline no preview  
//          * @property {String} dash_dash_circular record onto a circular buffer  
//         * @property {String} dash_dash_codec [yuv420]
//         */
//         const libCamVideoStream = spawn('libcamera-vid',this.videoArgs.concat(['--inline','--circular','--codec','mpeg'])) 
//         libCamVideoStream.on('error',(data)=>{
//             errCb(data)
//         })
        
//         libCamVideoStream.stdout.on('data',(data)=>{
//             writeStream.write(data)
//         })
        
//         libCamVideoStream.stderr.on('data',(data)=>{
//             errCb(data)
//         });
        
//         libCamVideoStream.on('close',(code)=>{ 
//             onCloseCb(code)
//         })
//     }
//     // create a circular buffer and pipe the output into the writable stream
//     createYuv420VideoStream(writeStream,onCloseCb,errCb){
//         /** 
//          * @todo Be more elaborate here: --circular and other options do not cooperate well with this object to arr format. 
//          * @property {String} dash_dash_inline no preview  
//          * @property {String} dash_dash_circular record onto a circular buffer  
//          * @property {String} dash_dash_codec [yuv420]
//          */
//        const libCamVideoStream = spawn('libcamera-vid',this.videoArgs.concat(['--inline','--circular','--codec','yuv420'])) 
//        libCamVideoStream.on('error',(data)=>{
//            errCb(data)
//         })
        
//         libCamVideoStream.stdout.on('data',(data)=>{
//             writeStream.write(data)
//         })
        
//         libCamVideoStream.stderr.on('data',(data)=>{
//             errCb(data)
//         });
        
//         libCamVideoStream.on('close',(code)=>{ 
//             onCloseCb(code)
//         })
//     }
//     // create a circular buffer and pipe the output into the writable stream
//     createH264VideoStream(writeStream,onCloseCb,errCb){
//         /** 
//          * @todo Be more elaborate here: --circular and other options do not cooperate well with this object to arr format. 
//          * @property {String} dash_dash_inline no preview  
//          * @property {String} dash_dash_circular record onto a circular buffer  
//          * @property {String} dash_dash_codec [H264]
//          */
//         const libCamVideoStream = spawn('libcamera-vid',this.videoArgs.concat(['--inline','--circular']))
//         libCamVideoStream.on('error',(data)=>{
//             errCb(data)
//         })
        
//         libCamVideoStream.stdout.on('data',(data)=>{
//             writeStream.write(data)
//         })
        
//         libCamVideoStream.stderr.on('data',(data)=>{
//             errCb(data)
//         });
    
//         libCamVideoStream.on('close',(code)=>{ 
//             onCloseCb(code)
//         })
//     }
// }
// /** 
// * @exports VidCam 
// */
module.exports = VidCam