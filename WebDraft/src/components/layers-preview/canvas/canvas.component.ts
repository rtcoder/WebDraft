import {Component, Input, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {
  @Input() width: number;
  @Input() height: number;
  @ViewChild('canvas') canvas: HTMLCanvasElement;

  @Input() set data(data: ImageData) {
    if (!data) {
      return;
    }
    const ctx = this.canvas.getContext('2d');
    ctx.putImageData(data, 0, 0);
  }

  ngOnInit(): void {

  }
}
