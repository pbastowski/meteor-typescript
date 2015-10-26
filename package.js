Package.describe({
    name:          'pbastowski:typescript',
    version:       '0.0.1',
    summary:       'Typescript compiler for Meteor 1.2, includes Systemjs',
    git:           'https://github.com/pbastowski/typescript.git',
    documentation: 'README.md'
});

Npm.depends({
   'systemjs': '0.19.5'
});

Package.onUse(function (api) {
    api.versionsFrom('1.1.0.2');

    api.use('isobuild:compiler-plugin@1.0.0');

    api.addFiles([
        '.npm/package/node_modules/systemjs/dist/system.js',
        '.npm/package/node_modules/systemjs/dist/system-polyfills.js',
    ], ['client'], { transpile: false} );
});

Package.registerBuildPlugin({
  name: 'typescript',
  sources : [
    'plugin/typescript.js'
  ],
  npmDependencies : {
    'typescript' : '1.6.2'
  }
});

