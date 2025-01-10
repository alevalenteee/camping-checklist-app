export default function imageLoader({ src, width, quality }: {
  src: string;
  width: number;
  quality?: number;
}) {
  if (src.startsWith('https://lh3.googleusercontent.com')) {
    // For Google profile images, return the original URL
    return src;
  }
  
  // For other images, use default behavior
  return `${src}?w=${width}&q=${quality || 75}`;
} 