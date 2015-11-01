## Typescript compiler for Meteor 1.2

This package implements TypeScript 1.6.2. It will only work with Meteor 1.2.

The TypeScript Meteor plugin caches the generated code between builds to speed up 
your workflow. When you first start (or restart) Meteor, all files will be compiled 
by TypeScript. After that, only changed files will be recompiled, as you make 
changes and save them.

### Install

    meteor add pbastowski:typescript

#### Need SystemJS?

SystemJS is not included with this package. You can add it like this 
 
    meteor add pbastowski:systemjs

### Usage

There are two ways to use this package: the new way with SystemJS and the old way without it. 

#### With SystemJS

First, a short introduction. The TypeScript compiler can output different types of module wrappers, 
including CommonJS, SystemJS, UMD and AMD. By default, this plugin creates CommonJS modules 
on the server and SystemJS modules on the client. SystemJS wrapped modules register themselves
with the SystemJS loader when they are executed. The actual JS code in the module, your code, 
does not run until you `import` it somewhere else in your code in another module.

So, here is what you need to do. In the body section your `index.html` file you need to import 
the JS file that kicks off your application. For our example, that file is `client/index.ts`.

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

Below is a sample `client/index.ts` file. Remember that the innermost imports, 
those inside `app` and `feature1`, will be executed first. Then, the rest of the 
code in `index.ts` will be executed in the order it is listed in the file. 

So, in the below example, first `client/app/app` will be imported and executed 
followed by `client/feature1/feature1`.

```javascript
import 'client/app/app';
import 'client/feature1/feature1';
```

#### The old way... without SystemJS

What I really mean by "the old way" is that you can use this package, in most cases, 
as a direct replacement for Babel/ecmascript in your existing Meteor apps.  

So, if you want a different module system on the client side, like when you're not using 
SystemJS, for example, then you can specify it in a **tsconfig.json** file located 
in the root directory of your app. The contents of this file must be as shown below.
The only option read from this file is the `module` setting. Everything else is 
ignored currently. 

```json
{
  "compilerOptions": {
    "module": "none"
  }
}
```

Valid **module** names are: `none`, `commonjs`, `amd`, `umd` and `system`.

### Don't mix client and server code in the same file!

As a convention, do not mix front-end and back-end code in the same module, even
if you wrap each code section with `Meteor.isClient` or `Meteor.isServer`. Instead,
put files destined for the client side in the `client` folder of your app, and those 
destined for the server side in the `server` folder.
