/* =========================================================
   JASA KAMPUNG
   SUPABASE CONFIGURATION
   ========================================================= */

/*
  GANTI 2 NILAI DI BAWAH INI DENGAN DATA PROJECT SUPABASE ANDA.

  SUPABASE_URL:
  Project Settings → Data API → Project URL

  SUPABASE_KEY:
  Gunakan Publishable Key / anon public key.

  JANGAN gunakan service_role key di website.
*/

const SUPABASE_URL = "MASUKKAN_PROJECT_URL_ANDA";

const SUPABASE_KEY = "MASUKKAN_PUBLISHABLE_KEY_ANDA";


/* =========================================================
   INITIALIZE SUPABASE
   ========================================================= */

if (!window.supabase) {
    console.error(
        "Supabase JS belum dimuat. Pastikan CDN Supabase ada di index.html."
    );
} else {

    const supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

    /*
      Dibuat global agar bisa digunakan oleh:
      - script.js
      - admin-login.js
      - admin.js
    */

    window.JasaKampungSupabase = supabaseClient;

    console.log("✅ Supabase berhasil diinisialisasi.");
}