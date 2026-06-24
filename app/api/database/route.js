import { NextResponse } from 'next/server';
import { getDb } from '../../lib/sqliteDb';

export async function GET(req) {
  const url = new URL(req.url);
  const model = url.searchParams.get('model');
  const db = await getDb();
  
  if (!model) {
    // Return all data grouped by model if no model specified
    const rows = await db.all(`SELECT model, data FROM documents`);
    const result = {};
    for (const row of rows) {
      if (!result[row.model]) result[row.model] = [];
      result[row.model].push(JSON.parse(row.data));
    }
    return NextResponse.json(result);
  }

  const rows = await db.all(`SELECT data FROM documents WHERE model = ?`, [model]);
  const parsedData = rows.map(r => JSON.parse(r.data));
  return NextResponse.json(parsedData);
}

export async function POST(req) {
  const url = new URL(req.url);
  const model = url.searchParams.get('model');
  const payload = await req.json();
  const db = await getDb();
  
  if (!model) return NextResponse.json({ error: 'Model required' }, { status: 400 });

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const id = item.id || `gen-${Date.now()}-${Math.random()}`;
      item.id = id;
      await db.run(`INSERT INTO documents (model, id, data) VALUES (?, ?, ?)`, [model, id, JSON.stringify(item)]);
    }
  } else {
    const id = payload.id || `gen-${Date.now()}-${Math.random()}`;
    payload.id = id;
    await db.run(`INSERT INTO documents (model, id, data) VALUES (?, ?, ?)`, [model, id, JSON.stringify(payload)]);
  }
  
  return NextResponse.json({ success: true, data: payload });
}

export async function PUT(req) {
  const url = new URL(req.url);
  const model = url.searchParams.get('model');
  const id = url.searchParams.get('id');
  const payload = await req.json();
  const db = await getDb();
  
  if (!model || !id) return NextResponse.json({ error: 'Model and id required' }, { status: 400 });

  const existingRow = await db.get(`SELECT data FROM documents WHERE model = ? AND id = ?`, [model, id]);
  if (!existingRow) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const mergedData = { ...JSON.parse(existingRow.data), ...payload };
  await db.run(`UPDATE documents SET data = ? WHERE model = ? AND id = ?`, [JSON.stringify(mergedData), model, id]);
  
  return NextResponse.json({ success: true, data: mergedData });
}

export async function DELETE(req) {
  const url = new URL(req.url);
  const model = url.searchParams.get('model');
  const id = url.searchParams.get('id');
  const db = await getDb();
  
  if (!model || !id) return NextResponse.json({ error: 'Model and id required' }, { status: 400 });

  const result = await db.run(`DELETE FROM documents WHERE model = ? AND id = ?`, [model, id]);
  
  if (result.changes > 0) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
