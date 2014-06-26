# grunt-concat-depends v0.5.1 [![Build Status: Linux](https://travis-ci.org/samuelneff/grunt-concat-depends.png?branch=master)](https://travis-ci.org/samuelneff/grunt-concat-depends)

> Concatenate files with dependency order resolution.



## Getting Started
This plugin is a fork of [grunt-contrib-concat](https://github.com/gruntjs/grunt-contrib-concat) and adds a dependency resolution mechanism to reorder files such that dependencies are processed first. Dependencies must be specified in the files themselves--there is no automatic dependency identification.

This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-concat-depends --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-concat-depends');
```




## Concat-Depends task
_Run this task with the `grunt concat-depends` command._

Task targets, files and options may be specified according to the Grunt [Configuring tasks](http://gruntjs.com/configuring-tasks) guide.

### Specifying dependencies

Dependencies must be specified in the files to be concatenated. This is accomplished with the following syntax:

```js
/// <depends path='otherFile.js' />
```

A file with this line in it, anywhere in the file, will always be concatenated after `otherFile.js`.  Note that multiple dependencies are supported.

```js
/// <depends path='otherFile.js' />
/// <depends path='anotherFile.js' />
```

Note that only dependency order is guaranteed. As dependencies are processed, the order of non-dependent files is not guaranteed. For example, given three files `file1`, `file2`, and `file3`, and specifying that `file1` has a dependency on `file2`, then when concatenated `file2` will definitely come before `file1`, but `file3` may come anywhere in the list as it is not dependent on any other file and no other file is dependent on it.

Dependency resolution is always based on file name only. Paths specified should be only the file name, not the full or relative path.

If a dependency is not in the set of files to be included, then the task will fail. If `force` option was specified when running grunt, the task will continue to concatenate all of the files but the order is not guaranteed.

If a circular dependency is define then the task will fail. If `force` option was specified when running grunt, the task will continue to concatenate all of the files but the order is not guaranteed.

### Options

#### separator
Type: `String`
Default: `grunt.util.linefeed`

Concatenated files will be joined on this string. If you're post-processing concatenated JavaScript files with a minifier, you may need to use a semicolon `';'` as the separator.

#### banner
Type: `String`
Default: empty string

This string will be prepended to the beginning of the concatenated output. It is processed using [grunt.template.process][], using the default options.

_(Default processing options are explained in the [grunt.template.process][] documentation)_

#### footer
Type: `String`
Default: empty string

This string will be appended to the end of the concatenated output. It is processed using [grunt.template.process][], using the default options.

_(Default processing options are explained in the [grunt.template.process][] documentation)_

#### stripBanners
Type: `Boolean` `Object`
Default: `false`

Strip JavaScript banner comments from source files.

* `false` - No comments are stripped.
* `true` - `/* ... */` block comments are stripped, but _NOT_ `/*! ... */` comments.
* `options` object:
  * By default, behaves as if `true` were specified.
  * `block` - If true, _all_ block comments are stripped.
  * `line` - If true, any contiguous _leading_ `//` line comments are stripped.

#### process
Type: `Boolean` `Object` `Function`
Default: `false`

Process source files before concatenating, either as [templates][] or with a custom function.

* `false` - No processing will occur.
* `true` - Process source files using [grunt.template.process][] defaults.
* `data` object - Process source files using [grunt.template.process][], using the specified options.
* `function(src, filepath)` - Process source files using the given function, called once for each file. The returned value will be used as source code.

_(Default processing options are explained in the [grunt.template.process][] documentation)_

  [templates]: https://github.com/gruntjs/grunt-docs/blob/master/grunt.template.md
  [grunt.template.process]: https://github.com/gruntjs/grunt-docs/blob/master/grunt.template.md#grunttemplateprocess

### Usage Examples

#### Concatenating with a custom separator

In this example, running `grunt concat:dist` (or `grunt concat` because `concat` is a [multi task][multitask]) will concatenate the three specified source files (in order), joining files with `;` and writing the output to `dist/built.js`.

```js
// Project configuration.
grunt.initConfig({
  concat: {
    options: {
      separator: ';',
    },
    dist: {
      src: ['src/intro.js', 'src/project.js', 'src/outro.js'],
      dest: 'dist/built.js',
    },
  },
});
```

#### Banner comments

In this example, running `grunt concat:dist` will first strip any preexisting banner comment from the `src/project.js` file, then concatenate the result with a newly-generated banner comment, writing the output to `dist/built.js`.

This generated banner will be the contents of the `banner` template string interpolated with the config object. In this case, those properties are the values imported from the `package.json` file (which are available via the `pkg` config property) plus today's date.

_Note: you don't have to use an external JSON file. It's also valid to create the `pkg` object inline in the config. That being said, if you already have a JSON file, you might as well reference it._

```js
// Project configuration.
grunt.initConfig({
  pkg: grunt.file.readJSON('package.json'),
  concat: {
    options: {
      stripBanners: true,
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> */',
    },
    dist: {
      src: ['src/project.js'],
      dest: 'dist/built.js',
    },
  },
});
```

#### Multiple targets

In this example, running `grunt concat` will build two separate files. One "basic" version, with the main file essentially just copied to `dist/basic.js`, and another "with_extras" concatenated version written to `dist/with_extras.js`.

While each concat target can be built individually by running `grunt concat:basic` or `grunt concat:extras`, running `grunt concat` will build all concat targets. This is because `concat` is a [multi task][multitask].

```js
// Project configuration.
grunt.initConfig({
  concat: {
    basic: {
      src: ['src/main.js'],
      dest: 'dist/basic.js',
    },
    extras: {
      src: ['src/main.js', 'src/extras.js'],
      dest: 'dist/with_extras.js',
    },
  },
});
```

#### Multiple files per target

Like the previous example, in this example running `grunt concat` will build two separate files. One "basic" version, with the main file essentially just copied to `dist/basic.js`, and another "with_extras" concatenated version written to `dist/with_extras.js`.

This example differs in that both files are built under the same target.

Using the `files` object, you can have list any number of source-destination pairs.

```js
// Project configuration.
grunt.initConfig({
  concat: {
    basic_and_extras: {
      files: {
        'dist/basic.js': ['src/main.js'],
        'dist/with_extras.js': ['src/main.js', 'src/extras.js'],
      },
    },
  },
});
```

#### Dynamic filenames

Filenames can be generated dynamically by using `<%= %>` delimited underscore templates as filenames.

In this example, running `grunt concat:dist` generates a destination file whose name is generated from the `name` and `version` properties of the referenced `package.json` file (via the `pkg` config property).

```js
// Project configuration.
grunt.initConfig({
  pkg: grunt.file.readJSON('package.json'),
  concat: {
    dist: {
      src: ['src/main.js'],
      dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js',
    },
  },
});
```

#### Advanced dynamic filenames

In this more involved example, running `grunt concat` will build two separate files (because `concat` is a [multi task][multitask]). The destination file paths will be expanded dynamically based on the specified templates, recursively if necessary.

For example, if the `package.json` file contained `{"name": "awesome", "version": "1.0.0"}`, the files `dist/awesome/1.0.0/basic.js` and `dist/awesome/1.0.0/with_extras.js` would be generated.

```js
// Project configuration.
grunt.initConfig({
  pkg: grunt.file.readJSON('package.json'),
  dirs: {
    src: 'src/files',
    dest: 'dist/<%= pkg.name %>/<%= pkg.version %>',
  },
  concat: {
    basic: {
      src: ['<%= dirs.src %>/main.js'],
      dest: '<%= dirs.dest %>/basic.js',
    },
    extras: {
      src: ['<%= dirs.src %>/main.js', '<%= dirs.src %>/extras.js'],
      dest: '<%= dirs.dest %>/with_extras.js',
    },
  },
});
```

#### Invalid or Missing Files Warning
If you would like the `concat` task to warn if a given file is missing or invalid be sure to set `nonull` to `true`:

```js
grunt.initConfig({
  concat: {
    missing: {
      src: ['src/invalid_or_missing_file'],
      dest: 'compiled.js',
      nonull: true,
    },
  },
});
```

See [configuring files for a task](http://gruntjs.com/configuring-tasks#files) for how to configure file globbing in Grunt.


#### Custom process function
If you would like to do any custom processing before concatenating, use a custom process function:

```js
grunt.initConfig({
  concat: {
    dist: {
      options: {
        // Replace all 'use strict' statements in the code with a single one at the top
        banner: "'use strict';\n",
        process: function(src, filepath) {
          return '// Source: ' + filepath + '\n' +
            src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
        },
      },
      files: {
        'dist/built.js': ['src/project.js'],
      },
    },
  },
});
```

[multitask]: http://gruntjs.com/creating-tasks#multi-tasks


## Release History

 * 2014-06-26   v0.5.1   Fork and change all references from grunt-contrib-concat to grunt-concat-depends and add support for dependency evaluation

---
