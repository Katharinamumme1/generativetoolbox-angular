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

        // Dynamisch Animation und Styles hinzufügen
        svgElement.querySelectorAll('path, circle, line, polyline, polygon').forEach((el) => {
          const svgEl = el as SVGElement;

          // Stelle sicher, dass es einen Stroke gibt
          svgEl.style.stroke = 'black';
          svgEl.style.strokeWidth = '2';

          // Setze die Stroke-Dash-Animation
          svgEl.style.strokeDasharray = '1000';
          svgEl.style.strokeDashoffset = '1000';

          // Erzwinge einen "Neustart" der Animation
          svgEl.style.animation = 'none';
          svgEl.getBoundingClientRect(); // Trigger Reflow
          svgEl.style.animation = 'draw 4s linear forwards';
        });
      };

      reader.readAsText(file);
    }
  }
}
