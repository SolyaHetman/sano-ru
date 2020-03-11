const { src, dest, watch, series, parallel } = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const babel = require('gulp-babel');
const htmlreplace = require('gulp-html-replace');

// File paths
const files = {
    scssPath: 'src/styles/scss/**/*.scss',
    jqueryPath: 'node_modules/jquery/dist/jquery.js',
    bootstrapPath: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    mainJsPath: 'src/scripts/main.js',
}

function watchSCSS() {
    return src([files.scssPath])
        .pipe(sass())
        .pipe(concat('main.css'))
        .pipe(dest('dist'));
}

function buildSCSS() {
    return src([files.scssPath])
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(concat('main.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist'));
}

function watchJS() {
    return src([
        files.jqueryPath,
        files.bootstrapPath,
        files.mainJsPath
    ])
        .pipe(concat('app.js'))
        .pipe(dest('dist'));
}

function buildJS() {
    return src([
        files.jqueryPath,
        files.bootstrapPath,
        files.mainJsPath
    ])
        .pipe(sourcemaps.init())
        .pipe(concat('app.js'))
        .pipe(babel())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(dest('dist'));
}

function watchTask() {
    watch(
        [
            files.scssPath,
            files.mainJsPath
        ],
        parallel(watchSCSS, watchJS)
    );
}

function copyAssets() {
    return src('src/assets//**')
        .pipe(dest('dist/assets'));
}

function copyFiles() {
    return src([
        'src/robots.txt',
        'src/sitemap.xml'
    ])
        .pipe(dest('dist/'));
}

function replacePathIndex() {
    return src([
        'src/*.html',
    ])
        .pipe(htmlreplace({
            'css': 'main.css',
            'js': 'app.js'
        }))
        .pipe(dest('dist/'));
};

function replacePathViews() {
    return src([
        'src/views/*.html',
    ])
        .pipe(htmlreplace({
            'css': '../main.css',
            'js': '../app.js'
        }))
        .pipe(dest('dist/views/'));
};

function replaceProductsViews() {
    return src([
        'src/views/**/*.html',
    ])
        .pipe(htmlreplace({
            'css': '../../main.css',
            'js': '../../app.js'
        }))
        .pipe(dest('dist/views/'));
};


exports.build = series(copyAssets, buildSCSS, buildJS, replacePathIndex, replacePathViews, replaceProductsViews, copyFiles);

exports.default = series(
    parallel(watchSCSS, watchJS),
    watchTask
);