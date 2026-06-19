// import axios from 'axios';
// import config from 'config';
// import { useEffect, useRef, useState } from 'react';
// import { Card, Button, Form, Modal, Badge } from 'react-bootstrap';
// import { useNavigate } from 'react-router-dom';
// import FeatherIcon from 'feather-icons-react';
// import Loading from '../../components/personalComponents/loading';
// import AlertModal from '../../components/personalComponents/alertModal';

// export default function Profile() {
//     const navigate = useNavigate();

//     const empInfo = JSON.parse(localStorage.getItem('user')) || {};
//     const id_master = empInfo.id_master;
//     const [userData, setUserData] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [showAlert, setShowAlert] = useState(false);
//     const [alertConfig, setAlertConfig] = useState({ type: 'success', title: '', description: '' });
//     const [profileImage, setProfileImage] = useState(null);
//     const [isUploading, setIsUploading] = useState(false);
//     const fileInputRef = useRef(null);

//     const [formData, setFormData] = useState({
//         emp_firstname: '', emp_lastname: '', user_name: '',
//         emp_position: '', pass_word: '', emp_role: '', emp_email: ''
//     });

//     const currentUser = JSON.parse(localStorage.getItem("user"))?.user_name || '';

//     useEffect(() => {
//         const fetchUserData = async () => {
//             setIsLoading(true);
//             try {
//                 const res = await axios.get(`${config.baseApi}/authentication/get-by-id`, {
//                     params: { id: id_master }
//                 });
//                 const data = res.data || {};
//                 setUserData(data);
//                 setFormData({
//                     emp_firstname: data.emp_firstname || '',
//                     emp_lastname: data.emp_lastname || '',
//                     user_name: data.user_name || '',
//                     emp_position: data.emp_position || '',
//                     pass_word: '',
//                     emp_role: data.emp_role || '',
//                     emp_email: data.emp_email || ''
//                 });

//                 // Load existing avatar if present
//                 if (data.avatar) {
//                     setProfileImage(`${config.baseApi}/${data.avatar}`);
//                 }

//                 setError(null);
//             } catch (err) {
//                 console.error('Unable to fetch data: ', err);
//                 setError('Failed to load user data. Please try again.');
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         if (id_master) {
//             fetchUserData();
//         } else {
//             setError('No user ID provided');
//             setIsLoading(false);
//         }
//     }, [id_master]);

//     const showAlertMessage = (type, title, description) => {
//         setAlertConfig({ type, title, description });
//         setShowAlert(true);
//     };

//     const handleImageUpload = async (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
//         if (!allowedTypes.includes(file.type)) {
//             showAlertMessage('error', 'Invalid File', 'Please upload a JPG, PNG, GIF, or WEBP image.');
//             return;
//         }
//         if (file.size > 5 * 1024 * 1024) {
//             showAlertMessage('warning', 'File Too Large', 'Image must be under 5MB.');
//             return;
//         }

//         // Show instant local preview
//         const previewUrl = URL.createObjectURL(file);
//         setProfileImage(previewUrl);
//         setIsUploading(true);

//         const formDataUpload = new FormData();
//         formDataUpload.append('avatar', file);
//         formDataUpload.append('id_master', id_master);

//         try {
//             await axios.post(`${config.baseApi}/authentication/upload-avatar`, formDataUpload, {
//                 headers: { 'Content-Type': 'multipart/form-data' }
//             })
//                 .then((res) => {
//                     // Replace preview with the persisted server path
//                     setProfileImage(`${config.baseApi}${res.data.avatar}`);
//                     showAlertMessage('success', 'Photo Updated', 'Profile photo uploaded successfully.');
//                     setTimeout(() => {
//                         window.location.reload();
//                     }, 2000);
//                 })
//                 .catch((err) => {
//                     console.error('Upload failed:', err);
//                     setProfileImage(null);
//                     showAlertMessage('error', 'Upload Failed', 'Could not upload profile photo. Please try again.');
//                 })
//                 .finally(() => {
//                     setIsUploading(false);
//                 });
//         } catch (err) {
//             console.error('Upload failed:', err);
//             setProfileImage(null);
//             showAlertMessage('error', 'Upload Failed', 'Could not upload profile photo. Please try again.');

//         }

//     };

//     const getRoleBadgeVariant = (role) => {
//         switch (role?.toLowerCase()) {
//             case 'admin': return { bg: 'linear-gradient(45deg, rgb(160, 144, 95), #7a810e)', label: 'Administrator' };
//             case 'user': return { bg: 'linear-gradient(45deg, rgb(95, 118, 160), #0e4081)', label: 'Standard User' };
//             default: return { bg: '#6B7280', label: role || 'User' };
//         }
//     };

//     const getPositionLabel = (position) => {
//         switch (position) {
//             case 'l1': return 'Level 1 - Associate';
//             case 'l2': return 'Level 2 - Specialist';
//             case 'l3': return 'Level 3 - Manager';
//             default: return position || 'Not Assigned';
//         }
//     };

//     if (isLoading) return <Loading show={true} />;

//     const roleInfo = getRoleBadgeVariant(userData?.emp_role);

//     const getDepartmentFormat = (department) => {
//         switch (department) {
//             case 'mms':
//                 return 'MMS';
//             case 'mme_mwso':
//                 return 'MME & MWSO';
//             case 'smed':
//                 return 'SMED';
//             case 'assay':
//                 return 'ASSAY';
//             default:
//                 return department;
//         }
//     }

//     return (
//         <div style={{
//             background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
//             minHeight: '100vh', padding: '40px', position: 'relative',
//             overflow: 'hidden', paddingTop: '50px'
//         }}>
//             {showAlert && (
//                 <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 999999, pointerEvents: 'none' }}>
//                     <div style={{ pointerEvents: 'auto' }}>
//                         <AlertModal
//                             type={alertConfig.type}
//                             title={alertConfig.title}
//                             description={alertConfig.description}
//                             onClose={() => setShowAlert(false)}
//                             autoClose={5000}
//                         />
//                     </div>
//                 </div>
//             )}

//             {/* Animated background blobs */}
//             {[
//                 { w: 600, h: 600, t: '-200px', r: '-200px', d: '25s' },
//                 { w: 400, h: 400, b: '-150px', l: '-150px', d: '20s', rev: true },
//                 { w: 300, h: 300, t: '50%', l: '20%', d: '18s' },
//                 { w: 200, h: 200, b: '20%', r: '15%', d: '22s' },
//             ].map((s, i) => (
//                 <div key={i} style={{
//                     position: 'absolute', width: s.w, height: s.h, borderRadius: '50%',
//                     background: `rgba(255,255,255,${i > 1 ? '0.03' : '0.05'})`,
//                     top: s.t, right: s.r, bottom: s.b, left: s.l, zIndex: 1,
//                     animation: `float ${s.d} infinite ease-in-out${s.rev ? ' reverse' : ''}`
//                 }} />
//             ))}

//             <style>{`
//                 @keyframes float {
//                     0%, 100% { transform: translate(0, 0) rotate(0deg); }
//                     33% { transform: translate(50px, -50px) rotate(120deg); }
//                     66% { transform: translate(-30px, 30px) rotate(240deg); }
//                 }
//             `}</style>

//             <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
//                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', padding: '0 4px' }}>
//                     <div>
//                         <h1 style={{ fontSize: '2.8rem', fontWeight: 700, color: '#EAB56F', marginBottom: '8px', letterSpacing: '-0.5px' }}>
//                             User Details
//                         </h1>
//                         <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
//                             Manage users credentials
//                         </p>
//                     </div>
//                 </div>

//                 {error ? (
//                     <Card style={{ borderRadius: '20px', border: 'none', background: 'rgba(255,255,255,0.95)' }}>
//                         <Card.Body style={{ padding: '48px', textAlign: 'center' }}>
//                             <FeatherIcon icon="alert-circle" size={48} style={{ color: '#DC2626', marginBottom: '16px' }} />
//                             <h3 style={{ color: '#991B1B', marginBottom: '8px', fontSize: '18px', fontWeight: 600 }}>Error Loading Data</h3>
//                             <p style={{ color: '#7F1D1D', marginBottom: '24px' }}>{error}</p>
//                             <Button onClick={() => navigate(-1)} variant="secondary">Return</Button>
//                         </Card.Body>
//                     </Card>
//                 ) : userData ? (
//                     <>
//                         {/* Hero Card */}
//                         <Card style={{
//                             borderRadius: '24px', border: 'none', backdropFilter: 'blur(10px)',
//                             marginBottom: '22px', overflow: 'hidden',
//                             boxShadow: '0 25px 40px -12px rgba(0,0,0,0.25)', width: '100%'
//                         }}>
//                             <div style={{
//                                 background: 'linear-gradient(45deg, #EAB56F, #F9982F, #E37239)',
//                                 padding: '32px 32px 24px 32px',
//                                 borderBottom: '1px solid rgba(255,255,255,0.1)'
//                             }}>
//                                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
//                                     <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>

//                                         {/* Hidden file input */}
//                                         <input
//                                             type="file"
//                                             ref={fileInputRef}
//                                             accept="image/*"
//                                             style={{ display: 'none' }}
//                                             onChange={handleImageUpload}
//                                         />

//                                         {/* Avatar circle + "+" button */}
//                                         <div style={{ position: 'relative', width: '88px', height: '88px' }}>
//                                             <div style={{
//                                                 width: '88px', height: '88px', background: 'white',
//                                                 borderRadius: '50%', display: 'flex', alignItems: 'center',
//                                                 justifyContent: 'center', border: '2px solid #ffc933',
//                                                 boxShadow: '0 8px 20px rgba(0,0,0,0.3)', overflow: 'hidden'
//                                             }}>
//                                                 {isUploading ? (
//                                                     <div className="spinner-border" role="status"
//                                                         style={{ width: '28px', height: '28px', color: '#ff8800' }}>
//                                                         <span className="visually-hidden">Uploading...</span>
//                                                     </div>
//                                                 ) : profileImage ? (
//                                                     <img src={profileImage} alt="Profile"
//                                                         style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                                                 ) : (
//                                                     <FeatherIcon icon="user" size={44} style={{ color: '#ff8800' }} />
//                                                 )}
//                                             </div>

//                                             {/* "+" button */}
//                                             <button
//                                                 onClick={() => fileInputRef.current.click()}
//                                                 disabled={isUploading}
//                                                 title="Upload profile photo"
//                                                 style={{
//                                                     position: 'absolute', bottom: '2px', right: '2px',
//                                                     width: '24px', height: '24px', borderRadius: '50%',
//                                                     background: isUploading ? '#aaa' : '#ff8800',
//                                                     border: '2px solid white', cursor: isUploading ? 'not-allowed' : 'pointer',
//                                                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                                                     padding: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
//                                                     transition: 'background 0.2s ease'
//                                                 }}
//                                                 onMouseEnter={(e) => { if (!isUploading) e.currentTarget.style.background = '#e37239'; }}
//                                                 onMouseLeave={(e) => { if (!isUploading) e.currentTarget.style.background = '#ff8800'; }}
//                                             >
//                                                 <FeatherIcon icon="plus" size={12} style={{ color: 'white', strokeWidth: 3 }} />
//                                             </button>
//                                         </div>

//                                         <div>
//                                             <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '8px', letterSpacing: '-0.3px' }}>
//                                                 {userData.emp_firstname} {userData.emp_lastname}
//                                             </h1>
//                                             <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
//                                                 <h6 style={{ fontSize: '13px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
//                                                     <FeatherIcon icon="hash" size={12} /> ID: {userData.id_master}
//                                                 </h6>
//                                                 <h6 style={{ fontSize: '13px', fontWeight: 500, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
//                                                     <FeatherIcon icon="calendar" size={12} />
//                                                     Joined {userData.created_at ? new Date(userData.created_at).toLocaleDateString() : 'Recently'}
//                                                 </h6>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
//                                         <span style={{
//                                             background: roleInfo.bg, color: 'white', padding: '8px 16px',
//                                             borderRadius: '40px', fontSize: '12px', fontWeight: 600,
//                                             display: 'inline-flex', alignItems: 'center', gap: '6px'
//                                         }}>
//                                             <FeatherIcon icon="shield" size={12} /> {roleInfo.label}
//                                         </span>
//                                         <span style={{
//                                             background: '#569b41', color: '#E2E8F0', padding: '8px 16px',
//                                             borderRadius: '40px', fontSize: '12px', fontWeight: 600,
//                                             display: 'inline-flex', alignItems: 'center', gap: '6px'
//                                         }}>
//                                             <FeatherIcon icon="trending-up" size={12} />
//                                             {getPositionLabel(userData.emp_position)}
//                                         </span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </Card>

//                         {/* Account Details Card */}
//                         <div style={{ width: '100%' }}>
//                             <Card style={{
//                                 borderRadius: '28px',
//                                 border: 'none',
//                                 background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)',
//                                 backdropFilter: 'blur(12px)',
//                                 marginBottom: '24px',
//                                 overflow: 'hidden',
//                                 width: '100%',
//                                 boxShadow: '0 20px 35px -12px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.02)',
//                                 transition: 'transform 0.2s ease, box-shadow 0.2s ease',
//                             }}
//                                 onMouseEnter={(e) => {
//                                     e.currentTarget.style.transform = 'translateY(-2px)';
//                                     e.currentTarget.style.boxShadow = '0 24px 40px -16px rgba(0,0,0,0.12)';
//                                 }}
//                                 onMouseLeave={(e) => {
//                                     e.currentTarget.style.transform = 'translateY(0)';
//                                     e.currentTarget.style.boxShadow = '0 20px 35px -12px rgba(0,0,0,0.08)';
//                                 }}>

//                                 {/* Header with gradient accent */}
//                                 <div style={{
//                                     padding: '20px 28px',
//                                     background: 'linear-gradient(135deg, #FAFAFF 0%, #FFFFFF 100%)',
//                                     borderBottom: '1px solid rgba(255,145,0,0.15)',
//                                     position: 'relative',
//                                     overflow: 'hidden'
//                                 }}>
//                                     {/* Decorative accent bar */}
//                                     <div style={{
//                                         position: 'absolute',
//                                         top: 0,
//                                         left: 0,
//                                         right: 0,
//                                         height: '3px',
//                                         background: 'linear-gradient(90deg, #ff9100, #ffb347, #ffcc80)'
//                                     }} />

//                                     <h6 style={{
//                                         margin: 0,
//                                         fontSize: '12px',
//                                         fontWeight: 800,
//                                         textTransform: 'uppercase',
//                                         letterSpacing: '1.2px',
//                                         background: 'linear-gradient(135deg, #ff9100, #ff6b35)',
//                                         WebkitBackgroundClip: 'text',
//                                         WebkitTextFillColor: 'transparent',
//                                         backgroundClip: 'text',
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: '10px'
//                                     }}>
//                                         <div style={{
//                                             background: 'linear-gradient(135deg, rgba(255,145,0,0.12), rgba(255,107,53,0.08))',
//                                             padding: '6px',
//                                             borderRadius: '12px',
//                                             display: 'inline-flex'
//                                         }}>
//                                             <FeatherIcon icon="grid" size={14} color="#ff9100" strokeWidth={2.5} />
//                                         </div>
//                                         Account Details
//                                     </h6>
//                                 </div>

//                                 {/* Content with improved spacing and visual hierarchy */}
//                                 <div style={{ padding: '32px 28px' }}>
//                                     {/* Name row with subtle background */}
//                                     <div style={{
//                                         display: 'flex',
//                                         gap: '24px',
//                                         marginBottom: '28px',
//                                         alignItems: 'flex-start'
//                                     }}>
//                                         {[
//                                             { label: 'First Name', value: userData.emp_firstname, icon: 'user' },
//                                             { label: 'Last Name', value: userData.emp_lastname, icon: 'user-check' }
//                                         ].map((field, idx) => (
//                                             <div key={idx} style={{ flex: 1 }}>
//                                                 <div style={{
//                                                     display: 'flex',
//                                                     alignItems: 'center',
//                                                     gap: '6px',
//                                                     marginBottom: '8px'
//                                                 }}>
//                                                     <FeatherIcon icon={field.icon} size={12} color="#ff9100" />
//                                                     <div style={{
//                                                         fontSize: '10px',
//                                                         color: '#94A3B8',
//                                                         textTransform: 'uppercase',
//                                                         fontWeight: 700,
//                                                         letterSpacing: '0.8px'
//                                                     }}>
//                                                         {field.label}
//                                                     </div>
//                                                 </div>
//                                                 <div style={{
//                                                     fontSize: '16px',
//                                                     fontWeight: 600,
//                                                     color: '#0F172A',
//                                                     padding: '10px 0 8px',
//                                                     borderBottom: '2px solid #F1F5F9',
//                                                     transition: 'border-color 0.2s ease',
//                                                     cursor: 'default'
//                                                 }}
//                                                     onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = '#ff9100'}
//                                                     onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = '#F1F5F9'}>
//                                                     {field.value || '—'}
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>

//                                     {/* Email field with card-style layout */}
//                                     <div style={{ marginBottom: '24px' }}>
//                                         <div style={{
//                                             display: 'flex',
//                                             alignItems: 'center',
//                                             gap: '8px',
//                                             marginBottom: '8px'
//                                         }}>
//                                             <div style={{
//                                                 background: 'linear-gradient(135deg, rgba(255,145,0,0.1), rgba(255,107,53,0.05))',
//                                                 padding: '6px',
//                                                 borderRadius: '10px',
//                                                 display: 'inline-flex'
//                                             }}>
//                                                 <FeatherIcon icon="mail" size={13} color="#ff9100" />
//                                             </div>
//                                             <div style={{
//                                                 fontSize: '10px',
//                                                 color: '#94A3B8',
//                                                 textTransform: 'uppercase',
//                                                 fontWeight: 700,
//                                                 letterSpacing: '0.8px'
//                                             }}>
//                                                 Email Address
//                                             </div>
//                                         </div>
//                                         <div style={{
//                                             fontSize: '15px',
//                                             fontWeight: 500,
//                                             color: '#1E293B',
//                                             padding: '8px 12px',
//                                             background: '#F8FAFE',
//                                             borderRadius: '14px',
//                                             display: 'flex',
//                                             alignItems: 'center',
//                                             gap: '10px',
//                                             border: '1px solid #F1F5F9'
//                                         }}>
//                                             {userData.emp_email || 'Not provided'}
//                                         </div>
//                                     </div>

//                                     {/* Username field */}
//                                     <div style={{ marginBottom: '24px' }}>
//                                         <div style={{
//                                             display: 'flex',
//                                             alignItems: 'center',
//                                             gap: '8px',
//                                             marginBottom: '8px'
//                                         }}>
//                                             <FeatherIcon icon="at-sign" size={13} color="#ff9100" />
//                                             <div style={{
//                                                 fontSize: '10px',
//                                                 color: '#94A3B8',
//                                                 textTransform: 'uppercase',
//                                                 fontWeight: 700,
//                                                 letterSpacing: '0.8px'
//                                             }}>
//                                                 Username
//                                             </div>
//                                         </div>
//                                         <div style={{
//                                             fontSize: '15px',
//                                             fontWeight: 600,
//                                             color: '#0F172A',
//                                             padding: '8px 12px',
//                                             background: '#F8FAFE',
//                                             borderRadius: '14px',
//                                             fontFamily: 'monospace',
//                                             letterSpacing: '0.3px',
//                                             border: '1px solid #F1F5F9'
//                                         }}>
//                                             @{userData.user_name}
//                                         </div>
//                                     </div>

//                                     {/* Two column layout for Position & Location */}
//                                     <div style={{ display: 'flex', gap: '20px', marginTop: '4px' }}>
//                                         <div style={{ flex: 1 }}>
//                                             <div style={{
//                                                 display: 'flex',
//                                                 alignItems: 'center',
//                                                 gap: '8px',
//                                                 marginBottom: '8px'
//                                             }}>
//                                                 <FeatherIcon icon="briefcase" size={13} color="#ff9100" />
//                                                 <div style={{
//                                                     fontSize: '10px',
//                                                     color: '#94A3B8',
//                                                     textTransform: 'uppercase',
//                                                     fontWeight: 700,
//                                                     letterSpacing: '0.8px'
//                                                 }}>
//                                                     Position Level
//                                                 </div>
//                                             </div>
//                                             <div style={{
//                                                 fontSize: '14px',
//                                                 fontWeight: 600,
//                                                 color: '#0F172A',
//                                                 padding: '8px 12px',
//                                                 background: 'linear-gradient(135deg, #FFF9F0, #FFFFFF)',
//                                                 borderRadius: '14px',
//                                                 border: '1px solid rgba(255,145,0,0.2)',
//                                                 display: 'flex',
//                                                 alignItems: 'center',
//                                                 gap: '8px'
//                                             }}>
//                                                 <div style={{
//                                                     width: '8px',
//                                                     height: '8px',
//                                                     borderRadius: '50%',
//                                                     background: '#ff9100',
//                                                     boxShadow: '0 0 0 3px rgba(255,145,0,0.2)'
//                                                 }} />
//                                                 {getPositionLabel(userData.emp_position)}
//                                             </div>
//                                         </div>

//                                         <div style={{ flex: 1 }}>
//                                             <div style={{
//                                                 display: 'flex',
//                                                 alignItems: 'center',
//                                                 gap: '8px',
//                                                 marginBottom: '8px'
//                                             }}>
//                                                 <FeatherIcon icon="map-pin" size={13} color="#ff9100" />
//                                                 <div style={{
//                                                     fontSize: '10px',
//                                                     color: '#94A3B8',
//                                                     textTransform: 'uppercase',
//                                                     fontWeight: 700,
//                                                     letterSpacing: '0.8px'
//                                                 }}>
//                                                     Assigned Location
//                                                 </div>
//                                             </div>
//                                             <div style={{
//                                                 fontSize: '14px',
//                                                 fontWeight: 500,
//                                                 color: '#0F172A',
//                                                 padding: '8px 12px',
//                                                 background: '#F8FAFE',
//                                                 borderRadius: '14px',
//                                                 border: '1px solid #F1F5F9',
//                                                 display: 'flex',
//                                                 alignItems: 'center',
//                                                 gap: '8px'
//                                             }}>
//                                                 <FeatherIcon icon="layers" size={13} color="#94A3B8" />
//                                                 {getDepartmentFormat(userData.emp_department)}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </Card>
//                         </div>
//                     </>
//                 ) : (
//                     <Card style={{ borderRadius: '20px', border: 'none', background: 'rgba(255,255,255,0.96)', textAlign: 'center', padding: '48px' }}>
//                         <FeatherIcon icon="user-x" size={48} style={{ color: '#94A3B8', marginBottom: '16px' }} />
//                         <h3 style={{ color: '#475569', marginBottom: '8px', fontSize: '18px', fontWeight: 500 }}>User Not Found</h3>
//                         <p style={{ color: '#94A3B8', marginBottom: 0, fontSize: '14px' }}>The requested user profile does not exist.</p>
//                     </Card>
//                 )}
//             </div>
//         </div>
//     );
// }
import axios from 'axios';
import config from 'config';
import { useEffect, useRef, useState } from 'react';
import { Card, Button, Form, Modal, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import Loading from '../../components/personalComponents/loading';
import AlertModal from '../../components/personalComponents/alertModal';

export default function Profile() {
    const navigate = useNavigate();

    const empInfo = JSON.parse(localStorage.getItem('user')) || {};
    const id_master = empInfo.id_master;
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: 'success', title: '', description: '' });
    const [profileImage, setProfileImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        emp_firstname: '', emp_lastname: '', user_name: '',
        emp_position: '', pass_word: '', emp_role: '', emp_email: ''
    });

    const currentUser = JSON.parse(localStorage.getItem("user"))?.user_name || '';

    useEffect(() => {
        const fetchUserData = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`${config.baseApi}/authentication/get-by-id`, {
                    params: { id: id_master }
                });
                const data = res.data || {};
                setUserData(data);
                setFormData({
                    emp_firstname: data.emp_firstname || '',
                    emp_lastname: data.emp_lastname || '',
                    user_name: data.user_name || '',
                    emp_position: data.emp_position || '',
                    pass_word: '',
                    emp_role: data.emp_role || '',
                    emp_email: data.emp_email || ''
                });

                // Load existing avatar if present
                if (data.avatar) {
                    setProfileImage(`${config.baseApi}/${data.avatar}`);
                }

                setError(null);
            } catch (err) {
                console.error('Unable to fetch data: ', err);
                setError('Failed to load user data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        if (id_master) {
            fetchUserData();
        } else {
            setError('No user ID provided');
            setIsLoading(false);
        }
    }, [id_master]);

    const showAlertMessage = (type, title, description) => {
        setAlertConfig({ type, title, description });
        setShowAlert(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            showAlertMessage('error', 'Invalid File', 'Please upload a JPG, PNG, GIF, or WEBP image.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showAlertMessage('warning', 'File Too Large', 'Image must be under 5MB.');
            return;
        }

        // Show instant local preview
        const previewUrl = URL.createObjectURL(file);
        setProfileImage(previewUrl);
        setIsUploading(true);

        const formDataUpload = new FormData();
        formDataUpload.append('avatar', file);
        formDataUpload.append('id_master', id_master);

        try {
            await axios.post(`${config.baseApi}/authentication/upload-avatar`, formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
                .then((res) => {
                    // Replace preview with the persisted server path
                    setProfileImage(`${config.baseApi}${res.data.avatar}`);
                    showAlertMessage('success', 'Photo Updated', 'Profile photo uploaded successfully.');
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                })
                .catch((err) => {
                    console.error('Upload failed:', err);
                    setProfileImage(null);
                    showAlertMessage('error', 'Upload Failed', 'Could not upload profile photo. Please try again.');
                })
                .finally(() => {
                    setIsUploading(false);
                });
        } catch (err) {
            console.error('Upload failed:', err);
            setProfileImage(null);
            showAlertMessage('error', 'Upload Failed', 'Could not upload profile photo. Please try again.');
        }
    };

    const getRoleBadgeVariant = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return { bg: 'linear-gradient(135deg, #D4AF37, #B8860B)', label: 'Administrator' };
            case 'user': return { bg: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', label: 'Standard User' };
            default: return { bg: '#6B7280', label: role || 'User' };
        }
    };

    const getPositionLabel = (position) => {
        switch (position) {
            case 'l1': return 'Level 1 - Associate';
            case 'l2': return 'Level 2 - Specialist';
            case 'l3': return 'Level 3 - Manager';
            default: return position || 'Not Assigned';
        }
    };

    if (isLoading) return <Loading show={true} />;

    const roleInfo = getRoleBadgeVariant(userData?.emp_role);

    const getDepartmentFormat = (department) => {
        switch (department) {
            case 'mms':
                return 'MMS';
            case 'mme_mwso':
                return 'MME & MWSO';
            case 'smed':
                return 'SMED';
            case 'assay':
                return 'ASSAY';
            default:
                return department;
        }
    }

    return (
        <div style={{
            background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
            minHeight: '100vh',
            padding: '40px',
            position: 'relative',
            overflow: 'hidden',
            paddingTop: '50px'
        }}>
            {showAlert && (
                <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 999999, pointerEvents: 'none' }}>
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

            {/* Decorative blobs (static, no animations) */}
            {[
                { w: 600, h: 600, t: '-200px', r: '-200px' },
                { w: 400, h: 400, b: '-150px', l: '-150px' },
                { w: 300, h: 300, t: '50%', l: '20%' },
                { w: 200, h: 200, b: '20%', r: '15%' },
            ].map((s, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    width: s.w,
                    height: s.h,
                    borderRadius: '50%',
                    background: `rgba(255,255,255,${i > 1 ? '0.03' : '0.05'})`,
                    top: s.t,
                    right: s.r,
                    bottom: s.b,
                    left: s.l,
                    zIndex: 1
                }} />
            ))}

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', padding: '0 4px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.8rem', fontWeight: 700, color: '#EAB56F', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                            User Details
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                            Manage users credentials
                        </p>
                    </div>
                </div>

                {error ? (
                    <Card style={{ borderRadius: '20px', border: 'none', background: 'rgba(255,255,255,0.95)' }}>
                        <Card.Body style={{ padding: '48px', textAlign: 'center' }}>
                            <FeatherIcon icon="alert-circle" size={48} style={{ color: '#DC2626', marginBottom: '16px' }} />
                            <h3 style={{ color: '#991B1B', marginBottom: '8px', fontSize: '18px', fontWeight: 600 }}>Error Loading Data</h3>
                            <p style={{ color: '#7F1D1D', marginBottom: '24px' }}>{error}</p>
                            <Button onClick={() => navigate(-1)} variant="secondary">Return</Button>
                        </Card.Body>
                    </Card>
                ) : userData ? (
                    <>
                        {/* Hero Card - Enhanced Version */}
                        <Card style={{
                            borderRadius: '28px',
                            border: 'none',
                            marginBottom: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 45px -12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.02)',
                            width: '100%',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            cursor: 'default'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #d18221 0%, #e29b3f 75%, #915200 100%)',
                                padding: '36px 36px 28px 36px',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Pattern overlay */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundImage: `radial-gradient(circle at 20% 40%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                                    backgroundSize: '24px 24px',
                                    pointerEvents: 'none'
                                }} />

                                {/* Decorative glowing orb 1 */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-30%',
                                    right: '-10%',
                                    width: '300px',
                                    height: '300px',
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent)',
                                    filter: 'blur(60px)',
                                    pointerEvents: 'none'
                                }} />

                                {/* Decorative glowing orb 2 */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-20%',
                                    left: '-5%',
                                    width: '200px',
                                    height: '200px',
                                    borderRadius: '50%',
                                    background: 'radial-gradient(circle, rgba(255,200,100,0.4), transparent)',
                                    filter: 'blur(50px)',
                                    pointerEvents: 'none'
                                }} />

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '24px',
                                    position: 'relative',
                                    zIndex: 2
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>

                                        {/* Hidden file input */}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            onChange={handleImageUpload}
                                        />

                                        {/* Enhanced Avatar */}
                                        <div style={{ position: 'relative' }}>
                                            {/* Decorative ring */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '-6px',
                                                left: '-6px',
                                                right: '-6px',
                                                bottom: '-6px',
                                                borderRadius: '50%',
                                                background: 'conic-gradient(from 0deg, #f7eaa3, #f7c68b, #fced9a)',
                                                opacity: 0.6
                                            }} />

                                            <div style={{
                                                position: 'relative',
                                                width: '100px',
                                                height: '100px',
                                                background: 'white',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '3px solid rgba(255,215,0,0.8)',
                                                boxShadow: '0 12px 28px rgba(0,0,0,0.3), 0 0 0 4px rgba(255,215,0,0.2)',
                                                overflow: 'hidden',
                                                transition: 'transform 0.3s ease'
                                            }}>
                                                {isUploading ? (
                                                    <div className="spinner-border" role="status"
                                                        style={{ width: '32px', height: '32px', color: '#ff8800' }}>
                                                        <span className="visually-hidden">Uploading...</span>
                                                    </div>
                                                ) : profileImage ? (
                                                    <img src={profileImage} alt="Profile"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <FeatherIcon icon="user" size={50} style={{ color: '#ff8800' }} />
                                                )}
                                            </div>

                                            {/* Camera upload button */}
                                            <button
                                                onClick={() => fileInputRef.current.click()}
                                                disabled={isUploading}
                                                title="Upload profile photo"
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '4px',
                                                    right: '4px',
                                                    width: '30px',
                                                    height: '30px',
                                                    borderRadius: '50%',
                                                    background: isUploading ? '#999' : 'linear-gradient(135deg, #FFD700, #FF8C00)',
                                                    border: '2.5px solid white',
                                                    cursor: isUploading ? 'not-allowed' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: 0,
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    transform: 'scale(1)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isUploading) {
                                                        e.currentTarget.style.transform = 'scale(1.1)';
                                                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isUploading) {
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                                                    }
                                                }}
                                            >
                                                <FeatherIcon icon="camera" size={14} style={{ color: 'white', strokeWidth: 2.5 }} />
                                            </button>
                                        </div>

                                        {/* User info */}
                                        <div>
                                            <h1 style={{
                                                margin: 0,
                                                fontSize: '32px',
                                                fontWeight: 800,
                                                color: 'white',
                                                marginBottom: '10px',
                                                letterSpacing: '-0.5px',
                                                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                                            }}>
                                                {userData.emp_firstname} {userData.emp_lastname}
                                            </h1>
                                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <div style={{
                                                    background: 'rgba(255,255,255,0.2)',
                                                    backdropFilter: 'blur(8px)',
                                                    padding: '6px 14px',
                                                    borderRadius: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <FeatherIcon icon="hash" size={14} style={{ color: '#FFE5B4' }} />
                                                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'white', letterSpacing: '0.3px' }}>
                                                        ID: {userData.id_master}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    background: 'rgba(255,255,255,0.15)',
                                                    backdropFilter: 'blur(8px)',
                                                    padding: '6px 14px',
                                                    borderRadius: '40px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <FeatherIcon icon="calendar" size={14} style={{ color: '#FFE5B4' }} />
                                                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'white' }}>
                                                        Joined {userData.created_at ? new Date(userData.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}
                                                    </span>
                                                </div>

                                            </div>
                                        </div>
                                    </div>

                                    {/* Badges */}
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        <div style={{
                                            background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.1))',
                                            backdropFilter: 'blur(12px)',
                                            padding: '8px 20px',
                                            borderRadius: '50px',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            transition: 'transform 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                            <FeatherIcon icon="shield" size={14} style={{ color: '#FFE5B4' }} />
                                            <span>{roleInfo.label}</span>
                                        </div>

                                        <div style={{
                                            background: 'linear-gradient(135deg, #2D5A27, #3E7A35)',
                                            padding: '8px 20px',
                                            borderRadius: '50px',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            color: '#E8F5E5',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            transition: 'transform 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                            <FeatherIcon icon="trending-up" size={14} />
                                            <span>{getPositionLabel(userData.emp_position)}</span>
                                        </div>

                                        {/* Status badge */}
                                        <div style={{
                                            background: 'rgba(158, 218, 161, 0.35)',
                                            backdropFilter: 'blur(8px)',
                                            padding: '8px 16px',
                                            borderRadius: '50px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            color: '#FFE5B4',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            border: '1px solid rgba(255,215,0,0.5)'
                                        }}>
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: '#4ADE80',
                                                boxShadow: '0 0 0 2px rgba(74,222,128,0.4)'
                                            }} />
                                            <span>Active</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Account Details Card - Enhanced */}
                        <div style={{ width: '100%' }}>
                            <Card style={{
                                borderRadius: '28px',
                                border: 'none',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)',
                                backdropFilter: 'blur(12px)',
                                marginBottom: '24px',
                                overflow: 'hidden',
                                width: '100%',
                                boxShadow: '0 20px 35px -12px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.02)',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 24px 40px -16px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 20px 35px -12px rgba(0,0,0,0.08)';
                                }}>

                                {/* Header with gradient accent */}
                                <div style={{
                                    padding: '20px 28px',
                                    background: 'linear-gradient(135deg, #FAFAFF 0%, #FFFFFF 100%)',
                                    borderBottom: '1px solid rgba(255,145,0,0.15)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    {/* Decorative accent bar */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '3px',
                                        background: 'linear-gradient(90deg, #ff9100, #ffb347, #ffcc80)'
                                    }} />

                                    <h6 style={{
                                        margin: 0,
                                        fontSize: '12px',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        letterSpacing: '1.2px',
                                        background: 'linear-gradient(135deg, #ff9100, #ff6b35)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <div style={{
                                            background: 'linear-gradient(135deg, rgba(255,145,0,0.12), rgba(255,107,53,0.08))',
                                            padding: '6px',
                                            borderRadius: '12px',
                                            display: 'inline-flex'
                                        }}>
                                            <FeatherIcon icon="grid" size={14} color="#ff9100" strokeWidth={2.5} />
                                        </div>
                                        Account Details
                                    </h6>
                                </div>

                                {/* Content */}
                                <div style={{ padding: '32px 28px' }}>
                                    {/* Name row */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '24px',
                                        marginBottom: '28px',
                                        alignItems: 'flex-start'
                                    }}>
                                        {[
                                            { label: 'First Name', value: userData.emp_firstname, icon: 'user' },
                                            { label: 'Last Name', value: userData.emp_lastname, icon: 'user-check' }
                                        ].map((field, idx) => (
                                            <div key={idx} style={{ flex: 1 }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    marginBottom: '8px'
                                                }}>
                                                    <FeatherIcon icon={field.icon} size={12} color="#ff9100" />
                                                    <div style={{
                                                        fontSize: '10px',
                                                        color: '#94A3B8',
                                                        textTransform: 'uppercase',
                                                        fontWeight: 700,
                                                        letterSpacing: '0.8px'
                                                    }}>
                                                        {field.label}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    fontSize: '16px',
                                                    fontWeight: 600,
                                                    color: '#0F172A',
                                                    padding: '10px 0 8px',
                                                    borderBottom: '2px solid #F1F5F9',
                                                    transition: 'border-color 0.2s ease',
                                                    cursor: 'default'
                                                }}
                                                    onMouseEnter={(e) => e.currentTarget.style.borderBottomColor = '#ff9100'}
                                                    onMouseLeave={(e) => e.currentTarget.style.borderBottomColor = '#F1F5F9'}>
                                                    {field.value || '—'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Email field */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '8px'
                                        }}>
                                            <div style={{
                                                background: 'linear-gradient(135deg, rgba(255,145,0,0.1), rgba(255,107,53,0.05))',
                                                padding: '6px',
                                                borderRadius: '10px',
                                                display: 'inline-flex'
                                            }}>
                                                <FeatherIcon icon="mail" size={13} color="#ff9100" />
                                            </div>
                                            <div style={{
                                                fontSize: '10px',
                                                color: '#94A3B8',
                                                textTransform: 'uppercase',
                                                fontWeight: 700,
                                                letterSpacing: '0.8px'
                                            }}>
                                                Email Address
                                            </div>
                                        </div>
                                        <div style={{
                                            fontSize: '15px',
                                            fontWeight: 500,
                                            color: '#1E293B',
                                            padding: '8px 12px',
                                            background: '#F8FAFE',
                                            borderRadius: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            border: '1px solid #F1F5F9'
                                        }}>
                                            {userData.emp_email || 'Not provided'}
                                        </div>
                                    </div>

                                    {/* Username field */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '8px'
                                        }}>
                                            <FeatherIcon icon="at-sign" size={13} color="#ff9100" />
                                            <div style={{
                                                fontSize: '10px',
                                                color: '#94A3B8',
                                                textTransform: 'uppercase',
                                                fontWeight: 700,
                                                letterSpacing: '0.8px'
                                            }}>
                                                Username
                                            </div>
                                        </div>
                                        <div style={{
                                            fontSize: '15px',
                                            fontWeight: 600,
                                            color: '#0F172A',
                                            padding: '8px 12px',
                                            background: '#F8FAFE',
                                            borderRadius: '14px',
                                            fontFamily: 'monospace',
                                            letterSpacing: '0.3px',
                                            border: '1px solid #F1F5F9'
                                        }}>
                                            @{userData.user_name}
                                        </div>
                                    </div>

                                    {/* Two column layout for Position & Location */}
                                    <div style={{ display: 'flex', gap: '20px', marginTop: '4px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '8px'
                                            }}>
                                                <FeatherIcon icon="briefcase" size={13} color="#ff9100" />
                                                <div style={{
                                                    fontSize: '10px',
                                                    color: '#94A3B8',
                                                    textTransform: 'uppercase',
                                                    fontWeight: 700,
                                                    letterSpacing: '0.8px'
                                                }}>
                                                    Position Level
                                                </div>
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                color: '#0F172A',
                                                padding: '8px 12px',
                                                background: 'linear-gradient(135deg, #FFF9F0, #FFFFFF)',
                                                borderRadius: '14px',
                                                border: '1px solid rgba(255,145,0,0.2)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <div style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: '#ff9100',
                                                    boxShadow: '0 0 0 3px rgba(255,145,0,0.2)'
                                                }} />
                                                {getPositionLabel(userData.emp_position)}
                                            </div>
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '8px'
                                            }}>
                                                <FeatherIcon icon="map-pin" size={13} color="#ff9100" />
                                                <div style={{
                                                    fontSize: '10px',
                                                    color: '#94A3B8',
                                                    textTransform: 'uppercase',
                                                    fontWeight: 700,
                                                    letterSpacing: '0.8px'
                                                }}>
                                                    Assigned Location
                                                </div>
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                color: '#0F172A',
                                                padding: '8px 12px',
                                                background: '#F8FAFE',
                                                borderRadius: '14px',
                                                border: '1px solid #F1F5F9',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <FeatherIcon icon="layers" size={13} color="#94A3B8" />
                                                {getDepartmentFormat(userData.emp_department)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </>
                ) : (
                    <Card style={{ borderRadius: '20px', border: 'none', background: 'rgba(255,255,255,0.96)', textAlign: 'center', padding: '48px' }}>
                        <FeatherIcon icon="user-x" size={48} style={{ color: '#94A3B8', marginBottom: '16px' }} />
                        <h3 style={{ color: '#475569', marginBottom: '8px', fontSize: '18px', fontWeight: 500 }}>User Not Found</h3>
                        <p style={{ color: '#94A3B8', marginBottom: 0, fontSize: '14px' }}>The requested user profile does not exist.</p>
                    </Card>
                )}
            </div>
        </div>
    );
}