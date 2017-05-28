import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-background',
  template: ''
})
export class BackgroundComponent implements OnInit, OnDestroy {

  ngOnInit() {
    window.onscroll = e => {
      this.updateBackground();
    };
  }

  ngOnDestroy() {
    window.onscroll = null;
  }

  public updateBackground() {
    const position = document.body.scrollTop / (document.body.scrollHeight - window.innerHeight);
    const value = Math.min(0.85, position * 4);
    const ammount = Math.round(255 - (value * 255));

    document.body.style.backgroundColor = 'rgb(' + [ammount, ammount, ammount].join(', ') + ')';
  }

}
