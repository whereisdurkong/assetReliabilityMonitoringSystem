import { useEffect, useState } from "react";
import axios from 'axios';
import config from 'config';
import { Container, Row, Col, Form, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Loading from '../../components/personalComponents/loading';
import AlertModal from '../../components/personalComponents/alertModal';
import FeatherIcon from "feather-icons-react";
import water from "assets/images/water.png";
import gear from "assets/images/gear-box.png";
import lab from "assets/images/lab.png";
import { motion, AnimatePresence } from "framer-motion";

export default function SubmitAssetNewOil() {
    const [username, setUsername] = useState('');
    const [activeStep, setActiveStep] = useState(1);

    // Base form data - only common fields + dynamic fields will be handled separately
    const [formData, setFormData] = useState({
        analysisDate: '', trivector: '', recommendation: '', analysisStatus: '', oilBatchCode: '', manufacturingDate: '', drumNumber: '',
        // Common parameters that might appear across types
        viscosity40: '', viscosity100: '', tbn: '', oxidation: '', sulfation: '', nitration: '',
        calcium: '', magnesium: '', boron: '', molybdenum: '', zinc: '', phosphorus: '', water: '',
        tan: '', iso4406_4: '', iso4406_6: '', iso4406_14: ''
    });

    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: 'success', title: '', description: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [expandedSections, setExpandedSections] = useState({ mainParams: true });

    // Determine which parameter set to show based on trivector
    const isEngine = formData.trivector === 'Engine';
    const isGear = formData.trivector === 'Gear';
    const isHydraulic = formData.trivector === 'Hydraulic';
    const isTransmission = formData.trivector === 'Transmission';
    const isCompressors = formData.trivector === 'Compressors';

    const showAlertMessage = (type, title, description) => {
        setAlertConfig({ type, title, description });
        setShowAlert(true);
    };

    useEffect(() => {
        const empInfo = JSON.parse(localStorage.getItem("user"));
        setUsername(empInfo?.user_name || '');
    }, []);

    // Reset sections when trivector changes
    useEffect(() => {
        setExpandedSections({ mainParams: true });
    }, [formData.trivector]);

    const cleanNumericString = (value) => {
        if (!value || value === '') return '';
        const cleaned = String(value).replace(/[^\d.-]/g, '');
        const parts = cleaned.split('.');
        if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
        return cleaned;
    };

    const validateStep1 = () => {
        if (!formData.analysisDate) {
            showAlertMessage('error', 'Empty Fields', 'Analysis Date is required');
            return false;
        }
        if (!formData.trivector) {
            showAlertMessage('error', 'Empty Fields', 'Please select an equipment type');
            return false;
        }
        if (!formData.oilBatchCode?.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Oil Batch Code is required');
            return false;
        }
        if (!formData.manufacturingDate) {
            showAlertMessage('error', 'Empty Fields', 'Manufacturing Date is required');
            return false;
        }
        if (!formData.drumNumber?.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Drum Number is required');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.recommendation?.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Recommendation is required');
            return false;
        }
        if (!formData.analysisStatus) {
            showAlertMessage('error', 'Empty Fields', 'Analysis Status is required');
            return false;
        }

        const validateField = (fieldName, label) => {
            const cleaned = cleanNumericString(formData[fieldName]);
            if (!cleaned) {
                showAlertMessage('error', 'Invalid or Empty Field', `${label || fieldName} is required and must contain a valid number`);
                return false;
            }
            return true;
        };

        // Engine parameters validation
        if (isEngine) {
            const fields = [
                { name: 'viscosity40', label: 'Viscosity at 40°C' },
                { name: 'viscosity100', label: 'Viscosity at 100°C' },
                { name: 'tbn', label: 'TBN' },
                { name: 'oxidation', label: 'Oxidation' },
                { name: 'sulfation', label: 'Sulfation' },
                { name: 'nitration', label: 'Nitration' },
                { name: 'calcium', label: 'Calcium' },
                { name: 'magnesium', label: 'Magnesium' },
                { name: 'boron', label: 'Boron' },
                { name: 'molybdenum', label: 'Molybdenum' },
                { name: 'zinc', label: 'Zinc' },
                { name: 'phosphorus', label: 'Phosphorus' },
                { name: 'water', label: 'Water' }
            ];
            for (const f of fields) {
                if (!validateField(f.name, f.label)) return false;
            }
        }

        // Gear, Hydraulic, Transmission parameters validation
        if (isGear || isHydraulic || isTransmission) {
            const fields = [
                { name: 'viscosity40', label: 'Viscosity at 40°C' },
                { name: 'zinc', label: 'Zinc' },
                { name: 'phosphorus', label: 'Phosphorus' },
                { name: 'magnesium', label: 'Magnesium' },
                { name: 'oxidation', label: 'Oxidation' },
                { name: 'tan', label: 'TAN' },
                { name: 'iso4406_4', label: 'ISO 4406 (>4μm)' },
                { name: 'iso4406_6', label: 'ISO 4406 (>6μm)' },
                { name: 'iso4406_14', label: 'ISO 4406 (>14μm)' },
                { name: 'water', label: 'Water' }
            ];
            for (const f of fields) {
                if (!validateField(f.name, f.label)) return false;
            }
        }

        // Compressors parameters validation
        if (isCompressors) {
            const fields = [
                { name: 'viscosity40', label: 'Viscosity at 40°C' },
                { name: 'oxidation', label: 'Oxidation' },
                { name: 'tan', label: 'TAN' },
                { name: 'zinc', label: 'Zinc' },
                { name: 'phosphorus', label: 'Phosphorus' },
                { name: 'boron', label: 'Boron' },
                { name: 'calcium', label: 'Calcium' },
                { name: 'water', label: 'Water' }
            ];
            for (const f of fields) {
                if (!validateField(f.name, f.label)) return false;
            }
        }

        return true;
    };

    const handleNextStep = () => {
        if (activeStep === 1 && validateStep1()) setActiveStep(2);
    };

    const handlePrevStep = () => {
        if (activeStep > 1) setActiveStep(activeStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep2()) return;

        setIsLoading(true);
        try {
            const getField = (f) => {
                const c = cleanNumericString(formData[f]);
                return c === '' ? '' : c;
            };

            const oilResults = {};

            // Build oilResults based on equipment type
            if (isEngine) {
                Object.assign(oilResults, {
                    viscosity40: getField('viscosity40'),
                    viscosity100: getField('viscosity100'),
                    tbn: getField('tbn'),
                    oxidation: getField('oxidation'),
                    sulfation: getField('sulfation'),
                    nitration: getField('nitration'),
                    calcium: getField('calcium'),
                    magnesium: getField('magnesium'),
                    boron: getField('boron'),
                    molybdenum: getField('molybdenum'),
                    zinc: getField('zinc'),
                    phosphorus: getField('phosphorus'),
                    water: getField('water')
                });
            }

            if (isGear || isHydraulic || isTransmission) {
                Object.assign(oilResults, {
                    viscosity40: getField('viscosity40'),
                    zinc: getField('zinc'),
                    phosphorus: getField('phosphorus'),
                    magnesium: getField('magnesium'),
                    oxidation: getField('oxidation'),
                    tan: getField('tan'),
                    iso4406_4: getField('iso4406_4'),
                    iso4406_6: getField('iso4406_6'),
                    iso4406_14: getField('iso4406_14'),
                    water: getField('water')
                });
            }

            if (isCompressors) {
                Object.assign(oilResults, {
                    viscosity40: getField('viscosity40'),
                    oxidation: getField('oxidation'),
                    tan: getField('tan'),
                    zinc: getField('zinc'),
                    phosphorus: getField('phosphorus'),
                    boron: getField('boron'),
                    calcium: getField('calcium'),
                    water: getField('water')
                });
            }

            const payload = {
                trivector: formData.trivector,
                oil_batch_code: formData.oilBatchCode,
                manufacturing_date: formData.manufacturingDate,
                input_drum_number: formData.drumNumber,
                oil_analysis_results: JSON.stringify(oilResults),
                recommendations: formData.recommendation,
                analysis_date: formData.analysisDate,
                created_by: username,
                analysis_status: formData.analysisStatus,
                ...(formData.analysisStatus === 'Failed' && { status_failed_first: '1' }),
            };

            await axios.post(`${config.baseApi}/assetsAnalysis/add-no-assets-analysis`, payload);
            showAlertMessage('success', 'Success!', 'Oil analysis report was successfully recorded!');
            resetForm();
            setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
            console.log('Unable to save: ', err);
            showAlertMessage('error', 'Error', 'Unable to save! Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            analysisDate: '', trivector: '', recommendation: '', analysisStatus: '', oilBatchCode: '', manufacturingDate: '', drumNumber: '',
            viscosity40: '', viscosity100: '', tbn: '', oxidation: '', sulfation: '', nitration: '',
            calcium: '', magnesium: '', boron: '', molybdenum: '', zinc: '', phosphorus: '', water: '',
            tan: '', iso4406_4: '', iso4406_6: '', iso4406_14: ''
        });
        setActiveStep(1);
        setExpandedSections({ mainParams: true });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const getAssetTypeLabel = () => {
        if (isEngine) return 'Engine';
        if (isGear) return 'Gear';
        if (isHydraulic) return 'Hydraulic';
        if (isTransmission) return 'Transmission';
        if (isCompressors) return 'Compressors';
        return null;
    };

    const equipmentOptions = [
        { value: 'Engine', label: 'Engine', icon: 'settings', color: '#3B82F6' },
        { value: 'Gear', label: 'Gear', icon: 'tool', color: '#10B981' },
        { value: 'Hydraulic', label: 'Hydraulic', icon: 'droplet', color: '#8B5CF6' },
        { value: 'Transmission', label: 'Transmission', icon: 'truck', color: '#F59E0B' },
        { value: 'Compressors', label: 'Compressors', icon: 'wind', color: '#EF4444' },
    ];

    const steps = [
        { id: 1, label: 'Date & Type', icon: 'calendar', color: '#3B82F6' },
        { id: 2, label: 'Oil Analysis', icon: 'droplet', color: '#8B5CF6' }
    ];

    const inputStyle = {
        border: '2px solid #E2E8F0', borderRadius: '10px',
        padding: '10px 14px', fontSize: '0.85rem', width: '100%'
    };

    const unitStyle = {
        position: 'absolute', right: '12px', top: '10px',
        color: '#94A3B8', fontSize: '0.7rem'
    };

    const labelStyle = {
        fontSize: '0.75rem', fontWeight: '500', color: '#334155',
        marginBottom: '4px', display: 'block'
    };

    const requiredStar = <span style={{ color: '#EF4444' }}>*</span>;

    // Render parameter fields based on equipment type
    const renderParameterFields = () => {
        if (isEngine) {
            return (
                <>
                    <Row className="gy-3" style={{ marginTop: '16px' }}>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Viscosity at 40°C {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="viscosity40" value={formData.viscosity40 || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>cSt</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Viscosity at 100°C {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="viscosity100" value={formData.viscosity100 || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>cSt</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>TBN {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="tbn" value={formData.tbn || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>mg KOH/g</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Oxidation {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="oxidation" value={formData.oxidation || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>abs/0.1mm</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Sulfation {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="sulfation" value={formData.sulfation || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>abs/0.1mm</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Nitration {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="nitration" value={formData.nitration || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>abs/cm</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Calcium {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="calcium" value={formData.calcium || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>ppm</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Magnesium {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="magnesium" value={formData.magnesium || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>ppm</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Boron {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="boron" value={formData.boron || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>ppm</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Molybdenum {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="molybdenum" value={formData.molybdenum || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>ppm</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Zinc {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="zinc" value={formData.zinc || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>ppm</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Phosphorus {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="phosphorus" value={formData.phosphorus || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>ppm</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Water {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="water" value={formData.water || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>ppm</span>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                </>
            );
        }

        if (isGear || isHydraulic || isTransmission) {
            return (
                <>
                    <Row className="gy-3" style={{ marginTop: '16px' }}>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Viscosity at 40°C {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="viscosity40" value={formData.viscosity40 || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>cSt</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Zinc {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="zinc" value={formData.zinc || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>ppm</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Phosphorus {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="phosphorus" value={formData.phosphorus || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>ppm</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Magnesium {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="magnesium" value={formData.magnesium || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>ppm</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Oxidation {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="oxidation" value={formData.oxidation || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>abs/0.1mm</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>TAN {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="tan" value={formData.tan || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>mg KOH/g</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>ISO 4406 (>4μm) {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="iso4406_4" value={formData.iso4406_4 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} />
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>ISO 4406 (>6μm) {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="iso4406_6" value={formData.iso4406_6 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} />
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>ISO 4406 (>14μm) {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="iso4406_14" value={formData.iso4406_14 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} />
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Water {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="water" value={formData.water || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>ppm</span>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                </>
            );
        }

        if (isCompressors) {
            return (
                <>
                    <Row className="gy-3" style={{ marginTop: '16px' }}>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Viscosity at 40°C {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="viscosity40" value={formData.viscosity40 || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>cSt</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Oxidation {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="oxidation" value={formData.oxidation || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>abs/0.1mm</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>TAN {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="tan" value={formData.tan || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>mg KOH/g</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Zinc {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="zinc" value={formData.zinc || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>ppm</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Phosphorus {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="phosphorus" value={formData.phosphorus || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>ppm</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Boron {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="boron" value={formData.boron || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>ppm</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Calcium {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="calcium" value={formData.calcium || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>ppm</span>
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <label style={labelStyle}>Water {requiredStar}</label>
                                <div style={{ position: 'relative' }}>
                                    <Form.Control type="number" name="water" value={formData.water || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} />
                                    <span style={unitStyle}>ppm</span>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                </>
            );
        }

        return null;
    };

    return (
        <div style={{
            background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
            minHeight: '100vh', padding: '40px', position: 'relative', overflow: 'hidden', paddingTop: '50px'
        }}>
            <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: '-200px', right: '-200px', animation: 'float 25s infinite ease-in-out', zIndex: 1 }} />
            <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: '-150px', left: '-150px', animation: 'float 20s infinite ease-in-out reverse', zIndex: 1 }} />

            <Loading show={isLoading} />
            <AnimatePresence>
                {showAlert && (
                    <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, maxWidth: '400px' }}>
                        <AlertModal type={alertConfig.type} title={alertConfig.title} description={alertConfig.description} onClose={() => setShowAlert(false)} autoClose={5000} />
                    </motion.div>
                )}
            </AnimatePresence>

            <Container fluid style={{ position: 'relative', zIndex: 2, maxWidth: '2000px' }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <FeatherIcon icon="droplet" size={30} color="#EAB56F" />
                                <h1 style={{ fontSize: '2.8rem', fontWeight: '700', color: '#EAB56F', textShadow: '0 4px 20px rgba(255,0,0,0.2)', margin: 0 }}>
                                    Oil Analysis Report
                                </h1>
                            </div>
                            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', margin: 0, paddingLeft: '44px' }}>
                                Submit laboratory analysis results for equipment condition monitoring
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Progress Steps */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '16px 24px', border: '2px solid rgb(37,46,77)' }}>
                        {steps.map((step) => (
                            <div key={step.id} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: activeStep >= step.id ? 'linear-gradient(135deg, #EAB56F, #F9982F)' : 'rgba(255,255,255,0.1)',
                                    border: activeStep >= step.id ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                    color: activeStep >= step.id ? '#fff' : 'rgba(255,255,255,0.5)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 10px', position: 'relative', zIndex: 1
                                }}>
                                    {activeStep > step.id ? <FeatherIcon icon="check" size={20} /> : step.id}
                                </div>
                                <div style={{ fontSize: '0.8rem', fontWeight: activeStep === step.id ? '600' : '400', color: activeStep === step.id ? '#EAB56F' : 'rgba(255,255,255,0.5)' }}>
                                    {step.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Main Form Card */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#FFFFFF', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
                    {/* Card Header */}
                    <div style={{ padding: '20px 28px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FeatherIcon icon={steps.find(s => s.id === activeStep)?.icon || 'calendar'} size={22} color={steps.find(s => s.id === activeStep)?.color || '#3B82F6'} />
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#1E293B' }}>
                                    {activeStep === 1 && 'Analysis Date & Equipment Type'}
                                    {activeStep === 2 && 'Oil Analysis Results'}
                                </h3>
                                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                                    {activeStep === 1 && 'Select the date and type of equipment being analyzed'}
                                    {activeStep === 2 && 'Enter laboratory analysis results'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '28px' }}>
                        <Form onSubmit={handleSubmit}>
                            <AnimatePresence mode="wait">

                                {/* ── STEP 1 ── */}
                                {activeStep === 1 && (
                                    <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                                        <Row>
                                            <Col md={6}>
                                                <div style={{ marginBottom: '28px' }}>
                                                    <Form.Label style={{ fontWeight: '500', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                                        <FeatherIcon icon="droplet" size={14} /> Oil Batch Code <span style={{ color: '#EF4444' }}>*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="oilBatchCode"
                                                        value={formData.oilBatchCode}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g. Shell Rimula R4 X"
                                                        style={inputStyle}
                                                        onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                                    />
                                                </div>
                                            </Col>

                                            <Col md={6}>
                                                <div style={{ marginBottom: '28px' }}>
                                                    <Form.Label style={{ fontWeight: '500', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                                        <FeatherIcon icon="box" size={14} /> Drum Number <span style={{ color: '#EF4444' }}>*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="drumNumber"
                                                        value={formData.drumNumber}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g. DRM-001, DRM-002"
                                                        style={inputStyle}
                                                        onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                                    />
                                                </div>
                                            </Col>

                                            <Col md={6}>
                                                <div style={{ marginBottom: '28px' }}>
                                                    <Form.Label style={{ fontWeight: '500', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                                        <FeatherIcon icon="calendar" size={14} /> Manufacturing Date <span style={{ color: '#EF4444' }}>*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        name="manufacturingDate"
                                                        value={formData.manufacturingDate}
                                                        onChange={handleInputChange}
                                                        style={inputStyle}
                                                        onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                                    />
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <div style={{ marginBottom: '28px' }}>
                                                    <Form.Label style={{ fontWeight: '500', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                                        <FeatherIcon icon="calendar" size={14} /> Analysis Date <span style={{ color: '#EF4444' }}>*</span>
                                                    </Form.Label>
                                                    <Form.Control
                                                        type="date" name="analysisDate" value={formData.analysisDate}
                                                        onChange={handleInputChange} style={inputStyle}
                                                        onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                                    />
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <div style={{ marginBottom: '28px' }}>
                                                    <Form.Label style={{ fontWeight: '500', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                                        <FeatherIcon icon="user" size={14} /> Submitted By
                                                    </Form.Label>
                                                    <Form.Control disabled value={username} style={{ ...inputStyle, background: '#F1F5F9' }} />
                                                </div>
                                            </Col>
                                        </Row>

                                        {/* Equipment Selection — card-style */}
                                        <div style={{ marginBottom: '28px' }}>
                                            <Form.Label style={{ fontWeight: '500', color: '#334155', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                                <FeatherIcon icon="sliders" size={14} /> Equipment Type <span style={{ color: '#EF4444' }}>*</span>
                                            </Form.Label>
                                            <Row className="gy-3">
                                                {equipmentOptions.map((opt) => {
                                                    const selected = formData.trivector === opt.value;
                                                    return (
                                                        <Col md={4} key={opt.value}>
                                                            <div
                                                                onClick={() => setFormData(prev => ({ ...prev, trivector: opt.value }))}
                                                                style={{
                                                                    border: selected ? `2px solid ${opt.color}` : '2px solid #E2E8F0',
                                                                    borderRadius: '14px', padding: '20px 16px', cursor: 'pointer',
                                                                    background: selected ? `${opt.color}10` : '#FAFAFA',
                                                                    textAlign: 'center', transition: 'all 0.2s ease',
                                                                    boxShadow: selected ? `0 4px 20px ${opt.color}30` : 'none'
                                                                }}
                                                            >
                                                                <div style={{
                                                                    width: '48px', height: '48px', borderRadius: '50%',
                                                                    background: selected ? opt.color : '#E2E8F0',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    margin: '0 auto 12px', transition: 'all 0.2s ease'
                                                                }}>
                                                                    <FeatherIcon icon={opt.icon} size={22} color={selected ? '#fff' : '#94A3B8'} />
                                                                </div>
                                                                <div style={{ fontWeight: '600', fontSize: '0.85rem', color: selected ? opt.color : '#334155' }}>
                                                                    {opt.label}
                                                                </div>
                                                                {selected && (
                                                                    <div style={{ marginTop: '6px' }}>
                                                                        <FeatherIcon icon="check-circle" size={14} color={opt.color} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Col>
                                                    );
                                                })}
                                            </Row>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                                            <button onClick={handleNextStep} type="button" style={{
                                                background: 'linear-gradient(135deg, #EAB56F, #F9982F)', border: 'none',
                                                borderRadius: '12px', padding: '14px 28px', fontSize: '0.95rem',
                                                fontWeight: '600', color: '#fff', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                boxShadow: '0 4px 15px rgba(233,150,40,0.3)', transition: 'all 0.2s ease'
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(233,150,40,0.4)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(233,150,40,0.3)'; }}>
                                                Next: Oil Analysis <FeatherIcon icon="arrow-right" size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── STEP 2 ── */}
                                {activeStep === 2 && (
                                    <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                                        {/* Banner */}
                                        {getAssetTypeLabel() && (
                                            <div style={{ background: '#FEF3C7', borderRadius: '12px', padding: '12px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <FeatherIcon icon="info" size={18} color="#D97706" />
                                                    <span style={{ fontSize: '0.85rem', color: '#92400E' }}>
                                                        Analysis template: <strong>{getAssetTypeLabel()}</strong>
                                                    </span>
                                                </div>
                                                <span style={{ fontSize: '0.7rem', color: '#92400E' }}>All fields are required</span>
                                            </div>
                                        )}

                                        {(isEngine || isGear || isHydraulic || isTransmission || isCompressors) && (
                                            <>
                                                {/* Main Parameters */}
                                                <div style={{ marginBottom: '20px' }}>
                                                    <div onClick={() => toggleSection('mainParams')} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid #E2E8F0' }}>
                                                        <img src={lab} width="24px" alt="lab" />
                                                        <h6 style={{ margin: 0, fontWeight: '600', color: '#1E293B' }}>Analysis Results</h6>
                                                        <FeatherIcon icon={expandedSections.mainParams ? 'chevron-up' : 'chevron-down'} size={18} color="#64748B" style={{ marginLeft: 'auto' }} />
                                                    </div>
                                                    <AnimatePresence>
                                                        {expandedSections.mainParams && (
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                                                                {renderParameterFields()}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </>
                                        )}

                                        {/* Recommendation */}
                                        <div style={{ marginTop: '24px', marginBottom: '20px' }}>
                                            <Form.Label style={{ fontWeight: '500', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FeatherIcon icon="file-text" size={14} /> Recommendations <span style={{ color: '#EF4444' }}>*</span>
                                            </Form.Label>
                                            <Form.Control as="textarea" rows={3} name="recommendation" value={formData.recommendation || ''} onChange={handleInputChange}
                                                placeholder="Enter maintenance recommendations based on analysis results..." style={inputStyle}
                                                onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                        </div>

                                        {/* Analysis Status */}
                                        <div style={{ marginBottom: '24px' }}>
                                            <Form.Label style={{ fontWeight: '500', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FeatherIcon icon="check-circle" size={14} /> Analysis Status <span style={{ color: '#EF4444' }}>*</span>
                                            </Form.Label>
                                            <div style={{ display: 'flex', gap: '20px' }}>
                                                <Form.Check
                                                    type="radio"
                                                    id="status-passed"
                                                    name="analysisStatus"
                                                    value="Passed"
                                                    label={
                                                        <span style={{ color: '#10B981', fontWeight: '500' }}>
                                                            <FeatherIcon icon="check-circle" size={14} style={{ marginRight: '6px' }} />
                                                            Passed
                                                        </span>
                                                    }
                                                    checked={formData.analysisStatus === 'Passed'}
                                                    onChange={handleInputChange}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                <Form.Check
                                                    type="radio"
                                                    id="status-failed"
                                                    name="analysisStatus"
                                                    value="Failed"
                                                    label={
                                                        <span style={{ color: '#EF4444', fontWeight: '500' }}>
                                                            <FeatherIcon icon="x-circle" size={14} style={{ marginRight: '6px' }} />
                                                            Failed
                                                        </span>
                                                    }
                                                    checked={formData.analysisStatus === 'Failed'}
                                                    onChange={handleInputChange}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                                            <button onClick={handlePrevStep} type="button" style={{
                                                background: 'transparent', border: '2px solid #CBD5E1',
                                                borderRadius: '12px', padding: '12px 28px', color: '#64748B',
                                                fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
                                            }}
                                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ff7b00'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#CBD5E1'; }}>
                                                <FeatherIcon icon="arrow-left" size={16} /> Back
                                            </button>
                                            <button type="submit" disabled={isLoading} style={{
                                                background: 'linear-gradient(135deg, #EAB56F, #F9982F)', border: 'none',
                                                borderRadius: '12px', padding: '12px 32px', color: 'white',
                                                fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px',
                                                cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(233,150,40,0.4)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(233,150,40,0.3)'; }}>
                                                {isLoading ? <><Spinner animation="border" size="sm" /> Submitting...</> : <>Submit Report <FeatherIcon icon="check-circle" size={16} /></>}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Form>
                    </div>
                </motion.div>
            </Container>

            <style>{`@keyframes float { 0%, 100% { transform: translate(0,0) rotate(0deg); } 33% { transform: translate(50px,-50px) rotate(120deg); } 66% { transform: translate(-30px,30px) rotate(240deg); } }`}</style>
        </div>
    );
}