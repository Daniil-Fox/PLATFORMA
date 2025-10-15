/**
 * FormValidation - Компонент валидации форм
 */

import JustValidate from "just-validate";
import Inputmask from "inputmask";

export class FormValidation {
  constructor(form) {
    this.form = form;
    this.validator = null;
    this.inputMask = null;

    this.init();
  }

  init() {
    // Находим элементы формы
    this.telInput = this.form.querySelector(".input-tel");
    this.emailInput = this.form.querySelector(".input-email");
    this.contactLabel = this.form.querySelector(".form__label");
    this.select = this.form.querySelector("select");
    this.submitBtn = this.form.querySelector(".form__btn");

    // Инициализация
    this.initFields();
    this.initValidation();
    this.bindEvents();
  }

  initFields() {
    // Изначально блокируем поля
    if (this.telInput) {
      this.telInput.disabled = true;
      this.telInput.style.display = "block";
    }
    if (this.emailInput) {
      this.emailInput.disabled = true;
      this.emailInput.style.display = "none";
    }
    if (this.contactLabel) {
      this.contactLabel.textContent = "телефон/email";
    }
  }

  initMask() {
    if (!this.inputMask && this.telInput) {
      this.inputMask = new Inputmask({
        mask: "+7 (999) 999-99-99",
        showMaskOnHover: false,
        showMaskOnFocus: true,
        onBeforeMask: function (value) {
          if (!value || typeof value !== "string") return value;
          if (value.startsWith("7") || value.startsWith("8")) {
            return "";
          }
          return value;
        },
      });
      this.inputMask.mask(this.telInput);
    }
  }

  clearMask() {
    if (this.inputMask) {
      this.inputMask.remove();
      this.inputMask = null;
    }
    if (this.telInput) {
      this.telInput.value = "";
    }
  }

  setContactField(type) {
    this.clearMask();
    if (!this.telInput || !this.emailInput) return;

    // Удаляем класс filled
    const telField = this.telInput.closest(".form__field");
    const emailField = this.emailInput.closest(".form__field");
    const selectField = telField?.previousElementSibling;

    if (telField) telField.classList.remove("filled");
    if (emailField && emailField !== telField)
      emailField.classList.remove("filled");

    if (telField) {
      const label = telField.querySelector("label");
      if (label) label.classList.remove("filled");
    }
    if (emailField && emailField !== telField) {
      const label = emailField.querySelector("label");
      if (label) label.classList.remove("filled");
    }

    // Если не выбран способ связи
    if (!this.select?.value) {
      if (telField) {
        telField.style.display = "none";
      }
      if (selectField) {
        selectField.classList.add("form__field--long");
      }
      this.telInput.disabled = true;
      this.emailInput.style.display = "none";
      this.emailInput.disabled = true;
      if (this.contactLabel) this.contactLabel.textContent = "телефон/email";
      return;
    }

    // Показываем form__field
    if (telField) {
      telField.style.display = "block";
    }
    if (selectField) {
      selectField.classList.remove("form__field--long");
    }

    this.telInput.disabled = true;
    this.emailInput.style.display = "none";
    this.emailInput.disabled = true;

    if (this.select?.value) {
      if (type === "email") {
        this.telInput.style.display = "none";
        this.emailInput.style.display = "block";
        this.emailInput.disabled = false;
        this.emailInput.value = "";
        this.emailInput.setAttribute("type", "email");
        if (this.contactLabel) this.contactLabel.textContent = "email";
      } else {
        this.telInput.style.display = "block";
        this.emailInput.style.display = "none";
        this.telInput.disabled = false;
        this.telInput.value = "";
        this.telInput.setAttribute("type", "text");
        if (this.contactLabel) this.contactLabel.textContent = "телефон";
        this.initMask();
      }
    }
  }

  getRules() {
    const selected = this.select?.value;
    if (!selected) return [];

    const isEmail = selected === "Email" || /mail/i.test(selected);

    if (isEmail) {
      return [
        {
          ruleSelector: `${
            this.form.selector || this.form.className
          } .input-email`,
          rules: [
            { rule: "required", value: true, errorMessage: "Заполните email!" },
            {
              rule: "email",
              value: true,
              errorMessage: "Введите корректный email!",
            },
          ],
        },
      ];
    } else {
      return [
        {
          ruleSelector: `${
            this.form.selector || this.form.className
          } .input-tel`,
          rules: [
            {
              rule: "required",
              value: true,
              errorMessage: "Заполните телефон!",
            },
            {
              rule: "function",
              validator: function (name, value) {
                if (!value || typeof value !== "string") return true;
                const cleanValue = value.replace(/\D/g, "");
                return cleanValue.length === 11;
              },
              errorMessage: "Введите корректный номер телефона",
            },
          ],
        },
      ];
    }
  }

  getBaseRules() {
    return [
      {
        ruleSelector: `${
          this.form.selector || this.form.className
        } .input-name`,
        rules: [
          { rule: "minLength", value: 2, errorMessage: "Минимум 2 символа" },
          { rule: "required", value: true, errorMessage: "Заполните имя!" },
        ],
      },
      {
        ruleSelector: `${
          this.form.selector || this.form.className
        } .select-contact`,
        rules: [
          {
            rule: "required",
            value: true,
            errorMessage: "Выберите способ связи!",
          },
        ],
      },
    ];
  }

  checkValidity() {
    if (this.form && this.submitBtn) {
      const nameValid =
        this.form.querySelector(".input-name")?.value?.length >= 2;
      const contactTypeValid = this.select?.value;
      let contactValid = false;

      if (!this.telInput.disabled && this.telInput.value) {
        contactValid = this.telInput.value.replace(/\D/g, "").length === 11;
      }
      if (!this.emailInput.disabled && this.emailInput.value) {
        contactValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.emailInput.value);
      }

      this.submitBtn.disabled = !(
        nameValid &&
        contactTypeValid &&
        contactValid
      );
    }
  }

  initValidation() {
    if (this.validator && typeof this.validator.destroy === "function") {
      this.validator.destroy();
      this.validator = null;
    }

    const selected = this.select?.value;
    const isEmail = selected === "Email" || /mail/i.test(selected);

    this.setContactField(isEmail ? "email" : "tel");

    const rules = [...this.getBaseRules(), ...this.getRules()];
    this.validator = new JustValidate(this.form);

    rules.forEach((rule) => {
      this.validator.addField(rule.ruleSelector, rule.rules);
    });

    this.form.removeEventListener("input", this.checkValidity.bind(this));
    this.form.addEventListener("input", this.checkValidity.bind(this));
    setTimeout(this.checkValidity.bind(this), 100);
  }

  bindEvents() {
    this.select?.addEventListener("change", this.initValidation.bind(this));
  }
}
