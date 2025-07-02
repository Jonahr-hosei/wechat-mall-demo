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
      values.status = values.status ? 1 : 0;
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

  return (
    <div>
      {/* Rest of the component code remains unchanged */}
    </div>
  );
};

export default MemberBenefits;