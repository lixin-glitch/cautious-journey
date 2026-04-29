import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, message, Tag, Space } from 'antd'
import axios from 'axios'

interface Inventory {
  id: number
  product_id: number
  quantity: number
  min_quantity: number
  location?: string
  product_name: string
}

interface Props {
  onUpdate: () => void
}

export default function InventoryManagement({ onUpdate }: Props) {
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Inventory | null>(null)
  const [form] = Form.useForm()

  const fetchInventory = async () => {
    const res = await axios.get('/api/inventory')
    setInventory(res.data)
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  const handleEdit = (record: Inventory) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await axios.post(`/api/inventory/${editingItem?.id}/adjust`, values)
      message.success('库存调整成功')
      setIsModalOpen(false)
      fetchInventory()
      onUpdate()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const columns = [
    { title: '产品名称', dataIndex: 'product_name', key: 'product_name' },
    { 
      title: '当前库存', 
      dataIndex: 'quantity', 
      key: 'quantity',
      render: (q: number, record: Inventory) => (
        <Tag color={q <= record.min_quantity ? 'warning' : 'success'}>
          {q}
        </Tag>
      )
    },
    { title: '最低库存', dataIndex: 'min_quantity', key: 'min_quantity' },
    { title: '库位', dataIndex: 'location', key: 'location' },
    { 
      title: '操作', 
      key: 'action', 
      render: (_: any, record: Inventory) => (
        <Button onClick={() => handleEdit(record)}>调整库存</Button>
      )
    },
  ]

  return (
    <div>
      <Table columns={columns} dataSource={inventory} rowKey="id" />
      
      <Modal
        title="调整库存"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="quantity" label="当前库存" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="min_quantity" label="最低库存">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="location" label="库位">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
