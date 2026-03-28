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
        commissioningDate: '',
        notes: '',
        hasComponents: '0' // '0' for NO, '1' for YES
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

    // Remove the duplicate useEffect - you have two identical ones. Keep only one:

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

        // // Clear asset type if location is empty or if it's not a mill location
        // if (!formData.location) {
        //     // If no location selected, clear asset type
        //     setFormData(prev => ({ ...prev, assetType: '' }));
        // } else if (!isMillLocation && formData.assetType) {
        //     // If location is not a mill location but there's an asset type selected, clear it
        //     setFormData(prev => ({ ...prev, assetType: '' }));

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
        // }
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
        console.log('COMPONENTS: ', components);
        console.log('HAS COMPONENTS: ', formData.hasComponents);

        try {
            await axios.post(`${config.baseApi}/assets/add-assets`, {
                asset_name: formData.assetName,
                asset_type: formData.assetType,
                asset_location: formData.location,
                asset_category: formData.category,
                date_commisioning: formData.commissioningDate,
                asset_notes: formData.notes,
                created_by: empInfo.user_name,
                has_components: formData.hasComponents, // Send the has_components value
                components: components // Send components array to backend
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
                                            {/* Mill */}
                                            <option value="mill_crushing_plant" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Mill Crushing Plant</option>
                                            <option value="mill_washing_plant" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Mill Washing Plant</option>
                                            <option value="mill_grinding_plant" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Mill Grinding Plant</option>
                                            <option value="mill_cip_complex" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Mill CIP Complex</option>
                                            <option value="mill_lower_tram" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Mill Lower Tram</option>
                                            <option value="mill_lime_plant" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Mill Lime Plant</option>
                                            {/* MME AND Workshop */}
                                            <option value="mme_workshop_blablabla" style={{ backgroundColor: '#fff', color: '#171C2D' }}>MME & Workshop BLA BLA BLA</option>
                                            {/* SMED */}
                                            <option value="smed_nayak" style={{ backgroundColor: '#fff', color: '#171C2D' }}>SMED Nayak</option>
                                            <option value="smed_tubo" style={{ backgroundColor: '#fff', color: '#171C2D' }}>SMED Tubo</option>
                                            <option value="smed_upper_tram" style={{ backgroundColor: '#fff', color: '#171C2D' }}>SMED Upper Tram</option>
                                            <option value="smed_cip_grinding" style={{ backgroundColor: '#fff', color: '#171C2D' }}>SMED CIP & Grinding</option>
                                            <option value="smed_power_plant" style={{ backgroundColor: '#fff', color: '#171C2D' }}>SMED Power Plant</option>
                                            <option value="surface" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Surface - Open Pit</option>
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
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#E37239';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e9ecef';
                                            }}
                                        >
                                            <option value="" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Select asset type</option>

                                            {mill && (
                                                <>
                                                    <option value="gearbox" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Gearbox</option>
                                                    <option value="geared_motor" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Geared Motor</option>
                                                    <option value="geared_exciter" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Geared Exciter</option>
                                                    <option value="hydraulic_drive" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Hydraulic Drive</option>
                                                    <option value="recirculating_oil_system" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Recirculating Oil System</option>
                                                </>
                                            )}
                                            {mmeandworkshop && (
                                                <>
                                                    <option value="rotary_screw_compressors" style={{ backgroundColor: '#fff', color: '#171C2D' }}>WORKSHOP</option>
                                                    <option value="rotary_screw_compressors" style={{ backgroundColor: '#fff', color: '#171C2D' }}>MME</option>
                                                </>
                                            )}

                                            {smed && (
                                                <>
                                                    <option value="rotary_screw_compressors" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Rotary Screw Compressors</option>
                                                    <option value="piston_compressors" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Piston Compressors</option>
                                                    <option value="stationary_engines" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Stationary Engines</option>
                                                </>
                                            )}

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
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#E37239';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e9ecef';
                                            }}
                                        >
                                            <option value="" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Select category</option>
                                            {mill && (
                                                <>
                                                    <option value="conveyor" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Conveyor</option>
                                                    <option value="tertiary_feeder" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Tertiary Feeder</option>
                                                    <option value="surge_bin_feeder" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Surge Bin Feeder</option>
                                                    <option value="classifier" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Classifier</option>
                                                    <option value="vibrating_screen" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Vibrating Screen</option>
                                                    <option value="cone_crusher" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Cone Crusher</option>
                                                    <option value="cone_crusher_ros" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Cone Crusher ROS</option>
                                                    <option value="washing_screen" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Washing Screen</option>
                                                    <option value="rod_mill" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Rod Mill</option>
                                                    <option value="rod_mill_ros" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Rod Mill ROS</option>
                                                    <option value="ball_mill" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Ball Mill</option>
                                                    <option value="ball_mill_ros" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Ball Mill ROS</option>
                                                    <option value="adsorption_tank" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Adsorption Tank</option>
                                                    <option value="leach_tank" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Leach Tank</option>
                                                    <option value="gear" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Gear</option>
                                                    <option value="hydraulic" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Hydraulic</option>
                                                    <option value="pump" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Pump</option>
                                                    <option value="p&h_crane" style={{ backgroundColor: '#fff', color: '#171C2D' }}>P&H Crane</option>
                                                    <option value="agitator" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Agitator</option>
                                                    <option value="screw_feeder" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Screw Feeder</option>

                                                </>
                                            )}

                                            {mmeandworkshop && (
                                                <option value="smeedddok" style={{ backgroundColor: '#fff', color: '#171C2D' }}>MME & WORKSHOP</option>
                                            )}

                                            {smed && (
                                                <option value="smeedddok" style={{ backgroundColor: '#fff', color: '#171C2D' }}>SMEED</option>
                                            )}


                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row style={{ marginBottom: '30px' }}>
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

                                <Col lg={6}>
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
                                                    setComponents([]); // Clear components when toggled off
                                                }
                                            }}
                                        >
                                            {/* The Switch */}
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

                                            {/* Yes/No Labels */}
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
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = '#E37239';
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = '#e9ecef';
                                                    }}
                                                >

                                                    <option value="" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Select category</option>
                                                    {mill && (
                                                        <>
                                                            <option value="gear_pressure" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Gear,Pressure</option>
                                                            <option value="gera_splash" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Gear, Splash</option>
                                                            <option value="bearing_oil_lubricated" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Bearing, Oil lubricated</option>
                                                            <option value="hydraulic_mineral_high_Preassure_200-3000_psi" style={{ backgroundColor: '#fff', color: '#171C2D' }}>Hydraulic, Mineral, High Pressure 2000-3000 psi</option>
                                                        </>
                                                    )}

                                                    {mmeandworkshop && (
                                                        <>
                                                            <option value="gear_pressure" style={{ backgroundColor: '#fff', color: '#171C2D' }}>TEST COMPONENT MME</option>
                                                        </>
                                                    )}

                                                    {smed && (
                                                        <>
                                                            <option value="gear_pressure" style={{ backgroundColor: '#fff', color: '#171C2D' }}>TEST COMPONENT SMED</option>
                                                        </>
                                                    )}



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
                                                                <strong style={{ color: '#E37239' }}>{comp.componentType}</strong>
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