/** 
 * @description Example of a http server that can forcefully update the application by emitting a `update` event
 */

const config = require('../../config')

const GitInstaller = require('../install')

const gitInstaller = new GitInstaller(config.server_manager_config)

const port = config.server_config.ports.app.port
const host = config.host

const express = require('express'); 
const bodyParser = require('body-parser')
const app = express(); 

app.use(bodyParser())


const server = app.listen(port,host,()=>{
    console.log(`listening on ${host}:${config.server_config.ports.app.port}`)
})

app.get('/',(req,res)=>{
    res.json(config.server_config.routes)
})

app.post('/install',(req,res)=>{
    console.log('installing repository:')
    const {body} = req
    try{
        gitInstaller.installRepo(body.config.gitUrl,body.config.branch,body.config.options)
            .then((data)=>res.json(data))
            .catch(error=>res.json(error))
    }catch(e){
        res.json(e)    
    }
})

app.get('/install',(req,res)=>{
    /** 
    * @todo Return the current running downloaded servers 
    */
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