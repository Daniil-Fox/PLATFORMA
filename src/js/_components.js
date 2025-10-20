import "./components/slider.js";
import { burger } from "./functions/burger.js";
import "./components/collapsible.js";
import "./components/video.js";
import "./components/dropdown.js";
import { FormInputs } from "./components/inputs.js";
import "./functions/validate-forms.js";
import {CustomTextarea} from "./components/textarea.js";
import "./components/modal.js";
import "./components/fancy.js";

// Инициализация кастомных textarea
document.addEventListener("DOMContentLoaded", () => {
  // Инициализация filled/labels и кастомных dropdown-поведения
  new FormInputs();

  const textareas = document.querySelectorAll(".form__input--area");
  textareas.forEach((textarea) => {
    new CustomTextarea(textarea);
  });
});
