import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Delaunay } from 'd3-delaunay';

@Component({
  selector: 'app-delaunay',
  standalone: true,
  templateUrl: './delaunay.component.html',
  styleUrls: ['./delaunay.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class DelaunayComponent implements AfterViewInit {
  @ViewChild('svgCanvas', { static: true }) svgCanvas!: ElementRef<SVGElement>;

  points: [number, number][] = [];
  strokeColor = 'var(--secondary-color)';

  private _strokeWidth: number = 2;
  private _strokeStyle: string = 'solid';

  // **Getter & Setter für Strichbreite**
  get strokeWidth(): number {
    return this._strokeWidth;
  }
  set strokeWidth(value: number) {
    this._strokeWidth = value;
    this.render(); // **Direkt neu rendern**
  }

  // **Getter & Setter für Linienstil**
  get strokeStyle(): string {
    return this._strokeStyle;
  }
  set strokeStyle(value: string) {
    this._strokeStyle = value;
    this.render(); // **Direkt neu rendern**
  }

  ngAfterViewInit(): void {
    this.render();
  }

  addPoint(event: MouseEvent) {
    const rect = this.svgCanvas.nativeElement.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    if (!this.points.some(([px, py]) => px === x && py === y)) {
      this.points.push([x, y]);
      console.log('📌 Neuer Punkt:', [x, y]);
      this.render();
    } else {
      console.warn('⚠️ Punkt existiert bereits.');
    }
  }

  render() {
    const svg = this.svgCanvas.nativeElement;
    svg.innerHTML = ''; // Reset SVG

    this.points.forEach(([x, y]) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x.toString());
      circle.setAttribute('cy', y.toString());
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', this.strokeColor);
      svg.appendChild(circle);
    });

    if (this.points.length < 3) {
      console.warn('⚠️ Mindestens 3 Punkte erforderlich.');
      return;
    }

    console.log('📌 Punktdaten für `d3-delaunay`:', this.points);

    const delaunay = Delaunay.from(this.points);
    const triangles = delaunay.triangles;
    console.log('📊 Delaunay Triangles:', triangles);

    if (triangles.length === 0) {
      console.warn('⚠️ Delaunay hat keine gültigen Dreiecke berechnet.');
      return;
    }

    for (let i = 0; i < triangles.length; i += 3) {
      const p1 = this.points[triangles[i]];
      const p2 = this.points[triangles[i + 1]];
      const p3 = this.points[triangles[i + 2]];

      if (p1 && p2 && p3) {
        console.log(`🔹 Verbindet: ${p1} -> ${p2} -> ${p3}`);
        this.drawLine(p1, p2);
        this.drawLine(p2, p3);
        this.drawLine(p3, p1);
      }
    }
  }

  drawLine(p1: [number, number], p2: [number, number]) {
    const [x1, y1] = p1;
    const [x2, y2] = p2;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1.toString());
    line.setAttribute('y1', y1.toString());
    line.setAttribute('x2', x2.toString());
    line.setAttribute('y2', y2.toString());
    line.setAttribute('stroke', this.strokeColor);
    line.setAttribute('stroke-width', this.strokeWidth.toString());

    // **Stroke-Style direkt anwenden**
    if (this.strokeStyle === 'dashed') {
      line.setAttribute('stroke-dasharray', '5,5');
    } else if (this.strokeStyle === 'dotted') {
      line.setAttribute('stroke-dasharray', '2,2');
    }

    this.svgCanvas.nativeElement.appendChild(line);
  }

  downloadSVG() {
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(this.svgCanvas.nativeElement);
    const blob = new Blob([source], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'delaunay.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
