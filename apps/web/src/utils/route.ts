export function isRouteActive(pathname: string, targetRoute: string): boolean {
    const segments = pathname.split('/').filter(Boolean);

    if (segments[0] && segments[0].length === 2) {
        segments.shift();
    }

    const cleanPathname = '/' + segments.join('/');

    return cleanPathname === targetRoute || cleanPathname.startsWith(targetRoute + '/');
}