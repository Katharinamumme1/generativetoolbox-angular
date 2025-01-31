import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-burger-menu',
  standalone: true,
  templateUrl: './burger-menu.component.html',
  styleUrls: ['./burger-menu.component.scss'],
  imports: [CommonModule],
})
export class BurgerMenuComponent {


  menu = [
    { name: 'Category 1', subcategories: ['font1', 'font2'], isOpen: false },
    { name: 'Category 2', subcategories: ['font3', 'font4'], isOpen: false },
  ];

  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleSubmenu(category: any): void {
    category.isOpen = !category.isOpen;
  }


}
