import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Địa chỉ backend API chạy cục bộ
const API_URL = 'http://localhost:5001/api/devices';

function App() {
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    deviceId: '',
    name: '',
    deviceType: '',
    room: '',
    brand: '',
    model: '',
    quantity: 1,
    status: 'Đang sử dụng',
    purchaseDate: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lấy danh sách thiết bị
  const fetchDevices = async (keyword = '') => {
    try {
      setLoading(true);
      const url = keyword ? `${API_URL}?search=${keyword}` : API_URL;
      const res = await axios.get(url);
      setDevices(res.data);
      setError('');
    } catch (err) {
      setError('Không thể tải dữ liệu từ server!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  // Xử lý submit form (Thêm hoặc Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form);
        alert('Cập nhật thiết bị thành công!');
      } else {
        await axios.post(API_URL, form);
        alert('Thêm thiết bị thành công!');
      }
      setForm({
        deviceId: '', name: '', deviceType: '', room: '',
        brand: '', model: '', quantity: 1, status: 'Đang sử dụng',
        purchaseDate: '', description: ''
      });
      setEditingId(null);
      fetchDevices();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi lưu dữ liệu!');
    }
  };

  // Xóa thiết bị
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchDevices();
      } catch (err) {
        alert('Xóa thất bại!');
      }
    }
  };

  // Đưa thông tin lên form để sửa
  const handleEdit = (device) => {
    setForm(device);
    setEditingId(device._id);
  };

  // Tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    fetchDevices(search);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>HỆ THỐNG QUẢN LÝ THIẾT BỊ PHÒNG HỌC</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Form thêm/sửa */}
      <form onSubmit={handleSubmit} style={{ background: '#f4f4f4', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
        <h3>{editingId ? 'Cập nhật thiết bị' : 'Thêm thiết bị mới'}</h3>
        <input placeholder="Mã thiết bị (deviceId)" value={form.deviceId} onChange={e => setForm({...form, deviceId: e.target.value})} required disabled={editingId} />
        <input placeholder="Tên thiết bị" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <input placeholder="Loại thiết bị" value={form.deviceType} onChange={e => setForm({...form, deviceType: e.target.value})} required />
        <input placeholder="Phòng học" value={form.room} onChange={e => setForm({...form, room: e.target.value})} required />
        <input placeholder="Hãng sản xuất" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
        <input placeholder="Model" value={form.model} onChange={e => setForm({...form, model: e.target.value})} />
        <input type="number" placeholder="Số lượng" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
        <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
          <option value="Đang sử dụng">Đang sử dụng</option>
          <option value="Hư hỏng">Hư hỏng</option>
          <option value="Đang sửa chữa">Đang sửa chữa</option>
          <option value="Ngừng sử dụng">Ngừng sử dụng</option>
        </select>
        <input type="date" value={form.purchaseDate ? form.purchaseDate.substring(0, 10) : ''} onChange={e => setForm({...form, purchaseDate: e.target.value})} />
        <input placeholder="Mô tả" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        <br/><br/>
        <button type="submit">{editingId ? 'Lưu thay đổi' : 'Thêm thiết bị'}</button>
        {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({deviceId:'', name:'', deviceType:'', room:'', brand:'', model:'', quantity:1, status:'Đang sử dụng', purchaseDate:'', description:''}); }}>Hủy</button>}
      </form>

      {/* Tìm kiếm */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <input placeholder="Tìm kiếm theo mã, tên, loại..." value={search} onChange={e => setSearch(e.target.value)} />
        <button type="submit">Tìm kiếm</button>
        <button type="button" onClick={() => { setSearch(''); fetchDevices(''); }}>Tất cả</button>
      </form>

      {/* Bảng hiển thị danh sách */}
      {loading ? <p>Đang tải dữ liệu...</p> : (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#ddd' }}>
              <th>Mã TB</th>
              <th>Tên thiết bị</th>
              <th>Loại</th>
              <th>Phòng</th>
              <th>SL</th>
              <th>Tình trạng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {devices.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center' }}>Không có thiết bị nào</td></tr>
            ) : (
              devices.map(d => (
                <tr key={d._id}>
                  <td>{d.deviceId}</td>
                  <td>{d.name}</td>
                  <td>{d.deviceType}</td>
                  <td>{d.room}</td>
                  <td>{d.quantity}</td>
                  <td>{d.status}</td>
                  <td>
                    <button onClick={() => handleEdit(d)}>Sửa</button>
                    <button onClick={() => handleDelete(d._id)} style={{ color: 'red' }}>Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;