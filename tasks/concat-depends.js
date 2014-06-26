/*
 * grunt-contrib-depends
 * https://github.com/samuelneff/grunt-contrib-depends
 *
 * Copyright (c) 2014 Samuel Neff
 *
 * Largely based on grunt-contrib-concat by:
 *
 * Copyright (c) 2014 "Cowboy" Ben Alman, contributors
 *
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Internal lib.
  var comment = require('./lib/comment').init(grunt);
  var chalk = require('chalk');
  var path = require('path');

  function dependenciesProcessed(src, filepath, filePaths, processedFiles, allFiles)
  {
    // check for dependencies
    var dependsRegex = new RegExp('\\/\\/\\/\\s*<depends?\\s+path\\s*=\\s*[\'"]([^\'"]+)[\'"]', 'g');
    var depends;
    while ( (depends = dependsRegex.exec(src)) != null)
    {
      // first capture is the dependency name
      var dependName = depends[1];
      // if we haven't processed it yet, delay processing this file till the end..
      if (!processedFiles[dependName])
      {
        // make sure dependency actually exists in files we're processing
        if (!allFiles[dependName])
        {
          grunt.fail.warn(
              'Missing dependency. \'' +filepath +
              '\' depends on \'' + dependName +
              '\' but the dependency was not included in the concatenation list.',
            grunt.fail.code.TASK_FAILURE);

          // if we're running with force, ignore the dependency error and concat anyways
          return true;
        }
        // we have not yet processed a dependency, move this file to the end..
        filePaths.push(filepath);
        return false;
      }
    }

    return true;
  }

  grunt.registerMultiTask('concat-depends', 'Concatenate files with globbing and dependency order resolution.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      separator: grunt.util.linefeed,
      banner: '',
      footer: '',
      stripBanners: false,
      process: false
    });

    // Normalize boolean options that accept options objects.
    if (options.stripBanners === true) { options.stripBanners = {}; }
    if (options.process === true) { options.process = {}; }

    // Process banner and footer.
    var banner = grunt.template.process(options.banner);
    var footer = grunt.template.process(options.footer);

    // Iterate over all src-dest file pairs.
    this.files.forEach(function(f) {

      // filter file list to only valid files.
      var filePaths = f.src.filter(function(filepath) {
          // Warn on and remove invalid source files (if nonull was set).
          if (!grunt.file.exists(filepath)) {
              grunt.log.warn('Source file "' + filepath + '" not found.');
              return false;
          } else {
              return true;
          }
      });

      var allFiles = {};
      filePaths.forEach(function(filepath) {
        allFiles[path.basename(filepath)] = true;
      });
      var fileContents = [];
      var processedFiles = {};
      var i = 0;
      while(i < filePaths.length)
      {
        var filepath = filePaths[i++];
        var filename = path.basename(filepath);

        if (grunt.file.isDir(filepath)) {
          continue;
        }
        // Read file source.
        var src = grunt.file.read(filepath);

        // ensure dependencies have been processed
        if (!dependenciesProcessed(src, filepath, filePaths, processedFiles, allFiles))
        {
          // if dependencies were not processed, this file was pushed to the end again,
          // so we can continue and will come back to it
          continue;
        }
        // Process files as templates if requested.
        if (typeof options.process === 'function') {
          src = options.process(src, filepath);
        } else if (options.process) {
          src = grunt.template.process(src, options.process);
        }
        // Strip banners if requested.
        if (options.stripBanners) {
          src = comment.stripBanner(src, options.stripBanners);
        }
        processedFiles[filename] = true;
        fileContents.push(src);
      }

      // Concat banner + specified files + footer.
      var fullSource = banner + fileContents.join(options.separator) + footer;

      // Write the destination file.
      grunt.file.write(f.dest, fullSource);

      // Print a success message.
      grunt.log.writeln('File ' + chalk.cyan(f.dest) + ' created.');
    });
  });

};

