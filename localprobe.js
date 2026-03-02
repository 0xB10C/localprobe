// localprobe is a btcpp.dev floripa26 exploits edition hackathon project of b10c
// it's harmless, but let's users know about a potential privacy leak
(function () {
  "use strict";

  // Only relevant in Firefox — Chromium-based browsers block cross-origin
  // requests to localhost via Private Network Access (PNA).
  if (!/Firefox\/\d/.test(navigator.userAgent)) return;

  var STORAGE_KEY = "node-privacy-alert-dismissed";
  if (sessionStorage.getItem(STORAGE_KEY)) return;

  var PORTS = [
    { port: 8332, network: "Mainnet", type: "RPC" },
    { port: 8333, network: "Mainnet", type: "P2P" },
    { port: 18332, network: "Testnet3", type: "RPC" },
    { port: 18333, network: "Testnet3", type: "P2P" },
    { port: 48332, network: "Testnet4", type: "RPC" },
    { port: 48333, network: "Testnet4", type: "P2P" },
    { port: 38332, network: "Signet", type: "RPC" },
    { port: 38333, network: "Signet", type: "P2P" },
    { port: 18443, network: "Regtest", type: "RPC" },
    { port: 18444, network: "Regtest", type: "P2P" },
    { port: 9051, network: "Tor", type: "Control" },
    { port: 9050, network: "Tor", type: "Proxy" },
  ];

  // If the connection responds within this window, the port is considered up.
  // No timing heuristic — a response is a response.
  var TIMEOUT_MS = 2000;

  function probe(entry) {
    return fetch("http://localhost:" + entry.port, {
      method: "GET",
      mode: "no-cors",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }).then(
      function () {
        return entry;
      },
      function () {
        return null;
      },
    );
  }

  function detect() {
    return Promise.all(PORTS.map(probe)).then(function (results) {
      return results.filter(Boolean);
    });
  }

  function showAlert(found) {
    // Group detected ports by network, preserving PORTS order.
    var order = [];
    var grouped = {};
    found.forEach(function (p) {
      if (!grouped[p.network]) {
        grouped[p.network] = [];
        order.push(p.network);
      }
      grouped[p.network].push(p.port);
    });

    // Build per-network lines, e.g.:
    //   Mainnet — ports 8332 (RPC), 8333 (P2P)
    var portMap = {};
    found.forEach(function (p) {
      portMap[p.network + p.port] = p.type;
    });
    var lines = order.map(function (net) {
      var portList = grouped[net]
        .map(function (port) {
          return "port " + port + " (" + portMap[net + port] + ")";
        })
        .join(", ");
      return "\t- " + net + ": " + portList;
    });

    var message =
      "⚠️ Privacy notice\n\n" +
      "This website has detected that you are running a Bitcoin node on the same machine as your browser. " +
      "Any website can probe localhost ports in Firefox.\n\n" +
      "Detected:\n" +
      lines.join("\n") +
      "\n\n" +
      "This is a Firefox-specific issue. Chromium-based browsers (Chrome, Brave, Edge) block this via the Private Network Access spec.\n\n";

    var remindAgain = confirm(message);
    if (!remindAgain) {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch (_) {}
    }
  }

  function run() {
    setTimeout(function () {
      detect().then(function (found) {
        if (found.length > 0) showAlert(found);
      });
    }, 2000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
