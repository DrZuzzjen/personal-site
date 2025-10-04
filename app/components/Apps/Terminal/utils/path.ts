export function normalizePath(path: string): string {
  if (!path || path === '/') {
    return '/';
  }

  const segments = path.split('/').filter(Boolean);
  return segments.length ? `/${segments.join('/')}` : '/';
}

export function resolvePath(currentPath: string, target: string): string {
  if (!target) {
    return normalizePath(currentPath);
  }

  if (target.startsWith('/')) {
    return normalizePath(target);
  }

  const baseSegments = currentPath.split('/').filter(Boolean);
  const relativeSegments = target.split('/').filter((segment) => segment.length > 0);

  for (const segment of relativeSegments) {
    if (segment === '.') {
      continue;
    }
    if (segment === '..') {
      baseSegments.pop();
      continue;
    }
    baseSegments.push(segment);
  }

  return baseSegments.length ? `/${baseSegments.join('/')}` : '/';
}

export function getParentPath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  segments.pop();
  return segments.length ? `/${segments.join('/')}` : '/';
}

export function getPathSegments(path: string): string[] {
  return path.split('/').filter(Boolean);
}