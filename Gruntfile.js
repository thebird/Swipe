/*global module */
module.exports = function( grunt ) {
  
  'use strict';

  grunt.initConfig({
    pkg: '<json:component.json>',
    meta: {
      banner: '/*!\n' +
        ' * <%= pkg.name %> v<%= pkg.version %>\n' +
        ' * swipejs.com\n *\n' +
        ' * Copyright (c) <%= pkg.author %>\n' +
        ' * <%= pkg.license %> License\n */'
    },
    lint: {
      files: [
        'grunt.js',
        'swipe.js'
      ]
    },
    min: {
      dist: {
        src: [
          'swipe.js'
        ],
        dest: 'dist/swipe.min.js'
      }
    },
    // uglify : {
    jshint: {
      options: {
        boss: true,
        browser: true,
        curly: false,
        devel: true,
        eqeqeq: false,
        eqnull: true,
        expr: true,
        evil: true,
        immed: false,
        laxcomma: true,
        newcap: false,
        noarg: true,
        smarttabs: true,
        sub: true,
        undef: true
      },
      globals: {
        // Swipe: true,
      }
    }
  });

  // Build
  grunt.loadNpmTasks('grunt-contrib');
  grunt.registerTask('build', 'min');
  grunt.registerTask('default', 'build');
};