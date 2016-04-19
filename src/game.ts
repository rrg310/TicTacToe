interface SupportedLanguages { en: string, iw: string};
interface Translations {
  [index: string]: SupportedLanguages;
}

module game {
  // I export all variables to make it easy to debug in the browser by
  // simply typing in the console:
  // game.state
  export let animationEnded = false;
  export let canMakeMove = false;
  export let isComputerTurn = false;
  export let move: IMove = null;
  export let state: IState = null;
  export let isHelpModalShown: boolean = false;
  
  //the flags to show buttons or not
  // let shouldShowSmallBlind = true;
  // let shouldShowBigBlind =false;
  // let shouldShowAllIn = false;
  // let shouldShowRaise =false;
  // let shouldShowCall =false;
  // let shouldShowCheck=false;
  
  //used to animate the opening of cards on the table
  //updated each time cellClicked is called, but before the move is sent  
  export let oldOpenCardsSize:number = 0;


/**cards of yourIndex */
  export let temp_yourPlayerIndex: number;
  let yourPlayerCards_card1: Card;
  let yourPlayerCards_card2: Card;
  export let class_yourPlayerCards_card1: string;
  export let class_yourPlayerCards_card2: string;
    
  export function init() {
    translate.setTranslations(getTranslations());
    translate.setLanguage('en');
    log.log("Translation of 'RULES_OF_TICTACTOE' is " + translate('RULES_OF_TICTACTOE'));
    resizeGameAreaService.setWidthToHeight(1);
    moveService.setGame({
      minNumberOfPlayers: 5,//!!Ridhiman: change these values later 
      maxNumberOfPlayers: 5,
      checkMoveOk: gameLogic.checkMoveOk,
      updateUI: updateUI
    });

    // See http://www.sitepoint.com/css3-animation-javascript-event-handlers/
    document.addEventListener("animationend", animationEndedCallback, false); // standard
    document.addEventListener("webkitAnimationEnd", animationEndedCallback, false); // WebKit
    document.addEventListener("oanimationend", animationEndedCallback, false); // Opera
    setTimeout(animationEndedCallback, 1000); // Just in case animationEnded is not fired by some browser.

    let w: any = window;
    if (w["HTMLInspector"]) {
      setInterval(function () {
        w["HTMLInspector"].inspect({
          excludeRules: ["unused-classes", "script-placement"],
        });
      }, 3000);
    }
  }

  function getTranslations(): Translations {
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
      CLOSE:  {
        en: "Close",
        iw: "סגור",
      },
    };
  }

 function animationEndedCallback() {
    if (animationEnded) return;
    $rootScope.$apply(function () {
      log.info("Animation ended");
      animationEnded = true;
      sendComputerMove();
    });
  }

  function sendComputerMove() {
    if (!isComputerTurn) {
      return;
    }
  // remove these comments once ai service is ready
  // isComputerTurn = false; // to make sure the computer can only move once.
  // moveService.makeMove(aiService.findComputerMove(move));
  }

  function updateUI(params: IUpdateUI): void {
    log.info("Game got updateUI:", params);
    animationEnded = false;
    move = params.move;
    state = move.stateAfterMove;
    if (!state) {
      console.log("Calling updateUI");
      state = gameLogic.getInitialState();
    }
    console.log(params , state);    
    canMakeMove = move.turnIndexAfterMove >= 0 && // game is ongoing
      params.yourPlayerIndex === move.turnIndexAfterMove; // it's my turn
   
    console.log("canMakeMove: "+ canMakeMove + " params.yourPlayerIndex: " +  params.yourPlayerIndex + "move.turnIndexAfterMove: " + move.turnIndexAfterMove
    + " \nSTATE:");
    console.log(state);
    
    /****** Logic for updating UI to reflect cards of the current player******/
    
    //check that player hasnt folded yet and yourPlayerIndex is valid(fake updateUI sets it to -2)
    if ((params.yourPlayerIndex >=  0) && (state.table.playerList[params.yourPlayerIndex].state !== 3)) {
      temp_yourPlayerIndex = params.yourPlayerIndex;
      yourPlayerCards_card1 = state.table.playerList[params.yourPlayerIndex].cards[0];
      yourPlayerCards_card2 = state.table.playerList[params.yourPlayerIndex].cards[1];
      class_yourPlayerCards_card1 = getCardClass(yourPlayerCards_card1);
      class_yourPlayerCards_card2 = getCardClass(yourPlayerCards_card2);
      // getPlayerOptions();
      console.log("cardsClass YPI" + class_yourPlayerCards_card1 + " " + class_yourPlayerCards_card2);
    }
    
    /*************************************************************************/
    
    // Is it the computer's turn?
    isComputerTurn = canMakeMove &&
        params.playersInfo[params.yourPlayerIndex].playerId === '';
    if (isComputerTurn) {
      // To make sure the player won't click something and send a move instead of the computer sending a move.
      canMakeMove = false;
      // We calculate the AI move only after the animation finishes,
      // because if we call aiService now
      // then the animation will be paused until the javascript finishes.
      if (!state.delta) {
        // This is the first move in the match, so
        // there is not going to be an animation, so
        // call sendComputerMove() now (can happen in ?onlyAIs mode)
        sendComputerMove();
      }
    }
    console.log("state at end of updateUI" , state);
  }
  
  export function cellClicked(action: string, amountRaised: number): void {
    log.info("Clicked on button:", action, " amountRaised: " , amountRaised);
    if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
      throw new Error("Throwing the error because URL has '?throwException'");
    }
    if (!canMakeMove) {
        console.log(" cannot make move, " + move.turnIndexAfterMove + " should play" );
      return;
    }
    try {
        console.log("cellClicked STATE BEFORE MAKE MOVE: ",state);
        
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
      oldOpenCardsSize = state.table.openedCards.length;
      
      state.table.playerList[temp_yourPlayerIndex].state = getPlayerStateBasedOnAction(action);
      console.log("Move Before call :",move);
      let nextMove = gameLogic.createMove(state, null, amountRaised, move.turnIndexAfterMove);
      canMakeMove = false; // to prevent making another move
      moveService.makeMove(nextMove);
      console.log("cellClicked STATE AFTER MAKE MOVE: ");
      console.log(state);
    } catch (e) {
      log.info("Illegal Move", action);
      console.log(e);
      return;
    } 
  }

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
  
  function getPlayerOptions(){
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
       
   export function getPlayerStateBasedOnAction(action:string): PlayerState{
     switch(action){
         case "Raise" :return PlayerState.Raise;
         case "Fold"  :return PlayerState.Fold;
         case "Call"  :return PlayerState.Call;
         case "AllIn" :return PlayerState.AllIn;
         case "Check" :return PlayerState.Check;
         case "Small" :return PlayerState.Init;
         case "Big" :return PlayerState.Init;
         default : throw new Error("getPlayerStateBasedOnAction: Illegal PlayertState");
     }
   }
  export function getPlayerStateByIndex(index: number) : string {
     let playerState: string = PlayerState[game.state.table.playerList[index].state];
          return playerState;
  }
   
   export function raised(): void {
       let amount: string = (<HTMLInputElement>document.getElementById('raiseAmount')).value;
       if (amount === '') {
           amount = '0';
       }
        game.cellClicked("Raise", +amount);
       return;
   }
   
   /*
    *returns the class of the card, check to see if index lies in 
    *closed card range, if not simply returns "card".
    */
   export function getCardClass(card: Card):  string {
       let cardClass = "card";
    //    if((state === null) || (index >= (game.state.table.closedCards.length -1))) {
    //        return cardClass;
    //    }else{
          return  cardClass+= " " + getCardSuite(card) +  " " + getCardRank(card); 
    //    }
   }
   
   export function getCardSuite(card: Card) : string {
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
   
   export function getCardRank(card: Card) : string {
    //    if((state === null )|| (index >= state.table.closedCards.length)){
    //        throw new Error("getCardRank: No Card with that index");
    //    }
       switch (card.cardNumber) {
           case "K": return "rank13";
           case "Q": return "rank12";
           case "J": return "rank11";
           case "10":return "rank10";
           case "9":return "rank9";
           case "8":return "rank8";
           case "7":return "rank7";
           case "6":return "rank6";
           case "5":return "rank5";
           case "4":return "rank4";
           case "3":return "rank3";
           case "2":return "rank2";
           case "A": return "rank1";
           default: return " ";
            
       }
    }
    
    export function shouldShowButton(action: string): boolean{
         switch(action){
          case "Raise" :return gameLogic.canRaiseOrNot(state.table, state.table.playerList[temp_yourPlayerIndex], 0);//for now returning true, check function again
          case "Fold"  :return gameLogic.canFoldOrNot(state.table);
          case "Call"  :return gameLogic.canCallOrNot(state.table, state.table.playerList[temp_yourPlayerIndex]);
          case "AllIn" :return gameLogic.canAllInOrNot(state.table, state.table.playerList[temp_yourPlayerIndex]);
          case "Check" :return gameLogic.canCheckOrNot(state.table, state.table.playerList[temp_yourPlayerIndex]);
          case "Small" :return gameLogic.canSmallBlindOrNot(state.table);
          case "Big"   :return gameLogic.canBigBlindOrNot(state.table);
          default:  return true;
        }
    }
  /***************************/
  export function clickedOnModal(evt: Event) {
    if (evt.target === evt.currentTarget) {
      evt.preventDefault();
      evt.stopPropagation();
      isHelpModalShown = false;
    }
    return true;
  }
}

angular.module('myApp', ['ngTouch', 'ui.bootstrap', 'gameServices'])
  .run(function () {
    $rootScope['game'] = game;
    game.init();
  });