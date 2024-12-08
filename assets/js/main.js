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

/*=============== Số lượt đánh giá ===============*/
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

