'use strict';

/* Get plugins */
var gulp = require('gulp');
var browserSync = require('browser-sync');
var config = require('./config.json');
var fs = require('fs');
var env = process.env.NODE_ENV;
var pkg = JSON.parse(fs.readFileSync('./package.json'));
var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*', 'del', 'merge-stream', 'vinyl-buffer']
});
const webpack = require('webpack-stream');

/* Environment */
global.isDev = process.env.NODE_ENV !== "production";

/* Error handler closure */
function errorHandler(task, title) {
    'use strict';
    
    return function (err) {
        $.util.log(task ? $.util.colors.red('[' + task + (title ? ' -> ' + title : '') + ']') : "", err.toString());
        this.emit('end');
    };
}

/* Build task */
gulp.task('build', $.sequence('clean', ['copy:static'], 'icons', ['jade', 'styles', 'js', 'js:vendor', 'imagemin']));
gulp.task('serve', $.sequence('build', 'browsersync', 'watch'));
gulp.task('default', ['build']);

/* Styles tasks */
gulp.task('styles', function (done) {
    var sassMode = fs.existsSync('./src/scss/main.scss');
    $.sequence(sassMode ? 'sass' : 'less', done);
});

gulp.task('sass', function () {
    return gulp.src('./src/scss/main.scss')
        .pipe($.sourcemaps.init()).on('error', errorHandler('sass', 'sourcemaps:init'))
        .pipe($.sass()).on('error', errorHandler('sass', 'compile'))
        .pipe($.autoprefixer()).on('error', errorHandler('sass', 'autoprefixer'))
        .pipe($.if(config.rtl, $.rtlcss())).on('error', errorHandler('sass', 'rtl'))
        .pipe($.cleanCss()).on('error', errorHandler('sass', 'cleanCSS'))
        .pipe($.sourcemaps.write('.')).on('error', errorHandler('sass', 'sourcemaps:write'))
        .pipe(gulp.dest('./dist/assets/css/'))
        .pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('less', function () {
    return gulp.src('./src/less/main.less')
        .pipe($.sourcemaps.init()).on('error', errorHandler('less', 'sourcemaps:init'))
        .pipe($.less()).on('error', errorHandler('less', 'compile'))
        .pipe($.autoprefixer()).on('error', errorHandler('less', 'autoprefixer'))
        .pipe($.cleanCss()).on('error', errorHandler('less', 'cleanCSS'))
        .pipe($.sourcemaps.write('.')).on('error', errorHandler('less', 'sourcemaps:write'))
        .pipe(gulp.dest('./dist/assets/css/'))
        .pipe(browserSync.stream({match: '**/*.css'}));
});

/* Jade task */
gulp.task('jade', function () {
    var locale = config.locale ? JSON.parse(fs.readFileSync('./src/locales/' + config.locale + '.json')) : null;
    var jadeOptions = {
        basedir: "./src/jade/",
        pretty: true,
        locals: {
            "ENV": env,
            "PACKAGE": pkg,
            "__": locale
        }
    };
    
    return gulp.src(['./src/jade/**/*.jade'])
        .pipe($.changed('./dist/', {extension: '.html'}))
        .pipe($.if(global.isWatching, $.cached('jade')))
        .pipe($.jadeInheritance({basedir: jadeOptions.basedir}))
        .pipe($.filter(function (file) {
            return !/\/_/.test(file.path) && !/^_/.test(file.relative);
        }))
        .pipe($.jade(jadeOptions)).on('error', errorHandler('jade', 'compile'))
        .pipe(gulp.dest('./dist/')).on('end', function () {
            browserSync.reload();
        });
});

/* JS task */
gulp.task('js', function (done) {
    var webpackMode = fs.existsSync('./webpack.config.js');
    $.sequence(webpackMode ? 'js:webpack' : 'js:copy', done);
});

gulp.task('js:copy', function () {
    return gulp.src(['./src/js/**/*'])
        .pipe($.uglify()).on('error', errorHandler('js', 'uglify'))
        .pipe(gulp.dest('./dist/assets/js'));
});

gulp.task('js:webpack', function () {
    const dist = global.isDev ? './dist/assets/js' : './dist/assets/js';

    return gulp.src(['./src/js/**/*'])
        .pipe(webpack(require('./webpack.config.js'))).on('error', errorHandler('js', 'webpack'))
        .pipe(gulp.dest(dist));
});

gulp.task('js:vendor', function () {
    var bowerOptions = {};
    var uglifySaveLicense = require('uglify-save-license');
    var uglifyOptions = {
        output: {
            comments: uglifySaveLicense
        }
    };
    
    return gulp.src('./bower.json')
        .pipe($.mainBowerFiles('**/*.js', bowerOptions)).on('error', errorHandler('js:vendor', 'mainBowerFiles'))
        .pipe($.sourcemaps.init()).on('error', errorHandler('js:vendor', 'sourcemaps:init'))
        .pipe($.concat('vendor.js')).on('error', errorHandler('js:vendor', 'concat'))
        .pipe($.uglify(uglifyOptions)).on('error', errorHandler('js:vendor', 'uglify'))
        .pipe($.sourcemaps.write('.')).on('error', errorHandler('js:vendor', 'sourcemaps:write'))
        .pipe(gulp.dest('./dist/assets/js/'));
});

/* Icon tasks */
gulp.task('icons', ['icons:svgsprites', 'icons:sprites']);

gulp.task('icons:svgsprites', function () {
    if (fs.existsSync('./src/icons/')) {
        var svgSpriteOptions = {
            mode: {
                symbol: {
                    dest: "",
                    sprite: "svgsprites.svg",
                    render: {
                        less: {
                            dest: '../../../../src/less/generated/svgsprites.less',
                            template: "./src/less/templates/svgsprites.less"
                        }
                    }
                }
            }
        };
        
        return gulp.src('./src/icons/*.svg')
            .pipe($.svgSprite(svgSpriteOptions))
            .pipe(gulp.dest("./dist/assets/img/sprites/"));
    }
});

gulp.task('icons:sprites', function () {
    if (fs.existsSync('./src/sprites/')) {
        var spriteData = gulp.src('./src/sprites/**/*.png').pipe($.spritesmith({
            imgPath: '../img/sprites/sprites.png',
            imgName: 'sprites.png',
            cssName: 'sprites.less',
            cssTemplate: "./src/less/templates/sprites.less",
            padding: 1
        }));
        
        var imgStream = spriteData.img
            .pipe(gulp.dest('./dist/assets/img/sprites/'));
        
        var cssStream = spriteData.css
            .pipe(gulp.dest('./src/less/generated'));
        
        return $.mergeStream(imgStream, cssStream);
    }
});

/* Image tasks */
gulp.task('imagemin', function () {
    return gulp.src(['./src/static/images/**/*'])
        .pipe($.imagemin())
        .pipe(gulp.dest('./dist/images'));
});

/* Browsersync Server */
gulp.task('browsersync', function () {
    browserSync.init({
        server: ["./dist", "./tmp", "./src/static"],
        notify: false,
        port: 3000,
        ghostMode: {
            clicks: false,
            forms: false,
            scroll: false
        }
    });
});

/* Watcher */
gulp.task('watch', function () {
    global.isWatching = true;
    
    $.watch("./src/scss/**/*.scss", function () {
        gulp.start('sass');
    });
    $.watch("./src/less/**/*.less", function () {
        gulp.start('less');
    });
    $.watch("./src/jade/**/*.jade", function () {
        gulp.start('jade');
    });
    $.watch("./src/locales/**/*.js", function () {
        gulp.start('jade');
    });
    $.watch("./src/js/**/*.js", function () {
        gulp.start('js');
    });
    $.watch("./src/static/**/*", function () {
        gulp.start('copy:static');
    });
});

/* Copy tasks */
gulp.task('copy:static', function () {
    return gulp.src(['./src/static/assets/**/*'])
        .pipe(gulp.dest('./dist/assets'));
});

gulp.task('copy:bower', function () {
    return gulp.src(['./bower_components/**/*'])
        .pipe(gulp.dest('./dist/bower_components'));
});

/* Other tasks */
gulp.task('reload', function () {
    browserSync.reload();
});

gulp.task('clean', function () {
    return $.del(['./dist/**/*', './tmp']);
});