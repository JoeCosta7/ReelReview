import { NextRequest, NextResponse } from 'next/server';
import { getTranscript, getSummary, chooseImportantClips, getClips } from '@/actions/getTranscript';

export async function POST(request: NextRequest) {
  try {
    const { link } = await request.json();

    if (!link || link.trim() === '') {
      return NextResponse.json(
        { error: 'Link is required' },
        { status: 400 }
      );
    }

    // Get transcript and direct video URL
    const [transcript, direct_video_url] = await getTranscript(link);
    
    if (!transcript) {
      return NextResponse.json(
        { error: 'Failed to get transcript' },
        { status: 500 }
      );
    }

    // Get summary of the transcript
    const topics = await getSummary(transcript);
    
    // Choose important clips based on topics
    const clips = await chooseImportantClips(transcript, topics);
    
    // Get actual clip data using efficient streaming
    const clipsWithBytes = await getClips(clips, direct_video_url);

    return NextResponse.json({
      success: true,
      data: {
        transcript,
        topics,
        clips: clipsWithBytes
      }
    });

  } catch (error) {
    console.error('Error in getTranscript API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}