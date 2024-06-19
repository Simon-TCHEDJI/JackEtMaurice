let popcontainer = document.querySelector(".popcontainer");
let message = document.querySelector(".popcontainer .popup .message");
let exit = document.querySelector(".popcontainer .popup .exit input");


let popupActive = (messageText) => {
    message.textContent = messageText;
    popcontainer.classList.add("active");
};

let popupDesactive = (e) => {
    e.preventDefault();
    popcontainer.classList.remove("active");
};

let emailVerify = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

let generateOtp = (max) => {
    let code = '';
    for (let i = 0; i < max; i++) {
        code += Math.floor(Math.random() * 10);
    }
    return code;
};


exit.addEventListener("click", popupDesactive);
