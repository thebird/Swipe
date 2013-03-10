/*global module */
module.exports = function( grunt ) {
  
  'use strict';

  grunt.initConfig({

    uglify: {
      options: {
        mangle: {
          except: ['Swipe']
        }
      },
      dist: {
        files: {
          'build/swipe.min.js': 'swipe.js'
        }
      }
    }

  });

  // build
  grunt.loadNpmTasks('grunt-contrib');
  grunt.registerTask('build', 'uglify');
  grunt.registerTask('default', 'build');

};