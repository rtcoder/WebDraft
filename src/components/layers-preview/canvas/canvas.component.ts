import {Component, Input, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {
  @Input() width!: number;
  @Input() height!: number;
  @ViewChild('canvas', { static: true }) canvas!: HTMLCanvasElement;

  @Input() set data(data: ImageData) {
    if (!data) {
      return;
    }

    this.cx = this.canvas.getContext('2d');
    if (this.cx) {
      this.cx.putImageData(data, 0, 0);
    }
  }

  private cx: CanvasRenderingContext2D | null = null;

  ngOnInit(): void {

  }
}
