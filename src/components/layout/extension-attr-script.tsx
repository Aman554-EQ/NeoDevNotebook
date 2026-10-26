/**
 * Development only. Some browser extensions (Bitdefender's `bis_skin_checked` / `bis_register`,
 * `__processed_<uuid>__`, Grammarly's `data-gr-*`) stamp attributes onto the server HTML before
 * React hydrates, and the dev build reports each one as a hydration mismatch. Production React
 * does not compare attributes, so this script is not shipped there. It removes those attributes
 * as they appear, until shortly after the page has loaded.
 */
export const EXTENSION_ATTR = /^(bis_|__processed_|data-gr-|data-new-gr-)/

const script = `(function(){var re=${EXTENSION_ATTR.toString()};function clean(el){if(!el||!el.attributes)return;for(var i=el.attributes.length-1;i>=0;i--){var n=el.attributes[i].name;if(re.test(n))el.removeAttribute(n)}}var mo=new MutationObserver(function(rs){for(var i=0;i<rs.length;i++){var r=rs[i];if(r.type==="attributes"&&r.attributeName&&re.test(r.attributeName))clean(r.target)}});mo.observe(document.documentElement,{attributes:true,subtree:true});addEventListener("load",function(){setTimeout(function(){mo.disconnect()},10000)})})()`

export function ExtensionAttrScript() {
  if (process.env.NODE_ENV !== "development") return null
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
