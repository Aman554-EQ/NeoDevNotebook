export const THEME_STORAGE_KEY = "ndn-theme"

/**
 * Runs before first paint so the page never flashes the wrong theme.
 * Stored choice wins; otherwise follow the OS setting.
 */
const script = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})()`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
