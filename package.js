Package.describe({
    name:          'pbastowski:typescript',
    version:       '0.0.5',
    summary:       'Typescript compiler for Meteor 1.2, includes Systemjs',
    git:           'https://github.com/pbastowski/typescript.git',
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.1.0.2');

    api.use('isobuild:compiler-plugin@1.0.0');
    api.use('pbastowski:systemjs@0.0.1');

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

