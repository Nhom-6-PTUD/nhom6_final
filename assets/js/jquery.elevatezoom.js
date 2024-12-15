/*
 *	jQuery elevateZoom 3.0.8
 *	Demo's and documentation:
 *	www.elevateweb.co.uk/image-zoom
 *
 *	Copyright (c) 2012 Andrew Eades
 *	www.elevateweb.co.uk
 *
 *	Dual licensed under the GPL and MIT licenses.
 *	http://en.wikipedia.org/wiki/MIT_License
 *	http://en.wikipedia.org/wiki/GNU_General_Public_License
 *

/*
 *	jQuery elevateZoom 3.0.3
 *	Demo's and documentation:
 *	www.elevateweb.co.uk/image-zoom
 *
 *	Copyright (c) 2012 Andrew Eades
 *	www.elevateweb.co.uk
 *
 *	Dual licensed under the GPL and MIT licenses.
 *	http://en.wikipedia.org/wiki/MIT_License
 *	http://en.wikipedia.org/wiki/GNU_General_Public_License
 */


// Kiểm tra xem Object.create có phải là một hàm hay không
if (typeof Object.create !== 'function') {
	// Nếu không, tự định nghĩa lại Object.create
	Object.create = function (obj) {
		function F() { }; // Tạo hàm constructor rỗng
		F.prototype = obj; // Gán prototype của hàm này bằng obj
		return new F(); // Trả về một instance mới của F
	};
}

// Định nghĩa một IIFE (Immediate Invoked Function Expression) để tránh xung đột biến toàn cục
(function ($, window, document, undefined) {
	// Đối tượng ElevateZoom chứa các phương thức
	var ElevateZoom = {
		// Hàm khởi tạo
		init: function (options, elem) {
			var self = this;

			self.elem = elem; // Lưu phần tử DOM vào thuộc tính
			self.$elem = $(elem); // Biến jQuery đại diện cho phần tử DOM

			// Lấy URL của ảnh zoom từ thuộc tính data-zoom-image hoặc src
			self.imageSrc = self.$elem.data("zoom-image") ? self.$elem.data("zoom-image") : self.$elem.attr("src");

			// Hợp nhất các tùy chọn mặc định và tùy chọn truyền vào
			self.options = $.extend({}, $.fn.elevateZoom.options, options);

			// Ghi đè cài đặt cho chế độ tint
			if (self.options.tint) {
				self.options.lensColour = "none"; // Màu nền của lens
				self.options.lensOpacity = "1";  // Độ mờ của lens
			}

			// Ghi đè cài đặt cho chế độ zoom "inner"
			if (self.options.zoomType == "inner") {
				self.options.showLens = false; // Tắt lens khi chế độ là "inner"
			}

			// Xóa thuộc tính title và alt của phần tử cha khi hover
			self.$elem.parent().removeAttr('title').removeAttr('alt');

			self.zoomImage = self.imageSrc; // Lưu URL ảnh zoom

			self.refresh(1); // Gọi hàm refresh để khởi động

			// Tạo chức năng chuyển đổi ảnh từ gallery
			$('#' + self.options.gallery + ' a').click(function (e) {
				// Gán class cho ảnh gallery đang hoạt động
				if (self.options.galleryActiveClass) {
					$('#' + self.options.gallery + ' a').removeClass(self.options.galleryActiveClass);
					$(this).addClass(self.options.galleryActiveClass);
				}
				// Ngăn chặn hành vi mặc định của thẻ <a>
				e.preventDefault();

				// Gọi hàm đổi ảnh
				if ($(this).data("zoom-image")) {
					self.zoomImagePre = $(this).data("zoom-image");
				} else {
					self.zoomImagePre = $(this).data("image");
				}
				self.swaptheimage($(this).data("image"), self.zoomImagePre); // Đổi ảnh
				return false;
			});
		},

		refresh: function (length) {
			var self = this;

			setTimeout(function () {
				self.fetch(self.imageSrc);

			}, length || self.options.refresh);
		},

		// Lấy ảnh từ URL và khởi động tính năng zoom
		fetch: function (imgsrc) {
			var self = this;
			var newImg = new Image(); // Tạo một đối tượng ảnh mới
			newImg.onload = function () {
				// Lưu kích thước ảnh lớn để tính toán tỉ lệ
				self.largeWidth = newImg.width;
				self.largeHeight = newImg.height;
				// Sau khi tải xong, bắt đầu chức năng zoom
				self.startZoom();
				self.currentImage = self.imageSrc; // Cập nhật ảnh hiện tại
				// Gọi callback để thông báo ảnh đã được tải
				self.options.onZoomedImageLoaded(self.$elem);
			}
			newImg.src = imgsrc; // Đặt nguồn ảnh (src), phải đặt sau onload
			return;
		},

		startZoom: function () {
			var self = this;

			// Lấy kích thước (chiều rộng và chiều cao) của ảnh không zoom
			self.nzWidth = self.$elem.width();
			self.nzHeight = self.$elem.height();

			// Trạng thái của các thành phần được kích hoạt
			self.isWindowActive = false; // Trạng thái cửa sổ zoom
			self.isLensActive = false;   // Trạng thái lens zoom
			self.isTintActive = false;   // Trạng thái hiệu ứng tint
			self.overWindow = false;     // Kiểm tra chuột có đang nằm trên cửa sổ zoom không

			// Nếu bật chế độ crossfade cho ảnh
			if (self.options.imageCrossfade) {
				// Tạo một bao bọc (wrapper) xung quanh ảnh
				self.zoomWrap = self.$elem.wrap('<div style="height:' + self.nzHeight + 'px;width:' + self.nzWidth + 'px;" class="zoomWrapper" />');
				self.$elem.css('position', 'absolute'); // Thiết lập vị trí của ảnh là tuyệt đối
			}

			self.zoomLock = 1;            // Khóa tính năng zoom (để kiểm soát trạng thái)
			self.scrollingLock = false;   // Trạng thái khóa cuộn
			self.changeBgSize = false;    // Trạng thái thay đổi kích thước nền
			self.currentZoomLevel = self.options.zoomLevel; // Mức độ zoom hiện tại

			// Lấy tọa độ offset của ảnh không zoom trên trang
			self.nzOffset = self.$elem.offset();

			// Tính toán tỉ lệ giữa chiều rộng ảnh lớn và nhỏ
			self.widthRatio = (self.largeWidth / self.currentZoomLevel) / self.nzWidth;
			self.heightRatio = (self.largeHeight / self.currentZoomLevel) / self.nzHeight;

			// Nếu bật chế độ cửa sổ zoom
			if (self.options.zoomType == "window") {
				// Thiết lập các thuộc tính CSS cho cửa sổ zoom
				self.zoomWindowStyle = "overflow: hidden;" // Ẩn nội dung tràn ra ngoài
					+ "background-position: 0px 0px;text-align:center;" // Vị trí nền và căn giữa nội dung
					+ "background-color: " + String(self.options.zoomWindowBgColour) // Màu nền cửa sổ zoom
					+ ";width: " + String(self.options.zoomWindowWidth) + "px;" // Chiều rộng cửa sổ zoom
					+ "height: " + String(self.options.zoomWindowHeight) + "px;" // Chiều cao cửa sổ zoom
					+ "float: left;" // Canh trái
					+ "background-size: " + self.largeWidth / self.currentZoomLevel + "px " + self.largeHeight / self.currentZoomLevel + "px;" // Kích thước nền theo tỉ lệ zoom
					+ "display: none;z-index:100;" // Ẩn cửa sổ ban đầu, đặt z-index để ưu tiên
					+ "border: " + String(self.options.borderSize) + "px solid " + self.options.borderColour + ";" // Đường viền cửa sổ zoom
					+ "background-repeat: no-repeat;" // Không lặp lại nền
					+ "position: absolute;"; // Vị trí tuyệt đối trong bố cục
			}

			// Nếu chế độ zoom là "inner" (zoom toàn bộ ảnh trong khung)
			if (self.options.zoomType == "inner") {
				// Kiểm tra xem ảnh có viền hay không và xử lý bù khoảng cách viền
				var borderWidth = self.$elem.css("border-left-width");

				// Thiết lập CSS cho cửa sổ zoom kiểu "inner"
				self.zoomWindowStyle = "overflow: hidden;" // Ẩn nội dung tràn ra
					+ "margin-left: " + String(borderWidth) + ";" // Căn lề trái theo viền
					+ "margin-top: " + String(borderWidth) + ";" // Căn lề trên theo viền
					+ "background-position: 0px 0px;" // Đặt vị trí nền ban đầu
					+ "width: " + String(self.nzWidth) + "px;" // Chiều rộng cửa sổ zoom
					+ "height: " + String(self.nzHeight) + "px;" // Chiều cao cửa sổ zoom
					+ "float: left;" // Căn trái
					+ "display: none;" // Ẩn cửa sổ ban đầu
					+ "cursor:" + (self.options.cursor) + ";" // Thiết lập con trỏ chuột
					+ "background-repeat: no-repeat;" // Không lặp lại nền
					+ "position: absolute;"; // Vị trí tuyệt đối
			}

			// Thiết lập lens (kính lúp) khi zoom kiểu cửa sổ
			if (self.options.zoomType == "window") {
				// Điều chỉnh lens với ảnh có chiều cao nhỏ hơn cửa sổ zoom
				if (self.nzHeight < self.options.zoomWindowWidth / self.widthRatio) {
					lensHeight = self.nzHeight; // Lens lấy chiều cao của ảnh
				} else {
					lensHeight = String(self.options.zoomWindowHeight / self.heightRatio); // Lens lấy chiều cao theo tỷ lệ
				}
				// Điều chỉnh lens với ảnh có chiều rộng nhỏ hơn cửa sổ zoom
				if (self.largeWidth < self.options.zoomWindowWidth) {
					lensWidth = self.nzWidth; // Lens lấy chiều rộng của ảnh
				} else {
					lensWidth = (self.options.zoomWindowWidth / self.widthRatio); // Lens lấy chiều rộng theo tỷ lệ
				}

				// Thiết lập CSS cho lens
				self.lensStyle = "background-position: 0px 0px;" // Vị trí nền ban đầu
					+ "width: " + String((self.options.zoomWindowWidth) / self.widthRatio) + "px;" // Chiều rộng lens
					+ "height: " + String((self.options.zoomWindowHeight) / self.heightRatio) + "px;" // Chiều cao lens
					+ "float: right;" // Căn phải
					+ "display: none;" // Ẩn lens ban đầu
					+ "overflow: hidden;" // Ẩn nội dung tràn ra
					+ "z-index: 999;" // Ưu tiên hiển thị cao
					+ "-webkit-transform: translateZ(0);" // Tối ưu hiệu năng hiển thị
					+ "opacity:" + (self.options.lensOpacity) + ";" // Độ mờ lens
					+ "filter: alpha(opacity = " + (self.options.lensOpacity * 100) + ");" // Độ mờ lens trên IE
					+ "background-color:" + (self.options.lensColour) + ";" // Màu nền lens
					+ "cursor:" + (self.options.cursor) + ";" // Con trỏ chuột
					+ "border: " + (self.options.lensBorderSize) + "px solid " + (self.options.lensBorderColour) + ";" // Viền lens
					+ "background-repeat: no-repeat;" // Không lặp lại nền
					+ "position: absolute;"; // Vị trí tuyệt đối
			}

			// Thiết lập CSS cho tint (hiệu ứng phủ mờ)
			self.tintStyle = "display: block;" // Hiển thị tint
				+ "position: absolute;" // Vị trí tuyệt đối
				+ "background-color: " + self.options.tintColour + ";" // Màu nền tint
				+ "filter:alpha(opacity=0);" // Độ trong suốt trên IE
				+ "opacity: 0;" // Độ trong suốt ban đầu
				+ "width: " + self.nzWidth + "px;" // Chiều rộng tint
				+ "height: " + self.nzHeight + "px;"; // Chiều cao tint

			// Nếu kiểu zoom là "lens" (zoom bằng kính lúp)
			if (self.options.zoomType == "lens") {
				self.lensStyle = "background-position: 0px 0px;" // Vị trí nền ban đầu
					+ "float: left;" // Căn trái
					+ "display: none;" // Ẩn lens ban đầu
					+ "border: " + String(self.options.borderSize) + "px solid " + self.options.borderColour + ";" // Viền lens
					+ "width:" + String(self.options.lensSize) + "px;" // Chiều rộng lens
					+ "height:" + String(self.options.lensSize) + "px;" // Chiều cao lens
					+ "background-repeat: no-repeat;" // Không lặp lại nền
					+ "position: absolute;"; // Vị trí tuyệt đối
			}

			// Nếu lens có dạng hình tròn
			if (self.options.lensShape == "round") {
				self.lensRound = "border-top-left-radius: " + String(self.options.lensSize / 2 + self.options.borderSize) + "px;" // Góc tròn trên trái
					+ "border-top-right-radius: " + String(self.options.lensSize / 2 + self.options.borderSize) + "px;" // Góc tròn trên phải
					+ "border-bottom-left-radius: " + String(self.options.lensSize / 2 + self.options.borderSize) + "px;" // Góc tròn dưới trái
					+ "border-bottom-right-radius: " + String(self.options.lensSize / 2 + self.options.borderSize) + "px;"; // Góc tròn dưới phải
			}

			// Tạo thẻ chứa zoom
			self.zoomContainer = $('<div class="zoomContainer" style="-webkit-transform: translateZ(0);position:absolute;left:' + self.nzOffset.left + 'px;top:' + self.nzOffset.top + 'px;height:' + self.nzHeight + 'px;width:' + self.nzWidth + 'px;"></div>');
			$('body').append(self.zoomContainer); // Gắn thẻ chứa zoom vào body

			// Nếu bật tùy chọn chứa lens trong khung
			if (self.options.containLensZoom && self.options.zoomType == "lens") {
				self.zoomContainer.css("overflow", "hidden"); // Ẩn nội dung lens tràn ra ngoài
			}

			// Nếu kiểu zoom không phải "inner"
			if (self.options.zoomType != "inner") {
				// Tạo thẻ lens và gắn vào zoomContainer
				self.zoomLens = $("<div class='zoomLens' style='" + self.lensStyle + self.lensRound + "'>&nbsp;</div>")
					.appendTo(self.zoomContainer)
					.click(function () {
						self.$elem.trigger('click'); // Gọi sự kiện click trên ảnh gốc
					});

				// Nếu bật tint
				if (self.options.tint) {
					// Tạo và gắn thẻ tint vào zoomContainer
					self.tintContainer = $('<div/>').addClass('tintContainer');
					self.zoomTint = $("<div class='zoomTint' style='" + self.tintStyle + "'></div>");
					self.zoomLens.wrap(self.tintContainer);
					self.zoomTintcss = self.zoomLens.after(self.zoomTint);

					// Nếu tint bật, thêm ảnh phủ lên tint
					self.zoomTintImage = $('<img style="position: absolute; left: 0px; top: 0px; max-width: none; width: ' + self.nzWidth + 'px; height: ' + self.nzHeight + 'px;" src="' + self.imageSrc + '">')
						.appendTo(self.zoomLens)
						.click(function () {
							self.$elem.trigger('click'); // Gọi sự kiện click trên ảnh gốc
						});
				}
			}

			// Tạo cửa sổ zoom
			if (isNaN(self.options.zoomWindowPosition)) { // Kiểm tra nếu vị trí cửa sổ zoom không phải là số
				// Tạo phần tử DOM cho cửa sổ zoom và gắn vào body
				self.zoomWindow = $("<div style='z-index:999;left:" + (self.windowOffsetLeft) + "px;top:" + (self.windowOffsetTop) + "px;" + self.zoomWindowStyle + "' class='zoomWindow'>&nbsp;</div>")
					.appendTo('body')
					.click(function () { // Gắn sự kiện click vào cửa sổ zoom
						self.$elem.trigger('click'); // Kích hoạt sự kiện click trên ảnh gốc
					});
			} else {
				// Nếu vị trí là số, gắn cửa sổ zoom vào zoomContainer
				self.zoomWindow = $("<div style='z-index:999;left:" + (self.windowOffsetLeft) + "px;top:" + (self.windowOffsetTop) + "px;" + self.zoomWindowStyle + "' class='zoomWindow'>&nbsp;</div>")
					.appendTo(self.zoomContainer)
					.click(function () {
						self.$elem.trigger('click');
					});
			}

			// Tạo container cho cửa sổ zoom
			self.zoomWindowContainer = $('<div/>')
				.addClass('zoomWindowContainer') // Thêm class cho container
				.css("width", self.options.zoomWindowWidth); // Thiết lập chiều rộng cho container
			self.zoomWindow.wrap(self.zoomWindowContainer); // Bao bọc cửa sổ zoom bằng container

			// Cấu hình cho hình ảnh hiển thị trong cửa sổ zoom hoặc lens
			if (self.options.zoomType == "lens") {
				self.zoomLens.css({ backgroundImage: "url('" + self.imageSrc + "')" }); // Gắn ảnh gốc vào lens
			}
			if (self.options.zoomType == "window") {
				self.zoomWindow.css({ backgroundImage: "url('" + self.imageSrc + "')" }); // Gắn ảnh gốc vào cửa sổ zoom
			}
			if (self.options.zoomType == "inner") {
				self.zoomWindow.css({ backgroundImage: "url('" + self.imageSrc + "')" }); // Gắn ảnh gốc vào cửa sổ zoom kiểu inner
			}

			/*-------------------KẾT THÚC TẠO CỬA SỔ ZOOM VÀ LENS-------------------*/

			// Sự kiện chạm (touch events)
			self.$elem.bind('touchmove', function (e) {
				e.preventDefault(); // Ngăn hành động mặc định
				var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]; // Lấy thông tin vị trí chạm
				self.setPosition(touch); // Cập nhật vị trí zoom
			});

			self.zoomContainer.bind('touchmove', function (e) {
				if (self.options.zoomType == "inner") {
					self.showHideWindow("show"); // Hiển thị cửa sổ zoom nếu kiểu zoom là inner
				}
				e.preventDefault();
				var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
				self.setPosition(touch); // Cập nhật vị trí zoom
			});

			self.zoomContainer.bind('touchend', function (e) {
				self.showHideWindow("hide"); // Ẩn cửa sổ zoom
				if (self.options.showLens) { self.showHideLens("hide"); } // Ẩn lens nếu có
				if (self.options.tint && self.options.zoomType != "inner") { self.showHideTint("hide"); } // Ẩn hiệu ứng tint nếu có
			});

			self.$elem.bind('touchend', function (e) {
				self.showHideWindow("hide");
				if (self.options.showLens) { self.showHideLens("hide"); }
				if (self.options.tint && self.options.zoomType != "inner") { self.showHideTint("hide"); }
			});

			if (self.options.showLens) {
				self.zoomLens.bind('touchmove', function (e) {
					e.preventDefault();
					var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
					self.setPosition(touch); // Cập nhật vị trí zoom cho lens
				});

				self.zoomLens.bind('touchend', function (e) {
					self.showHideWindow("hide");
					if (self.options.showLens) { self.showHideLens("hide"); }
					if (self.options.tint && self.options.zoomType != "inner") { self.showHideTint("hide"); }
				});
			}

			// Sự kiện chuột (mouse events)
			self.$elem.bind('mousemove', function (e) {
				if (self.overWindow == false) { self.setElements("show"); } // Hiển thị các phần tử zoom nếu không ở trạng thái overWindow

				// Đảm bảo không cập nhật vị trí khi thay đổi hướng thiết bị
				if (self.lastX !== e.clientX || self.lastY !== e.clientY) {
					self.setPosition(e); // Cập nhật vị trí zoom
					self.currentLoc = e; // Lưu vị trí hiện tại
				}
				self.lastX = e.clientX;
				self.lastY = e.clientY;
			});

			self.zoomContainer.bind('mousemove', function (e) {
				if (self.overWindow == false) { self.setElements("show"); }

				if (self.lastX !== e.clientX || self.lastY !== e.clientY) {
					self.setPosition(e);
					self.currentLoc = e;
				}
				self.lastX = e.clientX;
				self.lastY = e.clientY;
			});

			if (self.options.zoomType != "inner") {
				self.zoomLens.bind('mousemove', function (e) {
					if (self.lastX !== e.clientX || self.lastY !== e.clientY) {
						self.setPosition(e);
						self.currentLoc = e;
					}
					self.lastX = e.clientX;
					self.lastY = e.clientY;
				});
			}

			if (self.options.tint && self.options.zoomType != "inner") {
				self.zoomTint.bind('mousemove', function (e) {
					if (self.lastX !== e.clientX || self.lastY !== e.clientY) {
						self.setPosition(e);
						self.currentLoc = e;
					}
					self.lastX = e.clientX;
					self.lastY = e.clientY;
				});
			}

			if (self.options.zoomType == "inner") {
				self.zoomWindow.bind('mousemove', function (e) {
					if (self.lastX !== e.clientX || self.lastY !== e.clientY) {
						self.setPosition(e);
						self.currentLoc = e;
					}
					self.lastX = e.clientX;
					self.lastY = e.clientY;
				});
			}

			// Sự kiện khi chuột đi vào hoặc rời khỏi các phần tử
			self.zoomContainer.add(self.$elem).mouseenter(function () {
				if (self.overWindow == false) { self.setElements("show"); }
			}).mouseleave(function () {
				if (!self.scrollLock) {
					self.setElements("hide");
					self.options.onDestroy(self.$elem); // Gọi hàm hủy khi rời khỏi
				}
			});

			if (self.options.zoomType != "inner") {
				self.zoomWindow.mouseenter(function () {
					self.overWindow = true;
					self.setElements("hide"); // Ẩn các phần tử khi chuột vào cửa sổ zoom
				}).mouseleave(function () {
					self.overWindow = false;
				});
			}

			// Thiết lập mức zoom ban đầu nếu không phải mặc định
			if (self.options.zoomLevel != 1) {
				// self.changeZoomLevel(self.currentZoomLevel);
			}

			// Thiết lập mức zoom nhỏ nhất
			if (self.options.minZoomLevel) {
				self.minZoomLevel = self.options.minZoomLevel;
			} else {
				self.minZoomLevel = self.options.scrollZoomIncrement * 2;
			}

			// Sự kiện cuộn chuột để thay đổi mức zoom
			if (self.options.scrollZoom) {
				self.zoomContainer.add(self.$elem).bind('mousewheel DOMMouseScroll MozMousePixelScroll', function (e) {
					self.scrollLock = true; // Khóa cuộn khi đang thực hiện
					clearTimeout($.data(this, 'timer'));
					$.data(this, 'timer', setTimeout(function () {
						self.scrollLock = false;
					}, 250));

					var theEvent = e.originalEvent.wheelDelta || e.originalEvent.detail * -1;

					e.stopImmediatePropagation();
					e.stopPropagation();
					e.preventDefault();

					if (theEvent / 120 > 0) { // Cuộn lên
						if (self.currentZoomLevel >= self.minZoomLevel) {
							self.changeZoomLevel(self.currentZoomLevel - self.options.scrollZoomIncrement); // Giảm mức zoom
						}
					} else { // Cuộn xuống
						if (self.options.maxZoomLevel) {
							if (self.currentZoomLevel <= self.options.maxZoomLevel) {
								self.changeZoomLevel(parseFloat(self.currentZoomLevel) + self.options.scrollZoomIncrement); // Tăng mức zoom
							}
						} else {
							self.changeZoomLevel(parseFloat(self.currentZoomLevel) + self.options.scrollZoomIncrement);
						}
					}
					return false;
				});
			}

		},
		// Hàm thiết lập các phần tử hiển thị hoặc ẩn đi
		setElements: function (type) {
			var self = this;
			// Nếu tính năng zoom không được bật thì thoát
			if (!self.options.zoomEnabled) { return false; }

			// Khi cần hiển thị các thành phần
			if (type == "show") {
				if (self.isWindowSet) { // Kiểm tra nếu cửa sổ zoom đã được thiết lập
					if (self.options.zoomType == "inner") { self.showHideWindow("show"); } // Hiển thị cửa sổ zoom kiểu inner
					if (self.options.zoomType == "window") { self.showHideWindow("show"); } // Hiển thị cửa sổ zoom kiểu window
					if (self.options.showLens) { self.showHideLens("show"); } // Hiển thị lens nếu tùy chọn bật
					if (self.options.tint && self.options.zoomType != "inner") {
						self.showHideTint("show"); // Hiển thị hiệu ứng tint nếu được bật
					}
				}
			}

			// Khi cần ẩn các thành phần
			if (type == "hide") {
				if (self.options.zoomType == "window") { self.showHideWindow("hide"); } // Ẩn cửa sổ zoom kiểu window
				if (!self.options.tint) { self.showHideWindow("hide"); } // Ẩn cửa sổ zoom nếu không bật hiệu ứng tint
				if (self.options.showLens) { self.showHideLens("hide"); } // Ẩn lens nếu có
				if (self.options.tint) { self.showHideTint("hide"); } // Ẩn hiệu ứng tint nếu có
			}
		},

		// Hàm thiết lập vị trí của các thành phần zoom
		setPosition: function (e) {
			var self = this;

			// Nếu tính năng zoom không được bật thì thoát
			if (!self.options.zoomEnabled) { return false; }

			// Tính toán lại kích thước và vị trí ảnh mỗi lần gọi để đảm bảo đúng khi ảnh di chuyển
			self.nzHeight = self.$elem.height(); // Chiều cao ảnh gốc
			self.nzWidth = self.$elem.width(); // Chiều rộng ảnh gốc
			self.nzOffset = self.$elem.offset(); // Vị trí ảnh trên trang

			// Cập nhật vị trí hiệu ứng tint nếu được bật
			if (self.options.tint && self.options.zoomType != "inner") {
				self.zoomTint.css({ top: 0 });
				self.zoomTint.css({ left: 0 });
			}

			// Kiểm tra chế độ responsive (tự điều chỉnh kích thước) nếu được bật
			if (self.options.responsive && !self.options.scrollZoom) {
				if (self.options.showLens) {
					// Tính toán kích thước lens dựa trên kích thước cửa sổ zoom
					if (self.nzHeight < self.options.zoomWindowWidth / self.widthRatio) {
						lensHeight = self.nzHeight;
					} else {
						lensHeight = String((self.options.zoomWindowHeight / self.heightRatio));
					}

					if (self.largeWidth < self.options.zoomWindowWidth) {
						lensWidth = self.nzWidth;
					} else {
						lensWidth = (self.options.zoomWindowWidth / self.widthRatio);
					}

					self.widthRatio = self.largeWidth / self.nzWidth; // Tỷ lệ chiều rộng giữa ảnh lớn và ảnh gốc
					self.heightRatio = self.largeHeight / self.nzHeight; // Tỷ lệ chiều cao giữa ảnh lớn và ảnh gốc

					if (self.options.zoomType != "lens") {
						// Kiểm tra nếu lens lớn hơn ảnh gốc thì giới hạn kích thước lens bằng kích thước ảnh
						if (self.nzHeight < self.options.zoomWindowWidth / self.widthRatio) {
							lensHeight = self.nzHeight;
						} else {
							lensHeight = String((self.options.zoomWindowHeight / self.heightRatio));
						}

						if (self.nzWidth < self.options.zoomWindowHeight / self.heightRatio) {
							lensWidth = self.nzWidth;
						} else {
							lensWidth = String((self.options.zoomWindowWidth / self.widthRatio));
						}

						self.zoomLens.css('width', lensWidth); // Cập nhật chiều rộng lens
						self.zoomLens.css('height', lensHeight); // Cập nhật chiều cao lens

						if (self.options.tint) {
							self.zoomTintImage.css('width', self.nzWidth); // Cập nhật chiều rộng ảnh trong hiệu ứng tint
							self.zoomTintImage.css('height', self.nzHeight); // Cập nhật chiều cao ảnh trong hiệu ứng tint
						}
					}

					if (self.options.zoomType == "lens") {
						self.zoomLens.css({ width: String(self.options.lensSize) + 'px', height: String(self.options.lensSize) + 'px' }); // Cập nhật kích thước lens
					}
				}
			}

			// Đặt vị trí của container zoom
			self.zoomContainer.css({ top: self.nzOffset.top });
			self.zoomContainer.css({ left: self.nzOffset.left });

			self.mouseLeft = parseInt(e.pageX - self.nzOffset.left); // Tính tọa độ chuột theo trục X
			self.mouseTop = parseInt(e.pageY - self.nzOffset.top); // Tính tọa độ chuột theo trục Y

			// Tính toán vị trí lens và kiểm tra giới hạn vùng di chuyển
			if (self.options.zoomType == "window") {
				self.Etoppos = (self.mouseTop < (self.zoomLens.height() / 2));
				self.Eboppos = (self.mouseTop > self.nzHeight - (self.zoomLens.height() / 2) - (self.options.lensBorderSize * 2));
				self.Eloppos = (self.mouseLeft < 0 + ((self.zoomLens.width() / 2)));
				self.Eroppos = (self.mouseLeft > (self.nzWidth - (self.zoomLens.width() / 2) - (self.options.lensBorderSize * 2)));
			}

			if (self.options.zoomType == "inner") {
				self.Etoppos = (self.mouseTop < ((self.nzHeight / 2) / self.heightRatio));
				self.Eboppos = (self.mouseTop > (self.nzHeight - ((self.nzHeight / 2) / self.heightRatio)));
				self.Eloppos = (self.mouseLeft < 0 + (((self.nzWidth / 2) / self.widthRatio)));
				self.Eroppos = (self.mouseLeft > (self.nzWidth - (self.nzWidth / 2) / self.widthRatio - (self.options.lensBorderSize * 2)));
			}

			// Ẩn các thành phần zoom nếu chuột vượt khỏi vùng ảnh gốc
			if (self.mouseLeft < 0 || self.mouseTop < 0 || self.mouseLeft > self.nzWidth || self.mouseTop > self.nzHeight) {
				self.setElements("hide");
				return;
			}
			// Tiếp tục xử lý nếu chuột nằm trong vùng hợp lệ
			else {
				if (self.options.showLens) {
					self.lensLeftPos = String(Math.floor(self.mouseLeft - self.zoomLens.width() / 2)); // Tính toán vị trí lens theo trục X
					self.lensTopPos = String(Math.floor(self.mouseTop - self.zoomLens.height() / 2)); // Tính toán vị trí lens theo trục Y
				}

				// Điều chỉnh vị trí lens nếu chuột ở vùng giới hạn
				if (self.Etoppos) { self.lensTopPos = 0; }
				if (self.Eloppos) { self.windowLeftPos = 0; self.lensLeftPos = 0; self.tintpos = 0; }

				if (self.options.zoomType == "window") {
					if (self.Eboppos) {
						self.lensTopPos = Math.max((self.nzHeight) - self.zoomLens.height() - (self.options.lensBorderSize * 2), 0);
					}
					if (self.Eroppos) {
						self.lensLeftPos = (self.nzWidth - (self.zoomLens.width()) - (self.options.lensBorderSize * 2));
					}
				}

				if (self.options.zoomType == "inner") {
					if (self.Eboppos) {
						self.lensTopPos = Math.max(((self.nzHeight) - (self.options.lensBorderSize * 2)), 0);
					}
					if (self.Eroppos) {
						self.lensLeftPos = (self.nzWidth - (self.nzWidth) - (self.options.lensBorderSize * 2));
					}
				}

				// Cập nhật vị trí background của lens
				if (self.options.zoomType == "lens") {
					self.windowLeftPos = String(((e.pageX - self.nzOffset.left) * self.widthRatio - self.zoomLens.width() / 2) * (-1));
					self.windowTopPos = String(((e.pageY - self.nzOffset.top) * self.heightRatio - self.zoomLens.height() / 2) * (-1));

					self.zoomLens.css({ backgroundPosition: self.windowLeftPos + 'px ' + self.windowTopPos + 'px' });


					// Kiểm tra nếu cần thay đổi kích thước background
					if (self.changeBgSize) {

						// Nếu chiều cao ảnh lớn hơn chiều rộng
						if (self.nzHeight > self.nzWidth) {
							// Nếu kiểu zoom là "lens", thay đổi kích thước background cho lens
							if (self.options.zoomType == "lens") {
								self.zoomLens.css({ "background-size": self.largeWidth / self.newvalueheight + 'px ' + self.largeHeight / self.newvalueheight + 'px' });
							}

							// Thay đổi kích thước background cho cửa sổ zoom
							self.zoomWindow.css({ "background-size": self.largeWidth / self.newvalueheight + 'px ' + self.largeHeight / self.newvalueheight + 'px' });
						} else { // Nếu chiều rộng lớn hơn hoặc bằng chiều cao
							// Nếu kiểu zoom là "lens", thay đổi kích thước background cho lens
							if (self.options.zoomType == "lens") {
								self.zoomLens.css({ "background-size": self.largeWidth / self.newvaluewidth + 'px ' + self.largeHeight / self.newvaluewidth + 'px' });
							}
							// Thay đổi kích thước background cho cửa sổ zoom
							self.zoomWindow.css({ "background-size": self.largeWidth / self.newvaluewidth + 'px ' + self.largeHeight / self.newvaluewidth + 'px' });
						}
						// Đặt lại cờ changeBgSize để ngăn việc thay đổi lặp lại
						self.changeBgSize = false;
					}

					// Đặt vị trí cửa sổ zoom
					self.setWindowPostition(e);
				}

				// Nếu bật hiệu ứng tint và kiểu zoom không phải "inner"
				if (self.options.tint && self.options.zoomType != "inner") {
					self.setTintPosition(e); // Đặt vị trí hiệu ứng tint
				}

				// Đặt vị trí background của cửa sổ zoom (kiểu "window")
				if (self.options.zoomType == "window") {
					self.setWindowPostition(e);
				}

				// Đặt vị trí background của cửa sổ zoom (kiểu "inner")
				if (self.options.zoomType == "inner") {
					self.setWindowPostition(e);
				}

				// Nếu hiển thị lens
				if (self.options.showLens) {
					// Nếu cửa sổ zoom toàn chiều rộng và không phải kiểu "lens"
					if (self.fullwidth && self.options.zoomType != "lens") {
						self.lensLeftPos = 0; // Đặt vị trí lens về bên trái
					}

					// Đặt vị trí lens theo tọa độ được tính toán
					self.zoomLens.css({ left: self.lensLeftPos + 'px', top: self.lensTopPos + 'px' });
				}

			} // Kết thúc phần else

		},
		// Hàm hiển thị hoặc ẩn cửa sổ zoom
		showHideWindow: function (change) {
			var self = this;
			if (change == "show") { // Khi cần hiển thị
				if (!self.isWindowActive) { // Kiểm tra nếu cửa sổ zoom chưa được hiển thị
					if (self.options.zoomWindowFadeIn) { // Nếu có hiệu ứng fade in
						self.zoomWindow.stop(true, true, false).fadeIn(self.options.zoomWindowFadeIn);
					} else {
						self.zoomWindow.show(); // Hiển thị ngay lập tức nếu không có hiệu ứng
					}
					self.isWindowActive = true; // Đánh dấu cửa sổ zoom đang hoạt động
				}
			}
			if (change == "hide") { // Khi cần ẩn
				if (self.isWindowActive) { // Kiểm tra nếu cửa sổ zoom đang hiển thị
					if (self.options.zoomWindowFadeOut) { // Nếu có hiệu ứng fade out
						self.zoomWindow.stop(true, true).fadeOut(self.options.zoomWindowFadeOut, function () {
							if (self.loop) {
								// Dừng việc di chuyển cửa sổ zoom khi fade out hoàn tất
								clearInterval(self.loop);
								self.loop = false;
							}
						});
					} else {
						self.zoomWindow.hide(); // Ẩn ngay lập tức nếu không có hiệu ứng
					}
					self.isWindowActive = false; // Đánh dấu cửa sổ zoom không còn hoạt động
				}
			}
		},
		// Hàm hiển thị hoặc ẩn lens
		showHideLens: function (change) {
			var self = this;
			if (change == "show") { // Khi cần hiển thị
				if (!self.isLensActive) { // Kiểm tra nếu lens chưa được hiển thị
					if (self.options.lensFadeIn) { // Nếu có hiệu ứng fade in
						self.zoomLens.stop(true, true, false).fadeIn(self.options.lensFadeIn);
					} else {
						self.zoomLens.show(); // Hiển thị ngay lập tức nếu không có hiệu ứng
					}
					self.isLensActive = true; // Đánh dấu lens đang hoạt động
				}
			}
			if (change == "hide") { // Khi cần ẩn
				if (self.isLensActive) { // Kiểm tra nếu lens đang hiển thị
					if (self.options.lensFadeOut) { // Nếu có hiệu ứng fade out
						self.zoomLens.stop(true, true).fadeOut(self.options.lensFadeOut);
					} else {
						self.zoomLens.hide(); // Ẩn ngay lập tức nếu không có hiệu ứng
					}
					self.isLensActive = false; // Đánh dấu lens không còn hoạt động
				}
			}
		},

		// Hàm hiển thị hoặc ẩn hiệu ứng tint
		showHideTint: function (change) {
			var self = this;
			if (change == "show") { // Khi cần hiển thị
				if (!self.isTintActive) { // Kiểm tra nếu hiệu ứng tint chưa được hiển thị

					if (self.options.zoomTintFadeIn) { // Nếu có hiệu ứng fade in
						self.zoomTint.css({ opacity: self.options.tintOpacity }).animate().stop(true, true).fadeIn("slow");
					} else {
						self.zoomTint.css({ opacity: self.options.tintOpacity }).animate();
						self.zoomTint.show(); // Hiển thị ngay lập tức nếu không có hiệu ứng
					}
					self.isTintActive = true; // Đánh dấu hiệu ứng tint đang hoạt động
				}
			}
			if (change == "hide") { // Khi cần ẩn
				if (self.isTintActive) { // Kiểm tra nếu hiệu ứng tint đang hiển thị

					if (self.options.zoomTintFadeOut) { // Nếu có hiệu ứng fade out
						self.zoomTint.stop(true, true).fadeOut(self.options.zoomTintFadeOut);
					} else {
						self.zoomTint.hide(); // Ẩn ngay lập tức nếu không có hiệu ứng
					}
					self.isTintActive = false; // Đánh dấu hiệu ứng tint không còn hoạt động
				}
			}
		},

		// Hàm đặt vị trí của lens dựa trên sự kiện e
		setLensPostition: function (e) {
			// (Chưa có logic được định nghĩa trong hàm này)
		},

		// Hàm đặt vị trí của cửa sổ zoom dựa trên sự kiện e
		setWindowPostition: function (e) {
			var self = this;

			// Kiểm tra nếu vị trí cửa sổ zoom được thiết lập bằng một số cụ thể
			if (!isNaN(self.options.zoomWindowPosition)) {

				// Thực hiện hành động tùy thuộc vào giá trị của zoomWindowPosition
				switch (self.options.zoomWindowPosition) {
					case 1:
						// Trường hợp 1: Đặt cửa sổ zoom ngay bên phải hình ảnh
						self.windowOffsetTop = (self.options.zoomWindowOffety);
						self.windowOffsetLeft = (+self.nzWidth);
						break;
					case 2:
						// Trường hợp 2: Đặt cửa sổ zoom với chiều cao lớn hơn ảnh (dùng margin dương)
						if (self.options.zoomWindowHeight > self.nzHeight) {
							self.windowOffsetTop = ((self.options.zoomWindowHeight / 2) - (self.nzHeight / 2)) * (-1);
							self.windowOffsetLeft = (self.nzWidth);
						} else {
							// Nếu không có margin dương, không thực hiện gì thêm
						}
						break;
					case 3:
						// Trường hợp 3: Đặt cửa sổ zoom bên phải dưới hình ảnh
						self.windowOffsetTop = (self.nzHeight - self.zoomWindow.height() - (self.options.borderSize * 2));
						self.windowOffsetLeft = (self.nzWidth);
						break;
					case 4:
						// Trường hợp 4: Đặt cửa sổ zoom ngay bên dưới hình ảnh
						self.windowOffsetTop = (self.nzHeight);
						self.windowOffsetLeft = (self.nzWidth);
						break;
					case 5:
						// Trường hợp 5: Đặt cửa sổ zoom bên dưới, phía phải hình ảnh
						self.windowOffsetTop = (self.nzHeight);
						self.windowOffsetLeft = (self.nzWidth - self.zoomWindow.width() - (self.options.borderSize * 2));
						break;
					case 6:
						// Trường hợp 6: Đặt cửa sổ zoom với chiều rộng lớn hơn hình ảnh (dùng margin dương)
						if (self.options.zoomWindowHeight > self.nzHeight) {
							self.windowOffsetTop = (self.nzHeight);
							self.windowOffsetLeft = ((self.options.zoomWindowWidth / 2) - (self.nzWidth / 2) + (self.options.borderSize * 2)) * (-1);
						} else {
							// Nếu không có margin dương, không thực hiện gì thêm
						}
						break;
					case 7:
						// Trường hợp 7: Đặt cửa sổ zoom ngay dưới, căn lề trái
						self.windowOffsetTop = (self.nzHeight);
						self.windowOffsetLeft = 0;
						break;
					case 8:
						// Trường hợp 8: Đặt cửa sổ zoom ngay dưới, phía trái hình ảnh
						self.windowOffsetTop = (self.nzHeight);
						self.windowOffsetLeft = (self.zoomWindow.width() + (self.options.borderSize * 2)) * (-1);
						break;
					case 9:
						// Trường hợp 9: Đặt cửa sổ zoom phía dưới bên trái, lệch theo chiều cao
						self.windowOffsetTop = (self.nzHeight - self.zoomWindow.height() - (self.options.borderSize * 2));
						self.windowOffsetLeft = (self.zoomWindow.width() + (self.options.borderSize * 2)) * (-1);
						break;
					case 10:
						// Trường hợp 10: Cửa sổ zoom cao hơn hình ảnh, đặt bên trái
						if (self.options.zoomWindowHeight > self.nzHeight) {
							self.windowOffsetTop = ((self.options.zoomWindowHeight / 2) - (self.nzHeight / 2)) * (-1);
							self.windowOffsetLeft = (self.zoomWindow.width() + (self.options.borderSize * 2)) * (-1);
						} else {
							// Nếu không có margin dương, không thực hiện gì thêm
						}
						break;
					case 11:
						// Trường hợp 11: Cửa sổ zoom đặt bên trái, với offset Y cụ thể
						self.windowOffsetTop = (self.options.zoomWindowOffety);
						self.windowOffsetLeft = (self.zoomWindow.width() + (self.options.borderSize * 2)) * (-1);
						break;
					case 12:
						// Trường hợp 12: Cửa sổ zoom ở phía trên bên trái ảnh
						self.windowOffsetTop = (self.zoomWindow.height() + (self.options.borderSize * 2)) * (-1);
						self.windowOffsetLeft = (self.zoomWindow.width() + (self.options.borderSize * 2)) * (-1);
						break;
					case 13:
						// Trường hợp 13: Cửa sổ zoom ở phía trên, căn lề trái
						self.windowOffsetTop = (self.zoomWindow.height() + (self.options.borderSize * 2)) * (-1);
						self.windowOffsetLeft = (0);
						break;
					case 14:
						// Trường hợp 14: Cửa sổ zoom cao hơn ảnh, đặt phía trên căn giữa
						if (self.options.zoomWindowHeight > self.nzHeight) {
							self.windowOffsetTop = (self.zoomWindow.height() + (self.options.borderSize * 2)) * (-1);
							self.windowOffsetLeft = ((self.options.zoomWindowWidth / 2) - (self.nzWidth / 2) + (self.options.borderSize * 2)) * (-1);
						} else {
							// Nếu không có margin dương, không thực hiện gì thêm
						}
						break;
					case 15:
						// Trường hợp 15: Cửa sổ zoom phía trên bên phải ảnh
						self.windowOffsetTop = (self.zoomWindow.height() + (self.options.borderSize * 2)) * (-1);
						self.windowOffsetLeft = (self.nzWidth - self.zoomWindow.width() - (self.options.borderSize * 2));
						break;
					case 16:
						// Trường hợp 16: Cửa sổ zoom phía trên ngay bên phải ảnh
						self.windowOffsetTop = (self.zoomWindow.height() + (self.options.borderSize * 2)) * (-1);
						self.windowOffsetLeft = (self.nzWidth);
						break;
					default:
						// Mặc định: Cửa sổ zoom ngay bên phải hình ảnh
						self.windowOffsetTop = (self.options.zoomWindowOffety);
						self.windowOffsetLeft = (self.nzWidth);
				}
			}
			else {
				// Kiểm tra nếu có thể xác định vị trí trong một class, giả sử bất kỳ chuỗi nào được truyền vào
				self.externalContainer = $('#' + self.options.zoomWindowPosition); // Lấy đối tượng container bên ngoài (dựa trên tên class/id)
				self.externalContainerWidth = self.externalContainer.width(); // Lấy chiều rộng của container bên ngoài
				self.externalContainerHeight = self.externalContainer.height(); // Lấy chiều cao của container bên ngoài
				self.externalContainerOffset = self.externalContainer.offset(); // Lấy vị trí offset của container bên ngoài

				self.windowOffsetTop = self.externalContainerOffset.top; // Lưu vị trí top của container vào biến windowOffsetTop
				self.windowOffsetLeft = self.externalContainerOffset.left; // Lưu vị trí left của container vào biến windowOffsetLeft
			}
			self.isWindowSet = true; // Đánh dấu rằng cửa sổ đã được thiết lập
			self.windowOffsetTop = self.windowOffsetTop + self.options.zoomWindowOffety; // Thêm offset từ các tùy chọn vào vị trí top
			self.windowOffsetLeft = self.windowOffsetLeft + self.options.zoomWindowOffetx; // Thêm offset từ các tùy chọn vào vị trí left

			self.zoomWindow.css({ top: self.windowOffsetTop }); // Thiết lập vị trí top cho zoomWindow
			self.zoomWindow.css({ left: self.windowOffsetLeft }); // Thiết lập vị trí left cho zoomWindow

			if (self.options.zoomType == "inner") {
				self.zoomWindow.css({ top: 0 }); // Nếu zoomType là "inner", đặt top của zoomWindow là 0
				self.zoomWindow.css({ left: 0 }); // Nếu zoomType là "inner", đặt left của zoomWindow là 0
			}


			self.windowLeftPos = String(((e.pageX - self.nzOffset.left) * self.widthRatio - self.zoomWindow.width() / 2) * (-1));
			// Tính toán vị trí left cho cửa sổ zoom, điều chỉnh theo tỷ lệ và kích thước của zoom window
			self.windowTopPos = String(((e.pageY - self.nzOffset.top) * self.heightRatio - self.zoomWindow.height() / 2) * (-1));
			// Tính toán vị trí top cho cửa sổ zoom, điều chỉnh theo tỷ lệ và kích thước của zoom window
			if (self.Etoppos) { self.windowTopPos = 0; } // Nếu Etoppos là true, đặt windowTopPos thành 0
			if (self.Eloppos) { self.windowLeftPos = 0; } // Nếu Eloppos là true, đặt windowLeftPos thành 0
			if (self.Eboppos) { self.windowTopPos = (self.largeHeight / self.currentZoomLevel - self.zoomWindow.height()) * (-1); }
			// Nếu Eboppos là true, điều chỉnh windowTopPos theo kích thước lớn của hình ảnh
			if (self.Eroppos) { self.windowLeftPos = ((self.largeWidth / self.currentZoomLevel - self.zoomWindow.width()) * (-1)); }
			// Nếu Eroppos là true, điều chỉnh windowLeftPos theo kích thước lớn của hình ảnh

			// Dừng các chuyển động nhỏ (micro movements)
			if (self.fullheight) {
				self.windowTopPos = 0; // Nếu fullheight là true, đặt windowTopPos thành 0
			}
			if (self.fullwidth) {
				self.windowLeftPos = 0; // Nếu fullwidth là true, đặt windowLeftPos thành 0
			}
			//set the css background position 


			// Thiết lập vị trí background của zoom window
			if (self.options.zoomType == "window" || self.options.zoomType == "inner") {
				if (self.zoomLock == 1) {
					// Nếu zoom bị khóa, xử lý cho các hình ảnh không thể zoom
					if (self.widthRatio <= 1) {
						self.windowLeftPos = 0; // Nếu tỷ lệ chiều rộng nhỏ hơn hoặc bằng 1, đặt left của zoom window thành 0
					}
					if (self.heightRatio <= 1) {
						self.windowTopPos = 0; // Nếu tỷ lệ chiều cao nhỏ hơn hoặc bằng 1, đặt top của zoom window thành 0
					}
				}
				// Điều chỉnh cho các hình ảnh nhỏ hơn chiều cao của cửa sổ zoom
				if (self.options.zoomType == "window") {
					if (self.largeHeight < self.options.zoomWindowHeight) {
						self.windowTopPos = 0; // Nếu chiều cao hình ảnh nhỏ hơn chiều cao của zoom window, đặt top của zoom window thành 0
					}
					if (self.largeWidth < self.options.zoomWindowWidth) {
						self.windowLeftPos = 0; // Nếu chiều rộng hình ảnh nhỏ hơn chiều rộng của zoom window, đặt left của zoom window thành 0
					}
				}

				// Thiết lập vị trí background cho zoom window
				if (self.options.easing) {
					// Nếu easing được kích hoạt, tạo hiệu ứng easing khi di chuyển
					if (!self.xp) { self.xp = 0; } // Nếu xp chưa được xác định, gán giá trị mặc định là 0
					if (!self.yp) { self.yp = 0; } // Nếu yp chưa được xác định, gán giá trị mặc định là 0
					if (!self.loop) {
						self.loop = setInterval(function () {
							// Dùng nghịch lý Zeno để di chuyển một cách mượt mà
							self.xp += (self.windowLeftPos - self.xp) / self.options.easingAmount;
							self.yp += (self.windowTopPos - self.yp) / self.options.easingAmount;

							if (self.scrollingLock) {
								clearInterval(self.loop); // Dừng vòng lặp khi scrollingLock là true
								self.xp = self.windowLeftPos; // Đặt xp bằng windowLeftPos
								self.yp = self.windowTopPos; // Đặt yp bằng windowTopPos

								// Tính toán lại các giá trị xp và yp
								self.xp = ((e.pageX - self.nzOffset.left) * self.widthRatio - self.zoomWindow.width() / 2) * (-1);
								self.yp = (((e.pageY - self.nzOffset.top) * self.heightRatio - self.zoomWindow.height() / 2) * (-1));


								// Cập nhật kích thước background khi thay đổi
								if (self.changeBgSize) {
									if (self.nzHeight > self.nzWidth) {
										if (self.options.zoomType == "lens") {
											self.zoomLens.css({ "background-size": self.largeWidth / self.newvalueheight + 'px ' + self.largeHeight / self.newvalueheight + 'px' });
										}
										self.zoomWindow.css({ "background-size": self.largeWidth / self.newvalueheight + 'px ' + self.largeHeight / self.newvalueheight + 'px' });
									}
									else {
										if (self.options.zoomType != "lens") {
											self.zoomLens.css({ "background-size": self.largeWidth / self.newvaluewidth + 'px ' + self.largeHeight / self.newvalueheight + 'px' });
										}
										self.zoomWindow.css({ "background-size": self.largeWidth / self.newvaluewidth + 'px ' + self.largeHeight / self.newvaluewidth + 'px' });
									}


									self.changeBgSize = false; // Đặt changeBgSize thành false, ngừng thay đổi kích thước background
								}

								self.zoomWindow.css({ backgroundPosition: self.windowLeftPos + 'px ' + self.windowTopPos + 'px' });
								// Thiết lập vị trí background của zoom window với giá trị calculated cho windowLeftPos và windowTopPos
								self.scrollingLock = false; // Mở khóa cuộn trang, cho phép tiếp tục cuộn
								self.loop = false; // Dừng vòng lặp

							}
							else if (Math.round(Math.abs(self.xp - self.windowLeftPos) + Math.abs(self.yp - self.windowTopPos)) < 1) {
								// Nếu khoảng cách giữa xp và windowLeftPos, yp và windowTopPos nhỏ hơn 1, dừng chuyển động nhỏ
								clearInterval(self.loop); // Dừng vòng lặp
								self.zoomWindow.css({ backgroundPosition: self.windowLeftPos + 'px ' + self.windowTopPos + 'px' });
								// Cập nhật vị trí background của zoom window
								self.loop = false; // Dừng vòng lặp
							}
							else {
								if (self.changeBgSize) {
									if (self.nzHeight > self.nzWidth) {
										if (self.options.zoomType == "lens") {
											self.zoomLens.css({ "background-size": self.largeWidth / self.newvalueheight + 'px ' + self.largeHeight / self.newvalueheight + 'px' });
											// Nếu zoomType là "lens", điều chỉnh kích thước background của zoomLens theo chiều cao của ảnh
										}
										self.zoomWindow.css({ "background-size": self.largeWidth / self.newvalueheight + 'px ' + self.largeHeight / self.newvalueheight + 'px' });
										// Điều chỉnh kích thước background của zoomWindow theo chiều cao của ảnh
									}
									else {
										if (self.options.zoomType != "lens") {
											self.zoomLens.css({ "background-size": self.largeWidth / self.newvaluewidth + 'px ' + self.largeHeight / self.newvaluewidth + 'px' });
											// Nếu zoomType không phải là "lens", điều chỉnh kích thước background của zoomLens theo chiều rộng của ảnh
										}
										self.zoomWindow.css({ "background-size": self.largeWidth / self.newvaluewidth + 'px ' + self.largeHeight / self.newvaluewidth + 'px' });
										// Điều chỉnh kích thước background của zoomWindow theo chiều rộng của ảnh
									}
									self.changeBgSize = false; // Đặt changeBgSize thành false, ngừng thay đổi kích thước background
								}

								self.zoomWindow.css({ backgroundPosition: self.xp + 'px ' + self.yp + 'px' });
								// Cập nhật vị trí background của zoom window dựa trên xp và yp
							}
						}, 16); // Đặt interval là 16ms, giúp duy trì tốc độ mượt mà của hiệu ứng (khoảng 60fps)
					}
				}
				else {
					if (self.changeBgSize) {
						if (self.nzHeight > self.nzWidth) {
							if (self.options.zoomType == "lens") {
								self.zoomLens.css({ "background-size": self.largeWidth / self.newvalueheight + 'px ' + self.largeHeight / self.newvalueheight + 'px' });
							}
							self.zoomWindow.css({ "background-size": self.largeWidth / self.newvalueheight + 'px ' + self.largeHeight / self.newvalueheight + 'px' });
						}
						else {
							if (self.options.zoomType == "lens") {
								self.zoomLens.css({ "background-size": self.largeWidth / self.newvaluewidth + 'px ' + self.largeHeight / self.newvaluewidth + 'px' });
							}
							if ((self.largeHeight / self.newvaluewidth) < self.options.zoomWindowHeight) {
								self.zoomWindow.css({ "background-size": self.largeWidth / self.newvaluewidth + 'px ' + self.largeHeight / self.newvaluewidth + 'px' });
							}
							else {
								self.zoomWindow.css({ "background-size": self.largeWidth / self.newvalueheight + 'px ' + self.largeHeight / self.newvalueheight + 'px' });
							}
						}
						self.changeBgSize = false; // Đặt changeBgSize thành false, ngừng thay đổi kích thước background
					}

					self.zoomWindow.css({ backgroundPosition: self.windowLeftPos + 'px ' + self.windowTopPos + 'px' });
					// Cập nhật vị trí background của zoom window với windowLeftPos và windowTopPos
				}
			}
		},
		setTintPosition: function (e) {
			var self = this; // Lưu đối tượng hiện tại vào biến self để sử dụng trong các hàm callback
			self.nzOffset = self.$elem.offset(); // Lấy vị trí của phần tử gốc (thường là ảnh nhỏ) trên trang
			self.tintpos = String(((e.pageX - self.nzOffset.left) - (self.zoomLens.width() / 2)) * (-1));
			// Tính toán vị trí ngang của kính phóng (zoom lens) dựa trên sự kiện chuột (e.pageX) và offset của phần tử
			self.tintposy = String(((e.pageY - self.nzOffset.top) - self.zoomLens.height() / 2) * (-1));
			// Tính toán vị trí dọc của kính phóng (zoom lens) dựa trên sự kiện chuột (e.pageY) và offset của phần tử

			if (self.Etoppos) {
				self.tintposy = 0; // Nếu Etoppos là true, đặt vị trí dọc tint position = 0
			}
			if (self.Eloppos) {
				self.tintpos = 0; // Nếu Eloppos là true, đặt vị trí ngang tint position = 0
			}
			if (self.Eboppos) {
				self.tintposy = (self.nzHeight - self.zoomLens.height() - (self.options.lensBorderSize * 2)) * (-1);
				// Nếu Eboppos là true, tính toán vị trí dọc sao cho kính phóng không vượt quá chiều cao ảnh nhỏ
			}
			if (self.Eroppos) {
				self.tintpos = ((self.nzWidth - self.zoomLens.width() - (self.options.lensBorderSize * 2)) * (-1));
				// Nếu Eroppos là true, tính toán vị trí ngang sao cho kính phóng không vượt quá chiều rộng ảnh nhỏ
			}

			if (self.options.tint) {
				// Nếu tùy chọn tint được bật, di chuyển ảnh tint theo vị trí mới
				if (self.fullheight) {
					self.tintposy = 0; // Nếu fullheight là true, đặt tintposy = 0
				}
				if (self.fullwidth) {
					self.tintpos = 0; // Nếu fullwidth là true, đặt tintpos = 0
				}
				self.zoomTintImage.css({ 'left': self.tintpos + 'px' }); // Cập nhật vị trí ngang của ảnh tint
				self.zoomTintImage.css({ 'top': self.tintposy + 'px' }); // Cập nhật vị trí dọc của ảnh tint
			}
		},

		swaptheimage: function (smallimage, largeimage) {
			var self = this; // Lưu đối tượng hiện tại vào biến self để sử dụng trong các hàm callback
			var newImg = new Image(); // Tạo một đối tượng Image mới

			if (self.options.loadingIcon) {
				// Nếu có biểu tượng đang tải (loadingIcon), hiển thị nó
				self.spinner = $('<div style="background: url(\'' + self.options.loadingIcon + '\') no-repeat center;height:' + self.nzHeight + 'px;width:' + self.nzWidth + 'px;z-index: 2000;position: absolute; background-position: center center;"></div>');
				self.$elem.after(self.spinner); // Đặt spinner (biểu tượng tải) sau phần tử ảnh gốc
			}

			self.options.onImageSwap(self.$elem); // Gọi callback khi bắt đầu thay đổi ảnh

			newImg.onload = function () {
				self.largeWidth = newImg.width; // Lưu chiều rộng của ảnh lớn vào largeWidth
				self.largeHeight = newImg.height; // Lưu chiều cao của ảnh lớn vào largeHeight
				self.zoomImage = largeimage; // Lưu đường dẫn ảnh lớn vào zoomImage
				self.zoomWindow.css({ "background-size": self.largeWidth + 'px ' + self.largeHeight + 'px' });
				// Cập nhật kích thước background của zoomWindow với kích thước của ảnh lớn
				self.swapAction(smallimage, largeimage); // Gọi hàm swapAction để thay đổi ảnh
				return;
			}
			newImg.src = largeimage; // Thiết lập nguồn của ảnh lớn, sẽ kích hoạt sự kiện onload
		},

		swapAction: function (smallimage, largeimage) {
			var self = this; // Lưu đối tượng hiện tại vào biến self để sử dụng trong các hàm callback

			var newImg2 = new Image(); // Tạo một đối tượng Image mới
			newImg2.onload = function () {
				// Khi ảnh nhỏ đã được tải, thực hiện các bước sau
				self.nzHeight = newImg2.height; // Cập nhật chiều cao ảnh nhỏ
				self.nzWidth = newImg2.width; // Cập nhật chiều rộng ảnh nhỏ
				self.options.onImageSwapComplete(self.$elem); // Gọi callback khi việc thay đổi ảnh hoàn tất

				self.doneCallback(); // Gọi callback hoàn thành công việc
				return;
			}

			newImg2.src = smallimage; // Thiết lập nguồn của ảnh nhỏ, sẽ kích hoạt sự kiện onload

			// Đặt lại mức độ phóng đại (zoom level) theo tùy chọn ban đầu
			self.currentZoomLevel = self.options.zoomLevel;
			self.options.maxZoomLevel = false; // Tắt tùy chọn maxZoomLevel

			// Thay đổi ảnh chính
			// self.$elem.attr("src",smallimage); // Nếu cần, thay đổi thuộc tính src của ảnh gốc (bị chú thích)
			// Thay đổi ảnh zoom
			if (self.options.zoomType == "lens") {
				self.zoomLens.css({ backgroundImage: "url('" + largeimage + "')" });
				// Nếu zoomType là "lens", thay đổi background của zoomLens thành ảnh lớn
			}
			if (self.options.zoomType == "window") {
				self.zoomWindow.css({ backgroundImage: "url('" + largeimage + "')" });
				// Nếu zoomType là "window", thay đổi background của zoomWindow thành ảnh lớn
			}
			if (self.options.zoomType == "inner") {
				self.zoomWindow.css({ backgroundImage: "url('" + largeimage + "')" });
				// Nếu zoomType là "inner", thay đổi background của zoomWindow thành ảnh lớn
			}

			self.currentImage = largeimage; // Lưu ảnh lớn hiện tại vào biến currentImage

			if (self.options.imageCrossfade) {
				// Nếu tùy chọn imageCrossfade được bật, thực hiện hiệu ứng chuyển đổi giữa ảnh cũ và ảnh mới
				var oldImg = self.$elem; // Lưu phần tử ảnh nhỏ hiện tại vào biến oldImg
				var newImg = oldImg.clone(); // Tạo một bản sao của ảnh nhỏ hiện tại
				self.$elem.attr("src", smallimage); // Cập nhật ảnh nhỏ thành ảnh mới (smallimage)
				self.$elem.after(newImg); // Chèn bản sao của ảnh nhỏ sau phần tử ảnh nhỏ

				// Thực hiện hiệu ứng mờ cho ảnh mới (newImg)
				newImg.stop(true).fadeOut(self.options.imageCrossfade, function () {
					$(this).remove(); // Sau khi hiệu ứng mờ xong, xóa ảnh mới
				});

				// Cập nhật chiều rộng và chiều cao của ảnh nhỏ nếu cần
				self.$elem.width("auto").removeAttr("width");
				self.$elem.height("auto").removeAttr("height");

				oldImg.fadeIn(self.options.imageCrossfade); // Thực hiện hiệu ứng mờ cho ảnh cũ (oldImg) khi chuyển ảnh

				if (self.options.tint && self.options.zoomType != "inner") {
					// Nếu tùy chọn tint được bật và zoomType không phải là "inner"
					var oldImgTint = self.zoomTintImage; // Lưu ảnh tint hiện tại
					var newImgTint = oldImgTint.clone(); // Tạo một bản sao của ảnh tint
					self.zoomTintImage.attr("src", largeimage); // Cập nhật ảnh tint thành ảnh lớn
					self.zoomTintImage.after(newImgTint); // Chèn bản sao của ảnh tint sau ảnh tint hiện tại

					// Thực hiện hiệu ứng mờ cho ảnh tint mới
					newImgTint.stop(true).fadeOut(self.options.imageCrossfade, function () {
						$(this).remove(); // Sau khi hiệu ứng mờ xong, xóa ảnh tint mới
					});

					oldImgTint.fadeIn(self.options.imageCrossfade); // Thực hiện hiệu ứng mờ cho ảnh tint cũ

					// Cập nhật kích thước của vùng tint (kính phóng) sao cho phù hợp với ảnh nhỏ
					self.zoomTint.css({ height: self.$elem.height() });
					self.zoomTint.css({ width: self.$elem.width() });
				}

				// Cập nhật kích thước của zoom container sao cho phù hợp với ảnh nhỏ
				self.zoomContainer.css("height", self.$elem.height());
				self.zoomContainer.css("width", self.$elem.width());

				if (self.options.zoomType == "inner") {
					// Nếu zoomType là "inner", thay đổi kích thước của zoom window
					if (!self.options.constrainType) {
						self.zoomWrap.parent().css("height", self.$elem.height());
						self.zoomWrap.parent().css("width", self.$elem.width());

						self.zoomWindow.css("height", self.$elem.height());
						self.zoomWindow.css("width", self.$elem.width());
					}
				}

				if (self.options.imageCrossfade) {
					self.zoomWrap.css("height", self.$elem.height());
					self.zoomWrap.css("width", self.$elem.width());
				}
			}
			else {
				// Nếu không sử dụng hiệu ứng crossfade
				self.$elem.attr("src", smallimage); // Chỉ đơn giản thay đổi ảnh nhỏ thành ảnh mới

				if (self.options.tint) {
					// Nếu tùy chọn tint được bật
					self.zoomTintImage.attr("src", largeimage); // Cập nhật ảnh tint thành ảnh lớn
					self.zoomTintImage.attr("height", self.$elem.height()); // Cập nhật chiều cao của ảnh tint
					self.zoomTintImage.css({ height: self.$elem.height() }); // Cập nhật chiều cao của ảnh tint qua CSS
					self.zoomTint.css({ height: self.$elem.height() }); // Cập nhật chiều cao của vùng tint
				}
				// Cập nhật kích thước của zoom container sao cho phù hợp với ảnh nhỏ
				self.zoomContainer.css("height", self.$elem.height());
				self.zoomContainer.css("width", self.$elem.width());

				if (self.options.imageCrossfade) {
					self.zoomWrap.css("height", self.$elem.height());
					self.zoomWrap.css("width", self.$elem.width());
				}
			}
			// Nếu tùy chọn constrainType được bật (giới hạn kích thước ảnh)
			if (self.options.constrainType) {

				// Nếu constrainType là "height" (giới hạn theo chiều cao)
				if (self.options.constrainType == "height") {
					self.zoomContainer.css("height", self.options.constrainSize); // Cập nhật chiều cao của zoom container
					self.zoomContainer.css("width", "auto"); // Chiều rộng tự động

					if (self.options.imageCrossfade) {
						self.zoomWrap.css("height", self.options.constrainSize); // Cập nhật chiều cao của zoom wrap
						self.zoomWrap.css("width", "auto"); // Chiều rộng tự động
						self.constwidth = self.zoomWrap.width(); // Lưu chiều rộng của zoom wrap
					}
					else {
						self.$elem.css("height", self.options.constrainSize); // Cập nhật chiều cao của ảnh nhỏ
						self.$elem.css("width", "auto"); // Chiều rộng tự động
						self.constwidth = self.$elem.width(); // Lưu chiều rộng của ảnh nhỏ
					}

					if (self.options.zoomType == "inner") {
						self.zoomWrap.parent().css("height", self.options.constrainSize); // Cập nhật chiều cao của phần tử cha của zoom wrap
						self.zoomWrap.parent().css("width", self.constwidth); // Cập nhật chiều rộng của phần tử cha của zoom wrap
						self.zoomWindow.css("height", self.options.constrainSize); // Cập nhật chiều cao của zoom window
						self.zoomWindow.css("width", self.constwidth); // Cập nhật chiều rộng của zoom window
					}

					if (self.options.tint) {
						self.tintContainer.css("height", self.options.constrainSize); // Cập nhật chiều cao của tint container
						self.tintContainer.css("width", self.constwidth); // Cập nhật chiều rộng của tint container
						self.zoomTint.css("height", self.options.constrainSize); // Cập nhật chiều cao của vùng tint
						self.zoomTint.css("width", self.constwidth); // Cập nhật chiều rộng của vùng tint
						self.zoomTintImage.css("height", self.options.constrainSize); // Cập nhật chiều cao của ảnh tint
						self.zoomTintImage.css("width", self.constwidth); // Cập nhật chiều rộng của ảnh tint
					}
				}
				// Nếu constrainType là "width" (giới hạn theo chiều rộng)
				if (self.options.constrainType == "width") {
					self.zoomContainer.css("height", "auto"); // Chiều cao tự động
					self.zoomContainer.css("width", self.options.constrainSize); // Cập nhật chiều rộng của zoom container

					if (self.options.imageCrossfade) {
						self.zoomWrap.css("height", "auto"); // Chiều cao tự động
						self.zoomWrap.css("width", self.options.constrainSize); // Cập nhật chiều rộng của zoom wrap
						self.constheight = self.zoomWrap.height(); // Lưu chiều cao của zoom wrap
					}
					else {
						self.$elem.css("height", "auto"); // Chiều cao tự động
						self.$elem.css("width", self.options.constrainSize); // Cập nhật chiều rộng của ảnh nhỏ
						self.constheight = self.$elem.height(); // Lưu chiều cao của ảnh nhỏ
					}
					if (self.options.zoomType == "inner") {
						self.zoomWrap.parent().css("height", self.constheight); // Cập nhật chiều cao của phần tử cha của zoom wrap
						self.zoomWrap.parent().css("width", self.options.constrainSize); // Cập nhật chiều rộng của phần tử cha của zoom wrap
						self.zoomWindow.css("height", self.constheight); // Cập nhật chiều cao của zoom window
						self.zoomWindow.css("width", self.options.constrainSize); // Cập nhật chiều rộng của zoom window
					}

					if (self.options.tint) {
						self.tintContainer.css("height", self.constheight); // Cập nhật chiều cao của tint container
						self.tintContainer.css("width", self.options.constrainSize); // Cập nhật chiều rộng của tint container
						self.zoomTint.css("height", self.constheight); // Cập nhật chiều cao của vùng tint
						self.zoomTint.css("width", self.options.constrainSize); // Cập nhật chiều rộng của vùng tint
						self.zoomTintImage.css("height", self.constheight); // Cập nhật chiều cao của ảnh tint
						self.zoomTintImage.css("width", self.options.constrainSize); // Cập nhật chiều rộng của ảnh tint
					}
				}


			}

		},
		doneCallback: function () {
			var self = this; // Gán giá trị `this` vào `self` để sử dụng trong các callback hàm
			if (self.options.loadingIcon) {
				self.spinner.hide(); // Ẩn biểu tượng loading nếu tùy chọn loadingIcon được bật
			}

			self.nzOffset = self.$elem.offset(); // Lấy vị trí offset của phần tử ảnh
			self.nzWidth = self.$elem.width(); // Lấy chiều rộng của phần tử ảnh
			self.nzHeight = self.$elem.height(); // Lấy chiều cao của phần tử ảnh

			// Đặt lại mức độ zoom về giá trị mặc định
			self.currentZoomLevel = self.options.zoomLevel;

			// Tính tỷ lệ giữa ảnh lớn và ảnh nhỏ theo chiều rộng
			self.widthRatio = self.largeWidth / self.nzWidth;
			// Tính tỷ lệ giữa ảnh lớn và ảnh nhỏ theo chiều cao
			self.heightRatio = self.largeHeight / self.nzHeight;

			// Cần thêm kích thước của kính phóng nếu kiểu zoom là "window"
			if (self.options.zoomType == "window") {
				// Nếu chiều cao ảnh nhỏ nhỏ hơn chiều cao cửa sổ zoom, gán chiều cao của kính phóng là chiều cao ảnh nhỏ
				if (self.nzHeight < self.options.zoomWindowWidth / self.widthRatio) {
					lensHeight = self.nzHeight;
				}
				else {
					lensHeight = String((self.options.zoomWindowHeight / self.heightRatio)) // Tính chiều cao kính phóng
				}

				// Nếu chiều rộng cửa sổ zoom nhỏ hơn chiều rộng cửa sổ zoom, gán chiều rộng kính phóng là chiều rộng ảnh nhỏ
				if (self.options.zoomWindowWidth < self.options.zoomWindowWidth) {
					lensWidth = self.nzWidth;
				}
				else {
					lensWidth = (self.options.zoomWindowWidth / self.widthRatio); // Tính chiều rộng kính phóng
				}

				// Nếu có kính phóng (zoom lens), cập nhật kích thước của kính phóng
				if (self.zoomLens) {
					self.zoomLens.css('width', lensWidth); // Cập nhật chiều rộng kính phóng
					self.zoomLens.css('height', lensHeight); // Cập nhật chiều cao kính phóng
				}
			}
		},

		getCurrentImage: function () {
			var self = this;
			return self.zoomImage; // Trả về ảnh hiện tại đang được zoom
		},
		getGalleryList: function () {
			var self = this;
			// Khởi tạo danh sách gallery rỗng
			self.gallerylist = [];
			if (self.options.gallery) {
				// Nếu có tùy chọn gallery, duyệt qua các liên kết trong gallery và thêm vào danh sách
				$('#' + self.options.gallery + ' a').each(function () {

					var img_src = '';
					// Lấy URL của ảnh zoom nếu có, nếu không lấy URL ảnh thông thường
					if ($(this).data("zoom-image")) {
						img_src = $(this).data("zoom-image");
					}
					else if ($(this).data("image")) {
						img_src = $(this).data("image");
					}
					// Nếu ảnh là ảnh hiện tại, thêm vào đầu danh sách
					if (img_src == self.zoomImage) {
						self.gallerylist.unshift({
							href: '' + img_src + '',
							title: $(this).find('img').attr("title") // Lấy tiêu đề ảnh
						});
					}
					else {
						self.gallerylist.push({
							href: '' + img_src + '',
							title: $(this).find('img').attr("title") // Lấy tiêu đề ảnh
						});
					}


				});
			}
			// Nếu không có gallery, chỉ trả về ảnh hiện tại
			else {
				self.gallerylist.push({
					href: '' + self.zoomImage + '',
					title: $(this).find('img').attr("title")
				});
			}
			return self.gallerylist; // Trả về danh sách gallery
		},
		changeZoomLevel: function (value) {
			var self = this;

			// Đánh dấu việc thay đổi zoom, để có thể điều chỉnh hiệu ứng easing khi đặt vị trí
			self.scrollingLock = true;

			// Làm tròn giá trị zoom xuống 2 chữ số thập phân
			self.newvalue = parseFloat(value).toFixed(2);
			newvalue = parseFloat(value).toFixed(2);

			// Tính chiều cao và chiều rộng tối đa của ảnh lớn dựa trên các tỷ lệ
			maxheightnewvalue = self.largeHeight / ((self.options.zoomWindowHeight / self.nzHeight) * self.nzHeight);
			maxwidthtnewvalue = self.largeWidth / ((self.options.zoomWindowWidth / self.nzWidth) * self.nzWidth);

			// Tính tỷ lệ chiều cao mới khi thay đổi mức độ zoom
			if (self.options.zoomType != "inner") {
				if (maxheightnewvalue <= newvalue) {
					// Nếu chiều cao tối đa nhỏ hơn hoặc bằng mức zoom mới, gán chiều cao tỷ lệ là ảnh lớn chia cho chiều cao tối đa
					self.heightRatio = (self.largeHeight / maxheightnewvalue) / self.nzHeight;
					self.newvalueheight = maxheightnewvalue; // Lưu chiều cao mới
					self.fullheight = true; // Đánh dấu ảnh đã đầy chiều cao
				}

				else {
					// Nếu chiều cao tối đa lớn hơn mức zoom mới, gán tỷ lệ chiều cao theo mức zoom mới
					self.heightRatio = (self.largeHeight / newvalue) / self.nzHeight;
					self.newvalueheight = newvalue; // Lưu chiều cao mới
					self.fullheight = false; // Đánh dấu ảnh chưa đầy chiều cao
				}


				// Tính toán lại tỷ lệ chiều rộng mới
				if (maxwidthtnewvalue <= newvalue) {
					// Nếu chiều rộng tối đa nhỏ hơn hoặc bằng mức zoom mới, tính lại tỷ lệ chiều rộng
					self.widthRatio = (self.largeWidth / maxwidthtnewvalue) / self.nzWidth;
					self.newvaluewidth = maxwidthtnewvalue; // Lưu chiều rộng tối đa
					self.fullwidth = true; // Đánh dấu rằng ảnh đã đạt chiều rộng tối đa
				} else {
					// Nếu chiều rộng tối đa lớn hơn mức zoom mới, tính lại tỷ lệ chiều rộng theo mức zoom mới
					self.widthRatio = (self.largeWidth / newvalue) / self.nzWidth;
					self.newvaluewidth = newvalue; // Lưu chiều rộng mới
					self.fullwidth = false; // Đánh dấu ảnh chưa đạt chiều rộng tối đa
				}

				if (self.options.zoomType == "lens") {
					// Nếu kiểu zoom là "lens" (kính phóng)
					if (maxheightnewvalue <= newvalue) {
						// Nếu chiều cao tối đa nhỏ hơn hoặc bằng mức zoom mới, gán fullwidth và chiều cao tối đa cho kính phóng
						self.fullwidth = true;
						self.newvaluewidth = maxheightnewvalue;
					} else {
						// Nếu chiều cao tối đa lớn hơn mức zoom mới, tính lại tỷ lệ chiều rộng theo mức zoom mới
						self.widthRatio = (self.largeWidth / newvalue) / self.nzWidth;
						self.newvaluewidth = newvalue; // Lưu chiều rộng mới
						self.fullwidth = false; // Đánh dấu ảnh chưa đạt chiều rộng tối đa
					}
				}
			}

			// Kiểu zoom là "inner" (zoom bên trong)
			if (self.options.zoomType == "inner") {
				// Tính tỷ lệ chiều cao và chiều rộng tối đa cho ảnh
				maxheightnewvalue = parseFloat(self.largeHeight / self.nzHeight).toFixed(2);
				maxwidthtnewvalue = parseFloat(self.largeWidth / self.nzWidth).toFixed(2);

				// Nếu mức zoom mới lớn hơn chiều cao tối đa, đặt lại giá trị zoom
				if (newvalue > maxheightnewvalue) {
					newvalue = maxheightnewvalue;
				}
				// Nếu mức zoom mới lớn hơn chiều rộng tối đa, đặt lại giá trị zoom
				if (newvalue > maxwidthtnewvalue) {
					newvalue = maxwidthtnewvalue;
				}

				// Tính toán tỷ lệ chiều cao và chiều rộng mới dựa trên mức zoom
				if (maxheightnewvalue <= newvalue) {
					/// Nếu chiều cao tối đa nhỏ hơn hoặc bằng mức zoom mới, tính lại tỷ lệ chiều cao
					self.heightRatio = (self.largeHeight / newvalue) / self.nzHeight;

					// Nếu mức zoom mới lớn hơn chiều cao tối đa, đặt chiều cao mới bằng chiều cao tối đa
					if (newvalue > maxheightnewvalue) {
						self.newvalueheight = maxheightnewvalue;
					} else {
						self.newvalueheight = newvalue; // Nếu mức zoom mới không lớn hơn chiều cao tối đa, gán chiều cao mới là mức zoom mới
					}
					self.fullheight = true; // Đánh dấu rằng ảnh đã đạt chiều cao tối đa

				}
				else {
					// Nếu chiều cao tối đa lớn hơn mức zoom mới, tính lại tỷ lệ chiều cao với mức zoom mới
					self.heightRatio = (self.largeHeight / newvalue) / self.nzHeight;

					// Nếu mức zoom mới lớn hơn chiều cao tối đa, đặt chiều cao mới bằng chiều cao tối đa
					if (newvalue > maxheightnewvalue) {
						self.newvalueheight = maxheightnewvalue;
					} else {
						self.newvalueheight = newvalue; // Nếu mức zoom mới không lớn hơn chiều cao tối đa, gán chiều cao mới là mức zoom mới
					}
					self.fullheight = false; // Đánh dấu rằng ảnh chưa đạt chiều cao tối đa
				}

				// Kiểm tra chiều rộng tối đa với mức zoom mới
				if (maxwidthtnewvalue <= newvalue) {
					// Nếu chiều rộng tối đa nhỏ hơn hoặc bằng mức zoom mới, tính lại tỷ lệ chiều rộng
					self.widthRatio = (self.largeWidth / newvalue) / self.nzWidth;

					// Nếu mức zoom mới lớn hơn chiều rộng tối đa, đặt chiều rộng mới bằng chiều rộng tối đa
					if (newvalue > maxwidthtnewvalue) {
						self.newvaluewidth = maxwidthtnewvalue;
					} else {
						self.newvaluewidth = newvalue; // Nếu mức zoom mới không lớn hơn chiều rộng tối đa, gán chiều rộng mới là mức zoom mới
					}
					self.fullwidth = true; // Đánh dấu rằng ảnh đã đạt chiều rộng tối đa
				}
				else {
					// Nếu điều kiện trước đó không thỏa mãn, tính toán lại tỷ lệ chiều rộng
					self.widthRatio = (self.largeWidth / newvalue) / self.nzWidth;
					self.newvaluewidth = newvalue; // Cập nhật giá trị chiều rộng mới
					self.fullwidth = false; // Đánh dấu rằng chiều rộng chưa đạt tối đa
				}

			} //end inner
			scrcontinue = false; // Đặt biến scrcontinue là false, ngừng tiếp tục xử lý

			if (self.options.zoomType == "inner") {
				// Kiểm tra nếu loại zoom là "inner"
				if (self.nzWidth >= self.nzHeight) {
					// Nếu chiều rộng ảnh lớn hơn hoặc bằng chiều cao ảnh
					if (self.newvaluewidth <= maxwidthtnewvalue) {
						scrcontinue = true; // Nếu chiều rộng mới nhỏ hơn hoặc bằng chiều rộng tối đa, tiếp tục xử lý
					} else {
						scrcontinue = false; // Nếu chiều rộng mới lớn hơn chiều rộng tối đa, dừng xử lý
						self.fullheight = true; // Đánh dấu rằng chiều cao đã đạt tối đa
						self.fullwidth = true; // Đánh dấu rằng chiều rộng đã đạt tối đa
					}
				}
				if (self.nzHeight > self.nzWidth) {
					// Nếu chiều cao ảnh lớn hơn chiều rộng ảnh
					if (self.newvaluewidth <= maxwidthtnewvalue) {
						scrcontinue = true; // Tiếp tục xử lý nếu chiều rộng mới nhỏ hơn hoặc bằng chiều rộng tối đa
					} else {
						scrcontinue = false; // Dừng xử lý nếu chiều rộng mới lớn hơn chiều rộng tối đa
						self.fullheight = true; // Đánh dấu rằng chiều cao đã đạt tối đa
						self.fullwidth = true; // Đánh dấu rằng chiều rộng đã đạt tối đa
					}
				}
			}

			if (self.options.zoomType != "inner") {
				// Nếu loại zoom không phải là "inner", tiếp tục xử lý
				scrcontinue = true;
			}

			if (scrcontinue) {
				// Nếu scrcontinue được đặt là true, tiếp tục xử lý zoom

				self.zoomLock = 0; // Mở khóa zoom
				self.changeZoom = true; // Đánh dấu là có thay đổi mức zoom

				// Nếu chiều cao của lens nhỏ hơn chiều cao của ảnh
				if (((self.options.zoomWindowHeight) / self.heightRatio) <= self.nzHeight) {
					// Cập nhật mức zoom chiều cao
					self.currentZoomLevel = self.newvalueheight;

					if (self.options.zoomType != "lens" && self.options.zoomType != "inner") {
						self.changeBgSize = true; // Đánh dấu cần thay đổi kích thước nền
						self.zoomLens.css({ height: String((self.options.zoomWindowHeight) / self.heightRatio) + 'px' });
						// Cập nhật chiều cao của lens
					}

					if (self.options.zoomType == "lens" || self.options.zoomType == "inner") {
						self.changeBgSize = true; // Đánh dấu cần thay đổi kích thước nền cho lens hoặc inner zoom
					}
				}

				// Kiểm tra nếu chiều rộng của zoom window nhỏ hơn hoặc bằng chiều rộng ảnh
				if ((self.options.zoomWindowWidth / self.widthRatio) <= self.nzWidth) {
					// Nếu loại zoom không phải là "inner", tính lại mức zoom chiều rộng
					if (self.options.zoomType != "inner") {
						if (self.newvaluewidth > self.newvalueheight) {
							self.currentZoomLevel = self.newvaluewidth;
							// Nếu chiều rộng lớn hơn chiều cao, đặt mức zoom là chiều rộng mới
						}
					}

					if (self.options.zoomType != "lens" && self.options.zoomType != "inner") {
						self.changeBgSize = true; // Đánh dấu cần thay đổi kích thước nền
						self.zoomLens.css({ width: String((self.options.zoomWindowWidth) / self.widthRatio) + 'px' });
						// Cập nhật chiều rộng của lens
					}

					if (self.options.zoomType == "lens" || self.options.zoomType == "inner") {
						self.changeBgSize = true; // Đánh dấu cần thay đổi kích thước nền cho lens hoặc inner zoom
					}
				}

				if (self.options.zoomType == "inner") {
					self.changeBgSize = true; // Đánh dấu thay đổi kích thước nền cho zoom kiểu "inner"

					if (self.nzWidth > self.nzHeight) {
						self.currentZoomLevel = self.newvaluewidth; // Đặt mức zoom là chiều rộng nếu chiều rộng lớn hơn chiều cao
					}
					if (self.nzHeight > self.nzWidth) {
						self.currentZoomLevel = self.newvaluewidth; // Đặt mức zoom là chiều rộng nếu chiều cao lớn hơn chiều rộng
					}
				}
			}      //under

			// Gọi hàm setPosition để thay đổi vị trí của zoom window hoặc lens
			self.setPosition(self.currentLoc);

			// Kết thúc hàm zoom
		},
		// Hàm đóng tất cả các cửa sổ zoom
		closeAll: function () {
			if (self.zoomWindow) { self.zoomWindow.hide(); } // Ẩn cửa sổ zoom
			if (self.zoomLens) { self.zoomLens.hide(); } // Ẩn lens
			if (self.zoomTint) { self.zoomTint.hide(); } // Ẩn lớp phủ mờ
		},

		// Hàm thay đổi trạng thái của zoom
		changeState: function (value) {
			var self = this;
			if (value == 'enable') { self.options.zoomEnabled = true; } // Bật zoom
			if (value == 'disable') { self.options.zoomEnabled = false; } // Tắt zoom
		}

	};

	$.fn.elevateZoom = function (options) {
		// Hàm mở rộng jQuery để thêm chức năng elevateZoom vào các phần tử DOM

		return this.each(function () {
			// Đối với mỗi phần tử trong tập hợp jQuery

			var elevate = Object.create(ElevateZoom);
			// Tạo đối tượng 'elevate' dựa trên đối tượng 'ElevateZoom' (sử dụng phương thức Object.create)

			elevate.init(options, this);
			// Gọi phương thức 'init' của đối tượng 'elevate' để khởi tạo, truyền vào các tùy chọn và phần tử DOM hiện tại

			$.data(this, 'elevateZoom', elevate);
			// Lưu đối tượng 'elevate' vào dữ liệu của phần tử DOM hiện tại dưới tên 'elevateZoom'
		});
	};

	$.fn.elevateZoom.options = {
		// Các tùy chọn mặc định cho plugin elevateZoom

		zoomActivation: "hover", // Kích hoạt zoom khi di chuột (có thể thay bằng click trong phiên bản tiếp theo)
		zoomEnabled: true, // Nếu false, sẽ vô hiệu hóa cửa sổ zoom
		preloading: 1, // Mặc định là tải tất cả hình ảnh, nếu bằng 0, chỉ tải hình ảnh khi kích hoạt
		zoomLevel: 1, // Mức zoom mặc định của hình ảnh
		scrollZoom: false, // Cho phép zoom bằng con lăn chuột (true để kích hoạt)
		scrollZoomIncrement: 0.1, // Bước nhảy cho zoom qua cuộn chuột
		minZoomLevel: false, // Mức zoom tối thiểu (false nếu không giới hạn)
		maxZoomLevel: false, // Mức zoom tối đa (false nếu không giới hạn)
		easing: false, // Nếu true, sử dụng hiệu ứng easing khi thay đổi trạng thái zoom
		easingAmount: 12, // Mức độ easing (nếu có)
		lensSize: 200, // Kích thước của lens (kính phóng đại)
		zoomWindowWidth: 400, // Chiều rộng của cửa sổ zoom
		zoomWindowHeight: 400, // Chiều cao của cửa sổ zoom
		zoomWindowOffetx: 0, // Độ lệch theo chiều ngang của cửa sổ zoom
		zoomWindowOffety: 0, // Độ lệch theo chiều dọc của cửa sổ zoom
		zoomWindowPosition: 1, // Vị trí cửa sổ zoom (1 = trung tâm, các giá trị khác có thể xác định vị trí)
		zoomWindowBgColour: "#fff", // Màu nền của cửa sổ zoom
		lensFadeIn: false, // Nếu true, lens sẽ mờ dần khi xuất hiện
		lensFadeOut: false, // Nếu true, lens sẽ mờ dần khi ẩn đi
		debug: false, // Nếu true, sẽ bật chế độ gỡ lỗi
		zoomWindowFadeIn: false, // Nếu true, cửa sổ zoom sẽ mờ dần khi xuất hiện
		zoomWindowFadeOut: false, // Nếu true, cửa sổ zoom sẽ mờ dần khi ẩn đi
		zoomWindowAlwaysShow: false, // Nếu true, cửa sổ zoom sẽ luôn hiển thị
		zoomTintFadeIn: false, // Nếu true, lớp phủ màu sẽ mờ dần khi xuất hiện
		zoomTintFadeOut: false, // Nếu true, lớp phủ màu sẽ mờ dần khi ẩn đi
		borderSize: 4, // Kích thước viền của lens
		showLens: true, // Hiển thị lens (true để hiển thị)
		borderColour: "#888", // Màu sắc viền của lens
		lensBorderSize: 1, // Kích thước viền của lens
		lensBorderColour: "#000", // Màu sắc viền của lens
		lensShape: "square", // Hình dạng của lens, có thể là "round" (tròn) hoặc "square" (vuông)
		zoomType: "window", // Kiểu zoom, mặc định là cửa sổ (window), có thể là lens (kính phóng đại)
		containLensZoom: false, // Nếu true, zoom lens sẽ bị giới hạn trong phạm vi ảnh
		lensColour: "white", // Màu nền của lens
		lensOpacity: 0.4, // Độ mờ của lens
		lenszoom: false, // Nếu true, lens sẽ zoom vào ảnh
		tint: false, // Nếu true, bật chế độ tint (phủ màu lên ảnh)
		tintColour: "#333", // Màu sắc của lớp tint
		tintOpacity: 0.4, // Độ mờ của lớp tint
		gallery: false, // Nếu true, sử dụng chế độ gallery (thư viện ảnh)
		galleryActiveClass: "zoomGalleryActive", // Lớp CSS cho ảnh đang được chọn trong gallery
		imageCrossfade: false, // Nếu true, sử dụng hiệu ứng fade khi đổi ảnh
		constrainType: false, // Loại giới hạn, có thể là "width" (chiều rộng) hoặc "height" (chiều cao)
		constrainSize: false, // Kích thước cần giới hạn (theo pixel)
		loadingIcon: false, // Đường dẫn tới hình ảnh icon loading (ví dụ: spinner.gif)
		cursor: "default", // Kiểu con trỏ chuột khi người dùng tương tác với ảnh (nên tùy chỉnh theo nhu cầu)
		responsive: true, // Nếu true, kích thước sẽ tự động điều chỉnh theo kích thước màn hình
		onComplete: $.noop, // Hàm callback được gọi khi zoom hoàn tất
		onDestroy: function () { }, // Hàm callback được gọi khi zoom bị hủy
		onZoomedImageLoaded: function () { }, // Hàm callback được gọi khi hình ảnh zoom đã được tải xong
		onImageSwap: $.noop, // Hàm callback được gọi khi ảnh bị thay đổi
		onImageSwapComplete: $.noop // Hàm callback được gọi khi việc thay đổi ảnh hoàn tất
	};

})(jQuery, window, document);