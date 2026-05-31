import React, { useState } from "react";
import { View, StyleSheet, Pressable, Text, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useAudio } from "@sd/domain-audio";
import { audioService } from "../index";
import { Play, Pause, ChevronDown } from "lucide-react-native";
import { ProgressBar } from "./progress-bar";
import { PlaybackControls } from "./playback-controls";

export function MiniPlayer() {
  const { currentTrack, isPlaying, progressPercent, positionSeconds } = useAudio();
  const [modalVisible, setModalVisible] = useState(false);

  if (!currentTrack) return null;

  const handlePlayPause = () => {
    if (isPlaying) {
      audioService.pause();
    } else {
      audioService.resume();
    }
  };

  return (
    <>
      <Pressable onPress={() => setModalVisible(true)} style={styles.container}>
        {/* Progress Bar underlaid at the very top of mini-player */}
        <View style={styles.miniProgressTrack}>
          <View style={[styles.miniProgressFill, { width: `${progressPercent}%` }]} />
        </View>

        <View style={styles.content}>
          <Image
            source={{ uri: currentTrack.artworkUrl || "https://via.placeholder.com/150" }}
            style={styles.artwork}
          />

          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>

          <Pressable onPress={handlePlayPause} style={styles.playButton}>
            {isPlaying ? (
              <Pause size={20} stroke="#1E293B" fill="#1E293B" />
            ) : (
              <View style={{ marginStart: 2 }}>
                <Play size={20} stroke="#1E293B" fill="#1E293B" />
              </View>
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
              <ChevronDown size={28} stroke="#1E293B" />
            </Pressable>
            <Text style={styles.modalHeaderTitle}>Now Playing</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.modalBody}>
            <Image
              source={{ uri: currentTrack.artworkUrl || "https://via.placeholder.com/300" }}
              style={styles.modalArtwork}
            />

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

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 50, // floats safely above system tab bars
    start: 12,
    end: 12,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#E2E8F0",
  },
  textContainer: {
    flex: 1,
    marginStart: 12,
    marginEnd: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F172A",
  },
  artist: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  miniProgressTrack: {
    height: 2,
    width: "100%",
    backgroundColor: "#F1F5F9",
  },
  miniProgressFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
  },
  // Fullscreen Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0F172A",
  },
  closeButton: {
    padding: 4,
  },
  placeholder: {
    width: 36,
  },
  modalBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  modalArtwork: {
    width: 280,
    height: 280,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
  },
  modalTextContainer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
    width: "100%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F172A",
    textAlign: "center",
    paddingHorizontal: 12,
  },
  modalArtist: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "600",
    marginTop: 8,
  },
  progressSection: {
    width: "100%",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  timeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#64748B",
  },
});
