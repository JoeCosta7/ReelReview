import os
import tempfile
import argparse
import re
import json
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from datetime import timedelta
import subprocess

import yt_dlp
from youtube_transcript_api import YouTubeTranscriptApi
try:
    import ffmpeg
except ImportError:
    print("Error: ffmpeg-python package not found.")
    print("Install it with: pip install ffmpeg-python")
    print("Also make sure you have FFmpeg binary installed on your system")
    exit(1)

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    print("Warning: google-generativeai package not found.")
    print("Install it with: pip install google-generativeai")
    print("Falling back to basic scoring system...")
    GEMINI_AVAILABLE = False

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

    def get_video_metadata(self, video_url: str) -> Optional[Dict]:
        """Get video metadata including title, description, views, etc."""
        try:
            with yt_dlp.YoutubeDL({'quiet': True}) as ydl:
                info = ydl.extract_info(video_url, download=False)
                return {
                    'title': info.get('title', ''),
                    'description': info.get('description', ''),
                    'view_count': info.get('view_count', 0),
                    'like_count': info.get('like_count', 0),
                    'comment_count': info.get('comment_count', 0),
                    'duration': info.get('duration', 0),
                    'uploader': info.get('uploader', ''),
                    'upload_date': info.get('upload_date', ''),
                    'tags': info.get('tags', [])
                }
        except Exception as e:
            print(f"Error getting video metadata: {e}")
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

    def download_video(self, video_url: str) -> Optional[bytes]:
        video_id = self.extract_video_id(video_url)
        if not video_id:
            return None

        with tempfile.TemporaryDirectory() as temp_dir:
            ydl_opts = {
                'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]',
                'merge_output_format': 'mp4',
                'outtmpl': os.path.join(temp_dir, f"{video_id}.%(ext)s"),
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

    def extract_all(self, video_url: str) -> Tuple[Optional[List[Dict]], Optional[bytes], Optional[Dict]]:
        transcript = self.get_transcript(video_url)
        video_bytes = self.download_video(video_url)
        metadata = self.get_video_metadata(video_url)
        return transcript, video_bytes, metadata

class GeminiClipAnalyzer:
    """Use Google Gemini to analyze and score clip quality"""
    
    def __init__(self, api_key: str = None):
        if not GEMINI_AVAILABLE:
            self.model = None
            return
            
        if api_key:
            genai.configure(api_key=api_key)
        elif os.getenv('GEMINI_API_KEY'):
            genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
        else:
            print("Warning: No Gemini API key provided. Set GEMINI_API_KEY environment variable.")
            self.model = None
            return
            
        try:
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            print("✓ Gemini AI initialized successfully")
        except Exception as e:
            print(f"Error initializing Gemini: {e}")
            self.model = None

    def analyze_clips(self, clips: List[Dict], video_metadata: Dict = None, topics: List[str] = None) -> List[Dict]:
        """Use Gemini to analyze and score clips for virality and quality"""
        if not self.model:
            print("Gemini not available, using enhanced fallback scoring...")
            return self._fallback_scoring(clips)

        enhanced_clips = []
        
        # Prepare context for Gemini
        context = self._build_context(video_metadata, topics)
        
        print(f"Analyzing {len(clips)} clips with Gemini AI...")
        
        for i, clip in enumerate(clips):
            try:
                analysis = self._analyze_single_clip(clip, context)
                clip.update(analysis)
                enhanced_clips.append(clip)
                
                score = analysis.get('ai_score', 0)
                print(f"✓ Analyzed clip {i+1}/{len(clips)}: Score {score:.1f}/10 {'🔥' if score >= 7 else '✅' if score >= 5 else '⚠️'}")
                
            except Exception as e:
                print(f"⚠️ Error analyzing clip {i+1}: {e}")
                # Use fallback analysis for this clip
                fallback = self._get_fallback_analysis(clip)
                clip.update(fallback)
                enhanced_clips.append(clip)
        
        return enhanced_clips

    def _build_context(self, metadata: Dict = None, topics: List[str] = None) -> str:
        context_parts = []
        
        if metadata:
            context_parts.append(f"Video Title: {metadata.get('title', 'Unknown')}")
            context_parts.append(f"Views: {metadata.get('view_count', 0):,}")
            context_parts.append(f"Likes: {metadata.get('like_count', 0):,}")
            if metadata.get('tags'):
                context_parts.append(f"Tags: {', '.join(metadata['tags'][:10])}")
        
        if topics:
            context_parts.append(f"Target Topics: {', '.join(topics)}")
            
        return '\n'.join(context_parts)

    def _analyze_single_clip(self, clip: Dict, context: str) -> Dict:
        """Analyze a single clip with Gemini"""
        
        # Ensure we have required fields
        if 'timestamp' not in clip:
            clip['timestamp'] = str(timedelta(seconds=int(clip.get('start', 0))))
        
        prompt = f"""
Analyze this video clip transcript for social media virality and engagement potential.

CONTEXT:
{context}

CLIP TRANSCRIPT:
"{clip['text']}"

Duration: {clip['duration']:.1f} seconds
Start time: {clip.get('timestamp', 'Unknown')}

Rate this clip on a scale of 0-10 considering:

1. VIRAL POTENTIAL (0-10):
   - Hook strength (grabs attention immediately)
   - Emotional impact (funny, surprising, inspiring, controversial)
   - Shareability factor
   - Memorable quotes or moments

2. CONTENT COHERENCE (0-10):
   - Complete thought or story arc
   - Clear beginning/middle/end
   - Self-contained idea
   - Context independence

3. ENGAGEMENT FACTORS (0-10):
   - Conversation starters
   - Relatability
   - Educational value
   - Entertainment value

4. TECHNICAL QUALITY (0-10):
   - Natural speech flow
   - Minimal filler words
   - Clear articulation
   - Good pacing

Respond in JSON format:
{{
    "viral_score": <0-10>,
    "coherence_score": <0-10>,
    "engagement_score": <0-10>,
    "technical_score": <0-10>,
    "overall_score": <0-10>,
    "hook_strength": <0-10>,
    "reasons": ["reason1", "reason2", "reason3"],
    "viral_elements": ["element1", "element2"],
    "recommended": true/false,
    "clip_type": "educational/entertainment/inspirational/controversial/story/other",
    "target_audience": "general/young_adults/professionals/niche",
    "best_platforms": ["tiktok", "instagram", "youtube_shorts", "twitter"]
}}
"""

        try:
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Clean up the response to extract JSON
            if '```json' in result_text:
                result_text = result_text.split('```json')[1].split('```')[0].strip()
            elif '```' in result_text:
                result_text = result_text.split('```')[1].split('```')[0].strip()
            
            # Remove any leading/trailing non-JSON content
            start_idx = result_text.find('{')
            end_idx = result_text.rfind('}')
            if start_idx != -1 and end_idx != -1:
                result_text = result_text[start_idx:end_idx+1]
            
            analysis = json.loads(result_text)
            
            # Validate required fields and provide defaults
            analysis.setdefault('viral_score', 0)
            analysis.setdefault('coherence_score', 0)
            analysis.setdefault('engagement_score', 0)
            analysis.setdefault('technical_score', 0)
            analysis.setdefault('hook_strength', 0)
            analysis.setdefault('reasons', [])
            analysis.setdefault('viral_elements', [])
            analysis.setdefault('recommended', False)
            
            # Calculate weighted AI score
            ai_score = (
                analysis.get('viral_score', 0) * 0.3 +
                analysis.get('coherence_score', 0) * 0.25 +
                analysis.get('engagement_score', 0) * 0.25 +
                analysis.get('technical_score', 0) * 0.1 +
                analysis.get('hook_strength', 0) * 0.1
            )
            
            analysis['ai_score'] = ai_score
            return analysis
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Raw response: {result_text[:200]}...")
            return self._get_fallback_analysis(clip)
        except Exception as e:
            print(f"Error in Gemini analysis: {e}")
            return self._get_fallback_analysis(clip)

    def _get_fallback_analysis(self, clip: Dict) -> Dict:
        """Generate fallback analysis when Gemini fails"""
        base_score = clip.get('score', 0)
        text = clip['text'].lower()
        
        # Quick analysis based on text content
        viral_score = min(10, base_score * 2 + (2 if '?' in text else 0))
        coherence_score = min(10, base_score * 1.5 + (3 if text.strip().endswith(('.', '!', '?')) else 0))
        engagement_score = min(10, base_score * 1.2 + len([w for w in ['you', 'your', 'we'] if w in text]))
        technical_score = max(0, 8 - (text.count('um') + text.count('uh')) * 2)
        
        ai_score = (viral_score + coherence_score + engagement_score + technical_score) / 4
        
        return {
            'ai_score': ai_score,
            'viral_score': viral_score,
            'coherence_score': coherence_score,
            'engagement_score': engagement_score,
            'technical_score': technical_score,
            'hook_strength': viral_score,
            'recommended': ai_score >= 5.0,
            'reasons': ['Fallback analysis - Gemini unavailable'],
            'viral_elements': [],
            'clip_type': 'educational',
            'target_audience': 'general',
            'best_platforms': ['tiktok', 'instagram', 'youtube_shorts']
        }

    def _fallback_scoring(self, clips: List[Dict]) -> List[Dict]:
        """Enhanced fallback scoring when Gemini is not available"""
        for clip in clips:
            text = clip['text'].lower()
            words = text.split()
            
            # Enhanced scoring factors
            hook_words = ['shocking', 'incredible', 'amazing', 'secret', 'never', 'always', 'everyone', 'nobody', 'why', 'how', 'what', 'when']
            engagement_words = ['you', 'your', 'we', 'us', 'think', 'believe', 'feel', 'know', 'understand']
            viral_phrases = ['mind blown', 'game changer', 'life hack', 'plot twist', 'wait for it', 'watch this']
            
            hook_score = sum(1 for word in hook_words if word in text) / len(words) * 10
            engagement_score = sum(1 for word in engagement_words if word in text) / len(words) * 10
            viral_score = sum(1 for phrase in viral_phrases if phrase in text) * 2
            
            # Question detection
            question_score = 2 if '?' in text else 0
            
            # Sentence completeness
            completeness_score = 3 if text.strip().endswith(('.', '!', '?')) else 1
            
            # Duration optimization (30-45 seconds is optimal)
            duration_score = max(0, 10 - abs(clip['duration'] - 37.5) / 5)
            
            ai_score = min(10, (hook_score + engagement_score + viral_score + question_score + completeness_score + duration_score) / 2)
            
            clip['ai_score'] = ai_score
            clip['recommended'] = ai_score >= 5.0
            clip['viral_score'] = viral_score
            clip['coherence_score'] = completeness_score * 2
            clip['engagement_score'] = engagement_score
            clip['technical_score'] = 10 - (text.count('um') + text.count('uh')) * 2
            
        return clips

class SmartClipExtractor:
    def __init__(self, gemini_api_key: str = None):
        self.model = None
        self.model_name = "sentence-transformers/all-MiniLM-L6-v2"
        self.gemini = GeminiClipAnalyzer(gemini_api_key)
    
    def _get_model(self):
        if self.model is None:
            print("Loading sentence transformer model...")
            self.model = SentenceTransformer(self.model_name)
        return self.model

    def generate_topic_based_clips(self, transcript: List[Dict], 
                                 min_duration: float = 10, 
                                 max_duration: float = 120) -> List[Dict]:
        if not transcript:
            return []
        
        clips = []
        
        # Method 1: Sentence-based natural clips
        clips.extend(self._generate_sentence_clips(transcript, min_duration, max_duration))
        
        # Method 2: Topic transition clips
        clips.extend(self._generate_topic_transition_clips(transcript, min_duration, max_duration))
        
        # Method 3: Question-answer clips
        clips.extend(self._generate_qa_clips(transcript, min_duration, max_duration))
        
        return clips

    def _generate_sentence_clips(self, transcript: List[Dict], min_duration: float, max_duration: float) -> List[Dict]:
        """Generate clips based on complete sentences and thoughts"""
        clips = []
        current_clip = []
        current_start = None
        
        for i, seg in enumerate(transcript):
            if current_start is None:
                current_start = seg['start']
            
            current_clip.append(seg)
            current_text = ' '.join([s['text'] for s in current_clip])
            current_end = seg['start'] + seg.get('duration', 0)
            current_duration = current_end - current_start
            
            # Check if this is a natural stopping point
            is_sentence_end = seg['text'].strip().endswith(('.', '!', '?'))
            is_long_pause = (i < len(transcript) - 1 and 
                           transcript[i + 1]['start'] - current_end > 2.0)  # 2+ second pause
            is_topic_keyword = any(word in current_text.lower() for word in 
                                 ['first', 'second', 'next', 'finally', 'in conclusion', 
                                  'moving on', 'another thing', 'now let\'s', 'so basically'])
            
            should_end_clip = (is_sentence_end and current_duration >= min_duration) or \
                            (is_long_pause and current_duration >= min_duration) or \
                            (is_topic_keyword and current_duration >= min_duration) or \
                            current_duration >= max_duration
            
            if should_end_clip:
                if current_duration >= min_duration:
                    clips.append({
                        'text': current_text.strip(),
                        'start': current_start,
                        'duration': current_duration,
                        'end': current_end,
                        'timestamp': str(timedelta(seconds=int(current_start))),
                        'score': self._calculate_topic_score(current_text, current_duration),
                        'clip_type': 'sentence_based'
                    })
                
                # Reset for next clip
                current_clip = []
                current_start = None
        
        return clips

    def _generate_topic_transition_clips(self, transcript: List[Dict], min_duration: float, max_duration: float) -> List[Dict]:
        """Generate clips around topic transitions and key phrases"""
        clips = []
        
        transition_keywords = [
            'let me explain', 'here\'s the thing', 'what\'s interesting',
            'the problem is', 'the solution', 'here\'s why', 'the key point',
            'most importantly', 'the bottom line', 'in other words',
            'for example', 'imagine this', 'think about it'
        ]
        
        for i, seg in enumerate(transcript):
            text_lower = seg['text'].lower()
            
            if any(keyword in text_lower for keyword in transition_keywords):
                # Found a transition, create clip around it
                start_idx = max(0, i - 2)  # Start 2 segments before
                end_idx = min(len(transcript) - 1, i + 10)  # End up to 10 segments after
                
                clip_start = transcript[start_idx]['start']
                clip_segments = transcript[start_idx:end_idx + 1]
                
                # Find natural ending within max_duration
                for j, end_seg in enumerate(clip_segments):
                    current_end = end_seg['start'] + end_seg.get('duration', 0)
                    current_duration = current_end - clip_start
                    
                    if current_duration > max_duration:
                        break
                    
                    if (current_duration >= min_duration and 
                        end_seg['text'].strip().endswith(('.', '!', '?'))):
                        
                        combined_text = ' '.join([s['text'] for s in clip_segments[:j+1]])
                        clips.append({
                            'text': combined_text.strip(),
                            'start': clip_start,
                            'duration': current_duration,
                            'end': current_end,
                            'timestamp': str(timedelta(seconds=int(clip_start))),
                            'score': self._calculate_topic_score(combined_text, current_duration) + 0.3,  # Bonus for transitions
                            'clip_type': 'topic_transition'
                        })
                        break
        
        return clips

    def _generate_qa_clips(self, transcript: List[Dict], min_duration: float, max_duration: float) -> List[Dict]:
        """Generate clips around questions and their answers"""
        clips = []
        
        for i, seg in enumerate(transcript):
            if '?' in seg['text']:
                # Found a question, create clip for question + answer
                start_idx = max(0, i - 1)  # Start 1 segment before question
                clip_start = transcript[start_idx]['start']
                
                # Look for the answer (next 15 segments or until next question)
                current_segments = [transcript[start_idx]]
                
                for j in range(start_idx + 1, min(len(transcript), start_idx + 15)):
                    current_segments.append(transcript[j])
                    current_end = transcript[j]['start'] + transcript[j].get('duration', 0)
                    current_duration = current_end - clip_start
                    
                    if current_duration > max_duration:
                        break
                    
                    # Stop at natural ending or next question
                    if (current_duration >= min_duration and 
                        (transcript[j]['text'].strip().endswith(('.', '!')) or
                         (j < len(transcript) - 1 and '?' in transcript[j + 1]['text']))):
                        
                        combined_text = ' '.join([s['text'] for s in current_segments])
                        clips.append({
                            'text': combined_text.strip(),
                            'start': clip_start,
                            'duration': current_duration,
                            'end': current_end,
                            'timestamp': str(timedelta(seconds=int(clip_start))),
                            'score': self._calculate_topic_score(combined_text, current_duration) + 0.4,  # Bonus for Q&A
                            'clip_type': 'question_answer'
                        })
                        break
        
        return clips

    def _calculate_topic_score(self, text: str, duration: float) -> float:
        """Calculate score based on topic coherence and engagement"""
        words = text.split()
        word_count = len(words)
        
        # Content completeness
        completeness_score = 1.5 if text.strip().endswith(('.', '!', '?')) else 0.7
        
        # Optimal length (focus on content, not arbitrary timing)
        if 20 <= word_count <= 150:  # Good word count range
            length_score = 1.0
        elif word_count < 20:
            length_score = word_count / 20  # Penalty for too short
        else:
            length_score = max(0.3, 1.0 - (word_count - 150) / 100)  # Penalty for too long
        
        # Engagement indicators
        engagement_words = ['you', 'your', 'we', 'us', 'think', 'believe', 'imagine', 'consider']
        engagement_score = 1.0 + min(0.5, sum(1 for word in words if word.lower() in engagement_words) / word_count)
        
        # Hook potential
        hook_indicators = ['secret', 'amazing', 'shocking', 'never', 'always', 'why', 'how', 'what']
        hook_score = 1.0 + min(0.4, sum(1 for word in words if word.lower() in hook_indicators) / word_count)
        
        # Question bonus
        question_score = 1.2 if '?' in text else 1.0
        
        # Story/explanation indicators
        story_words = ['because', 'so', 'then', 'but', 'however', 'therefore', 'first', 'next', 'finally']
        story_score = 1.0 + min(0.3, sum(1 for word in words if word.lower() in story_words) / word_count)
        
        # Filler penalty
        filler_words = ['um', 'uh', 'like', 'you know', 'so', 'well', 'actually']
        filler_ratio = sum(1 for word in words if word.lower() in filler_words) / word_count if words else 0
        filler_penalty = max(0.4, 1.0 - filler_ratio * 2)
        
        return completeness_score * length_score * engagement_score * hook_score * question_score * story_score * filler_penalty

    def _calculate_enhanced_base_score(self, text: str, duration: float) -> float:
        words = text.split()
        word_count = len(words)
        
        # Content density
        content_score = min(word_count / 80, 1.0)
        
        # Optimal duration (30-60 seconds for social media)
        optimal_duration = 45
        duration_score = max(0.1, 1.0 - abs(duration - optimal_duration) / optimal_duration)
        
        # Sentence completeness
        completeness_score = 1.5 if text.strip().endswith(('.', '!', '?')) else 0.8
        
        # Engagement indicators
        engagement_words = ['you', 'your', 'we', 'us', 'think', 'believe']
        engagement_score = 1.0 + (sum(1 for word in words if word.lower() in engagement_words) / word_count * 0.5)
        
        # Hook potential (questions, strong statements)
        hook_score = 1.0
        if '?' in text:
            hook_score += 0.3
        if any(word in text.lower() for word in ['secret', 'amazing', 'shocking', 'never', 'always']):
            hook_score += 0.2
        
        # Filler penalty
        filler_words = ['um', 'uh', 'like', 'you know', 'so', 'well', 'actually', 'basically']
        if words:
            filler_ratio = sum(1 for word in words if word.lower() in filler_words) / len(words)
            filler_penalty = max(0.3, 1.0 - filler_ratio * 3)
        else:
            filler_penalty = 0.1
        
        return content_score * duration_score * completeness_score * engagement_score * hook_score * filler_penalty

    def filter_smart_clips(self, clips: List[Dict], video_metadata: Dict = None, 
                          topics: List[str] = None, quality_threshold: float = 6.0) -> List[Dict]:
        """Use AI to filter clips based on quality threshold rather than fixed count"""
        
        # Remove overlaps first
        clips = self._remove_overlaps(clips, 0.3)
        
        # Apply topic filtering if specified
        if topics:
            clips = self._filter_by_topics(clips, topics)
        
        # AI analysis
        analyzed_clips = self.gemini.analyze_clips(clips, video_metadata, topics)
        
        # Filter by quality threshold
        quality_clips = [clip for clip in analyzed_clips if clip.get('ai_score', 0) >= quality_threshold]
        
        if not quality_clips:
            # If no clips meet threshold, take best ones
            print(f"No clips met quality threshold {quality_threshold}, taking top 3...")
            quality_clips = sorted(analyzed_clips, key=lambda x: x.get('ai_score', 0), reverse=True)[:3]
        
        # Sort by AI score
        quality_clips.sort(key=lambda x: x.get('ai_score', 0), reverse=True)
        
        print(f"Selected {len(quality_clips)} clips above quality threshold {quality_threshold}")
        return quality_clips

    def _filter_by_topics(self, clips: List[Dict], topics: List[str]) -> List[Dict]:
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
        
        return clips

    def _remove_overlaps(self, clips: List[Dict], overlap_threshold: float) -> List[Dict]:
        clips_sorted = sorted(clips, key=lambda x: x.get('score', 0), reverse=True)
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

    def _get_video_info(self, video_path: str) -> Tuple[int, int, float]:
        """Get video dimensions and aspect ratio"""
        try:
            cmd = ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_streams', video_path]
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                data = json.loads(result.stdout)
                for stream in data.get('streams', []):
                    if stream.get('codec_type') == 'video':
                        width = int(stream.get('width', 1920))
                        height = int(stream.get('height', 1080))
                        aspect_ratio = width / height
                        return width, height, aspect_ratio
        except:
            pass
        return 1920, 1080, 16/9

    def _create_fit_to_screen_filter(self, video_path: str, target_aspect: str = "9:16") -> str:
        """Create fit-to-screen filter that shows ALL content without cropping"""
        width, height, aspect_ratio = self._get_video_info(video_path)
        
        print(f"Original video: {width}x{height} (aspect: {aspect_ratio:.3f})")
        
        if target_aspect == "9:16":
            target_width, target_height = 1080, 1920
            target_ratio = 9/16
            
            if aspect_ratio > target_ratio:  # Video is wider than target
                # Scale to fit width, add padding top/bottom
                scale_height = int(target_width / aspect_ratio)
                pad_vertical = (target_height - scale_height) // 2
                
                filter_chain = (
                    f"scale={target_width}:{scale_height}:flags=lanczos,"
                    f"pad={target_width}:{target_height}:0:{pad_vertical}:color=black"
                )
                print(f"Fit-to-screen: Scaling to {target_width}x{scale_height} + padding {pad_vertical}px top/bottom")
                
            else:  # Video is taller than or equal to target
                # Scale to fit height, add padding left/right
                scale_width = int(target_height * aspect_ratio)
                pad_horizontal = (target_width - scale_width) // 2
                
                filter_chain = (
                    f"scale={scale_width}:{target_height}:flags=lanczos,"
                    f"pad={target_width}:{target_height}:{pad_horizontal}:0:color=black"
                )
                print(f"Fit-to-screen: Scaling to {scale_width}x{target_height} + padding {pad_horizontal}px left/right")
                
        elif target_aspect == "16:9":
            target_width, target_height = 1920, 1080
            target_ratio = 16/9
            
            if aspect_ratio > target_ratio:  # Video is wider
                scale_height = int(target_width / aspect_ratio)
                pad_vertical = (target_height - scale_height) // 2
                filter_chain = (
                    f"scale={target_width}:{scale_height}:flags=lanczos,"
                    f"pad={target_width}:{target_height}:0:{pad_vertical}:color=black"
                )
            else:  # Video is taller
                scale_width = int(target_height * aspect_ratio)
                pad_horizontal = (target_width - scale_width) // 2
                filter_chain = (
                    f"scale={scale_width}:{target_height}:flags=lanczos,"
                    f"pad={target_width}:{target_height}:{pad_horizontal}:0:color=black"
                )
                
        elif target_aspect == "1:1":
            target_width = target_height = 1080
            
            if aspect_ratio > 1:  # Landscape
                scale_height = target_width
                scale_width = int(scale_height * aspect_ratio)
                pad_horizontal = (target_width - scale_width) // 2
                filter_chain = (
                    f"scale={scale_width}:{scale_height}:flags=lanczos,"
                    f"pad={target_width}:{target_height}:{pad_horizontal}:0:color=black"
                )
            else:  # Portrait or square
                scale_width = target_height
                scale_height = int(scale_width / aspect_ratio)
                pad_vertical = (target_height - scale_height) // 2
                filter_chain = (
                    f"scale={scale_width}:{scale_height}:flags=lanczos,"
                    f"pad={target_width}:{target_height}:0:{pad_vertical}:color=black"
                )
        else:
            # Default: high-quality scaling without aspect change
            filter_chain = "scale=-2:1080:flags=lanczos"
        
        return filter_chain

    def extract_clips_from_video(self, video_bytes: bytes, clips: List[Dict], 
                               output_dir: str = "clips", crop_to_vertical: bool = True,
                               target_aspect: str = "9:16") -> List[str]:
        os.makedirs(output_dir, exist_ok=True)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp_file:
            tmp_file.write(video_bytes)
            video_path = tmp_file.name
        
        output_paths = []
        
        try:
            for i, clip in enumerate(clips):
                output_path = os.path.join(output_dir, f"clip_{i+1:02d}_score{clip.get('ai_score', 0):.1f}.mp4")
                
                if crop_to_vertical:
                    video_filter = self._create_fit_to_screen_filter(video_path, target_aspect)
                    aspect_desc = f"Fit-to-screen {target_aspect} (no content loss)"
                else:
                    video_filter = "scale=-2:1080:flags=lanczos"
                    aspect_desc = "High-quality original aspect"
                
                print(f"Processing clip {i+1} with {aspect_desc}...")
                
                cmd = [
                    'ffmpeg', '-y',
                    '-ss', str(clip['start']),
                    '-i', video_path,
                    '-t', str(clip['duration']),
                    '-vf', video_filter,
                    '-c:v', 'libx264',
                    '-crf', '18',  # High quality
                    '-preset', 'medium',
                    '-profile:v', 'high',
                    '-level:v', '4.0',
                    '-pix_fmt', 'yuv420p',
                    '-c:a', 'aac',
                    '-ar', '48000',
                    '-ac', '2',
                    '-b:a', '192k',
                    '-map', '0:v:0',
                    '-map', '0:a:0?',
                    '-movflags', '+faststart',
                    '-avoid_negative_ts', 'make_zero',
                    output_path
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True)
                
                if result.returncode != 0:
                    print(f"FFmpeg error for clip {i+1}: {result.stderr}")
                    continue
                
                if os.path.exists(output_path):
                    output_paths.append(output_path)
                    file_size = os.path.getsize(output_path) / (1024*1024)
                    
                    print(f"✓ Created clip {i+1}: {clip['duration']:.1f}s - AI Score: {clip.get('ai_score', 0):.2f} - Size: {file_size:.1f}MB")
                    if clip.get('recommended'):
                        print(f"  🔥 RECOMMENDED - Viral Score: {clip.get('viral_score', 0):.1f}")
                    if clip.get('viral_elements'):
                        print(f"  🎯 Viral Elements: {', '.join(clip['viral_elements'][:3])}")
                    print(f"  📝 Text: {clip['text'][:100]}...")
                
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

    def create_smart_clips(self, video_url: str, topics: List[str] = None, 
                          quality_threshold: float = 6.0, min_duration: float = 15,
                          max_duration: float = 90, output_dir: str = "smart_clips", 
                          crop_to_vertical: bool = True, target_aspect: str = "9:16") -> List[str]:
        
        extractor = YouTubeExtractor()
        transcript, video_bytes, metadata = extractor.extract_all(video_url)
        
        if not transcript:
            print("❌ No transcript found. Cannot generate clips.")
            return []
        
        if not video_bytes:
            print("❌ Failed to download video. Cannot extract clips.")
            return []
        
        print(f"🎥 Processing video: {metadata.get('title', 'Unknown') if metadata else 'Unknown'}")
        print(f"📊 Transcript segments: {len(transcript)}")
        
        # Generate topic-based clips (not timing-based!)
        candidates = self.generate_topic_based_clips(transcript, min_duration, max_duration)
        print(f"🎬 Generated {len(candidates)} topic-based clips")
        
        # Show clip types distribution
        clip_types = {}
        for clip in candidates:
            clip_type = clip.get('clip_type', 'unknown')
            clip_types[clip_type] = clip_types.get(clip_type, 0) + 1
        
        print(f"📊 Clip types: {dict(clip_types)}")
        
        # Smart filtering with AI
        selected_clips = self.filter_smart_clips(
            candidates, metadata, topics, quality_threshold
        )
        
        if not selected_clips:
            print("❌ No suitable clips found above quality threshold.")
            return []
        
        print(f"🎯 Selected {len(selected_clips)} high-quality clips")
        
        # Extract clips
        clip_paths = self.extract_clips_from_video(
            video_bytes, selected_clips, output_dir, crop_to_vertical, target_aspect
        )
        
        # Print summary
        if clip_paths:
            print(f"\n🎉 Successfully created {len(clip_paths)} smart clips:")
            for i, (path, clip) in enumerate(zip(clip_paths, selected_clips), 1):
                score = clip.get('ai_score', 0)
                recommended = "🔥 VIRAL" if clip.get('recommended') and score >= 7 else "✅ GOOD"
                print(f"  {i}. {recommended} - Score: {score:.1f} - {os.path.basename(path)}")
        
        return clip_paths

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Smart YouTube clip extraction with AI analysis')
    parser.add_argument('url', help='YouTube video URL')
    parser.add_argument('--topics', nargs='+', help='Topics to filter clips by')
    parser.add_argument('--threshold', type=float, default=6.0, help='Quality threshold (0-10, default: 6.0)')
    parser.add_argument('--min-duration', type=float, default=10, help='Min duration in seconds (default: 10)')
    parser.add_argument('--max-duration', type=float, default=120, help='Max duration in seconds (default: 120)')
    parser.add_argument('--output-dir', default='smart_clips', help='Output directory (default: smart_clips)')
    parser.add_argument('--no-fit', action='store_true', help='Keep original aspect ratio (no fit-to-screen)')
    parser.add_argument('--aspect', choices=['9:16', '16:9', '1:1'], default='9:16', help='Target aspect ratio (default: 9:16)')
    parser.add_argument('--gemini-key', help='Gemini API key (or set GEMINI_API_KEY env var)')
    
    args = parser.parse_args()
    
    # Set Gemini API key if provided
    if args.gemini_key:
        os.environ['GEMINI_API_KEY'] = args.gemini_key
    
    extractor = SmartClipExtractor(gemini_api_key=args.gemini_key)
    
    clips = extractor.create_smart_clips(
        video_url=args.url,
        topics=args.topics,
        quality_threshold=args.threshold,
        min_duration=args.min_duration,
        max_duration=args.max_duration,
        output_dir=args.output_dir,
        crop_to_vertical=not args.no_fit,
        target_aspect=args.aspect
    )
    
    if clips:
        print(f"\n🎯 Find your clips in the '{args.output_dir}' directory!")
        print("\n📊 CLIP ANALYSIS SUMMARY:")
        
        # Load and display detailed analysis
        for i, path in enumerate(clips, 1):
            file_size = os.path.getsize(path) / (1024*1024)
            print(f"\n{i}. {os.path.basename(path)}")
            print(f"   📁 Size: {file_size:.1f}MB")
            print(f"   🎯 Ready for: TikTok, Instagram Reels, YouTube Shorts")
    else:
        print(f"\n❌ No clips were generated. Try lowering the threshold (--threshold) or check video content.")