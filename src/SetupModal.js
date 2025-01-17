import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import {pieceSets} from './pieceSets';
import {Chess} from 'chess.js';
import {observer} from 'mobx-react-lite';
import chessStore from './ChessStore';
import {RadioButton} from 'react-native-paper';

const boardSize = 8; // 8x8 chessboard

const SetupModal = observer(({isVisible, onClose, currentPieceSet}) => {
  const [selectedPieceSet, setSelectedPieceSet] = useState(currentPieceSet);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [board, setBoard] = useState(
    Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill(null)),
  ); // Initialize the board

  const [turn, setTurn] = useState('White');

  useEffect(() => {
    setSelectedPieceSet(currentPieceSet); // Synchronize with the current set
  }, [currentPieceSet]);

  const handlePieceSelect = (color, type) => {
    const pieceKey = `${color}${type}`;
    setSelectedPiece(pieceKey); // Set selected piece
  };

  const handleSquarePress = (row, col) => {
    setBoard(prevBoard => {
      const newBoard = [...prevBoard];

      // Wenn bereits eine Figur auf dem Feld steht, entferne sie
      if (newBoard[row][col]) {
        newBoard[row][col] = null;
      }

      // Wenn eine Figur ausgewählt wurde, platziere sie auf dem Feld
      if (selectedPiece) {
        newBoard[row][col] = selectedPiece;
      }

      return newBoard;
    });

    // Setze die Auswahl nach dem Setzen der Figur zurück
    setSelectedPiece(null);
  };

  const resetBoard = () => {
    // Reset the board to its initial state
    setBoard(
      Array(boardSize)
        .fill(null)
        .map(() => Array(boardSize).fill(null)),
    );
    setSelectedPiece(null); // Clear selected piece
  };

  const validateBoard = () => {
    let whiteKings = 0;
    let blackKings = 0;

    // Count kings
    for (let row of board) {
      for (let square of row) {
        if (square === 'wk') {
          whiteKings++;
        }
        if (square === 'bk') {
          blackKings++;
        }
      }
    }

    // Validate the number of kings
    if (whiteKings > 1) {
      Alert.alert('Invalid position', 'There can only be one white king.');
      return false;
    }
    if (blackKings > 1) {
      Alert.alert('Invalid position', 'There can only be one black king.');
      return false;
    }
    if (whiteKings === 0) {
      Alert.alert('Invalid position', 'There must be at least one white king.');
      return false;
    }
    if (blackKings === 0) {
      Alert.alert('Invalid position', 'There must be at least one black king.');
      return false;
    }

    return true; // Valid board
  };

  const handleApplyCustomPosition = () => {
    if (validateBoard()) {
      const newGame = new Chess();
      newGame.clear(); // Clear the board completely

      board.forEach((row, rowIndex) => {
        row.forEach((square, colIndex) => {
          if (square) {
            const piece =
              square[0] === 'w'
                ? square[1].toUpperCase() // For white pieces: A, B, C, D...
                : square[1].toLowerCase(); // For black pieces: a, b, c, d...
            const position =
              String.fromCharCode(97 + colIndex) + (8 - rowIndex); // Convert index to chess notation
            newGame.put(
              {type: piece, color: square[0] === 'w' ? 'w' : 'b'},
              position,
            );
          }
        });
      });

      let newFEN = newGame.fen(); // Generate the FEN string
      const fenParts = newFEN.split(' ');

      // Update FEN to include the correct turn
      fenParts[1] = turn === 'White' ? 'w' : 'b';
      newFEN = fenParts.join(' ');

      // Validate FEN before setting it
      const isValid = newGame.load(newFEN);
      if (isValid === undefined) {
        chessStore.setFEN(newFEN);
        onClose();
      } else {
        console.error('Error: Invalid FEN string:', newFEN);
        Alert.alert(
          'Error loading the position',
          'The generated FEN string is invalid.',
        );
      }
    }
  };

  const renderBoard = () => {
    return (
      <View style={styles.board}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.boardRow}>
            {row.map((square, colIndex) => (
              <TouchableOpacity
                key={`${rowIndex}-${colIndex}`}
                style={[
                  styles.boardSquare,
                  (rowIndex + colIndex) % 2 === 1
                    ? styles.blackSquare
                    : styles.whiteSquare,
                ]}
                onPress={() => handleSquarePress(rowIndex, colIndex)}>
                {square &&
                  // Render the piece on the square if it exists
                  React.createElement(pieceSets[selectedPieceSet]?.[square], {
                    width: 30,
                    height: 30,
                  })}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderPieceOptions = () => {
    const pieces = [
      {color: 'w', type: 'k'},
      {color: 'w', type: 'q'},
      {color: 'w', type: 'r'},
      {color: 'w', type: 'b'},
      {color: 'w', type: 'n'},
      {color: 'w', type: 'p'},
      {color: 'b', type: 'k'},
      {color: 'b', type: 'q'},
      {color: 'b', type: 'r'},
      {color: 'b', type: 'b'},
      {color: 'b', type: 'n'},
      {color: 'b', type: 'p'},
    ];

    return (
      <View style={styles.pieceOptionsContainer}>
        {pieces.map(piece => {
          const pieceKey = `${piece.color}${piece.type}`;
          const PieceComponent = pieceSets[selectedPieceSet]?.[pieceKey];

          return (
            <TouchableOpacity
              key={pieceKey}
              onPress={() => handlePieceSelect(piece.color, piece.type)}
              style={styles.pieceOption}>
              <View style={styles.pieceSquare}>
                {PieceComponent ? (
                  React.createElement(PieceComponent, {
                    width: 30,
                    height: 30,
                  })
                ) : (
                  <Text>Piece not available</Text>
                )}
                {selectedPiece === pieceKey && (
                  <Text style={styles.selectedText}>✔</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const handleTurnChange = value => {
    setTurn(value);
    if (value === 'Black') {
      chessStore.setIsBlacksFirstMove(true);
    } else {
      chessStore.setIsBlacksFirstMove(false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Choose a set of pieces</Text>
          {renderBoard()}
          {renderPieceOptions()}

          <View style={styles.turnSelection}>
            {/* <View style={styles.radioGroup}> */}
            <Text>Side to move:</Text>
            <RadioButton
              value="White"
              status={turn === 'White' ? 'checked' : 'unchecked'}
              onPress={() => handleTurnChange('White')}
            />
            <Text>White</Text>
            <RadioButton
              value="Black"
              status={turn === 'Black' ? 'checked' : 'unchecked'}
              onPress={() => handleTurnChange('Black')}
            />
            <Text>Black</Text>
            {/* </View> */}
          </View>

          <TouchableOpacity
            onPress={handleApplyCustomPosition}
            style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={resetBoard} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  turnSelection: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  board: {
    flexDirection: 'column',
    marginBottom: 20,
    width: 320,
    height: 320,
  },
  boardRow: {
    flexDirection: 'row',
  },
  boardSquare: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whiteSquare: {
    backgroundColor: '#eeeed2',
  },
  blackSquare: {
    backgroundColor: '#769656',
  },
  pieceOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pieceOption: {
    margin: 2,
    alignItems: 'center',
  },
  pieceSquare: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: 'green',
    fontSize: 16,
  },
  closeButton: {
    marginVertical: 10,
  },
  closeButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  applyButton: {
    marginVertical: 10,
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  resetButton: {
    marginVertical: 10,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SetupModal;
