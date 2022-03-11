/** 
 * @description Audio streaming server for a mic connected to a raspberryPi
 */

const mic = require('mic'); 
const net = require('net')
const config = require('../../config')

const audioServer = net.createServer()
let sockets = []

try{ // wrap in a try catch to ensure that you can globally logout the error
const host = config.server_config.ports.stream.host
const port = config.server_config.ports.stream.port

let isStreaming = false; 
let header; 
let dataCount = 0; 

/** 
* Maybe I should initialize the `device` using a script to find an available device 
*/
const micInstance = mic({
	rate:16000,
	channels:'1',
	exitOnSilence:20,
	device:"hw:2,0",
	fileType:'wav'
})
const micInput = micInstance.getAudioStream()


const removeSocket=(clientAddress)=>{
	let index = sockets.find(s=>{
		return s.remoteAddress === clientAddress.split(':')[0]  && s.remotePort === clientAddress.split(':')[1]
	})
	if(index !== -1){
		console.log(`user: ${clientAddress}  disconnected`)
		sockets.splice(index,1);
		if(sockets.length === 0) micInstance.pause();
	}
}

const writeAll = (data) =>{
	sockets.forEach(socket=>{
		socket.write(data); 
	})
}

/** 
* When the silece event is emitted from  the mic, close the file and stop streaming.  
*/
micInput.on('silence',()=>{
    isStreaming = false
    writeAll('endFile')
})

micInput.on('speech',()=>{
	// start piping the mic data
	if(!isStreaming) {
		writeAll('startFile');
		writeAll(header); 
	} 
	isStreaming = true;
	quietFrame = 0; 
})


micInput.on('data',(data)=>{
	if(dataCount === 0){
		dataCount++; 
		console.log('saving header'); 
		header = data;
		micInstance.pause();
	}
	if(isStreaming){
		writeAll(data); 
	}
})

micInput.on('error',(data)=>{
	console.log(data);
    audioServer.emit('log',data)
})

audioServer.listen(port,host,()=>{
	console.log(`server listening at ${host}:${port}`);
})

audioServer.on('close',()=>{
    micInstance.stop(); 
})

audioServer.on('connection',(socket)=>{
    micInstance.resume();
	sockets.push(socket);
	let clientAddress = `${socket.remoteAddress}:${socket.remotePort}`
	console.log(`a new user connected: ${clientAddress}`)
	socket.write('startFile');  
	socket.write(header);

	socket.on('close',(data)=>{
		removeSocket(clientAddress); 
	})
	
	socket.on('error',(err)=>{
        console.log('\x1b[31m',`An error has occurred at : ${socket}`,'\x1b[0m')
    })
	
})
micInstance.start()
}catch(e){ // send logs to external server and exit
    console.log('\x1b[31m',`${e} \n an error has occurred in: stream.js `,'\x1b[0m')
    audioServer.emit('exit')
}
module.exports = {audioServer,sockets}; 