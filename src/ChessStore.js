import {makeAutoObservable} from 'mobx';

class ChessStore {
  fen = undefined; // undefined Initialer FEN-String (kann leer sein oder Standardstellung)
  isBlacksFirstMove = null;

  constructor() {
    makeAutoObservable(this); // MobX macht alle Eigenschaften automatisch beobachtbar
  }

  setFEN(newFEN) {
    this.fen = newFEN;
  }

  setIsBlacksFirstMove(value) {
    this.isBlacksFirstMove = value;
  }
}

const chessStore = new ChessStore();

export default chessStore;
