import { Form, Container, Row, Col, Button, Badge, Card, InputGroup } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import axios from 'axios';
import config from 'config';

//Components
import Loading from '../../components/personalComponents/loading';
import AlertModal from '../../components/personalComponents/alertModal';
import FeatherIcon from 'feather-icons-react';

export default function SetupOptionView() {
    const option_id = new URLSearchParams(window.location.search).get('id');
    const [assetLocations, setAssetLocations] = useState(['']); // Array to store multiple asset locations
    const [assetTypes, setAssetTypes] = useState(['']); // Array to store multiple asset types
    const [assetCategories, setAssetCategories] = useState(['']); // Array to store multiple asset categories
    const [componentTypes, setComponentTypes] = useState(['']); // Array to store multiple component types

    // Store original values to detect changes
    const [originalAssetLocations, setOriginalAssetLocations] = useState(['']);
    const [originalAssetTypes, setOriginalAssetTypes] = useState(['']);
    const [originalAssetCategories, setOriginalAssetCategories] = useState(['']);
    const [originalComponentTypes, setOriginalComponentTypes] = useState(['']);

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

    // Function to check if there are any changes
    const hasChanges = () => {
        // Compare arrays by joining them as strings
        const currentLocations = assetLocations.filter(loc => loc.trim() !== '');
        const originalLocations = originalAssetLocations.filter(loc => loc.trim() !== '');

        const currentTypes = assetTypes.filter(type => type.trim() !== '');
        const originalTypes = originalAssetTypes.filter(type => type.trim() !== '');

        const currentCategories = assetCategories.filter(cat => cat.trim() !== '');
        const originalCategories = originalAssetCategories.filter(cat => cat.trim() !== '');

        const currentComponents = componentTypes.filter(comp => comp.trim() !== '');
        const originalComponents = originalComponentTypes.filter(comp => comp.trim() !== '');

        // Check if any array has changed
        const locationsChanged = JSON.stringify(currentLocations) !== JSON.stringify(originalLocations);
        const typesChanged = JSON.stringify(currentTypes) !== JSON.stringify(originalTypes);
        const categoriesChanged = JSON.stringify(currentCategories) !== JSON.stringify(originalCategories);
        const componentsChanged = JSON.stringify(currentComponents) !== JSON.stringify(originalComponents);

        return locationsChanged || typesChanged || categoriesChanged || componentsChanged;
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

    // Fetch data when component mounts or option_id changes
    useEffect(() => {
        const fetchData = async () => {
            // If no option_id, keep default empty arrays
            if (!option_id) {
                const defaultEmpty = [''];
                setAssetLocations(defaultEmpty);
                setAssetTypes(defaultEmpty);
                setAssetCategories(defaultEmpty);
                setComponentTypes(defaultEmpty);

                // Set original values to empty
                setOriginalAssetLocations(defaultEmpty);
                setOriginalAssetTypes(defaultEmpty);
                setOriginalAssetCategories(defaultEmpty);
                setOriginalComponentTypes(defaultEmpty);
                return;
            }

            try {
                setIsLoading(true);
                const res = await axios.get(`${config.baseApi}/assetsAnalysis/get-option-by-id`, {
                    params: { id: option_id }
                });

                const data = res.data || [];
                console.log('Fetched Asset Options:', data);

                // Check if we have data and it's not empty
                if (data && Object.keys(data).length > 0) {
                    let locations = [''];
                    let types = [''];
                    let categories = [''];
                    let components = [''];

                    // Split option_asset_location by ',' (if it exists)
                    if (data.option_asset_location && data.option_asset_location.trim() !== '') {
                        locations = data.option_asset_location.split(',').map(item => item.trim());
                        setAssetLocations(locations);
                        console.log('Asset Locations loaded:', locations);
                    } else {
                        setAssetLocations(['']);
                    }

                    // Split option_asset_type by ',' (if it exists)
                    if (data.option_asset_type && data.option_asset_type.trim() !== '') {
                        types = data.option_asset_type.split(',').map(item => item.trim());
                        setAssetTypes(types);
                        console.log('Asset Types loaded:', types);
                    } else {
                        setAssetTypes(['']);
                    }

                    // Split option_asset_category by ',' (if it exists)
                    if (data.option_asset_category && data.option_asset_category.trim() !== '') {
                        categories = data.option_asset_category.split(',').map(item => item.trim());
                        setAssetCategories(categories);
                        console.log('Asset Categories loaded:', categories);
                    } else {
                        setAssetCategories(['']);
                    }

                    // Split option_component_types by '/' (if it exists)
                    if (data.option_component_types && data.option_component_types.trim() !== '') {
                        components = data.option_component_types.split('/').map(item => item.trim());
                        setComponentTypes(components);
                        console.log('Component Types loaded:', components);
                    } else {
                        setComponentTypes(['']);
                    }

                    // Store original values for change detection
                    setOriginalAssetLocations(locations.length > 0 ? locations : ['']);
                    setOriginalAssetTypes(types.length > 0 ? types : ['']);
                    setOriginalAssetCategories(categories.length > 0 ? categories : ['']);
                    setOriginalComponentTypes(components.length > 0 ? components : ['']);
                } else {
                    // No data found, keep default empty arrays
                    const defaultEmpty = [''];
                    setAssetLocations(defaultEmpty);
                    setAssetTypes(defaultEmpty);
                    setAssetCategories(defaultEmpty);
                    setComponentTypes(defaultEmpty);

                    setOriginalAssetLocations(defaultEmpty);
                    setOriginalAssetTypes(defaultEmpty);
                    setOriginalAssetCategories(defaultEmpty);
                    setOriginalComponentTypes(defaultEmpty);
                }
            } catch (err) {
                console.error('UNABLE TO FETCH ASSET OPTIONS', err);
                showAlertMessage('error', 'Failed to Fetch', 'There was an error fetching the asset options. Please check the console for details.');
                // Reset to default on error
                const defaultEmpty = [''];
                setAssetLocations(defaultEmpty);
                setAssetTypes(defaultEmpty);
                setAssetCategories(defaultEmpty);
                setComponentTypes(defaultEmpty);

                setOriginalAssetLocations(defaultEmpty);
                setOriginalAssetTypes(defaultEmpty);
                setOriginalAssetCategories(defaultEmpty);
                setOriginalComponentTypes(defaultEmpty);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [option_id]); // Re-run when option_id changes

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

        if (!Validation()) {
            return;
        }

        setIsLoading(true);

        // Filter out empty values
        const validAssetLocations = assetLocations.filter(location => location.trim() !== '');
        const validAssetTypes = assetTypes.filter(type => type.trim() !== '');
        const validAssetCategories = assetCategories.filter(category => category.trim() !== '');
        const validComponentTypes = componentTypes.filter(component => component.trim() !== '');

        try {
            // Prepare data for API
            const submitData = {
                option_asset_location: validAssetLocations.join(','),
                option_asset_type: validAssetTypes.join(','),
                option_asset_category: validAssetCategories.join(','),
                option_component_types: validComponentTypes.join('/'),
                updated_by: empInfo.user_name
            };

            submitData.option_id = option_id;
            await axios.post(`${config.baseApi}/assetsAnalysis/update-option`, submitData);
            showAlertMessage('success', 'Updated Successfully', 'Your asset options have been updated successfully.');

            // Update original values after successful save
            setOriginalAssetLocations([...assetLocations]);
            setOriginalAssetTypes([...assetTypes]);
            setOriginalAssetCategories([...assetCategories]);
            setOriginalComponentTypes([...componentTypes]);

            console.log('=== SUBMITTED DATA ===');
            console.log('Asset Locations:', validAssetLocations);
            console.log('Asset Types:', validAssetTypes);
            console.log('Asset Categories:', validAssetCategories);
            console.log('Component Types:', validComponentTypes);
            console.log('=======================');

        } catch (err) {
            console.error('UNABLE TO SAVE ASSET OPTIONS', err);
            showAlertMessage('error', 'Failed to Save', 'There was an error saving the asset options. Please check the console for details.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            await axios.post(`${config.baseApi}/assetsAnalysis/delete-option`, {
                option_id: option_id
            });

            showAlertMessage('success', 'Deleted Successfully', 'The asset options have been deleted successfully.');

            setTimeout(() => {
                window.location.replace('/AssetReliabilityMonitoringSystem/all-option-setup');
            }, 2000);

        } catch (err) {
            showAlertMessage('error', 'Failed to Delete', 'There was an error deleting the asset options. Please check the console for details.');
        }
    }

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
                                                        width: 'clamp(150px, 25vw, 280px)',
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
                                                        width: 'clamp(150px, 25vw, 280px)',
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
                                                        width: 'clamp(150px, 25vw, 280px)',
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
                                                    whiteSpace: 'nowrap',
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
                                                        width: 'clamp(150px, 25vw, 280px)',
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

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                                    {/* Submit Button - Only show when there are changes */}
                                    {hasChanges() && (
                                        <Button
                                            type="submit"
                                            style={{
                                                background: 'linear-gradient(45deg, #EAB56F, #F9982F)',
                                                border: 'none',
                                                borderRadius: '12px',
                                                padding: '16px 20px',
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                width: '25%',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'scale(1.02)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'scale(1)';
                                            }}
                                        >
                                            {option_id ? 'Update All Options' : 'Save All Options'}
                                        </Button>
                                    )}
                                    {hasChanges() === false && (
                                        <Button
                                            onClick={handleDelete}
                                            style={{
                                                background: 'linear-gradient(45deg, #EAB56F, #F9982F)',
                                                border: 'none',
                                                borderRadius: '12px',
                                                padding: '16px 20px',
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                width: '15%',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = 'scale(1.02)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = 'scale(1)';
                                            }}
                                        >
                                            Delete All Options
                                        </Button>
                                    )}

                                </div>


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