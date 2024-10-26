import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {Chess} from 'chess.js';

import BPawn from '../assets/b_pawn.svg';
import BRook from '../assets/b_rook.svg';
import BKnight from '../assets/b_knight.svg';
import BBishop from '../assets/b_bishop.svg';
import BQueen from '../assets/b_queen.svg';
import BKing from '../assets/b_king.svg';
import WPawn from '../assets/w_pawn.svg';
import WRook from '../assets/w_rook.svg';
import WKnight from '../assets/w_knight.svg';
import WBishop from '../assets/w_bishop.svg';
import WQueen from '../assets/w_queen.svg';
import WKing from '../assets/w_king.svg';

const pieceImages = {
  bp: BPawn,
  br: BRook,
  bn: BKnight,
  bb: BBishop,
  bq: BQueen,
  bk: BKing,
  wp: WPawn,
  wr: WRook,
  wn: WKnight,
  wb: WBishop,
  wq: WQueen,
  wk: WKing,
};

const ChessGame = () => {
  const [game] = useState(new Chess());
  const [board, setBoard] = useState(game.board());
  const [selectedSquare, setSelectedSquare] = React.useState(null);

  const onSquarePress = (row, col) => {
    if (selectedSquare) {
      const newBoard = [...board];
      const piece = newBoard[selectedSquare.row][selectedSquare.col];
      newBoard[row][col] = piece; // Bewege die Figur
      newBoard[selectedSquare.row][selectedSquare.col] = null; // Leeres Feld
      setBoard(newBoard);
      setSelectedSquare(null); // Zurücksetzen der Auswahl
    } else {
      setSelectedSquare({row, col});
    }
  };

  const renderSquare = (piece, row, col) => {
    const isBlack = (row + col) % 2 === 1;
    const backgroundColor = isBlack ? '#769656' : '#eeeed2'; //green and yellow

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[styles.square, {backgroundColor}]}
        onPress={() => onSquarePress(row, col)}>
        {piece &&
          React.createElement(pieceImages[piece.color + piece.type], {
            width: 30,
            height: 30,
          })}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.board}>
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => renderSquare(piece, rowIndex, colIndex)),
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 320,
    height: 320,
  },
  square: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChessGame;
