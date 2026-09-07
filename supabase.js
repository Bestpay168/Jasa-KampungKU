// =========================================================
// JASA KAMPUNG — SUPABASE CONFIG
// =========================================================

const SUPABASE_URL =
    "https://egnzntmwzuowoueitqki.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_dXknnH_JN2eE9ZMmWvxliw_j7czbX9t";

// Buat koneksi Supabase
const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

// Agar bisa digunakan oleh script.js dan admin.js
window.JasaKampungSupabase = supabaseClient;