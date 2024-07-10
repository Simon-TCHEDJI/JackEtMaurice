let screenSize = 1000;

function destockRun() {
    let destock = document.querySelector(".destock");
    if (window.matchMedia(`(min-width: ${screenSize}px)`).matches) {
        if (!destock.classList.contains("active")) {
            destock.classList.toggle("active");
        }
    } else if (destock.classList.contains("active")) {
        destock.classList.toggle("active");
    }
    console.log(window.matchMedia(`(min-width: ${screenSize}px)`).matches);
};

if (window.screen.width >= screenSize) {
    destockRun();
}

window.addEventListener("resize", (e) => {
    destockRun();
});

console.log(Cache)