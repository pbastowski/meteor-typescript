var typescript = Npm.require('typescript');
var fs = Npm.require('fs');

var jade = Npm.require('jade');
var jadeOpts = { compileDebug:false };

var COMPILER_OPTIONS = {
    //module:                     1, // 1=commonjs typescript.ModuleKind.System,
    module:                     typescript.ModuleKind.CommonJS,
    target:                     typescript.ScriptTarget.ES5,
    emitDecoratorMetadata:      true,
    experimentalAsyncFunctions: true,
    sourceMap:                  true,
    sourceMap:                  true,
    // moduleResolution:           'node',
    // inlineSourceMap:            true,
    // inlineSources:              true
};

var extensions = ['ts'];

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
    //console.log('TypeScript plugin: Client modules will be transpiled to', mdl, ' module format.');
}
if (customConfig.extensions)
    extensions = customConfig.extensions;

var processFiles = function (files) {
    console.log('\nTypeScript compiling files:');
    files.forEach(processFile);
};

var fileContentsCache = {  };

function processFile(file) {
    var inputFile = file.getPathInPackage();

    // Don't compile ".d.ts" file
    if (/\.d\.ts$/.test(inputFile)) return;

    // Don't compile ".ts" files in node_modules
    if (!customConfig.compileNodeModules && /node_modules\/.*\.ts$/.test(inputFile)) return;

    // This is the contents of the file
    var contents = file.getContentsAsString();

    // Convert templateUrl: 'xxxx' to template: require('xxxx').default
    if (customConfig.replaceTemplateUrlWithTemplate) {
        if (/templateUrl:\s*?(['"][^\s]+?['"])/.test(contents)) {
            contents = contents.replace(/templateUrl:\s*?(['"][^\s]+?['"])/g, 'template: require($1).default');
        }
    }

    // process embedded jade first
    contents = processEmbeddedJade(contents);
    // console.log('TEMPLATE: ', inputFile, '\n', contents);

    // Get file previous and current file contents hashes
    var lastHash = fileContentsCache[inputFile] && fileContentsCache[inputFile].hash;
    var currentHash = file.getSourceHash();

    var moduleName = inputFile.replace(/\\/g, '/').replace('.ts', '');
    // var outputFile = inputFile.replace('.ts', '.js');
    var outputFile = Plugin.convertToStandardPath(file.getPathInPackage());

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
            // The transpile method has rhe following interface:
            //     transpile(input: string, compilerOptions?: ts.CompilerOptions, fileName?: string, diagnostics?: ts.Diagnostic[]): string
            // var output = typescript.transpile(contents, options, inputFile);

            // transpileModule(input: string, transpileOptions: TranspileOptions): TranspileOutput
            // export interface TranspileOutput {
            //     outputText: string;
            //     diagnostics?: Diagnostic[];
            //     sourceMapText?: string;
            // }
            var tsOutput = typescript.transpileModule(
                contents,
                {
                    compilerOptions: options,
                    fileName: inputFile
                }
            );
            tsOutput.outputText = tsOutput.outputText.replace(/\/\/# sourceMappingURL=.*/,'');
            var output = tsOutput.outputText;
            var sourceMap = tsOutput.sourceMapText;

            // Correct the file paths returned by transpileModule()
            // and add the source code to it.
            sourceMap = JSON.parse(sourceMap);
            sourceMap.sourcesContent = [ contents ];
            sourceMap.file = '/' + inputFile;
            sourceMap.sources = [sourceMap.file];
            delete sourceMap.sourceRoot;
            sourceMap = JSON.stringify(sourceMap, null, 4);

            //console.log('OUTPUT: ', tsOutput);

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

        if (file._resourceSlot.packageSourceBatch.unibuild.arch !== 'os')
            output = esModuleFix(output);

        console.log('  ' + inputFile, '(', typescript.ModuleKind[options.module], ')'); //, file._resourceSlot.packageSourceBatch.unibuild.arch);

        // Update the code cache
        fileContentsCache[inputFile] = {hash: currentHash, code: output, map: sourceMap};

    } else {
        // Pull the code from the cache
        output = fileContentsCache[inputFile].code;
        sourceMap = fileContentsCache[inputFile].map;
    }

    //if (inputFile == 'server/main.ts') console.log(output);

    file.addJavaScript({
        data: output,
        path: outputFile,
        sourceMap: JSON.parse(sourceMap)
    });

    function esModuleFix(output) {
        // We are going to enable "synthetic" default imports, which
        // TypeScript does not support by default, but Babel does.
        // Things like `import angular from 'angular'` will now work
        // the same as they do with Babel.
        if (output.indexOf('Object.defineProperty(exports, "__esModule"') === -1) {
            output = output
                // + '\nmodule.exports = exports.default;'
                + '\nObject.defineProperty(exports, "__esModule", { value: true });\n'
        }

        if (output.indexOf('require(')!==-1) {
            output = 'var oldRequire = require;\n'
                + 'require = function() { var m = oldRequire.apply(this, Array.prototype.slice.call(arguments)); if (m && !m.__esModule) m = { default: m }; return m };\n'
                + output
        }

        return output;
    }
}

Plugin.registerCompiler({
    extensions: extensions,
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
    // var fs = Plugin.fs;

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

function processEmbeddedJade(str) {
    var found;

    // Look for ES6 strings preceded with the word jade or JADE
    // and compile the string contents with the JADE compiler.
    while (found = str.match(/jade`([\s\S]*?)`/i)) {
        try {
            // Extract the jade
            var content = found[1] + '\n';
            var output  = '';

            // console.log('CONTENT:', content);

            // Run it through the JADE compiler
            output = jade.compile(content, jadeOpts)();
            str = str.replace(/jade`([\s\S]*?)`/i, '`' + output + '`');

        } catch (er) {
            return er;
            throw new TypeError(er);
        }
    }

    return str;
}
