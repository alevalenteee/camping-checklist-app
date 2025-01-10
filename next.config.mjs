/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "placehold.co",
      "replicate.com",
      "replicate.delivery",
      "firebasestorage.googleapis.com",
      "lh3.googleusercontent.com"
    ],
    loader: 'custom',
    loaderFile: './src/app/lib/imageLoader.ts',
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.openai.com/:path*",
      },
    ];
  },
};

export default nextConfig;
