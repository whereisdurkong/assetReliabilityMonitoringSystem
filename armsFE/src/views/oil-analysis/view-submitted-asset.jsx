// import { useEffect, useState } from "react";
// import axios from 'axios';
// import config from 'config';
// import { Container, Row, Col, Badge, Spinner } from 'react-bootstrap';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import FeatherIcon from "feather-icons-react";
// import {
//     LineChart,
//     Line,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     Tooltip,
//     ResponsiveContainer
// } from 'recharts';

// import water from "assets/images/water.png"
// import gear from "assets/images/gear-box.png"
// import lab from "assets/images/lab.png"

// export default function ViewSubmittedAsset() {
//     const asset_analysis_id = new URLSearchParams(window.location.search).get('id');
//     const [data, setData] = useState([]);
//     const [assetData, setAssetData] = useState([]);
//     const [componentData, setComponentData] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [activeTab, setActiveTab] = useState('wear-metals');
//     const [matchData, setMatchData] = useState([]);

//     const [rotating, setRotating] = useState(false);
//     const [mobile, setMobile] = useState(false);
//     const [stationary, setStationary] = useState(false);

//     const colors = {
//         primary: '#EAB56F',
//         secondary: '#F9982F',
//         accent: '#E37239',
//         dark: '#171C2D',
//         darkLight: '#254252',
//         light: '#f8f9fa',
//         white: '#ffffff',
//         gray: '#6c757d',
//         success: '#10b981',
//         warning: '#f59e0b',
//         danger: '#ef4444'
//     };

//     useEffect(() => {
//         const fetch = async () => {
//             setLoading(true);
//             try {
//                 const res = await axios.get(`${config.baseApi}/assetsAnalysis/get-submitted-assets-by-id`, {
//                     params: { id: asset_analysis_id }
//                 });
//                 const data = res.data || [];
//                 setData(data)
//                 console.log('DATA: ', data)
//                 const assetres = await axios.get(`${config.baseApi}/assets/get-asset-by-id`, {
//                     params: { id: data.asset_id }
//                 });
//                 const assetData = assetres.data || [];
//                 setAssetData(assetData);

//                 const componentRes = await axios.get(`${config.baseApi}/assets/get-asset-component-by-id`, {
//                     params: { id: data.asset_component_id }
//                 });
//                 const componentData = componentRes.data || [];
//                 setComponentData(componentData);

//                 // Fetch all historical data
//                 const res1 = await axios.get(`${config.baseApi}/assetsAnalysis/get-all-submitted-assets`);
//                 const data1 = res1.data || []
//                 const filteredMatchData = data1.filter(item =>
//                     item.asset_id === data.asset_id &&
//                     item.asset_component_id === data.asset_component_id
//                 ).sort((a, b) => new Date(a.analysis_date) - new Date(b.analysis_date));

//                 console.log('matchData: ', filteredMatchData);
//                 setMatchData(filteredMatchData);

//             } catch (err) {
//                 console.log('UNABLE TO FETCH SUBMITTED ASSETS BY ID : ', err)
//             } finally {
//                 setLoading(false);
//             }
//         }
//         fetch();
//     }, [])

//     useEffect(() => {
//         console.log(assetData)
//         if (assetData.trivector === 'rotating-machine') {
//             setRotating(true)
//             setStationary(false)
//             setMobile(false)
//         } else if (assetData.trivector === 'stationary-engine') {
//             setStationary(true)
//             setRotating(false)
//             setMobile(false)
//         } else if (assetData.trivector === 'mobile-engine') {
//             setMobile(true)
//             setRotating(false)
//             setStationary(false)
//         }
//     }, [assetData])

//     const StatCard = ({ label, value, icon, trend, trendValue }) => (
//         <div style={{
//             background: colors.white,
//             borderRadius: '24px',
//             padding: '20px',
//             transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//             border: '1px solid rgba(0,0,0,0.05)',
//             position: 'relative',
//             overflow: 'hidden'
//         }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
//                 <div style={{
//                     background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}20 100%)`,
//                     padding: '12px',
//                     borderRadius: '16px',
//                     display: 'inline-flex'
//                 }}>
//                     <FeatherIcon icon={icon} size={20} color={colors.accent} />
//                 </div>
//                 {trend && (
//                     <div style={{
//                         display: 'flex',
//                         alignItems: 'center',
//                         gap: '4px',
//                         fontSize: '12px',
//                         color: trend === 'up' ? colors.success : colors.danger
//                     }}>
//                         <FeatherIcon icon={trend === 'up' ? 'trending-up' : 'trending-down'} size={14} />
//                         <span>{trendValue}%</span>
//                     </div>
//                 )}
//             </div>
//             <div style={{ fontSize: '28px', fontWeight: 'bold', color: colors.dark, marginBottom: '8px' }}>
//                 {value || '—'}
//             </div>
//             <div style={{ fontSize: '13px', color: colors.gray, fontWeight: '500' }}>
//                 {label}
//             </div>
//         </div>
//     );

//     const MetricTile = ({ label, value, unit, status = 'normal', parameterKey }) => {
//         const statusColors = {
//             normal: colors.success,
//             warning: colors.warning,
//             critical: colors.danger
//         };

//         // Prepare chart data if multiple historical records exist
//         const hasMultipleData = matchData.length > 1;
//         const chartData = hasMultipleData ? matchData.map(item => ({
//             date: new Date(item.analysis_date).toLocaleDateString('en-US', {
//                 year: 'numeric',
//                 month: 'short',
//                 day: 'numeric'
//             }),
//             value: item[parameterKey] || 0,
//             fullDate: new Date(item.analysis_date)
//         })).sort((a, b) => a.fullDate - b.fullDate) : [];

//         return (
//             <div style={{ marginBottom: '20px' }}>
//                 <div style={{
//                     background: colors.white,
//                     borderRadius: '16px',
//                     padding: '16px',
//                     transition: 'all 0.2s ease',
//                     border: `1px solid ${statusColors[status]}20`,
//                 }}>
//                     <div style={{
//                         fontSize: '12px',
//                         color: colors.gray,
//                         marginBottom: '8px',
//                         textTransform: 'uppercase',
//                         letterSpacing: '0.5px',
//                         fontWeight: '600'
//                     }}>
//                         {label}
//                     </div>
//                     <div style={{
//                         fontSize: '24px',
//                         fontWeight: 'bold',
//                         color: colors.dark,
//                         marginBottom: '4px'
//                     }}>
//                         {value || '—'}
//                     </div>
//                     {unit && (
//                         <div style={{ fontSize: '11px', color: colors.gray }}>
//                             {unit}
//                         </div>
//                     )}
//                 </div>

//                 {/* Display chart beside the card if multiple data points exist */}
//                 {hasMultipleData && chartData.length > 0 && (
//                     <div style={{

//                         padding: '12px',
//                         background: `${colors.light}`,
//                         borderRadius: '12px',
//                         border: `1px solid ${colors.primary}20`
//                     }}>
//                         <div style={{ fontSize: '11px', color: colors.gray, marginBottom: '8px' }}>
//                             Historical Trend (Last {chartData.length} records)
//                         </div>
//                         <div style={{ height: '200px', width: '100%' }}>
//                             <ResponsiveContainer>
//                                 <LineChart data={chartData}>
//                                     <CartesianGrid strokeDasharray="3 3" stroke={`${colors.gray}30`} />
//                                     <XAxis
//                                         dataKey="date"
//                                         tick={{ fontSize: 10 }}
//                                         interval="preserveStartEnd"
//                                         angle={-25}
//                                         textAnchor="end"
//                                         height={60}
//                                     />
//                                     <YAxis
//                                         tick={{ fontSize: 10 }}
//                                         label={{ value: unit || 'ppm', angle: -90, position: 'insideLeft', fontSize: 10 }}
//                                     />
//                                     <Tooltip
//                                         formatter={(value) => [`${value} ${unit || ''}`, label]}
//                                         labelFormatter={(label) => `Date: ${label}`}
//                                     />
//                                     <Line
//                                         type="monotone"
//                                         dataKey="value"
//                                         stroke={colors.accent}
//                                         strokeWidth={2}
//                                         dot={{ fill: colors.accent, r: 3 }}
//                                         activeDot={{ r: 5 }}
//                                         name={label}
//                                     />
//                                 </LineChart>
//                             </ResponsiveContainer>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         );
//     };

//     const SectionTitle = ({ title, icon, count }) => (
//         <div style={{ marginBottom: '24px' }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
//                 <div style={{
//                     width: '40px',
//                     height: '40px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                 }}>
//                     <img src={icon} width={'25px'} alt={title} />
//                 </div>
//                 <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: colors.dark }}>
//                     {title}
//                 </h3>
//                 {count && (
//                     <Badge style={{ background: colors.light, color: colors.dark, padding: '4px 10px' }}>
//                         {count} metrics
//                     </Badge>
//                 )}
//             </div>
//         </div>
//     );

//     const formatTrivector = (value) => {
//         const mapping = {
//             'rotating-machine': 'Rotating Machine',
//             'stationary-engine': 'Stationary Engine',
//             'mobile-engine': 'Mobile Engine'
//         };
//         return mapping[value] || value || '-';
//     };

//     if (loading) {
//         return (
//             <div style={{
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 height: '100vh',
//                 background: colors.light
//             }}>
//                 <Spinner animation="border" style={{ color: colors.accent }} />
//             </div>
//         );
//     }

//     return (
//         <div style={{ background: colors.light, minHeight: '100vh' }}>
//             {/* Modern Header */}
//             <div style={{
//                 background: `linear-gradient(135deg, ${colors.dark} 0%, ${colors.darkLight} 100%)`,
//                 position: 'relative',
//                 overflow: 'hidden'
//             }}>
//                 <Container style={{ padding: '40px 0' }}>
//                     <Row className="align-items-center">
//                         <Col md={8}>
//                             <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
//                                 <div>
//                                     <h1 style={{
//                                         color: colors.white,
//                                         fontSize: '32px',
//                                         fontWeight: 'bold',
//                                         margin: 0,
//                                         background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
//                                         WebkitBackgroundClip: 'text',
//                                         WebkitTextFillColor: 'transparent',
//                                         backgroundClip: 'text'
//                                     }}>
//                                         Asset Analysis Report
//                                     </h1>
//                                     <div style={{ color: `${colors.white}80`, marginTop: '8px' }}>
//                                         Detailed diagnostic and condition monitoring results
//                                     </div>
//                                 </div>
//                             </div>
//                         </Col>
//                         <Col md={4}>
//                             <div style={{
//                                 background: `${colors.white}10`,
//                                 backdropFilter: 'blur(10px)',
//                                 borderRadius: '20px',
//                                 padding: '16px',
//                                 textAlign: 'center'
//                             }}>
//                                 <div style={{ fontSize: '12px', color: `${colors.white}70`, marginBottom: '4px' }}>
//                                     Report ID
//                                 </div>
//                                 <div style={{ fontSize: '18px', fontWeight: 'bold', color: colors.primary }}>
//                                     #{asset_analysis_id}
//                                 </div>
//                             </div>
//                         </Col>
//                     </Row>
//                 </Container>

//                 {/* Decorative Elements */}
//                 <div style={{
//                     position: 'absolute',
//                     top: -50,
//                     right: -50,
//                     width: '200px',
//                     height: '200px',
//                     background: `radial-gradient(circle, ${colors.primary}20 0%, transparent 70%)`,
//                     borderRadius: '50%'
//                 }} />
//                 <div style={{
//                     position: 'absolute',
//                     bottom: -80,
//                     left: -80,
//                     width: '300px',
//                     height: '300px',
//                     background: `radial-gradient(circle, ${colors.secondary}10 0%, transparent 70%)`,
//                     borderRadius: '50%'
//                 }} />
//             </div>

//             <Container style={{ marginTop: '-30px', paddingBottom: '60px' }}>
//                 {/* Quick Stats Row */}
//                 <Row style={{ marginBottom: '32px' }}>
//                     <Col lg={3} md={6}>
//                         <StatCard
//                             label="Asset Name"
//                             value={assetData.asset_name}
//                             icon="package"
//                         />
//                     </Col>
//                     <Col lg={3} md={6}>
//                         <StatCard
//                             label="Component"
//                             value={componentData.asset_component_name}
//                             icon="cpu"
//                         />
//                     </Col>
//                     <Col lg={3} md={6}>
//                         <StatCard
//                             label="Category"
//                             value={assetData.asset_category}
//                             icon="grid"
//                         />
//                     </Col>
//                     <Col lg={3} md={6}>
//                         <StatCard
//                             label="Analysis Date"
//                             value={new Date(data.analysis_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//                             icon="calendar"
//                         />
//                     </Col>
//                 </Row>

//                 {/* Asset Info Card */}
//                 <div style={{
//                     background: colors.white,
//                     borderRadius: '28px',
//                     padding: '28px',
//                     marginBottom: '20px',
//                     boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
//                     border: '1px solid rgba(0,0,0,0.05)'
//                 }}>
//                     <Row className="align-items-center">
//                         <Col md={6}>
//                             <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
//                                 <div>
//                                     <div style={{ fontSize: '12px', color: colors.gray, marginBottom: '4px' }}>Asset Location</div>
//                                     <div style={{ fontSize: '18px', fontWeight: '600', color: colors.dark }}>
//                                         <FeatherIcon icon="map-pin" size={14} style={{ marginRight: '8px', color: colors.accent }} />
//                                         {assetData.asset_location}
//                                     </div>
//                                 </div>
//                                 <div style={{ width: '1px', height: '40px', background: colors.light }} />
//                                 <div>
//                                     <div style={{ fontSize: '12px', color: colors.gray, marginBottom: '4px' }}>Created By</div>
//                                     <div style={{ fontSize: '18px', fontWeight: '600', color: colors.dark }}>
//                                         <FeatherIcon icon="tag" size={14} style={{ marginRight: '8px', color: colors.accent }} />
//                                         {data.created_by}
//                                     </div>
//                                 </div>
//                                 <div>
//                                     <div style={{ fontSize: '12px', color: colors.gray, marginBottom: '4px' }}>Trivector</div>
//                                     <div style={{ fontSize: '18px', fontWeight: '600', color: colors.dark }}>
//                                         <FeatherIcon icon="tag" size={14} style={{ marginRight: '8px', color: colors.accent }} />
//                                         {formatTrivector(assetData.trivector)}
//                                     </div>
//                                 </div>
//                             </div>
//                         </Col>
//                     </Row>
//                 </div>

//                 <div style={{
//                     background: `${colors.primary}10`,
//                     borderRadius: '20px',
//                     padding: '16px 20px',
//                     borderLeft: `3px solid ${colors.accent}`,
//                     marginBottom: '20px',
//                 }}>
//                     <div style={{ fontSize: '12px', color: colors.gray, marginBottom: '8px' }}>
//                         <FeatherIcon icon="message-square" size={12} style={{ marginRight: '6px' }} />
//                         Recommendations
//                     </div>
//                     <div style={{ fontSize: '14px', color: colors.dark, lineHeight: '1.5', fontWeight: '500' }}>
//                         {data.recommendations || 'No recommendations available'}
//                     </div>
//                 </div>

//                 {/* Tabs Navigation */}
//                 <div style={{ marginBottom: '32px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
//                     <div>Trivector</div>
//                     <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
//                         {['wear-metals', 'contaminants', 'chemistry'].map(tab => (
//                             <button
//                                 key={tab}
//                                 onClick={() => setActiveTab(tab)}
//                                 style={{
//                                     padding: '10px 24px',
//                                     border: 'none',
//                                     background: activeTab === tab ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` : 'transparent',
//                                     color: activeTab === tab ? colors.dark : colors.gray,
//                                     fontWeight: '600',
//                                     borderRadius: '40px',
//                                     fontSize: '14px',
//                                     cursor: 'pointer',
//                                     transition: 'all 0.2s ease',
//                                     marginBottom: '-1px'
//                                 }}
//                             >
//                                 {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
//                             </button>
//                         ))}
//                     </div>
//                 </div>

//                 {/* Tab Content */}
//                 <div>
//                     {/* Wear Metals Tab */}
//                     {activeTab === 'wear-metals' && (
//                         <div>
//                             <SectionTitle title="Wear Metals Analysis" icon={gear} count={rotating ? "17" : "12"} />
//                             <Row>
//                                 {rotating && (
//                                     <>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Iron" value={data.iron} unit="ppm" parameterKey="iron" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Chrome" value={data.chrome} unit="ppm" parameterKey="chrome" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Nickel" value={data.nickel} unit="ppm" parameterKey="nickel" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Aluminium" value={data.aluminium} unit="ppm" parameterKey="aluminium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Lead" value={data.lead} unit="ppm" parameterKey="lead" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Copper" value={data.copper} unit="ppm" parameterKey="copper" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Tin" value={data.tin} unit="ppm" parameterKey="tin" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Titanium" value={data.titanium} unit="ppm" parameterKey="titanium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Silver" value={data.silver} unit="ppm" parameterKey="silver" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Antimony" value={data.antimony} unit="ppm" parameterKey="antimony" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Cadmium" value={data.cadmium} unit="ppm" parameterKey="cadmium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Manganese" value={data.manganese} unit="ppm" parameterKey="manganese" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Fatigue >20um" value={data.fatigue_gt_20um} unit="count" parameterKey="fatigue_gt_20um" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Non-Metallic >20um" value={data.non_metallic_gt_20um} unit="count" parameterKey="non_metallic_gt_20um" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Large Fe" value={data.large_fe} unit="%" parameterKey="large_fe" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Fe Wear Severity Index" value={data.fe_wear_severity_index} unit="index" parameterKey="fe_wear_severity_index" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Total Fe <100u" value={data.total_fe_lt_100um} unit="ppm" parameterKey="total_fe_lt_100um" />
//                                         </Col>
//                                     </>
//                                 )}
//                                 {(stationary || mobile) && (
//                                     <>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Iron" value={data.iron} unit="ppm" parameterKey="iron" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Chrome" value={data.chrome} unit="ppm" parameterKey="chrome" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Nickel" value={data.nickel} unit="ppm" parameterKey="nickel" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Aluminium" value={data.aluminium} unit="ppm" parameterKey="aluminium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Lead" value={data.lead} unit="ppm" parameterKey="lead" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Copper" value={data.copper} unit="ppm" parameterKey="copper" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Tin" value={data.tin} unit="ppm" parameterKey="tin" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Titanium" value={data.titanium} unit="ppm" parameterKey="titanium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Silver" value={data.silver} unit="ppm" parameterKey="silver" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Antimony" value={data.antimony} unit="ppm" parameterKey="antimony" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Cadmium" value={data.cadmium} unit="ppm" parameterKey="cadmium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Manganese" value={data.manganese} unit="ppm" parameterKey="manganese" />
//                                         </Col>
//                                     </>
//                                 )}
//                             </Row>
//                         </div>
//                     )}

//                     {/* Contaminants Tab */}
//                     {activeTab === 'contaminants' && (
//                         <div>
//                             <SectionTitle title="Contaminants Analysis" icon={water} count={rotating ? "15" : "8"} />
//                             <Row>
//                                 {rotating && (
//                                     <>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Silicon" value={data.silicon} unit="ppm" parameterKey="silicon" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Sodium" value={data.sodium} unit="ppm" parameterKey="sodium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Vanadium" value={data.vanadium} unit="ppm" parameterKey="vanadium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Potassium" value={data.potassium} unit="ppm" parameterKey="potassium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Lithium" value={data.lithium} unit="ppm" parameterKey="lithium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="ISO 4406 (>4μm)" value={data.iso_4406_code_gt4um} parameterKey="iso_4406_code_gt4um" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="ISO 4406 (>6μm)" value={data.iso_4406_code_gt6um} parameterKey="iso_4406_code_gt6um" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="ISO 4406 (>14μm)" value={data.iso_4406_code_gt14um} parameterKey="iso_4406_code_gt14um" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Cnts >4" value={data.cnts_gt4} unit="particles/ml" parameterKey="cnts_gt4" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Cnts >6" value={data.cnts_gt6} unit="particles/ml" parameterKey="cnts_gt6" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Cnts >14" value={data.cnts_gt14} unit="particles/ml" parameterKey="cnts_gt14" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Particles 5-15um" value={data.particles_5_15um} unit="particles/100" parameterKey="particles_5_15um" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Particles 15-25um" value={data.particles_15_25um} unit="particles/100" parameterKey="particles_15_25um" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Particles 25-50um" value={data.particles_25_50um} unit="particles/100" parameterKey="particles_25_50um" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Particles 50-100um" value={data.particles_50_100um} unit="particles/100" parameterKey="particles_50_100um" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Particles >100um" value={data.particles_gt100um} unit="particles/100" parameterKey="particles_gt100um" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Cutting >20um" value={data.cutting_gt_20um} unit="particles/ml" parameterKey="cutting_gt_20um" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Sliding >20um" value={data.sliding_gt_20um} unit="particles/ml" parameterKey="sliding_gt_20um" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Total Water" value={data.total_water} unit="%" parameterKey="total_water" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Bubbles" value={data.bubbles} parameterKey="bubbles" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Water" value={data.water} unit="%" parameterKey="water" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Large Fe" value={data.large_fe_percent} unit="%" parameterKey="large_fe_percent" />
//                                         </Col>

//                                     </>
//                                 )}
//                                 {stationary && (
//                                     <>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Silicon" value={data.silicon} unit="ppm" parameterKey="silicon" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Sodium" value={data.sodium} unit="ppm" parameterKey="sodium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Vanadium" value={data.vanadium} unit="ppm" parameterKey="vanadium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Potassium" value={data.potassium} unit="ppm" parameterKey="potassium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Lithium" value={data.lithium} unit="ppm" parameterKey="lithium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Glycol %" value={data.glycol_percent} unit="%" parameterKey="glycol_percent" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Bubbles" value={data.bubbles} parameterKey="bubbles" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Antiwear" value={data.antiwear_percent} unit="%" parameterKey="antiwear_percent" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Water" value={data.water} unit="ppm" parameterKey="water" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Soot %" value={data.soot_percent} unit="%" parameterKey="soot_percent" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Biodiesel Fuel Dilution" value={data.biodiesel_fuel_dilution} unit="wt%" parameterKey="biodiesel_fuel_dilution" />
//                                         </Col>
//                                     </>
//                                 )}
//                                 {mobile && (
//                                     <>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Silicon" value={data.silicon} unit="ppm" parameterKey="silicon" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Sodium" value={data.sodium} unit="ppm" parameterKey="sodium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Vanadium" value={data.vanadium} unit="ppm" parameterKey="vanadium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Potassium" value={data.potassium} unit="ppm" parameterKey="potassium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Lithium" value={data.lithium} unit="ppm" parameterKey="lithium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Glycol %" value={data.glycol_percent} unit="%" parameterKey="glycol_percent" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Bubbles" value={data.bubbles} parameterKey="bubbles" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Water" value={data.water} unit="%" parameterKey="water" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Soot %" value={data.soot_percent} unit="%" parameterKey="soot_percent" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Biodiesel Fuel Dilution" value={data.biodiesel_fuel_dilution} unit="wt%" parameterKey="biodiesel_fuel_dilution" />
//                                         </Col>
//                                     </>
//                                 )}
//                             </Row>
//                         </div>
//                     )}

//                     {/* Chemistry Tab */}
//                     {activeTab === 'chemistry' && (
//                         <div>
//                             <SectionTitle title="Chemistry & Viscosity" icon={lab} count="12" />
//                             <Row>
//                                 {(rotating || stationary || mobile) && (
//                                     <>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Molybdenum" value={data.molybdenum} unit="ppm" parameterKey="molybdenum" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Calcium" value={data.calcium} unit="ppm" parameterKey="calcium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Magnesium" value={data.magnesium} unit="ppm" parameterKey="magnesium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Phosphorus" value={data.phosphorus} unit="ppm" parameterKey="phosphorus" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Zinc" value={data.zinc} unit="ppm" parameterKey="zinc" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Barium" value={data.barium} unit="ppm" parameterKey="barium" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Boron" value={data.boron} unit="ppm" parameterKey="boron" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Viscosity 40°C" value={data.viscosity_at_40c} unit="cSt" parameterKey="viscosity_at_40c" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Viscosity 100°C" value={data.viscosity_at_100c} unit="cSt" parameterKey="viscosity_at_100c" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Oxidation" value={data.oxidation} parameterKey="oxidation" />
//                                         </Col>
//                                         <Col lg={4} md={6} sm={12}>
//                                             <MetricTile label="Fluid Integrity" value={data.fluid_integrity} parameterKey="fluid_integrity" />
//                                         </Col>
//                                         {rotating && (
//                                             <Col lg={4} md={6} sm={12}>
//                                                 <MetricTile label="TAN" value={data.tan} parameterKey="tan" />
//                                             </Col>
//                                         )}
//                                         {mobile && (
//                                             <Col lg={4} md={6} sm={12}>
//                                                 <MetricTile label="Antiwear" value={data.antiwear_percent} unit='%' parameterKey="tan" />
//                                             </Col>
//                                         )
//                                         }
//                                         {(stationary || mobile) && (
//                                             <>
//                                                 <Col lg={4} md={6} sm={12}>
//                                                     <MetricTile label="TBN" value={data.tbn} parameterKey="tbn" />
//                                                 </Col>
//                                                 <Col lg={4} md={6} sm={12}>
//                                                     <MetricTile label="Nitration" value={data.nitration} parameterKey="nitration" />
//                                                 </Col>
//                                                 <Col lg={4} md={6} sm={12}>
//                                                     <MetricTile label="Sulfation" value={data.sulfation} parameterKey="sulfation" />
//                                                 </Col>
//                                             </>
//                                         )}
//                                     </>
//                                 )}
//                             </Row>
//                         </div>
//                     )}
//                 </div>
//             </Container>
//         </div>
//     )
// }
// ______________________________________________________________________________________


import { useEffect, useState } from "react";
import axios from 'axios';
import config from 'config';
import { Container, Row, Col, Badge, Spinner, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import FeatherIcon from "feather-icons-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

import water from "assets/images/water.png";
import gear from "assets/images/gear-box.png";
import lab from "assets/images/lab.png";

// Add keyframes for animations
const keyframes = `
    @keyframes float {
        0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
        25% { transform: translateY(-20px) translateX(10px) rotate(2deg); }
        50% { transform: translateY(10px) translateX(-15px) rotate(-2deg); }
        75% { transform: translateY(-10px) translateX(5px) rotate(1deg); }
    }
`;

export default function ViewSubmittedAsset() {
    const asset_analysis_id = new URLSearchParams(window.location.search).get('id');
    const [data, setData] = useState([]);
    const [assetData, setAssetData] = useState([]);
    const [componentData, setComponentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('wear-metals');
    const [matchData, setMatchData] = useState([]);
    const [filteredMatchData, setFilteredMatchData] = useState([]);

    const [rotating, setRotating] = useState(false);
    const [mobile, setMobile] = useState(false);
    const [stationary, setStationary] = useState(false);

    // Filter states for each tab
    const [wearMetalsFilter, setWearMetalsFilter] = useState('all');
    const [contaminantsFilter, setContaminantsFilter] = useState('all');
    const [chemistryFilter, setChemistryFilter] = useState('all');

    // Date filter states
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

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

    // Inject keyframes into document
    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.innerText = keyframes;
        document.head.appendChild(styleSheet);
        return () => {
            document.head.removeChild(styleSheet);
        };
    }, []);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${config.baseApi}/assetsAnalysis/get-submitted-assets-by-id`, {
                    params: { id: asset_analysis_id }
                });
                const data = res.data || [];
                setData(data);
                console.log('DATA: ', data);
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

                // Fetch all historical data
                const res1 = await axios.get(`${config.baseApi}/assetsAnalysis/get-all-submitted-assets`);
                const data1 = res1.data || [];
                const filteredMatchData = data1.filter(item =>
                    item.asset_id === data.asset_id &&
                    item.asset_component_id === data.asset_component_id
                ).sort((a, b) => new Date(a.analysis_date) - new Date(b.analysis_date));

                console.log('matchData: ', filteredMatchData);
                setMatchData(filteredMatchData);
                setFilteredMatchData(filteredMatchData);

                // Set initial date range based on available data
                if (filteredMatchData.length > 0) {
                    const firstDate = new Date(filteredMatchData[0].analysis_date);
                    const lastDate = new Date(filteredMatchData[filteredMatchData.length - 1].analysis_date);
                    setFromDate(firstDate.toISOString().split('T')[0]);
                    setToDate(lastDate.toISOString().split('T')[0]);
                }

            } catch (err) {
                console.log('UNABLE TO FETCH SUBMITTED ASSETS BY ID : ', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    useEffect(() => {
        console.log(assetData);
        if (assetData.trivector === 'rotating-machine') {
            setRotating(true);
            setStationary(false);
            setMobile(false);
        } else if (assetData.trivector === 'stationary-engine') {
            setStationary(true);
            setRotating(false);
            setMobile(false);
        } else if (assetData.trivector === 'mobile-engine') {
            setMobile(true);
            setRotating(false);
            setStationary(false);
        }
    }, [assetData]);

    // Apply date filter whenever fromDate, toDate, or matchData changes
    useEffect(() => {
        if (matchData.length === 0) return;

        let filtered = [...matchData];

        if (fromDate) {
            const fromDateTime = new Date(fromDate);
            fromDateTime.setHours(0, 0, 0, 0);
            filtered = filtered.filter(item => new Date(item.analysis_date) >= fromDateTime);
        }

        if (toDate) {
            const toDateTime = new Date(toDate);
            toDateTime.setHours(23, 59, 59, 999);
            filtered = filtered.filter(item => new Date(item.analysis_date) <= toDateTime);
        }

        setFilteredMatchData(filtered);
    }, [fromDate, toDate, matchData]);

    // Check if there is historical data available for the current parameter
    const hasHistoricalData = (parameterKey) => {
        if (filteredMatchData.length <= 1) return false;

        // Check if at least one record has non-null/undefined value for this parameter
        return filteredMatchData.some(item =>
            item[parameterKey] !== null &&
            item[parameterKey] !== undefined &&
            item[parameterKey] !== ''
        );
    };

    const StatCard = ({ label, value, icon, trend, trendValue }) => (
        <div style={{
            background: '#fdf4e2',
            borderRadius: '24px',
            padding: '20px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: '3px solid rgb(214, 180, 105)',
            position: 'relative',
            overflow: 'hidden',
            height: '100%'
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

    const MetricTile = ({ label, value, unit, status = 'normal', parameterKey, show = true }) => {
        if (!show) return null;

        const statusColors = {
            normal: colors.success,
            warning: colors.warning,
            critical: colors.danger
        };

        // Prepare chart data using filtered historical records
        const hasMultipleData = filteredMatchData.length > 1 && hasHistoricalData(parameterKey);
        const chartData = hasMultipleData ? filteredMatchData.map(item => ({
            date: new Date(item.analysis_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            value: item[parameterKey] || 0,
            fullDate: new Date(item.analysis_date)
        })).sort((a, b) => a.fullDate - b.fullDate) : [];

        // Only show chart if there's valid data
        const showChart = hasMultipleData && chartData.length > 0 && chartData.some(d => d.value !== 0);

        return (
            <div >

                <div style={{
                    background: 'linear-gradient(135deg, #ffd698 0%, #ffb347 100%)',
                    borderRadius: '16px 16px 0px 0px',

                    padding: '16px',
                    transition: 'all 0.2s ease',
                    border: `1.5px solid #6e6e6e`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row',  // Changed to row
                    // Vertically center everything
                    justifyContent: 'space-between'  // Pushes label to left and value to right
                }}>
                    <div style={{
                        fontSize: '12px',
                        color: colors.gray,
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
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'baseline',
                        gap: '10px'
                    }}>
                        <span>{value || '—'}</span>
                        {unit && (
                            <span style={{ fontSize: '11px', color: colors.gray }}>
                                {unit}
                            </span>
                        )}
                    </div>
                </div>



                {/* Display chart only if there are multiple data points with valid values */}
                {showChart && (
                    <div style={{
                        padding: '12px',
                        background: '#fff2d6',
                        borderRadius: '0px 0px 12px 12px',
                        border: `1.5px solid #6e6e6e`,

                    }}>
                        <div style={{ fontSize: '11px', color: colors.gray, marginBottom: '8px' }}>
                            Historical Trend (Last {chartData.length} records)
                        </div>
                        <div style={{ height: '200px', width: '100%' }}>
                            <ResponsiveContainer>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={`${colors.gray}30`} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 10 }}
                                        interval="preserveStartEnd"
                                        angle={-25}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 10 }}
                                        label={{ value: unit || 'ppm', angle: -90, position: 'insideLeft', fontSize: 10 }}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`${value} ${unit || ''}`, label]}
                                        labelFormatter={(label) => `Date: ${label}`}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke={colors.accent}
                                        strokeWidth={2}
                                        dot={{ fill: colors.accent, r: 3 }}
                                        activeDot={{ r: 5 }}
                                        name={label}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )
                }
            </div >
        );
    };

    const SectionTitle = ({ title, icon, count }) => (
        <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img src={icon} width={'25px'} alt={title} />
                </div>
                <h3 style={{ margin: 0, fontSize: 'clamp(18px, 4vw, 20px)', fontWeight: 'bold', color: '#d19547' }}>
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

    const FilterAndDateRow = () => {
        // Only show filters if there is historical data (more than 1 record)
        const showFilters = matchData.length > 1;

        if (!showFilters) {
            return null;
        }

        // Get current filter options based on active tab
        const getCurrentFilterOptions = () => {
            if (activeTab === 'wear-metals') {
                let params = [];
                if (rotating) {
                    params = wearMetalsParams.rotating;
                } else if (stationary || mobile) {
                    params = wearMetalsParams.stationaryMobile;
                }
                return [
                    { value: 'all', label: 'All Parameters' },
                    ...params.map(p => ({ value: p.label.toLowerCase(), label: p.label }))
                ];
            } else if (activeTab === 'contaminants') {
                let params = [];
                if (rotating) {
                    params = contaminantsParams.rotating;
                } else if (stationary) {
                    params = contaminantsParams.stationary;
                } else if (mobile) {
                    params = contaminantsParams.mobile;
                }
                return [
                    { value: 'all', label: 'All Parameters' },
                    ...params.map(p => ({ value: p.label.toLowerCase(), label: p.label }))
                ];
            } else {
                let params = [...chemistryParams.common];
                if (rotating) {
                    params = [...params, ...chemistryParams.rotating];
                } else if (stationary || mobile) {
                    params = [...params, ...chemistryParams.stationaryMobile];
                }
                if (mobile) {
                    params = [...params, ...chemistryParams.mobile];
                }
                return [
                    { value: 'all', label: 'All Parameters' },
                    ...params.map(p => ({ value: p.label.toLowerCase(), label: p.label }))
                ];
            }
        };

        const getCurrentFilterValue = () => {
            if (activeTab === 'wear-metals') return wearMetalsFilter;
            if (activeTab === 'contaminants') return contaminantsFilter;
            return chemistryFilter;
        };

        const setCurrentFilterValue = (value) => {
            if (activeTab === 'wear-metals') setWearMetalsFilter(value);
            if (activeTab === 'contaminants') setContaminantsFilter(value);
            if (activeTab === 'chemistry') setChemistryFilter(value);
        };

        return (
            <div style={{
                background: colors.white,
                borderRadius: '0px 0px 16px 16px',
                padding: '16px 24px',
                marginBottom: '24px',
                border: `2px solid ${colors.primary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '15px'
            }}>
                {/* Parameter Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <FeatherIcon icon="filter" size={18} color={colors.accent} />
                    <span style={{ fontSize: '14px', fontWeight: '600', color: colors.dark }}>Filter by Parameter:</span>
                    <Form.Select
                        value={getCurrentFilterValue()}
                        onChange={(e) => setCurrentFilterValue(e.target.value)}
                        style={{
                            width: '200px',
                            borderRadius: '8px',
                            border: `2px solid ${colors.primary}`,
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                    >
                        {getCurrentFilterOptions().map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Form.Select>
                </div>

                {/* Divider - hide on small screens */}
                <div style={{ width: '1px', height: '30px', background: colors.light, display: 'flex', '@media (max-width: 768px)': { display: 'none' } }} />

                {/* Date Range Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FeatherIcon icon="calendar" size={18} color={colors.accent} />
                        <span style={{ fontSize: '14px', fontWeight: '600', color: colors.dark }}>Date Range:</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: colors.gray }}>From:</span>
                        <Form.Control
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            style={{
                                width: '150px',
                                borderRadius: '8px',
                                border: `1px solid ${colors.primary}40`,
                                fontSize: '13px'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: colors.gray }}>To:</span>
                        <Form.Control
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            style={{
                                width: '150px',
                                borderRadius: '8px',
                                border: `1px solid ${colors.primary}40`,
                                fontSize: '13px'
                            }}
                        />
                    </div>
                    <button
                        onClick={() => {
                            if (matchData.length > 0) {
                                const firstDate = new Date(matchData[0].analysis_date);
                                const lastDate = new Date(matchData[matchData.length - 1].analysis_date);
                                setFromDate(firstDate.toISOString().split('T')[0]);
                                setToDate(lastDate.toISOString().split('T')[0]);
                            }
                        }}
                        style={{
                            padding: '6px 16px',
                            background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}20 100%)`,
                            border: `1px solid ${colors.primary}40`,
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: colors.dark,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Reset Dates
                    </button>
                </div>

                {/* Record Counter */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 12px',
                    background: `${colors.primary}10`,
                    borderRadius: '20px'
                }}>
                    <FeatherIcon icon="bar-chart-2" size={14} color={colors.accent} />
                    <span style={{ fontSize: '12px', fontWeight: '500', color: colors.dark }}>
                        {filteredMatchData.length} / {matchData.length} records
                    </span>
                </div>
            </div>
        );
    };

    const formatTrivector = (value) => {
        const mapping = {
            'rotating-machine': 'Rotating Machine',
            'stationary-engine': 'Stationary Engine',
            'mobile-engine': 'Mobile Engine'
        };
        return mapping[value] || value || '-';
    };

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

    // Define all wear metals parameters
    const wearMetalsParams = {
        rotating: [
            { label: "Iron", value: data.iron, unit: "ppm", key: "iron" },
            { label: "Chrome", value: data.chrome, unit: "ppm", key: "chrome" },
            { label: "Nickel", value: data.nickel, unit: "ppm", key: "nickel" },
            { label: "Aluminium", value: data.aluminium, unit: "ppm", key: "aluminium" },
            { label: "Lead", value: data.lead, unit: "ppm", key: "lead" },
            { label: "Copper", value: data.copper, unit: "ppm", key: "copper" },
            { label: "Tin", value: data.tin, unit: "ppm", key: "tin" },
            { label: "Titanium", value: data.titanium, unit: "ppm", key: "titanium" },
            { label: "Silver", value: data.silver, unit: "ppm", key: "silver" },
            { label: "Antimony", value: data.antimony, unit: "ppm", key: "antimony" },
            { label: "Cadmium", value: data.cadmium, unit: "ppm", key: "cadmium" },
            { label: "Manganese", value: data.manganese, unit: "ppm", key: "manganese" },
            { label: "Fatigue >20um", value: data.fatigue_gt_20um, unit: "count", key: "fatigue_gt_20um" },
            { label: "Non-Metallic >20um", value: data.non_metallic_gt_20um, unit: "count", key: "non_metallic_gt_20um" },
            { label: "Large Fe", value: data.large_fe, unit: "%", key: "large_fe" },
            { label: "Fe Wear Severity Index", value: data.fe_wear_severity_index, unit: "index", key: "fe_wear_severity_index" },
            { label: "Total Fe <100u", value: data.total_fe_lt_100um, unit: "ppm", key: "total_fe_lt_100um" }
        ],
        stationaryMobile: [
            { label: "Iron", value: data.iron, unit: "ppm", key: "iron" },
            { label: "Chrome", value: data.chrome, unit: "ppm", key: "chrome" },
            { label: "Nickel", value: data.nickel, unit: "ppm", key: "nickel" },
            { label: "Aluminium", value: data.aluminium, unit: "ppm", key: "aluminium" },
            { label: "Lead", value: data.lead, unit: "ppm", key: "lead" },
            { label: "Copper", value: data.copper, unit: "ppm", key: "copper" },
            { label: "Tin", value: data.tin, unit: "ppm", key: "tin" },
            { label: "Titanium", value: data.titanium, unit: "ppm", key: "titanium" },
            { label: "Silver", value: data.silver, unit: "ppm", key: "silver" },
            { label: "Antimony", value: data.antimony, unit: "ppm", key: "antimony" },
            { label: "Cadmium", value: data.cadmium, unit: "ppm", key: "cadmium" },
            { label: "Manganese", value: data.manganese, unit: "ppm", key: "manganese" }
        ]
    };

    // Define contaminants parameters
    const contaminantsParams = {
        rotating: [
            { label: "Silicon", value: data.silicon, unit: "ppm", key: "silicon" },
            { label: "Sodium", value: data.sodium, unit: "ppm", key: "sodium" },
            { label: "Vanadium", value: data.vanadium, unit: "ppm", key: "vanadium" },
            { label: "Potassium", value: data.potassium, unit: "ppm", key: "potassium" },
            { label: "Lithium", value: data.lithium, unit: "ppm", key: "lithium" },
            { label: "ISO 4406 (>4μm)", value: data.iso_4406_code_gt4um, key: "iso_4406_code_gt4um" },
            { label: "ISO 4406 (>6μm)", value: data.iso_4406_code_gt6um, key: "iso_4406_code_gt6um" },
            { label: "ISO 4406 (>14μm)", value: data.iso_4406_code_gt14um, key: "iso_4406_code_gt14um" },
            { label: "Cnts >4", value: data.cnts_gt4, unit: "particles/ml", key: "cnts_gt4" },
            { label: "Cnts >6", value: data.cnts_gt6, unit: "particles/ml", key: "cnts_gt6" },
            { label: "Cnts >14", value: data.cnts_gt14, unit: "particles/ml", key: "cnts_gt14" },
            { label: "Particles 5-15um", value: data.particles_5_15um, unit: "particles/100", key: "particles_5_15um" },
            { label: "Particles 15-25um", value: data.particles_15_25um, unit: "particles/100", key: "particles_15_25um" },
            { label: "Particles 25-50um", value: data.particles_25_50um, unit: "particles/100", key: "particles_25_50um" },
            { label: "Particles 50-100um", value: data.particles_50_100um, unit: "particles/100", key: "particles_50_100um" },
            { label: "Particles >100um", value: data.particles_gt100um, unit: "particles/100", key: "particles_gt100um" },
            { label: "Cutting >20um", value: data.cutting_gt_20um, unit: "particles/ml", key: "cutting_gt_20um" },
            { label: "Sliding >20um", value: data.sliding_gt_20um, unit: "particles/ml", key: "sliding_gt_20um" },
            { label: "Total Water", value: data.total_water, unit: "%", key: "total_water" },
            { label: "Bubbles", value: data.bubbles, key: "bubbles" },
            { label: "Water", value: data.water, unit: "%", key: "water" },
            { label: "Large Fe", value: data.large_fe_percent, unit: "%", key: "large_fe_percent" }
        ],
        stationary: [
            { label: "Silicon", value: data.silicon, unit: "ppm", key: "silicon" },
            { label: "Sodium", value: data.sodium, unit: "ppm", key: "sodium" },
            { label: "Vanadium", value: data.vanadium, unit: "ppm", key: "vanadium" },
            { label: "Potassium", value: data.potassium, unit: "ppm", key: "potassium" },
            { label: "Lithium", value: data.lithium, unit: "ppm", key: "lithium" },
            { label: "Glycol %", value: data.glycol_percent, unit: "%", key: "glycol_percent" },
            { label: "Bubbles", value: data.bubbles, key: "bubbles" },
            { label: "Antiwear", value: data.antiwear_percent, unit: "%", key: "antiwear_percent" },
            { label: "Water", value: data.water, unit: "ppm", key: "water" },
            { label: "Soot %", value: data.soot_percent, unit: "%", key: "soot_percent" },
            { label: "Biodiesel Fuel Dilution", value: data.biodiesel_fuel_dilution, unit: "wt%", key: "biodiesel_fuel_dilution" }
        ],
        mobile: [
            { label: "Silicon", value: data.silicon, unit: "ppm", key: "silicon" },
            { label: "Sodium", value: data.sodium, unit: "ppm", key: "sodium" },
            { label: "Vanadium", value: data.vanadium, unit: "ppm", key: "vanadium" },
            { label: "Potassium", value: data.potassium, unit: "ppm", key: "potassium" },
            { label: "Lithium", value: data.lithium, unit: "ppm", key: "lithium" },
            { label: "Glycol %", value: data.glycol_percent, unit: "%", key: "glycol_percent" },
            { label: "Bubbles", value: data.bubbles, key: "bubbles" },
            { label: "Water", value: data.water, unit: "%", key: "water" },
            { label: "Soot %", value: data.soot_percent, unit: "%", key: "soot_percent" },
            { label: "Biodiesel Fuel Dilution", value: data.biodiesel_fuel_dilution, unit: "wt%", key: "biodiesel_fuel_dilution" }
        ]
    };

    // Define chemistry parameters
    const chemistryParams = {
        common: [
            { label: "Molybdenum", value: data.molybdenum, unit: "ppm", key: "molybdenum" },
            { label: "Calcium", value: data.calcium, unit: "ppm", key: "calcium" },
            { label: "Magnesium", value: data.magnesium, unit: "ppm", key: "magnesium" },
            { label: "Phosphorus", value: data.phosphorus, unit: "ppm", key: "phosphorus" },
            { label: "Zinc", value: data.zinc, unit: "ppm", key: "zinc" },
            { label: "Barium", value: data.barium, unit: "ppm", key: "barium" },
            { label: "Boron", value: data.boron, unit: "ppm", key: "boron" },
            { label: "Viscosity 40°C", value: data.viscosity_at_40c, unit: "cSt", key: "viscosity_at_40c" },
            { label: "Viscosity 100°C", value: data.viscosity_at_100c, unit: "cSt", key: "viscosity_at_100c" },
            { label: "Oxidation", value: data.oxidation, unit: "abs/0.1mm", key: "oxidation" },
            { label: "Fluid Integrity", value: data.fluid_integrity, key: "fluid_integrity" }
        ],
        rotating: [
            { label: "TAN", value: data.tan, key: "tan" }
        ],
        stationaryMobile: [
            { label: "TBN", value: data.tbn, unit: "mg KOH/g", key: "tbn" },
            { label: "Nitration", value: data.nitration, unit: "abs/cm", key: "nitration" },
            { label: "Sulfation", value: data.sulfation, unit: "abs/0.1mm", key: "sulfation" }
        ],
        mobile: [
            { label: "Antiwear", value: data.antiwear_percent, unit: '%', key: "antiwear_percent" }
        ]
    };

    // Get the current parameters based on filters
    const getCurrentWearMetals = () => {
        let allParams = [];
        if (rotating) {
            allParams = wearMetalsParams.rotating;
        } else if (stationary || mobile) {
            allParams = wearMetalsParams.stationaryMobile;
        }

        if (wearMetalsFilter === 'all') return allParams;
        return allParams.filter(param => param.label.toLowerCase() === wearMetalsFilter.toLowerCase());
    };

    const getCurrentContaminants = () => {
        let allParams = [];
        if (rotating) {
            allParams = contaminantsParams.rotating;
        } else if (stationary) {
            allParams = contaminantsParams.stationary;
        } else if (mobile) {
            allParams = contaminantsParams.mobile;
        }

        if (contaminantsFilter === 'all') return allParams;
        return allParams.filter(param => param.label.toLowerCase() === contaminantsFilter.toLowerCase());
    };

    const getCurrentChemistry = () => {
        let allParams = [...chemistryParams.common];
        if (rotating) {
            allParams = [...allParams, ...chemistryParams.rotating];
        } else if (stationary || mobile) {
            allParams = [...allParams, ...chemistryParams.stationaryMobile];
        }
        if (mobile) {
            allParams = [...allParams, ...chemistryParams.mobile];
        }

        if (chemistryFilter === 'all') return allParams;
        return allParams.filter(param => param.label.toLowerCase() === chemistryFilter.toLowerCase());
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

            {/* Main Content - wrapped with relative positioning to sit above background */}
            <div style={{ position: 'relative', zIndex: 2 }}>
                {/* Modern Header */}
                <div style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                    padding: '0 10px'
                }}>



                    <div >

                        <h1 style={{
                            fontSize: '3.5rem',
                            fontWeight: '800',
                            color: '#EAB56F',
                            marginBottom: '10px',
                            letterSpacing: '-0.5px',
                            textShadow: '0 4px 20px rgba(234, 181, 111, 0.2)'
                        }}>Asset Analysis Report ID #{asset_analysis_id}</h1>

                        <p style={{
                            fontSize: '1.2rem',
                            color: '#F9982F',
                            opacity: '0.9',
                            fontWeight: '400',
                            maxWidth: '600px',
                            margin: '0'
                        }}> Detailed diagnostic and condition monitoring results</p>



                    </div>





                </div>

                <Container style={{ paddingBottom: '60px' }}>
                    {/* Quick Stats Row */}
                    <Row style={{ marginBottom: '5px' }}>
                        <Col xs={12} sm={6} lg={3} style={{ marginBottom: '16px' }}>
                            <StatCard
                                label="Asset Name"
                                value={assetData.asset_name}
                                icon="package"
                            />
                        </Col>
                        <Col xs={12} sm={6} lg={3} style={{ marginBottom: '16px' }}>
                            <StatCard
                                label="Component"
                                value={componentData.asset_component_name}
                                icon="cpu"
                            />
                        </Col>
                        <Col xs={12} sm={6} lg={3} style={{ marginBottom: '16px' }}>
                            <StatCard
                                label="Category"
                                value={assetData.asset_category}
                                icon="grid"
                            />
                        </Col>
                        <Col xs={12} sm={6} lg={3} style={{ marginBottom: '16px' }}>
                            <StatCard
                                label="Analysis Date"
                                value={new Date(data.analysis_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                icon="calendar"
                            />
                        </Col>
                    </Row>

                    {/* Asset Info Card - Fully Responsive */}
                    <div style={{
                        background: '#fdf4e2',
                        borderRadius: '28px',
                        padding: 'clamp(20px, 4vw, 28px)',
                        marginBottom: '20px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                        border: '2px solid rgb(214, 180, 105)',
                    }}>
                        <Row className="align-items-center">
                            <Col xs={12}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 'clamp(12px, 3vw, 20px)',
                                    flexWrap: 'wrap',
                                    flexDirection: 'row'
                                }}>
                                    {/* Asset Location */}
                                    <div style={{
                                        flex: '1 1 auto',
                                        minWidth: '180px'
                                    }}>
                                        <div style={{ fontSize: '12px', color: colors.gray, marginBottom: '4px' }}>Asset Location</div>
                                        <div style={{
                                            fontSize: 'clamp(14px, 4vw, 18px)',
                                            fontWeight: '600',
                                            color: colors.dark,
                                            wordBreak: 'break-word'
                                        }}>
                                            <FeatherIcon icon="map-pin" size={14} style={{ marginRight: '8px', color: colors.accent, verticalAlign: 'middle' }} />
                                            {assetData.asset_location}
                                        </div>
                                    </div>

                                    {/* Divider - hide on very small screens */}
                                    <div style={{
                                        width: '1px',
                                        height: '40px',
                                        background: colors.light,
                                        display: 'none',
                                        '@media (min-width: 768px)': { display: 'block' }
                                    }} />

                                    {/* Created By */}
                                    <div style={{
                                        flex: '1 1 auto',
                                        minWidth: '160px'
                                    }}>
                                        <div style={{ fontSize: '12px', color: colors.gray, marginBottom: '4px' }}>Created By</div>
                                        <div style={{
                                            fontSize: 'clamp(14px, 4vw, 18px)',
                                            fontWeight: '600',
                                            color: colors.dark,
                                            wordBreak: 'break-word'
                                        }}>
                                            <FeatherIcon icon="tag" size={14} style={{ marginRight: '8px', color: colors.accent, verticalAlign: 'middle' }} />
                                            {data.created_by}
                                        </div>
                                    </div>

                                    {/* Divider - hide on very small screens */}
                                    <div style={{
                                        width: '1px',
                                        height: '40px',
                                        background: colors.light,
                                        display: 'none',
                                        '@media (min-width: 768px)': { display: 'block' }
                                    }} />

                                    {/* Trivector */}
                                    <div style={{
                                        flex: '1 1 auto',
                                        minWidth: '160px'
                                    }}>
                                        <div style={{ fontSize: '12px', color: 'colors.gray', marginBottom: '4px' }}>Trivector</div>
                                        <div style={{
                                            fontSize: 'clamp(14px, 4vw, 18px)',
                                            fontWeight: '600',
                                            color: colors.dark,
                                            wordBreak: 'break-word'
                                        }}>
                                            <FeatherIcon icon="tag" size={14} style={{ marginRight: '8px', color: colors.accent, verticalAlign: 'middle' }} />
                                            {formatTrivector(assetData.trivector)}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <div style={{
                        background: '#f0c27e',
                        borderRadius: '10px',
                        padding: '16px 20px',
                        borderLeft: `15px solid ${colors.accent}`,
                        marginBottom: '20px',
                        wordWrap: 'break-word',       // breaks long words
                        overflowWrap: 'break-word',   // modern equivalent
                        whiteSpace: 'normal',         // ensures text wraps
                        maxWidth: '100%',             // prevents overflow of container
                    }}>
                        <div style={{ fontSize: '12px', color: colors.gray, marginBottom: '8px' }}>
                            <FeatherIcon icon="message-square" size={12} style={{ marginRight: '6px' }} />
                            Recommendations
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: colors.dark,
                            lineHeight: '1.5',
                            fontWeight: '500',
                            whiteSpace: 'pre-wrap',    // preserves paragraph breaks
                            wordBreak: 'break-word',   // breaks long strings if needed
                        }}>
                            {data.recommendations || 'No recommendations available'}
                        </div>
                    </div>
                    <div style={{ background: '#fcf6ee', padding: '25px', borderRadius: '20px' }}>
                        {/* Tabs Navigation - Responsive */}
                        <div style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            <div style={{
                                fontSize: 'clamp(20px, 4vw, 24px)',
                                fontWeight: '600',
                                color: '#444444',
                                marginBottom: '8px'
                            }}>
                                <FeatherIcon icon="trending-up" size={20} style={{ marginRight: '8px', color: colors.accent, verticalAlign: 'middle' }} />

                                Charts
                            </div>
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                flexWrap: 'wrap'
                            }}>
                                {['wear-metals', 'contaminants', 'chemistry'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        style={{
                                            padding: '10px 24px',
                                            border: 'none',
                                            background: activeTab === tab ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)` : 'transparent',
                                            color: activeTab === tab ? colors.dark : colors.gray,
                                            fontWeight: '600',
                                            borderRadius: '20px 20px 5px 5px',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',

                                            flex: '0 0 auto'
                                        }}
                                    >
                                        {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Combined Filter and Date Row - Only shows if there is historical data */}
                        <FilterAndDateRow />

                        {/* Tab Content */}
                        <div >
                            {/* Wear Metals Tab */}
                            {activeTab === 'wear-metals' && (
                                <div>
                                    <SectionTitle title="Wear Metals Analysis" icon={gear} count={rotating ? "17" : "12"} />
                                    <Row>
                                        {getCurrentWearMetals().map((param, index) => (
                                            <Col xs={12} sm={6} lg={4} key={index} style={{ marginBottom: '16px' }}>
                                                <MetricTile
                                                    label={param.label}
                                                    value={param.value}
                                                    unit={param.unit}
                                                    parameterKey={param.key}
                                                    show={true}
                                                />
                                            </Col>
                                        ))}
                                        {getCurrentWearMetals().length === 0 && (
                                            <Col>
                                                <div style={{ textAlign: 'center', padding: '40px', color: colors.gray }}>
                                                    No parameters match the selected filter
                                                </div>
                                            </Col>
                                        )}
                                    </Row>
                                </div>
                            )}

                            {/* Contaminants Tab */}
                            {activeTab === 'contaminants' && (
                                <div>
                                    <SectionTitle title="Contaminants Analysis" icon={water} count={rotating ? "22" : stationary ? "11" : "10"} />
                                    <Row>
                                        {getCurrentContaminants().map((param, index) => (
                                            <Col xs={12} sm={6} lg={4} key={index} style={{ marginBottom: '16px' }}>
                                                <MetricTile
                                                    label={param.label}
                                                    value={param.value}
                                                    unit={param.unit}
                                                    parameterKey={param.key}
                                                    show={true}
                                                />
                                            </Col>
                                        ))}
                                        {getCurrentContaminants().length === 0 && (
                                            <Col>
                                                <div style={{ textAlign: 'center', padding: '40px', color: colors.gray }}>
                                                    No parameters match the selected filter
                                                </div>
                                            </Col>
                                        )}
                                    </Row>
                                </div>
                            )}

                            {/* Chemistry Tab */}
                            {activeTab === 'chemistry' && (
                                <div>
                                    <SectionTitle title="Chemistry & Viscosity" icon={lab} count="12" />
                                    <Row>
                                        {getCurrentChemistry().map((param, index) => (
                                            <Col xs={12} sm={6} lg={4} key={index} style={{ marginBottom: '16px' }}>
                                                <MetricTile
                                                    label={param.label}
                                                    value={param.value}
                                                    unit={param.unit}
                                                    parameterKey={param.key}
                                                    show={true}
                                                />
                                            </Col>
                                        ))}
                                        {getCurrentChemistry().length === 0 && (
                                            <Col>
                                                <div style={{ textAlign: 'center', padding: '40px', color: colors.gray }}>
                                                    No parameters match the selected filter
                                                </div>
                                            </Col>
                                        )}
                                    </Row>
                                </div>
                            )}
                        </div>
                    </div>
                </Container>
            </div>
        </div >
    );
}