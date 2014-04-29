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
    },

    connect: {
      server: {
        options: {
          port: 8181,
          keepalive: true
        }
      }
    }

  });

  // build
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.registerTask('build', 'uglify', 'connect');
  grunt.registerTask('default', 'build');

};
