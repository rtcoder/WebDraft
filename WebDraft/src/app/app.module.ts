import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {MaterialModule} from "../modules/material.module";
import {ToolsComponent} from "../components/tools/tools.component";
import {LayersComponent} from "../components/layers/layers.component";
import {LayersPreviewComponent} from "../components/layers-preview/layers-preview.component";
import {CanvasComponent} from "../components/canvas/canvas.component";

@NgModule({
  declarations: [
    AppComponent,
    ToolsComponent,
    LayersComponent,
    LayersPreviewComponent,
    CanvasComponent,
  ],
  imports: [
    BrowserModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
