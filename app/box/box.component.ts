import {
  Component,
  ElementRef,
  AfterViewInit,
  Renderer2,
  QueryList,
  ViewChildren,
} from '@angular/core';

@Component({
  selector: 'box-component',
  template: `
    <h3>Current font size <pre>{{fontSize}}</pre></h3>
    <span>should have ellipsis <pre>{{ellipsis}}</pre></span>
    <div class="container" [ngStyle]="{'font-size.px': fontSize}">
      <div #row *ngFor="let id of entries">{{ id }}</div>
    </div>
  `,
  styles: [
    `
    .container {
      white-space: pre-wrap; /* Allows line breaks */
      border: 2px solid red;
      width: 30%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `,
  ],
})
export class BoxComponent implements AfterViewInit {
  @ViewChildren('row') private rows!: QueryList<ElementRef>;
  ellipsis = false;
  entries = 'ID 000 000011, ID 0001 111111, ID 0001111'.split(','); // Example data
  private _fontSize = 16; // Default font size

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.rows.changes.subscribe(() => {
      this.updateFontSizeBasedOnRows();
    });
    this.updateFontSizeBasedOnRows();
  }

  private updateFontSizeBasedOnRows() {
    const rowCount = this.calculateRowCount();
    this.fontSize = this.getFontSizeBasedOnRowCount(rowCount);
  }

  private calculateRowCount(): number {
    let rowCount = 0;
    const singleLineHeight = this.getSingleLineHeight();

    this.rows.forEach((row) => {
      const currentHeight = row.nativeElement.offsetHeight;
      rowCount += Math.ceil(currentHeight / singleLineHeight);
    });

    return rowCount;
  }

  /**
   * Calculates the height of a single line of text within a div element.
   * This method is used for determining the number of lines a text occupies.
   *
   * Steps:
   * 1. Creates a temporary div element for measurement.
   * 2. Sets the div to be invisible and prevents text wrapping to ensure accurate measurement.
   * 3. Appends text to the temporary div using the text content of a sample row.
   * 4. Appends the temporary div to the DOM to render and measure its height.
   * 5. Measures the height of the div, obtaining the height of a single text line.
   * 6. Removes the temporary div from the DOM after measurement.
   */
  private getSingleLineHeight(): number {
    const sampleRow = this.rows.first.nativeElement;
    const tempDiv = this.renderer.createElement('div');
    this.renderer.setStyle(tempDiv, 'visibility', 'hidden');
    this.renderer.setStyle(tempDiv, 'white-space', 'nowrap');
    this.renderer.appendChild(
      tempDiv,
      this.renderer.createText(sampleRow.textContent || '')
    );
    this.renderer.appendChild(sampleRow, tempDiv);
    const height = tempDiv.offsetHeight;
    this.renderer.removeChild(sampleRow, tempDiv);
    return height;
  }

  private getFontSizeBasedOnRowCount(rowCount: number): number {
    if (rowCount > 3) {
      this.applyEllipsis();
      return this._fontSize;
    }
    switch (rowCount) {
      case 1:
        return 18;
      case 2:
        return 16;
      case 3:
        return 14;
      default:
        return 14; // Default font size
    }
  }

  private applyEllipsis() {
    // You can add additional logic here if needed to handle ellipsis
    this.ellipsis = true;
  }

  get fontSize(): number {
    return this._fontSize;
  }

  set fontSize(newValue: number) {
    this._fontSize = newValue;
  }
}
