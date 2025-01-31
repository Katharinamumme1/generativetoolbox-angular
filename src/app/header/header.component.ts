import {Component} from '@angular/core';

import { ColorSwitchComponent } from '../color-switch/color-switch.component';

@Component({
  selector: 'app-header',
  imports: [
ColorSwitchComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true
})
export class HeaderComponent {

}
