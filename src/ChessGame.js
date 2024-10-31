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
import PieceSetModal from './PieceSetModal';
import {pieceSets} from './pieceSets';

const pieceSetOptions = ['alpha', 'cburnett', 'chessnut', 'fresca'];

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
  const [pieceSet, setPieceSet] = useState('alpha');
  const [isPieceSetModalVisible, setPieceSetModalVisible] = useState(false);
  const [moveIndex, setMoveIndex] = useState(0);

  const scrollViewRef = useRef();

  useEffect(() => {
    // Scrolle zum Ende, wenn sich der `moveHistory` ändert
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: true});
    }
  }, [moveHistory]);

  useEffect(() => {
    const tempGame = new Chess();
    // Zeige nur die Züge bis zum aktuellen moveIndex an
    moveHistory.slice(0, moveIndex).forEach(moveSan => {
      tempGame.move(moveSan);
    });
    setBoard(tempGame.board());
  }, [moveIndex, moveHistory]);

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
    setMoveIndex(0);
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
        // setGame(new Chess(game.fen())); // Speichert das Spiel in den Zustand
        setBoard(game.board());
        setErrorMessage(null);
        setCurrentTurn(currentTurn === 'Weiß' ? 'Schwarz' : 'Weiß');
        setMoveHistory(prevHistory => [...prevHistory, move.san]);
        setMoveIndex(moveHistory.length + 1);

        if (game.isCheckmate()) {
          setCheckmateModalVisible(true);
        }
      }
    } catch (error) {
      setErrorMessage('Illegaler Zug');
      setSelectedSquare(null);
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
          React.createElement(pieceSets[pieceSet][piece.color + piece.type], {
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

  const openPieceSetModal = () => setPieceSetModalVisible(true);

  const onSelectSet = set => {
    setPieceSet(set);
  };

  const goToPreviousMove = () => {
    setMoveIndex(prevIndex => Math.max(0, prevIndex - 1));
  };

  const goToNextMove = () => {
    setMoveIndex(prevIndex => Math.min(moveHistory.length, prevIndex + 1));
  };

  const jumpToMove = index => {
    setMoveIndex(index + 1);
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

      <PieceSetModal
        isVisible={isPieceSetModalVisible}
        onClose={() => setPieceSetModalVisible(false)}
        onSelectSet={onSelectSet}
        pieceSetOptions={pieceSetOptions}
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

      <View style={styles.historyControls}>
        <TouchableOpacity
          onPress={goToPreviousMove}
          style={[styles.iconButton, styles.marginRight]}>
          <Icon name="arrow-back" size={30} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={goToNextMove} style={styles.iconButton}>
          <Icon name="arrow-forward" size={30} color="#333" />
        </TouchableOpacity>
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

        <TouchableOpacity onPress={openPieceSetModal} style={styles.iconButton}>
          <Icon name="style" size={30} color="#333" />
        </TouchableOpacity>

        <Text style={styles.turnText}>{currentTurn} am Zug</Text>

        {errorMessage && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}

        {/* Notation */}
        <ScrollView style={styles.notationContainer} ref={scrollViewRef}>
          {moveHistory
            .reduce((acc, move, index) => {
              if (index % 2 === 0) {
                // Group white and black moves in the same round
                acc.push({
                  round: Math.floor(index / 2) + 1,
                  whiteMove: move,
                  whiteIndex: index,
                  blackMove: moveHistory[index + 1] || null,
                  blackIndex: index + 1,
                });
              }
              return acc;
            }, [])
            .map((roundMove, index) => (
              <View
                key={index}
                style={[
                  styles.notationRow,
                  index * 2 === moveHistory.length - 1 &&
                    styles.lastNotationRow,
                ]}>
                <Text style={styles.roundNumber}>{roundMove.round}.</Text>

                {/* White move */}
                <TouchableOpacity
                  onPress={() => jumpToMove(roundMove.whiteIndex)}>
                  <Text style={styles.whiteMove}>{roundMove.whiteMove}</Text>
                </TouchableOpacity>

                {/* Black move, only if it exists */}
                {roundMove.blackMove && (
                  <TouchableOpacity
                    onPress={() => jumpToMove(roundMove.blackIndex)}>
                    <Text style={styles.blackMove}>{roundMove.blackMove}</Text>
                  </TouchableOpacity>
                )}
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
  },
  historyControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  marginRight: {
    marginRight: 15,
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
    justifyContent: 'flex-start',
    paddingVertical: 1,
  },
  lastNotationRow: {
    paddingBottom: 10,
  },
  roundNumber: {
    width: 30,
    fontSize: 14,
    paddingRight: 10,
    textAlign: 'right',
  },
  whiteMove: {
    width: 60,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    paddingRight: 10,
  },
  blackMove: {
    width: 60,
    fontSize: 14,
    paddingRight: 10,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});

export default ChessGame;
