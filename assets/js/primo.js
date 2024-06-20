let addCompteAction = document.querySelector(".main .page .container .box");
let allPage = document.querySelectorAll(".main .page");
let addComptePage = document.querySelector(".main .page.addCompte");
let pageOtp = document.querySelector(".main .page.setOtp");
let pageChoix = document.querySelector(".main .page.choix");
let resendOtpBtn = document.querySelector(".main .page.setOtp form .newCode .link");
// localStorage.clear();
// sessionStorage.clear();

addCompteAction.addEventListener("click", (e) => {
    e.preventDefault();
    changePage(allPage, addComptePage, "active");
});

let changePage = (pages, pageGoTo, classe) => {
    RemoteAllClass(pages, classe);
    pageGoTo.classList.add(classe);
};

let RemoteAllClass = (htmlArray, classe) => {
    htmlArray.forEach(element => {
        element.classList.remove(classe);
    });
};