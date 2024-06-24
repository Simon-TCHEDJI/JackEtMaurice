let dataBase = null;
// alert(localStorage.db)

if (localStorage.db === undefined) {
    let userId = idGen();
    dataBase = {user: [{id: userId}]};
    localStorage.db = JSON.stringify(dataBase);
    console.log("create");
} else {
    dataBase = JSON.parse(localStorage.db);
    console.log("existe");
}

function idGen() {
    let dat = new Date();
    let dateLigne = dat.toLocaleDateString('fr-FR').split("/").join("-");
    let timeLigne = dat.toLocaleTimeString().split(":").join("-");
    return (dateLigne + "_" + timeLigne);
};

function addCompteByDB(email, mdp) {
    let userId = dataBase.user[0].id;
    let id = idGen();
    let compte = {id, email, mdp, userId};
    if (dataBase.comptes === undefined) {
        dataBase.compte = [compte];
        localStorage.db = JSON.stringify(dataBase);
    } else {
        dataBase.compte.push(compte);
    }
    return compte;
};