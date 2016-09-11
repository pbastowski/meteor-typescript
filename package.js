Package.describe({
    name:          'xpbastowski:typescript',
    version:       '1.3.11',
    summary:       'Typescript compiler for Meteor 1.3+',
    git:           'https://github.com/pbastowski/meteor-typescript',
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('METEOR@1.3');

    api.use('isobuild:compiler-plugin@1.0.0');
    api.imply('modules');
});

Package.registerBuildPlugin({
    name:            'typescript',
    sources:         [
        'plugin/typescript.js'
    ],
    npmDependencies: {
        'typescript': '2.1.0-dev.20160911',
        'jade':       '1.11.0'
    }
});
