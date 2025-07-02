import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Switch, Space, message } from 'antd';
import axios from 'axios';

const { Option } = Select;

const MemberBenefits = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/member-benefits');
      if (res.data.success) setList(res.data.data);
    } catch (e) { message.error('获取失败'); }
    setLoading(false);
  };

  useEffect(() => { fetchList(); }, []);

  const showModal = (record) => {
    setEditing(record || null);
    setModalVisible(true);
    form.resetFields();
    if (record) form.setFieldsValue(record);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await axios.put(`/api/member-benefits/${editing.id}`, values);
        message.success('更新成功');
      } else {
        await axios.post('/api/member-benefits', values);
        message.success('新增成功');
      }
      setModalVisible(false);
      fetchList();
    } catch {}
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/member-benefits/${id}`);
    message.success('删除成功');
    fetchList();
  };

  const columns = [
    { title: '标题', dataIndex: 'name', key: 'name' },
    { title: '内容', dataIndex: 'description', key: 'description' },
    { title: '等级要求', dataIndex: 'min_level', key: 'min_level' },
    { title: '标签', dataIndex: 'tag', key: 'tag' },
    { title: '图标', dataIndex: 'icon', key: 'icon', render: (icon) => icon ? <img src={icon} alt="icon" style={{width:32}}/> : '-' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status, record) => <Switch checked={!!status} checkedChildren="有效" unCheckedChildren="无效" onChange={val => {
      axios.put(`/api/member-benefits/${record.id}`, { ...record, status: val ? 1 : 0 }); fetchList(); }}/>
    },
    { title: '操作', key: 'action', render: (_, record) => <Space>
      <Button type="link" onClick={() => showModal(record)}>编辑</Button>
      <Button type="link" danger onClick={() => handleDelete(record.id)}>删除</Button>
    </Space> }
  ];

  return <div>
    <Button type="primary" onClick={() => showModal(null)} style={{marginBottom:16}}>新增会员权益</Button>
    <Table columns={columns} dataSource={list} rowKey="id" loading={loading} />
    <Modal title={editing ? '编辑会员权益' : '新增会员权益'} open={modalVisible} onOk={handleOk} onCancel={() => setModalVisible(false)}>
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="标题" rules={[{ required: true, message: '请输入标题' }]}><Input /></Form.Item>
        <Form.Item name="description" label="内容" rules={[{ required: true, message: '请输入内容' }]}><Input.TextArea rows={3}/></Form.Item>
        <Form.Item name="min_level" label="等级要求" rules={[{ required: true, message: '请输入等级要求' }]}><InputNumber min={0} max={9} style={{width:'100%'}}/></Form.Item>
        <Form.Item name="tag" label="标签"><Input /></Form.Item>
        <Form.Item name="icon" label="图标URL"><Input /></Form.Item>
        <Form.Item name="status" label="状态" valuePropName="checked"><Switch checkedChildren="有效" unCheckedChildren="无效" /></Form.Item>
      </Form>
    </Modal>
  </div>;
};

export default MemberBenefits; 