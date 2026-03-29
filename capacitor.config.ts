import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.hissa',
  appName: 'Hissa',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // During development, uncomment and set your local machine's IP (e.g. 192.168.1.5)
    url: 'http://192.168.0.107:3000',
    cleartext: true
  }
};

export default config;
