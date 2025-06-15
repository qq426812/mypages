export const onRequestGet = async ({ env }) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const stmt = env.DB.prepare("SELECT id FROM records ORDER BY id DESC LIMIT 1");
    const row = await stmt.first();

    if (!row) {
      return new Response(JSON.stringify({ success: false, error: "暂无数据" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ success: true, id: row.id }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
