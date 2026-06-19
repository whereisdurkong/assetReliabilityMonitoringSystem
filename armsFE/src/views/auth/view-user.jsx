import axios from 'axios';
import config from 'config';
import { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Badge, Form, Modal } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import Loading from '../../components/personalComponents/loading';
import AlertModal from '../../components/personalComponents/alertModal';

export default function ViewUser() {
    const navigate = useNavigate();
    const id_master = new URLSearchParams(window.location.search).get('id');
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [isDeactivating, setIsDeactivating] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        type: 'success',
        title: '',
        description: ''
    });
    const [profileImage, setProfileImage] = useState(null);
    // Form state for editing
    const [formData, setFormData] = useState({
        emp_firstname: '',
        emp_lastname: '',
        user_name: '',
        emp_position: '',
        emp_department: '',
        pass_word: '',
        emp_role: '',
        emp_email: '',
        avatar: ''
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
                // Initialize form data with user data
                setFormData({
                    emp_firstname: data.emp_firstname || '',
                    emp_lastname: data.emp_lastname || '',
                    user_name: data.user_name || '',
                    emp_position: data.emp_position || '',
                    emp_department: data.emp_department || '',
                    pass_word: '',
                    emp_role: data.emp_role || '',
                    emp_email: data.emp_email || '',
                    avatar: data.avatar || '' // Add this
                });

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

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        // Reset form data to original user data
        setFormData({
            emp_firstname: userData.emp_firstname || '',
            emp_lastname: userData.emp_lastname || '',
            user_name: userData.user_name || '',
            emp_position: userData.emp_position || '',
            emp_department: userData.emp_department || '',
            pass_word: '',
            emp_role: userData.emp_role || '',
            emp_email: userData.emp_email || ''
        });
        setIsEditing(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.emp_firstname.trim()) {
            showAlertMessage('warning', 'Missing Information', 'Please enter first name');
            return false;
        }
        if (!formData.emp_lastname.trim()) {
            showAlertMessage('warning', 'Missing Information', 'Please enter last name');
            return false;
        }
        if (!formData.user_name.trim()) {
            showAlertMessage('warning', 'Missing Information', 'Please enter username');
            return false;
        }
        if (!formData.emp_email.trim()) {
            showAlertMessage('warning', 'Missing Information', 'Please enter email address');
            return false;
        }
        if (!formData.emp_role) {
            showAlertMessage('warning', 'Missing Information', 'Please select a role');
            return false;
        }
        if (!formData.emp_position) {
            showAlertMessage('warning', 'Missing Information', 'Please select a position');
            return false;
        }
        if (!formData.emp_department) {
            showAlertMessage('warning', 'Missing Information', 'Please select a department');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.emp_email)) {
            showAlertMessage('error', 'Invalid Email', 'Please enter a valid email address');
            return false;
        }

        if (formData.user_name.length < 3) {
            showAlertMessage('error', 'Invalid Username', 'Username must be at least 3 characters long');
            return false;
        }

        return true;
    };

    const checkForDuplicates = async () => {
        try {
            const res = await axios.get(`${config.baseApi}/authentication/get-all-users`);
            const data = res.data || [];

            // Check for duplicate username (excluding current user)
            const duplicateUsername = data.some(
                user => user.user_name?.toLowerCase() === formData.user_name.toLowerCase() &&
                    user.id_master !== parseInt(id_master)
            );

            if (duplicateUsername) {
                showAlertMessage('error', 'Duplicate Username', 'This username is already taken. Please choose a different username.');
                return true; // indicates duplicate found
            }

            // Check for duplicate email (excluding current user)
            const duplicateEmail = data.some(
                user => user.emp_email?.toLowerCase() === formData.emp_email.toLowerCase() &&
                    user.id_master !== parseInt(id_master)
            );

            if (duplicateEmail) {
                showAlertMessage('error', 'Duplicate Email', 'This email address is already registered. Please use a different email address.');
                return true; // indicates duplicate found
            }

            return false; // no duplicates found
        } catch (err) {
            console.error('Unable to fetch all users: ', err);
            showAlertMessage('error', 'Validation Error', 'Unable to verify user credentials. Please try again.');
            return true; // treat as duplicate found to prevent save
        }
    };

    // Update your handleSaveChanges function:
    const handleSaveChanges = async () => {
        if (!validateForm()) {
            return;
        }

        // Check for duplicates before saving
        const hasDuplicates = await checkForDuplicates();
        if (hasDuplicates) {
            return;
        }

        setIsSaving(true);

        try {
            console.log({
                id_master: id_master,
                emp_firstname: formData.emp_firstname,
                emp_lastname: formData.emp_lastname,
                user_name: formData.user_name,
                emp_email: formData.emp_email,
                emp_role: formData.emp_role,
                emp_position: formData.emp_position,
                emp_department: formData.emp_department,
                updated_by: currentUser
            })

            // Prepare update data
            const updateData = {
                id_master: id_master,
                emp_firstname: formData.emp_firstname,
                emp_lastname: formData.emp_lastname,
                user_name: formData.user_name,
                emp_email: formData.emp_email,
                emp_department: formData.emp_department,
                emp_role: formData.emp_role,
                emp_position: formData.emp_position,
                updated_by: currentUser
            };

            await axios.post(`${config.baseApi}/authentication/update-user`, updateData);

            // Update local user data
            const updatedUserData = {
                ...userData,
                emp_firstname: formData.emp_firstname,
                emp_lastname: formData.emp_lastname,
                user_name: formData.user_name,
                emp_email: formData.emp_email,
                emp_role: formData.emp_role,
                emp_position: formData.emp_position,
                emp_department: formData.emp_department
            };
            setUserData(updatedUserData);

            showAlertMessage('success', 'Update Successful', 'User profile has been updated successfully.');
            setIsEditing(false);
        } catch (err) {
            console.error('Unable to update user: ', err);
            showAlertMessage('error', 'Update Failed', err.response?.data?.message || 'Failed to update user profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetPassword = async () => {
        setIsResetting(true);
        try {
            // Call your reset password API here
            await axios.post(`${config.baseApi}/authentication/reset-password`, {
                id_master: id_master,
                user_name: userData.user_name,
                updated_by: currentUser
            });

            showAlertMessage('success', 'Password Reset Successful', `Password has been reset for ${userData.emp_firstname} ${userData.emp_lastname}. The user will need to set a new password on their next login.`);
            setShowResetModal(false);
        } catch (err) {
            console.error('Unable to reset password: ', err);
            showAlertMessage('error', 'Reset Failed', err.response?.data?.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsResetting(false);
            setTimeout(() => {
                window.location.reload()
            }, 2000);
        }
    };

    const handleDeactivateAccount = async () => {
        setIsDeactivating(true);
        try {
            // Call your deactivate account API here
            await axios.post(`${config.baseApi}/authentication/deactivate-user`, {
                id_master: id_master,
                user_name: userData.user_name,
                updated_by: currentUser
            });

            showAlertMessage('success', 'Account Deleted', `${userData.emp_firstname} ${userData.emp_lastname}'s account has been deleted successfully.`);
            setShowDeactivateModal(false);

            // Navigate back to dashboard after deactivation
            setTimeout(() => {
                navigate('/dashboard'); // Adjust the path as needed
            }, 2000);
        } catch (err) {
            console.error('Unable to deactivate account: ', err);
            showAlertMessage('error', 'Deactivation Failed', err.response?.data?.message || 'Failed to delete account. Please try again.');
        } finally {
            setIsDeactivating(false);
        }
    };

    const getRoleBadgeVariant = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return { bg: 'linear-gradient(45deg, rgb(160, 144, 95), #7a810e)', label: 'Administrator' };
            case 'user':
                return { bg: 'linear-gradient(45deg, rgb(95, 118, 160), #0e4081)', label: 'Standard User' };
            default:
                return { bg: '#6B7280', label: role || 'User' };
        }
    };

    const getPositionLabel = (position) => {
        switch (position) {
            case 'l1':
                return 'Level 1 - Associate';
            case 'l2':
                return 'Level 2 - Specialist';
            case 'l3':
                return 'Level 3 - Manager';
            default:
                return position || 'Not Assigned';
        }
    };

    if (isLoading) {
        return <Loading show={true} />;
    }

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

            {/* Reset Password Confirmation Modal */}
            <Modal
                show={showResetModal}
                onHide={() => !isResetting && setShowResetModal(false)}
                centered
                backdrop="static"
                keyboard={!isResetting}
            >
                <Modal.Header closeButton={!isResetting} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <Modal.Title style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FeatherIcon icon="alert-circle" size={20} style={{ color: '#F59E0B' }} />
                        Reset Password Confirmation
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: '#FEF3C7',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px auto'
                        }}>
                            <FeatherIcon icon="lock" size={32} style={{ color: '#D97706' }} />
                        </div>
                        <h5 style={{ fontWeight: 600, marginBottom: '12px', color: '#1F2937' }}>
                            Are you sure you want to reset the password?
                        </h5>
                        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                            This action will reset the password for:
                        </p>
                        <p style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#111827',
                            background: '#F3F4F6',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            display: 'inline-block',
                            marginBottom: '16px'
                        }}>
                            {userData?.emp_firstname} {userData?.emp_lastname} ({userData?.user_name})
                        </p>
                        <div style={{
                            background: '#FEF2F2',
                            border: '1px solid #FEE2E2',
                            borderRadius: '8px',
                            padding: '12px',
                            marginTop: '16px'
                        }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                <FeatherIcon icon="info" size={16} style={{ color: '#DC2626', marginTop: '2px' }} />
                                <div style={{ fontSize: '12px', color: '#991B1B', textAlign: 'left' }}>
                                    <strong>Important:</strong> The user will receive a password reset email and can use the default password. Their current password will be invalidated immediately.
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: '1px solid #E2E8F0', padding: '16px 24px' }}>
                    <Button
                        variant="secondary"
                        onClick={() => setShowResetModal(false)}
                        disabled={isResetting}
                        style={{
                            borderRadius: '8px',
                            padding: '8px 20px',
                            fontSize: '14px',
                            fontWeight: 500
                        }}
                    >
                        No, Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleResetPassword}
                        disabled={isResetting}
                        style={{
                            borderRadius: '8px',
                            padding: '8px 20px',
                            fontSize: '14px',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#DC2626',
                            border: 'none'
                        }}
                    >
                        {isResetting ? (
                            <>
                                <div className="spinner-border spinner-border-sm" role="status" style={{ width: '14px', height: '14px' }}>
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                Resetting...
                            </>
                        ) : (
                            <>
                                <FeatherIcon icon="check-circle" size={14} />
                                Yes, Reset Password
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Deactivate Account Confirmation Modal */}
            <Modal
                show={showDeactivateModal}
                onHide={() => !isDeactivating && setShowDeactivateModal(false)}
                centered
                backdrop="static"
                keyboard={!isDeactivating}
            >
                <Modal.Header closeButton={!isDeactivating} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <Modal.Title style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FeatherIcon icon="trash" size={20} style={{ color: '#DC2626' }} />
                        Delete Account Confirmation
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: '#FEE2E2',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px auto'
                        }}>
                            <FeatherIcon icon="user-x" size={32} style={{ color: '#DC2626' }} />
                        </div>
                        <h5 style={{ fontWeight: 600, marginBottom: '12px', color: '#1F2937' }}>
                            Are you sure you want to delete this account?
                        </h5>
                        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                            This action will delete the account for:
                        </p>
                        <p style={{
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#111827',
                            background: '#F3F4F6',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            display: 'inline-block',
                            marginBottom: '16px'
                        }}>
                            {userData?.emp_firstname} {userData?.emp_lastname} ({userData?.user_name})
                        </p>
                        <div style={{
                            background: '#FEF2F2',
                            border: '1px solid #FEE2E2',
                            borderRadius: '8px',
                            padding: '12px',
                            marginTop: '16px'
                        }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                <FeatherIcon icon="info" size={16} style={{ color: '#DC2626', marginTop: '2px' }} />
                                <div style={{ fontSize: '12px', color: '#991B1B', textAlign: 'left' }}>
                                    <strong>Warning:</strong> This action will:
                                    <ul style={{ marginTop: '8px', marginBottom: '0', paddingLeft: '20px' }}>

                                        <li>Prevent the user from logging in</li>

                                        <li>This action can be reversed by an administrator</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: '1px solid #E2E8F0', padding: '16px 24px' }}>
                    <Button
                        variant="secondary"
                        onClick={() => setShowDeactivateModal(false)}
                        disabled={isDeactivating}
                        style={{
                            borderRadius: '8px',
                            padding: '8px 20px',
                            fontSize: '14px',
                            fontWeight: 500
                        }}
                    >
                        No, Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDeactivateAccount}
                        disabled={isDeactivating}
                        style={{
                            borderRadius: '8px',
                            padding: '8px 20px',
                            fontSize: '14px',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#DC2626',
                            border: 'none'
                        }}
                    >
                        {isDeactivating ? (
                            <>
                                <div className="spinner-border spinner-border-sm" role="status" style={{ width: '14px', height: '14px' }}>
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                Deactivating...
                            </>
                        ) : (
                            <>
                                <FeatherIcon icon="check-circle" size={14} />
                                Yes, Delete Account
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

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
            <div style={{
                position: 'absolute', width: '200px', height: '200px', borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.02)', bottom: '20%', right: '15%',
                animation: 'float 22s infinite ease-in-out', zIndex: 1
            }} />

            <style>
                {`
                    @keyframes float {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(50px, -50px) rotate(120deg); }
                        66% { transform: translate(-30px, 30px) rotate(240deg); }
                    }
                    @keyframes shimmer {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                    }
                `}
            </style>

            <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
                {/* Header Bar - Redesigned */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '32px',
                    padding: '0 4px'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '2.8rem',
                            fontWeight: '700',
                            color: '#EAB56F',
                            marginBottom: '8px',
                            letterSpacing: '-0.5px',
                            textShadow: '0 4px 20px rgba(234, 181, 111, 0.2)'
                        }}>
                            User Details
                        </h1>
                        <p style={{
                            fontSize: '1rem',
                            color: 'rgba(255,255,255,0.7)',
                            margin: 0
                        }}>
                            Manage users credentials
                        </p>
                    </div>

                    {!isEditing ? (
                        <Button
                            onClick={handleEditClick}
                            style={{
                                background: 'linear-gradient(45deg, #EAB56F, #F9982F, #E37239)',
                                border: 'none',
                                borderRadius: '16px',
                                padding: '18px 36px',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                letterSpacing: '0.5px',
                                color: '#fff',
                                cursor: 'pointer',
                                minWidth: '200px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 10px 20px rgba(227, 114, 57, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'scale(1.02)';
                                e.target.style.boxShadow = '0 15px 35px -10px #E37239';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'scale(1)';
                                e.target.style.boxShadow = '0 10px 30px -10px #E37239';
                            }}
                        >
                            <FeatherIcon icon="edit-2" size={14} />
                            Edit Profile
                        </Button>
                    ) : (
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <Button
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                                style={{
                                    background: 'linear-gradient(45deg, #ea6f6f, #e44343, #e33939)',
                                    border: 'none',
                                    borderRadius: '16px',
                                    padding: '18px 36px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    letterSpacing: '0.5px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    minWidth: '200px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 10px 20px rgba(227, 57, 57, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'scale(1.02)';
                                    e.target.style.boxShadow = '0 15px 35px -10px #ff0000';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                    e.target.style.boxShadow = '0 10px 30px -10px #ff0000';
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveChanges}
                                disabled={isSaving}
                                style={{
                                    background: 'linear-gradient(45deg, #55c067, #4aa53e, #2a7e22)',
                                    border: 'none',
                                    borderRadius: '16px',
                                    padding: '18px 36px',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    letterSpacing: '0.5px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    minWidth: '200px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 10px 20px rgba(57, 227, 71, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'scale(1.02)';
                                    e.target.style.boxShadow = '0 15px 35px -10px #39e363';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                    e.target.style.boxShadow = '0 10px 30px -10px #39e339';
                                }}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="spinner-border spinner-border-sm" role="status" style={{ width: '14px', height: '14px' }}>
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FeatherIcon icon="save" size={14} />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>

                {error ? (
                    <Card style={{
                        borderRadius: '20px',
                        border: 'none',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 20px 35px -10px rgba(0, 0, 0, 0.2)'
                    }}>
                        <Card.Body style={{ padding: '48px', textAlign: 'center' }}>
                            <FeatherIcon icon="alert-circle" size={48} style={{ color: '#DC2626', marginBottom: '16px' }} />
                            <h3 style={{ color: '#991B1B', marginBottom: '8px', fontSize: '18px', fontWeight: 600 }}>Error Loading Data</h3>
                            <p style={{ color: '#7F1D1D', marginBottom: '24px' }}>{error}</p>
                            <Button onClick={() => navigate(-1)} variant="secondary">Return</Button>
                        </Card.Body>
                    </Card>
                ) : userData ? (
                    <>
                        {/* Hero Profile Section - Redesigned */}
                        <Card style={{
                            borderRadius: '24px',
                            border: 'none',
                            backdropFilter: 'blur(10px)',
                            marginBottom: '22px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 40px -12px rgba(0, 0, 0, 0.25)',
                            width: '100%'
                        }}>
                            <div style={{
                                background: 'linear-gradient(45deg, #EAB56F, #F9982F, #E37239)',
                                padding: '32px 32px 24px 32px',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                        <div style={{
                                            width: '88px',
                                            height: '88px',
                                            background: 'white',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '2px solid #ffc933',
                                            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                                            overflow: 'hidden' // Add this to clip the image to circle
                                        }}>
                                            {userData?.avatar ? (
                                                <img
                                                    src={profileImage}
                                                    alt="Profile"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ) : (
                                                <FeatherIcon icon="user" size={44} style={{ color: '#ff8800' }} />
                                            )}
                                        </div>
                                        <div>
                                            {!isEditing ? (
                                                <>
                                                    <h1 style={{
                                                        margin: 0,
                                                        fontSize: '28px',
                                                        fontWeight: 700,
                                                        color: 'white',
                                                        marginBottom: '8px',
                                                        letterSpacing: '-0.3px'
                                                    }}>
                                                        {userData.emp_firstname} {userData.emp_lastname}
                                                    </h1>
                                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                        <h6 style={{
                                                            fontSize: '13px',
                                                            color: '#ffffff',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            fontWeight: 500,
                                                        }}>
                                                            <FeatherIcon icon="hash" size={12} />
                                                            ID: {userData.id_master}
                                                        </h6>
                                                        <h6 style={{
                                                            fontSize: '13px',
                                                            fontWeight: 500,
                                                            color: '#ffffff',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}>
                                                            <FeatherIcon icon="calendar" size={12} />
                                                            Joined {userData.created_at ? new Date(userData.created_at).toLocaleDateString() : 'Recently'}
                                                        </h6>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
                                                        <h1 style={{
                                                            margin: 0,
                                                            fontSize: '28px',
                                                            fontWeight: 700,
                                                            color: 'white',
                                                            marginBottom: '8px',
                                                            letterSpacing: '-0.3px'
                                                        }}>
                                                            {userData.emp_firstname} {userData.emp_lastname}
                                                        </h1>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                                                        <h6 style={{
                                                            fontSize: '13px',
                                                            color: '#ffffff',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            fontWeight: 500,
                                                        }}>
                                                            <FeatherIcon icon="hash" size={12} />
                                                            ID: {userData.id_master}
                                                        </h6>
                                                        <h6 style={{
                                                            fontSize: '13px',
                                                            fontWeight: 500,
                                                            color: '#ffffff',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}>
                                                            <FeatherIcon icon="calendar" size={12} />
                                                            Joined {userData.created_at ? new Date(userData.created_at).toLocaleDateString() : 'Recently'}
                                                        </h6>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {!isEditing ? (
                                            <>
                                                <span style={{
                                                    background: roleInfo.bg,
                                                    color: 'white',
                                                    padding: '8px 16px',
                                                    borderRadius: '40px',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    letterSpacing: '0.3px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    <FeatherIcon icon="shield" size={12} />
                                                    {roleInfo.label}
                                                </span>
                                                <span style={{
                                                    background: '#569b41',
                                                    color: '#E2E8F0',
                                                    padding: '8px 16px',
                                                    borderRadius: '40px',
                                                    fontSize: '12px',
                                                    fontWeight: 600,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}>
                                                    <FeatherIcon icon="trending-up" size={12} />
                                                    {getPositionLabel(userData.emp_position)}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <div style={{ marginBottom: '8px' }}>
                                                    <label style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px', display: 'block', color: '#fff' }}>
                                                        Role
                                                    </label>
                                                    <Form.Select
                                                        name="emp_role"
                                                        value={formData.emp_role}
                                                        onChange={handleInputChange}
                                                        style={{
                                                            background: 'white',
                                                            border: '2px solid #E2E8F0',
                                                            borderRadius: '40px',
                                                            padding: '8px 16px',
                                                            fontSize: '12px',
                                                            fontWeight: 600,
                                                            width: '100%',
                                                            minWidth: '200px'
                                                        }}
                                                        onFocus={(e) => e.target.style.borderColor = '#ca7300'}
                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                        <option value="mis_admin">MIS - Admin</option>
                                                    </Form.Select>
                                                </div>

                                                <div style={{ marginBottom: '8px' }}>
                                                    <label style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px', display: 'block', color: '#fff' }}>
                                                        Position
                                                    </label>
                                                    <Form.Select
                                                        name="emp_position"
                                                        value={formData.emp_position}
                                                        onChange={handleInputChange}
                                                        style={{
                                                            background: 'white',
                                                            border: '2px solid #E2E8F0',
                                                            borderRadius: '40px',
                                                            padding: '8px 16px',
                                                            fontSize: '12px',
                                                            fontWeight: 600,
                                                            width: '100%',
                                                            minWidth: '200px'
                                                        }}
                                                        onFocus={(e) => e.target.style.borderColor = '#ca7300'}
                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                                    >
                                                        <option value="l1">Level 1</option>
                                                        <option value="l2">Level 2</option>
                                                        <option value="l3">Level 3</option>
                                                    </Form.Select>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Main Content - Using consistent width */}
                        <div style={{ width: '100%' }}>
                            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                {/* Main Content - Using consistent width */}
                                <div style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                                        {/* Left Column - Detailed Information */}
                                        <div style={{ flex: '1', minWidth: '300px', display: 'flex' }}>
                                            <Card style={{
                                                borderRadius: '20px',
                                                border: 'none',
                                                background: 'rgba(255, 255, 255, 0.96)',
                                                backdropFilter: 'blur(10px)',
                                                marginBottom: '24px',
                                                overflow: 'hidden',
                                                width: '100%',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}>
                                                <div style={{
                                                    padding: '20px 24px',
                                                    borderBottom: '1px solid #F1F5F9',
                                                    background: '#FAFAFA'
                                                }}>
                                                    <h6 style={{
                                                        margin: 0,
                                                        fontSize: '13px',
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.8px',
                                                        color: '#64748B',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px'
                                                    }}>
                                                        <FeatherIcon icon="grid" size={14} color={'#ff9100'} />
                                                        Account Details
                                                        {isEditing && <Badge bg="warning" style={{ fontSize: '10px', marginLeft: '8px' }}>Editing Mode</Badge>}
                                                    </h6>
                                                </div>
                                                <div style={{ padding: '28px', flex: 1 }}>
                                                    {!isEditing ? (
                                                        <>
                                                            <div style={{
                                                                display: 'flex',
                                                                gap: '24px',
                                                                marginBottom: '15px',
                                                                alignItems: 'flex-start'
                                                            }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>
                                                                        First Name
                                                                    </div>
                                                                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', padding: '1px 0', borderBottom: '1px solid #F1F5F9' }}>
                                                                        {userData.emp_firstname}
                                                                    </div>
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>
                                                                        Last Name
                                                                    </div>
                                                                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', padding: '1px 0', borderBottom: '1px solid #F1F5F9' }}>
                                                                        {userData.emp_lastname}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{ marginBottom: '15px' }}>
                                                                <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</div>
                                                                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', padding: '5px 0', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <FeatherIcon icon="mail" size={14} style={{ color: '#ff9100' }} />
                                                                    {userData.emp_email || 'Not provided'}
                                                                </div>
                                                            </div>
                                                            <div style={{ marginBottom: '15px' }}>
                                                                <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Username</div>
                                                                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', padding: '5px 0', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <FeatherIcon icon="at-sign" size={14} style={{ color: '#ff9100' }} />
                                                                    {userData.user_name}
                                                                </div>
                                                            </div>

                                                            <div style={{ marginBottom: '15px' }}>
                                                                <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Position Level</div>
                                                                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', padding: '5px 0', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <FeatherIcon icon="layers" size={14} style={{ color: '#ff9100' }} />
                                                                    {getPositionLabel(userData.emp_position)}
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>Department</div>
                                                                <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', padding: '5px 0', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <FeatherIcon icon="layers" size={14} style={{ color: '#ff9100' }} />
                                                                    {getDepartmentFormat(userData.emp_department)}
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div style={{ marginBottom: '20px' }}>
                                                                <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>First Name</div>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="emp_firstname"
                                                                    value={formData.emp_firstname}
                                                                    onChange={handleInputChange}
                                                                    style={{
                                                                        border: '2px solid #E2E8F0',
                                                                        borderRadius: '12px',
                                                                        padding: '10px 14px',
                                                                        fontSize: '14px'
                                                                    }}
                                                                    onFocus={(e) => e.target.style.borderColor = '#E37239'}
                                                                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                                                />
                                                            </div>
                                                            <div style={{ marginBottom: '20px' }}>
                                                                <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>Last Name</div>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="emp_lastname"
                                                                    value={formData.emp_lastname}
                                                                    onChange={handleInputChange}
                                                                    style={{
                                                                        border: '2px solid #E2E8F0',
                                                                        borderRadius: '12px',
                                                                        padding: '10px 14px',
                                                                        fontSize: '14px'
                                                                    }}
                                                                    onFocus={(e) => e.target.style.borderColor = '#E37239'}
                                                                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                                                />
                                                            </div>
                                                            <div style={{ marginBottom: '20px' }}>
                                                                <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</div>
                                                                <Form.Control
                                                                    type="email"
                                                                    name="emp_email"
                                                                    value={formData.emp_email}
                                                                    onChange={handleInputChange}
                                                                    style={{
                                                                        border: '2px solid #E2E8F0',
                                                                        borderRadius: '12px',
                                                                        padding: '10px 14px',
                                                                        fontSize: '14px'
                                                                    }}
                                                                    onFocus={(e) => e.target.style.borderColor = '#E37239'}
                                                                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                                                />
                                                            </div>
                                                            <div style={{ marginBottom: '15px' }}>
                                                                <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>Username</div>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="user_name"
                                                                    value={formData.user_name}
                                                                    onChange={handleInputChange}
                                                                    style={{
                                                                        border: '2px solid #E2E8F0',
                                                                        borderRadius: '12px',
                                                                        padding: '10px 14px',
                                                                        fontSize: '14px'
                                                                    }}
                                                                    onFocus={(e) => e.target.style.borderColor = '#E37239'}
                                                                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                                                />
                                                            </div>

                                                            <div style={{ marginBottom: '8px' }}>
                                                                <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>Department</div>

                                                                <Form.Select
                                                                    name="emp_department"
                                                                    value={formData.emp_department}
                                                                    onChange={handleInputChange}
                                                                    // style={{
                                                                    //     background: 'white',
                                                                    //     border: '2px solid #E2E8F0',
                                                                    //     borderRadius: '40px',
                                                                    //     padding: '8px 16px',
                                                                    //     fontSize: '12px',
                                                                    //     fontWeight: 600,
                                                                    //     width: '100%',
                                                                    //     minWidth: '200px'
                                                                    // }}
                                                                    style={{
                                                                        border: '2px solid #E2E8F0',
                                                                        borderRadius: '12px',
                                                                        padding: '10px 14px',
                                                                        fontSize: '14px'
                                                                    }}
                                                                    onFocus={(e) => e.target.style.borderColor = '#ca7300'}
                                                                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                                                >
                                                                    <option value="">Select Department</option>
                                                                    <option value="mme_mwso">MME & MWSO</option>
                                                                    <option value="mms">MMS</option>
                                                                    <option value="smed">SMED</option>
                                                                    <option value="assay">Assay</option>
                                                                </Form.Select>
                                                            </div>

                                                        </>
                                                    )}
                                                </div>
                                            </Card>
                                        </div>

                                        {/* Right Column - Stats & Actions */}
                                        <div style={{ flex: '0.6', minWidth: '280px', display: 'flex' }}>
                                            <Card style={{
                                                borderRadius: '20px',
                                                border: 'none',
                                                marginBottom: '24px',
                                                background: 'linear-gradient(135deg, #405372 0%, #293b64 100%)',
                                                color: 'white',
                                                overflow: 'hidden',
                                                boxShadow: '0 15px 30px -12px rgba(0, 0, 0, 0.3)',
                                                width: '100%',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}>
                                                <div style={{ padding: '28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ marginBottom: '24px' }}>
                                                            <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <FeatherIcon icon="activity" size={12} color={'#ff9100'} />
                                                                Account Status
                                                            </div>
                                                            <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', color: userData?.is_active ? '#7fdb8c' : '#ffa7a7', }}>
                                                                <div style={{
                                                                    width: '8px',
                                                                    height: '8px',
                                                                    borderRadius: '50%',

                                                                    background: userData?.is_active ? '#22C55E' : '#EF4444'
                                                                }} />
                                                                {userData?.is_active ? 'ACTIVE' : 'INACTIVE'}

                                                            </div>

                                                        </div>
                                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                                                            <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <FeatherIcon icon="zap" size={12} color={'#ff9100'} />
                                                                Quick Actions
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                <Button
                                                                    variant="link"
                                                                    onClick={() => setShowResetModal(true)}
                                                                    style={{
                                                                        color: 'white',
                                                                        textDecoration: 'none',
                                                                        padding: '10px 12px',
                                                                        fontSize: '13px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '10px',
                                                                        textAlign: 'left',
                                                                        background: 'rgba(255, 255, 255, 0.05)',
                                                                        borderRadius: '12px',
                                                                        transition: 'all 0.2s ease',
                                                                        width: '100%'
                                                                    }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                                                                >
                                                                    <FeatherIcon icon="key" size={14} />
                                                                    Reset Password
                                                                </Button>
                                                                <Button
                                                                    variant="link"
                                                                    onClick={() => setShowDeactivateModal(true)}
                                                                    style={{
                                                                        color: '#ffcfcf',
                                                                        textDecoration: 'none',
                                                                        padding: '10px 12px',
                                                                        fontSize: '13px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '10px',
                                                                        textAlign: 'left',
                                                                        background: 'rgba(255, 0, 0, 0.15)',
                                                                        borderRadius: '12px',
                                                                        transition: 'all 0.2s ease',
                                                                        width: '100%'
                                                                    }}
                                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 0, 0, 0.35)'}
                                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 0, 0, 0.15)'}
                                                                >
                                                                    <FeatherIcon icon="trash" size={14} />
                                                                    Delete Account
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <Card style={{
                        borderRadius: '20px',
                        border: 'none',
                        background: 'rgba(255, 255, 255, 0.96)',
                        backdropFilter: 'blur(10px)',
                        textAlign: 'center',
                        padding: '48px',
                        width: '100%'
                    }}>
                        <FeatherIcon icon="user-x" size={48} style={{ color: '#94A3B8', marginBottom: '16px' }} />
                        <h3 style={{ color: '#475569', marginBottom: '8px', fontSize: '18px', fontWeight: 500 }}>User Not Found</h3>
                        <p style={{ color: '#94A3B8', marginBottom: 0, fontSize: '14px' }}>The requested user profile does not exist.</p>
                    </Card>
                )}
            </div>
        </div>
    );
}