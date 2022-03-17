const fs = require('fs')
const axios = require('axios')

/** 
* @typedef {object} GitInstallerConfig
* @property {string} startup_file
* @property {string} application_save_path
* @property {string} startup_program
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
        if(!config.startup_file)            throw new Error('startup_file is a required attribute')
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
    
    /** returns a new promise that resolves if the gitUrl passed into the method is a proper github http url
    * @param {string} gitUrl base git url to clone
    */
   validateGithubUrl(gitUrl){
       /** 
       * @todo Implement git SSH clone 
       */
       return new Promise((resolve,reject)=>{
           if(/^(?:https?:\/\/)?(?:[^.]+\.)?github\.com(\/.*)?$/.test(gitUrl)){
               resolve()
            }
            if(/git@github\.com:[a-zA-Z-_]+\/[a-zA-Z-_]+\.git/i.test(gitUrl)){
                reject('Cannot use SSH to clone repo. You must use HTTPS')
            }
            reject('This is not a valid https github url.')
        })
    }
    
    /** returns a new promise that resolves if the branch passed into the method is a proper github branch
    * @param {string} branch specific branch to clone, defaults to `main`
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
     * check if the branch exists
    *  @param {string} gitRepoUrl a url that leads to a github repository 
    *  @param {string} branch specified branch to clone: defaults to main
    */
   validateGithubRepoExists(gitRepoUrl,branch){
        return new Promise((resolve,reject)=>{
            axios.get(gitRepoUrl)
                .then(()=>axios.get(`${gitRepoUrl}/tree/${branch}`))
                .then(()=>resolve(true))
                .catch(e=>{
                    if(e.response.request.path.includes('/tree/')){
                        reject(`The specified branch: ${branch} does not exist`)
                    }else{
                        reject(`The specified repository: ${gitRepoUrl} does not exist`);
                    }
                })
        })
    }
    
    /**     
    * @param {string} gitRepoUrl a url that leads to a github repository 
    * @param {string} branch specified branch to clone: defaults to main
    */
    installRepo(gitUrl,branch){
        /** 
        * @todo  clone {gitRepoUrl/tree/branch} to the config application_save_path
        * run the initialization script default `npm i`
        * add the start script to the startup_program file
        * run the cloned program 
        */
        return new Promise(async(resolve,reject)=>{
            this.validateGithubUrl(gitUrl)
                .then(()=>this.validateGithubBranch(branch))
                .then(()=>this.validateGithubRepoExists(gitUrl,branch))
                .then(()=>{resolve(true)})
                .catch(e=>reject(e))
        })
    }

}

module.exports = GitInstaller