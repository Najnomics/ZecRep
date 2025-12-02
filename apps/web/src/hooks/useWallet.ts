"use client";

import { useState, useEffect } from "react";

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
  });

  useEffect(() => {
    // Check if wallet is already connected
    if (typeof window.ethereum !== "undefined") {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setState({
              address: accounts[0],
              isConnected: true,
              chainId: null,
            });
          }
        })
        .catch(console.error);
    }
  }, []);

  const connect = async () => {
    if (typeof window.ethereum === "undefined") {
      throw new Error("MetaMask or compatible wallet not found");
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      setState({
        address: accounts[0],
        isConnected: true,
        chainId: parseInt(chainId as string, 16),
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  };

  const disconnect = () => {
    setState({
      address: null,
      isConnected: false,
      chainId: null,
    });
  };

  return {
    ...state,
    connect,
    disconnect,
  };
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (args: unknown[]) => void) => void;
    };
  }
}

