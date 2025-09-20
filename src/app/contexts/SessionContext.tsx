
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface ReelData {
  transcript: string;
  topics: string;
  videoBlob: Blob;
  videoUrl?: string; // This will be recreated as needed
}

interface SessionContextType {
  setVideoLink: (videoLink: string) => void;
  videoLink: string;
  reels: ReelData[];
  setReels: (reels: ReelData[]) => void;
  getReelVideoUrl: (index: number) => string | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [videoLink, setVideoLink] = useState<string>("");
  const [reels, setReels] = useState<ReelData[]>([]);
  const [blobUrls, setBlobUrls] = useState<Map<number, string>>(new Map());

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      blobUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [blobUrls]);

  useEffect(() => {
    const storedVideoLink = localStorage.getItem('videoLink');
    if (storedVideoLink && storedVideoLink !== "undefined") {
      setVideoLink(JSON.parse(storedVideoLink));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('videoLink', JSON.stringify(videoLink));
  }, [videoLink]);

  // Store reels with blob data in IndexedDB for persistence
  useEffect(() => {
    if (reels.length > 0) {
      // Store in IndexedDB for blob persistence
      storeReelsInIndexedDB(reels);
    }
  }, [reels]);

  // Load reels from IndexedDB on mount
  useEffect(() => {
    loadReelsFromIndexedDB().then(loadedReels => {
      if (loadedReels.length > 0) {
        setReels(loadedReels);
      }
    });
  }, []);

  // Create blob URLs for all reels when reels change
  useEffect(() => {
    const newBlobUrls = new Map<number, string>();
    
    reels.forEach((reel, index) => {
      if (reel && reel.videoBlob) {
        const url = URL.createObjectURL(reel.videoBlob);
        newBlobUrls.set(index, url);
      }
    });
    
    // Clean up old URLs
    blobUrls.forEach(url => URL.revokeObjectURL(url));
    
    setBlobUrls(newBlobUrls);
  }, [reels]);

  const getReelVideoUrl = (index: number): string | null => {
    if (index < 0 || index >= reels.length) return null;
    return blobUrls.get(index) || null;
  };

  return (
    <SessionContext.Provider value={{ 
      setVideoLink,
      videoLink,
      reels,
      setReels,
      getReelVideoUrl,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

// IndexedDB functions for persistent blob storage
async function storeReelsInIndexedDB(reels: ReelData[]) {
  try {
    const db = await openDB();
    const tx = db.transaction(['reels'], 'readwrite');
    const store = tx.objectStore('reels');
    
    // Clear existing data
    await store.clear();
    
    // Store each reel
    for (let i = 0; i < reels.length; i++) {
      await store.put(reels[i], i);
    }
  } catch (error) {
    console.error('Error storing reels in IndexedDB:', error);
  }
}

async function loadReelsFromIndexedDB(): Promise<ReelData[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(['reels'], 'readonly');
    const store = tx.objectStore('reels');
    const reels: ReelData[] = [];
    
    const request = store.openCursor();
    return new Promise<ReelData[]>((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
        if (cursor) {
          reels.push(cursor.value as ReelData);
          cursor.continue();
        } else {
          resolve(reels);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error loading reels from IndexedDB:', error);
    return [];
  }
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ReelReviewDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('reels')) {
        db.createObjectStore('reels');
      }
    };
  });
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
} 

