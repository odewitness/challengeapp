import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Si les variables d'env ne sont pas définies, l'app tourne en "mode démo"
// (données locales + progression en localStorage), pratique pour tester
// avant d'avoir branché Supabase.
export const supabase = url && key ? createClient(url, key) : null

export const isSupabaseConfigured = Boolean(supabase)
