import { createClient } from '@supabase/supabase-js'

const NEXT_PUBLIC_SUPABASE_URL = 'https://ztasaotbeuyjupkyibgi.supabase.co'
const NEXT_PUBLIC_SUPABASE_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNzk3MTg0NSwiZXhwIjoxOTUzNTQ3ODQ1fQ._p1lpy1TN7D2hg_tFZGTdXyU3OkbU_AhU0JQ1x8uaLY'

export const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON
)
