import { Form, Container, Row, Col, Button, Badge, Card, InputGroup } from 'react-bootstrap';
import { useState } from 'react';
import axios from 'axios';
import config from 'config';

//Components
import Loading from '../../components/personalComponents/loading';
import AlertModal from '../../components/personalComponents/alertModal';
import FeatherIcon from 'feather-icons-react';

export default function SetupOption() {
    const [assetLocations, setAssetLocations] = useState(['']); // Array to store multiple asset locations
    const [assetTypes, setAssetTypes] = useState(['']); // Array to store multiple asset types
    const [assetCategories, setAssetCategories] = useState(['']); // Array to store multiple asset categories
    const [componentTypes, setComponentTypes] = useState(['']); // Array to store multiple component types


    // Alert state
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        type: 'success',
        title: '',
        description: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    const empInfo = JSON.parse(localStorage.getItem("user"));

    // Function to show alert messages
    const showAlertMessage = (type, title, description) => {
        setAlertConfig({ type, title, description });
        setShowAlert(true);
    };

    // Asset Location handlers
    const addAssetLocation = () => {
        setAssetLocations([...assetLocations, '']);
    };

    const updateAssetLocation = (index, value) => {
        const updatedAssetLocations = [...assetLocations];
        updatedAssetLocations[index] = value;
        setAssetLocations(updatedAssetLocations);
    };

    const removeAssetLocation = (index) => {
        const updatedAssetLocations = assetLocations.filter((_, i) => i !== index);
        setAssetLocations(updatedAssetLocations);
    };

    // Asset Type handlers
    const addAssetType = () => {
        setAssetTypes([...assetTypes, '']);
    };

    const updateAssetType = (index, value) => {
        const updatedAssetTypes = [...assetTypes];
        updatedAssetTypes[index] = value;
        setAssetTypes(updatedAssetTypes);
    };

    const removeAssetType = (index) => {
        const updatedAssetTypes = assetTypes.filter((_, i) => i !== index);
        setAssetTypes(updatedAssetTypes);
    };

    // Asset Category handlers
    const addAssetCategory = () => {
        setAssetCategories([...assetCategories, '']);
    };

    const updateAssetCategory = (index, value) => {
        const updatedAssetCategories = [...assetCategories];
        updatedAssetCategories[index] = value;
        setAssetCategories(updatedAssetCategories);
    };

    const removeAssetCategory = (index) => {
        const updatedAssetCategories = assetCategories.filter((_, i) => i !== index);
        setAssetCategories(updatedAssetCategories);
    };

    // Component Type handlers
    const addComponentType = () => {
        setComponentTypes([...componentTypes, '']);
    };

    const updateComponentType = (index, value) => {
        const updatedComponentTypes = [...componentTypes];
        updatedComponentTypes[index] = value;
        setComponentTypes(updatedComponentTypes);
    };

    const removeComponentType = (index) => {
        const updatedComponentTypes = componentTypes.filter((_, i) => i !== index);
        setComponentTypes(updatedComponentTypes);
    };


    const Validation = () => {
        // Check if any field has been modified from the default empty string
        const hasAnyInput = assetLocations.some(loc => loc.trim() !== '') ||
            assetTypes.some(type => type.trim() !== '') ||
            assetCategories.some(cat => cat.trim() !== '') ||
            componentTypes.some(comp => comp.trim() !== '');

        if (!hasAnyInput) {
            showAlertMessage('error', 'Empty Fields', 'Please enter at least one value in any category before saving.');
            return false;
        }

        // Optional: Validate that if a user has added multiple input fields, 
        // they're not all empty strings
        const allAssetLocationsEmpty = assetLocations.every(loc => loc.trim() === '');
        const allAssetTypesEmpty = assetTypes.every(type => type.trim() === '');
        const allAssetCategoriesEmpty = assetCategories.every(cat => cat.trim() === '');
        const allComponentTypesEmpty = componentTypes.every(comp => comp.trim() === '');

        if (assetLocations.length > 0 && allAssetLocationsEmpty) {
            showAlertMessage('error', 'Empty Fields', 'Asset Locations have empty fields. Please fill them or remove the empty entries.');
            return false;
        }

        if (assetTypes.length > 0 && allAssetTypesEmpty) {
            showAlertMessage('error', 'Empty Fields', 'Asset Types have empty fields. Please fill them or remove the empty entries.');
            return false;
        }

        if (assetCategories.length > 0 && allAssetCategoriesEmpty) {
            showAlertMessage('error', 'Empty Fields', 'Asset Categories have empty fields. Please fill them or remove the empty entries.');
            return false;
        }

        if (componentTypes.length > 0 && allComponentTypesEmpty) {
            showAlertMessage('error', 'Empty Fields', 'Component Types have empty fields. Please fill them or remove the empty entries.');
            return false;
        }

        return true;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!Validation()) {
            setIsLoading(false);
            return;
        }

        // Filter out empty values
        const validAssetLocations = assetLocations.filter(location => location.trim() !== '');
        const validAssetTypes = assetTypes.filter(type => type.trim() !== '');
        const validAssetCategories = assetCategories.filter(category => category.trim() !== '');
        const validComponentTypes = componentTypes.filter(component => component.trim() !== '');


        try {
            // Then, save asset options
            await axios.post(`${config.baseApi}/assetsAnalysis/add-option`, {
                option_asset_location: validAssetLocations,
                option_asset_type: validAssetTypes,
                option_asset_category: validAssetCategories,
                option_component_types: validComponentTypes,
                created_by: empInfo.user_name
            });

            showAlertMessage('success', 'Saved Successfully', 'Your asset options have been saved successfully.');

            setTimeout(() => {
                window.location.reload();
            }, 100);

            // Success message
            console.log(`Saved Successfully!\n\n Asset Locations: ${validAssetLocations.length}\n Asset Types: ${validAssetTypes.length}\n Asset Categories: ${validAssetCategories.length}\n Component Types: ${validComponentTypes.length}\n\n Check console for detailed arrays`);

        } catch (err) {
            console.error('UNABLE TO SAVE ASSET OPTIONS', err);
            showAlertMessage('error', 'Failed to Save', 'There was an error saving the asset options. Please check the console for details.');
        }

        // Console log arrays - this will show as arrays in the console
        console.log('=== SUBMITTED DATA ===');
        console.log('Asset Locations:', validAssetLocations);
        console.log('Asset Types:', validAssetTypes);
        console.log('Asset Categories:', validAssetCategories);
        console.log('Component Types:', validComponentTypes);
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
                                {/* Asset Locations Section */}
                                <Form.Group className="mb-4">
                                    <Form.Label style={{
                                        fontWeight: "600",
                                        fontSize: "16px",
                                        color: '#254252',
                                    }}>
                                        Asset Locations
                                    </Form.Label>

                                    {assetLocations.map((location, index) => (
                                        <InputGroup
                                            key={`asset-location-${index}`}
                                            className="mb-2"
                                            style={{ display: 'flex', flexWrap: 'nowrap' }}
                                        >
                                            <InputGroup.Text
                                                style={{
                                                    background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                                                    border: '2px solid #e9ecef',
                                                    borderRight: 'none',
                                                    color: '#E37239',
                                                    borderRadius: '12px 0 0 12px',
                                                    padding: '0.75rem 1rem'
                                                }}
                                            >
                                                <FeatherIcon icon="map-pin" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter asset location"
                                                value={location}
                                                onChange={(e) => updateAssetLocation(index, e.target.value)}
                                                style={{
                                                    backgroundColor: '#fff',
                                                    border: '2px solid #e9ecef',
                                                    borderLeft: 'none',
                                                    borderRadius: '0 12px 12px 0',
                                                    padding: '16px 20px',
                                                    fontSize: '1rem',
                                                    color: '#171C2D',
                                                    flex: '1',
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
                                            {assetLocations.length > 1 && (
                                                <Button
                                                    variant="danger"
                                                    onClick={() => removeAssetLocation(index)}
                                                    style={{
                                                        borderRadius: "10px",
                                                        fontWeight: "500",
                                                        marginLeft: '8px',
                                                        whiteSpace: 'nowrap',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                            {assetLocations.length === 1 && (
                                                <Button
                                                    variant="outline-warning"
                                                    onClick={addAssetLocation}
                                                    style={{
                                                        borderRadius: "12px",
                                                        fontWeight: "500",
                                                        borderWidth: "2px",
                                                        marginLeft: '8px',
                                                        whiteSpace: 'nowrap',
                                                        width: 'clamp(150px, 25vw, 280px)', // Min: 150px, Preferred: 25% of viewport, Max: 280px

                                                        flexShrink: 0
                                                    }}
                                                >
                                                    + Add Another Asset Location
                                                </Button>
                                            )}
                                        </InputGroup>
                                    ))}
                                    {assetLocations.length > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
                                            <Button
                                                variant="outline-warning"
                                                onClick={addAssetLocation}
                                                style={{
                                                    borderRadius: "12px",
                                                    fontWeight: "500",
                                                    borderWidth: "2px",
                                                    whiteSpace: 'nowrap',
                                                    flexShrink: 0
                                                }}
                                            >
                                                + Add Another Asset Location
                                            </Button>
                                        </div>
                                    )}
                                </Form.Group>

                                {/* Asset Types Section */}
                                <Form.Group className="mb-4">
                                    <Form.Label style={{
                                        fontWeight: "600",
                                        fontSize: "16px",
                                        color: '#254252',
                                    }}>
                                        Asset Types
                                    </Form.Label>

                                    {assetTypes.map((type, index) => (
                                        <InputGroup key={`asset-type-${index}`}
                                            className="mb-2"
                                            style={{ display: 'flex', flexWrap: 'nowrap' }}
                                        >
                                            <InputGroup.Text
                                                style={{
                                                    background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                                                    border: '2px solid #e9ecef',
                                                    borderRight: 'none',
                                                    color: '#E37239',
                                                    borderRadius: '12px 0 0 12px',
                                                    padding: '0.75rem 1rem'
                                                }}
                                            >
                                                <FeatherIcon icon="grid" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter asset type"
                                                value={type}
                                                onChange={(e) => updateAssetType(index, e.target.value)}
                                                style={{
                                                    backgroundColor: '#fff',
                                                    border: '2px solid #e9ecef',
                                                    borderLeft: 'none',
                                                    borderRadius: '0 12px 12px 0',
                                                    padding: '16px 20px',
                                                    fontSize: '1rem',
                                                    color: '#171C2D',
                                                    flex: '1',
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
                                            {assetTypes.length > 1 && (
                                                <Button
                                                    variant="danger"
                                                    onClick={() => removeAssetType(index)}
                                                    style={{
                                                        borderRadius: "10px",
                                                        fontWeight: "500",
                                                        marginLeft: '8px',
                                                        whiteSpace: 'nowrap',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                            {assetTypes.length === 1 && (
                                                <Button
                                                    variant="outline-warning"
                                                    onClick={addAssetType}
                                                    style={{
                                                        borderRadius: "12px",
                                                        fontWeight: "500",
                                                        borderWidth: "2px",
                                                        marginLeft: '8px',
                                                        whiteSpace: 'nowrap',
                                                        width: 'clamp(150px, 25vw, 280px)', // Min: 150px, Preferred: 25% of viewport, Max: 280px

                                                        flexShrink: 0
                                                    }}
                                                >
                                                    + Add Another Asset Type
                                                </Button>
                                            )}
                                        </InputGroup>
                                    ))}
                                    {assetTypes.length > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
                                            <Button
                                                variant="outline-warning"
                                                onClick={addAssetType}
                                                style={{
                                                    borderRadius: "12px",
                                                    fontWeight: "500",
                                                    borderWidth: "2px",
                                                    whiteSpace: 'nowrap',
                                                    flexShrink: 0
                                                }}
                                            >
                                                + Add Another Asset Type
                                            </Button>
                                        </div>
                                    )}

                                </Form.Group>

                                {/* Asset Categories Section */}
                                <Form.Group className="mb-4">
                                    <Form.Label style={{
                                        fontWeight: "600",
                                        fontSize: "16px",
                                        color: '#254252',
                                    }}>
                                        Asset Categories
                                    </Form.Label>

                                    {assetCategories.map((category, index) => (
                                        <InputGroup
                                            key={`asset-category-${index}`}
                                            className="mb-2"
                                            style={{ display: 'flex', flexWrap: 'nowrap' }}
                                        >
                                            <InputGroup.Text
                                                style={{
                                                    background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                                                    border: '2px solid #e9ecef',
                                                    borderRight: 'none',
                                                    color: '#E37239',
                                                    borderRadius: '12px 0 0 12px',
                                                    padding: '0.75rem 1rem'
                                                }}
                                            >
                                                <FeatherIcon icon="folder" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter asset category"
                                                value={category}
                                                onChange={(e) => updateAssetCategory(index, e.target.value)}
                                                style={{
                                                    backgroundColor: '#fff',
                                                    border: '2px solid #e9ecef',
                                                    borderLeft: 'none',
                                                    borderRadius: '0 12px 12px 0',
                                                    padding: '16px 20px',
                                                    fontSize: '1rem',
                                                    color: '#171C2D',
                                                    flex: '1',
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
                                            {assetCategories.length > 1 && (
                                                <Button
                                                    variant="danger"
                                                    onClick={() => removeAssetCategory(index)}
                                                    style={{
                                                        borderRadius: "10px",
                                                        fontWeight: "500",
                                                        marginLeft: '8px',
                                                        whiteSpace: 'nowrap',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                            {assetCategories.length === 1 && (
                                                <Button
                                                    variant="outline-warning"
                                                    onClick={addAssetCategory}
                                                    style={{
                                                        borderRadius: "12px",
                                                        fontWeight: "500",
                                                        borderWidth: "2px",
                                                        marginLeft: '8px',
                                                        whiteSpace: 'nowrap',
                                                        width: 'clamp(150px, 25vw, 280px)', // Min: 150px, Preferred: 25% of viewport, Max: 280px

                                                        flexShrink: 0
                                                    }}
                                                >
                                                    + Add Another Asset Category
                                                </Button>
                                            )}
                                        </InputGroup>
                                    ))}
                                    {assetCategories.length > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>

                                            <Button
                                                variant="outline-warning"
                                                onClick={addAssetCategory}
                                                style={{
                                                    borderRadius: "12px",
                                                    fontWeight: "500",
                                                    borderWidth: "2px",
                                                    marginLeft: '8px',
                                                    whiteSpace: 'nowrap',
                                                    width: 'clamp(150px, 25vw, 280px)', // Min: 150px, Preferred: 25% of viewport, Max: 280px

                                                    flexShrink: 0
                                                }}
                                            >
                                                + Add Another Asset Category
                                            </Button>
                                        </div>
                                    )}
                                </Form.Group>

                                {/* Component Types Section */}
                                <Form.Group className="mb-4">
                                    <Form.Label style={{
                                        fontWeight: "600",
                                        fontSize: "16px",
                                        color: '#254252',
                                    }}>
                                        Component Types
                                    </Form.Label>

                                    {componentTypes.map((component, index) => (
                                        <InputGroup
                                            key={`component-type-${index}`}
                                            className="mb-2"
                                            style={{ display: 'flex', flexWrap: 'nowrap' }}
                                        >
                                            <InputGroup.Text
                                                style={{
                                                    background: 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                                                    border: '2px solid #e9ecef',
                                                    borderRight: 'none',
                                                    color: '#E37239',
                                                    borderRadius: '12px 0 0 12px',
                                                    padding: '0.75rem 1rem'
                                                }}
                                            >
                                                <FeatherIcon icon="settings" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter component type"
                                                value={component}
                                                onChange={(e) => updateComponentType(index, e.target.value)}
                                                style={{
                                                    backgroundColor: '#fff',
                                                    border: '2px solid #e9ecef',
                                                    borderLeft: 'none',
                                                    borderRadius: '0 12px 12px 0',
                                                    padding: '16px 20px',
                                                    fontSize: '1rem',
                                                    color: '#171C2D',
                                                    flex: '1',
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
                                            {componentTypes.length > 1 && (
                                                <Button
                                                    variant="danger"
                                                    onClick={() => removeComponentType(index)}
                                                    s style={{
                                                        borderRadius: "10px",
                                                        fontWeight: "500",
                                                        marginLeft: '8px',
                                                        whiteSpace: 'nowrap',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            )}

                                            {componentTypes.length === 1 && (
                                                <Button
                                                    variant="outline-warning"
                                                    onClick={addComponentType}
                                                    style={{
                                                        borderRadius: "12px",
                                                        fontWeight: "500",
                                                        borderWidth: "2px",
                                                        marginLeft: '8px',
                                                        whiteSpace: 'nowrap',
                                                        width: 'clamp(150px, 25vw, 280px)', // Min: 150px, Preferred: 25% of viewport, Max: 280px

                                                        flexShrink: 0
                                                    }}
                                                >
                                                    + Add Another Component Type
                                                </Button>
                                            )}
                                        </InputGroup>
                                    ))}

                                    {componentTypes.length > 1 && (
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>

                                            <Button
                                                variant="outline-warning"
                                                onClick={addComponentType}
                                                style={{
                                                    borderRadius: "12px",
                                                    fontWeight: "500",
                                                    borderWidth: "2px",
                                                    whiteSpace: 'nowrap',
                                                    flexShrink: 0
                                                }}
                                            >
                                                + Add Another Component Type
                                            </Button>
                                        </div>
                                    )}
                                </Form.Group>

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