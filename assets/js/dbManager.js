let dataBase = JSON.parse(localStorage.db);

let addCompteByDB = (email, mdp) => {
    if (dataBase.compte == undefined) {
        dataBase.compte = [{email: email, mdp: mdp}];
        localStorage.db = JSON.stringify(dataBase);
    } else {
        dataBase.compte.push({email: email, mdp: mdp});
    }
};