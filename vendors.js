'use strict'

// Import các module Gulp cần thiết
var gulp = require('gulp');
var concat = require('gulp-concat');  // Dùng để kết hợp các file lại với nhau
var merge = require('merge-stream');  // Dùng để kết hợp nhiều stream lại với nhau
const del = require('del');  // Dùng để xóa các file/thư mục

// Task để xóa các file trong thư mục vendors
gulp.task('clean:vendors', function () {
    return del([
      './assets/vendors/**/*'  // Xóa tất cả các file trong thư mục ./assets/vendors/
    ]);
});

/* Xây dựng các script vendor cần thiết cho việc render template cơ bản */
gulp.task('buildBaseVendorScripts', function() {
    return gulp.src([
        './node_modules/jquery/dist/jquery.min.js',  // Chọn file jQuery
        // './node_modules/popper.js/dist/umd/popper.min.js',  // Popper.js (bình luận tạm thời)
        './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',  // Bootstrap JS
        './node_modules/perfect-scrollbar/dist/perfect-scrollbar.min.js'  // Perfect Scrollbar JS
    ])
      .pipe(concat('vendor.bundle.base.js'))  // Kết hợp các file JS lại thành 1 file
      .pipe(gulp.dest('./assets/vendors/js'));  // Lưu kết quả vào thư mục ./assets/vendors/js
});

/* Xây dựng các style vendor cần thiết cho việc render template cơ bản */
gulp.task('buildBaseVendorStyles', function() {
    return gulp.src(['./node_modules/perfect-scrollbar/css/perfect-scrollbar.css'])  // Chọn file CSS cho Perfect Scrollbar
      .pipe(concat('vendor.bundle.base.css'))  // Kết hợp các file CSS lại thành 1 file
      .pipe(gulp.dest('./assets/vendors/css'));  // Lưu kết quả vào thư mục ./assets/vendors/css
});

/* Xây dựng các script vendor cho addons (tùy chọn) */
gulp.task('buildOptionalVendorScripts', function() {
    var aScript1 = gulp.src(['node_modules/chart.js/dist/Chart.min.js'])  // Chọn file Chart.js
        .pipe(gulp.dest('./assets/vendors/chart.js'));  // Lưu vào thư mục ./assets/vendors/chart.js
    return merge(aScript1);  // Trả về kết quả merge nếu có nhiều stream
});

/* Xây dựng các style vendor cho addons (tùy chọn) */
gulp.task('buildOptionalVendorStyles', function() {
    var aStyle1 = gulp.src(['./node_modules/@mdi/font/css/materialdesignicons.min.css'])  // Chọn file CSS cho Material Design Icons
        .pipe(gulp.dest('./assets/vendors/mdi/css'));  // Lưu vào thư mục ./assets/vendors/mdi/css
    var aStyle2 = gulp.src(['./node_modules/@mdi/font/fonts/*'])  // Chọn các font của Material Design Icons
        .pipe(gulp.dest('./assets/vendors/mdi/fonts'));  // Lưu vào thư mục ./assets/vendors/mdi/fonts
    return merge(aStyle1, aStyle2);  // Trả về kết quả merge nếu có nhiều stream
});

// Task sao chép các file map cần thiết
gulp.task('copyMapFiles', function() {
    var map1 = gulp.src('node_modules/bootstrap/dist/js/bootstrap.min.js.map')  // Sao chép file map của Bootstrap
        .pipe(gulp.dest('./assets/vendors/js'));  // Lưu vào thư mục ./assets/vendors/js
    var map2 = gulp.src('node_modules/@mdi/font/css/materialdesignicons.min.css.map')  // Sao chép file map của Material Design Icons
        .pipe(gulp.dest('./assets/vendors/mdi/css'));  // Lưu vào thư mục ./assets/vendors/mdi/css
    return merge(map1, map2);  // Trả về kết quả merge nếu có nhiều stream
});

/* Task chuỗi để xây dựng các script và style vendor */
gulp.task('bundleVendors', gulp.series('clean:vendors', 'buildBaseVendorStyles','buildBaseVendorScripts', 'buildOptionalVendorStyles', 'buildOptionalVendorScripts', 'copyMapFiles'));
// Chạy lần lượt các task sau:
// 1. clean:vendors - xóa các file trong thư mục vendors
// 2. buildBaseVendorStyles - xây dựng các base vendor styles
// 3. buildBaseVendorScripts - xây dựng các base vendor scripts
// 4. buildOptionalVendorStyles - xây dựng các optional vendor styles
// 5. buildOptionalVendorScripts - xây dựng các optional vendor scripts
// 6. copyMapFiles - sao chép các file map cần thiết
