import { Component, OnInit, NgZone, Input } from '@angular/core'
import { BlockchainService } from './blockchain.service'
import { AddressGame } from "./address-game.service"
import { GameState } from "./address-game.service"
import { Subscription } from "rxjs/Subscription"

import "../semantic/dist/semantic"

@Component({
  selector: 'game',
  template: require("./game.component.pug"),
  styleUrls: []
})
export class GameComponent implements OnInit {

	@Input() gameAddress: string
	account: string
	gameState: GameState
	waiting: boolean
  	subscription: Subscription
  	playable: boolean

	constructor(
		private game: AddressGame,
		private blockchain: BlockchainService,
		private zone:NgZone
		) { 
		this.gameState = new GameState("loading...", "loading...", "")
		this.playable = false
		this.waiting = false
	}


	ngOnInit() {
		console.log(this.gameAddress)
		this.blockchain.getAccount().then(account => this.account = account)
		this.game.loadGame(this.gameAddress).then((state) => {
	  		console.log(state)
	  		this.gameState = state
			this.subscription = this.game.placedEvent.subscribe(event => {
	  			this.zone.run(() => {
		  			this.game.getState().then(state => {
		  				this.gameState = state
		  				console.log("gameState changed!")
		  				console.log(this.gameState)
		  				this.playable = this.game.isPlayable()
		  			})
		  		})
	  		})
	  		this.playable = this.game.isPlayable()
	  		console.log("playable: " + this.playable)
	  	}).catch(error => {
	  		console.log(error)
	  	})
	}

	private play() {
  	this.game.play().then((result) => {
  		console.log(result)
  		this.waiting = true
  		setTimeout(() => {
  			console.log("Getting update")
  			this.game.getState().then(state => {
  				console.log(state)
  				this.gameState = state
  				this.playable = this.game.isPlayable()
  				this.waiting = false
  			})
  		}, 6000)
  	}).catch(error => {
  		console.log(error)
  	})
  }
}