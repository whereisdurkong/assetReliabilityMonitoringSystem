import { NavLink } from 'react-router-dom';
import axios from 'axios';
import config from 'config';

// react-bootstrap
import { Card, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';

// third party
import FeatherIcon from 'feather-icons-react';

// assets
import logo from 'assets/images/arms-logo.png';
import { useState } from 'react';
import Loading from '../../components/personalComponents/loading';

// Add this import for AlertModal
import AlertModal from '../../components/personalComponents/alertModal';  // Adjust the path as needed

// -----------------------|| SIGNIN 1 ||-----------------------//

export default function SignIn1() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'success',
    title: '',
    description: ''
  });

  // Function to show alert messages
  const showAlertMessage = (type, title, description) => {
    setAlertConfig({ type, title, description });
    setShowAlert(true);
  };

  // Log in function
  const Auth = async (e) => {
    try {
      e.preventDefault();
      setIsLoading(true);

      console.log('Username:', username);
      console.log('Password:', password);

      //Validation
      if (!username.trim()) {
        showAlertMessage('warning', 'Missing Information', 'Please enter username');
        setIsLoading(false);
        return false;
      }
      if (!password.trim()) {
        showAlertMessage('warning', 'Missing Information', 'Please enter password');
        setIsLoading(false);
        return false;
      }

      try {
        const res = await axios.get(`${config.baseApi}/authentication/login`, {
          params: {
            user_name: username,
            pass_word: password
          }
        });

        if (!res.data.error) {
          localStorage.setItem('user', JSON.stringify(res.data));
          localStorage.setItem('status', JSON.stringify([{ id: 0, value: 'Login' }]));
          window.location.replace(`AssetReliabilityMonitoringSystem/dashboard`);
        }
      } catch (err) {
        if (err.response) {
          if (err.response.status === 401) {
            showAlertMessage('warning', 'Login Error', 'Incorrect Password');
            setTimeout(() => {

              setIsLoading(false);
            }, 1000);
          } else if (err.response.status === 404) {
            showAlertMessage('warning', 'Login Error', 'Invalid username or password. Please try again.');
            setTimeout(() => {

              setIsLoading(false);
            }, 1000);
          } else {
            showAlertMessage('Invalid username or password. Please try again.');
            setTimeout(() => {

              setIsLoading(false);
            }, 1000);
          }
        } else {
          showAlertMessage('Unable to connect to server. Please check your internet or try again later.');
          setTimeout(() => {
            setIsLoading(false);
          }, 1000);
        }
      }
    } catch (err) {
      console.log('Something went wrong!', err)
    }
  };

  return (
    <div
      className="auth-wrapper d-flex justify-content-center align-items-center"
      style={{
        background: 'linear-gradient(135deg, #254252 10%, #1A1F2C 100%)',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        padding: '20px'
      }}
    >
      {/* Animated background elements */}
      <div className="position-absolute w-100 h-100" style={{ zIndex: 0 }}>
        <div className="position-absolute rounded-circle" style={{
          width: '400px',
          height: '400px',
          background: 'rgba(255,255,255,0.1)',
          top: '-150px',
          right: '-150px',
          animation: 'float 8s ease-in-out infinite'
        }} />
        <div className="position-absolute rounded-circle" style={{
          width: '300px',
          height: '300px',
          background: 'rgba(255,255,255,0.1)',
          bottom: '-100px',
          left: '-100px',
          animation: 'float 10s ease-in-out infinite reverse'
        }} />
      </div>

      <div className="auth-content" style={{ zIndex: 1, maxWidth: '1100px', width: '100%' }}>
        <Loading show={isLoading} />

        {/* Alert Modal - Moved outside the card and with higher z-index */}
        {showAlert && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 999999,
            maxWidth: '400px',
            width: 'calc(100% - 40px)'
          }}>
            <AlertModal
              type={alertConfig.type}
              title={alertConfig.title}
              description={alertConfig.description}
              onClose={() => setShowAlert(false)}
              autoClose={5000}
            />
          </div>
        )}

        <Row className="justify-content-center">
          <Col xs={12}>
            <Card
              className="border-0 shadow-lg overflow-hidden p-0"
              style={{
                borderRadius: '30px',
                backdropFilter: 'blur(10px)',
                backgroundColor: '#e9ded0'
              }}
            >
              <Row className="g-0">
                {/* Left Side - Branding Section */}
                <Col lg={5} className="d-none d-lg-block p-0">
                  <div
                    className="h-100 d-flex flex-column justify-content-center p-5 text-white"
                    style={{
                      background: 'linear-gradient(145deg, #E37239 0%, #F9982F 100%)',
                      position: 'relative',
                      overflow: 'hidden',
                      margin: 0
                    }}
                  >
                    {/* Decorative pattern */}
                    <div className="position-absolute w-100 h-100" style={{
                      background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                      top: 0,
                      left: 0
                    }} />

                    {/* Floating shapes */}
                    <div className="position-absolute" style={{
                      width: '150px',
                      height: '150px',
                      border: '2px solid rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      bottom: '-30px',
                      right: '-30px'
                    }} />
                    <div className="position-absolute" style={{
                      width: '100px',
                      height: '100px',
                      border: '2px solid rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      top: '20%',
                      right: '10%'
                    }} />

                    {/* Logo and Title */}
                    <div className="position-relative" style={{ zIndex: 2 }}>
                      <div className="d-flex align-items-center mb-4">
                        <div className="bg-white rounded-3 p-3 shadow-lg" style={{
                          width: '200px',
                          height: '90px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <img
                            src={logo}
                            alt="Lepanto Logo"
                            className="img-fluid"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain'
                            }}
                          />
                        </div>
                      </div>

                      <h1 className="display-5 fw-bold mb-3" style={{
                        textShadow: '2px 2px 4px rgba(241, 241, 241, 0.2)',
                        color: '#fff'
                      }}>
                        Asset Reliability Monitoring System
                      </h1>

                      <p className="mb-5 opacity-75" style={{ fontSize: '1.1rem' }}>
                        A system used to monitor asset condition, performance, and reliability to support efficient maintenance and operations.
                      </p>
                    </div>
                  </div>
                </Col>

                {/* Right Side - Login Form */}
                <Col lg={7} className="p-0">
                  <Card.Body className="p-5 m-0">
                    {/* Rest of your login form remains the same */}
                    <div className="text-center mb-5 d-lg-none">
                      <img
                        src={logo}
                        alt="Lepanto Logo"
                        className="img-fluid mb-3"
                        style={{ width: '60px' }}
                      />
                      <h2 className="fw-bold">Asset Reliability</h2>
                      <h5 className="text-primary fw-light">Monitoring System</h5>
                    </div>

                    <div className="mx-auto" style={{ maxWidth: '400px' }}>
                      <div className="text-center" style={{ paddingBottom: '50px' }}>
                        <h3 className="fw-bold mb-2" style={{ color: '#333' }}>
                          Welcome
                        </h3>
                        <p className="text-muted">Please enter your credentials to sign in</p>
                      </div>

                      <Form onSubmit={Auth}>
                        {/* Username Field */}
                        <Form.Group className="mb-4">
                          <Form.Label className="text-muted fw-semibold">
                            <FeatherIcon icon="user" size={16} className="me-2" />
                            Username
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}

                            className="py-3 px-4"
                            style={{
                              borderRadius: '15px',
                              border: '2px solid #f0f0f0',
                              backgroundColor: '#fafafa',
                              fontSize: '1rem'
                            }}
                          />
                        </Form.Group>

                        {/* Password Field */}
                        <Form.Group style={{ paddingBottom: '20%' }}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <Form.Label className="text-muted fw-semibold">
                              <FeatherIcon icon="lock" size={16} className="me-2" />
                              Password
                            </Form.Label>

                          </div>
                          <div className="position-relative">
                            <Form.Control
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}

                              className="py-3 px-4"
                              style={{
                                borderRadius: '15px',
                                border: '2px solid #f0f0f0',
                                backgroundColor: '#fafafa',
                                paddingRight: '50px'
                              }}
                            />
                            <Button
                              variant="link"
                              onClick={() => setShowPassword(!showPassword)}
                              className="position-absolute end-0 top-50 translate-middle-y bg-transparent border-0"
                              style={{ color: '#E37239', paddingRight: '15px' }}
                            >
                              <FeatherIcon icon={showPassword ? "eye-off" : "eye"} size={18} />
                            </Button>
                          </div>
                        </Form.Group>

                        {/* Sign In Button */}
                        <Button
                          type="submit"
                          className="w-100 border-0 py-3 fw-semibold mb-4"
                          disabled={isLoading}
                          style={{
                            background: 'linear-gradient(145deg,  #E37239 0%, #F9982F 100%)',
                            borderRadius: '15px',
                            fontSize: '1.1rem',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                          }}
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                              Signing in...
                            </>
                          ) : (
                            'Sign In'
                          )}
                        </Button>


                      </Form>
                    </div>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}