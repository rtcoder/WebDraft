import {Component, HostListener, OnInit} from '@angular/core';
import {KeysEnum} from "../../enums/keys.enum";
import {LayersService} from "../../services/layers.service";
import {LayerOperation} from "../../models/layer-operation";
import {LayerOperationsEnum} from "../../enums/layer-operations.enum";

@Component({
  selector: 'app-hotkeys',
  templateUrl: './hotkeys.component.html',
  styleUrls: ['./hotkeys.component.scss']
})
export class HotkeysComponent implements OnInit {
  show = false;

  constructor(private layersService: LayersService) {
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown($event: KeyboardEvent) {
    console.log(($event))
    $event.preventDefault();
    if ($event.ctrlKey || $event.metaKey) {
      switch ($event.code) {
        case KeysEnum.I:
          this.show = !this.show;
          break;
        case KeysEnum.S:
          // save file
          break;
        case KeysEnum.O:
          // upload file
          break;
        case KeysEnum.DELETE:
          this.layersService.runOperation(new LayerOperation(LayerOperationsEnum.CLEAR));
          break;
        case KeysEnum.C:
          // copy
          break;
        case KeysEnum.X:
          // cut
          break;
        case KeysEnum.V:
          // paste
          break;
      }
    }
    if (!$event.ctrlKey && !$event.altKey && !$event.metaKey && !$event.shiftKey && !$event) {
      if ($event.code === KeysEnum.DELETE) {
        // delete selection
      }
    }
  }

  ngOnInit(): void {

  }
}
