import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Button } from 'react-bootstrap';
import { Droplet } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Successfully logged in');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-3">
      <div className="glass-card w-100 p-5" style={{ maxWidth: '420px' }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-25 text-primary rounded-circle mb-3" style={{ width: '64px', height: '64px' }}>
            <Droplet size={32} />
          </div>
          <h2 className="fw-bold mb-1">AeroFuel</h2>
          <p className="text-secondary">Airline Fuel Management System</p>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="text-secondary small fw-medium">Username</Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              className="py-2"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="text-secondary small fw-medium">Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="py-2"
            />
          </Form.Group>

          <Button 
            variant="primary" 
            type="submit" 
            className="w-100 py-2 fw-bold hover-lift"
            disabled={loading}
          >
            {loading ? <div className="spinner-border spinner-border-sm" role="status"></div> : 'Sign In'}
          </Button>
        </Form>
        
        <div className="text-center mt-4">
          <p className="text-secondary small mb-0">Use <strong>admin</strong> / <strong>admin123</strong> to login</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
