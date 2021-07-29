document.addEventListener('DOMContentLoaded', function () {
  console.log(
    "%c > Development: https://vk.com/sotick_yoker",
    "background: #fc342a; padding:7px 7px 7px 0; font-size: 12px; color: #ffffff"
  );
  // ************************* //  

  let popup = document.querySelector(".popup-main")
  let promo = document.querySelector(".promo")
  let popupBtnClose = document.querySelector(".popup__close-btn")
  let openBtnPopup = document.querySelector(".promo__info-block_btns button")
  
  popupBtnClose.addEventListener("click",()=>{
    popup.classList.remove("popup-active")
    promo.classList.remove("promo-locked")
  })

  openBtnPopup.addEventListener("click",()=>{
    popup.classList.add("popup-active")
    promo.classList.add("promo-locked")
  })

});
