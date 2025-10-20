/**
 * Компонент для загрузки и отображения видео из VK сообщества
 * Автоматически обновляет слайдер при получении новых видео
 */

class VKVideosLoader {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      apiUrl: '/vk-videos.php',
      updateInterval: 5 * 60 * 1000, // 5 минут
      maxVideos: 10,
      autoUpdate: true,
      showLoader: true,
      ...options
    };

    this.videos = [];
    this.isLoading = false;
    this.updateTimer = null;

    this.init();
  }

  init() {
    this.loadVideos();

    if (this.options.autoUpdate) {
      this.startAutoUpdate();
    }
  }

  /**
   * Загрузка видео с сервера
   */
  async loadVideos() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.showLoader();

    try {
      const response = await fetch(this.options.apiUrl);
      const data = await response.json();

      if (data.success && data.videos.length > 0) {
        this.videos = data.videos.slice(0, this.options.maxVideos);
        this.renderVideos();
      } else {
        console.warn('VK Videos: Нет доступных видео или ошибка API');
        this.showError(data.error || 'Нет доступных видео');
      }
    } catch (error) {
      console.error('VK Videos: Ошибка загрузки', error);
      this.showError('Ошибка загрузки видео');
    } finally {
      this.isLoading = false;
      this.hideLoader();
    }
  }

  /**
   * Отображение видео в слайдере
   */
  renderVideos() {
    if (!this.container || this.videos.length === 0) return;

    // Находим swiper-wrapper
    const swiperWrapper = this.container.querySelector('.swiper-wrapper');
    if (!swiperWrapper) {
      console.error('VK Videos: Не найден .swiper-wrapper');
      return;
    }

    // Очищаем существующие слайды
    swiperWrapper.innerHTML = '';

    // Создаем новые слайды
    this.videos.forEach((video, index) => {
      const slide = this.createVideoSlide(video, index);
      swiperWrapper.appendChild(slide);
    });

    // Инициализируем или обновляем Swiper
    this.initSwiper();

    console.log(`VK Videos: Загружено ${this.videos.length} видео`);
  }

  /**
   * Создание HTML для слайда с видео
   */
  createVideoSlide(video, index) {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';

    slide.innerHTML = `
      <div class="more__img vk-video-item" data-video-id="${video.id}">
        <div class="vk-video-wrapper">
          <div class="vk-video-preview">
            <img loading="lazy"
                 src="${video.preview}"
                 alt="${video.title}"
                 class="image"
                 width="585"
                 height="593">
            <div class="vk-video-overlay">
              <div class="vk-video-play-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <div class="vk-video-info">
                <div class="vk-video-duration">${video.duration}</div>
                <div class="vk-video-views">${this.formatViews(video.views)}</div>
              </div>
            </div>
          </div>
          <div class="vk-video-details" style="display: none;">
            <h3 class="vk-video-title">${video.title}</h3>
            <p class="vk-video-description">${video.description}</p>
            <div class="vk-video-meta">
              <span class="vk-video-date">${video.date}</span>
              <span class="vk-video-views">${this.formatViews(video.views)} просмотров</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Добавляем обработчик клика для воспроизведения
    const playBtn = slide.querySelector('.vk-video-play-btn');
    const videoWrapper = slide.querySelector('.vk-video-wrapper');

    playBtn.addEventListener('click', () => {
      this.playVideo(video, videoWrapper);
    });

    return slide;
  }

  /**
   * Воспроизведение видео
   */
  playVideo(video, wrapper) {
    // Скрываем превью
    const preview = wrapper.querySelector('.vk-video-preview');
    const details = wrapper.querySelector('.vk-video-details');

    preview.style.display = 'none';
    details.style.display = 'block';

    // Создаем iframe для встраивания видео
    const iframe = document.createElement('iframe');
    iframe.src = video.embed_url;
    iframe.width = '100%';
    iframe.height = '400';
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    iframe.style.borderRadius = '8px';

    details.appendChild(iframe);

    // Добавляем кнопку закрытия
    const closeBtn = document.createElement('button');
    closeBtn.className = 'vk-video-close';
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.7);
      color: white;
      border: none;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      cursor: pointer;
      font-size: 18px;
      z-index: 10;
    `;

    closeBtn.addEventListener('click', () => {
      iframe.remove();
      closeBtn.remove();
      preview.style.display = 'block';
      details.style.display = 'none';
    });

    details.appendChild(closeBtn);
  }

  /**
   * Форматирование количества просмотров
   */
  formatViews(views) {
    if (views >= 1000000) {
      return Math.floor(views / 1000000) + 'M';
    } else if (views >= 1000) {
      return Math.floor(views / 1000) + 'K';
    }
    return views.toString();
  }

  /**
   * Инициализация Swiper
   */
  initSwiper() {
    // Если Swiper уже инициализирован, обновляем его
    if (this.swiper) {
      this.swiper.update();
      return;
    }

    // Инициализируем новый Swiper
    if (typeof Swiper !== 'undefined') {
      this.swiper = new Swiper(this.container.querySelector('.swiper'), {
        slidesPerView: 1,
        spaceBetween: 20,
        loop: this.videos.length > 1,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        breakpoints: {
          768: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          }
        }
      });
    }
  }

  /**
   * Показ индикатора загрузки
   */
  showLoader() {
    if (!this.options.showLoader) return;

    const loader = document.createElement('div');
    loader.className = 'vk-videos-loader';
    loader.innerHTML = '<div class="spinner"></div><p>Загрузка видео...</p>';
    loader.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
    `;

    this.container.appendChild(loader);
  }

  /**
   * Скрытие индикатора загрузки
   */
  hideLoader() {
    const loader = this.container.querySelector('.vk-videos-loader');
    if (loader) {
      loader.remove();
    }
  }

  /**
   * Показ ошибки
   */
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'vk-videos-error';
    errorDiv.innerHTML = `<p>Ошибка: ${message}</p>`;
    errorDiv.style.cssText = `
      padding: 40px;
      text-align: center;
      color: #666;
    `;

    this.container.appendChild(errorDiv);
  }

  /**
   * Запуск автоматического обновления
   */
  startAutoUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    this.updateTimer = setInterval(() => {
      this.loadVideos();
    }, this.options.updateInterval);
  }

  /**
   * Остановка автоматического обновления
   */
  stopAutoUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  /**
   * Обновление конфигурации
   */
  updateConfig(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Уничтожение компонента
   */
  destroy() {
    this.stopAutoUpdate();
    if (this.swiper) {
      this.swiper.destroy(true, true);
    }
  }
}

// Автоматическая инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  const moreSlider = document.querySelector('.more__slider');
  if (moreSlider) {
    window.vkVideosLoader = new VKVideosLoader(moreSlider, {
      apiUrl: '/vk-videos.php',
      autoUpdate: true,
      maxVideos: 5
    });
  }
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = VKVideosLoader;
}

