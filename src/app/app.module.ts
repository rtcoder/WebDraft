import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import {MaterialModule} from "../modules/material.module";
import {ToolsComponent} from "../components/tools/tools.component";
import {LayersComponent} from "../components/layers/layers.component";
import {LayersPreviewComponent} from "../components/layers-preview/layers-preview.component";
import {CanvasComponent} from "../components/layers-preview/canvas/canvas.component";
import {DrawerComponent} from "../components/drawer/drawer.component";
import {HotkeysComponent} from "../components/hotkeys/hotkeys.component";

@NgModule({
  declarations: [
    AppComponent,
    ToolsComponent,
    LayersComponent,
    LayersPreviewComponent,
    CanvasComponent,
    DrawerComponent,
    HotkeysComponent
  ],
  imports: [
    BrowserModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
