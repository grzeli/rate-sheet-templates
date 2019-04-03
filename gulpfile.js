var gulp = require("gulp"),
    sass = require("gulp-sass"),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    cssnano = require("cssnano"),
    sourcemaps = require("gulp-sourcemaps"),
    imagemin = require("gulp-imagemin"),
    eslint = require("gulp-eslint"),
    plumber = require("gulp-plumber"),
    concat = require("gulp-concat"),
    newer = require("gulp-newer"),
    browserSync = require("browser-sync").create();

var paths = {
  styles: {
    src: "src/scss/*.scss",
    scss: "src/scss/styles.scss",
    src2: "src/js/*.js",
    img: "src/images/**.*",
    dest: "src/css"
  }
};

function style() {
  return gulp
    .src(paths.styles.scss)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on("error", sass.logError)
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(concat('styles.css'))
    .pipe(browserSync.stream());
}

function images() {
  return gulp
    .src("./src/images/**/*")
    .pipe(newer("./src/img-min"))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.jpegtran({ progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            {
              removeViewBox: false,
              collapseGroups: true
            }
          ]
        })
      ])
    )
    .pipe(gulp.dest("./src/img-min"));
}

function scriptsLint() {
  return gulp
    .src(["./src/js/**/*", "./gulpfile.js"])
    .pipe(plumber())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

function scripts() {
  return (
    gulp
      .src(["./src/js/**/*"])
      .pipe(plumber())
      .pipe(gulp.dest("./src/js/js-final"))
      .pipe(browsersync.stream())
  );
}

function reload(done) {
  browserSync.reload();
  done();
}

function watch() {
  browserSync.init({
    server: {
      baseDir: "./src"
    },
    port: 3000
  });
  gulp.watch(paths.styles.src, style);
  gulp.watch(paths.styles.src2, gulp.series(scriptsLint, scripts));
  gulp.watch(paths.styles.img, images);
  gulp.watch("src/*.html").on('change', browserSync.reload);
}

const js = gulp.series(scriptsLint, scripts);

exports.watch = watch
exports.style = style;
exports.js = js;
exports.images = images;


var build = gulp.parallel(style, images, js,  watch);
gulp.task('default', build);