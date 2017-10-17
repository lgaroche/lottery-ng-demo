import { Component, OnInit } from '@angular/core'
import { GameComponent } from './game.component'
import { BlockchainService } from './blockchain.service'
import { AddressGame } from "./address-game.service"
import { GameState } from "./address-game.service"

import "../semantic/dist/semantic"

@Component({
  selector: 'app-root',
  template: require("./app.component.pug"),
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'AddressGame'
  address = "0x0"
  balance = 0
  addressInputShown = false
  deployLoadingBarShown = false
  gameState: GameState
  prize = 0
  bestAddress = ""
  error = ""
  gameAddress: string

  constructor(
  	private blockchain: BlockchainService,
  	private game: AddressGame) { };

  ngOnInit() {
  	console.log("calling blockchain")
  	this.blockchain.getAccount().then(account => {
  		this.address = account;
  		this.blockchain.getBalance(account).then(balance => {
  			this.balance = balance;
  			$('#home').transition('slide down')
  		}).catch(err => {
  			console.log("Could not get balance: " + err)
  		})
  	}).catch(err => {
  		console.log("Could not get account: " + err)
  		this.showError("Could not get account: " + err)
  	})
  }

  public loadContractAtAddress(address) {
  	this.gameAddress = address
    localStorage.setItem("gameAddress", address)
  	$('#home').transition('slide down', () => { 
	  	$('#game').transition('slide down')
	  });
  }

  private showError(message) {
  	this.error = message;
  	$('.dimmer').dimmer("show")
  }

  public showContractAddressInput() {
    //this.gameAddress = localStorage.getItem("gameAddress")
  	this.addressInputShown = !this.addressInputShown
  	if(this.addressInputShown) {
  		$('.deployContractButton').addClass('disabled')
  	}
  	else {
  		$('.deployContractButton').removeClass('disabled')	
  	}
  	$('.addressInput').transition('slide down', () => {
  		$('#addressInput').val(localStorage.getItem("gameAddress"))
  	})
  }

  public deploy() {
  	this.deployLoadingBarShown = !this.deployLoadingBarShown
  	if(this.deployLoadingBarShown) {
  		$('.addressLoadbutton').addClass('disabled')
  	}
  	else {
  		$('.addressLoadbutton').removeClass('disabled')	
  	}
  	$('.deployLoadingBar').transition('slide down')
    console.log("deploying now...")
    this.game.deploy().then(address => {
      console.log(address)
      localStorage.setItem("gameAddress", address)
      this.deployLoadingBarShown = false
      $('.deployLoadingBar').transition('slide up', () => {
        $('.addressLoadbutton').removeClass('disabled')
        this.showContractAddressInput()
      })
    }).catch(error => {
      console.log("Cannot deploy")
    })
  }

  refresh() {
  	console.log(this.gameState)
  	console.log(this.prize)
  }


}

