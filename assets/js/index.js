let com = document.querySelector(".main .btn a");

let interval = setInterval(() => {
    if (localStorage.papa != undefined) {
        let dataBase = null;
        if (localStorage.db === undefined) {
            let userId = idGen();
            dataBase = {user: [{id: userId}]};
            localStorage.db = JSON.stringify(dataBase);
            console.log("create");
        } else {
            console.log("existe");
        }
        com.classList.remove("disabled");
        clearInterval(interval);
    }
}, 500);

com.addEventListener("click", (e) => {
    e.preventDefault()
    if (!e.currentTarget.classList.contains("disabled")) {
        window.location.href = "/accueil.html";
    }
});

setTimeout(() => {
    localStorage.papa = "ok";
}, 5000);
