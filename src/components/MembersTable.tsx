'use client';

import { useSession } from '@/app/contexts/SessionContext';
import Image from 'next/image';

export default function MembersTable() {
    const { members } = useSession();

    return (
      <section className="pb-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
            {members.length === 0 ? (
            <div className="flex justify-center items-center py-16">
                <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cornell-dark-brown mx-auto mb-4"></div>
                <p className="text-gray-600 font-serif">Loading members...</p>
                </div>
            </div>
            ) : (
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
                {members.map((member, index) => (
                <div key={index} className="bg-gray-100 rounded-lg overflow-hidden shadow-sm flex flex-col h-full">
                {/* Image Section - takes up about 40% of card height */}
                <div className="aspect-square bg-gray-200 flex items-center justify-center">
                    {member.image ? (
                    <Image
                        src={member.image} 
                        alt={member.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover aspect-square"
                    />
                    ) : (
                    <span className="text-gray-500 text-sm">No Image</span>
                    )}
                </div>
                
                {/* Text Content Section */}
                <div className="p-6 flex flex-col justify-between h-full">
                    {/* Top Content */}
                    <div className="space-y-3">
                        {/* Title/Role */}
                        <p className="text-lg font-serif text-gray-800">{member.title}</p>
                        
                        {/* Name - largest and boldest */}
                        <h3 className="text-2xl font-bold font-serif text-gray-900">{member.name}</h3>
                        
                        {/* Academic Fields */}
                        <div className="space-y-1">
                        {member.major && (
                            <p className="text-sm font-serif text-gray-700">{member.major}</p>
                        )}
                        </div>

                        {/* Interests */}
                        {member.interests && (
                        <div>
                            <span className="text-sm font-bold font-serif text-gray-900">Interests: </span>
                            <span className="text-sm font-serif text-gray-700">{member.interests}</span>
                        </div>
                        )}
                        
                        {/* Experiences */}
                        {member.experiences && (
                        <div>
                            <span className="text-sm font-bold font-serif text-gray-900">Experience: </span>
                            <span className="text-sm font-serif text-gray-700">{member.experiences}</span>
                        </div>
                        )}
                    </div>
                    
                    {/* Bottom Content - Interests, Experiences, and Links */}
                    <div className="space-y-3 mt-6">
                        {/* Contact Information */}
                        <div className="flex items-center space-x-2 pt-2">
                        {/* LinkedIn Icon */}
                        {member.linkedin && (
                            <button className="w-4 h-4 bg-black rounded-sm flex items-center justify-center hover:bg-gray-700 hover:scale-105 transition-colors duration-200" onClick={() => window.open(member.linkedin as string, '_blank')}>
                            <span className="text-white text-xs font-bold">in</span>
                            </button>
                        )}
                        {/* Email */}
                        <button className="flex items-center justify-center hover:scale-102 transition-colors duration-200" onClick={() => window.open(`mailto:${member.email}`, '_blank')}>
                            <span className="text-sm font-serif text-gray-700">{member.email}</span>
                        </button>
                        </div>
                    </div>
                </div>
                </div>
                ))}
            </div>
            )}
        </div>
        </section>
    );
}