module.exports = function (grunt) {
    grunt.initConfig({
        less: {
            development: {
                options: {
                    paths: ["./less"],
                    yuicompress: true,
                    sourceMap: true
                },
                files: {
                    "./build/css/style.css": "./less/style.less"
                }
            }
        },
        cssmin: {
            options: {
                mergeIntoShorthands: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    './build/css/style.min.css': './build/css/style.css'
                }
            }
        },
        concat: {
            options: {
                separator: "\n",
            },
            dist: {
                src: ["./js/modules/*", "./js/*"],
                dest: './build/js/built.js',
            },
        },
        watch: {
            lessCompile: {
                files: "./less/*",
                tasks: ["less"]
            },
            minifyCss: {
                files: "./build/css/style.css",
                tasks: ["cssmin"]
            },
            concatJs: {
                files: ["./js/*", "./js/modules/*"],
                tasks: ["concat"]
            },
        }
    });
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
};