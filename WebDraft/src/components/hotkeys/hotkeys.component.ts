import {Component, HostListener, OnInit} from '@angular/core';
import {KeysEnum} from "../../enums/keys.enum";
import {LayersService} from "../../services/layers.service";
import {LayerOperation} from "../../models/layer-operation";
import {LayerOperationsEnum} from "../../enums/layer-operations.enum";

const KEYS_DESCRIPTION = [
  {
    title: 'General',
    keys: [
      {
        value: 'CTRL + /',
        description: 'Toggle this info'
      },
      {
        value: 'CTRL + H',
        description: 'History'
      },
      {
        value: 'CTRL + S',
        description: 'Save image'
      },
      {
        value: 'CTRL + O',
        description: 'Upload image'
      },
      {
        value: 'CTRL + DEL',
        description: 'Clear image'
      },
      {
        value: 'CTRL + Scroll',
        description: 'Pencil size'
      },
    ]
  },
  {
    title: 'Selection',
    keys: [
      {
        value: 'CTRL + X',
        description: 'Cut'
      },
      {
        value: 'CTRL + C',
        description: 'Copy'
      },
      {
        value: 'CTRL + V',
        description: 'Paste'
      },
      {
        value: 'DEL',
        description: 'Delete selection'
      },
    ]
  },
];

@Component({
  selector: 'app-hotkeys',
  templateUrl: './hotkeys.component.html',
  styleUrls: ['./hotkeys.component.scss']
})
export class HotkeysComponent implements OnInit {
  show = false;
  keysDescription = KEYS_DESCRIPTION;

  constructor(private layersService: LayersService) {
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown($event: KeyboardEvent) {
    console.log(($event))
    $event.preventDefault();
    if ($event.ctrlKey || $event.metaKey) {
      switch ($event.code) {
        case KeysEnum.SLASH:
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
        case KeysEnum.R:
          window.location.reload();
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
