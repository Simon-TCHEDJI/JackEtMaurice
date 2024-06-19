let compteForm = document.querySelector(".main .page.addCompte form .btn button");
let otpForm = document.querySelector(".main .page.setOtp form .btn button");

compteForm.addEventListener("click", (e) => {
    e.preventDefault();
    let email = document.getElementById("email").value;
    let pass = document.getElementById("pass").value;
    if (pass != "" && email != "") {
        if (emailVerify(email)) {
            sessionStorage.email = email;
            sessionStorage.pass = pass;
            let otp = generateOtp(4);
            sessionStorage.otp = otp;
            console.log("Code OTP : " + otp);
            changePage(allPage, pageOtp, "active");
        } else {
            popupActive("Adresse email invalide.");
        }
    } else {
        popupActive("Veuillez renseigner tous les champs.");
    }
});

otpForm.addEventListener("click", (e) => {
    e.preventDefault();
    let otp = document.getElementById("otp").value;
    if (otp != "") {
        let email = sessionStorage.email;
        let pass = sessionStorage.pass;
        let code = sessionStorage.otp;
        if (code == otp) {
            addCompteByDB(email, pass);
            console.log([code, otp])
            changePage(allPage, pageChoix, "active");
        } else {
            popupActive("Code otp incorret");
        }
    } else {
        popupActive("Veuillez renseigner l'otp ou la redemander.");
    }
});