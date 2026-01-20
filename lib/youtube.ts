interface YouTubeEmbedOptions {
  startTime?: number | null;
  endTime?: number | null;
}

export function getYouTubeEmbedUrl(url: string, options?: YouTubeEmbedOptions): string | null {
  try {
    // Extract video ID from various YouTube URL formats
    const videoIdMatch = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );

    if (!videoIdMatch || !videoIdMatch[1]) {
      return null;
    }

    const videoId = videoIdMatch[1];

    // Build embed URL with required parameters
    const params = new URLSearchParams({
      autoplay: '1',        // Autoplay video
      mute: '1',            // Mute audio (required for autoplay)
      loop: '1',            // Loop video
      playlist: videoId,    // Required for loop to work
      controls: '0',        // Hide controls
      modestbranding: '1',  // Minimal YouTube branding
      playsinline: '1',     // Play inline on iOS
      rel: '0',             // Don't show related videos
      disablekb: '1',       // Disable keyboard controls
      fs: '0',              // Disable fullscreen button
      iv_load_policy: '3',  // Hide annotations
    });

    // Add start time if specified
    if (options?.startTime != null && options.startTime > 0) {
      params.set('start', options.startTime.toString());
    }

    // Add end time if specified
    if (options?.endTime != null && options.endTime > 0) {
      params.set('end', options.endTime.toString());
    }

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  } catch (error) {
    console.error('Failed to parse YouTube URL:', url, error);
    return null;
  }
}

export function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
  return youtubeRegex.test(url);
}
