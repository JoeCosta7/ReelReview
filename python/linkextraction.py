import os
import logging
from pathlib import Path
from typing import Dict, List, Optional
from datetime import timedelta
import ffmpeg
import tempfile
import yt_dlp
from youtube_transcript_api import YouTubeTranscriptApi
import requests
import subprocess
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VideoExtractor:
    def __init__(self, download_dir: str = "downloads"):
        self.download_dir = Path(download_dir)
        self.download_dir.mkdir(exist_ok=True)

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


    def get_timestamped_transcript_from_url(self, video_url: str, lang: str = 'en') -> Optional[List[Dict]]:
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
            return None

    def _seconds_to_timestamp(self, seconds: float) -> str:
        return str(timedelta(seconds=int(seconds)))

def getTranscript(video_url: str) -> Optional[Dict]:    
    extractor = VideoExtractor()
    transcript = extractor.get_timestamped_transcript_from_url(video_url=video_url)

    # Instead of downloading the entire video, just get the direct URL for later use
    direct_video_url = None
    try:
        ydl_opts = {'format': 'mp4/best', 'quiet': True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            direct_video_url = info['url']
        logger.info(f"Retrieved direct video URL for efficient clip processing")
    except Exception as e:
        logger.error(f"Failed to get direct video URL: {e}")

    if transcript:
        return {"transcript": transcript, "direct_video_url": direct_video_url}
    else:
        print("\n❌ Failed to get or generate transcript.")
        return None

def _transcript_to_srt(transcript: List[Dict], srt_path: str, start_time: float, end_time: float):
    def seconds_to_srt_time(sec):
        h = int(sec // 3600)
        m = int((sec % 3600) // 60)
        s = int(sec % 60)
        ms = int((sec - int(sec)) * 1000)
        return f"{h:02}:{m:02}:{s:02},{ms:03}"

    # Filter and adjust segments for the clip range
    filtered_transcript = []
    clip_duration = end_time - start_time
    for entry in transcript:
        seg_start = entry['start']
        seg_end = seg_start + entry['duration']
        
        # Check for overlap with [start_time, end_time]
        if seg_end > start_time and seg_start < end_time:
            # Calculate adjusted start and end relative to clip
            adj_start = max(0, seg_start - start_time)
            adj_end = min(clip_duration, seg_end - start_time)
            
            # Only add if there's meaningful duration
            if adj_end > adj_start:
                adj_entry = entry.copy()
                adj_entry['start'] = adj_start
                adj_entry['duration'] = adj_end - adj_start
                # Optionally trim text if partial, but for simplicity, keep full text
                filtered_transcript.append(adj_entry)

    # Write the adjusted SRT
    with open(srt_path, 'w', encoding='utf-8') as f:
        for idx, entry in enumerate(filtered_transcript, 1):
            start = seconds_to_srt_time(entry['start'])
            end = seconds_to_srt_time(entry['start'] + entry['duration'])
            text = entry['text'].strip()
            f.write(f"{idx}\n{start} --> {end}\n{text}\n\n")

def _pad_and_burn_subtitles(input_clip: str, srt_file: str, start_time: float, end_time: float, output_file: str):
    """
    Centers video in upper area, reserves smaller fixed bottom bar, reduces font size.
    """
    # Calculate duration for the clip
    duration = end_time - start_time
    
    # Get absolute paths to avoid path issues
    abs_input = os.path.abspath(input_clip)
    abs_srt = os.path.abspath(srt_file)
    abs_output = os.path.abspath(output_file)
    
    # Check if input files exist
    if not os.path.exists(abs_input):
        logger.error(f"Input video file not found: {abs_input}")
        return False
    
    if not os.path.exists(abs_srt):
        logger.error(f"SRT subtitle file not found: {abs_srt}")
        return False
    
    logger.info(f"Creating clip from {start_time}s to {end_time}s ({duration}s duration)")
    
    # First, probe the input file to understand its properties
    probe_cmd = [
        "ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", abs_input
    ]
    
    try:
        probe_result = subprocess.run(probe_cmd, capture_output=True, text=True, timeout=30)
        if probe_result.returncode != 0:
            logger.error(f"Cannot analyze input file: {probe_result.stderr}")
            return False
        
        probe_data = json.loads(probe_result.stdout)
        
        # Check if file has video and audio streams
        video_streams = [s for s in probe_data['streams'] if s['codec_type'] == 'video']
        audio_streams = [s for s in probe_data['streams'] if s['codec_type'] == 'audio']
        
        if not video_streams:
            logger.error("No video stream found in input file")
            return False
            
        # Get video dimensions for scaling calculation
        video_width = int(video_streams[0].get('width', 0))
        video_height = int(video_streams[0].get('height', 0))
        logger.info(f"Original video dimensions: {video_width}x{video_height}")
        
    except Exception as e:
        logger.warning(f"Could not analyze input file: {e}. Proceeding anyway...")
        # Fallback assumptions if probe fails
        video_width, video_height = 1920, 1080  # Default to landscape
    
    # Reserve bottom space for subtitles (reduced for less dominance)
    subtitle_area_height = 150
    target_video_height = 1920 - subtitle_area_height
    
    # Build the FFmpeg command with chained filters for centering
    logger.info("Creating vertical clip with subtitles...")
    final_cmd = [
        "ffmpeg", "-y",
        "-i", abs_input,
        "-vf", (
            # Step 1: Scale to fit within 1080 width and target_video_height
            f"scale='min(1080,iw*{target_video_height}/ih)':'min({target_video_height},ih*1080/iw)':force_original_aspect_ratio=decrease,"
            # Step 2: Pad to 1080x target_video_height, centering the scaled video
            f"pad=1080:{target_video_height}:(ow-iw)/2:(oh-ih)/2:black,"
            # Step 3: Pad to full 1080x1920, placing the upper padded video at the top
            "pad=1080:1920:(ow-iw)/2:0:black,"
            # Step 4: Burn subtitles into the bottom bar
            f"subtitles={abs_srt}:force_style='FontSize=16,PrimaryColour=&Hffffff,OutlineColour=&H000000,Outline=1,Bold=1,Alignment=6,MarginV=190'"
        ),
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-pix_fmt", "yuv420p"
    ]
    
    # Add audio codec if there are audio streams
    try:
        if any(s['codec_type'] == 'audio' for s in probe_data['streams']):
            final_cmd.extend(["-c:a", "aac", "-b:a", "128k"])
        else:
            final_cmd.extend(["-an"])  # No audio
    except:
        final_cmd.extend(["-c:a", "aac", "-b:a", "128k"])  # Default to including audio
    
    final_cmd.append(abs_output)
    
    try:        
        result = subprocess.run(final_cmd, capture_output=True, text=True, timeout=180)
        
        if result.returncode == 0:
            logger.info("FFmpeg completed successfully")
            
            # Check if output file was created and has reasonable size
            if os.path.exists(abs_output):
                file_size = os.path.getsize(abs_output)
                logger.info(f"Output file size: {file_size / (1024*1024):.1f} MB")
                
                if file_size < 1000:  # Less than 1KB is suspicious
                    logger.warning("Output file is very small, might be corrupted")
                    return False
                else:
                    logger.info("Final clip with subtitles created successfully!")
                    return True
            else:
                logger.error("Output file was not created")
                return False
        else:
            logger.error(f"FFmpeg failed with error:")
            logger.error(f"Return code: {result.returncode}")
            logger.error(f"Error output: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        logger.error("FFmpeg command timed out (>180 seconds)")
        return False
    except Exception as e:
        logger.error(f"Exception during processing: {e}")
        return False

def getVideoClipFromUrl(direct_video_url: str, start_time: float, end_time: float) -> bytes:
    """
    Efficient clip generation: streams only the required portion of the video.
    
    Args:
        direct_video_url: Direct URL to the video file
        start_time: Start time in seconds
        end_time: End time in seconds
        
    Returns:
        bytes: Video clip bytes, or empty bytes on failure
    """
    logger.info(f"Processing video clip from {start_time}s to {end_time}s using direct URL")
    
    clip_path = tempfile.mktemp(suffix=".mp4")
    
    try:
        # Use ffmpeg to directly stream and clip from the URL
        logger.info("Streaming and clipping video directly from URL...")
        (
            ffmpeg
            .input(direct_video_url, ss=start_time, t=end_time-start_time)
            .output(
                clip_path, 
                vcodec='libx264',
                acodec='aac',
                preset='fast',
                crf=23
            )
            .overwrite_output()
            .run(quiet=True, capture_stdout=True)
        )
        
        if os.path.exists(clip_path):
            with open(clip_path, "rb") as f:
                clip_bytes = f.read()
            logger.info(f"Successfully created video clip: {len(clip_bytes)} bytes")
            return clip_bytes
        else:
            logger.error("Clip file was not created")
            return b""
                
    except Exception as e:
        logger.error(f"Error processing video clip: {e}")
        return b""
        
    finally:
        # Cleanup temporary file
        try:
            if os.path.exists(clip_path):
                os.unlink(clip_path)
        except:
            pass

def getVideoClip(video_bytes: bytes, start_time: float, end_time: float) -> bytes:
    """
    Main entry point: Takes video bytes and time range, returns video clip.
    
    Args:
        video_bytes: Raw video file bytes
        start_time: Start time in seconds
        end_time: End time in seconds
        
    Returns:
        bytes: Video clip bytes, or empty bytes on failure
    """
    logger.info(f"Processing video clip from {start_time}s to {end_time}s")
    
    # Create temporary files
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as input_temp:
        input_temp.write(video_bytes)
        input_temp.flush()
        input_path = input_temp.name
    
    clip_path = tempfile.mktemp(suffix=".mp4")
    
    try:
        # Extract the time range from the video
        logger.info("Extracting clip from video...")
        (
            ffmpeg
            .input(input_path, ss=start_time, t=end_time-start_time)
            .output(
                clip_path, 
                vcodec='libx264',
                acodec='aac',
                preset='fast',
                crf=23
            )
            .overwrite_output()
            .run(quiet=True, capture_stdout=True)
        )
        
        if os.path.exists(clip_path):
            with open(clip_path, "rb") as f:
                clip_bytes = f.read()
            logger.info("Successfully created video clip")
            return clip_bytes
        else:
            logger.error("Clip file was not created")
            return b""
                
    except Exception as e:
        logger.error(f"Error processing video clip: {e}")
        return b""
        
    finally:
        # Cleanup temporary files
        for temp_path in [input_path, clip_path]:
            try:
                if os.path.exists(temp_path):
                    os.unlink(temp_path)
            except:
                pass