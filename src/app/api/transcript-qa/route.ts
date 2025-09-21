import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
});

export async function POST(request: NextRequest) {
    try {
        const { question, transcript } = await request.json();

        if (!question || !transcript) {
            return NextResponse.json(
                { error: 'Question and transcript are required' },
                { status: 400 }
            );
        }

        // Create a searchable transcript text with segment indices
        const transcriptWithIndices = transcript.map((segment: any, index: number) => ({
            index,
            timestamp: segment.timestamp,
            text: segment.text,
            searchText: `[${index}] ${segment.timestamp}: ${segment.text}`
        }));

        const fullTranscriptText = transcriptWithIndices
            .map((item: any) => item.searchText)
            .join('\n');

        const prompt = `
You are an AI assistant that helps users find information in video transcripts. 
Given a user's question and a transcript with indexed segments, you need to:

1. Find the most relevant segments that answer the question
2. Provide a comprehensive answer based on those segments
3. Return the indices of ONLY the top 3 most relevant segments

Question: ${question}

Transcript (each line starts with [index] timestamp: text):
${fullTranscriptText}

Please analyze the transcript and provide:
1. A clear, helpful answer to the question
2. The indices of the TOP 3 most relevant transcript segments (as an array of numbers, maximum 3 items)

Focus on accuracy and relevance. Only include segments that directly address the question. If the question cannot be answered from the transcript, say so clearly and return an empty array for segments.
`;

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        answer: {
                            type: Type.STRING,
                            description: "A comprehensive answer to the user's question based on the transcript"
                        },
                        relevantSegments: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.NUMBER,
                                description: "Index of a relevant transcript segment"
                            },
                            description: "Array of indices of the top 3 most relevant transcript segments (maximum 3 items)",
                            maxItems: 3
                        },
                        confidence: {
                            type: Type.STRING,
                            enum: ["high", "medium", "low"],
                            description: "Confidence level in the answer"
                        }
                    },
                    required: ["answer", "relevantSegments", "confidence"]
                },
                temperature: 0.3
            }
        });

        const result = JSON.parse(response.text || '{}');

        // Validate that the segment indices are within bounds and limit to top 3
        const validSegments = result.relevantSegments?.filter(
            (index: number) => index >= 0 && index < transcript.length
        ).slice(0, 3) || [];

        return NextResponse.json({
            answer: result.answer || "I couldn't find a relevant answer in the transcript.",
            relevantSegments: validSegments,
            confidence: result.confidence || "low"
        });

    } catch (error) {
        console.error('Error in transcript Q&A:', error);
        return NextResponse.json(
            { error: 'Failed to process question' },
            { status: 500 }
        );
    }
}
