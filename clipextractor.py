import os
import tempfile
import argparse
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from datetime import timedelta

import yt_dlp
from youtube_transcript_api import YouTubeTranscriptApi
try:
    import ffmpeg
except ImportError:
    print("Error: ffmpeg-python package not found.")
    print("Install it with: pip install ffmpeg-python")
    print("Also make sure you have FFmpeg binary installed on your system")
    exit(1)
from sentence_transformers import SentenceTransformer, util
import torch

class YouTubeExtractor:
    """Extract transcripts and videos from YouTube URLs."""
    
    def __init__(self, download_dir: str = "downloads"):
        self.download_dir = Path(download_dir)
        self.download_dir.mkdir(exist_ok=True)

    def extract_video_id(self, url: str) -> Optional[str]:
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
        video_id = self.extract_video_id(video_url)
        if not video_id:
            return None

        try:
            ytt_api = YouTubeTranscriptApi()
            fetched_transcript = ytt_api.fetch(video_id, languages=[lang, 'en'])
            
            return [
                {
                    'text': snippet.text.strip(),
                    'start': snippet.start,
                    'duration': snippet.duration,
                    'timestamp': str(timedelta(seconds=int(snippet.start)))
                }
                for snippet in fetched_transcript
            ]
        except Exception as e:
            print(f"No transcript available: {e}")
            return None

    def download_video(self, video_url: str, quality: str = 'best[height<=1080]') -> Optional[bytes]:
        video_id = self.extract_video_id(video_url)
        if not video_id:
            return None

        with tempfile.TemporaryDirectory() as temp_dir:
            output_path = os.path.join(temp_dir, f"{video_id}.%(ext)s")
            
            # Download highest quality with audio
            ydl_opts = {
                'format': 'best[height<=1440][ext=mp4]/best[ext=mp4]/best',  # Higher quality, prefer mp4
                'outtmpl': output_path,
                'quiet': True,
                'no_warnings': True,
                'writesubtitles': False,
                'writeautomaticsub': False,
                'extract_flat': False,
                'ignoreerrors': False,
            }
            
            try:
                print("Downloading highest quality video with audio...")
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    ydl.download([video_url])
                
                # Find the downloaded file and read it
                for file_path in Path(temp_dir).glob(f"{video_id}.*"):
                    if file_path.is_file():
                        with open(file_path, 'rb') as f:
                            video_bytes = f.read()
                        print(f"High quality video with audio downloaded ({len(video_bytes):,} bytes)")
                        return video_bytes
                
                return None
            except Exception as e:
                print(f"Failed to download video: {e}")
                return None

    def extract_all(self, video_url: str) -> Tuple[Optional[List[Dict]], Optional[bytes]]:
        transcript = self.get_transcript(video_url)
        video_bytes = self.download_video(video_url)
        return transcript, video_bytes

class ClipExtractor:
    def __init__(self):
        self.model = None
        self.model_name = "sentence-transformers/all-MiniLM-L6-v2"
    
    def _get_model(self):
        if self.model is None:
            print("Loading sentence transformer model...")
            self.model = SentenceTransformer(self.model_name)
        return self.model

    def generate_candidate_clips(self, transcript: List[Dict], 
                               min_duration: float = 10, 
                               max_duration: float = 60) -> List[Dict]:
        if not transcript:
            return []
        
        clips = []
        
        # Method 1: Individual segments
        for i, seg in enumerate(transcript):
            duration = seg.get('duration', 0)
            if min_duration <= duration <= max_duration:
                clips.append({
                    'text': seg['text'],
                    'start': seg['start'],
                    'duration': duration,
                    'end': seg['start'] + duration,
                    'score': self._calculate_base_score(seg['text'], duration)
                })
        
        # Method 2: Combined segments
        for start_idx in range(len(transcript)):
            current_start = transcript[start_idx]['start']
            current_text = []
            
            for end_idx in range(start_idx, len(transcript)):
                seg = transcript[end_idx]
                current_text.append(seg['text'])
                current_end = seg['start'] + seg.get('duration', 0)
                current_duration = current_end - current_start
                
                if current_duration > max_duration:
                    break
                    
                if current_duration >= min_duration and end_idx > start_idx:
                    combined_text = ' '.join(current_text)
                    clips.append({
                        'text': combined_text,
                        'start': current_start,
                        'duration': current_duration,
                        'end': current_end,
                        'score': self._calculate_base_score(combined_text, current_duration)
                    })
        
        # Remove overlaps and return top candidates
        clips = self._remove_overlaps(clips, 0.3)
        return sorted(clips, key=lambda x: x['score'], reverse=True)

    def _calculate_base_score(self, text: str, duration: float) -> float:
        word_count = len(text.split())
        content_score = min(word_count / 50, 1.0)
        duration_score = max(1.0 - abs(duration - 30) / 30, 0.1)
        completeness_score = 1.2 if text.strip().endswith(('.', '!', '?')) else 1.0
        
        filler_words = ['um', 'uh', 'like', 'you know', 'so', 'well']
        words = text.lower().split()
        if words:
            filler_ratio = sum(1 for word in words if word in filler_words) / len(words)
            filler_penalty = max(1.0 - filler_ratio * 2, 0.3)
        else:
            filler_penalty = 0.1
        
        return content_score * duration_score * completeness_score * filler_penalty

    def _remove_overlaps(self, clips: List[Dict], overlap_threshold: float) -> List[Dict]:
        clips_sorted = sorted(clips, key=lambda x: x['score'], reverse=True)
        filtered_clips = []
        
        for clip in clips_sorted:
            overlap_found = False
            for existing_clip in filtered_clips:
                if self._calculate_overlap(clip, existing_clip) > overlap_threshold:
                    overlap_found = True
                    break
            if not overlap_found:
                filtered_clips.append(clip)
        
        return filtered_clips

    def _calculate_overlap(self, clip1: Dict, clip2: Dict) -> float:
        start1, end1 = clip1['start'], clip1['end']
        start2, end2 = clip2['start'], clip2['end']
        
        overlap_start = max(start1, start2)
        overlap_end = min(end1, end2)
        overlap_duration = max(0, overlap_end - overlap_start)
        
        min_duration = min(clip1['duration'], clip2['duration'])
        return overlap_duration / min_duration if min_duration > 0 else 0

    def filter_clips_by_topic(self, clips: List[Dict], topics: List[str]) -> List[Dict]:
        if not clips or not topics:
            return clips
        
        model = self._get_model()
        
        topic_embeds = model.encode(topics, convert_to_tensor=True)
        clip_texts = [clip['text'] for clip in clips]
        clip_embeds = model.encode(clip_texts, convert_to_tensor=True)
        
        similarities = util.cos_sim(clip_embeds, topic_embeds)
        
        for i, clip in enumerate(clips):
            max_similarity = torch.max(similarities[i]).item()
            clip['topic_similarity'] = max_similarity
            clip['score'] *= (1 + max_similarity)
        
        return sorted(clips, key=lambda x: x['score'], reverse=True)

    def _get_video_info(self, video_path: str) -> Tuple[int, int, float]:
        """Get video dimensions and aspect ratio"""
        try:
            import subprocess
            cmd = ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_streams', video_path]
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                import json
                data = json.loads(result.stdout)
                for stream in data.get('streams', []):
                    if stream.get('codec_type') == 'video':
                        width = int(stream.get('width', 1920))
                        height = int(stream.get('height', 1080))
                        aspect_ratio = width / height
                        return width, height, aspect_ratio
        except:
            pass
        return 1920, 1080, 16/9  # Default fallback

    def _create_smart_vertical_filter(self, video_path: str) -> str:
        """Create a high-quality 9:16 crop filter with slight zoom-out"""
        width, height, aspect_ratio = self._get_video_info(video_path)
        
        print(f"Original video: {width}x{height} (aspect: {aspect_ratio:.3f})")
        print(f"Target: 1080x1920 (9:16 aspect: 0.5625)")
        
        # Scale with slight zoom-out (1.1x) to avoid over-cropping, then crop to 9:16
        if aspect_ratio > 1.0:  # Landscape video
            # Scale height to be larger than target, then crop
            return "scale=-1:2112,crop=1188:2112:(in_w-1188)/2:0,scale=1080:1920"
        else:  # Portrait or square video
            # Scale width to be larger than target, then crop
            return "scale=1188:-1,crop=1188:min(2112\\,in_h):0:(in_h-2112)/2,scale=1080:1920"

    def _create_high_quality_filter(self) -> str:
        """Create a high-quality filter chain for original aspect ratio"""
        return "scale=-2:1080:flags=lanczos"  # High-quality scaling

    def extract_clips_from_video(self, video_bytes: bytes, clips: List[Dict], 
                               output_dir: str = "clips", crop_to_vertical: bool = True) -> List[str]:
        os.makedirs(output_dir, exist_ok=True)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp_file:
            tmp_file.write(video_bytes)
            video_path = tmp_file.name
        
        output_paths = []
        
        try:
            for i, clip in enumerate(clips):
                output_path = os.path.join(output_dir, f"clip_{i+1:02d}.mp4")
                
                # Create the appropriate video filter
                if crop_to_vertical:
                    video_filter = self._create_smart_vertical_filter(video_path)
                    print(f"Using 9:16 crop with zoom-out")
                else:
                    video_filter = self._create_high_quality_filter()
                    print("Using high-quality scaling")
                
                # Use subprocess with high-quality settings and guaranteed audio
                import subprocess
                
                cmd = [
                    'ffmpeg', '-y',
                    '-ss', str(clip['start']),
                    '-i', video_path,
                    '-t', str(clip['duration']),
                    # Video settings - high quality
                    '-c:v', 'libx264',
                    '-crf', '18',  # Higher quality (lower CRF)
                    '-preset', 'medium',
                    '-profile:v', 'high',
                    '-pix_fmt', 'yuv420p',
                    '-vf', video_filter,
                    # Audio settings - ensure audio is included
                    '-c:a', 'aac',
                    '-ar', '48000',  # Higher sample rate
                    '-ac', '2',  # Stereo
                    '-b:a', '192k',  # Higher audio bitrate
                    # General settings
                    '-movflags', '+faststart',
                    '-avoid_negative_ts', 'make_zero',
                    '-map', '0:v:0',  # Map first video stream
                    '-map', '0:a:0',  # Map first audio stream
                    output_path
                ]
                
                print(f"Processing clip {i+1} with high-quality encoding...")
                result = subprocess.run(cmd, capture_output=True, text=True)
                
                if result.returncode != 0:
                    print(f"FFmpeg error for clip {i+1}:")
                    print(f"Command: {' '.join(cmd)}")
                    print(f"STDERR: {result.stderr}")
                    # Try without explicit stream mapping as fallback
                    fallback_cmd = [
                        'ffmpeg', '-y',
                        '-ss', str(clip['start']),
                        '-i', video_path,
                        '-t', str(clip['duration']),
                        '-c:v', 'libx264',
                        '-crf', '18',
                        '-preset', 'medium',
                        '-vf', video_filter,
                        '-c:a', 'aac',
                        '-b:a', '192k',
                        '-avoid_negative_ts', 'make_zero',
                        output_path
                    ]
                    print("Trying fallback command...")
                    result = subprocess.run(fallback_cmd, capture_output=True, text=True)
                    if result.returncode != 0:
                        print(f"Fallback also failed: {result.stderr}")
                        continue
                
                print(f"✓ Successfully processed clip {i+1}")
                
                if os.path.exists(output_path):
                    output_paths.append(output_path)
                    file_size = os.path.getsize(output_path) / (1024*1024)  # MB
                    
                    # Get output video info for confirmation
                    try:
                        out_width, out_height, out_aspect = self._get_video_info(output_path)
                        aspect_desc = f"{out_width}x{out_height} (9:16)" if crop_to_vertical else f"{out_width}x{out_height} (original)"
                    except:
                        aspect_desc = "9:16 vertical" if crop_to_vertical else "original"
                    
                    print(f"✓ Created clip {i+1}: {clip['duration']:.1f}s - {aspect_desc} - Score: {clip['score']:.2f} - Size: {file_size:.1f}MB")
                    if 'topic_similarity' in clip:
                        print(f"  Topic similarity: {clip['topic_similarity']:.2f}")
                    print(f"  Text: {clip['text'][:100]}...")
                
        except Exception as e:
            print(f"Error extracting clips: {e}")
            import traceback
            traceback.print_exc()
        finally:
            try:
                os.unlink(video_path)
            except:
                pass
        
        return output_paths

    def create_clips_from_url(self, video_url: str, topics: List[str] = None, 
                            top_n: int = 5, min_duration: float = 10,
                            max_duration: float = 60, output_dir: str = "clips", 
                            quality: str = 'best[height<=1080]', crop_to_vertical: bool = True) -> List[str]:
        
        extractor = YouTubeExtractor()
        transcript, video_bytes = extractor.extract_all(video_url)
        
        if not transcript:
            print("No transcript found. Cannot generate clips.")
            return []
        
        if not video_bytes:
            print("Failed to download video. Cannot extract clips.")
            return []
        
        print(f"Processing {len(transcript)} transcript segments...")
        
        candidates = self.generate_candidate_clips(transcript, min_duration, max_duration)
        print(f"Generated {len(candidates)} candidate clips")
        
        if topics:
            filtered_clips = self.filter_clips_by_topic(candidates, topics)
            print(f"Filtered clips by topics: {topics}")
        else:
            filtered_clips = candidates
        
        selected_clips = filtered_clips[:top_n]
        
        if not selected_clips:
            print("No suitable clips found.")
            return []
        
        print(f"Extracting {len(selected_clips)} clips...")
        clip_paths = self.extract_clips_from_video(video_bytes, selected_clips, output_dir, crop_to_vertical)
        
        return clip_paths

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Extract clips from YouTube videos')
    parser.add_argument('url', help='YouTube video URL')
    parser.add_argument('--topics', nargs='+', help='Topics to filter clips by')
    parser.add_argument('--count', type=int, default=5, help='Number of clips (default: 5)')
    parser.add_argument('--min-duration', type=float, default=10, help='Min duration in seconds (default: 10)')
    parser.add_argument('--max-duration', type=float, default=60, help='Max duration in seconds (default: 60)')
    parser.add_argument('--output-dir', default='clips', help='Output directory (default: clips)')
    parser.add_argument('--quality', default='best[height<=1080]', help='Video quality for download (default: best[height<=1080])')
    parser.add_argument('--no-crop', action='store_true', help='Keep original aspect ratio (no 9:16 crop)')
    
    args = parser.parse_args()
    
    extractor = ClipExtractor()
    
    clips = extractor.create_clips_from_url(
        video_url=args.url,
        topics=args.topics,
        top_n=args.count,
        min_duration=args.min_duration,
        max_duration=args.max_duration,
        output_dir=args.output_dir,
        quality=args.quality,
        crop_to_vertical=not args.no_crop
    )
    
    if clips:
        print(f"\nSuccessfully created {len(clips)} clips in '{args.output_dir}' directory:")
        for i, path in enumerate(clips, 1):
            print(f"  {i}. {path}")
    else:
        print("\nNo clips were generated.")