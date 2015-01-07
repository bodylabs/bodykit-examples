module.exports = function (grunt) {
    grunt.initConfig({
        jshint: {
          files: ['Gruntfile.js', 'examples/**/*.js', '!examples/**/bundle.js', '!examples/**/main.js'],
          options: {
            globals: {
              jQuery: true
            },
          }
        },
        browserify: {

            options: {
                transform: [
                    require('grunt-react').browserify,
                ],
            },

            dev: {
                options: {
                    browserifyOptions: {
                        debug: true,
                    },
                },
                files: {
                    'examples/javascript/measurements/bundle.js': ['examples/javascript/measurements/index.js', '!examples/**/bundle.js'],
                },
            },

            server: {
                options: {
                    browserifyOptions: {
                        debug: true,
                        standalone: 'main'
                    },
                },
                files: {
                    'examples/javascript/measurements-node/public/main.js': ['examples/javascript/measurements-node/views/main.js'],
                },
            }
        },
        symlink: {
          // Enable overwrite to delete symlinks before recreating them
          options: {
            overwrite: true
          },
          expanded: {
            files: [
              {
                expand: true,
                overwrite: false,
                cwd: 'examples/javascript',
                src: ['**/bundle.js', '**/*.html', 'shared/**/*.css'],
                dest: 'build'
              },
            ]
          },
        },
      });

     grunt.loadNpmTasks('grunt-jsxhint');
     grunt.loadNpmTasks('grunt-browserify');
     grunt.loadNpmTasks('grunt-contrib-symlink');

     grunt.registerTask('build', ['jshint', 'browserify', 'symlink']);
};