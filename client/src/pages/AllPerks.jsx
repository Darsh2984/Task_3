import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function AllPerks() {
  const [perks, setPerks] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [merchantFilter, setMerchantFilter] = useState('')
  const [uniqueMerchants, setUniqueMerchants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // =========================================================
  // useEffect #1 - INITIAL DATA LOADING
  // =========================================================
  useEffect(() => {
    loadAllPerks()
  }, []) // runs once when component mounts

  // =========================================================
  // useEffect #2 - AUTO SEARCH ON INPUT CHANGE (debounced)
  // =========================================================
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      // Only trigger reload if not currently loading
      loadAllPerks()
    }, 500) // waits 500ms after user stops typing/selecting

    return () => clearTimeout(delayDebounce)
  }, [searchQuery, merchantFilter])

  // =========================================================
  // useEffect #3 - EXTRACT UNIQUE MERCHANTS WHEN PERKS CHANGE
  // =========================================================
  useEffect(() => {
    const merchants = perks
      .map(perk => perk.merchant)
      .filter(merchant => merchant && merchant.trim())
    const unique = [...new Set(merchants)]
    setUniqueMerchants(unique)
  }, [perks])

  // =========================================================
  // LOAD PERKS FROM API
  // =========================================================
  async function loadAllPerks() {
    setError('')
    setLoading(true)
    try {
      const res = await api.get('/perks/all', {
        params: {
          search: searchQuery.trim() || undefined,
          merchant: merchantFilter.trim() || undefined,
        },
      })
      setPerks(res.data.perks)
    } catch (err) {
      console.error('Failed to load perks:', err)
      setError(err?.response?.data?.message || 'Failed to load perks')
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // EVENT HANDLERS
  // =========================================================
  function handleSearch(e) {
    e.preventDefault()
    loadAllPerks() // manual trigger
  }

  function handleReset() {
    setSearchQuery('')
    setMerchantFilter('')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Perks</h1>
        <div className="text-sm text-zinc-600">
          Showing {perks.length} perk{perks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Search and Filter Form */}
      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                <span className="material-symbols-outlined text-sm align-middle">search</span>{' '}
                Search by Name
              </label>
              <input
                type="text"
                className="input"
                placeholder="Enter perk name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} // controlled input
              />
              <p className="text-xs text-zinc-500 mt-1">
                Auto-searches as you type, or press Enter / click Search
              </p>
            </div>

            {/* Merchant Filter Dropdown */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                <span className="material-symbols-outlined text-sm align-middle">store</span>{' '}
                Filter by Merchant
              </label>
              <select
                className="input"
                value={merchantFilter}
                onChange={e => setMerchantFilter(e.target.value)} // controlled dropdown
              >
                <option value="">All Merchants</option>
                {uniqueMerchants.map(merchant => (
                  <option key={merchant} value={merchant}>
                    {merchant}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 items-center">
            <button
              type="submit"
              className="btn bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
            >
              <span className="material-symbols-outlined text-sm align-middle">search</span>{' '}
              Search Now
            </button>
            <button type="button" onClick={handleReset} className="btn">
              <span className="material-symbols-outlined text-sm align-middle">refresh</span>{' '}
              Reset Filters
            </button>

            {loading && (
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <span className="material-symbols-outlined text-sm animate-spin">
                  progress_activity
                </span>
                Searching...
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="card border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-600">
              <span className="material-symbols-outlined">error</span>
              <p>{error}</p>
            </div>
            <button onClick={loadAllPerks} className="btn text-sm">
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Perks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {perks.map(perk => (
          <Link
            key={perk._id}
            to={`/perks/${perk._id}`}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="font-semibold text-lg text-zinc-900 mb-2">{perk.title}</div>

            <div className="text-sm text-zinc-600 space-y-1">
              {perk.merchant && (
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">store</span>
                  {perk.merchant}
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">category</span>
                <span className="capitalize">{perk.category}</span>
              </div>
              {perk.discountPercent > 0 && (
                <div className="flex items-center gap-1 text-green-600 font-semibold">
                  <span className="material-symbols-outlined text-xs">local_offer</span>
                  {perk.discountPercent}% OFF
                </div>
              )}
            </div>

            {perk.description && (
              <p className="mt-2 text-sm text-zinc-700 line-clamp-2">{perk.description}</p>
            )}

            {perk.createdBy && (
              <div className="mt-3 pt-3 border-t border-zinc-200 text-xs text-zinc-500">
                Created by: {perk.createdBy.name || perk.createdBy.email}
              </div>
            )}
          </Link>
        ))}

        {perks.length === 0 && !loading && (
          <div className="col-span-full text-center py-12 text-zinc-600">
            <span className="material-symbols-outlined text-5xl mb-4 block text-zinc-400">
              sentiment_dissatisfied
            </span>
            <p className="text-lg">No perks found.</p>
            <p className="text-sm mt-2">Try adjusting your search or filters.</p>
          </div>
        )}

        {loading && perks.length === 0 && (
          <div className="col-span-full text-center py-12 text-zinc-600">
            <span className="material-symbols-outlined text-5xl mb-4 block text-zinc-400 animate-spin">
              progress_activity
            </span>
            <p className="text-lg">Loading perks...</p>
          </div>
        )}
      </div>
    </div>
  )
}
