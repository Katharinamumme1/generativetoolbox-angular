import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MandalaComponent } from '../mandala/mandala.component';
import { DisplacementMapComponent } from '../displacement-map/displacement-map.component';
import { GridPatternComponent } from '../grid-pattern/grid-pattern.component';
import { AnimatorComponent } from '../animator/animator.component';
import { CustomBrushComponent } from '../custombrush/custombrush.component';
import { DistortedPatternComponent } from '../distortedpattern/distortedpattern.component';
import { DelaunayComponent } from '../delaunay/delaunay.component';
import { CustomStrokeFontComponent} from '../customstrokefont/customstrokefont.component';
import { FontbaukastenComponent } from '../fontbaukasten/fontbaukasten.component';
import { HandDrawnFontComponent } from '../handdrawnfont/handdrawnfont.component';


@Component({
  selector: 'app-pegboard',
  standalone: true,
  imports: [CommonModule, MandalaComponent, DisplacementMapComponent, GridPatternComponent, CustomBrushComponent, AnimatorComponent, DistortedPatternComponent,DelaunayComponent,CustomStrokeFontComponent,FontbaukastenComponent,HandDrawnFontComponent],
  templateUrl: './pegboard.component.html',
  styleUrls: ['./pegboard.component.scss'],
})
export class PegboardComponent {
  translateX: number = 0;
  translateY: number = 0;
  isDragging: boolean = false;
  startX: number = 0;
  startY: number = 0;
  activeCategory: string | null = null;
  isMobile: boolean = false;

  ngOnInit(): void {
    this.checkIfMobile();
    this.translateX = -window.innerWidth / 2;
    this.translateY = -window.innerHeight / 2;
  }

  @HostListener('window:resize')
  checkIfMobile(): void {
    this.isMobile = window.innerWidth <= 768; // Mobile-Schwelle
  }

  onMouseDown(event: MouseEvent): void {
    if (this.activeCategory || this.isMobile) return; // Kein Dragging bei Mobile
    this.isDragging = true;
    this.startX = event.clientX - this.translateX;
    this.startY = event.clientY - this.translateY;
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging || this.activeCategory || this.isMobile) return;
    this.translateX = event.clientX - this.startX;
    this.translateY = event.clientY - this.startY;
  }

  onMouseUpOrLeave(): void {
    this.isDragging = false;
  }

  navigateAndZoom(categoryId: string, event: Event): void {
    event.preventDefault();

    const targetElement = document.getElementById(categoryId);
    if (!targetElement) return;

    if (this.isMobile) {
      // Mobile: Scrollen statt Draggen
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    } else {
      // Desktop: Draggen und Zentrieren
      const rect = targetElement.getBoundingClientRect();

      const categoryCenterX = rect.left + rect.width / 2;
      const categoryCenterY = rect.top + rect.height / 2;

      const screenCenterX = window.innerWidth / 2;
      const screenCenterY = window.innerHeight / 2;

      const offsetX = screenCenterX - categoryCenterX;
      const offsetY = screenCenterY - categoryCenterY;

      this.translateX += offsetX;
      this.translateY += offsetY;

      const container = document.getElementById('container');
      if (container) {
        container.style.transition = 'transform 0.8s ease';
        container.style.transform = `translate(${this.translateX}px, ${this.translateY}px)`;
      }
    }

    this.activeCategory = categoryId; // Kategorie aktivieren
  }

  clearActiveCategory(): void {
    this.activeCategory = null;
  }

  isActive(categoryId: string): boolean {
    return this.activeCategory === categoryId;
  }
}


