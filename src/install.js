const fs = require('fs')
const child_process = require('child_process'); 
const axios = require('axios')
const simpleGit = require('simple-git/promise')()
const path = require('path');
/** 
* @typedef {object} GitInstallerConfig
* @property {string} default_startup_program the default startup script for each project EX: start.sh
* @property {string} application_save_path the path to save all of the projects EX: /home/pi/apps
* @property {string} startup_program the startup config for the os (linux)
*/  

class GitInstaller{
    /** 
    * @type {GitInstallerConfig} 
    */
    config={}

    /** 
    * @param {GitInstallerConfig} config 
    */
    constructor(config){
        if(!config)                         throw new Error('Missing all required attributes.')
        if(!config.startup_file)            throw new Error('startup_file is a required attribute') // temporary, if(if null there should be some default behavior for implementing the start script)
        if(!config.application_save_path)   throw new Error('application_save_path is a required attribute')
        if(!config.default_startup_program) throw new Error('default_startup_program is a required attribute')
        try {
            fs.accessSync(config.application_save_path)
        } catch (e) {
            throw new Error('The specified application save path does not exist')
        }
        try {
            fs.accessSync(config.startup_file)
        } catch (e) {
            throw new Error('The specified startup file does not exist')
        }
        this.config = config
    }
    
    /** generates a http requestable github url from the github cli url 
    * @param gitUrl url to make a proper http url
    * @returns {string} requestable github url 
    */
    getRequestableUrl(gitUrl){
        return gitUrl.slice(0,gitUrl.length-4)
    }
    
    
    /** returns a new promise that resolves if the gitUrl passed into the method is a proper github http url
    *  @param {string} gitUrl base git url to clone
    *  @returns {Promise} 
    */
   validateGithubUrl(gitUrl){
       return new Promise((resolve,reject)=>{
           if(/^(?:https?:\/\/)?(?:[^.]+\.)?github\.com(\/.*)?\.git$/.test(gitUrl)){
               resolve(gitUrl.slice(0,gitUrl.length-4))
            }
            if(/git@github\.com:[a-zA-Z-_]+\/[a-zA-Z-_]+\.git/i.test(gitUrl)){
                reject('Cannot use SSH to clone repo. You must use HTTPS')
            }
            reject('This is not a valid https github url.')
        })
    }

    
    /** returns a new promise that resolves if the branch passed into the method is a proper github branch
    *  @param {string} branch specific branch to clone, defaults to `main`
    *  @returns {Promise} 
    */
    validateGithubBranch(branch){
        return new Promise((resolve,reject)=>{
            if(/^(?!.*[~`'";:><\/?|\\\+\=\.!@#$%^&*()]).*/i.test(branch)) {
                resolve(true)
            }else{
                reject('The specified branch is not a valid branch.')
            }
        })
    }

    /** Validates that a github repo and branch exist on github by sending a simple http get request to the specified {gitRepoUrl}, if the github repository exists,
    *   check if the branch exists
    *  @param {string} gitRepoUrl a url that leads to a github repository 
    *  @param {string} branch specified branch to clone: defaults to main
    *  @returns {Promise} 
     */
    validateGithubRepoExists(_gitRepoUrl,branch){
        const gitRepoUrl = this.getRequestableUrl(_gitRepoUrl)
        return new Promise((resolve,reject)=>{
            axios.get(gitRepoUrl)
            .then(()=>axios.get(`${gitRepoUrl}/tree/${branch}`))
            .then(()=>resolve(true))
            .catch(e=>{
                if(e.response.request.path.includes('/tree/')){
                    reject(`The specified branch: ${branch} does not exist. URL: ${gitRepoUrl}/tree/${branch}`)
                }else{
                    reject(`The specified repository: ${gitRepoUrl} does not exist. URL: ${gitRepoUrl}`);
                }
            })
        })
    }

    /** validates that the startup program (if not null) specified exists in the repo in the specified branch  
    *  @param gitUrl url where the project exists
    *  @param branch branch that we are cloning
    *  @param gitUrl options object defining the startup program name 
    *  @returns {Promise}
    */
    ValidateStartupProgramExists(gitUrl, branch, options){
        let default_startup_program = null
        if(options) default_startup_program = options.default_startup_program || this.config.default_startup_program
        default_startup_program = default_startup_program || this.config.default_startup_program

        return new Promise((resolve,reject)=>{
            if(!default_startup_program) resolve('no startup file specified'); 
            // make a git request at the url {https://github.com/username/projectname/blob/branch/startupfilename}
            axios.get(`${this.getRequestableUrl(gitUrl)}/blob/${branch}/${default_startup_program}`)
                .then(()=>resolve(true))
                .catch(e=>reject(`The specified startup file: ${default_startup_program} does not exist in the repository: ${this.getRequestableUrl(gitUrl)}/tree/${branch}`))
        })
    }

     /** Returns the project name from the gitURL 
     *  EX: https://github.com/steveukx/git-js.git 
     *  Project name: git-js 
     * @param {string} gitUrl url to take the project name from 
     * @returns {string} project name
     */
    getProjectName(gitURL){
        // https://github.com/steveukx/git-js.git
        //                            ^      ^
        // split by the last / and the last . that is the project name
        let projectName = gitURL.split('/')
        projectName = projectName[projectName.length-1]
        return projectName.split('.')[0]
    }
    
    getProjectAbsolutePath(gitUrl,branch){
        // return the abs path of the newly cloned repo 
        //EX: repo : https://github.com/steveukx/git-js.git , branch: main
        // output: `${this.config.application_save_path}/${this.getProjectName(gitUrl)_${branch}}`
        return path.join(this.config.application_save_path,`${this.getProjectName(gitUrl)}_${branch}`)
    }
    getStartupFileAbsolutePath(gitUrl,branch,options){
        let startup_file; 
        startup_file = options?.default_startup_program || this.config.default_startup_program
        if(!startup_file) return null
        return path.join(this.getProjectAbsolutePath(gitUrl,branch),startup_file)
    }
    
    /** run the _initializeScript at the specified path, defaults to `npm i`  
    *  @param {string} path 
    */
    instantiateProjectAtPath(path,_initializeScript){
        return new Promise((resolve,reject)=>{
            let initializeScript = _initializeScript || 'npm i'
            try{
                const install = child_process.exec(initializeScript,{cwd:path,detached:true},(error,out,stdErr)=>{
                    if(error) console.log('\x1b[31m',`${error && error}`,'\x1b[0m')
                    if(stdErr) console.log('\x1b[31m',`${stdErr && stdErr}`,'\x1b[0m')
                    console.log('\x1b[32m',`${out}`,'\x1b[0m')  
                })
                resolve(true)
            }catch(e){
                reject(e)
            }
        })
    }

    /** Run the `start script` in the app directory 
    *  @todo if there is a startup program run that other wise run an optional start script from the options object
    *  @todo Use {Stream.fork || Stream.spawn} instead of exec (i believe exec is hogging all of the thread)
    */
    startApplication(path,_startScript){
        let startScript = _startScript||'npm start'
        let outputString = '' // string to resolve/reject with 
        return new Promise((resolve,reject)=>{
            try{
                // take the first part of the command and place it as the command, add the rest as args
                // `npm start`
                const startedApp = child_process.spawn(startScript,{cwd:path,detached:true,shell:true})
                
                startedApp.stdout.on('data',(data)=>{
                    console.log('\x1b[32m',`${data}`,'\x1b[0m')
                    outputString.concat(data); 
                })
                startedApp.stderr.on('data',(data)=>{
                    console.log('\x1b[31m',`${data}`,'\x1b[0m')
                    outputString.concat(data); 
                })
                startedApp.on('error',(data)=>{
                    console.log('\x1b[31m',`${data}`,'\x1b[0m')
                    outputString.concat(data); 
                })
                startedApp.on('close',(code)=>{
                    console.log('\x1b[31m',`${code}`,'\x1b[0m')
                    outputString.concat(`The app closed with exit code: ${code}`)
                    reject(outputString); 
                })
                setTimeout(()=>{
                    resolve(outputString)
                },1000)
                // const startApp = child_process.exec(startScript,{cwd:path,detached:true},(err,out,stdErr)=>{
                //     console.log('\x1b[32m',`${out}`,'\x1b[0m')
                //     if(err) console.log('\x1b[31m',`${err}`,'\x1b[0m')
                //     if(stdErr) console.log('\x1b[31m',`${stdErr}`,'\x1b[0m')
                // })
            }catch(error){
                reject(error)
            }
        })
    }

    /** Clones the specified git repository to [config.application_save_path] with the name of [repository_name-branch] 
     *  @param {string} gitRepoUrl a url that leads to a github repository 
     *  @param {string} branch specified branch to clone: defaults to main
     *  @returns {Promise} 
    */
    cloneRepoToPath(gitUrl,branch){
        return new Promise((resolve,reject)=>{
            simpleGit.clone(gitUrl,path.join(this.config.application_save_path,`${this.getProjectName(gitUrl)}_${branch}`),['-b',branch])
                .then(()=>resolve(true))
                .catch(e=>reject(e))
        })
    }


    /** 
    * @todo Potentially add npm start type of command to the startup script something like: 
    *   'x-terminal-emulator --path="<application_path>" --command="node src/index.js"
    */
    /** add the startup script for the current project to the startup file (linux specific) 
    *  @param {string} startup_file file to append the startup script to 
    *  @param {string} application_startup_script_path the applications startup script (usually a .sh / .bat file) 
    *  @returns {Promise} 
    */
     addStartupScriptToStartupFile(startup_file,application_startup_script_path){
         console.log(startup_file,application_startup_script_path)
        return new Promise((resolve,reject)=>{
            try{
                fs.appendFileSync(startup_file,application_startup_script_path)
                resolve(true)
            }catch(e){
                reject(e)
            }
        })
     }
     
     /** 
     * @todo run cloned repo : child_process exec (startScript || npm start)
     */
    /**     
    * @param {string} gitRepoUrl a url that leads to a github repository 
    * @param {string} branch specified branch to clone: defaults to main
    * @param {object} options options for defining various parts of the repo that you are cloning
    * @returns {Promise}
    */
    installRepo(gitRepoUrl,_branch,options){
        const branch = _branch || 'main'
        console.log('\x1b[32m',`Starting installation process now:\nRepo url: ${gitRepoUrl}\nBranch: ${branch}`,'\x1b[0m')
        const startup_abs_path = this.getStartupFileAbsolutePath(gitRepoUrl,branch,options)
        console.log('\x1b[33m',`${startup_abs_path}`,'\x1b[0m')
        return new Promise(async(resolve,reject)=>{
            this.validateGithubBranch(branch)
                .then(()=>this.validateGithubUrl(gitRepoUrl))
                .then(()=>this.validateGithubRepoExists(gitRepoUrl,branch))
                .then(()=>this.ValidateStartupProgramExists(gitRepoUrl,branch,options))
                .then(()=>{
                    console.log('\x1b[32m',`Repository exists starting installation now!`,'\x1b[0m')
                    return this.cloneRepoToPath(gitRepoUrl,branch)
                })
                .then(()=>{
                    console.log('\x1b[32m',`Repository cloned, installing dependencies now!`,'\x1b[0m')
                    return this.instantiateProjectAtPath(this.getProjectAbsolutePath(gitRepoUrl,branch,options?.initializeScript))
                })
                .then(()=>this.addStartupScriptToStartupFile(this.config.startup_file,startup_abs_path))
                .then(()=>{
                    console.log('\x1b[32m',`Installation complete! Starting application now!`,'\x1b[0m')
                    return this.startApplication(this.getProjectAbsolutePath(gitRepoUrl,branch))
                })
                .then(()=>resolve(`The repository has been cloned with no errors`))
                .catch(e=>reject('The repository was not cloned successfully: '+JSON.stringify(e)))
        })
    }


}

module.exports = GitInstaller