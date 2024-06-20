let db = localStorage.getItem("db");
let com = document.querySelector(".main .btn a");

if (db === null) {
    db = {};
    localStorage.db = JSON.stringify(db);
    console.log("create");
} else {
    db = JSON.parse(localStorage.db);
    console.log("existe");
}

com.addEventListener("click", (e) => {
    e.preventDefault()
    if (db.compte == undefined) {
        window.location.href = "/primo.html";
    } else {
        window.location.href = "/campagne.html";
    }
});
