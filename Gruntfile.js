module.exports = function(grunt) {
  // Paths
  var srcRoot = 'src/main/webapp/',
      webRoot = 'target/modminus/',
      srcPath = {
        css: srcRoot + 'css/',
        js: srcRoot + 'js/',
        modules: srcRoot + 'modules/',
        prototype: srcRoot + 'prototype/',
        styleguide: srcRoot + 'styleguide/',
        test: srcRoot + 'test/'
      },
      webPath = { // static files to process, in "target" directory
        css: webRoot + 'css/',
        js: webRoot + 'js/',
        modules: webRoot + 'modules/',
        prototype: webRoot + 'prototype/',
        styleguide: webRoot + 'styleguide',
        test: webRoot + 'test/'
      },
      targetPath = webRoot + 'assets/'; // final (live) output

  // brand specific styles
  var getBrandStyleFiles = function(brandName) {
    return [
      webPath.css + 'vendor/normalize.less',
      webPath.css + 'vendor/h5bp-top.less',
      webPath.css + 'vendor/lesshat-prefixed.less',
      webPath.css + 'vars.less',
      webPath.css + 'brands/' + brandName + '.less',
      webPath.css + 'mixins.less',
      webPath.css + 'webfonts/icons.less',
      webPath.css + 'general.less',
      webPath.css + 'elements.less',
      webPath.modules + '**/css/*.less',
      webPath.css + 'vendor/h5bp-bottom.less'
    ];
  };

  var brandConfig = {
    getOptions: function(brandName) {
      return {
        sourceMap: true,
        sourceMapFilename: targetPath + 'styles.' + brandName + '.min.css.map',
        sourceMapURL: 'styles.' + brandName + '.min.css.map',
        sourceMapRootpath: '/',
        sourceMapBasepath: webRoot
      };
    },
    getSrc: function(brandName) {
      return webPath.css + 'styles.' + brandName + '.less';
    },
    getDest: function(brandName) {
      return targetPath + 'styles.' + brandName + '.min.css';
    },
    getTargetConfig: function(brandName) {
      return {
        options: this.getOptions(brandName),
        src: this.getSrc(brandName),
        dest: this.getDest(brandName)
      };
    }
  };

  // time tracking...
  require('time-grunt')(grunt);

  // Configuration for tasks
  grunt.initConfig({

    less_imports: {
      options: {
        inlineCSS: false
      },
      blue: {
        src: getBrandStyleFiles('blue'),
        dest: webPath.css + 'styles.blue.less' // styles.{brandName}.less
      },
      green: {
        src: getBrandStyleFiles('green'),
        dest: webPath.css + 'styles.green.less'
      }
      // more brands...
    },

    less: {
      options: {
        paths: webPath.css,
        strictMath: true,
        strictUnits: true,
        compress: true // vs. cssmin?
      },
      dev_blue: brandConfig.getTargetConfig('blue'),
      dev_green: brandConfig.getTargetConfig('green'),

      prod_blue: {
        src: brandConfig.getSrc('blue'),
        dest: brandConfig.getDest('blue')
      },
      prod_green: {
        src: brandConfig.getSrc('green'),
        dest: brandConfig.getDest('green')
      },

      lint: {
        options: {
          compress: false
        },
        src: brandConfig.getSrc('blue'),
        dest: webPath.css + 'styles.blue.css'
      }
    },

    csslint: {
      options: {
        csslintrc: '.csslintrc'
      },
      styles: {
        src: '<%= less.lint.dest %>'
      }
    },

    jshint: {
      options: {
        jshintrc: true,
        force: true
      },
      dev: {
        src: [
          webPath.js + 'mm/*.js',
          webPath.modules + '*/js/*.js'
        ]
      }
    },

    jscs: {
      options: {
        config: '.jscsrc',
        force: true
      },
      dev: {
        src: '<%= jshint.dev.src %>'
      }
    },

    copy: {
      maven: { // copy all files from src to target, remember maven
        expand: true,
        cwd: srcRoot,
        src: ['**', '!js/closure-library/**'],
        dest: webRoot
      },

      module_partials: {
        expand: true,
        cwd: webPath.modules,
        src: '**/fixtures/*.html',
        dest: webPath.prototype + 'partials/',
        flatten: true,
        rename: function(dest, src) {
          return dest + 'mod-' + src;
        }
      },

      module_assets: {
        expand: true,
        cwd: webPath.modules,
        src: '**/assets/**',
        dest: targetPath,
        rename: function(dest, src) {
          return dest + src.substring(src.indexOf('/assets') + 8);
        }
      }
    },

    clean: {
      all: [webRoot], // maven clean
      prod: [
        webPath.css,
        webPath.js,
        webPath.modules,
        webPath.prototype,
        webPath.styleguide,
        webPath.test,
        targetPath + '*.map'
      ]
    },

    connect: {
      localhost: {
        options: {
          hostname: '*',
          port: 9000,
          base: webRoot,
          keepalive: true,
          middleware: require('dummy-img-middleware')
        }
      }
    },

    zetzer: {
      prototype: {
        options: {
          templates: webPath.prototype + 'templates',
          partials: webPath.prototype + 'partials',
          dot_template_settings: {
            strip: false
          }
        },
        files: [
          {
            expand: true,
            cwd: webPath.prototype + 'pages/',
            src: '**/*.html',
            dest: webPath.prototype,
            ext: '.html',
            flatten: true
          }
        ]
      }
    },

    plovr_modules: {
      options: {
        id: 'mm-modules',
        paths: webPath.js + 'mm',
        mode: 'ADVANCED', // RAW|WHITESPACE|SIMPLE|ADVANCED
        level: 'DEFAULT', // QUIET|DEFAULT|VERBOSE
        define: {
          'goog.DEBUG': true
        },

        modules: {
          core: {
            inputs: [
              webPath.js + 'mm/start.js' // entry file
            ],
            deps: [] // core module has no dependency
          }
          // external modules will added dynamically here
        },
        'module-output-path': targetPath + 'mm.%s.min.js',
        'module-production-uri': "/assets/mm.%s.min.js",
        'global-scope-name': '__mm__',

        MODULE_CONFIG: {
          entry: webPath.js + 'mm/start.js', // entry file
          allModuleFiles: webPath.modules + '*/js/**/*.{js,soy}',
          modules: [
            {
              name: 'slideshow',
              files: webPath.modules + 'mod-slideshow/js/*.{js,soy}',
              deps: ['core']
            },
            {
              name: 'video',
              files: webPath.modules + 'mod-video/js/*.{js,soy}',
              deps: ['core']
            }
          ]
        }
      },

      advanced: {}
    },

    sync: {
      all: {
        files: ['<%= copy.maven %>'],
        verbose: true
      },

      module_partials: {
        files: ['<%= copy.module_partials %>'],
        verbose: true
      },

      module_assets: {
        files: ['<%= copy.module_assets %>'],
        verbose: true
      }
    },

    imagemin: {
      assets: {
        files: [{
          expand: true,
          cwd: targetPath,
          src: ['**/*.{gif,png,jpg}'],
          dest: targetPath
        }]
      }
    },

    karma: {
      qunit: {
        configFile: webPath.test + 'karma/karma.conf.js'
      }
    },

    watch: {
      options: {
        spawn: false
      },

      html: {
        files: [
          srcPath.prototype + '**/*.html',
          srcPath.modules + '**/fixtures/*.html'
        ],
        tasks: ['sync:all', 'sync:module_partials', 'zetzer']
      },

      css: {
        files: [
          srcPath.css + '**/*.less',
          srcPath.modules + '**/css/*.less'
        ],
        tasks: ['sync:all', 'css_dev']
      },

      js: {
        files: [
          srcPath.js + 'mm/**/*.js',
          srcPath.modules + '**/js/*.js',
          srcPath.modules + '**/js/*.soy'
        ],
        tasks: ['sync:all', 'js_dev']
      },

      module_assets: {
        files: srcPath.modules + '**/assets/**/*.*',
        tasks: ['sync:all', 'sync:module_assets']
      }
    }
  });

  // npm tasks
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-less-imports');
  grunt.loadNpmTasks('grunt-plovr-modules');
  grunt.loadNpmTasks('grunt-sync');
  grunt.loadNpmTasks('grunt-zetzer');

  grunt.registerTask('css_dev', ['less_imports', 'less:dev_blue', 'less:dev_green', 'less:lint', 'csslint']);
  grunt.registerTask('css_prod', ['less_imports', 'less:prod_blue', 'less:prod_green', 'less:lint', 'csslint']);

  grunt.registerTask('js_dev', ['jshint', 'jscs', 'plovr_modules']);
  grunt.registerTask('js_prod', ['jshint', 'jscs', 'plovr_modules']);

  grunt.registerTask('unit_test', ['sync', 'karma']);

  grunt.registerTask('sg', ['sync', 'css_dev', 'zetzer']); // without building JS...
  grunt.registerTask('default', ['clean:all', 'copy', 'css_dev', 'js_dev', 'zetzer']);
  grunt.registerTask('prod', ['clean:all', 'copy', 'css_prod', 'js_prod', 'imagemin', 'clean:prod']);
};
