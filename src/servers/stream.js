/** 
* @description Example of a http server that can forcefully update the application by emitting a `update` event
*/
/** 
* import config file 
*/
const config = require('../../config')

const net = require('net')

/** 
* Array to store the sockets 
*/
const sockets = [] 

/** 
* Instantiate a new `Server` object 
*/
const server = net.createServer((socket)=>{
    console.log('client connected'); 
    socket.write('welcome to the server')
    socket.on('close',()=>{
        console.log('client disconnected')
    })
    /** 
    * @fires server#update 
    */
    socket.on('data',(data)=>{
        if(data.toString().endsWith('update')) server.emit('update_key_word'); 
    })
    socket.on('error',(err)=>{
        console.log(err)
    })
})

/** 
* listen on the specified port 
*/
server.listen(config.server_config.ports.stream.port,()=>{
    console.log(`listening on port: ${config.server_config.ports.stream.port}`)
})
/** 
* exports an object containing the server and an array containing open all sockets
*/
module.exports = {server,sockets}