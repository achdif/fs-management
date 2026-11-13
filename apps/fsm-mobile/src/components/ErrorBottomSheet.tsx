import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export type ErrorSheetVariant = 'network' | 'generic';

interface ErrorBottomSheetProps {
  visible: boolean;
  variant?: ErrorSheetVariant;
  title?: string;
  message?: string;
  errorCode?: string | null;
  retryLabel?: string;
  cancelLabel?: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

const VARIANT_DEFAULTS: Record<
  ErrorSheetVariant,
  {title: string; icon: string; iconBg: string; iconColor: string}
> = {
  network: {
    title: 'No Internet Connection',
    icon: '📶',
    iconBg: '#FF9900',
    iconColor: '#FFFFFF',
  },
  generic: {
    title: 'Something went wrong',
    icon: '✕',
    iconBg: '#FF4D4D',
    iconColor: '#FFFFFF',
  },
};

const ErrorBottomSheet = ({
  visible,
  variant = 'generic',
  title,
  message,
  errorCode,
  retryLabel = 'Retry',
  cancelLabel = 'Cancel',
  onRetry,
  onCancel,
}: ErrorBottomSheetProps) => {
  const translateY = useRef(new Animated.Value(400)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const defaults = VARIANT_DEFAULTS[variant];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      translateY.setValue(400);
      backdropOpacity.setValue(0);
    }
  }, [visible, translateY, backdropOpacity]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onCancel}>
          <Animated.View
            style={[styles.backdrop, {opacity: backdropOpacity}]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.sheet, {transform: [{translateY}]}]}>
          <View style={styles.handleBar} />

          <View style={[styles.iconCircle, {backgroundColor: defaults.iconBg}]}>
            <Text style={[styles.iconText, {color: defaults.iconColor}]}>
              {defaults.icon}
            </Text>
          </View>

          <Text style={styles.title}>{title ?? defaults.title}</Text>

          {message ? <Text style={styles.message}>{message}</Text> : null}

          {errorCode ? (
            <View style={styles.codeChip}>
              <Text style={styles.codeText}>{errorCode}</Text>
            </View>
          ) : null}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={onRetry}
              activeOpacity={0.8}>
              <Text style={styles.retryText}>{retryLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.8}>
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    minHeight: 280,
  },
  handleBar: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D9D9E5',
    marginBottom: 20,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    fontWeight: '400',
    color: '#808080',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  codeChip: {
    alignSelf: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F5',
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  retryButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#3B82F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4D4D4D',
  },
});

export default ErrorBottomSheet;
