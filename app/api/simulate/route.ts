import { NextResponse } from "next/server";
import { FASTAPI_URL } from "@/lib/backend-config";

export async function POST() {
  try {
    const sessionId = `BB-SIM-${Date.now()}`;
    const headers = {
      "Content-Type": "application/json",
      "X-BB-Threat-Score": "100",
      "X-BB-Tier": "BOT",
      "X-BB-Session": sessionId,
      "User-Agent": "Mozilla/5.0 Playwright",
    };

    const sequence = [
      ["eth_chainId", []],
      ["eth_accounts", []],
      ["eth_getBalance", ["0x1", "latest"]],
      ["eth_sendTransaction", [{ from: "0x1", to: "0x2" }]],
    ];

    for (let i = 0; i < sequence.length; i += 1) {
      const [method, params] = sequence[i];
      await fetch(`${FASTAPI_URL}/api/rpc`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          jsonrpc: "2.0",
          method,
          params,
          id: i + 1,
        }),
        signal: AbortSignal.timeout(4000),
      });
    }

    await fetch(`${FASTAPI_URL}/api/flush`, {
      method: "POST",
      signal: AbortSignal.timeout(2000),
    });

    return NextResponse.json({ success: true, sessionId });
  } catch (error) {
    console.error("Failed to execute simulated trap sequence:", error);
    return NextResponse.json({ error: "Internal sequence failure" }, { status: 500 });
  }
}
