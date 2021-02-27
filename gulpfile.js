const gulp         = require('gulp'),
    sass         = require('gulp-sass'),
    browsersync  = require('browser-sync').create(),
    del          = require('del'),
    imagemin     = require('gulp-imagemin'),
    autoprefixer = require('gulp-autoprefixer'),
    csso         = require('gulp-csso'),
    pug          = require('gulp-pug'),
    data         = require('gulp-data'),
    htmlmin      = require('gulp-htmlmin'),
    uglify       = require('gulp-uglify'),
    concat       = require('gulp-concat'),
    pump         = require('pump');


const path = {
    build:    './build',
    css:      {
        source:      './scss/main.+(scss|sass)',
        dest:        './build',
        watchSource: './scss/**/*.scss',
    },
    html:     {
        indexSource: './*.html',
        dest:        './build',
        watchSource: './*.html',
    },
    scripts:  {
        source:      './js/**/*',
        dest:        './build/js/',
        watchSource: './js/**/*.js',
    },
    images:   {
        source: './assets/img/**/*',
        dest:   './build/assets/img/',
    },
    fonts:    {
        source: './assets/fonts/**/*',
        dest:   './build/assets/fonts/',
    },
};

// Clean
gulp.task('clean', done => {
    del.sync(path.build);
    done();
});

// Css
gulp.task('css', done => {
    gulp
        .src(path.css.source)
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer(['last 5 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
        .pipe(csso())
        .pipe(gulp.dest(path.css.dest))
        .pipe(browsersync.stream());
    done();
});

// De-caching for Data files
function requireUncached($module) {
    delete require.cache[require.resolve($module)];
    return require($module);
}

// Html
gulp.task('html', done => {
    gulp
        .src(path.html.indexSource)
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(path.build))
        .pipe(browsersync.stream());
    done();
});

// Scripts
gulp.task('scripts', cb => {
    pump([
            gulp.src(path.scripts.source),
            concat('script.js'),
            uglify(),
            gulp.dest(path.scripts.dest),
        ],
        cb,
    );
});

// Images
gulp.task('images', done => {
    gulp
        .src(path.images.source)
        .pipe(gulp.dest(path.images.dest));
    done();
});

//Fonts
gulp.task('fonts', done => {
    gulp
        .src(path.fonts.source)
        .pipe(gulp.dest(path.fonts.dest));
    done();
});

// BrowserSync
function reload(done) {
    browsersync.reload();
    done();
}

gulp.task('browser-sync', done => {
    browsersync.init({
        server: {
            baseDir: path.build,
        },
        notify: false,
    });
    done();
});

// Watch files
gulp.task('watch', done => {
    gulp.watch(path.css.watchSource, gulp.series('css', reload));
    gulp.watch(path.html.watchSource, gulp.series('html', reload));
    gulp.watch(path.scripts.watchSource, gulp.series('scripts', reload));
    done();
});

gulp.task('default', gulp.parallel('clean', 'css', 'html', 'scripts', 'fonts', 'images', 'browser-sync', 'watch'));
