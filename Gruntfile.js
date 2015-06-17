/*eslint-env node*/
'use strict';
var pkg = require('./package.json');
var version = pkg.version;
var forms = pkg.formsversion;
var now = new Date();

var uglifyConfig = {
  files: {}
};

console.log(version, forms);

uglifyConfig.files['dist/' + now.valueOf() + '/bic.min.js'] = ['dist/' + now.valueOf() + '/bic.js'];

module.exports = function (grunt) {
  grunt.initConfig({

    concurrent: {
      background: ['hapi:http', 'watch'],
      options: {
        logConcurrentOutput: true
      }
    },

    hapi: {
      test: {
        options: {
          server: require('path').resolve('tests/support/server.js'),
          bases: {},
          noasync: false
        }
      },
      http: {
        options: {
          server: require('path').resolve('tests/support/server.js'),
          bases: {},
          noasync: true
        }
      }
    },

    watch: {
      src: {
        files: ['src/**/**', 'tests/**/**'],
        tasks: ['build', 'eslint', 'mocha:tests']
      }
    },

    eslint: {
      target: [
          'src/**/*.js',
          'tests/**/*.js'
      ],
      options: {
        configFile: '.eslintrc'
      }
    },

    mocha: {
      tests: {
        options: {
          urls: [
            'http://localhost:9876/tests/index.html'
          ]
        }
      },
      options: {
        bail: true,
        log: true
      }
    },

    requirejs: {
      outside: {
        options: {
          baseUrl: 'src',
          name: 'feature',
          include: ['feature', 'pollUntil', 'BlinkGap'],
          exclude: ['implementations'],
          out: 'build/outside.js',
          optimize: "none",
          paths: {
            feature: '../node_modules/amd-feature/feature',
            implementations: 'empty:', // stop outer build from looking in inner
            pollUntil: '../node_modules/poll-until/poll-until',
            BlinkGap: '../node_modules/blinkgap-utils/BMP.BlinkGap'
          },
          shim: {
            BlinkGap: {
              deps: ['pollUntil'],
              exports: 'BMP.BlinkGap'
            }
          }
        }
      },
      compile: {
        options: {
          baseUrl: 'src',
          name: '../node_modules/almond/almond',
          include: ['main', 'router', 'auth', 'geolocation'],
          out: 'build/bic.js',
          optimize: "none",
          paths: {
            geolocation: '../node_modules/geolocation/geolocation',
            'is-indexeddb-reliable': '../node_modules/is-indexeddb-reliable/dist/index',
            text: '../node_modules/text/text',
            domReady: '../node_modules/domReady/domReady',
            'es5-shim': 'empty:',
            uuid: '../node_modules/node-uuid/uuid',
            authentication: '../node_modules/offlineLogin/authentication',
            sjcl: '../node_modules/sjcl/sjcl'
          },
          wrap: {
            startFile: [
              'src/frag/00-config.js',
              'src/frag/05-implementations.js',
              'build/outside.js',
              'src/frag/10-start.frag'
            ],
            endFile: [
              'src/frag/99-end.frag',
              'src/frag/99-form_extensions.js'
            ]
          }//,
          // wrap: true,
          //insertRequire: ["main"]
        }
      },
      options: {
        uglify: {
          'max_line_length': 80
        },
        uglify2: {
          output: {
            'max_line_len': 80
          },
          warnings: false
        }
      }
    },

    'saucelabs-mocha': {
      all: { options: require('./saucelabs') }
    },

    copy: {
      main: {
        files: [
          {
            src: 'build/bic.js',
            dest: 'dist/' + now.valueOf() + '/bic.js'
          },
          {
            src: 'src/buildFiles/files/*',
            dest: 'dist/' + now.valueOf() + '/',
            filter: 'isFile',
            expand: true,
            flatten: true
          }
        ]
      },
      dev: {
        files: [
          {
            src: 'build/bic.js',
            dest: 'tests/support/bic.js'
          }
        ]
      }
    },

    uglify: {
      bic: uglifyConfig,
      options: {
        sourceMap: true,
        sourceMapIncludeSources: true,
        preserveComments: 'some',
        beautify: {
          'ascii_only': true,
          'max_line_len': 80
        },
        compress: {
          'screw_ie8': false,
          properties: false
        },
        mangle: {
          'screw_ie8': false
        }
      }
    },

    'mustache_render': {
      versions: {
        files: [
          {
            template: 'src/buildFiles/templates/versions.json',
            dest: 'dist/' + now.valueOf() + '/versions.json',
            data: {
              timestamp: now.valueOf(),
              datestamp: now.toISOString(),
              version: version
            }
          },
          {
            template: 'src/buildFiles/templates/appcache.mustache',
            dest: 'dist/' + now.valueOf() + '/appcache.mustache',
            data: {
              forms: forms
            }
          }
        ]
      }
    },

    replace: {
      bicVersion: {
        src: [
          'src/model-application.js'
        ],
        overwrite: true,
        replacements: [
          {
            from: /window\.BMP\.BIC3\.version = '.+?'/,
            to: 'window.BMP.BIC3.version = \'' + version + '\''
          }
        ]
      },
      formsVersion: {
        src: [
          'src/frag/00-config.js'
        ],
        overwrite: true,
        replacements: [
          {
            from: /blink\/forms\/3\/.*\/forms3jqm\.min/,
            to: 'blink/forms/3/' + forms + '/forms3jqm.min'
          }
        ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-saucelabs');
  grunt.loadNpmTasks('grunt-hapi');
  grunt.loadNpmTasks('grunt-mustache-render');
  grunt.loadNpmTasks('grunt-text-replace');

  grunt.registerTask('test', ['build', 'eslint', 'hapi:test', 'mocha']);
  grunt.registerTask('travis', ['test', 'saucelabs-mocha']);

  grunt.registerTask('build', ['replace', 'requirejs', 'copy:main', 'copy:dev', 'uglify', 'mustache_render']);
  grunt.registerTask('develop', ['concurrent']);
  grunt.registerTask('default', ['test']);

};
