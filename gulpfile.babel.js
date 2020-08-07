import gulp from 'gulp';
import gulpPug from 'gulp-pug';
import gulpImage from 'gulp-image';
import gulpSass from 'gulp-sass';
gulpSass.compiler = require('node-sass');

import autoPrefixer from 'gulp-autoprefixer';
import miniCss from 'gulp-csso';

import gulpBro from 'gulp-bro';
import babelify from 'babelify';

import ghPages from 'gulp-gh-pages';

import del from 'del';
import ws from 'gulp-webserver';

const routes = {
    pug: {
        watch: 'src/**/*.pug',
        src: 'src/*.pug',
        dest: 'build',
    },
    img: {
        src: 'src/img/*',
        dest: 'build/img',
    },
    scss: {
        watch: 'src/scss/**/*.scss',
        src: 'src/scss/style.scss',
        dest: 'build/css',
    },
    js: {
        watch: 'src/js/**/*.js',
        src: 'src/js/main.js',
        dest: 'build/js',
    },
};

const pug = () => gulp.src(routes.pug.src).pipe(gulpPug()).pipe(gulp.dest(routes.pug.dest));

const img = () => gulp.src(routes.img.src).pipe(gulpImage()).pipe(gulp.dest(routes.img.dest));

const styles = () =>
    gulp
        .src(routes.scss.src)
        .pipe(gulpSass().on('error', gulpSass.logError))
        .pipe(
            autoPrefixer({
                cascade: false,
            }),
        )
        .pipe(miniCss())
        .pipe(gulp.dest(routes.scss.dest));

const js = () =>
    gulp
        .src(routes.js.src)
        .pipe(
            gulpBro({
                transform: [
                    babelify.configure({
                        presets: ['@babel/preset-env'],
                    }),
                    [
                        'uglifyify',
                        {
                            global: true,
                        },
                    ],
                ],
            }),
        )
        .pipe(gulp.dest(routes.js.dest));

const ghDeploy = () => gulp.src('build/**/*').pipe(ghPages());

const clean = () => del(['build', '.publish']);

const webserver = () =>
    gulp.src('build').pipe(
        ws({
            livereload: true,
            open: true,
        }),
    );

const watch = () => {
    gulp.watch(routes.pug.watch, pug);
    gulp.watch(routes.scss.watch, styles);
    gulp.watch(routes.js.watch, js);
};

const prepare = gulp.series([clean, img]);

const assets = gulp.series([pug, styles, js]);

const live = gulp.parallel([webserver, watch]);

export const build = gulp.series([prepare, assets]);

export const dev = gulp.series([build, live]);

export const deploy = gulp.series([build, ghDeploy, clean]);
