const config = {
    "auto_git_updater_config":{
        "repository":"https://github.com/DR-HOMEAUTOMATION/generic-updatable-server.git",
        "backup_path":"/home/pi/backups/SHIS",
        "start_script_cmd":"sh start.sh",
        "branch":"raspi-image-server"
    },
    jpeg_cam_config:{
        "--width":1920,
        "--height":1080,
        "-o":"./public/captured_image.jpg",
        "-t":1,
        "--flush":'',
        "-n":'',
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
                "path":"/image",
                "description":"Captures and serves an image from the raspberry pi camera."
            }
        ],
        "ports":{ // image server served on port 5001
           "app": {
                "port":5001,
                "type":"http",
                "content":"main"
            }
        }
    }
}

module.exports = config