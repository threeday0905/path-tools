path-tools
==========
common path toolkits, based on Node.js path module

---
### APIs

##### isPathAvailable (filePath )

return `true` if file path contains unix-hidden folder

Example:
    
    isPathAvailable('/home/app/.git'); //return false
    isPathAvailable('/home/app/.svn/to); //return false
    
##### isPathAsJS (filePath )

return `true` if file is a js file.


##### isPathAbsolute ( filePath )

return `true` if file path is absolute.

##### parsePathToAbsolute ( filePath, rootFolder )

if filePath is not abosoled, resovle with rootFolder, otherwise return.

##### addExtnameIfNotExists (filePath, extname )

if filePath does not contains extname, then add it. otherwise return.

##### parseToFullPath ( filePath, rootPath, extname )

resolve filePath with rootPath, and add extname.

##### isChildFile ( parentPath, childPath )

return `true` if childPath is under the parentPath

Example:

    isChildFile('/home/app/index.js', '/home/app/folder/index.js'); //true
    isChildFile('/home/app/index.js', '/home/index.js'); //false

##### All Native Path APIs

such as: `join()`, `resolve()`, `normalize()`, `extname()`, `basename()`, etc.

    
---
### Questions?

If you have any questions, feel free to create a new issue.
