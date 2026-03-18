import { Redirect } from 'expo-router';

// The default tab is search
export default function Index() {
  return <Redirect href="/(tabs)/search" />;
}
