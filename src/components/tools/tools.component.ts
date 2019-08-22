import {Component, OnInit} from '@angular/core';
import {ToolsService} from "../../services/tools.service";
import {ToolsEnum} from "../../enums/tools.enum";
import {OperationsEnum} from "../../enums/operations.enum";
import {LayersService} from "../../services/layers.service";
import {LayerOperationsEnum} from "../../enums/layer-operations.enum";
import {LayerOperation} from "../../models/layer-operation";

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss']
})
export class ToolsComponent implements OnInit {
  toolsEnum = ToolsEnum;
  operationsEnum = OperationsEnum;
  layerOperationEnum = LayerOperationsEnum;
  currentTool: ToolsEnum = ToolsEnum.PENCIL;

  constructor(private toolsService: ToolsService,
              private layersService: LayersService) {

  }

  changeTool(tool: ToolsEnum) {
    this.toolsService.toggleTool(tool);
    this.currentTool = tool
  }

  executeOperation(operation: OperationsEnum) {
    this.toolsService.runOperation(operation)
  }

  executeLayerOperation(operation: LayerOperationsEnum) {
    this.layersService.runOperation(new LayerOperation(operation))
  }

  ngOnInit(): void {
  }
}
