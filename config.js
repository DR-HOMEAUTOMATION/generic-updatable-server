
const os = require( 'os' );
const networkInterfaces = os.networkInterfaces();
// const arr = networkInterfaces.wlan0 // for wifi connected devices 
const arr = networkInterfaces.Ethernet // for wired connection
const localIp = arr.find(ip=>ip.family==="IPv4").address

const config = {
    server_manager_config:{
        /** 
        * @todo find startup file path  
        */
        startup_file_path:'',
        application_save_path:'',
        default_startup_program:'start.bat',
        // default_startup_program:'start.sh',
    },
    "auto_git_updater_config":{
        "repository":"https://github.com/DR-HOMEAUTOMATION/generic-updatable-server",
        // "backup_path":"/home/pi/backups/server_manager",
        "backup_path":"C:/backups/test/server_manager",      // remove this
        // "start_script_cmd":"sh start.sh",
        "start_script_cmd":"start start.bat", // remove this
        "branch":"server-manager"
    },
    "server_config":{
        "routes":[
            {
                "path":"/",
                "description":"Displays all acceptable routes for this server."
            },
            {
                "path":"/exit",
                "description":"Closes the server. Does not restart."
            },
            {
                "path":"/update",
                "description":"Updates and restarts the server."
            },
            {
                "path":"/install",
                method:"POST",
                body:{
                    repository_url:{
                        type:String,
                        required:true
                    },
                    repository_branch:{
                        type:String,
                        required:false,
                        default:'main'
                    }
                },
                "description":"Receives a GIT url and branch, clones the repo and adds its start script to the startup programs."
            }
        ],
        "ports":{
            "app": {
                "port":4998,
                "type":"http",
            },
        },
    },
    host:localIp,
}

module.exports = config