var express = require('express');
var router = express.Router();

const SHA256 = require('crypto-js/sha256');

class Transaction{
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}
class Block{
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;  
    }
    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }
    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined: " + this.hash);
    }
}

class Blockchain {
    constructor () {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 1;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }
    createGenesisBlock() {
        var a = new Block("26/11/2018", [], "0");
        // console.log(JSON.stringify(a));
        return a;
    }
    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }
    // addBlock(newBlock) {
    //     newBlock.previousHash = this.getLatestBlock().hash;
    //     newBlock.mineBlock(this.difficulty);
    //     this.chain.push(newBlock);
    // }
    minePendingTransactions(miningRewardAddress) {
        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = [new Transaction(null, miningRewardAddress, this.miningReward)];
    }
    createTransaction(transaction) {
        this.pendingTransactions.push(transaction)
    }
    getBalanceofAddress(address){
        let balance = 0;
        for(const block of this.chain) {
            for(const trans of block.transactions) {
                if(trans.fromAddress === address) {
                    balance -= trans.amount;
                }
                if(trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }
        return balance; 
    }
    isChainValid() {
        for(let i =1; i<this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }
            if(currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

let savjeeCoin = new Blockchain();

// savjeeCoin.createTransaction(new Transaction('address1', 'address2', 100));
// savjeeCoin.createTransaction(new Transaction('address2', 'address1', 100));

// console.log('\nStarting the miner ....');
// savjeeCoin.minePendingTransactions('xavier-address');
// console.log('\nBalance of xavier is ',savjeeCoin.getBalanceofAddress('xavier-address'));


// console.log('\nStarting the miner again ....');
// savjeeCoin.minePendingTransactions('xavier-address');
// console.log('\nBalance of xavier is ',savjeeCoin.getBalanceofAddress('xavier-address'));
// console.log('\nBalance of address1 is ',savjeeCoin.getBalanceofAddress('address1'));
// console.log('\nBalance of address2 is ',savjeeCoin.getBalanceofAddress('address2'));





/* GET home page. */
router.post('/', async function(req, res, next) {
    var add1 = req.query.address1;
    var add2 = req.query.address2;

    console.log(add1);
    console.log(add2);
    
    
    console.log('\nStarting the miner ....');
    savjeeCoin.createTransaction(new Transaction(add1, add2, 100));
    await savjeeCoin.minePendingTransactions('aa');
    console.log(savjeeCoin);
    
    res.json(savjeeCoin);   
});

module.exports = router;
