"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWallets } from "@privy-io/react-auth";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Sparkles,
  Shield,
  Smartphone,
  QrCode,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Dynamic imports to handle missing dependency gracefully
let SelfQRcodeWrapper: any = null;
let SelfAppBuilder: any = null;
let getUniversalLink: any = null;
let SelfApp: any = null;

try {
  const selfModule = require("@selfxyz/qrcode");
  SelfQRcodeWrapper = selfModule.SelfQRcodeWrapper;
  SelfAppBuilder = selfModule.SelfAppBuilder;
  getUniversalLink = selfModule.getUniversalLink;
  SelfApp = selfModule.SelfApp;
} catch (error) {
  console.warn("Self verification module not available:", error);
}

interface VerifyWithSelfProps {
  active?: boolean;     // must be true to build/show QR
  contract: string;     // "0xE85B8D..."
  scopeSeed: string;    // e.g. "self-ens"
  onVerificationSuccess?: (userId: string) => void;
  className?: string;
}

type VerificationState = 'idle' | 'loading' | 'ready' | 'verifying' | 'success' | 'error';

interface ErrorState {
  type: 'module_unavailable' | 'wallet_required' | 'build_failed' | 'verification_failed' | 'network_error';
  message: string;
  details?: string;
}

type StepKey = 'wallet' | 'generate' | 'scan' | 'complete';
type StepStatus = 'completed' | 'current' | 'upcoming' | 'error';

interface StepDefinition {
  key: StepKey;
  title: string;
  description: string;
  Icon: LucideIcon;
}

const STEP_DEFINITIONS: StepDefinition[] = [
  {
    key: 'wallet',
    title: 'Connect Wallet',
    description: 'Secure your identity source',
    Icon: Smartphone,
  },
  {
    key: 'generate',
    title: 'Generate QR Session',
    description: 'Build a Self proof request',
    Icon: QrCode,
  },
  {
    key: 'scan',
    title: 'Approve In Self',
    description: 'Scan and confirm within the app',
    Icon: Shield,
  },
  {
    key: 'complete',
    title: 'Verification Complete',
    description: 'Receive your signed confirmation',
    Icon: Sparkles,
  },
];

const ERROR_TO_STEP: Record<ErrorState['type'], StepKey> = {
  module_unavailable: 'generate',
  wallet_required: 'wallet',
  build_failed: 'generate',
  verification_failed: 'scan',
  network_error: 'scan',
};

const STEP_STATUS_LABEL: Record<StepStatus, string> = {
  completed: 'Completed',
  current: 'In progress',
  upcoming: 'Pending',
  error: 'Needs attention',
};

const STEP_TONE: Record<StepStatus, string> = {
  completed: 'var(--eyi-mint)',
  current: 'var(--eyi-primary)',
  upcoming: 'var(--eyi-slate)',
  error: 'var(--eyi-rose)',
};

export default function VerifyWithSelf({
  active = false,
  contract,
  scopeSeed,
  onVerificationSuccess,
  className,
}: VerifyWithSelfProps) {
  const { wallets } = (() => {
    try { return useWallets(); } catch { return { wallets: [] as any[] }; }
  })();

  const ENDPOINT_TYPE = "staging_celo";

  const [userId, setUserId] = useState<string>(ethers.ZeroAddress);
  const [selfApp, setSelfApp] = useState<any>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);
  const [verified, setVerified] = useState(false);
  const [selfAvailable, setSelfAvailable] = useState(false);
  const [verificationState, setVerificationState] = useState<VerificationState>('idle');
  const [error, setError] = useState<ErrorState | null>(null);
  const [verificationDetails, setVerificationDetails] = useState<{
    txHash?: string;
    proof?: string;
    timestamp?: number;
    blockNumber?: string;
  } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(() => Date.now());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  const log = (...args: any[]) => console.log("[Self]", ...args);
  
  // Check for existing verification data on mount
  useEffect(() => {
    const checkExistingVerification = () => {
      try {
        const key = "selfVerifiedDirectory";
        const raw = localStorage.getItem(key);
        if (raw) {
          const arr = JSON.parse(raw);
          const existingEntry = arr.find((r: any) => r.address.toLowerCase() === userId.toLowerCase());
          if (existingEntry && existingEntry.verificationType === 'self') {
            console.log("🔄 Found existing verification data:", existingEntry);
            setVerified(true);
            setVerificationState('success');
            setVerificationDetails({
              txHash: existingEntry.txHash,
              proof: existingEntry.proof,
              timestamp: existingEntry.timestamp,
              blockNumber: existingEntry.blockNumber,
            });
            setLastUpdated(existingEntry.timestamp || Date.now());
            console.log("✅ Restored verification state from localStorage");
          }
        }
      } catch (e) {
        console.error("❌ Failed to check existing verification:", e);
      }
    };

    if (userId !== ethers.ZeroAddress) {
      checkExistingVerification();
    }
  }, [userId]);

  // Monitor verification state changes
  useEffect(() => {
    console.log("🔄 Verification state changed:", { verified, verificationState, forceUpdate });
    if (verified || verificationState === 'success') {
      console.log("✅ Verification completed - forcing UI update");
      setForceUpdate(prev => prev + 1);
    }
  }, [verified, verificationState]);

  // Periodic check to ensure verification state persists
  useEffect(() => {
    if (userId !== ethers.ZeroAddress) {
      const interval = setInterval(() => {
        try {
          const key = "selfVerifiedDirectory";
          const raw = localStorage.getItem(key);
          if (raw) {
            const arr = JSON.parse(raw);
            const entry = arr.find((r: any) => r.address.toLowerCase() === userId.toLowerCase());
            if (entry && entry.verificationType === 'self' && !verified) {
              console.log("🔄 Restoring verification state from localStorage");
              setVerified(true);
              setVerificationState('success');
              setVerificationDetails({
                txHash: entry.txHash,
                proof: entry.proof,
                timestamp: entry.timestamp,
                blockNumber: entry.blockNumber,
              });
              setLastUpdated(entry.timestamp || Date.now());
              setForceUpdate(prev => prev + 1);
            }
          }
        } catch (e) {
          console.error("❌ Periodic verification check failed:", e);
        }
      }, 2000); // Check every 2 seconds

      return () => clearInterval(interval);
    }
  }, [userId, verified]);
  
  const showToast = useCallback(
    (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
      log("📣", msg);
      setToast({ message: msg, type });
      setTimeout(() => setToast(null), 4000);
    },
    []
  );

  const setErrorState = useCallback(
    (errorType: ErrorState['type'], message: string, details?: string) => {
      setError({ type: errorType, message, details });
      setVerificationState('error');
      setLastUpdated(Date.now());
      showToast(message, 'error');
    },
    [showToast, setLastUpdated]
  );

  // Check if Self module is available
  useEffect(() => {
    const available = !!(SelfQRcodeWrapper && SelfAppBuilder && getUniversalLink);
    setSelfAvailable(available);
    
    if (!available) {
      setErrorState(
        'module_unavailable',
        'Self verification is currently unavailable',
        'The Self SDK module could not be loaded. This may be due to a Node.js version compatibility issue.'
      );
    } else {
      setError(null);
    }
  }, [setErrorState]);

  // Detect connected wallet with better error handling
  useEffect(() => {
    const detectWallet = async () => {
      try {
        // Try Privy first
        const privyAddr = wallets?.[0]?.address;
        if (privyAddr && ethers.isAddress(privyAddr)) {
          const addr = ethers.getAddress(privyAddr);
          setUserId(addr);
          log("✅ Using Privy wallet:", addr);
          return;
        }

        // Fallback to extension wallet
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

        // No wallet found
        setUserId(ethers.ZeroAddress);
        if (active) {
          setErrorState(
            'wallet_required',
            'Please connect your wallet to continue',
            'A connected wallet is required for Self verification.'
          );
        }
      } catch (e) {
        log("⚠️ Wallet detection failed:", e);
        setErrorState(
          'wallet_required',
          'Wallet connection failed',
          'Unable to detect a connected wallet. Please ensure your wallet is connected and try again.'
        );
      }
    };

    detectWallet();
  }, [wallets, active, setErrorState]);

  const canBuild = useMemo(
    () => active && userId !== ethers.ZeroAddress && selfAvailable && !error,
    [active, userId, selfAvailable, error]
  );

  const hasWallet = userId !== ethers.ZeroAddress;

  const build = useCallback(async () => {
    if (!selfAvailable) {
      setErrorState('module_unavailable', 'Self verification is currently unavailable');
      return;
    }

    if (userId === ethers.ZeroAddress) {
      setErrorState('wallet_required', 'Please connect your wallet to continue');
      return;
    }

    setVerificationState('loading');
    setError(null);

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
      setVerificationState('ready');
      setLastUpdated(Date.now());
      log("✅ QR built:", link);
      showToast("QR code ready — scan with the Self app", 'success');
    } catch (e) {
      console.error("❌ Failed to build QR:", e);
      setErrorState(
        'build_failed',
        'Failed to generate verification QR code',
        e instanceof Error ? e.message : 'Unknown error occurred'
      );
      setSelfApp(null);
      setUniversalLink("");
      setLastUpdated(Date.now());
    }
  }, [selfAvailable, userId, scopeSeed, contract, setErrorState, showToast, setLastUpdated]);

  useEffect(() => {
    if (canBuild) {
      setSelfApp(null);
      setUniversalLink("");
      build();
    } else {
      setSelfApp(null);
      setUniversalLink("");
      setVerificationState('idle');
    }
  }, [canBuild, build]);

  const steps = useMemo(() => {
    console.log("🔍 Steps calculation:", { verified, verificationState, error, forceUpdate });
    const isLoading = verificationState === 'loading';
    const isReady = verificationState === 'ready';
    const isVerifying = verificationState === 'verifying';
    const isSuccess = verified || verificationState === 'success';
    const errorStep = error ? ERROR_TO_STEP[error.type] : null;
    const errorIndex = errorStep
      ? STEP_DEFINITIONS.findIndex(({ key }) => key === errorStep)
      : null;

    return STEP_DEFINITIONS.map((step, index) => {
      let status: StepStatus = 'upcoming';

      if (error && errorStep && errorIndex !== null) {
        if (index < errorIndex) status = 'completed';
        else if (index === errorIndex) status = 'error';
        else status = 'upcoming';
      } else {
        switch (step.key) {
          case 'wallet':
            status = hasWallet ? 'completed' : 'current';
            break;
          case 'generate':
            if (!active || !hasWallet) status = 'upcoming';
            else if (isSuccess || isReady || isVerifying) status = 'completed';
            else if (isLoading) status = 'current';
            else status = 'upcoming';
            break;
          case 'scan':
            if (!active || !hasWallet) status = 'upcoming';
            else if (isSuccess) status = 'completed';
            else if (isReady || isVerifying) status = 'current';
            else status = 'upcoming';
            break;
          case 'complete':
            if (isSuccess) status = 'completed';
            else if (isVerifying) status = 'current';
            else status = 'upcoming';
            break;
        }
      }

      return { ...step, status };
    });
  }, [active, error, hasWallet, verificationState, verified]);

  const onSuccess = useCallback((verificationData?: any) => {
    log("🎉 Verification success", { userId, verificationData });
    
    // Force immediate UI updates
    setVerified(true);
    setVerificationState('success');
    setLastUpdated(Date.now());

    // Log the full response to understand the data structure
    console.log("Self SDK Response:", verificationData);
    console.log("Available keys:", verificationData ? Object.keys(verificationData) : "No data");

    // Extract actual verification details from Self SDK response
    const details = {
      txHash: verificationData?.txHash || verificationData?.transactionHash || verificationData?.hash,
      proof: verificationData?.proof || verificationData?.attestation || verificationData?.credential,
      timestamp: verificationData?.timestamp || Date.now(),
      blockNumber: verificationData?.blockNumber || verificationData?.block,
    };

    log("Extracted details:", details);
    setVerificationDetails(details);

    // Save locally with actual verification data
    try {
      const key = "selfVerifiedDirectory";
      const entry = { 
        address: userId, 
        ens: null, 
        timestamp: details.timestamp,
        verificationType: 'self',
        scope: scopeSeed,
        contract: contract,
        txHash: details.txHash,
        proof: details.proof,
        blockNumber: details.blockNumber,
        rawData: verificationData // Store the full response for debugging
      };
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      const i = arr.findIndex((r: any) => r.address.toLowerCase() === userId.toLowerCase());
      if (i >= 0) arr[i] = entry; else arr.push(entry);
      localStorage.setItem(key, JSON.stringify(arr, null, 2));
      log("🗂️ Directory updated with real data:", arr);
    } catch (e) {
      console.error("❌ Directory update failed:", e);
      showToast("Verification successful, but failed to save locally", 'error');
    }

    // Force a re-render by updating state again
    setTimeout(() => {
      setVerified(true);
      setVerificationState('success');
      setLastUpdated(Date.now());
      setForceUpdate(prev => prev + 1);
      log("🔄 Forced UI update after verification");
    }, 100);

    // Additional backup verification persistence
    setTimeout(() => {
      // Double-check that verification state is persisted
      const key = "selfVerifiedDirectory";
      const raw = localStorage.getItem(key);
      if (raw) {
        const arr = JSON.parse(raw);
        const entry = arr.find((r: any) => r.address.toLowerCase() === userId.toLowerCase());
        if (entry && entry.verificationType === 'self') {
          console.log("✅ Verification data confirmed in localStorage");
          // Force another UI update to ensure state is reflected
          setVerified(true);
          setVerificationState('success');
          setForceUpdate(prev => prev + 1);
        }
      }
    }, 500);

    showToast("🎉 You are verified!", 'success');
    onVerificationSuccess?.(userId);
    
    // Keep dialog open to show success state - don't auto-close
  }, [userId, scopeSeed, contract, showToast, onVerificationSuccess, setLastUpdated]);

  const onError = useCallback((e?: any) => {
    console.error("❌ Verification error:", e);
    setLastUpdated(Date.now());
    setErrorState(
      'verification_failed',
      'Verification failed',
      e?.message || 'The verification process encountered an error. Please try again.'
    );
  }, [setErrorState, setLastUpdated]);

  const handleRetry = useCallback(() => {
    setError(null);
    setVerificationState('idle');
    setLastUpdated(Date.now());
    if (canBuild) {
      build();
    }
  }, [canBuild, build, setLastUpdated]);

  const getStateIcon = () => {
    switch (verificationState) {
      case 'loading':
        return <Loader2 className="size-5 animate-spin text-var(--eyi-primary)" />;
      case 'ready':
        return <QrCode className="size-5 text-var(--eyi-mint)" />;
      case 'success':
        return <CheckCircle2 className="size-5 text-var(--eyi-mint)" />;
      case 'error':
        return <AlertCircle className="size-5 text-var(--eyi-rose)" />;
      default:
        return <Eye className="size-5 text-var(--eyi-slate)" />;
    }
  };

  const getStateMessage = () => {
    if (error) return error.message;
    if (verified || verificationState === 'success') return "You're now verified with Self.";
    if (!active) return "Activate Self verification to generate your proof session.";
    if (!hasWallet) return "Waiting for a connected wallet to continue.";
    if (verificationState === 'loading') return "Generating a Self verification session...";
    if (verificationState === 'ready') return "Scan the QR code using the Self app to approve.";
    if (verificationState === 'verifying') return "Awaiting confirmation from the Self network...";
    return "Ready when you are — start verification to continue.";
  };

  const formattedLastUpdated = useMemo(() => new Date(lastUpdated).toLocaleString(), [lastUpdated]);

  const headerBadge = useMemo(() => {
    if (error) return { label: 'Action required', tone: 'var(--eyi-rose)' };
    if (verified || verificationState === 'success') return { label: 'Verified', tone: 'var(--eyi-mint)' };
    if (!active) return { label: 'Idle', tone: 'var(--eyi-slate)' };
    if (!hasWallet) return { label: 'Connect wallet', tone: 'var(--eyi-slate)' };
    if (verificationState === 'loading') return { label: 'Preparing session', tone: 'var(--eyi-primary)' };
    if (verificationState === 'ready') return { label: 'Awaiting scan', tone: 'var(--eyi-primary)' };
    return { label: 'In progress', tone: 'var(--eyi-primary)' };
  }, [active, error, hasWallet, verificationState, verified]);

  const headerBadgeIcon = useMemo(() => {
    if (error) return AlertCircle;
    if (verified || verificationState === 'success') return Sparkles;
    if (!hasWallet) return Eye;
    if (verificationState === 'loading') return Loader2;
    if (verificationState === 'ready') return QrCode;
    return Shield;
  }, [error, hasWallet, verificationState, verified]);

  const isBadgeSpinning = headerBadgeIcon === Loader2;
  const BadgeIcon = headerBadgeIcon;

  const shorten = useCallback((value?: string | null, lead = 6, tail = 4) => {
    if (!value) return '—';
    if (value.length <= lead + tail) return value;
    return `${value.slice(0, lead)}...${value.slice(-tail)}`;
  }, []);

  const hasUniversalLink = Boolean(universalLink);

  const openUniversalLink = useCallback(() => {
    if (universalLink) {
      window.open(universalLink, '_blank', 'noopener');
    }
  }, [universalLink]);

  const sessionTimestamp = verificationDetails?.timestamp ?? lastUpdated;

  const sessionDetails = useMemo(
    () => [
      {
        label: 'Wallet',
        value: hasWallet ? shorten(userId, 6, 6) : 'Not connected',
        tone: hasWallet ? 'var(--eyi-mint)' : 'var(--eyi-slate)',
        mono: hasWallet,
      },
      {
        label: 'Scope',
        value: scopeSeed,
        tone: 'var(--eyi-primary)',
        mono: false,
      },
      {
        label: 'Contract',
        value: shorten(contract, 8, 6),
        tone: 'var(--eyi-primary)',
        mono: true,
      },
      {
        label: 'Endpoint',
        value: ENDPOINT_TYPE.replace('_', ' '),
        tone: 'var(--eyi-slate)',
        mono: false,
      },
      {
        label: 'Last update',
        value: new Date(sessionTimestamp).toLocaleString(),
        tone: 'var(--eyi-slate)',
        mono: false,
      },
    ],
    [ENDPOINT_TYPE, contract, hasWallet, scopeSeed, sessionTimestamp, shorten, userId]
  );

  const verificationMeta = useMemo(() => {
    if (!verificationDetails) return [] as Array<{ label: string; value: string; tone?: string }>;
    return [
      verificationDetails.txHash && {
        label: 'Transaction',
        value: shorten(verificationDetails.txHash, 10, 6),
        tone: 'var(--eyi-mint)',
      },
      verificationDetails.blockNumber && {
        label: 'Block number',
        value: verificationDetails.blockNumber,
        tone: 'var(--eyi-primary)',
      },
      verificationDetails.proof && {
        label: 'Proof reference',
        value: shorten(verificationDetails.proof, 12, 8),
        tone: 'var(--eyi-primary)',
      },
    ].filter(Boolean) as Array<{ label: string; value: string; tone?: string }>;
  }, [shorten, verificationDetails]);

  const toastTone = toast
    ? toast.type === 'error'
      ? 'var(--eyi-rose)'
      : toast.type === 'success'
        ? 'var(--eyi-mint)'
        : 'var(--eyi-primary)'
    : null;

  const primaryPanel = useMemo(() => {
    console.log("🎨 Primary panel render:", { verified, verificationState, verificationDetails });
    
    if (verified || verificationState === 'success') {
      console.log("✅ Rendering success state");
      return (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-xl border border-var(--eyi-mint)/40 bg-gradient-to-br from-var(--eyi-mint)/10 via-transparent to-var(--eyi-primary)/10 p-6 shadow-lg"
        >
          <motion.div
            className="absolute inset-0 blur-3xl opacity-30"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 6, repeat: Infinity }}
            style={{
              background: 'radial-gradient(circle at top, var(--eyi-mint) 0%, transparent 55%)',
            }}
          />
          <div className="relative flex flex-col items-center gap-4 text-center">
            <motion.div
              className="relative"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <CheckCircle2 className="size-16 text-var(--eyi-mint)" />
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-var(--eyi-mint)/30"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.4, repeat: Infinity }}
              />
            </motion.div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-var(--eyi-mint)">Verification Complete!</h3>
              <p className="text-sm text-muted-foreground">
                Your Self personhood proof has been issued successfully.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Wallet</p>
                <p className="font-mono text-sm font-semibold text-var(--eyi-mint)">
                  {shorten(userId, 4, 4)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Scope</p>
                <p className="text-sm font-semibold text-var(--eyi-primary)">
                  {scopeSeed}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    if (error) {
      return (
        <motion.div
          key={`error-${error.type}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-xl border border-var(--eyi-rose)/40 bg-gradient-to-br from-var(--eyi-rose)/12 via-transparent to-red-500/10 p-6 shadow-lg"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="size-12 text-var(--eyi-rose)" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-var(--eyi-rose)">{error.message}</h3>
              {error.details && (
                <p className="text-sm text-muted-foreground">{error.details}</p>
              )}
            </div>
          </div>
        </motion.div>
      );
    }

    if (selfApp && SelfQRcodeWrapper) {
      return (
        <motion.div
          key="qr"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex flex-col items-center gap-6 rounded-xl border border-border/70 bg-card/70 p-6 shadow-lg backdrop-blur"
        >
          <div className="flex items-center gap-2 rounded-full border border-var(--eyi-primary)/30 bg-var(--eyi-primary)/10 px-4 py-2 text-sm font-medium text-var(--eyi-primary)">
            <QrCode className="size-4" />
            Ready to scan
          </div>
          <div className="rounded-lg border border-border/60 bg-background/70 p-4 shadow-inner">
            <SelfQRcodeWrapper selfApp={selfApp} onSuccess={onSuccess} onError={onError} />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Open the Self app and scan this QR code to continue your verification.
            </p>
            <p className="text-xs text-muted-foreground">
              The session refreshes automatically.
            </p>
          </div>
        </motion.div>
      );
    }

    const isLoadingState = verificationState === 'loading';

    return (
      <motion.div
        key={`pending-${verificationState}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6 rounded-xl border border-border/60 bg-card/70 p-6 text-center shadow-lg backdrop-blur"
      >
        <div className="relative flex h-16 w-16 items-center justify-center rounded-xl border border-border/60 bg-background/80">
          {isLoadingState ? (
            <Loader2 className="size-8 animate-spin text-var(--eyi-primary)" />
          ) : hasWallet ? (
            <QrCode className="size-8 text-var(--eyi-primary)" />
          ) : (
            <Smartphone className="size-8 text-var(--eyi-slate)" />
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {isLoadingState
              ? 'Preparing your verification session'
              : hasWallet
                ? 'Start verification to generate your QR session'
                : 'Connect your wallet to begin'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isLoadingState
              ? 'We are securely creating a session with the Self SDK.'
              : hasWallet
                ? 'Activate Self verification and we will build a fresh QR for your proof.'
                : 'We could not detect a wallet connection. Connect a wallet and retry.'}
          </p>
        </div>
        {!hasWallet && (
          <div className="flex items-center gap-2 text-var(--eyi-rose)">
            <AlertCircle className="size-4" />
            <span className="text-sm">Wallet connection required.</span>
          </div>
        )}
      </motion.div>
    );
  }, [
    verified,
    verificationState,
    error,
    handleRetry,
    hasUniversalLink,
    openUniversalLink,
    selfApp,
    onSuccess,
    onError,
    contract,
    hasWallet,
    scopeSeed,
    sessionTimestamp,
    shorten,
    selfAvailable,
    userId,
    verificationDetails,
  ]);

  // Normal dialog close behavior - no restrictions
  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
  }, []);

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "gap-2 transition-all duration-300 hover:border-var(--eyi-primary)/50",
            verified && "border-var(--eyi-mint)/50 bg-var(--eyi-mint)/10 text-var(--eyi-mint)",
            className
          )}
        >
          {getStateIcon()}
          <span>
            {verified ? "Verified with Self" : "Verify with Self"}
          </span>
          {verified && <CheckCircle2 className="size-4" />}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <motion.div
              className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-card/60"
              animate={{
                rotate: verificationState === 'loading' ? 360 : 0,
                scale: verified ? [1, 1.08, 1] : 1,
              }}
              transition={{
                rotate: { duration: 2, repeat: verificationState === 'loading' ? Infinity : 0, ease: 'linear' },
                scale: { duration: 1.5, repeat: verified ? Infinity : 0, ease: 'easeInOut' },
              }}
            >
              {getStateIcon()}
            </motion.div>
            <div>
              <h2 className="text-xl font-semibold eyi-gradient-text">Self Verification</h2>
              <p className="text-sm text-muted-foreground">Zero-knowledge personhood proof</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-center">
            <div
              className="flex items-center gap-2 rounded-full border px-4 py-2 font-medium shadow-sm"
              style={{
                color: headerBadge.tone,
                borderColor: headerBadge.tone,
                background: `color-mix(in oklab, ${headerBadge.tone} 12%, transparent)`
              }}
            >
              <BadgeIcon className={cn('size-4', isBadgeSpinning && 'animate-spin')} />
              <span>{headerBadge.label}</span>
            </div>
          </div>

          {/* Verification Complete Notice */}
          {(verified || verificationState === 'success') && (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-var(--eyi-mint)/40 bg-var(--eyi-mint)/10 px-4 py-3 text-sm text-var(--eyi-mint)">
              <CheckCircle2 className="size-4" />
              <span className="font-medium">Verification Complete - Dialog will remain open to show your success!</span>
            </div>
          )}

          {/* Simplified Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const StepStateIcon =
                step.status === 'completed'
                  ? CheckCircle2
                  : step.status === 'error'
                    ? AlertCircle
                    : step.Icon;
              const tone = STEP_TONE[step.status];

              return (
                <motion.div
                  key={step.key}
                  layout
                  className="flex items-center gap-4 rounded-lg border p-4"
                  style={{
                    borderColor: `color-mix(in oklab, ${tone} 30%, transparent)`,
                    background: `color-mix(in oklab, ${tone} 8%, transparent)`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-current/30 bg-background/60"
                      style={{ color: tone }}
                    >
                      {step.status === 'current' ? (
                        <>
                          <Loader2 className="size-5 animate-spin" />
                          <step.Icon className="pointer-events-none absolute size-3 opacity-70" />
                        </>
                      ) : (
                        <StepStateIcon className="size-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium" style={{ color: tone }}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  <div className="ml-auto">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                      style={{
                        color: tone,
                        background: `color-mix(in oklab, ${tone} 20%, transparent)`,
                        border: '1px solid',
                        borderColor: `color-mix(in oklab, ${tone} 40%, transparent)`,
                      }}
                    >
                      {STEP_STATUS_LABEL[step.status]}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="space-y-4" key={`content-${forceUpdate}`}>
            {primaryPanel}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <div className="flex gap-2">
              {verified && (
                <Button 
                  size="sm" 
                  onClick={() => {
                    console.log("✅ User closing dialog after verification");
                    setIsDialogOpen(false);
                  }}
                  className="gap-2 bg-var(--eyi-mint) text-white hover:bg-var(--eyi-mint)/90"
                >
                  <CheckCircle2 className="size-4" />
                  Close
                </Button>
              )}
              {hasUniversalLink && (
                <Button size="sm" variant="outline" onClick={openUniversalLink} className="gap-2">
                  <ExternalLink className="size-4" />
                  Open Self app
                </Button>
              )}
              {!verified && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRetry}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="size-4" />
                  Refresh session
                </Button>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Updated {formattedLastUpdated}
            </div>
          </div>
        </div>

        {/* Toast Notifications */}
        <AnimatePresence>
          {toast && toastTone && (
            <motion.div
              key={toast.message}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border px-4 py-3 shadow-lg backdrop-blur"
              style={{
                borderColor: `color-mix(in oklab, ${toastTone} 35%, transparent)`,
                background: `color-mix(in oklab, ${toastTone} 12%, transparent)`,
                color: toastTone,
              }}
            >
              <p className="text-sm font-medium">{toast.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
