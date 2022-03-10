const config = {
    "auto_git_updater_config":{
        "repository":"git+https://github.com/DR-HOMEAUTOMATION/generic-updatable-server.git",
        "backup_path":"/home/pi/backups",
        "start_script_path":"start.sh"
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