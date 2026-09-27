export function parseAppHash() {
  const raw = (window.location.hash || '').replace(/^#\/?/, '');
  if (!raw) return { route: 'home', params: {} };

  const [pathPart, queryPart] = raw.split('?');
  const params = Object.fromEntries(new URLSearchParams(queryPart || ''));

  if (pathPart.startsWith('product/')) {
    const id = decodeURIComponent(pathPart.slice('product/'.length));
    return { route: 'product', params: { ...params, id } };
  }

  return { route: pathPart || 'home', params };
}

export function buildAppHash(route, params = {}) {
  if (route === 'home') return '#/';
  if (route === 'product' && params.id) {
    return `#/product/${encodeURIComponent(params.id)}`;
  }
  const { id, ...rest } = params;
  const qs = new URLSearchParams();
  Object.entries(rest).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, v);
  });
  const query = qs.toString();
  return query ? `#/${route}?${query}` : `#/${route}`;
}
