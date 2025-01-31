import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customBrush',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custombrush.component.html',
  styleUrls: ['./custombrush.component.scss']
})
export class CustomBrushComponent implements AfterViewInit {
  @ViewChild('smallCanvas', { static: false }) smallCanvasRef!: ElementRef<SVGSVGElement>;
  @ViewChild('largeCanvas', { static: false }) largeCanvasRef!: ElementRef<SVGSVGElement>;
  @ViewChild('drawingArea', { static: false }) drawingAreaRef!: ElementRef<SVGGElement>;
  @ViewChild('rectangleGrid', { static: false }) rectangleGridRef!: ElementRef<SVGGElement>;

  drawingPath: string = '';
  isDrawing: boolean = false;
  isDrawingLarge: boolean = false;
  numRows: number = 10;
  numCols: number = 10;
  gridSize: number = 20;
  pathElement: SVGPathElement | null = null;
  listenersAdded = false; // Prüft, ob Event-Listener bereits existieren

  ngAfterViewInit(): void {
    if (!this.listenersAdded) {
      this.setupEventListeners();
      this.listenersAdded = true;
    }
    this.drawRectangleGrid();
  }

  setupEventListeners(): void {
    const smallCanvas = this.smallCanvasRef.nativeElement;
    smallCanvas.addEventListener('mousedown', (event) => this.startDrawing(event));
    smallCanvas.addEventListener('mousemove', (event) => this.draw(event));
    window.addEventListener('mouseup', () => this.stopDrawing()); // Fenster-Listener verhindert Hänger

    const largeCanvas = this.largeCanvasRef.nativeElement;
    largeCanvas.addEventListener('mousedown', (event) => this.startLargeDrawing(event));
    largeCanvas.addEventListener('mousemove', (event) => this.drawLarge(event));
    window.addEventListener('mouseup', () => this.stopLargeDrawing()); // Fenster-Listener
  }

  startDrawing(event: MouseEvent): void {
    this.isDrawing = true;
    const [x, y] = this.getMousePosition(event, this.smallCanvasRef.nativeElement);
    const [snappedX, snappedY] = this.shouldSnapToGrid() ? this.snapToGrid(x, y) : [x, y];

    this.pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.pathElement.setAttribute('d', `M${snappedX},${snappedY}`);
    this.pathElement.setAttribute('stroke', 'var(--secondary-color)');
    this.pathElement.setAttribute('stroke-width', '2');
    this.pathElement.setAttribute('fill', 'none');

    this.drawingAreaRef.nativeElement.appendChild(this.pathElement);
  }

  draw(event: MouseEvent): void {
    if (!this.isDrawing || !this.pathElement) return;
    const [x, y] = this.getMousePosition(event, this.smallCanvasRef.nativeElement);
    const [snappedX, snappedY] = this.shouldSnapToGrid() ? this.snapToGrid(x, y) : [x, y];

    const pathData = this.pathElement.getAttribute('d') + ` L${snappedX},${snappedY}`;
    this.pathElement.setAttribute('d', pathData);
  }

  stopDrawing(): void {
    this.isDrawing = false;
    if (this.pathElement) {
      this.drawingPath = this.pathElement.getAttribute('d') || '';
      this.pathElement = null; // **Fix: Path-Element zurücksetzen**
    }
  }

  getMousePosition(event: MouseEvent, canvas: SVGSVGElement): [number, number] {
    const rect = canvas.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
  }

  snapToGrid(x: number, y: number): [number, number] {
    const rectWidth = this.smallCanvasRef.nativeElement.width.baseVal.value;
    const rectHeight = this.smallCanvasRef.nativeElement.height.baseVal.value;
    const gridX = rectWidth / this.numCols;
    const gridY = rectHeight / this.numRows;

    const snappedX = Math.round(x / gridX) * gridX;
    const snappedY = Math.round(y / gridY) * gridY;

    return [snappedX, snappedY];
  }

  shouldSnapToGrid(): boolean {
    return this.rectangleGridRef.nativeElement.style.visibility === 'visible';
  }

  drawRectangleGrid(): void {
    const grid = this.rectangleGridRef.nativeElement;
    grid.innerHTML = '';

    const width = this.smallCanvasRef.nativeElement.width.baseVal.value;
    const height = this.smallCanvasRef.nativeElement.height.baseVal.value;

    for (let row = 0; row <= this.numRows; row++) {
      const y = (row * height) / this.numRows;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', y.toString());
      line.setAttribute('x2', width.toString());
      line.setAttribute('y2', y.toString());
      line.setAttribute('stroke', '#ccc');
      line.setAttribute('stroke-width', '1');
      grid.appendChild(line);
    }

    for (let col = 0; col <= this.numCols; col++) {
      const x = (col * width) / this.numCols;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x.toString());
      line.setAttribute('y1', '0');
      line.setAttribute('x2', x.toString());
      line.setAttribute('y2', height.toString());
      line.setAttribute('stroke', '#ccc');
      line.setAttribute('stroke-width', '1');
      grid.appendChild(line);
    }
  }

  toggleGrid(): void {
    const grid = this.rectangleGridRef.nativeElement;
    grid.style.visibility = grid.style.visibility === 'visible' ? 'hidden' : 'visible';
    this.drawRectangleGrid();
  }

  startLargeDrawing(event: MouseEvent): void {
    if (!this.drawingPath) return;
    this.isDrawingLarge = true;
    const [x, y] = this.getMousePosition(event, this.largeCanvasRef.nativeElement);
    this.drawRepeatedPattern(x, y);
  }

  drawLarge(event: MouseEvent): void {
    if (!this.isDrawingLarge) return;
    const [x, y] = this.getMousePosition(event, this.largeCanvasRef.nativeElement);
    this.drawRepeatedPattern(x, y);
  }

  stopLargeDrawing(): void {
    this.isDrawingLarge = false;
  }

  drawRepeatedPattern(x: number, y: number): void {
    const largeCanvas = this.largeCanvasRef.nativeElement;
    const pathElementLarge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElementLarge.setAttribute('d', this.drawingPath);
    pathElementLarge.setAttribute('stroke', 'var(--secondary-color)');
    pathElementLarge.setAttribute('stroke-width', '2');
    pathElementLarge.setAttribute('fill', 'none');
    pathElementLarge.setAttribute('transform', `translate(${x}, ${y})`);
    largeCanvas.appendChild(pathElementLarge);
  }
}

