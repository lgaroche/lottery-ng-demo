import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { BlockchainService } from './blockchain.service'
import { AddressGame } from "./address-game.service"
import { AppComponent } from './app.component'
import { GameComponent } from './game.component'

@NgModule({
  declarations: [
    AppComponent,
    GameComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    BrowserAnimationsModule,
  ],
  providers: [BlockchainService, AddressGame],
  bootstrap: [AppComponent]
})
export class AppModule { }
