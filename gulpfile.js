var gulp = require("gulp"),
  sourcemaps = require("gulp-sourcemaps"),
  sass = require("gulp-sass"),
  browserSync = require("browser-sync"),
  concat = require("gulp-concat"),
  uglify = require("gulp-uglifyjs"),
  babel = require("gulp-babel"),
  // cssnano      = require('gulp-cssnano'),
  csso = require("gulp-csso");
(rename = require("gulp-rename")),
  (del = require("del")),
  (imagemin = require("gulp-imagemin")),
  (pngquant = require("imagemin-pngquant")),
  (cache = require("gulp-cache")),
  (gsmq = require("gulp-group-css-media-queries")),
  (injectPartials = require("gulp-inject-partials")),
  (autoprefixer = require("gulp-autoprefixer")),
  (svgSprite = require("gulp-svg-sprite")),
  (svgmin = require("gulp-svgmin")),
  (cheerio = require("gulp-cheerio")),
  (replace = require("gulp-replace"));

gulp.task("sprite", function () {
  return gulp
      .src("app/img/svg-icons/*.svg")
      // minify svg
      .pipe(
        svgmin({
          js2svg: {
            pretty: true,
          },
        })
      )
      // remove all fill and style declarations in out shapes
      .pipe(
        cheerio({
          run: function ($) {
            $("[fill]").removeAttr("fill");
            $("[stroke]").removeAttr("stroke");
            $("[style]").removeAttr("style");
          },
          parserOptions: { xmlMode: true },
        })
      )
      // cheerio plugin create unnecessary string '&gt;', so replace it.
      .pipe(replace("&gt;", ">"))
      // build svg sprite
      .pipe(
        svgSprite({
          mode: {
            symbol: {
              sprite: "../sprite.svg",
              render: {
                scss: {
                  dest: "../../../scss/base/_sprite.scss",
                  template: "app/scss/utils/_sprite-template.scss",
                },
              },
              example: true,
            },
          },
        })
      )
      .pipe(gulp.dest("app/img/i/"));
});

gulp.task("index", function () {
  return gulp
    .src("./app/view/*.html")
    .pipe(injectPartials())
    .pipe(
      rename(function (opt) {
        opt.basename = opt.basename.replace(/^_/, "");
        return opt;
      })
    )
    .pipe(gulp.dest("./app"))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task("sass", function () {
  return gulp
      .src("app/scss/app.scss")
      .pipe(sourcemaps.init())
      .pipe(sass())
      .pipe(gsmq())
      // .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
      .pipe(autoprefixer(["last 2 versions"], { cascade: true }))
      .pipe(csso())
      .pipe(rename({ suffix: ".min" }))
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest("app/css"))
      .pipe(browserSync.reload({ stream: true }));
});

gulp.task("scripts", function () {
  return gulp
    .src([
      /** custom */
      "app/js/app.js",
    ])
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(uglify())
    .pipe(rename({ suffix: ".min" }))
    .pipe(gulp.dest("app/js"));
});

gulp.task("scriptsConcat", function () {
  return gulp
    .src([
      /** libs */
      'node_modules/jquery/dist/jquery.min.js',
      // 'node_modules/aos/dist/aos.js',
      "node_modules/swiper/swiper-bundle.min.js",
      "node_modules/tabs/index.js",
      "node_modules/mixitup/dist/mixitup.min.js",
      // "node_modules/glightbox/dist/js/glightbox.min.js",
      // "node_modules/imask/dist/imask.js",
      // "node_modules/slim-select/dist/slimselect.min.js",
      // "node_modules/micromodal/dist/micromodal.min.js",
      /** custom */
      "app/js/app.min.js",
    ])
    .pipe(concat("app.min.js"))
    .pipe(gulp.dest("app/js"))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task("browser-sync", function () {
  browserSync({
    server: {
      baseDir: "app",
	},
	notify: false,
    // tunnel: true,
  });
});

gulp.task("clean", async function () {
  return del.sync("dist");
});

gulp.task("img", function () {
  return gulp
    .src("app/img/**/*")
    .pipe(
      cache(
        imagemin({
          interlaced: true,
          progressive: true,
          svgoPlugins: [{ removeViewBox: false }],
          use: [pngquant()],
        })
      )
    )
    .pipe(gulp.dest("dist/img"));
});

gulp.task("prebuild", async function () {
  var buildCss = gulp.src("app/css/*").pipe(gulp.dest("dist/css"));

  var buildFonts = gulp.src("app/fonts/**/*").pipe(gulp.dest("dist/fonts"));

  var buildJs = gulp.src("app/js/app.min.js").pipe(gulp.dest("dist/js"));

  var buildHtml = gulp.src("app/*.html").pipe(gulp.dest("dist"));

  var buildPhp = gulp.src("app/*.php").pipe(gulp.dest("dist"));
});

gulp.task("clear", function (callback) {
  return cache.clearAll();
});

gulp.task("checkupdate", function () {
  gulp.watch("app/scss/**/*.scss", gulp.parallel("sass"));
  gulp.watch("app/view/**/*.html", gulp.parallel("index"));
  gulp.watch(["app/js/app.js"], gulp.series("scripts", "scriptsConcat"));
  gulp.watch(["app/img/svg-icons/*.svg"], gulp.parallel("sprite"));
});
gulp.task("watch",gulp.parallel(gulp.series("scripts", "scriptsConcat"),"sass","browser-sync","index","sprite","checkupdate",));
gulp.task(
  "build",
  gulp.series(
    "clean",
    gulp.parallel(
      "index",
      "img",
      "sass",
      "sprite",
      gulp.series("scripts", "scriptsConcat")
    ),
    "prebuild"
  )
);
