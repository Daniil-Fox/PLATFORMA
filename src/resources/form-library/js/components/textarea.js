/**
 * CustomTextarea - Компонент кастомного скроллбара для textarea
 */

export class CustomTextarea {
  constructor(element) {
    if (!(element instanceof HTMLTextAreaElement)) return;
    this.textarea = element;
    this.wrapper = element.closest(".form__field-wrapper");
    if (!this.wrapper) return;
    this.init();
  }

  init() {
    this.createScrollbar();
    this.initEvents();
    this.updateScrollbar();
  }

  createScrollbar() {
    this.scrollbar = document.createElement("div");
    this.scrollbar.className = "textarea-scrollbar";

    // Кнопка вверх
    this.upButton = document.createElement("button");
    this.upButton.className = "textarea-scroll-btn textarea-scroll-up";
    this.upButton.type = "button";
    this.upButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
      </svg>
    `;

    // Трек для ползунка
    this.track = document.createElement("div");
    this.track.className = "textarea-scroll-track";

    // Ползунок
    this.thumb = document.createElement("div");
    this.thumb.className = "textarea-scroll-thumb";
    this.track.appendChild(this.thumb);

    // Кнопка вниз
    this.downButton = document.createElement("button");
    this.downButton.className = "textarea-scroll-btn textarea-scroll-down";
    this.downButton.type = "button";
    this.downButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path d="M12 16l-6-6 1.41-1.41L12 13.17l4.59-4.58L18 10z"/>
      </svg>
    `;

    // Собираем скроллбар
    this.scrollbar.appendChild(this.upButton);
    this.scrollbar.appendChild(this.track);
    this.scrollbar.appendChild(this.downButton);

    // Добавляем в обертку
    this.wrapper.appendChild(this.scrollbar);
  }

  initEvents() {
    // Обработчик скролла
    this.textarea.addEventListener("scroll", () => {
      this.updateScrollbar();
    });

    // Обработчик изменения контента
    this.textarea.addEventListener("input", () => {
      this.updateScrollbar();
    });

    // Кнопка вверх
    this.upButton.addEventListener("click", () => {
      this.textarea.scrollTop -= 30;
    });

    // Кнопка вниз
    this.downButton.addEventListener("click", () => {
      this.textarea.scrollTop += 30;
    });

    // Клик по треку
    this.track.addEventListener("click", (e) => {
      if (e.target === this.track) {
        const trackRect = this.track.getBoundingClientRect();
        const clickPosition = e.clientY - trackRect.top;
        const trackHeight = this.track.clientHeight;
        const scrollPercent = clickPosition / trackHeight;
        this.textarea.scrollTop =
          scrollPercent *
          (this.textarea.scrollHeight - this.textarea.clientHeight);
      }
    });

    // Перетаскивание ползунка
    let isDragging = false;
    let startY;
    let startScrollTop;

    this.thumb.addEventListener("mousedown", (e) => {
      isDragging = true;
      startY = e.clientY;
      startScrollTop = this.textarea.scrollTop;
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;

      const deltaY = e.clientY - startY;
      const trackHeight = this.track.clientHeight - this.thumb.clientHeight;
      const scrollPercent = deltaY / trackHeight;
      const scrollAmount =
        scrollPercent *
        (this.textarea.scrollHeight - this.textarea.clientHeight);

      this.textarea.scrollTop = startScrollTop + scrollAmount;
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      document.body.style.userSelect = "";
    });
  }

  updateScrollbar() {
    const scrollPercent =
      this.textarea.scrollTop /
      (this.textarea.scrollHeight - this.textarea.clientHeight);
    const trackHeight = this.track.clientHeight - this.thumb.clientHeight;
    const thumbPosition = scrollPercent * trackHeight;

    this.thumb.style.transform = `translateY(${thumbPosition}px)`;

    // Обновляем состояние кнопок
    const isTop = this.textarea.scrollTop === 0;
    const isBottom =
      this.textarea.scrollTop >=
      this.textarea.scrollHeight - this.textarea.clientHeight;

    this.upButton.disabled = isTop;
    this.downButton.disabled = isBottom;

    // Добавляем/убираем класс disabled
    this.upButton.classList.toggle("disabled", isTop);
    this.downButton.classList.toggle("disabled", isBottom);

    // Обновляем прозрачность скроллбара
    this.scrollbar.classList.toggle("disabled", isTop && isBottom);
  }
}
