import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-animator',
  templateUrl: './animator.component.html',
  styleUrls: ['./animator.component.scss']
})
export class AnimatorComponent {
  @ViewChild('svgCanvas', { static: true }) svgCanvas!: ElementRef<SVGElement>;

  uploadSVG(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input?.files?.[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(reader.result as string, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;

        // Bereinige das aktuelle SVG-Canvas
        this.svgCanvas.nativeElement.innerHTML = '';

        // Füge das SVG hinzu
        this.svgCanvas.nativeElement.appendChild(svgElement);

        // Füge die Animationsklassen hinzu
        svgElement.querySelectorAll('path, circle, line, polyline, polygon').forEach((el) => {
          (el as SVGElement).style.stroke = 'black'; // Stelle sicher, dass ein Stroke vorhanden ist
        });
      };

      reader.readAsText(file);
    }
  }
}
