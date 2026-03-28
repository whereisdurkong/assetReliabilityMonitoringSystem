// import { useEffect, useState } from "react";
// import axios from 'axios';
// import config from 'config';

// export default function ViewSubmittedAsset() {

//     const asset_analysis_id = new URLSearchParams(window.location.search).get('id');
//     const [data, setData] = useState([]);
//     const [assetData, setAssetData] = useState([]);
//     const [componentData, setComponentData] = useState([]);

//     const [rotating, setRotating] = useState(false);
//     const [mobile, setMobile] = useState(false);
//     const [stationary, setStationary] = useState(false);

//     useEffect(() => {
//         const fetch = async () => {
//             try {
//                 const res = await axios.get(`${config.baseApi}/assetsAnalysis/get-submitted-assets-by-id`, {
//                     params: { id: asset_analysis_id }
//                 });
//                 const data = res.data || [];
//                 console.log('ASSET ANALYSIS DATA: ', data)
//                 setData(data)

//                 const assetres = await axios.get(`${config.baseApi}/assets/get-asset-by-id`, {
//                     params: { id: data.asset_id }
//                 });
//                 const assetData = assetres.data || [];
//                 console.log('ASSET DATA: ', assetData)
//                 setAssetData(assetData);

//                 const componentRes = await axios.get(`${config.baseApi}/assets/get-asset-component-by-id`, {
//                     params: { id: data.asset_component_id }
//                 });
//                 const componentData = componentRes.data || [];
//                 console.log('COMPONENT DATA: ', componentData)
//                 setComponentData(componentData);

//             } catch (err) {
//                 console.log(' UNABLE TO FETCH SUBMITTED ASSETS BY ID : ', err)
//             }
//         }
//         fetch();
//     }, [])


//     useEffect(() => {
//         if (assetData.asset_category === 'rotating-machines') {
//             console.log('ROTATING MACHINES')
//             setRotating(true)
//         } else if (assetData.asset_category === 'stationary-engines') {
//             setStationary(true)
//             console.log('STATIONARY ENGINES')
//         } else if (assetData.asset_category === 'mobile-engines') {
//             console.log('MOBILE ENGINES')
//             setMobile(true)
//         }
//     }, [assetData])


//     return (
//         <div>
//             <div>
//                 <h5>CREATED BY: {data.created_by}</h5>
//                 <h5>ANALYSIS DATE: {new Date(data.analysis_date).toLocaleDateString()}</h5>
//                 <h5>CREATED AT: {new Date(data.created_at).toLocaleDateString()}</h5>
//                 <hr />
//             </div>

//             <div>
//                 <h3>Asset Information</h3>
//                 <h5>ASSET LOCATION: {assetData.asset_location}</h5>
//                 <h5>ASSET: {assetData.asset_name}</h5>
//                 <h5>COMPONENT: {componentData.asset_component_name}</h5>
//                 <hr />
//             </div>

//             <div>
//                 <h5>RECOMMENDATION: {data.recommendations}</h5>
//                 <hr />
//             </div>

//             <div>
//                 <h3>TEST RESULTS</h3>
//                 <h4>Wear Metals</h4>
//                 <div>
//                     {rotating && (
//                         <div>
//                             <h5>IRON: {data.iron}</h5>
//                             <h5>CHROME: {data.chrome}</h5>
//                             <h5>NICKEL: {data.nickel}</h5>
//                             <h5>ALUMINIUM: {data.aluminium}</h5>
//                             <h5>LEAD: {data.lead}</h5>
//                             <h5>COPPER: {data.copper}</h5>
//                             <h5>TIN: {data.tin}</h5>
//                             <h5>TITANIUM: {data.titanium}</h5>
//                             <h5>SILVER: {data.silver}</h5>
//                             <h5>ANTIMONY: {data.antimony}</h5>
//                             <h5>CADMIUM: {data.cadmium}</h5>
//                             <h5>MANGANESE: {data.manganese}</h5>
//                             <h5>FATIGUE {'>'}20um {data.fatigue_gt_20um}</h5>
//                             <h5>Non-Metallic {'>'}20um {data.non_metallic_gt_20um}</h5>
//                             <h5>LARGE FE {data.large_fe}</h5>
//                             <h5>FE WEAR SEVERITY INDEX {data.fe_wear_severity_index}</h5>
//                             <h5>TOTAL FE {'>'} {data.total_fe_lt_100um}</h5>
//                         </div>
//                     )}
//                     {stationary && (
//                         <div>
//                             <h5>IRON: {data.iron}</h5>
//                             <h5>CHROME: {data.chrome}</h5>
//                             <h5>NICKEL: {data.nickel}</h5>
//                             <h5>ALUMINIUM: {data.aluminium}</h5>
//                             <h5>LEAD: {data.lead}</h5>
//                             <h5>COPPER: {data.copper}</h5>
//                             <h5>TIN: {data.tin}</h5>
//                             <h5>TITANIUM: {data.titanium}</h5>
//                             <h5>SILVER: {data.silver}</h5>
//                             <h5>ANTIMONY: {data.antimony}</h5>
//                             <h5>CADMIUM: {data.cadmium}</h5>
//                             <h5>MANGANESE: {data.manganese}</h5>

//                         </div>
//                     )}
//                     {mobile && (
//                         <div>
//                             <h5>IRON: {data.iron}</h5>
//                             <h5>CHROME: {data.chrome}</h5>
//                             <h5>NICKEL: {data.nickel}</h5>
//                             <h5>ALUMINIUM: {data.aluminium}</h5>
//                             <h5>LEAD: {data.lead}</h5>
//                             <h5>COPPER: {data.copper}</h5>
//                             <h5>TIN: {data.tin}</h5>
//                             <h5>TITANIUM: {data.titanium}</h5>
//                             <h5>SILVER: {data.silver}</h5>
//                             <h5>ANTIMONY: {data.antimony}</h5>
//                             <h5>CADMIUM: {data.cadmium}</h5>
//                             <h5>MANGANESE: {data.manganese}</h5>
//                         </div>
//                     )}
//                 </div>

//                 <h4>Contaminants</h4>
//                 <div>
//                     {rotating && (
//                         <div>
//                             <h4>SILICON {data.silicon}</h4>
//                             <h4>SODIUM {data.sodium}</h4>
//                             <h4>VANADIUM {data.vanadium}</h4>
//                             <h4>POTASSIUM {data.potassium}</h4>
//                             <h4>LITHIUM {data.lithium}</h4>
//                             <h4>ISO 4406 Code ({'>'}4 μm) {data.iso_4406_code_gt4um}</h4>
//                             <h4>ISO 4406 Code ({'>'}6 μm) {data.iso_4406_code_gt6um}</h4>
//                             <h4>ISO 4406 Code ({'>'}14 μm) {data.iso_4406_code_gt14um}</h4>
//                             <h4>CNTS {'>'}4 {data.cnts_gt4}</h4>
//                             <h4>CNTS {'>'}6 {data.cnts_gt6}</h4>
//                             <h4>CNTS {'>'}14 {data.cnts_gt14}</h4>
//                             <h4>PARTICLES 5-15um {data.particles_5_15um}</h4>
//                             <h4>PARTICLES 15-25um {data.particles_15_25um}</h4>
//                             <h4>PARTICLES 25-50um {data.particles_25_50um}</h4>
//                             <h4>PARTICLES 50-100um {data.particles_50_100um}</h4>
//                             <h4>PARTICLES {'>'}100um {data.particles_gt100um}</h4>
//                             <h4>CUTTING {'>'}20um {data.cutting_gt_20um}</h4>
//                             <h4>TOTAL WATER{data.total_water}</h4>
//                             <h4>BUBBLES {data.bubbles}</h4>
//                             <h4>WATER {data.water}</h4>
//                             <h4>LARGE FE% {data.large_fe}</h4>
//                         </div>
//                     )}
//                     {stationary && (
//                         <div>
//                             <h4>SILICON {data.silicon}</h4>
//                             <h4>SODIUM {data.sodium}</h4>
//                             <h4>VANADIUM {data.vanadium}</h4>
//                             <h4>POTASSIUM {data.potassium}</h4>
//                             <h4>LITHIUM {data.lithium}</h4>
//                             <h4>GLYCOL% {data.glycol_percent}</h4>
//                             <h4>BUBBLES {data.bubbles}</h4>
//                             <h4>ANTIWEAR % {data.antiwear_percent}</h4>
//                             <h4>WATER {data.water}</h4>
//                             <h4>SOOT% {data.soot_percent}</h4>
//                             <h4>BIODIESEL FUEL DILUTION{data.biodiesel_fuel_dilution}</h4>
//                         </div>
//                     )}
//                     {mobile && (
//                         <div>
//                             <h4>SILICON {data.silicon}</h4>
//                             <h4>SODIUM {data.sodium}</h4>
//                             <h4>VANADIUM {data.vanadium}</h4>
//                             <h4>POTASSIUM {data.potassium}</h4>
//                             <h4>LITHIUM {data.lithium}</h4>
//                             <h4>GLYCOL% {data.glycol_percent}</h4>
//                             <h4>BUBBLES {data.bubbles}</h4>
//                             <h4>WATER {data.water}</h4>
//                             <h4>SOOT% {data.soot_percent}</h4>
//                             <h4>BIODIESEL FUEL DILUTION{data.biodiesel_fuel_dilution}</h4>
//                         </div>
//                     )}
//                 </div>

//                 <h4>Chemistry & Viscosity</h4>
//                 <div>
//                     {stationary && (
//                         <div>
//                             <h5>MOLYBDENUM {data.molybdenum}</h5>
//                             <h5>CALCIUM {data.calcium}</h5>
//                             <h5>MAGNESIUM {data.magnesium}</h5>
//                             <h5>PHOSPHORUS {data.phosphorus}</h5>
//                             <h5>ZINC {data.zinc}</h5>
//                             <h5>BARIUM {data.barium}</h5>
//                             <h5>BORON {data.boron}</h5>
//                             <h5>TBN {data.tbn}</h5>
//                             <h5>OXIDATION {data.oxidation}</h5>
//                             <h5>NITRATION {data.nitration}</h5>
//                             <h5>SULFATION {data.sulfation}</h5>
//                             <h5>VISCOSITY AT 40C {data.viscosity_at_40c}</h5>
//                             <h5>VISCOSITY AT 100C {data.viscosity_at_100c}</h5>
//                             <h5>FLUID INTEGRITY {data.fluid_integrity}</h5>
//                         </div>
//                     )}
//                     {rotating && (
//                         <div>
//                             <h5>MOLYBDENUM {data.molybdenum}</h5>
//                             <h5>CALCIUM {data.calcium}</h5>
//                             <h5>MAGNESIUM {data.magnesium}</h5>
//                             <h5>PHOSPHORUS {data.phosphorus}</h5>
//                             <h5>ZINC {data.zinc}</h5>
//                             <h5>BARIUM {data.barium}</h5>
//                             <h5>BORON {data.boron}</h5>
//                             <h5>TAN {data.tan}</h5>
//                             <h5>OXIDATION {data.oxidation}</h5>
//                             <h5>VISCOSITY AT 40C {data.viscosity_at_40c}</h5>
//                             <h5>VISCOSITY AT 100C {data.viscosity_at_100c}</h5>
//                             <h5>FLUID INTEGRITY {data.fluid_integrity}</h5>
//                         </div>
//                     )}
//                     {mobile && (
//                         <div>
//                             <h5>MOLYBDENUM {data.molybdenum}</h5>
//                             <h5>CALCIUM {data.calcium}</h5>
//                             <h5>MAGNESIUM {data.magnesium}</h5>
//                             <h5>PHOSPHORUS {data.phosphorus}</h5>
//                             <h5>ZINC {data.zinc}</h5>
//                             <h5>BARIUM {data.barium}</h5>
//                             <h5>BORON {data.boron}</h5>
//                             <h5>TBN {data.tbn}</h5>
//                             <h5>OXIDATION {data.oxidation}</h5>
//                             <h5>NITRATION {data.nitration}</h5>
//                             <h5>SULFATION {data.sulfation}</h5>
//                             <h5>VISCOSITY AT 40C {data.viscosity_at_40c}</h5>
//                             <h5>VISCOSITY AT 100C {data.viscosity_at_100c}</h5>
//                             <h5>ANTIWEAR {data.antiwear_percent}</h5>
//                             <h5>FLUID INTEGRITY {data.fluid_integrity}</h5>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>

//     )
// }

import { useEffect, useState } from "react";
import axios from 'axios';
import config from 'config';
import { Container, Row, Col, Badge, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import FeatherIcon from "feather-icons-react";

export default function ViewSubmittedAsset() {
    const asset_analysis_id = new URLSearchParams(window.location.search).get('id');
    const [data, setData] = useState([]);
    const [assetData, setAssetData] = useState([]);
    const [componentData, setComponentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const [rotating, setRotating] = useState(false);
    const [mobile, setMobile] = useState(false);
    const [stationary, setStationary] = useState(false);

    const colors = {
        primary: '#EAB56F',
        secondary: '#F9982F',
        accent: '#E37239',
        dark: '#171C2D',
        darkLight: '#254252',
        light: '#f8f9fa',
        white: '#ffffff',
        gray: '#6c757d',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444'
    };

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${config.baseApi}/assetsAnalysis/get-submitted-assets-by-id`, {
                    params: { id: asset_analysis_id }
                });
                const data = res.data || [];
                setData(data)

                const assetres = await axios.get(`${config.baseApi}/assets/get-asset-by-id`, {
                    params: { id: data.asset_id }
                });
                const assetData = assetres.data || [];
                setAssetData(assetData);

                const componentRes = await axios.get(`${config.baseApi}/assets/get-asset-component-by-id`, {
                    params: { id: data.asset_component_id }
                });
                const componentData = componentRes.data || [];
                setComponentData(componentData);

            } catch (err) {
                console.log('UNABLE TO FETCH SUBMITTED ASSETS BY ID : ', err)
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, [])

    useEffect(() => {
        if (assetData.asset_category === 'rotating-machines') {
            setRotating(true)
            setStationary(false)
            setMobile(false)
        } else if (assetData.asset_category === 'stationary-engines') {
            setStationary(true)
            setRotating(false)
            setMobile(false)
        } else if (assetData.asset_category === 'mobile-engines') {
            setMobile(true)
            setRotating(false)
            setStationary(false)
        }
    }, [assetData])

    const StatCard = ({ label, value, icon, trend, trendValue }) => (
        <div style={{
            background: colors.white,
            borderRadius: '24px',
            padding: '20px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: '1px solid rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{
                    background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}20 100%)`,
                    padding: '12px',
                    borderRadius: '16px',
                    display: 'inline-flex'
                }}>
                    <FeatherIcon icon={icon} size={20} color={colors.accent} />
                </div>
                {trend && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        color: trend === 'up' ? colors.success : colors.danger
                    }}>
                        <FeatherIcon icon={trend === 'up' ? 'trending-up' : 'trending-down'} size={14} />
                        <span>{trendValue}%</span>
                    </div>
                )}
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: colors.dark, marginBottom: '8px' }}>
                {value || '—'}
            </div>
            <div style={{ fontSize: '13px', color: colors.gray, fontWeight: '500' }}>
                {label}
            </div>
        </div>
    );

    const MetricTile = ({ label, value, unit, status = 'normal' }) => {
        const statusColors = {
            normal: colors.success,
            warning: colors.warning,
            critical: colors.danger
        };

        return (
            <div style={{
                background: colors.white,
                borderRadius: '16px',
                padding: '16px',
                transition: 'all 0.2s ease',
                border: `1px solid ${statusColors[status]}20`,
                cursor: 'pointer'
            }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{
                    fontSize: '12px',
                    color: colors.gray,
                    marginBottom: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: '600'
                }}>
                    {label}
                </div>
                <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: colors.dark,
                    marginBottom: '4px'
                }}>
                    {value || '—'}
                </div>
                {unit && (
                    <div style={{ fontSize: '11px', color: colors.gray }}>
                        {unit}
                    </div>
                )}
            </div>
        );
    };

    const SectionTitle = ({ title, icon, count }) => (
        <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FeatherIcon icon={icon} size={16} color={colors.dark} />
                </div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: colors.dark }}>
                    {title}
                </h3>
                {count && (
                    <Badge style={{ background: colors.light, color: colors.dark, padding: '4px 10px' }}>
                        {count} metrics
                    </Badge>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: colors.light
            }}>
                <Spinner animation="border" style={{ color: colors.accent }} />
            </div>
        );
    }

    return (
        <div style={{ background: colors.light, minHeight: '100vh' }}>
            {/* Modern Header */}
            <div style={{
                background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.darkLight} 100%)`,
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Container style={{ padding: '40px 0' }}>
                    <Row className="align-items-center">
                        <Col md={8}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                <div style={{
                                    background: `${colors.primary}20`,
                                    padding: '12px',
                                    borderRadius: '20px',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <FeatherIcon icon="award" size={28} color={colors.primary} />
                                </div>
                                <div>
                                    <h1 style={{
                                        color: colors.white,
                                        fontSize: '32px',
                                        fontWeight: 'bold',
                                        margin: 0,
                                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text'
                                    }}>
                                        Asset Analysis Report
                                    </h1>
                                    <div style={{ color: `${colors.white}80`, marginTop: '8px' }}>
                                        Detailed diagnostic and condition monitoring results
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div style={{
                                background: `${colors.white}10`,
                                backdropFilter: 'blur(10px)',
                                borderRadius: '20px',
                                padding: '16px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '12px', color: `${colors.white}70`, marginBottom: '4px' }}>
                                    Report ID
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: colors.primary }}>
                                    #{asset_analysis_id}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>

                {/* Decorative Elements */}
                <div style={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: '200px',
                    height: '200px',
                    background: `radial-gradient(circle, ${colors.primary}20 0%, transparent 70%)`,
                    borderRadius: '50%'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: -80,
                    left: -80,
                    width: '300px',
                    height: '300px',
                    background: `radial-gradient(circle, ${colors.secondary}10 0%, transparent 70%)`,
                    borderRadius: '50%'
                }} />
            </div>

            <Container style={{ marginTop: '-30px', paddingBottom: '60px' }}>
                {/* Quick Stats Row */}
                <Row style={{ marginBottom: '32px' }}>
                    <Col lg={3} md={6}>
                        <StatCard
                            label="Created By"
                            value={data.created_by}
                            icon="user"
                        />
                    </Col>
                    <Col lg={3} md={6}>
                        <StatCard
                            label="Analysis Date"
                            value={new Date(data.analysis_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            icon="calendar"
                        />
                    </Col>
                    <Col lg={3} md={6}>
                        <StatCard
                            label="Asset Name"
                            value={assetData.asset_name}
                            icon="package"
                        />
                    </Col>
                    <Col lg={3} md={6}>
                        <StatCard
                            label="Component"
                            value={componentData.asset_component_name}
                            icon="cpu"
                        />
                    </Col>
                </Row>

                {/* Asset Info Card */}
                <div style={{
                    background: colors.white,
                    borderRadius: '28px',
                    padding: '28px',
                    marginBottom: '32px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                    border: '1px solid rgba(0,0,0,0.05)'
                }}>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: colors.gray, marginBottom: '4px' }}>Asset Location</div>
                                    <div style={{ fontSize: '18px', fontWeight: '600', color: colors.dark }}>
                                        <FeatherIcon icon="map-pin" size={14} style={{ marginRight: '8px', color: colors.accent }} />
                                        {assetData.asset_location}
                                    </div>
                                </div>
                                <div style={{ width: '1px', height: '40px', background: colors.light }} />
                                <div>
                                    <div style={{ fontSize: '12px', color: colors.gray, marginBottom: '4px' }}>Asset Category</div>
                                    <div style={{ fontSize: '18px', fontWeight: '600', color: colors.dark }}>
                                        <FeatherIcon icon="tag" size={14} style={{ marginRight: '8px', color: colors.accent }} />
                                        {assetData.asset_category}
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div style={{
                                background: `${colors.primary}10`,
                                borderRadius: '20px',
                                padding: '16px 20px',
                                borderLeft: `3px solid ${colors.accent}`
                            }}>
                                <div style={{ fontSize: '12px', color: colors.gray, marginBottom: '8px' }}>
                                    <FeatherIcon icon="message-square" size={12} style={{ marginRight: '6px' }} />
                                    Recommendations
                                </div>
                                <div style={{ fontSize: '14px', color: colors.dark, lineHeight: '1.5', fontWeight: '500' }}>
                                    {data.recommendations || 'No recommendations available'}
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Tabs Navigation */}
                <div style={{ marginBottom: '32px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['overview', 'wear-metals', 'contaminants', 'chemistry'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '10px 24px',
                                    border: 'none',
                                    background: activeTab === tab ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` : 'transparent',
                                    color: activeTab === tab ? colors.dark : colors.gray,
                                    fontWeight: '600',
                                    borderRadius: '40px',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    marginBottom: '-1px'
                                }}
                            >
                                {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div>
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div>
                            <SectionTitle title="Key Metrics" icon="activity" count="12" />
                            <Row>
                                {rotating && (
                                    <>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Iron" value={data.iron} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Copper" value={data.copper} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Viscosity 40°C" value={data.viscosity_at_40c} unit="cSt" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Water" value={data.water} unit="%" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Oxidation" value={data.oxidation} /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Fluid Integrity" value={data.fluid_integrity} /></Col>
                                    </>
                                )}
                                {(stationary || mobile) && (
                                    <>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Iron" value={data.iron} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Copper" value={data.copper} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Viscosity 40°C" value={data.viscosity_at_40c} unit="cSt" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Water" value={data.water} unit="%" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="TBN" value={data.tbn} /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Soot %" value={data.soot_percent} unit="%" /></Col>
                                    </>
                                )}
                            </Row>
                        </div>
                    )}

                    {/* Wear Metals Tab */}
                    {activeTab === 'wear-metals' && (
                        <div>
                            <SectionTitle title="Wear Metals Analysis" icon="droplet" count={rotating ? "17" : "12"} />
                            <Row>
                                {rotating && (
                                    <>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Iron" value={data.iron} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Chrome" value={data.chrome} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Nickel" value={data.nickel} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Aluminium" value={data.aluminium} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Lead" value={data.lead} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Copper" value={data.copper} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Tin" value={data.tin} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Titanium" value={data.titanium} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Silver" value={data.silver} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Antimony" value={data.antimony} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Cadmium" value={data.cadmium} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Manganese" value={data.manganese} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Fatigue >20um" value={data.fatigue_gt_20um} unit="count" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Non-Metallic >20um" value={data.non_metallic_gt_20um} unit="count" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Large Fe" value={data.large_fe} unit="%" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Fe Wear Severity" value={data.fe_wear_severity_index} unit="index" /></Col>
                                    </>
                                )}
                                {(stationary || mobile) && (
                                    <>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Iron" value={data.iron} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Chrome" value={data.chrome} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Nickel" value={data.nickel} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Aluminium" value={data.aluminium} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Lead" value={data.lead} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Copper" value={data.copper} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Tin" value={data.tin} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Titanium" value={data.titanium} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Silver" value={data.silver} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Antimony" value={data.antimony} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Cadmium" value={data.cadmium} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Manganese" value={data.manganese} unit="ppm" /></Col>
                                    </>
                                )}
                            </Row>
                        </div>
                    )}

                    {/* Contaminants Tab */}
                    {activeTab === 'contaminants' && (
                        <div>
                            <SectionTitle title="Contaminants Analysis" icon="filter" count={rotating ? "15" : "8"} />
                            <Row>
                                {rotating && (
                                    <>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Silicon" value={data.silicon} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Sodium" value={data.sodium} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Vanadium" value={data.vanadium} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Potassium" value={data.potassium} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Lithium" value={data.lithium} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Water" value={data.water} unit="%" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="ISO 4406 (>4μm)" value={data.iso_4406_code_gt4um} /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="ISO 4406 (>6μm)" value={data.iso_4406_code_gt6um} /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="ISO 4406 (>14μm)" value={data.iso_4406_code_gt14um} /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Particles 5-15um" value={data.particles_5_15um} /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Particles 15-25um" value={data.particles_15_25um} /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Particles 25-50um" value={data.particles_25_50um} /></Col>
                                    </>
                                )}
                                {(stationary || mobile) && (
                                    <>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Silicon" value={data.silicon} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Sodium" value={data.sodium} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Vanadium" value={data.vanadium} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Potassium" value={data.potassium} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Lithium" value={data.lithium} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Glycol %" value={data.glycol_percent} unit="%" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Water" value={data.water} unit="%" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Soot %" value={data.soot_percent} unit="%" /></Col>
                                    </>
                                )}
                            </Row>
                        </div>
                    )}

                    {/* Chemistry Tab */}
                    {activeTab === 'chemistry' && (
                        <div>
                            <SectionTitle title="Chemistry & Viscosity" icon="thermometer" count="12" />
                            <Row>
                                {(rotating || stationary || mobile) && (
                                    <>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Molybdenum" value={data.molybdenum} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Calcium" value={data.calcium} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Magnesium" value={data.magnesium} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Phosphorus" value={data.phosphorus} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Zinc" value={data.zinc} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Barium" value={data.barium} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Boron" value={data.boron} unit="ppm" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Viscosity 40°C" value={data.viscosity_at_40c} unit="cSt" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Viscosity 100°C" value={data.viscosity_at_100c} unit="cSt" /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Oxidation" value={data.oxidation} /></Col>
                                        <Col lg={3} md={4} sm={6}><MetricTile label="Fluid Integrity" value={data.fluid_integrity} /></Col>
                                        {rotating && (
                                            <Col lg={3} md={4} sm={6}><MetricTile label="TAN" value={data.tan} /></Col>
                                        )}
                                        {(stationary || mobile) && (
                                            <>
                                                <Col lg={3} md={4} sm={6}><MetricTile label="TBN" value={data.tbn} /></Col>
                                                <Col lg={3} md={4} sm={6}><MetricTile label="Nitration" value={data.nitration} /></Col>
                                                <Col lg={3} md={4} sm={6}><MetricTile label="Sulfation" value={data.sulfation} /></Col>
                                            </>
                                        )}
                                    </>
                                )}
                            </Row>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    )
}