import React, {useState, useRef, useEffect, useMemo} from 'react';
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
import ResultModal from './ResultModal';
import PieceSetModal from './PieceSetModal';
import {pieceSets} from './pieceSets';
import {observer} from 'mobx-react-lite';
import SetupModal from './SetupModal';
import chessStore from './ChessStore';
import {autorun} from 'mobx';
import chessStore from './ChessStore';
import {NativeModules} from 'react-native';
const {Stockfish} = NativeModules;

const pieceSetOptions = ['alpha', 'cburnett', 'chessnut', 'fresca'];

const ChessGame = observer(() => {
  const [game, setGame] = useState(new Chess());
  const [board, setBoard] = useState(game.board());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [promotionSquare, setPromotionSquare] = useState(null);
  const [isPromotionModalVisible, setPromotionModalVisible] = useState(false);
  const [isResultModalVisible, setResultModalVisible] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const [pieceSet, setPieceSet] = useState('alpha');
  const [isPieceSetModalVisible, setPieceSetModalVisible] = useState(false);
  const [, setMoveIndex] = useState(0);
  const [result, setResult] = useState('');

  // MobX autorun verwenden, um auf FEN-Änderungen zu reagieren
  useEffect(() => {
    const dispose = autorun(() => {
      const newFEN = chessStore.fen;
      const newGame = new Chess(newFEN);
      setGame(newGame);
      setBoard(newGame.board());
      setErrorMessage(null);
      setSelectedSquare(null);
      setPromotionSquare(null);
      setPromotionModalVisible(false);
      setResultModalVisible(false);
      setMoveHistory([]);
      setMoveIndex(0);
    });
    // Cleanup Funktion: autorun aufräumen, wenn die Komponente unmountet
    return () => dispose();
  }, []); // Leeres Array sorgt dafür, dass der Effekt nur einmal beim ersten Rendern ausgeführt wird

  const scrollViewRef = useRef();

  useEffect(() => {
    // Scrolle zum Ende, wenn sich der `moveHistory` ändert
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: true});
    }
  }, [moveHistory]);

  const updateBoard = index => {
    const tempGame = new Chess(chessStore.fen);
    moveHistory.slice(0, index).forEach(moveSan => {
      tempGame.move(moveSan);
    });
    setBoard(tempGame.board());
  };

  const resetBoard = () => {
    chessStore.setFEN(undefined);
    const newGame = new Chess();
    setGame(newGame);
    setBoard(newGame.board());
    setErrorMessage(null);
    setSelectedSquare(null);
    setPromotionSquare(null);
    setPromotionModalVisible(false);
    setResultModalVisible(false);
    setMoveHistory([]);
    setMoveIndex(0);
    chessStore.setIsBlacksFirstMove(false);
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

  const [, setBestMove] = useState(null);
  const [, setEngineStatus] = useState('Engine not started');

  useEffect(() => {
    // Starte die Engine beim ersten Laden der Komponente
    startStockfishEngine();

    // Cleanup bei der Entmontage der Komponente
    return () => {
      stopStockfishEngine();
    };
  }, []);

  const startStockfishEngine = () => {
    Stockfish.startEngine()
      .then(() => {
        setEngineStatus('Stockfish started');
        console.log('Stockfish gestartet');
      })
      .catch(err => {
        console.error('Fehler beim Starten:', err);
        setEngineStatus('Fehler beim Starten der Engine');
      });
  };

  const stopStockfishEngine = () => {
    Stockfish.stopEngine()
      .then(() => {
        setEngineStatus('Stockfish stopped');
        console.log('Stockfish gestoppt');
      })
      .catch(err => {
        console.error('Fehler beim Stoppen:', err);
        setEngineStatus('Fehler beim Stoppen der Engine');
      });
  };

  const sendStockfishCommand = command => {
    Stockfish.sendCommand(command)
      .then(() => {
        console.log(`Befehl gesendet: ${command}`);
        readStockfishOutput();
      })
      .catch(err => {
        console.error('Fehler beim Senden des Befehls:', err);
      });
  };

  const readStockfishOutput = () => {
    Stockfish.readOutput()
      .then(output => {
        console.log('Stockfish Ausgabe:', output);
        if (output.startsWith('bestmove')) {
          const bestMove = output.split(' ')[1];
          setBestMove(bestMove);
          console.log('Bester Zug:', bestMove);
        }
      })
      .catch(err => {
        console.error('Fehler beim Auslesen der Ausgabe:', err);
      });
  };

  const handleMove = (moveOptions, promotion = null) => {
    try {
      const move = game.move({...moveOptions, promotion});

      if (move) {
        setBoard(game.board());
        setErrorMessage(null);
        setMoveHistory(prevHistory => [...prevHistory, move.san]);
        setMoveIndex(moveHistory.length + 1);

        sendStockfishCommand(`position fen ${game.fen}`);
        sendStockfishCommand('go depth 15');

        if (game.isCheckmate()) {
          setResult(
            `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} has won.`,
          );
          setResultModalVisible(true);
        }

        if (game.isDraw()) {
          let reason = '';
          if (game.isInsufficientMaterial()) {
            reason = 'Insufficient Material';
          } else if (game.isThreefoldRepetition()) {
            reason = 'Threefold Repetition';
          } else if (game.isStalemate()) {
            reason = 'Stalemate';
          } else {
            reason = '50 moves rule';
          }

          setResult(`Remis through ${reason}`);
          setResultModalVisible(true);
        }
      }
    } catch (error) {
      setErrorMessage('Invalid move');
      setSelectedSquare(null);
    }
  };

  //correct moveHistory, when blacks first move
  const notationMoveHistory = useMemo(() => {
    const tempMoveHistory = chessStore.isBlacksFirstMove
      ? ['...'].concat(moveHistory)
      : moveHistory;

    return tempMoveHistory.reduce((acc, move, index) => {
      if (index % 2 === 0) {
        acc.push({
          round: Math.floor(index / 2) + 1,
          whiteMove: move,
          whiteIndex: index,
          blackMove: tempMoveHistory[index + 1] || null,
          blackIndex: index + 1,
        });
      }
      return acc;
    }, []);
  }, [moveHistory]);

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

  const displayBoard = useMemo(() => {
    if (isFlipped) {
      return [...board].map(row => [...row].reverse()).reverse();
    }
    return board;
  }, [board, isFlipped]);

  const renderBoard = () => {
    return displayBoard.map((row, rowIndex) =>
      row.map((piece, colIndex) => renderSquare(piece, rowIndex, colIndex)),
    );
  };

  const openPieceSetModal = () => setPieceSetModalVisible(true);

  const onSelectSet = set => {
    setPieceSet(set);
  };

  const goToPreviousMove = () => {
    setMoveIndex(prevIndex => {
      const newIndex = Math.max(0, prevIndex - 1);
      updateBoard(newIndex);
      return newIndex;
    });
  };

  const goToNextMove = () => {
    setMoveIndex(prevIndex => {
      const newIndex = Math.min(moveHistory.length, prevIndex + 1);
      updateBoard(newIndex);
      return newIndex;
    });
  };

  const jumpToMove = index => {
    setMoveIndex(index + 1);
    updateBoard(index + 1);
  };

  const [isSetupModalVisible, setSetupModalVisible] = useState(false);

  // Funktion zum Öffnen des Modals
  const openSetupModal = () => {
    setSetupModalVisible(true);
    chessStore.setFEN(game.fen()); //current fen, when going to SetupModal
  };

  const rowLabels = useMemo(() => {
    return Array.from({length: 8}, (_, index) =>
      isFlipped ? index + 1 : 8 - index,
    );
  }, [isFlipped]);

  const columnLabels = useMemo(() => {
    return isFlipped
      ? ['H', 'G', 'F', 'E', 'D', 'C', 'B', 'A']
      : ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  }, [isFlipped]);

  return (
    <View style={styles.container}>
      <PromotionModal
        isVisible={isPromotionModalVisible}
        onSelectPiece={onSelectPromotion}
      />

      <ResultModal
        isVisible={isResultModalVisible}
        onClose={() => setResultModalVisible(false)}
        result={result}
      />

      <PieceSetModal
        isVisible={isPieceSetModalVisible}
        onClose={() => setPieceSetModalVisible(false)}
        onSelectSet={onSelectSet}
        pieceSetOptions={pieceSetOptions}
      />

      <View style={styles.boardContainer}>
        {/* Row Labels */}
        <View style={styles.rowLabels}>
          {rowLabels.map((label, index) => (
            <Text key={index} style={styles.labelText}>
              {label}
            </Text>
          ))}
        </View>

        {/* Board */}
        <View>
          <View style={styles.board}>{renderBoard()}</View>

          {/* Column Labels */}
          <View style={styles.columnLabels}>
            {columnLabels.map((label, index) => (
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
        <View style={styles.iconRow}>
          <TouchableOpacity onPress={resetBoard} style={styles.iconButton}>
            <Icon name="replay" size={30} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsFlipped(!isFlipped)}
            style={styles.iconButton}>
            <Icon name="swap-vert" size={30} color="#333" />
            {/* autorenew */}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={openPieceSetModal}
            style={styles.iconButton}>
            <Icon name="style" size={30} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity onPress={openSetupModal} style={styles.iconButton}>
            <Icon name="edit" size={30} color="#333" />
          </TouchableOpacity>

          <SetupModal
            isVisible={isSetupModalVisible}
            onClose={() => setSetupModalVisible(false)}
            currentPieceSet={pieceSet}
          />
        </View>

        <TouchableOpacity onPress={() => sendStockfishCommand('go depth 20')}>
          <Text>Start Stockfish Analysis</Text>
        </TouchableOpacity>

        <Text style={styles.turnText}>
          {game.turn() === 'w' ? 'White' : 'Black'} to move
        </Text>

        {errorMessage && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}

        {/* Notation */}
        <ScrollView
          style={styles.notationContainer}
          contentContainerStyle={styles.lastNotationRow}
          ref={scrollViewRef}>
          {notationMoveHistory.map((roundMove, index) => (
            <View key={index} style={styles.notationRow}>
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
                  <Text style={styles.blackMove}>{roundMove.blackMove} </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
});

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
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  iconButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  notationContainer: {
    width: '80%',
    maxHeight: 170,
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  lastNotationRow: {
    paddingBottom: 20,
  },
  notationRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingVertical: 1,
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
