import {makeAutoObservable} from 'mobx';
import {Chess} from 'chess.js';

class ChessStore {
  fen = undefined; // representing the starting position
  moveHistory = [];
  // history = [];
  currentTurn = 'Weiß';
  moveIndex = 0;
  currentBoard = [];
  game = new Chess(this.fen);

  constructor() {
    makeAutoObservable(this);
    this.updateBoard();
  }

  setFEN(fen) {
    this.fen = fen;
    this.moveHistory = [];
    this.moveIndex = 0;
    this.currentTurn = 'Weiß';
  }
}

const chessStore = new ChessStore();

export default chessStore;
