// functions/api/agnes/[[path]].js
// Cloudflare Pages Function：代理 Agnes AI 请求，绕过 CORS

export async function onRequest(context) {
  const { request, params } = context;
  const url = new URL(request.url);

  // 根据你的 Key 归属选择端点（国际站用 .com，国内站用 .cn）
  const AGNES_BASE = 'https://apihub.agnes-ai.com/v1';

  const subPath = params.path ? params.path.join('/') : '';
  const targetUrl = `${AGNES_BASE}/${subPath}${url.search}`;

  try {
    // 复制请求头，去掉会导致跨域的 Origin
    const headers = new Headers(request.headers);
    headers.delete('Origin');
    headers.delete('Referer');
    headers.delete('Host');

    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers,
      body:
        request.method === 'GET' || request.method === 'HEAD'
          ? undefined
          : await request.arrayBuffer(),
    });

    const response = await fetch(proxyRequest);
    const body = await response.arrayBuffer();

    // 把响应原样返回，并加上 CORS 头让浏览器放行
    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (err) {
    // 出错也返回 JSON，避免前端拿到空响应
    return new Response(
      JSON.stringify({
        error: 'Proxy error',
        message: err.message,
        target: targetUrl,
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

// 处理浏览器的 OPTIONS 预检请求
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
