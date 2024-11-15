import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const PromotionModal = ({isVisible, onSelectPiece}) => (
  <Modal transparent={true} visible={isVisible} animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Choose a piece</Text>
        {['q', 'r', 'b', 'n'].map(type => (
          <TouchableOpacity
            key={type}
            style={styles.promotionButton}
            onPress={() => onSelectPiece(type)}>
            <Text style={styles.promotionText}>
              {type === 'q'
                ? 'Dame'
                : type === 'r'
                ? 'Turm'
                : type === 'b'
                ? 'Läufer'
                : 'Springer'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 200,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  promotionButton: {
    paddingVertical: 8,
  },
  promotionText: {
    fontSize: 16,
  },
});

export default PromotionModal;
