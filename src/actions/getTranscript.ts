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
    return [data.transcript, data.direct_video_url];
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
                            summary: { type: Type.STRING, description: "A summary of the topic you have chosen, this should be at a 5th grade level" }
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
    Choose the most important and relevant clips from the transcript based on the topics.
    The clips chosen should have a start time and end time.
    The clips chosen should be the most important clips from the transcript based on the topics.
    The clips chosen should be 30 seconds to 1 minute long.
    The clips chosen should have transcripts that are fully relevant to the topic!
    IMPORTANT: TO NOT CUT OFF THE SPEAKER, MAKE SURE THE END TIME IS AT THE START OF THE NEXT SENTENCE!
    Transcript: ${JSON.stringify(transcript)}
    Topics: ${JSON.stringify(topics)}
    `;
    const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
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
                                topic: { type: Type.STRING, description: "The topic of the clip, this should be as short as possible. IMPORTANT: IF 2 CLIPS HAVE SAME TOPIC, MODIFY THE TOPIC NAMES TO BE MORE SPECIFIC" },
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

async function getClips(clips: any, direct_video_url: any): Promise<any> {
    const clipsWithBytes = [];
    
    for (let i = 0; i < clips.length; i++) {
        const clip = clips[i];
        console.log(`Processing clip ${i + 1}/${clips.length}: ${clip.start_time}s - ${clip.end_time}s`);
        
        try {
            // Use the new efficient endpoint that streams directly from URL
            const response = await fetch(`${process.env.FLASK_SERVER_URL}/get_clip_from_url`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    start_time: clip.start_time, 
                    end_time: clip.end_time, 
                    direct_video_url: direct_video_url 
                }),
                // Reduced timeout since this should be much faster
                signal: AbortSignal.timeout(120000) // 2 minute timeout
            });

            if (!response.ok) {
                console.error(`Failed to fetch clip ${i + 1}:`, response.status, response.statusText);
                // Continue with other clips even if one fails
                clip.clip_bytes = null;
                clipsWithBytes.push(clip);
                continue;
            }

            const data = await response.json();
            clip.clip_bytes = data.clip_bytes;
            clipsWithBytes.push(clip);
            
            console.log(`Successfully processed clip ${i + 1}/${clips.length}`);
            
        } catch (error) {
            console.error(`Error processing clip ${i + 1}:`, error);
            // Continue with other clips even if one fails
            clip.clip_bytes = null;
            clipsWithBytes.push(clip);
        }
    }
    
    return clipsWithBytes;
}
export { getTranscript, getSummary, chooseImportantClips, getClips };
