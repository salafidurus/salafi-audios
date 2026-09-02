import { BottomSheet, Button, Column, Host, Row, Spacer } from "@expo/ui";
import { useAudio } from "@sd/domain-audio";
import { useFormattedScholarName } from "@sd/domain-content";
import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { useTranslation } from "@/core/i18n/use-translation";
import { toUniversalStyleFromRN } from "@/core/styles/expo-ui";
import { NativeIcon, NativeImage, NativeProgress, NativeText } from "@/shared/ui";

import { audioService } from "../audio-service";
import { PlaybackControls } from "./playback-controls";
import { ProgressBar } from "./progress-bar";

/** Renders the compact accessory player and full now-playing sheet. */
/** Describes the optional embedded layout accepted by the mini-player surface. */
export type MiniPlayerProps = {
  embedded?: boolean;
};

/**
 * Renders the compact player and now-playing sheet.
 *
 * The title/artwork action and playback action are sibling native buttons so
 * opening the sheet never creates a nested interactive target around play/pause.
 * Playback state and side effects remain owned by `audioService`.
 */
export function MiniPlayer({ embedded = false }: MiniPlayerProps) {
  const { currentTrack, isPlaying, progressPercent, positionSeconds } = useAudio();
  const { theme } = useUnistyles();
  const { t } = useTranslation();
  const [sheetVisible, setSheetVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const displayArtist = useFormattedScholarName(currentTrack?.artist, currentTrack?.scholarSlug);
  const compactArtist = truncateCompactArtist(displayArtist);

  if (!currentTrack) return null;

  return (
    <>
      <MiniPlayerBar
        currentTrack={currentTrack}
        compactArtist={compactArtist}
        embedded={embedded}
        insetsBottom={insets.bottom}
        isPlaying={isPlaying}
        onOpen={() => setSheetVisible(true)}
        progressPercent={progressPercent}
        mutedColor={theme.colors.content.muted}
      />
      <NowPlayingSheet
        currentTrack={currentTrack}
        displayArtist={displayArtist}
        isPresented={sheetVisible}
        onDismiss={() => setSheetVisible(false)}
        positionSeconds={positionSeconds}
        theme={theme}
        title={t("audio.now_playing", "Now Playing")}
      />
    </>
  );
}

function MiniPlayerBar({
  currentTrack,
  compactArtist,
  embedded,
  insetsBottom,
  isPlaying,
  mutedColor,
  onOpen,
  progressPercent,
}: {
  currentTrack: NonNullable<ReturnType<typeof useAudio>["currentTrack"]>;
  compactArtist: string;
  embedded: boolean;
  insetsBottom: number;
  isPlaying: boolean;
  mutedColor: string;
  onOpen: () => void;
  progressPercent: number;
}) {
  const handlePlayPause = () => {
    if (isPlaying) audioService.pause();
    else audioService.resume();
  };

  return (
    <Host
      style={[
        embedded ? styles.containerEmbedded : styles.container,
        !embedded && { bottom: insetsBottom + 8 },
      ]}
    >
      <Column>
        <NativeProgress
          variant="linear"
          value={progressPercent / 100}
          testID="mini-progress-fill"
        />
        <Row alignment="center" style={styles.content}>
          <Button
            onPress={onOpen}
            variant="text"
            testID="open-now-playing"
            style={toUniversalStyleFromRN(styles.openButton)}
          >
            <Row alignment="center">
              <PlayerArtwork
                uri={currentTrack.artworkUrl}
                size={styles.artwork}
                placeholderSize={20}
                color={mutedColor}
              />
              <Column style={toUniversalStyleFromRN(styles.textContainer)}>
                <NativeText variant="labelMd" colorRole="strong" numberOfLines={1}>
                  {currentTrack.title}
                </NativeText>
                <NativeText variant="caption" colorRole="muted" numberOfLines={1}>
                  {compactArtist}
                </NativeText>
              </Column>
            </Row>
          </Button>
          <Button
            onPress={handlePlayPause}
            variant="text"
            testID="play-button"
            style={toUniversalStyleFromRN(styles.playButton)}
          >
            <Column alignment="center">
              <NativeIcon name={isPlaying ? "pause" : "play"} size={24} colorRole="strong" />
            </Column>
          </Button>
        </Row>
      </Column>
    </Host>
  );
}

function NowPlayingSheet({
  currentTrack,
  displayArtist,
  isPresented,
  onDismiss,
  positionSeconds,
  theme,
  title,
}: {
  currentTrack: NonNullable<ReturnType<typeof useAudio>["currentTrack"]>;
  displayArtist: string;
  isPresented: boolean;
  onDismiss: () => void;
  positionSeconds: number;
  theme: ReturnType<typeof useUnistyles>["theme"];
  title: string;
}) {
  return (
    <BottomSheet
      isPresented={isPresented}
      onDismiss={onDismiss}
      snapPoints={["full"]}
      testID="now-playing-sheet"
    >
      <Column alignment="center" style={toUniversalStyleFromRN(styles.modalContainer)}>
        <Row alignment="center" style={styles.modalHeader}>
          <Button
            onPress={onDismiss}
            variant="text"
            testID="close-now-playing"
            style={toUniversalStyleFromRN(styles.closeButton)}
          >
            <NativeIcon name="chevronDown" size={28} colorRole="strong" />
          </Button>
          <NativeText variant="titleMd" colorRole="strong">
            {title}
          </NativeText>
          <Spacer flexible />
        </Row>
        <Column alignment="center" style={styles.modalBody}>
          <PlayerArtwork
            uri={currentTrack.artworkUrl}
            size={styles.modalArtwork}
            placeholderSize={80}
            color={theme.colors.content.muted}
          />
          <Column alignment="center" style={toUniversalStyleFromRN(styles.modalTextContainer)}>
            <NativeText variant="titleLg" colorRole="strong" numberOfLines={2}>
              {currentTrack.title}
            </NativeText>
            <NativeText variant="bodyMd" colorRole="primary">
              {displayArtist}
            </NativeText>
          </Column>
          <Column style={styles.progressSection}>
            <ProgressBar />
            <Row alignment="center" style={toUniversalStyleFromRN(styles.timeLabels)}>
              <NativeText variant="caption" colorRole="muted">
                {formatTime(positionSeconds)}
              </NativeText>
              <Spacer flexible />
              <NativeText variant="caption" colorRole="muted">
                {formatTime(currentTrack.durationSeconds)}
              </NativeText>
            </Row>
          </Column>
          <PlaybackControls />
        </Column>
      </Column>
    </BottomSheet>
  );
}

function PlayerArtwork({
  uri,
  size,
  placeholderSize,
  color,
}: {
  uri?: string | null;
  size: object;
  placeholderSize: number;
  color: string;
}) {
  if (uri) return <NativeImage source={{ uri }} bridgeStyle={size} />;
  return (
    <Column alignment="center" style={toUniversalStyleFromRN([size, styles.artworkPlaceholder])}>
      <NativeIcon name="music" size={placeholderSize} color={color} />
    </Column>
  );
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function truncateCompactArtist(artist: string): string {
  return artist.length > COMPACT_ARTIST_MAX_LENGTH
    ? `${artist.slice(0, COMPACT_ARTIST_MAX_LENGTH - 1)}…`
    : artist;
}

const COMPACT_ARTIST_MAX_LENGTH = 32;

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
    paddingHorizontal: 0,
  },
  openButton: {
    flex: 1,
    justifyContent: "center",
    padding: 0,
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.scale.sm,
    backgroundColor: theme.colors.surface.subtle,
  },
  artworkPlaceholder: {
    justifyContent: "center",
    backgroundColor: theme.colors.surface.subtle,
  },
  textContainer: {
    width: 190,
    marginStart: theme.spacing.scale.md,
    marginEnd: theme.spacing.scale.sm,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.scale.full,
    backgroundColor: theme.colors.surface.subtle,
    justifyContent: "center",
    alignment: "center",
    marginEnd: theme.spacing.scale.sm,
  },
  modalContainer: {
    flex: 1,
    width: 360,
    backgroundColor: theme.colors.surface.default,
  },
  modalHeader: {
    alignSelf: "stretch",
    width: 360,
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.scale.lg,
    height: 56,
  },
  closeButton: {
    padding: theme.spacing.scale.xs,
  },
  modalBody: {
    alignSelf: "stretch",
    width: 360,
    paddingHorizontal: theme.spacing.scale["2xl"],
    paddingBottom: theme.spacing.scale["4xl"],
    marginTop: theme.spacing.scale.xl,
  },
  modalArtwork: {
    width: 240,
    height: 240,
    borderRadius: theme.radius.scale.lg,
    backgroundColor: theme.colors.surface.subtle,
    ...theme.shadows.lg,
  },
  modalTextContainer: {
    alignSelf: "stretch",
    marginTop: theme.spacing.scale["3xl"],
    marginBottom: theme.spacing.scale["2xl"],
  },
  progressSection: {
    alignSelf: "stretch",
    paddingHorizontal: theme.spacing.scale.sm,
    marginBottom: theme.spacing.scale.lg,
  },
  timeLabels: {
    alignSelf: "stretch",
    marginTop: theme.spacing.scale.xs,
  },
  timeSpacer: {
    flex: 1,
  },
}));
