// Supabase has been replaced by a custom PHP backend.
// This file is kept to avoid breaking imports but returns null.

/*
import { createClient } from '@supabase/supabase-js';

const initializeSupabase = () => {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (supabaseUrl && supabaseKey) {
        try {
            const client = createClient(supabaseUrl, supabaseKey);
            console.log('✅ Supabase client initialized successfully.');
            return client;
        } catch (error) {
            console.error("❌ Error creating Supabase client:", error);
            return null;
        }
    } else {
        return null;
    }
};

export const supabase = initializeSupabase();
*/

export const supabase = null;
