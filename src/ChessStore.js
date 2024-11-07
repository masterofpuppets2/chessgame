import {makeAutoObservable} from 'mobx';

class ChessStore {
  fen = undefined; // undefined Initialer FEN-String (kann leer sein oder Standardstellung)

  constructor() {
    makeAutoObservable(this); // MobX macht alle Eigenschaften automatisch beobachtbar
  }

  setFEN(newFEN) {
    this.fen = newFEN;
  }

  get getFEN() {
    return this.fen;
  }
}

const chessStore = new ChessStore();

export default chessStore;
