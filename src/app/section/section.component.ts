import { Component, Input, AfterViewInit, ElementRef } from '@angular/core';
import { ScrollSpyService } from 'ngx-scrollspy';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.css']
})
export class SectionComponent implements AfterViewInit {

  @Input()
  public icon: string;

  @Input()
  public data: string;

  public shown: boolean;

  constructor(
    private element: ElementRef,
    private scrollSpy: ScrollSpyService
  ) { }

  ngAfterViewInit() {
		this.scrollSpy.getObservable('window').subscribe((e: any) => {
      if (window.innerHeight == 0) {
        return;
      }
      var percent = this.element.nativeElement.getBoundingClientRect().top / window.innerHeight;
      if (percent <= 0.6) {
        this.shown = true;
      }
		});
	}

}
