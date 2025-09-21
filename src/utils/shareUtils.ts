export interface ShareData {
  title: string;
  text: string;
  url?: string;
  videoBlob?: Blob;
}

export const shareReel = async (shareData: ShareData): Promise<void> => {
  const { title, text, url, videoBlob } = shareData;

  // Check if the Web Share API is supported
  if (navigator.share) {
    try {
      const shareOptions: any = {
        title,
        text,
      };

      // If we have a URL, include it
      if (url) {
        shareOptions.url = url;
      }

      // If we have a video blob, we can't share it directly via Web Share API
      // but we can share the text and title
      await navigator.share(shareOptions);
      return;
    } catch (error) {
      console.log('Web Share API failed, falling back to clipboard');
    }
  }

  // Fallback: Copy to clipboard
  const shareText = `${title}\n\n${text}${url ? `\n\n${url}` : ''}`;
  
  try {
    await navigator.clipboard.writeText(shareText);
    // You might want to show a toast notification here
    alert('Reel details copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    alert('Failed to share reel. Please try again.');
  }
};

export const shareReelViaSocial = (shareData: ShareData, platform: 'twitter' | 'linkedin' | 'instagram'): void => {
  const { title, text, url } = shareData;
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(text);
  const encodedUrl = url ? encodeURIComponent(url) : '';

  let shareUrl = '';

  switch (platform) {
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedText}`;
      break;
    case 'instagram':
      // Instagram doesn't have a direct web sharing API, so we'll copy the text to clipboard
      const instagramText = `${title}\n\n${text}${url ? `\n\n${url}` : ''}`;
      navigator.clipboard.writeText(instagramText).then(() => {
        alert('Content copied to clipboard! You can now paste it in your Instagram post.');
      }).catch(() => {
        alert('Failed to copy to clipboard. Please try again.');
      });
      return;
  }

  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }
};

export const downloadReelVideo = (videoBlob: Blob, filename: string): void => {
  const url = URL.createObjectURL(videoBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
