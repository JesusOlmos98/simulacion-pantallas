import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/cti40plus/:mac',
        destination: '/?mac=:mac',
        permanent: false
      },
      {
        source: '/cti40plus',
        destination: '/',
        permanent: false
      },
      {
        source: '/tc5',
        destination: '/',
        permanent: false
      }
    ];
  }
};

export default nextConfig;
