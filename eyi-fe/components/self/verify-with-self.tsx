"use client";

import { useEffect, useMemo, useState } from "react";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
  getUniversalLink,
} from "@selfxyz/qrcode";
import { ethers } from "ethers";
import { useWallets } from "@privy-io/react-auth";

interface VerifyWithSelfProps {
  active?: boolean;     // must be true to build/show QR
  contract: string;     // "0xE85B8D..."
  scopeSeed: string;    // e.g. "self-ens"
}

export default function VerifyWithSelf({
  active = false,
  contract,
  scopeSeed,
}: VerifyWithSelfProps) {
  const { wallets } = (() => {
    try { return useWallets(); } catch { return { wallets: [] as any[] }; }
  })();

  const ENDPOINT_TYPE = "staging_celo";

  const [userId, setUserId] = useState<string>(ethers.ZeroAddress);
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [toast, setToast] = useState("");
  const [verified, setVerified] = useState(false);

  const log = (...args: any[]) => console.log("[Self]", ...args);
  const showToast = (msg: string) => {
    log("📣", msg);
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Detect connected wallet
  useEffect(() => {
    (async () => {
      const privyAddr = wallets?.[0]?.address;
      if (privyAddr && ethers.isAddress(privyAddr)) {
        const addr = ethers.getAddress(privyAddr);
        setUserId(addr);
        log("✅ Using Privy wallet:", addr);
        return;
      }
      try {
        const eth = (globalThis as any).ethereum;
        if (eth?.request) {
          const accounts: string[] = await eth.request({ method: "eth_accounts" });
          if (accounts?.[0] && ethers.isAddress(accounts[0])) {
            const addr = ethers.getAddress(accounts[0]);
            setUserId(addr);
            log("✅ Using extension wallet:", addr);
            return;
          }
        }
      } catch (e) {
        log("⚠️ eth_accounts fallback failed:", e);
      }
      setUserId(ethers.ZeroAddress);
    })();
  }, [wallets]);

  const canBuild = useMemo(
    () => active && userId !== ethers.ZeroAddress,
    [active, userId]
  );

  const build = () => {
    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: "ENS Proof of Personhood",
        scope: scopeSeed,
        endpoint: contract,
        endpointType: ENDPOINT_TYPE,
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
        userId,
        userIdType: "hex",
        userDefinedData: "",
        disclosures: { minimumAge: 13, ofac: true },
      }).build();

      const link = getUniversalLink(app);
      setSelfApp(app);
      setUniversalLink(link);
      log("✅ QR built:", link);
      showToast("QR ready — scan with the Self app");
    } catch (e) {
      console.error("❌ Failed to build QR:", e);
      setSelfApp(null);
      setUniversalLink("");
      showToast("Failed to build QR.");
    }
  };

  useEffect(() => {
    if (canBuild) {
      setSelfApp(null);
      setUniversalLink("");
      build();
    } else {
      setSelfApp(null);
      setUniversalLink("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canBuild, contract, scopeSeed]);

  const onSuccess = () => {
    log("🎉 Verification success", { userId });
    setVerified(true);

    // Save locally
    try {
      const key = "selfVerifiedDirectory";
      const entry = { address: userId, ens: null, timestamp: Date.now() };
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      const i = arr.findIndex((r: any) => r.address.toLowerCase() === userId.toLowerCase());
      if (i >= 0) arr[i] = entry; else arr.push(entry);
      localStorage.setItem(key, JSON.stringify(arr, null, 2));
      log("🗂️ Directory updated:", arr);
    } catch (e) {
      console.error("❌ Directory update failed:", e);
    }

    showToast("You are verified!");
  };

  const onError = (e?: any) => {
    console.error("❌ Verification error:", e);
    showToast("Verification failed");
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-6 rounded-xl shadow-md space-y-4">
      <h3 className="text-base font-semibold">Verify with Self</h3>

      {verified ? (
        <div className="text-green-600 font-medium text-center py-4">
          🎉 You are verified!
        </div>
      ) : (
        <div className="flex justify-center">
          {selfApp ? (
            <SelfQRcodeWrapper selfApp={selfApp} onSuccess={onSuccess} onError={onError} />
          ) : (
            <div className="w-[256px] h-[256px] bg-gray-100 rounded-md flex items-center justify-center text-gray-500 text-sm text-center px-4">
              {!active
                ? "Click “Verify with Self” to start"
                : userId === ethers.ZeroAddress
                ? "Connect/select a wallet first"
                : "Preparing QR…"}
            </div>
          )}
        </div>
      )}

      <div className="text-[11px] text-gray-600 space-y-1 break-words">
        <div><b>User:</b> {userId}</div>
        <div><b>Contract:</b> {contract}</div>
        <div><b>Scope (seed):</b> {scopeSeed}</div>
        <div><b>Endpoint type:</b> {ENDPOINT_TYPE}</div>
        <div><b>Link:</b> {universalLink ? "ready" : "not generated"}</div>
      </div>

      {!!toast && (
        <div className="text-sm text-white bg-gray-800 px-3 py-2 rounded">{toast}</div>
      )}
    </div>
  );
}
