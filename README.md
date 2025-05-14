# email to ntfy [![codecov](https://codecov.io/gh/sharjeelaziz/email-ntfy/graph/badge.svg?token=AWCG0Z14KC)](https://codecov.io/gh/sharjeelaziz/email-ntfy) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/sharjeelaziz/email-ntfy/badge)](https://scorecard.dev/viewer/?uri=github.com/sharjeelaziz/email-ntfy)

A Cloudflare email worker to forward emails as ntfy.sh notifications.

## Setup

### Prerequisites

- Cloudflare [account](https://dash.cloudflare.com/sign-up) (free)
- Wrangler installed [globally](https://developers.cloudflare.com/workers/wrangler/install-and-update/#install-wrangler-globally)

#### Install dependencies

```bash
yarn install
```

#### Deploy the worker

```bash
yarn deploy
```

```bash
npx wrangler secret put NTFY_TOKEN
npx wrangler secret put NTFY_ENDPOINT
```

You should see something like this

```console
✔ Enter a secret value: … *************************
🌀 Creating the secret for the Worker "email-ntfy" 
✨ Success! Uploaded secret NTFY_TOPIC
```

#### Set up a route

- Go to your [zone's Email Workers settings](https://dash.cloudflare.com/?to=/:account).
- Click the zone (e.g. `example.com`), then `Email`, `Email Routing`.
- On the `Email Workers` tab, register an email route.
- Verify the forwarding email address if you are using one under *Destination addresses*

#### Verify

- Send an email to the email address you registered.
- You should receive an ntfy notification for the selected topic

## Tips

- Change the `name` field in `wrangler.jsonc` to deploy a separate worker with a different topic.

## License

This package is [MIT](./LICENSE) licensed.
