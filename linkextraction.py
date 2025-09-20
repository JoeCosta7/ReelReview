import argparse
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from datetime import timedelta

import yt_dlp
from youtube_transcript_api import YouTubeTranscriptApi

class YouTubeExtractor:
    def __init__(self, download_dir: str = "downloads"):
        """Initialize the extractor."""
        self.download_dir = Path(download_dir)
        self.download_dir.mkdir(exist_ok=True)

    def extract_video_id(self, url: str) -> Optional[str]:
        """Extract video ID from YouTube URL."""
        patterns = [
            r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([^&\n?#]+)',
            r'youtube\.com/watch\?.*?v=([^&\n?#]+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None

    def get_transcript(self, video_url: str, lang: str = 'en') -> Optional[List[Dict]]:
        """Get existing YouTube transcript (no AI generation)."""
        video_id = self.extract_video_id(video_url)
        if not video_id:
            print(f"❌ Could not extract video ID from URL: {video_url}")
            return None

        try:
            ytt_api = YouTubeTranscriptApi()
            fetched_transcript = ytt_api.fetch(video_id, languages=[lang, 'en'])
            
            transcript = [
                {
                    'text': snippet.text.strip(),
                    'start': snippet.start,
                    'duration': snippet.duration,
                    'timestamp': str(timedelta(seconds=int(snippet.start)))
                }
                for snippet in fetched_transcript
            ]
            
            print(f"✅ Found transcript with {len(transcript)} segments")
            return transcript

        except Exception as e:
            print(f"❌ No transcript available: {e}")
            return None

    def download_video(self, video_url: str, quality: str = 'best') -> Optional[str]:
        """Download video file and return file path."""
        video_id = self.extract_video_id(video_url)
        if not video_id:
            return None

        output_path = str(self.download_dir / f"{video_id}.%(ext)s")
        
        ydl_opts = {
            'format': quality,
            'outtmpl': output_path,
            'quiet': True,
            'no_warnings': True,
        }
        
        try:
            print(f"📥 Downloading video...")
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([video_url])
            
            # Find the downloaded file
            for file_path in self.download_dir.glob(f"{video_id}.*"):
                if file_path.is_file():
                    print(f"✅ Video downloaded: {file_path.name}")
                    return str(file_path)
            
            return None
        except Exception as e:
            print(f"❌ Failed to download video: {e}")
            return None

    def get_video_bytes(self, file_path: str) -> Optional[bytes]:
        """Read video file as bytes."""
        try:
            with open(file_path, 'rb') as f:
                return f.read()
        except Exception as e:
            print(f"❌ Failed to read video file: {e}")
            return None

    def extract_all(self, video_url: str, download_video: bool = True, quality: str = 'best') -> Tuple[Optional[List[Dict]], Optional[bytes]]:
        """Extract both transcript and video file."""
        transcript = self.get_transcript(video_url)
        video_bytes = None
        
        if download_video:
            video_path = self.download_video(video_url, quality)
            if video_path:
                video_bytes = self.get_video_bytes(video_path)
        
        return transcript, video_bytes

def main():
    parser = argparse.ArgumentParser(description='Extract YouTube transcript and/or download video.')
    parser.add_argument('video_url', help='The URL of the YouTube video.')
    parser.add_argument('--no-video', action='store_true', help='Skip video download')
    parser.add_argument('--quality', default='best', 
                       help='Video quality (best/worst/720p/480p/etc.)')
    parser.add_argument('--lang', default='en', help='Transcript language code')
    args = parser.parse_args()
    
    extractor = YouTubeExtractor()
    
    # Extract transcript and video
    transcript, video_bytes = extractor.extract_all(
        args.video_url, 
        download_video=not args.no_video,
        quality=args.quality
    )
    
    # Display transcript
    if transcript:
        print(f"\n=== TRANSCRIPT ({len(transcript)} segments) ===\n")
        for entry in transcript:
            print(f"[{entry['timestamp']}] {entry['text']}")
    
    # Show video info
    if video_bytes:
        print(f"\n=== VIDEO INFO ===")
        print(f"Video size: {len(video_bytes):,} bytes ({len(video_bytes)/1024/1024:.1f} MB)")
        print(f"Video available as bytes in memory")
    
    # Summary
    if not transcript and not video_bytes:
        print("\n❌ Failed to extract transcript or video.")
    elif transcript and video_bytes:
        print(f"\n✅ Successfully extracted transcript and video!")
    elif transcript:
        print(f"\n✅ Successfully extracted transcript!")
    elif video_bytes:
        print(f"\n✅ Successfully downloaded video!")

if __name__ == "__main__":
    main()