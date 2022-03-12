const os = require( 'os' );
const networkInterfaces = os.networkInterfaces();
const arr = networkInterfaces.wlan0
const myIp = arr.find(ip=>ip.family==="IPv4").address


const packageJson = require('./package.json')
const config = {
    auto_git_updater_config:{
        repository: packageJson.repository.url ,
        formReleases:false,
        branch:'raspi-audio-server',
        backup_path:'/home/pi/backups/SHAS',
        start_script_cmd:`sh start.sh`,
        exitOnComplete:true
    },
    server_config:{
        routes:[
            {
                path:"/",
                description:"Displays all acceptable routes for this server."
            },
            {
                path:"/exit",
                description:"Closes the server. Does not restart."
            },
            {
                path:"/update",
                description:"Updates and restarts the server."
            },
            {
                streams:{
                    audio_stream:{
                        port:3000,
                        description:"Streams audio to the socket, sends a `startFile` & `endFile` in the write stream when the mic starts or stops hearing audio."
                    }
                }
            }
        ],
        ports:{
           app: {
                port:5000,
                type:"http",
                content:"main"
            },
           stream: {
                port:3000,
                host:myIp,
                type:"socket",
                content:"Listen to the microphone attached to the server"
            }
        }
    }
}

module.exports = config