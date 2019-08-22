import {LayerOperationsEnum} from "../enums/layer-operations.enum";
import {Layer} from "./layer";

export class LayerOperation {
  constructor(
    public type?: LayerOperationsEnum,
    public layer?: Layer
  ) {
  }
}
