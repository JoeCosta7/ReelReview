'use server';

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getMembers() {
    const { data, error } = await supabase.from('members').select('*').order('id', { ascending: true });

    if (error) {
        console.error(error);
        return [];
    }

    if (!data) {
        return [];
    }

    return data;
}

export async function getImageBlob(url: string): Promise<{ success: boolean; blob?: Blob; error?: string }> {
    try {
        // Handle different URL formats
        let fileName: string;
        
        if (!url) {
            return {
                success: false,
                error: 'No image URL provided'
            };
        }

        // If it's already a Supabase URL, extract the filename
        if (url.includes('supabase.co')) {
            const urlParts = url.split('/');
            fileName = urlParts[urlParts.length - 1];
        } else {
            fileName = url.includes('/') ? url.split('/').pop()! : url;
        }

        // Validate filename
        if (!fileName || fileName.trim() === '') {
            return {
                success: false,
                error: 'Invalid filename extracted from URL'
            };
        }

        // Construct the file path
        const filePath = `members/${fileName}`;

        // Download the file from Supabase storage
        const { data, error } = await supabase.storage
            .from('images')
            .download(filePath);

        if (error) {
            console.error('Error downloading profile picture:', error);
            return {
                success: false,
                error: 'Failed to download image. Please try again.'
            };
        }

        if (!data) {
            return {
                success: false,
                error: 'No image data received'
            };
        }

        // Return the blob data for client-side processing
        return {
            success: true,
            blob: data
        };
    } catch (error) {
        console.error('Error in getLocalProfilePictureUrl:', error);
        return {
            success: false,
            error: 'Internal server error'
        };
    }
}

export default getMembers;