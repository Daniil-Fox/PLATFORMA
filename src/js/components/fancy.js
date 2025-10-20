import { Fancybox } from "@fancyapps/ui";

const fancyItems = document.querySelectorAll('[data-fancybox]')

if(fancyItems && fancyItems.length > 0){
  fancyItems.forEach(fancy => {
    const group = fancy.dataset.fancybox

    Fancybox.bind(`[data-fancybox=${group}]`, {
      // Your custom options
    });
  })
}
