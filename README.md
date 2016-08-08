# Typescript compiler for Meteor 1.3

This package implements TypeScript 1.9.x. It will only work with Meteor 1.3, because it depends on the `modules` package.

The TypeScript Meteor plugin caches the generated code between builds to speed up your workflow. When you first start (or restart) Meteor, all files will be compiled by TypeScript. After that, only changed files will be recompiled, as you make changes and save them.

## Install

    meteor add pbastowski:typescript

## tsconfig.json

For Meteor 1.3 this package allows you to configure the following options in `tsconfig.json`

#### Transpiling `.js` files

By design, only files with the ".ts" extension will be transpiled by TypeScript into JavaScript. But, if you want also to also transpile ".js" files then add the config below to your `tsconfig.json`.

```json
{
  "extensions": ["js", "ts"]
}
```

#### Partial `templateUrl` support for Angular 2

HTML files are compiled down to JavaScript files that export the template as text. This means that it is virtually impossible to also use these HTML templates in the Angular 2 `templateUrl` property. To get around this limitation we can let the TypeScript plugin change the following code for us from  

    templateUrl: './myFile.html'
    
to

    template: require('./myFile.html').default

This will simulate templateUrls, but not actually implement them as such. So, this will work for any code that you are compiling, but not for external libraries, which are not compiled with the plugin.

```json
{
    "replaceTemplateUrlWithTemplate": true
}
```

## JADE inline templates

JADE tagged template strings are compiled to HTML first, before passing the code through the TypeScript compiler. I know, the previous sentence probably sounds like gibberish, so, let's have a look at the example below.

> **Notice** the `jade` tag before the template string, below.

**JADE template**
```javascript
@Component({
    selector: 'my-app',
    template: jade`h2 This is my app`       // JADE inline template
})
```

is compiled to the following

**HTML template**
```javascript
@Component({
    selector: 'my-app',
    template: `<h2>This is my app</h2>`    // HTML inline template
})
```

### Is this valid JavaScript?

Yes it is. The ES2016 standard, which TypeScript is a super-set of, supports something called "tagged template literals". The word `jade` is the **tag** for the template string <code>\`h2 This is my app\`</code>. So, this is valid ES2015 code, which should not create linting errors in your IDE or editor.

Read more about [Tagged template literals] (https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals).


## Changelog

### 2016-07-12 v1.3.5

- Updated TypeScript to 2.0.0

### 2016-06-16 v1.3.4

- Added ability to process embedded JADE templates

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
