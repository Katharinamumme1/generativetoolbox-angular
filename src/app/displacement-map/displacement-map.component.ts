import { Component, AfterViewInit, ViewChild, ElementRef, Renderer2, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-displacement-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './displacement-map.component.html',
  styleUrls: ['./displacement-map.component.scss'],
})
export class DisplacementMapComponent implements AfterViewInit {
  @ViewChild('dynamicText', { static: false }) dynamicText!: ElementRef<SVGTextElement>;
  @ViewChild('svgWorkspace', { static: false }) svgWorkspace!: ElementRef<SVGSVGElement>;
  @ViewChild('displacementImage', { static: false }) displacementImage!: ElementRef<SVGImageElement>;
  @ViewChild('feDisplacementMap', { static: false }) feDisplacementMap!: ElementRef<SVGElement>;

  scale: number = 20; // Displacement-Map-Scale
  fontSize: number = 120; // Standard-Schriftgröße
  textContent: string = 'Klicke hier, um zu schreiben'; // Platzhaltertext
  imageSize: number = 100; // Displacement-Image-Größe

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit(): void {
    this.updateDisplacementScale();
    this.updateDisplacementImageSize();
    this.applyWordWrap();
  }



  adjustFontSize(newSize: number): void {
    this.fontSize = newSize;
    this.dynamicText.nativeElement.style.fontSize = `${this.fontSize}px`;
    this.applyWordWrap();
  }

  adjustScale(newScale: number): void {
    this.scale = newScale;
    this.updateDisplacementScale();
  }

  adjustImageSize(newSize: number): void {
    this.imageSize = newSize;
    this.updateDisplacementImageSize();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (this.textContent === 'Klicke hier, um zu schreiben') {
        this.textContent = ''; // Platzhalter entfernen
      }
      this.textContent += '\n';
    } else if (event.key === 'Backspace') {
      if (this.textContent === 'Klicke hier, um zu schreiben') {
        this.textContent = ''; // Platzhalter entfernen
      } else {
        this.textContent = this.textContent.slice(0, -1);
      }
    } else if (event.key.length === 1) {
      if (this.textContent === 'Klicke hier, um zu schreiben') {
        this.textContent = ''; // Platzhalter entfernen
      }
      this.textContent += event.key;
    }

    this.applyWordWrap();
  }

  private applyWordWrap(): void {
    if (this.dynamicText) {
      while (this.dynamicText.nativeElement.firstChild) {
        this.dynamicText.nativeElement.removeChild(this.dynamicText.nativeElement.firstChild);
      }

      const words = this.textContent.split(' ');
      const workspaceWidth = this.svgWorkspace.nativeElement.clientWidth - 20; // Rand berücksichtigen
      const lineHeight = this.fontSize * 1.2; // Zeilenhöhe
      let currentLine = '';
      let lineIndex = 0;

      words.forEach((word) => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const testLineWidth = this.calculateTextWidth(testLine);

        if (testLineWidth > workspaceWidth) {
          this.addTspan(currentLine, lineIndex++ * lineHeight);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });

      if (currentLine) {
        this.addTspan(currentLine, lineIndex * lineHeight);
      }
    }
  }

  private calculateTextWidth(text: string): number {
    const tempText = this.renderer.createElement('text', 'svg');
    this.renderer.setStyle(tempText, 'visibility', 'hidden');
    this.renderer.setAttribute(tempText, 'font-size', `${this.fontSize}px`);
    this.renderer.setProperty(tempText, 'textContent', text);
    this.renderer.appendChild(this.svgWorkspace.nativeElement, tempText);
    const width = tempText.getBBox().width;
    this.renderer.removeChild(this.svgWorkspace.nativeElement, tempText);
    return width;
  }

  private addTspan(text: string, dy: number): void {
    const tspan = this.renderer.createElement('tspan', 'svg');
    this.renderer.setAttribute(tspan, 'x', '10'); // Startet von der linken Seite
    this.renderer.setAttribute(tspan, 'dy', `${dy}px`);
    tspan.textContent = text;
    this.renderer.appendChild(this.dynamicText.nativeElement, tspan);
  }

  uploadDisplacementMap(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        if (this.displacementImage) {
          this.displacementImage.nativeElement.setAttribute('href', reader.result as string);
        }
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  private updateDisplacementScale(): void {
    if (this.feDisplacementMap) {
      this.renderer.setAttribute(this.feDisplacementMap.nativeElement, 'scale', `${this.scale}`);
    }
  }

  private updateDisplacementImageSize(): void {
    if (this.displacementImage) {
      const offset = (100 - this.imageSize) / 2;
      this.renderer.setAttribute(this.displacementImage.nativeElement, 'width', `${this.imageSize}%`);
      this.renderer.setAttribute(this.displacementImage.nativeElement, 'height', `${this.imageSize}%`);
      this.renderer.setAttribute(this.displacementImage.nativeElement, 'x', `${offset}%`);
      this.renderer.setAttribute(this.displacementImage.nativeElement, 'y', `${offset}%`);
    }
  }
}
