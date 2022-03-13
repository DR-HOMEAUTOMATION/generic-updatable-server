
const os = require( 'os' );
const networkInterfaces = os.networkInterfaces();
const arr = networkInterfaces.wlan0 // for wifi connected devices 
// const arr = networkInterfaces.Ethernet // for wired connection
const localIp = arr.find(ip=>ip.family==="IPv4").address

const config = {
    host:localIp,
    "auto_git_updater_config":{
        "repository":"https://github.com/USERNAME/PROJECT.git",
        "backup_path":"/home/pi/backups/PROJECT",
        "backup_path_windows_example":"C:/backups/test",      // remove this
        "start_script_cmd":"sh start.sh",
        "start_script_cmd_windows_example":"start start.bat", // remove this
        "branch":"main"
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
            }
        ],
        "ports":{
           "app": {
                "port":5000,
                "type":"http",
                "content":"main"
            },
           "stream": {
                "port":3000,
                "type":"socket",
                "content":"a stream of some sort (maybe audio/video stream)"
            }
        }
    }
}

module.exports = config