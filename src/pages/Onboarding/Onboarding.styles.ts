import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

export default StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: { alignItems: 'center', marginBottom: 28 },
  logoutButton: {
    position: 'absolute',
    right: 20,
    top: 0,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  logoutText: {
    color: COLORS.mutedForeground,
    fontSize: 13,
    fontFamily: 'Inter',
    letterSpacing: 0.2,
  },

  // ─── Step indicator ───────────────────────────────────────────
  stepRow: { flexDirection: 'row', gap: 8 },
  stepDot: { height: 6, borderRadius: 3 },
  stepDotActive: { width: 24, backgroundColor: COLORS.primary },
  stepDotInactive: { width: 8, backgroundColor: COLORS.border },

  // ─── Section header ───────────────────────────────────────────
  sectionHeader: { marginBottom: 20, alignItems: 'center' },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'Space Grotesk',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.cardForeground,
    fontFamily: 'Inter',
    textAlign: 'center',
    lineHeight: 22,
  },

  // ─── Card & labels ────────────────────────────────────────────
  stepContent: { width: '100%' },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    color: COLORS.mutedForeground,
    fontSize: 13,
    fontFamily: 'Inter',
    marginBottom: 6,
    marginTop: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // ─── Field error (displayed below each input) ─────────────────
  fieldError: {
    color: COLORS.destructive,
    fontSize: 12,
    fontFamily: 'Inter',
    marginTop: 4,
    marginBottom: 2,
    marginLeft: 2,
  },
  inputError: {
    borderColor: COLORS.destructive,
  },

  // ─── Unit toggle ──────────────────────────────────────────────
  unitToggleRow: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 4,
  },
  unitToggleBtn: {
    paddingVertical: 7,
    paddingHorizontal: 20,
    backgroundColor: COLORS.card,
  },
  unitToggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  unitToggleText: {
    color: COLORS.mutedForeground,
    fontSize: 13,
    fontFamily: 'Inter',
    fontWeight: '600',
  },
  unitToggleTextActive: {
    color: COLORS.primaryForeground,
  },

  // ─── Gender chips ─────────────────────────────────────────────
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.secondary,
    gap: 6,
  },
  chipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '22',
  },
  // Fixed size — no changes on selection to prevent vertical misalignment
  chipEmoji: {
    fontSize: 16,
    lineHeight: 20,
  },
  chipText: {
    color: COLORS.mutedForeground,
    fontSize: 14,
    fontFamily: 'Inter',
    fontWeight: '500',
    lineHeight: 20,
  },
  chipTextSelected: {
    color: COLORS.primaryForeground,
    fontWeight: '700',
  },

  // ─── Goal / Activity cards ────────────────────────────────────
  goalColumn: { gap: 12, marginBottom: 8 },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    gap: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 1,
  },
  goalCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '18' },
  goalEmoji: { fontSize: 26, width: 36, textAlign: 'center', color: COLORS.mutedForeground },
  goalEmojiSelected: { color: COLORS.primaryForeground, fontSize: 32 },
  goalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.cardForeground,
    fontFamily: 'Space Grotesk',
    marginBottom: 2,
  },
  goalLabelSelected: { color: COLORS.primaryForeground, fontSize: 20, fontWeight: '700' },
  goalDescription: { fontSize: 13, color: COLORS.primaryForeground, fontFamily: 'Inter', lineHeight: 18 },
  goalTextBlock: { flex: 1, justifyContent: 'center', minWidth: 120 },
  goalRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border },
  goalRadioSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },

  // ─── Navigation ───────────────────────────────────────────────
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  backPlaceholder: { flex: 1 },
  backButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
  },
  backButtonText: { color: COLORS.cardForeground, fontSize: 15, fontFamily: 'Inter', fontWeight: '600' },
  nextButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  nextButtonText: {
    color: COLORS.primaryForeground,
    fontSize: 16,
    fontFamily: 'Space Grotesk',
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
