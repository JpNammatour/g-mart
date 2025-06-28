import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  const { action, table, payload, id, mobile } = await req.json();

  let result;
  let error;

  try {
    switch (action) {
      case 'getAll':
        ({ data: result, error } = await supabase.from(table).select('*'));
        break;
      case 'getById':
        ({ data: result, error } = await supabase.from(table).select('*').eq(table === 'customers' ? 'mobile' : 'id', table === 'customers' ? mobile : id).single());
        break;
      case 'add':
        ({ error } = await supabase.from(table).insert([payload]));
        break;
      case 'update':
        ({ error } = await supabase.from(table).update(payload.updates).eq(table === 'customers' ? 'mobile' : 'id', table === 'customers' ? mobile : id));
        break;
      case 'delete':
        ({ error } = await supabase.from(table).delete().eq(table === 'customers' ? 'mobile' : 'id', table === 'customers' ? mobile : id));
        break;
      case 'setAll':
        ({ error } = await supabase.from(table).upsert(payload));
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    if (error) throw new Error(error.message);
    return NextResponse.json({ result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
