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