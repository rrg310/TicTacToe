enum CardSuite { c, d, h, s }

class winningScoreAndCards {
    index: number;
    wci: number[];
}

class Card {
	cardNumber : string;
	cardType : CardSuite;

	constructor(cardNumber : string, cardType : CardSuite) {
		this.cardNumber = cardNumber;
		this.cardType = cardType;
	}
}

enum PlayerState { "Check", "Call", "Raise", "Fold", "Init", "AllIn", "Small", "Big"}

class Player {
	id : string;
	name : string;
	state : PlayerState;
	chipsInPocket : number;
	currentBet : number = 0;
	cards : Card[];
	
	constructor(id : string, name : string) {
		this.id = id;
		this.name = name;
		this.state = PlayerState.Init;
		this.cards = [];
		this.chipsInPocket = 300;
		this.currentBet = 0;
		//this.presentInCurrentPot = true;
	}

	resetCurrentBet() {
		this.currentBet = 0;
	}
    
    convertPlayerCardArrayToString() : string {
        
        let cardString: string = "";
        
        for( let i: number = 0; i<this.cards.length; i++) {
            cardString = cardString + this.cards[i].cardNumber + CardSuite[this.cards[i].cardType] + " "; 
        }
        console.log("Hand Cards: " + cardString);
        return (cardString);
    }
}

class Pot {
    
    hands: string[]; 
 	handRanks: number[];
    currentPotBetAmount: number; 
	totalAmount : number;
    playersInvolved: Player[];
    playersContributions: number[];

	constructor () {
		this.currentPotBetAmount = 0;
        this.totalAmount = 0;
        this.hands =  ["4 of a Kind", "Straight Flush", "Straight", "Flush", "High Card", "1 Pair", "2 Pair", "Royal Flush", "3 of a Kind", "Full House", "-Invalid-" ]; 
        this.handRanks = [8,9,5,6,1,2,3,10,4,7,0];
        this.playersInvolved = [];
        this.playersContributions = [];
	}

	addAmountToPot (amountToBeAdded: number) {
		this.totalAmount = this.totalAmount + amountToBeAdded;
	}
    
    subtractAmountFromThePot(amountToBeSubtracted: number) {
        this.totalAmount = this.totalAmount - amountToBeSubtracted;
    }

    addPlayerToThePot (playerToBeAdded: Player) {
        this.playersInvolved.push(playerToBeAdded);
        this.playersContributions.push(0);
    }
    
    addAllPlayersToThePot(playersToBeAdded: Player[]) {
        
        for(let i:number = 0; i<playersToBeAdded.length; i++) {
            this.playersInvolved.push(playersToBeAdded[i]);
            this.playersContributions.push(0);
        }
    }
    
    addContribution(currentPlayer : Player ,amountContributed: number) {
        
        for(let i: number = 0; i<this.playersInvolved.length; i++) {
            if(this.playersInvolved[i] == currentPlayer) {
                this.playersContributions[i] += amountContributed;
            }
        }
    }
    
    subtractContribution(currentPlayer : Player ,amountContributed: number) {
        
        for(let i: number = 0; i<this.playersInvolved.length; i++) {
            if(this.playersInvolved[i] == currentPlayer) {
                this.playersContributions[i] -= amountContributed;
            }
        }
    }
    
    checkContribution(currentPlayer: Player) {
        for(let i: number = 0; i<this.playersInvolved.length; i++) {
            if(this.playersInvolved[i] == currentPlayer) {
                return this.playersContributions[i];
            }
        }
    }
    
    removeIfPlayerPresent(playerToBeRemoved: Player) {
        for(let i:number = 0; i<this.playersInvolved.length; i++) {
            if(this.playersInvolved[i] == playerToBeRemoved) {
                this.playersInvolved.splice(i,1);
                this.playersContributions.splice(i,1);
            }
        }
    }

    getWinners(tableAfterMove: Table) {
        let tableCardsString: string = tableAfterMove.convertTableCardArrayToString();
        let bestRank: number = -1;
        let winningList: Player[] = [];
        let winningListCards : number[][];                    
        let winningScoreAndCardsObject: winningScoreAndCards;
                            
        for(let i: number = 0; i<this.playersInvolved.length; i++) {
            console.log('\n');
            console.log("Player " + i + ": ");
            
            winningScoreAndCardsObject = gameLogic.rankHand(this.playersInvolved[i].convertPlayerCardArrayToString() + tableCardsString);
            let currentHandRank: number = this.handRanks[winningScoreAndCardsObject.index];
            
            if(currentHandRank > bestRank) {
                bestRank = currentHandRank;
                winningList = [];
                winningList.push(this.playersInvolved[i]);
                winningListCards = [];
                winningListCards.push(winningScoreAndCardsObject.wci);
            }
            else
            if(currentHandRank == bestRank) {
                winningList.push(this.playersInvolved[i]);
                winningListCards.push(winningScoreAndCardsObject.wci);
            }    
        }
        
        console.log('\n\n\n');
        console.log("No. Of Winners: " + winningList.length);
        console.log("Winners: ");
        console.log(winningList);
        console.log('\n\n\n');
        
        if(winningList.length > 1) {
            winningList = gameLogic.resolveEqualHandsConflict(tableAfterMove.openedCards ,winningList, winningListCards, this.hands[this.handRanks.indexOf(bestRank)]);
        }   
        return winningList;
    }
}

class TableSetup {
    
	playerList : Player[];
	deck : Card[];
	openedCards : Card[];
	closedCards : Card[];
	dealerIndex : number;
	currentPlayerIndex : number;
	potArray : Pot[];
	smallBlind : number;
	bigBlind : number;
	roundStartIndex : number;
	currentCallAmount : number;
    playerIndicesRemovedInThisHand : number[];
    
    //
    winners:Player[];

    constructor(noOfPlayers: number) {
        this.playerList = [];
		this.deck = [];
		this.openedCards = [];
		this.closedCards = [];
		this.dealerIndex = noOfPlayers-1;
		this.currentPlayerIndex = 0;
		this.roundStartIndex = 0;
		this.potArray = [];
        let tempPot: Pot = new Pot();
		this.potArray.push(tempPot);
        this.smallBlind = 10;
		this.bigBlind = 20;
		this.currentCallAmount = 0;
        this.playerIndicesRemovedInThisHand = [];
    }

    addPlayerToTheTable(player : Player) {
    	this.playerList.push(player);
    }

    incrementCurrentPlayerIndex() {
        console.log("Problem7");
        while(true) {
            this.currentPlayerIndex++;
            this.currentPlayerIndex %= this.playerList.length;
            console.log("Problem8");    
            if((this.currentPlayerIndex == this.roundStartIndex) && (this.playerList[this.currentPlayerIndex].state != PlayerState.Init)) {
                //console.log('\n' + "Skipping player: " + this.playerList[this.currentPlayerIndex].name + '\n');
                console.log("Problem9");
                gameLogic.adjustPots(this);
                gameLogic.roundOver(this);
                return;
            }
            else if((this.playerList[this.currentPlayerIndex].state != PlayerState.Fold) && (this.playerList[this.currentPlayerIndex].state != PlayerState.AllIn)) {
                return;
            }
            else {
                console.log('\n' + "Skipping player: " + this.playerList[this.currentPlayerIndex].name + '\n');
            }
        }
    }

	incrementRoundStartIndex() {
    	this.roundStartIndex++;
    	this.roundStartIndex %= this.playerList.length;
    }    

    incrementCurrentAndRoundStartIndices() {
    	this.currentPlayerIndex++;
    	this.currentPlayerIndex %= this.playerList.length;
    	this.roundStartIndex++;
    	this.roundStartIndex %= this.playerList.length;
    }
    
    getCurrentPotIndex() {
        return (this.potArray.length-1);
    }
    
    addNewPot(newPotInitialAmount: number, playerList: Player[]) {
        let newPot: Pot = new Pot();
        newPot.addAmountToPot(newPotInitialAmount);
        newPot.addAllPlayersToThePot(playerList);
        this.potArray.push(newPot);
    }

    getCumulativePotAmount() {
        let cumulativePotAmount: number = 0;
        
        for(let i: number = 0 ; i<this.potArray.length; i++) {
            cumulativePotAmount += this.potArray[i].totalAmount;
        }
        
        return cumulativePotAmount;
    }
    
    verifyAndAdjustPots() {
        let potToBeVerified: Pot = this.potArray[this.potArray.length-1];
        
        for(let i: number = 0; i < potToBeVerified.playersInvolved.length; i++) {
            
        } 
    }

    awardWinners():Player[] {
        
        for(let i: number = 0; i<this.potArray.length; i++) {
            // console.log("Pot Number: " + i);
            let winningPlayers: Player[] = this.potArray[i].getWinners(this);

            // console.log('\n'+"Final Winning Players:");
            // console.log(winningPlayers); 
            // console.log('\n');

            let noOfWinners: number = winningPlayers.length;
            let potAmountPerPerson = (this.potArray[i].totalAmount/noOfWinners);

            for(let j:number = 0; j<winningPlayers.length; j++) {
                winningPlayers[j].chipsInPocket += potAmountPerPerson;
            }
            //
            return angular.copy(winningPlayers);
        }        
    }

    resetRound() {
    	
        for( let i: number = 0; i<this.playerList.length; i++) {
			this.playerList[i].currentBet = 0;
			
            if(this.playerList[i].state !== PlayerState.Fold && this.playerList[i].state !== PlayerState.AllIn) {
				this.playerList[i].state = PlayerState.Init;
			}
		}
        
        this.currentPlayerIndex = (this.dealerIndex + 1) % this.playerList.length;
        
        while(true) {
            this.roundStartIndex = this.currentPlayerIndex;
            this.currentCallAmount = 0;

            if((this.currentPlayerIndex == this.dealerIndex) && (this.playerList[this.currentPlayerIndex].state == PlayerState.Fold || this.playerList[this.currentPlayerIndex].state == PlayerState.Fold)) {
                //console.log('\n' + "Skipping player: " + this.playerList[this.currentPlayerIndex].name + '\n');
                gameLogic.adjustPots(this);
                gameLogic.roundOver(this);
                return;
            }
            else if((this.playerList[this.currentPlayerIndex].state != PlayerState.Fold) && (this.playerList[this.currentPlayerIndex].state != PlayerState.AllIn)) {
                break;
            }
            else {
                console.log('\n' + "Skipping player: " + this.playerList[this.currentPlayerIndex].name + '\n');
                this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.playerList.length;
            }
        }
    }

    resetHand() {
        
        let indexRevisionCount: number = 0;
        
        for(let i: number = 0; i<this.playerIndicesRemovedInThisHand.length; i++) {
            if(this.playerIndicesRemovedInThisHand[i] <= this.dealerIndex) {
                indexRevisionCount++;
            }
        }
        
        let newTempIndex: number = this.dealerIndex - indexRevisionCount;
        
        if(newTempIndex < 0) {
            this.dealerIndex = newTempIndex + this.playerList.length;
        }
        else {
            this.dealerIndex = newTempIndex;
        }
        
    	this.dealerIndex = (this.dealerIndex + 1) % this.playerList.length;
    	this.roundStartIndex = (this.dealerIndex + 1) % this.playerList.length;
		this.currentPlayerIndex = this.roundStartIndex;
		this.currentCallAmount = 0;
		this.potArray = [];
        let tempPot: Pot = new Pot();
        tempPot.addAllPlayersToThePot(this.playerList);
		this.potArray.push(tempPot);
        this.openedCards = [];
        this.closedCards = [];
        this.winners =[];
        
		for( let i: number = 0; i<this.playerList.length; i++) {
			this.playerList[i].currentBet = 0;
			this.playerList[i].cards = [];
            this.playerList[i].state = PlayerState.Init;
		}
        
		this.deck = initializeTableDeck();
    	distributeCards(this);
    }

    removePlayersWithInsufficientChips() {
    	
        for(let i: number = 0; i<this.playerList.length; i++) {
    		if(this.playerList[i].chipsInPocket < this.bigBlind) {
                this.playerIndicesRemovedInThisHand.push(i);
    		}
    	}
        
        for(let i: number = 0; i<this.playerList.length; i++) {
    		if(this.playerList[i].chipsInPocket < this.bigBlind) {
    			this.playerList.splice(i,1);
                i--;
    		}
    	}
    }
    
    getActivePlayersCount(): number {
        let count: number = 0;
                
        for(let i:number = 0; i<this.playerList.length; i++) {
            count ++;    
        }
        
        return count;
    }
    
    convertTableCardArrayToString() : string {
        
        let cardString: string = "";
        
        for( let i: number = 0; i<this.openedCards.length; i++) {
            cardString = cardString + this.openedCards[i].cardNumber + CardSuite[this.openedCards[i].cardType] + " "; 
        }
        
        console.log('\n' + "Table Cards: " + cardString.substring(0, cardString.length-1));
        return (cardString.substring(0, cardString.length-1));
    }
}


type Table = TableSetup;
interface TableDelta {
  currentPlayer : Player;
  amountAdded : number;
}

interface IState {
  table: Table;
  delta: TableDelta;
}

function initializeTableDeck() : Card[] {
        
  	let cardDeck : Card[] = [];
	let suiteNumber : number= 1;
       
    //Create the Deck.
    for(let i : number = 0; i<52; i++) {
        let num : number = ((i+1)%13==0) ? 13 :(i+1)%13;
        let numString : string = "";
        let suite : CardSuite = CardSuite.d;

        if (suiteNumber==1) {
            suite = CardSuite.c;
        }
        else if (suiteNumber==2) {
            suite = CardSuite.d;
        }
        else  if (suiteNumber==3) {
            suite = CardSuite.h;
        }
        else {
            suite = CardSuite.s;
        }
        
        switch(num) {
            case 11:
                    {
                        numString = "J";
                        break;
                    }
            
            case 12:
                    {
                        numString = "Q";
                        break;
                    }
                                
            case 13:
                    {
                        numString = "K";
                        break;
                    }
                    
            case 1:
                    {
                        numString = "A";
                        break;
                    }
            default:
                    {
                        numString = num.toString();
                        break;
                    }
        }
        
           
        cardDeck.push(new Card(numString, suite));
        
        if (num==13) {
            suiteNumber++;
        }
    }

    // //Shuffle the Deck.
    // for (let i : number = cardDeck.length - 1; i > 0; i--) {
    //     let j : number = Math.floor(Math.random() * (i + 1));
    //     let tempCard : Card = cardDeck[i];
    //     cardDeck[i] = cardDeck[j];
    //     cardDeck[j] = tempCard;
    // }
    
    return cardDeck;
}

function distributeCards(table : Table) {
    
    for(let i : number = 0; i<2; i++) {
        for(var j=0; j<table.playerList.length; j++) {
            table.playerList[j].cards.push(table.deck.pop());
        }
    }
        
    burnCard(table.deck);
    for(let i : number = 0; i<3; i++) {
        table.closedCards.push(table.deck.pop());
    }
        
    burnCard(table.deck);
    table.closedCards.push(table.deck.pop());
        
    burnCard(table.deck);
    table.closedCards.push(table.deck.pop());
}
    
function burnCard(cardDeck : Card[]) {
    cardDeck.pop()
}


function printCardDeck(cardDeck : Card[]) {
	for (let i : number = 0; i < cardDeck.length; i++) {
        console.log(cardDeck[i].cardNumber + " of " + CardSuite[cardDeck[i].cardType]);
    }
}

function isGameOver(table: Table): boolean {
	if((table.playerList.length == 0) || (table.playerList.length == 1))  {
		return true;
	}
	else {
		return false;
	}
}

module gameLogic {
    let hands: string[] =  ["4 of a Kind", "Straight Flush", "Straight", "Flush", "High Card", "1 Pair", "2 Pair", "Royal Flush", "3 of a Kind", "Full House", "-Invalid-" ]; 
 	let handRanks: number[] = [8,9,5,6,1,2,3,10,4,7,0];
    let noOfPlayers: number = 5;
  
    export function getInitialTable(): Table {
        let table : Table = new TableSetup(noOfPlayers); 

        table.addPlayerToTheTable(new Player("adit91","Adit"));
        table.addPlayerToTheTable(new Player("ridhi91","Ridhi"));
        table.addPlayerToTheTable(new Player("anto90","Anto"));
        table.addPlayerToTheTable(new Player("gaurav89","Gaurav"));
        table.addPlayerToTheTable(new Player("rachita88","Rachita"));
        table.potArray[table.getCurrentPotIndex()].addAllPlayersToThePot(table.playerList);

        table.deck = initializeTableDeck();  
        distributeCards(table);
        console.log(table);
        return table;
    }

    export function getInitialState(): IState {
        return {table: getInitialTable(), delta: null};
    }
  
    export function createMove(
        stateBeforeMove: IState, currentPlayer: Player, amountAdded: number, turnIndexBeforeMove: number): IMove {   
console.log("Inside");    
        if (!stateBeforeMove) { 
            stateBeforeMove = getInitialState();
        }
    
        let lastCardOfTheRound: boolean = false;
        let handOver: boolean = false;
        let table: Table = stateBeforeMove.table;
            
        if (isGameOver(table)) {
    	   throw new Error("Can only make a move if the game is not over! Number of required payers for the game not satisfied");
        }

        let tableAfterMove = angular.copy(table);
        currentPlayer = tableAfterMove.playerList[tableAfterMove.currentPlayerIndex];
        
        let tempCurrentPlayer : Player = currentPlayer;
        
        if(tableAfterMove.openedCards.length == 0) {
            
            if((tableAfterMove.currentPlayerIndex == ((tableAfterMove.dealerIndex + 1)%tableAfterMove.playerList.length)) && (currentPlayer.state == PlayerState.Init)) {
    		    
                tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].addAmountToPot(tableAfterMove.smallBlind);
                currentPlayer.chipsInPocket -= tableAfterMove.smallBlind;
                currentPlayer.currentBet = tableAfterMove.smallBlind;
                tableAfterMove.currentCallAmount = tableAfterMove.smallBlind;
                tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].addContribution(currentPlayer,tableAfterMove.smallBlind);
                tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].currentPotBetAmount = tableAfterMove.smallBlind;
            }
            else if((tableAfterMove.currentPlayerIndex == ((tableAfterMove.dealerIndex + 2)%tableAfterMove.playerList.length)) && (currentPlayer.state == PlayerState.Init)){
                tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].addAmountToPot(tableAfterMove.bigBlind);
                currentPlayer.chipsInPocket -= tableAfterMove.bigBlind;
                currentPlayer.currentBet = tableAfterMove.bigBlind;
                tableAfterMove.currentCallAmount = tableAfterMove.bigBlind;
                tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].addContribution(currentPlayer,tableAfterMove.bigBlind);
                tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].currentPotBetAmount = tableAfterMove.bigBlind;
            }
        }
        
        switch(currentPlayer.state) {

            case PlayerState.Fold : 
                                        {
                                            let foldCount: number = 0;
                                            let notFoldedPlayer: Player;
                                            
                                            for(let i: number = 0; i<tableAfterMove.playerList.length; i++) {
                                                if(tableAfterMove.playerList[i].state == PlayerState.Fold) {
                                                    foldCount++;
                                                }
                                                else {
                                                    notFoldedPlayer = tableAfterMove.playerList[i];
                                                }
                                            }
                                            
                                            if(foldCount == tableAfterMove.playerList.length - 1) {
                                                
                                                console.log("Turn Start: ");
   	                                            console.log("Player: " + tableAfterMove.currentPlayerIndex);
   	                                            console.log("Action: " + PlayerState[currentPlayer.state])
   	                                            console.log("Pot After the Turn: ");
                                                console.log(tableAfterMove.potArray);
   	                                            console.log(tableAfterMove.playerList);
   	                                            console.log('\n');
                                                
                                                let cumulativePotAmount: number = tableAfterMove.getCumulativePotAmount();
                                                
                                                notFoldedPlayer.chipsInPocket += cumulativePotAmount;
                                                tableAfterMove.removePlayersWithInsufficientChips();
                                                tableAfterMove.resetHand();
                                                handOver = true;
                                                lastCardOfTheRound = true;
                            
                                                if(tableAfterMove.playerList.length==0 || tableAfterMove.playerList.length==1) {
                                                    console.log("Game Over! Bye Bye! " + tableAfterMove.playerList.length + " Players left!");
                                                }
                                                
                                                let turnIndexAfterMove: number = tableAfterMove.currentPlayerIndex;
                                                let delta: TableDelta = {currentPlayer: currentPlayer, amountAdded: amountAdded};
                                                let stateAfterMove: IState = {delta: delta, table: tableAfterMove};
                                                let endMatchScores: number[];
                                                endMatchScores = null;
                                                return {endMatchScores:endMatchScores, turnIndexAfterMove: turnIndexAfterMove, stateAfterMove: stateAfterMove};
                                            }        
                                            else {
                                                
                                                for(let i: number = 0; i<tableAfterMove.potArray.length; i++) {
                                                    tableAfterMove.potArray[i].removeIfPlayerPresent(currentPlayer);
                                                }
                                            }
                                            break;
                                        }

            case PlayerState.AllIn :	
                                        {
                                            if(currentPlayer.chipsInPocket == 0) {
                                                console.log("Turn Start: ");
   	                                            console.log("Player: " + tableAfterMove.currentPlayerIndex);
   	                                            console.log("Action: " + PlayerState[currentPlayer.state])
   	                                            console.log("Pot After the Turn: ");
                                                console.log(tableAfterMove.potArray);
   	                                            console.log(tableAfterMove.playerList);
   	                                            console.log('\n');
                                                
                                                let turnIndexAfterMove: number = tableAfterMove.currentPlayerIndex;
                                                let delta: TableDelta = {currentPlayer: currentPlayer, amountAdded: amountAdded};
                                                let stateAfterMove: IState = {delta: delta, table: tableAfterMove};
                                                let endMatchScores: number[];
                                                endMatchScores = null;
                                                return {endMatchScores:endMatchScores, turnIndexAfterMove: turnIndexAfterMove, stateAfterMove: stateAfterMove};
                                                //throw new Error("The player doesn't have chips to place a bet. He is already All-in.");	
                                            }

                                            let totalBetAmountByCurrentPlayer: number = currentPlayer.currentBet + currentPlayer.chipsInPocket;
                                            
                                            if(totalBetAmountByCurrentPlayer >= tableAfterMove.currentCallAmount) {
                                                console.log("No New Pot Created:");
                                                
                                                let balance: number = currentPlayer.chipsInPocket;
                                                for(let i: number = 0; i<tableAfterMove.potArray.length; i++) {
                                                    let contribution: number = tableAfterMove.potArray[i].checkContribution(currentPlayer);
                                                
                                                    if(contribution < tableAfterMove.potArray[i].currentPotBetAmount) {
                                                        let difference = tableAfterMove.potArray[i].currentPotBetAmount - contribution;
                                                        balance -= difference;
                                                        tableAfterMove.potArray[i].addAmountToPot(difference);
                                                        tableAfterMove.potArray[i].addContribution(currentPlayer,difference);
                                                    }    
                                                }
                                                
                                                tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].addAmountToPot(balance);
                                                tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].addContribution(currentPlayer, balance);
                                                currentPlayer.chipsInPocket = 0;
                                                currentPlayer.currentBet = totalBetAmountByCurrentPlayer;
                                                
                                                if(totalBetAmountByCurrentPlayer > tableAfterMove.currentCallAmount) {
                                                    tableAfterMove.roundStartIndex = tableAfterMove.currentPlayerIndex;
                                                }
                                                
                                                tableAfterMove.currentCallAmount = totalBetAmountByCurrentPlayer;
                                                tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].currentPotBetAmount += balance;
                                            }
                                            else if(totalBetAmountByCurrentPlayer < tableAfterMove.currentCallAmount) {
                                                console.log("New Pot Created:");
                                                
                                                let cumulativeBetTillCurrentPot: number = 0;
                                                let indexOfPotToBeSplit: number = 0;
                                                let flag: number;
                                                for(let i: number = 0; i < tableAfterMove.potArray.length; i++) {
                                                    cumulativeBetTillCurrentPot += tableAfterMove.potArray[i].currentPotBetAmount;
                                                    
                                                    if(totalBetAmountByCurrentPlayer == cumulativeBetTillCurrentPot) {
                                                        tableAfterMove.potArray[i].addAmountToPot(currentPlayer.chipsInPocket);
                                                        tableAfterMove.potArray[i].addContribution(currentPlayer,currentPlayer.chipsInPocket);
                                                        currentPlayer.chipsInPocket = 0;
                                                        currentPlayer.currentBet = totalBetAmountByCurrentPlayer;
                                                        
                                                        for(let j: number = (i+1); j < tableAfterMove.potArray.length; j++) {
                                                            tableAfterMove.potArray[j].removeIfPlayerPresent(currentPlayer);
                                                        }
                                                        
                                                        flag = 1;
                                                        break;
                                                    }
                                                    else if(totalBetAmountByCurrentPlayer < cumulativeBetTillCurrentPot) {
                                                        flag = 2;
                                                        indexOfPotToBeSplit = i;
                                                        break;
                                                    }
                                                }
                                                
                                                if (flag == 1) {
                                                    break;
                                                }
                                                
                                                //console.log("indexOfPotToBeSplit: " + indexOfPotToBeSplit);
                                                let balance: number = currentPlayer.chipsInPocket;
                                                for(let i: number = 0; i<indexOfPotToBeSplit; i++) {
                                                    let contribution: number = tableAfterMove.potArray[i].checkContribution(currentPlayer);
                                                
                                                    if(contribution < tableAfterMove.potArray[i].currentPotBetAmount) {
                                                        let difference = tableAfterMove.potArray[i].currentPotBetAmount - contribution;
                                                        balance -= difference;
                                                        tableAfterMove.potArray[i].addAmountToPot(difference);
                                                        tableAfterMove.potArray[i].addContribution(currentPlayer,difference);
                                                    }    
                                                }
                                                
                                                let newPotObject: Pot = new Pot();
                                                let playerListExcludingCurrentPlayer: Player[] = [];
                                                for(let i: number = 0; i<tableAfterMove.potArray[indexOfPotToBeSplit].playersInvolved.length; i++) {
                                                    if(tableAfterMove.potArray[indexOfPotToBeSplit].playersInvolved[i] != currentPlayer) {
                                                        playerListExcludingCurrentPlayer.push(tableAfterMove.potArray[indexOfPotToBeSplit].playersInvolved[i]);
                                                    }
                                                }
                                                newPotObject.addAllPlayersToThePot(playerListExcludingCurrentPlayer);
                                                newPotObject.currentPotBetAmount = tableAfterMove.potArray[indexOfPotToBeSplit].currentPotBetAmount - balance;
                                                
                                                let playersInThePotToBeSplit: Player[] = tableAfterMove.potArray[indexOfPotToBeSplit].playersInvolved;
                                                let playersContributionsInThePotToBeSplit: number[] = tableAfterMove.potArray[indexOfPotToBeSplit].playersContributions;
                                                let difference: number = 0;
                                                let newPotInitialAmount: number = 0;
                                                let playersBeingShifted: Player[] = [];
                                                let playersContributionsBeingShifted: number[] = [];
                                                for(let i: number = 0; i < playersInThePotToBeSplit.length; i++) {
                                                    if(playersContributionsInThePotToBeSplit[i] > balance) {
                                                        difference = playersContributionsInThePotToBeSplit[i] - balance;
                                                        tableAfterMove.potArray[indexOfPotToBeSplit].subtractContribution(playersInThePotToBeSplit[i],difference);
                                                        newPotInitialAmount += difference;
                                                        playersBeingShifted.push(playersInThePotToBeSplit[i]);
                                                        playersContributionsBeingShifted.push(difference);
                                                    }   
                                                }
                                                tableAfterMove.potArray[indexOfPotToBeSplit].addAmountToPot(balance);
                                                tableAfterMove.potArray[indexOfPotToBeSplit].addContribution(currentPlayer,balance)
                                                tableAfterMove.potArray[indexOfPotToBeSplit].currentPotBetAmount = balance; 
                                                tableAfterMove.potArray[indexOfPotToBeSplit].subtractAmountFromThePot(newPotInitialAmount);
                                                
                                                newPotObject.addAmountToPot(newPotInitialAmount);
                                                for(let i: number = 0; i<playersBeingShifted.length; i++) {
                                                    newPotObject.addContribution(playersBeingShifted[i], playersContributionsBeingShifted[i]);
                                                }
                                                
                                                tableAfterMove.potArray.splice(indexOfPotToBeSplit+1, 0, newPotObject);
                                                
                                                currentPlayer.chipsInPocket = 0;
                                                currentPlayer.currentBet = totalBetAmountByCurrentPlayer;
                                            }
                                            break;
                                        }

            case PlayerState.Check :	  
                                        {
                                            if(tableAfterMove.currentCallAmount > currentPlayer.currentBet) {
                                                throw new Error("Can't check. The player has not matched the current table bet amount");
                                            }
                                            break;
                                        }

            case PlayerState.Call : 	
                                        {
                                            let chipsNeededToMatchTheBet: number = tableAfterMove.currentCallAmount - currentPlayer.currentBet;
    									
                                            if(chipsNeededToMatchTheBet == 0) {
                                                throw new Error("The player has already matched the current table bet amount");
                                            }

                                            if(chipsNeededToMatchTheBet > currentPlayer.chipsInPocket) {
                                                throw new Error("The player doesn't have enough chips to match the current table bet amount. He can go All In");
                                            }

                                            
                                            for(let i: number = 0; i< tableAfterMove.potArray.length; i++) {
                                                let contribution: number = tableAfterMove.potArray[i].checkContribution(currentPlayer);
                                                
                                                if(contribution < tableAfterMove.potArray[i].currentPotBetAmount) {
                                                    let difference = tableAfterMove.potArray[i].currentPotBetAmount - contribution;
                                                    tableAfterMove.potArray[i].addAmountToPot(difference);
                                                    tableAfterMove.potArray[i].addContribution(currentPlayer,difference);
                                                }
                                            }
                                            
                                            currentPlayer.chipsInPocket -= chipsNeededToMatchTheBet;
                                            currentPlayer.currentBet = tableAfterMove.currentCallAmount;
                                            
                                            if(currentPlayer.chipsInPocket == 0) {
                                                currentPlayer.state = PlayerState.AllIn;
                                            }
                                            
                                            break;
                                        }

            case PlayerState.Raise : 	
                                        {	
                                            let chipsNeededToMatchTheBet: number = tableAfterMove.currentCallAmount - currentPlayer.currentBet;
                                            let raiseAmount: number = amountAdded;
                                            let totalAmountBeingAdded = chipsNeededToMatchTheBet + raiseAmount;
                                            
                                            if(totalAmountBeingAdded > currentPlayer.chipsInPocket) {
                                                throw new Error("The player doesn't have enough chips to raise the bet. Choose a smaller amount.");	
                                            }
console.log("Add Karo: " + totalAmountBeingAdded);
                                            //tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].addAmountToPot(totalAmountBeingAdded);
                                            
                                            let balance: number = totalAmountBeingAdded;
                                            for(let i: number = 0; i< tableAfterMove.potArray.length; i++) {
                                                let contribution: number = tableAfterMove.potArray[i].checkContribution(currentPlayer);
                                                
                                                if(contribution < tableAfterMove.potArray[i].currentPotBetAmount) {
                                                    let difference = tableAfterMove.potArray[i].currentPotBetAmount - contribution;
                                                    balance -= difference;
                                                    tableAfterMove.potArray[i].addAmountToPot(difference);
                                                    tableAfterMove.potArray[i].addContribution(currentPlayer,difference);
                                                }
                                            }
                                            tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].addAmountToPot(balance);
                                            tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].addContribution(currentPlayer,balance);
                                            
                                            currentPlayer.chipsInPocket -= totalAmountBeingAdded;
                                            currentPlayer.currentBet = currentPlayer.currentBet + totalAmountBeingAdded;
                                            tableAfterMove.currentCallAmount = currentPlayer.currentBet;
                                            tableAfterMove.roundStartIndex = tableAfterMove.currentPlayerIndex;
                                            tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].currentPotBetAmount += balance;
                                            
                                            if(currentPlayer.chipsInPocket == 0) {
                                                currentPlayer.state = PlayerState.AllIn;
                                            }                                            
                                            
                                            break;
                                        }
        }
console.log("Before :- RSI: " + tableAfterMove.roundStartIndex + " ; CPI: " + tableAfterMove.currentPlayerIndex);
        console.log("Turn Start: ");
   	    console.log("Player: " + tableAfterMove.currentPlayerIndex);
   	    console.log("Action: " + PlayerState[currentPlayer.state])
   	    console.log("Pot After the Turn: ");
        console.log(tableAfterMove.potArray);
   	    console.log(tableAfterMove.playerList);
   	    console.log('\n');
console.log("After :- RSI: " + tableAfterMove.roundStartIndex + " ; CPI: " + tableAfterMove.currentPlayerIndex);
        let gameOverOrNot: boolean = isGameOver(tableAfterMove);
        let turnIndexAfterMove: number;
              console.log("Problem1");
      
        if((((tableAfterMove.currentPlayerIndex + 1) % tableAfterMove.playerList.length) == tableAfterMove.roundStartIndex) && (currentPlayer.state != PlayerState.Init)) {
            console.log("Problem2");
            adjustPots(tableAfterMove);
            roundOver(tableAfterMove);
            
            lastCardOfTheRound = true;
                
                if(tableAfterMove.openedCards.length == 5) {
                    handOver = true;
                }
        }
        
        if (gameOverOrNot) {
            turnIndexAfterMove = -1;
        } 
        else {
            console.log("Problem3");
            
            if((tableAfterMove.openedCards.length == 0) && (handOver == false) && (currentPlayer.state == PlayerState.Init)
             && ((tableAfterMove.currentPlayerIndex == ((tableAfterMove.dealerIndex + 1) % tableAfterMove.playerList.length))
             ||(tableAfterMove.currentPlayerIndex == ((tableAfterMove.dealerIndex + 2)% tableAfterMove.playerList.length)))) {
                tableAfterMove.incrementCurrentAndRoundStartIndices();
                console.log("Problem4");
            }
            else {
                if(lastCardOfTheRound == false) {
                    tableAfterMove.incrementCurrentPlayerIndex();
                    console.log("Problem5");
                }
            }
            turnIndexAfterMove = tableAfterMove.currentPlayerIndex;
        }
        console.log("Problem6");      
        console.log("Pot After the Turn: ");
        console.log(tableAfterMove.potArray);
        console.log(tableAfterMove.playerList);
        console.log('\n');
        
        let delta: TableDelta = {currentPlayer: currentPlayer, amountAdded: amountAdded};
        let stateAfterMove: IState = {delta: delta, table: tableAfterMove};
        let endMatchScores: number[];
        endMatchScores = null;
        return {endMatchScores:endMatchScores, turnIndexAfterMove: turnIndexAfterMove, stateAfterMove: stateAfterMove};
    }

    export function roundOver(tableAfterMove: TableSetup) {
        switch(tableAfterMove.openedCards.length) {
                case 0: 
                        {
                            for( let i: number = 0; i<3; i++) {
                                tableAfterMove.openedCards.push(tableAfterMove.closedCards.pop());
                            }
    					
                            console.log("1st Round Over! 3 Cards Open");
                            tableAfterMove.verifyAndAdjustPots();
                            tableAfterMove.resetRound();
                            break;
                        }

                case 3: 
                        {
                            tableAfterMove.openedCards.push(tableAfterMove.closedCards.pop());
                            console.log("2nd Round Over! 1 Card Open");
                            tableAfterMove.resetRound();
                            break;
                        }

                case 4: 
                        {
                            tableAfterMove.openedCards.push(tableAfterMove.closedCards.pop());
                            console.log("3rd Round Over! 1 Card Open");
                            tableAfterMove.resetRound();
                            break;
                        }

                case 5: {
                            //All the Cards are already open. No bets remaining. Divide the pot; Basically call the Hand Eval Function.
                            tableAfterMove.winners = tableAfterMove.awardWinners();
                            
                            /* Once the winners are determined, change view to show winners*/
                            /*this should be changed to reflect changes in state*/
                            console.log("case 5 Called");
                            console.log("\nHand Over");
                            tableAfterMove.removePlayersWithInsufficientChips();
                            tableAfterMove.resetHand();
                            
                            if(tableAfterMove.playerList.length==0 || tableAfterMove.playerList.length==1) {
                                console.log("Game Over! Bye Bye! " + tableAfterMove.playerList.length + " Players left!");
                            }
                        }
            }
    }

 export function adjustPots(tableAfterMove: TableSetup) {
        
        for(let i: number = (tableAfterMove.potArray.length-1); i < tableAfterMove.potArray.length ; i++) {
            let currentPot = tableAfterMove.potArray[i];
            let minContribution: number = currentPot.playersContributions[0];
            let minContributors: Player[] = [];
            minContributors.push(currentPot.playersInvolved[0]);
            
            for(let j: number = 0; j < currentPot.playersInvolved.length; j++) {
                if( currentPot.playersInvolved[j].state == PlayerState.AllIn && currentPot.playersContributions[j] < currentPot.currentPotBetAmount) {
                    if(currentPot.playersContributions[j] < minContribution) {
                        minContribution = currentPot.playersContributions[j];
                        minContributors = []
                        minContributors.push(currentPot.playersInvolved[j]);
                    }
                    else if(currentPot.playersContributions[j] == minContribution) {
                        minContributors.push(currentPot.playersInvolved[j]);
                    }
                }    
            }
            
            if(minContribution < currentPot.currentPotBetAmount){
                let newPotObject: Pot = new Pot();
                
                let playerListExcludingMinContributors: Player[] = [];
                for(let j: number = 0; j < currentPot.playersInvolved.length; j++) {
                    let isMinimumContributor: boolean = false;
                    for(let k: number = 0; k < minContributors.length; k++) {
                        if(currentPot.playersInvolved[j] == minContributors[k]) {
                            isMinimumContributor = true;
                            break;                       
                        }
                    }
                    
                    if(isMinimumContributor == false) {
                        playerListExcludingMinContributors.push(currentPot.playersInvolved[j]);
                    }
                }
                
                let balance: number = minContribution;
                newPotObject.addAllPlayersToThePot(playerListExcludingMinContributors);
                newPotObject.currentPotBetAmount = currentPot.currentPotBetAmount - balance;
                
                let playersInThePotToBeSplit: Player[] = currentPot.playersInvolved;
                let playersContributionsInThePotToBeSplit: number[] = currentPot.playersContributions;
                
                let difference: number = 0;
                let newPotInitialAmount: number = 0;
                let playersBeingShifted: Player[] = [];
                let playersContributionsBeingShifted: number[] = [];
                
                for(let j: number = 0; j < playersInThePotToBeSplit.length; j++) {
                    if(playersContributionsInThePotToBeSplit[j] > balance) {
                        difference = playersContributionsInThePotToBeSplit[j] - balance;
                        currentPot.subtractContribution(playersInThePotToBeSplit[j], difference);
                        newPotInitialAmount += difference;
                        playersBeingShifted.push(playersInThePotToBeSplit[j]);
                        playersContributionsBeingShifted.push(difference);
                    }   
                }
                
                currentPot.currentPotBetAmount = balance; 
                currentPot.subtractAmountFromThePot(newPotInitialAmount);
                newPotObject.addAmountToPot(newPotInitialAmount);
                
                for(let j: number = 0; j<playersBeingShifted.length; j++) {
                    newPotObject.addContribution(playersBeingShifted[j], playersContributionsBeingShifted[j]);
                }
                
                tableAfterMove.potArray.push(newPotObject);
            }
        }
    }
    export function checkMoveOk(stateTransition: IStateTransition): void {

        // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need to verify that the move is OK.
        let turnIndexBeforeMove = stateTransition.turnIndexBeforeMove;
        let stateBeforeMove: IState = stateTransition.stateBeforeMove;
        let move: IMove = stateTransition.move;
        let deltaValue: TableDelta = stateTransition.move.stateAfterMove.delta;
        let currentPlayer = deltaValue.currentPlayer;
        let amountAdded = deltaValue.amountAdded;
    
        let expectedMove = createMove(stateBeforeMove, currentPlayer, amountAdded, turnIndexBeforeMove);
    
        if (!angular.equals(move, expectedMove)) {
            throw new Error("Expected move=" + angular.toJson(expectedMove, true) + ", but got stateTransition=" + angular.toJson(stateTransition, true))
        }
    }

export function canSmallBlindOrNot(tableAfterMove : Table) :boolean{
        if(tableAfterMove.getCumulativePotAmount() == 0) {
            return true;
        }
        else {
            return false;
        }
    }
 
    export function canBigBlindOrNot(tableAfterMove : Table) :boolean{
        if(tableAfterMove.getCumulativePotAmount() == tableAfterMove.smallBlind) {
            return true;
        }
        else {
            return false;
        }
    }
    
    export function canFoldOrNot(tableAfterMove : Table) :boolean{
        if(canSmallBlindOrNot(tableAfterMove) || canBigBlindOrNot(tableAfterMove)) {
            return false;
        }
        else {
            return true;
        }
    }
    
    export function canCheckOrNot(tableAfterMove : Table, currentPlayer : Player) :boolean{
         if (currentPlayer == null) {
            return false;
        }
        
        if(canSmallBlindOrNot(tableAfterMove) || canBigBlindOrNot(tableAfterMove)) {
            return false;
        }
        else if(tableAfterMove.currentCallAmount > currentPlayer.currentBet) {
            return false;
        }
        else {
            return true;
        }
    }
    
    export function canCallOrNot(tableAfterMove : Table, currentPlayer : Player) :boolean{
        
        if (currentPlayer == null) {
            return false;
        }
        
        let chipsNeededToMatchTheBet: number = tableAfterMove.currentCallAmount - currentPlayer.currentBet;
        
        if(canSmallBlindOrNot(tableAfterMove) || canBigBlindOrNot(tableAfterMove)) {
            return false;
        }
        else if(chipsNeededToMatchTheBet == 0) {
            return false;
        }
        else if(chipsNeededToMatchTheBet > currentPlayer.chipsInPocket) {
            return false;
        }
        else {
            return true;
        }
    }
    
    export function canRaiseOrNot(tableAfterMove : Table, currentPlayer : Player, amountAdded : number) :boolean{
        
         if (currentPlayer == null) {
            return false;
        }
        
        let chipsNeededToMatchTheBet: number = tableAfterMove.currentCallAmount - currentPlayer.currentBet;
        let raiseAmount: number = amountAdded;
        let totalAmountBeingAdded = chipsNeededToMatchTheBet + raiseAmount;
                 
        if(canSmallBlindOrNot(tableAfterMove) || canBigBlindOrNot(tableAfterMove)) {
            return false;
        }
        else if(totalAmountBeingAdded > currentPlayer.chipsInPocket) {
            return false;   
        }
        else {
            return true;    
        }
    }
        
    export function canAllInOrNot(tableAfterMove : Table, currentPlayer : Player) :boolean{
        
        if (currentPlayer == null) {
            return false;
        }
        
        if(canSmallBlindOrNot(tableAfterMove) || canBigBlindOrNot(tableAfterMove)) {
            return false;
        }
        else {
            return true;
        }
    }
    
    
    export function rankHand(str: string) :winningScoreAndCards {
        
        //takes a string of per person hands and returns the rank as a number
        let index: number = 10;//index into handRanks
        let winCardIndexes:number, i:number;
        let wci: number[] = [];
        
        let cardStr: string = str.replace(/A/g,"14").replace(/K/g,"13").replace(/Q/g,"12").replace(/J/g,"11").replace(/s|c|h|d/g,",");
        
        let cards: number[] = cardStr.replace(/\s/g, '').slice(0, -1).split(",").map(Number).filter(Boolean);;
        
        let suitsAsString: string[] = str.match(/s|c|h|d/g);
        let suits:number[] = [];
        
        for (i = 0; i<suitsAsString.length; i++) {
            if(suitsAsString[i] === "s") {
                suits[i] = 1;
            }
            else if(suitsAsString[i] === "c") {
                suits[i] = 8;
            }
            else if(suitsAsString[i] === "h") {
                suits[i] = 32;
            }else if(suitsAsString[i] === "d"){
                suits[i] = 64;
            }
        }
        
        if(cards !==null && suits!=null){
            if (cards.length == suits.length) {
                let e: string;
                let o : { [s: string]: number; }= {};
                let keyCount:number = 0;
                let j:string; 
                
                //o{}n is a map from the card as a string to the occurences of that card,
                // each card should have only one occurance;
                //keycount is used to check if all cards are unique
                for (i = 0; i < cards.length; i++) {//update the occurances for each cars+suite pair read;
                    e = cards[i]+suitsAsString[i]; 
                    o[e] = 1;
                }
                
                for (j in o) { 
                    if (o.hasOwnProperty(j)) {//count the number of unique cards in the list store
                        keyCount++;
                    }
                }               
               
                if (cards.length >=5) {
                    //iof cards are unique
                    if (cards.length == suits.length && cards.length == keyCount) {
                        //get the number of possile combinations for the cards, also all possible combionations
                        //example: for 5 cards, the cumber of combinations is 1(for a 5 card set) and the arrangements 0,1,2,3,4
                        let c:number[][] = getCombinations(5, cards.length);
                        
                        let maxRank:number = 0, winIndex:number = 10;
                    
                        for (i=0; i < c.length; i++) {
                            let cs: number[] = [cards[c[i][0]], cards[c[i][1]], cards[c[i][2]], cards[c[i][3]], cards[c[i][4]]];
                            let ss: number[] = [suits[c[i][0]], suits[c[i][1]], suits[c[i][2]], 
                            suits[c[i][3]], suits[c[i][4]]];
                            index = calcIndex(cs,ss);
                             
                            if (handRanks[index] > maxRank) {
                                maxRank = handRanks[index];
                                winIndex = index; 
                                wci = c[i].slice();
                            } 
                            else if (handRanks[index] == maxRank) {
                                
                                var score1 = getPokerScore(cs);
                                var score2 = getPokerScore([cards[wci[0]],cards[wci[1]],cards[wci[2]],cards[wci[3]],cards[wci[4]]]);
                                if (score1 > score2) { 
                                    wci= c[i].slice(); 
                                }
                            }
                        }
                        console.log("Final Winning hand: ");
                        console.log(wci); 
                        index = winIndex; 
                    }                    
                }  
            }
            console.log("Hand: " + handRanks[index]);
            console.log("Hand Name: "  + hands[index]);
            
            let winningScoreAndCardsObject: winningScoreAndCards = new winningScoreAndCards();
            winningScoreAndCardsObject.index = index;
            winningScoreAndCardsObject.wci = wci;
            
            return winningScoreAndCardsObject;
        }
    }
    
    export function getPokerScore(cs:number[]) {
        
        let a: number[] = cs.slice();
        let d: number[] = [];
        let i:number;
    
        for (i=0; i<5; i++) {
            d[a[i]] = (d[a[i]] >= 1) ? d[a[i]] + 1 : 1;
        }
    
        a.sort(function(a,b){return (d[a] < d[b]) ? +1 : (d[a] > d[b]) ? -1 : (b - a);});
        return a[0]<<16|a[1]<<12|a[2]<<8|a[3]<<4|a[4];
    }
    
    export function getCombinations(k:number ,n: number): number[][]{
        
        var result:number[][] = [], comb: number[] = [];
        function next_comb(comb:number[], k:number , n:number) {// calulates the combination of cards
            var i:number;
   
            if (comb.length === 0) {
                for (i = 0; i < k; ++i) {
                    comb[i] = i;
                } 
                return true;
            }
        
            i = k - 1; 
            ++comb[i];
   
            while ((i > 0) && (comb[i] >= n - k + 1 + i)) {
                --i; 
                ++comb[i];
            } 
   
            if (comb[0] > n - k) {
                return false;
            } // No more combinations can be generated
   
            for (i = i + 1; i < k; ++i) {
                comb[i] = comb[i-1] + 1;
            }
            return true;
        }
  
        while (next_comb(comb, k, n)) { 
            result.push(comb.slice());
        }
        return result;
    }
    
    function calcIndex(cs: number[],ss: number[]):number {
        let v:number,i:number,o:number,s:number; 
  
        for (i=-1, v=o=0; i<5; i++, o=Math.pow(2,cs[i]*4)) {
            v += o*((v/o&15)+1);
        }
  
        if ((v%=15)!=5) {
            return v-1;
        } 
        else { 
            s = 1<<cs[0]|1<<cs[1]|1<<cs[2]|1<<cs[3]|1<<cs[4];
        }
  
        v -= ((s/(s&-s) == 31) || (s == 0x403c) ? 3 : 1);
  
        if(ss[0] == (ss[0]|ss[1]|ss[2]|ss[3]|ss[4])) {
            return v - ((s == 0x7c00) ? -5 : 1);
        }
        else {
            return v;
        }
    }
    
    export function resolveEqualHandsConflict(tableCards: Card[], playerWithConflicts: Player[], winningCardsList : number[][], conflictType: string ) {
        
        console.log("Conflict Type : " + conflictType);
        
        let currentPlayerWinningCards : Card[][] = [];
        let winningPlayersList : Player[] = [];
        
        for(let i: number = 0; i<playerWithConflicts.length; i++) {
            currentPlayerWinningCards[i] = [];
            for(let j: number = 0; j<winningCardsList[i].length; j++) {
                if(winningCardsList[i][j] < 2) {
                    currentPlayerWinningCards[i].push(playerWithConflicts[i].cards[winningCardsList[i][j]]);
                }
                else
                {
                    currentPlayerWinningCards[i].push(tableCards[winningCardsList[i][j]-2]);
                }
            }
        }
        
        switch(conflictType) {
            case "4 of a Kind":
                                    {
                                        return resolve_4_OfAKind(tableCards, playerWithConflicts, winningCardsList, conflictType, currentPlayerWinningCards, winningPlayersList);                                         
                                    }
            case "3 of a Kind":
                                    {
                                        return resolve_3_OfAKind(tableCards, playerWithConflicts, winningCardsList, conflictType, currentPlayerWinningCards, winningPlayersList);
                                    }
            case "1 Pair":
                                    {
                                        return resolve_2_OfAKind(tableCards, playerWithConflicts, winningCardsList, conflictType, currentPlayerWinningCards, winningPlayersList);    
                                    }
            case "Straight Flush":
                                    {
                                        return findHighestCard(tableCards, playerWithConflicts, winningCardsList, conflictType, currentPlayerWinningCards, winningPlayersList);
                                    }
            case "Straight": 
                                    {
                                        return findHighestCard(tableCards, playerWithConflicts, winningCardsList, conflictType, currentPlayerWinningCards, winningPlayersList);
                                    }
            case "Flush":
                                    {
                                        return resolveHighestCard(tableCards, playerWithConflicts, winningCardsList, conflictType, currentPlayerWinningCards, winningPlayersList);
                                    }
            case "High Card":   
                                    {
                                        return resolveHighestCard(tableCards, playerWithConflicts, winningCardsList, conflictType, currentPlayerWinningCards, winningPlayersList);
                                    }
            case "Full House": 
                                    {
                                        return resolve_3_OfAKind(tableCards, playerWithConflicts, winningCardsList, conflictType, currentPlayerWinningCards, winningPlayersList);
                                    }
            case "Royal Flush":
                                    {
                                        return playerWithConflicts;
                                    }
            case "2 Pair":  
                                    {
                                        return resolve2Pairs(tableCards, playerWithConflicts, winningCardsList, conflictType, currentPlayerWinningCards, winningPlayersList);
                                    }
            case "-Invalid-":       {
                                        return;
                                    }
        }
    }

    export function resolve_4_OfAKind(tableCards: Card[], playerWithConflicts: Player[], winningCardsList: number[][], conflictType: string, currentPlayerWinningCards: Card[][], winningPlayersList: Player[]) {
        
        let maxnum: number = 0;
        let highestKickerCardNumber = 0;                                
        let playerWithHighestKickerCardNumber: Player;
                                        
        for(let i: number = 0; i<playerWithConflicts.length; i++) {
            let count: number = 1;
            let highestCurrentPlayerKickerCardNumber = 0;
            let num: string = "";
                                            
            for(let j: number = 0; j<currentPlayerWinningCards[i].length-1; j++) {
                for(let k: number = j+1; k<currentPlayerWinningCards[i].length; k++) {
                    if(currentPlayerWinningCards[i][j].cardNumber==currentPlayerWinningCards[i][k].cardNumber) {
                        count++;
                    }
                }
                num = currentPlayerWinningCards[i][j].cardNumber;
            
                if(count == 4) {
                    break;
                }
                else {
                    count = 1;
                }
            }
            
            count = 0;  
            for(let j: number = 0; j<currentPlayerWinningCards[i].length; j++) {
                count = 1;
                
                for(let k: number = 0; k<currentPlayerWinningCards[i].length; k++) {
                    if(currentPlayerWinningCards[i][j].cardNumber==currentPlayerWinningCards[i][k].cardNumber && j!=k) {
                        count++;
                    }        
                }
                
                if(count==1 && getCardIntegerValue(currentPlayerWinningCards[i][j].cardNumber) > highestCurrentPlayerKickerCardNumber) {
                    highestCurrentPlayerKickerCardNumber = getCardIntegerValue(currentPlayerWinningCards[i][j].cardNumber);
                }
            }
                                              
            let numberValue: number = getCardIntegerValue(num);
            
            if( numberValue > maxnum) {
                maxnum = numberValue;
                highestKickerCardNumber = highestCurrentPlayerKickerCardNumber;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if(numberValue == maxnum && highestCurrentPlayerKickerCardNumber > highestKickerCardNumber) {
                highestKickerCardNumber = highestCurrentPlayerKickerCardNumber;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if(numberValue == maxnum && highestCurrentPlayerKickerCardNumber == highestKickerCardNumber) {
                winningPlayersList.push(playerWithConflicts[i]);
            }
        }        
        return winningPlayersList;
    }
    
    export function resolve_3_OfAKind(tableCards: Card[], playerWithConflicts: Player[], winningCardsList : number[][], conflictType: string, currentPlayerWinningCards : Card[][], winningPlayersList: Player[]) {
        let maxnum: number = 0;
        let secondHighestKickerCardNumber = 0;
        let highestKickerCardNumber = 0;                                
        let playerWithHighestKickerCardNumber: Player;
                                        
        for(let i: number = 0; i<playerWithConflicts.length; i++) {
            let count: number = 1;
            let highestCurrentPlayerKickerCardNumber = 0;
            let secondHighestCurrentPlayerKickerCardNumber = 0;
            let num: string = "";
                                            
            for(let j: number = 0; j<currentPlayerWinningCards[i].length-1; j++) {
                for(let k: number = j+1; k<currentPlayerWinningCards[i].length; k++) {
                    if(currentPlayerWinningCards[i][j].cardNumber==currentPlayerWinningCards[i][k].cardNumber) {
                        count++;
                    }
                }
                num = currentPlayerWinningCards[i][j].cardNumber;
            
                if(count == 3) {
                    break;
                }
                else {
                    count = 1;
                }
            }
            
            count = 0;  
            for(let j: number = 0; j<currentPlayerWinningCards[i].length; j++) {
                count = 1;
                
                for(let k: number = 0; k<currentPlayerWinningCards[i].length; k++) {
                    if(currentPlayerWinningCards[i][j].cardNumber==currentPlayerWinningCards[i][k].cardNumber && j!=k) {
                        count++;
                    }        
                }
                
                if(count!=3 && getCardIntegerValue(currentPlayerWinningCards[i][j].cardNumber) > highestCurrentPlayerKickerCardNumber) {
                    secondHighestCurrentPlayerKickerCardNumber = highestCurrentPlayerKickerCardNumber;
                    highestCurrentPlayerKickerCardNumber = getCardIntegerValue(currentPlayerWinningCards[i][j].cardNumber);
                }
                else if (count!=3 && getCardIntegerValue(currentPlayerWinningCards[i][j].cardNumber) > highestCurrentPlayerKickerCardNumber) {
                    secondHighestCurrentPlayerKickerCardNumber = getCardIntegerValue(currentPlayerWinningCards[i][j].cardNumber);
                }
            }
                                              
            let numberValue: number = getCardIntegerValue(num);
            console.log("3 Of A Kind: " + numberValue + " ; Kicker: " + highestCurrentPlayerKickerCardNumber);                                
            
            if( numberValue > maxnum) {
                maxnum = numberValue;
                highestKickerCardNumber = highestCurrentPlayerKickerCardNumber;
                secondHighestCurrentPlayerKickerCardNumber = highestCurrentPlayerKickerCardNumber;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if(numberValue == maxnum && highestCurrentPlayerKickerCardNumber > highestKickerCardNumber) {
                highestKickerCardNumber = highestCurrentPlayerKickerCardNumber;
                secondHighestKickerCardNumber = secondHighestCurrentPlayerKickerCardNumber;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if(numberValue == maxnum && highestCurrentPlayerKickerCardNumber == highestKickerCardNumber && secondHighestCurrentPlayerKickerCardNumber > secondHighestKickerCardNumber)
            {
                secondHighestKickerCardNumber = secondHighestCurrentPlayerKickerCardNumber;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if(numberValue == maxnum && highestCurrentPlayerKickerCardNumber == highestKickerCardNumber && secondHighestCurrentPlayerKickerCardNumber == secondHighestKickerCardNumber) {
                winningPlayersList.push(playerWithConflicts[i]);
            }
        }        
        return winningPlayersList;
    }
    
    export function resolve_2_OfAKind(tableCards: Card[], playerWithConflicts: Player[], winningCardsList: number[][], conflictType: string, currentPlayerWinningCards: Card[][], winningPlayersList: Player[]) {
        
        let maxnum: number = 0;
        let firstMaxGlobal: number = 0;
        let secondMaxGlobal: number = 0;
        let thirdMaxGlobal: number = 0;
                                        
        for(let i: number = 0; i<playerWithConflicts.length; i++) {
            let count: number = 1;
            let num: string = "";
                                            
            for(let j: number = 0; j<currentPlayerWinningCards[i].length-1; j++) {
                for(let k: number = j+1; k<currentPlayerWinningCards[i].length; k++) {
                    if(currentPlayerWinningCards[i][j].cardNumber==currentPlayerWinningCards[i][k].cardNumber) {
                        count++;
                    }
                }
                num = currentPlayerWinningCards[i][j].cardNumber;
            
                if(count == 2) {
                    break;
                }
                else {
                    count = 1;
                }
            }
            
            let firstMax: number = 0;
            let secondMax: number = 0;
            let thirdMax: number = 0;  
            let numberValue: number = getCardIntegerValue(num);
            
            for(let j: number = 0; j<currentPlayerWinningCards[i].length; j++) {
                let currentNumber: number = getCardIntegerValue(currentPlayerWinningCards[i][j].cardNumber);
                
                if(currentNumber != numberValue) {
                    if(currentNumber > firstMax) {
                        thirdMax = secondMax;
                        secondMax = firstMax;
                        firstMax = currentNumber;
                    }
                    else if(currentNumber > secondMax) {
                        thirdMax = secondMax;
                        secondMax = currentNumber;
                    }
                    else if(currentNumber > thirdMax) {
                        thirdMax = currentNumber;
                    }
                }
            }
            
            if( numberValue > maxnum) {
                maxnum = numberValue;
                firstMaxGlobal = firstMax;
                secondMaxGlobal = secondMax;
                thirdMaxGlobal = thirdMax;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if(numberValue == maxnum && firstMax > firstMaxGlobal) {
                firstMaxGlobal = firstMax;
                secondMaxGlobal = secondMax;
                thirdMaxGlobal = thirdMax;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if(numberValue == maxnum && firstMax == firstMaxGlobal && secondMax > secondMaxGlobal) {
                secondMaxGlobal = secondMax;
                thirdMaxGlobal = thirdMax;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if(numberValue == maxnum && firstMax == firstMaxGlobal && secondMax == secondMaxGlobal && thirdMax > thirdMaxGlobal) {
                thirdMaxGlobal = thirdMax;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if(numberValue == maxnum && firstMax == firstMaxGlobal && secondMax == secondMaxGlobal && thirdMax == thirdMaxGlobal) {
                winningPlayersList.push(playerWithConflicts[i]);
            }
        }        
        return winningPlayersList;
    }
    
    export function findHighestCard(tableCards: Card[], playerWithConflicts: Player[], winningCardsList : number[][], conflictType: string, currentPlayerWinningCards : Card[][], winningPlayersList: Player[]) {
        
        let maxnum: number = 0;
                                        
        for(let i: number = 0; i<playerWithConflicts.length; i++) {
            let maxNumber: number = 0;                               
            
            for(let j: number = 0; j<currentPlayerWinningCards[i].length; j++) {
                let numberValue: number = getCardIntegerValue(currentPlayerWinningCards[i][j].cardNumber);
                if(numberValue > maxNumber) {
                    maxNumber = numberValue;
                }    
            }
                                            
            if( maxNumber > maxnum) {
                maxnum = maxNumber;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if(maxNumber == maxnum) {
                winningPlayersList.push(playerWithConflicts[i]);
            }
        }        
        return winningPlayersList;
    }
    
    export function resolveHighestCard(tableCards: Card[], playerWithConflicts: Player[], winningCardsList : number[][], conflictType: string, currentPlayerWinningCards : Card[][], winningPlayersList: Player[]) {
        
        let winningPlayerWinningCards : Card[][] = [];
        
        for(let i: number = 0; i<currentPlayerWinningCards.length; i++) { 
            currentPlayerWinningCards[i].sort(sortNumber);
        }
        
        for(let i: number = 0; i<5; i++) {
            let maxIthNumber: number = 0;
            
            for(let j: number = 0; j<playerWithConflicts.length; j++) {
                if(getCardIntegerValue(currentPlayerWinningCards[j][i].cardNumber) > maxIthNumber) {
                    maxIthNumber = getCardIntegerValue(currentPlayerWinningCards[j][i].cardNumber);
                    winningPlayersList = [];
                    winningPlayersList.push(playerWithConflicts[j]);
                    winningPlayerWinningCards = [];
                    winningPlayerWinningCards.push(currentPlayerWinningCards[j]);
                }
                else if(getCardIntegerValue(currentPlayerWinningCards[j][i].cardNumber) == maxIthNumber) {
                    winningPlayersList.push(playerWithConflicts[j]);
                    winningPlayerWinningCards.push(currentPlayerWinningCards[j]);
                }
            }
            
            if(winningPlayersList.length==1 || i==4) {
                return winningPlayersList;
            }
            else {
                playerWithConflicts = winningPlayersList;
                currentPlayerWinningCards = winningPlayerWinningCards;
                winningPlayersList = [];
            }
        }
        return winningPlayersList;
    }
    
    export function resolve2Pairs(tableCards: Card[], playerWithConflicts: Player[], winningCardsList: number[][], conflictType: string, currentPlayerWinningCards: Card[][], winningPlayersList: Player[]) {
        
        let highestPair: number = 0;
        let secondHighestPair: number = 0;
        let maxKicker: number = 0;
                                        
        for(let i: number = 0; i<playerWithConflicts.length; i++) {
            let count: number = 1;
            let currentPlayerhighestPair: number = 0;
            let currentPlayerSecondHighestPair = 0;
            
            let currentPlayerKicker = 0;
                                            
            for(let j: number = 0; j<currentPlayerWinningCards[i].length-1; j++) {
                for(let k: number = j+1; k<currentPlayerWinningCards[i].length; k++) {
                    if(currentPlayerWinningCards[i][j].cardNumber==currentPlayerWinningCards[i][k].cardNumber) {
                        count++;
                    }
                }
                
                if(count == 2) {
                    let numberValue: number = getCardIntegerValue(currentPlayerWinningCards[i][j].cardNumber);
                    if(numberValue > currentPlayerhighestPair) {
                        currentPlayerSecondHighestPair = currentPlayerhighestPair;
                        currentPlayerhighestPair = numberValue;
                    }
                    else if(numberValue > currentPlayerSecondHighestPair) {
                        currentPlayerSecondHighestPair = numberValue;
                    }
                }
                else {
                    count = 1;
                }
            }
             
            count = 1;  
            for(let j: number = 0; j<currentPlayerWinningCards[i].length; j++) {
                count = 1;
                
                for(let k: number = 0; k<currentPlayerWinningCards[i].length; k++) {
                    if(currentPlayerWinningCards[i][j].cardNumber==currentPlayerWinningCards[i][k].cardNumber && j!=k) {
                        count++;
                    }        
                }
                
                if(count==1) {
                    currentPlayerKicker = getCardIntegerValue(currentPlayerWinningCards[i][j].cardNumber);
                    break;
                }
            }                               
                                            
            if(currentPlayerhighestPair > highestPair) {
                highestPair = currentPlayerhighestPair;
                secondHighestPair = currentPlayerSecondHighestPair;
                maxKicker = currentPlayerKicker
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if(currentPlayerhighestPair == highestPair && currentPlayerSecondHighestPair > secondHighestPair) {
                secondHighestPair = currentPlayerSecondHighestPair;
                maxKicker = currentPlayerKicker
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if(currentPlayerhighestPair == highestPair && currentPlayerSecondHighestPair == secondHighestPair && currentPlayerKicker > maxKicker) {
                maxKicker = currentPlayerKicker;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if(currentPlayerhighestPair == highestPair && currentPlayerSecondHighestPair == secondHighestPair && currentPlayerKicker == maxKicker) {
                winningPlayersList.push(playerWithConflicts[i]);
            }
        }        
        return winningPlayersList;
    }
    
    export function getCardIntegerValue(cardNumberString: string) {
        switch(cardNumberString) {
            case "J": return 11;
            case "Q": return 12;
            case "K": return 13;
            case "A": return 14;
            default: return Number(cardNumberString);
        }
    }
    
    export function sortNumber(a: Card, b: Card) {
        if (getCardIntegerValue(a.cardNumber) > getCardIntegerValue(b.cardNumber)) {
            return -1;
        }
        else if (getCardIntegerValue(a.cardNumber) < getCardIntegerValue(b.cardNumber)) {
            return 1;
        }
        else { 
            return 0;
        }
    }

    export function forSimpleTestHtml() {
        
        var move = gameLogic.createMove(null, null, 0, 0);
        
        move = gameLogic.createMove(move.stateAfterMove, null, 0, move.turnIndexAfterMove);
        
        move.stateAfterMove.table.playerList[2].state = PlayerState.Fold;
        move = gameLogic.createMove(move.stateAfterMove, null, 0,  move.turnIndexAfterMove);
        
        move.stateAfterMove.table.playerList[3].state = PlayerState.Fold;
        move = gameLogic.createMove(move.stateAfterMove, null, 0,  move.turnIndexAfterMove);
        
        move.stateAfterMove.table.playerList[4].state = PlayerState.Fold;
        move = gameLogic.createMove(move.stateAfterMove, null, 0,  move.turnIndexAfterMove);
        
        move.stateAfterMove.table.playerList[0].state = PlayerState.Raise;
        move = gameLogic.createMove(move.stateAfterMove, null, 30,  move.turnIndexAfterMove);
        
        move.stateAfterMove.table.playerList[1].state = PlayerState.Raise;
        move = gameLogic.createMove(move.stateAfterMove, null, 30,  move.turnIndexAfterMove);
        
        /** Three Cards Opened */
        /**
        move.stateAfterMove.table.playerList[2].state = PlayerState.Check;
        move = gameLogic.createMove(move.stateAfterMove, null, 0,  move.turnIndexAfterMove);
        
        move.stateAfterMove.table.playerList[4].state = PlayerState.Fold;
        move = gameLogic.createMove(move.stateAfterMove, null, 0,  move.turnIndexAfterMove);
        
        move.stateAfterMove.table.playerList[0].state = PlayerState.Check;
        move = gameLogic.createMove(move.stateAfterMove, null, 0,  move.turnIndexAfterMove);
        */
        /** Fourth Card Opened */
        /**
        move.stateAfterMove.table.playerList[2].state = PlayerState.Check;
        move = gameLogic.createMove(move.stateAfterMove, null, 0,  move.turnIndexAfterMove);
        
        move.stateAfterMove.table.playerList[0].state = PlayerState.Check;
        move = gameLogic.createMove(move.stateAfterMove, null, 0,  move.turnIndexAfterMove);
        */
        /** Fifth Card Opened */
        /**
        move.stateAfterMove.table.playerList[2].state = PlayerState.Check;
        move = gameLogic.createMove(move.stateAfterMove, null, 0,  move.turnIndexAfterMove);
        
        move.stateAfterMove.table.playerList[0].state = PlayerState.Check;
        move = gameLogic.createMove(move.stateAfterMove, null, 0,  move.turnIndexAfterMove);
        */
        /**Hand Over */

    }
}