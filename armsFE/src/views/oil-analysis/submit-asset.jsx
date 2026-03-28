import { useEffect, useState } from "react";
import axios from 'axios';
import config from 'config';
import { Container, Row, Col, Form, Card, Button, Spinner, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Loading from '../../components/personalComponents/loading';
import AlertModal from '../../components/personalComponents/alertModal';
import FeatherIcon from "feather-icons-react";
import water from "assets/images/water.png"
import gear from "assets/images/gear-box.png"
import lab from "assets/images/lab.png"

export default function SubmitAsset() {
    // State Management
    const [assets, setAssets] = useState([]); // Store all active assets
    const [assetComponents, setAssetComponents] = useState([]); // Store all asset components
    const [filteredComponents, setFilteredComponents] = useState([]); // Store components filtered by selected asset
    const [submitting, setSubmitting] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState('');
    const [selectedComponent, setSelectedComponent] = useState(''); // Track selected component
    const [selectedComponentDetails, setSelectedComponentDetails] = useState(null); // Store selected component details
    const [selectedAssetDetails, setSelectedAssetDetails] = useState(null);
    const [level, setLevel] = useState('')
    const [username, setUsername] = useState('')

    // Form data state
    const [formData, setFormData] = useState({
        assetId: '',
        assetName: '',
        componentId: '',
        componentName: '',
        runningHours: '',
        oilRunningHours: '',
        oilAnalysisResults: '',
        recommendation: '',
        analysisDate: '',
        notes: '',
        // Common fields
        iron: '',
        chrome: '',
        lead: '',
        copper: '',
        silicon: '',
        water: '',
        viscosity40: '',
        // Stationary Engine specific
        nickel: '',
        aluminum: '',
        sodium: '',
        soot: '',
        tbn: '',
        tin: '',
        titanium: '',
        silver: '',
        antimony: '',
        cadmium: '',
        manganese: '',
        vanadium: '',
        potassium: '',
        lithium: '',
        glycol: '',
        bubbles: '',
        antiwear: '',
        sootPercent: '',
        biodieselFuelDilution: '',
        molybdenum: '',
        calcium: '',
        magnesium: '',
        phosphorus: '',
        zinc: '',
        barium: '',
        boron: '',
        oxidation: '',
        nitration: '',
        sulfation: '',
        viscosity100: '',
        fluidIntegrity: '',
        // Rotating Machine specific fields
        fatigue20: '',
        nonMetallic20: '',
        largeFe: '',
        feWearSeverity: '',
        totalFe100: '',
        iso4406_4: '',
        iso4406_6: '',
        iso4406_14: '',
        cnts4: '',
        cnts6: '',
        cnts14: '',
        particles5_15: '',
        particles15_25: '',
        particles25_50: '',
        particles50_100: '',
        particles100: '',
        cutting20: '',
        sliding20: '',
        totalWater: '',
        waterContent: '',
        largeFePercent: '',
        tan: '',
        // Mobile Engine specific fields
        // Added all fields for mobile engine
    });

    // Alert state
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        type: 'success',
        title: '',
        description: ''
    });

    // Loading state
    const [isLoading, setIsLoading] = useState(false);

    // Category-specific state for conditional rendering
    const [rotatingMachine, setRotatingMachine] = useState(false);
    const [mobileEngine, setMobileEngine] = useState(false);
    const [stationaryEngine, setStationaryEngine] = useState(false);

    const [wearmetal, setWearMetal] = useState(true);
    const [contaminants, setContaminants] = useState(true);
    const [chem, setChem] = useState(true);

    // Color palette for consistent styling
    const styles = {
        primary: '#EAB56F',
        secondary: '#F9982F',
        accent: '#E37239',
        dark: '#171C2D',
        deep: '#254252',
        light: '#FDF8F0'
    };

    /**
     * Show alert message with specified type, title, and description
     */
    const showAlertMessage = (type, title, description) => {
        setAlertConfig({ type, title, description });
        setShowAlert(true);
    };

    /**
     * Fetch all active assets and their components on component mount
     */
    useEffect(() => {
        const fetchActiveAssets = async () => {
            try {
                const empInfo = JSON.parse(localStorage.getItem("user"));
                setUsername(empInfo.user_name);
                setLevel(empInfo.emp_position)

                console.log('User position:', empInfo.emp_position)
                setIsLoading(true);

                const res = await axios.get(`${config.baseApi}/assets/get-all-assets`);
                const data = res.data || [];
                const active = data.filter((a) => a.is_active === '1');
                setAssets(active);
                console.log('Active assets:', active);

                const res1 = await axios.get(`${config.baseApi}/assets/get-all-components`);
                const data1 = res1.data || [];
                setAssetComponents(data1);
                console.log('All components:', data1);

            } catch (err) {
                console.log('Unable to fetch all assets', err);
                showAlertMessage('error', 'Error', 'Unable to fetch all assets. Server went wrong!')
            } finally {
                setIsLoading(false);
            }
        };

        fetchActiveAssets();
    }, []);

    /**
     * Filter components based on selected asset
     */
    useEffect(() => {
        if (selectedAsset && assetComponents.length > 0) {
            const componentsForAsset = assetComponents.filter(
                component => component.asset_id === selectedAsset
            );
            setFilteredComponents(componentsForAsset);
            console.log(`Components for asset ${selectedAsset}:`, componentsForAsset);
        } else {
            setFilteredComponents([]);
        }
    }, [selectedAsset, assetComponents]);

    /**
     * Update selected asset details when asset selection changes
     */
    useEffect(() => {
        if (selectedAsset) {
            const asset = assets.find(a => a.asset_id === Number(selectedAsset));
            setSelectedAssetDetails(asset);
            if (asset) {
                setFormData(prev => ({
                    ...prev,
                    assetName: asset.asset_name || ''
                }));
            }
        } else {
            setSelectedAssetDetails(null);
        }
    }, [selectedAsset, assets]);

    /**
     * Update category state based on selected asset category
     */
    useEffect(() => {
        if (selectedAssetDetails && selectedAssetDetails.asset_category) {
            const category = selectedAssetDetails.asset_category;

            setStationaryEngine(category === 'stationary-engines' || category === 'stationary engine');
            setRotatingMachine(category === 'rotating-machines' || category === 'rotating machine');
            setMobileEngine(category === 'mobile-engines' || category === 'mobile engine');

            console.log('Asset category detected:', category);
            console.log('Rotating Machine:', category === 'rotating' || category === 'rotating machine');
        } else {
            setStationaryEngine(false);
            setRotatingMachine(false);
            setMobileEngine(false);
        }
    }, [selectedAssetDetails]);

    /**
     * Handle component selection
     */
    const handleComponentChange = (e) => {
        const componentId = e.target.value;
        setSelectedComponent(componentId);

        const selectedComp = filteredComponents.find(
            comp => comp.asset_component_id === Number(componentId)
        );

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

    /**
     * Validate form fields before submission
     */
    const validateForm = () => {
        if (!formData.assetId) {
            showAlertMessage('error', 'Empty Fields', 'Asset is required');
            setIsLoading(false)
            return false;
        }

        if (!formData.componentId) {
            showAlertMessage('error', 'Empty Fields', 'Asset Component is required. Please select a component for this asset.');
            setIsLoading(false)
            return false;
        }

        if (!formData.runningHours) {
            showAlertMessage('error', 'Empty Fields', 'Asset Running Hours is required');
            setIsLoading(false)
            return false;
        }

        if (!formData.oilRunningHours) {
            showAlertMessage('error', 'Empty Fields', 'Oil Running Hours is required');
            setIsLoading(false)
            return false;
        }

        if (!formData.recommendation.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Recommendation is required');
            setIsLoading(false)
            return false;
        }

        if (!formData.analysisDate.trim()) {
            showAlertMessage('error', 'Empty Fields', 'Analysis Date is required');
            setIsLoading(false)
            return false;
        }

        //Rotating Machines Validation
        if (rotatingMachine) {
            //Wear Metal
            if (!formData.iron ||
                !formData.chrome ||
                !formData.nickel ||
                !formData.aluminum ||
                !formData.lead ||
                !formData.copper ||
                !formData.tin ||
                !formData.titanium ||
                !formData.silver ||
                !formData.antimony ||
                !formData.cadmium ||
                !formData.manganese ||
                !formData.fatigue20 ||
                !formData.nonMetallic20 ||
                !formData.largeFe ||
                !formData.feWearSeverity ||
                !formData.totalFe100
            ) {
                showAlertMessage('error', 'Empty Fields', 'Their is a missing data under Oil Analysis Results - Wear Metal.');
                setIsLoading(false)
                return false;
            }
            //Contaminants
            if (!formData.silicon ||
                !formData.sodium ||
                !formData.vanadium ||
                !formData.potassium ||
                !formData.lithium ||
                !formData.iso4406_4 ||
                !formData.iso4406_6 ||
                !formData.iso4406_14 ||
                !formData.cnts4 ||
                !formData.cnts6 ||
                !formData.cnts14 ||
                !formData.particles5_15 ||
                !formData.particles15_25 ||
                !formData.particles25_50 ||
                !formData.particles50_100 ||
                !formData.particles100 ||
                !formData.cutting20 ||
                !formData.sliding20 ||
                !formData.totalWater ||
                !formData.bubbles ||
                !formData.waterContent ||
                !formData.largeFePercent
            ) {
                showAlertMessage('error', 'Empty Fields', 'Their is a missing data under Oil Analysis Results - Contaminants.');
                setIsLoading(false)
                return false;
            }
            //Chemistry & Viscosity
            if (!formData.molybdenum ||
                !formData.calcium ||
                !formData.magnesium ||
                !formData.phosphorus ||
                !formData.zinc ||
                !formData.barium ||
                !formData.boron ||
                !formData.tan ||
                !formData.oxidation ||
                !formData.viscosity40 ||
                !formData.viscosity100 ||
                !formData.fluidIntegrity
            ) {
                showAlertMessage('error', 'Empty Fields', 'Their is a missing data under Oil Analysis - Chemistry and Viscosity.');
                setIsLoading(false)
                return false;
            }
        }
        //MObile Engines Validation
        if (mobileEngine) {
            //Wear Metal
            if (!formData.iron ||
                !formData.chrome ||
                !formData.nickel ||
                !formData.aluminum ||
                !formData.lead ||
                !formData.copper ||
                !formData.tin ||
                !formData.titanium ||
                !formData.silver ||
                !formData.antimony ||
                !formData.cadmium ||
                !formData.manganese
            ) {
                showAlertMessage('error', 'Empty Fields', 'Their is a missing data under Oil Analysis Results - Wear Metal.');
                setIsLoading(false)
                return false;
            }
            //Contaminants
            if (!formData.silicon ||
                !formData.sodium ||
                !formData.vanadium ||
                !formData.potassium ||
                !formData.lithium ||
                !formData.glycol ||
                !formData.bubbles ||
                !formData.water ||
                !formData.sootPercent ||
                !formData.biodieselFuelDilution
            ) {
                showAlertMessage('error', 'Empty Fields', 'Their is a missing data under Oil Analysis Results - Contaminants.');
                setIsLoading(false)
                return false;
            }
            //Chemistry & Viscosity
            if (!formData.molybdenum ||
                !formData.calcium ||
                !formData.magnesium ||
                !formData.phosphorus ||
                !formData.zinc ||
                !formData.barium ||
                !formData.boron ||
                !formData.tbn ||
                !formData.oxidation ||
                !formData.nitration ||
                !formData.sulfation ||
                !formData.viscosity40 ||
                !formData.viscosity100 ||
                !formData.antiwear ||
                !formData.fluidIntegrity
            ) {
                showAlertMessage('error', 'Empty Fields', 'Their is a missing data under Oil Analysis - Chemistry and Viscosity.');
                setIsLoading(false)
                return false;
            }
        }
        //Stationarry Engine Validation
        if (stationaryEngine) {
            //Wear Metal
            if (!formData.iron ||
                !formData.chrome ||
                !formData.nickel ||
                !formData.aluminum ||
                !formData.lead ||
                !formData.copper ||
                !formData.tin ||
                !formData.titanium ||
                !formData.silver ||
                !formData.antimony ||
                !formData.cadmium ||
                !formData.manganese
            ) {
                showAlertMessage('error', 'Empty Fields', 'Their is a missing data under Oil Analysis Results - Wear Metal.');
                setIsLoading(false)
                return false;
            }
            //Contaminants
            if (!formData.silicon ||
                !formData.sodium ||
                !formData.vanadium ||
                !formData.potassium ||
                !formData.lithium ||
                !formData.glycol ||
                !formData.bubbles ||
                !formData.antiwear ||
                !formData.water ||
                !formData.sootPercent ||
                !formData.biodieselFuelDilution
            ) {
                showAlertMessage('error', 'Empty Fields', 'Their is a missing data under Oil Analysis Results - Contaminants.');
                setIsLoading(false)
                return false;
            }
            //Chemistry & Viscosity
            if (!formData.molybdenum ||
                !formData.calcium ||
                !formData.magnesium ||
                !formData.phosphorus ||
                !formData.zinc ||
                !formData.barium ||
                !formData.boron ||
                !formData.tbn ||
                !formData.oxidation ||
                !formData.nitration ||
                !formData.sulfation ||
                !formData.viscosity40 ||
                !formData.viscosity100 ||
                !formData.fluidIntegrity
            ) {
                showAlertMessage('error', 'Empty Fields', 'Their is a missing data under Oil Analysis - Chemistry and Viscosity.');
                setIsLoading(false)
                return false;
            }
        }

        return true;
    };

    // SUBMIT FUNCTION
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true)

        console.log('Form Data Summary:', formData);

        if (!validateForm()) {
            setIsLoading(false);
            return;
        }

        try {
            const payload = {
                asset_id: formData.assetId,
                component_id: formData.componentId,
                asset_running_hours: formData.runningHours,
                oil_running_hours: formData.oilRunningHours,
                oil_analysis_results: JSON.stringify({
                    // Include all oil analysis fields based on category
                    ...(rotatingMachine && {
                        // Wear Metals
                        iron: formData.iron,
                        chrome: formData.chrome,
                        nickel: formData.nickel,
                        aluminum: formData.aluminum,
                        lead: formData.lead,
                        copper: formData.copper,
                        tin: formData.tin,
                        titanium: formData.titanium,
                        silver: formData.silver,
                        antimony: formData.antimony,
                        cadmium: formData.cadmium,
                        manganese: formData.manganese,
                        fatigue20: formData.fatigue20,
                        nonMetallic20: formData.nonMetallic20,
                        largeFe: formData.largeFe,
                        feWearSeverity: formData.feWearSeverity,
                        totalFe100: formData.totalFe100,
                        // Contaminants
                        silicon: formData.silicon,
                        sodium: formData.sodium,
                        vanadium: formData.vanadium,
                        potassium: formData.potassium,
                        lithium: formData.lithium,
                        iso4406_4: formData.iso4406_4,
                        iso4406_6: formData.iso4406_6,
                        iso4406_14: formData.iso4406_14,
                        cnts4: formData.cnts4,
                        cnts6: formData.cnts6,
                        cnts14: formData.cnts14,
                        particles5_15: formData.particles5_15,
                        particles15_25: formData.particles15_25,
                        particles25_50: formData.particles25_50,
                        particles50_100: formData.particles50_100,
                        particles100: formData.particles100,
                        cutting20: formData.cutting20,
                        sliding20: formData.sliding20,
                        totalWater: formData.totalWater,
                        bubbles: formData.bubbles,
                        waterContent: formData.waterContent,
                        largeFePercent: formData.largeFePercent,
                        // Chemistry and Viscosity
                        molybdenum: formData.molybdenum,
                        calcium: formData.calcium,
                        magnesium: formData.magnesium,
                        phosphorus: formData.phosphorus,
                        zinc: formData.zinc,
                        barium: formData.barium,
                        boron: formData.boron,
                        tan: formData.tan,
                        oxidation: formData.oxidation,
                        viscosity40: formData.viscosity40,
                        viscosity100: formData.viscosity100,
                        fluidIntegrity: formData.fluidIntegrity,
                    }),
                    ...(stationaryEngine && {
                        // Wear Metals
                        iron: formData.iron,
                        chrome: formData.chrome,
                        nickel: formData.nickel,
                        aluminum: formData.aluminum,
                        lead: formData.lead,
                        copper: formData.copper,
                        tin: formData.tin,
                        titanium: formData.titanium,
                        silver: formData.silver,
                        antimony: formData.antimony,
                        cadmium: formData.cadmium,
                        manganese: formData.manganese,
                        // Contaminants
                        silicon: formData.silicon,
                        sodium: formData.sodium,
                        vanadium: formData.vanadium,
                        potassium: formData.potassium,
                        lithium: formData.lithium,
                        glycol: formData.glycol,
                        bubbles: formData.bubbles,
                        antiwear: formData.antiwear,
                        water: formData.water,
                        sootPercent: formData.sootPercent,
                        biodieselFuelDilution: formData.biodieselFuelDilution,
                        // Chemistry and Viscosity
                        molybdenum: formData.molybdenum,
                        calcium: formData.calcium,
                        magnesium: formData.magnesium,
                        phosphorus: formData.phosphorus,
                        zinc: formData.zinc,
                        barium: formData.barium,
                        boron: formData.boron,
                        tbn: formData.tbn,
                        oxidation: formData.oxidation,
                        nitration: formData.nitration,
                        sulfation: formData.sulfation,
                        viscosity40: formData.viscosity40,
                        viscosity100: formData.viscosity100,
                        fluidIntegrity: formData.fluidIntegrity,
                    }),
                    ...(mobileEngine && {
                        // Wear Metals
                        iron: formData.iron,
                        chrome: formData.chrome,
                        nickel: formData.nickel,
                        aluminum: formData.aluminum,
                        lead: formData.lead,
                        copper: formData.copper,
                        tin: formData.tin,
                        titanium: formData.titanium,
                        silver: formData.silver,
                        antimony: formData.antimony,
                        cadmium: formData.cadmium,
                        manganese: formData.manganese,
                        // Contaminants
                        silicon: formData.silicon,
                        sodium: formData.sodium,
                        vanadium: formData.vanadium,
                        potassium: formData.potassium,
                        lithium: formData.lithium,
                        glycol: formData.glycol,
                        bubbles: formData.bubbles,
                        water: formData.water,
                        sootPercent: formData.sootPercent,
                        biodieselFuelDilution: formData.biodieselFuelDilution,
                        // Chemistry and Viscosity
                        molybdenum: formData.molybdenum,
                        calcium: formData.calcium,
                        magnesium: formData.magnesium,
                        phosphorus: formData.phosphorus,
                        zinc: formData.zinc,
                        barium: formData.barium,
                        boron: formData.boron,
                        tbn: formData.tbn,
                        oxidation: formData.oxidation,
                        nitration: formData.nitration,
                        sulfation: formData.sulfation,
                        viscosity40: formData.viscosity40,
                        viscosity100: formData.viscosity100,
                        antiwear: formData.antiwear,
                        fluidIntegrity: formData.fluidIntegrity,
                    })
                }),
                recommendations: formData.recommendation,
                analysis_date: formData.analysisDate,
                created_by: username,
                additional_notes: formData.notes,
            };

            console.log(payload)

            if (level === 'l1') payload.l1 = '1';
            else if (level === 'l2') payload.l2 = '1';
            else if (level === 'l3') payload.l3 = '1';

            await axios.post(`${config.baseApi}/assetsAnalysis/add-assets-analysis`, payload);

            showAlertMessage(
                'success',
                'Successful!',
                `Asset ${formData.assetName} - Component ${formData.componentName} was successfully recorded!`
            );

            resetForm();

            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (err) {
            console.log('Unable to save: ', err)
            showAlertMessage('error', 'Error', 'Unable to save! Please try again.')
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Reset all form fields to their initial state
     */
    const resetForm = () => {
        setFormData({
            assetId: '',
            assetName: '',
            componentId: '',
            componentName: '',
            runningHours: '',
            oilRunningHours: '',
            oilAnalysisResults: '',
            recommendation: '',
            analysisDate: '',
            notes: '',
            iron: '', chrome: '', lead: '', copper: '', silicon: '', water: '', viscosity40: '',
            nickel: '', aluminum: '', sodium: '', soot: '', tbn: '',
            tin: '', titanium: '', silver: '', antimony: '', cadmium: '', manganese: '',
            fatigue20: '', nonMetallic20: '', largeFe: '', feWearSeverity: '', totalFe100: '',
            vanadium: '', potassium: '', lithium: '', iso4406_4: '', iso4406_6: '', iso4406_14: '',
            cnts4: '', cnts6: '', cnts14: '', particles5_15: '', particles15_25: '', particles25_50: '',
            particles50_100: '', particles100: '', cutting20: '', sliding20: '', totalWater: '', bubbles: '',
            waterContent: '', largeFePercent: '', molybdenum: '', calcium: '', magnesium: '', phosphorus: '',
            zinc: '', barium: '', boron: '', tan: '', oxidation: '', viscosity100: '', fluidIntegrity: '',
            glycol: '', sootPercent: '', antiwear: '', biodieselFuelDilution: '', nitration: '', sulfation: ''
        });
        setSelectedAsset('');
        setSelectedComponent('');
        setSelectedAssetDetails(null);
        setSelectedComponentDetails(null);
        setStationaryEngine(false);
        setRotatingMachine(false);
        setMobileEngine(false);
    }

    /**
     * Handle form field changes
     */
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
        }));
    };

    /**
     * Handle asset selection from dropdown
     */
    const handleAssetChange = (e) => {
        const assetId = e.target.value;
        setSelectedAsset(assetId);
        setSelectedComponent('');
        setSelectedComponentDetails(null);
        setFormData(prev => ({
            ...prev,
            assetId: assetId,
            componentId: '',
            componentName: ''
        }));
    };

    return (
        <div style={{
            background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
            minHeight: '100vh',
            padding: '40px',
            position: 'relative',
            overflow: 'hidden',
            paddingTop: '50px'
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

            <Loading show={isLoading} />

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

            {/* Header Section */}
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
                    }}>Submit Oil Analysis Report</h1>
                    <p style={{
                        fontSize: '1.2rem',
                        color: '#F9982F',
                        opacity: '0.9',
                        fontWeight: '400',
                        margin: '0'
                    }}>Complete the form below to record maintenance data for your assets</p>
                </div>
            </div>

            <Container className="pb-5">
                <Form onSubmit={handleSubmit}>
                    {/* Asset Selection Card */}
                    <Card className="mb-0 border-0 shadow-lg" style={{ borderRadius: '25px 25px 0px 0px', background: '#fce3c7' }}>
                        <Card.Header
                            style={{
                                backgroundColor: styles.light,
                                borderBottom: `3px solid #ff9900`,
                                padding: '1rem 1.5rem',
                                borderRadius: '25px 25px 0px 0px',
                                background: 'linear-gradient(45deg, #EAB56F, #F9982F, #E37239)'
                            }}
                        >
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                    <div
                                        className="rounded-circle text-white d-flex align-items-center justify-content-center me-3"
                                        style={{
                                            backgroundColor: '#ce810e',
                                            width: '32px',
                                            height: '32px',
                                            fontSize: '1rem',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        1
                                    </div>
                                    <h5 className="mb-0 fw-semibold" style={{ color: styles.dark }}>
                                        Select Asset & Component
                                    </h5>
                                </div>
                                <h5
                                    onClick={resetForm}
                                    style={{
                                        color: styles.dark,
                                        textDecoration: 'none',
                                        fontWeight: '500',
                                        padding: '0',
                                        border: 'none',
                                        background: 'none',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        zIndex: 10
                                    }}
                                    className="clear-form-btn"
                                    onMouseEnter={(e) => {
                                        e.target.style.textDecoration = 'underline';
                                        e.target.style.color = '#fff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.textDecoration = 'none';
                                        e.target.style.color = styles.dark;
                                    }}
                                >
                                    Clear Form
                                </h5>
                            </div>
                        </Card.Header>

                        <Card.Body className="p-4">
                            {/* Asset Dropdown Field */}
                            <Form.Group className="mb-4">
                                <Form.Label className="fw-medium" style={{ color: styles.deep }}>
                                    Active Asset <span style={{ color: styles.accent }}>*</span>
                                </Form.Label>
                                <Form.Select
                                    value={selectedAsset}
                                    onChange={handleAssetChange}
                                    style={{
                                        borderColor: styles.primary,
                                        backgroundColor: '#FFF9F0',
                                        color: styles.dark,
                                        padding: '0.75rem'
                                    }}
                                    className="focus-ring"

                                >
                                    <option value="">-- Choose an asset --</option>
                                    {assets.length > 0 ? (
                                        assets.map((asset) => (
                                            <option
                                                key={asset.asset_id}
                                                value={asset.asset_id}
                                            >
                                                {asset.asset_name}
                                                {asset.asset_category && ` (${asset.asset_category})`}
                                                {asset.asset_location && ` - ${asset.asset_location}`}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No active assets available</option>
                                    )}
                                </Form.Select>
                                {assets.length === 0 && !isLoading && (
                                    <Alert variant="warning" className="mt-3" style={{ backgroundColor: '#FFF1E0', borderColor: styles.accent }}>
                                        No active assets found. Please check back later.
                                    </Alert>
                                )}
                            </Form.Group>

                            {/* Asset Components Dropdown */}
                            {selectedAsset && (
                                <Form.Group className="mb-4">
                                    <Form.Label className="fw-medium" style={{ color: styles.deep }}>
                                        Asset Component <span style={{ color: styles.accent }}>*</span>
                                    </Form.Label>
                                    <Form.Select
                                        value={selectedComponent}
                                        onChange={handleComponentChange}
                                        style={{
                                            borderColor: styles.primary,
                                            backgroundColor: '#FFF9F0',
                                            color: styles.dark,
                                            padding: '0.75rem'
                                        }}
                                        className="focus-ring"

                                    >
                                        <option value="">-- Select a component --</option>
                                        {filteredComponents.length > 0 ? (
                                            filteredComponents.map((component) => (
                                                <option
                                                    key={component.asset_component_id}
                                                    value={component.asset_component_id}
                                                >
                                                    {component.asset_component_name}
                                                    {component.asset_component_type && ` (${component.asset_component_type})`}
                                                </option>
                                            ))
                                        ) : (
                                            <option value="" disabled>No components found for this asset</option>
                                        )}
                                    </Form.Select>
                                    {filteredComponents.length === 0 && (
                                        <Alert variant="danger" className="mt-3" style={{ backgroundColor: '#FFF1E0', borderColor: styles.accent }}>
                                            <strong>No components registered!</strong> This asset has no components. Please add components to this asset before proceeding.
                                        </Alert>
                                    )}
                                </Form.Group>
                            )}

                            {/* Component Details Card */}
                            {selectedComponentDetails && (
                                <Card
                                    className="border-0 mb-4"
                                    style={{
                                        backgroundColor: '#FFF1E0',
                                        borderLeft: `4px solid ${styles.secondary}`
                                    }}
                                >
                                    <Card.Body>
                                        <h6 className="fw-semibold mb-3" style={{ color: styles.dark }}>
                                            Selected Component Details:
                                        </h6>
                                        <Row className="g-3">
                                            <Col xs={6} md={4}>
                                                <span style={{ color: styles.deep }}>Component Name:</span>
                                                <span className="ms-2 fw-medium" style={{ color: styles.dark }}>
                                                    {selectedComponentDetails.asset_component_name || 'N/A'}
                                                </span>
                                            </Col>
                                            <Col xs={6} md={4}>
                                                <span style={{ color: styles.deep }}>Component Type:</span>
                                                <span className="ms-2 fw-medium" style={{ color: styles.dark }}>
                                                    {selectedComponentDetails.asset_component_type || 'N/A'}
                                                </span>
                                            </Col>
                                            <Col xs={6} md={4}>
                                                <span style={{ color: styles.deep }}>Component ID:</span>
                                                <span className="ms-2 fw-medium" style={{ color: styles.dark }}>
                                                    {selectedComponentDetails.asset_component_id || 'N/A'}
                                                </span>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            )}

                            {/* Selected Asset Summary Card */}
                            {selectedAssetDetails && (
                                <Card
                                    className="border-0"
                                    style={{
                                        backgroundColor: '#FFF1E0',
                                        borderLeft: `4px solid ${styles.secondary}`
                                    }}
                                >
                                    <Card.Body>
                                        <h6 className="fw-semibold mb-3" style={{ color: styles.dark }}>
                                            Selected Asset Details:
                                        </h6>
                                        <Row className="g-3">
                                            <Col xs={6} md={4}>
                                                <span style={{ color: styles.deep }}>Name:</span>
                                                <span className="ms-2 fw-medium" style={{ color: styles.dark }}>
                                                    {selectedAssetDetails.asset_name}
                                                </span>
                                            </Col>
                                            <Col xs={6} md={4}>
                                                <span style={{ color: styles.deep }}>Category:</span>
                                                <span className="ms-2 fw-medium" style={{ color: styles.dark }}>
                                                    {selectedAssetDetails.asset_category || 'N/A'}
                                                </span>
                                            </Col>
                                            <Col xs={6} md={4}>
                                                <span style={{ color: styles.deep }}>Location:</span>
                                                <span className="ms-2 fw-medium" style={{ color: styles.dark }}>
                                                    {selectedAssetDetails.asset_location || 'N/A'}
                                                </span>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Maintenance Data Card */}
                    <Card className="mb-4 border-0 shadow-lg" style={{ borderRadius: '0px 0px 25px 25px', background: '#fce3c7' }}>
                        <Card.Header
                            style={{
                                backgroundColor: styles.light,
                                borderBottom: `3px solid #ff9900`,
                                padding: '1rem 1.5rem',
                                background: 'linear-gradient(45deg, #EAB56F, #F9982F, #E37239)'
                            }}
                        >
                            <div className="d-flex align-items-center">
                                <div
                                    className="rounded-circle text-white d-flex align-items-center justify-content-center me-3"
                                    style={{
                                        backgroundColor: styles.accent,
                                        width: '32px',
                                        height: '32px',
                                        fontSize: '1rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    2
                                </div>
                                <h5 className="mb-0 fw-semibold" style={{ color: styles.dark }}>
                                    Maintenance Data
                                </h5>
                            </div>
                        </Card.Header>

                        <Card.Body className="p-4">
                            <Row className="g-4">
                                {/* Running Hours Field */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-medium" style={{ color: styles.deep }}>
                                            Asset Running Hours <span style={{ color: styles.accent }}>*</span>
                                        </Form.Label>
                                        <div className="position-relative">
                                            <Form.Control
                                                type="number"
                                                name="runningHours"
                                                value={formData.runningHours}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="0.1"
                                                style={{
                                                    borderColor: styles.primary,
                                                    backgroundColor: '#FFF9F0',
                                                    color: styles.dark,
                                                    padding: '0.75rem'
                                                }}
                                                placeholder="0.0"

                                            />
                                            <span className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary">
                                                hours
                                            </span>
                                        </div>
                                    </Form.Group>
                                </Col>

                                {/* Oil Running Hours Field */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-medium" style={{ color: styles.deep }}>
                                            Oil Running Hours <span style={{ color: styles.accent }}>*</span>
                                        </Form.Label>
                                        <div className="position-relative">
                                            <Form.Control
                                                type="number"
                                                name="oilRunningHours"
                                                value={formData.oilRunningHours}
                                                onChange={handleInputChange}
                                                min="0"
                                                step="0.1"
                                                style={{
                                                    borderColor: styles.primary,
                                                    backgroundColor: '#FFF9F0',
                                                    color: styles.dark,
                                                    padding: '0.75rem'
                                                }}
                                                placeholder="0.0"

                                            />
                                            <span className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary">
                                                hours
                                            </span>
                                        </div>
                                    </Form.Group>
                                </Col>

                                {/* Oil Analysis Results Section */}
                                <Col xs={12}>
                                    <h5 style={{ fontWeight: 'bold', color: styles.deep }}>Oil Analysis Results</h5>
                                </Col>

                                {/* Rotating Machine Fields */}
                                {rotatingMachine && (
                                    <>
                                        {/* Wear Metals Section */}
                                        <Col xs={12}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setWearMetal(!wearmetal)}>
                                                <img src={gear} width={'25px'} />
                                                <h6 style={{ color: styles.deep, margin: 0 }}>Wear Metals</h6>
                                                {wearmetal ?

                                                    <FeatherIcon icon="chevron-up" onClick={() => setWearMetal(!wearmetal)} /> :
                                                    <FeatherIcon icon="chevron-down" onClick={() => setWearMetal(!wearmetal)} />


                                                }
                                            </div>
                                            {wearmetal && (
                                                <Row className="gy-2">
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Iron</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="iron"
                                                                    value={formData.iron}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Chrome</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="chrome"
                                                                    value={formData.chrome}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Nickel</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="nickel"
                                                                    value={formData.nickel}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Aluminum</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="aluminum"
                                                                    value={formData.aluminum}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Lead</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="lead"
                                                                    value={formData.lead}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Copper</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="copper"
                                                                    value={formData.copper}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Tin</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="tin"
                                                                    value={formData.tin}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Titanium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="titanium"
                                                                    value={formData.titanium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Silver</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="silver"
                                                                    value={formData.silver}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Antimony</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="antimony"
                                                                    value={formData.antimony}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Cadmium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="cadmium"
                                                                    value={formData.cadmium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Manganese</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="manganese"
                                                                    value={formData.manganese}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Fatigue {'>'}20 μm</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="fatigue20"
                                                                    value={formData.fatigue20}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '50px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>part./ml</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Non-Metallic {'>'}20 μm</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="nonMetallic20"
                                                                    value={formData.nonMetallic20}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '50px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>part./ml</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Large Fe</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="largeFe"
                                                                    value={formData.largeFe}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Fe Wear Severity Index</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="feWearSeverity"
                                                                value={formData.feWearSeverity}
                                                                onChange={handleInputChange}
                                                                style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0' }}
                                                                placeholder="Enter value"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Total Fe &lt;100μ</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="totalFe100"
                                                                    value={formData.totalFe100}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            )}
                                        </Col>

                                        {/* Contaminants Section */}
                                        <Col xs={12}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setContaminants(!contaminants)}>
                                                <img src={water} width={'25px'} />
                                                <h6 style={{ color: styles.deep, margin: 0 }}>Contaminants</h6>
                                                {contaminants ?
                                                    <FeatherIcon icon="chevron-up" onClick={() => setContaminants(!contaminants)} /> :
                                                    <FeatherIcon icon="chevron-down" onClick={() => setContaminants(!contaminants)} />
                                                }
                                            </div>

                                            {contaminants && (
                                                <Row className="gy-2">
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Silicon</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="silicon"
                                                                    value={formData.silicon}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Sodium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="sodium"
                                                                    value={formData.sodium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Vanadium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="vanadium"
                                                                    value={formData.vanadium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Potassium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="potassium"
                                                                    value={formData.potassium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Lithium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="lithium"
                                                                    value={formData.lithium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>ISO 4406 Code (&gt;4 μm)</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="iso4406_4"
                                                                value={formData.iso4406_4}
                                                                onChange={handleInputChange}
                                                                style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0' }}
                                                                placeholder="Enter value"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>ISO 4406 Code (&gt;6 μm)</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="iso4406_6"
                                                                value={formData.iso4406_6}
                                                                onChange={handleInputChange}
                                                                style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0' }}
                                                                placeholder="Enter value"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>ISO 4406 Code (&gt;14 μm)</Form.Label>
                                                            <Form.Control
                                                                type="text"
                                                                name="iso4406_14"
                                                                value={formData.iso4406_14}
                                                                onChange={handleInputChange}
                                                                style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0' }}
                                                                placeholder="Enter value"
                                                            />
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Cnts &gt;4</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="cnts4"
                                                                    value={formData.cnts4}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '65px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>part./ml</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Cnts &gt;6</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="cnts6"
                                                                    value={formData.cnts6}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '65px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>part./ml</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Cnts &gt;14</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="cnts14"
                                                                    value={formData.cnts14}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '65px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>part./ml</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Particles 5-15 μm</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="particles5_15"
                                                                    value={formData.particles5_15}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '70px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>part./100ml</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Particles 15-25 μm</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="particles15_25"
                                                                    value={formData.particles15_25}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '70px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>part./100ml</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Particles 25-50 μm</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="particles25_50"
                                                                    value={formData.particles25_50}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '70px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>part./100ml</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Particles 50-100 μm</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="particles50_100"
                                                                    value={formData.particles50_100}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '70px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>part./100ml</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Particles &gt;100μm</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="particles100"
                                                                    value={formData.particles100}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '70px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>part./100ml</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Cutting &gt;20μm</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="cutting20"
                                                                    value={formData.cutting20}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '65px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>part./ml</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Sliding &gt;20μm</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="sliding20"
                                                                    value={formData.sliding20}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '65px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>part./ml</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Total Water</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="totalWater"
                                                                    value={formData.totalWater}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Bubbles</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="bubbles"
                                                                    value={formData.bubbles}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '50px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>Normal</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Water</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="waterContent"
                                                                    value={formData.waterContent}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Large Fe %</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="largeFePercent"
                                                                    value={formData.largeFePercent}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '35px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>%</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            )}
                                        </Col>

                                        {/* Chemistry and Viscosity Section */}
                                        <Col xs={12}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setChem(!chem)}>
                                                <img src={lab} width={'25px'} />
                                                <h6 style={{ color: styles.deep, margin: 0 }}>Chemistry and Viscosity</h6>
                                                {chem ?
                                                    <FeatherIcon icon="chevron-up" onClick={() => setChem(!chem)} /> :
                                                    <FeatherIcon icon="chevron-down" onClick={() => setChem(!chem)} />
                                                }
                                            </div>
                                            {chem && (
                                                <Row className="gy-2">
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Molybdenum</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="molybdenum"
                                                                    value={formData.molybdenum}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Calcium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="calcium"
                                                                    value={formData.calcium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Magnesium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="magnesium"
                                                                    value={formData.magnesium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Phosphorus</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="phosphorus"
                                                                    value={formData.phosphorus}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Zinc</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="zinc"
                                                                    value={formData.zinc}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Barium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="barium"
                                                                    value={formData.barium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Boron</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="boron"
                                                                    value={formData.boron}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>TAN</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="tan"
                                                                    value={formData.tan}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>mg KOH/g</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Oxidation</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="oxidation"
                                                                    value={formData.oxidation}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>abs/cm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Viscosity at 40°C</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="viscosity40"
                                                                    value={formData.viscosity40}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '35px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>cSt</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Viscosity at 100°C</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="viscosity100"
                                                                    value={formData.viscosity100}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '35px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>cSt</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Fluid Integrity</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="fluidIntegrity"
                                                                    value={formData.fluidIntegrity}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>Rating</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            )}
                                        </Col>

                                    </>
                                )}

                                {/* Stationary Engine Fields */}
                                {stationaryEngine && (
                                    <>
                                        <Col xs={12}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setWearMetal(!wearmetal)}>
                                                <img src={gear} width={'25px'} />
                                                <h6 style={{ color: styles.deep, margin: 0 }}>Wear Metals</h6>
                                                {wearmetal ?
                                                    <FeatherIcon icon="chevron-up" onClick={() => setWearMetal(!wearmetal)} /> :
                                                    <FeatherIcon icon="chevron-down" onClick={() => setWearMetal(!wearmetal)} />
                                                }
                                            </div>
                                            {wearmetal && (
                                                <Row className="gy-2">
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Iron</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="iron"
                                                                    value={formData.iron}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Chrome</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="chrome"
                                                                    value={formData.chrome}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Nickel</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="nickel"
                                                                    value={formData.nickel}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Aluminum</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="aluminum"
                                                                    value={formData.aluminum}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Lead</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="lead"
                                                                    value={formData.lead}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Copper</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="copper"
                                                                    value={formData.copper}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Tin</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="tin"
                                                                    value={formData.tin}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Titanium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="titanium"
                                                                    value={formData.titanium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Silver</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="silver"
                                                                    value={formData.silver}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Antimony</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="antimony"
                                                                    value={formData.antimony}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Cadmium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="cadmium"
                                                                    value={formData.cadmium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Manganese</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="manganese"
                                                                    value={formData.manganese}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            )}
                                        </Col>
                                        <Col xs={12}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setContaminants(!contaminants)}>
                                                <img src={water} width={'25px'} />
                                                <h6 style={{ color: styles.deep, margin: 0 }}>Contaminants</h6>
                                                {contaminants ?
                                                    <FeatherIcon icon="chevron-up" /> :
                                                    <FeatherIcon icon="chevron-down" />
                                                }
                                            </div>
                                            {contaminants && (
                                                <Row className="gy-2">
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Silicon</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="silicon"
                                                                    value={formData.silicon}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Sodium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="sodium"
                                                                    value={formData.sodium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Vanadium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="vanadium"
                                                                    value={formData.vanadium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Potassium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="potassium"
                                                                    value={formData.potassium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Lithium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="lithium"
                                                                    value={formData.lithium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Glycol %</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="glycol"
                                                                    value={formData.glycol}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '35px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>%</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Bubbles</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="bubbles"
                                                                    value={formData.bubbles}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '50px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>Normal</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Antiwear %</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="antiwear"
                                                                    value={formData.antiwear}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '35px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>%</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Water</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="water"
                                                                    value={formData.water}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Soot %</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="sootPercent"
                                                                    value={formData.sootPercent}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '35px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>%</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Biodiesel Fuel Dilution</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="biodieselFuelDilution"
                                                                    value={formData.biodieselFuelDilution}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>wt%</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            )}
                                        </Col>
                                        <Col xs={12}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setChem(!chem)}>
                                                <img src={lab} width={'25px'} />
                                                <h6 style={{ color: styles.deep, margin: 0 }}>Chemistry and Viscosity</h6>
                                                {chem ?
                                                    <FeatherIcon icon="chevron-up" onClick={() => setChem(!chem)} /> :
                                                    <FeatherIcon icon="chevron-down" onClick={() => setChem(!chem)} />
                                                }
                                            </div>
                                            {chem && (
                                                <Row className="gy-2">
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Molybdenum</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="molybdenum"
                                                                    value={formData.molybdenum}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Calcium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="calcium"
                                                                    value={formData.calcium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Magnesium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="magnesium"
                                                                    value={formData.magnesium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Phosphorus</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="phosphorus"
                                                                    value={formData.phosphorus}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Zinc</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="zinc"
                                                                    value={formData.zinc}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Barium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="barium"
                                                                    value={formData.barium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Boron</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="boron"
                                                                    value={formData.boron}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>TBN</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="tbn"
                                                                    value={formData.tbn}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>mg KOH/g</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Oxidation</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="oxidation"
                                                                    value={formData.oxidation}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>abs/0.1mm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Nitration</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="nitration"
                                                                    value={formData.nitration}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>abs/cm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Sulfation</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="sulfation"
                                                                    value={formData.sulfation}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>abs/0.1mm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Viscosity at 40°C</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="viscosity40"
                                                                    value={formData.viscosity40}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '35px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>cSt</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Viscosity at 100°C</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="viscosity100"
                                                                    value={formData.viscosity100}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '35px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>cSt</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Fluid Integrity</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="fluidIntegrity"
                                                                    value={formData.fluidIntegrity}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>Rating</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            )}
                                        </Col>
                                    </>
                                )}

                                {/* Mobile Engine Fields - Updated with comprehensive fields */}
                                {mobileEngine && (
                                    <>
                                        <Col>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setWearMetal(!wearmetal)}>
                                                <img src={gear} width={'25px'} />
                                                <h6 style={{ color: styles.deep, margin: 0 }}>Wear Metals</h6>
                                                {wearmetal ?
                                                    <FeatherIcon icon="chevron-up" onClick={() => setWearMetal(!wearmetal)} /> :
                                                    <FeatherIcon icon="chevron-down" onClick={() => setWearMetal(!wearmetal)} />
                                                }
                                            </div>
                                            {wearmetal && (
                                                <Row className="gy-2">
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Iron</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="iron"
                                                                    value={formData.iron}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Chrome</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="chrome"
                                                                    value={formData.chrome}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Nickel</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="nickel"
                                                                    value={formData.nickel}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Aluminum</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="aluminum"
                                                                    value={formData.aluminum}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Lead</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="lead"
                                                                    value={formData.lead}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Copper</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="copper"
                                                                    value={formData.copper}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Tin</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="tin"
                                                                    value={formData.tin}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Titanium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="titanium"
                                                                    value={formData.titanium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Silver</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="silver"
                                                                    value={formData.silver}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Antimony</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="antimony"
                                                                    value={formData.antimony}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Cadmium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="cadmium"
                                                                    value={formData.cadmium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Manganese</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="manganese"
                                                                    value={formData.manganese}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            )}
                                        </Col>
                                        <Col xs={12}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setContaminants(!contaminants)}>
                                                <img src={water} width={'25px'} />
                                                <h6 style={{ color: styles.deep, margin: 0 }}>Contaminants</h6>
                                                {contaminants ?
                                                    <FeatherIcon icon="chevron-up" /> :
                                                    <FeatherIcon icon="chevron-down" />
                                                }
                                            </div>
                                            {contaminants && (
                                                <Row className="gy-2">
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Silicon</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="silicon"
                                                                    value={formData.silicon}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Sodium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="sodium"
                                                                    value={formData.sodium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Vanadium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="vanadium"
                                                                    value={formData.vanadium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Potassium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="potassium"
                                                                    value={formData.potassium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Lithium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="lithium"
                                                                    value={formData.lithium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Glycol %</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="glycol"
                                                                    value={formData.glycol}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '35px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>%</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Bubbles</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="bubbles"
                                                                    value={formData.bubbles}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '50px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>Normal</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Water</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="water"
                                                                    value={formData.water}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Soot %</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="sootPercent"
                                                                    value={formData.sootPercent}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '35px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>%</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Biodiesel Fuel Dilution</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="biodieselFuelDilution"
                                                                    value={formData.biodieselFuelDilution}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '45px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>wt%</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            )}
                                        </Col>
                                        <Col xs={12}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setChem(!chem)}>
                                                <img src={lab} width={'25px'} />
                                                <h6 style={{ color: styles.deep, margin: 0 }}>Chemistry and Viscosity</h6>
                                                {chem ?
                                                    <FeatherIcon icon="chevron-up" onClick={() => setChem(!chem)} /> :
                                                    <FeatherIcon icon="chevron-down" onClick={() => setChem(!chem)} />
                                                }
                                            </div>
                                            {chem && (
                                                <Row className="gy-2">
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Molybdenum</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="molybdenum"
                                                                    value={formData.molybdenum}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Calcium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="calcium"
                                                                    value={formData.calcium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Magnesium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="magnesium"
                                                                    value={formData.magnesium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Phosphorus</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="phosphorus"
                                                                    value={formData.phosphorus}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Zinc</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="zinc"
                                                                    value={formData.zinc}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Barium</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="barium"
                                                                    value={formData.barium}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Boron</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="boron"
                                                                    value={formData.boron}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>ppm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>TBN</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="tbn"
                                                                    value={formData.tbn}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '70px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>mg KOH/g</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Oxidation</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="oxidation"
                                                                    value={formData.oxidation}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '70px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>abs/0.1mm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Nitration</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="nitration"
                                                                    value={formData.nitration}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '55px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>abs/cm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Sulfation</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="sulfation"
                                                                    value={formData.sulfation}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '70px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>abs/0.1mm</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Viscosity at 40°C</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="viscosity40"
                                                                    value={formData.viscosity40}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '35px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>cSt</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Viscosity at 100°C</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="viscosity100"
                                                                    value={formData.viscosity100}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '35px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>cSt</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Antiwear %</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="antiwear"
                                                                    value={formData.antiwear}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '35px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>%</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col md={4}>
                                                        <Form.Group className="mb-2">
                                                            <Form.Label className="mb-1 fw-semibold" style={{ color: styles.deep }}>Fluid Integrity</Form.Label>
                                                            <div style={{ position: 'relative' }}>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="fluidIntegrity"
                                                                    value={formData.fluidIntegrity}
                                                                    onChange={handleInputChange}
                                                                    style={{ borderColor: styles.primary, backgroundColor: '#FFF9F0', paddingRight: '40px' }}
                                                                    placeholder="Enter value"
                                                                />
                                                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: '12px' }}>Rating</span>
                                                            </div>
                                                        </Form.Group>
                                                    </Col>
                                                </Row>
                                            )}
                                        </Col>
                                    </>
                                )}

                                {/* Recommendation Field */}
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.Label className="fw-medium" style={{ color: styles.deep }}>
                                            Recommendations <span style={{ color: styles.accent }}>*</span>
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            name="recommendation"
                                            value={formData.recommendation}
                                            onChange={handleInputChange}
                                            rows="3"
                                            style={{
                                                borderColor: styles.primary,
                                                backgroundColor: '#FFF9F0',
                                                color: styles.dark
                                            }}
                                            placeholder="Enter maintenance recommendations based on analysis..."

                                        />
                                    </Form.Group>
                                </Col>

                                {/* Analysis Date Field */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-medium" style={{ color: styles.deep }}>
                                            Analysis Date <span style={{ color: styles.accent }}>*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="analysisDate"
                                            value={formData.analysisDate}
                                            onChange={handleInputChange}
                                            style={{
                                                borderColor: styles.primary,
                                                backgroundColor: '#FFF9F0',
                                                color: styles.dark,
                                                padding: '0.75rem'
                                            }}

                                        />
                                    </Form.Group>
                                </Col>

                                {/* Created By Field */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="fw-medium" style={{ color: styles.deep }}>
                                            Created By
                                        </Form.Label>
                                        <Form.Control
                                            disabled
                                            value={username}
                                            style={{
                                                borderColor: styles.primary,
                                                backgroundColor: '#FFF9F0',
                                                color: styles.dark,
                                                padding: '0.75rem'
                                            }}
                                        />
                                    </Form.Group>
                                </Col>

                                {/* Notes Field */}
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.Label className="fw-medium" style={{ color: styles.deep }}>
                                            Additional Notes
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            rows="2"
                                            style={{
                                                borderColor: styles.primary,
                                                backgroundColor: '#FFF9F0',
                                                color: styles.dark
                                            }}
                                            placeholder="Enter any additional notes or comments..."
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>

                        {/* Action Buttons */}
                        <div className="p-4 pt-0" style={{ background: '#fce3c7', borderRadius: '0 0 25px 25px' }}>
                            <div className="d-flex flex-column flex-sm-row justify-content-end gap-3">
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
                                        cursor: isLoading ? 'wait' : 'pointer',
                                        minWidth: '200px',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 10px 20px rgba(227, 114, 57, 0.3)',
                                        opacity: isLoading ? 0.7 : 1
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isLoading) {
                                            e.target.style.transform = 'scale(1.02)';
                                            e.target.style.boxShadow = '0 15px 35px -10px #E37239';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isLoading) {
                                            e.target.style.transform = 'scale(1)';
                                            e.target.style.boxShadow = '0 10px 30px -10px #E37239';
                                        }
                                    }}
                                >
                                    {isLoading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="me-2"
                                            />
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Maintenance'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </Form>
            </Container >

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    33% { transform: translate(50px, -50px) rotate(120deg); }
                    66% { transform: translate(-30px, 30px) rotate(240deg); }
                }
            `}</style>
        </div >
    );
}