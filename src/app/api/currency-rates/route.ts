import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const revalidate = 3600 // cache for 1 hour

/* GET /api/currency-rates
 * Returns exchange rates relative to INR + the user's detected currency.
 *
 * Fetches from the free open.er-api.com (no API key, no signup).
 * Server-side cache: 1 hour (via revalidate + in-memory).
 *
 * Returns: {
 *   base: "INR",
 *   rates: { USD: 0.012, EUR: 0.011, GBP: 0.0095, AED: 0.044, ... },
 *   updated: "2026-09-14T...",
 *   currencies: [ { code, symbol, label } ]  // supported currencies
 * }
 */

const SUPPORTED_CURRENCIES = [
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "AED", symbol: "AED ", label: "UAE Dirham" },
  { code: "SGD", symbol: "S$", label: "Singapore Dollar" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
]

// In-memory cache (survives across warm serverless invocations)
let _cachedRates: Record<string, number> | null = null
let _cachedAt: number = 0
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

export async function GET() {
  try {
    // Check in-memory cache
    if (_cachedRates && Date.now() - _cachedAt < CACHE_TTL) {
      return NextResponse.json({
        base: "INR",
        rates: _cachedRates,
        updated: new Date(_cachedAt).toISOString(),
        currencies: SUPPORTED_CURRENCIES,
      })
    }

    // Fetch from the free API
    const res = await fetch("https://open.er-api.com/v1/latest/INR", {
      headers: { "Accept": "application/json" },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      const fallback = {
        USD: 0.012, EUR: 0.011, GBP: 0.0095, AED: 0.044, SGD: 0.016,
        AUD: 0.018, CAD: 0.016, INR: 1,
      }
      return NextResponse.json({
        base: "INR",
        rates: fallback,
        updated: new Date().toISOString(),
        currencies: SUPPORTED_CURRENCIES,
        fallback: true,
      })
    }

    const data = await res.json()
    const rates = data.rates || {}

    _cachedRates = rates
    _cachedAt = Date.now()

    return NextResponse.json({
      base: "INR",
      rates,
      updated: new Date().toISOString(),
      currencies: SUPPORTED_CURRENCIES,
    })
  } catch (err) {
    console.error("[currency-rates] Error:", err)
    const fallback = {
      USD: 0.012, EUR: 0.011, GBP: 0.0095, AED: 0.044, SGD: 0.016,
      AUD: 0.018, CAD: 0.016, INR: 1,
    }
    return NextResponse.json({
      base: "INR",
      rates: fallback,
      updated: new Date().toISOString(),
      currencies: SUPPORTED_CURRENCIES,
      fallback: true,
    })
  }
}
