import { useEffect, useState } from "react";
import axios from 'axios';
import config from 'config';
import { Container, Row, Col, Form, Card, Button, Spinner, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Loading from '../../components/personalComponents/loading';
import AlertModal from '../../components/personalComponents/alertModal';
import FeatherIcon from "feather-icons-react";
import water from "assets/images/water.png";
import gear from "assets/images/gear-box.png";
import lab from "assets/images/lab.png";
import { motion, AnimatePresence } from "framer-motion";

export default function SubmitAsset() {
    // State Management
    const [assets, setAssets] = useState([]);
    const [assetComponents, setAssetComponents] = useState([]);
    const [filteredComponents, setFilteredComponents] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState('');
    const [selectedComponent, setSelectedComponent] = useState('');
    const [selectedComponentDetails, setSelectedComponentDetails] = useState(null);
    const [selectedAssetDetails, setSelectedAssetDetails] = useState(null);
    // const [level, setLevel] = useState('');
    const [username, setUsername] = useState('');
    const [activeStep, setActiveStep] = useState(1);

    // Form data state
    const [formData, setFormData] = useState({
        assetId: '', assetName: '', componentId: '', componentName: '',
        runningHours: '', oilRunningHours: '', oilAnalysisResults: '', recommendation: '', analysisDate: '', notes: '',
        iron: '', chrome: '', lead: '', copper: '', silicon: '', water: '', viscosity40: '',
        nickel: '', aluminum: '', sodium: '', soot: '', tbn: '', tin: '', titanium: '', silver: '',
        antimony: '', cadmium: '', manganese: '', vanadium: '', potassium: '', lithium: '', glycol: '',
        bubbles: '', antiwear: '', sootPercent: '', biodieselFuelDilution: '', molybdenum: '', calcium: '',
        magnesium: '', phosphorus: '', zinc: '', barium: '', boron: '', oxidation: '', nitration: '',
        sulfation: '', viscosity100: '', fluidIntegrity: '', fatigue20: '', nonMetallic20: '', largeFe: '',
        feWearSeverity: '', totalFe100: '', iso4406_4: '', iso4406_6: '', iso4406_14: '', cnts4: '',
        cnts6: '', cnts14: '', particles5_15: '', particles15_25: '', particles25_50: '', particles50_100: '',
        particles100: '', cutting20: '', sliding20: '', totalWater: '', waterContent: '', largeFePercent: '', tan: ''
    });

    // Alert state
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: 'success', title: '', description: '' });
    const [isLoading, setIsLoading] = useState(false);

    // Category-specific state
    const [rotatingMachine, setRotatingMachine] = useState(false);
    const [mobileEngine, setMobileEngine] = useState(false);
    const [stationaryEngine, setStationaryEngine] = useState(false);
    const [expandedSections, setExpandedSections] = useState({ wearMetal: true, contaminants: false, chemistry: false });

    const styles = {
        primary: '#EAB56F', secondary: '#F9982F', accent: '#E37239',
        dark: '#171C2D', deep: '#254252', light: '#FDF8F0'
    };

    const showAlertMessage = (type, title, description) => {
        setAlertConfig({ type, title, description });
        setShowAlert(true);
    };

    useEffect(() => {
        const fetchActiveAssets = async () => {
            try {
                const empInfo = JSON.parse(localStorage.getItem("user"));
                setUsername(empInfo?.user_name || '');
                // setLevel(empInfo?.emp_position || '');
                setIsLoading(true);

                const res = await axios.get(`${config.baseApi}/assets/get-all-assets`);
                const data = res.data || [];
                const active = data.filter((a) => a.is_active === '1');
                setAssets(active);

                const res1 = await axios.get(`${config.baseApi}/assets/get-all-components`);
                const data1 = res1.data || [];
                setAssetComponents(data1);

            } catch (err) {
                console.log('Unable to fetch all assets', err);
                showAlertMessage('error', 'Error', 'Unable to fetch all assets. Server went wrong!');
            } finally {
                setIsLoading(false);
            }
        };
        fetchActiveAssets();
    }, []);

    useEffect(() => {
        if (selectedAsset && assetComponents.length > 0) {
            const componentsForAsset = assetComponents.filter(component => component.asset_id === selectedAsset);
            setFilteredComponents(componentsForAsset);
        } else {
            setFilteredComponents([]);
        }
    }, [selectedAsset, assetComponents]);

    useEffect(() => {
        if (selectedAsset) {
            const asset = assets.find(a => a.asset_id === selectedAsset);
            setSelectedAssetDetails(asset);
            if (asset) {
                setFormData(prev => ({ ...prev, assetName: asset.asset_name || '' }));
            }
        } else {
            setSelectedAssetDetails(null);
        }
    }, [selectedAsset, assets]);

    useEffect(() => {
        if (selectedAssetDetails?.trivector) {
            const category = selectedAssetDetails.trivector;
            setStationaryEngine(category === 'stationary-engine' || category === 'stationary engine');
            setRotatingMachine(category === 'rotating-machine' || category === 'rotating machine');
            setMobileEngine(category === 'mobile-engine' || category === 'mobile engine');
            setExpandedSections({ wearMetal: true, contaminants: false, chemistry: false });
        } else {
            setStationaryEngine(false);
            setRotatingMachine(false);
            setMobileEngine(false);
        }
    }, [selectedAssetDetails]);

    const handleComponentChange = (e) => {
        const componentId = e.target.value;
        setSelectedComponent(componentId);
        const selectedComp = filteredComponents.find(comp => comp.asset_component_id === componentId);
        if (selectedComp) {
            setSelectedComponentDetails(selectedComp);
            setFormData(prev => ({
                ...prev,
                componentId: componentId,
                componentName: selectedComp.asset_component_name || ''
            }));
        } else {
            setSelectedComponentDetails(null);
        }
    };

    const validateStep1 = () => {
        if (!formData.assetId) {
            showAlertMessage('error', 'Empty Fields', 'Asset is required');
            return false;
        }
        if (!formData.componentId) {
            showAlertMessage('error', 'Empty Fields', 'Asset Component is required');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.runningHours) {
            showAlertMessage('error', 'Empty Fields', 'Asset Running Hours is required');
            return false;
        }
        if (!formData.oilRunningHours) {
            showAlertMessage('error', 'Empty Fields', 'Oil Running Hours is required');
            return false;
        }
        if (!formData.analysisDate) {
            showAlertMessage('error', 'Empty Fields', 'Analysis Date is required');
            return false;
        }
        return true;
    };

    const validateStep3 = () => {
        if (!formData.recommendation?.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Recommendation is required');
            return false;
        }

        // Rotating Machine validation
        if (rotatingMachine) {
            const requiredFields = ['iron', 'chrome', 'nickel', 'aluminum', 'lead', 'copper', 'tin', 'titanium', 'silver', 'antimony', 'cadmium', 'manganese', 'fatigue20', 'nonMetallic20', 'largeFe', 'feWearSeverity', 'totalFe100', 'silicon', 'sodium', 'vanadium', 'potassium', 'lithium', 'iso4406_4', 'iso4406_6', 'iso4406_14', 'cnts4', 'cnts6', 'cnts14', 'particles5_15', 'particles15_25', 'particles25_50', 'particles50_100', 'particles100', 'cutting20', 'sliding20', 'totalWater', 'bubbles', 'waterContent', 'largeFePercent', 'molybdenum', 'calcium', 'magnesium', 'phosphorus', 'zinc', 'barium', 'boron', 'tan', 'oxidation', 'viscosity40', 'viscosity100', 'fluidIntegrity'];
            for (const field of requiredFields) {
                if (!formData[field]) {
                    showAlertMessage('error', 'Empty Fields', `Missing required field: ${field}`);
                    return false;
                }
            }
        }

        // Mobile Engine validation
        if (mobileEngine) {
            const requiredFields = ['iron', 'chrome', 'nickel', 'aluminum', 'lead', 'copper', 'tin', 'titanium', 'silver', 'antimony', 'cadmium', 'manganese', 'silicon', 'sodium', 'vanadium', 'potassium', 'lithium', 'glycol', 'bubbles', 'water', 'sootPercent', 'biodieselFuelDilution', 'molybdenum', 'calcium', 'magnesium', 'phosphorus', 'zinc', 'barium', 'boron', 'tbn', 'oxidation', 'nitration', 'sulfation', 'viscosity40', 'viscosity100', 'antiwear', 'fluidIntegrity'];
            for (const field of requiredFields) {
                if (!formData[field]) {
                    showAlertMessage('error', 'Empty Fields', `Missing required field: ${field}`);
                    return false;
                }
            }
        }

        // Stationary Engine validation
        if (stationaryEngine) {
            const requiredFields = ['iron', 'chrome', 'nickel', 'aluminum', 'lead', 'copper', 'tin', 'titanium', 'silver', 'antimony', 'cadmium', 'manganese', 'silicon', 'sodium', 'vanadium', 'potassium', 'lithium', 'glycol', 'bubbles', 'antiwear', 'water', 'sootPercent', 'biodieselFuelDilution', 'molybdenum', 'calcium', 'magnesium', 'phosphorus', 'zinc', 'barium', 'boron', 'tbn', 'oxidation', 'nitration', 'sulfation', 'viscosity40', 'viscosity100', 'fluidIntegrity'];
            for (const field of requiredFields) {
                if (!formData[field]) {
                    showAlertMessage('error', 'Empty Fields', `Missing required field: ${field}`);
                    return false;
                }
            }
        }

        return true;
    };

    const handleNextStep = () => {
        if (activeStep === 1 && validateStep1()) {
            setActiveStep(2);
        } else if (activeStep === 2 && validateStep2()) {
            setActiveStep(3);
        }
    };

    const handlePrevStep = () => {
        if (activeStep > 1) {
            setActiveStep(activeStep - 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep3()) return;

        setIsLoading(true);

        try {
            const oilResults = {};

            if (rotatingMachine) {
                Object.assign(oilResults, {
                    iron: formData.iron || '', chrome: formData.chrome || '', nickel: formData.nickel || '',
                    aluminum: formData.aluminum || '', lead: formData.lead || '', copper: formData.copper || '',
                    tin: formData.tin || '', titanium: formData.titanium || '', silver: formData.silver || '',
                    antimony: formData.antimony || '', cadmium: formData.cadmium || '', manganese: formData.manganese || '',
                    fatigue20: formData.fatigue20 || '', nonMetallic20: formData.nonMetallic20 || '',
                    largeFe: formData.largeFe || '', feWearSeverity: formData.feWearSeverity || '',
                    totalFe100: formData.totalFe100 || '', silicon: formData.silicon || '', sodium: formData.sodium || '',
                    vanadium: formData.vanadium || '', potassium: formData.potassium || '', lithium: formData.lithium || '',
                    iso4406_4: formData.iso4406_4 || '', iso4406_6: formData.iso4406_6 || '', iso4406_14: formData.iso4406_14 || '',
                    cnts4: formData.cnts4 || '', cnts6: formData.cnts6 || '', cnts14: formData.cnts14 || '',
                    particles5_15: formData.particles5_15 || '', particles15_25: formData.particles15_25 || '',
                    particles25_50: formData.particles25_50 || '', particles50_100: formData.particles50_100 || '',
                    particles100: formData.particles100 || '', cutting20: formData.cutting20 || '',
                    sliding20: formData.sliding20 || '', totalWater: formData.totalWater || '',
                    bubbles: formData.bubbles || '', waterContent: formData.waterContent || '',
                    largeFePercent: formData.largeFePercent || '', molybdenum: formData.molybdenum || '',
                    calcium: formData.calcium || '', magnesium: formData.magnesium || '', phosphorus: formData.phosphorus || '',
                    zinc: formData.zinc || '', barium: formData.barium || '', boron: formData.boron || '',
                    tan: formData.tan || '', oxidation: formData.oxidation || '', viscosity40: formData.viscosity40 || '',
                    viscosity100: formData.viscosity100 || '', fluidIntegrity: formData.fluidIntegrity || '',
                });
            }

            if (stationaryEngine) {
                Object.assign(oilResults, {
                    iron: formData.iron || '', chrome: formData.chrome || '', nickel: formData.nickel || '',
                    aluminum: formData.aluminum || '', lead: formData.lead || '', copper: formData.copper || '',
                    tin: formData.tin || '', titanium: formData.titanium || '', silver: formData.silver || '',
                    antimony: formData.antimony || '', cadmium: formData.cadmium || '', manganese: formData.manganese || '',
                    silicon: formData.silicon || '', sodium: formData.sodium || '', vanadium: formData.vanadium || '',
                    potassium: formData.potassium || '', lithium: formData.lithium || '', glycol: formData.glycol || '',
                    bubbles: formData.bubbles || '', antiwear: formData.antiwear || '', water: formData.water || '',
                    sootPercent: formData.sootPercent || '', biodieselFuelDilution: formData.biodieselFuelDilution || '',
                    molybdenum: formData.molybdenum || '', calcium: formData.calcium || '', magnesium: formData.magnesium || '',
                    phosphorus: formData.phosphorus || '', zinc: formData.zinc || '', barium: formData.barium || '',
                    boron: formData.boron || '', tbn: formData.tbn || '', oxidation: formData.oxidation || '',
                    nitration: formData.nitration || '', sulfation: formData.sulfation || '', viscosity40: formData.viscosity40 || '',
                    viscosity100: formData.viscosity100 || '', fluidIntegrity: formData.fluidIntegrity || '',
                });
            }

            if (mobileEngine) {
                Object.assign(oilResults, {
                    iron: formData.iron || '', chrome: formData.chrome || '', nickel: formData.nickel || '',
                    aluminum: formData.aluminum || '', lead: formData.lead || '', copper: formData.copper || '',
                    tin: formData.tin || '', titanium: formData.titanium || '', silver: formData.silver || '',
                    antimony: formData.antimony || '', cadmium: formData.cadmium || '', manganese: formData.manganese || '',
                    silicon: formData.silicon || '', sodium: formData.sodium || '', vanadium: formData.vanadium || '',
                    potassium: formData.potassium || '', lithium: formData.lithium || '', glycol: formData.glycol || '',
                    bubbles: formData.bubbles || '', water: formData.water || '', sootPercent: formData.sootPercent || '',
                    biodieselFuelDilution: formData.biodieselFuelDilution || '', molybdenum: formData.molybdenum || '',
                    calcium: formData.calcium || '', magnesium: formData.magnesium || '', phosphorus: formData.phosphorus || '',
                    zinc: formData.zinc || '', barium: formData.barium || '', boron: formData.boron || '',
                    tbn: formData.tbn || '', oxidation: formData.oxidation || '', nitration: formData.nitration || '',
                    sulfation: formData.sulfation || '', viscosity40: formData.viscosity40 || '',
                    viscosity100: formData.viscosity100 || '', antiwear: formData.antiwear || '',
                    fluidIntegrity: formData.fluidIntegrity || '',
                });
            }

            const payload = {
                asset_id: formData.assetId,
                component_id: formData.componentId,
                asset_running_hours: formData.runningHours,
                oil_running_hours: formData.oilRunningHours,
                oil_analysis_results: JSON.stringify(oilResults),
                recommendations: formData.recommendation,
                analysis_date: formData.analysisDate,
                created_by: username,
                additional_notes: formData.notes,
            };

            // if (level === 'l1') payload.l1 = '1';
            // else if (level === 'l2') payload.l2 = '1';
            // else if (level === 'l3') payload.l3 = '1';

            await axios.post(`${config.baseApi}/assetsAnalysis/add-assets-analysis`, payload);
            showAlertMessage('success', 'Success!', `Asset ${formData.assetName} - Component ${formData.componentName} was successfully recorded!`);
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
            assetId: '', assetName: '', componentId: '', componentName: '', runningHours: '', oilRunningHours: '',
            oilAnalysisResults: '', recommendation: '', analysisDate: '', notes: '',
            iron: '', chrome: '', lead: '', copper: '', silicon: '', water: '', viscosity40: '',
            nickel: '', aluminum: '', sodium: '', soot: '', tbn: '', tin: '', titanium: '', silver: '',
            antimony: '', cadmium: '', manganese: '', fatigue20: '', nonMetallic20: '', largeFe: '',
            feWearSeverity: '', totalFe100: '', vanadium: '', potassium: '', lithium: '', iso4406_4: '',
            iso4406_6: '', iso4406_14: '', cnts4: '', cnts6: '', cnts14: '', particles5_15: '',
            particles15_25: '', particles25_50: '', particles50_100: '', particles100: '', cutting20: '',
            sliding20: '', totalWater: '', bubbles: '', waterContent: '', largeFePercent: '', molybdenum: '',
            calcium: '', magnesium: '', phosphorus: '', zinc: '', barium: '', boron: '', tan: '', oxidation: '',
            viscosity100: '', fluidIntegrity: '', glycol: '', sootPercent: '', antiwear: '',
            biodieselFuelDilution: '', nitration: '', sulfation: ''
        });
        setSelectedAsset('');
        setSelectedComponent('');
        setSelectedAssetDetails(null);
        setSelectedComponentDetails(null);
        setStationaryEngine(false);
        setRotatingMachine(false);
        setMobileEngine(false);
        setActiveStep(1);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAssetChange = (e) => {
        const assetId = e.target.value;
        setSelectedAsset(assetId);
        setSelectedComponent('');
        setSelectedComponentDetails(null);
        setFormData(prev => ({ ...prev, assetId: assetId, componentId: '', componentName: '' }));
    };

    const formatDisplayName = (value) => {
        if (!value) return '-';
        return String(value).split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const getAssetTypeLabel = () => {
        if (rotatingMachine) return 'Rotating Machine';
        if (mobileEngine) return 'Mobile Engine';
        if (stationaryEngine) return 'Stationary Engine';
        return null;
    };

    const steps = [
        { id: 1, label: 'Asset Selection', icon: 'box', color: '#3B82F6' },
        { id: 2, label: 'Operating Data', icon: 'clock', color: '#10B981' },
        { id: 3, label: 'Oil Analysis', icon: 'droplet', color: '#8B5CF6' }
    ];

    // Consistent input style for all fields
    const inputStyle = {
        border: '2px solid #E2E8F0',
        borderRadius: '10px',
        padding: '10px 14px',
        fontSize: '0.85rem',
        width: '100%'
    };

    const unitStyle = {
        position: 'absolute',
        right: '12px',
        top: '10px',
        color: '#94A3B8',
        fontSize: '0.7rem'
    };

    const labelStyle = {
        fontSize: '0.75rem',
        fontWeight: '500',
        color: '#334155',
        marginBottom: '4px',
        display: 'block'
    };

    const requiredStar = <span style={{ color: '#EF4444' }}>*</span>;

    return (
        <div style={{
            background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
            minHeight: '100vh', padding: '40px', position: 'relative', overflow: 'hidden', paddingTop: '50px'
        }}>
            {/* Animated background elements */}
            <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: '-200px', right: '-200px', animation: 'float 25s infinite ease-in-out', zIndex: 1 }} />
            <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: '-150px', left: '-150px', animation: 'float 20s infinite ease-in-out reverse', zIndex: 1 }} />
            <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', top: '50%', left: '20%', animation: 'float 18s infinite ease-in-out', zIndex: 1 }} />

            <Loading show={isLoading} />
            <AnimatePresence>
                {showAlert && (
                    <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999, maxWidth: '400px' }}>
                        <AlertModal type={alertConfig.type} title={alertConfig.title} description={alertConfig.description} onClose={() => setShowAlert(false)} autoClose={5000} />
                    </motion.div>
                )}
            </AnimatePresence>

            <Container fluid style={{ position: 'relative', zIndex: 2, maxWidth: '1400px' }}>
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <FeatherIcon icon="droplet" size={30} color="#EAB56F" />
                                <h1 style={{
                                    fontSize: '2.8rem', fontWeight: '700', color: '#EAB56F',
                                    textShadow: '0 4px 20px rgba(255, 0, 0, 0.2)', margin: 0, display: 'flex', alignItems: 'center', gap: '12px'
                                }}>Oil Analysis Report</h1>
                            </div>
                            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', margin: 0, paddingLeft: '44px' }}>Submit laboratory analysis results for equipment condition monitoring</p>
                        </div>

                    </div>
                </motion.div>

                {/* Progress Steps */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '16px 24px', border: '2px solid rgb(37, 46, 77)' }}>
                        {steps.map((step, idx) => (
                            <div key={step.id} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%', background: activeStep >= step.id ? 'linear-gradient(135deg, #EAB56F, #F9982F)' : 'rgba(255,255,255,0.1)',
                                    border: activeStep >= step.id ? 'none' : '1px solid rgba(255,255,255,0.2)', color: activeStep >= step.id ? '#fff' : 'rgba(255,255,255,0.5)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', position: 'relative', zIndex: 1
                                }}>
                                    {activeStep > step.id ? <FeatherIcon icon="check" size={20} /> : step.id}
                                </div>
                                <div style={{ fontSize: '0.8rem', fontWeight: activeStep === step.id ? '600' : '400', color: activeStep === step.id ? '#EAB56F' : 'rgba(255,255,255,0.5)' }}>{step.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Main Form Card */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#FFFFFF', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 28px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FeatherIcon icon={steps.find(s => s.id === activeStep)?.icon || 'box'} size={22} color={steps.find(s => s.id === activeStep)?.color || '#3B82F6'} />
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#1E293B' }}>
                                    {activeStep === 1 && 'Asset & Component Selection'}
                                    {activeStep === 2 && 'Operating Hours & Analysis Date'}
                                    {activeStep === 3 && 'Oil Analysis Results'}
                                </h3>
                                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748B' }}>
                                    {activeStep === 1 && 'Select the asset and component being analyzed'}
                                    {activeStep === 2 && 'Enter current operating hours and analysis date'}
                                    {activeStep === 3 && 'Enter laboratory analysis results'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '28px' }}>
                        <Form onSubmit={handleSubmit}>
                            <AnimatePresence mode="wait">
                                {activeStep === 1 && (
                                    <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                                        <Row>
                                            <Col lg={8}>
                                                <div style={{ marginBottom: '24px' }}>
                                                    <Form.Label style={{ fontWeight: '500', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                                        <FeatherIcon icon="box" size={14} /> Active Asset <span style={{ color: '#EF4444' }}>*</span>
                                                    </Form.Label>
                                                    <Form.Select value={selectedAsset} onChange={handleAssetChange} style={{
                                                        border: '2px solid #E2E8F0',
                                                        borderRadius: '10px',
                                                        padding: '12px 16px',
                                                        fontSize: '0.95rem'
                                                    }}
                                                        onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}>
                                                        <option value="">-- Select an asset --</option>
                                                        {assets.map((asset) => (
                                                            <option key={asset.asset_id} value={asset.asset_id}>
                                                                {asset.asset_name} {asset.asset_category && `(${formatDisplayName(asset.asset_category)})`}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </div>
                                            </Col>
                                            <Col lg={4}>
                                                {selectedAssetDetails && (
                                                    <div style={{ background: '#F1F5F9', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px' }}>
                                                        <div style={{ fontSize: '0.7rem', color: '#ff7b00' }}><FeatherIcon icon="sliders" size={14} color={'#ff7b00'} /> Asset Type</div>
                                                        <div style={{ fontWeight: '500', fontSize: '0.9rem', color: '#1E293B', marginBottom: '8px' }}>{formatDisplayName(selectedAssetDetails.asset_type)}</div>
                                                        <div style={{ fontSize: '0.7rem', color: '#ff7b00' }}><FeatherIcon icon="grid" size={14} color={'#ff7b00'} /> Asset Category</div>
                                                        <div style={{ fontWeight: '500', fontSize: '0.9rem', color: '#1E293B' }}>{formatDisplayName(selectedAssetDetails.asset_category)}</div>
                                                        <div style={{ fontSize: '0.7rem', color: '#ff7b00', marginTop: '6px' }}> <FeatherIcon icon="map-pin" size={14} color={'#ff7b00'} /> Location: <div style={{ fontWeight: '500', fontSize: '0.9rem', color: '#1E293B' }}>{formatDisplayName(selectedAssetDetails.asset_location)}</div></div>

                                                    </div>
                                                )}
                                            </Col>
                                        </Row>

                                        {selectedAsset && (
                                            <Row>
                                                <Col lg={8}>
                                                    <div style={{ marginBottom: '24px' }}>
                                                        <Form.Label style={{ fontWeight: '500', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                                            <FeatherIcon icon="cpu" size={14} /> Asset Component <span style={{ color: '#EF4444' }}>*</span>
                                                        </Form.Label>
                                                        <Form.Select value={selectedComponent} onChange={handleComponentChange} style={{
                                                            border: '2px solid #E2E8F0',
                                                            borderRadius: '10px',
                                                            padding: '12px 16px',
                                                            fontSize: '0.95rem'
                                                        }}
                                                            onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}>
                                                            <option value="">-- Select a component --</option>
                                                            {filteredComponents.map((comp) => (
                                                                <option key={comp.asset_component_id} value={comp.asset_component_id}>
                                                                    {comp.asset_component_name} {comp.asset_component_type && `(${formatDisplayName(comp.asset_component_type)})`}
                                                                </option>
                                                            ))}
                                                        </Form.Select>
                                                        {filteredComponents.length === 0 && selectedAsset && (
                                                            <Alert variant="danger" className="mt-3" style={{ backgroundColor: '#FEE2E2', borderColor: '#EF4444', fontSize: '0.8rem', padding: '8px 12px' }}>
                                                                <FeatherIcon icon="alert-triangle" size={14} style={{ marginRight: '8px' }} /> No components registered for this asset. Please add components first.
                                                            </Alert>
                                                        )}
                                                    </div>
                                                </Col>
                                                <Col lg={4}>
                                                    {selectedComponentDetails && (
                                                        <div style={{ background: '#F1F5F9', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px' }}>
                                                            <div style={{ fontSize: '0.7rem', color: '#ff7b00', marginBottom: '4px' }}> <FeatherIcon icon="settings" size={14} color={'#ff7b00'} /> Component Type</div>
                                                            <div style={{ fontWeight: '500', fontSize: '0.9rem', color: '#1E293B' }}>{formatDisplayName(selectedComponentDetails.asset_component_type)}</div>
                                                        </div>
                                                    )}
                                                </Col>
                                            </Row>
                                        )}

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                                            <button onClick={handleNextStep} type="button" style={{
                                                background: 'linear-gradient(135deg, #EAB56F, #F9982F)',
                                                border: 'none', borderRadius: '12px', padding: '14px 28px',
                                                fontSize: '0.95rem', fontWeight: '600', color: '#fff',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                gap: '10px', boxShadow: '0 4px 15px rgba(233, 150, 40, 0.3)',
                                                transition: 'all 0.2s ease',
                                            }}
                                                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(233, 150, 40, 0.4)'; }}
                                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(233, 150, 40, 0.3)'; }}>Next: Operating Data <FeatherIcon icon="arrow-right" size={16} /></button>
                                        </div>
                                    </motion.div>
                                )}

                                {activeStep === 2 && (
                                    <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                                        <Row>
                                            <Col md={6}>
                                                <div style={{ marginBottom: '24px' }}>
                                                    <Form.Label style={{ fontWeight: '500', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                                        <FeatherIcon icon="activity" size={14} /> Asset Running Hours <span style={{ color: '#EF4444' }}>*</span>
                                                    </Form.Label>
                                                    <div style={{ position: 'relative' }}>
                                                        <Form.Control type="number" name="runningHours" value={formData.runningHours} onChange={handleInputChange} step="0.1" placeholder="0.0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                        <span style={unitStyle}>hours</span>
                                                    </div>
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <div style={{ marginBottom: '24px' }}>
                                                    <Form.Label style={{ fontWeight: '500', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                                        <FeatherIcon icon="clock" size={14} /> Oil Running Hours <span style={{ color: '#EF4444' }}>*</span>
                                                    </Form.Label>
                                                    <div style={{ position: 'relative' }}>
                                                        <Form.Control type="number" name="oilRunningHours" value={formData.oilRunningHours} onChange={handleInputChange} step="0.1" placeholder="0.0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                        <span style={unitStyle}>hours</span>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <div style={{ marginBottom: '24px' }}>
                                                    <Form.Label style={{ fontWeight: '500', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                                        <FeatherIcon icon="calendar" size={14} /> Analysis Date <span style={{ color: '#EF4444' }}>*</span>
                                                    </Form.Label>
                                                    <Form.Control type="date" name="analysisDate" value={formData.analysisDate} onChange={handleInputChange} style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                </div>
                                            </Col>
                                            <Col md={6}>
                                                <div style={{ marginBottom: '24px' }}>
                                                    <Form.Label style={{ fontWeight: '500', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                                        <FeatherIcon icon="user" size={14} /> Created By
                                                    </Form.Label>
                                                    <Form.Control disabled value={username} style={{ ...inputStyle, background: '#F1F5F9' }} />
                                                </div>
                                            </Col>
                                        </Row>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                                            <button onClick={handlePrevStep} type="button" style={{ background: 'transparent', border: '2px solid #CBD5E1', borderRadius: '12px', padding: '12px 28px', color: '#64748B', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                onMouseEnter={(e) => { e.target.style.borderColor = '#ff7b00'; }}
                                                onMouseLeave={(e) => { e.target.style.borderColor = '#CBD5E1'; }}>
                                                <FeatherIcon icon="arrow-left" size={16} />
                                                Back
                                            </button>
                                            <button onClick={handleNextStep} type="button" style={{
                                                background: 'linear-gradient(135deg, #EAB56F, #F9982F)',
                                                border: 'none', borderRadius: '12px', padding: '14px 28px',
                                                fontSize: '0.95rem', fontWeight: '600', color: '#fff',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                                gap: '10px', boxShadow: '0 4px 15px rgba(233, 150, 40, 0.3)',
                                                transition: 'all 0.2s ease',
                                            }}
                                                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(233, 150, 40, 0.4)'; }}
                                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(233, 150, 40, 0.3)'; }}>Next: Oil Analysis <FeatherIcon icon="arrow-right" size={16} /></button>
                                        </div>
                                    </motion.div>
                                )}

                                {activeStep === 3 && (
                                    <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                                        {/* Asset Type Banner */}
                                        {getAssetTypeLabel() && (
                                            <div style={{ background: '#FEF3C7', borderRadius: '12px', padding: '12px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <FeatherIcon icon="info" size={18} color="#D97706" />
                                                    <span style={{ fontSize: '0.85rem', color: '#92400E' }}>Analysis template: <strong>{getAssetTypeLabel()}</strong></span>
                                                </div>
                                                <span style={{ fontSize: '0.7rem', color: '#92400E' }}>All fields are required</span>
                                            </div>
                                        )}

                                        {(rotatingMachine || mobileEngine || stationaryEngine) && (
                                            <>
                                                {/* Wear Metals Section */}
                                                <div style={{ marginBottom: '20px' }}>
                                                    <div onClick={() => toggleSection('wearMetal')} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid #E2E8F0' }}>
                                                        <img src={gear} width="24px" alt="gear" />
                                                        <h6 style={{ margin: 0, fontWeight: '600', color: '#1E293B' }}>Wear Metals</h6>
                                                        <FeatherIcon icon={expandedSections.wearMetal ? 'chevron-up' : 'chevron-down'} size={18} color="#64748B" style={{ marginLeft: 'auto' }} />
                                                    </div>
                                                    <AnimatePresence>
                                                        {expandedSections.wearMetal && (
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                                                                <Row className="gy-3" style={{ marginTop: '16px' }}>
                                                                    {['iron', 'chrome', 'nickel', 'aluminum', 'lead', 'copper', 'tin', 'titanium', 'silver', 'antimony', 'cadmium', 'manganese'].map(metal => (
                                                                        <Col md={3} key={metal}>
                                                                            <Form.Group>
                                                                                <label style={labelStyle}>{metal.charAt(0).toUpperCase() + metal.slice(1)} {requiredStar}</label>
                                                                                <div style={{ position: 'relative' }}>
                                                                                    <Form.Control type="text" name={metal} value={formData[metal] || ''} onChange={handleInputChange} placeholder="0.00" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                    <span style={unitStyle}>ppm</span>
                                                                                </div>
                                                                            </Form.Group>
                                                                        </Col>
                                                                    ))}
                                                                    {rotatingMachine && (
                                                                        <>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Fatigue &gt;20 μm {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="fatigue20" value={formData.fatigue20 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>part./ml</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Non-Metallic &gt;20 μm {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="nonMetallic20" value={formData.nonMetallic20 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>part./ml</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Large Fe {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="largeFe" value={formData.largeFe || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>ppm</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Fe Wear Severity {requiredStar}</label>
                                                                                    <Form.Control type="text" name="feWearSeverity" value={formData.feWearSeverity || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Total Fe &lt;100μ {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="totalFe100" value={formData.totalFe100 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>ppm</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                        </>
                                                                    )}
                                                                </Row>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                {/* Contaminants Section */}
                                                <div style={{ marginBottom: '20px' }}>
                                                    <div onClick={() => toggleSection('contaminants')} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid #E2E8F0' }}>
                                                        <img src={water} width="24px" alt="water" />
                                                        <h6 style={{ margin: 0, fontWeight: '600', color: '#1E293B' }}>Contaminants</h6>
                                                        <FeatherIcon icon={expandedSections.contaminants ? 'chevron-up' : 'chevron-down'} size={18} color="#64748B" style={{ marginLeft: 'auto' }} />
                                                    </div>
                                                    <AnimatePresence>
                                                        {expandedSections.contaminants && (
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                                                                <Row className="gy-3" style={{ marginTop: '16px' }}>
                                                                    {['silicon', 'sodium', 'vanadium', 'potassium', 'lithium'].map(cont => (
                                                                        <Col md={3} key={cont}>
                                                                            <Form.Group>
                                                                                <label style={labelStyle}>{cont.charAt(0).toUpperCase() + cont.slice(1)} {requiredStar}</label>
                                                                                <div style={{ position: 'relative' }}>
                                                                                    <Form.Control type="text" name={cont} value={formData[cont] || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                    <span style={unitStyle}>ppm</span>
                                                                                </div>
                                                                            </Form.Group>
                                                                        </Col>
                                                                    ))}
                                                                    {(mobileEngine || stationaryEngine) && (
                                                                        <>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Glycol % {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="glycol" value={formData.glycol || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>%</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Bubbles {requiredStar}</label>
                                                                                    <Form.Control type="text" name="bubbles" value={formData.bubbles || ''} onChange={handleInputChange} placeholder="Normal" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Water {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="water" value={formData.water || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>ppm</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Soot % {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="sootPercent" value={formData.sootPercent || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>%</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Biodiesel Fuel Dilution {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="biodieselFuelDilution" value={formData.biodieselFuelDilution || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>wt%</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            {stationaryEngine && (
                                                                                <Col md={3}>
                                                                                    <Form.Group>
                                                                                        <label style={labelStyle}>Antiwear % {requiredStar}</label>
                                                                                        <div style={{ position: 'relative' }}>
                                                                                            <Form.Control type="text" name="antiwear" value={formData.antiwear || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                            <span style={unitStyle}>%</span>
                                                                                        </div>
                                                                                    </Form.Group>
                                                                                </Col>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                    {rotatingMachine && (
                                                                        <>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>ISO 4406 (&gt;4 μm) {requiredStar}</label>
                                                                                    <Form.Control type="text" name="iso4406_4" value={formData.iso4406_4 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>ISO 4406 (&gt;6 μm) {requiredStar}</label>
                                                                                    <Form.Control type="text" name="iso4406_6" value={formData.iso4406_6 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>ISO 4406 (&gt;14 μm) {requiredStar}</label>
                                                                                    <Form.Control type="text" name="iso4406_14" value={formData.iso4406_14 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Cnts &gt;4 {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="cnts4" value={formData.cnts4 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>part./ml</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Cnts &gt;6 {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="cnts6" value={formData.cnts6 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>part./ml</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Cnts &gt;14 {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="cnts14" value={formData.cnts14 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>part./ml</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Particles 5-15 μm {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="particles5_15" value={formData.particles5_15 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>part./100ml</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Particles 15-25 μm {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="particles15_25" value={formData.particles15_25 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>part./100ml</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Particles 25-50 μm {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="particles25_50" value={formData.particles25_50 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>part./100ml</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Particles 50-100 μm {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="particles50_100" value={formData.particles50_100 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>part./100ml</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Particles &gt;100μm {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="particles100" value={formData.particles100 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>part./100ml</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Cutting &gt;20μm {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="cutting20" value={formData.cutting20 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>part./ml</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Sliding &gt;20μm {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="sliding20" value={formData.sliding20 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>part./ml</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Total Water {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="totalWater" value={formData.totalWater || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>ppm</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Bubbles {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="bubbles" value={formData.bubbles || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>%</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Water Content {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="waterContent" value={formData.waterContent || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>ppm</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Large Fe % {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="largeFePercent" value={formData.largeFePercent || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>%</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                        </>
                                                                    )}
                                                                </Row>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                {/* Chemistry and Viscosity Section */}
                                                <div style={{ marginBottom: '20px' }}>
                                                    <div onClick={() => toggleSection('chemistry')} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 0', borderBottom: '1px solid #E2E8F0' }}>
                                                        <img src={lab} width="24px" alt="lab" />
                                                        <h6 style={{ margin: 0, fontWeight: '600', color: '#1E293B' }}>Chemistry & Viscosity</h6>
                                                        <FeatherIcon icon={expandedSections.chemistry ? 'chevron-up' : 'chevron-down'} size={18} color="#64748B" style={{ marginLeft: 'auto' }} />
                                                    </div>
                                                    <AnimatePresence>
                                                        {expandedSections.chemistry && (
                                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                                                                <Row className="gy-3" style={{ marginTop: '16px' }}>
                                                                    {['molybdenum', 'calcium', 'magnesium', 'phosphorus', 'zinc', 'barium', 'boron'].map(chem => (
                                                                        <Col md={3} key={chem}>
                                                                            <Form.Group>
                                                                                <label style={labelStyle}>{chem.charAt(0).toUpperCase() + chem.slice(1)} {requiredStar}</label>
                                                                                <div style={{ position: 'relative' }}>
                                                                                    <Form.Control type="text" name={chem} value={formData[chem] || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                    <span style={unitStyle}>ppm</span>
                                                                                </div>
                                                                            </Form.Group>
                                                                        </Col>
                                                                    ))}
                                                                    {(mobileEngine || stationaryEngine) && (
                                                                        <Col md={3}>
                                                                            <Form.Group>
                                                                                <label style={labelStyle}>TBN {requiredStar}</label>
                                                                                <div style={{ position: 'relative' }}>
                                                                                    <Form.Control type="text" name="tbn" value={formData.tbn || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                    <span style={unitStyle}>mg KOH/g</span>
                                                                                </div>
                                                                            </Form.Group>
                                                                        </Col>
                                                                    )}
                                                                    {rotatingMachine && (
                                                                        <Col md={3}>
                                                                            <Form.Group>
                                                                                <label style={labelStyle}>TAN {requiredStar}</label>
                                                                                <div style={{ position: 'relative' }}>
                                                                                    <Form.Control type="text" name="tan" value={formData.tan || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                    <span style={unitStyle}>mg KOH/g</span>
                                                                                </div>
                                                                            </Form.Group>
                                                                        </Col>
                                                                    )}
                                                                    {(mobileEngine || stationaryEngine) && (
                                                                        <>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Oxidation {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="oxidation" value={formData.oxidation || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>abs/0.1mm</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Nitration {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="nitration" value={formData.nitration || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>abs/cm</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                            <Col md={3}>
                                                                                <Form.Group>
                                                                                    <label style={labelStyle}>Sulfation {requiredStar}</label>
                                                                                    <div style={{ position: 'relative' }}>
                                                                                        <Form.Control type="text" name="sulfation" value={formData.sulfation || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                        <span style={unitStyle}>abs/0.1mm</span>
                                                                                    </div>
                                                                                </Form.Group>
                                                                            </Col>
                                                                        </>
                                                                    )}
                                                                    {rotatingMachine && (
                                                                        <Col md={3}>
                                                                            <Form.Group>
                                                                                <label style={labelStyle}>Oxidation {requiredStar}</label>
                                                                                <div style={{ position: 'relative' }}>
                                                                                    <Form.Control type="text" name="oxidation" value={formData.oxidation || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                    <span style={unitStyle}>abs/cm</span>
                                                                                </div>
                                                                            </Form.Group>
                                                                        </Col>
                                                                    )}
                                                                    <Col md={3}>
                                                                        <Form.Group>
                                                                            <label style={labelStyle}>Viscosity at 40°C {requiredStar}</label>
                                                                            <div style={{ position: 'relative' }}>
                                                                                <Form.Control type="text" name="viscosity40" value={formData.viscosity40 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                <span style={unitStyle}>cSt</span>
                                                                            </div>
                                                                        </Form.Group>
                                                                    </Col>
                                                                    <Col md={3}>
                                                                        <Form.Group>
                                                                            <label style={labelStyle}>Viscosity at 100°C {requiredStar}</label>
                                                                            <div style={{ position: 'relative' }}>
                                                                                <Form.Control type="text" name="viscosity100" value={formData.viscosity100 || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                <span style={unitStyle}>cSt</span>
                                                                            </div>
                                                                        </Form.Group>
                                                                    </Col>
                                                                    {mobileEngine && (
                                                                        <Col md={3}>
                                                                            <Form.Group>
                                                                                <label style={labelStyle}>Antiwear % {requiredStar}</label>
                                                                                <div style={{ position: 'relative' }}>
                                                                                    <Form.Control type="text" name="antiwear" value={formData.antiwear || ''} onChange={handleInputChange} placeholder="0" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                                    <span style={unitStyle}>%</span>
                                                                                </div>
                                                                            </Form.Group>
                                                                        </Col>
                                                                    )}
                                                                    <Col md={3}>
                                                                        <Form.Group>
                                                                            <label style={labelStyle}>Fluid Integrity {requiredStar}</label>
                                                                            <Form.Control type="text" name="fluidIntegrity" value={formData.fluidIntegrity || ''} onChange={handleInputChange} placeholder="Rating" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                                                        </Form.Group>
                                                                    </Col>
                                                                </Row>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </>
                                        )}

                                        {/* Recommendation Field */}
                                        <div style={{ marginTop: '24px', marginBottom: '20px' }}>
                                            <Form.Label style={{ fontWeight: '500', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FeatherIcon icon="file-text" size={14} /> Recommendations <span style={{ color: '#EF4444' }}>*</span>
                                            </Form.Label>
                                            <Form.Control as="textarea" rows={3} name="recommendation" value={formData.recommendation || ''} onChange={handleInputChange} placeholder="Enter maintenance recommendations based on analysis results..." style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                        </div>

                                        <div style={{ marginBottom: '24px' }}>
                                            <Form.Label style={{ fontWeight: '500', color: '#334155', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <FeatherIcon icon="edit-2" size={14} /> Additional Notes
                                            </Form.Label>
                                            <Form.Control as="textarea" rows={2} name="notes" value={formData.notes || ''} onChange={handleInputChange} placeholder="Any additional comments or observations..." style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
                                            <button
                                                onClick={handlePrevStep}
                                                type="button"
                                                style={{
                                                    background: 'transparent',
                                                    border: '2px solid #CBD5E1',
                                                    borderRadius: '12px',
                                                    padding: '12px 28px',
                                                    color: '#64748B',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    transition: 'all 0.2s ease' // Smooth transition
                                                }}
                                                onMouseEnter={(e) => { e.target.style.borderColor = '#ff7b00'; }}
                                                onMouseLeave={(e) => { e.target.style.borderColor = '#CBD5E1'; }}

                                            >
                                                <FeatherIcon icon="arrow-left" size={16} />
                                                Back
                                            </button>
                                            <button type="submit" disabled={isLoading} style={{
                                                background: 'linear-gradient(135deg, #EAB56F, #F9982F)', border: 'none', borderRadius: '12px', padding: '12px 32px', color: 'white', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1
                                            }} onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(233, 150, 40, 0.4)'; }}
                                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(233, 150, 40, 0.3)'; }}>{isLoading ? <><Spinner animation="border" size="sm" /> Submitting...</> : <>Submit Report <FeatherIcon icon="check-circle" size={16} /></>}</button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Form>
                    </div>
                </motion.div>
            </Container>

            <style>{`@keyframes float { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 33% { transform: translate(50px, -50px) rotate(120deg); } 66% { transform: translate(-30px, 30px) rotate(240deg); } }`}</style>
        </div>
    );
}