import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-customStrokeFont',
  templateUrl: './customstrokefont.component.html',
  styleUrls: ['./customstrokefont.component.scss']
})
export class CustomStrokeFontComponent implements AfterViewInit {
  @ViewChild('drawingCanvas', { static: true }) drawingCanvas!: ElementRef;
  @ViewChild('letterContainer', { static: true }) letterContainer!: ElementRef;
  useLineVersion: boolean = true;
  private isDrawing: boolean = false;
  private currentPath: number[][] = [];

  private letterStructures: { [key: string]: number[][] } = {
    A: [[10, 90, 50, 10], [50, 10, 90, 90], [30, 50, 70, 50]],
    B: [[10, 10, 10, 90], [10, 10, 70, 30], [10, 50, 70, 70], [10, 90, 70, 70]],
    C: [[80, 20, 20, 20], [20, 20, 10, 50], [10, 50, 20, 80], [20, 80, 80, 80]],
  };

  ngAfterViewInit() {
    this.setupDrawingCanvas();
  }

  private setupDrawingCanvas(): void {
    const canvas = this.drawingCanvas.nativeElement as SVGSVGElement;

    canvas.addEventListener('mousedown', (event) => {
      this.isDrawing = true;
      this.currentPath = [[event.offsetX, event.offsetY]];
      this.drawTemporaryLine();
    });

    canvas.addEventListener('mousemove', (event) => {
      if (!this.isDrawing) return;
      this.currentPath.push([event.offsetX, event.offsetY]);
      this.drawTemporaryLine();
    });

    canvas.addEventListener('mouseup', () => {
      this.isDrawing = false;
    });
  }

  private drawTemporaryLine(): void {
    const canvas = this.drawingCanvas.nativeElement as SVGSVGElement;
    canvas.innerHTML = '';
    for (let i = 1; i < this.currentPath.length; i++) {
      const [x1, y1] = this.currentPath[i - 1];
      const [x2, y2] = this.currentPath[i];

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1.toString());
      line.setAttribute('y1', y1.toString());
      line.setAttribute('x2', x2.toString());
      line.setAttribute('y2', y2.toString());
      line.setAttribute('stroke', 'black');
      line.setAttribute('stroke-width', '2');
      canvas.appendChild(line);
    }
  }

  public generateCustomFont(): void {
    if (this.currentPath.length < 2) return;

    const container = this.letterContainer.nativeElement;
    container.innerHTML = '';

    for (const letter in this.letterStructures) {
      const letterSVG = this.createCustomLetterSVG(letter, this.letterStructures[letter]);
      container.appendChild(letterSVG);
    }
  }

  private createCustomLetterSVG(letter: string, structure: number[][]): SVGElement {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '100');
    svg.setAttribute('height', '100');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('data-letter', letter);

    structure.forEach(([x1, y1, x2, y2]) => {
      const patternLines = this.createPatternLine(x1, y1, x2, y2);
      patternLines.forEach(line => svg.appendChild(line));
    });

    return svg;
  }

  private createPatternLine(x1: number, y1: number, x2: number, y2: number): SVGElement[] {
    const lines: SVGElement[] = [];
    const pattern = this.currentPath; // Muster basiert auf der Zeichnung

    if (pattern.length < 2) return lines;

    const segmentLength = 10;
    const totalLength = Math.hypot(x2 - x1, y2 - y1);
    const segments = Math.floor(totalLength / segmentLength);

    for (let i = 0; i < segments; i++) {
      const t1 = i / segments;
      const t2 = (i + 1) / segments;

      const px1 = x1 + (x2 - x1) * t1;
      const py1 = y1 + (y2 - y1) * t1;
      const px2 = x1 + (x2 - x1) * t2;
      const py2 = y1 + (y2 - y1) * t2;

      pattern.forEach(([dx, dy], index) => {
        if (index === 0) return;
        const [dx2, dy2] = pattern[index - 1];

        const offsetX1 = dx / 10;
        const offsetY1 = dy / 10;
        const offsetX2 = dx2 / 10;
        const offsetY2 = dy2 / 10;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', (px1 + offsetX1).toString());
        line.setAttribute('y1', (py1 + offsetY1).toString());
        line.setAttribute('x2', (px2 + offsetX2).toString());
        line.setAttribute('y2', (py2 + offsetY2).toString());
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', '2');

        lines.push(line);
      });
    }

    return lines;
  }
}
