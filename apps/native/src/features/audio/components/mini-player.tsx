import { useAudio } from "@sd/domain-audio";
import { useFormattedScholarName } from "@sd/domain-content";
import { Image } from "expo-image";
import { Play, Pause, ChevronDown, Music } from "lucide-react-native";
import React, { useState } from "react";
import { View, Pressable, Text, Modal, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";

import { audioService } from "../audio-service";
import { PlaybackControls } from "./playback-controls";
import { ProgressBar } from "./progress-bar";

/** Provides the native features audio components mini-player module responsibility. */
/** Describes the MiniPlayerProps native type contract and behavior. */
export type MiniPlayerProps = {
  embedded?: boolean;
};

function PlayerArtwork({
  uri,
  size,
  placeholderSize,
  color,
  placeholderStyle,
}: {
  uri?: string | null;
  size: object;
  placeholderSize: number;
  color: string;
  placeholderStyle: object;
}) {
  if (uri) return <Image source={{ uri }} style={size} />;
  return (
    <View style={[size, placeholderStyle]}>
      <Music size={placeholderSize} color={color} />
    </View>
  );
}

function PlayPauseIcon({
  isLoading,
  isPlaying,
  color,
  pauseIcon,
  playIcon,
}: {
  isLoading: boolean;
  isPlaying: boolean;
  color: string;
  pauseIcon: React.ReactNode;
  playIcon: React.ReactNode;
}) {
  if (isLoading) return <ActivityIndicator size="small" color={color} />;
  if (isPlaying) return pauseIcon;
  return <View style={{ marginStart: 2 }}>{playIcon}</View>;
}

/** Describes the MiniPlayer native function contract and behavior. */
export function MiniPlayer({ embedded = false }: MiniPlayerProps) {
  const { currentTrack, isPlaying, isLoading, progressPercent, positionSeconds } = useAudio();
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
  const ChevronDownIcon = <ChevronDown size={28} color={strong} />;

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
          <PlayerArtwork
            uri={currentTrack.artworkUrl}
            size={styles.artwork}
            placeholderSize={20}
            color={theme.colors.content.muted}
            placeholderStyle={styles.artworkPlaceholder}
          />

          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {displayArtist}
            </Text>
          </View>

          <Pressable onPress={handlePlayPause} style={styles.playButton} testID="play-button">
            <PlayPauseIcon
              isLoading={isLoading}
              isPlaying={isPlaying}
              color={theme.colors.content.strong}
              pauseIcon={PauseIcon}
              playIcon={PlayIcon}
            />
          </Pressable>
        </View>
      </Pressable>

      {/* Full Screen Player Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
              {ChevronDownIcon}
            </Pressable>
            <Text style={styles.modalHeaderTitle}>{t("audio.now_playing", "Now Playing")}</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.modalBody}>
            <PlayerArtwork
              uri={currentTrack.artworkUrl}
              size={styles.modalArtwork}
              placeholderSize={80}
              color={theme.colors.content.muted}
              placeholderStyle={styles.modalArtworkPlaceholder}
            />

            <View style={styles.modalTextContainer}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {currentTrack.title}
              </Text>
              <Text style={styles.modalArtist}>{displayArtist}</Text>
            </View>

            <View style={styles.progressSection}>
              <ProgressBar />
              <View style={styles.timeLabels}>
                <Text style={styles.timeText}>{formatTime(positionSeconds)}</Text>
                <Text style={styles.timeText}>{formatTime(currentTrack.durationSeconds)}</Text>
              </View>
            </View>

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
    ...theme.typography.titleMd,
    color: theme.colors.content.strong,
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
    width: 280,
    height: 280,
    borderRadius: theme.radius.scale.lg,
    backgroundColor: theme.colors.surface.subtle,
    ...theme.shadows.lg,
  },
  modalArtworkPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalTextContainer: {
    alignItems: "center",
    marginTop: theme.spacing.scale["3xl"],
    marginBottom: theme.spacing.scale["2xl"],
    width: "100%",
  },
  modalTitle: {
    ...theme.typography.titleLg,
    color: theme.colors.content.strong,
    textAlign: "center",
    paddingHorizontal: theme.spacing.scale.md,
  },
  modalArtist: {
    ...theme.typography.bodyMd,
    color: theme.colors.action.primary,
    fontWeight: "600",
    marginTop: theme.spacing.scale.sm,
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
