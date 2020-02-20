class BizCard {

    constructor(cfg) {
        this.cfg = cfg;
        this.open = false;
        this.highlight = false;

        this.wrapper = document.querySelector(".biz-card-wrapper");
        this.card = this.wrapper.querySelector(".biz-card");

        this.backFace = this.card.querySelector(".back-face");
        this.frontFace = this.card.querySelector(".front-face");

        this.initEvents();
        this.updateInfo();
    }


    //region Procedures

    async initEvents() {
        this.wrapper.onclick = (e) => this.onClick(e);
        this.wrapper.onmouseenter = (e) => this.onMouseEnter(e);
        this.wrapper.onmouseleave = (e) => this.onMouseLeave(e);
    }

    async updateInfo() {
        this.frontFace.innerHTML = "";
        this.backFace.style.backgroundImage = "none";
        if (!this.cfg) return;

        if (this.cfg.logo) {
            this.backFace.style.backgroundImage = `url('${this.cfg.logo}')`;
        }

        const nameComponents = this.cfg.name.split(" ").filter(c => c);
        if (nameComponents.length) {
            const nameElement = document.createElement("div");
            nameElement.classList.add("name");
            for (let nameComponent of nameComponents) {
                const nameComponentElement = document.createElement("h1");
                nameComponentElement.append(nameComponent);
                nameElement.append(nameComponentElement);
            }
            this.frontFace.append(nameElement);
        }

        const infoElements = [];
        if (cfg.location) {
            const locationElement = document.createElement("span");
            locationElement.append(faHtmlIcon("map-marker"));
            locationElement.append(cfg.location);
            infoElements.push(locationElement);
        }
        if (cfg.email) {
            const emailElement = document.createElement("span");
            const emailLinkElement = document.createElement("a");
            emailLinkElement.setAttribute("href", "mailto:" + cfg.email);
            emailLinkElement.append(cfg.email);
            emailElement.append(faHtmlIcon("at"));
            emailElement.append(emailLinkElement);
            infoElements.push(emailElement);
        }
        if (cfg.phone) {
            const phoneElement = document.createElement("span");
            const phoneLinkElement = document.createElement("a");
            phoneLinkElement.setAttribute("href", "tel:" + cfg.phone);
            phoneLinkElement.append(cfg.phone);
            phoneElement.append(faHtmlIcon("phone"));
            phoneElement.append(phoneLinkElement);
            infoElements.push(phoneElement);
        }
        if (cfg.social && cfg.social.length) {
            const socialElement = document.createElement("span");
            socialElement.classList.add("social");
            for (let socialItem of cfg.social) {
                const socialLinkElement = document.createElement("a");
                socialLinkElement.setAttribute("href", socialItem.url);
                socialLinkElement.setAttribute("target", "_blank");
                socialLinkElement.append(faHtmlIcon(socialItem.type));
                socialElement.append(socialLinkElement);
                socialElement.append(" ");
            }
            infoElements.push(socialElement);
        }
        if (infoElements.length) {
            const infoElement = document.createElement("div");
            infoElement.classList.add("info");
            for (let element of infoElements) {
                infoElement.append(element);
            }
            this.frontFace.append(infoElement);
        }
    }

    async updateAnimation() {
        if (this.open) {
            this.card.classList.add("open");
            this.card.classList.remove("highlight");
        } else {
            this.card.classList.remove("open");
            if (this.highlight) {
                this.card.classList.add("highlight");
            } else {
                this.card.classList.remove("highlight");
            }
        }
    }

    //endregion Procedures


    //region Events

    async onClick(e) {
        if (e.target instanceof HTMLAnchorElement) return;
        this.open = !this.open;
        await this.updateAnimation();
    }

    async onMouseEnter(e) {
        this.highlight = true;
        await this.updateAnimation();
    }

    async onMouseLeave(e) {
        this.highlight = false;
        await this.updateAnimation();
    }

    //endregion Events


    //region Public API

    async setConfig(cfg) {
        await this.updateInfo();
    }

    //endregion Public API

}
