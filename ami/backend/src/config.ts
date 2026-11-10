import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error('Missing required env var: ' + key);
  return val;
}

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  supabaseUrl: requireEnv('SUPABASE_URL'),
  supabaseAnonKey: requireEnv('SUPABASE_ANON_KEY'),
  supabaseServiceKey: requireEnv('SUPABASE_SERVICE_KEY'),
  geminiKeys: Object.entries(process.env)
    .filter(([k]) => k.startsWith('GEMINI_KEY_'))
    .sort(([a], [b]) => {
      const numA = parseInt(a.replace('GEMINI_KEY_', ''), 10);
      const numB = parseInt(b.replace('GEMINI_KEY_', ''), 10);
      return numA - numB;
    })
    .map(([, v]) => v as string)
    .filter(Boolean),
  unsplashKey: process.env.UNSPLASH_ACCESS_KEY || null,
  serpapiKey: process.env.SERPAPI_KEY || null,
  gnaniApiKey: process.env.GNANI_API_KEY || '',
};

if (config.geminiKeys.length === 0) {
  throw new Error('No Gemini API keys found. Set GEMINI_KEY_1 in your .env file.');
}
