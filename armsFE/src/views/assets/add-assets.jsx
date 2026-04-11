import { useEffect, useState } from 'react';
import { Form, Container, Row, Col, Button, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Loading from '../../components/personalComponents/loading';
import AlertModal from '../../components/personalComponents/alertModal';

import axios from 'axios';
import config from 'config';

export default function AddAsset() {
    const [mill, setMill] = useState(false);
    const [mmeandworkshop, setMmenadworkshop] = useState(false);
    const [smed, setSmed] = useState(false)
    const [formData, setFormData] = useState({
        assetName: '',
        assetType: '',
        location: '',
        category: '',
        trivector: '', // Added trivector field
        commissioningDate: '',
        notes: '',
        hasComponents: '0'
    });

    // Components array to store multiple components
    const [components, setComponents] = useState([]);
    const [currentComponent, setCurrentComponent] = useState({
        componentType: '',
        componentName: ''
    });

    // Alert state
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        type: 'success',
        title: '',
        description: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [locationOptions, setLocationOptions] = useState([]);

    // Store the full API data for filtering
    const [masterData, setMasterData] = useState([]);

    // State for filtered options
    const [assetTypeOptions, setAssetTypeOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [componentTypeOptions, setComponentTypeOptions] = useState([]);

    // Trivector options
    const trivectorOptions = [
        { label: 'Rotating Machine', value: 'rotating-machine' },
        { label: 'Stationary Engine', value: 'stationary-engine' },
        { label: 'Mobile Engine', value: 'mobile-engine' }
    ];
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

                console.log(compTypes)
            } else {
                setComponentTypeOptions([]);
            }

            console.log('Asset Types for selected location:', assetTypeOptions);
            console.log('Categories for selected location:', categoryOptions);
            console.log('Component Types for selected location:', componentTypeOptions);
        } else {
            // No matching data found
            setAssetTypeOptions([]);
            setCategoryOptions([]);
            setComponentTypeOptions([]);
        }
    }, [formData.location, masterData]);

    // Effect to set mill, mmeandworkshop, smed based on selected location
    useEffect(() => {
        const millLocations = [
            'mill_crushing_plant',
            'mill_washing_plant',
            'mill_grinding_plant',
            'mill_cip_complex',
            'mill_lower_tram',
            'mill_lime_plant'
        ];

        const isMillLocation = millLocations.includes(formData.location);
        setMill(isMillLocation);

        const mmeandworkshopLocations = [
            'mme_workshop_blablabla'
        ];
        const isMMEWorkshopLocation = mmeandworkshopLocations.includes(formData.location);
        setMmenadworkshop(isMMEWorkshopLocation);

        const smedlocations = [
            'smed_nayak',
            'smed_tubo',
            'smed_upper_tram',
            'smed_cip_grinding',
            'smed_power_plant'
        ];
        const isSMEDLocation = smedlocations.includes(formData.location);
        setSmed(isSMEDLocation);

        // Reset asset type and category when location changes
        setFormData(prev => ({
            ...prev,
            assetType: '',
            category: '',
            trivector: '' // Reset trivector when location changes
        }));
    }, [formData.location]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleComponentInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentComponent(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddComponent = () => {
        // Validate component fields
        if (!currentComponent.componentType.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Component Type is required');
            return;
        }
        if (!currentComponent.componentName.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Component Name is required');
            return;
        }

        // Add component to the list
        setComponents([...components, { ...currentComponent }]);

        // Reset current component
        setCurrentComponent({
            componentType: '',
            componentName: ''
        });

        showAlertMessage('success', 'Component Added', `${currentComponent.componentName} has been added`);
    };

    const handleRemoveComponent = (index) => {
        const updatedComponents = components.filter((_, i) => i !== index);
        setComponents(updatedComponents);
        showAlertMessage('info', 'Component Removed', 'Component has been removed');
    };

    // Function to show alert messages
    const showAlertMessage = (type, title, description) => {
        setAlertConfig({ type, title, description });
        setShowAlert(true);
    };

    const Validation = () => {
        if (!formData.assetName.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Asset Name is empty');
            setIsLoading(false);
            return false;
        }
        if (!formData.assetType.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Asset Type is empty');
            setIsLoading(false);
            return false;
        }
        if (!formData.location.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Asset Location is empty');
            setIsLoading(false);
            return false;
        }
        if (!formData.category.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Asset Category is empty');
            setIsLoading(false);
            return false;
        }
        // Optional: Add validation for trivector if required
        if (!formData.trivector.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Trivector is required');
            setIsLoading(false);
            return false;
        }
        if (!formData.commissioningDate.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Asset Commissioning Date is empty');
            setIsLoading(false);
            return false;
        }

        // Validate that if hasComponents is '1', there must be at least one component
        if (formData.hasComponents === '1' && components.length === 0) {
            showAlertMessage('error', 'Validation Error', 'Please add at least one component');
            setIsLoading(false);
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true);

        const empInfo = JSON.parse(localStorage.getItem("user"));
        if (!Validation()) {
            setIsLoading(false);
            return;
        }

        console.log('DATE COMMISIONING: ', formData.commissioningDate);
        console.log('TRIVECTOR: ', formData.trivector); // Log trivector value
        console.log('COMPONENTS: ', components);
        console.log('HAS COMPONENTS: ', formData.hasComponents);

        try {
            await axios.post(`${config.baseApi}/assets/add-assets`, {
                asset_name: formData.assetName,
                asset_type: formData.assetType,
                asset_location: formData.location,
                asset_category: formData.category,
                trivector: formData.trivector, // Include trivector in the request
                date_commisioning: formData.commissioningDate,
                asset_notes: formData.notes,
                created_by: empInfo.user_name,
                has_components: formData.hasComponents,
                components: components
            }).then((res) => {

                // Show success message
                showAlertMessage(
                    'success',
                    'Successful!',
                    `Asset ${formData.assetName} was successfully created!`
                );

                setFormData({
                    assetName: '',
                    assetType: '',
                    location: '',
                    category: '',
                    trivector: '', // Reset trivector
                    commissioningDate: '',
                    notes: '',
                    hasComponents: '0'
                });
                setComponents([]);

                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            });
        } catch (err) {
            console.log('Unable to submit!', err);
            setIsLoading(false);
        }
    };

    // Helper function to format display names
    const formatDisplayName = (value) => {
        return value
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
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
                        <div style={{ marginBottom: '15px' }}>
                            <h1 style={{
                                fontSize: '3.5rem',
                                fontWeight: '800',
                                color: '#EAB56F',
                                marginBottom: '10px',
                                letterSpacing: '-0.5px',
                                textShadow: '0 4px 20px rgba(234, 181, 111, 0.2)'
                            }}>Add New Asset</h1>
                            <p style={{
                                fontSize: '1.2rem',
                                color: '#F9982F',
                                opacity: '0.9',
                                fontWeight: '400',
                                maxWidth: '600px',
                                margin: '0'
                            }}>Fill in the details below to register a new asset in the system</p>
                        </div>
                    </div>

                    <Form onSubmit={handleSubmit}>
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
                                            value={formData.assetName}
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
                                            value={formData.location}
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
                                            <option value="" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Select location</option>
                                            {/* Dynamically render options from API */}
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
                                            value={formData.assetType}
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
                                            <option value="" style={{ backgroundColor: '#fff', color: '#171C2D' }}>
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
                                            value={formData.category}
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
                                            <option value="" style={{ backgroundColor: '#fff', color: '#171C2D' }}>
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

                            {/* New Row for Trivector */}
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
                                            value={formData.trivector}
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
                                                <option key={index} value={option.value}>
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
                                            value={formData.commissioningDate}
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
                                            value={formData.notes}
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
                                <Form.Group className="mb-1">
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        gap: '15px'
                                    }}>
                                        <Form.Label style={{
                                            fontWeight: '600',
                                            fontSize: '0.9rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            color: '#254252',
                                            display: 'block',
                                            marginBottom: 0
                                        }}>
                                            Components <span style={{ color: '#E37239' }}>*</span>
                                        </Form.Label>

                                        {/* Slide Toggle Switch */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                                const newValue = formData.hasComponents === '1' ? '0' : '1';
                                                setFormData({ ...formData, hasComponents: newValue });
                                                if (newValue === '0') {
                                                    setComponents([]);
                                                }
                                            }}
                                        >
                                            <div style={{
                                                width: '60px',
                                                height: '30px',
                                                background: formData.hasComponents === '1'
                                                    ? 'linear-gradient(45deg, #28a745, #20c997)'
                                                    : '#dc3545',
                                                borderRadius: '30px',
                                                position: 'relative',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                            }}>
                                                <div style={{
                                                    width: '26px',
                                                    height: '26px',
                                                    background: 'white',
                                                    borderRadius: '50%',
                                                    position: 'absolute',
                                                    top: '2px',
                                                    left: formData.hasComponents === '1' ? '32px' : '2px',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                                                }} />
                                            </div>
                                            <span style={{
                                                fontSize: '0.9rem',
                                                fontWeight: '600',
                                                color: formData.hasComponents === '1' ? '#28a745' : '#dc3545',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {formData.hasComponents === '1' ? 'YES' : 'NO'}
                                            </span>
                                        </div>
                                    </div>
                                </Form.Group>
                            </Row>

                            {/* Component Fields - Show only when toggle is YES */}
                            {formData.hasComponents === '1' && (
                                <>
                                    <Row style={{ marginBottom: '20px' }}>
                                        <Col lg={5}>
                                            <Form.Group>
                                                <Form.Label style={{
                                                    fontWeight: '600',
                                                    fontSize: '0.9rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: '#254252',
                                                    display: 'block'
                                                }}>Component Type</Form.Label>
                                                <Form.Select
                                                    name="componentType"
                                                    value={currentComponent.componentType}
                                                    onChange={handleComponentInputChange}
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
                                                    <option value="" style={{ backgroundColor: '#fff', color: '#171C2D' }}>
                                                        {!formData.location ? 'Please select a location first' : 'Select component type'}
                                                    </option>
                                                    {componentTypeOptions.map((compType, index) => (
                                                        <option
                                                            key={index}
                                                            value={compType}
                                                            style={{ backgroundColor: '#fff', color: '#171C2D' }}
                                                        >
                                                            {formatDisplayName(compType)}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col lg={5}>
                                            <Form.Group>
                                                <Form.Label style={{
                                                    fontWeight: '600',
                                                    fontSize: '0.9rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    color: '#254252',
                                                    display: 'block'
                                                }}>Component Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="componentName"
                                                    value={currentComponent.componentName}
                                                    onChange={handleComponentInputChange}
                                                    placeholder="Enter component name (e.g., Hydraulic Motor A1)"
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
                                        <Col lg={2} style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <Button
                                                onClick={handleAddComponent}
                                                style={{
                                                    background: 'linear-gradient(45deg, #EAB56F, #F9982F)',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    padding: '16px 20px',
                                                    fontSize: '1rem',
                                                    fontWeight: '600',
                                                    color: '#fff',
                                                    cursor: 'pointer',
                                                    width: '100%',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'scale(1.02)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'scale(1)';
                                                }}
                                            >
                                                Add Component
                                            </Button>
                                        </Col>
                                    </Row>

                                    {/* Display Added Components */}
                                    {components.length > 0 && (
                                        <Row style={{ marginTop: '20px' }}>
                                            <Col lg={12}>
                                                <div style={{
                                                    background: 'rgba(37, 66, 82, 0.1)',
                                                    borderRadius: '12px',
                                                    padding: '20px',
                                                    border: '1px solid rgba(227, 114, 57, 0.2)'
                                                }}>
                                                    <h4 style={{
                                                        fontSize: '1rem',
                                                        fontWeight: '600',
                                                        color: '#254252',
                                                        marginBottom: '15px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        Added Components ({components.length})
                                                    </h4>
                                                    {components.map((comp, index) => (
                                                        <div key={index} style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            background: '#fff',
                                                            padding: '12px 15px',
                                                            marginBottom: '10px',
                                                            borderRadius: '8px',
                                                            border: '1px solid #e9ecef'
                                                        }}>
                                                            <div>
                                                                <strong style={{ color: '#E37239' }}>{formatDisplayName(comp.componentType)}</strong>
                                                                <span style={{ margin: '0 10px', color: '#254252' }}>|</span>
                                                                <span style={{ color: '#254252' }}>{comp.componentName}</span>
                                                            </div>
                                                            <Button
                                                                variant="link"
                                                                onClick={() => handleRemoveComponent(index)}
                                                                style={{
                                                                    color: '#dc3545',
                                                                    textDecoration: 'none',
                                                                    padding: '5px 10px',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Col>
                                        </Row>
                                    )}
                                </>
                            )}

                            {/* ADD BUTTON */}
                            <Row style={{ marginTop: components.length > 0 ? '20px' : '0' }}>
                                <Col lg={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        type="submit"
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
                                        Add Asset
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    </Form>
                </div>
            </Container>

            <style>
                {`
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