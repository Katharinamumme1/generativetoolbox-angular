import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mandala',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './mandala.component.html',
  styleUrls: ['./mandala.component.scss'],
})
export class MandalaComponent implements OnInit {
  @ViewChild('svgCanvas') svgCanvas!: ElementRef<SVGElement>;
  @ViewChild('mirrorLines') mirrorLines!: ElementRef<SVGGElement>;
  @ViewChild('mandalaGroup') mandalaGroup!: ElementRef<SVGGElement>;
  @ViewChild('gridGroup') gridGroup!: ElementRef<SVGGElement>;
  @ViewChild('customSvgCanvas') customSvgCanvas!: ElementRef<SVGElement>;

  symmetry: number = 8; // Anzahl der Spiegelungen
  drawing: boolean = false;
  lastPoint: { x: number; y: number } | null = null;

  // Grid-Einstellungen
  showGrid: boolean = false;
  gridType: 'circle' | 'rectangle' = 'circle';
  gridCircles: number = 5;
  gridRows: number = 5;
  gridCols: number = 5;

  // Strich-Einstellungen
  strokeWidth: number = 2;
  strokeStyle: string = 'solid'; // solid, dashed, dotted, rectangles, custom
  strokeCap: string = 'round'; // round, square, butt

  // Custom-Linie
  customPath: string | null = null; // SVG-Pfad für Custom-Linie
  customDrawing: boolean = false; // Zeichnen im Custom-SVG
  customLastPoint: { x: number; y: number } | null = null;

  ngOnInit(): void {
    this.updateMirrorLines();
  }


 

  startDrawing(event: MouseEvent | TouchEvent): void {
    this.drawing = true;
    const point = this.snapToGrid(this.getPoint(event));
    this.lastPoint = point;
  }

  draw(event: MouseEvent | TouchEvent): void {
    if (!this.drawing || !this.lastPoint) return;

    const point = this.snapToGrid(this.getPoint(event));
    const distance = Math.sqrt(
      Math.pow(point.x - this.lastPoint.x, 2) + Math.pow(point.y - this.lastPoint.y, 2)
    );
    if (distance > 2) {
      this.drawMirroredLines(this.lastPoint.x, this.lastPoint.y, point.x, point.y);
      this.lastPoint = point;
    }
  }

  stopDrawing(): void {
    this.drawing = false;
    this.lastPoint = null;
  }

  private getPoint(event: MouseEvent | TouchEvent): { x: number; y: number } {
    const rect = this.svgCanvas.nativeElement.getBoundingClientRect();
    const clientX =
      event instanceof MouseEvent
        ? event.clientX
        : event.touches[0].clientX;
    const clientY =
      event instanceof MouseEvent
        ? event.clientY
        : event.touches[0].clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  private snapToGrid(point: { x: number; y: number }): { x: number; y: number } {
    if (!this.showGrid) return point;

    const cx = this.svgCanvas.nativeElement.clientWidth / 2;
    const cy = this.svgCanvas.nativeElement.clientHeight / 2;

    if (this.gridType === 'circle') {
      const radiusStep = cx / this.gridCircles;
      const distance = Math.sqrt(Math.pow(point.x - cx, 2) + Math.pow(point.y - cy, 2));
      const snappedRadius = Math.round(distance / radiusStep) * radiusStep;
      const angle = Math.atan2(point.y - cy, point.x - cx);
      return {
        x: cx + Math.cos(angle) * snappedRadius,
        y: cy + Math.sin(angle) * snappedRadius,
      };
    } else if (this.gridType === 'rectangle') {
      const cellWidth = this.svgCanvas.nativeElement.clientWidth / this.gridCols;
      const cellHeight = this.svgCanvas.nativeElement.clientHeight / this.gridRows;
      return {
        x: Math.round(point.x / cellWidth) * cellWidth,
        y: Math.round(point.y / cellHeight) * cellHeight,
      };
    }

    return point;
  }

  private drawMirroredLines(x1: number, y1: number, x2: number, y2: number): void {
    for (let i = 0; i < this.symmetry; i++) {
      const angle = (i * 2 * Math.PI) / this.symmetry;
      const cx = this.svgCanvas.nativeElement.clientWidth / 2;
      const cy = this.svgCanvas.nativeElement.clientHeight / 2;

      const dx1 = Math.cos(angle) * (x1 - cx) - Math.sin(angle) * (y1 - cy) + cx;
      const dy1 = Math.sin(angle) * (x1 - cx) + Math.cos(angle) * (y1 - cy) + cy;
      const dx2 = Math.cos(angle) * (x2 - cx) - Math.sin(angle) * (y2 - cy) + cx;
      const dy2 = Math.sin(angle) * (x2 - cx) + Math.cos(angle) * (y2 - cy) + cy;

      if (this.strokeStyle === 'dotted') {
        this.drawDotted(dx1, dy1, dx2, dy2);
      } else if (this.strokeStyle === 'dashed') {
        this.drawDashed(dx1, dy1, dx2, dy2);
      } else if (this.strokeStyle === 'rectangles') {
        this.drawRectangles(dx1, dy1, dx2, dy2);
      } else if (this.strokeStyle === 'custom' && this.customPath) {
        this.drawCustomPath(dx1, dy1, dx2, dy2);
      } else {
        this.drawStandardLine(dx1, dy1, dx2, dy2);
      }
    }
  }

  private drawStandardLine(x1: number, y1: number, x2: number, y2: number): void {
   this.createLine(x1, y1, x2, y2);
  }

  private drawDotted(x1: number, y1: number, x2: number, y2: number): void {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const step = 15; // Abstand zwischen Kreisen
    let currentDistance = 0;

    while (currentDistance < distance) {
      const cx = x1 + Math.cos(angle) * currentDistance;
      const cy = y1 + Math.sin(angle) * currentDistance;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', cx.toString());
      circle.setAttribute('cy', cy.toString());
      circle.setAttribute('r', (this.strokeWidth / 2).toString());
      circle.setAttribute('fill', 'var(--secondary-color)');
      this.mandalaGroup.nativeElement.appendChild(circle);

      currentDistance += step;
    }
  }

  private drawDashed(x1: number, y1: number, x2: number, y2: number): void {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const step = 20; // Abstand zwischen Strichen
    const dashLength = 10; // Länge der vertikalen Striche
    let currentDistance = 0;

    while (currentDistance < distance) {
      const px = x1 + Math.cos(angle) * currentDistance;
      const py = y1 + Math.sin(angle) * currentDistance;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', px.toString());
      line.setAttribute('y1', (py - dashLength / 2).toString());
      line.setAttribute('x2', px.toString());
      line.setAttribute('y2', (py + dashLength / 2).toString());
      line.setAttribute('stroke', 'var(--secondary-color)');
      line.setAttribute('stroke-width', this.strokeWidth.toString());
      this.mandalaGroup.nativeElement.appendChild(line);

      currentDistance += step;
    }
  }

  private drawRectangles(x1: number, y1: number, x2: number, y2: number): void {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const step = 25; // Abstand zwischen Rechtecken
    const rectWidth = 10;
    const rectHeight = 5;
    let currentDistance = 0;

    while (currentDistance < distance) {
      const px = x1 + Math.cos(angle) * currentDistance;
      const py = y1 + Math.sin(angle) * currentDistance;

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', (px - rectWidth / 2).toString());
      rect.setAttribute('y', (py - rectHeight / 2).toString());
      rect.setAttribute('width', rectWidth.toString());
      rect.setAttribute('height', rectHeight.toString());
      rect.setAttribute('fill', 'var(--secondary-color)');
      rect.setAttribute('transform', `rotate(${(angle * 180) / Math.PI}, ${px}, ${py})`);
      this.mandalaGroup.nativeElement.appendChild(rect);

      currentDistance += step;
    }
  }

  private drawCustomPath(x1: number, y1: number, x2: number, y2: number): void {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const step = 30; // Abstand zwischen Mustern
    let currentDistance = 0;

    while (currentDistance < distance) {
      const px = x1 + Math.cos(angle) * currentDistance;
      const py = y1 + Math.sin(angle) * currentDistance;

      const useElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      useElement.setAttribute('href', '#customPath');
      useElement.setAttribute('x', px.toString());
      useElement.setAttribute('y', py.toString());
      useElement.setAttribute('transform', `rotate(${(angle * 180) / Math.PI}, ${px}, ${py})`);
      this.mandalaGroup.nativeElement.appendChild(useElement);

      currentDistance += step;
    }
  }

  private createLine(x1: number, y1: number, x2: number, y2: number): void {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1.toString());
    line.setAttribute('y1', y1.toString());
    line.setAttribute('x2', x2.toString());
    line.setAttribute('y2', y2.toString());
    line.setAttribute('stroke', 'var(--secondary-color)');
    line.setAttribute('stroke-width', this.strokeWidth.toString());
    line.setAttribute('stroke-linecap', this.strokeCap);
    this.mandalaGroup.nativeElement.appendChild(line);
  }

  startCustomDrawing(event: MouseEvent): void {
    this.customDrawing = true;
    const point = this.getCustomSvgPoint(event);
    this.customLastPoint = point;

    const pathElement = this.customSvgCanvas.nativeElement.querySelector('path') as SVGPathElement;
    pathElement.setAttribute('d', `M ${point.x} ${point.y}`);
  }

  drawCustom(event: MouseEvent): void {
    if (!this.customDrawing || !this.customLastPoint) return;

    const point = this.getCustomSvgPoint(event);
    const pathElement = this.customSvgCanvas.nativeElement.querySelector('path') as SVGPathElement;
    const d = pathElement.getAttribute('d') || '';
    pathElement.setAttribute('d', `${d} L ${point.x} ${point.y}`);

    this.customLastPoint = point;
  }

  stopCustomDrawing(): void {
    this.customDrawing = false;
    this.customLastPoint = null;

    this.saveCustomPath();
  }

  private getCustomSvgPoint(event: MouseEvent): { x: number; y: number } {
    const rect = this.customSvgCanvas.nativeElement.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  saveCustomPath(): void {
    const pathElement = this.customSvgCanvas.nativeElement.querySelector('path') as SVGPathElement;
    const serializedPath = new XMLSerializer().serializeToString(pathElement);
    this.customPath = serializedPath;
  }

  updateMirrorLines(): void {
    const svg = this.svgCanvas.nativeElement;
    const mirrorLinesGroup = this.mirrorLines.nativeElement;

    while (mirrorLinesGroup.firstChild) {
      mirrorLinesGroup.removeChild(mirrorLinesGroup.firstChild);
    }

    const cx = svg.clientWidth / 2;
    const cy = svg.clientHeight / 2;

    for (let i = 0; i < this.symmetry; i++) {
      const angle = (i * 2 * Math.PI) / this.symmetry;
      const x = cx + Math.cos(angle) * cx;
      const y = cy + Math.sin(angle) * cy;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', cx.toString());
      line.setAttribute('y1', cy.toString());
      line.setAttribute('x2', x.toString());
      line.setAttribute('y2', y.toString());
      line.setAttribute('stroke', '#cccccc');
      line.setAttribute('stroke-dasharray', '5,5');
      line.setAttribute('stroke-width', '1');
      mirrorLinesGroup.appendChild(line);
    }
  }

  updateGrid(): void {
    const svg = this.svgCanvas.nativeElement;
    const gridGroup = this.gridGroup.nativeElement;

    while (gridGroup.firstChild) {
      gridGroup.removeChild(gridGroup.firstChild);
    }

    const cx = svg.clientWidth / 2;
    const cy = svg.clientHeight / 2;

    if (this.gridType === 'circle') {
      const radiusStep = cx / this.gridCircles;
      for (let i = 1; i <= this.gridCircles; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx.toString());
        circle.setAttribute('cy', cy.toString());
        circle.setAttribute('r', (i * radiusStep).toString());
        circle.setAttribute('stroke', 'var(--secondary-color)');
        circle.setAttribute('stroke-dasharray', '5,5');
        circle.setAttribute('fill', 'none');
        gridGroup.appendChild(circle);
      }
    } else if (this.gridType === 'rectangle') {
      const cellWidth = svg.clientWidth / this.gridCols;
      const cellHeight = svg.clientHeight / this.gridRows;
      for (let i = 1; i < this.gridCols; i++) {
        const x = i * cellWidth;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x.toString());
        line.setAttribute('y1', '0');
        line.setAttribute('x2', x.toString());
        line.setAttribute('y2', svg.clientHeight.toString());
        line.setAttribute('stroke', 'var(--secondary-color)');
        line.setAttribute('stroke-dasharray', '5,5');
        gridGroup.appendChild(line);
      }
      for (let i = 1; i < this.gridRows; i++) {
        const y = i * cellHeight;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '0');
        line.setAttribute('y1', y.toString());
        line.setAttribute('x2', svg.clientWidth.toString());
        line.setAttribute('y2', y.toString());
        line.setAttribute('stroke', 'var(--secondary-color)');
        line.setAttribute('stroke-dasharray', '5,5');
        gridGroup.appendChild(line);
      }
    }
  }

  downloadMandala(): void {
    const mandalaGroup = this.mandalaGroup.nativeElement.cloneNode(true) as SVGGElement;

    const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgElement.setAttribute('viewBox', '0 0 500 500');
    svgElement.setAttribute('width', '500');
    svgElement.setAttribute('height', '500');
    svgElement.appendChild(mandalaGroup);

    const serializer = new XMLSerializer();
    const svgData = serializer.serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'mandala.svg';
    link.click();
    URL.revokeObjectURL(url);
  }
}
