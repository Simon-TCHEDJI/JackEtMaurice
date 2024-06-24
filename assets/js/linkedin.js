let links = document.querySelectorAll(".main .menu ul li.link");
let linktopList = document.querySelectorAll(".main .container .menutop .linktop")
let pageActionList = document.querySelectorAll(".main .container .dynamic .pageAction");
let compteBoxs = document.querySelectorAll(".main .container .dynamic .inition .boxers .compteBox");
let compteActionPage = document.querySelector(".main .container .dynamic .compteAction")


compteBoxs.forEach(element => {
    element.addEventListener("click", (e) => {
        console.log(pageActionList);
        removeAllClass(pageActionList, "active");
        compteActionPage.classList.add("active");
    });
});

links.forEach(element => {
    element.addEventListener("mouseover", (e) => {
        hoverEffet(element);
    });
});

links.forEach(element => {
    element.addEventListener("mouseout", (e) => {
        hoverEffet(element, false);
    });
});

function hoverEffet(element, active = true) {
    let baliseA = element.children[0];
    let linkicon = baliseA.children[0];
    let linklabel = baliseA.children[1];
    let baliseImg = linkicon.children[0];
    if (!element.classList.contains("active")) {
        if (active) {
            let urlArray = baliseImg.src.split("-icon");
            let activeUrl = urlArray[0] + "-icon-active";
            baliseImg.src = activeUrl + urlArray[1];
            linklabel.style.color = "#FF5784";
        } else {
            let urlArray = baliseImg.src.split("-icon-active");
            let activeUrl = urlArray[0] + "-icon";
            baliseImg.src = activeUrl + urlArray[1];
            linklabel.style.color = "#484C52";
        }
    }
};

linktopList.forEach(element => {
    element.addEventListener("click", (e) => {
        removeAllClass(linktopList, "active");
        element.classList.add("active");
        removeAllClass(pageActionList, "active");
        pageActionList[element.dataset.pose].classList.add("active");
    })
});

let removeAllClass = (htmlArray, classString) => {
    htmlArray.forEach(element => {
        element.classList.remove(classString);
    });
};