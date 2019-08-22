import {Component, OnInit} from '@angular/core';
import {Layer} from "../../models/layer";
import {LayersService} from "../../services/layers.service";
import {LayerOperation} from "../../models/layer-operation";
import {LayerOperationsEnum} from "../../enums/layer-operations.enum";

@Component({
  selector: 'app-layers-preview',
  templateUrl: './layers-preview.component.html',
  styleUrls: ['./layers-preview.component.scss']
})
export class LayersPreviewComponent implements OnInit {
  layers: Layer[] = [];

  constructor(private layersService: LayersService) {

  }

  ngOnInit(): void {
    this.layersService.layersList.subscribe((layers: Layer[]) => this.layers = layers)
  }

  addLayer() {
    const operation = new LayerOperation(LayerOperationsEnum.ADD);
    this.layersService.runOperation(operation);
  }

  removeLayer() {
    const operation = new LayerOperation(
      LayerOperationsEnum.REMOVE,
      this.layers.find((layer: Layer) => layer.active)
    );
    this.layersService.runOperation(operation);
  }

  activateLayer(layer: Layer) {
    const operation = new LayerOperation(
      LayerOperationsEnum.ACTIVATE,
      layer
    );
    this.layersService.runOperation(operation);
  }
}
