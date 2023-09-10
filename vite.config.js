import legacy from '@vitejs/plugin-legacy';

export default {
  plugins: [
    legacy({
      targets: ['>0.25%', 'last 2 versions', 'not dead', 'not Samsung 20'],
    }),
  ],
};