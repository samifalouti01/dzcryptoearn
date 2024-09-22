// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqvwxmbemmassbixrwhu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxdnd4bWJlbW1hc3NiaXhyd2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY0MzU4NTAsImV4cCI6MjA0MjAxMTg1MH0.5-4zIh5vQhnv4cy7N3_1lOIi5dBdgO8KoHXzq-cIS1w';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
