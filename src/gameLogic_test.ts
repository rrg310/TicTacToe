enum CardSuite { c, d, h, s }

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
	currentBet : number;
	cards : Card[];
	//presentInCurrentPot : boolean;

	constructor(id : string, name : string) {
		this.id = id;
		this.name = name;
		this.state = PlayerState.Init;
		this.cards = [];
		this.chipsInPocket = 500;
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
	totalAmount : number;

	constructor () {
		this.totalAmount = 0;
	}

	addAmountToPot (newAmount: number) {
		this.totalAmount = this.totalAmount + newAmount;
	}

	getWinners(playerList: Player[]) {
		let winnerList: Player[] = [];
		winnerList.push(playerList[0]);
		winnerList.push(playerList[2]);
		return winnerList;
	}
}

class TableSetup {
    
	playerList : Player[];
	deck : Card[];
	openedCards : Card[];
	closedCards : Card[];
	dealerIndex : number;
	currentPlayerIndex : number;
	pot : Pot;
	smallBlind : number;
	bigBlind : number;
	roundStartIndex : number;
	currentCallAmount : number;

    constructor() {
        this.playerList = [];
		this.deck = [];
		this.openedCards = [];
		this.closedCards = [];
		this.dealerIndex = 0;
		this.currentPlayerIndex = this.dealerIndex + 1;
		this.roundStartIndex = this.dealerIndex + 1;
		this.pot = new Pot();
		this.smallBlind = 10;
		this.bigBlind = 20;
		this.currentCallAmount = 0;
    }

    addPlayerToTheTable(player : Player) {
    	this.playerList.push(player);
    }

    incrementCurrentPlayerIndex() {
    	this.currentPlayerIndex++;
    	this.currentPlayerIndex %= this.playerList.length;
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

    resetRound() {
    	this.roundStartIndex = (this.dealerIndex + 1) % this.playerList.length;
		this.currentPlayerIndex = this.roundStartIndex;
		this.currentCallAmount = 0;

		for( let i: number = 0; i<this.playerList.length; i++) {
			this.playerList[i].currentBet = 0;

			if(this.playerList[i].state != PlayerState.Fold) {
				this.playerList[i].state = PlayerState.Init;
			}
		}
    }

    resetPot() {
    	this.dealerIndex = (this.dealerIndex + 1) % this.playerList.length;
    	this.roundStartIndex = (this.dealerIndex + 1) % this.playerList.length;
		this.currentPlayerIndex = this.roundStartIndex;
		this.currentCallAmount = 0;
		this.pot = new Pot();

		for( let i: number = 0; i<this.playerList.length; i++) {
			this.playerList[i].currentBet = 0;
			this.playerList[i].state = PlayerState.Init;
			this.playerList[i].cards = [];
			//presentInCurrentPot = true;
		}

		this.deck = initializeTableDeck();
    	//printCardDeck(this.deck);
    	distributeCards(this);
    }

    removePlayersWithInsufficientChips() {
    	for(let i: number = 0; i<this.playerList.length; i++) {
    		if(this.playerList[i].chipsInPocket < this.bigBlind) {
    			this.playerList.splice(i,1);
    		}
    	}
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

    //Shuffle the Deck.
    for (let i : number = cardDeck.length - 1; i > 0; i--) {
        let j : number = Math.floor(Math.random() * (i + 1));
        let tempCard : Card = cardDeck[i];
        cardDeck[i] = cardDeck[j];
        cardDeck[j] = tempCard;
    }
    
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
  
    /** Returns the initial TicTacToe board, which is a ROWSxCOLS matrix containing ''. */
    export function getInitialTable(): Table {
        let table : Table = new TableSetup(); 

        table.addPlayerToTheTable(new Player("adit91","Adit"));
        table.addPlayerToTheTable(new Player("ridhi91","Ridhi"));
        table.addPlayerToTheTable(new Player("anto90","Anto"));
        table.addPlayerToTheTable(new Player("gaurav89","Gaurav"));
        table.addPlayerToTheTable(new Player("rachita88","Rachita"));

        table.deck = initializeTableDeck();
        //printCardDeck(table.deck);  
        distributeCards(table);
    
        /**
        console.log("Cards on the Table");
        printCardDeck(table.Deck);
    
        console.log("\nPlayer1:");
        printCardDeck(table.PlayerList[0].playerCards);
    
        console.log("\nPlayer2:");
        printCardDeck(table.PlayerList[1].playerCards);
    
        console.log("\nPlayer3:");
        printCardDeck(table.PlayerList[2].playerCards);
    
        console.log("\nPlayer4:");
        printCardDeck(table.PlayerList[3].playerCards);
    
        console.log("\nPlayer5:");
        printCardDeck(table.PlayerList[4].playerCards);
        */

        return table;
    }

    export function getInitialState(): IState {
        return {table: getInitialTable(), delta: null};
    }
  
    export function createMove(
        stateBeforeMove: IState, currentPlayer: Player, amountAdded: number, turnIndexBeforeMove: number): IMove {
            console.log("Create Move");
        if (!stateBeforeMove) { 
            stateBeforeMove = getInitialState();
        }
    
        let lastCardOfTheRound: boolean = false;
        let table: Table = stateBeforeMove.table;
            
        if (isGameOver(table)) {
    	   throw new Error("Can only make a move if the game is not over! Number of required payers for the game not satisfied");
        }

        let tableAfterMove = angular.copy(table);
        currentPlayer = tableAfterMove.playerList[tableAfterMove.currentPlayerIndex];
        
        /**
        if(currentPlayer.state == PlayerState.Fold) {
    	   return {turnIndexAfterMove: turnIndexAfterMove, stateAfterMove: stateBeforeMove};
        }
        */
        
        //console.log("1st: " + tableAfterMove.playerList[0].cards[0].cardNumber);
        //console.log("2nd: " + tableAfterMove.playerList[0].cards[1].cardNumber);
        
        if(tableAfterMove.openedCards.length == 0) {
            if((tableAfterMove.currentPlayerIndex == tableAfterMove.dealerIndex + 1) && (currentPlayer.state == PlayerState.Init)) {
    		    tableAfterMove.pot.addAmountToPot(tableAfterMove.smallBlind);
                currentPlayer.chipsInPocket -= tableAfterMove.smallBlind;
                currentPlayer.currentBet = tableAfterMove.smallBlind;
                tableAfterMove.currentCallAmount = tableAfterMove.smallBlind;
            }
            else if((tableAfterMove.currentPlayerIndex == tableAfterMove.dealerIndex + 2) && (currentPlayer.state == PlayerState.Init)){
                tableAfterMove.pot.addAmountToPot(tableAfterMove.bigBlind);
                currentPlayer.chipsInPocket -= tableAfterMove.bigBlind;
                currentPlayer.currentBet = tableAfterMove.bigBlind;
                tableAfterMove.currentCallAmount = tableAfterMove.bigBlind;
            }
        }
        
        //console.log("1st: " + tableAfterMove.playerList[0].cards[0].cardNumber);
        //console.log("2nd: " + tableAfterMove.playerList[0].cards[1].cardNumber);
        
        switch(currentPlayer.state) {

            case PlayerState.Fold : 
                                        {
                                            //tableAfterMove.playerList[tableAfterMove.currentPlayerIndex].presentInCurrentPot = false;
                                            break;
                                        }

            case PlayerState.AllIn :	
                                        {
                                            if(currentPlayer.chipsInPocket == 0) {
                                                throw new Error("The player doesn't have chips to place a bet. He is already All-in.");	
                                            }

                                            let totalBetAmountByCurrentPlayer: number = currentPlayer.currentBet + currentPlayer.chipsInPocket;

                                            if(totalBetAmountByCurrentPlayer < tableAfterMove.currentCallAmount) {
                                                for( let i: number = 0; i<tableAfterMove.playerList.length ;i++) {
                                                    let difference: number = tableAfterMove.playerList[i].currentBet - totalBetAmountByCurrentPlayer;

                                                    if(difference > 0) {
                                                        tableAfterMove.playerList[i].chipsInPocket += difference;
                                                        tableAfterMove.pot.totalAmount -= difference;
                                                    }
                                                }
                                                tableAfterMove.currentCallAmount = totalBetAmountByCurrentPlayer;
                                            }

                                            tableAfterMove.pot.addAmountToPot(currentPlayer.chipsInPocket);
                                            currentPlayer.chipsInPocket = 0;
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

                                            tableAfterMove.pot.addAmountToPot(chipsNeededToMatchTheBet);
                                            currentPlayer.chipsInPocket -= chipsNeededToMatchTheBet;
                                            currentPlayer.currentBet = tableAfterMove.currentCallAmount;
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

                                            tableAfterMove.pot.addAmountToPot(totalAmountBeingAdded);
                                            currentPlayer.chipsInPocket -= totalAmountBeingAdded;
                                            currentPlayer.currentBet = currentPlayer.currentBet + totalAmountBeingAdded;
                                            tableAfterMove.currentCallAmount = currentPlayer.currentBet;
                                            tableAfterMove.roundStartIndex = tableAfterMove.currentPlayerIndex;
                                            break;
                                        }
        }

        //console.log("1st: " + tableAfterMove.playerList[0].cards[0].cardNumber);
        //console.log("2nd: " + tableAfterMove.playerList[0].cards[1].cardNumber);

        console.log("Turn Start: ");
   	    console.log("Player: " + tableAfterMove.currentPlayerIndex);
   	    console.log("Action: " + PlayerState[currentPlayer.state])
   	    console.log("Pot After the Turn: " + tableAfterMove.pot.totalAmount);
   	    console.log(tableAfterMove.playerList);
   	    console.log('\n');
    
        let gameOverOrNot: boolean = isGameOver(tableAfterMove);
        let turnIndexAfterMove: number;
        
        //console.log("1st: " + tableAfterMove.playerList[0].cards[0].cardNumber);
        //console.log("2nd: " + tableAfterMove.playerList[0].cards[1].cardNumber);
        
        if((tableAfterMove.currentPlayerIndex + 1 == tableAfterMove.roundStartIndex) && (currentPlayer.state!=PlayerState.Init)) {
            switch(tableAfterMove.openedCards.length) {
                case 0: 
                        {
                            for( let i: number = 0; i<3; i++) {
                                tableAfterMove.openedCards.push(tableAfterMove.closedCards.pop());
                            }
    					
                            console.log("1st Round Over! 3 Cards Open");
                            tableAfterMove.resetRound();
                            lastCardOfTheRound = true;
                            break;
                        }

                case 3: 
                        {
                            tableAfterMove.openedCards.push(tableAfterMove.closedCards.pop());
                            console.log("2nd Round Over! 1 Card Open");
                            tableAfterMove.resetRound();
                            lastCardOfTheRound = true;
                            break;
                        }

                case 4: 
                        {
                            tableAfterMove.openedCards.push(tableAfterMove.closedCards.pop());
                            console.log("3rd Round Over! 1 Card Open");
                            tableAfterMove.resetRound();
                            lastCardOfTheRound = true;
                            break;
                        }

                case 5: {
                            //All the Cards are already open. Not bets remaining. Divide the pot; Basically call the Hand Eval Function.
                            let winningPlayers: Player[] = tableAfterMove.pot.getWinners(tableAfterMove.playerList);
                            let noOfWinners: number = winningPlayers.length;
                            let potAmountPerPerson = (tableAfterMove.pot.totalAmount/noOfWinners);
                            
                            //console.log("11st: " + tableAfterMove.playerList[0].cards[0].cardNumber);
                            //console.log("22nd: " + tableAfterMove.playerList[0].cards[1].cardNumber);
                            
                            for(let i:number = 0; i<winningPlayers.length; i++) {
                                winningPlayers[i].chipsInPocket += potAmountPerPerson;
                            }

                            console.log("Game Over");

                            //console.log("111st: " + tableAfterMove.playerList[0].cards[0].cardNumber);
                            //console.log("222nd: " + tableAfterMove.playerList[0].cards[1].cardNumber);
                            let tableCardsString: string = tableAfterMove.convertTableCardArrayToString();
                            
                            for(let i: number = 0; i<tableAfterMove.playerList.length; i++) {
                                console.log('\n');
                                console.log("Player " + i + ": ")
                                rankHand(tableAfterMove.playerList[i].convertPlayerCardArrayToString() + tableCardsString);    
                            }
                            
                            //console.log("1111st: " + tableAfterMove.playerList[0].cards[0].cardNumber);
                            //console.log("2222nd: " + tableAfterMove.playerList[0].cards[1].cardNumber);
                            
                            tableAfterMove.resetPot();
                            
                            tableAfterMove.removePlayersWithInsufficientChips();
                            lastCardOfTheRound = true;
                        }
            }
        }
        
        //console.log("11111st: " + tableAfterMove.playerList[0].cards[0].cardNumber);
        //console.log("22222nd: " + tableAfterMove.playerList[0].cards[1].cardNumber);

        if (gameOverOrNot) {
            turnIndexAfterMove = -1;
        } 
        else {
            if((tableAfterMove.openedCards.length == 0) && (currentPlayer.state == PlayerState.Init) && ((tableAfterMove.currentPlayerIndex == tableAfterMove.dealerIndex + 1)||(tableAfterMove.currentPlayerIndex == tableAfterMove.dealerIndex + 2))) {
                tableAfterMove.incrementCurrentAndRoundStartIndices();
            }
            else {
                if(lastCardOfTheRound == false) {
                tableAfterMove.incrementCurrentPlayerIndex();
      		    }
            }
            turnIndexAfterMove = tableAfterMove.currentPlayerIndex;
        }

        let delta: TableDelta = {currentPlayer: currentPlayer, amountAdded: amountAdded};
        let stateAfterMove: IState = {delta: delta, table: tableAfterMove};
        return {turnIndexAfterMove: turnIndexAfterMove, stateAfterMove: stateAfterMove};
    }

    export function checkMoveOk(stateTransition: IStateTransition): void {

        // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need to verify that the move is OK.
        let turnIndexBeforeMove = stateTransition.turnIndexBeforeMove;
        let stateBeforeMove: IState = stateTransition.stateBeforeMove;
        let move: IMove = stateTransition.move;
        let deltaValue: TableDelta = stateTransition.move.stateAfterMove.delta;
        let currentPlayer = deltaValue.currentPlayer;
        let amountAdded = deltaValue.amountAdded;
        
        //
        console.log("checkMoveOk: Called with ",stateTransition);
        //
        let expectedMove = createMove(stateBeforeMove, currentPlayer, amountAdded, turnIndexBeforeMove);
    
        if (!angular.equals(move, expectedMove)) {
            throw new Error("Expected move=" + angular.toJson(expectedMove, true) + ", but got stateTransition=" + angular.toJson(stateTransition, true))
        }
    }

    export function rankHand(str: string) :number {
        
        //gameLogic.rankHand("Ah Kh Qh Jh 10h 9s 8s");
        //takes a string of per person hands and returns the rank as a number
        let index: number = 10;//index into handRanks
        let winCardIndexes:number, i:number;
        //extract crads and card hands from input str
  
        let cardStr: string = str.replace(/A/g,"14").replace(/K/g,"13").replace(/Q/g,"12").replace(/J/g,"11").replace(/s|c|h|d/g,",");
        //console.log("cardStr " + cardStr);
        
        let cards: number[] = cardStr.replace(/\s/g, '').slice(0, -1).split(",").map(Number).filter(Boolean);;
        //console.log("cards: " + cards);
        
        let suitsAsString: string[] = str.match(/s|c|h|d/g);
        let suits:number[] = [];
        //console.log("str: " + str);
        //console.log("suitsAsString: " + suitsAsString);
        
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
        
        //console.log("Suits Initialised: " + suits);
  
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
                        //console.log(c);
                        let maxRank:number = 0, winIndex:number = 10, wci: number[];
                    
                        for (i=0; i < c.length; i++) {
                            let cs: number[] = [cards[c[i][0]], cards[c[i][1]], cards[c[i][2]], cards[c[i][3]], cards[c[i][4]]];
                            let ss: number[] = [suits[c[i][0]], suits[c[i][1]], suits[c[i][2]], 
                            suits[c[i][3]], suits[c[i][4]]];
                            //console.log("cs: " + cs);
                            //console.log("ss: " + ss);
                            index = calcIndex(cs,ss);
                             
                            if (handRanks[index] > maxRank) {
                                maxRank = handRanks[index];
                                winIndex = index; 
                                wci = c[i].slice();
                            } 
                            else if (handRanks[index] == maxRank) {
                                ////
                                //still have to handle this edge case!!..dont understand getPokerScore();
                                ////
                                //If by chance we have a tie, find the best one
                                /*  var score1 = getPokerScore(cs);
                                    var score2 = getPokerScore([cards[wci[0]],cards[wci[1]],cards[wci[2]],cards[wci[3]],cards[wci[4]]]);
                                    if (score1 > score2) { wci= c[i].slice(); }
                                */
                            }
                        } 
                        index = winIndex; 
                    }                    
                }  
            }
            console.log("Hand: " + handRanks[index]);
            console.log("Hand Name: "  + hands[index]);
            return index;
        }
    }
    
    export function getCombinations(k:number ,n: number): number[][]{
        //console.log('called getcombinations' + ' ' + k + ' ' + n); 
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

    export function forSimpleTestHtml() {
        
        var move = gameLogic.createMove(null, null, 0, 0);

        move = gameLogic.createMove(move.stateAfterMove, null, 0, 0);

        move.stateAfterMove.table.playerList[3].state = PlayerState.Call;
        move = gameLogic.createMove(move.stateAfterMove, null, 0, 0);

        move.stateAfterMove.table.playerList[4].state = PlayerState.Raise;
        move = gameLogic.createMove(move.stateAfterMove, null, 30, 0);

        move.stateAfterMove.table.playerList[0].state = PlayerState.Call;
        move = gameLogic.createMove(move.stateAfterMove, null, 0, 0);

        move.stateAfterMove.table.playerList[1].state = PlayerState.Call;
        move = gameLogic.createMove(move.stateAfterMove, null, 0, 0);

        move.stateAfterMove.table.playerList[2].state = PlayerState.Call;
        move = gameLogic.createMove(move.stateAfterMove, null, 0, 0);

        move.stateAfterMove.table.playerList[3].state = PlayerState.Call;
        move = gameLogic.createMove(move.stateAfterMove, null, 0, 0);

        console.log('\n\n');

        move.stateAfterMove.table.playerList[1].state = PlayerState.Check;
        move = gameLogic.createMove(move.stateAfterMove, null, 0, 0);

        move.stateAfterMove.table.playerList[2].state = PlayerState.Raise;
        move = gameLogic.createMove(move.stateAfterMove, null, 30, 0);

        move.stateAfterMove.table.playerList[3].state = PlayerState.Raise;
        move = gameLogic.createMove(move.stateAfterMove, null, 30, 0);

        move.stateAfterMove.table.playerList[4].state = PlayerState.Call;
        move = gameLogic.createMove(move.stateAfterMove, null, 30, 0);

        move.stateAfterMove.table.playerList[0].state = PlayerState.Call;
        move = gameLogic.createMove(move.stateAfterMove, null, 30, 0);

        move.stateAfterMove.table.playerList[1].state = PlayerState.Call;
        move = gameLogic.createMove(move.stateAfterMove, null, 30, 0);

        move.stateAfterMove.table.playerList[2].state = PlayerState.Call;
        move = gameLogic.createMove(move.stateAfterMove, null, 30, 0);
 
        console.log('\n\n');

        move.stateAfterMove.table.playerList[1].state = PlayerState.Raise;
        move = gameLogic.createMove(move.stateAfterMove, null, 200, 0);

        move.stateAfterMove.table.playerList[2].state = PlayerState.Fold;
        move = gameLogic.createMove(move.stateAfterMove, null, 30, 0);

        move.stateAfterMove.table.playerList[3].state = PlayerState.Call;
        move = gameLogic.createMove(move.stateAfterMove, null, 30, 0);

        move.stateAfterMove.table.playerList[4].state = PlayerState.Fold;
        move = gameLogic.createMove(move.stateAfterMove, null, 30, 0);

        move.stateAfterMove.table.playerList[0].state = PlayerState.Fold;
        move = gameLogic.createMove(move.stateAfterMove, null, 30, 0);

        console.log('\n\n');

        move.stateAfterMove.table.playerList[1].state = PlayerState.Check;
        move = gameLogic.createMove(move.stateAfterMove, null, 0, 0);

        move.stateAfterMove.table.playerList[2].state = PlayerState.Check;
        move = gameLogic.createMove(move.stateAfterMove, null, 0, 0);

        move.stateAfterMove.table.playerList[3].state = PlayerState.Check;
        move = gameLogic.createMove(move.stateAfterMove, null, 0, 0);

        move.stateAfterMove.table.playerList[4].state = PlayerState.Check;
        move = gameLogic.createMove(move.stateAfterMove, null, 0, 0);

        //console.log("1st: " + move.stateAfterMove.table.playerList[0].cards[0].cardNumber);
        //console.log("2nd: " + move.stateAfterMove.table.playerList[0].cards[1].cardNumber);
        
        move.stateAfterMove.table.playerList[0].state = PlayerState.Check;
        move = gameLogic.createMove(move.stateAfterMove, null, 0, 0);
       //gameLogic.rankHand("10s Js Qs Ks As Ad 2s");
    }
}