import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent implements OnInit {

  public scrolled = false;

  constructor() { }

  ngOnInit() {
  }

  public didScroll() {
    this.scrolled = true;
  }

}
