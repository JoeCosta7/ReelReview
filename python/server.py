from linkextraction import getTranscript, getVideoClip, getVideoClipFromUrl
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/get_transcript', methods=['POST'])
def get_transcript():
    if not request.is_json:
        return jsonify({'error': 'Expected JSON body'}), 400

    data = request.get_json()
    video_url = data.get('video_url')

    if not video_url:
        return jsonify({'error': 'No video URL provided'}), 400

    try:
        result = getTranscript(video_url)
    except Exception as e:
        return jsonify({'error': f'Internal error during transcription: {e}'}), 500

    if result is None:
        return jsonify({'error': 'Failed to retrieve or generate transcript'}), 500

    return jsonify({
        'transcript': result['transcript'],
        'direct_video_url': result.get('direct_video_url')
    })

@app.route('/get_clip', methods=['POST'])
def get_clip():
    if not request.is_json:
        return jsonify({'error': 'Expected JSON body'}), 400

    data = request.get_json()
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    video_bytes_b64 = data.get('video_bytes')

    if not start_time or not end_time or not video_bytes_b64:
        return jsonify({'error': 'Missing start_time, end_time, or video_bytes'}), 400
    
    try:
        # Decode base64 video bytes to binary
        import base64
        print(f"Decoding video bytes for clip {start_time}s - {end_time}s")
        video_bytes = base64.b64decode(video_bytes_b64)
        print(f"Video bytes decoded: {len(video_bytes)} bytes")
        
        # Generate the clip with binary video bytes only (no transcript)
        print(f"Generating clip...")
        clip_bytes = getVideoClip(video_bytes, start_time, end_time)
        
        if not clip_bytes:
            print("Failed to generate video clip - no bytes returned")
            return jsonify({'error': 'Failed to generate video clip'}), 500
        
        print(f"Clip generated: {len(clip_bytes)} bytes")
        
        # Convert clip_bytes to base64 for JSON response
        clip_bytes_b64 = base64.b64encode(clip_bytes).decode('utf-8')
        print(f"Clip encoded to base64: {len(clip_bytes_b64)} characters")
        
        return jsonify({'clip_bytes': clip_bytes_b64})
        
    except Exception as e:
        print(f"Error generating clip: {str(e)}")
        return jsonify({'error': f'Error generating clip: {str(e)}'}), 500

@app.route('/get_clip_from_url', methods=['POST'])
def get_clip_from_url():
    """Efficient endpoint that streams video directly from URL to create clips"""
    if not request.is_json:
        return jsonify({'error': 'Expected JSON body'}), 400

    data = request.get_json()
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    direct_video_url = data.get('direct_video_url')

    if not start_time or not end_time or not direct_video_url:
        return jsonify({'error': 'Missing start_time, end_time, or direct_video_url'}), 400
    
    try:
        print(f"Creating clip {start_time}s - {end_time}s from direct URL")
        
        # Generate the clip directly from URL (much more efficient!)
        clip_bytes = getVideoClipFromUrl(direct_video_url, start_time, end_time)
        
        if not clip_bytes:
            print("Failed to generate video clip - no bytes returned")
            return jsonify({'error': 'Failed to generate video clip'}), 500
        
        print(f"Clip generated: {len(clip_bytes)} bytes")
        
        # Convert clip_bytes to base64 for JSON response
        import base64
        clip_bytes_b64 = base64.b64encode(clip_bytes).decode('utf-8')
        print(f"Clip encoded to base64: {len(clip_bytes_b64)} characters")
        
        return jsonify({'clip_bytes': clip_bytes_b64})
        
    except Exception as e:
        print(f"Error generating clip: {str(e)}")
        return jsonify({'error': f'Error generating clip: {str(e)}'}), 500


if __name__ == '__main__':
    # Run with: python server.py (from the `python` folder)
    app.run(host='0.0.0.0', port=8081, debug=True)
