import vikeReact from 'vike-react/config';
import vikePhoton from 'vike-photon/config';

export default {
  extends: [vikeReact, vikePhoton],
  // Enable SSR by default
  ssr: true,
  // Pre-rendering disabled by default (enabled per-page)
  prerender: false,
  // Custom server with API routes
  photon: {
    server: 'server/index.ts',
  },
};
