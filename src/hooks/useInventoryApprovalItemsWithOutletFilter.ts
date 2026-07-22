import { useEffect, useState } from 'react'
import { InventoryApprovalItem } from '../types'
import { fetchApprovedInventoryItems } from '../services/inventoryApproval'

type UseInventoryApprovalItemsResult = {
  items: InventoryApprovalItem[]
  loading: boolean
  error: string | null
  outletFilter: string
  setOutletFilter: (value: string) => void
  loadData: (forceRefresh?: boolean) => Promise<void>
}

export function useInventoryApprovalItemsWithOutletFilter(
  defaultErrorMessage: string,
): UseInventoryApprovalItemsResult {
  const [items, setItems] = useState<InventoryApprovalItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [outletFilter, setOutletFilter] = useState('')
  const [dataCache, setDataCache] = useState<Record<string, InventoryApprovalItem[]>>({})

  const loadData = async (forceRefresh = false) => {
    if (!forceRefresh && dataCache[outletFilter] !== undefined) {
      setItems(dataCache[outletFilter])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await fetchApprovedInventoryItems(outletFilter)
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
