#!/usr/bin/env python3
"""
Test script for the getVideoClip function
"""

import os
import sys
import requests
import yt_dlp
from pathlib import Path

# Import your module (replace 'your_module_name' with the actual filename)
try:
    from linkextraction import getVideoClip  # Replace with your actual module name
except ImportError as e:
    print(f"❌ Error importing getVideoClip: {e}")
    print("Make sure your module file is in the same directory or in your Python path")
    sys.exit(1)

def download_test_video(url: str, output_path: str) -> bool:
    """Download a test video from YouTube for testing."""
    print(f"📥 Downloading test video from: {url}")
    
    ydl_opts = {
        'format': 'mp4/best',
        'outtmpl': output_path,
        'quiet': True,
        'no_warnings': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        
        if os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            print(f"✅ Downloaded: {file_size / (1024*1024):.1f} MB")
            return True
        else:
            print("❌ Download failed - file not found")
            return False
            
    except Exception as e:
        print(f"❌ Download failed: {e}")
        return False

def load_video_bytes(video_path: str) -> bytes:
    """Load video file into bytes."""
    try:
        with open(video_path, 'rb') as f:
            video_bytes = f.read()
        print(f"📁 Loaded video: {len(video_bytes) / (1024*1024):.1f} MB")
        return video_bytes
    except Exception as e:
        print(f"❌ Failed to load video: {e}")
        return b""

def test_getVideoClip():
    """Main test function."""
    print("🧪 Testing getVideoClip function")
    print("=" * 50)
    
    # Test video URL (short video with clear speech)
    test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"  # Rick Roll (short, clear audio)
    # Alternative test URLs you can try:
    # test_url = "https://www.youtube.com/watch?v=zsLc_Bd66CU"  # Your original test
    # test_url = "https://www.youtube.com/watch?v=jNQXAC9IVRw"  # Me at the zoo (short)
    
    video_path = "test_video.mp4"
    output_path = "test_output_clip.mp4"
    
    # Step 1: Download test video
    if not os.path.exists(video_path):
        success = download_test_video(test_url, video_path)
        if not success:
            print("❌ Could not download test video. Try using a local video file instead.")
            return False
    else:
        print(f"✅ Using existing test video: {video_path}")
    
    # Step 2: Load video into bytes
    video_bytes = load_video_bytes(video_path)
    if not video_bytes:
        return False
    
    # Step 3: Test the getVideoClip function
    print("\n🎬 Testing getVideoClip...")
    print("Parameters:")
    print(f"  - Start time: 10.0 seconds")
    print(f"  - End time: 25.0 seconds")
    print(f"  - Duration: 15.0 seconds")
    
    try:
        # Call your function
        result_bytes = getVideoClip(video_bytes, start_time=10.0, end_time=25.0)
        
        if result_bytes:
            # Save the result
            with open(output_path, 'wb') as f:
                f.write(result_bytes)
            
            output_size = len(result_bytes)
            print(f"✅ Success! Generated clip: {output_size / (1024*1024):.1f} MB")
            print(f"📁 Output saved to: {output_path}")
            
            # Verify the output file
            if os.path.exists(output_path):
                file_size = os.path.getsize(output_path)
                if file_size > 1000:  # More than 1KB
                    print("✅ Output file looks valid")
                    print(f"🎉 TEST PASSED!")
                    print(f"\nYou can now play '{output_path}' to verify:")
                    print(f"  - The clip should be 15 seconds long")
                    print(f"  - It should be in vertical format (1080x1920)")
                    print(f"  - It should have subtitles at the bottom")
                    return True
                else:
                    print("❌ Output file is too small - likely corrupted")
                    return False
            else:
                print("❌ Output file was not created")
                return False
        else:
            print("❌ getVideoClip returned empty bytes")
            return False
            
    except Exception as e:
        print(f"❌ Error calling getVideoClip: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_with_local_file():
    """Test with a local video file if you have one."""
    print("\n📁 Testing with local file...")
    
    # Look for common video files in current directory
    video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm']
    local_videos = []
    
    for ext in video_extensions:
        local_videos.extend(Path('.').glob(f'*{ext}'))
    
    if local_videos:
        video_file = str(local_videos[0])
        print(f"Found local video: {video_file}")
        
        video_bytes = load_video_bytes(video_file)
        if video_bytes:
            print("Testing with 5-second clip from 0s to 5s...")
            result_bytes = getVideoClip(video_bytes, 0.0, 5.0)
            
            if result_bytes:
                with open("local_test_clip.mp4", 'wb') as f:
                    f.write(result_bytes)
                print("✅ Local test successful! Check 'local_test_clip.mp4'")
                return True
    
    print("No local video files found for testing")
    return False

if __name__ == "__main__":
    print("🚀 Starting getVideoClip tests...")
    
    # Test 1: With YouTube video
    success1 = test_getVideoClip()
    
    # Test 2: With local file (if available)
    success2 = test_with_local_file()
    
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY:")
    print(f"YouTube test: {'✅ PASSED' if success1 else '❌ FAILED'}")
    print(f"Local file test: {'✅ PASSED' if success2 else '❌ SKIPPED/FAILED'}")
    
    if success1 or success2:
        print("🎉 At least one test passed! Your function is working.")
        print("\n💡 Next steps:")
        print("1. Play the generated video files to verify quality")
        print("2. Check that subtitles are visible and accurate")
        print("3. Verify the video format is vertical (1080x1920)")
    else:
        print("❌ All tests failed. Check the error messages above.")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure all dependencies are installed (ffmpeg, whisper, etc.)")
        print("2. Check that ffmpeg is in your system PATH")
        print("3. Try with a different test video URL")
        print("4. Check your internet connection for YouTube downloads")