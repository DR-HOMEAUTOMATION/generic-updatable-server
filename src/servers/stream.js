/** 
* @description Example of a http server that can forcefully update the application by emitting a `update` event
*/
/** 
* import config file 
*/
const config = require('../../config')

const port = config.server_config.ports.stream.port
const host = config.host

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
    * @fires server#exit 
    */
    socket.on('data',(data)=>{
        if(data.toString().endsWith('update')) server.emit('update'); 
        if(data.toString().endsWith('exit')) server.emit('exit'); 
    })
    socket.on('error',(err)=>{
        console.log(err)
    })
})

/** 
* listen on the specified port 
*/
server.listen(port,host,()=>{
    console.log(`listening at: ${host}:${port}`)
})
/** 
* exports an object containing the server and an array containing open all sockets
*/
module.exports = {server,sockets}