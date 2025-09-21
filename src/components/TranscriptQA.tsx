"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

interface QAMessage {
  id: string;
  type: 'question' | 'answer';
  content: string;
  relevantSegments?: number[];
}

interface TranscriptQAProps {
  transcript: any[];
  onHighlightSegment: (segmentIndex: number) => void;
  onScrollToSegment: (segmentIndex: number) => void;
}

export default function TranscriptQA({ 
  transcript, 
  onHighlightSegment, 
  onScrollToSegment 
}: TranscriptQAProps) {
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const questionMessage: QAMessage = {
      id: Date.now().toString(),
      type: 'question',
      content: question.trim()
    };

    setMessages(prev => [...prev, questionMessage]);
    setQuestion('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/transcript-qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: questionMessage.content,
          transcript: transcript
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();

      const answerMessage: QAMessage = {
        id: (Date.now() + 1).toString(),
        type: 'answer',
        content: data.answer,
        relevantSegments: data.relevantSegments
      };

      setMessages(prev => [...prev, answerMessage]);

      // Automatically scroll to the first relevant segment
      if (data.relevantSegments && data.relevantSegments.length > 0) {
        setTimeout(() => {
          onScrollToSegment(data.relevantSegments[0]);
          onHighlightSegment(data.relevantSegments[0]);
        }, 500);
      }

    } catch (error) {
      console.error('Error getting answer:', error);
      const errorMessage: QAMessage = {
        id: (Date.now() + 1).toString(),
        type: 'answer',
        content: 'Sorry, I encountered an error while processing your question. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSegmentClick = (segmentIndex: number) => {
    onScrollToSegment(segmentIndex);
    onHighlightSegment(segmentIndex);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-3">
          <Bot className="w-6 h-6 text-blue-600" />
          Ask about the transcript
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          Ask any question about the video content and I'll find the relevant parts for you.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Ask me anything!</p>
            <p className="text-sm">
              I can help you find specific information in the transcript.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'question' ? 'justify-end' : 'justify-start'} mb-6`}
          >
            <div
              className={`max-w-[85%] rounded-xl p-4 ${
                message.type === 'question'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex items-start gap-3">
                {message.type === 'question' ? (
                  <User className="w-5 h-5 mt-0.5 flex-shrink-0" />
                ) : (
                  <Bot className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
                )}
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  {message.relevantSegments && message.relevantSegments.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-3 font-medium">
                        Most relevant sections ({message.relevantSegments.length}/3):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {message.relevantSegments.map((segmentIndex, idx) => (
                          <button
                            key={segmentIndex}
                            onClick={() => handleSegmentClick(segmentIndex)}
                            className={`text-xs px-3 py-1.5 rounded-md hover:bg-blue-200 transition-colors ${
                              idx === 0 
                                ? 'bg-blue-200 text-blue-900 font-medium' 
                                : 'bg-blue-100 text-blue-800'
                            }`}
                            title={`Relevance rank: ${idx + 1}`}
                          >
                            {transcript[segmentIndex]?.timestamp || `Segment ${segmentIndex + 1}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start mb-6">
            <div className="bg-gray-100 rounded-xl p-4 max-w-[85%]">
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 text-blue-600" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about the transcript..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
