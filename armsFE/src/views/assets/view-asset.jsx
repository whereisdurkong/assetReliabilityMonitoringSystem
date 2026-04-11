import { useEffect, useState, useRef } from 'react';
import { Form, Container, Row, Col, Button, Modal, Badge, Table, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Loading from '../../components/personalComponents/loading';
import AlertModal from '../../components/personalComponents/alertModal';

import axios from 'axios';
import config from 'config';

export default function ViewAsset() {
    const asset_id = new URLSearchParams(window.location.search).get('id');
    const [confirmModal, setConfirmModal] = useState(false);
    const [formData, setFormData] = useState({
        assetName: '',
        assetType: '',
        location: '',
        category: '',
        commissioningDate: '',
        trivector: '',
        notes: '',
        isActive: '1',
        created_by: '',
        created_at: ''
    });

    // Add a ref to store the original data
    const originalData = useRef(null);

    // Alert state
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        type: 'success',
        title: '',
        description: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    // Add state for dynamic options
    const [locationOptions, setLocationOptions] = useState([]);
    const [assetTypeOptions, setAssetTypeOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [componentTypeOptions, setComponentTypeOptions] = useState([]);

    // Store the full API data for filtering
    const [masterData, setMasterData] = useState([]);

    // Trivector options
    const trivectorOptions = [
        { label: 'Rotating Machine', value: 'rotating-machine' },
        { label: 'Stationary Engine', value: 'stationary-engine' },
        { label: 'Mobile Engine', value: 'mobile-engine' }
    ];

    // Component management states
    const [components, setComponents] = useState([]);
    const [hasComponents, setHasComponents] = useState(false);
    const [showComponentModal, setShowComponentModal] = useState(false);
    const [editingComponent, setEditingComponent] = useState(null);
    const [componentFormData, setComponentFormData] = useState({
        componentName: '',
        componentType: ''
    });
    const [originalComponents, setOriginalComponents] = useState([]);

    // Add this state to track if options are loaded
    const [optionsLoaded, setOptionsLoaded] = useState(false);

    // Fetch location options from API
    useEffect(() => {
        const fetchLocationOptions = async () => {
            try {
                const res = await axios.get(`${config.baseApi}/assetsAnalysis/get-all-options-master`);
                const data = res.data || [];
                setMasterData(data); // Store all data

                // Collect all unique location options
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

                setLocationOptions(allLocations);
                setOptionsLoaded(true);
                console.log('Location options:', allLocations);
            } catch (error) {
                console.error('Error fetching location options:', error);
            }
        };

        fetchLocationOptions();
    }, []);

    // Filter options based on selected location
    useEffect(() => {
        if (!formData.location || masterData.length === 0) {
            setAssetTypeOptions([]);
            setCategoryOptions([]);
            setComponentTypeOptions([]);
            return;
        }

        // Find the data entry that contains the selected location
        const selectedLocationData = masterData.find(item => {
            if (item.option_asset_location) {
                const locations = item.option_asset_location.split(',').map(loc => loc.trim());
                return locations.includes(formData.location);
            }
            return false;
        });

        if (selectedLocationData) {
            // Process asset types
            if (selectedLocationData.option_asset_type) {
                const types = selectedLocationData.option_asset_type.split(',').map(type => type.trim());
                setAssetTypeOptions(types);
            } else {
                setAssetTypeOptions([]);
            }

            // Process categories
            if (selectedLocationData.option_asset_category) {
                const categories = selectedLocationData.option_asset_category.split(',').map(cat => cat.trim());
                setCategoryOptions(categories);
            } else {
                setCategoryOptions([]);
            }

            // Process component types
            if (selectedLocationData.option_component_types) {
                const compTypes = selectedLocationData.option_component_types.split('/').map(type => type.trim());
                setComponentTypeOptions(compTypes);
                console.log('Component Types for selected location:', compTypes);
            } else {
                setComponentTypeOptions([]);
            }
        } else {
            // No matching data found
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

    // Function to find changed fields
    const findChangedFields = (original, current) => {
        const changes = {};

        Object.keys(current).forEach(key => {
            // Skip comparing created_at and created_by as they shouldn't be considered for updates
            if (key === 'created_at' || key === 'created_by') return;

            // Convert both values to strings for comparison
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

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${config.baseApi}/assets/get-asset-by-id`, {
                    params: { id: asset_id }
                });

                const data = res.data || [];

                const fetchedData = {
                    assetName: data.asset_name,
                    assetType: data.asset_type,
                    location: data.asset_location,
                    category: data.asset_category,
                    commissioningDate: data.date_commisioning,
                    trivector: data.trivector,
                    notes: data.asset_notes,
                    isActive: data.is_active || '1',
                    created_at: data.created_at,
                    created_by: data.created_by
                };

                // Store components data
                setComponents(data.components || []);
                setOriginalComponents(data.components || []);
                setHasComponents(data.components_count > 0);

                // Store the original data in the ref
                originalData.current = fetchedData;

                setFormData(fetchedData);

                console.log('Original data loaded:', data);
            } catch (error) {
                console.error('Error fetching asset:', error);
                showAlertMessage('error', 'Error', 'Failed to load asset data');
            }
        };

        fetch();
    }, [asset_id]);

    // Helper function to format display names
    const formatDisplayName = (value) => {
        if (!value) return '';
        return value
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Function to show alert messages
    const showAlertMessage = (type, title, description) => {
        setAlertConfig({ type, title, description });
        setShowAlert(true);
    };

    const toggleActiveStatus = () => {
        setFormData(prev => ({
            ...prev,
            isActive: prev.isActive === '1' ? '0' : '1'
        }));
    };

    // Component management functions
    const handleAddComponent = () => {
        setEditingComponent(null);
        setComponentFormData({
            componentName: '',
            componentType: ''
        });
        setShowComponentModal(true);
    };



    // Update the handleEditComponent function to log and verify the component object
    const handleEditComponent = (component) => {
        console.log('Editing component:', component); // Add this to debug
        setEditingComponent(component);
        setComponentFormData({
            componentName: component.componentName,
            componentType: component.componentType
        });
        setShowComponentModal(true);
    };

    // Update the handleSaveComponent function to use the correct property
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
                // Log the editingComponent to see its structure
                console.log('Editing component object:', editingComponent);
                console.log('Component ID:', editingComponent.asset_component_id);

                // Update existing component - uncomment when API endpoint is ready
                await axios.post(`${config.baseApi}/assets/update-component`, {
                    asset_id: asset_id,
                    component_id: editingComponent.asset_component_id,
                    component_name: componentFormData.componentName,
                    component_type: componentFormData.componentType,
                    updated_by: empInfo.user_name
                });

                // Update local state
                const updatedComponents = components.map(c =>
                    c.component_id === editingComponent.component_id
                        ? {
                            ...c,
                            componentName: componentFormData.componentName,
                            componentType: componentFormData.componentType
                        }
                        : c
                );
                setComponents(updatedComponents);
                setOriginalComponents(updatedComponents);

                showAlertMessage('success', 'Success', 'Component updated successfully');

                setTimeout(() => {
                    window.location.reload();
                }, 200);
            } else {
                // Add new component
                const response = await axios.post(`${config.baseApi}/assets/add-component`, {
                    asset_id: asset_id,
                    component_name: componentFormData.componentName,
                    component_type: componentFormData.componentType,
                    created_by: empInfo.user_name
                });

                // Add new component to local state
                const newComponent = {
                    component_id: response.data.asset_component_id,
                    componentName: componentFormData.componentName,
                    componentType: componentFormData.componentType,
                    created_by: empInfo.user_name,
                    created_at: new Date().toISOString()
                };

                const updatedComponents = [...components, newComponent];
                setComponents(updatedComponents);
                setOriginalComponents(updatedComponents);
                setHasComponents(true);

                showAlertMessage('success', 'Success', 'Component added successfully');
                setTimeout(() => {
                    window.location.reload();
                }, 200);

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
            setIsLoading(false);
            return false;
        }
        if (!formData.assetType?.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Asset Type is empty');
            setIsLoading(false);
            return false;
        }
        if (!formData.location?.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Asset Location is empty');
            setIsLoading(false);
            return false;
        }
        if (!formData.category?.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Asset Category is empty');
            setIsLoading(false);
            return false;
        }
        if (!formData.trivector?.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Trivector is required');
            setIsLoading(false);
            return false;
        }
        if (!formData.commissioningDate?.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Asset Commissioning Date is empty');
            setIsLoading(false);
            return false;
        }

        return true;
    };

    const handleUpdate = async (e) => {
        e.preventDefault()
        console.log('WORKING')

        setIsLoading(true);

        const empInfo = JSON.parse(localStorage.getItem("user"));
        if (!Validation()) {
            return;
        }

        let changes_made = ""; // Initialize as empty string

        // Find and log changed fields
        if (originalData.current) {
            const changedFields = findChangedFields(originalData.current, formData);

            if (Object.keys(changedFields).length > 0) {
                // Build the changes string
                const changeStrings = [];

                console.log(`${empInfo.user_name} made the following changes:`);
                Object.keys(changedFields).forEach(key => {
                    // Format the field name to be more readable
                    let fieldName = key.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
                    if (fieldName === 'is active') fieldName = 'status';

                    // Create change description
                    const changeDesc = `${fieldName} from '${changedFields[key].from}' to '${changedFields[key].to}'`;
                    changeStrings.push(changeDesc);

                    console.log(`${empInfo.user_name} changed the ${changeDesc}`);
                });

                // Join all changes with commas
                changes_made = changeStrings.join(', ');
                console.log('changes_made:', changes_made);
            } else {
                changes_made = "No changes were made";
                console.log(`${empInfo.user_name} clicked update but no fields were changed`);
            }
        }

        try {
            const response = await axios.post(`${config.baseApi}/assets/update-assets`, {
                asset_id: asset_id,
                asset_name: formData.assetName,
                asset_type: formData.assetType,
                asset_location: formData.location,
                asset_category: formData.category,
                date_commisioning: formData.commissioningDate,
                trivector: formData.trivector,
                asset_notes: formData.notes,
                is_active: formData.isActive,
                updated_by: empInfo.user_name,
                changes_made: changes_made // This will be stored in your assets_logs table
            });

            // Show success message
            showAlertMessage(
                'success',
                'Successful!',
                `Asset ${formData.assetName} was successfully updated!`
            );

            // Reset to original data
            if (originalData.current) {
                setFormData(originalData.current);
            }

            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (err) {
            console.log('Unable to update!', err);

            const errorMessage = err.response?.data?.message || err.message || 'An error occurred while updating';

            showAlertMessage(
                'error',
                'Unable to update',
                errorMessage
            );
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
            minHeight: '100vh',
            padding: '40px',
            position: 'relative',
            overflow: 'hidden',
            paddingTop: '100px'
        }}>
            <Loading show={isLoading} />

            {/* Alert Modal */}
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
            <Modal show={showComponentModal} onHide={() => setShowComponentModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingComponent ? 'Edit Component' : 'Add New Component'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Component Name <span style={{ color: '#E37239' }}>*</span></Form.Label>
                            <Form.Control
                                type="text"
                                name="componentName"
                                value={componentFormData.componentName}
                                onChange={handleComponentInputChange}
                                placeholder="Enter component name (e.g., Motor, Pump, Gearbox)"
                                style={{
                                    borderRadius: '12px',
                                    padding: '12px 16px'
                                }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Component Type <span style={{ color: '#E37239' }}>*</span></Form.Label>
                            <Form.Select
                                name="componentType"
                                value={componentFormData.componentType}
                                onChange={handleComponentInputChange}
                                style={{
                                    borderRadius: '12px',
                                    padding: '12px 16px'
                                }}
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
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowComponentModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveComponent}
                        style={{
                            background: 'linear-gradient(45deg, #EAB56F, #F9982F, #E37239)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '10px 24px',
                            fontWeight: '600'
                        }}
                    >
                        {editingComponent ? 'Update' : 'Add'} Component
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Animated background elements */}
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'rgb(255, 255, 255)',
                opacity: '0.05',
                top: '-200px',
                right: '-200px',
                animation: 'float 25s infinite ease-in-out',
                zIndex: 1
            }} />
            <div style={{
                position: 'absolute',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'rgb(255, 255, 255)',
                opacity: '0.05',
                bottom: '-150px',
                left: '-150px',
                animation: 'float 20s infinite ease-in-out reverse',
                zIndex: 1
            }} />
            <div style={{
                position: 'absolute',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'rgb(255, 255, 255)',
                opacity: '0.03',
                top: '50%',
                left: '20%',
                animation: 'float 18s infinite ease-in-out',
                zIndex: 1
            }} />

            <Container fluid style={{ maxWidth: '1600px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto'
                }}>
                    {/* Header */}
                    <div style={{
                        marginBottom: '20px',
                        textAlign: 'start'
                    }}>
                        <div style={{
                            marginBottom: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            flexWrap: 'wrap'
                        }}>
                            <h1 style={{
                                fontSize: '3.5rem',
                                fontWeight: '800',
                                color: '#EAB56F',
                                marginBottom: '10px',
                                letterSpacing: '-0.5px',
                                textShadow: '0 4px 20px rgba(234, 181, 111, 0.2)'
                            }}>Asset ID {asset_id}</h1>

                            {/* is_active status badge */}
                            <Badge
                                onClick={toggleActiveStatus}
                                bg={formData.isActive === '1' ? 'success' : 'secondary'}
                                style={{
                                    fontSize: '1rem',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    background: formData.isActive === '1'
                                        ? 'linear-gradient(45deg, #28a745, #20c997)'
                                        : 'linear-gradient(45deg, #df7e7e, #c94b4b)',
                                    border: 'none',
                                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                                    marginBottom: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    userSelect: 'none'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 6px 15px rgba(0, 0, 0, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.2)';
                                }}
                            >
                                {formData.isActive === '1' ? '● ACTIVE' : '○ INACTIVE'}
                            </Badge>
                        </div>
                        <p style={{
                            fontSize: '1.2rem',
                            color: '#F9982F',
                            opacity: '0.9',
                            fontWeight: '400',
                            maxWidth: '600px',
                            margin: '0'
                        }}>Detailed information about the asset and its status</p>
                    </div>

                    <Form>
                        <div style={{
                            background: '#f1ddc2',
                            borderRadius: '24px',
                            padding: '40px',
                            border: '1px solid rgba(227, 114, 57, 0.2)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                        }}>
                            <Row style={{ marginBottom: '30px' }}>
                                <Col lg={6}>
                                    <Form.Group className="mb-1" controlId="assetName">
                                        <Form.Label style={{
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            color: '#254252',
                                            display: 'block'
                                        }}>Asset Name <span style={{ color: '#E37239' }}>*</span></Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="assetName"
                                            value={formData.assetName || ''}
                                            onChange={handleInputChange}
                                            placeholder="Enter asset name (e.g., Excavator, Conveyor Belt)"
                                            style={{
                                                backgroundColor: '#fff',
                                                border: '2px solid #e9ecef',
                                                borderRadius: '12px',
                                                padding: '16px 20px',
                                                fontSize: '1rem',
                                                color: '#171C2D',
                                                width: '100%',
                                                outline: 'none',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#E37239';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e9ecef';
                                            }}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col lg={6}>
                                    <Form.Group className="mb-1" controlId="location">
                                        <Form.Label style={{
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            color: '#254252',
                                            display: 'block'
                                        }}>Location <span style={{ color: '#E37239' }}>*</span></Form.Label>
                                        <Form.Select
                                            name="location"
                                            value={formData.location || ''}
                                            onChange={handleInputChange}
                                            style={{
                                                backgroundColor: '#fff',
                                                border: '2px solid #e9ecef',
                                                borderRadius: '12px',
                                                padding: '16px 20px',
                                                fontSize: '1rem',
                                                color: '#171C2D',
                                                width: '100%',
                                                outline: 'none',
                                                cursor: 'pointer',
                                                appearance: 'none',
                                                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23E37239' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 20px center',
                                                backgroundSize: '16px',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#E37239';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e9ecef';
                                            }}
                                        >
                                            <option value="">Select location</option>
                                            {locationOptions.map((locationValue, index) => (
                                                <option
                                                    key={index}
                                                    value={locationValue}
                                                    style={{ backgroundColor: '#fff', color: '#171C2D' }}
                                                >
                                                    {formatDisplayName(locationValue)}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row style={{ marginBottom: '30px' }}>
                                <Col lg={6}>
                                    <Form.Group className="mb-1" controlId="assetType">
                                        <Form.Label style={{
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            color: '#254252',
                                            display: 'block'
                                        }}>Asset Type <span style={{ color: '#E37239' }}>*</span></Form.Label>
                                        <Form.Select
                                            name="assetType"
                                            value={formData.assetType || ''}
                                            onChange={handleInputChange}
                                            style={{
                                                backgroundColor: '#fff',
                                                border: '2px solid #e9ecef',
                                                borderRadius: '12px',
                                                padding: '16px 20px',
                                                fontSize: '1rem',
                                                color: '#171C2D',
                                                width: '100%',
                                                outline: 'none',
                                                cursor: 'pointer',
                                                appearance: 'none',
                                                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23E37239' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 20px center',
                                                backgroundSize: '16px',
                                                transition: 'all 0.3s ease'
                                            }}
                                            disabled={!formData.location}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#E37239';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e9ecef';
                                            }}
                                        >
                                            <option value="">
                                                {!formData.location ? 'Please select a location first' : 'Select asset type'}
                                            </option>
                                            {assetTypeOptions.map((type, index) => (
                                                <option
                                                    key={index}
                                                    value={type}
                                                    style={{ backgroundColor: '#fff', color: '#171C2D' }}
                                                >
                                                    {formatDisplayName(type)}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col lg={6}>
                                    <Form.Group className="mb-1" controlId="category">
                                        <Form.Label style={{
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            color: '#254252',
                                            display: 'block'
                                        }}>Category <span style={{ color: '#E37239' }}>*</span></Form.Label>
                                        <Form.Select
                                            name="category"
                                            value={formData.category || ''}
                                            onChange={handleInputChange}
                                            style={{
                                                backgroundColor: '#fff',
                                                border: '2px solid #e9ecef',
                                                borderRadius: '12px',
                                                padding: '16px 20px',
                                                fontSize: '1rem',
                                                color: '#171C2D',
                                                width: '100%',
                                                outline: 'none',
                                                cursor: 'pointer',
                                                appearance: 'none',
                                                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23E37239' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 20px center',
                                                backgroundSize: '16px',
                                                transition: 'all 0.3s ease'
                                            }}
                                            disabled={!formData.location}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#E37239';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e9ecef';
                                            }}
                                        >
                                            <option value="">
                                                {!formData.location ? 'Please select a location first' : 'Select category'}
                                            </option>
                                            {categoryOptions.map((category, index) => (
                                                <option
                                                    key={index}
                                                    value={category}
                                                    style={{ backgroundColor: '#fff', color: '#171C2D' }}
                                                >
                                                    {formatDisplayName(category)}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row style={{ marginBottom: '30px' }}>
                                <Col lg={6}>
                                    <Form.Group className="mb-1" controlId="trivector">
                                        <Form.Label style={{
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            color: '#254252',
                                            display: 'block'
                                        }}>Trivector</Form.Label>
                                        <Form.Select
                                            name="trivector"
                                            value={formData.trivector || ''}
                                            onChange={handleInputChange}
                                            style={{
                                                backgroundColor: '#fff',
                                                border: '2px solid #e9ecef',
                                                borderRadius: '12px',
                                                padding: '16px 20px',
                                                fontSize: '1rem',
                                                color: '#171C2D',
                                                width: '100%',
                                                outline: 'none',
                                                cursor: 'pointer',
                                                appearance: 'none',
                                                backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23E37239' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 20px center',
                                                backgroundSize: '16px',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#E37239';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e9ecef';
                                            }}
                                        >
                                            <option value="">Select trivector type</option>
                                            {trivectorOptions.map((option, index) => (
                                                <option
                                                    key={index}
                                                    value={option.value}
                                                    style={{ backgroundColor: '#fff', color: '#171C2D' }}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>

                                <Col lg={6}>
                                    <Form.Group className="mb-1" controlId="commissioningDate">
                                        <Form.Label style={{
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            color: '#254252',
                                            display: 'block'
                                        }}>Date of Commissioning <span style={{ color: '#E37239' }}>*</span></Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="commissioningDate"
                                            value={formData.commissioningDate || ''}
                                            onChange={handleInputChange}
                                            style={{
                                                backgroundColor: '#fff',
                                                border: '2px solid #e9ecef',
                                                borderRadius: '12px',
                                                padding: '16px 20px',
                                                fontSize: '1rem',
                                                color: '#171C2D',
                                                width: '100%',
                                                outline: 'none',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#E37239';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e9ecef';
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row style={{ marginBottom: '30px' }}>
                                <Col lg={12}>
                                    <Form.Group className="mb-1" controlId="notes">
                                        <Form.Label style={{
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            color: '#254252',
                                            display: 'block'
                                        }}>Additional Notes</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={1}
                                            name="notes"
                                            value={formData.notes || ''}
                                            onChange={handleInputChange}
                                            placeholder="Enter any additional notes, specifications, or comments..."
                                            style={{
                                                backgroundColor: '#fff',
                                                border: '2px solid #e9ecef',
                                                borderRadius: '12px',
                                                padding: '16px 20px',
                                                fontSize: '1rem',
                                                color: '#171C2D',
                                                width: '100%',
                                                outline: 'none',
                                                resize: 'vertical',
                                                minHeight: '20px',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#E37239';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e9ecef';
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row style={{ marginBottom: '30px' }}>
                                <Col lg={6}>
                                    <Form.Group className="mb-1" controlId="createdAt">
                                        <Form.Label style={{
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            color: '#254252',
                                            display: 'block'
                                        }}>Created At</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="created_at"
                                            value={formData.created_at ? new Date(formData.created_at).toLocaleDateString() : ''}
                                            disabled
                                            style={{
                                                backgroundColor: '#fff',
                                                border: '2px solid #e9ecef',
                                                borderRadius: '12px',
                                                padding: '16px 20px',
                                                fontSize: '1rem',
                                                color: '#171C2D',
                                                width: '100%',
                                                outline: 'none',
                                                transition: 'all 0.3s ease'
                                            }}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col lg={6}>
                                    <Form.Group className="mb-1" controlId="createdBy">
                                        <Form.Label style={{
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            color: '#254252',
                                            display: 'block'
                                        }}>Created By</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="created_by"
                                            value={formData.created_by || ''}
                                            disabled
                                            style={{
                                                backgroundColor: '#fff',
                                                border: '2px solid #e9ecef',
                                                borderRadius: '12px',
                                                padding: '16px 20px',
                                                fontSize: '1rem',
                                                color: '#171C2D',
                                                width: '100%',
                                                outline: 'none',
                                                transition: 'all 0.3s ease'
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* Components Section - Enhanced with Add/Edit functionality */}
                            <div style={{
                                marginTop: '20px',
                                marginBottom: '20px',
                                padding: '10px',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '25px',
                                    flexWrap: 'wrap',
                                    gap: '15px'
                                }}>
                                    <h2 style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: '#254252',
                                        borderBottom: '3px solid #E37239',
                                        paddingBottom: '10px',
                                        display: 'inline-block',
                                        margin: 0
                                    }}>
                                        Components ({components.length})
                                    </h2>

                                    <Button
                                        onClick={handleAddComponent}
                                        style={{
                                            background: 'linear-gradient(45deg, #28a745, #20c997)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '10px 24px',
                                            fontSize: '0.9rem',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'scale(1.02)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'scale(1)';
                                        }}
                                    >
                                        <span>+</span> Add Component
                                    </Button>
                                </div>

                                {components.length > 0 ? (
                                    <div style={{
                                        overflowX: 'auto',
                                    }}>
                                        <Table
                                            striped
                                            hover
                                            bordered={false}
                                            style={{
                                                backgroundColor: 'white',
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                marginBottom: 0
                                            }}
                                        >
                                            <thead>
                                                <tr style={{
                                                    backgroundColor: '#254252',
                                                    color: 'white'
                                                }}>
                                                    <th style={{
                                                        padding: '15px 20px',
                                                        fontWeight: '600',
                                                        fontSize: '0.9rem',
                                                        letterSpacing: '0.5px'
                                                    }}>Component Name</th>
                                                    <th style={{
                                                        padding: '15px 20px',
                                                        fontWeight: '600',
                                                        fontSize: '0.9rem',
                                                        letterSpacing: '0.5px'
                                                    }}>Type</th>
                                                    <th style={{
                                                        padding: '15px 20px',
                                                        fontWeight: '600',
                                                        fontSize: '0.9rem',
                                                        letterSpacing: '0.5px'
                                                    }}>Created By</th>
                                                    <th style={{
                                                        padding: '15px 20px',
                                                        fontWeight: '600',
                                                        fontSize: '0.9rem',
                                                        letterSpacing: '0.5px'
                                                    }}>Created Date</th>
                                                    <th style={{
                                                        padding: '15px 20px',
                                                        fontWeight: '600',
                                                        fontSize: '0.9rem',
                                                        letterSpacing: '0.5px',
                                                        textAlign: 'center'
                                                    }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {components.map((component) => (
                                                    <tr key={component.component_id}>
                                                        <td style={{
                                                            padding: '15px 20px',
                                                            color: '#E37239',
                                                            fontWeight: '500',
                                                            fontSize: '0.95rem'
                                                        }}>
                                                            {component.componentName}
                                                        </td>
                                                        <td style={{
                                                            padding: '15px 20px',
                                                            color: '#254252',
                                                            fontSize: '0.9rem'
                                                        }}>
                                                            {formatDisplayName(component.componentType)}
                                                        </td>
                                                        <td style={{
                                                            padding: '15px 20px',
                                                            color: '#6c757d',
                                                            fontSize: '0.9rem'
                                                        }}>
                                                            {component.created_by}
                                                        </td>
                                                        <td style={{
                                                            padding: '15px 20px',
                                                            color: '#6c757d',
                                                            fontSize: '0.9rem'
                                                        }}>
                                                            {new Date(component.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td style={{
                                                            padding: '15px 20px',
                                                            textAlign: 'center'
                                                        }}>
                                                            <Button
                                                                variant="link"
                                                                onClick={() => handleEditComponent(component)}
                                                                style={{
                                                                    color: '#E37239',
                                                                    padding: '5px 10px',
                                                                    textDecoration: 'none',
                                                                    marginRight: '5px'
                                                                }}
                                                            >
                                                                Edit
                                                            </Button>

                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                ) : (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '40px',
                                        backgroundColor: 'white',
                                        borderRadius: '16px',
                                        color: '#6c757d'
                                    }}>
                                        No components added yet. Click "Add Component" to add components to this asset.
                                    </div>
                                )}
                            </div>

                            <Row>
                                <Col lg={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        onClick={handleUpdate}
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
                                        Save Asset
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    </Form>
                </div>
            </Container>

            <style>
                {`
                    select option {
                        background-color: #fff !important;
                        color: #171C2D !important;
                        padding: 12px !important;
                    }
                    
                    input[type="date"]::-webkit-calendar-picker-indicator {
                        filter: invert(0.3);
                        cursor: pointer;
                        padding: 5px;
                    }

                    input[type="date"]::-webkit-calendar-picker-indicator:hover {
                        filter: invert(0.2);
                    }

                    @keyframes float {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(50px, -50px) rotate(120deg); }
                        66% { transform: translate(-30px, 30px) rotate(240deg); }
                    }
                `}
            </style>
        </div>
    );
}