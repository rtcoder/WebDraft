import {Component, OnInit} from '@angular/core';
import {ToolsService} from "../services/tools.service";
import {ToolsEnum} from "../enums/tools.enum";
import {OperationsEnum} from "../enums/operations.enum";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'WebDraft';

  constructor(private toolsService: ToolsService) {

  }

  ngOnInit(): void {
    this.toolsService.changeTool.subscribe((tool: ToolsEnum) => {
      console.log(tool)
    });
    this.toolsService.executeOperation.subscribe((operation: OperationsEnum) => {
      console.log(operation)
    });
  }
}
