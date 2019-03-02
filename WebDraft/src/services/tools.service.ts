import {EventEmitter, Injectable, Output} from "@angular/core";
import {ToolsEnum} from "../enums/tools.enum";
import {OperationsEnum} from "../enums/operations.enum";

@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  @Output() changeTool: EventEmitter<ToolsEnum> = new EventEmitter();
  @Output() executeOperation: EventEmitter<OperationsEnum> = new EventEmitter();

  toggleTool(tool: ToolsEnum) {
    this.changeTool.emit(tool);
  }

  runOperation(operation: OperationsEnum) {
    this.executeOperation.emit(operation);
  }

}
