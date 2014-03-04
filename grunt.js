module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        qunit: {
            files: ['tests/unit/unittests_nupic-js.html']
        }
    });

    // Task to run tests
    grunt.registerTask('test', 'qunit');
};