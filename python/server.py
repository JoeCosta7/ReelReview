from linkextraction import getTranscript, getVideoClip
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

    # Convert video_bytes to base64 for JSON serialization
    import base64
    video_bytes_b64 = None
    if result.get('video_bytes'):
        video_bytes_b64 = base64.b64encode(result['video_bytes']).decode('utf-8')

    return jsonify({
        'transcript': result['transcript'],
        'video_bytes': video_bytes_b64
    })

@app.route('/get_clip', methods=['POST'])
def get_clip():
    if not request.is_json:
        return jsonify({'error': 'Expected JSON body'}), 400

    data = request.get_json()
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    video_bytes = data.get('video_bytes')

    if not start_time or not end_time or not video_bytes:
        return jsonify({'error': 'Missing start_time, end_time, or video_bytes'}), 400

    # Convert base64 video_bytes back to binary for processing
    import base64
    video_bytes_binary = base64.b64decode(video_bytes)
    
    clip_bytes = getVideoClip(video_bytes_binary, start_time, end_time)
    
    # Convert clip_bytes to base64 for JSON response
    clip_bytes_b64 = base64.b64encode(clip_bytes).decode('utf-8')
    
    return jsonify({'clip_bytes': clip_bytes_b64})


if __name__ == '__main__':
    # Run with: python server.py (from the `python` folder)
    app.run(host='0.0.0.0', port=8081, debug=True)
