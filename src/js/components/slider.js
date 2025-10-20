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
    loop: true,
    breakpoints: {
      320: {
        slidesPerView: "auto",
        spaceBetween: 30,
      },
      577: {
        effect: "fade",
        fadeEffect: {
          crossFade: true,
        },
      },
    },
  });

  function clearActive() {
    stepsTabs.forEach((tab) => {
      tab.classList.remove("active");
      tab.querySelector(".steps__tab-desc").style.maxHeight = null;
    });
  }

  function setActiveTabByIndex(index) {
    if (!stepsTabs.length) return;
    const realIndex = Math.max(0, Math.min(index, stepsTabs.length - 1));
    const tab = stepsTabs[realIndex];
    if (!tab) return;
    clearActive();
    tab.classList.add("active");
    const desc = tab.querySelector(".steps__tab-desc");
    if (desc) desc.style.maxHeight = desc.scrollHeight + "px";
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

  // ===== Автовоспроизведение видео в слайдере шагов =====
  const stepsSliderEl = document.querySelector(".steps__slider");
  let stepsVisible = false;

  function getActiveSlideVideo() {
    const active = stepsSliderEl?.querySelector(".swiper-slide-active");
    return active?.querySelector("video") || null;
  }

  function playActiveSlideVideoMuted() {
    const video = getActiveSlideVideo();
    if (!video) return;
    video.muted = true;
    video.playsInline = true;
    video.play().catch(() => {});
  }

  function pauseAndResetNonActiveVideos() {
    if (!stepsSliderEl) return;
    const activeSlide = stepsSliderEl.querySelector(".swiper-slide-active");
    const allVideos = stepsSliderEl.querySelectorAll("video");
    allVideos.forEach((v) => {
      const isInActive = !!v.closest(".swiper-slide-active");
      if (!isInActive) {
        if (!v.paused) v.pause();
        try {
          v.currentTime = 0;
        } catch (e) {}
        v.removeAttribute("data-playing");
      }
    });
  }

  function restartActiveSlideVideo() {
    const video = getActiveSlideVideo();
    if (!video) return;
    // Перед перезапуском убедимся, что остальные видео остановлены
    pauseAndResetNonActiveVideos();
    try {
      video.currentTime = 0;
    } catch (e) {}
    // Автоплей с mute, чтобы не требовать жест
    video.muted = true;
    video.playsInline = true;
    video.play().catch(() => {});
  }

  const visObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        stepsVisible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
        if (stepsVisible) {
          playActiveSlideVideoMuted();
        } else {
          const v = getActiveSlideVideo();
          if (v && !v.paused) v.pause();
        }
      });
    },
    { threshold: [0, 0.2, 0.5, 1] }
  );

  if (stepsSliderEl) visObserver.observe(stepsSliderEl);

  // Экспортируем вспомогательные функции для видео
  window.__stepsAdvance = () => {
    // Переходить всегда по завершению видео, независимо от видимости
    const isLoop = !!(slider && slider.params && slider.params.loop);
    if (isLoop) {
      // Для loop надёжнее использовать slideNext(), корректно перейдёт с последнего на первый
      slider.slideNext();
      return;
    }
    const total = stepsTabs.length || slider.slides.length;
    const currentReal =
      typeof slider.realIndex === "number" ? slider.realIndex : 0;
    const nextReal = total > 0 ? (currentReal + 1) % total : 0;
    slider.slideTo(nextReal);
  };
  window.__stepsPlayActive = () => {
    if (!stepsVisible) return;
    playActiveSlideVideoMuted();
  };

  slider.on("slideChangeTransitionStart", () => {
    // На старте смены — остановить неактивные видео, чтобы избежать каскадных end
    pauseAndResetNonActiveVideos();
  });

  slider.on("slideChangeTransitionEnd", () => {
    // Синхронизируем табы со слайдом
    setActiveTabByIndex(slider.realIndex);
    if (!stepsVisible) return;
    restartActiveSlideVideo();
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
