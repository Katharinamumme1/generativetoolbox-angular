import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

interface Point {
  x: number;
  y: number;
}

interface Line {
  points: Point[];
}

@Component({
  selector: 'app-distortedPattern',
  templateUrl: './distortedpattern.component.html',
  styleUrls: ['./distortedpattern.component.scss'],
  imports: [FormsModule, CommonModule, ReactiveFormsModule]
})
export class DistortedPatternComponent implements OnInit {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef;
  private svg!: SVGSVGElement;
  private isDrawing = false;
  private lines: Line[] = [];
  private currentDistortionType: string = 'vertical';

  settingsForm = new FormGroup({
    layout: new FormControl<string>('horizontal'),
    lineCount: new FormControl<number>(30),
    amplitude: new FormControl<number>(20),
    brushStrength: new FormControl<number>(70),
    lineWidth: new FormControl<number>(1.5),
    distortionType: new FormControl<string>('vertical'),
  });

  distortionTypes: string[] = [
    'vertical', 'horizontal', 'radial', 'chaotic', 'wave', 'vortex', 'shear',
    'gravity', 'collision', 'elastic', 'magnetic', 'bulge', 'sharp'
  ];

  constructor() {}

  ngOnInit(): void {
    this.svg = this.canvasContainer.nativeElement;
    this.generateLines();

    this.settingsForm.valueChanges.subscribe(() => {
      this.currentDistortionType = this.settingsForm.value.distortionType ?? 'vertical';
      this.generateLines();
    });
  }

  private generateLines(): void {
    this.svg.innerHTML = '';
    this.lines = [];
    const lineCount = this.settingsForm.value.lineCount ?? 30;
    const amplitude = this.settingsForm.value.amplitude ?? 20;
    const layout = this.settingsForm.value.layout ?? 'horizontal';
    const width = this.settingsForm.value.lineWidth ?? 1.5;

    const spacing = this.svg.clientHeight / lineCount;

    if (layout === 'horizontal' || layout === 'grid') {
      for (let i = 0; i < lineCount; i++) {
        const y = i * spacing;
        const line: Line = { points: [] };
        for (let x = 0; x <= this.svg.clientWidth; x += 10) {
          const waveY = y + Math.sin((x / 100) * Math.PI * 2) * amplitude * 0.5;
          line.points.push({ x, y: waveY });
        }
        this.lines.push(line);
        this.drawSmoothLine(line, width);
      }
    }

    if (layout === 'vertical' || layout === 'grid') {
      for (let i = 0; i < lineCount; i++) {
        const x = i * spacing;
        const line: Line = { points: [] };
        for (let y = 0; y <= this.svg.clientHeight; y += 10) {
          const waveX = x + Math.sin((y / 100) * Math.PI * 2) * amplitude * 0.5;
          line.points.push({ x: waveX, y });
        }
        this.lines.push(line);
        this.drawSmoothLine(line, width);
      }
    }
  }

  private drawSmoothLine(line: Line, width: number): void {
    const pathData = `M ${line.points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', 'var(--secondary-color)');
    path.setAttribute('stroke-width', width.toString());
    path.setAttribute('fill', 'none');
    this.svg.appendChild(path);
  }

  @HostListener('mousedown', ['$event'])
  startDrawing(event: MouseEvent): void {
    this.isDrawing = true;
  }

  @HostListener('mousemove', ['$event'])
  drawOnCanvas(event: MouseEvent): void {
    if (!this.isDrawing) return;
    const svgCoords = this.getSVGCoordinates(event);
    this.applyDistortion(svgCoords.x, svgCoords.y);
  }

  @HostListener('mouseup', ['$event'])
  stopDrawing(): void {
    this.isDrawing = false;
  }

  private applyDistortion(mouseX: number, mouseY: number): void {
    const type = this.currentDistortionType;
    const amplitude = this.settingsForm.value.amplitude ?? 20;
    const brushStrength = this.settingsForm.value.brushStrength ?? 70;

    for (let line of this.lines) {
      for (let point of line.points) {
        const distance = Math.sqrt((mouseX - point.x) ** 2 + (mouseY - point.y) ** 2);
        if (distance > brushStrength) continue;

        const influence = Math.max(0, brushStrength - distance) / brushStrength;
        const angle = Math.atan2(point.y - mouseY, point.x - mouseX);

        switch (type) {
          case 'vertical':
            point.y += Math.sin(distance * 0.05) * amplitude * influence;
            break;

          case 'horizontal':
            point.x += Math.cos(distance * 0.05) * amplitude * influence;
            break;

          case 'wave':
            point.y += Math.sin(point.x * 0.1) * amplitude * influence;
            break;

          case 'vortex':
            point.x += Math.sin(point.y * 0.1) * amplitude * influence;
            break;

          case 'shear':
            point.x += (mouseX - point.x) * 0.2 * influence;
            point.y += (mouseY - point.y) * 0.2 * influence;
            break;

          case 'collision':
            point.x += (Math.random() - 0.5) * amplitude * influence;
            point.y += (Math.random() - 0.5) * amplitude * influence;
            break;

          case 'bulge':
            const bulgeEffect = Math.exp(-distance / brushStrength) * influence * 50;
            point.y -= bulgeEffect;
            break;

          case 'sharp':
            if (distance < brushStrength / 2) {
              point.y += influence * 30;
            }
            break;

          case 'magnetic':
            point.x += (mouseX - point.x) * influence * 0.1;
            point.y += (mouseY - point.y) * influence * 0.1;
            break;

          case 'gravity':
            point.y += influence * 20;
            break;

          case 'chaotic':
            point.x += (Math.random() - 0.5) * influence * 20;
            point.y += (Math.random() - 0.5) * influence * 20;
            break;

          case 'radial':
            point.x += Math.cos(angle) * influence * 20;
            point.y += Math.sin(angle) * influence * 20;
            break;
        }
      }
    }

    this.redrawLines();
  }

  private getSVGCoordinates(event: MouseEvent): { x: number; y: number } {
    const rect = this.svg.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  private redrawLines(): void {
    this.svg.innerHTML = '';
    for (let line of this.lines) {
      this.drawSmoothLine(line, this.settingsForm.value.lineWidth ?? 1.5);
    }
  }

  downloadSVG(): void {
    const svgData = this.svg.outerHTML;
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'distorted-pattern.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
