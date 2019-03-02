import {Component, OnInit} from '@angular/core';
import {Layer} from "../../models/layer";
import {LayersService} from "../../services/layers.service";
import {LayerOperation} from "../../models/layer-operation";
import {LayerOperationsEnum} from "../../enums/layer-operations.enum";

@Component({
  selector: 'app-layers',
  templateUrl: './layers.component.html',
  styleUrls: ['./layers.component.scss']
})
export class LayersComponent implements OnInit {
  layerOperationsEnum = LayerOperationsEnum;
  layers: Layer[] = [];
  layersWidth = 600;
  layersHeight = 400;

  constructor(private layersService: LayersService) {

  }

  ngOnInit(): void {
    if (!this.layers.length) {
      this.newLayer();
    }
    this.layersService.executeOperation.subscribe((operation: LayerOperation) => {
      switch (operation.type) {
        case this.layerOperationsEnum.ADD:
          this.newLayer(operation.layer);
          break;
        case this.layerOperationsEnum.REMOVE:
          this.removeLayer(operation.layer);
          break;
        case this.layerOperationsEnum.ACTIVATE:
          this.setActiveLayer(operation.layer.id);
          break;
      }
    })
  }

  private newLayer(layer: Layer = new Layer()) {
    let zIndex = 1;
    if (this.layers.length) {
      const maxZIndex = this.getMaxZIndex();
      zIndex = maxZIndex + 1;
    }

    const newLayer = new Layer(Object.assign({
      zIndex: zIndex,
      active: true,
      height: this.layersHeight,
      width: this.layersWidth,
      visible: true,
      offsetLeft: 0,
      offsetTop: 0,
      data: null
    }, layer));

    this.layers.push(newLayer);
    this.setActiveLayer(newLayer.id);
  }

  private removeLayer(layer?: Layer) {
    if (!this.layers.length) {
      return;
    }
    let layerIndex = null;
    if (!layer) {
      layerIndex = this.layers.findIndex((_layer: Layer) => _layer.active);
    } else {
      layerIndex = this.layers.findIndex((_layer: Layer) => _layer.id === layer.id);
    }

    if (layerIndex === -1) {
      return;
    }

    this.layers.splice(layerIndex, 1);

    if (!this.layers.length) {
      this.layersService.setLayers(this.layers);
      return;
    }

    const maxZIndex = this.getMaxZIndex();
    const layerToActivate = this.layers.find((_layer: Layer) => _layer.zIndex === maxZIndex);

    this.setActiveLayer(layerToActivate.id);
  }

  private setActiveLayer(id: string) {
    this.layers = this.layers.map((layer: Layer) => {
      layer.active = layer.id === id;
      return layer;
    });
    setTimeout(() => {
      this.layersService.setLayers(this.layers);
    }, 1);
    console.log(this.layers)
  }

  private getMaxZIndex(): number {
    return Math.max.apply(Math, this.layers.map((_layer: Layer) => _layer.zIndex));
  }
}
