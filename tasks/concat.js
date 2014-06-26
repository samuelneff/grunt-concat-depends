/*
 * grunt-contrib-concat
 * http://gruntjs.com/
 *
 * Copyright (c) 2014 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Internal lib.
  var comment = require('./lib/comment').init(grunt);
  var chalk = require('chalk');

  grunt.registerMultiTask('concat', 'Concatenate files.', function() {
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

      var fileContents = [];
      var i = 0;

      while(i < filePaths.length)
      {
        var filepath = filePaths[i++];

        if (grunt.file.isDir(filepath)) {
          continue;
        }
        // Read file source.
        var src = grunt.file.read(filepath);
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
