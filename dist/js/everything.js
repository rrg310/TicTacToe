var CardSuite;
(function (CardSuite) {
    CardSuite[CardSuite["c"] = 0] = "c";
    CardSuite[CardSuite["d"] = 1] = "d";
    CardSuite[CardSuite["h"] = 2] = "h";
    CardSuite[CardSuite["s"] = 3] = "s";
})(CardSuite || (CardSuite = {}));
var winningScoreAndCards = (function () {
    function winningScoreAndCards() {
    }
    return winningScoreAndCards;
}());
var Card = (function () {
    function Card(cardNumber, cardType) {
        this.cardNumber = cardNumber;
        this.cardType = cardType;
    }
    return Card;
}());
var PlayerState;
(function (PlayerState) {
    PlayerState[PlayerState["Check"] = 0] = "Check";
    PlayerState[PlayerState["Call"] = 1] = "Call";
    PlayerState[PlayerState["Raise"] = 2] = "Raise";
    PlayerState[PlayerState["Fold"] = 3] = "Fold";
    PlayerState[PlayerState["Init"] = 4] = "Init";
    PlayerState[PlayerState["AllIn"] = 5] = "AllIn";
    PlayerState[PlayerState["Small"] = 6] = "Small";
    PlayerState[PlayerState["Big"] = 7] = "Big";
})(PlayerState || (PlayerState = {}));
var Player = (function () {
    function Player(id, name) {
        this.currentBet = 0;
        this.id = id;
        this.name = name;
        this.state = PlayerState.Init;
        this.cards = [];
        this.chipsInPocket = 300;
        this.currentBet = 0;
        //this.presentInCurrentPot = true;
    }
    Player.prototype.resetCurrentBet = function () {
        this.currentBet = 0;
    };
    Player.prototype.convertPlayerCardArrayToString = function () {
        var cardString = "";
        for (var i = 0; i < this.cards.length; i++) {
            cardString = cardString + this.cards[i].cardNumber + CardSuite[this.cards[i].cardType] + " ";
        }
        console.log("Hand Cards: " + cardString);
        return (cardString);
    };
    return Player;
}());
var Pot = (function () {
    function Pot() {
        this.currentPotBetAmount = 0;
        this.totalAmount = 0;
        this.hands = ["4 of a Kind", "Straight Flush", "Straight", "Flush", "High Card", "1 Pair", "2 Pair", "Royal Flush", "3 of a Kind", "Full House", "-Invalid-"];
        this.handRanks = [8, 9, 5, 6, 1, 2, 3, 10, 4, 7, 0];
        this.playersInvolved = [];
        this.playersContributions = [];
    }
    Pot.prototype.addAmountToPot = function (amountToBeAdded) {
        this.totalAmount = this.totalAmount + amountToBeAdded;
    };
    Pot.prototype.subtractAmountFromThePot = function (amountToBeSubtracted) {
        this.totalAmount = this.totalAmount - amountToBeSubtracted;
    };
    Pot.prototype.addPlayerToThePot = function (playerToBeAdded) {
        this.playersInvolved.push(playerToBeAdded);
        this.playersContributions.push(0);
    };
    Pot.prototype.addAllPlayersToThePot = function (playersToBeAdded) {
        for (var i = 0; i < playersToBeAdded.length; i++) {
            this.playersInvolved.push(playersToBeAdded[i]);
            this.playersContributions.push(0);
        }
    };
    Pot.prototype.addContribution = function (currentPlayer, amountContributed) {
        for (var i = 0; i < this.playersInvolved.length; i++) {
            if (this.playersInvolved[i] == currentPlayer) {
                this.playersContributions[i] += amountContributed;
            }
        }
    };
    Pot.prototype.subtractContribution = function (currentPlayer, amountContributed) {
        for (var i = 0; i < this.playersInvolved.length; i++) {
            if (this.playersInvolved[i] == currentPlayer) {
                this.playersContributions[i] -= amountContributed;
            }
        }
    };
    Pot.prototype.checkContribution = function (currentPlayer) {
        for (var i = 0; i < this.playersInvolved.length; i++) {
            if (this.playersInvolved[i] == currentPlayer) {
                return this.playersContributions[i];
            }
        }
    };
    Pot.prototype.removeIfPlayerPresent = function (playerToBeRemoved) {
        for (var i = 0; i < this.playersInvolved.length; i++) {
            if (this.playersInvolved[i] == playerToBeRemoved) {
                this.playersInvolved.splice(i, 1);
                this.playersContributions.splice(i, 1);
            }
        }
    };
    Pot.prototype.getWinners = function (tableAfterMove) {
        var tableCardsString = tableAfterMove.convertTableCardArrayToString();
        var bestRank = -1;
        var winningList = [];
        var winningListCards;
        var winningScoreAndCardsObject;
        for (var i = 0; i < this.playersInvolved.length; i++) {
            console.log('\n');
            console.log("Player " + i + ": ");
            winningScoreAndCardsObject = gameLogic.rankHand(this.playersInvolved[i].convertPlayerCardArrayToString() + tableCardsString);
            var currentHandRank = this.handRanks[winningScoreAndCardsObject.index];
            if (currentHandRank > bestRank) {
                bestRank = currentHandRank;
                winningList = [];
                winningList.push(this.playersInvolved[i]);
                winningListCards = [];
                winningListCards.push(winningScoreAndCardsObject.wci);
            }
            else if (currentHandRank == bestRank) {
                winningList.push(this.playersInvolved[i]);
                winningListCards.push(winningScoreAndCardsObject.wci);
            }
        }
        console.log('\n\n\n');
        console.log("No. Of Winners: " + winningList.length);
        console.log("Winners: ");
        console.log(winningList);
        console.log('\n\n\n');
        if (winningList.length > 1) {
            winningList = gameLogic.resolveEqualHandsConflict(tableAfterMove.openedCards, winningList, winningListCards, this.hands[this.handRanks.indexOf(bestRank)]);
        }
        return winningList;
    };
    return Pot;
}());
var TableSetup = (function () {
    function TableSetup(noOfPlayers) {
        this.playerList = [];
        this.deck = [];
        this.openedCards = [];
        this.closedCards = [];
        this.dealerIndex = noOfPlayers - 1;
        this.currentPlayerIndex = 0;
        this.roundStartIndex = 0;
        this.potArray = [];
        var tempPot = new Pot();
        this.potArray.push(tempPot);
        this.smallBlind = 10;
        this.bigBlind = 20;
        this.currentCallAmount = 0;
        this.playerIndicesRemovedInThisHand = [];
    }
    TableSetup.prototype.addPlayerToTheTable = function (player) {
        this.playerList.push(player);
    };
    TableSetup.prototype.incrementCurrentPlayerIndex = function () {
        console.log("Problem7");
        while (true) {
            this.currentPlayerIndex++;
            this.currentPlayerIndex %= this.playerList.length;
            console.log("Problem8");
            if ((this.currentPlayerIndex == this.roundStartIndex) && (this.playerList[this.currentPlayerIndex].state != PlayerState.Init)) {
                //console.log('\n' + "Skipping player: " + this.playerList[this.currentPlayerIndex].name + '\n');
                console.log("Problem9");
                gameLogic.adjustPots(this);
                gameLogic.roundOver(this);
                return;
            }
            else if ((this.playerList[this.currentPlayerIndex].state != PlayerState.Fold) && (this.playerList[this.currentPlayerIndex].state != PlayerState.AllIn)) {
                return;
            }
            else {
                console.log('\n' + "Skipping player: " + this.playerList[this.currentPlayerIndex].name + '\n');
            }
        }
    };
    TableSetup.prototype.incrementRoundStartIndex = function () {
        this.roundStartIndex++;
        this.roundStartIndex %= this.playerList.length;
    };
    TableSetup.prototype.incrementCurrentAndRoundStartIndices = function () {
        this.currentPlayerIndex++;
        this.currentPlayerIndex %= this.playerList.length;
        this.roundStartIndex++;
        this.roundStartIndex %= this.playerList.length;
    };
    TableSetup.prototype.getCurrentPotIndex = function () {
        return (this.potArray.length - 1);
    };
    TableSetup.prototype.addNewPot = function (newPotInitialAmount, playerList) {
        var newPot = new Pot();
        newPot.addAmountToPot(newPotInitialAmount);
        newPot.addAllPlayersToThePot(playerList);
        this.potArray.push(newPot);
    };
    TableSetup.prototype.getCumulativePotAmount = function () {
        var cumulativePotAmount = 0;
        for (var i = 0; i < this.potArray.length; i++) {
            cumulativePotAmount += this.potArray[i].totalAmount;
        }
        return cumulativePotAmount;
    };
    TableSetup.prototype.verifyAndAdjustPots = function () {
        var potToBeVerified = this.potArray[this.potArray.length - 1];
        for (var i = 0; i < potToBeVerified.playersInvolved.length; i++) {
        }
    };
    TableSetup.prototype.awardWinners = function () {
        for (var i = 0; i < this.potArray.length; i++) {
            // console.log("Pot Number: " + i);
            var winningPlayers = this.potArray[i].getWinners(this);
            // console.log('\n'+"Final Winning Players:");
            // console.log(winningPlayers); 
            // console.log('\n');
            var noOfWinners = winningPlayers.length;
            var potAmountPerPerson = (this.potArray[i].totalAmount / noOfWinners);
            for (var j = 0; j < winningPlayers.length; j++) {
                winningPlayers[j].chipsInPocket += potAmountPerPerson;
            }
            //
            return angular.copy(winningPlayers);
        }
    };
    TableSetup.prototype.resetRound = function () {
        for (var i = 0; i < this.playerList.length; i++) {
            this.playerList[i].currentBet = 0;
            if (this.playerList[i].state !== PlayerState.Fold && this.playerList[i].state !== PlayerState.AllIn) {
                this.playerList[i].state = PlayerState.Init;
            }
        }
        this.currentPlayerIndex = (this.dealerIndex + 1) % this.playerList.length;
        while (true) {
            this.roundStartIndex = this.currentPlayerIndex;
            this.currentCallAmount = 0;
            if ((this.currentPlayerIndex == this.dealerIndex) && (this.playerList[this.currentPlayerIndex].state == PlayerState.Fold || this.playerList[this.currentPlayerIndex].state == PlayerState.Fold)) {
                //console.log('\n' + "Skipping player: " + this.playerList[this.currentPlayerIndex].name + '\n');
                gameLogic.adjustPots(this);
                gameLogic.roundOver(this);
                return;
            }
            else if ((this.playerList[this.currentPlayerIndex].state != PlayerState.Fold) && (this.playerList[this.currentPlayerIndex].state != PlayerState.AllIn)) {
                break;
            }
            else {
                console.log('\n' + "Skipping player: " + this.playerList[this.currentPlayerIndex].name + '\n');
                this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.playerList.length;
            }
        }
    };
    TableSetup.prototype.resetHand = function () {
        var indexRevisionCount = 0;
        for (var i = 0; i < this.playerIndicesRemovedInThisHand.length; i++) {
            if (this.playerIndicesRemovedInThisHand[i] <= this.dealerIndex) {
                indexRevisionCount++;
            }
        }
        var newTempIndex = this.dealerIndex - indexRevisionCount;
        if (newTempIndex < 0) {
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
        var tempPot = new Pot();
        tempPot.addAllPlayersToThePot(this.playerList);
        this.potArray.push(tempPot);
        this.openedCards = [];
        this.closedCards = [];
        this.winners = [];
        for (var i = 0; i < this.playerList.length; i++) {
            this.playerList[i].currentBet = 0;
            this.playerList[i].cards = [];
            this.playerList[i].state = PlayerState.Init;
        }
        this.deck = initializeTableDeck();
        distributeCards(this);
    };
    TableSetup.prototype.removePlayersWithInsufficientChips = function () {
        for (var i = 0; i < this.playerList.length; i++) {
            if (this.playerList[i].chipsInPocket < this.bigBlind) {
                this.playerIndicesRemovedInThisHand.push(i);
            }
        }
        for (var i = 0; i < this.playerList.length; i++) {
            if (this.playerList[i].chipsInPocket < this.bigBlind) {
                this.playerList.splice(i, 1);
                i--;
            }
        }
    };
    TableSetup.prototype.getActivePlayersCount = function () {
        var count = 0;
        for (var i = 0; i < this.playerList.length; i++) {
            count++;
        }
        return count;
    };
    TableSetup.prototype.convertTableCardArrayToString = function () {
        var cardString = "";
        for (var i = 0; i < this.openedCards.length; i++) {
            cardString = cardString + this.openedCards[i].cardNumber + CardSuite[this.openedCards[i].cardType] + " ";
        }
        console.log('\n' + "Table Cards: " + cardString.substring(0, cardString.length - 1));
        return (cardString.substring(0, cardString.length - 1));
    };
    return TableSetup;
}());
function initializeTableDeck() {
    var cardDeck = [];
    var suiteNumber = 1;
    //Create the Deck.
    for (var i = 0; i < 52; i++) {
        var num = ((i + 1) % 13 == 0) ? 13 : (i + 1) % 13;
        var numString = "";
        var suite = CardSuite.d;
        if (suiteNumber == 1) {
            suite = CardSuite.c;
        }
        else if (suiteNumber == 2) {
            suite = CardSuite.d;
        }
        else if (suiteNumber == 3) {
            suite = CardSuite.h;
        }
        else {
            suite = CardSuite.s;
        }
        switch (num) {
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
        if (num == 13) {
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
function distributeCards(table) {
    for (var i = 0; i < 2; i++) {
        for (var j = 0; j < table.playerList.length; j++) {
            table.playerList[j].cards.push(table.deck.pop());
        }
    }
    burnCard(table.deck);
    for (var i = 0; i < 3; i++) {
        table.closedCards.push(table.deck.pop());
    }
    burnCard(table.deck);
    table.closedCards.push(table.deck.pop());
    burnCard(table.deck);
    table.closedCards.push(table.deck.pop());
}
function burnCard(cardDeck) {
    cardDeck.pop();
}
function printCardDeck(cardDeck) {
    for (var i = 0; i < cardDeck.length; i++) {
        console.log(cardDeck[i].cardNumber + " of " + CardSuite[cardDeck[i].cardType]);
    }
}
function isGameOver(table) {
    if ((table.playerList.length == 0) || (table.playerList.length == 1)) {
        return true;
    }
    else {
        return false;
    }
}
var gameLogic;
(function (gameLogic) {
    var hands = ["4 of a Kind", "Straight Flush", "Straight", "Flush", "High Card", "1 Pair", "2 Pair", "Royal Flush", "3 of a Kind", "Full House", "-Invalid-"];
    var handRanks = [8, 9, 5, 6, 1, 2, 3, 10, 4, 7, 0];
    var noOfPlayers = 5;
    function getInitialTable() {
        var table = new TableSetup(noOfPlayers);
        table.addPlayerToTheTable(new Player("adit91", "Adit"));
        table.addPlayerToTheTable(new Player("ridhi91", "Ridhi"));
        table.addPlayerToTheTable(new Player("anto90", "Anto"));
        table.addPlayerToTheTable(new Player("gaurav89", "Gaurav"));
        table.addPlayerToTheTable(new Player("rachita88", "Rachita"));
        table.potArray[table.getCurrentPotIndex()].addAllPlayersToThePot(table.playerList);
        table.deck = initializeTableDeck();
        distributeCards(table);
        console.log(table);
        return table;
    }
    gameLogic.getInitialTable = getInitialTable;
    function getInitialState() {
        return { table: getInitialTable(), delta: null };
    }
    gameLogic.getInitialState = getInitialState;
    function createMove(stateBeforeMove, currentPlayer, amountAdded, turnIndexBeforeMove) {
        console.log("Inside");
        if (!stateBeforeMove) {
            stateBeforeMove = getInitialState();
        }
        var lastCardOfTheRound = false;
        var handOver = false;
        var table = stateBeforeMove.table;
        if (isGameOver(table)) {
            throw new Error("Can only make a move if the game is not over! Number of required payers for the game not satisfied");
        }
        var tableAfterMove = angular.copy(table);
        currentPlayer = tableAfterMove.playerList[tableAfterMove.currentPlayerIndex];
        var tempCurrentPlayer = currentPlayer;
        if (tableAfterMove.openedCards.length == 0) {
            if ((tableAfterMove.currentPlayerIndex == ((tableAfterMove.dealerIndex + 1) % tableAfterMove.playerList.length)) && (currentPlayer.state == PlayerState.Init)) {
                tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].addAmountToPot(tableAfterMove.smallBlind);
                currentPlayer.chipsInPocket -= tableAfterMove.smallBlind;
                currentPlayer.currentBet = tableAfterMove.smallBlind;
                tableAfterMove.currentCallAmount = tableAfterMove.smallBlind;
                tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].addContribution(currentPlayer, tableAfterMove.smallBlind);
                tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].currentPotBetAmount = tableAfterMove.smallBlind;
            }
            else if ((tableAfterMove.currentPlayerIndex == ((tableAfterMove.dealerIndex + 2) % tableAfterMove.playerList.length)) && (currentPlayer.state == PlayerState.Init)) {
                tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].addAmountToPot(tableAfterMove.bigBlind);
                currentPlayer.chipsInPocket -= tableAfterMove.bigBlind;
                currentPlayer.currentBet = tableAfterMove.bigBlind;
                tableAfterMove.currentCallAmount = tableAfterMove.bigBlind;
                tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].addContribution(currentPlayer, tableAfterMove.bigBlind);
                tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].currentPotBetAmount = tableAfterMove.bigBlind;
            }
        }
        switch (currentPlayer.state) {
            case PlayerState.Fold:
                {
                    var foldCount = 0;
                    var notFoldedPlayer = void 0;
                    for (var i = 0; i < tableAfterMove.playerList.length; i++) {
                        if (tableAfterMove.playerList[i].state == PlayerState.Fold) {
                            foldCount++;
                        }
                        else {
                            notFoldedPlayer = tableAfterMove.playerList[i];
                        }
                    }
                    if (foldCount == tableAfterMove.playerList.length - 1) {
                        console.log("Turn Start: ");
                        console.log("Player: " + tableAfterMove.currentPlayerIndex);
                        console.log("Action: " + PlayerState[currentPlayer.state]);
                        console.log("Pot After the Turn: ");
                        console.log(tableAfterMove.potArray);
                        console.log(tableAfterMove.playerList);
                        console.log('\n');
                        var cumulativePotAmount = tableAfterMove.getCumulativePotAmount();
                        notFoldedPlayer.chipsInPocket += cumulativePotAmount;
                        tableAfterMove.removePlayersWithInsufficientChips();
                        tableAfterMove.resetHand();
                        handOver = true;
                        lastCardOfTheRound = true;
                        if (tableAfterMove.playerList.length == 0 || tableAfterMove.playerList.length == 1) {
                            console.log("Game Over! Bye Bye! " + tableAfterMove.playerList.length + " Players left!");
                        }
                        var turnIndexAfterMove_1 = tableAfterMove.currentPlayerIndex;
                        var delta_1 = { currentPlayer: currentPlayer, amountAdded: amountAdded };
                        var stateAfterMove_1 = { delta: delta_1, table: tableAfterMove };
                        var endMatchScores_1;
                        endMatchScores_1 = null;
                        return { endMatchScores: endMatchScores_1, turnIndexAfterMove: turnIndexAfterMove_1, stateAfterMove: stateAfterMove_1 };
                    }
                    else {
                        for (var i = 0; i < tableAfterMove.potArray.length; i++) {
                            tableAfterMove.potArray[i].removeIfPlayerPresent(currentPlayer);
                        }
                    }
                    break;
                }
            case PlayerState.AllIn:
                {
                    if (currentPlayer.chipsInPocket == 0) {
                        console.log("Turn Start: ");
                        console.log("Player: " + tableAfterMove.currentPlayerIndex);
                        console.log("Action: " + PlayerState[currentPlayer.state]);
                        console.log("Pot After the Turn: ");
                        console.log(tableAfterMove.potArray);
                        console.log(tableAfterMove.playerList);
                        console.log('\n');
                        var turnIndexAfterMove_2 = tableAfterMove.currentPlayerIndex;
                        var delta_2 = { currentPlayer: currentPlayer, amountAdded: amountAdded };
                        var stateAfterMove_2 = { delta: delta_2, table: tableAfterMove };
                        var endMatchScores_2;
                        endMatchScores_2 = null;
                        return { endMatchScores: endMatchScores_2, turnIndexAfterMove: turnIndexAfterMove_2, stateAfterMove: stateAfterMove_2 };
                    }
                    var totalBetAmountByCurrentPlayer = currentPlayer.currentBet + currentPlayer.chipsInPocket;
                    if (totalBetAmountByCurrentPlayer >= tableAfterMove.currentCallAmount) {
                        console.log("No New Pot Created:");
                        var balance = currentPlayer.chipsInPocket;
                        for (var i = 0; i < tableAfterMove.potArray.length; i++) {
                            var contribution = tableAfterMove.potArray[i].checkContribution(currentPlayer);
                            if (contribution < tableAfterMove.potArray[i].currentPotBetAmount) {
                                var difference = tableAfterMove.potArray[i].currentPotBetAmount - contribution;
                                balance -= difference;
                                tableAfterMove.potArray[i].addAmountToPot(difference);
                                tableAfterMove.potArray[i].addContribution(currentPlayer, difference);
                            }
                        }
                        tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].addAmountToPot(balance);
                        tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].addContribution(currentPlayer, balance);
                        currentPlayer.chipsInPocket = 0;
                        currentPlayer.currentBet = totalBetAmountByCurrentPlayer;
                        if (totalBetAmountByCurrentPlayer > tableAfterMove.currentCallAmount) {
                            tableAfterMove.roundStartIndex = tableAfterMove.currentPlayerIndex;
                        }
                        tableAfterMove.currentCallAmount = totalBetAmountByCurrentPlayer;
                        tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].currentPotBetAmount += balance;
                    }
                    else if (totalBetAmountByCurrentPlayer < tableAfterMove.currentCallAmount) {
                        console.log("New Pot Created:");
                        var cumulativeBetTillCurrentPot = 0;
                        var indexOfPotToBeSplit = 0;
                        var flag = void 0;
                        for (var i = 0; i < tableAfterMove.potArray.length; i++) {
                            cumulativeBetTillCurrentPot += tableAfterMove.potArray[i].currentPotBetAmount;
                            if (totalBetAmountByCurrentPlayer == cumulativeBetTillCurrentPot) {
                                tableAfterMove.potArray[i].addAmountToPot(currentPlayer.chipsInPocket);
                                tableAfterMove.potArray[i].addContribution(currentPlayer, currentPlayer.chipsInPocket);
                                currentPlayer.chipsInPocket = 0;
                                currentPlayer.currentBet = totalBetAmountByCurrentPlayer;
                                for (var j = (i + 1); j < tableAfterMove.potArray.length; j++) {
                                    tableAfterMove.potArray[j].removeIfPlayerPresent(currentPlayer);
                                }
                                flag = 1;
                                break;
                            }
                            else if (totalBetAmountByCurrentPlayer < cumulativeBetTillCurrentPot) {
                                flag = 2;
                                indexOfPotToBeSplit = i;
                                break;
                            }
                        }
                        if (flag == 1) {
                            break;
                        }
                        //console.log("indexOfPotToBeSplit: " + indexOfPotToBeSplit);
                        var balance = currentPlayer.chipsInPocket;
                        for (var i = 0; i < indexOfPotToBeSplit; i++) {
                            var contribution = tableAfterMove.potArray[i].checkContribution(currentPlayer);
                            if (contribution < tableAfterMove.potArray[i].currentPotBetAmount) {
                                var difference_1 = tableAfterMove.potArray[i].currentPotBetAmount - contribution;
                                balance -= difference_1;
                                tableAfterMove.potArray[i].addAmountToPot(difference_1);
                                tableAfterMove.potArray[i].addContribution(currentPlayer, difference_1);
                            }
                        }
                        var newPotObject = new Pot();
                        var playerListExcludingCurrentPlayer = [];
                        for (var i = 0; i < tableAfterMove.potArray[indexOfPotToBeSplit].playersInvolved.length; i++) {
                            if (tableAfterMove.potArray[indexOfPotToBeSplit].playersInvolved[i] != currentPlayer) {
                                playerListExcludingCurrentPlayer.push(tableAfterMove.potArray[indexOfPotToBeSplit].playersInvolved[i]);
                            }
                        }
                        newPotObject.addAllPlayersToThePot(playerListExcludingCurrentPlayer);
                        newPotObject.currentPotBetAmount = tableAfterMove.potArray[indexOfPotToBeSplit].currentPotBetAmount - balance;
                        var playersInThePotToBeSplit = tableAfterMove.potArray[indexOfPotToBeSplit].playersInvolved;
                        var playersContributionsInThePotToBeSplit = tableAfterMove.potArray[indexOfPotToBeSplit].playersContributions;
                        var difference = 0;
                        var newPotInitialAmount = 0;
                        var playersBeingShifted = [];
                        var playersContributionsBeingShifted = [];
                        for (var i = 0; i < playersInThePotToBeSplit.length; i++) {
                            if (playersContributionsInThePotToBeSplit[i] > balance) {
                                difference = playersContributionsInThePotToBeSplit[i] - balance;
                                tableAfterMove.potArray[indexOfPotToBeSplit].subtractContribution(playersInThePotToBeSplit[i], difference);
                                newPotInitialAmount += difference;
                                playersBeingShifted.push(playersInThePotToBeSplit[i]);
                                playersContributionsBeingShifted.push(difference);
                            }
                        }
                        tableAfterMove.potArray[indexOfPotToBeSplit].addAmountToPot(balance);
                        tableAfterMove.potArray[indexOfPotToBeSplit].addContribution(currentPlayer, balance);
                        tableAfterMove.potArray[indexOfPotToBeSplit].currentPotBetAmount = balance;
                        tableAfterMove.potArray[indexOfPotToBeSplit].subtractAmountFromThePot(newPotInitialAmount);
                        newPotObject.addAmountToPot(newPotInitialAmount);
                        for (var i = 0; i < playersBeingShifted.length; i++) {
                            newPotObject.addContribution(playersBeingShifted[i], playersContributionsBeingShifted[i]);
                        }
                        tableAfterMove.potArray.splice(indexOfPotToBeSplit + 1, 0, newPotObject);
                        currentPlayer.chipsInPocket = 0;
                        currentPlayer.currentBet = totalBetAmountByCurrentPlayer;
                    }
                    break;
                }
            case PlayerState.Check:
                {
                    if (tableAfterMove.currentCallAmount > currentPlayer.currentBet) {
                        throw new Error("Can't check. The player has not matched the current table bet amount");
                    }
                    break;
                }
            case PlayerState.Call:
                {
                    var chipsNeededToMatchTheBet = tableAfterMove.currentCallAmount - currentPlayer.currentBet;
                    if (chipsNeededToMatchTheBet == 0) {
                        throw new Error("The player has already matched the current table bet amount");
                    }
                    if (chipsNeededToMatchTheBet > currentPlayer.chipsInPocket) {
                        throw new Error("The player doesn't have enough chips to match the current table bet amount. He can go All In");
                    }
                    for (var i = 0; i < tableAfterMove.potArray.length; i++) {
                        var contribution = tableAfterMove.potArray[i].checkContribution(currentPlayer);
                        if (contribution < tableAfterMove.potArray[i].currentPotBetAmount) {
                            var difference = tableAfterMove.potArray[i].currentPotBetAmount - contribution;
                            tableAfterMove.potArray[i].addAmountToPot(difference);
                            tableAfterMove.potArray[i].addContribution(currentPlayer, difference);
                        }
                    }
                    currentPlayer.chipsInPocket -= chipsNeededToMatchTheBet;
                    currentPlayer.currentBet = tableAfterMove.currentCallAmount;
                    if (currentPlayer.chipsInPocket == 0) {
                        currentPlayer.state = PlayerState.AllIn;
                    }
                    break;
                }
            case PlayerState.Raise:
                {
                    var chipsNeededToMatchTheBet = tableAfterMove.currentCallAmount - currentPlayer.currentBet;
                    var raiseAmount = amountAdded;
                    var totalAmountBeingAdded = chipsNeededToMatchTheBet + raiseAmount;
                    if (totalAmountBeingAdded > currentPlayer.chipsInPocket) {
                        throw new Error("The player doesn't have enough chips to raise the bet. Choose a smaller amount.");
                    }
                    console.log("Add Karo: " + totalAmountBeingAdded);
                    //tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].addAmountToPot(totalAmountBeingAdded);
                    var balance = totalAmountBeingAdded;
                    for (var i = 0; i < tableAfterMove.potArray.length; i++) {
                        var contribution = tableAfterMove.potArray[i].checkContribution(currentPlayer);
                        if (contribution < tableAfterMove.potArray[i].currentPotBetAmount) {
                            var difference = tableAfterMove.potArray[i].currentPotBetAmount - contribution;
                            balance -= difference;
                            tableAfterMove.potArray[i].addAmountToPot(difference);
                            tableAfterMove.potArray[i].addContribution(currentPlayer, difference);
                        }
                    }
                    tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].addAmountToPot(balance);
                    tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].addContribution(currentPlayer, balance);
                    currentPlayer.chipsInPocket -= totalAmountBeingAdded;
                    currentPlayer.currentBet = currentPlayer.currentBet + totalAmountBeingAdded;
                    tableAfterMove.currentCallAmount = currentPlayer.currentBet;
                    tableAfterMove.roundStartIndex = tableAfterMove.currentPlayerIndex;
                    tableAfterMove.potArray[tableAfterMove.getCurrentPotIndex()].currentPotBetAmount += balance;
                    if (currentPlayer.chipsInPocket == 0) {
                        currentPlayer.state = PlayerState.AllIn;
                    }
                    break;
                }
        }
        console.log("Before :- RSI: " + tableAfterMove.roundStartIndex + " ; CPI: " + tableAfterMove.currentPlayerIndex);
        console.log("Turn Start: ");
        console.log("Player: " + tableAfterMove.currentPlayerIndex);
        console.log("Action: " + PlayerState[currentPlayer.state]);
        console.log("Pot After the Turn: ");
        console.log(tableAfterMove.potArray);
        console.log(tableAfterMove.playerList);
        console.log('\n');
        console.log("After :- RSI: " + tableAfterMove.roundStartIndex + " ; CPI: " + tableAfterMove.currentPlayerIndex);
        var gameOverOrNot = isGameOver(tableAfterMove);
        var turnIndexAfterMove;
        console.log("Problem1");
        if ((((tableAfterMove.currentPlayerIndex + 1) % tableAfterMove.playerList.length) == tableAfterMove.roundStartIndex) && (currentPlayer.state != PlayerState.Init)) {
            console.log("Problem2");
            adjustPots(tableAfterMove);
            roundOver(tableAfterMove);
            lastCardOfTheRound = true;
            if (tableAfterMove.openedCards.length == 5) {
                handOver = true;
            }
        }
        if (gameOverOrNot) {
            turnIndexAfterMove = -1;
        }
        else {
            console.log("Problem3");
            if ((tableAfterMove.openedCards.length == 0) && (handOver == false) && (currentPlayer.state == PlayerState.Init)
                && ((tableAfterMove.currentPlayerIndex == ((tableAfterMove.dealerIndex + 1) % tableAfterMove.playerList.length))
                    || (tableAfterMove.currentPlayerIndex == ((tableAfterMove.dealerIndex + 2) % tableAfterMove.playerList.length)))) {
                tableAfterMove.incrementCurrentAndRoundStartIndices();
                console.log("Problem4");
            }
            else {
                if (lastCardOfTheRound == false) {
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
        var delta = { currentPlayer: currentPlayer, amountAdded: amountAdded };
        var stateAfterMove = { delta: delta, table: tableAfterMove };
        var endMatchScores;
        endMatchScores = null;
        return { endMatchScores: endMatchScores, turnIndexAfterMove: turnIndexAfterMove, stateAfterMove: stateAfterMove };
    }
    gameLogic.createMove = createMove;
    function roundOver(tableAfterMove) {
        switch (tableAfterMove.openedCards.length) {
            case 0:
                {
                    for (var i = 0; i < 3; i++) {
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
                if (tableAfterMove.playerList.length == 0 || tableAfterMove.playerList.length == 1) {
                    console.log("Game Over! Bye Bye! " + tableAfterMove.playerList.length + " Players left!");
                }
            }
        }
    }
    gameLogic.roundOver = roundOver;
    function adjustPots(tableAfterMove) {
        for (var i = (tableAfterMove.potArray.length - 1); i < tableAfterMove.potArray.length; i++) {
            var currentPot = tableAfterMove.potArray[i];
            var minContribution = currentPot.playersContributions[0];
            var minContributors = [];
            minContributors.push(currentPot.playersInvolved[0]);
            for (var j = 0; j < currentPot.playersInvolved.length; j++) {
                if (currentPot.playersInvolved[j].state == PlayerState.AllIn && currentPot.playersContributions[j] < currentPot.currentPotBetAmount) {
                    if (currentPot.playersContributions[j] < minContribution) {
                        minContribution = currentPot.playersContributions[j];
                        minContributors = [];
                        minContributors.push(currentPot.playersInvolved[j]);
                    }
                    else if (currentPot.playersContributions[j] == minContribution) {
                        minContributors.push(currentPot.playersInvolved[j]);
                    }
                }
            }
            if (minContribution < currentPot.currentPotBetAmount) {
                var newPotObject = new Pot();
                var playerListExcludingMinContributors = [];
                for (var j = 0; j < currentPot.playersInvolved.length; j++) {
                    var isMinimumContributor = false;
                    for (var k = 0; k < minContributors.length; k++) {
                        if (currentPot.playersInvolved[j] == minContributors[k]) {
                            isMinimumContributor = true;
                            break;
                        }
                    }
                    if (isMinimumContributor == false) {
                        playerListExcludingMinContributors.push(currentPot.playersInvolved[j]);
                    }
                }
                var balance = minContribution;
                newPotObject.addAllPlayersToThePot(playerListExcludingMinContributors);
                newPotObject.currentPotBetAmount = currentPot.currentPotBetAmount - balance;
                var playersInThePotToBeSplit = currentPot.playersInvolved;
                var playersContributionsInThePotToBeSplit = currentPot.playersContributions;
                var difference = 0;
                var newPotInitialAmount = 0;
                var playersBeingShifted = [];
                var playersContributionsBeingShifted = [];
                for (var j = 0; j < playersInThePotToBeSplit.length; j++) {
                    if (playersContributionsInThePotToBeSplit[j] > balance) {
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
                for (var j = 0; j < playersBeingShifted.length; j++) {
                    newPotObject.addContribution(playersBeingShifted[j], playersContributionsBeingShifted[j]);
                }
                tableAfterMove.potArray.push(newPotObject);
            }
        }
    }
    gameLogic.adjustPots = adjustPots;
    function checkMoveOk(stateTransition) {
        // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need to verify that the move is OK.
        var turnIndexBeforeMove = stateTransition.turnIndexBeforeMove;
        var stateBeforeMove = stateTransition.stateBeforeMove;
        var move = stateTransition.move;
        var deltaValue = stateTransition.move.stateAfterMove.delta;
        var currentPlayer = deltaValue.currentPlayer;
        var amountAdded = deltaValue.amountAdded;
        var expectedMove = createMove(stateBeforeMove, currentPlayer, amountAdded, turnIndexBeforeMove);
        if (!angular.equals(move, expectedMove)) {
            throw new Error("Expected move=" + angular.toJson(expectedMove, true) + ", but got stateTransition=" + angular.toJson(stateTransition, true));
        }
    }
    gameLogic.checkMoveOk = checkMoveOk;
    function canSmallBlindOrNot(tableAfterMove) {
        if (tableAfterMove.getCumulativePotAmount() == 0) {
            return true;
        }
        else {
            return false;
        }
    }
    gameLogic.canSmallBlindOrNot = canSmallBlindOrNot;
    function canBigBlindOrNot(tableAfterMove) {
        if (tableAfterMove.getCumulativePotAmount() == tableAfterMove.smallBlind) {
            return true;
        }
        else {
            return false;
        }
    }
    gameLogic.canBigBlindOrNot = canBigBlindOrNot;
    function canFoldOrNot(tableAfterMove) {
        if (canSmallBlindOrNot(tableAfterMove) || canBigBlindOrNot(tableAfterMove)) {
            return false;
        }
        else {
            return true;
        }
    }
    gameLogic.canFoldOrNot = canFoldOrNot;
    function canCheckOrNot(tableAfterMove, currentPlayer) {
        if (currentPlayer == null) {
            return false;
        }
        if (canSmallBlindOrNot(tableAfterMove) || canBigBlindOrNot(tableAfterMove)) {
            return false;
        }
        else if (tableAfterMove.currentCallAmount > currentPlayer.currentBet) {
            return false;
        }
        else {
            return true;
        }
    }
    gameLogic.canCheckOrNot = canCheckOrNot;
    function canCallOrNot(tableAfterMove, currentPlayer) {
        if (currentPlayer == null) {
            return false;
        }
        var chipsNeededToMatchTheBet = tableAfterMove.currentCallAmount - currentPlayer.currentBet;
        if (canSmallBlindOrNot(tableAfterMove) || canBigBlindOrNot(tableAfterMove)) {
            return false;
        }
        else if (chipsNeededToMatchTheBet == 0) {
            return false;
        }
        else if (chipsNeededToMatchTheBet > currentPlayer.chipsInPocket) {
            return false;
        }
        else {
            return true;
        }
    }
    gameLogic.canCallOrNot = canCallOrNot;
    function canRaiseOrNot(tableAfterMove, currentPlayer, amountAdded) {
        if (currentPlayer == null) {
            return false;
        }
        var chipsNeededToMatchTheBet = tableAfterMove.currentCallAmount - currentPlayer.currentBet;
        var raiseAmount = amountAdded;
        var totalAmountBeingAdded = chipsNeededToMatchTheBet + raiseAmount;
        if (canSmallBlindOrNot(tableAfterMove) || canBigBlindOrNot(tableAfterMove)) {
            return false;
        }
        else if (totalAmountBeingAdded > currentPlayer.chipsInPocket) {
            return false;
        }
        else {
            return true;
        }
    }
    gameLogic.canRaiseOrNot = canRaiseOrNot;
    function canAllInOrNot(tableAfterMove, currentPlayer) {
        if (currentPlayer == null) {
            return false;
        }
        if (canSmallBlindOrNot(tableAfterMove) || canBigBlindOrNot(tableAfterMove)) {
            return false;
        }
        else {
            return true;
        }
    }
    gameLogic.canAllInOrNot = canAllInOrNot;
    function rankHand(str) {
        //takes a string of per person hands and returns the rank as a number
        var index = 10; //index into handRanks
        var winCardIndexes, i;
        var wci = [];
        var cardStr = str.replace(/A/g, "14").replace(/K/g, "13").replace(/Q/g, "12").replace(/J/g, "11").replace(/s|c|h|d/g, ",");
        var cards = cardStr.replace(/\s/g, '').slice(0, -1).split(",").map(Number).filter(Boolean);
        ;
        var suitsAsString = str.match(/s|c|h|d/g);
        var suits = [];
        for (i = 0; i < suitsAsString.length; i++) {
            if (suitsAsString[i] === "s") {
                suits[i] = 1;
            }
            else if (suitsAsString[i] === "c") {
                suits[i] = 8;
            }
            else if (suitsAsString[i] === "h") {
                suits[i] = 32;
            }
            else if (suitsAsString[i] === "d") {
                suits[i] = 64;
            }
        }
        if (cards !== null && suits != null) {
            if (cards.length == suits.length) {
                var e = void 0;
                var o = {};
                var keyCount = 0;
                var j = void 0;
                //o{}n is a map from the card as a string to the occurences of that card,
                // each card should have only one occurance;
                //keycount is used to check if all cards are unique
                for (i = 0; i < cards.length; i++) {
                    e = cards[i] + suitsAsString[i];
                    o[e] = 1;
                }
                for (j in o) {
                    if (o.hasOwnProperty(j)) {
                        keyCount++;
                    }
                }
                if (cards.length >= 5) {
                    //iof cards are unique
                    if (cards.length == suits.length && cards.length == keyCount) {
                        //get the number of possile combinations for the cards, also all possible combionations
                        //example: for 5 cards, the cumber of combinations is 1(for a 5 card set) and the arrangements 0,1,2,3,4
                        var c = getCombinations(5, cards.length);
                        var maxRank = 0, winIndex = 10;
                        for (i = 0; i < c.length; i++) {
                            var cs = [cards[c[i][0]], cards[c[i][1]], cards[c[i][2]], cards[c[i][3]], cards[c[i][4]]];
                            var ss = [suits[c[i][0]], suits[c[i][1]], suits[c[i][2]],
                                suits[c[i][3]], suits[c[i][4]]];
                            index = calcIndex(cs, ss);
                            if (handRanks[index] > maxRank) {
                                maxRank = handRanks[index];
                                winIndex = index;
                                wci = c[i].slice();
                            }
                            else if (handRanks[index] == maxRank) {
                                var score1 = getPokerScore(cs);
                                var score2 = getPokerScore([cards[wci[0]], cards[wci[1]], cards[wci[2]], cards[wci[3]], cards[wci[4]]]);
                                if (score1 > score2) {
                                    wci = c[i].slice();
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
            console.log("Hand Name: " + hands[index]);
            var winningScoreAndCardsObject = new winningScoreAndCards();
            winningScoreAndCardsObject.index = index;
            winningScoreAndCardsObject.wci = wci;
            return winningScoreAndCardsObject;
        }
    }
    gameLogic.rankHand = rankHand;
    function getPokerScore(cs) {
        var a = cs.slice();
        var d = [];
        var i;
        for (i = 0; i < 5; i++) {
            d[a[i]] = (d[a[i]] >= 1) ? d[a[i]] + 1 : 1;
        }
        a.sort(function (a, b) { return (d[a] < d[b]) ? +1 : (d[a] > d[b]) ? -1 : (b - a); });
        return a[0] << 16 | a[1] << 12 | a[2] << 8 | a[3] << 4 | a[4];
    }
    gameLogic.getPokerScore = getPokerScore;
    function getCombinations(k, n) {
        var result = [], comb = [];
        function next_comb(comb, k, n) {
            var i;
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
                comb[i] = comb[i - 1] + 1;
            }
            return true;
        }
        while (next_comb(comb, k, n)) {
            result.push(comb.slice());
        }
        return result;
    }
    gameLogic.getCombinations = getCombinations;
    function calcIndex(cs, ss) {
        var v, i, o, s;
        for (i = -1, v = o = 0; i < 5; i++, o = Math.pow(2, cs[i] * 4)) {
            v += o * ((v / o & 15) + 1);
        }
        if ((v %= 15) != 5) {
            return v - 1;
        }
        else {
            s = 1 << cs[0] | 1 << cs[1] | 1 << cs[2] | 1 << cs[3] | 1 << cs[4];
        }
        v -= ((s / (s & -s) == 31) || (s == 0x403c) ? 3 : 1);
        if (ss[0] == (ss[0] | ss[1] | ss[2] | ss[3] | ss[4])) {
            return v - ((s == 0x7c00) ? -5 : 1);
        }
        else {
            return v;
        }
    }
    function resolveEqualHandsConflict(tableCards, playerWithConflicts, winningCardsList, conflictType) {
        console.log("Conflict Type : " + conflictType);
        var currentPlayerWinningCards = [];
        var winningPlayersList = [];
        for (var i = 0; i < playerWithConflicts.length; i++) {
            currentPlayerWinningCards[i] = [];
            for (var j = 0; j < winningCardsList[i].length; j++) {
                if (winningCardsList[i][j] < 2) {
                    currentPlayerWinningCards[i].push(playerWithConflicts[i].cards[winningCardsList[i][j]]);
                }
                else {
                    currentPlayerWinningCards[i].push(tableCards[winningCardsList[i][j] - 2]);
                }
            }
        }
        switch (conflictType) {
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
            case "-Invalid-": {
                return;
            }
        }
    }
    gameLogic.resolveEqualHandsConflict = resolveEqualHandsConflict;
    function resolve_4_OfAKind(tableCards, playerWithConflicts, winningCardsList, conflictType, currentPlayerWinningCards, winningPlayersList) {
        var maxnum = 0;
        var highestKickerCardNumber = 0;
        var playerWithHighestKickerCardNumber;
        for (var i = 0; i < playerWithConflicts.length; i++) {
            var count = 1;
            var highestCurrentPlayerKickerCardNumber = 0;
            var num = "";
            for (var j = 0; j < currentPlayerWinningCards[i].length - 1; j++) {
                for (var k = j + 1; k < currentPlayerWinningCards[i].length; k++) {
                    if (currentPlayerWinningCards[i][j].cardNumber == currentPlayerWinningCards[i][k].cardNumber) {
                        count++;
                    }
                }
                num = currentPlayerWinningCards[i][j].cardNumber;
                if (count == 4) {
                    break;
                }
                else {
                    count = 1;
                }
            }
            count = 0;
            for (var j = 0; j < currentPlayerWinningCards[i].length; j++) {
                count = 1;
                for (var k = 0; k < currentPlayerWinningCards[i].length; k++) {
                    if (currentPlayerWinningCards[i][j].cardNumber == currentPlayerWinningCards[i][k].cardNumber && j != k) {
                        count++;
                    }
                }
                if (count == 1 && getCardIntegerValue(currentPlayerWinningCards[i][j].cardNumber) > highestCurrentPlayerKickerCardNumber) {
                    highestCurrentPlayerKickerCardNumber = getCardIntegerValue(currentPlayerWinningCards[i][j].cardNumber);
                }
            }
            var numberValue = getCardIntegerValue(num);
            if (numberValue > maxnum) {
                maxnum = numberValue;
                highestKickerCardNumber = highestCurrentPlayerKickerCardNumber;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if (numberValue == maxnum && highestCurrentPlayerKickerCardNumber > highestKickerCardNumber) {
                highestKickerCardNumber = highestCurrentPlayerKickerCardNumber;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if (numberValue == maxnum && highestCurrentPlayerKickerCardNumber == highestKickerCardNumber) {
                winningPlayersList.push(playerWithConflicts[i]);
            }
        }
        return winningPlayersList;
    }
    gameLogic.resolve_4_OfAKind = resolve_4_OfAKind;
    function resolve_3_OfAKind(tableCards, playerWithConflicts, winningCardsList, conflictType, currentPlayerWinningCards, winningPlayersList) {
        var maxnum = 0;
        var secondHighestKickerCardNumber = 0;
        var highestKickerCardNumber = 0;
        var playerWithHighestKickerCardNumber;
        for (var i = 0; i < playerWithConflicts.length; i++) {
            var count = 1;
            var highestCurrentPlayerKickerCardNumber = 0;
            var secondHighestCurrentPlayerKickerCardNumber = 0;
            var num = "";
            for (var j = 0; j < currentPlayerWinningCards[i].length - 1; j++) {
                for (var k = j + 1; k < currentPlayerWinningCards[i].length; k++) {
                    if (currentPlayerWinningCards[i][j].cardNumber == currentPlayerWinningCards[i][k].cardNumber) {
                        count++;
                    }
                }
                num = currentPlayerWinningCards[i][j].cardNumber;
                if (count == 3) {
                    break;
                }
                else {
                    count = 1;
                }
            }
            count = 0;
            for (var j = 0; j < currentPlayerWinningCards[i].length; j++) {
                count = 1;
                for (var k = 0; k < currentPlayerWinningCards[i].length; k++) {
                    if (currentPlayerWinningCards[i][j].cardNumber == currentPlayerWinningCards[i][k].cardNumber && j != k) {
                        count++;
                    }
                }
                if (count != 3 && getCardIntegerValue(currentPlayerWinningCards[i][j].cardNumber) > highestCurrentPlayerKickerCardNumber) {
                    secondHighestCurrentPlayerKickerCardNumber = highestCurrentPlayerKickerCardNumber;
                    highestCurrentPlayerKickerCardNumber = getCardIntegerValue(currentPlayerWinningCards[i][j].cardNumber);
                }
                else if (count != 3 && getCardIntegerValue(currentPlayerWinningCards[i][j].cardNumber) > highestCurrentPlayerKickerCardNumber) {
                    secondHighestCurrentPlayerKickerCardNumber = getCardIntegerValue(currentPlayerWinningCards[i][j].cardNumber);
                }
            }
            var numberValue = getCardIntegerValue(num);
            console.log("3 Of A Kind: " + numberValue + " ; Kicker: " + highestCurrentPlayerKickerCardNumber);
            if (numberValue > maxnum) {
                maxnum = numberValue;
                highestKickerCardNumber = highestCurrentPlayerKickerCardNumber;
                secondHighestCurrentPlayerKickerCardNumber = highestCurrentPlayerKickerCardNumber;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if (numberValue == maxnum && highestCurrentPlayerKickerCardNumber > highestKickerCardNumber) {
                highestKickerCardNumber = highestCurrentPlayerKickerCardNumber;
                secondHighestKickerCardNumber = secondHighestCurrentPlayerKickerCardNumber;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if (numberValue == maxnum && highestCurrentPlayerKickerCardNumber == highestKickerCardNumber && secondHighestCurrentPlayerKickerCardNumber > secondHighestKickerCardNumber) {
                secondHighestKickerCardNumber = secondHighestCurrentPlayerKickerCardNumber;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if (numberValue == maxnum && highestCurrentPlayerKickerCardNumber == highestKickerCardNumber && secondHighestCurrentPlayerKickerCardNumber == secondHighestKickerCardNumber) {
                winningPlayersList.push(playerWithConflicts[i]);
            }
        }
        return winningPlayersList;
    }
    gameLogic.resolve_3_OfAKind = resolve_3_OfAKind;
    function resolve_2_OfAKind(tableCards, playerWithConflicts, winningCardsList, conflictType, currentPlayerWinningCards, winningPlayersList) {
        var maxnum = 0;
        var firstMaxGlobal = 0;
        var secondMaxGlobal = 0;
        var thirdMaxGlobal = 0;
        for (var i = 0; i < playerWithConflicts.length; i++) {
            var count = 1;
            var num = "";
            for (var j = 0; j < currentPlayerWinningCards[i].length - 1; j++) {
                for (var k = j + 1; k < currentPlayerWinningCards[i].length; k++) {
                    if (currentPlayerWinningCards[i][j].cardNumber == currentPlayerWinningCards[i][k].cardNumber) {
                        count++;
                    }
                }
                num = currentPlayerWinningCards[i][j].cardNumber;
                if (count == 2) {
                    break;
                }
                else {
                    count = 1;
                }
            }
            var firstMax = 0;
            var secondMax = 0;
            var thirdMax = 0;
            var numberValue = getCardIntegerValue(num);
            for (var j = 0; j < currentPlayerWinningCards[i].length; j++) {
                var currentNumber = getCardIntegerValue(currentPlayerWinningCards[i][j].cardNumber);
                if (currentNumber != numberValue) {
                    if (currentNumber > firstMax) {
                        thirdMax = secondMax;
                        secondMax = firstMax;
                        firstMax = currentNumber;
                    }
                    else if (currentNumber > secondMax) {
                        thirdMax = secondMax;
                        secondMax = currentNumber;
                    }
                    else if (currentNumber > thirdMax) {
                        thirdMax = currentNumber;
                    }
                }
            }
            if (numberValue > maxnum) {
                maxnum = numberValue;
                firstMaxGlobal = firstMax;
                secondMaxGlobal = secondMax;
                thirdMaxGlobal = thirdMax;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if (numberValue == maxnum && firstMax > firstMaxGlobal) {
                firstMaxGlobal = firstMax;
                secondMaxGlobal = secondMax;
                thirdMaxGlobal = thirdMax;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if (numberValue == maxnum && firstMax == firstMaxGlobal && secondMax > secondMaxGlobal) {
                secondMaxGlobal = secondMax;
                thirdMaxGlobal = thirdMax;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if (numberValue == maxnum && firstMax == firstMaxGlobal && secondMax == secondMaxGlobal && thirdMax > thirdMaxGlobal) {
                thirdMaxGlobal = thirdMax;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if (numberValue == maxnum && firstMax == firstMaxGlobal && secondMax == secondMaxGlobal && thirdMax == thirdMaxGlobal) {
                winningPlayersList.push(playerWithConflicts[i]);
            }
        }
        return winningPlayersList;
    }
    gameLogic.resolve_2_OfAKind = resolve_2_OfAKind;
    function findHighestCard(tableCards, playerWithConflicts, winningCardsList, conflictType, currentPlayerWinningCards, winningPlayersList) {
        var maxnum = 0;
        for (var i = 0; i < playerWithConflicts.length; i++) {
            var maxNumber = 0;
            for (var j = 0; j < currentPlayerWinningCards[i].length; j++) {
                var numberValue = getCardIntegerValue(currentPlayerWinningCards[i][j].cardNumber);
                if (numberValue > maxNumber) {
                    maxNumber = numberValue;
                }
            }
            if (maxNumber > maxnum) {
                maxnum = maxNumber;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if (maxNumber == maxnum) {
                winningPlayersList.push(playerWithConflicts[i]);
            }
        }
        return winningPlayersList;
    }
    gameLogic.findHighestCard = findHighestCard;
    function resolveHighestCard(tableCards, playerWithConflicts, winningCardsList, conflictType, currentPlayerWinningCards, winningPlayersList) {
        var winningPlayerWinningCards = [];
        for (var i = 0; i < currentPlayerWinningCards.length; i++) {
            currentPlayerWinningCards[i].sort(sortNumber);
        }
        for (var i = 0; i < 5; i++) {
            var maxIthNumber = 0;
            for (var j = 0; j < playerWithConflicts.length; j++) {
                if (getCardIntegerValue(currentPlayerWinningCards[j][i].cardNumber) > maxIthNumber) {
                    maxIthNumber = getCardIntegerValue(currentPlayerWinningCards[j][i].cardNumber);
                    winningPlayersList = [];
                    winningPlayersList.push(playerWithConflicts[j]);
                    winningPlayerWinningCards = [];
                    winningPlayerWinningCards.push(currentPlayerWinningCards[j]);
                }
                else if (getCardIntegerValue(currentPlayerWinningCards[j][i].cardNumber) == maxIthNumber) {
                    winningPlayersList.push(playerWithConflicts[j]);
                    winningPlayerWinningCards.push(currentPlayerWinningCards[j]);
                }
            }
            if (winningPlayersList.length == 1 || i == 4) {
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
    gameLogic.resolveHighestCard = resolveHighestCard;
    function resolve2Pairs(tableCards, playerWithConflicts, winningCardsList, conflictType, currentPlayerWinningCards, winningPlayersList) {
        var highestPair = 0;
        var secondHighestPair = 0;
        var maxKicker = 0;
        for (var i = 0; i < playerWithConflicts.length; i++) {
            var count = 1;
            var currentPlayerhighestPair = 0;
            var currentPlayerSecondHighestPair = 0;
            var currentPlayerKicker = 0;
            for (var j = 0; j < currentPlayerWinningCards[i].length - 1; j++) {
                for (var k = j + 1; k < currentPlayerWinningCards[i].length; k++) {
                    if (currentPlayerWinningCards[i][j].cardNumber == currentPlayerWinningCards[i][k].cardNumber) {
                        count++;
                    }
                }
                if (count == 2) {
                    var numberValue = getCardIntegerValue(currentPlayerWinningCards[i][j].cardNumber);
                    if (numberValue > currentPlayerhighestPair) {
                        currentPlayerSecondHighestPair = currentPlayerhighestPair;
                        currentPlayerhighestPair = numberValue;
                    }
                    else if (numberValue > currentPlayerSecondHighestPair) {
                        currentPlayerSecondHighestPair = numberValue;
                    }
                }
                else {
                    count = 1;
                }
            }
            count = 1;
            for (var j = 0; j < currentPlayerWinningCards[i].length; j++) {
                count = 1;
                for (var k = 0; k < currentPlayerWinningCards[i].length; k++) {
                    if (currentPlayerWinningCards[i][j].cardNumber == currentPlayerWinningCards[i][k].cardNumber && j != k) {
                        count++;
                    }
                }
                if (count == 1) {
                    currentPlayerKicker = getCardIntegerValue(currentPlayerWinningCards[i][j].cardNumber);
                    break;
                }
            }
            if (currentPlayerhighestPair > highestPair) {
                highestPair = currentPlayerhighestPair;
                secondHighestPair = currentPlayerSecondHighestPair;
                maxKicker = currentPlayerKicker;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if (currentPlayerhighestPair == highestPair && currentPlayerSecondHighestPair > secondHighestPair) {
                secondHighestPair = currentPlayerSecondHighestPair;
                maxKicker = currentPlayerKicker;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if (currentPlayerhighestPair == highestPair && currentPlayerSecondHighestPair == secondHighestPair && currentPlayerKicker > maxKicker) {
                maxKicker = currentPlayerKicker;
                winningPlayersList = [];
                winningPlayersList.push(playerWithConflicts[i]);
            }
            else if (currentPlayerhighestPair == highestPair && currentPlayerSecondHighestPair == secondHighestPair && currentPlayerKicker == maxKicker) {
                winningPlayersList.push(playerWithConflicts[i]);
            }
        }
        return winningPlayersList;
    }
    gameLogic.resolve2Pairs = resolve2Pairs;
    function getCardIntegerValue(cardNumberString) {
        switch (cardNumberString) {
            case "J": return 11;
            case "Q": return 12;
            case "K": return 13;
            case "A": return 14;
            default: return Number(cardNumberString);
        }
    }
    gameLogic.getCardIntegerValue = getCardIntegerValue;
    function sortNumber(a, b) {
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
    gameLogic.sortNumber = sortNumber;
    function forSimpleTestHtml() {
        var move = gameLogic.createMove(null, null, 0, 0);
        move = gameLogic.createMove(move.stateAfterMove, null, 0, move.turnIndexAfterMove);
        move.stateAfterMove.table.playerList[2].state = PlayerState.Fold;
        move = gameLogic.createMove(move.stateAfterMove, null, 0, move.turnIndexAfterMove);
        move.stateAfterMove.table.playerList[3].state = PlayerState.Fold;
        move = gameLogic.createMove(move.stateAfterMove, null, 0, move.turnIndexAfterMove);
        move.stateAfterMove.table.playerList[4].state = PlayerState.Fold;
        move = gameLogic.createMove(move.stateAfterMove, null, 0, move.turnIndexAfterMove);
        move.stateAfterMove.table.playerList[0].state = PlayerState.Raise;
        move = gameLogic.createMove(move.stateAfterMove, null, 30, move.turnIndexAfterMove);
        move.stateAfterMove.table.playerList[1].state = PlayerState.Raise;
        move = gameLogic.createMove(move.stateAfterMove, null, 30, move.turnIndexAfterMove);
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
    gameLogic.forSimpleTestHtml = forSimpleTestHtml;
})(gameLogic || (gameLogic = {}));
//# sourceMappingURL=gameLogic.js.map
;
;
var game;
(function (game) {
    // I export all variables to make it easy to debug in the browser by
    // simply typing in the console:
    // game.state
    game.animationEnded = false;
    game.canMakeMove = false;
    game.isComputerTurn = false;
    game.move = null;
    game.state = null;
    game.isHelpModalShown = false;
    //the flags to show buttons or not
    // let shouldShowSmallBlind = true;
    // let shouldShowBigBlind =false;
    // let shouldShowAllIn = false;
    // let shouldShowRaise =false;
    // let shouldShowCall =false;
    // let shouldShowCheck=false;
    //used to animate the opening of cards on the table
    //updated each time cellClicked is called, but before the move is sent  
    game.oldOpenCardsSize = 0;
    var yourPlayerCards_card1;
    var yourPlayerCards_card2;
    function init() {
        translate.setTranslations(getTranslations());
        translate.setLanguage('en');
        log.log("Translation of 'RULES_OF_TICTACTOE' is " + translate('RULES_OF_TICTACTOE'));
        resizeGameAreaService.setWidthToHeight(1);
        moveService.setGame({
            minNumberOfPlayers: 5,
            maxNumberOfPlayers: 5,
            checkMoveOk: gameLogic.checkMoveOk,
            updateUI: updateUI
        });
        // See http://www.sitepoint.com/css3-animation-javascript-event-handlers/
        document.addEventListener("animationend", animationEndedCallback, false); // standard
        document.addEventListener("webkitAnimationEnd", animationEndedCallback, false); // WebKit
        document.addEventListener("oanimationend", animationEndedCallback, false); // Opera
        setTimeout(animationEndedCallback, 1000); // Just in case animationEnded is not fired by some browser.
        var w = window;
        if (w["HTMLInspector"]) {
            setInterval(function () {
                w["HTMLInspector"].inspect({
                    excludeRules: ["unused-classes", "script-placement"],
                });
            }, 3000);
        }
    }
    game.init = init;
    function getTranslations() {
        return {
            RULES_OF_TICTACTOE: {
                en: "Rules of TicTacToe",
                iw: "חוקי המשחק",
            },
            RULES_SLIDE1: {
                en: "You and your opponent take turns to mark the grid in an empty spot. The first mark is X, then O, then X, then O, etc.",
                iw: "אתה והיריב מסמנים איקס או עיגול כל תור",
            },
            RULES_SLIDE2: {
                en: "The first to mark a whole row, column or diagonal wins.",
                iw: "הראשון שמסמן שורה, עמודה או אלכסון מנצח",
            },
            CLOSE: {
                en: "Close",
                iw: "סגור",
            },
        };
    }
    function animationEndedCallback() {
        if (game.animationEnded)
            return;
        $rootScope.$apply(function () {
            log.info("Animation ended");
            game.animationEnded = true;
            sendComputerMove();
        });
    }
    function sendComputerMove() {
        if (!game.isComputerTurn) {
            return;
        }
        // remove these comments once ai service is ready
        // isComputerTurn = false; // to make sure the computer can only move once.
        // moveService.makeMove(aiService.findComputerMove(move));
    }
    function updateUI(params) {
        log.info("Game got updateUI:", params);
        game.animationEnded = false;
        game.move = params.move;
        game.state = game.move.stateAfterMove;
        if (!game.state) {
            console.log("Calling updateUI");
            game.state = gameLogic.getInitialState();
        }
        console.log(params, game.state);
        game.canMakeMove = game.move.turnIndexAfterMove >= 0 &&
            params.yourPlayerIndex === game.move.turnIndexAfterMove; // it's my turn
        console.log("canMakeMove: " + game.canMakeMove + " params.yourPlayerIndex: " + params.yourPlayerIndex + "move.turnIndexAfterMove: " + game.move.turnIndexAfterMove
            + " \nSTATE:");
        console.log(game.state);
        /****** Logic for updating UI to reflect cards of the current player******/
        //check that player hasnt folded yet and yourPlayerIndex is valid(fake updateUI sets it to -2)
        if ((params.yourPlayerIndex >= 0) && (game.state.table.playerList[params.yourPlayerIndex].state !== 3)) {
            game.temp_yourPlayerIndex = params.yourPlayerIndex;
            yourPlayerCards_card1 = game.state.table.playerList[params.yourPlayerIndex].cards[0];
            yourPlayerCards_card2 = game.state.table.playerList[params.yourPlayerIndex].cards[1];
            game.class_yourPlayerCards_card1 = getCardClass(yourPlayerCards_card1);
            game.class_yourPlayerCards_card2 = getCardClass(yourPlayerCards_card2);
            // getPlayerOptions();
            console.log("cardsClass YPI" + game.class_yourPlayerCards_card1 + " " + game.class_yourPlayerCards_card2);
        }
        /*************************************************************************/
        // Is it the computer's turn?
        game.isComputerTurn = game.canMakeMove &&
            params.playersInfo[params.yourPlayerIndex].playerId === '';
        if (game.isComputerTurn) {
            // To make sure the player won't click something and send a move instead of the computer sending a move.
            game.canMakeMove = false;
            // We calculate the AI move only after the animation finishes,
            // because if we call aiService now
            // then the animation will be paused until the javascript finishes.
            if (!game.state.delta) {
                // This is the first move in the match, so
                // there is not going to be an animation, so
                // call sendComputerMove() now (can happen in ?onlyAIs mode)
                sendComputerMove();
            }
        }
        console.log("state at end of updateUI", game.state);
    }
    function cellClicked(action, amountRaised) {
        log.info("Clicked on button:", action, " amountRaised: ", amountRaised);
        if (window.location.search === '?throwException') {
            throw new Error("Throwing the error because URL has '?throwException'");
        }
        if (!game.canMakeMove) {
            console.log(" cannot make move, " + game.move.turnIndexAfterMove + " should play");
            return;
        }
        try {
            console.log("cellClicked STATE BEFORE MAKE MOVE: ", game.state);
            //if small blind is not yet set, set it and remove the button from the dispaly
            //to remove the button, i use  shouldShowSmallBlind
            // if((action  === 'Small') && (shouldShowSmallBlind == true)){
            //     shouldShowSmallBlind = false;
            //     shouldShowBigBlind = true;
            // }
            // if((action  === 'Big') && (shouldShowBigBlind == true)){
            //     shouldShowBigBlind = false;
            // }
            //update the closedCards size
            game.oldOpenCardsSize = game.state.table.openedCards.length;
            game.state.table.playerList[game.temp_yourPlayerIndex].state = getPlayerStateBasedOnAction(action);
            console.log("Move Before call :", game.move);
            var nextMove = gameLogic.createMove(game.state, null, amountRaised, game.move.turnIndexAfterMove);
            game.canMakeMove = false; // to prevent making another move
            moveService.makeMove(nextMove);
            console.log("cellClicked STATE AFTER MAKE MOVE: ");
            console.log(game.state);
        }
        catch (e) {
            log.info("Illegal Move", action);
            console.log(e);
            return;
        }
    }
    game.cellClicked = cellClicked;
    /*
      export function shouldShowImage(row: number, col: number): boolean {
        let cell = state.board[row][col];
        return cell !== "";
      }
    
      export function isPieceX(row: number, col: number): boolean {
        return state.board[row][col] === 'X';
      }
    
      export function isPieceO(row: number, col: number): boolean {
        return state.board[row][col] === 'O';
      }*/
    //  export function shouldSlowlyAppear(row: number, col: number): boolean {
    //    return !animationEnded &&
    //        state.delta &&
    //        state.delta.row === row && state.delta.col === col;
    //  }
    /********RIDHIMAN ADDED*****/
    function getPlayerOptions() {
        /**supposed to reset theflags basedon function calls made in game logic,
         * has to call functions in game logic ti check thing slike the pot anmd all
         * and decide the options it can show to the user
         */
    }
    //  function showWinners(params: IUpdateUI){
    //      //set the flag to show a different div which shows the player's cards, and the winning hands
    //       console.log("should show winners");
    //       setTimeout(function() {
    //           console.log();
    //            shouldShowSmallBlind = true;
    //            game.state.table.winners = null;
    //            params.stateBeforeMove.table.winners = null;
    //            console.log();
    //            updateUI(params);
    //            alert("time out done, should have shown winners");
    //       },9000);
    //      }
    function getPlayerStateBasedOnAction(action) {
        switch (action) {
            case "Raise": return PlayerState.Raise;
            case "Fold": return PlayerState.Fold;
            case "Call": return PlayerState.Call;
            case "AllIn": return PlayerState.AllIn;
            case "Check": return PlayerState.Check;
            case "Small": return PlayerState.Init;
            case "Big": return PlayerState.Init;
            default: throw new Error("getPlayerStateBasedOnAction: Illegal PlayertState");
        }
    }
    game.getPlayerStateBasedOnAction = getPlayerStateBasedOnAction;
    function getPlayerStateByIndex(index) {
        var playerState = PlayerState[game.state.table.playerList[index].state];
        return playerState;
    }
    game.getPlayerStateByIndex = getPlayerStateByIndex;
    function raised() {
        var amount = document.getElementById('raiseAmount').value;
        if (amount === '') {
            amount = '0';
        }
        game.cellClicked("Raise", +amount);
        return;
    }
    game.raised = raised;
    /*
     *returns the class of the card, check to see if index lies in
     *closed card range, if not simply returns "card".
     */
    function getCardClass(card) {
        var cardClass = "card";
        //    if((state === null) || (index >= (game.state.table.closedCards.length -1))) {
        //        return cardClass;
        //    }else{
        return cardClass += " " + getCardSuite(card) + " " + getCardRank(card);
        //    }
    }
    game.getCardClass = getCardClass;
    function getCardSuite(card) {
        //    if((state === null )|| (index >= state.table.closedCards.length)){
        //        throw new Error("getCardSuite: No Card with that index");
        //    }
        switch (card.cardType) {
            case 0: return "clubs";
            case 1: return "diamonds";
            case 2: return "hearts";
            case 3: return "spades";
            default: return " ";
        }
    }
    game.getCardSuite = getCardSuite;
    function getCardRank(card) {
        //    if((state === null )|| (index >= state.table.closedCards.length)){
        //        throw new Error("getCardRank: No Card with that index");
        //    }
        switch (card.cardNumber) {
            case "K": return "rank13";
            case "Q": return "rank12";
            case "J": return "rank11";
            case "10": return "rank10";
            case "9": return "rank9";
            case "8": return "rank8";
            case "7": return "rank7";
            case "6": return "rank6";
            case "5": return "rank5";
            case "4": return "rank4";
            case "3": return "rank3";
            case "2": return "rank2";
            case "A": return "rank1";
            default: return " ";
        }
    }
    game.getCardRank = getCardRank;
    function shouldShowButton(action) {
        switch (action) {
            case "Raise": return gameLogic.canRaiseOrNot(game.state.table, game.state.table.playerList[game.temp_yourPlayerIndex], 0); //for now returning true, check function again
            case "Fold": return gameLogic.canFoldOrNot(game.state.table);
            case "Call": return gameLogic.canCallOrNot(game.state.table, game.state.table.playerList[game.temp_yourPlayerIndex]);
            case "AllIn": return gameLogic.canAllInOrNot(game.state.table, game.state.table.playerList[game.temp_yourPlayerIndex]);
            case "Check": return gameLogic.canCheckOrNot(game.state.table, game.state.table.playerList[game.temp_yourPlayerIndex]);
            case "Small": return gameLogic.canSmallBlindOrNot(game.state.table);
            case "Big": return gameLogic.canBigBlindOrNot(game.state.table);
            default: return true;
        }
    }
    game.shouldShowButton = shouldShowButton;
    /***************************/
    function clickedOnModal(evt) {
        if (evt.target === evt.currentTarget) {
            evt.preventDefault();
            evt.stopPropagation();
            game.isHelpModalShown = false;
        }
        return true;
    }
    game.clickedOnModal = clickedOnModal;
})(game || (game = {}));
angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
    .run(function () {
    $rootScope['game'] = game;
    game.init();
});
//# sourceMappingURL=game.js.map
;
var aiService;
(function (aiService) {
    /** Returns the move that the computer player should do for the given state in move. */
    function findComputerMove(move) {
        return createComputerMove(move, 
        // at most 1 second for the AI to choose a move (but might be much quicker)
        { millisecondsLimit: 1000 });
    }
    aiService.findComputerMove = findComputerMove;
    /**
     * Returns all the possible moves for the given state and turnIndexBeforeMove.
     * Returns an empty array if the game is over.
     */
    function getPossibleMoves(state, turnIndexBeforeMove) {
        var possibleMoves = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                try {
                    possibleMoves.push(gameLogic.createMove(state, i, j, turnIndexBeforeMove));
                }
                catch (e) {
                }
            }
        }
        return possibleMoves;
    }
    aiService.getPossibleMoves = getPossibleMoves;
    /**
     * Returns the move that the computer player should do for the given state.
     * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
     * and it has either a millisecondsLimit or maxDepth field:
     * millisecondsLimit is a time limit, and maxDepth is a depth limit.
     */
    function createComputerMove(move, alphaBetaLimits) {
        // We use alpha-beta search, where the search states are TicTacToe moves.
        return alphaBetaService.alphaBetaDecision(move, move.turnIndexAfterMove, getNextStates, getStateScoreForIndex0, null, alphaBetaLimits);
    }
    aiService.createComputerMove = createComputerMove;
    function getStateScoreForIndex0(move, playerIndex) {
        var endMatchScores = move.endMatchScores;
        if (endMatchScores) {
            return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
                : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
                    : 0;
        }
        return 0;
    }
    function getNextStates(move, playerIndex) {
        return getPossibleMoves(move.stateAfterMove, playerIndex);
    }
})(aiService || (aiService = {}));
//# sourceMappingURL=aiService.js.map