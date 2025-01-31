import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-color-switch',
  templateUrl: './color-switch.component.html',
  styleUrls: ['./color-switch.component.scss'],
})
export class ColorSwitchComponent implements OnInit {
  // Lokale Variablen für die Farben
  primaryColor: string = ''; // Wird aus der globalen CSS-Variable geladen
  secondaryColor: string = ''; // Wird aus der globalen CSS-Variable geladen

  ngOnInit(): void {
    // Initialisiere die Farben aus den CSS-Variablen
    const root = document.documentElement;

    // Holen der Standardfarben aus den CSS-Variablen
    this.primaryColor = getComputedStyle(root).getPropertyValue('--primary-color').trim() || '#ffffff';
    this.secondaryColor = getComputedStyle(root).getPropertyValue('--secondary-color').trim() || '#a600ff';

    // Setze die Farben auf die Picker-Inputs (Fallback-Farben sind optional)
    document.documentElement.style.setProperty('--primary-color', this.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', this.secondaryColor);

    // Setze Event Listener für das Zeichnen
    this.setupEventListeners();
  }

  // Methode: Farbe aktualisieren, wenn ein Picker benutzt wird
  changeColor(event: Event, colorType: string): void {
    const input = event.target as HTMLInputElement;
    const newColor = input.value;

    // Aktualisiere die CSS-Variable
    document.documentElement.style.setProperty(`--${colorType}`, newColor);

    // Aktualisiere die lokale Variable
    if (colorType === 'primary-color') {
      this.primaryColor = newColor;
    } else if (colorType === 'secondary-color') {
      this.secondaryColor = newColor;
    }
  }

  // Methode: Farben tauschen
  switchColors(): void {
    const root = document.documentElement;

    // Tausche die CSS-Variablen
    root.style.setProperty('--primary-color', this.secondaryColor);
    root.style.setProperty('--secondary-color', this.primaryColor);

    // Tausche die lokalen Variablen
    const temp = this.primaryColor;
    this.primaryColor = this.secondaryColor;
    this.secondaryColor = temp;
  }

  // HostListener für Fenster-Fokus (nach Tab-Wechsel)
  @HostListener('window:focus', [])
  onWindowFocus(): void {
    console.log('Fenster ist wieder aktiv, stelle Event Listener wieder her.');
    this.setupEventListeners();
  }

  // Methode zum Setzen von Event Listenern
  private setupEventListeners(): void {
    console.log('Setze Event Listener für Zeichnen neu.');
    // Hier können spezifische Events für das Zeichnen wieder gesetzt werden.
    // Beispiel: Falls du SVG-Zeichen-Events nutzt, setze sie erneut.
  }
}
