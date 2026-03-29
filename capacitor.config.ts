import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hissaa.app',
  appName: 'Hissa',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    url: 'https://hissaa.in',
    cleartext: true
  }
};

export default config;
