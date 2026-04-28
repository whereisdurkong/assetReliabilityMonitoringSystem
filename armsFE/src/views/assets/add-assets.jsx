import { useEffect, useState } from 'react';
import { Form, Container, Row, Col, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Loading from '../../components/personalComponents/loading';
import AlertModal from '../../components/personalComponents/alertModal';
import {
    FiPlus, FiTrash2, FiSave, FiCalendar, FiMapPin, FiTag,
    FiBox, FiClipboard, FiCpu, FiGrid, FiArrowRight, FiArrowLeft,
    FiCheckCircle, FiAlertCircle, FiInfo, FiSliders, FiZap, FiDatabase, FiSettings
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

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
        trivector: '',
        commissioningDate: '',
        notes: '',
        hasComponents: '1'
    });

    const [components, setComponents] = useState([]);
    const [currentComponent, setCurrentComponent] = useState({
        componentType: '',
        componentName: ''
    });

    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        type: 'success',
        title: '',
        description: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [locationOptions, setLocationOptions] = useState([]);
    const [masterData, setMasterData] = useState([]);
    const [assetTypeOptions, setAssetTypeOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [componentTypeOptions, setComponentTypeOptions] = useState([]);
    const [activeSection, setActiveSection] = useState('basic');
    const [isFormValid, setIsFormValid] = useState({});

    const trivectorOptions = [
        { label: 'Rotating Machine', value: 'rotating-machine', color: '#ffbf5e' },
        { label: 'Stationary Engine', value: 'stationary-engine', color: '#4ECDC4' },
        { label: 'Mobile Engine', value: 'mobile-engine', color: '#45B7D1' }
    ];

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

                setLocationOptions(allLocations);
            } catch (error) {
                console.error('Error fetching location options:', error);
            }
        };

        fetchLocationOptions();
    }, []);

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

        setFormData(prev => ({
            ...prev,
            assetType: '',
            category: '',
            trivector: ''
        }));
    }, [formData.location]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Real-time validation
        if (value.trim()) {
            setIsFormValid(prev => ({ ...prev, [name]: true }));
        }
    };

    const handleComponentInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentComponent(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddComponent = () => {
        if (!currentComponent.componentType.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Component Type is required');
            return;
        }
        if (!currentComponent.componentName.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Component Name is required');
            return;
        }

        setComponents([...components, { ...currentComponent }]);
        setCurrentComponent({
            componentType: '',
            componentName: ''
        });

        showAlertMessage('success', 'Component Added', `${currentComponent.componentName} has been added successfully!`);
    };

    const handleRemoveComponent = (index) => {
        const updatedComponents = components.filter((_, i) => i !== index);
        setComponents(updatedComponents);
        showAlertMessage('info', 'Component Removed', 'Component has been removed from the list');
    };

    const showAlertMessage = (type, title, description) => {
        setAlertConfig({ type, title, description });
        setShowAlert(true);
    };

    const Validation = () => {
        if (!formData.assetName.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Asset Name is required');
            return false;
        }
        if (!formData.assetType.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Asset Type is required');
            return false;
        }
        if (!formData.location.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Asset Location is required');
            return false;
        }
        if (!formData.category.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Asset Category is required');
            return false;
        }
        if (!formData.trivector.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Trivector selection is required');
            return false;
        }
        if (!formData.commissioningDate.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Commissioning Date is required');
            return false;
        }

        if (components.length === 0) {
            showAlertMessage('error', 'Validation Error', 'Please add at least one component to continue');
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

        try {
            await axios.post(`${config.baseApi}/assets/add-assets`, {
                asset_name: formData.assetName,
                asset_type: formData.assetType,
                asset_location: formData.location,
                asset_category: formData.category,
                trivector: formData.trivector,
                date_commisioning: formData.commissioningDate,
                asset_notes: formData.notes,
                created_by: empInfo.user_name,
                has_components: formData.hasComponents,
                components: components
            });

            showAlertMessage(
                'success',
                'Asset Created Successfully!',
                `${formData.assetName} has been registered in the system.`
            );

            setFormData({
                assetName: '',
                assetType: '',
                location: '',
                category: '',
                trivector: '',
                commissioningDate: '',
                notes: '',
                hasComponents: '1'
            });
            setComponents([]);
            setActiveSection('basic');

            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (err) {
            console.log('Unable to submit!', err);
            showAlertMessage('error', 'Submission Failed', 'There was an error creating the asset. Please try again.');
            setIsLoading(false);
        }
    };

    const formatDisplayName = (value) => {
        return value
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const sections = [
        { id: 'basic', label: 'Asset Profile', icon: FiBox, metric: 'Identification', color: '#3B82F6' },
        { id: 'details', label: 'Classification', icon: FiTag, metric: 'Technical Data', color: '#10B981' },
        { id: 'components', label: 'Components', icon: FiCpu, metric: `${components.length} Components`, color: '#8B5CF6' }
    ];

    const getAlertIcon = (type) => {
        switch (type) {
            case 'success': return <FiCheckCircle size={24} />;
            case 'error': return <FiAlertCircle size={24} />;
            default: return <FiInfo size={24} />;
        }
    };

    // Progress calculation
    const getProgress = () => {
        let total = 0;
        let filled = 0;
        if (activeSection === 'basic') {
            const fields = ['assetName', 'location', 'assetType', 'category'];
            total = fields.length;
            filled = fields.filter(f => formData[f].trim()).length;
        } else if (activeSection === 'details') {
            const fields = ['trivector', 'commissioningDate'];
            total = fields.length;
            filled = fields.filter(f => formData[f].trim()).length;
        } else {
            total = 1;
            filled = components.length > 0 ? 1 : 0;
        }
        return (filled / total) * 100;
    };

    return (
        <div style={{
            background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
            minHeight: '100vh',
            padding: '40px',
            position: 'relative',
            overflow: 'hidden',

        }}>
            {/* Animated background elements - retained */}
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
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
                background: 'rgba(255, 255, 255, 0.05)',
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
                background: 'rgba(255, 255, 255, 0.03)',
                top: '50%',
                left: '20%',
                animation: 'float 18s infinite ease-in-out',
                zIndex: 1
            }} />

            <Loading show={isLoading} />

            <AnimatePresence>
                {showAlert && (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        style={{
                            position: 'fixed',
                            top: '20px',
                            right: '20px',
                            zIndex: 9999,
                            maxWidth: '400px'
                        }}
                    >
                        <AlertModal
                            type={alertConfig.type}
                            title={alertConfig.title}
                            description={alertConfig.description}
                            onClose={() => setShowAlert(false)}
                            autoClose={5000}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <Container fluid style={{ position: 'relative', zIndex: 2, padding: '40px' }}>
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ maxWidth: '1200px', margin: '0 auto' }}
                >
                    {/* Productivity Header with Stats */}
                    <motion.div
                        style={{ marginBottom: '40px' }}
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <FiZap size={32} color="#EAB56F" />
                                    <h1 style={{
                                        fontSize: '2.5rem',
                                        fontWeight: '700',
                                        color: '#EAB56F',
                                        textShadow: '0 4px 20px rgba(234, 181, 111, 0.2)',
                                        margin: 0,
                                        letterSpacing: '-0.5px'
                                    }}>
                                        Asset Registration
                                    </h1>
                                </div>
                                <p style={{
                                    fontSize: '1rem',
                                    color: 'rgba(255,255,255,0.7)',
                                    margin: 0,
                                    paddingLeft: '44px'
                                }}>
                                    Complete the form below to register new equipment
                                </p>
                            </div>

                        </div>
                    </motion.div>

                    {/* Productive Progress Indicator */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            background: 'rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '20px',
                            padding: '20px 30px',
                            marginBottom: '30px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
                            {sections.map((section, idx) => (
                                <motion.button
                                    key={section.id}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveSection(section.id)}
                                    style={{
                                        flex: 1,
                                        background: activeSection === section.id
                                            ? `linear-gradient(135deg, ${section.color}, ${section.color}CC)`
                                            : 'rgba(255,255,255,0.05)',
                                        border: activeSection === section.id
                                            ? `1px solid ${section.color}`
                                            : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '14px',
                                        padding: '12px 16px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        textAlign: 'left'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <section.icon size={18} color={activeSection === section.id ? '#EAB56F' : 'rgba(255,255,255,0.5)'} />
                                        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{section.label}</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{section.metric}</div>
                                </motion.button>
                            ))}
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>
                                <span>Section Completion</span>
                                <span>{Math.round(getProgress())}%</span>
                            </div>
                            <div style={{
                                height: '4px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <motion.div
                                    animate={{ width: `${getProgress()}%` }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                        height: '100%',
                                        background: `linear-gradient(90deg, #EAB56F, #F9982F)`,
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Form Card - Cleaner, more structured */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            background: '#FFFFFF',
                            borderRadius: '24px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            padding: '24px 32px',
                            borderBottom: '1px solid #E2E8F0',
                            background: '#F8FAFC'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {activeSection === 'basic' && <FiBox size={24} color="#3B82F6" />}
                                {activeSection === 'details' && <FiTag size={24} color="#10B981" />}
                                {activeSection === 'components' && <FiCpu size={24} color="#8B5CF6" />}
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: '#1E293B' }}>
                                        {activeSection === 'basic' && 'Asset Identification'}
                                        {activeSection === 'details' && 'Technical Classification'}
                                        {activeSection === 'components' && 'Component'}
                                    </h3>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#64748B' }}>
                                        {activeSection === 'basic' && 'Enter the core identifying information for the asset'}
                                        {activeSection === 'details' && 'Define technical parameters and commissioning data'}
                                        {activeSection === 'components' && 'Define the components that make up this asset'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '32px' }}>
                            <Form onSubmit={handleSubmit}>
                                <AnimatePresence mode="wait">
                                    {activeSection === 'basic' && (
                                        <motion.div
                                            key="basic"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Row>
                                                <Col lg={6}>
                                                    <div style={{ marginBottom: '24px' }}>
                                                        <Form.Group>
                                                            <Form.Label style={{
                                                                fontWeight: '500',
                                                                fontSize: '0.85rem',
                                                                color: '#334155',
                                                                marginBottom: '8px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',

                                                            }}>
                                                                <FiBox size={14} />
                                                                Asset Name <span style={{ color: '#EF4444' }}>*</span>
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="assetName"
                                                                value={formData.assetName}
                                                                onChange={handleInputChange}
                                                                placeholder="e.g., Main Conveyor Belt, Hydraulic Excavator"
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
                                                    </div>
                                                </Col>
                                                <Col lg={6}>
                                                    <div style={{ marginBottom: '24px' }}>
                                                        <Form.Group>
                                                            <Form.Label style={{
                                                                fontWeight: '500',
                                                                color: '#334155',
                                                                marginBottom: '8px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                fontSize: '0.85rem'
                                                            }}>
                                                                <FiMapPin size={14} />
                                                                Location <span style={{ color: '#EF4444' }}>*</span>
                                                            </Form.Label>
                                                            <Form.Select
                                                                name="location"
                                                                value={formData.location}
                                                                onChange={handleInputChange}
                                                                style={{
                                                                    border: '2px solid #E2E8F0',
                                                                    borderRadius: '10px',
                                                                    padding: '12px 16px',
                                                                    fontSize: '0.95rem',
                                                                    cursor: 'pointer'
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
                                                    </div>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col lg={6}>
                                                    <div style={{ marginBottom: '24px' }}>
                                                        <Form.Group>
                                                            <Form.Label style={{
                                                                fontWeight: '500',
                                                                color: '#334155',
                                                                marginBottom: '8px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                fontSize: '0.85rem'
                                                            }}>
                                                                <FiSliders size={14} />
                                                                Asset Type <span style={{ color: '#EF4444' }}>*</span>
                                                            </Form.Label>
                                                            <Form.Select
                                                                name="assetType"
                                                                value={formData.assetType}
                                                                onChange={handleInputChange}
                                                                disabled={!formData.location}
                                                                style={{
                                                                    border: '2px solid #E2E8F0',
                                                                    borderRadius: '10px',
                                                                    padding: '12px 16px',
                                                                    fontSize: '0.95rem',
                                                                    cursor: formData.location ? 'pointer' : 'not-allowed',
                                                                    background: !formData.location ? '#F1F5F9' : 'white'
                                                                }}
                                                                onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                                            >
                                                                <option value="">
                                                                    {!formData.location ? 'Select location first' : 'Select asset type'}
                                                                </option>
                                                                {assetTypeOptions.map((type, index) => (
                                                                    <option key={index} value={type}>
                                                                        {formatDisplayName(type)}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col lg={6}>
                                                    <div style={{ marginBottom: '24px' }}>
                                                        <Form.Group>
                                                            <Form.Label style={{
                                                                fontWeight: '500',
                                                                color: '#334155',
                                                                marginBottom: '8px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                fontSize: '0.85rem'
                                                            }}>
                                                                <FiGrid size={14} />
                                                                Category <span style={{ color: '#EF4444' }}>*</span>
                                                            </Form.Label>
                                                            <Form.Select
                                                                name="category"
                                                                value={formData.category}
                                                                onChange={handleInputChange}
                                                                disabled={!formData.location}
                                                                style={{
                                                                    border: '2px solid #E2E8F0',
                                                                    borderRadius: '10px',
                                                                    padding: '12px 16px',
                                                                    fontSize: '0.95rem',
                                                                    cursor: formData.location ? 'pointer' : 'not-allowed',
                                                                    background: !formData.location ? '#F1F5F9' : 'white'
                                                                }}
                                                                onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                                            >
                                                                <option value="">
                                                                    {!formData.location ? 'Select location first' : 'Select category'}
                                                                </option>
                                                                {categoryOptions.map((category, index) => (
                                                                    <option key={index} value={category}>
                                                                        {formatDisplayName(category)}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                            </Row>

                                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '8px', borderTop: '1px solid #E2E8F0' }}>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setActiveSection('details')}
                                                    type="button"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #EAB56F, #F9982F)',
                                                        border: 'none', borderRadius: '12px', padding: '14px 28px',
                                                        fontSize: '0.95rem', fontWeight: '600', color: '#fff',
                                                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                        gap: '10px', boxShadow: '0 4px 15px rgba(233, 150, 40, 0.3)',
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                    onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(233, 150, 40, 0.4)'; }}
                                                    onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(233, 150, 40, 0.3)'; }}
                                                >
                                                    Next: Classification
                                                    <FiArrowRight size={16} />
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeSection === 'details' && (
                                        <motion.div
                                            key="details"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Row>
                                                <Col lg={6}>
                                                    <div style={{ marginBottom: '24px' }}>
                                                        <Form.Group>
                                                            <Form.Label style={{
                                                                fontWeight: '500',
                                                                color: '#334155',
                                                                marginBottom: '8px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                fontSize: '0.85rem'
                                                            }}>
                                                                <FiZap size={14} />
                                                                Trivector Classification <span style={{ color: '#EF4444' }}>*</span>
                                                            </Form.Label>
                                                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                                {trivectorOptions.map((option) => (
                                                                    <div
                                                                        key={option.value}
                                                                        onClick={() => setFormData(prev => ({ ...prev, trivector: option.value }))}
                                                                        style={{
                                                                            flex: 1,
                                                                            padding: '12px',
                                                                            borderRadius: '10px',
                                                                            border: formData.trivector === option.value
                                                                                ? `2px solid ${option.color}`
                                                                                : '1px solid #E2E8F0',
                                                                            background: formData.trivector === option.value
                                                                                ? `${option.color}10`
                                                                                : 'white',
                                                                            cursor: 'pointer',
                                                                            textAlign: 'center',
                                                                            transition: 'all 0.2s'
                                                                        }}
                                                                    >
                                                                        <div style={{ fontWeight: '500', fontSize: '0.9rem', color: '#1E293B' }}>{option.label}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                                <Col lg={6}>
                                                    <div style={{ marginBottom: '24px' }}>
                                                        <Form.Group>
                                                            <Form.Label style={{
                                                                fontWeight: '500',
                                                                color: '#334155',
                                                                marginBottom: '8px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                fontSize: '0.85rem'
                                                            }}>
                                                                <FiCalendar size={14} />
                                                                Commissioning Date <span style={{ color: '#EF4444' }}>*</span>
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="date"
                                                                name="commissioningDate"
                                                                value={formData.commissioningDate}
                                                                onChange={handleInputChange}
                                                                style={{
                                                                    border: '2px solid #E2E8F0',
                                                                    borderRadius: '10px',
                                                                    padding: '12px 16px',
                                                                    fontSize: '0.95rem'
                                                                }}
                                                                onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                            </Row>

                                            <Row>
                                                <Col lg={12}>
                                                    <div style={{ marginBottom: '24px' }}>
                                                        <Form.Group>
                                                            <Form.Label style={{
                                                                fontWeight: '500',
                                                                color: '#334155',
                                                                marginBottom: '8px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '6px',
                                                                fontSize: '0.85rem'
                                                            }}>
                                                                <FiClipboard size={14} />
                                                                Technical Notes
                                                            </Form.Label>
                                                            <Form.Control
                                                                as="textarea"
                                                                rows={4}
                                                                name="notes"
                                                                value={formData.notes}
                                                                onChange={handleInputChange}
                                                                placeholder="Enter specifications, serial numbers, warranty info, or other technical details..."
                                                                style={{
                                                                    border: '2px solid #E2E8F0',
                                                                    borderRadius: '10px',
                                                                    padding: '12px 16px',
                                                                    fontSize: '0.95rem',
                                                                    resize: 'vertical'
                                                                }}
                                                                onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                                            />
                                                        </Form.Group>
                                                    </div>
                                                </Col>
                                            </Row>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '8px', borderTop: '1px solid #E2E8F0' }}>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setActiveSection('basic')}
                                                    type="button"
                                                    style={{
                                                        background: 'transparent',
                                                        border: '1px solid #CBD5E1',
                                                        borderRadius: '10px',
                                                        padding: '12px 28px',
                                                        color: '#64748B',
                                                        fontWeight: '500',
                                                        fontSize: '0.9rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        cursor: 'pointer'
                                                    }}
                                                    onHoverStart={e => e.target.style.border = '2px solid #ffae00'}
                                                    onHoverEnd={e => e.target.style.border = '1px solid #CBD5E1'}

                                                >
                                                    <FiArrowLeft size={16} />
                                                    Back
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setActiveSection('components')}
                                                    type="button"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #EAB56F, #F9982F)',
                                                        border: 'none', borderRadius: '12px', padding: '14px 28px',
                                                        fontSize: '0.95rem', fontWeight: '600', color: '#fff',
                                                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                        gap: '10px', boxShadow: '0 4px 15px rgba(233, 150, 40, 0.3)',
                                                        transition: 'all 0.2s ease',
                                                    }}
                                                    onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(233, 150, 40, 0.4)'; }}
                                                    onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(233, 150, 40, 0.3)'; }}
                                                >
                                                    Next: Components
                                                    <FiArrowRight size={16} />
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeSection === 'components' && (
                                        <motion.div
                                            key="components"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div style={{ marginBottom: '28px' }}>
                                                <div style={{
                                                    background: '#F1F5F9',
                                                    borderRadius: '12px',
                                                    padding: '16px',
                                                    marginBottom: '24px'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <FiDatabase size={20} color="#8B5CF6" />
                                                        <div>
                                                            <div style={{ fontWeight: '500', color: '#1E293B' }}>Component Types</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>Each asset requires at least one component</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Row style={{ marginBottom: '24px' }}>
                                                    <Col lg={5}>
                                                        <Form.Group>
                                                            <Form.Label style={{ fontWeight: '500', color: '#334155', marginBottom: '6px', fontSize: '0.8rem' }}>
                                                                Component Type <span style={{ color: '#EF4444' }}>*</span>
                                                            </Form.Label>
                                                            <Form.Select
                                                                name="componentType"
                                                                value={currentComponent.componentType}
                                                                onChange={handleComponentInputChange}
                                                                disabled={!formData.location}
                                                                style={{
                                                                    border: '2px solid #E2E8F0',
                                                                    borderRadius: '10px',
                                                                    padding: '10px 14px',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                                onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                                            >
                                                                <option value="">
                                                                    {!formData.location ? 'Select location first' : 'Select type'}
                                                                </option>
                                                                {componentTypeOptions.map((compType, index) => (
                                                                    <option key={index} value={compType}>
                                                                        {formatDisplayName(compType)}
                                                                    </option>
                                                                ))}
                                                            </Form.Select>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col lg={5}>
                                                        <Form.Group>
                                                            <Form.Label style={{ fontWeight: '500', color: '#334155', marginBottom: '6px', fontSize: '0.8rem' }}>
                                                                Component Name <span style={{ color: '#EF4444' }}>*</span>
                                                            </Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="componentName"
                                                                value={currentComponent.componentName}
                                                                onChange={handleComponentInputChange}
                                                                placeholder="e.g., Hydraulic Pump, Drive Motor"
                                                                style={{
                                                                    border: '2px solid #E2E8F0',
                                                                    borderRadius: '10px',
                                                                    padding: '10px 14px',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                                onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col lg={2} style={{ display: 'flex', alignItems: 'flex-end' }}>
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={handleAddComponent}
                                                            type="button"
                                                            style={{
                                                                width: '100%',
                                                                padding: '10px',
                                                                background: '#8B5CF6',
                                                                border: 'none',
                                                                borderRadius: '10px',
                                                                color: 'white',
                                                                fontWeight: '500',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                gap: '6px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.9rem'
                                                            }}
                                                        >
                                                            <FiPlus size={14} />
                                                            Add
                                                        </motion.button>
                                                    </Col>
                                                </Row>

                                                <AnimatePresence>
                                                    {components.length > 0 ? (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            style={{
                                                                border: '1px solid #E2E8F0',
                                                                borderRadius: '16px',
                                                                overflow: 'hidden',
                                                                marginBottom: '24px'
                                                            }}
                                                        >
                                                            <div style={{
                                                                background: '#F8FAFC',
                                                                padding: '12px 16px',
                                                                borderBottom: '1px solid #E2E8F0',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center'
                                                            }}>
                                                                <span style={{ fontWeight: '500', fontSize: '0.85rem', color: '#1E293B' }}>
                                                                    Component List ({components.length})
                                                                </span>
                                                            </div>
                                                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                                                {components.map((comp, index) => (
                                                                    <motion.div
                                                                        key={index}
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        exit={{ opacity: 0 }}
                                                                        style={{
                                                                            display: 'flex',
                                                                            justifyContent: 'space-between',
                                                                            alignItems: 'center',
                                                                            padding: '12px 16px',
                                                                            borderBottom: '1px solid #F1F5F9',
                                                                            background: 'white'
                                                                        }}
                                                                    >
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                            <div style={{
                                                                                width: '28px',
                                                                                height: '28px',
                                                                                background: '#F3E8FF',
                                                                                borderRadius: '8px',
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                color: '#8B5CF6'
                                                                            }}>
                                                                                <FiSettings size={14} />
                                                                            </div>
                                                                            <div>
                                                                                <div style={{ fontWeight: '500', fontSize: '0.9rem', color: '#1E293B' }}>
                                                                                    {comp.componentName}
                                                                                </div>
                                                                                <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                                                                    {formatDisplayName(comp.componentType)}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.1 }}
                                                                            whileTap={{ scale: 0.9 }}
                                                                            onClick={() => handleRemoveComponent(index)}
                                                                            style={{
                                                                                background: 'none',
                                                                                border: 'none',
                                                                                color: '#EF4444',
                                                                                cursor: 'pointer',
                                                                                padding: '8px'
                                                                            }}
                                                                        >
                                                                            <FiTrash2 size={16} />
                                                                        </motion.button>
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            style={{
                                                                textAlign: 'center',
                                                                padding: '40px',
                                                                background: '#F8FAFC',
                                                                borderRadius: '16px',
                                                                marginBottom: '24px',
                                                                border: '1px dashed #CBD5E1'
                                                            }}
                                                        >
                                                            <FiCpu size={40} style={{ marginBottom: '12px', opacity: 0.4, color: '#8B5CF6' }} />
                                                            <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem' }}>No components added yet</p>
                                                            <p style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Add at least one component to complete registration</p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #E2E8F0' }}>
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setActiveSection('details')}
                                                        type="button"
                                                        style={{
                                                            background: 'transparent',
                                                            border: '1px solid #CBD5E1',
                                                            borderRadius: '10px',
                                                            padding: '12px 28px',
                                                            color: '#64748B',
                                                            fontWeight: '500',
                                                            fontSize: '0.9rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            cursor: 'pointer'
                                                        }}
                                                        onHoverStart={e => e.target.style.border = '2px solid #ffae00'}
                                                        onHoverEnd={e => e.target.style.border = '1px solid #CBD5E1'}
                                                    >
                                                        <FiArrowLeft size={16} />
                                                        Back
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        type="submit"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #EAB56F, #F9982F)',
                                                            border: 'none', borderRadius: '12px', padding: '14px 28px',
                                                            fontSize: '0.95rem', fontWeight: '600', color: '#fff',
                                                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                            gap: '10px', boxShadow: '0 4px 15px rgba(233, 150, 40, 0.3)',
                                                            transition: 'all 0.2s ease',
                                                        }}
                                                        onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(233, 150, 40, 0.4)'; }}
                                                        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(233, 150, 40, 0.3)'; }}
                                                        disabled={components.length === 0}
                                                    >
                                                        <FiSave size={16} />
                                                        Register Asset
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Form>
                        </div>
                    </motion.div>

                    {/* Productivity Tip */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{
                            marginTop: '24px',
                            textAlign: 'center',
                            fontSize: '0.8rem',
                            color: 'rgba(255,255,255,0.5)'
                        }}
                    >
                        <FiZap size={12} style={{ display: 'inline', marginRight: '6px' }} />
                        Tip: Complete all required fields marked with <span style={{ color: '#EF4444' }}>*</span> to ensure accurate asset tracking
                    </motion.div>
                </motion.div>
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