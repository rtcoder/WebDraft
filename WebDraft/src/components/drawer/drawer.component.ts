import {Component, Input, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss']
})
export class DrawerComponent implements OnInit {
  @ViewChild('drawer') drawer: HTMLCanvasElement;

  @Input() set data(data: ImageData) {
    if (!data) {
      return;
    }
    this.cx = this.drawer.getContext('2d');
    this.cx.putImageData(data, 0, 0);
  }

  private cx: CanvasRenderingContext2D;

  ngOnInit(): void {

  }
}
