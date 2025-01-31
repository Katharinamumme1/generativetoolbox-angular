import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParallaxOpenerComponent } from './parallax-opener/parallax-opener.component';
import { PegboardComponent } from './pegboard/pegboard.component';
import { ColorSwitchComponent } from "./color-switch/color-switch.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ParallaxOpenerComponent, PegboardComponent, ColorSwitchComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  showPegboard: boolean = false;

  // Methode zum Umschalten, wenn der Opener abgeschlossen ist
  displayPegboard(): void {
    this.showPegboard = true;
  }
}
