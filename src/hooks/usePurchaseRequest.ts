import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineItem, ItemRow } from '../types'
import { OUTLETS } from '../constants'

type GroupedItems = Record<string, LineItem[]>

export function usePurchaseRequest() {
  const navigate = useNavigate()
  const outlets = OUTLETS

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [outlet, setOutlet] = useState<string>('')
  const [itemId, setItemId] = useState<string>('')
  const [itemName, setItemName] = useState<string>('')
  const [unit, setUnit] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [supplier, setSupplier] = useState<string>('')
  const [price, setPrice] = useState<number>(0)
  const [phone, setPhone] = useState<string>('')
  const [itemsList, setItemsList] = useState<LineItem[]>([])

  const resetForm = () => {
    setItemId('')
    setItemName('')
    setUnit('')
    setSupplier('')
    setPrice(0)
    setPhone('')
    setQuantity(1)
  }

  const handleSelectItem = (item: ItemRow | null, name: string) => {
    setItemName(name)
    if (item) {
      setItemId(item.id || '')
      setUnit(item.unit)
      setSupplier(item.supplier || '')
      setPrice(item.price || 0)
      setPhone(item.phone || '')
    }
  }

  const addToList = () => {
    if (!itemName || !unit || quantity <= 0) return
    const currentSupplier = supplier || ''

    const idx = itemsList.findIndex(
      (it) => it.name === itemName && it.unit === unit && it.supplier === currentSupplier,
    )

    if (idx >= 0) {
      const next = [...itemsList]
      const prev = next[idx]
      next[idx] = {
        ...prev,
        quantity: prev.quantity + quantity,
        price: price || prev.price,
        supplier: currentSupplier || prev.supplier,
        phone: phone || prev.phone,
      }
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
          supplier: currentSupplier,
          phone,
        },
      ])
    }

    resetForm()
  }

  const groupedItems = useMemo<GroupedItems>(() => {
    return itemsList.reduce((acc, item) => {
      const key = item.supplier || 'Tanpa Supplier'
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {} as GroupedItems)
  }, [itemsList])

  const handleSubmit = async () => {
    if (!date || !outlet) return
    if (itemsList.length === 0) {
      alert('Tambahkan minimal satu barang ke daftar sebelum mengirim.')
      return
    }
    setSubmitting(true)
    const payload = { date, outlet, items: itemsList }
    navigate('/confirm-po', { state: payload })
    setSubmitting(false)
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value)
  }

  const handleOutletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOutlet(e.target.value)
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
    itemName,
    unit,
    quantity,
    submitting,
    supplier,
    price,
    itemsList,
    groupedItems,
    handleDateChange,
    handleOutletChange,
    handleQuantityChange,
    handleItemQuantityChange,
    handleRemoveItem,
    handleSubmit,
    resetForm,
    addToList,
    handleSelectItem,
    isAddDisabled,
    isSubmitDisabled,
  }
}

