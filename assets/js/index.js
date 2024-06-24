let com = document.querySelector(".main .btn a");

com.addEventListener("click", (e) => {
    e.preventDefault()
    let db = localStorage.getItem("db");
    if (db.compte == undefined) {
        window.location.href = "/primo.html";
    } else {
        window.location.href = "/accueil.html";
    }
});
