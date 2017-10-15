import { Injectable } from '@angular/core'
import { Http } from '@angular/http'
import 'rxjs/add/operator/toPromise'
import { Initialized } from './initialized'

import Web3 from 'web3'

declare var web3: Web3

@Injectable() 
export class BlockchainService {

    web3: Web3;
    __initialized__: Promise<boolean>

    constructor(private http: Http) {
        console.log("init")
        this.__initialized__ = new Promise((resolve, reject) => {
            setTimeout(() => {
                this.init("http://localhost:8545")
                resolve(true)
            }, 1000)
        })
    }

    init(endpoint: string): void {
        if (typeof web3 !== 'undefined') {
            console.log("Using current provider")
            web3 = new Web3(web3.currentProvider)
        } else if (endpoint != null) {
            console.log("Using HttpProvider")
            web3 = new Web3(new Web3.providers.HttpProvider(endpoint))
        } 
        this.web3 = web3
    }

    @Initialized
    getAccount(): Promise<string> {
        console.log("getAccount called")
        return new Promise((resolve, reject) => {
            return this.web3.eth.getAccounts((err, accounts) => {
                if(err) {
                    reject(err)
                    return
                }
                else {
                    resolve(accounts[0])
                    console.log("Your account: " + accounts[0])
                }
            });
        });
    }

    @Initialized
    getBalance(account: string): Promise<number> {
        return new Promise((resolve, reject) => {
            this.web3.eth.getBalance(account, (err, balance) => {
                if(err) reject(err)
                let balanceInEth = this.web3.utils.fromWei(balance, 'ether')
                console.log(balanceInEth.toString(10))
                resolve(balanceInEth)
            });
        });
    }

}