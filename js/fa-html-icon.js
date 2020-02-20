const faHtmlIcon = (name) => {
    const elm = document.createElement("i");
    elm.classList.add("fa");
    elm.classList.add("fa-" + name);
    return elm;
};
