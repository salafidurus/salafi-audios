import { useAudio, useQueue } from "@sd/domain-audio";
import { useFormattedScholarName } from "@sd/domain-content";
import { Image } from "expo-image";
import { BookOpen, ChevronDown, Music, Pause, Play } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { SanadChain } from "@/shared/components/SanadChain";

import { audioService } from "../audio-service";
import { PlaybackControls } from "./playback-controls";
import { ProgressBar } from "./progress-bar";

export type MiniPlayerProps = {
  embedded?: boolean;
};

export function MiniPlayer({ embedded = false }: MiniPlayerProps) {
  const { currentTrack, isPlaying, isLoading, progressPercent, positionSeconds } = useAudio();
  const { queueLength, currentIndex } = useQueue();
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const displayArtist = useFormattedScholarName(currentTrack?.artist, currentTrack?.scholarSlug);

  if (!currentTrack) return null;

  const handlePlayPause = () => {
    if (isPlaying) {
      audioService.pause();
    } else {
      audioService.resume();
    }
  };

  const strong = theme.colors.content.strong;
  const PauseIcon = <Pause size={20} color={strong} fill={strong} />;
  const PlayIcon = <Play size={20} color={strong} fill={strong} />;
  const ChevronDownIcon = <ChevronDown size={22} color={strong} />;

  const lessonNum = currentIndex >= 0 ? currentIndex + 1 : 1;
  const totalLessons = queueLength > 0 ? queueLength : 1;

  return (
    <>
      <Pressable
        onPress={() => setModalVisible(true)}
        style={[
          embedded ? styles.containerEmbedded : styles.container,
          !embedded && { bottom: insets.bottom + 8 },
        ]}
      >
        {/* Progress Bar underlaid at the very top of mini-player */}
        <View style={styles.miniProgressTrack}>
          <View style={[styles.miniProgressFill, { width: `${progressPercent}%` }]} />
        </View>

        <View style={styles.content}>
          {currentTrack.artworkUrl ? (
            <Image source={{ uri: currentTrack.artworkUrl }} style={styles.artwork} />
          ) : (
            <View style={[styles.artwork, styles.artworkPlaceholder]}>
              <Music size={20} color={theme.colors.content.muted} />
            </View>
          )}

          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {displayArtist}
            </Text>
          </View>

          <Pressable onPress={handlePlayPause} style={styles.playButton} testID="play-button">
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.content.strong} />
            ) : isPlaying ? (
              PauseIcon
            ) : (
              <View style={{ marginStart: 2 }}>{PlayIcon}</View>
            )}
          </Pressable>
        </View>
      </Pressable>

      {/* Full Screen Player Modal — matches prototype NowPlayingSheet */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          {/* Header: chevron-down left, centered "NOW PLAYING" label */}
          <View style={[styles.modalHeader, { paddingTop: insets.top }]}>
            <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
              {ChevronDownIcon}
            </Pressable>
            <Text style={styles.modalHeaderTitle}>
              {t("audio.now_playing", "NOW PLAYING").toUpperCase()}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.modalBody}>
            {/* Artwork: radial gradient + decorative bookmark ribbon */}
            <View style={styles.modalArtwork}>
              {currentTrack.artworkUrl ? (
                <Image
                  source={{ uri: currentTrack.artworkUrl }}
                  style={styles.modalArtworkImage}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.modalArtworkPlaceholder}>
                  <BookOpen size={64} color={theme.colors.content.primary} />
                </View>
              )}
              {/* Decorative bookmark ribbon at top-right */}
              <View style={styles.bookmarkRibbon} />
            </View>

            {/* Title + scholar + sanad chain */}
            <View style={styles.modalTextContainer}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {currentTrack.title}
              </Text>
              <Text style={styles.modalArtist}>{displayArtist}</Text>

              <View style={styles.sanadRow}>
                <SanadChain total={totalLessons} completed={lessonNum} size={7} />
                <Text style={styles.sanadLabel}>
                  {`${t("audio.lessonOf", "Lesson")} ${lessonNum} ${t("audio.of", "of")} ${totalLessons}`}
                </Text>
              </View>
            </View>

            {/* Progress */}
            <View style={styles.progressSection}>
              <ProgressBar />
              <View style={styles.timeLabels}>
                <Text style={styles.timeText}>{formatTime(positionSeconds)}</Text>
                <Text style={styles.timeText}>{formatTime(currentTrack.durationSeconds)}</Text>
              </View>
            </View>

            {/* Controls: speed / skip-30 / play / skip-30 / bookmark */}
            <PlaybackControls />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

const styles = StyleSheet.create((theme) => ({
  container: {
    position: "absolute",
    bottom: 0,
    start: theme.spacing.scale.md,
    end: theme.spacing.scale.md,
    height: 64,
    borderRadius: theme.radius.scale.md,
    backgroundColor: theme.colors.surface.default,
    ...theme.shadows.sm,
    overflow: "hidden",
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
  },
  containerEmbedded: {
    flex: 1,
    height: 52,
    borderRadius: theme.radius.scale.md,
    backgroundColor: theme.colors.surface.default,
    ...theme.shadows.sm,
    overflow: "hidden",
    borderWidth: theme.border.width.default,
    borderColor: theme.colors.border.subtle,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.scale.md,
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.scale.sm,
    backgroundColor: theme.colors.surface.subtle,
  },
  artworkPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginStart: theme.spacing.scale.md,
    marginEnd: theme.spacing.scale.sm,
  },
  title: {
    ...theme.typography.labelMd,
    color: theme.colors.content.strong,
  },
  artist: {
    ...theme.typography.caption,
    color: theme.colors.content.muted,
    marginTop: theme.spacing.scale.xs,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.scale.full,
    backgroundColor: theme.colors.surface.subtle,
    justifyContent: "center",
    alignItems: "center",
    marginEnd: theme.spacing.scale.sm,
  },
  miniProgressTrack: {
    height: 2,
    width: "100%",
    backgroundColor: theme.colors.surface.subtle,
  },
  miniProgressFill: {
    height: "100%",
    backgroundColor: theme.colors.action.primary,
  },
  // Fullscreen Modal Styles.
  // RN's <Modal> mounts its own render root (AppContainer/Surface), which
  // always derives ITS OWN root layout direction from the native
  // I18nManager flag — it does not inherit `direction` from the app's main
  // root. Setting it explicitly here gives this subtree its own resolved
  // direction (Yoga honors a per-node override regardless of the owning
  // surface's direction), so this mirrors correctly without a restart.
  modalContainer: {
    flex: 1,
    direction: theme.direction,
    backgroundColor: theme.colors.surface.default,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.scale.lg,
    height: 56,
  },
  modalHeaderTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: theme.colors.content.muted,
  },
  closeButton: {
    padding: theme.spacing.scale.xs,
  },
  placeholder: {
    width: 36,
  },
  modalBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.scale["2xl"],
    paddingBottom: theme.spacing.scale["4xl"],
  },
  modalArtwork: {
    width: 260,
    height: 260,
    borderRadius: 20,
    backgroundColor: theme.colors.surface.subtle,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    overflow: "hidden",
    position: "relative",
  },
  modalArtworkImage: {
    width: "100%",
    height: "100%",
  },
  modalArtworkPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bookmarkRibbon: {
    position: "absolute",
    top: 0,
    right: 28,
    width: 28,
    height: 42,
    backgroundColor: theme.colors.action.secondary,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  modalTextContainer: {
    alignItems: "center",
    marginTop: theme.spacing.scale["3xl"],
    marginBottom: theme.spacing.scale["2xl"],
    width: "100%",
  },
  modalTitle: {
    ...theme.typography.titleLg,
    fontFamily: "Fraunces-SemiBold",
    color: theme.colors.content.strong,
    textAlign: "center",
    paddingHorizontal: theme.spacing.scale.md,
    fontSize: 21,
    lineHeight: 28,
  },
  modalArtist: {
    ...theme.typography.bodyMd,
    color: theme.colors.content.primary,
    fontWeight: "600",
    marginTop: theme.spacing.scale.sm,
  },
  sanadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.scale.sm,
    marginTop: theme.spacing.scale.md,
  },
  sanadLabel: {
    ...theme.typography.caption,
    color: theme.colors.content.muted,
  },
  progressSection: {
    width: "100%",
    paddingHorizontal: theme.spacing.scale.sm,
    marginBottom: theme.spacing.scale.lg,
  },
  timeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: theme.spacing.scale.xs,
  },
  timeText: {
    ...theme.typography.caption,
    color: theme.colors.content.muted,
  },
}));
