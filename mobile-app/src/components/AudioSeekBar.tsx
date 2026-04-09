import Slider from "@react-native-community/slider";
import { StyleSheet, View } from "react-native";

type AudioSeekBarProps = {
  progressRatio: number;
  disabled?: boolean;
  onPreview?: (ratio: number) => void;
  onSeekComplete: (ratio: number) => void;
  fillColor: string;
  trackColor: string;
  thumbColor: string;
};

export function AudioSeekBar({
  progressRatio,
  disabled = false,
  onPreview,
  onSeekComplete,
  fillColor,
  trackColor,
  thumbColor,
}: AudioSeekBarProps) {
  const clampedRatio = Math.max(0, Math.min(1, progressRatio));

  return (
    <View style={[styles.wrapper, disabled && styles.disabledTrack]}>
      <Slider
        style={styles.slider}
        value={clampedRatio}
        minimumValue={0}
        maximumValue={1}
        disabled={disabled}
        minimumTrackTintColor={fillColor}
        maximumTrackTintColor={trackColor}
        thumbTintColor={thumbColor}
        onValueChange={(value) => onPreview?.(value)}
        onSlidingComplete={(value) => onSeekComplete(value)}
        tapToSeek
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    height: 34,
    justifyContent: "center",
  },
  slider: {
    width: "100%",
    height: 34,
  },
  disabledTrack: {
    opacity: 0.45,
  },
});
