import { useState, useEffect } from 'react'
import { Layout, Menu, Card, Row, Col, Statistic, Tag } from 'antd'
import { ShoppingCartOutlined, InboxOutlined, DollarOutlined, AlertOutlined } from '@ant-design/icons'
import ProductManagement from './components/ProductManagement'
import InventoryManagement from './components/InventoryManagement'
import SalesManagement from './components/SalesManagement'
import PurchaseManagement from './components/PurchaseManagement'
import axios from 'axios'

const { Header, Content, Sider } = Layout

interface Stats {
  totalProducts: number
  totalInventoryValue: number
  todaySales: number
  lowStock: any[]
}

function App() {
  const [activeKey, setActiveKey] = useState('1')
  const [stats, setStats] = useState<Stats | null>(null)

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/stats')
      setStats(res.data)
    } catch (error) {
      console.error('获取统计数据失败', error)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const renderContent = () => {
    switch (activeKey) {
      case '1':
        return <ProductManagement onUpdate={fetchStats} />
      case '2':
        return <InventoryManagement onUpdate={fetchStats} />
      case '3':
        return <SalesManagement onUpdate={fetchStats} />
      case '4':
        return <PurchaseManagement onUpdate={fetchStats} />
      default:
        return null
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>进销存管理系统</h1>
      </Header>
      <Layout>
        <Sider width={200} theme="light">
          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            onClick={({ key }) => setActiveKey(key)}
            items={[
              { key: '1', label: '产品管理', icon: <ShoppingCartOutlined /> },
              { key: '2', label: '库存管理', icon: <InboxOutlined /> },
              { key: '3', label: '销售管理', icon: <DollarOutlined /> },
              { key: '4', label: '采购管理', icon: <ShoppingCartOutlined /> },
            ]}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic title="产品总数" value={stats?.totalProducts || 0} prefix={<ShoppingCartOutlined />} />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="库存总值" 
                  value={stats?.totalInventoryValue || 0} 
                  precision={2} 
                  prefix="¥" 
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="今日销售额" 
                  value={stats?.todaySales || 0} 
                  precision={2} 
                  prefix="¥" 
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="库存预警" 
                  value={stats?.lowStock?.length || 0} 
                  prefix={<AlertOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>
          {stats?.lowStock && stats.lowStock.length > 0 && (
            <Card style={{ marginBottom: 24 }} title="库存预警">
              {stats.lowStock.map((item: any) => (
                <Tag color="warning" key={item.id} style={{ marginRight: 8, marginBottom: 8 }}>
                  {item.product_name}: 当前库存 {item.quantity} (最低 {item.min_quantity})
                </Tag>
              ))}
            </Card>
          )}
          <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default App
