/**
 * Form Library - Библиотека для форм обратной связи
 * @version 1.0.0
 */

// Импорт компонентов
import "./components/textarea.js";
import "./components/validation.js";
import "./components/inputs.js";

class FormLibrary {
  constructor() {
    this.initialized = false;
    this.forms = [];
  }

  init() {
    if (this.initialized) return;

    // Инициализация всех форм
    this.initForms();

    // Инициализация модальных окон
    this.initModals();

    this.initialized = true;
  }

  initForms() {
    const formSelectors = [".contact-form", ".cta__form", ".modal__form"];

    formSelectors.forEach((selector) => {
      const forms = document.querySelectorAll(selector);
      forms.forEach((form) => {
        if (form) {
          this.initForm(form);
        }
      });
    });
  }

  initForm(form) {
    // Инициализация валидации
    new FormValidation(form);

    // Инициализация кастомного скроллбара для textarea
    const textareas = form.querySelectorAll(".form__input--area");
    textareas.forEach((textarea) => {
      new CustomTextarea(textarea);
    });
  }

  initModals() {
    // Открытие модального окна
    document.querySelectorAll(".modal-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const modal = document.querySelector(".modal");
        if (modal) {
          modal.classList.add("active");
        }
      });
    });

    // Закрытие модального окна
    const modal = document.querySelector(".modal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("active");
        }
      });
    }
  }
}

// Автоматическая инициализация при загрузке DOM
document.addEventListener("DOMContentLoaded", () => {
  window.FormLibrary = new FormLibrary();
  window.FormLibrary.init();
});

// Экспорт для использования в модулях
export default FormLibrary;
