import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://fryduakosckkggckncwl.supabase.co/"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeWR1YWtvc2Nra2dnY2tuY3dsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MzUzMDMsImV4cCI6MjA2ODAxMTMwM30.by6DJMyYNElR6ugaDlNtdhAHuX3b2WN4h4fvKwFL04I"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)