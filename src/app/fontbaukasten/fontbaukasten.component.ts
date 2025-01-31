import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as FileSaver from 'file-saver';
import * as opentype from 'opentype.js';

interface ShapeElement {
  id: string;
  svg: string;
  x: number;
  y: number;
}

@Component({
  selector: 'app-fontbaukasten',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fontbaukasten.component.html',
  styleUrls: ['./fontbaukasten.component.scss']
})
export class FontbaukastenComponent {
  shapes = [
    { id: 'circle', svg: '<circle cx="50" cy="50" r="30" fill="black"/>' },
    { id: 'rect', svg: '<rect x="20" y="20" width="60" height="60" fill="black"/>' },
    { id: 'triangle', svg: '<polygon points="50,10 10,90 90,90" fill="black"/>' }
  ];

  drawings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?'.split('').map(letter => ({
    letter,
    unicode: letter.charCodeAt(0),
    elements: [] as ShapeElement[]
  }));

  /** ✅ Drag & Drop-Funktion verbessert */
  onDragStart(event: DragEvent, shapeId: string) {
    console.log('Dragging:', shapeId);
    event.dataTransfer?.setData('shapeId', shapeId);
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, drawing: any) {
    event.preventDefault();
    const shapeId = event.dataTransfer?.getData('shapeId');
    console.log('Dropped:', shapeId, 'onto:', drawing.letter);
    
    if (shapeId) {
      const shape = this.shapes.find(s => s.id === shapeId);
      if (shape) {
        drawing.elements.push({ id: shape.id, svg: shape.svg, x: 10, y: 10 });
      }
    }
  }

  moveElement(event: MouseEvent, element: ShapeElement) {
    element.x = event.offsetX;
    element.y = event.offsetY;
  }
}
