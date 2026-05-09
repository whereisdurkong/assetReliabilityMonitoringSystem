// import { useEffect, useState } from "react";
// import axios from 'axios';
// import config from 'config';
// import FeatherIcon from "feather-icons-react";
// import { Col } from "react-bootstrap";
// import Feather from "../ui-elements/icons/Feather";
// import { useNavigate } from 'react-router';

// export default function AssetDashboard() {
//     const [assets, setAssets] = useState([]);
//     const [components, setComponents] = useState([]);
//     const [reports, setReports] = useState([]);
//     const [selectedAsset, setSelectedAsset] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [selectedYear, setSelectedYear] = useState('all');

//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 setLoading(true);
//                 const assetsRes = await axios.get(`${config.baseApi}/assets/get-all-assets`);
//                 const assetsData = assetsRes.data || [];
//                 const assetsWithComponents = assetsData.filter(asset => asset.has_components === '1');
//                 setAssets(assetsWithComponents);
//                 const componentsRes = await axios.get(`${config.baseApi}/assets/get-all-components`);
//                 const componentsData = componentsRes.data || [];
//                 setComponents(componentsData);
//                 const reportRes = await axios.get(`${config.baseApi}/assetsAnalysis/get-all-submitted-assets`);
//                 const reportData = reportRes.data || [];
//                 setReports(reportData);
//                 if (assetsWithComponents.length > 0) {
//                     setSelectedAsset(assetsWithComponents[0]);
//                 }
//             } catch (err) {
//                 console.error('Unable to fetch asset data', err);
//             } finally {
//                 setLoading(false);
//             }
//         }
//         fetchData();
//     }, []);

//     const getAvailableYears = () => {
//         if (!selectedAsset) return [];
//         const assetReports = reports.filter(report => report.asset_id === selectedAsset.asset_id);
//         const years = new Set();
//         assetReports.forEach(report => {
//             if (report.analysis_date) {
//                 const year = new Date(report.analysis_date).getFullYear();
//                 years.add(year);
//             }
//         });
//         return Array.from(years).sort((a, b) => b - a);
//     };

//     const getAssetComponents = () => {
//         if (!selectedAsset) return [];
//         return components.filter(component => component.asset_id === selectedAsset.asset_id);
//     };

//     const getAssetReports = () => {
//         if (!selectedAsset) return [];
//         let filteredReports = reports.filter(report => report.asset_id === selectedAsset.asset_id);
//         if (selectedYear !== 'all') {
//             filteredReports = filteredReports.filter(report => {
//                 if (!report.analysis_date) return false;
//                 const reportYear = new Date(report.analysis_date).getFullYear();
//                 return reportYear === parseInt(selectedYear);
//             });
//         }
//         return filteredReports.sort((a, b) => new Date(b.analysis_date) - new Date(a.analysis_date));
//     };

//     const getComponentDetails = (componentId) => {
//         return components.find(component => component.asset_component_id === componentId);
//     };

//     const getAverages = () => {
//         const assetReports = getAssetReports();
//         if (assetReports.length === 0) {
//             return { avgAssetRunningHours: 0, avgOilRunningHours: 0, reportCount: 0 };
//         }
//         const totalAssetRunningHours = assetReports.reduce((sum, report) => sum + (parseFloat(report.asset_running_hours) || 0), 0);
//         const totalOilRunningHours = assetReports.reduce((sum, report) => sum + (parseFloat(report.oil_running_hours) || 0), 0);
//         return {
//             avgAssetRunningHours: (totalAssetRunningHours / assetReports.length).toFixed(2),
//             avgOilRunningHours: (totalOilRunningHours / assetReports.length).toFixed(2),
//             reportCount: assetReports.length
//         };
//     };

//     const handleAssetChange = (event) => {
//         const assetId = event.target.value;
//         const asset = assets.find(a => a.asset_id === assetId);
//         setSelectedAsset(asset);
//         setSelectedYear('all');
//     };

//     const handleYearChange = (event) => {
//         setSelectedYear(event.target.value);
//     };

//     const formatDate = (dateString) => {
//         if (!dateString) return 'N/A';
//         return new Date(dateString).toLocaleDateString('en-US', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric'
//         });
//     };

//     if (loading) {
//         return (
//             <div style={{
//                 background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
//                 minHeight: '100vh',
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 color: 'white',
//                 fontSize: '20px'
//             }}>
//                 Loading assets...
//             </div>
//         );
//     }

//     const assetComponents = getAssetComponents();
//     const assetReports = getAssetReports();
//     const averages = getAverages();
//     const availableYears = getAvailableYears();

//     const handleAssetView = async (id) => {
//         navigate(`/view-asset?id=${id}`)
//     }

//     return (
//         <div style={{
//             background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
//             minHeight: '100vh',
//             position: 'relative',
//             overflow: 'hidden',
//             paddingTop: '50px'
//         }}>
//             {/* Animated background elements */}
//             <div style={{
//                 position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
//                 background: 'rgba(255, 255, 255, 0.05)', top: '-200px', right: '-200px',
//                 animation: 'float 25s infinite ease-in-out', zIndex: 1
//             }} />
//             <div style={{
//                 position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
//                 background: 'rgba(255, 255, 255, 0.05)', bottom: '-150px', left: '-150px',
//                 animation: 'float 20s infinite ease-in-out reverse', zIndex: 1
//             }} />
//             <div style={{
//                 position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
//                 background: 'rgba(255, 255, 255, 0.03)', top: '50%', left: '20%',
//                 animation: 'float 18s infinite ease-in-out', zIndex: 1
//             }} />



//             {/* Dashboard Header */}
//             <div style={{
//                 position: 'relative',
//                 zIndex: 2,
//             }}>
//                 <div style={{
//                     maxWidth: '1400px',
//                     margin: '0 auto',
//                     padding: '24px 32px',
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     alignItems: 'center',
//                     flexWrap: 'wrap',
//                     gap: '16px'
//                 }}>
//                     <div>
//                         <h1 style={{
//                             fontSize: '2.8rem', fontWeight: '700', color: '#EAB56F',
//                             marginBottom: '8px', letterSpacing: '-0.5px'
//                         }}>
//                             Asset Dashboard
//                         </h1>
//                         <p style={{
//                             color: 'rgba(255, 255, 255, 0.6)',
//                             fontSize: '14px',
//                             margin: '8px 0 0 0'
//                         }}>
//                             Monitor asset performance and analysis reports
//                         </p>
//                     </div>

//                     {/* Asset Selector Card */}
//                     <div style={{
//                         display: 'flex',
//                         gap: '16px',
//                         alignItems: 'flex-end'
//                     }}>
//                         <div>
//                             <label style={{
//                                 color: 'rgba(255, 187, 0, 0.7)',
//                                 fontSize: '12px',
//                                 fontWeight: '500',
//                                 textTransform: 'uppercase',
//                                 letterSpacing: '0.5px',
//                                 display: 'block',
//                                 marginBottom: '6px'
//                             }}>
//                                 Select Asset
//                             </label>
//                             <select
//                                 value={selectedAsset?.asset_id || ''}
//                                 onChange={handleAssetChange}
//                                 style={{
//                                     padding: '10px 32px 10px 16px',
//                                     borderRadius: '8px',
//                                     border: '2px solid rgba(255, 255, 255, 0.2)',
//                                     background: 'rgba(0, 0, 0, 0.4)',
//                                     color: 'white',
//                                     fontSize: '14px',
//                                     cursor: 'pointer',
//                                     minWidth: '240px',
//                                     outline: 'none'
//                                 }}
//                                 onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
//                                 onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
//                             >
//                                 {assets.map(asset => (
//                                     <option key={asset.asset_id} value={asset.asset_id} style={{ background: '#1a2a35' }}>
//                                         {asset.asset_name}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         {selectedAsset && availableYears.length > 0 && (
//                             <div>
//                                 <label style={{
//                                     color: 'rgba(255, 187, 0, 0.7)',
//                                     fontSize: '12px',
//                                     fontWeight: '500',
//                                     textTransform: 'uppercase',
//                                     letterSpacing: '0.5px',
//                                     display: 'block',
//                                     marginBottom: '6px'
//                                 }}>
//                                     Filter by Year
//                                 </label>
//                                 <select
//                                     value={selectedYear}
//                                     onChange={handleYearChange}
//                                     style={{
//                                         padding: '10px 32px 10px 16px',
//                                         borderRadius: '8px',
//                                         border: '2px solid rgba(255, 255, 255, 0.2)',
//                                         background: 'rgba(0, 0, 0, 0.4)',
//                                         color: 'white',
//                                         fontSize: '14px',
//                                         cursor: 'pointer',
//                                         minWidth: '140px',
//                                         outline: 'none'
//                                     }}
//                                     onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
//                                     onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
//                                 >
//                                     <option value="all" style={{ background: '#1a2a35' }}>All Years</option>
//                                     {availableYears.map(year => (
//                                         <option key={year} value={year} style={{ background: '#1a2a35' }}>
//                                             {year}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>

//             {/* Main Dashboard Content */}
//             <div style={{ position: 'relative', zIndex: 2, maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>

//                 {/* KPI Cards Row */}
//                 {selectedAsset && (
//                     <div style={{
//                         display: 'grid',
//                         gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
//                         gap: '24px',
//                         marginBottom: '32px',
//                         animation: 'slideIn 0.4s ease-out'
//                     }}>
//                         {/* Asset Info Card */}
//                         <div style={{
//                             background: 'rgba(9, 255, 0, 0.08)',
//                             backdropFilter: 'blur(12px)',
//                             borderRadius: '16px',
//                             border: '2px solid rgb(4, 105, 1)',
//                             padding: '20px',
//                             transition: 'transform 0.2s, box-shadow 0.2s',
//                             cursor: 'pointer',
//                             position: 'relative'
//                         }}>
//                             {/* Expand Icon - Top Right */}
//                             <div style={{
//                                 position: 'absolute',
//                                 top: '12px',
//                                 right: '12px',
//                                 cursor: 'pointer',
//                                 zIndex: 1
//                             }}>
//                                 <FeatherIcon icon="external-link" color={'#0cc225'} size={18} onClick={() => handleAssetView(selectedAsset.asset_id)} />
//                             </div>

//                             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
//                                 <div style={{
//                                     width: '40px',
//                                     height: '40px',
//                                     borderRadius: '10px',
//                                     background: 'rgba(76, 175, 80, 0.2)',
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center'
//                                 }}>
//                                     <FeatherIcon icon="box" color={'#0cc225'} />
//                                 </div>
//                                 <div>
//                                     <p style={{ color: 'rgba(0, 255, 42, 0.6)', fontSize: '13px', margin: 0 }}>Asset Name</p>
//                                     <p style={{ color: '#9fe2af', fontSize: '18px', fontWeight: '600', margin: 0 }}>{selectedAsset.asset_name}</p>
//                                 </div>
//                             </div>
//                             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
//                                 <div>
//                                     <p style={{ color: 'rgba(0, 255, 42, 0.6)', fontSize: '11px', marginBottom: '4px' }}>CATEGORY</p>
//                                     <p style={{ color: '#9fe2af', fontSize: '13px', margin: 0 }}>{selectedAsset.asset_category || 'N/A'}</p>
//                                 </div>
//                                 <div>
//                                     <p style={{ color: 'rgba(0, 255, 42, 0.6)', fontSize: '11px', marginBottom: '4px' }}>TYPE</p>
//                                     <p style={{ color: '#9fe2af', fontSize: '13px', margin: 0 }}>{selectedAsset.asset_type || 'N/A'}</p>
//                                 </div>
//                                 <div>
//                                     <p style={{ color: 'rgba(0, 255, 42, 0.6)', fontSize: '11px', marginBottom: '4px' }}>LOCATION</p>
//                                     <p style={{ color: '#9fe2af', fontSize: '13px', margin: 0 }}>{selectedAsset.asset_location || 'N/A'}</p>
//                                 </div>
//                                 <div>
//                                     <p style={{ color: 'rgba(0, 255, 42, 0.6)', fontSize: '11px', marginBottom: '4px' }}>COMMISSIONED</p>
//                                     <p style={{ color: '#9fe2af', fontSize: '13px', margin: 0 }}>{selectedAsset.date_commisioning || 'N/A'}</p>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Average Running Hours Cards */}
//                         <div style={{
//                             background: 'rgba(0, 68, 255, 0.08)',
//                             backdropFilter: 'blur(12px)',
//                             borderRadius: '16px',
//                             border: '2px solid rgb(56, 70, 196)',
//                             padding: '20px',
//                             transition: 'transform 0.2s, box-shadow 0.2s'
//                         }}>
//                             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                                 {/* Feather Logo - Left side */}
//                                 <div style={{
//                                     width: '80px',
//                                     height: '80px',
//                                     borderRadius: '10px',
//                                     background: 'rgba(33, 150, 243, 0.2)',
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center'
//                                 }}>
//                                     <FeatherIcon icon="clock" color={'#5779e9'} style={{ width: '40px', height: '40px' }} />
//                                 </div>

//                                 {/* Text Column - Right side, aligned text end */}
//                                 <div style={{ textAlign: 'right' }}>
//                                     <p style={{ color: 'rgb(62, 123, 255)', fontSize: '1rem', margin: 0, fontWeight: '800' }}>
//                                         Avg Asset Running Hours
//                                     </p>
//                                     <p style={{ color: '#2196F3', fontSize: '32px', fontWeight: '800', margin: 0 }}>
//                                         {averages.avgAssetRunningHours}
//                                     </p>
//                                     <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '1rem', margin: 0, marginTop: '55px' }}>
//                                         Based on {averages.reportCount} report{averages.reportCount !== 1 ? 's' : ''}
//                                     </p>
//                                 </div>
//                             </div>


//                         </div>
//                         <div style={{
//                             background: 'rgba(255, 145, 0, 0.19)',
//                             backdropFilter: 'blur(12px)',
//                             borderRadius: '16px',
//                             border: '2px solid rgba(172, 92, 0, 0.77)',
//                             padding: '20px',
//                             transition: 'transform 0.2s, box-shadow 0.2s'
//                         }}>
//                             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                                 {/* Feather Logo - Left side */}
//                                 <div style={{
//                                     width: '80px',
//                                     height: '80px',
//                                     borderRadius: '10px',
//                                     background: 'rgba(255, 152, 0, 0.2)',
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center'
//                                 }}>
//                                     <FeatherIcon icon="droplet" size={20} color={'#ffa835'} style={{ width: '40px', height: '40px' }} />
//                                 </div>

//                                 {/* Text Column - Right side, aligned text end */}
//                                 <div style={{ textAlign: 'right' }}>
//                                     <p style={{ color: 'rgba(255, 172, 47, 0.6)', fontSize: '1rem', margin: 0, fontWeight: '800' }}>
//                                         Avg Oil Running Hours
//                                     </p>
//                                     <p style={{ color: '#FF9800', fontSize: '32px', fontWeight: '800', margin: 0 }}>
//                                         {averages.avgOilRunningHours}
//                                     </p>
//                                     <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '1rem', margin: 0, marginTop: '55px' }}>
//                                         hours since last change
//                                     </p>
//                                 </div>
//                             </div>


//                         </div>
//                     </div>
//                 )}

//                 {/* Two Column Layout for Reports and Components */}
//                 <div style={{
//                     display: 'grid',
//                     gridTemplateColumns: '1fr 1fr',
//                     gap: '32px',
//                     animation: 'slideIn 0.5s ease-out'
//                 }}>
//                     {/* Reports Section */}
//                     {selectedAsset && (
//                         <div style={{
//                             background: 'rgba(255, 255, 255, 0.05)',
//                             backdropFilter: 'blur(12px)',
//                             borderRadius: '16px',
//                             border: '1px solid rgba(255, 255, 255, 0.1)',
//                             overflow: 'hidden'
//                         }}>
//                             <div style={{
//                                 padding: '20px 24px',
//                                 borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
//                                 background: 'rgba(0, 0, 0, 0.2)'
//                             }}>
//                                 <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: 0 }}>
//                                     Analysis Reports
//                                     <span style={{
//                                         marginLeft: '10px',
//                                         background: '#2196F3',
//                                         padding: '2px 8px',
//                                         borderRadius: '20px',
//                                         fontSize: '12px',
//                                         fontWeight: '500'
//                                     }}>
//                                         {assetReports.length}
//                                     </span>
//                                 </h2>
//                             </div>
//                             <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '16px' }}>
//                                 {assetReports.length > 0 ? (
//                                     <div style={{ display: 'grid', gap: '12px' }}>
//                                         {assetReports.map((report) => {
//                                             const componentDetails = getComponentDetails(report.asset_component_id);
//                                             return (
//                                                 <div key={report.asset_analysis_id} style={{
//                                                     background: 'rgba(0, 0, 0, 0.3)',
//                                                     borderRadius: '12px',
//                                                     padding: '16px',
//                                                     borderLeft: `3px solid ${componentDetails ? '#4CAF50' : '#FF9800'}`
//                                                 }}>
//                                                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
//                                                         <div>
//                                                             <p style={{ color: '#4CAF50', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
//                                                                 Report #{report.asset_analysis_id}
//                                                             </p>
//                                                             <p style={{ color: 'white', fontSize: '15px', fontWeight: '500', margin: 0 }}>
//                                                                 {componentDetails?.asset_component_name || 'Unknown Component'}
//                                                             </p>
//                                                         </div>
//                                                         <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', margin: 0 }}>
//                                                             {formatDate(report.analysis_date)}
//                                                         </p>
//                                                     </div>
//                                                     <div style={{ display: 'flex', gap: '24px' }}>
//                                                         <div>
//                                                             <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', marginBottom: '2px' }}>Asset Hours</p>
//                                                             <p style={{ color: 'white', fontSize: '14px', fontWeight: '500', margin: 0 }}>
//                                                                 {report.asset_running_hours || 0} hrs
//                                                             </p>
//                                                         </div>
//                                                         <div>
//                                                             <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', marginBottom: '2px' }}>Oil Hours</p>
//                                                             <p style={{ color: '#FF9800', fontSize: '14px', fontWeight: '500', margin: 0 }}>
//                                                                 {report.oil_running_hours || 0} hrs
//                                                             </p>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             );
//                                         })}
//                                     </div>
//                                 ) : (
//                                     <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255, 255, 255, 0.5)' }}>
//                                         No reports available
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     )}

//                     {/* Components Section */}
//                     {selectedAsset && (
//                         <div style={{
//                             background: 'rgba(255, 255, 255, 0.05)',
//                             backdropFilter: 'blur(12px)',
//                             borderRadius: '16px',
//                             border: '1px solid rgba(255, 255, 255, 0.1)',
//                             overflow: 'hidden'
//                         }}>
//                             <div style={{
//                                 padding: '20px 24px',
//                                 borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
//                                 background: 'rgba(0, 0, 0, 0.2)'
//                             }}>
//                                 <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: 0 }}>
//                                     Components
//                                     <span style={{
//                                         marginLeft: '10px',
//                                         background: '#4CAF50',
//                                         padding: '2px 8px',
//                                         borderRadius: '20px',
//                                         fontSize: '12px',
//                                         fontWeight: '500'
//                                     }}>
//                                         {assetComponents.length}
//                                     </span>
//                                 </h2>
//                             </div>
//                             <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '16px' }}>
//                                 {assetComponents.length > 0 ? (
//                                     <div style={{ display: 'grid', gap: '12px' }}>
//                                         {assetComponents.map((component, index) => (
//                                             <div key={component.asset_component_id} style={{
//                                                 background: 'rgba(0, 0, 0, 0.3)',
//                                                 borderRadius: '12px',
//                                                 padding: '16px'
//                                             }}>
//                                                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
//                                                     <div style={{
//                                                         width: '32px',
//                                                         height: '32px',
//                                                         borderRadius: '8px',
//                                                         background: 'rgba(76, 175, 80, 0.2)',
//                                                         display: 'flex',
//                                                         alignItems: 'center',
//                                                         justifyContent: 'center',
//                                                         fontSize: '14px',
//                                                         fontWeight: '600',
//                                                         color: '#4CAF50'
//                                                     }}>
//                                                         {index + 1}
//                                                     </div>
//                                                     <div>
//                                                         <p style={{ color: 'white', fontSize: '15px', fontWeight: '500', margin: 0 }}>
//                                                             {component.asset_component_name}
//                                                         </p>
//                                                         <p style={{ color: '#4CAF50', fontSize: '11px', margin: '4px 0 0 0' }}>
//                                                             ID: {component.asset_component_id}
//                                                         </p>
//                                                     </div>
//                                                 </div>
//                                                 <div style={{ display: 'flex', gap: '24px', marginLeft: '44px' }}>
//                                                     <div>
//                                                         <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', marginBottom: '2px' }}>Type</p>
//                                                         <p style={{ color: 'white', fontSize: '13px', margin: 0 }}>{component.asset_component_type || 'N/A'}</p>
//                                                     </div>
//                                                     <div>
//                                                         <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', marginBottom: '2px' }}>Created</p>
//                                                         <p style={{ color: 'white', fontSize: '13px', margin: 0 }}>
//                                                             {new Date(component.created_at).toLocaleDateString()}
//                                                         </p>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 ) : (
//                                     <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255, 255, 255, 0.5)' }}>
//                                         No components found
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             <style>
//                 {`
//                     @keyframes float {
//                         0%, 100% { transform: translate(0, 0) rotate(0deg); }
//                         33% { transform: translate(50px, -50px) rotate(120deg); }
//                         66% { transform: translate(-30px, 30px) rotate(240deg); }
//                     }
//                     @keyframes pulse {
//                         0%, 100% { opacity: 0.6; }
//                         50% { opacity: 1; }
//                     }
//                     @keyframes slideIn {
//                         from { opacity: 0; transform: translateY(20px); }
//                         to { opacity: 1; transform: translateY(0); }
//                     }

//                 `}
//             </style>
//         </div>
//     );
// }


import { useEffect, useState, useCallback } from "react";
import axios from 'axios';
import config from 'config';
import FeatherIcon from "feather-icons-react";
import { useNavigate } from 'react-router';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

import water from "assets/images/water.png";
import gear from "assets/images/gear-box1.png";
import lab from "assets/images/lab.png";

// Constants
const COLORS = {
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

const CHART_COLORS = [
    '#E37239', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B',
    '#06B6D4', '#84CC16', '#EF4444', '#6366F1', '#14B8A6', '#D946EF',
    '#F97316', '#8B5CF6', '#22C55E', '#EAB308'
];

// Parameter definitions
const wearMetalsParams = {
    rotating: [
        { label: "Iron", key: "iron", unit: "ppm" },
        { label: "Chrome", key: "chrome", unit: "ppm" },
        { label: "Nickel", key: "nickel", unit: "ppm" },
        { label: "Aluminium", key: "aluminium", unit: "ppm" },
        { label: "Lead", key: "lead", unit: "ppm" },
        { label: "Copper", key: "copper", unit: "ppm" },
        { label: "Tin", key: "tin", unit: "ppm" },
        { label: "Titanium", key: "titanium", unit: "ppm" },
        { label: "Silver", key: "silver", unit: "ppm" },
        { label: "Antimony", key: "antimony", unit: "ppm" },
        { label: "Cadmium", key: "cadmium", unit: "ppm" },
        { label: "Manganese", key: "manganese", unit: "ppm" },
        { label: "Fatigue >20um", key: "fatigue_gt_20um", unit: "count" },
        { label: "Non-Metallic >20um", key: "non_metallic_gt_20um", unit: "count" },
        { label: "Large Fe", key: "large_fe", unit: "%" },
        { label: "Fe Wear Severity Index", key: "fe_wear_severity_index", unit: "index" },
        { label: "Total Fe <100u", key: "total_fe_lt_100um", unit: "ppm" }
    ],
    stationaryMobile: [
        { label: "Iron", key: "iron", unit: "ppm" },
        { label: "Chrome", key: "chrome", unit: "ppm" },
        { label: "Nickel", key: "nickel", unit: "ppm" },
        { label: "Aluminium", key: "aluminium", unit: "ppm" },
        { label: "Lead", key: "lead", unit: "ppm" },
        { label: "Copper", key: "copper", unit: "ppm" },
        { label: "Tin", key: "tin", unit: "ppm" },
        { label: "Titanium", key: "titanium", unit: "ppm" },
        { label: "Silver", key: "silver", unit: "ppm" },
        { label: "Antimony", key: "antimony", unit: "ppm" },
        { label: "Cadmium", key: "cadmium", unit: "ppm" },
        { label: "Manganese", key: "manganese", unit: "ppm" }
    ]
};

const contaminantsParams = {
    rotating: [
        { label: "Silicon", key: "silicon", unit: "ppm" },
        { label: "Sodium", key: "sodium", unit: "ppm" },
        { label: "Vanadium", key: "vanadium", unit: "ppm" },
        { label: "Potassium", key: "potassium", unit: "ppm" },
        { label: "Lithium", key: "lithium", unit: "ppm" },
        { label: "ISO 4406 (>4μm)", key: "iso_4406_code_gt4um" },
        { label: "ISO 4406 (>6μm)", key: "iso_4406_code_gt6um" },
        { label: "ISO 4406 (>14μm)", key: "iso_4406_code_gt14um" },
        { label: "Cnts >4", key: "cnts_gt4", unit: "particles/ml" },
        { label: "Cnts >6", key: "cnts_gt6", unit: "particles/ml" },
        { label: "Cnts >14", key: "cnts_gt14", unit: "particles/ml" },
        { label: "Particles 5-15um", key: "particles_5_15um", unit: "particles/100" },
        { label: "Particles 15-25um", key: "particles_15_25um", unit: "particles/100" },
        { label: "Particles 25-50um", key: "particles_25_50um", unit: "particles/100" },
        { label: "Particles 50-100um", key: "particles_50_100um", unit: "particles/100" },
        { label: "Particles >100um", key: "particles_gt100um", unit: "particles/100" },
        { label: "Cutting >20um", key: "cutting_gt_20um", unit: "particles/ml" },
        { label: "Sliding >20um", key: "sliding_gt_20um", unit: "particles/ml" },
        { label: "Total Water", key: "total_water", unit: "%" },
        { label: "Bubbles", key: "bubbles" },
        { label: "Water", key: "water", unit: "%" },
        { label: "Large Fe", key: "large_fe_percent", unit: "%" }
    ],
    stationary: [
        { label: "Silicon", key: "silicon", unit: "ppm" },
        { label: "Sodium", key: "sodium", unit: "ppm" },
        { label: "Vanadium", key: "vanadium", unit: "ppm" },
        { label: "Potassium", key: "potassium", unit: "ppm" },
        { label: "Lithium", key: "lithium", unit: "ppm" },
        { label: "Glycol %", key: "glycol_percent", unit: "%" },
        { label: "Bubbles", key: "bubbles" },
        { label: "Antiwear", key: "antiwear_percent", unit: "%" },
        { label: "Water", key: "water", unit: "ppm" },
        { label: "Soot %", key: "soot_percent", unit: "%" },
        { label: "Biodiesel Fuel Dilution", key: "biodiesel_fuel_dilution", unit: "wt%" }
    ],
    mobile: [
        { label: "Silicon", key: "silicon", unit: "ppm" },
        { label: "Sodium", key: "sodium", unit: "ppm" },
        { label: "Vanadium", key: "vanadium", unit: "ppm" },
        { label: "Potassium", key: "potassium", unit: "ppm" },
        { label: "Lithium", key: "lithium", unit: "ppm" },
        { label: "Glycol %", key: "glycol_percent", unit: "%" },
        { label: "Bubbles", key: "bubbles" },
        { label: "Water", key: "water", unit: "%" },
        { label: "Soot %", key: "soot_percent", unit: "%" },
        { label: "Biodiesel Fuel Dilution", key: "biodiesel_fuel_dilution", unit: "wt%" }
    ]
};

const chemistryParams = {
    common: [
        { label: "Molybdenum", key: "molybdenum", unit: "ppm" },
        { label: "Calcium", key: "calcium", unit: "ppm" },
        { label: "Magnesium", key: "magnesium", unit: "ppm" },
        { label: "Phosphorus", key: "phosphorus", unit: "ppm" },
        { label: "Zinc", key: "zinc", unit: "ppm" },
        { label: "Barium", key: "barium", unit: "ppm" },
        { label: "Boron", key: "boron", unit: "ppm" },
        { label: "Viscosity 40°C", key: "viscosity_at_40c", unit: "cSt" },
        { label: "Viscosity 100°C", key: "viscosity_at_100c", unit: "cSt" },
        { label: "Oxidation", key: "oxidation", unit: "abs/0.1mm" },
        { label: "Fluid Integrity", key: "fluid_integrity" }
    ],
    rotating: [{ label: "TAN", key: "tan", unit: "mg KOH/g" }],
    stationaryMobile: [
        { label: "TBN", key: "tbn", unit: "mg KOH/g" },
        { label: "Nitration", key: "nitration", unit: "abs/cm" },
        { label: "Sulfation", key: "sulfation", unit: "abs/0.1mm" }
    ],
    mobile: [{ label: "Antiwear", key: "antiwear_percent", unit: '%' }]
};

export default function AssetDashboard() {
    const [assets, setAssets] = useState([]);
    const [components, setComponents] = useState([]);
    const [allReports, setAllReports] = useState([]); // Store all reports
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState('all');
    const [activeTab, setActiveTab] = useState('overview');
    const [rotating, setRotating] = useState(false);
    const [mobile, setMobile] = useState(false);
    const [stationary, setStationary] = useState(false);
    const [hiddenWearMetals, setHiddenWearMetals] = useState(new Set());
    const [hiddenContaminants, setHiddenContaminants] = useState(new Set());
    const [hiddenChemistry, setHiddenChemistry] = useState(new Set());
    const [wearMetalsFilter, setWearMetalsFilter] = useState('all');
    const [contaminantsFilter, setContaminantsFilter] = useState('all');
    const [chemistryFilter, setChemistryFilter] = useState('all');
    const [overviewCategory, setOverviewCategory] = useState('wear-metals');
    const [modalData, setModalData] = useState(null);
    const [historicalReports, setHistoricalReports] = useState([]);
    const [filteredHistoricalReports, setFilteredHistoricalReports] = useState([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const navigate = useNavigate();

    const clampNumber = useCallback((min, max) => {
        if (typeof window !== 'undefined') {
            const width = window.innerWidth;
            if (width < 576) return min;
            if (width > 768) return max;
            return min + (max - min) * ((width - 576) / 192);
        }
        return min;
    }, []);

    // Fetch all data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const assetsRes = await axios.get(`${config.baseApi}/assets/get-all-assets`);
                const assetsData = assetsRes.data || [];
                const assetsWithComponents = assetsData.filter(asset => asset.has_components === '1');
                setAssets(assetsWithComponents);
                const componentsRes = await axios.get(`${config.baseApi}/assets/get-all-components`);
                const componentsData = componentsRes.data || [];
                setComponents(componentsData);
                const reportRes = await axios.get(`${config.baseApi}/assetsAnalysis/get-all-submitted-assets`);
                const reportData = reportRes.data || [];
                setAllReports(reportData);
                if (assetsWithComponents.length > 0) {
                    setSelectedAsset(assetsWithComponents[0]);
                }
            } catch (err) {
                console.error('Unable to fetch asset data', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Set trivector based on selected asset
    useEffect(() => {
        if (selectedAsset?.trivector === 'rotating-machine') {
            setRotating(true);
            setStationary(false);
            setMobile(false);
        } else if (selectedAsset?.trivector === 'stationary-engine') {
            setStationary(true);
            setRotating(false);
            setMobile(false);
        } else if (selectedAsset?.trivector === 'mobile-engine') {
            setMobile(true);
            setRotating(false);
            setStationary(false);
        }
    }, [selectedAsset]);

    // Update historical reports when selected asset OR selected year changes
    useEffect(() => {
        if (!selectedAsset || allReports.length === 0) return;

        // First filter by asset
        let assetReports = allReports.filter(report => report.asset_id === selectedAsset.asset_id);

        // Then filter by year if not 'all'
        if (selectedYear !== 'all') {
            assetReports = assetReports.filter(report => {
                if (!report.analysis_date) return false;
                const reportYear = new Date(report.analysis_date).getFullYear();
                return reportYear === parseInt(selectedYear);
            });
        }

        // Sort by analysis date (oldest first for charts)
        const sortedReports = [...assetReports].sort((a, b) => new Date(a.analysis_date) - new Date(b.analysis_date));
        setHistoricalReports(sortedReports);
        setFilteredHistoricalReports(sortedReports);

        if (sortedReports.length > 0) {
            const firstDate = new Date(sortedReports[0].analysis_date);
            const lastDate = new Date(sortedReports[sortedReports.length - 1].analysis_date);
            setFromDate(firstDate.toISOString().split('T')[0]);
            setToDate(lastDate.toISOString().split('T')[0]);
            // Select the most recent report for current values
            setSelectedReport(sortedReports[sortedReports.length - 1]);
        } else {
            setSelectedReport(null);
        }
    }, [selectedAsset, allReports, selectedYear]);

    // Filter historical reports by date range (additional filter)
    useEffect(() => {
        if (historicalReports.length === 0) return;
        let filtered = [...historicalReports];
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
        setFilteredHistoricalReports(filtered);
    }, [fromDate, toDate, historicalReports]);

    const getAvailableYears = () => {
        if (!selectedAsset) return [];
        const assetReports = allReports.filter(report => report.asset_id === selectedAsset.asset_id);
        const years = new Set();
        assetReports.forEach(report => {
            if (report.analysis_date) {
                const year = new Date(report.analysis_date).getFullYear();
                years.add(year);
            }
        });
        return Array.from(years).sort((a, b) => b - a);
    };

    const getAssetComponents = () => {
        if (!selectedAsset) return [];
        return components.filter(component => component.asset_id === selectedAsset.asset_id);
    };

    const getAssetReports = () => {
        if (!selectedAsset) return [];
        let filteredReports = allReports.filter(report => report.asset_id === selectedAsset.asset_id);
        if (selectedYear !== 'all') {
            filteredReports = filteredReports.filter(report => {
                if (!report.analysis_date) return false;
                const reportYear = new Date(report.analysis_date).getFullYear();
                return reportYear === parseInt(selectedYear);
            });
        }
        return filteredReports.sort((a, b) => new Date(b.analysis_date) - new Date(a.analysis_date));
    };

    const getComponentDetails = (componentId) => {
        return components.find(component => component.asset_component_id === componentId);
    };

    const getAverages = () => {
        const assetReports = getAssetReports();
        if (assetReports.length === 0) {
            return { avgAssetRunningHours: 0, avgOilRunningHours: 0, reportCount: 0 };
        }
        const totalAssetRunningHours = assetReports.reduce((sum, report) => sum + (parseFloat(report.asset_running_hours) || 0), 0);
        const totalOilRunningHours = assetReports.reduce((sum, report) => sum + (parseFloat(report.oil_running_hours) || 0), 0);
        return {
            avgAssetRunningHours: (totalAssetRunningHours / assetReports.length).toFixed(2),
            avgOilRunningHours: (totalOilRunningHours / assetReports.length).toFixed(2),
            reportCount: assetReports.length
        };
    };

    // Chart data functions - using filteredHistoricalReports (already filtered by year and date range)
    const getChartData = useCallback((parameterKey) => {
        if (filteredHistoricalReports.length <= 1) return [];
        const hasData = filteredHistoricalReports.some(item =>
            item[parameterKey] !== null && item[parameterKey] !== undefined && item[parameterKey] !== ''
        );
        if (!hasData) return [];

        return filteredHistoricalReports.map(item => ({
            date: new Date(item.analysis_date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            }),
            value: item[parameterKey] || 0,
            fullDate: new Date(item.analysis_date)
        })).sort((a, b) => a.fullDate - b.fullDate);
    }, [filteredHistoricalReports]);

    const getMultiLineChartData = useCallback((parametersList) => {
        if (filteredHistoricalReports.length <= 1) return [];
        const validParams = parametersList.filter(param =>
            filteredHistoricalReports.some(item =>
                item[param.key] !== null && item[param.key] !== undefined && item[param.key] !== ''
            )
        );
        if (validParams.length === 0) return [];

        const sortedData = [...filteredHistoricalReports].sort((a, b) =>
            new Date(a.analysis_date) - new Date(b.analysis_date)
        );

        return sortedData.map(item => {
            const dataPoint = {
                date: new Date(item.analysis_date).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                }),
                fullDate: new Date(item.analysis_date)
            };
            validParams.forEach(param => {
                const value = item[param.key];
                if (value !== null && value !== undefined && value !== '') {
                    dataPoint[param.key] = typeof value === 'number' ? value : parseFloat(value) || 0;
                } else {
                    dataPoint[param.key] = null;
                }
            });
            return dataPoint;
        });
    }, [filteredHistoricalReports]);

    // Parameter filtering functions
    const getCurrentWearMetals = useCallback(() => {
        let allParams = rotating ? wearMetalsParams.rotating : wearMetalsParams.stationaryMobile;
        if (wearMetalsFilter === 'all') return allParams;
        return allParams.filter(param => param.label.toLowerCase() === wearMetalsFilter.toLowerCase());
    }, [rotating, wearMetalsFilter]);

    const getCurrentContaminants = useCallback(() => {
        let allParams = [];
        if (rotating) allParams = contaminantsParams.rotating;
        else if (stationary) allParams = contaminantsParams.stationary;
        else if (mobile) allParams = contaminantsParams.mobile;

        if (contaminantsFilter === 'all') return allParams;
        return allParams.filter(param => param.label.toLowerCase() === contaminantsFilter.toLowerCase());
    }, [rotating, stationary, mobile, contaminantsFilter]);

    const getCurrentChemistry = useCallback(() => {
        let allParams = [...chemistryParams.common];
        if (rotating) allParams = [...allParams, ...chemistryParams.rotating];
        else if (stationary || mobile) allParams = [...allParams, ...chemistryParams.stationaryMobile];
        if (mobile) allParams = [...allParams, ...chemistryParams.mobile];

        if (chemistryFilter === 'all') return allParams;
        return allParams.filter(param => param.label.toLowerCase() === chemistryFilter.toLowerCase());
    }, [rotating, stationary, mobile, chemistryFilter]);

    const getAllWearMetals = useCallback(() => {
        return rotating ? wearMetalsParams.rotating : wearMetalsParams.stationaryMobile;
    }, [rotating]);

    const getAllContaminants = useCallback(() => {
        if (rotating) return contaminantsParams.rotating;
        if (stationary) return contaminantsParams.stationary;
        if (mobile) return contaminantsParams.mobile;
        return [];
    }, [rotating, stationary, mobile]);

    const getAllChemistry = useCallback(() => {
        let allParams = [...chemistryParams.common];
        if (rotating) allParams = [...allParams, ...chemistryParams.rotating];
        else if (stationary || mobile) allParams = [...allParams, ...chemistryParams.stationaryMobile];
        if (mobile) allParams = [...allParams, ...chemistryParams.mobile];
        return allParams;
    }, [rotating, stationary, mobile]);

    const getFilterOptions = useCallback(() => {
        if (activeTab === 'wear-metals') {
            const allParams = rotating ? wearMetalsParams.rotating : wearMetalsParams.stationaryMobile;
            return allParams.map(param => ({
                value: param.label.toLowerCase(),
                label: param.label
            }));
        } else if (activeTab === 'contaminants') {
            let allParams = [];
            if (rotating) allParams = contaminantsParams.rotating;
            else if (stationary) allParams = contaminantsParams.stationary;
            else if (mobile) allParams = contaminantsParams.mobile;
            return allParams.map(param => ({
                value: param.label.toLowerCase(),
                label: param.label
            }));
        } else if (activeTab === 'chemistry') {
            let allParams = [...chemistryParams.common];
            if (rotating) allParams = [...allParams, ...chemistryParams.rotating];
            else if (stationary || mobile) allParams = [...allParams, ...chemistryParams.stationaryMobile];
            if (mobile) allParams = [...allParams, ...chemistryParams.mobile];
            return allParams.map(param => ({
                value: param.label.toLowerCase(),
                label: param.label
            }));
        }
        return [];
    }, [activeTab, rotating, stationary, mobile]);

    const toggleWearMetalsVisibility = useCallback((parameterKey) => {
        setHiddenWearMetals(prev => {
            const newSet = new Set(prev);
            if (newSet.has(parameterKey)) {
                newSet.delete(parameterKey);
            } else {
                newSet.add(parameterKey);
            }
            return newSet;
        });
    }, []);

    const toggleContaminantsVisibility = useCallback((parameterKey) => {
        setHiddenContaminants(prev => {
            const newSet = new Set(prev);
            if (newSet.has(parameterKey)) {
                newSet.delete(parameterKey);
            } else {
                newSet.add(parameterKey);
            }
            return newSet;
        });
    }, []);

    const toggleChemistryVisibility = useCallback((parameterKey) => {
        setHiddenChemistry(prev => {
            const newSet = new Set(prev);
            if (newSet.has(parameterKey)) {
                newSet.delete(parameterKey);
            } else {
                newSet.add(parameterKey);
            }
            return newSet;
        });
    }, []);

    const handleAssetChange = (event) => {
        const assetId = event.target.value;
        const asset = assets.find(a => a.asset_id === assetId);
        setSelectedAsset(asset);
        setSelectedYear('all');
        setActiveTab('overview');
        setWearMetalsFilter('all');
        setContaminantsFilter('all');
        setChemistryFilter('all');
        setOverviewCategory('all');
        // Reset date filters
        setFromDate('');
        setToDate('');
    };

    const handleReportChange = (event) => {
        const reportId = parseInt(event.target.value);
        const report = getAssetReports().find(r => r.asset_analysis_id === reportId);
        setSelectedReport(report);
    };

    const handleYearChange = (event) => {
        const newYear = event.target.value;
        setSelectedYear(newYear);
        // Reset date filters when year changes
        setFromDate('');
        setToDate('');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // MetricTile with chart
    const MetricTile = ({ label, value, unit, parameterKey }) => {
        const chartData = getChartData(parameterKey);
        const showChart = chartData.length > 1;

        return (
            <div style={{ cursor: showChart ? 'pointer' : 'default' }}
                onClick={() => showChart && setModalData({ label, unit, data: chartData, parameterKey })}>
                <div style={{
                    background: 'linear-gradient(135deg, #ffd698 0%, #ffb347 100%)',
                    borderRadius: showChart ? '16px 16px 0px 0px' : '16px',
                    padding: 'clamp(12px, 3vw, 16px)',
                    transition: 'all 0.2s ease',
                    border: `1.5px solid #6e6e6e`,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}>
                    <div style={{
                        fontSize: 'clamp(10px, 2.5vw, 12px)',
                        color: '#303030',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: '600',
                        wordBreak: 'break-word'
                    }}>
                        {label}
                    </div>
                    <div style={{
                        fontSize: 'clamp(18px, 4vw, 24px)',
                        fontWeight: 'bold',
                        color: COLORS.dark,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'baseline',
                        gap: '10px',
                        flexWrap: 'wrap'
                    }}>
                        <span>{value !== null && value !== undefined ? value : '—'}</span>
                        {unit && (
                            <span style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: COLORS.gray }}>
                                {unit}
                            </span>
                        )}
                    </div>
                </div>
                {showChart && (
                    <div style={{
                        padding: 'clamp(8px, 2vw, 12px)',
                        background: '#fff2d6',
                        borderRadius: '0px 0px 12px 12px',
                        border: `1.5px solid #6e6e6e`,
                        borderTop: 'none'
                    }}>
                        <div style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: COLORS.gray, marginBottom: '8px' }}>
                            Historical Trend (Last {chartData.length} records) - Click to enlarge
                        </div>
                        <div style={{ height: 'clamp(150px, 25vw, 200px)', width: '100%' }}>
                            <ResponsiveContainer>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}30`} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: clampNumber(8, 10) }}
                                        interval="preserveStartEnd"
                                        angle={-25}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis
                                        tick={{ fontSize: clampNumber(8, 10) }}
                                        label={{ value: unit || 'ppm', angle: -90, position: 'insideLeft', fontSize: clampNumber(8, 10) }}
                                    />
                                    <Tooltip formatter={(value) => [`${value} ${unit || ''}`, label]} labelFormatter={(label) => `Date: ${label}`} />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke={COLORS.accent}
                                        strokeWidth={2}
                                        dot={{ fill: COLORS.accent, r: clampNumber(2, 3) }}
                                        activeDot={{ r: clampNumber(4, 5) }}
                                        name={label}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const SectionTitle = ({ title, icon, count, titleColor }) => (
        <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div style={{ width: 'clamp(32px, 6vw, 40px)', height: 'clamp(32px, 6vw, 40px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* <FeatherIcon icon={icon} size={25} color={titleColor} style={{ boxShadow: `0 2px 5px ${titleColor}` }} /> */}
                    <img src={icon} width='25px' alt={title} />
                </div>
                <h3 style={{ margin: 0, fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 'bold', color: titleColor || '#d19547', textShadow: `0 2px 12px ${titleColor}` }}>
                    {title}
                </h3>
                {count && <span style={{ background: '#f5f5f5', color: '#171C2D', padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>{count} metrics</span>}
            </div>
        </div>
    );

    // OverviewMultiChart component
    const OverviewMultiChart = ({ title, icon, parameters, unit = "ppm", yAxisLabel, hiddenSet, onToggle, titleColor, stroke }) => {
        const chartData = getMultiLineChartData(parameters);
        const hasData = chartData.length > 0;

        const renderLegend = ({ payload }) => (
            <ul style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 16px', padding: '10px 0 0 0', margin: 0, listStyle: 'none' }}>
                {payload.map((entry) => {
                    const isHidden = hiddenSet.has(entry.dataKey);
                    return (
                        <li key={`item-${entry.dataKey}`} onClick={() => onToggle(entry.dataKey)} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px',
                            padding: '4px 8px', borderRadius: '4px', transition: 'all 0.2s ease', opacity: isHidden ? 0.6 : 1,
                            textDecoration: isHidden ? 'line-through' : 'none', backgroundColor: isHidden ? '#f5f5f5' : 'transparent'
                        }}>
                            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', backgroundColor: entry.color }} />
                            <span style={{ color: COLORS.dark }}>{entry.value}</span>
                        </li>
                    );
                })}
            </ul>
        );

        if (!hasData) {
            return (
                <div style={{ marginBottom: '32px' }}>
                    <SectionTitle title={title} icon={icon} count={parameters.length.toString()} titleColor={titleColor} />
                    <div style={{ background: '#fff2d6', borderRadius: '16px', padding: '40px', textAlign: 'center', border: `1.5px solid #6e6e6e`, color: COLORS.gray }}>
                        No historical data available for {title.toLowerCase()} parameters
                    </div>
                </div>
            );
        }

        return (
            <div style={{ marginBottom: '40px' }}>
                <SectionTitle titleColor={titleColor} title={title} icon={icon} count={parameters.length.toString()} />
                <div style={{ background: '#fff2d6', borderRadius: '16px', padding: '20px', border: `1.5px solid #6e6e6e` }}>
                    <div style={{ height: '450px', width: '100%' }}>
                        <ResponsiveContainer>
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}30`} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11 }}
                                    interval="preserveStartEnd"
                                    angle={-25}
                                    textAnchor="end"
                                    height={70}
                                />
                                <YAxis
                                    tick={{ fontSize: 11 }}
                                    label={{ value: yAxisLabel || unit, angle: -90, position: 'insideLeft', fontSize: 11 }}
                                />
                                <Tooltip
                                    formatter={(value, name) => {
                                        const param = parameters.find(p => p.key === name);
                                        return [`${value} ${param?.unit || unit}`, param?.label || name];
                                    }}
                                    labelFormatter={(label) => `Date: ${label}`}
                                />
                                <Legend content={renderLegend} verticalAlign="bottom" height={80} />
                                {parameters.map((param, index) => {
                                    const hasParamData = filteredHistoricalReports.some(item =>
                                        item[param.key] !== null && item[param.key] !== undefined && item[param.key] !== ''
                                    );
                                    if (!hasParamData) return null;
                                    return (
                                        <Line
                                            key={param.key}
                                            type="monotone"
                                            dataKey={param.key}
                                            stroke={CHART_COLORS[index % CHART_COLORS.length]}
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                            activeDot={{ r: 5 }}
                                            name={param.label}
                                            connectNulls={true}
                                            hide={hiddenSet.has(param.key)}
                                        />
                                    );
                                })}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ padding: '8px', backgroundColor: `${COLORS.primary}10`, borderRadius: '8px', fontSize: '12px', color: COLORS.gray, textAlign: 'center' }}>
                        <FeatherIcon icon="info" size={14} color={COLORS.accent} style={{ marginRight: '6px' }} />
                        Click on any parameter in the legend to show/hide it on the chart
                    </div>
                </div>
            </div>
        );
    };

    const FilterAndDateRow = () => {
        const showFilters = historicalReports.length > 1;
        const showParameterFilter = activeTab !== 'overview';
        const filterOptions = getFilterOptions();

        if (!showFilters) return null;

        return (
            <div style={{
                background: 'rgba(0, 0, 0, 0.16)',
                borderRadius: '0px 0px 16px 16px',
                padding: 'clamp(12px, 3vw, 16px)',
                marginBottom: '24px',
                border: `2px solid ${COLORS.primary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '15px'
            }}>
                {showParameterFilter && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <FeatherIcon icon="filter" size={clampNumber(14, 18)} color={COLORS.accent} />
                        <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: '600', color: 'white' }}>Filter by Parameter:</span>
                        <select
                            value={activeTab === 'wear-metals' ? wearMetalsFilter : activeTab === 'contaminants' ? contaminantsFilter : chemistryFilter}
                            onChange={(e) => {
                                if (activeTab === 'wear-metals') setWearMetalsFilter(e.target.value);
                                else if (activeTab === 'contaminants') setContaminantsFilter(e.target.value);
                                else setChemistryFilter(e.target.value);
                            }}
                            style={{ width: 'clamp(160px, 30vw, 200px)', borderRadius: '8px', border: `2px solid ${COLORS.primary}`, fontSize: 'clamp(12px, 2.5vw, 14px)', cursor: 'pointer', padding: '8px' }}
                        >
                            <option value="all">All Parameters</option>
                            {filterOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                {!showParameterFilter && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <FeatherIcon icon="grid" size={clampNumber(14, 18)} color={COLORS.accent} />
                        <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: '600', color: 'white' }}>Show Categories:</span>
                        <select value={overviewCategory} onChange={(e) => setOverviewCategory(e.target.value)} style={{ width: 'clamp(160px, 30vw, 200px)', borderRadius: '8px', border: `2px solid ${COLORS.primary}40`, fontSize: 'clamp(11px, 2vw, 13px)', cursor: 'pointer', padding: '8px' }} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}>
                            <option value="all">All</option>
                            <option value="wear-metals">Wear Metals</option>
                            <option value="contaminants">Contaminants</option>
                            <option value="chemistry">Chemistry</option>
                        </select>
                    </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FeatherIcon icon="calendar" size={clampNumber(14, 18)} color={COLORS.accent} />
                        <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: '600', color: 'white' }}>Date Range:</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: 'white' }}>From:</span>
                        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ width: 'clamp(120px, 25vw, 150px)', borderRadius: '8px', border: `2px solid ${COLORS.primary}40`, fontSize: 'clamp(11px, 2vw, 13px)', padding: '6px' }} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: 'white' }}>To:</span>
                        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ width: 'clamp(120px, 25vw, 150px)', borderRadius: '8px', border: `2px solid ${COLORS.primary}40`, fontSize: 'clamp(11px, 2vw, 13px)', padding: '6px' }} onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                            onBlur={(e) => e.target.style.borderColor = '#E2E8F0'} />
                    </div>
                    <button onClick={() => {
                        if (historicalReports.length > 0) {
                            const firstDate = new Date(historicalReports[0].analysis_date);
                            const lastDate = new Date(historicalReports[historicalReports.length - 1].analysis_date);
                            setFromDate(firstDate.toISOString().split('T')[0]);
                            setToDate(lastDate.toISOString().split('T')[0]);
                        }
                    }}
                        style={{
                            background: 'linear-gradient(135deg, #cf7500, #F9982F)',
                            border: 'none', borderRadius: '12px', padding: '5px 18px',
                            fontSize: '0.80rem', fontWeight: '600', color: '#fff',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            gap: '10px', boxShadow: '0 4px 15px rgba(233, 150, 40, 0.3)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(233, 150, 40, 0.4)'; }}
                        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(233, 150, 40, 0.3)'; }}                    >
                        Reset Dates
                    </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: `${COLORS.primary}10`, borderRadius: '20px' }}>
                    <FeatherIcon icon="bar-chart-2" size={clampNumber(12, 14)} color={COLORS.accent} />
                    <span style={{ fontSize: 'clamp(10px, 2vw, 12px)', fontWeight: '500', color: 'white' }}>{filteredHistoricalReports.length} / {historicalReports.length} records</span>
                </div>
            </div>
        );
    };

    const EnlargedChartModal = () => {
        if (!modalData) return null;
        return (
            <div onClick={() => setModalData(null)} style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', zIndex: 9999, animation: 'modalFadeIn 0.3s ease-out', padding: '20px'
            }}>
                <div onClick={(e) => e.stopPropagation()} style={{
                    background: 'linear-gradient(180deg, #ffffff 0%, #fff7db 100%)',
                    borderRadius: '20px', width: '90%', maxWidth: '1200px', maxHeight: '90vh',
                    overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: `3px solid #ffbb00`
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #ffd698 0%, #ffb347 100%)',
                        padding: 'clamp(12px, 3vw, 16px)', borderBottom: `1px solid ${COLORS.light}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'
                    }}>
                        <div>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: '5px', alignItems: 'center' }}>
                                <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 20px)', margin: 0, color: '#252525', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{modalData.label}</h3>
                                <h3 style={{ margin: 0, color: COLORS.dark, fontSize: 'clamp(20px, 2.5vw, 20px)' }}>- Historical Trend</h3>
                            </div>
                            <p style={{ margin: '5px 0 0', color: COLORS.gray, fontSize: '14px' }}>Showing trend over {modalData.data.length} records</p>
                        </div>
                        <button onClick={() => setModalData(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'all 0.2s ease' }}>
                            <FeatherIcon icon="x" size={24} color={COLORS.dark} />
                        </button>
                    </div>
                    <div style={{ padding: '30px', height: '500px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={modalData.data}>
                                <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}30`} />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" angle={-25} textAnchor="end" height={70} />
                                <YAxis tick={{ fontSize: 12 }} label={{ value: modalData.unit || 'ppm', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                                <Tooltip formatter={(value) => [`${value} ${modalData.unit || ''}`, modalData.label]} labelFormatter={(label) => `Date: ${label}`} />
                                <Line type="monotone" dataKey="value" stroke={COLORS.accent} strokeWidth={3} dot={{ fill: COLORS.accent, r: 4 }} activeDot={{ r: 6 }} name={modalData.label} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const handleAssetView = async (id) => {
        navigate(`/view-asset?id=${id}`);
    };

    const handleSubmittedAssetView = async (id) => {
        navigate(`/view-submitted-asset?id=${id}`);
    };

    if (loading) {
        return (
            <div style={{
                background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                fontSize: '20px'
            }}>
                Loading assets...
            </div>
        );
    }

    const assetComponents = getAssetComponents();
    const assetReports = getAssetReports();
    const averages = getAverages();
    const availableYears = getAvailableYears();

    return (
        <div style={{
            background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
            minHeight: '100vh',
            position: 'relative',
            overflow: 'hidden',
            paddingTop: '50px'
        }}>
            {/* Animated background elements */}
            <div style={{
                position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)', top: '-200px', right: '-200px',
                animation: 'float 25s infinite ease-in-out', zIndex: 1
            }} />
            <div style={{
                position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)', bottom: '-150px', left: '-150px',
                animation: 'float 20s infinite ease-in-out reverse', zIndex: 1
            }} />
            <div style={{
                position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.03)', top: '50%', left: '20%',
                animation: 'float 18s infinite ease-in-out', zIndex: 1
            }} />

            {/* Dashboard Header */}
            <div style={{ position: 'relative', zIndex: 2, maxWidth: '2000px', }}>
                <div style={{

                    margin: '0 auto',
                    padding: '24px 32px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '2.8rem', fontWeight: '700', color: '#EAB56F',
                            marginBottom: '8px', letterSpacing: '-0.5px'
                        }}>
                            Asset Dashboard
                        </h1>
                        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', margin: '8px 0 0 0' }}>
                            Monitor asset performance and analysis reports
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                        <div>
                            <label style={{ color: 'rgba(255, 187, 0, 0.7)', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                                Select Asset
                            </label>
                            <select
                                value={selectedAsset?.asset_id || ''}
                                onChange={handleAssetChange}
                                style={{
                                    padding: '10px 32px 10px 16px',
                                    borderRadius: '8px',
                                    border: '2px solid rgba(255, 255, 255, 0.2)',
                                    background: 'rgba(0, 0, 0, 0.4)',
                                    color: 'white',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    minWidth: '240px',
                                    outline: 'none'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                            >
                                {assets.map(asset => (
                                    <option key={asset.asset_id} value={asset.asset_id} style={{ background: '#1a2a35' }}>
                                        {asset.asset_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedAsset && availableYears.length > 0 && (
                            <div>
                                <label style={{ color: 'rgba(255, 187, 0, 0.7)', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                                    Filter by Year
                                </label>
                                <select
                                    value={selectedYear}
                                    onChange={handleYearChange}
                                    style={{
                                        padding: '10px 32px 10px 16px',
                                        borderRadius: '8px',
                                        border: '2px solid rgba(255, 255, 255, 0.2)',
                                        background: 'rgba(0, 0, 0, 0.4)',
                                        color: 'white',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        minWidth: '140px',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                >
                                    <option value="all" style={{ background: '#1a2a35' }}>All Years</option>
                                    {availableYears.map(year => (
                                        <option key={year} value={year} style={{ background: '#1a2a35' }}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>


            </div>



            {/* Main Dashboard Content */}
            <div style={{ position: 'relative', zIndex: 2, maxWidth: '2000px', margin: '0 auto', padding: '32px' }}>




                {/* KPI Cards Row */}
                {selectedAsset && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '24px',
                        marginBottom: '32px'
                    }}>
                        <div style={{
                            background: 'rgba(9, 255, 0, 0.08)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '16px',
                            border: '2px solid rgb(4, 105, 1)',
                            padding: '20px',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            cursor: 'pointer',
                            position: 'relative'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                cursor: 'pointer',
                                zIndex: 1
                            }}>
                                <FeatherIcon icon="external-link" color={'#0cc225'} size={18} onClick={() => handleAssetView(selectedAsset.asset_id)} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: 'rgba(76, 175, 80, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FeatherIcon icon="box" color={'#0cc225'} />
                                </div>
                                <div>
                                    <p style={{ color: 'rgba(0, 255, 42, 0.6)', fontSize: '13px', margin: 0 }}>Asset Name</p>
                                    <p style={{ color: '#9fe2af', fontSize: '18px', fontWeight: '600', margin: 0 }}>{selectedAsset.asset_name}</p>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <p style={{ color: 'rgba(0, 255, 42, 0.6)', fontSize: '11px', marginBottom: '4px' }}>CATEGORY</p>
                                    <p style={{ color: '#9fe2af', fontSize: '13px', margin: 0 }}>{selectedAsset.asset_category || 'N/A'}</p>
                                </div>
                                <div>
                                    <p style={{ color: 'rgba(0, 255, 42, 0.6)', fontSize: '11px', marginBottom: '4px' }}>TYPE</p>
                                    <p style={{ color: '#9fe2af', fontSize: '13px', margin: 0 }}>{selectedAsset.asset_type || 'N/A'}</p>
                                </div>
                                <div>
                                    <p style={{ color: 'rgba(0, 255, 42, 0.6)', fontSize: '11px', marginBottom: '4px' }}>LOCATION</p>
                                    <p style={{ color: '#9fe2af', fontSize: '13px', margin: 0 }}>{selectedAsset.asset_location || 'N/A'}</p>
                                </div>
                                <div>
                                    <p style={{ color: 'rgba(0, 255, 42, 0.6)', fontSize: '11px', marginBottom: '4px' }}>COMMISSIONED</p>
                                    <p style={{ color: '#9fe2af', fontSize: '13px', margin: 0 }}>{selectedAsset.date_commisioning || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(0, 68, 255, 0.08)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '16px',
                            border: '2px solid rgb(56, 70, 196)',
                            padding: '20px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '10px',
                                    background: 'rgba(33, 150, 243, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FeatherIcon icon="clock" color={'#5779e9'} style={{ width: '40px', height: '40px' }} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ color: 'rgb(62, 123, 255)', fontSize: '1rem', margin: 0, fontWeight: '800' }}>
                                        Avg Asset Running Hours
                                    </p>
                                    <p style={{ color: '#2196F3', fontSize: '32px', fontWeight: '800', margin: 0 }}>
                                        {averages.avgAssetRunningHours}
                                    </p>
                                    <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '1rem', margin: 0, marginTop: '55px' }}>
                                        Based on {averages.reportCount} report{averages.reportCount !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div style={{
                            background: 'rgba(255, 145, 0, 0.19)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '16px',
                            border: '2px solid rgba(172, 92, 0, 0.77)',
                            padding: '20px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '10px',
                                    background: 'rgba(255, 152, 0, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FeatherIcon icon="droplet" size={20} color={'#ffa835'} style={{ width: '40px', height: '40px' }} />
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ color: 'rgba(255, 172, 47, 0.6)', fontSize: '1rem', margin: 0, fontWeight: '800' }}>
                                        Avg Oil Running Hours
                                    </p>
                                    <p style={{ color: '#FF9800', fontSize: '32px', fontWeight: '800', margin: 0 }}>
                                        {averages.avgOilRunningHours}
                                    </p>
                                    <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '1rem', margin: 0, marginTop: '55px' }}>
                                        hours since last change
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Two Column Layout for Reports and Components */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '32px',
                    marginTop: '32px',
                    marginBottom: '32px'
                }}>
                    {/* Reports Section */}
                    {selectedAsset && (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                padding: '20px 24px',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(0, 0, 0, 0.2)'
                            }}>
                                <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                                    Analysis Reports
                                    <span style={{
                                        marginLeft: '10px',
                                        background: '#2196F3',
                                        padding: '2px 8px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '500'
                                    }}>
                                        {assetReports.length}
                                    </span>
                                </h2>
                            </div>
                            <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '16px' }}>
                                {assetReports.length > 0 ? (
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {assetReports.map((report) => {
                                            const componentDetails = getComponentDetails(report.asset_component_id);
                                            return (
                                                <div key={report.asset_analysis_id} style={{
                                                    background: 'rgba(0, 0, 0, 0.3)',
                                                    borderRadius: '12px',
                                                    padding: '16px',
                                                    borderLeft: `3px solid ${componentDetails ? '#4CAF50' : '#FF9800'}`
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                        <div>
                                                            <div style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',

                                                                gap: '10px'
                                                            }}>
                                                                <div style={{ color: '#4CAF50', fontSize: '12px', fontWeight: '600' }}>
                                                                    Report #{report.asset_analysis_id}
                                                                </div>
                                                                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>
                                                                    {formatDate(report.analysis_date)}
                                                                </div>
                                                            </div>

                                                            <p style={{ color: 'white', fontSize: '15px', fontWeight: '500', margin: 0 }}>
                                                                {componentDetails?.asset_component_name || 'Unknown Component'}
                                                            </p>
                                                        </div>
                                                        <div style={{


                                                            cursor: 'pointer',

                                                        }}>
                                                            <FeatherIcon icon="external-link" size={23} color={'#636363'} onClick={() => handleSubmittedAssetView(report.asset_analysis_id)} />
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '24px' }}>
                                                        <div>
                                                            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', marginBottom: '2px' }}>Asset Hours</p>
                                                            <p style={{ color: 'white', fontSize: '14px', fontWeight: '500', margin: 0 }}>
                                                                {report.asset_running_hours || 0} hrs
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', marginBottom: '2px' }}>Oil Hours</p>
                                                            <p style={{ color: '#FF9800', fontSize: '14px', fontWeight: '500', margin: 0 }}>
                                                                {report.oil_running_hours || 0} hrs
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255, 255, 255, 0.5)' }}>
                                        No reports available
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Components Section */}
                    {selectedAsset && (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                padding: '20px 24px',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                background: 'rgba(0, 0, 0, 0.2)'
                            }}>
                                <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                                    Components
                                    <span style={{
                                        marginLeft: '10px',
                                        background: '#4CAF50',
                                        padding: '2px 8px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '500'
                                    }}>
                                        {assetComponents.length}
                                    </span>
                                </h2>
                            </div>
                            <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '16px' }}>
                                {assetComponents.length > 0 ? (
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {assetComponents.map((component, index) => (
                                            <div key={component.asset_component_id} style={{
                                                background: 'rgba(0, 0, 0, 0.3)',
                                                borderRadius: '12px',
                                                padding: '16px'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(76, 175, 80, 0.2)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '14px',
                                                        fontWeight: '600',
                                                        color: '#4CAF50'
                                                    }}>
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p style={{ color: 'white', fontSize: '15px', fontWeight: '500', margin: 0 }}>
                                                            {component.asset_component_name}
                                                        </p>
                                                        <p style={{ color: '#4CAF50', fontSize: '11px', margin: '4px 0 0 0' }}>
                                                            ID: {component.asset_component_id}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '24px', marginLeft: '44px' }}>
                                                    <div>
                                                        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', marginBottom: '2px' }}>Type</p>
                                                        <p style={{ color: 'white', fontSize: '13px', margin: 0 }}>{component.asset_component_type || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px', marginBottom: '2px' }}>Created</p>
                                                        <p style={{ color: 'white', fontSize: '13px', margin: 0 }}>
                                                            {new Date(component.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255, 255, 255, 0.5)' }}>
                                        No components found
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Test Results Section */}
                {selectedReport && (
                    <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px' }}>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: 'white', padding: '20px 24px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '16px 16px 0px 0px ', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', }}>
                            Trend Key Results
                        </div>
                        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: 'clamp(16px, 4vw, 25px)', borderRadius: '0px 0px 16px 16px', border: '1px solid rgba(255, 255, 255, 0.1)', }}>
                            <div style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>

                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', }}>
                                    {['overview', 'wear-metals', 'contaminants', 'chemistry'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            style={{
                                                padding: 'clamp(8px, 2vw, 10px) clamp(16px, 4vw, 24px)',
                                                border: 'none',
                                                background: activeTab === tab
                                                    ? tab === 'wear-metals' ? 'linear-gradient(135deg, #6949a5 0%, #3F1D7D 100%)'
                                                        : tab === 'contaminants' ? 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)'
                                                            : tab === 'chemistry' ? 'linear-gradient(135deg, #C14E26 0%, #ff4000 100%)'
                                                                : `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`
                                                    : 'transparent',
                                                color: activeTab === tab ? COLORS.white : '#a1a1a1',
                                                fontWeight: '600',
                                                borderRadius: '20px 20px 5px 5px',
                                                fontSize: 'clamp(12px, 2.5vw, 14px)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                flex: '0 0 auto'
                                            }}
                                        >
                                            {tab === 'overview' ? 'Overview' : tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <FilterAndDateRow />

                            <div>
                                {activeTab === 'wear-metals' && (
                                    <div>
                                        <SectionTitle titleColor={'#7700ff'} title="Wear Metals Analysis" icon={gear} count={rotating ? "17" : "12"} />
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
                                            {getCurrentWearMetals().map((param, index) => (
                                                <MetricTile key={index} label={param.label} value={selectedReport[param.key]} unit={param.unit} parameterKey={param.key} />
                                            ))}
                                            {getCurrentWearMetals().length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: COLORS.gray }}>No parameters match the selected filter</div>}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'contaminants' && (
                                    <div>
                                        <SectionTitle titleColor={'#1CC500'} title="Contaminants Analysis" icon={water} count={rotating ? "22" : stationary ? "11" : "10"} />
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
                                            {getCurrentContaminants().map((param, index) => (
                                                <MetricTile key={index} label={param.label} value={selectedReport[param.key]} unit={param.unit} parameterKey={param.key} />
                                            ))}
                                            {getCurrentContaminants().length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: COLORS.gray }}>No parameters match the selected filter</div>}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'chemistry' && (
                                    <div>
                                        <SectionTitle titleColor={'#C14D25'} title="Chemistry & Viscosity" icon={lab} count="12" />
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
                                            {getCurrentChemistry().map((param, index) => (
                                                <MetricTile key={index} label={param.label} value={selectedReport[param.key]} unit={param.unit} parameterKey={param.key} />
                                            ))}
                                            {getCurrentChemistry().length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: COLORS.gray }}>No parameters match the selected filter</div>}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'overview' && (
                                    <div>
                                        {(overviewCategory === 'all' || overviewCategory === 'wear-metals') && (
                                            <OverviewMultiChart titleColor={'#7b00ee'} title="Wear Metals Analysis" icon={gear} parameters={getAllWearMetals()} unit="ppm" yAxisLabel="Concentration (ppm)" hiddenSet={hiddenWearMetals} onToggle={toggleWearMetalsVisibility} />
                                        )}
                                        {(overviewCategory === 'all' || overviewCategory === 'contaminants') && (
                                            <OverviewMultiChart titleColor={'#1CC500'} title="Contaminants Analysis" icon={water} parameters={getAllContaminants()} unit="ppm" yAxisLabel="Value" hiddenSet={hiddenContaminants} onToggle={toggleContaminantsVisibility} />
                                        )}
                                        {(overviewCategory === 'all' || overviewCategory === 'chemistry') && (
                                            <OverviewMultiChart titleColor={'#C14D25'} title="Chemistry & Viscosity" icon={lab} parameters={getAllChemistry()} unit="cSt" yAxisLabel="Value" hiddenSet={hiddenChemistry} onToggle={toggleChemistryVisibility} />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                )}


            </div>

            <EnlargedChartModal />

            <style>
                {`
                    @keyframes float {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(50px, -50px) rotate(120deg); }
                        66% { transform: translate(-30px, 30px) rotate(240deg); }
                    }
                    @keyframes modalFadeIn {
                        from { opacity: 0; transform: scale(0.9); }
                        to { opacity: 1; transform: scale(1); }
                    }
                `}
            </style>
        </div>
    );
}