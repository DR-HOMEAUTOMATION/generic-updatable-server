class Updater {
    /**
     * @typedef   {Object} Server
     * @property  {net.Server}   server - tcp/ipc server
     * @property  {net.Socket[]} sockets - array containing net.socket objects which are connected to the server  
     *  
     * @typedef   {Object} gitConfig
     * @property  {!string} repository - link to the github repo to update from
     * @property  {!string} backup_path - system file path used to backup the current state of the program 
     * @property  {!string} start_script_cmd - command to start the  startup script for the current program  
    */

    /**
     * return a new Updater object 
     * @param {!Server[]} activeServers - List of {@link Server}s to be shutdown prior to updating and restarting
     * @param {gitConfig} gitConfig - {@link gitConfig} used in AutoGitUpdate 
     */
    constructor(activeServers,gitConfig){
        if(!gitConfig) throw new Error('\x1b[31m you must pass in a config object for AutoGitUpdate \x1b[0m')
        if(!gitConfig.repository || !gitConfig.backup_path || !gitConfig.start_script_cmd) throw new Error('The gitConfig must contain (at least) : repo,backup_path,start_script_path')
        this.activeServers = activeServers;
        this.initGitUpdater({...gitConfig,tempLocation:gitConfig.backup_path,executeOnComplete:gitConfig.start_script_cmd}); 
    }

    // dynamically import `auto-git-update` and instantiate using the gitConfig passed into the constructor 
    async initGitUpdater(config){
         this.AutoGitUpdater = new (await import('auto-git-update')).default(config)
    }

    /** 
    * wait for all servers to shutdown then updates the application without checking for new version
    */
    forceUpdate(){
        const shutdownServers = this.activeServers.map((s)=>{
            const {server,sockets} = s;
            return this.shutdownServer(server,sockets)
        })
        Promise.all(shutdownServers) // resolve all closures then update and shutdown 
            .then(()=>{
                console.log('all servers closed!')
                this.AutoGitUpdater.forceUpdate(); 
            })
    }

    /** 
    * @todo tryUpdate? check if there is a new version available, if so res with true, then call forceUpdate 
    */

    /** invokes on all sockets -> socket.destroy(), then closes the server, then resolves the promise 
    * @param {net.Server}   server - server to shutdown
    * @param {net.Socket[]} sockets - sockets connected to `server` that need to be destroyed before the server closes
    */
    shutdownServer(server,sockets){
        return new Promise((resolve,reject)=>{
            console.log('current server: ')
            sockets.forEach(socket=>socket.destroy())
            server.close(()=>{console.log('server closed'); resolve(true)})
        })
    }
}


module.exports = Updater