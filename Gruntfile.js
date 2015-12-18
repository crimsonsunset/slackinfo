module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        paths:{
            styles:'app/styles/',
            templates:'app/templates/',
            js:'app/scripts/',
            dist:'dist/',
            assets:'app/images/',
            index:'index.html',
            server:'slackServer/server.js',
            dependencies:'bower_components/'
        },
        //nodemon and watch are blocking, need to run them on diff threads
        concurrent: {
            tasks: [
                'nodemon',
                'watch'
            ],
            options: {
                logConcurrentOutput: true
            }
        },

        concat: {
            dist: {
                src: ['<%= paths.js %>**'],
                dest: '<%= paths.dist %><%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        },
        watch: {
            html: {
                files: ['<%= paths.templates %>*.html'],
                options: {
                    livereload: true
                }
            },
            js: {
                files: ['<%= paths.js %>**/*.js'],
                options: {
                    livereload: true
                }
            },
            sass: {
                files: ['<%= paths.styles %>*.scss'],
                tasks: ['sass:server']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= paths.index %>',
                    '<%= paths.styles %>**.css'
                ]
            }
        },
        // Compiles Sass to CSS and generates necessary files if requested
        sass: {
            options: {
                sourceMap: true
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= paths.styles %>',
                    src: ['*.{scss,sass}'],
                    dest: '<%= paths.styles %>',
                    ext: '.css'
                }]
            },
            server: {
                files: [{
                    expand: true,
                    cwd: '<%= paths.styles %>',
                    src: ['*.{scss,sass}'],
                    dest: '<%= paths.styles %>',
                    ext: '.css'
                }]
            }
        },

        bower: {
            dist: {
                dest: '<%= paths.dist %>/lib/'
            }
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                livereload: 35729,
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: true
                }
            }
        },
        nodemon: {
            dev: {
                script: '<%= paths.server %>'
            }
        }
    });



    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-bower');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');

    grunt.registerTask('build', ['concat', 'uglify', 'bower:dist']);
    grunt.registerTask('serve', function (target) {
        console.log('lets get the party started')
        grunt.task.run([
            'connect:livereload',
            'concurrent:tasks'
        ]);
    });
    grunt.registerTask('default', ['watch']);

    //grunt.event.once('livereload.sass', function(host, port) {
    //
    //    console.log('joes so sassy')
    //});


};