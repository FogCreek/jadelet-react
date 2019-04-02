import gulp from 'gulp';
import babel from 'gulp-babel';
import cs from 'coffee-script';
import Jadelet from 'jadelet/dist/main';
import through from 'through2';

function jadelet({ compiler = cs, runtime = 'require("../").runtime' } = {}) {
  return through.obj((file, enc, cb) => {
    const src = file.isBuffer() ? file.contents.toString(enc) : file.contents;
    const out = Jadelet.compile(src, { compiler, runtime });
    file.contents = Buffer.from(out, enc);
    file.basename = file.basename.replace(/.jade$/, '.js');
    process.nextTick(cb, null, file);
  });
}

export function templates() {
  return gulp.src('./templates/**/*.jade')
    .pipe(jadelet())
    .pipe(babel({
      plugins: ['./jadelet-react-preprocessor']
    }))
    .pipe(gulp.dest('./templates-out'));
}