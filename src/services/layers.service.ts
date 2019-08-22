import {EventEmitter, Injectable, Output} from "@angular/core";
import {Layer} from "../models/layer";
import {LayerOperation} from "../models/layer-operation";

@Injectable({
    providedIn: 'root'
})
export class LayersService {

    @Output() executeOperation: EventEmitter<LayerOperation> = new EventEmitter();
    @Output() layersList: EventEmitter<Layer[]> = new EventEmitter();

    runOperation(operation: LayerOperation) {
        this.executeOperation.emit(operation);
    }

    setLayers(layers: Layer[]) {
        console.log('s')
        this.layersList.emit(layers);
    }

}
