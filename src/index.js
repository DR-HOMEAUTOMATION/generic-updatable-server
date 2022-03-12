const config = require('../config')

// Servers array expects objects in this format {net.Server,net.Socket[]}
const servers = [] 
servers.push(require('./servers/app'))
servers.push(require('./servers/stream'))

/** 
* import AutoUpdater 
*/
const AutoUpdater = require('./update')
const Updater = new AutoUpdater(servers,config.auto_git_updater_config)

/** If any server emits an `update` event, the system attempts to update
 */
servers.forEach((s) => {
    s.server.on('update',()=>{
        console.log('update in progress')
        Updater.forceUpdate();
    })

    s.server.on('exit',()=>{
        console.log('closing server')
        Updater.forceShutdown();
    })

    s.server.on('log',(data)=>{
        console.log('\x1b[31m',`Global Log: ${data} \n An error has occurred in server: ${JSON.stringify(s.server,null,4)}`,'\x1b[0m')
    })
})

