'use server';

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function addToEmailList(email: string) {
    if (email.trim() === '' || !email.includes('@')) {
        return false;
    }
    
    const { error } = await supabase.from('email_list').upsert({ email });

    if (error) {
        console.error(error);
        return false;
    }

    return true;
}

export default addToEmailList;