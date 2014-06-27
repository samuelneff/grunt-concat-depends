'use strict';

var grunt = require('grunt');
var comment = require('../tasks/lib/comment').init(grunt);

function getNormalizedFile(filepath) {
  return grunt.util.normalizelf(grunt.file.read(filepath));
}

exports['concat-depends'] = {
  default_options: function(test) {
    test.expect(1);

    var actual = getNormalizedFile('tmp/default_options');
    var expected = getNormalizedFile('test/expected/default_options');
    test.equal(actual, expected, 'should describe what the default behavior is.');

    test.done();
  },
  custom_options: function(test) {
    test.expect(1);

    var actual = getNormalizedFile('tmp/custom_options');
    var expected = getNormalizedFile('test/expected/custom_options');
    test.equal(actual, expected, 'should utilize custom banner, footer and separator.');

    test.done();
  },
  handling_invalid_files: function(test) {
    test.expect(1);

    var actual = getNormalizedFile('tmp/handling_invalid_files');
    var expected = getNormalizedFile('test/expected/handling_invalid_files');
    test.equal(actual, expected, 'will have warned, but should not fail.');

    test.done();
  },
  strip_banner: function(test) {
    test.expect(10);

    var src = getNormalizedFile('test/fixtures/banner.js');
    test.equal(comment.stripBanner(src), grunt.util.normalizelf('// Comment\n\n/* Comment */\n'), 'It should strip the top banner.');
    test.equal(comment.stripBanner(src, {block: true}), grunt.util.normalizelf('// Comment\n\n/* Comment */\n'), 'It should strip the top banner.');
    test.equal(comment.stripBanner(src, {block: true, line: true}), grunt.util.normalizelf('// Comment\n\n/* Comment */\n'), 'It should strip the top banner.');

    src = getNormalizedFile('test/fixtures/banner2.js');
    test.equal(comment.stripBanner(src), grunt.util.normalizelf('\n/*! SAMPLE\n * BANNER */\n\n// Comment\n\n/* Comment */\n'), 'It should not strip the top banner.');
    test.equal(comment.stripBanner(src, {block: true}), grunt.util.normalizelf('// Comment\n\n/* Comment */\n'), 'It should strip the top banner.');
    test.equal(comment.stripBanner(src, {block: true, line: true}), grunt.util.normalizelf('// Comment\n\n/* Comment */\n'), 'It should strip the top banner.');

    src = getNormalizedFile('test/fixtures/banner3.js');
    test.equal(comment.stripBanner(src), grunt.util.normalizelf('\n// This is\n// A sample\n// Banner\n\n// But this is not\n\n/* And neither\n * is this\n */\n'), 'It should not strip the top banner.');
    test.equal(comment.stripBanner(src, {block: true}), grunt.util.normalizelf('\n// This is\n// A sample\n// Banner\n\n// But this is not\n\n/* And neither\n * is this\n */\n'), 'It should not strip the top banner.');
    test.equal(comment.stripBanner(src, {line: true}), grunt.util.normalizelf('// But this is not\n\n/* And neither\n * is this\n */\n'), 'It should strip the top banner.');
    test.equal(comment.stripBanner(src, {block: true, line: true}), grunt.util.normalizelf('// But this is not\n\n/* And neither\n * is this\n */\n'), 'It should strip the top banner.');
    test.done();
  },
  process_function: function(test) {
    test.expect(1);

    var actual = getNormalizedFile('tmp/process_function');
    var expected = getNormalizedFile('test/expected/process_function');
    test.equal(actual, expected, 'should have processed file content.');

    test.done();
  },
  process_dir_path: function(test) {
    test.expect(1);

    var actual = getNormalizedFile('tmp/process_dir_path');
    var expected = getNormalizedFile('test/expected/process_dir_path');
    test.equal(actual, expected, 'should have nothing.');

    test.done();
  },
  overwrite: function(test) {
    test.expect(1);

    var actual = getNormalizedFile('tmp/overwrite');
    var expected = getNormalizedFile('test/expected/overwrite');
    test.equal(actual, expected, 'should overwrite contents.');

    test.done();
  },
  depends_3_4_5: function(test) {
    test.expect(1);

    var actual = getNormalizedFile('tmp/depends_3_4_5');
    var expected = getNormalizedFile('test/expected/depends_3_4_5');
    test.equal(actual, expected, 'In order dependencies shoudn\'t change order.');

    test.done();
  },
  depends_4_5_3: function(test) {
    test.expect(1);

    var actual = getNormalizedFile('tmp/depends_4_5_3');
    var expected = getNormalizedFile('test/expected/depends_4_5_3');
    test.equal(actual, expected, 'Dependency should push 3 to last');

    test.done();
  },
  depends_5_4_3: function(test) {
    test.expect(1);

    var actual = getNormalizedFile('tmp/depends_5_4_3');
    var expected = getNormalizedFile('test/expected/depends_5_4_3');
    test.equal(actual, expected, 'Dependency push 3 after 5 and then 4 after 3, then 3 after 4 again');

    test.done();
  },
  glob_3_4_5: function(test) {
    test.expect(1);

    var actual = getNormalizedFile('tmp/glob_3_4_5');
    var expected = getNormalizedFile('test/expected/glob_3_4_5');
    test.equal(actual, expected, 'In order from wildcard');

    test.done();
  },
  nested_3_4_5: function(test) {
    test.expect(1);

    var actual = getNormalizedFile('tmp/nested_3_4_5');
    var expected = getNormalizedFile('test/expected/nested_3_4_5');
    test.equal(actual, expected, 'In order from wildcard with nested directories');

    test.done();
  },
  depends_glob_3_4_5: function(test) {
    test.expect(1);

    var actual = getNormalizedFile('tmp/depends_3_4_5');
    var expected = getNormalizedFile('test/expected/depends_3_4_5');
    test.equal(actual, expected, 'In order dependencies shoudn\'t change order.');

    test.done();
  },
  depends_glob_4_5_3: function(test) {
    test.expect(1);

    var actual = getNormalizedFile('tmp/depends_4_5_3');
    var expected = getNormalizedFile('test/expected/depends_4_5_3');
    test.equal(actual, expected, 'Dependency should push 3 to last');

    test.done();
  },
  depends_glob_5_4_3: function(test) {
    test.expect(1);

    var actual = getNormalizedFile('tmp/depends_5_4_3');
    var expected = getNormalizedFile('test/expected/depends_5_4_3');
    test.equal(actual, expected, 'Dependency push 3 after 5 and then 4 after 3, then 3 after 4 again');

    test.done();
  }
};
