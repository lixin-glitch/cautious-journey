import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Select, InputNumber, Input, message, Space } from 'antd'
import axios from 'axios'

interface Product {
  id: number
  name: string
  price: number
}

interface Sale {
  id: number
  product_id: number
  quantity: number
  total_price: number
  customer_name?: string
  sale_date: string
  product_name: string
}

interface Props {
  onUpdate: () => void
}

export default function SalesManagement({ onUpdate }: Props) {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  const fetchSales = async () => {
    const res = await axios.get('/api/sales')
    setSales(res.data)
  }

  const fetchProducts = async () => {
    const res = await axios.get('/api/products')
    setProducts(res.data)
  }

  useEffect(() => {
    fetchSales()
    fetchProducts()
  }, [])

  const handleAdd = () => {
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      await axios.post('/api/sales', values)
      message.success('销售记录添加成功')
      setIsModalOpen(false)
      fetchSales()
      onUpdate()
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败')
    }
  }

  const columns = [
    { title: '产品名称', dataIndex: 'product_name', key: 'product_name' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '总价', dataIndex: 'total_price', key: 'total_price', render: (p: number) => `¥${p.toFixed(2)}` },
    { title: '客户', dataIndex: 'customer_name', key: 'customer_name' },
    { title: '销售时间', dataIndex: 'sale_date', key: 'sale_date' },
  ]

  return (
    <div>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        新增销售
      </Button>
      <Table columns={columns} dataSource={sales} rowKey="id" />
      
      <Modal
        title="新增销售"
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
          <Form.Item name="customer_name" label="客户名称">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
