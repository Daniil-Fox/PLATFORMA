document.addEventListener("DOMContentLoaded", () => {
  function getModalByTarget(target) {
    if (!target) return null;
    const id = target.startsWith("#") ? target.slice(1) : target;
    return document.getElementById(id);
  }

  function openModalById(target) {
    const modal = getModalByTarget(target);
    if (!modal) return;
    modal.classList.add("modal--active");
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("modal--active");
  }

  // Делегирование кликов по кнопкам-открывателям
  document.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-target]");
    if (opener) {
      const targetId = opener.getAttribute("data-target");
      openModalById(targetId);
      return;
    }

    // Кнопка закрытия внутри модалки
    const closeBtn = e.target.closest(".modal__close");
    if (closeBtn) {
      const modal = closeBtn.closest(".modal");
      closeModal(modal);
      return;
    }

    // Клик по подложке (вне .modal__body)
    const modal = e.target.closest(".modal");
    if (modal && !e.target.closest(".modal__body")) {
      closeModal(modal);
    }
  });
});


