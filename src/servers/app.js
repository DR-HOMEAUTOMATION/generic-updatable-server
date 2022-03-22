/** 
 * @description Example of a http server that can forcefully update the application by emitting a `update` event
 */

const config = require('../../config')

const GitInstaller = require('../install')

const test = new GitInstaller({
    startup_file:'C:\\Users\\dawso\\workspace\\homeAuto\\generic-updatable-server\\src\\startup.txt',
    application_save_path:'C:\\temp',
    default_startup_program:'start.bat'
})

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

app.get('/install',(req,res)=>{
    console.log('installing repository:')
    const {body} = req
    try{
        test.installRepo(body.config.gitUrl,body.config.branch,body.config.options)
            .then((data)=>res.json(data))
            .catch(error=>res.json(error))
    }catch(e){
        res.json(e)    
    }
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