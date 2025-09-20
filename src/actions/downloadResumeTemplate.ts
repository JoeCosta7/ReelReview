'use server';

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function downloadResumeTemplate(): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // Construct the file path
        const filePath = `ResumeGuide2024.pdf`;

        // Create a short-lived signed URL for the file
        const { data, error } = await supabase.storage
            .from('files')
            .createSignedUrl(filePath, 60, { download: 'Resume_Guide_2024.pdf' }); // Force download

        if (error) {
            console.error('Error downloading resume template:', error);
            return {
                success: false,
                error: 'Failed to download resume template. Please try again.'
            };
        }

        if (!data || !data.signedUrl) {
            return {
                success: false,
                error: 'No resume template data received'
            };
        }

        // Return the signed URL for client-side opening
        return {
            success: true,
            url: data.signedUrl
        };
    } catch (error) {
        console.error('Error in downloadResumeTemplate:', error);
        return {
            success: false,
            error: 'Internal server error'
        };
    }
}

export default downloadResumeTemplate;