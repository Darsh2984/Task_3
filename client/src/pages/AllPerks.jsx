import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function AllPerks() {
  const [perks, setPerks] = useState([])
  const [allMerchants, setAllMerchants] = useState([]) // ✅ store all merchants separately
  const [uniqueMerchants, setUniqueMerchants] = useState([]) // shown in dropdown
  const [searchQuery, setSearchQuery] = useState('')
  const [merchantFilter, setMerchantFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // =========================================================
  // Load perks + all merchants once when page loads
  // =========================================================
  useEffect(() => {
    async function initialLoad() {
      try {
        const res = await api.get('/perks/all')
        setPerks(res.data.perks)

        // extract merchants once from all perks
        const merchants = res.data.perks
          .map(perk => perk.merchant)
          .filter(merchant => merchant && merchant.trim())
        const unique = [...new Set(merchants)]
        setAllMerchants(unique)
        setUniqueMerchants(unique)
      } catch (err) {
        console.error('Failed to load perks:', err)
        setError(err?.response?.data?.message || 'Failed to load perks')
      } finally {
        setLoading(false)
      }
    }

    initialLoad()
  }, [])

  // =========================================================
  // Reload perks whenever filters change (debounced)
  // =========================================================
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadAllPerks()
    }, 500)
    return () => clearTimeout(delayDebounce)
  }, [searchQuery, merchantFilter])

  // =========================================================
  // Load filtered perks only
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
      // ✅ keep showing full list of merchants, not filtered ones
      setUniqueMerchants(allMerchants)
    } catch (err) {
      console.error('Failed to load perks:', err)
      setError(err?.response?.data?.message || 'Failed to load perks')
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    loadAllPerks()
  }

  function handleReset() {
    setSearchQuery('')
    setMerchantFilter('')
    setUniqueMerchants(allMerchants) // ✅ reset full dropdown
  }

  // =========================================================
  // Render
  // =========================================================
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Perks</h1>
        <div className="text-sm text-zinc-600">
          Showing {perks.length} perk{perks.length !== 1 ? 's' : ''}
        </div>
      </div>

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
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Merchant Filter */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                <span className="material-symbols-outlined text-sm align-middle">store</span>{' '}
                Filter by Merchant
              </label>
              <select
                className="input"
                value={merchantFilter}
                onChange={e => setMerchantFilter(e.target.value)}
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

          <div className="flex gap-3 items-center">
            <button
              type="submit"
              className="btn bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
            >
              Search Now
            </button>
            <button type="button" onClick={handleReset} className="btn">
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

      {/* Error */}
      {error && (
        <div className="card border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-600">
            <span className="material-symbols-outlined">error</span>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {perks.map(perk => (
          <Link
            key={perk._id}
            to={`/perks/${perk._id}`}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="font-semibold text-lg text-zinc-900 mb-2">{perk.title}</div>
            {perk.merchant && (
              <div className="text-sm text-zinc-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">store</span>
                {perk.merchant}
              </div>
            )}
            {perk.discountPercent > 0 && (
              <div className="text-sm text-green-600 font-semibold flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-xs">local_offer</span>
                {perk.discountPercent}% OFF
              </div>
            )}
          </Link>
        ))}

        {!loading && perks.length === 0 && (
          <div className="col-span-full text-center py-12 text-zinc-600">
            <span className="material-symbols-outlined text-5xl mb-4 block text-zinc-400">
              sentiment_dissatisfied
            </span>
            <p className="text-lg">No perks found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
