import Animated from 'react-native-reanimated';
import { helloWaveStyles } from './hello-wave.styles';

export function HelloWave() {
  return (
    <Animated.Text style={helloWaveStyles.wave}>
      👋
    </Animated.Text>
  );
}
