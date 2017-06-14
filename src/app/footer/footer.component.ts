import { Component } from '@angular/core';

import { SectionComponent } from '../section/section.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: [
    '../section/section.component.css',
    './footer.component.css'
  ]
})
export class FooterComponent extends SectionComponent {

  public kofi() {
    window.open('https://ko-fi.com/A404X69', '_blank');
  }

  public toTop() {
    document.body.scrollTop = 0; // For Chrome, Safari and Opera
    document.documentElement.scrollTop = 0; // For IE and Firefox
  }

}
