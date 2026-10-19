# OFAuth Vault image

Read one existing Vault photo and create `media.html` with its returned full-size image URL. The example does not upload media or change accounts.

## Install and configure

Use Node.js 22 or later and an OAuth authorization with `vault:read`. Choose a connected linked account shared with that authorization and a numeric photo media ID from that account's Vault.

```bash
git clone https://github.com/ofauth-source/example-node-vault-image.git
cd example-node-vault-image
npm ci
cp .env.example .env
```

Replace the three placeholders in `.env` with your access token, linked account ID, and photo media ID. Keep this file private and excluded from version control. Run this code on your backend; never expose the access token to a browser.

## Render the photo

```bash
npm start
```

Expect `Saved media.html for media 123456`, with your actual media ID. Open `media.html` in a browser to see the image scaled to the window.

The script reads `GET /v3/access/vault/media/{mediaId}` using the token and `x-linked-account-id`. It requires a ready, viewable `photo` without an error, selects `files.full.url`, and uses that variant's width and height. It rejects an unsuccessful read or a non-HTTPS display URL. Videos and other response shapes are outside this example.

The generated page contains the returned media URL, not your access token. Treat that URL and the generated HTML as private. Keep `media.html` out of version control.

## Refresh an expired URL

Keep the same `OFAUTH_MEDIA_ID` and owning `OFAUTH_LINKED_ACCOUNT_ID` in `.env`, run `npm start` again, and reload `media.html`. This rereads the same resource and replaces its expired URL. It does not create a new Vault item.

If `isReady` is false, wait for processing before reading again. Recover authorization or account access if the request is denied. Retrying an old URL does not make unavailable media viewable.

Store the media ID with its owning linked account as your stable reference. In an application, verify that account belongs to the current user before reading it. See [Display media](https://docs.ofauth.com/v3/guides/display-media) for the response excerpt and [Vault+](https://docs.ofauth.com/v3/guides/media-storage) for persistent copies.
