import { Swiper } from "swiper";
import { FreeMode, Mousewheel, Navigation, Pagination } from "swiper/modules";

Swiper.use([Navigation, Mousewheel, Pagination, FreeMode]);

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
