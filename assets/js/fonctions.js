let removeAllClass = (htmlArray, classString) => {
    htmlArray.forEach(element => {
        element.classList.remove(classString);
    });
};

