import { writeFileSync } from "node:fs"

const { OFAUTH_ACCESS_TOKEN, OFAUTH_LINKED_ACCOUNT_ID, OFAUTH_MEDIA_ID } = process.env
if (!OFAUTH_ACCESS_TOKEN || !OFAUTH_LINKED_ACCOUNT_ID || !/^\d+$/.test(OFAUTH_MEDIA_ID ?? "")) {
	throw new Error("Set OFAUTH_ACCESS_TOKEN, OFAUTH_LINKED_ACCOUNT_ID, and numeric OFAUTH_MEDIA_ID")
}
const response = await fetch(`https://api.ofauth.com/v3/access/vault/media/${OFAUTH_MEDIA_ID}`, {
	headers: {
		Authorization: `Bearer ${OFAUTH_ACCESS_TOKEN}`,
		"x-linked-account-id": OFAUTH_LINKED_ACCOUNT_ID
	},
	signal: AbortSignal.timeout(15_000)
})
if (!response.ok) throw new Error(`Vault read failed: ${response.status}`)
const media = await response.json()
if (media.type !== "photo" || !media.canView || !media.isReady || media.hasError) {
	throw new Error("Media is unavailable or still processing")
}
const full = media.files?.full
if (!full?.url || new URL(full.url).protocol !== "https:") {
	throw new Error("No HTTPS full-size image URL returned")
}
// Escaping '<' keeps the JSON inside the script element.
const image = JSON.stringify({ src: full.url, width: full.width, height: full.height }).replaceAll("<", "\\u003c")
writeFileSync("media.html", `<!doctype html>
<html lang="en"><meta charset="utf-8"><title>Vault image</title>
<body><img id="media" alt="Selected Vault image" style="max-width:100%;height:auto">
<script>
const image = ${image}
const element = document.getElementById("media")
element.src = image.src
element.width = image.width
element.height = image.height
</script></body></html>`, { mode: 0o600 })
console.log(`Saved media.html for media ${media.id}`)
