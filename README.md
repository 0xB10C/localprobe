# localprobe

You're running a Bitcoin node on the same machine as your (Firefox) web browser? Yeah, I and everybody else can tell...

localprobe.js is a small JavaScript snippet I built at the [btc++ Floripa 2026 exploits hackathon](https://btcplusplus.dev/conf/floripa26). It detects whether you are running a Bitcoin node on the same machine as your Firefox browser and alerts you if so.

Firefox, unlike Chromium-based browsers (Chrome, Brave, Edge), allows web pages to make cross-origin requests to `localhost`. This means any website you visit in Firefox can probe ports on your machine. Chromium-based browsers block this via the [Private Network Access](https://wicg.github.io/private-network-access/) spec.

localprobe probes the default Bitcoin Core RPC and P2P ports for mainnet, testnet3, testnet4, signet, and regtest, as well as Tor control and proxy ports. If any of these ports respond, it shows a privacy warning alerting you that any website you visit in Firefox can detect that you're running a node.

You can test it by running `bitcoind -regtest` and visiting [b10c.me](https://b10c.me).
