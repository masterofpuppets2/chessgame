import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const PieceSetModal = ({isVisible, onClose, onSelectSet, pieceSetOptions}) => {
  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Wähle ein Figurenset</Text>
        {pieceSetOptions.map(set => (
          <TouchableOpacity
            key={set}
            onPress={() => {
              onSelectSet(set);
              onClose();
            }}
            style={styles.modalOption}>
            <Text style={styles.modalOptionText}>
              {set.charAt(0).toUpperCase() + set.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Schließen</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  modalOption: {
    padding: 10,
    backgroundColor: '#ffffff',
    marginVertical: 5,
    borderRadius: 5,
    width: 150,
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f00',
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default PieceSetModal;
