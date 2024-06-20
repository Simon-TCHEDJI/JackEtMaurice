let dataBase = JSON.parse(localStorage.db);

let idGen = () => {
    let dat = new Date();
    let dateLigne = dat.toLocaleDateString('fr-FR').split("/").join("-");
    let timeLigne = dat.toLocaleTimeString().split(":").join("-");
    return (dateLigne + "_" + timeLigne);
};

let addCompteByDB = (email, mdp) => {
    let id = generateOtp(5) + "####" + idGen();
    let compte = {id, email, mdp};
    if (dataBase.compte == undefined) {
        dataBase.compte = [compte];
        localStorage.db = JSON.stringify(dataBase);
    } else {
        dataBase.compte.push(compte);
    }
    return compte;
};