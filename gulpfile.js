'use strict'; // Kích hoạt chế độ nghiêm ngặt (strict mode) trong JavaScript
               // Điều này giúp ngăn chặn các lỗi phổ biến, buộc tuân thủ cú pháp chặt chẽ hơn,
               // như việc khai báo biến trước khi sử dụng, tránh ghi đè các từ khóa mặc định.

var gulp = require('gulp'); 
// Gulp là một công cụ tự động hóa giúp xử lý các tác vụ như biên dịch, nén file, v.v.

var requireDir = require('require-dir'); 
// require-dir giúp tự động tải toàn bộ các module hoặc file từ một thư mục cụ thể.

requireDir('gulp-tasks'); 
// Dòng này sẽ tìm và nạp tất cả các file trong thư mục `gulp-tasks` để sử dụng trong gulp.

gulp.paths = {
    dist: 'dist', 
    // Định nghĩa một đường dẫn mặc định, trong trường hợp này là `dist` (thư mục chứa file đã được build).
};

var paths = gulp.paths; 
// Gán giá trị từ `gulp.paths` vào một biến `paths` để tiện sử dụng trong các task.

gulp.task('default', gulp.series('serve')); 
// Định nghĩa task mặc định của Gulp, khi bạn chạy lệnh `gulp` trong terminal.
// Task này sử dụng `gulp.series` để chạy task `serve` theo trình tự.
