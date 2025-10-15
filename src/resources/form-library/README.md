# Form Library

Библиотека для создания форм обратной связи с кастомным скроллбаром, валидацией и переключением полей.

## Возможности

- ✅ Переключение между полями телефона и email в зависимости от выбора способа связи
- ✅ Кастомный скроллбар для textarea с кнопками и ползунком
- ✅ Валидация форм с масками для телефона
- ✅ Плавное скрытие/показ полей
- ✅ Адаптивный дизайн
- ✅ Поддержка множественных форм на странице

## Структура

```
form-library/
├── css/
│   └── form-library.css
├── js/
│   ├── form-library.js
│   └── components/
│       ├── textarea.js
│       ├── validation.js
│       └── inputs.js
├── examples/
│   ├── basic.html
│   └── modal.html
└── README.md
```

## Подключение

### CSS

```html
<link rel="stylesheet" href="form-library/css/form-library.css" />
```

### JavaScript

```html
<script src="form-library/js/form-library.js"></script>
```

## HTML структура

### Базовая форма

```html
<form class="contact-form">
  <!-- Поле имени -->
  <div class="form__field form__field--long">
    <input type="text" class="form__input input-name" name="Имя" />
    <label class="form__label">как ваше имя?</label>
  </div>

  <!-- Селект способа связи -->
  <div class="form__field">
    <select name="Способ связи" class="visually-hidden select-contact">
      <option value="Telegram">Telegram</option>
      <option value="Whatsapp" selected>Whatsapp</option>
      <option value="Email">Email</option>
    </select>
    <div class="dropdown form__dropdown filled">
      <div class="dropdown__header">
        <div class="dropdown__label">где с вами связаться?</div>
        <div class="dropdown__capture">Whatsapp</div>
        <div class="dropdown__btn">
          <svg><use xlink:href="img/sprite.svg#arr-down"></use></svg>
        </div>
      </div>
      <div class="dropdown__body">
        <div class="dropdown__content">
          <div class="dropdown__item">Telegram</div>
          <div class="dropdown__item">Whatsapp</div>
          <div class="dropdown__item">Email</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Поля телефона/email -->
  <div class="form__field">
    <input
      type="text"
      class="form__input input-tel"
      name="Телефон"
      style="display: block;"
    />
    <input
      type="email"
      class="form__input input-email"
      name="Почта"
      style="display: none;"
    />
    <label class="form__label">телефон/почта</label>
  </div>

  <!-- Textarea с кастомным скроллбаром -->
  <div class="form__field form__field--long">
    <div class="form__field-wrapper form__field-wrapper--area">
      <textarea
        class="form__input form__input--area input-mess"
        name="Сообщение"
      ></textarea>
      <label class="form__label">введите текст сообщения</label>
    </div>
  </div>

  <button class="btn btn-reset btn--accent form__btn" disabled>
    отправить
  </button>
</form>
```

### Модальное окно

```html
<div class="modal">
  <div class="modal__content">
    <!-- Та же структура формы -->
  </div>
</div>
```

## Классы и атрибуты

### Обязательные классы

- `.contact-form` - основная форма
- `.input-name` - поле имени
- `.input-tel` - поле телефона
- `.input-email` - поле email
- `.input-mess` - textarea для сообщения
- `.select-contact` - селект способа связи
- `.form__btn` - кнопка отправки

### Дополнительные классы

- `.form__field--long` - длинное поле
- `.form__field-wrapper--area` - обертка для textarea
- `.modal` - модальное окно

## Функционал

### Переключение полей

- При выборе "Email" показывается поле email, скрывается телефон
- При выборе других способов показывается телефон с маской
- Поля заблокированы до выбора способа связи

### Кастомный скроллбар

- Кнопки вверх/вниз
- Перетаскиваемый ползунок
- Клик по треку для быстрой прокрутки
- Автоматическое скрытие нативного скроллбара

### Валидация

- Проверка имени (минимум 2 символа)
- Валидация email
- Проверка телефона (11 цифр)
- Блокировка кнопки до заполнения всех полей

### Анимации

- Плавное появление/скрытие полей
- Анимации кнопок и ползунка
- Переходы состояний

## Настройка

### Изменение маски телефона

```javascript
// В textarea.js
inputMask = new Inputmask({
  mask: "+7 (999) 999-99-99", // Измените маску
  // ...
});
```

### Кастомизация стилей

```css
/* Изменение цветов */
.textarea-scroll-btn {
  color: #your-color;
}

.textarea-scroll-thumb {
  background: #your-color;
}
```

### Добавление новых форм

```javascript
// Автоматически инициализируются все формы с классом .contact-form
// Для добавления новой формы просто добавьте класс .contact-form
```

## Примеры

Смотрите папку `examples/` для полных примеров использования.

## Зависимости

- Inputmask.js (для масок телефона)
- JustValidate (для валидации)

## Поддержка браузеров

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Лицензия

MIT License
