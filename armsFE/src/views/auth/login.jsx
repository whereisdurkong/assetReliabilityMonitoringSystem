import axios from 'axios';
import config from 'config';
import { useState, useRef, useEffect } from 'react';

// react-bootstrap
import { Card, Row, Col, Button, Form } from 'react-bootstrap';

// third party
import FeatherIcon from 'feather-icons-react';

// assets
import logo from 'assets/images/arms-logo.png';
import Loading from '../../components/personalComponents/loading';
import AlertModal from '../../components/personalComponents/alertModal';

// -----------------------|| SIGNIN 1 ||-----------------------//

export default function SignIn1() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'success',
    title: '',
    description: ''
  });

  const canvasRef = useRef(null);

  // ── Golden Oil Canvas Animation (Left Panel) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;
    let animId;
    let bubbles = [];
    let W, H;

    function resize() {
      const p = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = Math.floor(p.width * devicePixelRatio);
      H = canvas.height = Math.floor(p.height * devicePixelRatio);
      canvas.style.width = p.width + 'px';
      canvas.style.height = p.height + 'px';
      initBubbles();
    }

    function initBubbles() {
      bubbles = [];
      for (let i = 0; i < 38; i++) spawnBubble(true);
    }

    function spawnBubble(random) {
      const r = (2 + Math.random() * 9) * devicePixelRatio;
      bubbles.push({
        x: Math.random() * W,
        y: random ? Math.random() * H : H + r * 2,
        r,
        speed: (0.2 + Math.random() * 0.5) * devicePixelRatio,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.01 + Math.random() * 0.02,
        wobbleAmp: (0.3 + Math.random() * 0.8) * devicePixelRatio,
        opacity: 0.25 + Math.random() * 0.45
      });
    }

    function waveY(x, time) {
      const nx = x / W;
      return (
        H * 0.38 +
        Math.sin(nx * Math.PI * 2.1 + time * 0.7) * H * 0.048 +
        Math.sin(nx * Math.PI * 3.7 - time * 0.5) * H * 0.028 +
        Math.sin(nx * Math.PI * 6.3 + time * 1.1) * H * 0.012 +
        Math.sin(nx * Math.PI * 1.2 - time * 0.35) * H * 0.038
      );
    }

    function draw() {
      t += 0.016;
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = '#f7f2ea';
      ctx.fillRect(0, 0, W, H);

      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 2) ctx.lineTo(x, waveY(x, t));
      ctx.lineTo(W, H);
      ctx.closePath();

      const oilGrad = ctx.createLinearGradient(0, H * 0.3, 0, H);
      oilGrad.addColorStop(0, '#8b4a00');
      oilGrad.addColorStop(0.08, '#a95200');
      oilGrad.addColorStop(0.25, '#c97200');
      oilGrad.addColorStop(0.5, '#e87000');
      oilGrad.addColorStop(0.75, '#f58b00');
      oilGrad.addColorStop(1, '#f09c00');
      ctx.fillStyle = oilGrad;
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 2) ctx.lineTo(x, waveY(x, t));
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.clip();

      const sheenY = H * (0.38 + 0.04 * Math.sin(t * 0.4));
      const sheen = ctx.createLinearGradient(0, sheenY - H * 0.04, 0, sheenY + H * 0.12);
      sheen.addColorStop(0, 'rgba(255,240,120,0.0)');
      sheen.addColorStop(0.3, 'rgba(255,240,150,0.18)');
      sheen.addColorStop(0.6, 'rgba(255,220,80,0.08)');
      sheen.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sheen;
      ctx.fillRect(0, 0, W, H);

      const sideLight = ctx.createRadialGradient(W * 0.15, H * 0.55, 0, W * 0.15, H * 0.55, W * 0.5);
      sideLight.addColorStop(0, 'rgba(255,240,100,0.12)');
      sideLight.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sideLight;
      ctx.fillRect(0, 0, W, H);

      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.y -= b.speed;
        b.wobble += b.wobbleSpeed;
        b.x += Math.sin(b.wobble) * b.wobbleAmp * 0.3;

        const surfY = waveY(b.x, t);
        if (b.y - b.r < surfY) {
          bubbles.splice(i, 1);
          spawnBubble(false);
          continue;
        }

        const bg = ctx.createRadialGradient(
          b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.05,
          b.x, b.y, b.r
        );
        bg.addColorStop(0, `rgba(255,245,180,${b.opacity * 0.9})`);
        bg.addColorStop(0.4, `rgba(220,170,20,${b.opacity * 0.5})`);
        bg.addColorStop(0.85, `rgba(160,110,0,${b.opacity * 0.6})`);
        bg.addColorStop(1, `rgba(80,50,0,${b.opacity * 0.3})`);

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = bg;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,230,80,${b.opacity * 0.5})`;
        ctx.lineWidth = 0.8 * devicePixelRatio;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,220,${b.opacity * 0.7})`;
        ctx.fill();
      }

      ctx.restore();

      ctx.save();
      for (let x = 0; x <= W; x += 2) {
        const wy = waveY(x, t);
        const edgeGrad = ctx.createLinearGradient(0, wy - 8 * devicePixelRatio, 0, wy + 18 * devicePixelRatio);
        edgeGrad.addColorStop(0, 'rgba(40,20,0,0.55)');
        edgeGrad.addColorStop(0.5, 'rgba(80,45,0,0.25)');
        edgeGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = edgeGrad;
        ctx.fillRect(x, wy - 8 * devicePixelRatio, 2, 26 * devicePixelRatio);
      }
      ctx.restore();

      const vig = ctx.createLinearGradient(0, 0, 0, H);
      vig.addColorStop(0, 'rgba(30,15,0,0.55)');
      vig.addColorStop(0.38, 'rgba(20,10,0,0.25)');
      vig.addColorStop(1, 'rgba(0,0,0,0.1)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    resize();
    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  const showAlertMessage = (type, title, description) => {
    setAlertConfig({ type, title, description });
    setShowAlert(true);
  };

  const Auth = async (e) => {
    try {
      e.preventDefault();
      setIsLoading(true);

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
          params: { user_name: username, pass_word: password }
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
          } else if (err.response.status === 404) {
            showAlertMessage('warning', 'Login Error', 'Invalid username or password. Please try again.');
          } else {
            showAlertMessage('warning', 'Login Error', 'Invalid username or password. Please try again.');
          }
        } else {
          showAlertMessage('warning', 'Connection Error', 'Unable to connect to server. Please check your internet or try again later.');
        }
        setTimeout(() => setIsLoading(false), 1000);
      }
    } catch (err) {
      console.log('Something went wrong!', err);
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
        padding: '16px'
      }}
    >
      {/* Outer page background orbs */}
      <div className="position-absolute w-100 h-100" style={{ zIndex: 0 }}>
        <div className="position-absolute rounded-circle" style={{
          width: '400px', height: '400px',
          background: 'rgba(255,255,255,0.05)',
          top: '-150px', right: '-150px',
          animation: 'float 8s ease-in-out infinite'
        }} />
        <div className="position-absolute rounded-circle" style={{
          width: '300px', height: '300px',
          background: 'rgba(255,255,255,0.05)',
          bottom: '-100px', left: '-100px',
          animation: 'float 10s ease-in-out infinite reverse'
        }} />
      </div>

      <div className="auth-content" style={{ zIndex: 1, maxWidth: '1100px', width: '100%' }}>
        <Loading show={isLoading} />

        {showAlert && (
          <div style={{
            position: 'fixed',
            top: '16px', right: '16px', left: '16px',
            zIndex: 999999,
            maxWidth: '400px',
            margin: '0 auto',
            width: 'auto'
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
              style={{ borderRadius: '23px' }}

            >
              <Row className="g-0" >

                {/* ── Left Side: Golden Oil Animation ── */}
                <Col lg={5} className="d-none d-lg-block p-0"
                  style={{ position: 'relative', overflow: 'hidden', minHeight: '580px', border: '2px solid rgb(255, 174, 0)', borderRadius: '24px  0px 0 24px' }}>
                  <canvas
                    ref={canvasRef}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  />
                  <div
                    className="h-100 d-flex flex-column justify-content-center p-5 text-white"
                    style={{ position: 'relative', zIndex: 2 }}
                  >
                    <div className="d-flex align-items-center mb-4">
                      <div style={{
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '16px',
                        padding: '12px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '200px',
                        height: '90px'
                      }}>
                        <img src={logo} alt="Lepanto Logo" className="img-fluid"
                          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                    </div>
                    <h1 className="display-5 fw-bold mb-3"
                      style={{ textShadow: '0 2px 16px rgba(0,0,0,0.5)', color: '#fff' }}>
                      Asset Reliability Monitoring System
                    </h1>
                    <p className="mb-5 opacity-75" style={{ fontSize: '1.1rem', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
                      A system used to monitor asset condition, performance, and reliability
                      to support efficient maintenance and operations.
                    </p>
                  </div>
                </Col>

                {/* ── Right Side: Login Form ── */}
                <Col lg={7} className="p-0" style={{ borderRadius: '0px  24px  24px 0px', border: '2px solid rgb(255, 174, 0)' }}>
                  <Card.Body
                    className="p-0 m-0"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',  // Changed from minHeight to height
                      minHeight: '620px',  // Keep minHeight as fallback
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '0px  24px  24px 0px',

                      background: 'linear-gradient(145deg, #ecac3446 0%, #f9972f41 60%, #dab27a50 100%)'
                    }}
                  >
                    {/* Blurred blob overlays — same orange/amber palette, just softened */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                      {/* Top-right bright blob */}
                      <div style={{
                        position: 'absolute',
                        width: '420px', height: '420px',
                        borderRadius: '50%',
                        background: 'rgba(255, 189, 89, 0.11)',
                        top: '-140px', right: '-120px',
                        filter: 'blur(72px)'
                      }} />
                      {/* Bottom-left deep amber blob */}
                      <div style={{
                        position: 'absolute',
                        width: '380px', height: '380px',
                        borderRadius: '50%',
                        background: 'rgba(175, 107, 5, 0.14)',
                        bottom: '-120px', left: '-100px',
                        filter: 'blur(80px)'
                      }} />
                      {/* Center warm mid blob */}
                      <div style={{
                        position: 'absolute',
                        width: '280px', height: '280px',
                        borderRadius: '50%',
                        background: 'rgba(236, 184, 128, 0.07)',
                        top: '30%', left: '25%',
                        filter: 'blur(64px)'
                      }} />
                      {/* Subtle dark tint for contrast */}
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(100,35,0,0.1)'
                      }} />
                    </div>

                    {/* Mobile branding banner */}
                    <div
                      className="d-lg-none mb-4 rounded-3 p-3 text-white d-flex align-items-center"
                      style={{
                        background: 'rgba(0,0,0,0.18)',
                        backdropFilter: 'blur(8px)',
                        gap: '12px',
                        position: 'absolute', top: '16px', left: '16px', right: '16px', zIndex: 3
                      }}
                    >
                      <div className="bg-white bg-opacity-25 rounded-2 p-2 flex-shrink-0">
                        <img src={logo} alt="Lepanto Logo"
                          style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                      </div>
                      <div>
                        <div className="fw-bold" style={{ fontSize: '0.85rem', lineHeight: 1.3 }}>
                          Asset Reliability Monitoring System
                        </div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                          Monitor asset condition &amp; performance
                        </div>
                      </div>
                    </div>

                    {/* Frosted glass form card - Blurred grey/silver version */}
                    <div style={{
                      position: 'relative',
                      zIndex: 2,
                      margin: '0px',
                      // Changed to grey/silver with subtle warmth
                      background: 'rgba(220, 220, 230, 0.35)',
                      backdropFilter: 'blur(28px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                      width: '100%',
                      height: '100%',
                      padding: '44px 40px',
                      borderRadius: '0px  24px  24px 0px',

                      boxShadow: '0 8px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.65)'
                    }}>
                      <div style={{ width: '80%', justifyContent: 'center', margin: '0 auto' }}>
                        {/* Eyebrow */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '10px',
                            background: 'rgba(255,255,255,0.5)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <FeatherIcon icon="grid" size={15} color="#5a2a10" />
                          </div>
                          <span style={{
                            fontSize: '11.5px', fontWeight: 700,
                            color: 'rgba(60,30,10,0.7)',
                            letterSpacing: '0.1em', textTransform: 'uppercase'
                          }}>
                            ARMS Portal
                          </span>
                        </div>

                        {/* Headline */}
                        <h2 style={{
                          fontSize: '30px', fontWeight: 900,
                          color: '#965a00',
                          letterSpacing: '-0.4px', marginBottom: '6px', lineHeight: 1.2
                        }}>
                          Welcome
                        </h2>
                        <p style={{ fontSize: '14px', color: 'rgba(60,35,15,0.65)', marginBottom: '32px' }}>
                          Sign in to your account to continue
                        </p>

                        <Form onSubmit={Auth}>

                          {/* Username */}
                          <Form.Group className="mb-4">
                            <Form.Label style={{
                              fontSize: '11px', fontWeight: 700, color: 'rgba(60,35,15,0.7)',
                              letterSpacing: '0.09em', textTransform: 'uppercase',
                              marginBottom: '8px', display: 'block'
                            }}>
                              Username
                            </Form.Label>
                            <div style={{ position: 'relative' }}>
                              <span style={{
                                position: 'absolute', left: '14px', top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'rgba(80,45,20,0.5)', pointerEvents: 'none', display: 'flex'
                              }}>
                                <FeatherIcon icon="user" size={16} />
                              </span>
                              <Form.Control
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.85)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgb(255, 255, 255)'}
                                style={{
                                  height: '50px',
                                  borderRadius: '12px',
                                  border: '2px solid rgb(255, 255, 255)',
                                  background: 'rgba(255,255,255,0.45)',
                                  paddingLeft: '42px', paddingRight: '16px',
                                  fontSize: '15px',
                                  color: '#2a1a0a',
                                  outline: 'none',
                                  boxShadow: 'none'
                                }}
                                className="signin-input"
                              />
                            </div>
                          </Form.Group>

                          {/* Password */}
                          <Form.Group className="mb-1">
                            <Form.Label style={{
                              fontSize: '11px', fontWeight: 700, color: 'rgba(60,35,15,0.7)',
                              letterSpacing: '0.09em', textTransform: 'uppercase',
                              marginBottom: '8px', display: 'block'
                            }}>
                              Password
                            </Form.Label>
                            <div style={{ position: 'relative' }} >
                              <span style={{
                                position: 'absolute', left: '14px', top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'rgba(80,45,20,0.5)', pointerEvents: 'none', display: 'flex'
                              }}>
                                <FeatherIcon icon="lock" size={16} />
                              </span>
                              <Form.Control
                                className="signin-input"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                  height: '50px',
                                  borderRadius: '12px',
                                  border: '2px solid rgb(255, 255, 255)',
                                  background: 'rgba(255,255,255,0.45)',
                                  paddingLeft: '42px', paddingRight: '48px',
                                  fontSize: '15px',
                                  color: '#2a1a0a',
                                  outline: 'none',
                                  boxShadow: 'none'
                                }}




                              />
                              <Button
                                variant="link"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                  position: 'absolute', right: '12px', top: '50%',
                                  transform: 'translateY(-50%)',
                                  color: 'rgba(80,45,20,0.5)',
                                  padding: '4px', border: 'none', background: 'none'
                                }}
                              >
                                <FeatherIcon icon={showPassword ? 'eye-off' : 'eye'} size={17} />
                              </Button>
                            </div>
                          </Form.Group>



                          {/* Sign In Button — unchanged */}
                          <Button
                            type="submit"
                            className="w-100 border-0 py-3 fw-semibold mb-4"
                            disabled={isLoading}
                            style={{
                              background: 'linear-gradient(145deg, #E37239 0%, #F9982F 100%)',
                              borderRadius: '15px',
                              fontSize: '1.1rem',
                              transition: 'all 0.3s ease',
                              boxShadow: '0 4px 15px rgba(234, 155, 102, 0.4)',
                              marginTop: '84px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 6px 20px rgb(255, 255, 255)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 15px rgba(234, 155, 102, 0.4)';
                            }}
                          >
                            {isLoading ? (
                              <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Signing in...</>
                            ) : 'Sign In'}
                          </Button>
                        </Form>

                        <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(60,35,15,0.5)', marginTop: '4px' }}>
                          Protected by{' '}
                          <span style={{ color: 'rgba(70,35,10,0.7)', fontWeight: 600 }}>
                            Lepanto Consolidated Mining
                          </span>
                        </p>
                      </div>

                    </div>
                  </Card.Body>
                </Col>

              </Row>
            </Card>
          </Col>
        </Row>
        <div
          style={{
            position: 'fixed',
            bottom: '16px',
            left: 0,
            right: 0,
            textAlign: 'center',
            color: '#32446993',
            zIndex: 2,
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <small>
            by{' '}
            <a
              href="https://linkedin.com/in/durkongontop"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontWeight: 500, color: 'inherit', textDecoration: 'none' }}
            >
              adriankurtventura
            </a>
          </small>

          <small>
            © {new Date().getFullYear()}{' '}
            <a
              href="https://lepantomining.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontWeight: 500, color: 'inherit', textDecoration: 'none' }}
            >
              lepantomining.com
            </a>
          </small>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .signin-input::placeholder {
          color: rgba(100,40,0,0.38) !important;
        }
        .signin-input:focus {
          border-color: rgba(255, 145, 0, 0.85) !important;
          box-shadow: 0 0 0 3px rgba(255, 154, 39, 0.22) !important;
        }
      `}</style>
    </div >
  );
}
