# Keyhole server

A minimal private file store for the [Keyhole plugin for Obsidian](https://github.com/dbraendle/obsidian-keyhole). It runs on Node.js 24 with no dependencies.

| Request | Auth | Purpose |
|---|---|---|
| `PUT /f/<key>` | Bearer token | upload (atomic: temp file + rename) |
| `GET /f/<key>`, `HEAD /f/<key>` | Bearer token **or** signed URL | download, with Range support for streaming |
| `DELETE /f/<key>` | Bearer token | delete |
| `GET /f/?list=1[&prefix=…]` | Bearer token | JSON list of stored files |
| `GET /health` | none | health check |

Signed URLs (`?ke=<expiry>&ks=<hmac>`) let audio and video players stream without a token. The signature is an HMAC over method, key and expiry, made with a key derived from the token. Signed URLs are valid for GET and HEAD only, and for at most 7 days.

Every response sends `X-Content-Type-Options: nosniff` and a sandboxing `Content-Security-Policy`, so an uploaded HTML or SVG file cannot run scripts when opened directly.

## Configuration

| Variable | Default | |
|---|---|---|
| `KEYHOLE_TOKENS` | – | One or more tokens, separated by commas or spaces. Each must be at least 32 characters (`openssl rand -hex 32`). |
| `KEYHOLE_TOKENS_FILE` | – | Read the tokens from a file instead (recommended with Docker secrets). |
| `KEYHOLE_DATA_DIR` | `./data` (`/data` in Docker) | Where the files are stored. |
| `KEYHOLE_MAX_UPLOAD_MB` | `512` | Uploads larger than this are refused. |
| `PORT` / `HOST` | `8080` / `0.0.0.0` | Listen address. |

Use one token per device, so that you can revoke a lost phone without touching the others.

## Run

```sh
docker run -d --name keyhole -p 127.0.0.1:8080:8080 \
  -v keyhole-data:/data -e KEYHOLE_TOKENS_FILE=/run/secrets/keyhole \
  -v /path/to/tokens:/run/secrets/keyhole:ro \
  ghcr.io/dbraendle/keyhole-server:latest
```

Terminate TLS in front of it with Caddy, Traefik, nginx or Cloudflare Tunnel. Use a publicly trusted certificate, because Obsidian on iOS does not accept self-installed CAs. Do not log query strings in the proxy: they contain signatures.

Caddy example:

```
files.example.com {
	reverse_proxy 127.0.0.1:8080
	log {
		format filter {
			request>uri query {
				delete ks
			}
		}
	}
}
```

## Verify the image

Every released image has a build provenance attestation:

```sh
gh attestation verify oci://ghcr.io/dbraendle/keyhole-server:latest -R dbraendle/keyhole-server
```

## Signed URL format

`ks` is `HMAC-SHA256(key = HMAC-SHA256(token, "keyhole-url-signing-v1"), "GET\n<key>\n<ke>")` in hex, where `ke` is the expiry as Unix seconds. Test vector (also checked by the plugin's tests):

| | |
|---|---|
| token | `t` × 64 |
| key | `2026/11/a-b.mp4` |
| `ke` | `1800000000` |
| `ks` | `ee4eae0625e36cfcb6c0ccb6b4440aa4cd0291a0add370a35217717eaf02d0d9` |

## Develop

```sh
pnpm install
KEYHOLE_TOKENS=$(openssl rand -hex 32) pnpm start
pnpm check   # lint, typecheck, tests
```

## License

[MIT](LICENSE)
