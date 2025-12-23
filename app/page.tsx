import { supabase } from "../lib/supabase/client";

export default function Home() {
  console.log("Supabase client loaded:", !!supabase);

  return (
    <main style={{ padding: 24 }}>
      <h1>Supabase client import test</h1>
      <p>If this page loads without crashing, we’re good.</p>
    </main>
  );
}
