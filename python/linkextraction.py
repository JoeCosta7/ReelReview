import os
import logging
from pathlib import Path
from typing import Dict, List, Optional
from datetime import timedelta
import ffmpeg
import tempfile
import yt_dlp
from youtube_transcript_api import YouTubeTranscriptApi
import whisper
import requests

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VideoExtractor:
    def __init__(self, download_dir: str = "downloads"):
        self.download_dir = Path(download_dir)
        self.download_dir.mkdir(exist_ok=True)
        logger.info("Loading Whisper model ('base'). This may take a moment...")
        self.whisper_model = whisper.load_model("base")
        logger.info("Whisper model loaded.")

    def extract_video_id(self, url: str) -> Optional[str]:
        if "youtube.com/watch?v=" in url:
            return url.split("v=")[1].split("&")[0]
        elif "youtu.be/" in url:
            return url.split("youtu.be/")[1].split("?")[0]
        return None

    def download_audio(self, video_url: str) -> Optional[str]:
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
        video_id = self.extract_video_id(video_url)
        if not video_id:
            logger.error(f"Could not extract video ID from URL: {video_url}")
            return None

        try:
            logger.info(f"Attempting to fetch existing transcript for video ID: {video_id}")
            ytt_api = YouTubeTranscriptApi()
            fetched_transcript = ytt_api.fetch(video_id, languages=[lang, 'en'])
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
            error_str = str(e).lower()
            if 'transcript' in error_str and ('disabled' in error_str or 'not found' in error_str):
                logger.warning("No existing transcript found. Attempting Whisper.")
                audio_file = self.download_audio(video_url)
                if audio_file:
                    transcript = self.generate_transcript_with_whisper(audio_file)
                    try:
                        os.remove(audio_file)
                    except OSError:
                        pass
                    return transcript
                return None
            else:
                logger.error(f"Unexpected error: {e}")
                return None

    def _seconds_to_timestamp(self, seconds: float) -> str:
        return str(timedelta(seconds=int(seconds)))

def getTranscript(video_url: str) -> Optional[Dict]:    
    extractor = VideoExtractor()
    transcript = extractor.get_timestamped_transcript(video_url=video_url)

    video_bytes = None
    try:
        ydl_opts = {'format': 'mp4/best', 'quiet': True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            video_url_direct = info['url']
        resp = requests.get(video_url_direct, stream=True)
        resp.raise_for_status()
        video_bytes = resp.content
        logger.info(f"Fetched video into memory: {len(video_bytes)} bytes")
    except Exception as e:
        logger.error(f"Failed to fetch video bytes: {e}")

    if transcript:
        return {"transcript": transcript, "video_bytes": video_bytes}
    else:
        print("\n❌ Failed to get or generate transcript.")
        return None

def getVideoClip(video_bytes: bytes, start_time: float, end_time: float) -> bytes:
    """Clip video into proper MP4 using temp files (fully playable)."""
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as in_file:
        in_file.write(video_bytes)
        in_file.flush()
        in_path = in_file.name
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as out_file:
        out_path = out_file.name

    ffmpeg.input(in_path, ss=start_time, to=end_time).output(out_path, c="copy").overwrite_output().run(quiet=True)
    with open(out_path, "rb") as f:
        clip_bytes = f.read()
    return clip_bytes

def transcript_to_srt(transcript: List[Dict], srt_path: str):
    def seconds_to_srt_time(sec):
        h = int(sec // 3600)
        m = int((sec % 3600) // 60)
        s = int(sec % 60)
        ms = int((sec - int(sec)) * 1000)
        return f"{h:02}:{m:02}:{s:02},{ms:03}"

    with open(srt_path, 'w', encoding='utf-8') as f:
        for idx, entry in enumerate(transcript, 1):
            start = seconds_to_srt_time(entry['start'])
            end = seconds_to_srt_time(entry['start'] + entry['duration'])
            text = entry['text'].strip()
            f.write(f"{idx}\n{start} --> {end}\n{text}\n\n")

import subprocess

def pad_and_burn_subtitles(input_clip: str, srt_file: str, output_file: str = "clip.mp4"):
    filter_str = (
        "scale='min(1080,iw*1920/ih)':'min(1920,ih*1080/iw)':force_original_aspect_ratio=decrease,"
        "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black,"
        f"subtitles={srt_file}"
    )
    cmd = [
        "ffmpeg", "-y",
        "-i", input_clip,
        "-vf", filter_str,
        "-c:a", "copy",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        output_file
    ]
    subprocess.run(cmd, check=True)




if __name__ == "__main__":
    test_url = "https://www.youtube.com/watch?v=zsLc_Bd66CU"

    print("\n--- Testing getTranscript ---")
    data = getTranscript(test_url)
    if data:
        transcript = data["transcript"]
        video_bytes = data["video_bytes"]
        print(f"Transcript segments: {len(transcript)}")
        print(f"Video size: {len(video_bytes)} bytes")

        # Save transcript
        with open("transcript.txt", "w", encoding="utf-8") as f:
            for entry in transcript:
                f.write(f"[{entry['timestamp']}] {entry['text']}\n")
        print("Transcript written to transcript.txt")

        # Save full video
        with open("full_video.mp4", "wb") as f:
            f.write(video_bytes)
        print("Full video written to full_video.mp4")

        # Clip 10–20s
        print("\n--- Testing getVideoClip ---")
        clip_bytes = getVideoClip(video_bytes, start_time=10, end_time=20)
        with open("raw_clip.mp4", "wb") as f:
            f.write(clip_bytes)
        print("Clip written to raw_clip.mp4")

        # Generate SRT subtitle file from transcript
        srt_path = "clip_subtitles.srt"
        transcript_to_srt(transcript, srt_path)
        print("Subtitle file written to clip_subtitles.srt")

        # Pad and burn subtitles (replace raw_clip.mp4 with final clip.mp4)
        pad_and_burn_subtitles("raw_clip.mp4", srt_path, "clip.mp4")
        print("Final vertical, subtitled clip written to clip.mp4")
    else:
        print("❌ Transcript/video fetch failed")