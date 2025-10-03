// Управление видео по обёртке data-video-wrapper
// Поведение:
// - Если есть кнопка [data-video-play], по клику запускаем видео,
//   при паузе показываем кнопку снова
// - Во время проигрывания на <video> добавляется атрибут data-playing="true"
// - Если кнопки нет, видео автозапускается при попадании в зону видимости >= 10%

function setPlayingState(video, isPlaying) {
  if (!video) return;
  if (isPlaying) {
    video.setAttribute("data-playing", "true");
  } else {
    video.removeAttribute("data-playing");
  }
}

function initVideoWithButton(wrapper, video, playBtn) {
  if (!video) return;

  const hideButton = () => {
    if (playBtn) playBtn.hidden = true;
  };
  const showButton = () => {
    if (playBtn) playBtn.hidden = false;
  };

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      // Для надёжности автоплея на мобильных ставим флаги
      video.muted = video.muted ?? true;
      video.playsInline = true;
      video.play().catch(() => {
        // Игнорируем отказ автоплея браузером
      });
    });
  }

  video.addEventListener("playing", () => {
    setPlayingState(video, true);
    hideButton();
  });
  video.addEventListener("pause", () => {
    setPlayingState(video, false);
    showButton();
  });
  video.addEventListener("ended", () => {
    setPlayingState(video, false);
    showButton();
  });
}

function initVideoAutoplay(wrapper, video) {
  if (!video) return;
  // Настройка для автозапуска при видимости >= 10%
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
          video.muted = true; // требуется большинством браузеров для автоплея
          video.playsInline = true;
          video
            .play()
            .then(() => {
              setPlayingState(video, true);
            })
            .catch(() => {
              // Ничего: пользовательское взаимодействие может потребоваться
            });
        }
      });
    },
    { threshold: [0, 0.1, 0.25, 0.5, 1] }
  );

  observer.observe(wrapper);

  video.addEventListener("playing", () => setPlayingState(video, true));
  video.addEventListener("pause", () => setPlayingState(video, false));
  video.addEventListener("ended", () => setPlayingState(video, false));
}

document.addEventListener("DOMContentLoaded", () => {
  const wrappers = document.querySelectorAll("[data-video-wrapper]");
  if (!wrappers.length) return;

  wrappers.forEach((wrapper) => {
    const video = wrapper.querySelector("video");
    const playBtn = wrapper.querySelector("[data-video-play]");

    if (playBtn) {
      initVideoWithButton(wrapper, video, playBtn);
    } else {
      initVideoAutoplay(wrapper, video);
    }
  });
});
