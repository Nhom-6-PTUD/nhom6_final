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
