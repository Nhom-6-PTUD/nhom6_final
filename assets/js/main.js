/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById("nav-menu"),
  navToggle = document.getElementById("nav-toggle"),
  navClose = document.getElementById("nav-close");

/*===== Menu Show =====*/
/* Validate if constant exists */
if (navToggle) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.add("show-menu");
  });
}

/*===== Hide Show =====*/
/* Validate if constant exists */
if (navClose) {
  navClose.addEventListener("click", () => {
    navMenu.classList.remove("show-menu");
  });
}

/*=============== IMAGE GALLERY ===============*/
function imgGallery() {
  const mainImg = document.querySelector(".details__img"),
    smallImg = document.querySelectorAll(".details__small-img");

  smallImg.forEach((img) => {
    img.addEventListener("click", function () {
      mainImg.src = this.src;
    });
  });
}

imgGallery();

/*=============== SWIPER CATEGORIES ===============*/
let swiperCategories = new Swiper(".categories__container", {
  spaceBetween: 24,
  loop: true,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },

  breakpoints: {
    350: {
      slidesPerView: 2,
      spaceBetween: 24,
    },
    768: {
      slidesPerView: 3,
      spaceBetween: 24,
    },
    992: {
      slidesPerView: 4,
      spaceBetween: 24,
    },
    1200: {
      slidesPerView: 5,
      spaceBetween: 24,
    },
    1400: {
      slidesPerView: 6,
      spaceBetween: 24,
    },
  },
});

/*=============== SWIPER PRODUCTS ===============*/
let swiperProducts = new Swiper(".new__container", {
  spaceBetween: 24,
  loop: true,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },

  breakpoints: {
    768: {
      slidesPerView: 2,
      spaceBetween: 24,
    },
    992: {
      slidesPerView: 4,
      spaceBetween: 24,
    },
    1400: {
      slidesPerView: 4,
      spaceBetween: 24,
    },
  },
});

/*=============== PRODUCTS TABS ===============*/
const tabs = document.querySelectorAll("[data-target]"),
  tabsContents = document.querySelectorAll("[content]");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = document.querySelector(tab.dataset.target);

    tabsContents.forEach((tabsContent) => {
      tabsContent.classList.remove("active-tab");
    });

    target.classList.add("active-tab");

    tabs.forEach((tab) => {
      tab.classList.remove("active-tab");
    });

    tab.classList.add("active-tab");
  });
});

/*=============== Cập nhật số lượt đánh giá ===============*/
document.addEventListener("DOMContentLoaded", function () {
  // Lấy số lượt đánh giá từ tab "Đánh Giá"
  const reviewTab = document.querySelector(".detail__tab[data-target='#reviews']");
  const reviewCount = reviewTab.textContent.match(/\d+/); // Lấy số đầu tiên trong chuỗi

  // Cập nhật số lượt đánh giá trong phần thông tin sản phẩm
  const productReviewCount = document.querySelector(".details__rating .review-count");
  if (reviewCount && productReviewCount) {
    productReviewCount.textContent = `(${reviewCount[0]} đánh giá)`;
  }
});

/*=============== Khi nhấp vào số lượng đánh giá sẽ tự động cuộn đến tab đánh giá ===============*/
document.addEventListener("DOMContentLoaded", function () {
  // Lấy liên kết "Số lượt đánh giá"
  const reviewLink = document.querySelector(".review-count");
  const reviewsTab = document.querySelector(".detail__tab[data-target='#reviews']");
  const tabsContainer = document.querySelector(".detail__tabs"); // Phần chứa các tab

  reviewLink.addEventListener("click", function (event) {
    event.preventDefault(); // Ngăn hành động mặc định (chuyển hướng)

    // Kích hoạt tab "Đánh Giá"
    document.querySelector(".detail__tab.active-tab")?.classList.remove("active-tab");
    reviewsTab.classList.add("active-tab");

    // Ẩn nội dung tab khác và hiển thị nội dung "Đánh Giá"
    document.querySelector(".details__tab-content.active-tab")?.classList.remove("active-tab");
    document.querySelector("#reviews").classList.add("active-tab");

    // Cuộn đến phần tabsContainer
    tabsContainer.scrollIntoView({ behavior: "smooth" });
  });
});

/*=============== Khi nhấp vào sao đánh giá sẽ tự động cuộn đến mục thêm đánh giá ===============*/
document.addEventListener("DOMContentLoaded", function () {
  // Lấy danh sách ngôi sao
  const ratingStars = document.querySelectorAll(".details__rating .star");
  const reviewsTab = document.querySelector(".detail__tab[data-target='#reviews']");
  const reviewForm = document.querySelector(".review__form");

  ratingStars.forEach((star) => {
    star.addEventListener("click", function () {
      // Kích hoạt tab "Đánh Giá"
      document.querySelector(".detail__tab.active-tab")?.classList.remove("active-tab");
      reviewsTab.classList.add("active-tab");

      // Ẩn nội dung tab khác và hiển thị tab "Đánh Giá"
      document.querySelector(".details__tab-content.active-tab")?.classList.remove("active-tab");
      document.querySelector("#reviews").classList.add("active-tab");

      // Cuộn mượt đến phần "Thêm đánh giá"
      reviewForm.scrollIntoView({ behavior: "smooth" });
    });
  });
});

/*=============== Thêm đánh giá sản phẩm ===============*/
document.addEventListener("DOMContentLoaded", function () {
  const stars = document.querySelectorAll(".rating__star__form .star");  // Tất cả các ngôi sao
  const reviewForm = document.querySelector(".review__form form");
  let ratingValue = 0;  // Lưu trữ số sao người dùng chọn

  // Xử lý khi người dùng nhấp vào ngôi sao
  stars.forEach(star => {
    star.addEventListener("click", function () {
      ratingValue = parseInt(this.getAttribute("data-value"));
      highlightStars(ratingValue);  // Làm sáng các sao đã chọn
    });
  });

  // Xử lý khi người dùng hover vào sao (chỉ để thay đổi màu sắc sao)
  stars.forEach(star => {
    star.addEventListener("mouseover", function () {
      const hoverValue = parseInt(this.getAttribute("data-value"));
      highlightStars(hoverValue);  // Làm sáng sao khi hover
    });

    star.addEventListener("mouseout", function () {
      highlightStars(ratingValue);  // Giữ nguyên màu sắc sao đã chọn khi không hover
    });
  });

  // Hàm để làm sáng các sao
  function highlightStars(rating) {
    stars.forEach(star => {
      const starValue = parseInt(star.getAttribute("data-value"));
      if (starValue <= rating) {
        star.style.color = "#ffcc00";  // Màu vàng khi chọn
      } else {
        star.style.color = "#ccc";  // Màu xám khi chưa chọn
      }
    });
  }

  // Xử lý khi gửi form
  reviewForm.addEventListener("submit", function (event) {
    event.preventDefault();  // Ngăn gửi form (để kiểm tra thông tin)
    
    const username = reviewForm.querySelector("input[type='text']").value;
    const reviewText = reviewForm.querySelector("textarea").value;
    
    // Kiểm tra xem người dùng đã chọn sao chưa
    if (ratingValue === 0) {
      alert("Bạn vui lòng chọn số sao!");
      return;
    }

    // Kiểm tra xem các trường còn lại có hợp lệ không
    if (!username || !reviewText) {
      alert("Bạn vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Reset form sau khi gửi
    reviewForm.reset();
    ratingValue = 0;  // Reset ratingValue khi gửi đánh giá
    highlightStars(0);  // Reset các sao về màu xám
    alert("Cảm ơn bạn đã đánh giá!");
  });
});

/*=============== LƯU LỰA CHỌN MÀU CHARM ===============*/
document.addEventListener("DOMContentLoaded", function () {
  const colorLinks = document.querySelectorAll(".color__link");

  // Xóa trạng thái đã lưu khi tải lại trang
  localStorage.removeItem("selectedColor");

  // Xử lý khi chọn màu
  colorLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      // Ngăn trang cuộn lên đầu
      event.preventDefault();

      // Loại bỏ lớp 'active' khỏi tất cả các màu
      colorLinks.forEach((item) => item.classList.remove("active"));

      // Thêm lớp 'active' vào màu được chọn
      this.classList.add("active");

      // Lưu màu đã chọn
      const selectedColor = this.dataset.color || this.style.backgroundColor;
      localStorage.setItem("selectedColor", selectedColor);
      console.log("Selected color:", selectedColor);
    });
  });

  // Tự động áp dụng màu đã lưu khi tải lại trang (nếu cần giữ trạng thái giữa lần tải lại)
  const savedColor = localStorage.getItem("selectedColor");
  if (savedColor) {
    colorLinks.forEach((link) => {
      const color = link.dataset.color || link.style.backgroundColor;
      if (color === savedColor) {
        link.classList.add("active");
      }
    });
  } else {
    // Nếu không lưu trạng thái, xóa lớp 'active' khỏi tất cả các màu
    colorLinks.forEach((item) => item.classList.remove("active"));
  }
});

/*=============== LƯU LỰA CHỌN CHARM HÌNH ===============*/
document.addEventListener("DOMContentLoaded", function () {
  const sizeLinks = document.querySelectorAll(".size__link");

  // Xóa trạng thái đã lưu khi tải lại trang
  localStorage.removeItem("selectedCharm");

  // Xử lý khi chọn charm
  sizeLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      // Ngăn trang cuộn lên đầu
      event.preventDefault();

      // Loại bỏ lớp 'active' khỏi tất cả các charm
      sizeLinks.forEach((item) => item.classList.remove("active"));

      // Thêm lớp 'active' vào charm được chọn
      this.classList.add("active");

      // Lưu charm đã chọn
      const selectedCharm = this.textContent.trim();
      localStorage.setItem("selectedCharm", selectedCharm);
      console.log("Selected charm:", selectedCharm);
    });
  });

  // Tự động áp dụng charm đã lưu khi tải lại trang
  const savedCharm = localStorage.getItem("selectedCharm");
  if (savedCharm) {
    sizeLinks.forEach((link) => {
      if (link.textContent.trim() === savedCharm) {
        link.classList.add("active");
      }
    });
  } else {
    // Nếu không lưu trạng thái, xóa lớp 'active' khỏi tất cả các charm
    sizeLinks.forEach((item) => item.classList.remove("active"));
  }
});

/*=============== Ngăn cuộn trang khi nhấn nút Thêm vào giỏ hàng ===============*/
document.addEventListener("DOMContentLoaded", function () {
  const addToCartButton = document.getElementById("add-to-cart");

  // Ngăn trang cuộn lên đầu khi nhấn nút "Thêm vào giỏ hàng"
  addToCartButton.addEventListener("click", function (event) {
    // Ngừng hành động mặc định (nếu có)
    event.preventDefault();
  });
});
