'use client';

import { useSession } from '@/app/contexts/SessionContext';

export default function ApplicationStatusText() {
    const { applicationStatus } = useSession();
    if (applicationStatus?.isOpen) {
        return (
            <p className="text-lg md:text-xl font-serif mb-12 max-w-2xl mx-auto">
                Our application is open! Apply before {applicationStatus.applicationDeadline}.
            </p>
        )
    }
    return (
        <p className="text-lg md:text-xl font-serif mb-12 max-w-2xl mx-auto">
            Our application is locked as of now and we will open our gates soon.
        </p>
    )
}