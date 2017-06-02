import { Component } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  private defaultLang = 'en';

  constructor(translate: TranslateService) {
    translate.setDefaultLang(this.defaultLang);
    
    var currentLang = localStorage.getItem('currentLang');
    translate.use(currentLang || this.defaultLang);
  }

}
