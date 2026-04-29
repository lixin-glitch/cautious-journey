import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, message, Space } from 'antd'
import axios from 'axios'

interface Product {
  id: number
  name: string
  category?: string
  price: number
  description?: string
}

interface Props {
  onUpdate: () => void
}

export default function ProductManagement({ onUpdate }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form] = Form.useForm()

  const fetchProducts = async () => {
    const res = await axios.get('/api/products')
    setProducts(res.data)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleAdd = () => {
    setEditingProduct(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (record: Product) => {
    setEditingProduct(record)
    form.setFieldsValue(record)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/products/${id}`)
      message.success('删除成功')
      fetchProducts()
      onUpdate()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id}`, values)
        message.success('更新成功')
      } else {
        await axios.post('/api/products', values)
        message.success('添加成功')
      }
      setIsModalOpen(false)
      fetchProducts()
      onUpdate()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const columns = [
    { title: '产品名称', dataIndex: 'name', key: 'name' },
    { title: '分类', dataIndex: 'category', key: 'category' },
    { title: '价格', dataIndex: 'price', key: 'price', render: (p: number) => `¥${p.toFixed(2)}` },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { 
      title: '操作', 
      key: 'action', 
      render: (_: any, record: Product) => (
        <Space>
          <Button onClick={() => handleEdit(record)}>编辑</Button>
          <Button danger onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      )
    },
  ]

  return (
    <div>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>
        添加产品
      </Button>
      <Table columns={columns} dataSource={products} rowKey="id" />
      
      <Modal
        title={editingProduct ? '编辑产品' : '添加产品'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="产品名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Input />
          </Form.Item>
          <Form.Item name="price" label="价格" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
