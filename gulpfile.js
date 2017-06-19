// including plugins
var gulp = require('gulp')
var autoprefixer = require('gulp-autoprefixer')
var gp_concat = require('gulp-concat')
var gp_rename = require('gulp-rename')
var gp_uglify = require('gulp-uglify')
var path = require('path')


gulp.task('copy', function() {
    return gulp.src(
            [
                './src/utils/**',
            ]
        )
        .pipe(gp_uglify())
        .pipe(gulp.dest('./dist/utils/'))
})


// gulp.task('js', function(){
//     return gulp.src(
//             [
//                 './public/js/jquery.js',
//                 './public/js/plugins.js',
//                 './public/js/components/bs-datatable.js',
//                 './public/js/functions.js',
//                 './public/js/social-share-kit.min.js',
//                 './public/js/sweetalert.min.js',
//                 './public/js/custom.js'
//             ]
//         )
        // .pipe(gp_concat('gulp-concat.js'))
//         .pipe(gulp.dest('./public/min/'))
//         .pipe(gp_rename('vendor.min.js'))
//         .pipe(gp_uglify())
//         .pipe(gulp.dest('./public/dist/js/'))
// });


gulp.task('build', function(){
    return gulp.src(
            [
                './src/utils/Email.js',
                './src/utils/TurboDB.js',
                './src/utils/Stripe.js',
                './src/utils/Functions.js',
                './src/utils/TurboStorage.js',
                './src/index.js'
            ]
        )
        .pipe(gp_concat('turbo.min.js'))
        .pipe(gulp.dest('./dist/'))
        .pipe(gp_rename('turbo.min.js'))
        .pipe(gp_uglify())
        .pipe(gulp.dest('./dist/'))
});

gulp.task('watch', function() {
    gulp.watch(['./src/index.js'], ['build'])
})

gulp.task('default', ['build'], function(){})


