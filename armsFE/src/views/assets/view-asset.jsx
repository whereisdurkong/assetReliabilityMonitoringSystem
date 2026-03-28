import { useEffect, useState, useRef } from 'react';
import { Form, Container, Row, Col, Button, Modal, Badge, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Loading from '../../components/personalComponents/loading';
import AlertModal from '../../components/personalComponents/alertModal';

import axios from 'axios';
import config from 'config';


export default function ViewAsset() {
    const asset_id = new URLSearchParams(window.location.search).get('id');
    const [confirmModal, setConfirmModal] = useState(false)
    const [formData, setFormData] = useState({
        assetName: '',
        assetType: '',
        location: '',
        category: '',
        commissioningDate: '',
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

    // Add this state to store components
    const [components, setComponents] = useState([]);
    const [hasComponents, setHasComponents] = useState(false);

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
                    notes: data.asset_notes,
                    isActive: data.is_active || '1',
                    created_at: data.created_at,
                    created_by: data.created_by
                };

                // Store components data
                setComponents(data.components || []);
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
    }, [asset_id])

    // In your useEffect where you fetch the asset data:


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
        if (!formData.commissioningDate?.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Asset Commissioning Date is empty');
            setIsLoading(false);
            return false;
        }

        return true;
    };


    const handleUpdate = async (e) => {
        e.preventDefault();

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
            {/* Delete Modal */}
            {confirmModal &&
                <Modal show={true} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Confirmation</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Are you sure you want to update this asset?
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='secondary' onClick={() => setConfirmModal(false)}>
                            Cancel
                        </Button>
                        {/* <Button variant='primary' onClick={handleUpdate}>
                            Update
                        </Button> */}

                        <Button
                            onClick={handleUpdate}
                            style={{
                                background: 'linear-gradient(45deg, #EAB56F, #F9982F, #E37239)',
                                border: 'none',
                                borderRadius: '16px',
                                padding: '10px 20px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                letterSpacing: '0.5px',
                                color: '#fff',
                                cursor: 'pointer',
                                minWidth: '100px',
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
                            Update
                        </Button>
                    </Modal.Footer>
                </Modal>
            }


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
                                    cursor: 'pointer', // Add pointer cursor
                                    transition: 'all 0.3s ease',
                                    userSelect: 'none' // Prevent text selection when clicking
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
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#E37239';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e9ecef';
                                            }}
                                        >
                                            <option value="">Select asset type</option>
                                            <option value="a">Type A - Heavy Equipment</option>
                                            <option value="b">Type B - Light Machinery</option>
                                            <option value="c">Type C - Tools & Instruments</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row style={{ marginBottom: '30px' }}>
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
                                            <option value="nayak">Nayak - Underground Mining</option>
                                            <option value="mill">Mill - Processing Plant</option>
                                            <option value="surface">Surface - Open Pit</option>
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
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#E37239';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e9ecef';
                                            }}
                                        >
                                            <option value="">Select category</option>
                                            <option value="mechanical">Mechanical Equipment</option>
                                            <option value="electrical">Electrical Systems</option>
                                            <option value="hydraulic">Hydraulic Systems</option>
                                            <option value="pneumatic">Pneumatic Systems</option>
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


                            {/* Components Section - Only show if hasComponents is true */}
                            {hasComponents && components.length > 0 && (
                                <div style={{
                                    marginTop: '20px',
                                    marginBottom: '20px',
                                    padding: '10px',

                                }}>
                                    <h2 style={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: '#254252',
                                        marginBottom: '25px',
                                        borderBottom: '3px solid #E37239',
                                        paddingBottom: '10px',
                                        display: 'inline-block'
                                    }}>
                                        Components ({components.length})
                                    </h2>

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
                                                            {component.componentType}
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
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            <Row>
                                <Col lg={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        onClick={() => setConfirmModal(true)}
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