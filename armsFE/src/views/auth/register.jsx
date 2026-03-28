import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';

import axios from 'axios';
import config from 'config';

// react-bootstrap
import { Card, Row, Col, Button, InputGroup, Form } from 'react-bootstrap';

// third party
import FeatherIcon from 'feather-icons-react';

// Import the AlertModal component
import AlertModal from '../../components/personalComponents/alertModal';
import Loading from '../../components/personalComponents/loading';

// -----------------------|| SignUp 1 ||-----------------------//

export default function SignUp1() {
  // Form state
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPassword] = useState('');

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

  // Fetch user from localStorage
  useEffect(() => {
    const empInfo = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(empInfo?.user_name);
  })

  // Validation function
  const validateForm = () => {
    // Check for empty fields
    if (!firstname.trim()) {
      showAlertMessage('warning', 'Missing Information', 'Please enter your first name');
      setIsLoading(false)
      return false;
    }
    if (!lastname.trim()) {
      showAlertMessage('warning', 'Missing Information', 'Please enter your last name');
      setIsLoading(false)
      return false;
    }
    if (!username.trim()) {
      showAlertMessage('warning', 'Missing Information', 'Please enter a username');
      setIsLoading(false)
      return false;
    }
    if (!email.trim()) {
      showAlertMessage('warning', 'Missing Information', 'Please enter your email address');
      setIsLoading(false)
      return false;
    }
    if (!position) {
      showAlertMessage('warning', 'Missing Information', 'Please select a position');
      setIsLoading(false)
      return false;
    }
    if (!role) {
      showAlertMessage('warning', 'Missing Information', 'Please select a role');
      setIsLoading(false)
      return false;
    }
    if (!password) {
      showAlertMessage('warning', 'Missing Information', 'Please enter a password');
      setIsLoading(false)
      return false;
    }
    if (!confirmpassword) {
      showAlertMessage('warning', 'Missing Information', 'Please confirm your password');
      setIsLoading(false)
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlertMessage('error', 'Invalid Email', 'Please enter a valid email address');
      setIsLoading(false)
      return false;
    }

    // Password validation
    if (password.length < 6) {
      showAlertMessage('error', 'Weak Password', 'Password must be at least 6 characters long');
      setIsLoading(false)
      return false;
    }

    // Confirm password match
    if (password !== confirmpassword) {
      showAlertMessage('error', 'Password Mismatch', 'Passwords do not match. Please try again');
      setIsLoading(false)
      return false;
    }

    // Username validation
    if (username.length < 3) {
      showAlertMessage('error', 'Invalid Username', 'Username must be at least 3 characters long');
      setIsLoading(false)
      return false;
    }

    return true;
  };

  // Function to show alert messages
  const showAlertMessage = (type, title, description) => {
    setAlertConfig({ type, title, description });
    setShowAlert(true);
  };

  // Function to check existing users
  const Checker = async () => {
    try {
      const res = await axios.get(`${config.baseApi}/authentication/get-all-users`);
      const data = res.data || [];

      // Check for duplicate username (case-insensitive)
      const duplicateUsername = data.some(
        user => user.user_name?.toLowerCase() === username.toLowerCase()
      );

      // Check for duplicate email (case-insensitive)
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
      setIsLoading(false)
      return {
        hasDuplicate: true, // Treat as duplicate to prevent registration on error
        duplicateUsername: false,
        duplicateEmail: false,
        error: true
      };
    }
  };

  //Register Function
  const Save = async (e) => {
    try {
      e.preventDefault();
      setIsLoading(true)
      // Validate form first
      if (!validateForm()) {
        return;
      }

      // Check for duplicates
      const checkResult = await Checker();

      if (checkResult.error) {
        return;
      }

      if (checkResult.hasDuplicate) {
        if (checkResult.duplicateUsername && checkResult.duplicateEmail) {
          showAlertMessage(
            'warning',
            'Duplicate Information',
            'Username and email address are already taken. Please use different credentials.'
          );
          setIsLoading(false)
        } else if (checkResult.duplicateUsername) {
          showAlertMessage(
            'warning',
            'Duplicate Username',
            'This username is already taken. Please choose a different username.'
          );
          setIsLoading(false)
        } else if (checkResult.duplicateEmail) {
          showAlertMessage(
            'warning',
            'Duplicate Email',
            'This email address is already registered. Please use a different email or try logging in.'
          );
          setIsLoading(false)
        }
        return;
      }

      // Log form data
      console.log('Form Data:', {
        firstname,
        lastname,
        username,
        email,
        position,
        role,
        password,
        confirmpassword
      });

      try {
        // Proceed with registration since no duplicates found
        await axios.post(`${config.baseApi}/authentication/register`, {
          emp_firstname: firstname,
          emp_lastname: lastname,
          user_name: username,
          emp_email: email,
          pass_word: password,
          emp_role: role,
          emp_position: position,
          current_user: currentUser
        }).then((res) => {

          // Show success message
          showAlertMessage(
            'success',
            'Account Created Successfully!',
            `Welcome ${firstname}! Your account has been created.`
          );

          // Clear form after successful submission
          setFirstName('');
          setLastName('');
          setUsername('');
          setEmail('');
          setPosition('');
          setRole('');
          setPassword('');
          setConfirmPassword('');

          window.location.reload();
        })

      } catch (error) {
        console.error('Registration error:', error);

        // Handle specific error cases
        if (error.response) {

          if (error.response.status === 409) {
            showAlertMessage(
              'warning',
              'Duplicate Information',
              error.response.data?.message || 'Username or email already exists.'
            );
            setIsLoading(false)
          } else {
            showAlertMessage(
              'error',
              'Account Creation Failed',
              error.response.data?.message || 'An error occurred while creating your account. Please try again.'
            );
            setIsLoading(false)
          }
        } else if (error.request) {
          // The request was made but no response was received
          showAlertMessage(
            'error',
            'Connection Error',
            'Unable to connect to the server. Please check your internet connection.'
          );
          setIsLoading(false)
        } else {
          // Something happened in setting up the request that triggered an Error
          showAlertMessage(
            'error',
            'Account Creation Failed',
            'An unexpected error occurred. Please try again.'
          );
          setIsLoading(false)
        }
      }
    } catch (err) {
      console.log('Unable to register! ', err)
    }
  };

  return (
    <div
      className="auth-wrapper d-flex align-items-center justify-content-center min-vh-100"
      style={{
        background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '100px'
      }}
    >
      <Loading show={isLoading} />
      {/* Alert Modal - Moved outside the card and with higher z-index */}
      {showAlert && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          zIndex: 999999,
          pointerEvents: 'none' // Allows clicks to pass through to the form
        }}>
          <div style={{ pointerEvents: 'auto' }}> {/* But keeps alert clickable */}
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

      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgb(255, 255, 255)',
        opacity: '0.1',
        top: '-100px',
        right: '-100px',
        animation: 'float 20s infinite ease-in-out',
        zIndex: 1
      }} />
      <div style={{
        position: 'absolute',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'rgb(255, 255, 255)',
        opacity: '0.1',
        bottom: '-50px',
        left: '-50px',
        animation: 'float 15s infinite ease-in-out reverse',
        zIndex: 1
      }} />

      <Card
        className="border-0"
        style={{
          background: '#f1ddc2',
          backdropFilter: 'blur(10px)',
          borderRadius: '30px',
          maxWidth: '700px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          transform: 'translateY(0)',
          transition: 'transform 0.3s ease',
          animation: 'slideUp 0.6s ease-out',
          position: 'relative',
          zIndex: 2
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        <Card.Body className="p-5">
          {/* Logo/Brand Section with decorative elements */}
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-2" style={{
              color: '#333333',
              fontSize: '2rem',
              letterSpacing: '-0.5px'
            }}>
              Create Account
            </h2>
            <p>Please enter users credentials for account creation</p>
          </div>

          <Row className="g-3">
            {/* FIRST NAME */}
            <Col md={6}>
              <InputGroup className="mb-3">
                <InputGroup.Text
                  style={{
                    background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                    border: '2px solid #e9ecef',
                    borderRight: 'none',
                    color: '#E37239',
                    borderRadius: '12px 0 0 12px',
                    padding: '0.75rem 1rem'
                  }}
                >
                  <FeatherIcon icon="user" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="First Name"
                  value={firstname}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={{
                    border: '2px solid #e9ecef',
                    borderLeft: 'none',
                    padding: '0.75rem 1rem',
                    fontSize: '0.95rem',
                    borderRadius: '0 12px 12px 0',
                    transition: 'all 0.3s ease'
                  }}
                  className="shadow-none"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#E37239';
                    e.target.previousElementSibling.style.borderColor = '#E37239';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.previousElementSibling.style.borderColor = '#e9ecef';
                  }}
                />
              </InputGroup>
            </Col>

            {/* LAST NAME */}
            <Col md={6}>
              <InputGroup className="mb-2">
                <InputGroup.Text
                  style={{
                    background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                    border: '2px solid #e9ecef',
                    borderRight: 'none',
                    color: '#E37239',
                    borderRadius: '12px 0 0 12px',
                    padding: '0.75rem 1rem'
                  }}
                >
                  <FeatherIcon icon="user" />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Last Name"
                  value={lastname}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{
                    border: '2px solid #e9ecef',
                    borderLeft: 'none',
                    padding: '0.75rem 1rem',
                    fontSize: '0.95rem',
                    borderRadius: '0 12px 12px 0',
                    transition: 'all 0.3s ease'
                  }}
                  className="shadow-none"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#E37239';
                    e.target.previousElementSibling.style.borderColor = '#E37239';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.previousElementSibling.style.borderColor = '#e9ecef';
                  }}
                />
              </InputGroup>
            </Col>
          </Row>

          {/* USERNAME */}
          <InputGroup className="mb-3">
            <InputGroup.Text
              style={{
                background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                border: '2px solid #e9ecef',
                borderRight: 'none',
                color: '#E37239',
                borderRadius: '12px 0 0 12px',
                padding: '0.75rem 1rem'
              }}
            >
              <FeatherIcon icon="at-sign" />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                border: '2px solid #e9ecef',
                borderLeft: 'none',
                padding: '0.75rem 1rem',
                fontSize: '0.95rem',
                borderRadius: '0 12px 12px 0',
                transition: 'all 0.3s ease'
              }}
              className="shadow-none"
              onFocus={(e) => {
                e.target.style.borderColor = '#E37239';
                e.target.previousElementSibling.style.borderColor = '#E37239';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e9ecef';
                e.target.previousElementSibling.style.borderColor = '#e9ecef';
              }}
            />
          </InputGroup>

          {/* EMAIL */}
          <InputGroup className="mb-3">
            <InputGroup.Text
              style={{
                background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                border: '2px solid #e9ecef',
                borderRight: 'none',
                color: '#E37239',
                borderRadius: '12px 0 0 12px',
                padding: '0.75rem 1rem'
              }}
            >
              <FeatherIcon icon="mail" size={18} />
            </InputGroup.Text>
            <Form.Control
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                border: '2px solid #e9ecef',
                borderLeft: 'none',
                padding: '0.75rem 1rem',
                fontSize: '0.95rem',
                borderRadius: '0 12px 12px 0',
                transition: 'all 0.3s ease'
              }}
              className="shadow-none"
              onFocus={(e) => {
                e.target.style.borderColor = '#E37239';
                e.target.previousElementSibling.style.borderColor = '#E37239';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e9ecef';
                e.target.previousElementSibling.style.borderColor = '#e9ecef';
              }}
            />
          </InputGroup>

          <Row className="g-3">
            {/* POSITION */}
            <Col md={6}>
              <InputGroup className="mb-3">
                <InputGroup.Text
                  style={{
                    background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                    border: '2px solid #e9ecef',
                    borderRight: 'none',
                    color: '#E37239',
                    borderRadius: '12px 0 0 12px',
                    padding: '0.75rem 1rem'
                  }}
                >
                  <FeatherIcon icon="briefcase" />
                </InputGroup.Text>
                <Form.Select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  style={{
                    border: '2px solid #e9ecef',
                    borderLeft: 'none',
                    padding: '0.75rem 1rem',
                    fontSize: '0.95rem',
                    borderRadius: '0 12px 12px 0',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  className="shadow-none"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#E37239';
                    e.target.previousElementSibling.style.borderColor = '#E37239';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.previousElementSibling.style.borderColor = '#e9ecef';
                  }}
                >
                  <option value="">Position</option>
                  <option value="l1">Level 1</option>
                  <option value="l2">Level 2</option>
                  <option value="l3">Level 3</option>
                </Form.Select>
              </InputGroup>
            </Col>

            {/* ROLE */}
            <Col md={6}>
              <InputGroup className="mb-2">
                <InputGroup.Text
                  style={{
                    background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                    border: '2px solid #e9ecef',
                    borderRight: 'none',
                    color: '#E37239',
                    borderRadius: '12px 0 0 12px',
                    padding: '0.75rem 1rem'
                  }}
                >
                  <FeatherIcon icon="shield" />
                </InputGroup.Text>
                <Form.Select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    border: '2px solid #e9ecef',
                    borderLeft: 'none',
                    padding: '0.75rem 1rem',
                    fontSize: '0.95rem',
                    borderRadius: '0 12px 12px 0',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  className="shadow-none"
                  onFocus={(e) => {
                    e.target.style.borderColor = '#E37239';
                    e.target.previousElementSibling.style.borderColor = '#E37239';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    e.target.previousElementSibling.style.borderColor = '#e9ecef';
                  }}
                >
                  <option value="">Role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </InputGroup>
            </Col>
          </Row>

          {/* PASSWORD */}
          <InputGroup className="mb-2">
            <InputGroup.Text
              style={{
                background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                border: '2px solid #e9ecef',
                borderRight: 'none',
                color: '#E37239',
                borderRadius: '12px 0 0 12px',
                padding: '0.75rem 1rem'
              }}
            >
              <FeatherIcon icon="lock" />
            </InputGroup.Text>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                border: '2px solid #e9ecef',
                borderLeft: 'none',
                padding: '0.75rem 1rem',
                fontSize: '0.95rem',
                borderRadius: '0 12px 12px 0',
                transition: 'all 0.3s ease'
              }}
              className="shadow-none"
              onFocus={(e) => {
                e.target.style.borderColor = '#E37239';
                e.target.previousElementSibling.style.borderColor = '#E37239';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e9ecef';
                e.target.previousElementSibling.style.borderColor = '#e9ecef';
              }}
            />
          </InputGroup>

          {/* CONFIRM PASSWORD */}
          <InputGroup style={{ paddingBottom: '50px' }}>
            <InputGroup.Text
              style={{
                background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                border: '2px solid #e9ecef',
                borderRight: 'none',
                color: '#E37239',
                borderRadius: '12px 0 0 12px',
                padding: '0.75rem 1rem'
              }}
            >
              <FeatherIcon icon="lock" />
            </InputGroup.Text>

            <Form.Control
              type="password"
              placeholder="Confirm Password"
              value={confirmpassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                border: '2px solid #e9ecef',
                borderLeft: 'none',
                padding: '0.75rem 1rem',
                fontSize: '0.95rem',
                borderRadius: '0 12px 12px 0',
                transition: 'all 0.3s ease'
              }}
              className="shadow-none"
              onFocus={(e) => {
                e.target.style.borderColor = '#E37239';
                e.target.previousElementSibling.style.borderColor = '#E37239';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e9ecef';
                e.target.previousElementSibling.style.borderColor = '#e9ecef';
              }}
            />
          </InputGroup>

          {/* Sign Up Button */}
          <Button
            className="w-100 border-0 py-3 mb-3 fw-semibold"
            onClick={Save}
            style={{
              background: 'linear-gradient(45deg, #EAB56F, #F9982F, #E37239)',
              color: '#171C2D',
              fontSize: '1.1rem',
              fontWeight: '600',
              borderRadius: '15px',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 10px 30px -10px #E37239'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 15px 35px -10px #E37239';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 30px -10px #E37239';
            }}
          >
            <span style={{ position: 'relative', zIndex: 1, color: '#ffffff' }}>
              Create Account <FeatherIcon icon="arrow-right" style={{ marginLeft: '8px' }} />
            </span>
          </Button>


        </Card.Body>
      </Card>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}