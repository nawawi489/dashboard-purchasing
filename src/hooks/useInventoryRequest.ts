import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineItem, ItemRow } from '../types'
import { OUTLETS } from '../constants'

type GroupedItems = Record<string, LineItem[]>

export type InventoryRequestSubmitPayload = {
  date: string
  outlet: string
  note: string
  items: LineItem[]
}

export function useInventoryRequest() {
  const navigate = useNavigate()
  const outlets = OUTLETS

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [outlet, setOutlet] = useState<string>('')
  const [note, setNote] = useState<string>('')
  const [itemId, setItemId] = useState<string>('')
  const [itemName, setItemName] = useState<string>('')
  const [unit, setUnit] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [price, setPrice] = useState<number>(0)
  const [brand, setBrand] = useState<string>('')
  const [specification, setSpecification] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [itemsList, setItemsList] = useState<LineItem[]>([])

  const resetItem = () => {
    setItemId('')
    setItemName('')
    setUnit('')
    setQuantity(1)
    setPrice(0)
    setBrand('')
    setSpecification('')
  }

  const handleSelectItem = (item: ItemRow | null, name: string) => {
    setItemName(name)
    if (item) {
      setItemId(item.id || '')
      setUnit(item.unit)
      setPrice(item.price || 0)
      setBrand(item.brand || '')
      setSpecification(item.specification || '')
    }
  }

  const addToList = () => {
    if (!itemName || !unit || quantity <= 0) return

    const idx = itemsList.findIndex(
      (it) => it.name === itemName && it.unit === unit,
    )

    if (idx >= 0) {
      const next = [...itemsList]
      const prev = next[idx]
      next[idx] = { ...prev, quantity: prev.quantity + quantity }
      setItemsList(next)
    } else {
      setItemsList([
        ...itemsList,
        {
          id: itemId,
          name: itemName,
          unit,
          quantity,
          price,
          brand: brand || undefined,
          specification: specification || undefined,
        },
      ])
    }

    resetItem()
  }

  const groupedItems = useMemo<GroupedItems>(() => {
    return itemsList.reduce((acc, item) => {
      const key = item.supplier || 'Permintaan Inventaris'
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {} as GroupedItems)
  }, [itemsList])

  const handleSubmit = () => {
    if (!date || !outlet) return
    if (itemsList.length === 0) {
      alert('Tambahkan minimal satu barang ke daftar sebelum mengirim.')
      return
    }
    setSubmitting(true)
    const payload: InventoryRequestSubmitPayload = {
      date,
      outlet,
      note: note.trim(),
      items: itemsList,
    }
    navigate('/confirm-inventory-request', { state: payload })
    setSubmitting(false)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value)
  }

  const handleOutletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOutlet(e.target.value)
  }

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(Number(e.target.value))
  }

  const handleItemQuantityChange = (idx: number, val: number) => {
    const q = val || 1
    const next = [...itemsList]
    next[idx] = { ...next[idx], quantity: q }
    setItemsList(next)
  }

  const handleRemoveItem = (idx: number) => {
    const next = itemsList.filter((_, i) => i !== idx)
    setItemsList(next)
  }

  const isAddDisabled = !itemName || !unit || quantity <= 0
  const isSubmitDisabled = submitting || !date || !outlet || itemsList.length === 0

  return {
    outlets,
    date,
    outlet,
    note,
    itemName,
    unit,
    quantity,
    price,
    submitting,
    itemsList,
    groupedItems,
    handleDateChange,
    handleOutletChange,
    handleNoteChange,
    handleQuantityChange,
    handleItemQuantityChange,
    handleRemoveItem,
    handleSubmit,
    resetItem,
    addToList,
    handleSelectItem,
    isAddDisabled,
    isSubmitDisabled,
  }
}
