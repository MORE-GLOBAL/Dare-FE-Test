// var gulp        = require('gulp');
// var browserSync = require('browser-sync').create();
// var sass        = require('gulp-sass');

// // Compile sass into CSS & auto-inject into browsers
// gulp.task('sass', function() {
//     return gulp.src(['node_modules/bootstrap/scss/bootstrap.scss', 'src/scss/*.scss'])
//         .pipe(sass())
//         .pipe(gulp.dest("src/css"))
//         .pipe(browserSync.stream());
// });

// // Move the javascript files into our /src/js folder
// gulp.task('js', function() {
//     return gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/jquery/dist/jquery.min.js', 'node_modules/popper.js/dist/umd/popper.min.js'])
//         .pipe(gulp.dest("src/js"))
//         .pipe(browserSync.stream());
// });

// // Static Server + watching scss/html files
// gulp.task('serve', gulp.series('sass', function() {

//     browserSync.init({
//         server: "./src"  
//     });

//     gulp.watch(['node_modules/bootstrap/scss/bootstrap.scss', 'src/scss/*.scss'], gulp.series('sass'));
//     gulp.watch('src/js/*.js').on('change', browserSync.reload);
//     gulp.watch("src/*.html").on('change', browserSync.reload);
// }));

// gulp.task('default', gulp.series('js', 'serve'));

const { src, dest, watch, series, parallel } = require('gulp');
const gulp = require('gulp');
const sass = require('gulp-sass');
const del = require('del');
const mode = require('gulp-mode')();
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');

// Clean Tasks

const clean = () => {
    return del(['dist']);
}

const cleanImages = () => {
    return del(['dist/assets/images']);
}

// Compile sass into CSS & auto-inject into browsers

const css = () => {
    return gulp.src(['node_modules/bootstrap/scss/bootstrap.scss', 'src/scss/**/*.scss'])
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
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
    return gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/jquery/dist/jquery.min.js', 'node_modules/popper.js/dist/umd/popper.min.js', 'src/js/main.js'])
        .pipe(dest('dist/js'))
        .pipe(mode.development( browserSync.stream() ));
}

// Copy Images

const copyImages = () => {
    return src('src/assets/img/**/*.{jpg,jpeg,png,gif,svg}')
        .pipe(dest('dist/assets/img'));
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
    watch('**/*.html').on('change', browserSync.reload);
    watch('src/assets/images/**/*.{png,jpg,jpeg,gif,svg}', series(cleanImages, copyImages));
}

// Public Tasks

exports.default = series(clean, parallel(css, js, copyImages, copyCss), watchForChanges);
exports.build = series(clean, parallel(css, js, copyImages, copyHtml, copyCss));