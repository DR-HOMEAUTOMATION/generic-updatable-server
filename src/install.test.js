const Installer = require('./install')
const fs = require('fs')
const path = require('path')
const exp = require('constants')


const testPathExists = path.join(__dirname,'/test')
const testStartupFile = path.join(__dirname,'startup.txt')
const testWorkingRepo   = 'https://github.com/DR-HOMEAUTOMATION/generic-updatable-server'
const testWorkingBranch = 'server-manager'
const testFailingBranch = 'random-branch-that-does-not-exist'
const testFailingRepo   = 'https://github.com/DR-HOMEAUTOMATION/generic/'
const testFailingSSHRepoUrl   = 'git@github.com:DR-HOMEAUTOMATION/generic-updatable-server.git'
const testFailingNonGitUrl   = 'https://www.twitch.tv/moky_dokie'
describe('sanity check',()=>{
    test('one plus one equals two ',()=>{
        expect((1+1)).toBe(2)
    })
})

describe('Bad constructor arg throws proper errors',()=>{
    test('Empty install constructor throws error',()=>{
        expect(()=>new Installer()).toThrow(/all required/)
    })
    describe('Install constructor missing required data throws error',()=>{
        test('Install constructor missing startup_file throws error',()=>{
            expect(()=>new Installer({
                application_save_path:'temp',
                default_startup_program:'temp',
            })).toThrow('startup_file is a required attribute')
        })    
        test('Install constructor missing application_save_path throws error',()=>{
            expect(()=>new Installer({
                startup_file:'temp',
                default_startup_program:'temp',
            })).toThrow('application_save_path is a required attribute')
        })    
        test('Install constructor missing default_startup_program throws error',()=>{
            expect(()=>new Installer({
                startup_file:'temp',
                application_save_path:'temp',
            })).toThrow('default_startup_program is a required attribute')
        })    
    })
    describe('Passing faulty data into constructor throws error',()=>{
        describe('Application save path is a valid path and exists',()=>{
            test('If path does not exist throw an error ',()=>{
                try {
                    fs.accessSync(testPathExists)
                    fs.rmdirSync(testPathExists)
                } catch (a) {}
                expect(()=>new Installer({
                    startup_file:testStartupFile,
                    application_save_path:testPathExists,
                    default_startup_program:true
                })).toThrow('The specified application save path does not exist')
            })
            test('If path exists return the class instance',()=>{
                try {
                    fs.accessSync(testPathExists)
                } catch (a) {
                    fs.mkdirSync(testPathExists)
                }
                expect(new Installer({
                    startup_file:testStartupFile,
                    application_save_path:testPathExists,
                    default_startup_program:true
                })).toBeDefined()
            })
        })
        describe('Startup file exists',()=>{
            test('Startup file does not exist then throw an error',()=>{
                try {
                    fs.unlinkSync(testStartupFile)
                } catch (e) {}
                expect(()=>new Installer({
                    startup_file:testStartupFile,
                    application_save_path:testPathExists,
                    default_startup_program:true
                })).toThrow('The specified startup file does not exist')
            })
            test('Startup file exists then return as normal',()=>{
                fs.openSync(testStartupFile,'w')
                expect(new Installer({
                    startup_file:testStartupFile,
                    application_save_path:testPathExists,
                    default_startup_program:true
                })).toBeDefined()
            })
        })
    })
})

describe('method `installRepo` throws proper errors when repo/branch do not exist',()=>{    
    const workingInstallerInstance = new Installer({
        startup_file:testStartupFile,
        application_save_path:testPathExists,
        default_startup_program:true
    })
        test('method works properly when repo and branch exist',()=>{
            workingInstallerInstance.installRepo(testWorkingRepo,testWorkingBranch).then(isValid=>{
                return expect(isValid).toBe(true)
            })
        })
        test('method throws a `repo not found` error when the repo does not exists',()=>{
            return expect(workingInstallerInstance.installRepo(testFailingRepo,testWorkingBranch)).rejects.toBe(`The specified repository: ${testFailingRepo} does not exist`)
        })
        test('method throws a `branch not found` error when the branch does not exists',()=>{
            return expect(workingInstallerInstance.installRepo(testWorkingRepo,testFailingBranch)).rejects.toBe(`The specified branch: ${testFailingBranch} does not exist`)
        })
        
    })


    describe('method `installRepo` throws proper errors when repo/branch are in improper format',()=>{
        const workingInstallerInstance = new Installer({
            startup_file:testStartupFile,
            application_save_path:testPathExists,
            default_startup_program:true
        })
        describe('Invalid repository gets rejected with proper errors',()=>{
            test('SSH git command fails with special error',()=>{
                return expect(()=>workingInstallerInstance.installRepo(testFailingSSHRepoUrl,testWorkingBranch)).rejects.toBe('Cannot use SSH to clone repo. You must use HTTPS')
            })
            test('Other non git urls throw ',()=>{
                return expect(()=>workingInstallerInstance.installRepo(testFailingNonGitUrl,testWorkingBranch)).rejects.toBe('This is not a valid https github url.')
            })
            test('HTTP git command passes',()=>{
                return expect(workingInstallerInstance.installRepo(testWorkingRepo,testWorkingBranch)).resolves.toBeDefined()
            })
        })
        describe('Invalid branch format gets rejected with proper errors',()=>{
            test('Improper branch throws an error',()=>{
                return expect(workingInstallerInstance.installRepo(testWorkingRepo,'n@twork<ng!branch')).rejects.toBe('The specified branch is not a valid branch.')
            })
            test('Proper branch succeeds',()=>{
                return expect(workingInstallerInstance.installRepo(testWorkingRepo,testWorkingBranch)).resolves.toBeDefined()
            })
        })
    })