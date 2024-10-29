import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Chess} from 'chess.js';
import PromotionModal from './PromotionModal';

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
  const [game, setGame] = useState(new Chess());
  const [board, setBoard] = useState(game.board());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [promotionSquare, setPromotionSquare] = useState(null);
  const [isPromotionModalVisible, setPromotionModalVisible] = useState(false);
  const [currentTurn, setCurrentTurn] = useState('Weiß');

  const resetBoard = () => {
    const newGame = new Chess();
    setGame(newGame);
    setBoard(newGame.board());
    setCurrentTurn('Weiß');
    setErrorMessage(null);
    setSelectedSquare(null);
    setPromotionSquare(null);
    setPromotionModalVisible(false);
  };

  const onSquarePress = (row, col) => {
    const adjustedRow = isFlipped ? 7 - row : row;
    const adjustedCol = isFlipped ? 7 - col : col;

    try {
      if (selectedSquare) {
        const from = `${String.fromCharCode(97 + selectedSquare.col)}${
          8 - selectedSquare.row
        }`;
        const to = `${String.fromCharCode(97 + adjustedCol)}${8 - adjustedRow}`;

        const moveOptions = {from, to};

        // Check if it's a pawn promotion scenario
        const piece = game.get(from);
        const isPawnPromotion =
          piece?.type === 'p' && (adjustedRow === 0 || adjustedRow === 7);

        if (isPawnPromotion && game.move(moveOptions)) {
          setPromotionSquare({from, to});
          setPromotionModalVisible(true);
        } else {
          handleMove(moveOptions);
        }
        setSelectedSquare(null);
      } else {
        setSelectedSquare({row: adjustedRow, col: adjustedCol});
      }
    } catch (error) {
      setErrorMessage('Illegaler Zug');
    }
  };

  const handleMove = (moveOptions, promotion = null) => {
    try {
      if (game.move({...moveOptions, promotion})) {
        setBoard(game.board());
        setErrorMessage(null);
        setCurrentTurn(currentTurn === 'Weiß' ? 'Schwarz' : 'Weiß');
      }
    } catch (error) {
      setErrorMessage('Illegaler Zug');
    }
  };

  const onSelectPromotion = type => {
    handleMove(promotionSquare, type);
    setPromotionSquare(null);
    setPromotionModalVisible(false);
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

  const renderBoard = () => {
    const displayBoard = isFlipped
      ? [...board].map(row => [...row].reverse()).reverse()
      : board;

    return displayBoard.map((row, rowIndex) =>
      row.map((piece, colIndex) => renderSquare(piece, rowIndex, colIndex)),
    );
  };

  return (
    <View style={styles.container}>
      <PromotionModal
        isVisible={isPromotionModalVisible}
        onSelectPiece={onSelectPromotion}
      />

      <View style={styles.boardContainer}>
        <View style={styles.rowLabels}>
          {Array.from({length: 8}, (_, index) => (
            <Text key={index} style={styles.labelText}>
              {isFlipped ? index + 1 : 8 - index}
            </Text>
          ))}
        </View>

        <View>
          <View style={styles.board}>{renderBoard()}</View>
          <View style={styles.columnLabels}>
            {(isFlipped
              ? ['H', 'G', 'F', 'E', 'D', 'C', 'B', 'A']
              : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
            ).map((label, index) => (
              <Text key={index} style={styles.labelText}>
                {label}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View>
        <TouchableOpacity onPress={resetBoard} style={styles.iconButton}>
          <Icon name="replay" size={30} color="#333" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsFlipped(!isFlipped)}
          style={styles.flipIcon}>
          <Icon name="swap-vert" size={30} color="#333" />
          {/* autorenew */}
        </TouchableOpacity>

        <Text style={styles.turnText}>{currentTurn} am Zug</Text>
        {errorMessage && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -20,
  },
  boardContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  turnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    paddingTop: 5,
  },
  errorMessage: {
    color: 'red',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 5,
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
    height: 330,
    paddingRight: 4,
    paddingBottom: 30,
  },
  columnLabels: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingTop: 8,
  },
  labelText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 40,
  },
  flipIcon: {
    alignItems: 'center',
    marginTop: 8,
  },
  iconButton: {
    alignItems: 'center',
    marginTop: 16,
  },
});

export default ChessGame;
