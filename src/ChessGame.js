import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Chess} from 'chess.js';
import PromotionModal from './PromotionModal';
import CheckmateModal from './CheckmateModal';

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
  const [isCheckmateModalVisible, setCheckmateModalVisible] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);

  const scrollViewRef = useRef();

  useEffect(() => {
    // Scrolle zum Ende, wenn sich der `moveHistory` ändert
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: true});
    }
  }, [moveHistory]);

  const resetBoard = () => {
    const newGame = new Chess();
    setGame(newGame);
    setBoard(newGame.board());
    setCurrentTurn('Weiß');
    setErrorMessage(null);
    setSelectedSquare(null);
    setPromotionSquare(null);
    setPromotionModalVisible(false);
    setCheckmateModalVisible(false);
    setMoveHistory([]);
  };

  const onSquarePress = (row, col) => {
    const adjustedRow = isFlipped ? 7 - row : row;
    const adjustedCol = isFlipped ? 7 - col : col;

    if (selectedSquare) {
      const from = `${String.fromCharCode(97 + selectedSquare.col)}${
        8 - selectedSquare.row
      }`;
      const to = `${String.fromCharCode(97 + adjustedCol)}${8 - adjustedRow}`;

      const piece = game.get(from);

      // Check if it's a pawn promotion scenario
      const isPawnPromotion =
        piece?.type === 'p' &&
        ((piece.color === 'w' &&
          selectedSquare.row === 1 &&
          adjustedRow === 0) ||
          (piece.color === 'b' &&
            selectedSquare.row === 6 &&
            adjustedRow === 7));

      if (isPawnPromotion) {
        setPromotionSquare({from, to});
        setPromotionModalVisible(true);
      } else {
        handleMove({from, to});
      }
      setSelectedSquare(null);
    } else {
      setSelectedSquare({row: adjustedRow, col: adjustedCol});
    }
  };

  const handleMove = (moveOptions, promotion = null) => {
    try {
      const move = game.move({...moveOptions, promotion});

      if (move) {
        setBoard(game.board());
        setErrorMessage(null);
        setCurrentTurn(currentTurn === 'Weiß' ? 'Schwarz' : 'Weiß');

        // setMoveHistory([...moveHistory, move.san]);
        setMoveHistory(prevHistory => {
          const newHistory = [...prevHistory];
          if (currentTurn === 'Weiß') {
            // Neue Runde beginnen
            newHistory.push([move.san]);
          } else {
            // Schwarzen Zug zur aktuellen Runde hinzufügen
            newHistory[newHistory.length - 1].push(move.san);
          }
          return newHistory;
        });

        if (game.isCheckmate()) {
          setCheckmateModalVisible(true);
        }
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

      <CheckmateModal
        isVisible={isCheckmateModalVisible}
        onClose={() => setCheckmateModalVisible(false)}
        currentTurn={currentTurn}
      />

      <Text style={styles.header}>Schachapp</Text>

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

        {/* Notation */}
        <ScrollView style={styles.notationContainer} ref={scrollViewRef}>
          {moveHistory.map((move, index) => (
            <View
              key={index}
              style={[
                styles.notationRow,
                index === moveHistory.length - 1 && styles.lastNotationRow,
              ]}>
              <Text style={styles.roundNumber}>{index + 1}.</Text>
              <Text style={styles.whiteMove}>{move[0]}</Text>
              <Text style={styles.blackMove}>{move[1] || ''}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -20,
    marginTop: -100,
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
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 5,
    paddingBottom: 20,
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
  notationContainer: {
    width: '80%',
    maxHeight: 150,
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  notationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 1,
  },
  lastNotationRow: {
    paddingBottom: 10,
  },
  roundNumber: {
    width: '15%',
    fontSize: 14,
    paddingLeft: 10,
    textAlign: 'right',
  },
  whiteMove: {
    width: '25%',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  blackMove: {
    width: '25%',
    fontSize: 14,
    textAlign: 'center',
    paddingRight: 10,
    fontWeight: 'bold',
  },
});

export default ChessGame;
