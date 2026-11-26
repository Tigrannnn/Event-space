export default function useSystemTheme(): 'light' | 'dark' {
    if (document.documentElement.dataset.skin === 'capsule') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}