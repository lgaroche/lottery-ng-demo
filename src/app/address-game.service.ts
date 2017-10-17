import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { ReplaySubject } from 'rxjs/ReplaySubject'
import { Observable } from 'rxjs/Observable'

import { BlockchainService } from "./blockchain.service";
import { Contract } from 'Web3'

import * as gameABI from './lowestAddressGameABI.json';

export class GameState {
	lowest: string
	last: string
	reward: number
	contract: Contract

	constructor(lowest, last, reward) {
		this.lowest = lowest;
		this.last = last;
		this.reward = reward;
	}
}

export class PlacedEvent {
	from: string
	newReward: number
	when: number
}

@Injectable()
export class AddressGame {

	account: String
	balance: number
	gameState: GameState
	contract: any

	private _PlacedEvent: ReplaySubject<PlacedEvent>
	placedEvent: Observable<PlacedEvent>

	constructor(
		private http: Http,
		private blockchain: BlockchainService) 
	{ 
		this._PlacedEvent = new ReplaySubject<PlacedEvent>(1)
		this.placedEvent = this._PlacedEvent.asObservable()

		blockchain.getAccount().then((account) => {
			this.account = account
			blockchain.getBalance(account).then((balance) => {
				console.log("balance: "+ balance)
				this.balance = balance
			}).catch(err => {
				console.log("Error getting balance: " + err)
			})
		}).catch(err => {
			console.log("Error getting account: " + err)
		})
	};

	loadGame(address): Promise<GameState> {
        return new Promise((resolve, reject) => {
            //this.http.get('assets/lowestAddressGame.json').toPromise().then(response => {
            //    let Game = this.blockchain.web3.eth.contract(response.json().abi);
            //let Game = new this.blockchain.web3.eth.Contract(gameABI)
            //console.log(gameABI)
            this.contract = new this.blockchain.web3.eth.Contract(gameABI, address)
            //this.contract = Game.at(address)
            this.contract.events.allEvents((err, res) => {
            	console.log("all event received")
            })
            this.contract.events.Placed((err, event) => {
            	if(err) {
            		console.log(err)
            		//reject(err)
            		return
            	}
            	console.log("Place event received")
            	this._PlacedEvent.next(new PlacedEvent())
            	console.log(event)
            })
            console.log(this.contract)
            return this.getState()
            	.then(state => resolve(state))
            	.catch(err => reject(err))
            //});
        });
    }

	getState(): Promise<GameState> {
		return new Promise((resolve, reject) => {
			console.log("Calling game state from your account: " + this.account)
			return this.contract.methods.getGameState().call({from: this.account}).then(res =>{
				if(res[0] == "0x") {
            		reject("Contract has not been deployed")
            		return
            	}
            	this.gameState = new GameState(res[0], res[2], this.blockchain.web3.utils.fromWei(res[1], 'ether').toString(10));
                resolve(this.gameState);
                console.log(this.contract)
			}).catch(err => {
				console.log("Error getGameState: " + err)
				reject(err)
			})
		})
	}

	deploy(): Promise<string> {
		return new Promise((resolve, reject) => {
			this.contract = new this.blockchain.web3.eth.Contract(gameABI)
			this.contract.deploy({
				data: '0x606060405273ffffffffffffffffffffffffffffffffffffffff6000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060006001556000600255341561006d57600080fd5b61032a8061007c6000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063237297a41461005357806393cca91814610068578063b7d0628b1461007257600080fd5b341561005e57600080fd5b6100666100d5565b005b610070610182565b005b341561007d57600080fd5b6100856102c4565b604051808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001838152602001828152602001935050505060405180910390f35b600060025442101515156100e857600080fd5b670de0b6b3a764000060015411151561010057600080fd5b670de0b6b3a7640000600154039050670de0b6b3a76400006001819055506000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166108fc829081150290604051600060405180830381858888f19350505050151561017f57600080fd5b50565b6000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161015156101dd57600080fd5b670de0b6b3a7640000341415156101f357600080fd5b34600160008282540192505081905550336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550607842016002819055507f28b3acba52623a43ca6243439928719c54ec26d186b78fa3ced99deee81c7f183360015442604051808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001838152602001828152602001935050505060405180910390a1565b60008060008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1660015442600254039250925092509091925600a165627a7a72305820b6fd13186ababdf540fcd73d66382736d111e9a7e864c9681ef33d31d78c3fd10029', 
			}).send({
				from: this.account,
				gas: '4400000'
			}).on('receipt', (receipt) => {
				this.contract = receipt
				//this.contract = new this.blockchain.web3.eth.Contract(gameABI, receipt.contractAddress)
				console.log("Deployed contract at address: " + receipt.contractAddress)
				resolve(receipt.contractAddress)
			}).on('error', error => {
				console.log(error, "Could not deploy the contract")
				reject(error)
			})
		})
	}

	play(): Promise<GameState> {
		return new Promise((resolve, reject) => {
			this.contract.methods.place().send({from: this.account, value:1e18}, (err, receipt) => {
				if(err) {
					reject(err)
					return
				}
				console.log(receipt)
				resolve(this.gameState)
			})
		})
	}

	isPlayable(): boolean {
		if(!this.gameState) {
			console.log("game not loaded")
			return false;
		}
		let myAddr = this.blockchain.web3.utils.toBN(this.account)
		let bestAddr = this.blockchain.web3.utils.toBN(this.gameState.lowest)
		let lower = myAddr.lt(bestAddr)
		//var difference = this.blockchain.web3.utils.toDecimal(this.account) - this.blockchain.web3.toDecimal(this.gameState.lowest)
  		if(lower && this.balance >= 1) {
  			console.log("You can play")
  			return true;
  		}
  		else {
  			console.log("You cannot play")
  			return false;
  		}
	}
}