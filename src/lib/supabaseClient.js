import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://psiskpndznunnxxddyzs.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzaXNrcG5kem51bm54eGRkeXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjU4NzcsImV4cCI6MjA3MjgwMTg3N30.xjqXQfSWU6mrRjt4Jz1BCuXamwzWKxAE5NijR7s48s0"

export const supabase = createClient(supabaseUrl, supabaseKey)
