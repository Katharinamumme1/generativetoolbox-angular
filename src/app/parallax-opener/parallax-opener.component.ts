import { Component, EventEmitter, Output, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-parallax-opener',
  standalone: true,
  templateUrl: './parallax-opener.component.html',
  styleUrls: ['./parallax-opener.component.scss'],
})
export class ParallaxOpenerComponent implements OnInit {
  @Output() finished: EventEmitter<void> = new EventEmitter<void>();

  private maxScroll: number = 0;

  ngOnInit(): void {
    this.maxScroll = document.body.scrollHeight - window.innerHeight;
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    const scrollY = window.scrollY;
    const progress = Math.min(scrollY / this.maxScroll, 1);

    // Shrink black div
    const blackDiv = document.getElementById('blackDiv');
    if (blackDiv) {
      const scale = 1 - progress * 0.7; // Shrink down to 30%
      blackDiv.style.transform = `scale(${scale}) translateZ(0)`;
    }

    // Animate SVG paths
    const paths = document.querySelectorAll('path, line, circle, rect');
    paths.forEach((path) => {
      const offset = 500 - 500 * progress;
      (path as SVGPathElement).style.strokeDashoffset = `${offset}`;
    });

    // Parallax effect on layers
    const layers = document.querySelectorAll('.parallax-layer');
    layers.forEach((layer, index) => {
      const direction = index % 2 === 0 ? 1 : -1; // Alternate directions
      const depth = (index + 1) * 300;
      const speed = 1 + index * 0.2;
      const layerOffset = direction * progress * depth * speed;
      const scale = 1 + progress * (0.6 + index * 0.15);
      (layer as HTMLElement).style.transform = `translateY(${layerOffset}px) scale(${scale}) translateZ(0)`;
    });

    // Parallax effect on text
    const texts = document.querySelectorAll('.scroll-text');
    texts.forEach((text, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      const depth = (index + 1) * 150;
      const textOffset = direction * progress * depth;
      (text as HTMLElement).style.transform = `translateY(${textOffset}px) translateZ(0)`;
    });

    // Check if scroll is at the end
    if (scrollY >= this.maxScroll - 100) {
      this.goToPegboard();
    }
  }

  goToPegboard(): void {
    this.finished.emit(); // Notify parent to switch to the pegboard
  }
}
