import { Swiper } from "swiper";
import {
  EffectFade,
  FreeMode,
  Mousewheel,
  Navigation,
  Pagination,
} from "swiper/modules";

Swiper.use([Navigation, Mousewheel, Pagination, FreeMode, EffectFade]);

new Swiper(".infra__slider > .swiper", {
  slidesPerView: "auto",
  spaceBetween: 20,

  // Настройки для плавного скролла колесиком мыши
  mousewheel: {
    enabled: true,
    sensitivity: 1, // Чувствительность скролла (чем меньше, тем плавнее)
    eventsTarget: ".infra__slider", // Элемент, на котором работает скролл
    releaseOnEdges: true, // Освобождение скролла на краях
  },

  // Дополнительные настройки для плавности
  speed: 300, // Скорость анимации переходов
  resistance: true, // Сопротивление на краях
  resistanceRatio: 0.85, // Коэффициент сопротивления
});

new Swiper(".more__slider > .swiper", {
  slidesPerView: "auto",
  spaceBetween: 20,

  mousewheel: {
    enabled: true,
    sensitivity: 1, // Чувствительность скролла (чем меньше, тем плавнее)
    eventsTarget: ".more__slider", // Элемент, на котором работает скролл
    releaseOnEdges: true, // Освобождение скролла на краях
  },

  // Дополнительные настройки для плавности
  speed: 300, // Скорость анимации переходов
  resistance: true, // Сопротивление на краях
  resistanceRatio: 0.85, // Коэффициент сопротивления
});

const stepsTabs = document.querySelectorAll(".steps__tab");

if (stepsTabs.length > 0) {
  const slider = new Swiper(".steps__slider > .swiper", {
    slidesPerView: 1,
    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },
  });

  function clearActive() {
    stepsTabs.forEach((tab) => {
      tab.classList.remove("active");
      tab.querySelector(".steps__tab-desc").style.maxHeight = null;
    });
  }
  stepsTabs.forEach((tab, index) => {
    const desc = tab.querySelector(".steps__tab-desc");
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      clearActive();

      tab.classList.add("active");

      if (desc) {
        desc.style.maxHeight = desc.scrollHeight + "px";
      }

      slider.slideTo(index);
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const resizableSwiper = (
    breakpoint,
    swiperClass,
    swiperSettings,
    callback
  ) => {
    let swiper;

    breakpoint = window.matchMedia(breakpoint);

    const enableSwiper = function (className, settings) {
      swiper = new Swiper(className, settings);

      if (callback) {
        callback(swiper);
      }
    };

    const checker = function () {
      if (breakpoint.matches) {
        return enableSwiper(swiperClass, swiperSettings);
      } else {
        if (swiper !== undefined) swiper.destroy(true, true);
        return;
      }
    };

    breakpoint.addEventListener("change", checker);
    checker();
  };

  const someFunc = (instance) => {
    if (instance) {
      instance.on("slideChange", function (e) {
        console.log("*** mySwiper.activeIndex", instance.activeIndex);
      });
    }
  };

  resizableSwiper("(max-width: 576px)", ".kind__slider > .swiper", {
    spaceBetween: 20,
    slidesPerView: "auto",
  });
});
