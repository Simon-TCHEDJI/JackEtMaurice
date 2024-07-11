let boxs = document.querySelectorAll(".main .dynaic .container .box");
let sChapitre = document.querySelector(".main .dynaic .sChapitre");
let pages = document.querySelectorAll(".main .dynaic .page");
let retourFormation = document.querySelector(".main .dynaic .sChapitre .headZone .icon");
let sBoxs = document.querySelectorAll(".main .dynaic .page.sChapitre .sContainer .box");
let sContent = document.querySelector(".main .dynaic .sContent");
let retourSChapitre = document.querySelector(".main .dynaic .sContent .headZone .icon");

boxs.forEach(element => {
    element.addEventListener("click", (e) => {
        removeAllClass(pages, "active")
        sChapitre.classList.toggle("active");
    });
});

sBoxs.forEach(element => {
    element.addEventListener("click", (e) => {
        removeAllClass(pages, "active")
        sContent.classList.toggle("active");
    });
});

retourSChapitre.addEventListener("click", (e) => {
    removeAllClass(pages, "active")
    sChapitre.classList.toggle("active");
});

retourFormation.addEventListener("click", (e) => {
    removeAllClass(pages, "active")
    // sChapitre.classList.toggle("active");
});