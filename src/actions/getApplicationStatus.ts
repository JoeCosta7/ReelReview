'use server';

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getApplicationStatus() {
    const { data, error } = await supabase.from('application').select('*').eq('isOpen', true).single();

    if (!data) {
        return {
            isOpen: false,
            applicationsLink: '',
            applicationDeadline: ''
        };
    }

    if (error) {
        console.error(error);
        return {
            isOpen: false,
            applicationsLink: '',
            applicationDeadline: ''
        };
    }

    // Parse the date string and create a date object in local timezone
    // This prevents timezone conversion issues that cause off-by-one day errors
    const deadlineStr = data.deadline;
    const deadline = new Date(deadlineStr + 'T00:00:00'); // Force local timezone interpretation
    
    // Format the date to avoid timezone issues
    const formattedDeadline = deadline.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    return {
        isOpen: true,
        applicationsLink: data.link,
        applicationDeadline: formattedDeadline
    };
}

export default getApplicationStatus;