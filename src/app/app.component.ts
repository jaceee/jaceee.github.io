import { Component, OnInit } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private defaultLang = 'en';

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit() {
    var currentLang = localStorage.getItem('currentLang');
    this.translate.use(currentLang || this.defaultLang);
  }

}
