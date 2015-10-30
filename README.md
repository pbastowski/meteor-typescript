## Typescript compiler for Meteor 1.2, includes SystemJS

This package implements TypeScript 1.6.2 and SystemJS 0.19.5. 
It will only work with Meteor 1.2.

It caches the generated code between builds to speed up your workflow. 
When you first start (or restart) Meteor, all files will be compiled by TypeScript.
After that, only changed files will be recompiled as you make changes and save them.

### Install

```bash
meteor add pbastowski:typescript
```

### Usage

In the body section your `index.html` file you need to import the JS file that kicks off your application.

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
code in `index.ts` file will be executed in the order it is listed in the file. 

So, in the below example, first `client/app/app` will be imported and executed 
followed by `client/feature1/feature1`.

```javascript
import "client/app/app";
import 'client/feature1/feature1';
```

### Modules

The TypeScript compiler can output different types of module wrappers, including 
CommonJS and SystemJS. On the backend commonjs modules are created and on the 
front-end we use SystemJS modules.

As a convention, do not mix front-end and back-end code in the same module, even
if you wrap each code section with `Meteor.isClient` or `Meteor.isServer`. Instead,
put files destined for the client side in the `client` folder of your app, and those 
destined for the server side in the `server` folder.
