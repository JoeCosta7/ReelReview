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
        # This function is no longer used since we removed Whisper
        return None

    def generate_transcript_with_whisper(self, audio_path: str) -> Optional[List[Dict]]:
        # Whisper functionality removed
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
                logger.warning("No existing transcript found. Cannot generate transcript without Whisper.")
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

def getVideoClip_fixed(video_bytes: bytes, start_time: float, end_time: float) -> bytes:
    """
    Fixed version of getVideoClip that ensures proper encoding.
    """
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as in_file:
        in_file.write(video_bytes)
        in_file.flush()
        in_path = in_file.name
        
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as out_file:
        out_path = out_file.name

    try:
        # Use proper re-encoding instead of copy to avoid codec issues
        (
            ffmpeg
            .input(in_path, ss=start_time, t=end_time-start_time)  # Use -t instead of -to for better precision
            .output(
                out_path, 
                vcodec='libx264',
                acodec='aac',
                preset='fast',
                crf=23
            )
            .overwrite_output()
            .run(quiet=True, capture_stdout=True)
        )
        
        with open(out_path, "rb") as f:
            clip_bytes = f.read()
            
        # Clean up temp files
        try:
            os.unlink(in_path)
            os.unlink(out_path)
        except:
            pass
            
        return clip_bytes
        
    except Exception as e:
        print(f"❌ Error in getVideoClip_fixed: {e}")
        # Clean up temp files
        try:
            os.unlink(in_path)
            os.unlink(out_path)
        except:
            pass
        return b""

def transcript_to_srt(transcript: List[Dict], srt_path: str, start_time: float, end_time: float):
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

def pad_and_burn_subtitles(input_clip: str, srt_file: str, start_time: float, end_time: float, output_file: str = "clip.mp4"):
    """
    Updated version: Centers video in upper area, reserves smaller fixed bottom bar, reduces font size.
    """
    # Calculate duration for the clip
    duration = end_time - start_time
    
    # Get absolute paths to avoid path issues
    abs_input = os.path.abspath(input_clip)
    abs_srt = os.path.abspath(srt_file)
    abs_output = os.path.abspath(output_file)
    
    # Check if input files exist
    if not os.path.exists(abs_input):
        print(f"❌ Input video file not found: {abs_input}")
        return False
    
    if not os.path.exists(abs_srt):
        print(f"❌ SRT subtitle file not found: {abs_srt}")
        return False
    
    print(f"🎬 Creating clip from {start_time}s to {end_time}s ({duration}s duration)")
    print(f"📁 Input: {abs_input}")
    print(f"📄 Subtitles: {abs_srt}")
    print(f"💾 Output: {abs_output}")
    
    # First, probe the input file to understand its properties
    print("🔍 Analyzing input file...")
    probe_cmd = [
        "ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", abs_input
    ]
    
    try:
        probe_result = subprocess.run(probe_cmd, capture_output=True, text=True, timeout=30)
        if probe_result.returncode != 0:
            print(f"❌ Cannot analyze input file: {probe_result.stderr}")
            return False
        
        probe_data = json.loads(probe_result.stdout)
        
        # Check if file has video and audio streams
        video_streams = [s for s in probe_data['streams'] if s['codec_type'] == 'video']
        audio_streams = [s for s in probe_data['streams'] if s['codec_type'] == 'audio']
        
        if not video_streams:
            print("❌ No video stream found in input file")
            return False
            
        print(f"✅ Input analysis complete - Video streams: {len(video_streams)}, Audio streams: {len(audio_streams)}")
        
        # Get video dimensions for scaling calculation
        video_width = int(video_streams[0].get('width', 0))
        video_height = int(video_streams[0].get('height', 0))
        print(f"📐 Original video dimensions: {video_width}x{video_height}")
        
    except Exception as e:
        print(f"⚠️ Warning: Could not analyze input file: {e}. Proceeding anyway...")
        # Fallback assumptions if probe fails
        video_width, video_height = 1920, 1080  # Default to landscape
    
    # Reserve bottom space for subtitles (reduced for less dominance)
    subtitle_area_height = 150
    target_video_height = 1920 - subtitle_area_height
    
    # Build the FFmpeg command with chained filters for centering
    print("🔧 Creating vertical clip with subtitles...")
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
            # Alignment=2 => bottom-center, MarginV ~130 keeps top edge of subs near start of bottom bar
            f"subtitles={abs_srt}:force_style='FontSize=16,PrimaryColour=&Hffffff,OutlineColour=&H000000,Outline=1,Bold=1,Alignment=6,MarginV=190'"
        ),
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-pix_fmt", "yuv420p"
    ]
    
    # Add audio codec if there are audio streams
    try:
        if 'probe_data' in locals() and any(s['codec_type'] == 'audio' for s in probe_data['streams']):
            final_cmd.extend(["-c:a", "aac", "-b:a", "128k"])
        else:
            final_cmd.extend(["-an"])  # No audio
    except:
        final_cmd.extend(["-c:a", "aac", "-b:a", "128k"])  # Default to including audio
    
    final_cmd.append(abs_output)
    
    try:
        print("⚙️ Running final processing command...")
        print(f"Command: {' '.join(final_cmd)}")
        
        result = subprocess.run(final_cmd, capture_output=True, text=True, timeout=180)
        
        if result.returncode == 0:
            print("✅ FFmpeg completed successfully")
            
            # Check if output file was created and has reasonable size
            if os.path.exists(abs_output):
                file_size = os.path.getsize(abs_output)
                print(f"📁 Output file size: {file_size / (1024*1024):.1f} MB")
                
                if file_size < 1000:  # Less than 1KB is suspicious
                    print("⚠️ Warning: Output file is very small, might be corrupted")
                    return False
                else:
                    print("🎉 Final clip with subtitles created successfully!")
                    return True
            else:
                print("❌ Output file was not created")
                return False
        else:
            print(f"❌ FFmpeg failed with error:")
            print(f"Return code: {result.returncode}")
            print(f"Error output: {result.stderr}")
            print(f"Standard output: {result.stdout}")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ FFmpeg command timed out (>180 seconds)")
        return False
    except Exception as e:
        print(f"❌ Exception during processing: {e}")
        return False

def verify_clip_quality(clip_path: str):
    """Verify that the created clip is valid and playable."""
    if not os.path.exists(clip_path):
        print(f"❌ Clip file doesn't exist: {clip_path}")
        return False
    
    try:
        # Use ffprobe to check the file
        probe_cmd = [
            "ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", clip_path
        ]
        
        result = subprocess.run(probe_cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            data = json.loads(result.stdout)
            
            # Check if we have video and audio streams
            video_streams = [s for s in data['streams'] if s['codec_type'] == 'video']
            audio_streams = [s for s in data['streams'] if s['codec_type'] == 'audio']
            
            if video_streams:
                v = video_streams[0]
                print(f"✅ Video: {v['width']}x{v['height']}, {v['codec_name']}")
                
            if audio_streams:
                a = audio_streams[0]
                print(f"✅ Audio: {a['codec_name']}, {a.get('sample_rate', 'unknown')} Hz")
            
            duration = float(data['format']['duration'])
            print(f"✅ Duration: {duration:.2f} seconds")
            
            return True
        else:
            print(f"❌ ffprobe failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error verifying clip: {e}")
        return False

# MAIN PUBLIC INTERFACE FUNCTION
def getVideoClip(video_url: str, start_time: float, end_time: float) -> Optional[bytes]:
    """
    Public interface function that takes a video URL and time range,
    returns the final processed clip with subtitles as bytes.
    
    Args:
        video_url (str): YouTube video URL
        start_time (float): Start time in seconds
        end_time (float): End time in seconds
    
    Returns:
        bytes: Final processed video clip with subtitles, or None if failed
    """
    try:
        print(f"🎬 Processing clip from {start_time}s to {end_time}s")
        print(f"📺 Video URL: {video_url}")
        
        # Step 1: Get transcript and video data
        print("\n📝 Getting transcript and video data...")
        data = getTranscript(video_url)
        if not data:
            print("❌ Failed to get transcript/video data")
            return None
        
        transcript = data["transcript"]
        video_bytes = data["video_bytes"]
        
        if not video_bytes:
            print("❌ Failed to get video bytes")
            return None
            
        print(f"✅ Got transcript with {len(transcript)} segments")
        print(f"✅ Got video data: {len(video_bytes)} bytes")
        
        # Step 2: Create initial clip
        print("\n✂️ Creating initial video clip...")
        clip_bytes = getVideoClip_fixed(video_bytes, start_time, end_time)
        if not clip_bytes:
            print("❌ Failed to create video clip")
            return None
        
        # Step 3: Create temporary files for processing
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as temp_clip:
            temp_clip.write(clip_bytes)
            temp_clip_path = temp_clip.name
        
        with tempfile.NamedTemporaryFile(suffix=".srt", delete=False) as temp_srt:
            temp_srt_path = temp_srt.name
        
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as temp_final:
            temp_final_path = temp_final.name
        
        try:
            # Step 4: Generate SRT subtitles
            print("\n📄 Generating subtitles...")
            transcript_to_srt(transcript, temp_srt_path, start_time, end_time)
            print("✅ Subtitles generated")
            
            # Step 5: Apply padding and burn subtitles
            print("\n🔥 Applying final processing with subtitles...")
            success = pad_and_burn_subtitles(
                temp_clip_path, 
                temp_srt_path, 
                start_time, 
                end_time, 
                temp_final_path
            )
            
            if not success:
                print("❌ Failed to apply final processing")
                return None
            
            # Step 6: Read final processed clip
            print("\n📖 Reading final processed clip...")
            with open(temp_final_path, "rb") as f:
                final_clip_bytes = f.read()
            
            print(f"✅ Final clip ready: {len(final_clip_bytes)} bytes")
            print("🎉 Video clip processing completed successfully!")
            
            return final_clip_bytes
            
        finally:
            # Clean up temporary files
            for temp_file in [temp_clip_path, temp_srt_path, temp_final_path]:
                try:
                    if os.path.exists(temp_file):
                        os.unlink(temp_file)
                except:
                    pass
    
    except Exception as e:
        print(f"❌ Error in getVideoClip: {e}")
        return None

# Test the main interface
if __name__ == "__main__":
    test_url = "https://www.youtube.com/watch?v=zsLc_Bd66CU"
    start_time = 26.0
    end_time = 53.770
    print(getTranscript(test_url)["transcript"])  # Test transcript fetching
    print("🚀 Testing main interface: getVideoClip()")
    final_clip = getVideoClip(test_url, start_time, end_time)
    
    if final_clip:
        # Save the final clip
        with open("final_output_clip.mp4", "wb") as f:
            f.write(final_clip)
        print("✅ Final clip saved as 'final_output_clip.mp4'")
        
        # Verify the clip quality
        verify_clip_quality("final_output_clip.mp4")
    else:
        print("❌ Failed to generate final clip")