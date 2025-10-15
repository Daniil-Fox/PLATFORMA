/**
 * FormInputs - Компонент для работы с инпутами и dropdown
 */

export class FormInputs {
  constructor() {
    this.init();
  }

  init() {
    this.initDropdowns();
    this.initLabels();
  }

  initDropdowns() {
    // Инициализация dropdown для селектов
    document.querySelectorAll(".form__dropdown").forEach((dropdown) => {
      const header = dropdown.querySelector(".dropdown__header");
      const body = dropdown.querySelector(".dropdown__body");
      const capture = dropdown.querySelector(".dropdown__capture");
      const select = dropdown.parentElement.querySelector("select");
      const items = dropdown.querySelectorAll(".dropdown__item");

      if (!header || !body || !capture || !select) return;

      // Обработчик клика по заголовку
      header.addEventListener("click", () => {
        dropdown.classList.toggle("active");
      });

      // Обработчики клика по элементам
      items.forEach((item, index) => {
        item.addEventListener("click", () => {
          const value = item.textContent;
          capture.textContent = value;

          // Обновляем селект
          if (select.options[index]) {
            select.value = select.options[index].value;
            select.dispatchEvent(new Event("change"));
          }

          dropdown.classList.remove("active");
        });
      });

      // Закрытие при клике вне dropdown
      document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.remove("active");
        }
      });
    });
  }

  initLabels() {
    // Обработка состояния filled для лейблов
    document.querySelectorAll(".form__input").forEach((input) => {
      const label = input.nextElementSibling;
      if (!label || !label.classList.contains("form__label")) return;

      // Проверяем начальное состояние
      if (input.value) {
        label.classList.add("filled");
      }

      // Обработчики событий
      input.addEventListener("focus", () => {
        label.classList.add("filled");
      });

      input.addEventListener("blur", () => {
        if (!input.value) {
          label.classList.remove("filled");
        }
      });

      input.addEventListener("input", () => {
        if (input.value) {
          label.classList.add("filled");
        } else {
          label.classList.remove("filled");
        }
      });
    });
  }
}
