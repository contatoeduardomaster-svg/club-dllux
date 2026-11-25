export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, name, region, sigla, state_json FROM neighborhoods ORDER BY rowid ASC"
    ).all();

    return new Response(JSON.stringify({ ok: true, rows: results || [] }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { id, name, region, sigla, state } = body;

    if (!id || !state) {
      return new Response(JSON.stringify({ ok: false, error: "Dados inválidos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    await env.DB.prepare(
      `INSERT INTO neighborhoods (id, name, region, sigla, state_json, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         region = excluded.region,
         sigla = excluded.sigla,
         state_json = excluded.state_json,
         updated_at = datetime('now')`
    )
      .bind(
        String(id),
        String(name || "Clube Vila Princesa"),
        String(region || "Rede Dllux • Guaianases"),
        String(sigla || "VP"),
        JSON.stringify(state)
      )
      .run();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}