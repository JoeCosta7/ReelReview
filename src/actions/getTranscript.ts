'use server';

import { GoogleGenAI, Type } from '@google/genai';

const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
});

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

async function getSummary(transcript: string): Promise<any> {
    const prompt = `
    Summarize the following transcript into main topics, each with a summary of their
    key points from the transcript. Use the tool provided to format your response. Make
    sure to include all main topics and their key points.
    Transcript: ${transcript}
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
                            topic: { type: Type.STRING },
                            summary: { type: Type.STRING }
                        },
                        required: ["topic", "summary"]
                    } 
                }
            },
            required: ["topics"],
            propertyOrdering: ["topics"]
            },
            temperature: 0,
            maxOutputTokens: 2048
        }
    });
    return JSON.parse(response.text || '')?.topics || [];
}

async function chooseImportantClips(transcript: string, data.videobytes): Promise<any> {
    const prompt = `
}

export default getTranscript;