import { useVideoPlayer, VideoView } from 'expo-video';
import type { StyleProp, ViewStyle } from 'react-native';

interface VideoPlayerProps {
  source: { uri: string };
  style?: StyleProp<ViewStyle>;
  useNativeControls?: boolean;
  isLooping?: boolean;
}

export default function VideoPlayer({
  source,
  style,
  useNativeControls = false,
  isLooping = false,
}: VideoPlayerProps) {
  const player = useVideoPlayer(source, currentPlayer => {
    currentPlayer.loop = isLooping;
  });

  return (
    <VideoView
      player={player}
      style={style}
      nativeControls={useNativeControls}
      contentFit="cover"
    />
  );
}