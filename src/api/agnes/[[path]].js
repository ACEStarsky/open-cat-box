
export async function onRequest(context) {
  const { request, params } = context;
  const url = new URL(request.url);
  const AGNES_BASE = 'https://api.agnes-ai.com/v1';
  const subPath = params.path ? params.path.join('/') : '';
  const targetUrl = `${AGNES_BASE}/${subPath}${url.search}`;
  const proxyRequest = new Request(targetUrl, request);
  proxyRequest.headers.delete('Origin');
  const response = await fetch(proxyRequest);
  return response;
}
