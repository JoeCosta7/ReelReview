'use server';

async function getTranscript(link: string): Promise<any> {
    if (link.trim() === '') {
        return "";
    }
    
    const response = await fetch(`${process.env.FLASK_SERVER_URL}/get_transcript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link }),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch transcript');
    }

    const data = await response.json();
    return data.transcript, data.videobytes;
}

async function chooseImportantClips(transcript: string, data.videobytes): Promise<any> {
    timestart, timeend, summary

    getClip


}

export default getTranscript;