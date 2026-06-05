import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fooxpbdzakalrppgcwik.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvb3hwYmR6YWthbHJwcGdjd2lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2OTQ3MTIsImV4cCI6MjA5NTI3MDcxMn0.8mbcZcmY3M2_Q8JcbDyqMxGPaJdyTJbWaDWd2ARnF9o";

export const supabase = createClient(supabaseUrl, supabaseKey);