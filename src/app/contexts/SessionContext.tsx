
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import getMembers, { getImageBlob } from '@/actions/getMembers'
import getApplicationStatus from '@/actions/getApplicationStatus'


interface Member {
  id: string;
  name: string;
  position: string;
  image: string | null;
  [key: string]: any;
}

interface SessionContextType {
  setMembers: (members: Member[]) => void;
  members: Member[];
  loadMembers: () => Promise<void>;
  applicationStatus: {isOpen: boolean, applicationsLink: string, applicationDeadline: string} | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [applicationStatus, setApplicationStatus] = useState<{isOpen: boolean, applicationsLink: string, applicationDeadline: string} | null>(null);

  useEffect(() => {
    const storedMembers = localStorage.getItem('members');
    if (storedMembers) {
      setMembers(JSON.parse(storedMembers));
    }
    loadMembers();
    loadApplicationStatus();
  }, []);

  useEffect(() => {
    localStorage.setItem('members', JSON.stringify(members));
  }, [members]);

  const createLocalImageUrl = async (url: string): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      const result = await getImageBlob(url);
      
      if (!result.success || !result.blob) {
        return {
          success: false,
          error: result.error || 'Failed to download image'
        };
      }

      const localUrl = URL.createObjectURL(result.blob);
      return {
        success: true,
        url: localUrl
      };
    } catch (error) {
      console.error('Error creating local profile picture URL:', error);
      return {
        success: false,
        error: 'Failed to create local URL'
      };
    }
  };

  const loadMembers = async () => {
    try {
      const membersData = await getMembers();
      const membersWithImages = await Promise.all(
        membersData.map(async (member) => {
          const imageResult = await createLocalImageUrl(member.image);
          return { ...member, image: imageResult.success ? imageResult.url : null };
        })
      );
      setMembers(membersWithImages);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const loadApplicationStatus = async () => {
    try {
      const {isOpen, applicationsLink, applicationDeadline} = await getApplicationStatus();
      setApplicationStatus({isOpen, applicationsLink, applicationDeadline});
    } catch (error) {
      console.error('Error loading application status:', error);
    }
  };

  return (
    <SessionContext.Provider value={{ 
      setMembers,
      members,
      loadMembers,
      applicationStatus,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
