export const onRequest = async (context) => {
  const { request, env } = context;
  const { method } = request;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // 预检请求处理
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // POST：写入数据
  if (method === "POST") {
    try {
      const body = await request.json();
      const content = body.content?.trim();

      if (!content) {
        return new Response(JSON.stringify({ success: false, error: "内容为空" }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const now = new Date().toISOString();

      const stmt = env.DB.prepare(
        "INSERT INTO records (content, created_at) VALUES (?, ?)"
      );
      const result = await stmt.bind(content, now).run();

      const id = result.lastRowId;

      return new Response(JSON.stringify({ success: true, id }), {
        status: 200,
        headers: corsHeaders,
      });
    } catch (e) {
      return new Response(JSON.stringify({ success: false, error: e.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  }

  // GET：根据 ID 查询
  if (method === "GET") {
    try {
      const url = new URL(request.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return new Response(JSON.stringify({ error: "缺少参数 id" }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const stmt = env.DB.prepare("SELECT * FROM records WHERE id = ?");
      const row = await stmt.bind(id).first();

      if (!row) {
        return new Response(JSON.stringify({ error: "未找到记录" }), {
          status: 404,
          headers: corsHeaders,
        });
      }

      return new Response(JSON.stringify(row), {
        status: 200,
        headers: corsHeaders,
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }
  }

  // 不支持的请求方法
  return new Response(JSON.stringify({ error: "不支持的请求方法" }), {
    status: 405,
    headers: corsHeaders,
  });
};
