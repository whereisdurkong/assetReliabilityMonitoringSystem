import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';

import axios from 'axios';
import config from 'config';

// react-bootstrap
import { Card, Row, Col, Button, InputGroup, Form, Badge, ProgressBar } from 'react-bootstrap';

// third party
import FeatherIcon from 'feather-icons-react';

// Import the AlertModal component
import AlertModal from '../../components/personalComponents/alertModal';
import Loading from '../../components/personalComponents/loading';

// -----------------------|| SignUp 1 (Redesigned) ||-----------------------//

export default function SignUp1() {
  // Form state
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [currentUser, setCurrentUser] = useState('');

  // Loading State
  const [isLoading, setIsLoading] = useState(false);

  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'success',
    title: '',
    description: ''
  });

  // Password strength calculation
  const calculatePasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.length >= 10) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return Math.min(strength, 4);
  };

  const passwordStrength = calculatePasswordStrength(password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4'];

  // Fetch user from localStorage
  useEffect(() => {
    const empInfo = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(empInfo?.user_name);
  }, []);

  // Validation function
  const validateForm = () => {
    if (!firstname.trim()) {
      showAlertMessage('warning', 'Missing Information', 'Please enter your first name');
      setIsLoading(false);
      return false;
    }
    if (!lastname.trim()) {
      showAlertMessage('warning', 'Missing Information', 'Please enter your last name');
      setIsLoading(false);
      return false;
    }
    if (!username.trim()) {
      showAlertMessage('warning', 'Missing Information', 'Please enter a username');
      setIsLoading(false);
      return false;
    }
    if (!email.trim()) {
      showAlertMessage('warning', 'Missing Information', 'Please enter your email address');
      setIsLoading(false);
      return false;
    }
    if (!position) {
      showAlertMessage('warning', 'Missing Information', 'Please select a position');
      setIsLoading(false);
      return false;
    }
    if (!role) {
      showAlertMessage('warning', 'Missing Information', 'Please select a role');
      setIsLoading(false);
      return false;
    }
    if (!department) {
      showAlertMessage('warning', 'Missing Information', 'Please select a department');
      setIsLoading(false);
      return false;
    }
    if (!password) {
      showAlertMessage('warning', 'Missing Information', 'Please enter a password');
      setIsLoading(false);
      return false;
    }
    if (!confirmpassword) {
      showAlertMessage('warning', 'Missing Information', 'Please confirm your password');
      setIsLoading(false);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlertMessage('error', 'Invalid Email', 'Please enter a valid email address');
      setIsLoading(false);
      return false;
    }

    if (password.length < 6) {
      showAlertMessage('error', 'Weak Password', 'Password must be at least 6 characters long');
      setIsLoading(false);
      return false;
    }

    if (password !== confirmpassword) {
      showAlertMessage('error', 'Password Mismatch', 'Passwords do not match. Please try again');
      setIsLoading(false);
      return false;
    }

    if (username.length < 3) {
      showAlertMessage('error', 'Invalid Username', 'Username must be at least 3 characters long');
      setIsLoading(false);
      return false;
    }

    return true;
  };

  const showAlertMessage = (type, title, description) => {
    setAlertConfig({ type, title, description });
    setShowAlert(true);
  };

  const Checker = async () => {
    try {
      const res = await axios.get(`${config.baseApi}/authentication/get-all-users`);
      const data = res.data || [];

      const duplicateUsername = data.some(
        user => user.user_name?.toLowerCase() === username.toLowerCase()
      );

      const duplicateEmail = data.some(
        user => user.emp_email?.toLowerCase() === email.toLowerCase()
      );

      return {
        hasDuplicate: duplicateUsername || duplicateEmail,
        duplicateUsername,
        duplicateEmail
      };
    } catch (error) {
      console.error('Error checking duplicates:', error);
      showAlertMessage(
        'error',
        'Validation Failed',
        'Unable to validate user information. Please try again.'
      );
      setIsLoading(false);
      return {
        hasDuplicate: true,
        duplicateUsername: false,
        duplicateEmail: false,
        error: true
      };
    }
  };

  const Save = async (e) => {
    try {
      e.preventDefault();
      setIsLoading(true);
      if (!validateForm()) {
        return;
      }

      const checkResult = await Checker();

      if (checkResult.error) {
        return;
      }

      if (checkResult.hasDuplicate) {
        if (checkResult.duplicateUsername && checkResult.duplicateEmail) {
          showAlertMessage(
            'warning',
            'Duplicate Information',
            'Username and email address are already taken.'
          );
          setIsLoading(false);
        } else if (checkResult.duplicateUsername) {
          showAlertMessage(
            'warning',
            'Duplicate Username',
            'This username is already taken.'
          );
          setIsLoading(false);
        } else if (checkResult.duplicateEmail) {
          showAlertMessage(
            'warning',
            'Duplicate Email',
            'This email address is already registered.'
          );
          setIsLoading(false);
        }
        return;
      }

      try {
        await axios.post(`${config.baseApi}/authentication/register`, {
          emp_firstname: firstname,
          emp_lastname: lastname,
          user_name: username,
          emp_email: email,
          pass_word: password,
          emp_role: role,
          emp_department: department,
          emp_position: position,
          current_user: currentUser
        });
        console.log('Registration data:', {
          emp_firstname: firstname,
          emp_lastname: lastname,
          user_name: username,
          emp_email: email,
          pass_word: password,
          emp_role: role,
          emp_department: department,
          emp_position: position,
          current_user: currentUser
        });

        showAlertMessage(
          'success',
          'Account Created Successfully!',
          `Welcome ${firstname}! Your account has been created.`
        );

        setFirstName('');
        setLastName('');
        setUsername('');
        setEmail('');
        setPosition('');
        setRole('');
        setDepartment('');
        setPassword('');
        setConfirmPassword('');

        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        console.error('Registration error:', error);
        if (error.response) {
          if (error.response.status === 409) {
            showAlertMessage(
              'warning',
              'Duplicate Information',
              error.response.data?.message || 'Username or email already exists.'
            );
          } else {
            showAlertMessage(
              'error',
              'Account Creation Failed',
              error.response.data?.message || 'An error occurred. Please try again.'
            );
          }
        } else if (error.request) {
          showAlertMessage(
            'error',
            'Connection Error',
            'Unable to connect to the server.'
          );
        } else {
          showAlertMessage(
            'error',
            'Account Creation Failed',
            'An unexpected error occurred.'
          );
        }
        setIsLoading(false);
      }
    } catch (err) {
      console.log('Unable to register! ', err);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
        padding: '40px',
        position: 'relative',
        overflow: 'auto',
        overflowX: 'hidden',  // ← ADD THIS - prevents horizontal scroll
        overflowY: 'auto',    // ← Keep vertical scrolling if needed

      }}
    >

      {/* ===== ANIMATED BACKGROUND ELEMENTS ===== */}
      <div style={{
        position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.05)', top: '-200px', right: '-200px',
        animation: 'float 25s infinite ease-in-out', zIndex: 1
      }} />
      <div style={{
        position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.05)', bottom: '-150px', left: '-150px',
        animation: 'float 20s infinite ease-in-out reverse', zIndex: 1
      }} />
      <div style={{
        position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.03)', top: '50%', left: '20%',
        animation: 'float 18s infinite ease-in-out', zIndex: 1
      }} />


      <Loading show={isLoading} />

      {/* Alert Modal */}
      {showAlert && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 999999,
          pointerEvents: 'none'
        }}>
          <div style={{ pointerEvents: 'auto' }}>
            <AlertModal
              type={alertConfig.type}
              title={alertConfig.title}
              description={alertConfig.description}
              onClose={() => setShowAlert(false)}
              autoClose={5000}
            />
          </div>
        </div>
      )}



      {/* Main Card */}
      <Card
        className="border-0"
        style={{
          background: '#ffffff',
          borderRadius: '40px',
          maxWidth: '2000px',
          width: '100%',
          boxShadow: '0 30px 60px -20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.1)',
          position: 'relative',
          zIndex: 2,
          overflow: 'hidden'
        }}
      >
        {/* Top accent gradient bar */}
        <div style={{
          height: '6px',
          background: 'linear-gradient(90deg, #EAB56F, #F9982F, #E37239, #F9982F, #EAB56F)',
          backgroundSize: '200% 100%',
          animation: 'gradientShift 3s ease infinite',
        }} />

        <Card.Body className="p-0">
          <Row className="g-0">
            {/* LEFT COLUMN - Form */}
            <Col lg={7} className="p-5" style={{ background: '#fffffb' }}>
              {/* Header */}
              <div className="mb-5">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, #EAB56F20, #F9982F20)',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FeatherIcon icon="user-plus" size={20} style={{ color: '#E37239' }} />
                  </div>
                  <div>
                    <h2 className="fw-bold mb-0" style={{ color: '#1E293B', fontSize: '1.8rem', letterSpacing: '-0.5px' }}>
                      Create account
                    </h2>
                    <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Add a new user to the system</p>
                  </div>
                </div>
              </div>

              <Form onSubmit={(e) => e.preventDefault()}>
                <Row className="g-3">
                  {/* Name row */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="normal fw-semibold text-secondary mb-2">
                        <FeatherIcon icon="user" size={12} className="me-1" color={'#ffa600'} /> First name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="John"
                        value={firstname}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="shadow-none"
                        style={{
                          border: '2px solid #E2E8F0',
                          borderRadius: '14px',
                          padding: '12px 16px',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#E37239'}
                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="normal fw-semibold text-secondary mb-2">
                        <FeatherIcon icon="user" size={12} className="me-1" color={'#ffa600'} /> Last name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Doe"
                        value={lastname}
                        onChange={(e) => setLastName(e.target.value)}
                        className="shadow-none"
                        style={{
                          border: '2px solid #E2E8F0',
                          borderRadius: '14px',
                          padding: '12px 16px',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#E37239'}
                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                      />
                    </Form.Group>
                  </Col>

                  {/* Username */}
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label className="normal fw-semibold text-secondary mb-2">
                        <FeatherIcon icon="at-sign" size={12} className="me-1" color={'#ffa600'} /> Username
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="john_doe"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="shadow-none"
                        style={{
                          border: '2px solid #E2E8F0',
                          borderRadius: '14px',
                          padding: '12px 16px',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#E37239'}
                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                      />
                    </Form.Group>
                  </Col>

                  {/* Email */}
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label className="normal fw-semibold text-secondary mb-2">
                        <FeatherIcon icon="mail" size={12} className="me-1" color={'#ffa600'} /> Email address
                      </Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="john@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="shadow-none"
                        style={{
                          border: '2px solid #E2E8F0',
                          borderRadius: '14px',
                          padding: '12px 16px',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#E37239'}
                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                      />
                    </Form.Group>
                  </Col>

                  {/* Position & Role */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="normal fw-semibold text-secondary mb-2">
                        <FeatherIcon icon="briefcase" size={12} className="me-1" color={'#ffa600'} /> Position
                      </Form.Label>
                      <Form.Select
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        className="shadow-none"
                        style={{
                          border: '2px solid #E2E8F0',
                          borderRadius: '14px',
                          padding: '12px 16px',
                          fontSize: '0.9rem',
                          backgroundColor: 'white',
                          cursor: 'pointer'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#E37239'}
                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                      >
                        <option value="">Select position</option>
                        <option value="l1">Level 1</option>
                        <option value="l2">Level 2</option>
                        <option value="l3">Level 3</option>

                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="normal fw-semibold text-secondary mb-2">
                        <FeatherIcon icon="shield" size={12} className="me-1" color={'#ffa600'} /> Role
                      </Form.Label>
                      <Form.Select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="shadow-none"
                        style={{
                          border: '2px solid #E2E8F0',
                          borderRadius: '14px',
                          padding: '12px 16px',
                          fontSize: '0.9rem',
                          backgroundColor: 'white',
                          cursor: 'pointer'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#E37239'}
                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                      >
                        <option value="">Select role</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="mis_admin">MIS - Admin</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="normal fw-semibold text-secondary mb-2">
                        <FeatherIcon icon="shield" size={12} className="me-1" color={'#ffa600'} /> Department
                      </Form.Label>
                      <Form.Select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="shadow-none"
                        style={{
                          border: '2px solid #E2E8F0',
                          borderRadius: '14px',
                          padding: '12px 16px',
                          fontSize: '0.9rem',
                          backgroundColor: 'white',
                          cursor: 'pointer'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#E37239'}
                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                      >
                        <option value="">Select Department</option>
                        <option value="mme_mwso">MME & MWSO</option>
                        <option value="mms">MMS</option>
                        <option value="smed">SMED</option>
                        <option value="assay">Assay</option>

                      </Form.Select>
                    </Form.Group>
                  </Col>

                  {/* Password */}
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="normal fw-semibold text-secondary mb-2">
                        <FeatherIcon icon="lock" size={12} className="me-1" color={'#ffa600'} /> Password
                      </Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        className="shadow-none"
                        style={{
                          border: '2px solid #E2E8F0',
                          borderRadius: '14px',
                          padding: '12px 16px',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s'
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="normal fw-semibold text-secondary mb-2">
                        <FeatherIcon icon="lock" size={12} className="me-1" color={'#ffa600'} /> Confirm password
                      </Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmpassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="shadow-none"
                        style={{
                          border: '2px solid #E2E8F0',
                          borderRadius: '14px',
                          padding: '12px 16px',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s',
                          borderColor: password && confirmpassword && password !== confirmpassword ? '#ef4444' : '#E2E8F0'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#E37239'}
                        onBlur={(e) => e.target.style.borderColor = password !== confirmpassword && confirmpassword ? '#ef4444' : '#E2E8F0'}
                      />
                    </Form.Group>
                  </Col>

                  {/* Password strength indicator */}
                  {password && isPasswordFocused && (
                    <Col xs={12}>
                      <div className="mt-2">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="normal text-muted">Password strength:</span>
                          <span className="normal fw-semibold" style={{ color: strengthColors[passwordStrength - 1] || '#94A3B8' }}>
                            {strengthLabels[passwordStrength - 1] || 'Too weak'}
                          </span>
                        </div>
                        <ProgressBar
                          now={(passwordStrength / 4) * 100}
                          style={{ height: '4px', borderRadius: '2px' }}
                          className="w-100"
                        />
                      </div>
                    </Col>
                  )}
                </Row>

                {/* Action buttons */}
                <div className="d-flex gap-3 mt-5 pt-2">
                  <Button
                    className="flex-grow-1 py-3 fw-semibold border-0"
                    onClick={Save}
                    style={{
                      background: 'linear-gradient(135deg, #E37239, #F9982F)',
                      borderRadius: '16px',
                      fontSize: '0.9rem',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 14px 0 rgba(227, 114, 57, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px 0 rgba(227, 114, 57, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(227, 114, 57, 0.3)';
                    }}
                  >
                    <FeatherIcon icon="user-plus" size={16} className="me-2" style={{ marginBottom: '2px' }} />
                    Create account
                  </Button>
                  <Button
                    variant="light"
                    className="py-3 px-4 fw-medium"
                    style={{
                      borderRadius: '16px',
                      fontSize: '0.9rem',
                      border: '1.5px solid #E2E8F0',
                      background: 'white'
                    }}
                    onClick={() => {
                      setFirstName('');
                      setLastName('');
                      setUsername('');
                      setEmail('');
                      setPosition('');
                      setRole('');
                      setDepartment('');
                      setPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    Reset form
                  </Button>
                </div>
              </Form>
            </Col>

            {/* RIGHT COLUMN - Information Panel */}
            <Col lg={5} className="p-5" style={{
              background: 'linear-gradient(145deg, #fff9ee 0%, #F0F4F9 100%)',
              borderLeft: '1px solid rgba(0,0,0,0.04)'
            }}>
              {/* Stats card */}
              <div className="mb-4 p-4 rounded-4" style={{
                background: 'white',
                borderRadius: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03)'
              }}>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: 'linear-gradient(135deg, #EAB56F15, #F9982F15)',
                    borderRadius: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FeatherIcon icon="users" size={24} style={{ color: '#E37239' }} />
                  </div>
                  <div>
                    <h3 className="fw-bold mb-0" style={{ color: '#1E293B', fontSize: '1.1rem' }}>User Management</h3>
                    <p className="text-muted small mb-0">Role-based access control</p>
                  </div>
                </div>
                <p className="normal text-secondary mb-0" style={{ lineHeight: 1.5 }}>
                  Create and manage user accounts with granular permissions. All new users receive a welcome email with setup instructions.
                </p>
              </div>

              {/* Requirements */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <FeatherIcon icon="check-circle" size={14} style={{ color: '#10b981' }} />
                  <span className="normal fw-bold text-uppercase tracking-wide" style={{ color: '#64748B', letterSpacing: '0.5px' }}>Requirements</span>
                </div>
                <div className="d-flex flex-column gap-2">
                  {[
                    { text: 'Username must be at least 3 characters', valid: username.length >= 3 },
                    { text: 'Password must be 6+ characters', valid: password.length >= 6 },
                    { text: 'Valid email address required', valid: email.includes('@') && email.includes('.') },
                    { text: 'Passwords must match', valid: password && confirmpassword && password === confirmpassword }
                  ].map((req, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-2">
                      <FeatherIcon
                        icon={req.valid ? 'check-circle' : 'circle'}
                        size={12}
                        style={{ color: req.valid ? '#10b981' : '#CBD5E1' }}
                      />
                      <span className="normal" style={{ color: req.valid ? '#475569' : '#94A3B8' }}>{req.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <hr style={{ opacity: 0.2 }} />

              {/* Role badges */}
              <div>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <FeatherIcon icon="award" size={14} style={{ color: '#E37239' }} />
                  <span className="normal fw-bold text-uppercase" style={{ color: '#64748B', letterSpacing: '0.5px' }}>Role capabilities</span>
                </div>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-start gap-3">
                    <div className="mt-1">
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#E37239' }} />
                    </div>
                    <div>
                      <div className="normal fw-semibold mb-1">Admin</div>
                      <div className="normal text-muted">Full system access, user management, and configuration</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-start gap-3">
                    <div className="mt-1">
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#94A3B8' }} />
                    </div>
                    <div>
                      <div className="normal fw-semibold mb-1">User</div>
                      <div className="normal text-muted">Limited access based on assigned permissions</div>
                    </div>
                  </div>
                </div>
              </div>


            </Col>
          </Row>
        </Card.Body>
      </Card>

      <style>
        {`
                    @keyframes float {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(50px, -50px) rotate(120deg); }
                        66% { transform: translate(-30px, 30px) rotate(240deg); }
                    }
                `}
      </style>
    </div >
  );
}