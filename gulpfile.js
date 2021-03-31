/**
 * Created by zaccaryprice on 24/12/2015.
 */

const fs = require('fs');
const gulp = require('gulp');
const log = require('fancy-log');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const gulpif = require('gulp-if');
const rev = require('gulp-rev');
const sort = require('gulp-sort');
const rename = require('gulp-rename');
const revReplace = require('gulp-rev-replace');
const useref = require('gulp-useref');
const webpack = require('webpack');
const babel = require('gulp-babel');
const path = require('path');
const vinylPaths = require('vinyl-paths');
const runSequence = require('run-sequence');
const del = require('del');
const inject = require('gulp-inject');
const csso = require('gulp-csso');
const imagemin = require('gulp-imagemin');
const pngquant = require('pngquant');
const workbox = require('workbox-build');
const minifyEs = require('gulp-terser');
const webpackConf = require('./webpack.conf');

const paths = {
  src: 'react-client',
  dist: 'dist',
  tmp: '.tmp',
};

// clean <tmp> directory
gulp.task('clean:tmp', () => gulp.src(path.join(paths.tmp, '*'))
  .pipe(vinylPaths(del)));

// clean <dist> directory
gulp.task('clean:dist', () => gulp.src(path.join(paths.dist, '*'))
  .pipe(vinylPaths(del)));

gulp.task('copy:sounds', () => gulp.src([
  path.join(paths.src, 'sounds/*'),
])
  .pipe(gulp.dest(path.join(paths.dist, 'sounds'))));

gulp.task('copy:sourcemaps', () => {
  const manifestRaw = fs.readFileSync(path.join(paths.tmp, 'rev-manifest.json'), 'utf8');
  const manifest = JSON.parse(manifestRaw);

  log.info(manifest);

  return gulp.src([
    path.join(paths.tmp, 'js/**/*.map'),
  ])
    .pipe(rename((p) => {
      const manifestPathPrefix = `js/${p.dirname !== '.' ? `${p.dirname}/` : ''}`;
      const manifestPath = `${manifestPathPrefix}${p.basename}`;
      const revPath = `${manifest[manifestPath]}`;
      return {
        ...p,
        basename: revPath.replace(manifestPathPrefix, ''),
      };
    }))
    .pipe(gulp.dest(path.join(paths.dist, 'js')));
});

// inject javascript files into inject:js
// block in index.ejs
gulp.task('inject:js', () => {
  const target = gulp.src(path.join(paths.src, '/index.ejs'));
  const sources = [path.join(paths.src, 'js/lib/**/*.js')];

  const opts = {
    transform: (filePath) => {
      filePath = filePath.replace(`/${paths.src}/`, '/');
      filePath = filePath.replace('/.tmp/', '/');
      return `<script src="${filePath}"></script>`;
    },
  };

  return target
    .pipe(inject(gulp.src(sources, { read: false }), opts))
    .pipe(gulp.dest(path.join(paths.src, '/')));
});

// inject scss files into `// inject:scss` block in main.scss
gulp.task('inject:sass', () => {
  const target = gulp.src([path.join(paths.src, 'styles/main.scss')]);
  const sources = [
    path.join(paths.src, 'styles/**/*.scss'),
    `!${path.join(paths.src, 'styles/main.scss')}`,
    `!${path.join(paths.src, 'styles/*.scss')}`,
  ];

  const opts = {
    starttag: '// inject:{{ext}}',
    endtag: '// endinject',
    transform: (filePath) => {
      filePath = filePath.replace(`/${paths.src}/styles/`, '');
      filePath = filePath.replace(/([\w/]*?)_?([\w.-]+?)\.(sass|scss)/, '$1$2');
      return `@import "${filePath}";`;
    },
  };

  target
    .pipe(inject(gulp.src(sources, { read: false }), opts))
    .pipe(gulp.dest(path.join(paths.src, 'styles/')));
});

// watch for file changes and run injection and processing
gulp.task('watch', () => {
  gulp.watch(path.join(paths.src, 'styles/**/*.scss'), ['sass']);
  gulp.watch(path.join(paths.src, 'sw/**/*.js'), ['generateSw:development']);
  gulp.watch(
    [
      path.join(paths.src, 'styles/**/*.scss'),
      `!${path.join(paths.src, 'styles/main.scss')}`,
    ], ['inject:sass'],
  );
});

// compile sass/scss files and run autoprefixer on processed css
gulp.task('sass', () => {
  gulp.src([path.join(paths.src, 'styles/main.scss')])
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sass({
      indludePaths: ['node_modules/normalize-scss'],
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(path.join(paths.tmp, 'styles/')));
});

gulp.task('csso', () => gulp.src(`${paths.tmp}/**/*.css`)
  .pipe(csso())
  .pipe(gulp.dest(paths.tmp)));


gulp.task('imagemin', () => gulp.src(path.join(paths.src, 'img/**/*'))
  .pipe(imagemin({
    progressive: true,
    svgoPlugins: [{ removeViewBox: false }],
    use: [pngquant()],
  }))
  .pipe(gulp.dest(`${paths.dist}/img`)));


function compile(watch, esNext = false) {
  return new Promise((resolve, reject) => {
    log.info('-> bundling...');
    return webpack(webpackConf({ esNext, watch }), (err, stats) => {
      if (err || stats.hasErrors()) {
        if (err) {
          log.error(err);
        }

        log.info(stats.toString({
          chunks: false,
          colors: true,
          assets: false,
          modules: false,
        }));
        return reject(err);
      }

      log.info(stats.toString({
        chunks: false,
        colors: true,
        assets: false,
        modules: false,
      }));
      return resolve();
    });
  });
}

gulp.task('babelify', () => gulp.src('react-client/js/lib/*.js')
  .pipe(sourcemaps.init())
  .pipe(babel({
    presets: ['@babel/preset-env'],
  }))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(path.join(paths.tmp, 'js', 'lib'))));


// run concatenation, minification and reving
// using build blocks in *.html
// outputting resulting files to <dist>
gulp.task('useref', () => gulp.src(path.join(paths.src, 'index.ejs'))
  .pipe(useref())
  .pipe(gulpif(['**/vendor.js'], minifyEs({
    output: {
      comments: /(?:^!|@(?:license|preserve|cc_on))/,
    },
    warnings: true,
  })))
  .on('error', err => log.error(err))
  .pipe(gulp.dest(paths.tmp)));

gulp.task('revision', ['csso'],
  () => gulp.src([
    path.join(paths.tmp, '**/*.css'),
    path.join(paths.tmp, '**/*.js'),
    path.join(paths.tmp, '**/*.mjs'),
  ])
    .pipe(sort())
    .pipe(rev())
    .pipe(gulp.dest(paths.dist))
    .pipe(rev.manifest())
    .pipe(gulp.dest(paths.tmp)));

gulp.task('revreplace', ['revision'], () => {
  const manifest = gulp.src(`${paths.tmp}/rev-manifest.json`);

  return gulp.src(`${paths.tmp}/index.ejs`)
    .pipe(revReplace({ manifest, replaceInExtensions: ['.ejs'] }))
    .pipe(gulp.dest(paths.dist));
});

function writeServiceWorkerFile(rootDir, callback) {
  log.info({ rootDir });
  const config = {
    cacheId: 'jumpinchat',
    swDest: path.join(rootDir, 'service-worker.js'),
    runtimeCaching: [
      {
        urlPattern: new RegExp('/api/(.*)'),
        handler: 'networkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60,
          },
        },
      },
      {
        urlPattern: /\/\w+(?:\/[^.]+\/?)?$/,
        handler: 'networkFirst',
      },
      {
        urlPattern: new RegExp('\\.(js|css|jpg|png|gif)$'),
        handler: 'staleWhileRevalidate',
      },
      {
        urlPattern: /\/(admin|settings)\//,
        handler: 'networkOnly',
      },
      {
        urlPattern: new RegExp('/api/user/checkCanBroadcast/(.*)'),
        handler: 'networkOnly',
      },
    ],
    globDirectory: rootDir,
    globPatterns: [
      'img/**.*',
      '**/*.{mp3,ogg}',
      '**/*.{js,mjs,css}',
    ],
    globStrict: false,
    importScripts: [
      '/js/push-manager.js',
    ],
  };

  workbox
    .generateSW(config, callback)
    .then(({ count, size, warnings }) => {
      log.info(`Generated service-worker.js, which will precache ${count} files, totaling ${Math.round(size / 1024)}kb.`);

      warnings.forEach(w => log.warn(w));
    })
    .catch(e => log.error(e));

  return gulp
    .src([
      path.join(paths.src, 'sw/*'),
    ])
    .pipe(gulp.dest(path.join(rootDir, 'js')));
}


gulp.task('compile:js', ['babelify'], () => compile());
gulp.task('compile:js:esNext', ['babelify'], () => compile(false, true));
gulp.task('compile:js:watch', () => compile(true, true));

gulp.task('setEnv:production', () => { process.env.NODE_ENV = 'production'; });
gulp.task('setEnv:development', () => { process.env.NODE_ENV = 'development'; });

gulp.task('generateSw:development', (cb) => { writeServiceWorkerFile(paths.tmp, cb); });
gulp.task('generateSw:production', (cb) => { writeServiceWorkerFile(paths.dist, cb); });

gulp.task('build', done => runSequence(
  ['clean:tmp', 'clean:dist'],
  ['copy:sounds', 'inject:sass', 'inject:js'],
  'setEnv:production',
  'compile:js',
  'compile:js:esNext',
  ['sass', 'imagemin'],
  'useref',
  'revreplace',
  'copy:sourcemaps',
  'generateSw:production',
  done,
));

gulp.task('watchify', done => runSequence(
  'clean:tmp',
  ['inject:sass', 'inject:js'],
  'setEnv:development',
  ['compile:js:watch', 'sass'],
  'watch',
  done,
));
