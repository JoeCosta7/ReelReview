import os
import tempfile
from typing import List, Dict
import ffmpeg
from sentence_transformers import SentenceTransformer, util

from linkextraction import extract_youtube_data
import google.generativeai as genai

from datetime import timedelta
import subprocess


# -------------------------------
# STEP 0: Set Gemini API key
# -------------------------------
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# -------------------------------
# STEP 1: Generate transcript with Gemini if missing
# -------------------------------
def generate_transcript_gemini(video_bytes: bytes, lang="en") -> List[Dict]:
    tmp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    tmp_file.write(video_bytes)
    tmp_file.close()
    video_path = tmp_file.name

    transcript_resp = genai.transcribe.create(
        model="gemini-transcribe-v1",
        input=video_path,
        language=lang
    )

    os.remove(video_path)

    segments = []
    for seg in transcript_resp.get("segments", []):
        segments.append({
            "text": seg["text"],
            "start": seg["start"],
            "duration": seg["end"] - seg["start"]
        })
    return segments

# -------------------------------
# STEP 2: Generate candidate clips
# -------------------------------
def generate_candidate_clips(transcript: List[Dict], min_duration=5, max_duration=60) -> List[Dict]:
    clips = []
    for seg in transcript:
        duration = seg["duration"]
        if min_duration <= duration <= max_duration:
            clip = seg.copy()
            clip["score"] = duration  # simple base score
            clips.append(clip)
    return clips

# -------------------------------
# STEP 3: Batch topic filtering
# -------------------------------
def filter_clips_by_topic(clips: List[Dict], topics: List[str], model_name="sentence-transformers/all-MiniLM-L6-v2") -> List[Dict]:
    if not clips or not topics:
        return clips

    model = SentenceTransformer(model_name)

    # Batch encode all clips and topics
    clip_texts = [clip['text'] for clip in clips]
    clip_embeds = model.encode(clip_texts, convert_to_tensor=True, batch_size=32)
    topic_embeds = model.encode(topics, convert_to_tensor=True)

    # Cosine similarity: shape [num_clips, num_topics]
    cos_scores = util.cos_sim(clip_embeds, topic_embeds)

    # Take max similarity per clip
    max_scores, _ = cos_scores.max(dim=1)

    # Assign scores to clips
    for clip, score in zip(clips, max_scores):
        clip['score'] *= float(score)

    # Sort descending by score
    clips.sort(key=lambda x: x['score'], reverse=True)
    return clips

# -------------------------------
# STEP 4: Extract clips from video bytes
# -------------------------------
def extract_clips_from_video(video_bytes: bytes, clips: List[Dict], output_dir="clips") -> List[str]:
    os.makedirs(output_dir, exist_ok=True)
    video_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    video_file.write(video_bytes)
    video_file.close()
    video_path = video_file.name

    output_paths = []
    for i, clip in enumerate(clips):
        out_path = os.path.join(output_dir, f"clip_{i+1}.mp4")
        (
            ffmpeg
            .input(video_path, ss=clip["start"], to=clip["start"] + clip["duration"])
            .output(out_path, codec='libx264', preset='fast', crf=23)
            .overwrite_output()
            .run(quiet=True)
        )
        output_paths.append(out_path)

    os.remove(video_path)
    return output_paths

# -------------------------------
# STEP 5: Full pipeline
# -------------------------------
def create_clips_from_youtube(video_url: str, topics: List[str], top_n=5) -> List[str]:
    transcript, video_bytes = extract_youtube_data(video_url, get_video=True)

    if not transcript:
        print("No transcript found, generating with Gemini...")
        transcript = generate_transcript_gemini(video_bytes)

    candidates = generate_candidate_clips(transcript)
    filtered = filter_clips_by_topic(candidates, topics)
    selected = filtered[:top_n]

    clip_paths = extract_clips_from_video(video_bytes, selected)
    return clip_paths

# -------------------------------
# Example usage
# -------------------------------
if __name__ == "__main__":
    url = "https://www.youtube.com/watch?v=zsLc_Bd66CU"
    topics = ["finance", "oracle", "stocks"]

    clips = create_clips_from_youtube(url, topics, top_n=3)
    print("Generated Clips:")
    for path in clips:
        print(path)
