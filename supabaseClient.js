import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ofhweovovpgatyogdqdp.supabase.co'
const supabaseKey = 'sb_publishable_YMqEuVoc4PgmsnHNERrKmA_OPN8v0rp'

export const supabase = createClient(supabaseUrl, supabaseKey)