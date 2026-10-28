import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { theme } from '../shared/theme';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  errorCode?: string;
  showIcon?: boolean;
  iconName?: string;
  iconColor?: string;
  isNetworkError?: boolean;
  actionButton?: {
    text: string;
    onPress: () => void;
  };
  cancelButton?: {
    text: string;
    onPress: () => void;
  };
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function BottomSheet({
  visible,
  onClose,
  title,
  message,
  errorCode,
  showIcon = false,
  iconName = '✕',
  iconColor = '#ff4d4d',
  isNetworkError = false,
  actionButton,
  cancelButton,
}: BottomSheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleAction = () => {
    handleClose();
    if (actionButton) {
      actionButton.onPress();
    }
  };

  const handleCancel = () => {
    handleClose();
    if (cancelButton) {
      cancelButton.onPress();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleClose}
        />
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {/* Error Icon */}
          {showIcon && (
            <View style={[styles.errorIconBg, isNetworkError && styles.networkIconBg]}>
              <Text style={styles.errorIcon}>{isNetworkError ? '📶' : iconName}</Text>
            </View>
          )}

          {/* Title */}
          {title && <Text style={styles.title}>{title}</Text>}

          {/* Message */}
          {message && <Text style={styles.message}>{message}</Text>}

          {/* Error Code */}
          {errorCode && (
            <View style={styles.errorCodeBg}>
              <Text style={styles.errorCode}>{errorCode}</Text>
            </View>
          )}

          {/* Action Button */}
          {actionButton && cancelButton && (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.halfButton]}
                onPress={handleAction}
              >
                <Text style={styles.actionButtonText}>{actionButton.text}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelButton, styles.halfButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>{cancelButton.text}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Action Button Only */}
          {actionButton && !cancelButton && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleAction}
            >
              <Text style={styles.actionButtonText}>{actionButton.text}</Text>
            </TouchableOpacity>
          )}

          {/* Cancel Button Only */}
          {!actionButton && cancelButton && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>{cancelButton.text}</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 24,
    paddingBottom: 40,
    minHeight: 320,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#d9d9e0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  errorIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff4d4d',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  networkIconBg: {
    backgroundColor: '#ff9900',
  },
  errorIcon: {
    fontSize: 32,
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'left',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#808080',
    textAlign: 'left',
    marginBottom: 16,
    lineHeight: 20,
  },
  errorCodeBg: {
    backgroundColor: '#f2f2f7',
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorCode: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f2f2f7',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4d4d4d',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
});
