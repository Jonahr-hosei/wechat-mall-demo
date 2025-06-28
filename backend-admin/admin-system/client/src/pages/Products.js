import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Image,
  Tag,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './Products.css';

const { Option } = Select;
const { TextArea } = Input;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [pagination.current, pagination.pageSize, searchName, searchCategory, searchStatus, sortField, sortOrder]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/products', {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          name: searchName,
          category_id: searchCategory,
          status: searchStatus,
          sortField,
          sortOrder,
        }
      });
      
      if (response.data.success) {
        setProducts(response.data.data);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total
        }));
      }
    } catch (error) {
      message.error('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/products/categories/list');
      if (response.data.success) {
        const uniqueCategories = [];
        const seen = new Set();
        for (const cat of response.data.data) {
          const key = cat.name + '_' + cat.id;
          if (!seen.has(cat.name)) {
            uniqueCategories.push(cat);
            seen.add(cat.name);
          }
        }
        setCategories(uniqueCategories);
      }
    } catch (error) {
      message.error('获取分类列表失败');
    }
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize
    }));
    if (sorter && sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order);
    } else {
      setSortField(null);
      setSortOrder(null);
    }
  };

  const showModal = (product = null) => {
    setEditingProduct(product);
    setModalVisible(true);
    if (product) {
      form.setFieldsValue(product);
    } else {
      form.resetFields();
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      
      // 处理表单数据
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== null) {
          if (key === 'image' && values[key]?.fileList && values[key].fileList.length > 0) {
            // 处理文件上传
            const file = values[key].fileList[0]?.originFileObj;
            if (file) {
              formData.append('image', file);
              console.log('上传文件:', file.name, '大小:', file.size); // 调试日志
            }
          } else if (key !== 'image') {
            formData.append(key, values[key]);
          }
        }
      });

      console.log('提交的表单数据:', Object.fromEntries(formData)); // 调试日志

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id}`, formData);
        message.success('商品更新成功');
      } else {
        await axios.post('/api/products', formData);
        message.success('商品创建成功');
      }

      setModalVisible(false);
      fetchProducts();
    } catch (error) {
      console.error('提交错误:', error); // 调试日志
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`);
      message.success('商品删除成功');
      fetchProducts();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 搜索栏相关
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchProducts();
  };
  const handleReset = () => {
    setSearchName('');
    setSearchCategory('');
    setSearchStatus('');
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchProducts();
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    Modal.confirm({
      title: `确定要批量删除选中的 ${selectedRowKeys.length} 个商品吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await axios.post('/api/products/batch-delete', { ids: selectedRowKeys });
          message.success('批量删除成功');
          setSelectedRowKeys([]);
          fetchProducts();
        } catch (error) {
          message.error('批量删除失败');
        }
      }
    });
  };

  // 保证 rowSelection 正确传递，Table 会自动显示 checkbox
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  // columns 内部 sorter 只需本地排序函数，Table 会自动处理排序
  const columns = [
    {
      title: '商品图片',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image) => (
        <Image
          width={60}
          height={60}
          src={image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiNDQ0NDQ0MiLz4KPHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIyMCIgeT0iMjAiPgo8cGF0aCBkPSJNMTAgMTBIMTNWMTNIMFYxMFoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMCAxN0gxM1YyMEgwVjE3WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE3IDEwSDIwVjEzSDE3VjEwWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE3IDE3SDIwVjIwSDE3VjE3WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPgo='}
          fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRkY0NDQ0Ii8+Cjx0ZXh0IHg9IjMwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5Yib5paH5o+S5Lu2PC90ZXh0Pgo8L3N2Zz4K"
          style={{ objectFit: 'cover', borderRadius: '4px' }}
        />
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      sorter: true,
    },
    {
      title: '分类',
      dataIndex: 'category_name',
      key: 'category_name',
      render: (categoryName) => (
        <Tag color="blue">{categoryName || '未分类'}</Tag>
      ),
      filters: categories.map(c => ({ text: c.name, value: c.name })),
      onFilter: (value, record) => record.category_name === value,
      sorter: true,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      sorter: true,
      render: (price, record) => (
        <div>
          <div style={{ color: '#e74c3c', fontWeight: 'bold' }}>
            ¥{price}
          </div>
          {record.original_price && (
            <div style={{ color: '#999', textDecoration: 'line-through', fontSize: '12px' }}>
              ¥{record.original_price}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      sorter: true,
      render: (stock) => (
        <Tag color={stock > 10 ? 'green' : stock > 0 ? 'orange' : 'red'}>
          {stock}
        </Tag>
      ),
    },
    {
      title: '销量',
      dataIndex: 'sales',
      key: 'sales',
      sorter: true,
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      sorter: true,
      render: (points) => points > 0 && <Tag color="purple">+{points}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '上架' : '下架'}
        </Tag>
      ),
      filters: [
        { text: '上架', value: 1 },
        { text: '下架', value: 0 },
      ],
      onFilter: (value, record) => record.status === value,
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showModal(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个商品吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="products-page">
      <Card>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Statistic title="商品总数" value={pagination.total} />
          </Col>
          <Col span={6}>
            <Statistic title="上架商品" value={products.filter(p => p.status === 1).length} />
          </Col>
          <Col span={6}>
            <Statistic title="库存不足" value={products.filter(p => p.stock < 10).length} />
          </Col>
          <Col span={6}>
            <Statistic title="今日新增" value={0} />
          </Col>
        </Row>

        {/* 搜索与批量操作栏 */}
        <Row gutter={16} style={{ marginBottom: 16 }} align="middle">
          <Col>
            <Input
              placeholder="商品名称"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              allowClear
              style={{ width: 180 }}
            />
          </Col>
          <Col>
            <Select
              placeholder="分类"
              value={searchCategory}
              onChange={v => setSearchCategory(v)}
              allowClear
              style={{ width: 140 }}
            >
              {categories.map(c => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="状态"
              value={searchStatus}
              onChange={v => setSearchStatus(v)}
              allowClear
              style={{ width: 120 }}
            >
              <Option value={1}>上架</Option>
              <Option value={0}>下架</Option>
            </Select>
          </Col>
          <Col>
            <Button type="primary" onClick={handleSearch} style={{ marginRight: 8 }}>搜索</Button>
            <Button onClick={handleReset}>重置</Button>
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Button
              danger
              icon={<DeleteOutlined />}
              disabled={selectedRowKeys.length === 0}
              onClick={handleBatchDelete}
            >
              批量删除
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
              style={{ marginLeft: 8 }}
            >
              添加商品
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={editingProduct ? '编辑商品' : '添加商品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="商品名称"
                rules={[{ required: true, message: '请输入商品名称' }]}
              >
                <Input placeholder="请输入商品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category_id"
                label="商品分类"
              >
                <Select placeholder="请选择分类">
                  {categories.map(category => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="商品描述"
          >
            <TextArea rows={3} placeholder="请输入商品描述" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label="售价"
                rules={[{ required: true, message: '请输入售价' }]}
              >
                <InputNumber
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入售价"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="original_price"
                label="原价"
              >
                <InputNumber
                  min={0}
                  precision={2}
                  style={{ width: '100%' }}
                  placeholder="请输入原价"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="stock"
                label="库存"
                rules={[{ required: true, message: '请输入库存' }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="请输入库存"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="points"
                label="积分奖励"
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="购买可获得积分"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="商品状态"
                initialValue={1}
              >
                <Select>
                  <Option value={1}>上架</Option>
                  <Option value={0}>下架</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="image"
            label="商品图片"
          >
            <Upload
              name="image"
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
              accept="image/*"
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingProduct ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Products; 