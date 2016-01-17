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
  var topsort = require('topsort');
  var chalk = require('chalk');
  var path = require('path');

  function filterFilesOnly(filepath) {
    // Warn on and remove invalid source files (if nonull was set).
    if (!grunt.file.exists(filepath)) {
      grunt.log.warn('Source file "' + filepath + '" not found.');
      return false;
    } else if (grunt.file.isDir(filepath)) {
      return false;
    } else {
      return true;
    }
  }

  function getDependencies(src)
  {
    var dependencies = [];
    var dependsRegex = new RegExp('(?:^|\\r?\\n)(?:\\/\\/\\/\\s*<|\')depends?\\s+(?:path\\s*=\\s*[\'"])?([^\'"]+)[\'"]', 'g');
    var dependsMatch;

    while ( (dependsMatch = dependsRegex.exec(src)) != null)
    {
      dependencies.push(dependsMatch[1]);
    }

    return dependencies;
  }

  function getFileContentsAndDependenciesHash(filePaths)
  {
    var allFiles = {};

    filePaths.forEach(function(filepath) {
      var filename = path.basename(filepath);
      var src = grunt.file.read(filepath);

      //var duplicateName = allFiles[filename];
      //if (duplicateName) {
      //  if (duplicateName.filepath === filepath) {
      //    // something really weird happened, same file processed twice
      //    return;
      //  }
      //  duplicateName.src += '\n' + src;
      //  duplicateName.dependencies = duplicateName.dependencies.concat(getDependencies(src));
      //  return;
      //}

      allFiles[filename] =
      {
        filepath: filepath,
        filename: filename,
        src: src,
        dependencies: getDependencies(src)
      };
    });

    return allFiles;
  }

  function getFileDependencyEdges(files)
  {
    var edges = [];

    Object.keys(files).forEach(function(filename) {

      // make sure everything is included even if it has no dependencies and nothing depends on it
      edges.push([filename]);

      // now loop through dependencies and specify that they must come first
      files[filename].dependencies.forEach(
        function(dependencyName) {
        edges.push([dependencyName, filename]);
      });
    });

    return edges;
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

    // maintain a cache of files so if we push a file to end due to dependencies, we don't have to re-read it from disk
    var srcCache = {};

    // Iterate over all src-dest file pairs.
    this.files.forEach(function(f) {

      // filter file list to only valid files.
      var filePaths = f.src.filter(filterFilesOnly);
      var filesHash = getFileContentsAndDependenciesHash(filePaths);
      var edges = getFileDependencyEdges(filesHash);
      var sortedFileNames;
      var fileContents = [];

      try
      {
        sortedFileNames = topsort(edges);
      }
      catch(e)
      {
        grunt.log.warn("Unable to resolve dependencies: " + e.toString());
        // if force, then we're continuing regardless of dependency order
        sortedFileNames = topsort(edges, {continueOnCircularDependency: true});
      }

      if (Array.isArray(options.priority)) {
        var priority = {};
        options.priority.forEach(function(filename) {
          priority[filename] = true;
        });

        var priorityNames = sortedFileNames.filter(function(filename) { return priority[filename]; });
        sortedFileNames = priorityNames.concat(sortedFileNames.filter(function(filename) { return !priority[filename]; }));
      }

      sortedFileNames.forEach(function(filename) {

        var fileHash = filesHash[filename];
        var src = fileHash.src;

        // Process files as templates if requested.
        if (typeof options.process === 'function') {
          src = options.process(src, fileHash.filepath);
        } else if (options.process) {
          src = grunt.template.process(src, options.process);
        }
        // Strip banners if requested.
        if (options.stripBanners) {
          src = comment.stripBanner(src, options.stripBanners);
        }

        console.log('pushing ' + filename);
        fileContents.push(src);

      });

      // Concat banner + specified files + footer.
      var fullSource = banner + fileContents.join(options.separator) + footer;

      // Write the destination file.
      grunt.file.write(f.dest, fullSource);

      // Print a success message.
      grunt.log.writeln('File ' + chalk.cyan(f.dest) + ' created.');
    });
  });

};

