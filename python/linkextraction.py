import os
import logging
import argparse
from pathlib import Path
from typing import Dict, List, Optional
from datetime import timedelta

# --- Installation Check ---
try:
    import pkg_resources
    yt_api_version = pkg_resources.get_distribution("youtube-transcript-api").version
    whisper_version = pkg_resources.get_distribution("openai-whisper").version
    yt_dlp_version = pkg_resources.get_distribution("yt-dlp").version
    print(f"--- Library Versions ---")
    print(f"youtube-transcript-api: {yt_api_version}")
    print(f"openai-whisper: {whisper_version}")
    print(f"yt-dlp: {yt_dlp_version}")
    print(f"------------------------")
except pkg_resources.DistributionNotFound as e:
    print(f"ERROR: A required library is not installed: {e}")
    print("Please run: pip install youtube-transcript-api openai-whisper yt-dlp")
    exit()
# --------------------------

import yt_dlp
from youtube_transcript_api import YouTubeTranscriptApi
import whisper

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VideoExtractor:
    def __init__(self, download_dir: str = "downloads"):
        """Initialize the VideoExtractor."""
        self.download_dir = Path(download_dir)
        self.download_dir.mkdir(exist_ok=True)
        logger.info("Loading Whisper model ('base'). This may take a moment...")
        self.whisper_model = whisper.load_model("base")
        logger.info("Whisper model loaded.")

    def extract_video_id(self, url: str) -> Optional[str]:
        """Extract video ID from YouTube URL."""
        if "youtube.com/watch?v=" in url:
            return url.split("v=")[1].split("&")[0]
        elif "youtu.be/" in url:
            return url.split("youtu.be/")[1].split("?")[0]
        return None

    def download_audio(self, video_url: str) -> Optional[str]:
        """Download audio from a YouTube video and return the file path."""
        video_id = self.extract_video_id(video_url)
        if not video_id:
            return None
        
        output_path = str(self.download_dir / f"{video_id}.mp3")
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{'key': 'FFmpegExtractAudio', 'preferredcodec': 'mp3'}],
            'outtmpl': str(self.download_dir / '%(id)s.%(ext)s'),
            'quiet': True, 'no_warnings': True,
        }
        
        try:
            logger.info(f"Downloading audio for video ID: {video_id}")
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([video_url])
            logger.info(f"Audio downloaded to: {output_path}")
            return output_path
        except Exception as e:
            logger.error(f"Failed to download audio: {e}")
            return None

    def generate_transcript_with_whisper(self, audio_path: str) -> Optional[List[Dict]]:
        """Generate a timestamped transcript from an audio file using Whisper."""
        if not Path(audio_path).exists():
            logger.error(f"Audio file not found: {audio_path}")
            return None
        try:
            logger.info(f"Generating transcript with Whisper for: {audio_path}")
            result = self.whisper_model.transcribe(audio_path, verbose=False)
            
            formatted_transcript = []
            for segment in result.get("segments", []):
                start = segment['start']
                formatted_entry = {
                    'text': segment['text'].strip(),
                    'start': start,
                    'duration': segment['end'] - start,
                    'timestamp': self._seconds_to_timestamp(start)
                }
                formatted_transcript.append(formatted_entry)
            
            logger.info(f"Whisper generated {len(formatted_transcript)} transcript segments.")
            return formatted_transcript
        except Exception as e:
            logger.error(f"Whisper transcription failed: {e}")
            return None

    def get_timestamped_transcript(self, video_url: str, lang: str = 'en') -> Optional[List[Dict]]:
        """Get or generate a timestamped transcript."""
        video_id = self.extract_video_id(video_url)
        if not video_id:
            logger.error(f"Could not extract video ID from URL: {video_url}")
            return None

        try:
            logger.info(f"Attempting to fetch existing transcript for video ID: {video_id}")
            # Correct usage for youtube-transcript-api v1.2.2
            ytt_api = YouTubeTranscriptApi()
            logger.info("YouTubeTranscriptApi instance created successfully")
            
            fetched_transcript = ytt_api.fetch(video_id, languages=[lang, 'en'])
            logger.info(f"Transcript fetched successfully, type: {type(fetched_transcript)}")
            
            formatted = []
            for snippet in fetched_transcript:
                formatted.append({
                    'text': snippet.text.strip(),
                    'start': snippet.start,
                    'duration': snippet.duration,
                    'timestamp': self._seconds_to_timestamp(snippet.start)
                })
            logger.info("Successfully fetched existing transcript.")
            return formatted

        except Exception as e:
            logger.error(f"Failed to fetch transcript: {type(e).__name__}: {e}")
            # Check for specific transcript-related exceptions
            error_str = str(e).lower()
            if 'transcript' in error_str and ('disabled' in error_str or 'not found' in error_str):
                logger.warning("No existing transcript found. Attempting to generate one with Whisper.")
                audio_file = self.download_audio(video_url)
                if audio_file:
                    transcript = self.generate_transcript_with_whisper(audio_file)
                    try:
                        os.remove(audio_file)
                        logger.info(f"Cleaned up audio file: {audio_file}")
                    except OSError as clean_error:
                        logger.error(f"Error removing audio file {audio_file}: {clean_error}")
                    return transcript
                return None
            else:
                logger.error(f"An unexpected error occurred: {e}")
                return None

    def _seconds_to_timestamp(self, seconds: float) -> str:
        """Convert seconds to HH:MM:SS format."""
        return str(timedelta(seconds=int(seconds)))

def getTranscript(video_url: str) -> Optional[List[Dict]]:    
    extractor = VideoExtractor()
    transcript = extractor.get_timestamped_transcript(video_url=video_url)

    if transcript:
        return transcript
    else:
        print("\n❌ Failed to get or generate transcript for the video.")
        return None
    
# Implement
# Input is videobytes and start and end time, output bytes of clip video
def getVideoClip(videobytes, start: float, end: float) -> bytes:
    pass
