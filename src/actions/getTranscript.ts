'use server';

import { GoogleGenAI, Type } from '@google/genai';

const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
});

async function getTranscript(link: any): Promise<any> {
    if (link.trim() === '') {
        return "";
    }
    
    const response = await fetch(`${process.env.FLASK_SERVER_URL}/get_transcript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_url: link }),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch transcript');
    }

    const data = await response.json();
    return [data.transcript, data.video_bytes];
}

async function getSummary(transcript: any): Promise<any> {
    const prompt = `
    Summarize the following transcript into main topics, each with a summary of their
    key points from the transcript. Use the tool provided to format your response. Make
    sure to include all main topics and their key points.
    Transcript: ${JSON.stringify(transcript)}
    `;
    const response = await client.models.generateContent({
        model: 'gemini-2.0-flash-lite',
        contents: [{ role: 'user', parts: [{text: prompt}] }],
        config: {
            // Force Structured Output:
            responseMimeType: "application/json",
            responseSchema: {
            type: Type.OBJECT,
            properties: {
                topics: { 
                    type: Type.ARRAY, 
                    items: { 
                        type: Type.OBJECT,
                        properties: {
                            topic: { type: Type.STRING, description: "A main topic of the transcript" },
                            summary: { type: Type.STRING, description: "A summary of the topic you have chosen" }
                        },
                        description: "A list of main topics from the transcript",
                        required: ["topic", "summary"]
                    } 
                }
            },
            required: ["topics"],
            propertyOrdering: ["topics"]
            },
            temperature: 0
        }
    });
    return JSON.parse(response.text || '')?.topics || [];
}

async function chooseImportantClips(transcript: any, topics: any): Promise<any> {
    const prompt = `
    Choose the most important clips from the transcript based on the topics.
    The clips chosen should have a start time and end time.
    The clips chosen should be the most important clips from the transcript based on the topics.
    The clips chosen should be 30 seconds to 1 minute long.
    Transcript: ${JSON.stringify(transcript)}
    Topics: ${JSON.stringify(topics)}
    `;
    const response = await client.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{text: prompt}] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    clips: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                topic: { type: Type.STRING, description: "The topic of the clip" },
                                summary: { type: Type.STRING, description: "The summary of the topic" },
                                start_time: { type: Type.NUMBER, description: "The start time of the clip" },
                                end_time: { type: Type.NUMBER, description: "The end time of the clip" }
                            },
                            required: ["topic", "summary", "start_time", "end_time"]
                        },
                        description: "A list of clips from the transcript"
                    }
                },
                required: ["clips"],
                propertyOrdering: ["clips"]
            },
            temperature: 0.5
        }
    });
    return JSON.parse(response.text || '')?.clips || [];
}

async function getClips(clips: any, video_bytes: any): Promise<any> {
    const clipsWithBytes = [];
    for (const clip of clips) {
        const response = await fetch(`${process.env.FLASK_SERVER_URL}/get_clip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ start_time: clip.start_time, end_time: clip.end_time, video_bytes: video_bytes }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch clip');
        }

        const data = await response.json();
        clip.clip_bytes = data.clip_bytes;
        clipsWithBytes.push(clip);
    }
    return clipsWithBytes;
}
export { getTranscript, getSummary, chooseImportantClips, getClips };
