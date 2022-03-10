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
servers.forEach(({server}) => {
    server.on('update',()=>{
        Updater.forceUpdate();
    })
})

