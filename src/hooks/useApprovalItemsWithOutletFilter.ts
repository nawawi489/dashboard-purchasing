import { useEffect, useState } from 'react'
import { ApprovalItem } from '../types'
import { fetchApprovalItems } from '../services/approval'

type UseApprovalItemsResult = {
  items: ApprovalItem[]
  loading: boolean
  error: string | null
  outletFilter: string
  setOutletFilter: (value: string) => void
  loadData: (forceRefresh?: boolean) => Promise<void>
}

export function useApprovalItemsWithOutletFilter(defaultErrorMessage: string): UseApprovalItemsResult {
  const [items, setItems] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [outletFilter, setOutletFilter] = useState('')
  const [dataCache, setDataCache] = useState<Record<string, ApprovalItem[]>>({})

  const loadData = async (forceRefresh = false) => {
    if (!forceRefresh && dataCache[outletFilter] !== undefined) {
      setItems(dataCache[outletFilter])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await fetchApprovalItems(outletFilter)
      setItems(data)
      setDataCache((prev) => ({
        ...prev,
        [outletFilter]: data,
      }))
    } catch (e) {
      setError(defaultErrorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [outletFilter])

  return {
    items,
    loading,
    error,
    outletFilter,
    setOutletFilter,
    loadData,
  }
}

