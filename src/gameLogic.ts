class Card {
    
    private cardSuite: string;
    private cardNumber: number;
    
    constructor(cardSuite: string, cardNumber: number) {
        this.cardSuite = cardSuite;
        this.cardNumber = cardNumber;
    }
    
    getCardSuite() : string {
        return this.cardSuite;
    }
    
    getCardNumber() : number {
        return this.cardNumber;
    }
}  

enum State {CHECK, FOLD, RAISE, CALL, INITIAL}
class Player {
    
    private playerID: number;
    private playerName: string;
    private playerChips: number;
    private playerState: State;
    private playerCards: Card[];
    
    constructor(playerID: number, playerName: string, playerChips: number) {
        this.playerID = playerID;
        this.playerName = playerName;
        this.playerChips = playerChips;
        this.playerState = State.INITIAL;
        this.playerCards = [];
    }
    
    getID() : number {
        return this.playerID;
    }
    
    addCardToHand(newCard : Card){
        this.playerCards.push(newCard);
    }
}

class Pot {
    
    private potAmount: number;
    private potPlayers: Player[];
    
    constructor() {
        this.potAmount = 0;
        this.potPlayers = [];
    }
    
    addChipsToPot(addedAmount: number) {
        this.potAmount += addedAmount;
    }
}

class PokerTable {
    
    private tableCardDeck: Card[] = [];
    private tablePlayers: Player[] = [];
    private tableOpenCards: Card[] = [];
    private tableClosedCards: Card[] = [];
    private tableDealerNumber: number = 0;
    private tablePot: Pot;
    
    addCardsToTableDeck(newCard : Card) {
        this.tableCardDeck.push(newCard);
    }
    
    addCardsToTableClosedCards(newCard : Card) {
        this.tableClosedCards.push(newCard);
    }
    
    swapCardsInTheDeck(cardIndex1 : number, cardIndex2 : number) {
        let tempCard : Card = this.tableCardDeck[cardIndex1];
        this.tableCardDeck[cardIndex1] = this.tableCardDeck[cardIndex2];
        this.tableCardDeck[cardIndex2] = tempCard;
    }
    
    addPlayerToTable(newplayer : Player) {
        this.tablePlayers.push(newplayer);
    }
    
    deletePlayerFromTable(leavingPlayer : Player) {
        let index : number = -1;
        for(let i : number = 0; i<this.tablePlayers.length; i++) {
            if(this.tablePlayers[i].getID() == leavingPlayer.getID()) {
                index = i;
                break;
            }
        }
        this.tablePlayers.splice(index, 1);
    }
    
    getPlayerAtIndex(playerIndex : number) : Player {
        return this.tablePlayers[playerIndex];
    }
    
    getTopMostCardFromDeck() : Card {
        return this.tableCardDeck.pop();
    }
    
    showCardAtIndex(cardIndex : number) {
        document.write(this.tableCardDeck[cardIndex].getCardNumber() + " of " + this.tableCardDeck[cardIndex].getCardSuite());
    }
    
    getNumberofCardsInCardDeck() : number {
        return this.tableCardDeck.length;$
    }
}

type Table = PokerTable;
interface TableDelta {
    amountAdded: number;
    currentPlayer: Player;
}
interface IState {
    table : Table;
    delta : TableDelta;
}

module gameLogic {
    
    export const CARD_DECK_SIZE = 52;
    export const SMALL_BLIND = 20;
    export const BIG_BLIND = 40;
    export const INITIAL_CHIPS = 400;
    let NUMBER_OF_PLAYERS : number = 4;
    
    function getInitialTable(): Table {
        let table: Table;
        //initialize and shuffle the deck.
        getDeckOfCards(table);
        //initialize the players
        initializePlayers(table);
        return table;
    }
    
    export function getInitialState(): IState {
        return {table: getInitialTable(), delta: null};
    }
    
    function getDeckOfCards(table : Table) {
        let suiteType : number = 1;
        
        //Create the Deck.
        for(let i : number=0; i<CARD_DECK_SIZE; i++) {
            let num : number = ((i+1)%13==0) ? 13 :(i+1)%13;
            let suite: string = "";
            
            if (suiteType==1) {
                suite = "Diamonds";
            }
            else if (suiteType==2) {
                suite = "Clubs";
            }
            else  if (suiteType==3) {
                suite = "Spades";
            }
            else {
                suite = "Hearts";
            }
            
            table.addCardsToTableDeck(new Card(suite,num));
            
            if (num==13) {
                suiteType++;
            }
        }
        
        //Shuffle the Deck.
        for (let i : number = CARD_DECK_SIZE - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            table.swapCardsInTheDeck(i, j);
        }
    }
    
    function initializePlayers(table : Table) {
        for(let i : number = 0; i<NUMBER_OF_PLAYERS; i++) {
            table.addPlayerToTable(new Player(i, "Player " + (i+1) + "<br>", INITIAL_CHIPS));
        }
    }
    
    function distributeCards(table : Table) {
        for(var i=0; i<2; i++) {
            for(var j=0; j<NUMBER_OF_PLAYERS; j++) {
                table.getPlayerAtIndex(j).addCardToHand(table.getTopMostCardFromDeck());
            }
        }
        
        table.getTopMostCardFromDeck();
        for(var i=0; i<3; i++) {
            table.addCardsToTableClosedCards(table.getTopMostCardFromDeck());
        }
        
        table.getTopMostCardFromDeck()
        table.addCardsToTableClosedCards(table.getTopMostCardFromDeck());
        
        table.getTopMostCardFromDeck()
        table.addCardsToTableClosedCards(table.getTopMostCardFromDeck());
    }
    
    function printCurrentDeck(table : Table) {
        for(var i=0; i<table.getNumberofCardsInCardDeck(); i++) {
            table.showCardAtIndex(i);
        }
    }
}

/*type Board = string[][];
interface BoardDelta {
  row: number;
  col: number;
}
interface IState {
  board: Board;
  delta: BoardDelta;
}

module gameLogic {
  export const ROWS = 3;
  export const COLS = 3;
*/
  /** Returns the initial TicTacToe board, which is a ROWSxCOLS matrix containing ''. */
/*  function getInitialBoard(): Board {
    let board: Board = [];
    for (let i = 0; i < ROWS; i++) {
      board[i] = [];
      for (let j = 0; j < COLS; j++) {
        board[i][j] = '';
      }
    }
    return board;
  }

  export function getInitialState(): IState {
    return {board: getInitialBoard(), delta: null};
  }
*/
  /**
   * Returns true if the game ended in a tie because there are no empty cells.
   * E.g., isTie returns true for the following board:
   *     [['X', 'O', 'X'],
   *      ['X', 'O', 'O'],
   *      ['O', 'X', 'X']]
   */
/*  function isTie(board: Board): boolean {
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (board[i][j] === '') {
          // If there is an empty cell then we do not have a tie.
          return false;
        }
      }
    }
    // No empty cells, so we have a tie!
    return true;
  }
*/
  /**
   * Return the winner (either 'X' or 'O') or '' if there is no winner.
   * The board is a matrix of size 3x3 containing either 'X', 'O', or ''.
   * E.g., getWinner returns 'X' for the following board:
   *     [['X', 'O', ''],
   *      ['X', 'O', ''],
   *      ['X', '', '']]
   */
/*  function getWinner(board: Board): string {
    let boardString = '';
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        let cell = board[i][j];
        boardString += cell === '' ? ' ' : cell;
      }
    }
    let win_patterns = [
      'XXX......',
      '...XXX...',
      '......XXX',
      'X..X..X..',
      '.X..X..X.',
      '..X..X..X',
      'X...X...X',
      '..X.X.X..'
    ];
    for (let win_pattern of win_patterns) {
      let x_regexp = new RegExp(win_pattern);
      let o_regexp = new RegExp(win_pattern.replace(/X/g, 'O'));
      if (x_regexp.test(boardString)) {
        return 'X';
      }
      if (o_regexp.test(boardString)) {
        return 'O';
      }
    }
    return '';
  }
*/
  /**
   * Returns the move that should be performed when player
   * with index turnIndexBeforeMove makes a move in cell row X col.
   */
/*  export function createMove(
      stateBeforeMove: IState, row: number, col: number, turnIndexBeforeMove: number): IMove {
    if (!stateBeforeMove) { // stateBeforeMove is null in a new match.
      stateBeforeMove = getInitialState();
    }
    let board: Board = stateBeforeMove.board;
    if (board[row][col] !== '') {
      throw new Error("One can only make a move in an empty position!");
    }
    if (getWinner(board) !== '' || isTie(board)) {
      throw new Error("Can only make a move if the game is not over!");
    }
    let boardAfterMove = angular.copy(board);
    boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'X' : 'O';
    let winner = getWinner(boardAfterMove);
    let endMatchScores: number[];
    let turnIndexAfterMove: number;
    if (winner !== '' || isTie(boardAfterMove)) {
      // Game over.
      turnIndexAfterMove = -1;
      endMatchScores = winner === 'X' ? [1, 0] : winner === 'O' ? [0, 1] : [0, 0];
    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      turnIndexAfterMove = 1 - turnIndexBeforeMove;
      endMatchScores = null;
    }
    let delta: BoardDelta = {row: row, col: col};
    let stateAfterMove: IState = {delta: delta, board: boardAfterMove};
    return {endMatchScores: endMatchScores, turnIndexAfterMove: turnIndexAfterMove, stateAfterMove: stateAfterMove};
  }
*/
/*  export function checkMoveOk(stateTransition: IStateTransition): void {
    // We can assume that turnIndexBeforeMove and stateBeforeMove are legal, and we need
    // to verify that the move is OK.
    let turnIndexBeforeMove = stateTransition.turnIndexBeforeMove;
    let stateBeforeMove: IState = stateTransition.stateBeforeMove;
    let move: IMove = stateTransition.move;
    let deltaValue: BoardDelta = stateTransition.move.stateAfterMove.delta;
    let row = deltaValue.row;
    let col = deltaValue.col;
    let expectedMove = createMove(stateBeforeMove, row, col, turnIndexBeforeMove);
    if (!angular.equals(move, expectedMove)) {
      throw new Error("Expected move=" + angular.toJson(expectedMove, true) +
          ", but got stateTransition=" + angular.toJson(stateTransition, true))
    }
  }
*/
/*  export function forSimpleTestHtml() {
    var move = gameLogic.createMove(null, 0, 0, 0);
    log.log("move=", move);
    var params: IStateTransition = {
      turnIndexBeforeMove: 0,
      stateBeforeMove: null,
      move: move,
      numberOfPlayers: 2};
    gameLogic.checkMoveOk(params);
  }
}
*/