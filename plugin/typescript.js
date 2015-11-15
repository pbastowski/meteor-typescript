var typescript = Npm.require('typescript');

var COMPILER_OPTIONS = {
    module:                     typescript.ModuleKind.System,
    target:                     typescript.ScriptTarget.ES5,
    emitDecoratorMetadata:      true,
    experimentalAsyncFunctions: true
};

// Add lowercase versions of module kinds to typescript.ModuleKind
// so that we can look up their ids later.
Object.keys(typescript.ModuleKind).forEach(function(i) {
    typescript.ModuleKind[i.toLowerCase()] = typescript.ModuleKind[i];
});

// Merge in any optional custom compiler-options specified in
// the tsconfig.json file located in the app root directory.
// tsconfig.json is completely optional.
var customConfig = getCustomConfig();
if (customConfig.compilerOptions && customConfig.compilerOptions.module) {
    var mdl = typescript.ModuleKind[customConfig.compilerOptions.module.toLowerCase()];
    if (mdl === 'undefined') mdl = 'System';
    COMPILER_OPTIONS.module = mdl;
    console.log('client modules: ', mdl);
}

var processFiles = function (files) {
    console.log('\nTypeScript compiling files:');
    files.forEach(processFile);
};

var fileContentsCache = {  };

function processFile(file) {
    var inputFile = file.getPathInPackage();

    // Don't compile ".d.ts" file
    if (/\.d\.ts$/.test(inputFile)) return;

    // This is the contents of the file
    var contents = file.getContentsAsString();

    // Get file previous and current file contents hashes
    var lastHash = fileContentsCache[inputFile] && fileContentsCache[inputFile].hash;
    var currentHash = file.getSourceHash();

    var moduleName = inputFile.replace(/\\/g, '/').replace('.ts', '');
    var outputFile = inputFile.replace('.ts', '.js');

    // Only compile files that have changed since the last run
    if (!lastHash || lastHash !== currentHash ) {
        var options = merge({}, COMPILER_OPTIONS);

        // On the server do not create modules. Just transpile the code as is.
        if (file._resourceSlot.packageSourceBatch.unibuild.arch === 'os') {
            options.module = typescript.ModuleKind.CommonJS;
        } else {
            options.module = COMPILER_OPTIONS.module;
        }

        // Compile code
        try {
            var output = typescript.transpile(contents, options);
        } catch (e) {
            console.log(e);
            return file.error({
                message:    'TypeScript compilation error',
                line:       e.loc.line,
                column:     e.loc.column
            });
        }

        // Add a module name to it, so we can use SystemJS to import it by name.
        output = output.replace("System.register([", 'System.register("' + moduleName + '",[');

        console.log('  ' + inputFile, '(', typescript.ModuleKind[options.module], ')'); //, file._resourceSlot.packageSourceBatch.unibuild.arch);

        // Update the code cache
        fileContentsCache[inputFile] = {hash: currentHash, code: output};

    } else {
        // Pull the code from the cache
        output = fileContentsCache[inputFile].code;
    }

    file.addJavaScript({
        data: output,
        path: outputFile
    });
}

Plugin.registerCompiler({
    extensions: ['ts'],
    filenames:  []

}, function () {
    return {
        processFilesForTarget: processFiles,
        //setDiskCacheDirectory: function (cacheDir) {
        //    Babel.setCacheDir(cacheDir);
        //}
    };
});

function getCustomConfig() {
    var path = Plugin.path;
    var fs = Plugin.fs;

    var appdir = process.env.PWD || process.cwd();
    var custom_config_filename = path.join(appdir, 'tsconfig.json');
    var userConfig = {};

    if (fs.existsSync(custom_config_filename)) {
        userConfig = fs.readFileSync(custom_config_filename, {encoding: 'utf8'});
        userConfig = JSON.parse(userConfig);
    }
    return userConfig;
}

function merge (destination, source) {
    for (var property in source)
        destination[property] = source[property];
    return destination;
}
