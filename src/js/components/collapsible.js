// Универсальный коллапсер: работает для любых контейнеров
// Разметка (универсальная):
// <div data-collapsible>
//   <div data-collapsible-content>...</div>
//   <button data-collapsible-toggle>Читать далее</button>
// </div>
// Поддержка legacy: если нет дата-атрибутов, попробует найти
// контент по первому <p> и кнопку по .about__more-btn внутри контейнера.

function animateHeight(element, targetHeight, options = {}) {
  const { duration = 300, easing = "ease" } = options;

  const startHeight = element.offsetHeight;
  if (startHeight === targetHeight) return Promise.resolve();

  element.style.overflow = "hidden";
  element.style.height = `${startHeight}px`;
  element.style.transition = `height ${duration}ms ${easing}`;

  element.offsetHeight;

  return new Promise((resolve) => {
    function cleanup() {
      element.style.transition = "";
      element.style.overflow = "";
      element.style.height = "";
      element.removeEventListener("transitionend", onEnd);
      resolve();
    }

    function onEnd(e) {
      if (e.propertyName === "height") {
        cleanup();
      }
    }

    element.addEventListener("transitionend", onEnd);
    element.style.height = `${targetHeight}px`;

    setTimeout(() => {
      cleanup();
    }, duration + 50);
  });
}

export function initCollapsibles() {
  const containers = document.querySelectorAll(
    "[data-collapsible], .js-collapsible, .about__desc"
  );
  if (!containers || containers.length === 0) return;

  containers.forEach((container) => {
    if (container.dataset.collapsibleInited === "true") return;

    const content =
      container.querySelector("[data-collapsible-content]") ||
      container.querySelector("p") ||
      container.firstElementChild;

    const toggle =
      container.querySelector("[data-collapsible-toggle]") ||
      container.querySelector(".about__more-btn");

    if (!content || !toggle) return;

    container.dataset.collapsibleInited = "true";

    const state = { expanded: container.classList.contains("is-expanded") };

    function updateToggleText() {
      const expandText =
        toggle.getAttribute("data-expand-text") || "Читать далее";
      const collapseText =
        toggle.getAttribute("data-collapse-text") || "Свернуть";
      toggle.textContent = state.expanded ? collapseText : expandText;
    }

    updateToggleText();

    function setExpanded(flag) {
      if (flag) {
        container.classList.add("is-expanded");
      } else {
        container.classList.remove("is-expanded");
      }
      state.expanded = flag;
      updateToggleText();
    }

    // Первый рендер: зафиксировать стартовую высоту с clamp'ом
    // Ничего не делаем, так как высота управляется CSS line-clamp.

    toggle.addEventListener("click", async (e) => {
      e.preventDefault();

      const currentHeight = content.offsetHeight;

      if (!state.expanded) {
        // expand
        // Сначала фиксируем текущую высоту, затем снимаем clamp для вычисления полной высоты
        content.style.height = `${currentHeight}px`;
        // Force reflow
        // eslint-disable-next-line no-unused-expressions
        content.offsetHeight;

        setExpanded(true);
        const target = content.scrollHeight;
        await animateHeight(content, target);
        content.style.height = ""; // auto
      } else {
        // collapse
        const fullHeight = content.offsetHeight;
        // Временно снимаем класс expanded, чтобы получить высоту в сжатом состоянии
        setExpanded(false);
        // Нужно дождаться применения clamp, возьмем маленькую задержку
        const afterClamp = () => content.offsetHeight;
        const collapsedHeight = afterClamp();

        // Вернем expanded, чтобы не мигало, анимируем от полной к сжатой
        setExpanded(true);
        content.style.height = `${fullHeight}px`;
        // Force reflow
        // eslint-disable-next-line no-unused-expressions
        content.offsetHeight;

        await animateHeight(content, collapsedHeight);
        setExpanded(false);
        content.style.height = "";
      }
    });
  });
}

// Автоинициализация
document.addEventListener("DOMContentLoaded", () => {
  initCollapsibles();
});
