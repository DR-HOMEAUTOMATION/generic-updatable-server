/** 
* @description Example of a http server that can forcefully update the application by emitting a `update` event
*/

const config = require('../../config')

const express = require('express'); 
const app = express(); 
//const app = {}
const server = app.listen(config.server_config.ports.app.port,()=>{
    console.log(`listening on http://localhost:${config.server_config.ports.app.port}`)
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

app.get('/log',(req,res)=>{
    res.json('Testing Global log functionality')
    server.emit('log','Testing Global log functionality')
})
/** 
* exports an object containing the server and an array containing open all sockets
*/
module.exports = {server,sockets:[]}
