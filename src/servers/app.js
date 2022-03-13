/** 
* @description Example of a http server that can forcefully update the application by emitting a `update` event
*/

const config = require('../../config')

const port = config.server_config.ports.app.port
const host = config.host

const express = require('express'); 
const app = express(); 

const server = app.listen(port,host,()=>{
    console.log(`listening on ${host}:${config.server_config.ports.app.port}`)
})

app.get('/',(req,res)=>{
    res.json(config.server_config.routes)
})

/** 
* @fires app#update 
*/
app.get('/update',(req,res)=>{
    res.json("The server is updating")
    server.emit('update')
    server.emit('close')
})


/** 
* @fires app#exit 
*/
app.get('/exit',(req,res)=>{
    res.json('closing server now');
    server.emit('exit')
    server.emit('close')
})
/** 
* exports an object containing the server and an array containing open all sockets
*/
module.exports = {server,sockets:[]}