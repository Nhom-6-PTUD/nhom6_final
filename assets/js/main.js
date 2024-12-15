/*=============== SHOW MENU ===============*/
// Lấy các phần tử DOM theo ID
const navMenu = document.getElementById("nav-menu"),
  navToggle = document.getElementById("nav-toggle"),
  navClose = document.getElementById("nav-close");

/*===== Hiển thị Menu =====*/
// Kiểm tra nếu phần tử `navToggle` tồn tại
if (navToggle) {
  // Thêm sự kiện click để hiển thị menu
  navToggle.addEventListener("click", () => {
    navMenu.classList.add("show-menu"); // Thêm lớp để hiển thị menu
  });
}

/*===== Ẩn Menu =====*/
// Kiểm tra nếu phần tử `navClose` tồn tại
if (navClose) {
  // Thêm sự kiện click để ẩn menu
  navClose.addEventListener("click", () => {
    navMenu.classList.remove("show-menu"); // Xóa lớp để ẩn menu
  });
}

/*=============== GALLERY HÌNH ẢNH ===============*/
// Hàm chức năng cho gallery hình ảnh
function imgGallery() {
  // Lấy hình ảnh chính và tất cả các hình ảnh nhỏ
  const mainImg = document.querySelector(".details__img"),
    smallImg = document.querySelectorAll(".details__small-img");

  // Thêm sự kiện click cho mỗi hình ảnh nhỏ
  smallImg.forEach((img) => {
    img.addEventListener("click", function () {
      mainImg.src = this.src; // Đặt hình ảnh nhỏ làm hình ảnh chính
    });
  });
}

// Gọi hàm để khởi tạo tính năng gallery
imgGallery();

/*=============== SWIPER CATEGORIES ===============*/
// Cấu hình Swiper cho các danh mục sản phẩm
let swiperCategories = new Swiper(".categories__container", {
  spaceBetween: 24, // Khoảng cách giữa các slide
  loop: true, // Cho phép lặp lại slider
  navigation: {
    nextEl: ".swiper-button-next", // Nút chuyển đến slide tiếp theo
    prevEl: ".swiper-button-prev", // Nút chuyển đến slide trước
  },
  breakpoints: {
    350: {
      slidesPerView: 2, // Hiển thị 2 slide cho màn hình nhỏ hơn 350px
      spaceBetween: 24,
    },
    768: {
      slidesPerView: 3, // Hiển thị 3 slide cho màn hình nhỏ hơn 768px
      spaceBetween: 24,
    },
    992: {
      slidesPerView: 4, // Hiển thị 4 slide cho màn hình nhỏ hơn 992px
      spaceBetween: 24,
    },
    1200: {
      slidesPerView: 5, // Hiển thị 5 slide cho màn hình nhỏ hơn 1200px
      spaceBetween: 24,
    },
    1400: {
      slidesPerView: 6, // Hiển thị 6 slide cho màn hình lớn hơn 1400px
      spaceBetween: 24,
    },
  },
});

/*=============== SWIPER PRODUCTS ===============*/
// Cấu hình Swiper cho sản phẩm mới
let swiperProducts = new Swiper(".new__container", {
  spaceBetween: 24, // Khoảng cách giữa các slide
  loop: true, // Cho phép lặp lại slider
  navigation: {
    nextEl: ".swiper-button-next", // Nút chuyển đến slide tiếp theo
    prevEl: ".swiper-button-prev", // Nút chuyển đến slide trước
  },
  breakpoints: {
    768: {
      slidesPerView: 2, // Hiển thị 2 slide cho màn hình nhỏ hơn 768px
      spaceBetween: 24,
    },
    992: {
      slidesPerView: 4, // Hiển thị 4 slide cho màn hình nhỏ hơn 992px
      spaceBetween: 24,
    },
    1400: {
      slidesPerView: 4, // Hiển thị 4 slide cho màn hình lớn hơn 1400px
      spaceBetween: 24,
    },
  },
});

/*=============== PRODUCTS TABS ===============*/
// Lấy tất cả các tab và nội dung của chúng
const tabs = document.querySelectorAll("[data-target]"),
  tabsContents = document.querySelectorAll("[content]");

// Thêm sự kiện click cho mỗi tab
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = document.querySelector(tab.dataset.target); // Lấy nội dung tương ứng với tab

    // Ẩn tất cả nội dung các tab
    tabsContents.forEach((tabsContent) => {
      tabsContent.classList.remove("active-tab"); // Xóa lớp active
    });

    target.classList.add("active-tab"); // Hiển thị nội dung của tab đã chọn

    // Xóa lớp active khỏi tất cả các tab
    tabs.forEach((tab) => {
      tab.classList.remove("active-tab");
    });

    tab.classList.add("active-tab"); // Kích hoạt tab đã chọn
  });
});


/*=============== MẢNG TIN TỨC ===============*/
      let news = document.getElementById('news');
  
      // Mảng các tin tức
      const newsArray = [
        "CHỈ CÒN 2 NGÀY DUY NHẤT - NHANH TAY CHỐT ĐƠN",
        "MIỄN PHÍ VẬN CHUYỂN NỘI THÀNH TP.HCM"
      ];
  
      // Hàm thay đổi tin tức
      let newsIndex = 0;
      function changeNews() {
        // Ẩn tin tức hiện tại với hiệu ứng mờ
        news.classList.add('hidden');
  
        setTimeout(() => {
          // Thay đổi tin tức sau khi mờ đi
          news.textContent = newsArray[newsIndex];
          newsIndex = (newsIndex + 1) % newsArray.length;
  
          // Hiện lại tin tức mới với hiệu ứng mờ
          news.classList.remove('hidden');
        }, 1000); // Chờ 1 giây (thời gian mờ đi) trước khi thay đổi tin tức
      }
  
      // Khởi động interval để thay đổi tin tức
      setInterval(() => {
        changeNews(); // Thay đổi tin tức
      }, 3000); // Thay đổi mỗi 2 giây
