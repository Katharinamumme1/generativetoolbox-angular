import { Component, ElementRef, ViewChild, Renderer2, OnInit, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-grid-pattern',
  templateUrl: './grid-pattern.component.html',
  styleUrls: ['./grid-pattern.component.scss'],
  imports: [FormsModule],
})
export class GridPatternComponent implements OnInit {
  @ViewChild('gridCanvas', { static: true }) gridCanvas!: ElementRef<SVGElement>;
  @ViewChild('workspace', { static: true }) workspace!: ElementRef<HTMLDivElement>;

  // Grid-Einstellungen
  rows: number = 10;
  columns: number = 10;
  cellSize: number = 50;
  spacing: number = 5;
  shape: 'circle' | 'rectangle' | 'triangle' | 'polygon' = 'rectangle'; // Neue Formen hinzugefügt

  // Aktueller Modus
  mode: 'fastFill' | 'clickFill' | 'outline' | 'snapToLine' = 'fastFill';

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.drawGrid();
  }

  @HostListener('window:resize')
  onResize() {
    this.drawGrid();
  }

  drawGrid() {
    const canvas = this.gridCanvas.nativeElement;
    while (canvas.firstChild) {
      canvas.removeChild(canvas.firstChild);
    }

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        const x = col * (this.cellSize + this.spacing);
        const y = row * (this.cellSize + this.spacing);

        let shapeElement: SVGElement;

        switch (this.shape) {
          case 'circle':
            shapeElement = this.createCircle(x, y, this.cellSize);
            break;
          case 'rectangle':
            shapeElement = this.createRectangle(x, y, this.cellSize);
            break;
          case 'triangle':
            shapeElement = this.createTriangle(x, y, this.cellSize, row, col);
            break;
          case 'polygon':
            shapeElement = this.createPolygon(x, y, this.cellSize);
            break;
          default:
            shapeElement = this.createRectangle(x, y, this.cellSize);
        }

        this.renderer.listen(shapeElement, 'click', () => this.handleClick(shapeElement));
        this.renderer.listen(shapeElement, 'mousemove', (event: MouseEvent) =>
          this.handleMouseMove(event, shapeElement)
        );

        this.renderer.appendChild(canvas, shapeElement);
      }
    }
  }

  createCircle(x: number, y: number, size: number): SVGElement {
    const circle = this.renderer.createElement('circle', 'svg');
    this.renderer.setAttribute(circle, 'cx', (x + size / 2).toString());
    this.renderer.setAttribute(circle, 'cy', (y + size / 2).toString());
    this.renderer.setAttribute(circle, 'r', (size / 2).toString());
    this.renderer.setAttribute(circle, 'stroke', 'var(--secondary-color)');
    this.renderer.setAttribute(circle, 'fill', 'none');
    this.renderer.setAttribute(circle, 'class', 'grid-shape');
    return circle;
  }

  createRectangle(x: number, y: number, size: number): SVGElement {
    const rect = this.renderer.createElement('rect', 'svg');
    this.renderer.setAttribute(rect, 'x', x.toString());
    this.renderer.setAttribute(rect, 'y', y.toString());
    this.renderer.setAttribute(rect, 'width', size.toString());
    this.renderer.setAttribute(rect, 'height', size.toString());
    this.renderer.setAttribute(rect, 'stroke', 'var(--secondary-color)');
    this.renderer.setAttribute(rect, 'fill', 'none');
    this.renderer.setAttribute(rect, 'class', 'grid-shape');
    return rect;
  }

  createTriangle(x: number, y: number, size: number, row: number, col: number): SVGElement {
    const triangle = this.renderer.createElement('polygon', 'svg');
    const height = (Math.sqrt(3) / 2) * size; // Höhe des Dreiecks

    // Versatz für "umgedrehte" Dreiecke in jeder zweiten Spalte
    const isUpsideDown = (row + col) % 2 === 1;
    const points = isUpsideDown
      ? `${x + size / 2},${y} ${x},${y + height} ${x + size},${y + height}`
      : `${x},${y} ${x + size / 2},${y + height} ${x + size},${y}`;
    this.renderer.setAttribute(triangle, 'points', points);
    this.renderer.setAttribute(triangle, 'stroke', 'var(--secondary-color)');
    this.renderer.setAttribute(triangle, 'fill', 'none');
    this.renderer.setAttribute(triangle, 'class', 'grid-shape');
    return triangle;
  }

  createPolygon(x: number, y: number, size: number): SVGElement {
    const polygon = this.renderer.createElement('polygon', 'svg');
    const points = this.getHexagonPoints(x, y, size);
    this.renderer.setAttribute(polygon, 'points', points);
    this.renderer.setAttribute(polygon, 'stroke', 'var(--secondary-color)');
    this.renderer.setAttribute(polygon, 'fill', 'none');
    this.renderer.setAttribute(polygon, 'class', 'grid-shape');
    return polygon;
  }

  getHexagonPoints(x: number, y: number, size: number): string {
    const halfSize = size / 2;
    const height = Math.sqrt(3) * halfSize; // Höhe eines gleichseitigen Dreiecks
    return `
      ${x + halfSize},${y} 
      ${x + size},${y + height / 2} 
      ${x + size},${y + height / 2 + halfSize} 
      ${x + halfSize},${y + size} 
      ${x},${y + height / 2 + halfSize} 
      ${x},${y + height / 2}
    `.trim();
  }

  handleClick(shape: SVGElement) {
    if (this.mode === 'clickFill') {
      this.renderer.setAttribute(shape, 'fill', 'var(--secondary-color)');
    } else if (this.mode === 'outline') {
      this.renderer.setAttribute(shape, 'stroke', 'var(--secondary-color)');
      this.renderer.setAttribute(shape, 'fill', 'none');
    }
  }

  handleMouseMove(event: MouseEvent, shape: SVGElement) {
    if (this.mode === 'fastFill') {
      const isLeftButton = event.buttons === 1; // Linke Maustaste gedrückt
      if (isLeftButton) {
        this.renderer.setAttribute(shape, 'fill', 'var(--secondary-color)');
      }
    } else if (this.mode === 'snapToLine') {
      const snapShape = this.getClosestShape(event.offsetX, event.offsetY);
      if (snapShape) {
        this.renderer.setAttribute(snapShape, 'fill', 'var(--secondary-color)');
      }
    }
  }

  getClosestShape(x: number, y: number): SVGElement | null {
    const shapes = Array.from(this.gridCanvas.nativeElement.querySelectorAll('.grid-shape')) as SVGElement[];
    let closestShape: SVGElement | null = null;
    let closestDistance = Infinity;

    shapes.forEach((shape) => {
      const cx =
        this.shape === 'circle'
          ? parseFloat(shape.getAttribute('cx')!)
          : parseFloat(shape.getAttribute('x')!) + this.cellSize / 2;
      const cy =
        this.shape === 'circle'
          ? parseFloat(shape.getAttribute('cy')!)
          : parseFloat(shape.getAttribute('y')!) + this.cellSize / 2;

      const distance = Math.sqrt(Math.pow(cx - x, 2) + Math.pow(cy - y, 2));

      if (distance < closestDistance) {
        closestDistance = distance;
        closestShape = shape;
      }
    });

    return closestShape;
  }

  downloadSVG(includeGrid: boolean) {
    const svg = this.gridCanvas.nativeElement.cloneNode(true) as SVGElement;

    if (!includeGrid) {
      const shapes = svg.querySelectorAll('.grid-shape');
      shapes.forEach((shape) => {
        const fill = shape.getAttribute('fill');
        if (fill === 'none' || !fill) {
          shape.remove();
        }
      });
    }

    const serializer = new XMLSerializer();
    const svgContent = serializer.serializeToString(svg);

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'grid-pattern.svg';
    link.click();

    URL.revokeObjectURL(url);
  }

  setMode(mode: 'fastFill' | 'clickFill' | 'outline' | 'snapToLine') {
    this.mode = mode;
  }
}
