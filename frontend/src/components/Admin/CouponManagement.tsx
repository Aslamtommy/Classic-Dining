// src/components/CouponManagement.tsx
import React, { useState, useEffect } from 'react';
import adminApi from '../../Axios/adminInstance';
import moment  from 'moment';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  message,
  Pagination,
  InputNumber,
  TableColumnsType
} from 'antd';
 import { ICoupon, CouponFormValues, Pagination as PaginationType, ApiResponse } from '../../types/couponTypes';

const { Option } = Select;

const CouponManagement: React.FC = () => {
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [editCoupon, setEditCoupon] = useState<ICoupon | null>(null);
  const [form] = Form.useForm<CouponFormValues>();
  const [pagination, setPagination] = useState<PaginationType>({
    current: 1,
    pageSize: 10,
    total: 0,
    searchTerm: ''
  });

  // Fetch coupons from backend
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await adminApi.get<ApiResponse>(
        `/coupons?page=${pagination.current}&limit=${pagination.pageSize}&searchTerm=${pagination.searchTerm}`,
       
      );
      setCoupons(response.data.data.coupons);
      setPagination(prev => ({
        ...prev,
        total: response.data.data.total
      }));
    } catch (error) {
      message.error('Failed to fetch coupons');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, [pagination.current, pagination.pageSize, pagination.searchTerm]);

  // Handle form submission for create/update
  const handleSubmit = async (values: CouponFormValues) => {
    try {
      const payload = {
        ...values,
        expiryDate: values.expiryDate.toISOString()
      };

      if (editCoupon) {
        // Update coupon
        await adminApi.put(
          `/coupons/${editCoupon._id}`,
          payload,
 
        );
        message.success('Coupon updated successfully');
      } else {
        // Create coupon
        await adminApi.post(
          `/coupons`,
          payload,
  
        );
        message.success('Coupon created successfully');
      }
      setVisible(false);
      form.resetFields();
      setEditCoupon(null);
      fetchCoupons();
    } catch (error) {
      message.error('Operation failed');
    }
  };

  // Handle delete
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this coupon?',
      onOk: async () => {
        try {
          await adminApi.delete(
            `/coupons/${id}`,
            
          );
          message.success('Coupon deleted successfully');
          fetchCoupons();
        } catch (error) {
          message.error('Failed to delete coupon');
        }
      }
    });
  };

  // Handle edit
  const handleEdit = (coupon: ICoupon) => {
    setEditCoupon(coupon);
    setVisible(true);
    form.setFieldsValue({
      ...coupon,
      expiryDate: moment(coupon.expiryDate)
    });
  };

  const columns: TableColumnsType<ICoupon> = [
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Discount', dataIndex: 'discount', key: 'discount' },
    { title: 'Type', dataIndex: 'discountType', key: 'discountType' },
    { 
      title: 'Expiry Date', 
      dataIndex: 'expiryDate', 
      key: 'expiryDate',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    { 
      title: 'Status', 
      dataIndex: 'isActive', 
      key: 'isActive',
      render: (active: boolean) => (active ? 'Active' : 'Inactive')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: ICoupon) => (
        <>
          <Button onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>
            Edit
          </Button>
          <Button danger onClick={() => handleDelete(record._id)}>
            Delete
          </Button>
        </>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          onClick={() => {
            setVisible(true);
            setEditCoupon(null);
            form.resetFields();
          }}
        >
          Add Coupon
        </Button>
        <Input.Search
          placeholder="Search by code"
          onSearch={(value: string) => setPagination({ ...pagination, searchTerm: value, current: 1 })}
          style={{ width: 200, marginLeft: 16 }}
        />
      </div>

      <Table<ICoupon>
        columns={columns}
        dataSource={coupons}
        rowKey="_id"
        loading={loading}
        pagination={false}
      />

      <Pagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={(page: number, pageSize: number) => 
          setPagination({ ...pagination, current: page, pageSize })
        }
        style={{ marginTop: 16, textAlign: 'right' }}
      />

      <Modal
        title={editCoupon ? 'Edit Coupon' : 'Create Coupon'}
        visible={visible}
        onCancel={() => {
          setVisible(false);
          setEditCoupon(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form<CouponFormValues>
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            discountType: 'percentage',
            isActive: true
          }}
        >
          <Form.Item
            name="code"
            label="Coupon Code"
            rules={[{ required: true, message: 'Please enter coupon code' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="discount"
            label="Discount"
            rules={[{ required: true, message: 'Please enter discount amount' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="discountType"
            label="Discount Type"
            rules={[{ required: true, message: 'Please select discount type' }]}
          >
            <Select>
              <Option value="percentage">Percentage</Option>
              <Option value="fixed">Fixed</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="expiryDate"
            label="Expiry Date"
            rules={[{ required: true, message: 'Please select expiry date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="minOrderAmount" label="Minimum Order Amount">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="maxDiscountAmount" label="Maximum Discount Amount">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item 
            name="isActive" 
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editCoupon ? 'Update' : 'Create'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CouponManagement;