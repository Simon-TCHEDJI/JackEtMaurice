let links = document.querySelectorAll(".main .menu ul li.link");


let hoverEffet = (element, active = true) => {
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
    console.log()
};

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