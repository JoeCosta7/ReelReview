from linkextraction import getTranscript
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/transcript', methods=['POST'])
def transcript():
    if not request.is_json:
        return jsonify({'error': 'Expected JSON body'}), 400

    data = request.get_json()
    video_url = data.get('video_url')

    if not video_url:
        return jsonify({'error': 'No video URL provided'}), 400

    try:
        transcript = getTranscript(video_url)
    except Exception as e:
        return jsonify({'error': f'Internal error during transcription: {e}'}), 500

    if transcript is None:
        return jsonify({'error': 'Failed to retrieve or generate transcript'}), 500

    return jsonify({'transcript': transcript})


if __name__ == '__main__':
    # Run with: python server.py (from the `python` folder)
    app.run(host='0.0.0.0', port=5000, debug=True)
