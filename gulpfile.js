const { src, dest, watch, series, parallel } = require('gulp');
const gulp = require('gulp');
const sass = require('gulp-sass');
const del = require('del');
const mode = require('gulp-mode')();
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const prefix = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const babel = require('gulp-babel');
const nunjucksRender = require('gulp-nunjucks-render');

// Clean Tasks

const clean = () => {
    return del(['dist']);
}

const cleanImages = () => {
    return del(['dist/assets/images']);
}

// Compile sass into CSS & auto-inject into browsers

const css = () => {
    return gulp.src(['src/scss/**/*.scss'])
        .pipe(mode.development(sourcemaps.init()))
        .pipe(sass().on('error', sass.logError))
        .pipe(prefix('last 2 versions'))
        .pipe(mode.production(csso()))
        .pipe(mode.development( sourcemaps.write() ))
        .pipe(dest('src/css'))
        .pipe(mode.development( browserSync.stream() ));
}

// Copy CSS

const copyCss = () => {
    return src(['src/css/**/*.css'])
        .pipe(dest('dist/css'))
}

// Copy JS

const js = () => {
    return src(['node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/jquery/dist/jquery.min.js', 'node_modules/popper.js/dist/umd/popper.min.js', 'src/js/main.js'])
        .pipe(dest('dist/js'))
        .pipe(mode.development( browserSync.stream() ));
}

// Copy Images

const copyImages = () => {
    return src('src/assets/img/**/*.{jpg,jpeg,png,gif,svg}')
        .pipe(dest('dist/assets/img'));
}

const njk = () => {
    return src('src/pages/**/*.+(html|njk)')
        .pipe(nunjucksRender({
            path: ['src/templates']
        }))
        .pipe(dest('src'))
        .pipe(mode.development( browserSync.stream() ));
}

// Copy HTML

const copyHtml = () => {
    return src('src/**/*.html')
        .pipe(dest('dist'));
}

// Watch Task

const watchForChanges = () => {
    browserSync.init({
        server: {
            baseDir: './src'
        }
    });

    watch('src/scss/**/*.scss', css);
    watch('src/**/*.js', js);
    // watch('**/*.html').on('change', browserSync.reload);
    watch(['src/templates/**/*.+(html|njk)', 'src/pages/**/*.+(html|njk)'], njk);
    watch('src/assets/images/**/*.{png,jpg,jpeg,gif,svg}', series(cleanImages, copyImages));
}

// Public Tasks

exports.default = series(clean, parallel(css, js, copyImages, njk, copyCss), watchForChanges);
exports.build = series(clean, parallel(css, js, copyImages, njk, copyHtml, copyCss));