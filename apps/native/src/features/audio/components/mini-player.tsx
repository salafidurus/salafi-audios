import React, { useState } from "react";
import { View, Pressable, Text, Modal, ActivityIndicator } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useAudio } from "@sd/domain-audio";
import { audioService } from "../audio-service";
import { Play, Pause, ChevronDown, Music } from "lucide-react-native";
import { ProgressBar } from "./progress-bar";
import { PlaybackControls } from "./playback-controls";

export function MiniPlayer() {
  const { currentTrack, isPlaying, isLoading, progressPercent, positionSeconds } = useAudio();
  const { theme } = useUnistyles();
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

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
        style={[styles.container, { bottom: insets.bottom + 8 }]}
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
              {currentTrack.artist}
            </Text>
          </View>

          <Pressable onPress={handlePlayPause} style={styles.playButton}>
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
            <Text style={styles.modalHeaderTitle}>Now Playing</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.modalBody}>
            {currentTrack.artworkUrl ? (
              <Image source={{ uri: currentTrack.artworkUrl }} style={styles.modalArtwork} />
            ) : (
              <View style={[styles.modalArtwork, styles.modalArtworkPlaceholder]}>
                <Music size={80} color={theme.colors.content.muted} />
              </View>
            )}

            <View style={styles.modalTextContainer}>
              <Text style={styles.modalTitle} numberOfLines={2}>
                {currentTrack.title}
              </Text>
              <Text style={styles.modalArtist}>{currentTrack.artist}</Text>
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
  // Fullscreen Modal Styles
  modalContainer: {
    flex: 1,
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
