import { Component, OnInit } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.css']
})
export class LanguageSelectorComponent implements OnInit {

  public isOpen = false;

  public currentLang: string;

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.currentLang = this.translate.currentLang;
  }

  public toggle() {
    this.isOpen = !this.isOpen;
    return false;
  }

  public setLanguage(lang: string) {
    localStorage.setItem("currentLang", lang);
    this.translate.use(lang);
    this.currentLang = lang;
    this.isOpen = false;

    return false;
  }

}
