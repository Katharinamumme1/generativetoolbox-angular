import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import opentype from 'opentype.js';

interface LetterDrawing {
  letter: string;
  unicode: number;
  svgId: string;
  paths: string[];
}

@Component({
  selector: 'app-handdrawnFont',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './handdrawnfont.component.html',
  styleUrls: ['./handdrawnfont.component.scss']
})
export class HandDrawnFontComponent implements AfterViewInit {
  @ViewChild('fontContainer', { static: true }) fontContainer!: ElementRef;
  public drawings: LetterDrawing[] = [];
  private unicodeStart = 65;
  private isDrawing: boolean = false;
  public showFill: boolean = true; // ✅ Standardmäßig Füllung anzeigen

  // ✅ Alle wichtigen Glyphen (inklusive Satzzeichen & Sonderzeichen)
  private letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?-":;()'.split('');

  constructor() {
    this.letters.forEach((letter, index) => {
      this.drawings.push({
        letter,
        unicode: letter.charCodeAt(0),
        svgId: `canvas-${letter}`,
        paths: []
      });
    });
  }

  ngAfterViewInit() {
    this.drawings.forEach(drawing => this.setupDrawingCanvas(drawing));
  }

  toggleFill(): void {
    this.drawings.forEach(drawing => {
      const svg = document.getElementById(drawing.svgId) as SVGSVGElement | null;
      if (svg) {
        this.updateSvg(svg, drawing.paths);
      }
    });
  }

  private setupDrawingCanvas(drawing: LetterDrawing): void {
    const svg = document.getElementById(drawing.svgId) as SVGSVGElement | null;
    if (!svg) return;

    let currentPath: string[] = [];

    // Funktion zum Umrechnen von Mauskoordinaten auf SVG-Koordinaten
    const getSVGCoords = (event: MouseEvent, svg: SVGSVGElement) => {
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const transformedPoint = point.matrixTransform(svg.getScreenCTM()?.inverse());
      return { x: transformedPoint.x, y: transformedPoint.y };
    };

    svg.addEventListener('mousedown', (event: MouseEvent) => {
      this.isDrawing = true;
      const { x, y } = getSVGCoords(event, svg);
      currentPath = [`M${x},${y}`];
    });

    svg.addEventListener('mousemove', (event: MouseEvent) => {
      if (!this.isDrawing) return;
      const { x, y } = getSVGCoords(event, svg);
      currentPath.push(`L${x},${y}`);
      this.updateSvg(svg, drawing.paths.concat([currentPath.join(' ')]));
    });

    svg.addEventListener('mouseup', () => {
      this.isDrawing = false;
      if (currentPath.length > 1) {
        drawing.paths.push(currentPath.join(' ') + ' Z');
      }
      this.updateSvg(svg, drawing.paths);
    });

    this.updateSvg(svg, drawing.paths);
  }

  private updateSvg(svg: SVGSVGElement, paths: string[]): void {
    svg.querySelectorAll('path').forEach(path => path.remove());

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElement.setAttribute('d', paths.join(' '));
    pathElement.setAttribute('stroke', 'var(--secondary-color)');
    pathElement.setAttribute('stroke-width', '2');
    pathElement.setAttribute('fill', this.showFill ? 'var(--secondary-color)' : 'none'); // ✅ Füllung umschalten
    pathElement.setAttribute('fill-rule', 'evenodd');
    svg.appendChild(pathElement);

    this.drawGuidelines(svg);
  }

  private drawGuidelines(svg: SVGSVGElement): void {
    const lines = [
      { y: 100, label: 'Cap Height', color: 'red' },
      { y: 70, label: 'x-Height', color: 'blue' },
      { y: 50, label: 'Baseline', color: 'green' },
      { y: 20, label: 'Descender', color: 'gray' }
    ];

    lines.forEach(({ y, label }) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', y.toString());
      line.setAttribute('x2', '100');
      line.setAttribute('y2', y.toString());
      line.setAttribute('stroke', 'var(--secondary-color)');
      line.setAttribute('stroke-width', '1');
      svg.appendChild(line);
    });
  }

  public exportFont(): void {
    const glyphs: any[] = [];

    this.drawings.forEach(({ letter, unicode, paths, svgId }) => {
      if (paths.length === 0) return;

      const opentypePath = new (opentype as any).Path();
      const svg = document.getElementById(svgId) as SVGSVGElement | null;
      if (!svg) return;

      paths.forEach(path => this.convertSvgPathToOpentype(opentypePath, path, svg));

      glyphs.push(new (opentype as any).Glyph({
        name: letter,
        unicode: unicode,
        advanceWidth: 600,
        path: opentypePath
      }));
    });

    if (glyphs.length === 0) {
      alert("Keine Buchstaben erstellt!");
      return;
    }

    const font = new (opentype as any).Font({
      familyName: 'HandDrawnFont',
      styleName: 'Regular',
      unitsPerEm: 1000,
      ascender: 800,
      descender: -200,
      glyphs
    });

    const otfArrayBuffer = font.toArrayBuffer();
    const blob = new Blob([otfArrayBuffer], { type: 'font/otf' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'HandDrawnFont.otf';
    link.click();
  }

  private convertSvgPathToOpentype(opentypePath: any, svgPath: string, svg: SVGSVGElement): void {
    const commands = svgPath.match(/[ML]\d+(\.\d+)?,\d+(\.\d+)?/g);
    if (!commands) return;

    const viewBox = svg.viewBox.baseVal;
    const svgWidth = viewBox.width || svg.clientWidth;
    const svgHeight = viewBox.height || svg.clientHeight;

    const scaleX = 1000 / svgWidth;
    const scaleY = -1000 / svgHeight;

    commands.forEach(cmd => {
      const [command, coords] = [cmd.charAt(0), cmd.substring(1)];
      const [x, y] = coords.split(',').map(Number);

      const scaledX = x * scaleX;
      const scaledY = 1000 + (y * scaleY);

      if (command === 'M') {
        opentypePath.moveTo(scaledX, scaledY);
      } else if (command === 'L') {
        opentypePath.lineTo(scaledX, scaledY);
      }
    });

    opentypePath.close();
  }
}
