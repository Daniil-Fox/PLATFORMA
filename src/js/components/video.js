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
  const progress = wrapper.querySelector(".video-progress");
  const progressTrack = progress?.querySelector(".video-progress-track");

  let currentProgress = 0;
  let targetProgress = 0;
  let animationId = null;

  const updateProgress = () => {
    if (!progressTrack || !video.duration || isNaN(video.duration)) return;

    targetProgress = Math.min(1, Math.max(0, video.currentTime / video.duration));

    if (animationId) return; // Animation already running

    const animate = () => {
      const diff = targetProgress - currentProgress;
      if (Math.abs(diff) < 0.001) {
        currentProgress = targetProgress;
        animationId = null;
        return;
      }

      // Smooth interpolation
      currentProgress += diff * 0.15;
      progressTrack.style.transform = `scaleX(${currentProgress})`;

      animationId = requestAnimationFrame(animate);
    };

    animate();
  };

  // Click-to-seek behavior on custom progress bar (no jQuery)
  if (progress && progressTrack) {
    progress.addEventListener("click", (event) => {
      if (!video.duration || isNaN(video.duration)) return;
      const rect = progress.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const ratio = Math.min(1, Math.max(0, clickX / rect.width));
      video.currentTime = ratio * video.duration;
      // Immediately reflect the new position smoothly
      targetProgress = ratio;
      updateProgress();
    });
  }

  const hideButton = () => {
    if (playBtn) playBtn.classList.add("hidden");
  };
  const showButton = () => {
    if (playBtn) playBtn.classList.remove("hidden");
  };

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      // Пользовательский жест: можно включить звук и показать контролы
      video.playsInline = true;
      video.muted = false;
      video.play().catch(() => {
        // Если браузер всё ещё не дал воспроизвести со звуком, пробуем старт с mute
        video.muted = true;
        video.play().catch(() => {
          // Игнорируем окончательно
        });
      });
    });
  }

  video.addEventListener("playing", () => {
    setPlayingState(video, true);
    hideButton();

    if (playBtn) {
      // В случае пользовательского запуска — включаем звук
      video.muted = false;
    }
    updateProgress();
  });
  video.addEventListener("pause", () => {
    setPlayingState(video, false);
    showButton();
    updateProgress();
  });
  video.addEventListener("ended", () => {
    setPlayingState(video, false);
    showButton();

    // Сброс анимации и установка финального значения
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    currentProgress = 1;
    targetProgress = 1;
    if (progressTrack) progressTrack.style.transform = "scaleX(1)";

    // Если это видео внутри steps-слайда — перейти к следующему и запустить его
    const stepsSlide = wrapper.closest(".steps__item");
    if (stepsSlide && typeof window.__stepsAdvance === "function") {
      window.__stepsAdvance();
      if (typeof window.__stepsPlayActive === "function") {
        setTimeout(() => window.__stepsPlayActive(), 80);
      }
    }
  });

  video.addEventListener("timeupdate", updateProgress);
  video.addEventListener("loadedmetadata", () => {
    // Сброс анимации и установка начального значения
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    currentProgress = 0;
    targetProgress = 0;
    if (progressTrack) progressTrack.style.transform = "scaleX(0)";
  });
}

function initVideoAutoplay(wrapper, video) {
  if (!video) return;
  const progress = wrapper.querySelector(".video-progress");
  const progressTrack = progress?.querySelector(".video-progress-track");

  if (progressTrack) {
    progressTrack.style.transformOrigin = "left center";
  }

  let currentProgress = 0;
  let targetProgress = 0;
  let animationId = null;

  const updateProgress = () => {
    if (!progressTrack || !video.duration || isNaN(video.duration)) return;

    targetProgress = Math.min(1, Math.max(0, video.currentTime / video.duration));

    if (animationId) return; // Animation already running

    const animate = () => {
      const diff = targetProgress - currentProgress;
      if (Math.abs(diff) < 0.001) {
        currentProgress = targetProgress;
        animationId = null;
        return;
      }

      // Smooth interpolation
      currentProgress += diff * 0.15;
      progressTrack.style.transform = `scaleX(${currentProgress})`;

      animationId = requestAnimationFrame(animate);
    };

    animate();
  };

  // Click-to-seek behavior on custom progress bar (no jQuery)
  if (progress && progressTrack) {
    progress.addEventListener("click", (event) => {
      if (!video.duration || isNaN(video.duration)) return;
      const rect = progress.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const ratio = Math.min(1, Math.max(0, clickX / rect.width));
      video.currentTime = ratio * video.duration;
      // Immediately reflect the new position smoothly
      targetProgress = ratio;
      updateProgress();
    });
  }
  // Настройка для автозапуска при видимости >= 10%
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
          // Для автоплея оставляем mute, но показываем контролы
          video.muted = true; // требуется большинством браузеров для автоплея
          video.playsInline = true;

          video
            .play()
            .then(() => {
              setPlayingState(video, true);
              updateProgress();
            })
            .catch(() => {
              // Ничего: пользовательское взаимодействие может потребоваться
            });
        }
      });
    },
    { threshold: [0, 0.1, 0.2, 0.4, 0.04, 0.5, 0.6, 0.7, 0.8, 0.9, 1] }
  );

  observer.observe(wrapper);

  video.addEventListener("playing", () => setPlayingState(video, true));
  video.addEventListener("pause", () => {
    setPlayingState(video, false);
    updateProgress();
  });
  video.addEventListener("ended", () => {
    setPlayingState(video, false);

    // Сброс анимации и установка финального значения
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    currentProgress = 1;
    targetProgress = 1;
    if (progressTrack) progressTrack.style.transform = "scaleX(1)";

    // Если это видео внутри steps-слайда — перейти к следующему и запустить его
    const stepsSlide = wrapper.closest(".steps__item");
    if (stepsSlide && typeof window.__stepsAdvance === "function") {
      window.__stepsAdvance();
      if (typeof window.__stepsPlayActive === "function") {
        setTimeout(() => window.__stepsPlayActive(), 80);
      }
    }
  });

  video.addEventListener("timeupdate", updateProgress);
  video.addEventListener("loadedmetadata", () => {
    // Сброс анимации и установка начального значения
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    currentProgress = 0;
    targetProgress = 0;
    if (progressTrack) progressTrack.style.transform = "scaleX(0)";
  });
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
