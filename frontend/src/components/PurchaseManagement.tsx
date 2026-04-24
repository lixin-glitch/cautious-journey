import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Select, InputNumber, Input, message } from 'antd'
import axios from 'axios'

interface Product {
  id: number
  name: string
  price: number
}

interface Purchase {
  id: number
  product_id: number
  quantity: number
  total_price: number
  supplier_name?: string
  purchase_date: string
  product_name: string
}

interface Props {
  onUpdate: () => void
}

export default function PurchaseManagement({ onUpdate }: Props) {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  const fetchPurchases = async () => {
    const res = await axios.get('/api/purchases')
    setPurchases(res.data)
  }

  const fetchProducts = async () => {
    const res = await axios.get('/api/products')
    setProducts(res.data)
  }

  useEffect(() => {
    fetchPurchases()
    fetchProducts()
  }, [])

  const handleAdd = () => {
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await axios.post('/api/purchases', values)
      message.success('采购记录添加成功')
      setIsModalOpen(false)
      fetchPurchases()
      onUpdate()
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败')
    }
  }

  const columns = [
    { title: '产品名称', dataIndex: 'product_name', key: 'product_name' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '总价', dataIndex: 'total_price', key: 'total_price', render: (p: number) => `¥${p.toFixed(2)}` },
    { title: '供应商', dataIndex: 'supplier_name', key: 'supplier_name' },
    { title: '采购时间', dataIndex: 'purchase_date', key: 'purchase_date' },
  ]

  return (
    <div>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        新增采购
      </Button>
      <Table columns={columns} dataSource={purchases} rowKey="id" />
      
      <Modal
        title="新增采购"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="product_id" label="选择产品" rules={[{ required: true }]}>
            <Select>
              {products.map(p => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name} - ¥{p.price.toFixed(2)}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="数量" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="purchase_price" label="采购单价（可选）">
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>
          <Form.Item name="supplier_name" label="供应商名称">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
