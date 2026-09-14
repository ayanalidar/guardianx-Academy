"use client"

import * as React from "react"
import { useQuery } from "@tanstack/react-query"

/* ============================================================
   useCurrency — detects user's currency + provides conversion

   1. Detects the user's timezone → maps to a currency code
   2. Lets the user override via localStorage (currency toggle)
   3. Fetches exchange rates from /api/currency-rates (cached 1h)
   4. Provides formatPrice(inrAmount) → returns converted + formatted
   ============================================================ */

interface CurrencyInfo {
  code: string
  symbol: string
  label: string
}

const ALL_CURRENCIES: CurrencyInfo[] = [
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "AED", symbol: "AED ", label: "UAE Dirham" },
  { code: "SGD", symbol: "S$", label: "Singapore Dollar" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
]

const CURRENCY_MAP: Record<string, string> = {
  "Asia/Kolkata": "INR",
  "Asia/Calcutta": "INR",
  "America/": "USD",
  "Pacific/": "USD",
  "US/": "USD",
  "Europe/London": "GBP",
  "Europe/Dublin": "EUR",
  "Europe/": "EUR",
  "Asia/Dubai": "AED",
  "Asia/Singapore": "SGD",
  "Australia/": "AUD",
  "Canada/": "CAD",
}

const STORAGE_KEY = "guardianx-currency"

/** Detect the user's currency from their browser timezone */
function detectCurrency(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""
    // Check exact matches first
    if (CURRENCY_MAP[tz]) return CURRENCY_MAP[tz]
    // Check prefix matches
    for (const prefix of Object.keys(CURRENCY_MAP)) {
      if (tz.startsWith(prefix)) return CURRENCY_MAP[prefix]
    }
  } catch {}
  return "USD" // Default to USD for international users
}

export function useCurrency() {
  // Read the user's preferred currency (from localStorage or auto-detected)
  const [currencyCode, setCurrencyCode] = React.useState<string>("USD")

  // Initialize on mount
  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && ALL_CURRENCIES.some((c) => c.code === stored)) {
      setCurrencyCode(stored)
    } else {
      const detected = detectCurrency()
      setCurrencyCode(detected)
      localStorage.setItem(STORAGE_KEY, detected)
    }
  }, [])

  // Fetch exchange rates (cached in TanStack Query for 1 hour)
  const { data } = useQuery<{
    rates: Record<string, number>
    currencies: CurrencyInfo[]
  }>({
    queryKey: ["currency-rates"],
    queryFn: async () => {
      const res = await fetch("/api/currency-rates")
      if (!res.ok) return { rates: { INR: 1 }, currencies: ALL_CURRENCIES }
      return res.json()
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false,
  })

  const rates = data?.rates ?? { INR: 1 }
  const currencies = data?.currencies ?? ALL_CURRENCIES
  const currencyInfo = currencies.find((c) => c.code === currencyCode) ?? ALL_CURRENCIES[0]
  const rate = rates[currencyCode] ?? 1 // INR to target currency

  /** Convert an INR amount to the user's currency + format with symbol */
  const formatPrice = React.useCallback((inrAmount: number): string => {
    const converted = inrAmount * rate
    // Round to nearest whole number for clean display
    const rounded = Math.round(converted)
    return `${currencyInfo.symbol}${rounded.toLocaleString("en-US")}`
  }, [rate, currencyInfo])

  /** Convert an INR amount to the user's currency (just the number, no symbol) */
  const convertPrice = React.useCallback((inrAmount: number): number => {
    return Math.round(inrAmount * rate)
  }, [rate])

  /** Change the currency (called by the header toggle) */
  const changeCurrency = React.useCallback((code: string) => {
    setCurrencyCode(code)
    localStorage.setItem(STORAGE_KEY, code)
  }, [])

  return {
    currencyCode,
    currencySymbol: currencyInfo.symbol,
    currencyLabel: currencyInfo.label,
    currencies,
    rate,
    formatPrice,
    convertPrice,
    changeCurrency,
    isINR: currencyCode === "INR",
  }
}
