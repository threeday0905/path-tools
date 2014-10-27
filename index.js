'use strict';

var path   = require('path'),
    expect = require('args-expect');

var richPath = Object.create(path);

var isWindows = /^win/.test(process.platform);

/**
 * checks whether a path starts with or contains a hidden file or a folder.
 *
 * @param {whether} filePath - The path of the file that needs to be validated.
 * returns {Boolean} - `false` if the source is blacklisted and otherwise `true`.
 */
richPath.isPathAvailable = function isPathAvailable(filePath) {
    return !!(filePath && !(/(^\.\w|[\\\/]\.)/g).test(filePath));
    //return !!(filePath && !(/(^|.\/)\.+[^\/\.]/g).test(filePath));
};

/**
 * checks whether a path ends with ".js"
 * @param  {String}  filePath - file path
 * @return {Boolean} - `false` is file path not ends with ".js, otherwise `true`
 */
richPath.isPathAsJS = function isPathAsJS(filePath) {
    return !!(filePath && richPath.extname(filePath) === '.js');
};

/* return if path is absolute (polyfill for node v0.10) */
function copiedIsAbsolute(filePath) {
    expect(filePath, 'file path').isString();

    if (isWindows) {
        var splitDeviceRe =
            /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;

        var result = splitDeviceRe.exec(filePath),
            device = result[1] || '',
            isUnc = !!device && device.charAt(1) !== ':';

        // UNC paths are always absolute
        return !!result[2] || isUnc;
    } else {
        return filePath.charAt(0) === '/';
    }
}

/**
*   return if path is absolute
*   @param {string} filePath
*/
richPath.isPathAbsolute = richPath.isAbsolute =
    path.isAbsolute || copiedIsAbsolute;

/**
*   resolve filePath with rootPath, if filePath is not absolute;
*   @param {String} filePath
*   @param {String} rootPath - if not provide, instead of process.cwd()
*   @return {String}
*/
richPath.parsePathToAbsolute = function parsePathToAbsolute(filePath, rootPath) {
    expect(filePath, 'file path').isString().notEmpty();
    rootPath = rootPath || process.cwd();

    /* since nodejs v.11 will normalize device to lower case,
        so even if filePath is absolute, we always call the join to do normalize */
    return richPath.isAbsolute(filePath) ?
        richPath.normalize(filePath) :
        richPath.join(rootPath, filePath);
};

/**
*   add extname to filePath, if filePath does not contains extname
*   @param {string} filePath
*   @param {String} extname  - if not provide, instaed of '.js'
*   @return {String}
*/
richPath.addExtnameIfNotExists = function addExtnameIfNotExists(filePath, extname) {
    expect(filePath).isString().notEmpty();

    extname = extname || '.js';

    return richPath.extname(filePath) ?
        filePath :
        filePath + (extname.charAt(0) === '.' ? '' : '.') + extname;
};

/**
*   parse filePath to absolute path with extname
*   @param {String} filePath
*   @param {String} rootPath - if not provide, instead of process.cwd()
*   @param {String} extname  - if not provide, instead of '.js'
*   @return {String}
*/
richPath.parseToFullPath = function parseToFullPath(filePath, rootPath, extname) {
    var absolutePath = richPath.parsePathToAbsolute(filePath, rootPath),
        fullPath = richPath.addExtnameIfNotExists(absolutePath, extname);

    return fullPath;
};

/**
 * checks whether the child path is under parent path
 * @param  {String}  parentPath
 * @param  {String}  childPath
 * @return {Boolean}
 */
richPath.isChildFile = function isChildFile(parentPath, childPath) {
    expect.all(parentPath, childPath).isString();

    parentPath = richPath.normalize(parentPath);
    childPath = richPath.normalize(childPath);

    return richPath.dirname(childPath).indexOf(richPath.dirname(parentPath)) === 0;
};

module.exports = richPath;
