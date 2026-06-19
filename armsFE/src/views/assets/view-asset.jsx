import { useEffect, useState, useRef } from 'react';
import { Form, Container, Row, Col, Button, Modal, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Loading from '../../components/personalComponents/loading';
import AlertModal from '../../components/personalComponents/alertModal';
import {
    FiSave, FiPlus, FiEdit2, FiInfo, FiTag, FiCalendar,
    FiActivity, FiUser, FiClock, FiTrendingUp, FiSettings,
    FiCpu, FiDatabase, FiZap, FiBox, FiX,
    FiMapPin,
    FiSliders,
    FiGrid,
    FiClipboard
} from 'react-icons/fi';
import { MdOutlineLocationOn, MdCategory, MdInventory } from 'react-icons/md';

import axios from 'axios';
import config from 'config';
import FeatherIcon from 'feather-icons-react';
import { color } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function ViewAsset() {
    const navigate = useNavigate();
    const asset_id = new URLSearchParams(window.location.search).get('id');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        assetName: '',
        assetType: '',
        location: '',
        assignedLocation: '',
        category: '',
        commissioningDate: '',
        trivector: '',
        notes: '',
        isActive: '1',
        created_by: '',
        created_at: ''
    });

    const originalData = useRef(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        type: 'success',
        title: '',
        description: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [locationOptions, setLocationOptions] = useState([]);
    const [assignedLocationOptions, setAssignedLocationOptions] = useState([]);
    const [assetTypeOptions, setAssetTypeOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [componentTypeOptions, setComponentTypeOptions] = useState([]);
    const [masterData, setMasterData] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [userDepartments, setUserDepartments] = useState([]); // Add state for user departments
    const [createdByAvatar, setCreatedByAvatar] = useState(null);
    const [createdByAvatarComp, setCreatedByAvatarComp] = useState(null);


    // Add state for bounce animation
    const [shouldBounce, setShouldBounce] = useState(false);

    const trivectorOptions = [
        { label: 'Rotating Machine', value: 'rotating-machine' },
        { label: 'Stationary Engine', value: 'stationary-engine' },
        { label: 'Mobile Engine', value: 'mobile-engine' }
    ];

    const [components, setComponents] = useState([]);
    const [showComponentModal, setShowComponentModal] = useState(false);
    const [editingComponent, setEditingComponent] = useState(null);
    const [componentFormData, setComponentFormData] = useState({
        componentName: '',
        componentType: ''
    });

    // Add useEffect for bounce animation
    useEffect(() => {
        const interval = setInterval(() => {
            setShouldBounce(true);
            setTimeout(() => {
                setShouldBounce(false);
            }, 500);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // Fetch location options from master data
    useEffect(() => {
        const fetchLocationOptions = async () => {
            try {
                const res = await axios.get(`${config.baseApi}/assetsAnalysis/get-all-options-master`);
                const data = res.data || [];
                setMasterData(data);
                const allLocations = [];

                data.forEach(item => {
                    if (item.option_asset_location) {
                        const values = item.option_asset_location.split(',');
                        values.forEach(value => {
                            const trimmedValue = value.trim();
                            if (trimmedValue && !allLocations.includes(trimmedValue)) {
                                allLocations.push(trimmedValue);
                            }
                        });
                    }
                });


                // Fetch avatar of the user who created this asset


                setLocationOptions(allLocations);
            } catch (error) {
                console.error('Error fetching location options:', error);
            }
        };
        fetchLocationOptions();
    }, []);

    // Fetch assigned location options from users' departments
    useEffect(() => {
        const fetchAssignedLocationOptions = async () => {
            try {
                const res = await axios.get(`${config.baseApi}/authentication/get-all-users`);

                if (Array.isArray(res.data)) {
                    const departments = [...new Set(res.data.map(user => user.emp_department))];
                    console.log('Unique emp_departments:', departments);
                    setUserDepartments(departments);

                    // Create assigned location options from departments with proper formatting
                    const locationOptionsFromDepts = departments.map(dept => ({
                        value: dept,
                        label: formatDepartmentName(dept)
                    }));
                    setAssignedLocationOptions(locationOptionsFromDepts);
                }
            } catch (err) {
                console.log('Unable to fetch users for assigned locations: ', err);
                // Fallback options if API fails

            }
        };
        fetchAssignedLocationOptions();
    }, []);

    // Helper function to format department names
    const formatDepartmentName = (dept) => {
        if (dept === 'smed') return 'SMED';
        if (dept === 'mme_mwso') return 'MME & MWSO';
        if (dept === 'mms') return 'MMS';
        return dept.toUpperCase().replace(/_/g, ' & ');
    };

    useEffect(() => {
        if (!formData.location || masterData.length === 0) {
            setAssetTypeOptions([]);
            setCategoryOptions([]);
            setComponentTypeOptions([]);
            return;
        }

        const selectedLocationData = masterData.find(item => {
            if (item.option_asset_location) {
                const locations = item.option_asset_location.split(',').map(loc => loc.trim());
                return locations.includes(formData.location);
            }
            return false;
        });

        if (selectedLocationData) {
            if (selectedLocationData.option_asset_type) {
                const types = selectedLocationData.option_asset_type.split(',').map(type => type.trim());
                setAssetTypeOptions(types);
            } else {
                setAssetTypeOptions([]);
            }

            if (selectedLocationData.option_asset_category) {
                const categories = selectedLocationData.option_asset_category.split(',').map(cat => cat.trim());
                setCategoryOptions(categories);
            } else {
                setCategoryOptions([]);
            }

            if (selectedLocationData.option_component_types) {
                const compTypes = selectedLocationData.option_component_types.split('/').map(type => type.trim());
                setComponentTypeOptions(compTypes);
            } else {
                setComponentTypeOptions([]);
            }
        } else {
            setAssetTypeOptions([]);
            setCategoryOptions([]);
            setComponentTypeOptions([]);
        }
    }, [formData.location, masterData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const findChangedFields = (original, current) => {
        const changes = {};
        Object.keys(current).forEach(key => {
            if (key === 'created_at' || key === 'created_by') return;
            const originalValue = original[key]?.toString() || '';
            const currentValue = current[key]?.toString() || '';
            if (originalValue !== currentValue) {
                changes[key] = {
                    from: originalValue || '(empty)',
                    to: currentValue || '(empty)'
                };
            }
        });
        return changes;
    };

    const [userdepartment, setUserDepartment] = useState('');
    useEffect(() => {
        const fetch = async () => {
            try {
                const empInfo = JSON.parse(localStorage.getItem("user"));

                console.log('Fetched user info from localStorage:', empInfo);

                if (empInfo.emp_department == 'smed') {
                    setUserDepartment('SMED');
                } else if (empInfo.emp_department == 'mme_mwso') {
                    setUserDepartment('MME & MWSO');
                } else if (empInfo.emp_department == 'mms') {
                    setUserDepartment('MMS');
                }
            } catch (err) {
                console.log('Unable to fetch user info: ', err);
            }
        }
        fetch()
    }, [])

    useEffect(() => {
        const fetch = async () => {
            try {
                setIsLoading(true);

                const res = await axios.get(`${config.baseApi}/assets/get-asset-by-id`, {
                    params: { id: asset_id }
                });
                const data = res.data || [];
                const fetchedData = {
                    assetName: data.asset_name,
                    assetType: data.asset_type,
                    location: data.asset_location,
                    assignedLocation: data.assigned_location || '',
                    category: data.asset_category,
                    commissioningDate: data.date_commisioning,
                    trivector: data.trivector,
                    notes: data.asset_notes,
                    isActive: data.is_active || '1',
                    created_at: data.created_at,
                    created_by: data.created_by
                };
                setComponents(data.components || []);
                originalData.current = fetchedData;
                setFormData(fetchedData);
                setIsDataLoaded(true);

                const dompo = data.components || [];

                try {
                    const userRes = await axios.get(`${config.baseApi}/authentication/get-by-username`, {
                        params: { user_name: data.created_by }
                    });
                    const userData = userRes.data;
                    console.log('Fetched creator user data:', userData);
                    setCreatedByAvatar(userData.avatar || null);

                    // Fetch avatar for every component's created_by
                    const componentUserPromises = dompo
                        .filter(component => component.created_by) // skip empty values
                        .map(component =>
                            axios.get(`${config.baseApi}/authentication/get-by-username`, {
                                params: { user_name: component.created_by }
                            })
                        );

                    const componentUserResults = await Promise.allSettled(componentUserPromises);

                    const componentAvatars = componentUserResults.map((result, index) => {
                        if (result.status === 'fulfilled') {
                            return {
                                created_by: dompo[index].created_by,
                                avatar: result.value.data.avatar || null
                            };
                        }
                        return {
                            created_by: dompo[index].created_by,
                            avatar: null
                        };
                    });

                    console.log('Component creator avatars:', componentAvatars);
                    setCreatedByAvatarComp(componentAvatars); // add this state

                } catch (err) {
                    console.log('Could not fetch creator avatar:', err);
                }
            } catch (error) {
                console.error('Error fetching asset:', error);
                showAlertMessage('error', 'Error', 'Failed to load asset data');
                setIsDataLoaded(true);
            } finally {
                setIsLoading(false);
            }
        };
        if (asset_id) {
            fetch();
        }
    }, [asset_id, userdepartment]);

    const formatDisplayName = (value) => {
        if (!value) return '';
        return value
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const showAlertMessage = (type, title, description) => {
        setAlertConfig({ type, title, description });
        setShowAlert(true);
    };

    const toggleActiveStatus = () => {
        if (!isEditing) return;
        setFormData(prev => ({
            ...prev,
            isActive: prev.isActive === '1' ? '0' : '1'
        }));
    };

    const handleAddComponent = () => {
        setEditingComponent(null);
        setComponentFormData({
            componentName: '',
            componentType: ''
        });
        setShowComponentModal(true);
    };

    const handleEditComponent = (component) => {
        setEditingComponent(component);
        setComponentFormData({
            componentName: component.componentName,
            componentType: component.componentType
        });
        setShowComponentModal(true);
    };

    const handleSaveComponent = async () => {
        if (!componentFormData.componentName.trim()) {
            showAlertMessage('error', 'Validation Error', 'Component name is required');
            return;
        }
        if (!componentFormData.componentType.trim()) {
            showAlertMessage('error', 'Validation Error', 'Component type is required');
            return;
        }

        try {
            setIsLoading(true);
            const empInfo = JSON.parse(localStorage.getItem("user"));

            if (editingComponent) {
                try {
                    await axios.post(`${config.baseApi}/assets/update-component`, {
                        asset_id: asset_id,
                        component_id: editingComponent.asset_component_id,
                        component_name: componentFormData.componentName,
                        component_type: componentFormData.componentType,
                        updated_by: empInfo.user_name
                    });
                    showAlertMessage('success', 'Success', 'Component updated successfully');
                    setTimeout(() => window.location.reload(), 200);
                } catch (err) {
                    console.error('Error updating component:', err);
                }
            } else {
                await axios.post(`${config.baseApi}/assets/add-component`, {
                    asset_id: asset_id,
                    component_name: componentFormData.componentName,
                    component_type: componentFormData.componentType,
                    created_by: empInfo.user_name
                });
                showAlertMessage('success', 'Success', 'Component added successfully');
                setTimeout(() => window.location.reload(), 200);
            }
            setShowComponentModal(false);
        } catch (error) {
            console.error('Error saving component:', error);
            showAlertMessage('error', 'Error', error.response?.data?.message || 'Failed to save component');
        } finally {
            setIsLoading(false);
        }
    };

    const handleComponentInputChange = (e) => {
        const { name, value } = e.target;
        setComponentFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const Validation = () => {
        if (!formData.assetName?.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Asset Name is empty');
            return false;
        }
        if (!formData.assetType?.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Asset Type is empty');
            return false;
        }
        if (!formData.location?.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Asset Location is empty');
            return false;
        }
        if (!formData.assignedLocation?.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Assigned Location is empty');
            return false;
        }
        if (!formData.category?.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Asset Category is empty');
            return false;
        }
        if (!formData.trivector?.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Trivector is required');
            return false;
        }
        if (!formData.commissioningDate?.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Asset Commissioning Date is empty');
            return false;
        }
        return true;
    };

    const checkForDuplicateAsset = async () => {
        try {
            const res = await axios.get(`${config.baseApi}/assets/get-all-assets`);
            const data = res.data || [];
            const duplicateAssetName = data.some(
                asset => asset.asset_name?.toLowerCase() === formData.assetName.toLowerCase() &&
                    asset.asset_id !== asset_id
            );

            if (duplicateAssetName) {
                showAlertMessage('error', 'Duplicate Asset', `An asset with the name "${formData.assetName}" already exists. Please use a different asset name.`);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Unable to fetch all assets: ', err);
            showAlertMessage('error', 'Validation Error', 'Unable to verify asset name. Please try again.');
            return true;
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const empInfo = JSON.parse(localStorage.getItem("user"));
        if (!Validation()) {
            setIsLoading(false);
            return;
        }

        const isDuplicate = await checkForDuplicateAsset();
        if (isDuplicate) {
            setIsLoading(false);
            return;
        }

        let changes_made = "";
        if (originalData.current) {
            const changedFields = findChangedFields(originalData.current, formData);
            if (Object.keys(changedFields).length > 0) {
                const changeStrings = [];
                Object.keys(changedFields).forEach(key => {
                    let fieldName = key.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
                    if (fieldName === 'is active') fieldName = 'status';
                    if (fieldName === 'assigned location') fieldName = 'assigned location';
                    const changeDesc = `${fieldName} from '${changedFields[key].from}' to '${changedFields[key].to}'`;
                    changeStrings.push(changeDesc);
                });
                changes_made = changeStrings.join(', ');
            } else {
                changes_made = "No changes were made";
            }
        }

        try {
            await axios.post(`${config.baseApi}/assets/update-assets`, {
                asset_id: asset_id,
                asset_name: formData.assetName,
                asset_type: formData.assetType,
                asset_location: formData.location,
                assigned_location: formData.assignedLocation,
                asset_category: formData.category,
                date_commisioning: formData.commissioningDate,
                trivector: formData.trivector,
                asset_notes: formData.notes,
                is_active: formData.isActive,
                updated_by: empInfo.user_name,
                changes_made: changes_made
            });
            showAlertMessage('success', 'Successful!', `Asset ${formData.assetName} was successfully updated!`);
            setIsEditing(false);
            originalData.current = { ...formData };
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            console.log('Unable to update!', err);
            const errorMessage = err.response?.data?.message || err.message || 'An error occurred while updating';
            showAlertMessage('error', 'Unable to update', errorMessage);
            setIsLoading(false);
        }
    };

    const handleEditClick = () => {
        console.log('Edit button clicked');
        if (isDataLoaded && !isLoading) {
            setIsEditing(true);
        }
    };

    const handleCancelEdit = () => {
        if (originalData.current) {
            setFormData(originalData.current);
        }
        setIsEditing(false);
    };

    const handleMonitoring = () => {
        navigate(`/asset-monitoring?id=${asset_id}`)
    }

    // Helper function to check if user can edit
    const canUserEdit = () => {
        if (!formData.assignedLocation) return false;
        const formattedAssignedLocation = formatDepartmentName(formData.assignedLocation);
        return userdepartment === formattedAssignedLocation;
    };

    return (
        <div style={{
            background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
            minHeight: '100vh',
            padding: '40px',
            position: 'relative',
            overflow: 'hidden',
            paddingTop: '80px'
        }}>
            {/* Animated background elements */}
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

            {showAlert && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 9999
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

            {/* Component Modal */}
            <Modal show={showComponentModal} onHide={() => setShowComponentModal(false)} centered contentClassName="custom-modal-content">
                <Modal.Header closeButton style={{ borderBottom: '1px solid #e2e8f0', background: 'linear-gradient(165deg, #ffa600  0%, #df9e4a 100%)', color: 'white', borderRadius: '16px 16px 0 0' }}>
                    <Modal.Title style={{ fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', color: '#ffffff' }}>
                        <FiCpu size={23} color='#ffffff' />
                        {editingComponent ? 'Edit Component' : 'Add New Component'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ padding: '20px', }}>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#334155' }}>
                                Component Name <span style={{ color: '#ef4444' }}>*</span>
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="componentName"
                                value={componentFormData.componentName}
                                onChange={handleComponentInputChange}
                                placeholder="e.g., Motor, Pump, Gearbox"
                                style={{
                                    border: '2px solid #E2E8F0',
                                    borderRadius: '10px',
                                    padding: '12px 16px',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#334155' }}>
                                Component Type <span style={{ color: '#ef4444' }}>*</span>
                            </Form.Label>
                            <Form.Select
                                name="componentType"
                                value={componentFormData.componentType}
                                onChange={handleComponentInputChange}
                                style={{
                                    border: '2px solid #E2E8F0',
                                    borderRadius: '10px',
                                    padding: '12px 16px',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                            >
                                <option value="">Select component type</option>
                                {componentTypeOptions.map((type, index) => (
                                    <option key={index} value={type}>
                                        {formatDisplayName(type)}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: '1px solid #e2e8f0', }}>
                    <Button variant="secondary" onClick={() => setShowComponentModal(false)} style={{
                        background: 'linear-gradient(135deg, #ea6f6f, #f92f2f)',
                        border: 'none', borderRadius: '12px', padding: '10px 28px',
                        fontSize: '0.85rem', fontWeight: '600', color: '#fff',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        gap: '10px', boxShadow: '0 4px 15px rgba(233, 150, 40, 0.3)',
                        transition: 'all 0.2s ease'
                    }}
                        onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(233, 150, 40, 0.4)'; }}
                        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(233, 150, 40, 0.3)'; }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveComponent}
                        variant="secondary"
                        style={{
                            background: 'linear-gradient(135deg, #eab56f, #f99b2f)',
                            border: 'none', borderRadius: '12px', padding: '10px 28px',
                            fontSize: '0.85rem', fontWeight: '600', color: '#fff',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            gap: '10px', boxShadow: '0 4px 15px rgba(233, 150, 40, 0.3)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(233, 150, 40, 0.4)'; }}
                        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(233, 150, 40, 0.3)'; }}

                    >
                        {editingComponent ? 'Update' : 'Add'} Component
                    </Button>
                </Modal.Footer>
            </Modal>

            <Container fluid style={{ maxWidth: '2000px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
                {/* Header */}
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{
                            fontSize: '2.8rem', fontWeight: '700', color: '#EAB56F',
                            textShadow: '0 4px 20px rgba(255, 0, 0, 0.2)', margin: 0, display: 'flex', alignItems: 'center', gap: '12px'
                        }}>
                            Asset ID {asset_id}
                            <div
                                onClick={toggleActiveStatus}
                                style={{
                                    backgroundColor: formData.isActive === '1' ? '#10b981' : '#ef4444',
                                    padding: '5px 20px',
                                    borderRadius: '20px',
                                    fontSize: '20px',
                                    fontWeight: '600',
                                    color: '#ffffff',
                                    cursor: isEditing ? 'pointer' : 'default',
                                    border: 'none',
                                    transition: 'all 0.3s ease',
                                    display: 'inline-block',
                                    textAlign: 'center'
                                }}
                            >
                                {formData.isActive === '1' ? 'Active' : 'Inactive'}
                            </div>
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>Complete asset information and configuration</p>
                    </div>
                    <div>
                        {!isEditing ? (
                            /* Only show edit button if user department matches assigned location */
                            canUserEdit() ? (
                                <Button
                                    onClick={handleEditClick}
                                    disabled={!isDataLoaded || isLoading}
                                    style={{
                                        background: 'linear-gradient(135deg, #EAB56F, #F9982F)',
                                        border: 'none', borderRadius: '12px', padding: '14px 28px',
                                        fontSize: '0.95rem', fontWeight: '600', color: '#fff',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                                        gap: '10px', boxShadow: '0 4px 15px rgba(233, 150, 40, 0.3)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(233, 150, 40, 0.4)'; }}
                                    onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(233, 150, 40, 0.3)'; }}
                                >
                                    <FiEdit2 size={14} />
                                    Edit Asset
                                </Button>
                            ) : null
                        ) : (
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <Button
                                    onClick={handleCancelEdit}
                                    variant="secondary"
                                    style={{
                                        background: 'linear-gradient(135deg, #ea8c6f, #f94d2f)',
                                        border: 'none', borderRadius: '12px', padding: '14px 28px',
                                        fontSize: '0.95rem', fontWeight: '600', color: '#fff',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                                        gap: '10px', boxShadow: '0 4px 15px rgba(233, 150, 40, 0.3)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(233, 150, 40, 0.4)'; }}
                                    onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(233, 150, 40, 0.3)'; }}
                                >
                                    <FiX size={14} />
                                    Cancel
                                </Button>

                                <Button
                                    onClick={handleUpdate}
                                    style={{
                                        background: 'linear-gradient(135deg, #EAB56F, #F9982F)',
                                        border: 'none', borderRadius: '12px', padding: '14px 28px',
                                        fontSize: '0.95rem', fontWeight: '600', color: '#fff',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                                        gap: '10px', boxShadow: '0 4px 15px rgba(233, 150, 40, 0.3)',
                                        transition: 'all 0.2s ease', justifyContent: 'center'
                                    }}
                                    onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(233, 150, 40, 0.4)'; }}
                                    onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(233, 150, 40, 0.3)'; }}
                                >
                                    <FiSave size={14} />
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <StatCard icon={FiCalendar} label="Commissioned" value={formData.commissioningDate || '—'} textColor="#7980e6" backgroundColor="#1100ff23" borderColor="#5f55e7" />
                    <StatCard icon={FiCpu} label="Components" value={components.length} textColor="#4dda60" backgroundColor="#00ff0d23" borderColor="#30ca45" />
                    <StatCard icon={FiUser} label="Created By" value={formData.created_by || '—'} textColor="#ccd672" backgroundColor="#ffee0023" borderColor="#fff45f" />

                    <button
                        onClick={handleMonitoring}
                        style={{
                            background: 'linear-gradient(135deg, rgba(255, 153, 0, 0.9), rgba(227, 114, 57, 0.9))',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '16px',
                            padding: '12px 28px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 8px 20px rgba(227, 114, 57, 0.3)',
                            position: 'relative',
                            overflow: 'hidden',
                            group: 'button',
                            animation: shouldBounce ? 'bounce 0.5s ease' : 'none'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 15px 30px rgba(227, 114, 57, 0.4)';
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgb(255, 153, 0), rgb(227, 114, 57))';
                            const arrow = e.currentTarget.querySelector('.arrow-icon');
                            if (arrow) arrow.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(227, 114, 57, 0.3)';
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 153, 0, 0.9), rgba(227, 114, 57, 0.9))';
                            const arrow = e.currentTarget.querySelector('.arrow-icon');
                            if (arrow) arrow.style.transform = 'translateX(0)';
                        }}
                    >
                        <span style={{
                            color: '#fff',
                            fontWeight: '600',
                            fontSize: '14px',
                            letterSpacing: '0.5px'
                        }}>
                            View Asset Monitoring
                        </span>
                        <FeatherIcon
                            icon='arrow-right'
                            size={18}
                            color="#fff"
                            className="arrow-icon"
                            style={{
                                transition: 'transform 0.3s ease'
                            }}
                        />
                    </button>
                </div>

                {/* Main Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                    marginBottom: '24px'
                }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #eef2ff', background: '#fafcff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiDatabase size={18} color="#f69f3b" />
                            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 }}>Asset Information</h2>
                        </div>
                    </div>
                    <div style={{ padding: '24px' }}>
                        {!isEditing ? (
                            /* Read-only View */
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px 32px' }}>
                                <InfoRow label="Asset Name" value={formData.assetName} icon={'box'} />
                                <InfoRow label="Location" value={formatDisplayName(formData.location)} icon={'map-pin'} />
                                <InfoRow label="Assigned Location" value={formatDepartmentName(formData.assignedLocation)} icon={'map-pin'} />
                                <InfoRow label="Asset Type" value={formatDisplayName(formData.assetType)} icon={'sliders'} />
                                <InfoRow label="Category" value={formatDisplayName(formData.category)} icon={'grid'} />
                                <InfoRow label="Trivector" value={trivectorOptions.find(t => t.value === formData.trivector)?.label} icon={'zap'} />
                                <InfoRow label="Commissioning Date" value={formData.commissioningDate} icon={'calendar'} />
                                <div>
                                    <div style={{ fontWeight: '500', fontSize: '0.85rem', color: '#475569', marginBottom: '4px', gap: '6px', display: 'flex', alignItems: 'center' }}>
                                        <FeatherIcon icon="user" size={14} color="#ff6600" />
                                        Created By
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '25px' }}>
                                        <div style={{
                                            width: '24px', height: '24px', borderRadius: '50%',
                                            overflow: 'hidden', border: '2px solid #EAB56F',
                                            background: '#f3f4f6', flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {createdByAvatar ? (
                                                <img
                                                    src={`${config.baseApi}/${createdByAvatar}`}
                                                    alt={formData.created_by}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentNode.innerHTML = `<span style="font-size:9px;font-weight:700;color:#EAB56F">${formData.created_by?.charAt(0)?.toUpperCase() || '?'}</span>`;
                                                    }}
                                                />
                                            ) : (
                                                <span style={{ fontSize: '9px', fontWeight: '700', color: '#EAB56F' }}>
                                                    {formData.created_by?.charAt(0)?.toUpperCase() || '?'}
                                                </span>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>
                                            {formData.created_by || '—'}
                                        </span>
                                    </div>
                                </div>
                                <InfoRow label="Created At" value={formData.created_at ? new Date(formData.created_at).toLocaleString() : '—'} icon={'clock'} />
                                {formData.notes && (
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <InfoRow label="Notes" value={formData.notes} />
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Edit Form */
                            <Form>
                                <Row>
                                    <Col md={6} style={{ marginBottom: '16px' }}>
                                        <Form.Group>
                                            <Form.Label style={{
                                                fontWeight: '500',
                                                fontSize: '0.85rem', color: '#475569', marginBottom: '4px', gap: '6px', display: 'flex',
                                                alignItems: 'center',
                                            }}>
                                                <FiBox style={{ height: '20px', width: '20px' }} color='#ff6600' />
                                                Asset Name <span style={{ color: '#ef4444' }}>*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="assetName"
                                                value={formData.assetName || ''}
                                                onChange={handleInputChange}
                                                style={{
                                                    border: '2px solid #E2E8F0',
                                                    borderRadius: '10px',
                                                    padding: '12px 16px',
                                                    fontSize: '0.95rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} style={{ marginBottom: '16px' }}>
                                        <Form.Group>
                                            <Form.Label style={{
                                                fontWeight: '500',
                                                fontSize: '0.85rem', color: '#475569', marginBottom: '4px', gap: '6px', display: 'flex',
                                                alignItems: 'center',
                                            }}>
                                                <FiMapPin style={{ height: '20px', width: '20px' }} color='#ff6600' />
                                                Location <span style={{ color: '#ef4444' }}>*</span>
                                            </Form.Label>
                                            <Form.Select
                                                name="location"
                                                value={formData.location || ''}
                                                onChange={handleInputChange}
                                                style={{
                                                    border: '2px solid #E2E8F0',
                                                    borderRadius: '10px',
                                                    padding: '12px 16px',
                                                    fontSize: '0.95rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                            >
                                                <option value="">Select location</option>
                                                {locationOptions.map((locationValue, index) => (
                                                    <option key={index} value={locationValue}>
                                                        {formatDisplayName(locationValue)}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} style={{ marginBottom: '16px' }}>
                                        <Form.Group>
                                            <Form.Label style={{
                                                fontWeight: '500',
                                                fontSize: '0.85rem', color: '#475569', marginBottom: '4px', gap: '6px', display: 'flex',
                                                alignItems: 'center',
                                            }}>
                                                <FiMapPin style={{ height: '20px', width: '20px' }} color='#ff6600' />
                                                Assigned Location <span style={{ color: '#ef4444' }}>*</span>
                                            </Form.Label>
                                            <Form.Select
                                                name="assignedLocation"
                                                value={formData.assignedLocation || ''}
                                                onChange={handleInputChange}
                                                style={{
                                                    border: '2px solid #E2E8F0',
                                                    borderRadius: '10px',
                                                    padding: '12px 16px',
                                                    fontSize: '0.95rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                            >
                                                <option value="">Select assigned location</option>
                                                {assignedLocationOptions.map((option, index) => (
                                                    <option key={index} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} style={{ marginBottom: '16px' }}>
                                        <Form.Group>
                                            <Form.Label style={{
                                                fontWeight: '500',
                                                fontSize: '0.85rem', color: '#475569', marginBottom: '4px', gap: '6px', display: 'flex',
                                                alignItems: 'center',
                                            }}>
                                                <FiSliders style={{ height: '20px', width: '20px' }} color='#ff6600' />
                                                Asset Type <span style={{ color: '#ef4444' }}>*</span>
                                            </Form.Label>
                                            <Form.Select
                                                name="assetType"
                                                value={formData.assetType || ''}
                                                onChange={handleInputChange}
                                                disabled={!formData.location}
                                                style={{
                                                    border: '2px solid #E2E8F0',
                                                    borderRadius: '10px',
                                                    padding: '12px 16px',
                                                    fontSize: '0.95rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                            >
                                                <option value="">{!formData.location ? 'Select location first' : 'Select asset type'}</option>
                                                {assetTypeOptions.map((type, index) => (
                                                    <option key={index} value={type}>{formatDisplayName(type)}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} style={{ marginBottom: '16px' }}>
                                        <Form.Group>
                                            <Form.Label style={{
                                                fontWeight: '500',
                                                fontSize: '0.85rem', color: '#475569', marginBottom: '4px', gap: '6px', display: 'flex',
                                                alignItems: 'center',
                                            }}>
                                                <FiGrid style={{ height: '20px', width: '20px' }} color='#ff6600' />
                                                Category <span style={{ color: '#ef4444' }}>*</span>
                                            </Form.Label>
                                            <Form.Select
                                                name="category"
                                                value={formData.category || ''}
                                                onChange={handleInputChange}
                                                disabled={!formData.location}
                                                style={{
                                                    border: '2px solid #E2E8F0',
                                                    borderRadius: '10px',
                                                    padding: '12px 16px',
                                                    fontSize: '0.95rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                            >
                                                <option value="">{!formData.location ? 'Select location first' : 'Select category'}</option>
                                                {categoryOptions.map((category, index) => (
                                                    <option key={index} value={category}>{formatDisplayName(category)}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} style={{ marginBottom: '16px' }}>
                                        <Form.Group>
                                            <Form.Label style={{
                                                fontWeight: '500',
                                                fontSize: '0.85rem', color: '#475569', marginBottom: '4px', gap: '6px', display: 'flex',
                                                alignItems: 'center',
                                            }}>
                                                <FiZap style={{ height: '20px', width: '20px' }} color='#ff6600' />
                                                Trivector <span style={{ color: '#ef4444' }}>*</span>
                                            </Form.Label>
                                            <Form.Select
                                                name="trivector"
                                                value={formData.trivector || ''}
                                                onChange={handleInputChange}
                                                style={{
                                                    border: '2px solid #E2E8F0',
                                                    borderRadius: '10px',
                                                    padding: '12px 16px',
                                                    fontSize: '0.95rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                            >
                                                <option value="">Select trivector type</option>
                                                {trivectorOptions.map((option, index) => (
                                                    <option key={index} value={option.value}>{option.label}</option>
                                                ))}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6} style={{ marginBottom: '16px' }}>
                                        <Form.Group>
                                            <Form.Label style={{
                                                fontWeight: '500',
                                                fontSize: '0.85rem', color: '#475569', marginBottom: '4px', gap: '6px', display: 'flex',
                                                alignItems: 'center',
                                            }}>
                                                <FiCalendar style={{ height: '20px', width: '20px' }} color='#ff6600' />
                                                Commissioning Date <span style={{ color: '#ef4444' }}>*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="commissioningDate"
                                                value={formData.commissioningDate || ''}
                                                onChange={handleInputChange}
                                                style={{
                                                    border: '2px solid #E2E8F0',
                                                    borderRadius: '10px',
                                                    padding: '12px 16px',
                                                    fontSize: '0.95rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} style={{ marginBottom: '16px' }}>
                                        <Form.Group>
                                            <Form.Label style={{
                                                fontWeight: '500',
                                                fontSize: '0.85rem', color: '#475569', marginBottom: '4px', gap: '6px', display: 'flex',
                                                alignItems: 'center',
                                            }}>
                                                <FiClipboard style={{ height: '20px', width: '20px' }} color='#ff6600' />
                                                Notes
                                            </Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                name="notes"
                                                value={formData.notes || ''}
                                                onChange={handleInputChange}
                                                style={{
                                                    border: '2px solid #E2E8F0',
                                                    borderRadius: '10px',
                                                    padding: '12px 16px',
                                                    fontSize: '0.95rem',
                                                    transition: 'all 0.2s',
                                                    resize: 'vertical'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        )}
                    </div>
                </div>

                {/* Components Section */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #eef2ff', background: '#fafcff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiCpu style={{ height: '20px', width: '20px' }} color='#ff6600' />
                            <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#0f172a', margin: 0 }}>Components ({components.length})</h2>
                        </div>
                        {isEditing && canUserEdit() && (
                            <Button
                                onClick={handleAddComponent}
                                style={{
                                    background: 'linear-gradient(135deg, #EAB56F, #F9982F)',
                                    border: 'none', borderRadius: '12px', padding: '10px 28px',
                                    fontSize: '0.85rem', fontWeight: '600', color: '#fff',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    gap: '10px', boxShadow: '0 4px 15px rgba(233, 150, 40, 0.3)',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(233, 150, 40, 0.4)'; }}
                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(233, 150, 40, 0.3)'; }}
                            >
                                <FiPlus size={12} />
                                Add Component
                            </Button>
                        )}
                    </div>
                    <div style={{ padding: '0' }}>
                        {components.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#475569' }}>Name</th>
                                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#475569' }}>Type</th>
                                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#475569' }}>Created By</th>
                                            <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#475569' }}>Date</th>
                                            {isEditing && canUserEdit() && <th style={{ textAlign: 'center', padding: '12px 16px', fontWeight: '600', color: '#475569' }}>Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {components.map((component, idx) => (
                                            <tr key={component.component_id || idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? 'white' : '#fafcff' }}>
                                                <td style={{ padding: '10px 16px', fontWeight: '500', color: '#0f172a' }}>{component.componentName}</td>
                                                <td style={{ padding: '10px 16px', color: '#475569' }}>{formatDisplayName(component.componentType)}</td>
                                                <td style={{ padding: '10px 16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {(() => {
                                                            const avatarObj = Array.isArray(createdByAvatarComp)
                                                                ? createdByAvatarComp.find(a => a.created_by === component.created_by)
                                                                : null;
                                                            const avatarUrl = avatarObj?.avatar;
                                                            return (
                                                                <div style={{
                                                                    width: '24px', height: '24px', borderRadius: '50%',
                                                                    overflow: 'hidden', border: '2px solid #EAB56F',
                                                                    background: '#f3f4f6', flexShrink: 0,
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                                }}>
                                                                    {avatarUrl ? (
                                                                        <img
                                                                            src={`${config.baseApi}/${avatarUrl}`}
                                                                            alt={component.created_by}
                                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                            onError={(e) => {
                                                                                e.target.style.display = 'none';
                                                                                e.target.parentNode.innerHTML = `<span style="font-size:9px;font-weight:700;color:#EAB56F">${component.created_by?.charAt(0)?.toUpperCase() || '?'}</span>`;
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <span style={{ fontSize: '9px', fontWeight: '700', color: '#EAB56F' }}>
                                                                            {component.created_by?.charAt(0)?.toUpperCase() || '?'}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                        <span style={{ color: '#475569', fontSize: '13px' }}>{component.created_by}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '10px 16px', color: '#475569' }}>{component.created_at ? new Date(component.created_at).toLocaleDateString() : '—'}</td>
                                                {isEditing && canUserEdit() && (
                                                    <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                                        <Button
                                                            variant="link"
                                                            onClick={() => handleEditComponent(component)}
                                                            style={{ color: '#f6953b', padding: '0', fontSize: '12px', textDecoration: 'none' }}
                                                        >
                                                            Edit
                                                        </Button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '48px', background: '#fafcff' }}>
                                <FiZap size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                                <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '12px' }}>No components added yet</p>
                                {isEditing && canUserEdit() && (
                                    <Button variant="link" onClick={handleAddComponent} style={{ color: '#3b82f6', fontSize: '12px', textDecoration: 'none' }}>
                                        Add your first component →
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Container>
            <style>
                {`
                    @keyframes float {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(50px, -50px) rotate(120deg); }
                        66% { transform: translate(-30px, 30px) rotate(240deg); }
                    }
                    
                    @keyframes bounce {
                        0%, 100% {
                            transform: translateY(0);
                        }
                        50% {
                            transform: translateY(-5px);
                        }
                        70% {
                            transform: translateY(2px);
                        }
                    }
                `}
            </style>
        </div>
    );
}

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, textColor, backgroundColor, borderColor }) => (
    <div style={{
        background: backgroundColor || '#ffd9003a',
        borderRadius: '12px',
        padding: '16px',
        border: `2px solid ${borderColor || '#006eff'}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', }}>
            <Icon size={18} color={borderColor} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: borderColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
        </div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: textColor || '#0f172a' }}>{value || '—'}</div>
    </div>
);

// Info Row Component
const InfoRow = ({ label, value, icon }) => (
    <div>
        <div style={{
            fontWeight: '500',
            fontSize: '0.85rem', color: '#475569', marginBottom: '4px', gap: '6px', display: 'flex',
            alignItems: 'center',
        }}>
            <FeatherIcon icon={icon} size={14} color="#ff6600" />
            {label}
        </div>
        <div style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a', marginLeft: '25px' }}>{value || '—'}</div>
    </div>
);