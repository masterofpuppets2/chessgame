import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
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
  const [selectedSquare, setSelectedSquare] = useState(null);

  const onSquarePress = (row, col) => {
    if (selectedSquare) {
      const newBoard = [...board];
      const piece = newBoard[selectedSquare.row][selectedSquare.col];
      newBoard[row][col] = piece;
      newBoard[selectedSquare.row][selectedSquare.col] = null;
      setBoard(newBoard);
      setSelectedSquare(null);
    } else {
      setSelectedSquare({row, col});
    }
  };

  const renderSquare = (piece, row, col) => {
    const isBlack = (row + col) % 2 === 1;
    const backgroundColor = isBlack ? '#769656' : '#eeeed2';

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
    <View style={styles.container}>
      {/* Linksseitige Reihenkoordinaten */}
      <View style={styles.rowLabels}>
        {Array.from({length: 8}, (_, index) => (
          <Text key={index} style={styles.labelText}>
            {8 - index}
          </Text>
        ))}
      </View>

      {/* Schachbrett und Spaltenkoordinaten */}
      <View>
        <View style={styles.board}>
          {board.map((row, rowIndex) =>
            row.map((piece, colIndex) =>
              renderSquare(piece, rowIndex, colIndex),
            ),
          )}
        </View>
        {/* Untere Spaltenkoordinaten */}
        <View style={styles.columnLabels}>
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((label, index) => (
            <Text key={index} style={styles.labelText}>
              {label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -20, // Verschiebt das gesamte Schachbrett nach links
  },
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
  rowLabels: {
    justifyContent: 'space-between',
    height: 320,
    paddingBottom: 22, // Verschiebt die Zahlen leicht nach oben
    paddingRight: 4, // Abstand zum Schachbrett
  },
  columnLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  labelText: {
    fontSize: 16,
    fontWeight: 'bold', // Fettgedruckt
    textAlign: 'center',
    width: 40,
  },
});

export default ChessGame;
