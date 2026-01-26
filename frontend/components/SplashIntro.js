import React, { useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { G, Path, Rect } from "react-native-svg";

const { width, height } = Dimensions.get("window");

// ==============================
// Generate geometric rectangle lines (like your reference)
// ==============================
const generateRects = (count = 55) => {
  return Array.from({ length: count }).map((_, idx) => {
    const w = 60 + Math.random() * 140;   // rectangle width
    const h = 40 + Math.random() * 120;   // rectangle height
    const x = Math.random() * (width * 1.4) - width * 0.2;
    const y = Math.random() * (width * 1.1) + width * 0.35; // mostly bottom area
    const rotate = Math.random() * 40 - 20; // slight rotation
    const strokeW = 1 + Math.random() * 0.8;

    return {
      key: idx.toString(),
      x,
      y,
      w,
      h,
      rotate,
      strokeW,
      opacity: 0.25 + Math.random() * 0.35,
    };
  });
};

const SplashIntro = () => {
  const rects = useMemo(() => generateRects(65), []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#f8f5ff", "#e9d7ff", "#c48bff"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Geometric yellow lines (rectangles) */}
      <View style={styles.patternWrapper}>
        <Svg width={width * 1.4} height={width * 1.4}>
          {rects.map((r) => (
            <Rect
              key={r.key}
              x={r.x}
              y={r.y}
              width={r.w}
              height={r.h}
              rx={8}
              ry={8}
              fill="none"
              stroke="rgba(255, 210, 70, 0.85)"
              strokeWidth={r.strokeW}
              opacity={r.opacity}
              transform={`rotate(${r.rotate} ${r.x + r.w / 2} ${r.y + r.h / 2})`}
            />
          ))}
        </Svg>

        {/* Fade overlay (so it disappears nicely like your image) */}
        <LinearGradient
          colors={[
            "rgba(248,245,255,0)",  // transparent top
            "rgba(248,245,255,0.25)",
            "rgba(196,139,255,0.35)", // stronger bottom
          ]}
          style={styles.fadeOverlay}
        />
      </View>

      {/* Center SVG logo */}
      <View style={styles.logoWrapper}>
        <Svg width={200} height={200} viewBox="0 0 400 400">
          <G>
            <Path
              d="M309,50H91c-22.6,0-41,18.3-41,41v53.7c0-34.8,31.1-61.9,66.7-58.2L312,125.9c22.1,4.5,38,23.4,38,45.4V91
		C350,68.3,331.7,50,309,50z"
              fill="#FFDD15"
            />
            <Path
              d="M312,125.9L116.7,86.5C81.1,82.8,50,109.9,50,144.7v95.5c0-22.6,17.5-41.5,40.6-43.9l215.2-22.6
		c23.6-2.5,44.3,15.5,44.3,38.6v-41.1C350,149.3,334.1,130.4,312,125.9z"
              fill="#F07554"
            />
            <Path
              d="M305.7,173.7L90.6,196.3C67.5,198.7,50,217.7,50,240.2v32.9v31.4v0.1v4.5c0,22.6,18.3,41,41,41h4.6h1.3h206.4
		h1.3h4.6c22.6,0,41-18.3,41-41v-4.5v-0.1v-31.4v-60.7C350,189.3,329.4,171.3,305.7,173.7z M244.7,289.6
		c-10.7,17.3-13.1,28.9-13.1,29.1l-27.7,0.8c-10-42.1-37.3-72.4-37.6-72.7l20.9-19.1c1,1.1,18.2,20,31.9,49.7
		c13.3-22.4,37.6-52.3,82-81.9l15.7,23.5C276.6,245.8,255.4,272.2,244.7,289.6z"
              fill="#26A9E0"
            />
            <Path
              d="M219,277.4c-13.7-29.7-30.9-48.7-31.9-49.7l-20.9,19.1c0.3,0.3,27.6,30.6,37.6,72.7l27.7-0.8
		c0-0.1,2.4-11.7,13.1-29.1c10.7-17.4,32-43.8,72-70.5L301,195.5C256.7,225.1,232.3,255.1,219,277.4z"
              fill="#FFFFFF"
            />
          </G>
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f2ff",
    alignItems: "center",
    justifyContent: "center",
  },

  // Pattern only in bottom half, like your screenshot
  patternWrapper: {
    position: "absolute",
    left: -width * 0.2,
    right: 0,
    bottom: -width * 0.15,
    height: width * 1.05,
    opacity: 1,
  },

  fadeOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  logoWrapper: {
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default SplashIntro;
