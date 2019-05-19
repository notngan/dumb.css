const gulp = require('gulp')
const del = require('del')
const nunjucks = require('gulp-nunjucks')
const sass = require('gulp-sass')
const scssLint = require('gulp-scss-lint')
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const sourcemaps = require('gulp-sourcemaps')
const sourceStream = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const uglify = require('gulp-uglify')
const browserSync = require('browser-sync').create()
const browserify = require('browserify')
const babelify = require('babelify')

const path = {
  src: './src',
  dest: './public', 
}

const browserSyncInit = done => {
  browserSync.init({
    server: {
      baseDir: path.dest
    }
  })
  done()
}

const browserSyncReload = done => {
  browserSync.reload()
  done()
}

const clean = done => {
  del(`${path.dest}/*`)
  done()
}

const html = done => {
  gulp.src(`${path.src}/html/*.html`)
    .pipe(nunjucks.compile())
    .on('error', err => { 
      console.log(err) 
    })
    .pipe(gulp.dest(`${path.dest}`))
  done()
}

const css = done => {
  gulp.src([`${path.src}/scss/**/*.scss`])
    .pipe(sourcemaps.init())
    .pipe(scssLint({ 
      'config': 'scss-lint.yml' 
    }))
    .pipe(sass())
    .on('error', err => { 
      console.log(err) 
    })
    .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(`${path.dest}/css`))
    .pipe(browserSync.stream())
  done()
}

const js = done => {
  browserify({ entries: `${path.src}/js/main.js` })
    .transform(babelify, { 
      'presets': ['@babel/preset-env'] 
    })
    .bundle().on('error', err => { 
      console.log(err) 
    })
    .pipe(sourceStream('main.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(`${path.dest}/js`))
  done()
}

const watchFiles = () => {
  gulp.watch(`${path.src}/scss/**/*.scss`, css)
  gulp.watch(`${path.src}/html/**/*.html`, gulp.series(html, browserSyncReload))
  gulp.watch(`${path.src}/js/**/*.js`, gulp.series(js, browserSyncReload)) 
}

exports.html = html
exports.css = css
exports.js = js

exports.clean = clean
exports.build = gulp.series(clean, gulp.parallel(js, html, css))
exports.default = gulp.parallel(browserSyncInit, watchFiles)
