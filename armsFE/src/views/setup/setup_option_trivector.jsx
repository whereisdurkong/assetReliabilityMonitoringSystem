import { Form, Container, Row, Col, Button, Badge, Card, InputGroup } from 'react-bootstrap';
import { useState } from 'react';
import axios from 'axios';
import config from 'config';

import Loading from '../../components/personalComponents/loading';
import AlertModal from '../../components/personalComponents/alertModal';

export default function TrivectorOption() {
    const empInfo = JSON.parse(localStorage.getItem("user"));
    const [trivectorName, setTrivectorName] = useState('');
    // Trivector Fields
    const [wearMetal, setWearMetal] = useState([{ parameter: '', unit: '' }]);
    const [contaminants, setContaminants] = useState([{ parameter: '', unit: '' }]);
    const [chemistryViscosity, setChemistryViscosity] = useState([{ parameter: '', unit: '' }]);

    // Alert state
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        type: 'success',
        title: '',
        description: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    // Function to show alert messages
    const showAlertMessage = (type, title, description) => {
        setAlertConfig({ type, title, description });
        setShowAlert(true);
    };

    // Wear Metal handlers
    const addWearMetal = () => {
        setWearMetal([...wearMetal, { parameter: '', unit: '' }]);
    };

    const updateWearMetal = (index, field, value) => {
        const updatedWearMetal = [...wearMetal];
        updatedWearMetal[index][field] = value;
        setWearMetal(updatedWearMetal);
    };

    const removeWearMetal = (index) => {
        const updatedWearMetal = wearMetal.filter((_, i) => i !== index);
        setWearMetal(updatedWearMetal);
    };

    // Contaminants handlers
    const addContaminant = () => {
        setContaminants([...contaminants, { parameter: '', unit: '' }]);
    };

    const updateContaminant = (index, field, value) => {
        const updatedContaminants = [...contaminants];
        updatedContaminants[index][field] = value;
        setContaminants(updatedContaminants);
    };

    const removeContaminant = (index) => {
        const updatedContaminants = contaminants.filter((_, i) => i !== index);
        setContaminants(updatedContaminants);
    };

    // Chemistry and Viscosity handlers
    const addChemistryViscosity = () => {
        setChemistryViscosity([...chemistryViscosity, { parameter: '', unit: '' }]);
    };

    const updateChemistryViscosity = (index, field, value) => {
        const updatedChemistryViscosity = [...chemistryViscosity];
        updatedChemistryViscosity[index][field] = value;
        setChemistryViscosity(updatedChemistryViscosity);
    };

    const removeChemistryViscosity = (index) => {
        const updatedChemistryViscosity = chemistryViscosity.filter((_, i) => i !== index);
        setChemistryViscosity(updatedChemistryViscosity);
    };

    const Validation = () => {
        // Check if trivector name is provided
        if (!trivectorName.trim()) {
            showAlertMessage('error', 'Validation Error', 'Please enter a Trivector Name.');
            return false;
        }

        // Check if at least one parameter is added in any category
        const hasWearMetal = wearMetal.some(item => item.parameter.trim() !== '');
        const hasContaminants = contaminants.some(item => item.parameter.trim() !== '');
        const hasChemistryViscosity = chemistryViscosity.some(item => item.parameter.trim() !== '');

        if (!hasWearMetal && !hasContaminants && !hasChemistryViscosity) {
            showAlertMessage('error', 'Validation Error', 'Please add at least one parameter in Wear Metal, Contaminants, or Chemistry & Viscosity.');
            return false;
        }

        // Validate each category's parameter fields
        // For Wear Metal
        for (let i = 0; i < wearMetal.length; i++) {
            const item = wearMetal[i];
            // If parameter is filled but unit is empty
            if (item.parameter.trim() !== '' && !item.unit.trim()) {
                showAlertMessage('error', 'Validation Error', `Wear Metal item ${i + 1}: Please enter a unit for "${item.parameter}".`);
                return false;
            }
            // If unit is filled but parameter is empty
            if (item.unit.trim() !== '' && !item.parameter.trim()) {
                showAlertMessage('error', 'Validation Error', `Wear Metal item ${i + 1}: Please enter a parameter name.`);
                return false;
            }
        }

        // For Contaminants
        for (let i = 0; i < contaminants.length; i++) {
            const item = contaminants[i];
            if (item.parameter.trim() !== '' && !item.unit.trim()) {
                showAlertMessage('error', 'Validation Error', `Contaminant item ${i + 1}: Please enter a unit for "${item.parameter}".`);
                return false;
            }
            if (item.unit.trim() !== '' && !item.parameter.trim()) {
                showAlertMessage('error', 'Validation Error', `Contaminant item ${i + 1}: Please enter a parameter name.`);
                return false;
            }
        }

        // For Chemistry & Viscosity
        for (let i = 0; i < chemistryViscosity.length; i++) {
            const item = chemistryViscosity[i];
            if (item.parameter.trim() !== '' && !item.unit.trim()) {
                showAlertMessage('error', 'Validation Error', `Chemistry & Viscosity item ${i + 1}: Please enter a unit for "${item.parameter}".`);
                return false;
            }
            if (item.unit.trim() !== '' && !item.parameter.trim()) {
                showAlertMessage('error', 'Validation Error', `Chemistry & Viscosity item ${i + 1}: Please enter a parameter name.`);
                return false;
            }
        }

        // Check for duplicate parameter names within the same category
        const wearMetalParams = wearMetal.filter(item => item.parameter.trim() !== '').map(item => item.parameter.trim().toLowerCase());
        const duplicateWearMetal = wearMetalParams.filter((item, index) => wearMetalParams.indexOf(item) !== index);
        if (duplicateWearMetal.length > 0) {
            showAlertMessage('error', 'Validation Error', `Duplicate wear metal parameters found: ${duplicateWearMetal.join(', ')}`);
            return false;
        }

        const contaminantParams = contaminants.filter(item => item.parameter.trim() !== '').map(item => item.parameter.trim().toLowerCase());
        const duplicateContaminants = contaminantParams.filter((item, index) => contaminantParams.indexOf(item) !== index);
        if (duplicateContaminants.length > 0) {
            showAlertMessage('error', 'Validation Error', `Duplicate contaminant parameters found: ${duplicateContaminants.join(', ')}`);
            return false;
        }

        const chemistryParams = chemistryViscosity.filter(item => item.parameter.trim() !== '').map(item => item.parameter.trim().toLowerCase());
        const duplicateChemistry = chemistryParams.filter((item, index) => chemistryParams.indexOf(item) !== index);
        if (duplicateChemistry.length > 0) {
            showAlertMessage('error', 'Validation Error', `Duplicate chemistry & viscosity parameters found: ${duplicateChemistry.join(', ')}`);
            return false;
        }

        return true;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        // if (!Validation()) {
        //     setIsLoading(false);
        //     return;
        // }

        // Filter out empty trivector fields
        const validWearMetal = wearMetal.filter(item => item.parameter.trim() !== '');
        const validContaminants = contaminants.filter(item => item.parameter.trim() !== '');
        const validChemistryViscosity = chemistryViscosity.filter(item => item.parameter.trim() !== '');

        try {
            // STEP 1: Create trivector first to get its ID
            const trivectorResponse = await axios.post(`${config.baseApi}/assetsAnalysis/add-trivector`, {
                trivectorName: trivectorName,
                option_trivector_wear_metal: [], // Empty for now
                option_trivector_contaminants: [], // Empty for now
                option_trivector_chemical_viscosity: [], // Empty for now
                created_by: empInfo.user_name
            });

            const trivector_id = trivectorResponse.data.data.trivectorId;
            console.log('Trivector created with ID:', trivector_id);

            // STEP 2: Save all wear metal items with trivector_id
            const wearMetalIds = [];
            for (const wearMetalItem of validWearMetal) {
                const response = await axios.post(`${config.baseApi}/assetsAnalysis/add-wear-metal`, {
                    parameter: wearMetalItem.parameter,
                    unit: wearMetalItem.unit,
                    trivector_id: trivector_id // Associate with trivector
                });
                if (response.data && response.data.id) {
                    wearMetalIds.push(response.data.id);
                }
            }

            // STEP 3: Save all contaminants with trivector_id
            const contaminantsIds = [];
            for (const contaminantsItem of validContaminants) {
                const response = await axios.post(`${config.baseApi}/assetsAnalysis/add-contaminant`, {
                    parameter: contaminantsItem.parameter,
                    unit: contaminantsItem.unit,
                    trivector_id: trivector_id // Associate with trivector
                });
                if (response.data && response.data.id) {
                    contaminantsIds.push(response.data.id);
                }
            }

            // STEP 4: Save all chemistry/viscosity items with trivector_id
            const chemviscosityIds = [];
            for (const chemviscosityItem of validChemistryViscosity) {
                const response = await axios.post(`${config.baseApi}/assetsAnalysis/add-chemviscosity`, {
                    parameter: chemviscosityItem.parameter,
                    unit: chemviscosityItem.unit,
                    trivector_id: trivector_id // Associate with trivector
                });
                if (response.data && response.data.id) {
                    chemviscosityIds.push(response.data.id);
                }
            }

            // STEP 5: Update trivector with all the collected IDs
            await axios.post(`${config.baseApi}/assetsAnalysis/update-trivector`, {
                trivector_id: trivector_id,
                option_trivector_wear_metal: wearMetalIds,
                option_trivector_contaminants: contaminantsIds,
                option_trivector_chemical_viscosity: chemviscosityIds
            });

            console.log('Trivector setup saved successfully with ID:', trivector_id);

            setIsLoading(false);
            showAlertMessage('success', 'Saved Successfully', `Trivector setup saved successfully.`);

            // Optional: Redirect or reload after a delay
            setTimeout(() => {
                window.location.reload();
            }, 200);

        } catch (err) {
            console.error('UNABLE TO SAVE ASSET OPTIONS', err);
            setIsLoading(false);
            showAlertMessage('error', 'Failed to Save', 'Failed to save the trivector setup. Please check the console for details.');
        }

        // Console log arrays - this will show as arrays in the console
        console.log('=== SUBMITTED DATA ===');
        console.log('Wear Metal:', validWearMetal);
        console.log('Contaminants:', validContaminants);
        console.log('Chemistry & Viscosity:', validChemistryViscosity);
        console.log('=======================');
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
                            }}>Asset Option Setup</h1>
                            <p style={{
                                fontSize: '1.2rem',
                                color: '#F9982F',
                                opacity: '0.9',
                                fontWeight: '400'
                            }}>Configure your asset management preferences</p>
                        </div>
                    </div>


                    <Card style={{
                        background: '#fce5c7',
                        borderRadius: "20px",
                        boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                        border: 'none'
                    }}>
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>

                                {/* Trivector Fields Section */}
                                <div>

                                    <Form.Group className="mb-4">
                                        <Form.Label style={{
                                            fontWeight: "600",
                                            fontSize: "14px",
                                            color: '#254252',
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px"
                                        }}>
                                            Trivector Name
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Rotating Machine, Stationary Engine, Mobile Engine etc."
                                            value={trivectorName}
                                            onChange={(e) => setTrivectorName(e.target.value)}
                                            style={{
                                                backgroundColor: '#fff',
                                                border: '2px solid #e9ecef',
                                                borderRadius: '12px',
                                                padding: '12px 16px',
                                                fontSize: '0.95rem',
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


                                    {/* Wear Metal */}
                                    <Form.Group className="mb-4">
                                        <Form.Label style={{
                                            fontWeight: "600",
                                            fontSize: "14px",
                                            color: '#254252',
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px"
                                        }}>
                                            Wear Metal
                                        </Form.Label>

                                        {wearMetal.map((item, index) => (
                                            <Row
                                                key={`wear-metal-${index}`}
                                                className="mb-3"
                                                style={{
                                                    display: 'flex',
                                                    flexWrap: 'nowrap',
                                                    gap: '5px', // Changed from '5px' to '0px'
                                                    paddingRight: '20px',
                                                    marginBottom: '12px'
                                                }}
                                            >
                                                <Col xs={6} style={{ paddingRight: '0' }}> {/* Remove column gutters */}
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Parameter"
                                                        value={item.parameter}
                                                        onChange={(e) => updateWearMetal(index, 'parameter', e.target.value)}
                                                        style={{
                                                            backgroundColor: '#fff',
                                                            border: '2px solid #e9ecef',
                                                            borderRadius: '12px',
                                                            padding: '12px 16px',
                                                            fontSize: '0.95rem',
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
                                                </Col>

                                                <Col xs={3} style={{ paddingLeft: '0', paddingRight: '0' }}> {/* Remove column gutters */}
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Unit"
                                                        value={item.unit}
                                                        onChange={(e) => updateWearMetal(index, 'unit', e.target.value)}
                                                        style={{
                                                            backgroundColor: '#fff',
                                                            border: '2px solid #e9ecef',
                                                            borderRadius: '12px',
                                                            padding: '12px 16px',
                                                            fontSize: '0.95rem',
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
                                                </Col>

                                                <Col xs={3} style={{ paddingLeft: '0', paddingRight: '0' }}> {/* Remove column gutters */}
                                                    {wearMetal.length > 1 && (
                                                        <Button
                                                            variant="danger"
                                                            onClick={() => removeWearMetal(index)}
                                                            style={{
                                                                borderRadius: "10px",
                                                                fontWeight: "500",
                                                                padding: "12px 16px",
                                                                width: '100%',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                    )}

                                                    {wearMetal.length === 1 && (
                                                        <Button
                                                            variant="outline-warning"
                                                            onClick={addWearMetal}
                                                            style={{
                                                                borderRadius: "12px",
                                                                fontWeight: "500",
                                                                borderWidth: "2px",
                                                                padding: "12px 16px",
                                                                width: '100%',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            + Add Wear Metal Parameter
                                                        </Button>
                                                    )}
                                                </Col>
                                            </Row>
                                        ))}

                                        {wearMetal.length > 1 && (
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>

                                                <Button
                                                    variant="outline-warning"
                                                    onClick={addWearMetal}
                                                    style={{
                                                        borderRadius: "12px",
                                                        fontWeight: "500",
                                                        borderWidth: "2px"
                                                    }}
                                                >
                                                    + Add Wear Metal Parameter
                                                </Button>
                                            </div>
                                        )}

                                    </Form.Group>

                                    {/* Contaminants */}
                                    <Form.Group className="mb-4">
                                        <Form.Label style={{
                                            fontWeight: "600",
                                            fontSize: "14px",
                                            color: '#254252',
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px"
                                        }}>
                                            Contaminants
                                        </Form.Label>

                                        {contaminants.map((item, index) => (
                                            <Row
                                                key={`contaminant-${index}`}
                                                className="mb-3"
                                                style={{
                                                    display: 'flex',
                                                    flexWrap: 'nowrap',
                                                    gap: '5px', // Changed from '5px' to '0px'
                                                    paddingRight: '20px',
                                                    marginBottom: '12px'
                                                }}
                                            >
                                                <Col xs={6} style={{ paddingRight: '0' }}>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Parameter"
                                                        value={item.parameter}
                                                        onChange={(e) => updateContaminant(index, 'parameter', e.target.value)}
                                                        style={{
                                                            backgroundColor: '#fff',
                                                            border: '2px solid #e9ecef',
                                                            borderRadius: '12px',
                                                            padding: '12px 16px',
                                                            fontSize: '0.95rem',
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
                                                </Col>
                                                <Col xs={3} style={{ paddingLeft: '0', paddingRight: '0' }}>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Unit"
                                                        value={item.unit}
                                                        onChange={(e) => updateContaminant(index, 'unit', e.target.value)}
                                                        style={{
                                                            backgroundColor: '#fff',
                                                            border: '2px solid #e9ecef',
                                                            borderRadius: '12px',
                                                            padding: '12px 16px',
                                                            fontSize: '0.95rem',
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
                                                </Col>
                                                <Col xs={3} style={{ paddingLeft: '0', paddingRight: '0' }}>
                                                    {contaminants.length > 1 && (

                                                        <Button
                                                            variant="danger"
                                                            onClick={() => removeContaminant(index)}
                                                            style={{
                                                                borderRadius: "10px",
                                                                fontWeight: "500",
                                                                padding: "12px 16px",
                                                                width: '100%',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>

                                                    )}

                                                    {contaminants.length === 1 && (
                                                        <Button
                                                            variant="outline-warning"
                                                            onClick={addContaminant}
                                                            style={{
                                                                borderRadius: "12px",
                                                                fontWeight: "500",
                                                                borderWidth: "2px",
                                                                padding: "12px 16px",
                                                                width: '100%',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            + Add Contaminants Parameter
                                                        </Button>
                                                    )}
                                                </Col>
                                            </Row>
                                        ))}

                                        {wearMetal.length > 1 && (
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>

                                                <Button
                                                    variant="outline-warning"
                                                    onClick={addContaminant}
                                                    style={{
                                                        borderRadius: "12px",
                                                        fontWeight: "500",
                                                        borderWidth: "2px"
                                                    }}
                                                >
                                                    + Add Wear Metal Parameter
                                                </Button>
                                            </div>
                                        )}


                                    </Form.Group>

                                    {/* Chemistry and Viscosity */}
                                    <Form.Group className="mb-4">
                                        <Form.Label style={{
                                            fontWeight: "600",
                                            fontSize: "14px",
                                            color: '#254252',
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px"
                                        }}>
                                            Chemistry and Viscosity
                                        </Form.Label>

                                        {chemistryViscosity.map((item, index) => (
                                            <Row
                                                key={`chemistry-${index}`}
                                                className="mb-2"
                                                style={{
                                                    display: 'flex',
                                                    flexWrap: 'nowrap',
                                                    gap: '5px', // Changed from '5px' to '0px'
                                                    paddingRight: '20px',
                                                    marginBottom: '12px'
                                                }}
                                            >
                                                <Col xs={6} style={{ paddingRight: '0' }}>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Parameter"
                                                        value={item.parameter}
                                                        onChange={(e) => updateChemistryViscosity(index, 'parameter', e.target.value)}
                                                        style={{
                                                            backgroundColor: '#fff',
                                                            border: '2px solid #e9ecef',
                                                            borderRadius: '12px',
                                                            padding: '12px 16px',
                                                            fontSize: '0.95rem',
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
                                                </Col>
                                                <Col xs={3} style={{ paddingLeft: '0', paddingRight: '0' }}>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Unit"
                                                        value={item.unit}
                                                        onChange={(e) => updateChemistryViscosity(index, 'unit', e.target.value)}
                                                        style={{
                                                            backgroundColor: '#fff',
                                                            border: '2px solid #e9ecef',
                                                            borderRadius: '12px',
                                                            padding: '12px 16px',
                                                            fontSize: '0.95rem',
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
                                                </Col>
                                                <Col xs={3} style={{ paddingLeft: '0', paddingRight: '0' }}>

                                                    {chemistryViscosity.length > 1 && (

                                                        <Button
                                                            variant="danger"
                                                            onClick={() => removeChemistryViscosity(index)}
                                                            style={{
                                                                borderRadius: "10px",
                                                                fontWeight: "500",
                                                                padding: "12px 16px",
                                                                width: '100%',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>

                                                    )}
                                                    {chemistryViscosity.length === 1 && (
                                                        <Button
                                                            variant="outline-warning"
                                                            onClick={addChemistryViscosity}
                                                            style={{
                                                                borderRadius: "12px",
                                                                fontWeight: "500",
                                                                borderWidth: "2px",
                                                                padding: "12px 16px",
                                                                width: '100%',
                                                                whiteSpace: 'nowrap'
                                                            }}
                                                        >
                                                            + Add Chemistry & Viscosity Parameter
                                                        </Button>
                                                    )}
                                                </Col>
                                            </Row>
                                        ))}

                                        {chemistryViscosity.length > 1 && (
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>

                                                <Button
                                                    variant="outline-warning"
                                                    onClick={addChemistryViscosity}
                                                    style={{
                                                        borderRadius: "12px",
                                                        fontWeight: "500",
                                                        borderWidth: "2px"
                                                    }}
                                                >
                                                    + Add Chemistry & Viscosity Parameter
                                                </Button>
                                            </div>
                                        )}

                                    </Form.Group>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    style={{
                                        background: 'linear-gradient(45deg, #EAB56F, #F9982F)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '16px 20px',
                                        fontSize: '1rem',
                                        fontWeight: '600',
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
                                    Save All Options
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
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