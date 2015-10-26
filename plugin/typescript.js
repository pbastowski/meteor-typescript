var typescript = Npm.require('typescript');

var COMPILER_OPTIONS = {
    module:                     typescript.ModuleKind.System,
    target:                     typescript.ScriptTarget.ES5,
    emitDecoratorMetadata:      true,
    experimentalAsyncFunctions: true
};

var processFiles = function (files) {
    //console.log('\nTypeScript compiling files:');
    files.forEach(processFile);
};

var fileContentsCache = {  };

function processFile(file) {
    var inputFile = file.getPathInPackage();
    if (/\.d\.ts$/.test(inputFile)) return;
    
    var contents = file.getContentsAsString();
    
    // Get file previous and current file contents hashes
    var lastHash = fileContentsCache[inputFile] && fileContentsCache[inputFile].hash;
    var currentHash = file.getSourceHash();

    var moduleName = inputFile.replace(/\\/g, '/').replace('.ts', '');
    var outputFile = inputFile.replace('.ts', '.js');
    
    // Only compile files that have changed since the last run
    if (!lastHash || lastHash !== currentHash ) {
        
        // Compile code
        var output = typescript.transpile(contents, COMPILER_OPTIONS);
        
        // Add a module name to it, so we can use SystemJS to import it by name.
        output = output.replace("System.register([", 'System.register("' + moduleName + '",[');

        //console.log('  ' + inputFile);
    
        // Update the code cache
        fileContentsCache[inputFile] = {hash: currentHash, code: output};
        
    } else {
        // Pull the code from the cache
        output = fileContentsCache[inputFile].code ;
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