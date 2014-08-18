/*
 * grunt-contrib-depends
 * https://github.com/samuelneff/grunt-concat-depends
 *
 * Copyright (c) 2014 Samuel Neff
 * based on grunt-contrib-concat Copyright (c) 2014 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/**/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    banner_property: 'AWESOME',
    "concat-depends": {
      default_options: {
        files: {
          'tmp/default_options': ['test/fixtures/file1', 'test/fixtures/file2']
        }
      },
      custom_options: {
        options: {
          separator: '\n;\n',
          banner: '/* THIS TEST IS <%= banner_property %> */\n',
          footer: 'dude'
        },
        files: {
          'tmp/custom_options': ['test/fixtures/file1', 'test/fixtures/file2']
        }
      },
      handling_invalid_files: {
        src: ['test/fixtures/file1', 'invalid_file/should_warn/but_not_fail', 'test/fixtures/file2'],
        dest: 'tmp/handling_invalid_files',
        nonull: true
      },
      process_function: {
        options: {
          process: function(src, filepath) {
            return '// Source: ' + filepath + '\n' +
              src.replace(/file(\d)/, 'f$1');
          }
        },
        files: {
          'tmp/process_function': ['test/fixtures/file1', 'test/fixtures/file2']
        }
      },
      dir: {
        files: {
          // no pattern, just directory given, should not error
          'tmp/process_dir_path': ['test/fixtures']
        }
      },
      overwrite_one: {
        files: {
          'tmp/overwrite': ['test/fixtures/file1', 'test/fixtures/file2']
        }
      },
      overwrite_two: {
        files: {
          'tmp/overwrite': ['test/fixtures/banner2.js']
        }
      },
      depends_3_4_5: {
        files: {
          'tmp/depends_3_4_5': ['test/fixtures/depends_3_4_5/file3', 'test/fixtures/depends_3_4_5/file4', 'test/fixtures/depends_3_4_5/file5']
        }
      },
      depends_4_5_3: {
        files: {
          'tmp/depends_4_5_3': ['test/fixtures/depends_4_5_3/file3', 'test/fixtures/depends_4_5_3/file4', 'test/fixtures/depends_4_5_3/file5']
        }
      },
      depends_5_4_3: {
        files: {
          'tmp/depends_5_4_3': ['test/fixtures/depends_5_4_3/file3', 'test/fixtures/depends_5_4_3/file4', 'test/fixtures/depends_5_4_3/file5']
        }
      },
      glob_3_4_5: {
        files: {
          'tmp/glob_3_4_5': ['test/fixtures/glob_3_4_5/*']
        }
      },
      nested_3_4_5: {
        files: {
          'tmp/nested_3_4_5': ['test/fixtures/nested_3_4_5/**/*']
        }
      },
      depends_glob_3_4_5: {
        files: {
          'tmp/depends_3_4_5': ['test/fixtures/depends_3_4_5/*']
        }
      },
      depends_glob_4_5_3: {
        files: {
          'tmp/depends_4_5_3': ['test/fixtures/depends_4_5_3/*']
        }
      },
      depends_glob_5_4_3: {
        files: {
          'tmp/depends_5_4_3': ['test/fixtures/depends_5_4_3/*']
        }
      },
      circular: {
        files: {
          'tmp/circular': ['test/fixtures/circular/*']
        }
      },
      string_4_5_3: {
        files: {
          'tmp/string_4_5_3': ['test/fixtures/string_4_5_3/file3', 'test/fixtures/string_4_5_3/file4', 'test/fixtures/string_4_5_3/file5']
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-internal');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'concat-depends', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test', 'build-contrib']);

};
