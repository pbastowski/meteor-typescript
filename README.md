## Typescript compiler for Meteor 1.3

This package implements TypeScript 1.8.9. It will only work with Meteor 1.3, because it depends on the `modules` package.

The TypeScript Meteor plugin caches the generated code between builds to speed up your workflow. When you first start (or restart) Meteor, all files will be compiled by TypeScript. After that, only changed files will be recompiled, as you make changes and save them.

### Install

    meteor add pbastowski:typescript

#### Need SystemJS?

SystemJS is not included with this package. You can add it like this 
 
    meteor add pbastowski:systemjs

### Usage

There are two ways to use this package: the new way with SystemJS and the old way without it. 

#### With SystemJS

First, a short introduction. The TypeScript compiler can output different types of module wrappers, including CommonJS, SystemJS, UMD and AMD. By default, this plugin creates CommonJS modules on the server and SystemJS modules on the client. SystemJS wrapped modules register themselves with the SystemJS loader when they are executed. The actual JS code in the module, your code, does not run until you `import` it somewhere else in your code in another module.

So, here is what you need to do. In the body section of your `index.html` you need to import the JS file that kicks off your application. For our example, that file is `client/index.ts`.

```html
<head>
    <title>My App</title>
</head>
<body>
    <app>Loading...</app>
    <script>
        System.import('client/index');
    </script>
</body>
```

Below is a sample `client/index.ts` file. Remember that the innermost imports, those inside `app` and `feature1`, will be executed first. Then, the rest of the code in `index.ts` will be executed in the order it is listed in the file. 

In the example below, first `client/app/app` will be imported and executed, followed by `client/feature1/feature1`.

```javascript
import 'client/app/app';
import 'client/feature1/feature1';
```

#### The old way, without SystemJS

What I really mean by "the old way" is that you can use this package, in most cases, as a direct replacement for Babel/ecmascript in your existing Meteor apps.  

So, if you want a different module system on the client side, like when you're not using SystemJS, for example, then you can specify it in **tsconfig.json** located in the root directory of your app. The contents of this file must be as shown below. The only option read from this file is the `module` setting. Everything else is ignored currently. 

```json
{
  "compilerOptions": {
    "module": "none"
  }
}
```

Valid **module** format names are: `none`, `commonjs`, `amd`, `umd` and `system`.

### Don't mix client and server code in the same file!

As a convention, do not mix front-end and back-end code in the same module, even if you wrap each code section with `Meteor.isClient` or `Meteor.isServer`. 

Instead, put files destined for the client side in the `client` folder of your app, and those 
destined for the server side in the `server` folder.

## Changelog

### 2016-03-20 v1.3.0 for Meteor 1.3-rc.3 or higher

- Bumped version to 1.3.0 to match Meteor versioning
- Added dependency on the `modules` package
- Updated typescript to v1.8.9
- Modules default to `CommonJS`

**Breaking Changes**

- Modules default to "commonjs" instead of "systemjs", because Meteor 1.3 supports them by default and allows us to import modules without the need for SystemJS (it uses webpack to resolve and bundle all imports and exports).
