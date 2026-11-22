export default function useSystemTheme(): 'light' | 'dark' {
    if (document.documentElement.dataset.look === 'capsule') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}