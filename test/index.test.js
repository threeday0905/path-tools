'use strict';

var expect = require('chai').expect,
    sinon  = require('sinon'),
    rewire = require('rewire');

var pathTools = require('../index');

var isWindows = /^win/.test(process.platform),
    normalize = require('path').normalize;

describe('addExtnameIfNotExists()', function() {
    var addExtnameIfNotExists = pathTools.addExtnameIfNotExists;

    it('should add extname if path does contains extname', function() {
        var result = addExtnameIfNotExists('abc', 'css');
        expect(result).to.equal('abc.css');
    });

    it('should not add extname if path contains extname', function() {
        var result = addExtnameIfNotExists('abc.pdf', 'css');
        expect(result).to.equal('abc.pdf');
    });

    it('should not add extname if path endswith "."', function() {
        var result = addExtnameIfNotExists('abc.', 'css');
        expect(result).to.equal('abc.');
    });

    it('default extname pattern is ".js"', function() {
        expect(addExtnameIfNotExists('abc')).to.equal('abc.js');
        expect(addExtnameIfNotExists('abc.css')).to.equal('abc.css');
    });
});

describe('isPathAsJS()', function() {
    var isPathAsJS = pathTools.isPathAsJS;

    it('should return false if path is empty', function() {
        var result = isPathAsJS('');
        expect(result).to.equal(false);
    });

    it('should return false if path not contains extname', function() {
        var result = isPathAsJS('/path/index');
        expect(result).to.equal(false);
    });

    it('should return false if extname is not js', function() {
        var result = isPathAsJS('/path/index.json');
        expect(result).to.equal(false);
    });

    it('should return true if extname is js', function() {
        var result = isPathAsJS('/path/index.js');
        expect(result).to.equal(true);
    });

    it('should return true if extname is js, and path is relative', function() {
        var result = isPathAsJS('./path/index.js');
        expect(result).to.equal(true);
    });
});

describe('isPathAvailable()', function() {
    var isPathAvailable = pathTools.isPathAvailable;

    it('should return false if path is empty', function() {
        var result = isPathAvailable('');
        expect(result).to.equal(false);
    });

    it('should return false if path is unix hidden', function() {
        var result = isPathAvailable('.svn');
        expect(result).to.equal(false);
    });

    it('should return false if path contains unix hidden', function() {
        var case1 = isPathAvailable('/folder/.svn'),
            case2 = isPathAvailable('/folder/.svn/normal');
        expect(case1).to.equal(false);
        expect(case2).to.equal(false);
    });

    it('should return false if windows path contains unix hidden', function() {
        var case1 = isPathAvailable('C:\\folder\\.svn'),
            case2 = isPathAvailable('C:\\folder\\.svn\\normal');
        expect(case1).to.equal(false);
        expect(case2).to.equal(false);
    });

    it('should return true if path is normal', function() {
        var result = isPathAvailable('abcde');
        expect(result).to.equal(true);
    });

    it('should return true if path is unix absolute', function() {
        var result = isPathAvailable('/abcde');
        expect(result).to.equal(true);
    });

    it('should return true if path is windows absolute', function() {
        var result = isPathAvailable('c:\\abcde');
        expect(result).to.equal(true);
    });

    it('should return true if path is relative', function() {
        expect(isPathAvailable('../abcde')).to.equal(true);
        expect(isPathAvailable('./abcde')).to.equal(true);
        expect(isPathAvailable('~/abcde')).to.equal(true);
    });
});

describe('isAbsolute()', function() {
    var isPathAbsolute = pathTools.isPathAbsolute;

    describe('windows platform', function() {
        if (!isWindows) {
            return;
        }

        it('should return true, if path is "//server/file"', function() {
            var result = isPathAbsolute('//server/file');
            expect(result).to.equal(true);
        });

        it('should return true, if path is "\\\\server\\file"', function() {
            var result = isPathAbsolute('\\\\server\\file');
            expect(result).to.equal(true);
        });

        it('should return true, if path is "C:/Users/"', function() {
            var result = isPathAbsolute('C:/Users/');
            expect(result).to.equal(true);
        });

        it('should return true, if path is "C:\\Users\\"', function() {
            var result = isPathAbsolute('C:\\Users\\');
            expect(result).to.equal(true);
        });

        it('should return false, if path is "C:cwd/another"', function() {
            var result = isPathAbsolute('C:cwd/another');
            expect(result).to.equal(false);
        });

        it('should return false, if path is "C:cwd\\another"', function() {
            var result = isPathAbsolute('C:cwd\\another');
            expect(result).to.equal(false);
        });

        it('should return false, if path is "directory/directory"', function() {
            var result = isPathAbsolute('directory/directory');
            expect(result).to.equal(false);
        });

        it('should return false, if path is "directory\\directory"', function() {
            var result = isPathAbsolute('C:cwd\\another');
            expect(result).to.equal(false);
        });
    });

    describe('unix-like platform', function() {
        if (isWindows) {
            return;
        }

        it('should return true, if path is "/home/foo"', function() {
            var result = isPathAbsolute('/home/foo');
            expect(result).to.equal(true);
        });

        it('should return true, if path is "/home/foo/.."', function() {
            var result = isPathAbsolute('/home/foo/..');
            expect(result).to.equal(true);
        });

        it('should return false, if path is "bar/"', function() {
            var result = isPathAbsolute('bar/');
            expect(result).to.equal(false);
        });

        it('return false, if path is "./baz"', function() {
            var result = isPathAbsolute('./baz');
            expect(result).to.equal(false);
        });
    });

    it('can work correctly if no native isAbsolute', function() {
        var rewirePathUtil = rewire('../index');
        var copiedIsAbsolute = rewirePathUtil.__get__('copiedIsAbsolute');

        rewirePathUtil.__set__('isWindows', true);
        expect(copiedIsAbsolute('C:\\Users\\')).to.equal(true);
        expect(copiedIsAbsolute('\\\\server\\file')).to.equal(true);
        expect(copiedIsAbsolute('a\\b')).to.equal(false);
        expect(copiedIsAbsolute('C:cwd\\another')).to.equal(false);

        rewirePathUtil.__set__('isWindows', false);
        expect(copiedIsAbsolute('/home/foo')).to.equal(true);
        expect(copiedIsAbsolute('bar/')).to.equal(false);
    });
});

describe('parsePathToAbsolute()', function() {
    var parsePathToAbsolute = pathTools.parsePathToAbsolute;

    describe('windows platform', function() {
        if (!isWindows) {
            return;
        }

        var cwdPath = 'C:\\home\\midway\\cwd',
            appPath = 'C:\\home\\midway';

        before(function() {
            sinon.stub(process, 'cwd');
            process.cwd.returns(cwdPath); // give a fake cwd path
        });

        after(function() {
            process.cwd.restore();
        });

        /* notice: nodejs v11 will covert device to lower case */
        it('should return path directly if path is absolute', function() {
            var result = parsePathToAbsolute('C:\\home\\app\\index.js', appPath),
                expectPath = normalize('C:\\home\\app\\index.js');

            expect(result).to.equal(expectPath);
        });

        it('should resolve with root path if path is not absolute (1)', function() {
            var result = parsePathToAbsolute('index.js', appPath),
                expectPath = normalize('C:\\home\\midway\\index.js');

            expect(result).to.equal(expectPath);
        });

        it('should resolve with root path if path is not absolute (2)', function() {
            var result = parsePathToAbsolute('./index.js', appPath),
                expectPath = normalize('C:\\home\\midway\\index.js');

            expect(result).to.equal(expectPath);
        });

        it('should resolve with root path if path is not absolute (3)', function() {
            var result = parsePathToAbsolute('./path/index.js', appPath),
                expectPath = normalize('C:\\home\\midway\\path\\index.js');

            expect(result).to.equal(expectPath);
        });

        it('should resolve with cwd path if root path not provided (1)', function() {
            var result = parsePathToAbsolute('index.js'),
                expectPath = normalize('C:\\home\\midway\\cwd\\index.js');

            expect(result).to.equal(expectPath);
        });

        it('should resolve with cwd path if root path not provided (2)', function() {
            var result = parsePathToAbsolute('./index.js'),
                expectPath = normalize('C:\\home\\midway\\cwd\\index.js');

            expect(result).to.equal(expectPath);
        });

        it('should resolve with cwd path if root path not provided (3)', function() {
            var result = parsePathToAbsolute('./path/index.js'),
                expectPath = normalize('C:\\home\\midway\\cwd\\path\\index.js');

            expect(result).to.equal(expectPath);
        });
    });

    describe('unix-lie platform', function() {
        if (isWindows) {
            return;
        }

        var cwdPath = '/home/midway/cwd',
            appPath = '/home/midway';

        before(function() {
            sinon.stub(process, 'cwd');
            process.cwd.returns(cwdPath); // give a fake cwd path
        });

        after(function() {
            process.cwd.restore();
        });

        it('should return path directly if path is absolute', function() {
            var result = parsePathToAbsolute('/home/app/index.js', appPath);
            expect(result).to.equal('/home/app/index.js');
        });

        it('should resolve with root path if path is not absolute (1)', function() {
            var result = parsePathToAbsolute('index.js', appPath);
            expect(result).to.equal('/home/midway/index.js');
        });

        it('should resolve with root path if path is not absolute (2)', function() {
            var result = parsePathToAbsolute('./index.js', appPath);
            expect(result).to.equal('/home/midway/index.js');
        });

        it('should resolve with root path if path is not absolute (3)', function() {
            var result = parsePathToAbsolute('./path/index.js', appPath);
            expect(result).to.equal('/home/midway/path/index.js');
        });

        it('should resolve with cwd path if root path not provided (1)', function() {
            var result = parsePathToAbsolute('index.js');
            expect(result).to.equal('/home/midway/cwd/index.js');
        });

        it('should resolve with cwd path if root path not provided (2)', function() {
            var result = parsePathToAbsolute('./index.js');
            expect(result).to.equal('/home/midway/cwd/index.js');
        });

        it('should resolve with cwd path if root path not provided (3)', function() {
            var result = parsePathToAbsolute('./path/index.js');
            expect(result).to.equal('/home/midway/cwd/path/index.js');
        });
    });
});

describe('parseToFullPath()', function() {
    var parseToFullPath = pathTools.parseToFullPath;

    describe('windows platform', function() {
        if (!isWindows) {
            return;
        }

        var cwdPath = 'C:\\home\\midway\\cwd',
            appPath = 'C:\\home\\midway';

        before(function() {
            sinon.stub(process, 'cwd');
            process.cwd.returns(cwdPath); // give a fake cwd path
        });

        after(function() {
            process.cwd.restore();
        });

        it('should return path directly if path is full', function() {
            var result = parseToFullPath('C:\\home\\app\\index.js', appPath, '.css'),
                expectPath = normalize('C:\\home\\app\\index.js');

            expect(result).to.equal(expectPath);
        });

        it('should add extname if path is absolute but lost extname', function() {
            var result = parseToFullPath('C:\\home\\app\\index', appPath, '.css'),
                expectPath = normalize('C:\\home\\app\\index.css');

            expect(result).to.equal(expectPath);
        });

        it('should parse to absolute if path is not absoulte', function() {
            var result = parseToFullPath('./index.js', appPath, '.css'),
                expectPath = normalize('C:\\home\\midway\\index.js');

            expect(result).to.equal(expectPath);
        });

        it('should parse to absolute and add extname', function() {
            var result = parseToFullPath('./index', appPath, '.css'),
                expectPath = normalize('C:\\home\\midway\\index.css');

            expect(result).to.equal(expectPath);
        });

        it('default extname is .js', function() {
            var result = parseToFullPath('./index', appPath),
                expectPath = normalize('C:\\home\\midway\\index.js');

            expect(result).to.equal(expectPath);
        });

        it('default rootpath is process.cwd()', function() {
            var result = parseToFullPath('./index'),
                expectPath = normalize('C:\\home\\midway\\cwd\\index.js');

            expect(result).to.equal(expectPath);
        });
    });

    describe('unix-like platform', function() {
        if (isWindows) {
            return;
        }

        var cwdPath = '/home/midway/cwd',
            appPath = '/home/midway';

        before(function() {
            sinon.stub(process, 'cwd');
            process.cwd.returns(cwdPath); // give a fake cwd path
        });

        after(function() {
            process.cwd.restore();
        });

        it('should return path directly if path is full', function() {
            var result = parseToFullPath('/home/app/index.js', appPath, '.css');
            expect(result).to.equal('/home/app/index.js');
        });

        it('should add extname if path is absolute but lost extname', function() {
            var result = parseToFullPath('/home/app/index', appPath, '.css');
            expect(result).to.equal('/home/app/index.css');
        });

        it('should parse to absolute if path is not absoulte', function() {
            var result = parseToFullPath('./index.js', appPath, '.css');
            expect(result).to.equal('/home/midway/index.js');
        });

        it('should parse to absolute and add extname', function() {
            var result = parseToFullPath('./index', appPath, '.css');
            expect(result).to.equal('/home/midway/index.css');
        });

        it('default extname is .js', function() {
            var result = parseToFullPath('./index', appPath);
            expect(result).to.equal('/home/midway/index.js');
        });

        it('default rootpath is process.cwd()', function() {
            var result = parseToFullPath('./index');
            expect(result).to.equal('/home/midway/cwd/index.js');
        });
    });
});

describe('isChildFile()', function() {
    /* jshint -W024, -W030 */
    var isChildFile = pathTools.isChildFile;

    it('will throw error if lost parent file or child file', function() {
        expect(function() {
            isChildFile();
        }).to.throws();

        expect(function() {
            isChildFile('abc', undefined);
        }).to.throws();

        expect(function() {
            isChildFile(undefined, 'abc');
        }).to.throws();
    });

    describe('windows platform', function() {
        if (!isWindows) {
            return;
        }

        it('will return true if it is child file', function() {
            var result = isChildFile(
                'C:\\home\\app\\index.js', 'C:\\home\\app\\folder\\index.js');
            expect(result).to.be.true;
        });

        it('will return false if it is not child file', function() {
            var result = isChildFile('C:\\home\\app\\index.js', 'C:\\home\\index.js');
            expect(result).to.be.false;
        });

        it('will do normalize before compare (1)', function() {
            var result = isChildFile(
                'C:\\home\\app\\index.js', 'C:\\home\\app\\folder\\index.js');
            expect(result).to.be.true;
        });

        it('will do normalize before compare (1)', function() {
            var result = isChildFile(
                'C:\\home/app/index.js', 'C:\\home\\app\\folder\\index.js');
            expect(result).to.be.true;
        });
    });

    describe('unix-like platform', function() {
        if (isWindows) {
            return;
        }

        it('will return true if it is child file', function() {
            var result = isChildFile(
                '/home/app/index.js', '/home/app/folder/index.js');
            expect(result).to.be.true;
        });

        it('will return false if it is not child file', function() {
            var result = isChildFile('/home/app/index.js', '/home/index.js');
            expect(result).to.be.false;
        });

        it('will do the normalize if in  windows case', function() {
            var pathToolsRewire = rewire('../index');

            pathToolsRewire.__set__('isWindows', true);
            sinon.spy(pathToolsRewire, 'normalize');

            pathToolsRewire.isChildFile(
                'C:\\home/app/index.js', 'c:\\home\\app\\folder\\index.js');

            expect(pathToolsRewire.normalize.calledTwice).to.be.true;
            pathToolsRewire.normalize.restore();
        });
    });
});

describe('pathTools reference check', function() {
    it('should contains common path utils', function() {
        [ 'join', 'extname', 'resolve', 'dirname', 'basename', 'isAbsolute' ].forEach(
            function(key) {
                expect(pathTools[key]).is.a('function');
            }
        );
    });
});
