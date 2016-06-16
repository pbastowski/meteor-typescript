## Typescript compiler for Meteor 1.3

This package implements TypeScript 1.8.9. It will only work with Meteor 1.3, because it depends on the `modules` package.

The TypeScript Meteor plugin caches the generated code between builds to speed up your workflow. When you first start (or restart) Meteor, all files will be compiled by TypeScript. After that, only changed files will be recompiled, as you make changes and save them.

### Install

    meteor add pbastowski:typescript

#### tsconfig.json

For Meteor 1.3 this package allows you to configure just one option in `tsconfig.json`

```json
{
  "extensions": ["js", "ts"]
}
```

By default only files with the ".ts" extension will be transpiled. But, if you want also to transpile ".js" files then add the config above to your tsconfig.json.

## Changelog

### 2016-06-16 v1.3.3

- Updated TypeScript to 1.9.0-dev.20160615-1.0
- Changed Meteor versionsFrom to 1.3

### 2016-06-08 v1.3.2

- Fixed source map support with Meteor 1.3

### 2016-03-20 v1.3.1

- You can now configure this package to transpile ".js" files also, thus entirely removing the need for Babel. Some features, such as async/await, are not supported by typescript 1.8.9, so, if you need those then you will still need Babel.

### 2016-03-20 v1.3.0 for Meteor 1.3-rc.3 or higher

- Bumped version to 1.3.0 to match Meteor versioning
- Added dependency on the `modules` package
- Updated typescript to v1.8.9
- Modules default to `CommonJS`

**Breaking Changes**

- Modules default to "commonjs" instead of "systemjs", because Meteor 1.3 supports them by default and allows us to import modules without the need for SystemJS (it uses webpack to resolve and bundle all imports and exports).
