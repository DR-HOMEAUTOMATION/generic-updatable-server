const config = require('../config')

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
})

