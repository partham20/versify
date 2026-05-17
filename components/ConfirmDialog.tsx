import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts, radius } from "../theme";

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <Pressable onPress={onCancel} style={styles.scrim}>
        <Pressable onPress={(e) => e.stopPropagation()} style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <Pressable
              onPress={onCancel}
              disabled={busy}
              style={[styles.cancelBtn, busy && { opacity: 0.5 }]}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={busy}
              style={[
                styles.confirmBtn,
                destructive ? styles.confirmBtnDestructive : styles.confirmBtnPrimary,
                busy && { opacity: 0.6 },
              ]}
            >
              <Text
                style={[
                  styles.confirmText,
                  destructive ? styles.confirmTextDestructive : styles.confirmTextPrimary,
                ]}
              >
                {busy ? "Working…" : confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#1f1f1f",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 24,
  },
  title: {
    fontFamily: fonts.headlineRegular,
    fontSize: 22,
    color: colors.white,
    marginBottom: 10,
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.onSurfaceVariant,
    marginBottom: 24,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
  },
  cancelText: {
    color: colors.white,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  confirmBtn: {
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 999,
  },
  confirmBtnPrimary: { backgroundColor: colors.primary },
  confirmBtnDestructive: { backgroundColor: colors.error },
  confirmText: { fontFamily: fonts.bodyBold, fontSize: 13 },
  confirmTextPrimary: { color: colors.onPrimary },
  confirmTextDestructive: { color: colors.white },
});
