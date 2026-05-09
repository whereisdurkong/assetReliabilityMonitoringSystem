
// import { useEffect, useState } from "react";
// import axios from 'axios';
// import config from 'config';

// import FeatherIcon from 'feather-icons-react';
// import { useNavigate } from 'react-router';

// export default function AllSubmitAssets() {
//     const [assets, setAssets] = useState([]);
//     const [submittedReport, setSubmittedReport] = useState([]);
//     const [allAssets, setAllAssets] = useState([]); // State for all assets
//     const [allComponents, setAllComponents] = useState([]); // State for all components
//     const [filteredAssets, setFilteredAssets] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
//     const [searchTerm, setSearchTerm] = useState(''); // Search term
//     const [reportFilter, setReportFilter] = useState('all'); // 'all' or 'pending'

//     // Stats states
//     const [totalAssets, setTotalAssets] = useState(0);
//     const [totalCategories, setTotalCategories] = useState(0);
//     const [totalLocations, setTotalLocations] = useState(0);

//     // Pagination states
//     const [currentPage, setCurrentPage] = useState(1);
//     const [itemsPerPage] = useState(8); // Show 8 items per page

//     const [position, setPosition] = useState('');

//     const navigate = useNavigate();
//     const empInfo = JSON.parse(localStorage.getItem("user"));

//     // Helper function to get asset name by asset_id
//     const getAssetName = (assetId) => {
//         if (!assetId) return '-';
//         const asset = allAssets.find(a => a.asset_id === assetId);
//         return asset ? asset.asset_name : '-';
//     };

//     const getAssetLocation = (assetId) => {
//         if (!assetId) return '-';
//         const asset = allAssets.find(a => a.asset_id === assetId);
//         return asset ? asset.asset_location : '-';
//     };

//     const getAssetCategories = (assetId) => {
//         if (!assetId) return '-';
//         const asset = allAssets.find(a => a.asset_id === assetId);
//         return asset ? asset.asset_category : '-';
//     };

//     // Helper function to get component name by component_id
//     const getComponentName = (componentId) => {
//         if (!componentId) return '-';
//         const component = allComponents.find(c => c.asset_component_id === componentId);
//         return component ? component.asset_component_name : '-';
//     };

//     // Helper function to get component type by component_id
//     const getComponentType = (componentId) => {
//         if (!componentId) return '-';
//         const component = allComponents.find(c => c.asset_component_id === componentId);
//         return component ? component.asset_component_type || '-' : '-';
//     };

//     // Helper function to get combined component name and type
//     const getCombinedComponent = (componentId) => {
//         const componentName = getComponentName(componentId);
//         const componentType = getComponentType(componentId);

//         if (componentName === '-' && componentType === '-') return '-';
//         if (componentName === '-') return componentType;
//         if (componentType === '-') return componentName;
//         return `${componentName} (${componentType})`;
//     };

//     // Helper function to get asset details by asset_id
//     const getAssetDetails = (assetId) => {
//         if (!assetId) return null;
//         const asset = allAssets.find(a => a.asset_id === assetId);
//         return asset || null;
//     };

//     useEffect(() => {
//         console.log(empInfo)
//         if (empInfo.emp_position === 'l1') {
//             setPosition('Level 1');
//         } else if (empInfo.emp_position === 'l2') {
//             setPosition('Level 2')
//         } else if (empInfo.emp_position === 'l3') {
//             setPosition('Level 3')
//         }
//     }, [empInfo])

//     // Fetch submitted assets
//     useEffect(() => {
//         const fetchSubmittedAssets = async () => {
//             try {
//                 let assetsID = [];
//                 setLoading(true);
//                 const res = await axios.get(`${config.baseApi}/assetsAnalysis/get-all-submitted-assets`);
//                 const oilreportdata = res.data || [];
//                 console.log('Fetched submitted assets:', oilreportdata);

//                 let reports = [];

//                 if (empInfo.emp_position === 'l1') {
//                     // L1 can see all reports with level1 = '1'
//                     reports = oilreportdata.filter(e => e.level1 == 1 || e.level1 == true || e.level1 == "1");
//                     setSubmittedReport(reports);
//                     setFilteredAssets(reports);
//                     assetsID = reports;
//                     console.log('LEVEL 1 REPORTS (All)', reports);
//                 }

//                 if (empInfo.emp_position === 'l2') {
//                     // L2 initially sees all reports with level1 = '1'
//                     reports = oilreportdata.filter(e => e.level1 == 1 || e.level1 === true || e.level1 == "1");
//                     setSubmittedReport(reports);
//                     setFilteredAssets(reports);
//                     assetsID = reports;
//                     console.log('LEVEL 2 REPORTS', reports);
//                 }

//                 if (empInfo.emp_position === 'l3') {
//                     // L3 initially sees all reports with level1 = '1'
//                     reports = oilreportdata.filter(e => e.level1 == 1 || e.level1 == true || e.level1 == "1");
//                     setSubmittedReport(reports);
//                     setFilteredAssets(reports);
//                     assetsID = reports;
//                     console.log('LEVEL 3 REPORTS', reports);
//                 }

//                 const asset_ids = assetsID.map(report => report.asset_id).filter(id => id);
//                 console.log('ASSET IDS IN REPORT', asset_ids);
//                 const resgetallasset = await axios.get(`${config.baseApi}/assets/get-all-assets`);
//                 const allassetsdata = resgetallasset.data || [];

//                 const matchedAssets = allassetsdata.filter(asset => asset_ids.includes(asset.asset_id));
//                 console.log('Matched assets count:', matchedAssets.length);
//                 console.log('Matched assets details:', matchedAssets);

//                 console.log('ALL ASSETS', matchedAssets);
//                 setAllAssets(matchedAssets);

//                 // Calculate unique assets count
//                 const uniqueAssets = new Set();
//                 const uniqueCategories = new Set();
//                 const uniqueLocations = new Set();

//                 matchedAssets.forEach(asset => {
//                     if (asset.asset_id) uniqueAssets.add(asset.asset_id);
//                     if (asset.asset_category) uniqueCategories.add(asset.asset_category);
//                     if (asset.asset_location) uniqueLocations.add(asset.asset_location);
//                 });

//                 setTotalAssets(uniqueAssets.size);
//                 setTotalCategories(uniqueCategories.size);
//                 setTotalLocations(uniqueLocations.size);

//                 const resgetallassetcomponent = await axios.get(`${config.baseApi}/assets/get-all-components`);
//                 const getallassetscomponentdata = resgetallassetcomponent.data || [];

//                 console.log('ALL ASSETS COMPONENT', getallassetscomponentdata);
//                 setAllComponents(getallassetscomponentdata);

//             } catch (err) {
//                 console.log('Unable to fetch queue all-submitted-assets', err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchSubmittedAssets();
//     }, [empInfo.emp_position]);

//     // Apply pending filter when reportFilter changes
//     useEffect(() => {
//         if (!submittedReport.length) return;

//         let filtered = [...submittedReport];

//         // Apply pending filter based on user position
//         if (reportFilter === 'pending') {
//             if (empInfo.emp_position === 'l2') {
//                 // L2 pending: level1 = '1' but level2 is empty/null and level3 is empty/null
//                 filtered = filtered.filter(report =>
//                     (report.level1 == 1 || report.level1 == true || report.level1 == "1") &&
//                     (!report.level2 || report.level2 === '' || report.level2 === null || report.level2 === '0' || report.level2 === 0 || report.level2 === false) &&
//                     (!report.level3 || report.level3 === '' || report.level3 === null || report.level3 === '0' || report.level3 === 0 || report.level3 === false)
//                 );
//             } else if (empInfo.emp_position === 'l3') {
//                 // L3 pending: level1 = '1' and level2 = '1' but level3 is empty/null
//                 filtered = filtered.filter(report =>
//                     (report.level1 == 1 || report.level1 == true || report.level1 == "1") &&
//                     (report.level2 == 1 || report.level2 == true || report.level2 == "1") &&
//                     (!report.level3 || report.level3 === '' || report.level3 === null || report.level3 === '0' || report.level3 === 0 || report.level3 === false)
//                 );
//             }
//             // L1 doesn't have pending filter concept
//         }
//         // For 'all' filter, just show all reports (already filtered by main data fetch)

//         // Apply search filter
//         if (searchTerm.trim() !== '') {
//             const term = searchTerm.toLowerCase().trim();
//             filtered = filtered.filter(asset => {
//                 const assetName = getAssetName(asset.asset_id);
//                 const componentName = getComponentName(asset.asset_component_id);
//                 const componentType = getComponentType(asset.asset_component_id);
//                 const combinedComponent = getCombinedComponent(asset.asset_component_id);

//                 return (
//                     (asset.asset_analysis_id && asset.asset_analysis_id.toString().includes(term)) ||
//                     (asset.asset_id && asset.asset_id.toString().includes(term)) ||
//                     (asset.asset_component_id && asset.asset_component_id.toString().includes(term)) ||
//                     (assetName && assetName.toLowerCase().includes(term)) ||
//                     (componentName && componentName.toLowerCase().includes(term)) ||
//                     (componentType && componentType.toLowerCase().includes(term)) ||
//                     (combinedComponent && combinedComponent.toLowerCase().includes(term)) ||
//                     (asset.oil_analysis_results && asset.oil_analysis_results.toLowerCase().includes(term)) ||
//                     (asset.recommendations && asset.recommendations.toLowerCase().includes(term)) ||
//                     (asset.additional_notes && asset.additional_notes.toLowerCase().includes(term)) ||
//                     (asset.created_by && asset.created_by.toLowerCase().includes(term))
//                 );
//             });
//         }

//         // Apply sort
//         filtered.sort((a, b) => {
//             const dateA = new Date(a.created_at || 0);
//             const dateB = new Date(b.created_at || 0);

//             if (sortOrder === 'newest') {
//                 return dateB - dateA;
//             } else {
//                 return dateA - dateB;
//             }
//         });

//         setFilteredAssets(filtered);
//         setCurrentPage(1);
//     }, [submittedReport, reportFilter, sortOrder, searchTerm, allAssets, allComponents, empInfo.emp_position]);

//     // Get total counts for pending/all
//     const getAllReportsCount = () => {
//         return submittedReport.length;
//     };

//     const getPendingReportsCount = () => {
//         if (empInfo.emp_position === 'l2') {
//             return submittedReport.filter(report =>
//                 (!report.level2 || report.level2 === '' || report.level2 === null || report.level2 === '0' || report.level2 === 0 || report.level2 === false) &&
//                 (!report.level3 || report.level3 === '' || report.level3 === null || report.level3 === '0' || report.level3 === 0 || report.level3 === false)
//             ).length;
//         } else if (empInfo.emp_position === 'l3') {
//             return submittedReport.filter(report =>
//                 (report.level2 == 1 || report.level2 == true || report.level2 == "1") &&
//                 (!report.level3 || report.level3 === '' || report.level3 === null || report.level3 === '0' || report.level3 === 0 || report.level3 === false)
//             ).length;
//         }
//         return 0;
//     };

//     // Pagination logic
//     const indexOfLastItem = currentPage * itemsPerPage;
//     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//     const currentItems = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);
//     const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

//     // Change page
//     const paginate = (pageNumber) => setCurrentPage(pageNumber);
//     const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
//     const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

//     const handleSubmitAsset = () => {
//         navigate('/add-A-R');
//     };

//     const toggleSortOrder = () => {
//         setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
//     };

//     const handleSearchChange = (e) => {
//         setSearchTerm(e.target.value);
//     };

//     const clearSearch = () => {
//         setSearchTerm('');
//     };

//     const handleView = (asset) => {
//         const params = new URLSearchParams({ id: asset.asset_analysis_id });
//         navigate(`/view-submitted-asset?${params.toString()}`);
//     };

//     // Show loading state
//     if (loading) {
//         return (
//             <div style={{
//                 background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
//                 minHeight: '100vh',
//                 display: 'flex',
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 position: 'relative',
//                 overflow: 'hidden'
//             }}>
//                 <div style={{
//                     textAlign: 'center',
//                     color: '#EAB56F'
//                 }}>
//                     <div style={{
//                         width: '50px',
//                         height: '50px',
//                         border: '3px solid rgba(234, 181, 111, 0.3)',
//                         borderTop: '3px solid #EAB56F',
//                         borderRadius: '50%',
//                         animation: 'spin 1s linear infinite',
//                         margin: '0 auto 20px'
//                     }} />
//                     <p>Loading submitted assets...</p>
//                 </div>
//                 <style>
//                     {`
//                         @keyframes spin {
//                             0% { transform: rotate(0deg); }
//                             100% { transform: rotate(360deg); }
//                         }
//                     `}
//                 </style>
//             </div>
//         );
//     }

//     return (
//         <div style={{
//             background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
//             minHeight: '100vh',
//             padding: '40px',
//             position: 'relative',
//             overflow: 'hidden',
//             paddingTop: '50px'
//         }}>
//             {/* Animated background elements */}
//             <div style={{
//                 position: 'absolute',
//                 width: '600px',
//                 height: '600px',
//                 borderRadius: '50%',
//                 background: 'rgba(255, 255, 255, 0.05)',
//                 top: '-200px',
//                 right: '-200px',
//                 animation: 'float 25s infinite ease-in-out',
//                 zIndex: 1
//             }} />
//             <div style={{
//                 position: 'absolute',
//                 width: '400px',
//                 height: '400px',
//                 borderRadius: '50%',
//                 background: 'rgba(255, 255, 255, 0.05)',
//                 bottom: '-150px',
//                 left: '-150px',
//                 animation: 'float 20s infinite ease-in-out reverse',
//                 zIndex: 1
//             }} />
//             <div style={{
//                 position: 'absolute',
//                 width: '300px',
//                 height: '300px',
//                 borderRadius: '50%',
//                 background: 'rgba(255, 255, 255, 0.03)',
//                 top: '50%',
//                 left: '20%',
//                 animation: 'float 18s infinite ease-in-out',
//                 zIndex: 1
//             }} />

//             <div style={{ position: 'relative', zIndex: 2, maxWidth: '1400px', margin: '0 auto' }}>

//                 {/* Header with title and add button */}
//                 <div style={{
//                     display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                     marginBottom: '30px', flexWrap: 'wrap', gap: '20px'
//                 }}>
//                     <div>
//                         <h1 style={{
//                             marginBottom: '10px',
//                             fontSize: '2.8rem',
//                             fontWeight: '700',
//                             color: '#EAB56F',
//                             marginBottom: '8px',
//                             letterSpacing: '-0.5px',
//                             textShadow: '0 4px 20px rgba(234, 181, 111, 0.2)'
//                         }}>All Asset Analysis Report {position} </h1>
//                         <p style={{
//                             fontSize: '1rem',
//                             color: 'rgba(255,255,255,0.7)',
//                             margin: 0
//                         }}>View and manage all submitted asset analyses</p>
//                     </div>
//                     <button
//                         onClick={handleSubmitAsset}
//                         style={{
//                             background: 'linear-gradient(45deg, #EAB56F, #F9982F, #E37239)',
//                             border: 'none',
//                             borderRadius: '16px',
//                             padding: '18px 36px',
//                             fontSize: '1.1rem',
//                             fontWeight: '600',
//                             letterSpacing: '0.5px',
//                             color: '#fff',
//                             cursor: 'pointer',
//                             minWidth: '200px',
//                             transition: 'all 0.3s ease',
//                             boxShadow: '0 10px 20px rgba(227, 114, 57, 0.3)'
//                         }}
//                         onMouseEnter={(e) => {
//                             e.target.style.transform = 'scale(1.02)';
//                             e.target.style.boxShadow = '0 15px 35px -10px #E37239';
//                         }}
//                         onMouseLeave={(e) => {
//                             e.target.style.transform = 'scale(1)';
//                             e.target.style.boxShadow = '0 10px 30px -10px #E37239';
//                         }}
//                     >
//                         <span style={{
//                             fontSize: '1.2rem',
//                             fontWeight: 'bold',
//                             marginRight: '8px'
//                         }}>+</span>
//                         Submit Report
//                     </button>
//                 </div>



//                 {/* Stats Cards Section */}
//                 <div style={{
//                     position: 'relative',
//                     zIndex: 2,
//                     display: 'grid',
//                     gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
//                     gap: '24px',
//                     marginBottom: '30px',
//                     padding: '0 10px'
//                 }}>
//                     {/* Total Assets Card */}
//                     <div style={{
//                         background: '#EAB56F10',
//                         backdropFilter: 'blur(10px)',
//                         borderRadius: '20px',
//                         padding: '24px',
//                         border: '2px solid #EAB56F',
//                         transition: 'all 0.3s ease',
//                         cursor: 'pointer'
//                     }}
//                         onMouseEnter={(e) => {
//                             e.currentTarget.style.transform = 'translateY(-5px)';
//                             e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
//                         }}
//                         onMouseLeave={(e) => {
//                             e.currentTarget.style.transform = 'translateY(0)';
//                             e.currentTarget.style.boxShadow = 'none';
//                         }}>
//                         <div style={{
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'space-between',
//                             marginBottom: '16px'
//                         }}>
//                             <div style={{
//                                 background: 'linear-gradient(135deg, #EAB56F, #F9982F)',
//                                 borderRadius: '15px',
//                                 padding: '12px',
//                                 display: 'inline-flex'
//                             }}>
//                                 <FeatherIcon icon="package" size={28} color="#fff" />
//                             </div>
//                             <span style={{
//                                 fontSize: '3rem',
//                                 fontWeight: 'bold',
//                                 color: '#EAB56F',
//                             }}>{totalAssets}</span>
//                         </div>
//                         <h3 style={{

//                             color: '#F9982F',
//                             marginBottom: '8px',
//                             fontSize: '1rem',
//                             fontWeight: '600',
//                             textTransform: 'uppercase',
//                             letterSpacing: '1px'
//                         }}>Total Assets</h3>
//                     </div>

//                     {/* Total Categories Card */}
//                     <div style={{
//                         background: '#8B5CF610',
//                         backdropFilter: 'blur(10px)',
//                         borderRadius: '20px',
//                         padding: '24px',
//                         border: '2px solid #8B5CF6',
//                         transition: 'all 0.3s ease',
//                         cursor: 'pointer'
//                     }}
//                         onMouseEnter={(e) => {
//                             e.currentTarget.style.transform = 'translateY(-5px)';
//                             e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
//                         }}
//                         onMouseLeave={(e) => {
//                             e.currentTarget.style.transform = 'translateY(0)';
//                             e.currentTarget.style.boxShadow = 'none';
//                         }}>
//                         <div style={{
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'space-between',
//                             marginBottom: '16px'
//                         }}>
//                             <div style={{
//                                 background: '#8B5CF6',
//                                 borderRadius: '15px',
//                                 padding: '12px',
//                                 display: 'inline-flex'
//                             }}>
//                                 <FeatherIcon icon="grid" size={28} color="#fff" />
//                             </div>
//                             <span style={{
//                                 fontSize: '3rem',
//                                 fontWeight: 'bold',
//                                 color: '#8B5CF6'
//                             }}>{totalCategories}</span>
//                         </div>
//                         <h3 style={{
//                             fontSize: '1rem',
//                             color: '#8B5CF6',
//                             marginBottom: '8px',
//                             fontWeight: '600',
//                             textTransform: 'uppercase',
//                             letterSpacing: '1px'
//                         }}>Total Categories</h3>
//                     </div>

//                     {/* Total Locations Card */}
//                     <div style={{
//                         background: '#10B98110',
//                         backdropFilter: 'blur(10px)',
//                         borderRadius: '20px',
//                         padding: '24px',
//                         border: '2px solid #10B981',
//                         transition: 'all 0.3s ease',
//                         cursor: 'pointer'
//                     }}
//                         onMouseEnter={(e) => {
//                             e.currentTarget.style.transform = 'translateY(-5px)';
//                             e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
//                         }}
//                         onMouseLeave={(e) => {
//                             e.currentTarget.style.transform = 'translateY(0)';
//                             e.currentTarget.style.boxShadow = 'none';
//                         }}>
//                         <div style={{
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'space-between',
//                             marginBottom: '16px'
//                         }}>
//                             <div style={{
//                                 background: 'linear-gradient(135deg, #10B981, #10B981)',
//                                 borderRadius: '15px',
//                                 padding: '12px',
//                                 display: 'inline-flex'
//                             }}>
//                                 <FeatherIcon icon="map-pin" size={28} color="#fff" />
//                             </div>
//                             <span style={{
//                                 fontSize: '3rem',
//                                 fontWeight: 'bold',
//                                 color: '#10B981'
//                             }}>{totalLocations}</span>
//                         </div>
//                         <h3 style={{
//                             fontSize: '1rem',
//                             color: '#10B981',
//                             marginBottom: '8px',
//                             fontWeight: '600',
//                             textTransform: 'uppercase',
//                             letterSpacing: '1px'
//                         }}>Total Locations</h3>
//                     </div>
//                 </div>

//                 {/* Search and Sort Controls Section */}
//                 <div style={{
//                     position: 'relative',
//                     zIndex: 2,
//                     display: 'flex',
//                     alignItems: 'center',
//                     marginBottom: '20px',
//                     gap: '20px',
//                     flexWrap: 'wrap'
//                 }}>

//                     {/* Search input */}
//                     <div style={{
//                         position: 'relative',
//                         display: 'flex',
//                         flex: '1',
//                         minWidth: '300px'
//                     }}>
//                         <input
//                             type="text"
//                             placeholder="Search by asset name, component name, component type, ID, recommendations..."
//                             value={searchTerm}
//                             onChange={handleSearchChange}
//                             style={{
//                                 padding: '10px 40px 10px 40px',
//                                 borderRadius: '30px',
//                                 border: '2px solid rgba(234, 181, 111, 0.3)',
//                                 background: 'rgba(255, 255, 255, 0.05)',
//                                 color: '#fff',
//                                 fontSize: '0.95rem',
//                                 width: '100%',
//                                 outline: 'none',
//                                 transition: 'all 0.3s ease'
//                             }}
//                             onFocus={(e) => {
//                                 e.target.style.borderColor = '#EAB56F';
//                                 e.target.style.background = 'rgba(255, 255, 255, 0.1)';
//                             }}
//                             onBlur={(e) => {
//                                 e.target.style.borderColor = 'rgba(234, 181, 111, 0.3)';
//                                 e.target.style.background = 'rgba(255, 255, 255, 0.05)';
//                             }}
//                         />
//                         <span style={{
//                             position: 'absolute',
//                             left: '15px',
//                             top: '50%',
//                             transform: 'translateY(-50%)',
//                             color: '#EAB56F',
//                             fontSize: '1.2rem',
//                             opacity: 0.7,
//                             pointerEvents: 'none'
//                         }}>
//                             <FeatherIcon icon="search" size={18} />
//                         </span>

//                         {searchTerm && (
//                             <button
//                                 onClick={clearSearch}
//                                 style={{
//                                     position: 'absolute',
//                                     right: '12px',
//                                     background: 'none',
//                                     border: 'none',
//                                     color: '#EAB56F',
//                                     cursor: 'pointer',
//                                     padding: '0',
//                                     display: 'flex',
//                                     alignItems: 'center'
//                                 }}
//                             >
//                                 <FeatherIcon icon="x" size={18} />
//                             </button>
//                         )}
//                     </div>
//                     {/* Report Filter Dropdown - Only show for L2 and L3 */}
//                     {empInfo.emp_position !== 'l1' && (
//                         <div style={{
//                             position: 'relative',
//                             display: 'inline-block'
//                         }}>
//                             <select
//                                 value={reportFilter}
//                                 onChange={(e) => setReportFilter(e.target.value)}
//                                 style={{
//                                     padding: '12px 40px 12px 20px',
//                                     borderRadius: '50px',
//                                     border: '2px solid #EAB56F',
//                                     background: 'rgba(255, 255, 255, 0.05)',
//                                     color: '#EAB56F',
//                                     fontSize: '0.95rem',
//                                     fontWeight: '600',
//                                     cursor: 'pointer',
//                                     backdropFilter: 'blur(10px)',
//                                     appearance: 'none',
//                                     outline: 'none',
//                                     transition: 'all 0.3s ease'
//                                 }}
//                                 onMouseEnter={(e) => {
//                                     e.currentTarget.style.background = 'rgba(234, 181, 111, 0.1)';
//                                 }}
//                                 onMouseLeave={(e) => {
//                                     e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
//                                 }}
//                             >
//                                 <option value="all" style={{ background: '#254252', color: '#EAB56F' }}>
//                                     All Reports ({getAllReportsCount()})
//                                 </option>
//                                 <option value="pending" style={{ background: '#254252', color: '#F9982F' }}>
//                                     Pending Reports ({getPendingReportsCount()})
//                                 </option>
//                             </select>
//                             <div style={{
//                                 position: 'absolute',
//                                 right: '15px',
//                                 top: '50%',
//                                 transform: 'translateY(-50%)',
//                                 pointerEvents: 'none',
//                                 color: '#EAB56F'
//                             }}>
//                                 <FeatherIcon icon="chevron-down" size={18} />
//                             </div>
//                         </div>
//                     )}


//                     {/* Sort button */}
//                     <button
//                         onClick={toggleSortOrder}
//                         style={{
//                             display: 'flex',
//                             alignItems: 'center',
//                             gap: '8px',
//                             padding: '10px 20px',
//                             borderRadius: '30px',
//                             border: '1px solid rgba(234, 181, 111, 0.3)',
//                             background: 'rgba(255, 255, 255, 0.05)',
//                             color: '#F9982F',
//                             fontWeight: '500',
//                             fontSize: '0.95rem',
//                             cursor: 'pointer',
//                             transition: 'all 0.3s ease',
//                             whiteSpace: 'nowrap'
//                         }}
//                         onMouseEnter={(e) => {
//                             e.currentTarget.style.background = 'rgba(234, 181, 111, 0.1)';
//                             e.currentTarget.style.transform = 'translateY(-2px)';
//                         }}
//                         onMouseLeave={(e) => {
//                             e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
//                             e.currentTarget.style.transform = 'translateY(0)';
//                         }}
//                     >
//                         <FeatherIcon
//                             icon={sortOrder === 'newest' ? 'arrow-down' : 'arrow-up'}
//                             size={18}
//                         />
//                         {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
//                     </button>
//                 </div>

//                 {/* Table container */}
//                 <div style={{
//                     position: 'relative',
//                     zIndex: 2,
//                     background: '#F8FAFC',
//                     borderRadius: '24px',
//                     boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
//                     backdropFilter: 'blur(10px)',
//                     overflowX: 'auto'
//                 }}>
//                     <table style={{
//                         width: '100%',
//                         borderCollapse: 'collapse',
//                         borderRadius: '16px',
//                         overflow: 'hidden',
//                         minWidth: '1200px'
//                     }}>
//                         <thead>
//                             <tr style={{
//                                 background: '#1E293B'
//                             }}>
//                                 <th style={{
//                                     padding: '10px 20px',
//                                     textAlign: 'left',
//                                     color: '#fff',
//                                     fontWeight: '600',
//                                     fontSize: '0.9rem',
//                                     textTransform: 'uppercase',
//                                     letterSpacing: '0.5px'
//                                 }}>Asset</th>
//                                 <th style={{
//                                     padding: '10px 20px',
//                                     textAlign: 'left',
//                                     color: '#fff',
//                                     fontWeight: '600',
//                                     fontSize: '0.9rem',
//                                     textTransform: 'uppercase',
//                                     letterSpacing: '0.5px'
//                                 }}>Location</th>
//                                 <th style={{
//                                     padding: '10px 20px',
//                                     textAlign: 'left',
//                                     color: '#fff',
//                                     fontWeight: '600',
//                                     fontSize: '0.9rem',
//                                     textTransform: 'uppercase',
//                                     letterSpacing: '0.5px'
//                                 }}>Category</th>
//                                 <th style={{
//                                     padding: '10px 20px',
//                                     textAlign: 'left',
//                                     color: '#fff',
//                                     fontWeight: '600',
//                                     fontSize: '0.9rem',
//                                     textTransform: 'uppercase',
//                                     letterSpacing: '0.5px'
//                                 }}>Component</th>
//                                 <th style={{
//                                     padding: '10px 20px',
//                                     textAlign: 'left',
//                                     color: '#fff',
//                                     fontWeight: '600',
//                                     fontSize: '0.9rem',
//                                     textTransform: 'uppercase',
//                                     letterSpacing: '0.5px'
//                                 }}>Analysis Date</th>
//                                 <th style={{
//                                     padding: '10px 20px',
//                                     textAlign: 'left',
//                                     color: '#fff',
//                                     fontWeight: '600',
//                                     fontSize: '0.9rem',
//                                     textTransform: 'uppercase',
//                                     letterSpacing: '0.5px'
//                                 }}>Created By</th>
//                                 <th style={{
//                                     padding: '10px 20px',
//                                     textAlign: 'left',
//                                     color: '#fff',
//                                     fontWeight: '600',
//                                     fontSize: '0.9rem',
//                                     textTransform: 'uppercase',
//                                     letterSpacing: '0.5px',
//                                     cursor: 'pointer'
//                                 }} onClick={toggleSortOrder}>
//                                     <div style={{
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: '5px'
//                                     }}>
//                                         Created At
//                                         <span style={{
//                                             fontSize: '1rem',
//                                             opacity: 0.8
//                                         }}>
//                                             {sortOrder === 'newest' ?
//                                                 <FeatherIcon icon="arrow-down" size={16} /> :
//                                                 <FeatherIcon icon="arrow-up" size={16} />}
//                                         </span>
//                                     </div>
//                                 </th>
//                                 <th style={{
//                                     padding: '16px 20px',
//                                     textAlign: 'left',
//                                     color: '#fff',
//                                     fontWeight: '600',
//                                     fontSize: '0.9rem',
//                                     textTransform: 'uppercase',
//                                     letterSpacing: '0.5px'
//                                 }}>Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {currentItems.map((asset, index) => (
//                                 <tr
//                                     key={asset.asset_analysis_id}
//                                     style={{
//                                         borderBottom: '1px solid #e7cfaf',
//                                         transition: 'background-color 0.3s ease',
//                                         cursor: 'pointer',
//                                         animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
//                                     }}
//                                     onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a7560b2c'}
//                                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
//                                     onClick={() => handleView(asset)}
//                                 >
//                                     <td style={{
//                                         padding: '16px 20px',
//                                         color: '#333',
//                                         fontSize: '0.95rem'
//                                     }}>
//                                         <div style={{
//                                             display: 'flex',
//                                             alignItems: 'center',
//                                             gap: '8px',
//                                             fontWeight: '500'
//                                         }}>
//                                             {getAssetName(asset.asset_id)}
//                                         </div>
//                                     </td>
//                                     <td style={{
//                                         padding: '16px 20px',
//                                         color: '#333',
//                                         fontSize: '0.95rem'
//                                     }}>
//                                         <div style={{
//                                             display: 'flex',
//                                             alignItems: 'center',
//                                             gap: '8px',
//                                             fontWeight: '500'
//                                         }}>
//                                             {getAssetLocation(asset.asset_id)}
//                                         </div>
//                                     </td>
//                                     <td style={{
//                                         padding: '16px 20px',
//                                         color: '#333',
//                                         fontSize: '0.95rem'
//                                     }}>
//                                         <div style={{
//                                             display: 'flex',
//                                             alignItems: 'center',
//                                             gap: '8px',
//                                             fontWeight: '500'
//                                         }}>
//                                             {getAssetCategories(asset.asset_id)}
//                                         </div>
//                                     </td>
//                                     <td style={{
//                                         padding: '16px 20px',
//                                         color: '#333',
//                                         fontSize: '0.95rem'
//                                     }}>
//                                         <span style={{
//                                             display: 'inline-block',
//                                             padding: '4px 12px',
//                                             borderRadius: '20px',
//                                             background: '#EAB56F20',
//                                             color: '#E37239',
//                                             fontSize: '0.85rem',
//                                             fontWeight: '500'
//                                         }}>
//                                             {getCombinedComponent(asset.asset_component_id)}
//                                         </span>
//                                     </td>
//                                     <td style={{
//                                         padding: '16px 20px',
//                                         color: '#333',
//                                         fontSize: '0.95rem'
//                                     }}>
//                                         <span style={{
//                                             fontSize: '0.85rem'
//                                         }}>
//                                             {asset.analysis_date ?
//                                                 new Date(asset.analysis_date).toLocaleDateString('en-US', {
//                                                     year: 'numeric',
//                                                     month: 'short',
//                                                     day: 'numeric'
//                                                 }) : '-'
//                                             }
//                                         </span>
//                                     </td>
//                                     <td style={{
//                                         padding: '16px 20px',
//                                         color: '#333',
//                                         fontSize: '0.95rem'
//                                     }}>
//                                         <span style={{
//                                             display: 'flex',
//                                             alignItems: 'center',
//                                             gap: '4px',
//                                             color: '#666'
//                                         }}>
//                                             {asset.created_by || 'System'}
//                                         </span>
//                                     </td>
//                                     <td style={{
//                                         padding: '16px 20px',
//                                         color: '#333',
//                                         fontSize: '0.95rem'
//                                     }}>
//                                         <span style={{
//                                             display: 'flex',
//                                             alignItems: 'center',
//                                             gap: '4px',
//                                             color: '#666'
//                                         }}>
//                                             {asset.created_at ?
//                                                 new Date(asset.created_at).toLocaleDateString('en-US', {
//                                                     year: 'numeric',
//                                                     month: 'short',
//                                                     day: 'numeric',
//                                                     hour: '2-digit',
//                                                     minute: '2-digit'
//                                                 }) : '-'
//                                             }
//                                         </span>
//                                     </td>
//                                     <td style={{
//                                         padding: '16px 20px',
//                                         color: '#333',
//                                         fontSize: '0.95rem'
//                                     }}>
//                                         <div style={{
//                                             display: 'flex',
//                                             gap: '8px'
//                                         }}>
//                                             <button
//                                                 onClick={(e) => {
//                                                     e.stopPropagation();
//                                                     handleView(asset);
//                                                 }}
//                                                 style={{
//                                                     background: 'linear-gradient(135deg, #EAB56F, #F9982F)',
//                                                     border: 'none',
//                                                     fontSize: '0.85rem',
//                                                     cursor: 'pointer',
//                                                     padding: '6px 16px',
//                                                     borderRadius: '8px',
//                                                     transition: 'all 0.2s ease',
//                                                     color: '#fff',
//                                                     fontWeight: '500'
//                                                 }}
//                                                 onMouseEnter={(e) => {
//                                                     e.currentTarget.style.transform = 'scale(1.05)';
//                                                     e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 181, 111, 0.4)';
//                                                 }}
//                                                 onMouseLeave={(e) => {
//                                                     e.currentTarget.style.transform = 'scale(1)';
//                                                     e.currentTarget.style.boxShadow = 'none';
//                                                 }}
//                                                 title="View Details"
//                                             >
//                                                 View
//                                             </button>
//                                         </div>
//                                     </td>
//                                 </tr>

//                             ))}
//                         </tbody>
//                     </table>

//                     {filteredAssets.length === 0 && (
//                         <div style={{
//                             textAlign: 'center',
//                             padding: '60px 20px'
//                         }}>
//                             <FeatherIcon icon="inbox" size={48} style={{
//                                 color: '#d1b289',
//                                 marginBottom: '20px',
//                                 opacity: 0.5
//                             }} />
//                             <h3 style={{
//                                 fontSize: '1.5rem',
//                                 color: '#333',
//                                 marginBottom: '10px'
//                             }}>
//                                 {searchTerm
//                                     ? 'No Matching Submitted Assets Found'
//                                     : reportFilter === 'pending'
//                                         ? 'No Pending Reports Found'
//                                         : 'No Submitted Assets Found'}
//                             </h3>
//                             <p style={{
//                                 color: '#666',
//                                 marginBottom: '20px'
//                             }}>
//                                 {searchTerm
//                                     ? `No submitted assets match your search term "${searchTerm}". Try different keywords.`
//                                     : reportFilter === 'pending'
//                                         ? "There are no pending reports requiring your action at the moment."
//                                         : "There are no submitted assets at the moment."}
//                             </p>
//                             {searchTerm && (
//                                 <button
//                                     onClick={clearSearch}
//                                     style={{
//                                         background: 'linear-gradient(45deg, #EAB56F, #F9982F)',
//                                         border: 'none',
//                                         borderRadius: '8px',
//                                         padding: '10px 20px',
//                                         fontSize: '0.95rem',
//                                         fontWeight: '600',
//                                         color: '#fff',
//                                         cursor: 'pointer',
//                                         transition: 'all 0.3s ease'
//                                     }}
//                                     onMouseEnter={(e) => {
//                                         e.target.style.transform = 'scale(1.05)';
//                                     }}
//                                     onMouseLeave={(e) => {
//                                         e.target.style.transform = 'scale(1)';
//                                     }}
//                                 >
//                                     Clear Search
//                                 </button>
//                             )}
//                         </div>
//                     )}

//                     {/* Pagination Controls */}
//                     {filteredAssets.length > 0 && (
//                         <div style={{
//                             display: 'flex',
//                             justifyContent: 'space-between',
//                             alignItems: 'center',
//                             padding: '20px',
//                             borderTop: '1px solid #e7cfaf'
//                         }}>
//                             <div style={{
//                                 color: '#666',
//                                 fontSize: '0.9rem'
//                             }}>
//                                 Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAssets.length)} of {filteredAssets.length} entries
//                             </div>
//                             <div style={{
//                                 display: 'flex',
//                                 gap: '10px',
//                                 alignItems: 'center'
//                             }}>
//                                 <button
//                                     onClick={prevPage}
//                                     disabled={currentPage === 1}
//                                     style={{
//                                         padding: '8px 16px',
//                                         borderRadius: '8px',
//                                         border: '1px solid #EAB56F',
//                                         background: currentPage === 1 ? '#f5e5d0' : '#EAB56F',
//                                         color: currentPage === 1 ? '#999' : '#fff',
//                                         cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
//                                         transition: 'all 0.3s ease',
//                                         fontWeight: '500'
//                                     }}
//                                 >
//                                     Previous
//                                 </button>

//                                 <div style={{
//                                     display: 'flex',
//                                     gap: '8px'
//                                 }}>
//                                     {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
//                                         let pageNumber;
//                                         if (totalPages <= 5) {
//                                             pageNumber = i + 1;
//                                         } else if (currentPage <= 3) {
//                                             pageNumber = i + 1;
//                                         } else if (currentPage >= totalPages - 2) {
//                                             pageNumber = totalPages - 4 + i;
//                                         } else {
//                                             pageNumber = currentPage - 2 + i;
//                                         }

//                                         return (
//                                             <button
//                                                 key={pageNumber}
//                                                 onClick={() => paginate(pageNumber)}
//                                                 style={{
//                                                     width: '35px',
//                                                     height: '35px',
//                                                     borderRadius: '8px',
//                                                     border: 'none',
//                                                     background: currentPage === pageNumber ? '#EAB56F' : 'transparent',
//                                                     color: currentPage === pageNumber ? '#fff' : '#666',
//                                                     cursor: 'pointer',
//                                                     fontWeight: '600',
//                                                     transition: 'all 0.3s ease',
//                                                     border: currentPage === pageNumber ? 'none' : '1px solid #EAB56F'
//                                                 }}
//                                             >
//                                                 {pageNumber}
//                                             </button>
//                                         );
//                                     })}
//                                 </div>

//                                 <button
//                                     onClick={nextPage}
//                                     disabled={currentPage === totalPages}
//                                     style={{
//                                         padding: '8px 16px',
//                                         borderRadius: '8px',
//                                         border: '1px solid #EAB56F',
//                                         background: currentPage === totalPages ? '#f5e5d0' : '#EAB56F',
//                                         color: currentPage === totalPages ? '#999' : '#fff',
//                                         cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
//                                         transition: 'all 0.3s ease',
//                                         fontWeight: '500'
//                                     }}
//                                 >
//                                     Next
//                                 </button>
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

//                     @keyframes slideIn {
//                         from {
//                             opacity: 0;
//                             transform: translateX(-20px);
//                         }
//                         to {
//                             opacity: 1;
//                             transform: translateX(0);
//                         }
//                     }

//                     @keyframes pulse {
//                         0%, 100% { opacity: 0.6; }
//                         50% { opacity: 1; }
//                     }

//                     @keyframes spin {
//                         0% { transform: rotate(0deg); }
//                         100% { transform: rotate(360deg); }
//                     }
//                 `}
//             </style>
//         </div>
//     );
// }


import { useEffect, useState, useRef } from "react";
import axios from 'axios';
import config from 'config';

import FeatherIcon from 'feather-icons-react';
import { useNavigate } from 'react-router';

export default function AllSubmitAssets() {
    const [assets, setAssets] = useState([]);
    const [submittedReport, setSubmittedReport] = useState([]);
    const [allAssets, setAllAssets] = useState([]);
    const [allComponents, setAllComponents] = useState([]);
    const [filteredAssets, setFilteredAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('newest');
    const [searchTerm, setSearchTerm] = useState('');
    const [reportFilter, setReportFilter] = useState('all');

    // Date filter states
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Refs for date inputs
    const fromDateInputRef = useRef(null);
    const toDateInputRef = useRef(null);

    // Stats states
    const [totalAssets, setTotalAssets] = useState(0);
    const [totalCategories, setTotalCategories] = useState(0);
    const [totalLocations, setTotalLocations] = useState(0);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);

    const [position, setPosition] = useState('');

    const navigate = useNavigate();
    const empInfo = JSON.parse(localStorage.getItem("user"));

    // Helper function to get asset name by asset_id
    const getAssetName = (assetId) => {
        if (!assetId) return '-';
        const asset = allAssets.find(a => a.asset_id === assetId);
        return asset ? asset.asset_name : '-';
    };

    const getAssetLocation = (assetId) => {
        if (!assetId) return '-';
        const asset = allAssets.find(a => a.asset_id === assetId);
        return asset ? asset.asset_location : '-';
    };

    const getAssetCategories = (assetId) => {
        if (!assetId) return '-';
        const asset = allAssets.find(a => a.asset_id === assetId);
        return asset ? asset.asset_category : '-';
    };

    const getComponentName = (componentId) => {
        if (!componentId) return '-';
        const component = allComponents.find(c => c.asset_component_id === componentId);
        return component ? component.asset_component_name : '-';
    };

    const getComponentType = (componentId) => {
        if (!componentId) return '-';
        const component = allComponents.find(c => c.asset_component_id === componentId);
        return component ? component.asset_component_type || '-' : '-';
    };

    const getCombinedComponent = (componentId) => {
        const componentName = getComponentName(componentId);
        const componentType = getComponentType(componentId);
        if (componentName === '-' && componentType === '-') return '-';
        if (componentName === '-') return componentType;
        if (componentType === '-') return componentName;
        return `${componentName} (${componentType})`;
    };

    // Function to open date picker
    const openDatePicker = (inputRef) => {
        if (inputRef.current) {
            if (inputRef.current.showPicker) {
                inputRef.current.showPicker();
            } else {
                inputRef.current.click();
                inputRef.current.focus();
            }
        }
    };

    const clearDateFilters = () => {
        setDateFrom('');
        setDateTo('');
    };

    useEffect(() => {
        if (empInfo.emp_position === 'l1') {
            setPosition('Level 1');
        } else if (empInfo.emp_position === 'l2') {
            setPosition('Level 2');
        } else if (empInfo.emp_position === 'l3') {
            setPosition('Level 3');
        }
    }, [empInfo]);

    // Fetch submitted assets
    useEffect(() => {
        const fetchSubmittedAssets = async () => {
            try {
                let assetsID = [];
                setLoading(true);
                const res = await axios.get(`${config.baseApi}/assetsAnalysis/get-all-submitted-assets`);
                const oilreportdata = res.data || [];
                console.log('Fetched submitted assets:', oilreportdata);

                let reports = [];

                if (empInfo.emp_position === 'l1') {
                    reports = oilreportdata.filter(e => e.level1 == 1 || e.level1 == true || e.level1 == "1");
                    setSubmittedReport(reports);
                    setFilteredAssets(reports);
                    assetsID = reports;
                    console.log('LEVEL 1 REPORTS (All)', reports);
                }

                if (empInfo.emp_position === 'l2') {
                    reports = oilreportdata.filter(e => e.level1 == 1 || e.level1 === true || e.level1 == "1");
                    setSubmittedReport(reports);
                    setFilteredAssets(reports);
                    assetsID = reports;
                    console.log('LEVEL 2 REPORTS', reports);
                }

                if (empInfo.emp_position === 'l3') {
                    reports = oilreportdata.filter(e => e.level1 == 1 || e.level1 == true || e.level1 == "1");
                    setSubmittedReport(reports);
                    setFilteredAssets(reports);
                    assetsID = reports;
                    console.log('LEVEL 3 REPORTS', reports);
                }

                const asset_ids = assetsID.map(report => report.asset_id).filter(id => id);
                console.log('ASSET IDS IN REPORT', asset_ids);
                const resgetallasset = await axios.get(`${config.baseApi}/assets/get-all-assets`);
                const allassetsdata = resgetallasset.data || [];

                const matchedAssets = allassetsdata.filter(asset => asset_ids.includes(asset.asset_id));
                console.log('Matched assets count:', matchedAssets.length);
                console.log('Matched assets details:', matchedAssets);

                console.log('ALL ASSETS', matchedAssets);
                setAllAssets(matchedAssets);

                const uniqueAssets = new Set();
                const uniqueCategories = new Set();
                const uniqueLocations = new Set();

                matchedAssets.forEach(asset => {
                    if (asset.asset_id) uniqueAssets.add(asset.asset_id);
                    if (asset.asset_category) uniqueCategories.add(asset.asset_category);
                    if (asset.asset_location) uniqueLocations.add(asset.asset_location);
                });

                setTotalAssets(uniqueAssets.size);
                setTotalCategories(uniqueCategories.size);
                setTotalLocations(uniqueLocations.size);

                const resgetallassetcomponent = await axios.get(`${config.baseApi}/assets/get-all-components`);
                const getallassetscomponentdata = resgetallassetcomponent.data || [];

                console.log('ALL ASSETS COMPONENT', getallassetscomponentdata);
                setAllComponents(getallassetscomponentdata);

            } catch (err) {
                console.log('Unable to fetch queue all-submitted-assets', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmittedAssets();
    }, [empInfo.emp_position]);

    // Apply filters
    useEffect(() => {
        if (!submittedReport.length) return;

        let filtered = [...submittedReport];

        // Apply pending filter
        if (reportFilter === 'pending') {
            if (empInfo.emp_position === 'l2') {
                filtered = filtered.filter(report =>
                    (report.level1 == 1 || report.level1 == true || report.level1 == "1") &&
                    (!report.level2 || report.level2 === '' || report.level2 === null || report.level2 === '0' || report.level2 === 0 || report.level2 === false) &&
                    (!report.level3 || report.level3 === '' || report.level3 === null || report.level3 === '0' || report.level3 === 0 || report.level3 === false)
                );
            } else if (empInfo.emp_position === 'l3') {
                filtered = filtered.filter(report =>
                    (report.level1 == 1 || report.level1 == true || report.level1 == "1") &&
                    (report.level2 == 1 || report.level2 == true || report.level2 == "1") &&
                    (!report.level3 || report.level3 === '' || report.level3 === null || report.level3 === '0' || report.level3 === 0 || report.level3 === false)
                );
            }
        }

        // Apply date range filter - from
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(asset => {
                if (!asset.created_at) return false;
                const assetDate = new Date(asset.created_at);
                return assetDate >= fromDate;
            });
        }

        // Apply date range filter - to
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(asset => {
                if (!asset.created_at) return false;
                const assetDate = new Date(asset.created_at);
                return assetDate <= toDate;
            });
        }

        // Apply search filter
        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(asset => {
                const assetName = getAssetName(asset.asset_id);
                const componentName = getComponentName(asset.asset_component_id);
                const componentType = getComponentType(asset.asset_component_id);
                const combinedComponent = getCombinedComponent(asset.asset_component_id);

                return (
                    (asset.asset_analysis_id && asset.asset_analysis_id.toString().includes(term)) ||
                    (asset.asset_id && asset.asset_id.toString().includes(term)) ||
                    (asset.asset_component_id && asset.asset_component_id.toString().includes(term)) ||
                    (assetName && assetName.toLowerCase().includes(term)) ||
                    (componentName && componentName.toLowerCase().includes(term)) ||
                    (componentType && componentType.toLowerCase().includes(term)) ||
                    (combinedComponent && combinedComponent.toLowerCase().includes(term)) ||
                    (asset.oil_analysis_results && asset.oil_analysis_results.toLowerCase().includes(term)) ||
                    (asset.recommendations && asset.recommendations.toLowerCase().includes(term)) ||
                    (asset.additional_notes && asset.additional_notes.toLowerCase().includes(term)) ||
                    (asset.created_by && asset.created_by.toLowerCase().includes(term))
                );
            });
        }

        // Apply sort
        filtered.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);

            if (sortOrder === 'newest') {
                return dateB - dateA;
            } else {
                return dateA - dateB;
            }
        });

        setFilteredAssets(filtered);
        setCurrentPage(1);
    }, [submittedReport, reportFilter, sortOrder, searchTerm, allAssets, allComponents, empInfo.emp_position, dateFrom, dateTo]);

    const getAllReportsCount = () => {
        return submittedReport.length;
    };

    const getPendingReportsCount = () => {
        if (empInfo.emp_position === 'l2') {
            return submittedReport.filter(report =>
                (!report.level2 || report.level2 === '' || report.level2 === null || report.level2 === '0' || report.level2 === 0 || report.level2 === false) &&
                (!report.level3 || report.level3 === '' || report.level3 === null || report.level3 === '0' || report.level3 === 0 || report.level3 === false)
            ).length;
        } else if (empInfo.emp_position === 'l3') {
            return submittedReport.filter(report =>
                (report.level2 == 1 || report.level2 == true || report.level2 == "1") &&
                (!report.level3 || report.level3 === '' || report.level3 === null || report.level3 === '0' || report.level3 === 0 || report.level3 === false)
            ).length;
        }
        return 0;
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    const handleSubmitAsset = () => {
        navigate('/add-A-R');
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    const handleView = (asset) => {
        const params = new URLSearchParams({ id: asset.asset_analysis_id });
        navigate(`/view-submitted-asset?${params.toString()}`);
    };

    if (loading) {
        return (
            <div style={{
                background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    textAlign: 'center',
                    color: '#EAB56F'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '3px solid rgba(234, 181, 111, 0.3)',
                        borderTop: '3px solid #EAB56F',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }} />
                    <p>Loading submitted assets...</p>
                </div>
                <style>
                    {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}
                </style>
            </div>
        );
    }

    return (
        <div style={{
            background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
            minHeight: '100vh',
            padding: '40px',
            position: 'relative',
            overflow: 'hidden',
            paddingTop: '50px'
        }}>
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
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
                background: 'rgba(255, 255, 255, 0.05)',
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
                background: 'rgba(255, 255, 255, 0.03)',
                top: '50%',
                left: '20%',
                animation: 'float 18s infinite ease-in-out',
                zIndex: 1
            }} />

            <div style={{ position: 'relative', zIndex: 2, maxWidth: '2000px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '30px', flexWrap: 'wrap', gap: '20px'
                }}>
                    <div>
                        <h1 style={{
                            marginBottom: '10px',
                            fontSize: '2.8rem',
                            fontWeight: '700',
                            color: '#EAB56F',
                            letterSpacing: '-0.5px',
                            textShadow: '0 4px 20px rgba(234, 181, 111, 0.2)'
                        }}>All Asset Analysis Report
                            <span
                                style={{
                                    fontSize: '2.8rem',
                                    fontWeight: '700',
                                    color: '#ff9100',
                                    paddingLeft: '10px',
                                    letterSpacing: '-0.5px',
                                    textShadow: '0 4px 20px rgba(255, 145, 0, 0.55)'
                                }}>{position}
                            </span>
                        </h1>
                        <p style={{
                            fontSize: '1rem',
                            color: 'rgba(255,255,255,0.7)',
                            margin: 0
                        }}>View and manage all submitted asset analyses</p>
                    </div>
                    <button
                        onClick={handleSubmitAsset}
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
                        <span style={{
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            marginRight: '8px'
                        }}>+</span>
                        Submit Report
                    </button>
                </div>

                {/* Stats Cards */}
                <div style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px',
                    marginBottom: '30px',
                    padding: '0 10px'
                }}>
                    <div style={{
                        background: '#EAB56F10',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '24px',
                        border: '2px solid #EAB56F',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #EAB56F, #F9982F)',
                                borderRadius: '15px',
                                padding: '12px',
                                display: 'inline-flex'
                            }}>
                                <FeatherIcon icon="package" size={28} color="#fff" />
                            </div>
                            <span style={{
                                fontSize: '3rem',
                                fontWeight: 'bold',
                                color: '#EAB56F',
                            }}>{totalAssets}</span>
                        </div>
                        <h3 style={{
                            color: '#F9982F',
                            marginBottom: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>Total Assets</h3>
                    </div>

                    <div style={{
                        background: '#8B5CF610',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '24px',
                        border: '2px solid #8B5CF6',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                background: '#8B5CF6',
                                borderRadius: '15px',
                                padding: '12px',
                                display: 'inline-flex'
                            }}>
                                <FeatherIcon icon="grid" size={28} color="#fff" />
                            </div>
                            <span style={{
                                fontSize: '3rem',
                                fontWeight: 'bold',
                                color: '#8B5CF6'
                            }}>{totalCategories}</span>
                        </div>
                        <h3 style={{
                            fontSize: '1rem',
                            color: '#8B5CF6',
                            marginBottom: '8px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>Total Categories</h3>
                    </div>

                    <div style={{
                        background: '#10B98110',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '24px',
                        border: '2px solid #10B981',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #10B981, #10B981)',
                                borderRadius: '15px',
                                padding: '12px',
                                display: 'inline-flex'
                            }}>
                                <FeatherIcon icon="map-pin" size={28} color="#fff" />
                            </div>
                            <span style={{
                                fontSize: '3rem',
                                fontWeight: 'bold',
                                color: '#10B981'
                            }}>{totalLocations}</span>
                        </div>
                        <h3 style={{
                            fontSize: '1rem',
                            color: '#10B981',
                            marginBottom: '8px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>Total Locations</h3>
                    </div>
                </div>

                {/* Filters Bar */}
                <div style={{
                    position: 'relative',
                    zIndex: 2,
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    marginBottom: '20px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>


                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: 1 }}>
                            {/* Search Input */}
                            <div style={{
                                display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '550px',
                                flex: '2 1 150px'
                            }}>
                                <span style={{ fontSize: '0.75rem', color: '#F9982F', fontWeight: '500', letterSpacing: '0.5px' }}>
                                    SEARCH
                                </span>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '40px',
                                    padding: '8px 16px',
                                    gap: '8px',
                                    minWidth: '240px',
                                    flex: 2,
                                    border: '2px solid #53535375'
                                }}

                                    onFocus={(e) => {
                                        e.target.closest('div').style.borderColor = '#E37239';
                                    }}
                                    onBlur={(e) => {
                                        e.target.closest('div').style.borderColor = '#53535375';
                                    }}
                                >
                                    <FeatherIcon icon="search" size={16} color="rgb(255, 153, 0)" />
                                    <input
                                        type="text"
                                        placeholder="Search by asset name, component name, ID..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            width: '100%',
                                            color: '#FFFFFF',
                                            fontSize: '0.85rem',
                                            outline: 'none'
                                        }}
                                    />
                                    {searchTerm && (
                                        <button onClick={clearSearch} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <FeatherIcon icon="x" size={14} color="rgba(255,255,255,0.4)" />
                                        </button>
                                    )}
                                </div>
                            </div>


                            {/* Date Range - From */}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ fontSize: '0.75rem', color: '#F9982F', fontWeight: '500', letterSpacing: '0.5px' }}>
                                    Date From
                                </span>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: 'rgba(0,0,0,0.3)',
                                        borderRadius: '40px',
                                        padding: '8px 16px',
                                        gap: '8px',
                                        border: '2px solid #53535375',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                    onFocus={(e) => {
                                        e.target.closest('div').style.borderColor = '#E37239';
                                    }}
                                    onBlur={(e) => {
                                        e.target.closest('div').style.borderColor = '#53535375';
                                    }}
                                    onClick={() => openDatePicker(fromDateInputRef)}
                                >
                                    <FeatherIcon icon="calendar" size={16} color="rgb(255, 153, 0)" />
                                    <input
                                        ref={fromDateInputRef}
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#FFFFFF',
                                            fontSize: '0.85rem',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            width: '130px'
                                        }}
                                    />
                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>From</span>
                                </div>
                            </div>


                            {/* Date Range - To */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ fontSize: '0.75rem', color: '#F9982F', fontWeight: '500', letterSpacing: '0.5px' }} >
                                    Date To
                                </span>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        background: 'rgba(0,0,0,0.3)',
                                        borderRadius: '40px',
                                        padding: '8px 16px',
                                        gap: '8px',
                                        border: '2px solid #53535375',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                    onFocus={(e) => {
                                        e.target.closest('div').style.borderColor = '#E37239';
                                    }}
                                    onBlur={(e) => {
                                        e.target.closest('div').style.borderColor = '#53535375';
                                    }}
                                    onClick={() => openDatePicker(toDateInputRef)}
                                >
                                    <FeatherIcon icon="calendar" size={16} color="rgb(255, 153, 0)" />
                                    <input
                                        ref={toDateInputRef}
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#FFFFFF',
                                            fontSize: '0.85rem',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            width: '130px'
                                        }}
                                    />
                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>To</span>
                                </div>
                            </div>
                            {/* Clear Date Filters */}
                            {(dateFrom || dateTo) && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'end' }}>
                                    <button
                                        onClick={clearDateFilters}
                                        style={{
                                            background: 'rgba(233, 181, 111, 0.2)',
                                            border: '2px solid #53535375',
                                            borderRadius: '40px',
                                            padding: '8px 16px',
                                            color: '#EAB56F',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.closest('div').style.borderColor = '#E37239';
                                        }}
                                        onBlur={(e) => {
                                            e.target.closest('div').style.borderColor = '#53535375';
                                        }}
                                    >
                                        <FeatherIcon icon="x" size={14} /> Clear Dates
                                    </button>
                                </div>
                            )}

                            {/* Report Filter Dropdown - Only for L2 and L3 */}
                            {empInfo.emp_position !== 'l1' && (
                                <div style={{
                                    position: 'relative',
                                    display: 'inline-block'
                                }}>
                                    <select
                                        value={reportFilter}
                                        onChange={(e) => setReportFilter(e.target.value)}
                                        style={{
                                            padding: '8px 32px 8px 16px',
                                            borderRadius: '40px',
                                            border: '2px solid #53535375',
                                            background: 'rgba(0,0,0,0.3)',
                                            color: '#EAB56F',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            appearance: 'none',
                                            outline: 'none'
                                        }}

                                        onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                        onBlur={(e) => e.target.style.borderColor = '#53535375'}
                                    >
                                        <option value="all" style={{ background: '#254252', color: '#EAB56F' }}>
                                            All Reports ({getAllReportsCount()})
                                        </option>
                                        <option value="pending" style={{ background: '#254252', color: '#F9982F' }}>
                                            Pending ({getPendingReportsCount()})
                                        </option>
                                    </select>
                                    <div style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                        color: '#EAB56F'
                                    }}>
                                        <FeatherIcon icon="chevron-down" size={14} />
                                    </div>
                                </div>
                            )}

                            {/* Sort button */}
                            {/* <button
                                onClick={toggleSortOrder}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 20px',
                                    borderRadius: '40px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    background: 'rgba(0,0,0,0.3)',
                                    color: '#F9982F',
                                    fontWeight: '500',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <FeatherIcon icon={sortOrder === 'newest' ? 'arrow-down' : 'arrow-up'} size={14} />
                                {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                            </button> */}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div style={{
                    position: 'relative',
                    zIndex: 2,
                    background: '#FFFFFF',
                    borderRadius: '20px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    overflow: 'hidden'
                }}>
                    <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            minWidth: '1200px'
                        }}>
                            <thead>
                                <tr style={{
                                    background: '#1E293B'
                                }}>
                                    <th style={{
                                        padding: '14px 20px',
                                        textAlign: 'left',
                                        color: '#fff',
                                        fontWeight: '600',
                                        fontSize: '0.7rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>Asset</th>
                                    <th style={{
                                        padding: '14px 20px',
                                        textAlign: 'left',
                                        color: '#fff',
                                        fontWeight: '600',
                                        fontSize: '0.7rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>Location</th>
                                    <th style={{
                                        padding: '14px 20px',
                                        textAlign: 'left',
                                        color: '#fff',
                                        fontWeight: '600',
                                        fontSize: '0.7rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>Category</th>
                                    <th style={{
                                        padding: '14px 20px',
                                        textAlign: 'left',
                                        color: '#fff',
                                        fontWeight: '600',
                                        fontSize: '0.7rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>Component</th>
                                    <th style={{
                                        padding: '14px 20px',
                                        textAlign: 'left',
                                        color: '#fff',
                                        fontWeight: '600',
                                        fontSize: '0.7rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>Analysis Date</th>
                                    <th style={{
                                        padding: '14px 20px',
                                        textAlign: 'left',
                                        color: '#fff',
                                        fontWeight: '600',
                                        fontSize: '0.7rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>Created By</th>
                                    <th style={{
                                        padding: '14px 20px',
                                        textAlign: 'left',
                                        color: '#fff',
                                        fontWeight: '600',
                                        fontSize: '0.7rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        cursor: 'pointer'
                                    }} onClick={toggleSortOrder}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            Created At
                                            <span>
                                                {sortOrder === 'newest' ?
                                                    <FeatherIcon icon="arrow-down" size={12} /> :
                                                    <FeatherIcon icon="arrow-up" size={12} />}
                                            </span>
                                        </div>
                                    </th>
                                    <th style={{
                                        padding: '14px 20px',
                                        textAlign: 'right',
                                        color: '#fff',
                                        fontWeight: '600',
                                        fontSize: '0.7rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((asset, index) => (
                                    <tr
                                        key={asset.asset_analysis_id}
                                        style={{
                                            borderBottom: '1px solid #F0F2F5',
                                            transition: 'background 0.15s',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                        onClick={() => handleView(asset)}
                                    >
                                        <td style={{
                                            padding: '14px 20px',
                                            color: '#1A2C3E',
                                            fontSize: '0.85rem',
                                            fontWeight: '500'
                                        }}>
                                            {getAssetName(asset.asset_id)}
                                        </td>
                                        <td style={{
                                            padding: '14px 20px',
                                            color: '#4A5B6E',
                                            fontSize: '0.8rem'
                                        }}>
                                            {getAssetLocation(asset.asset_id)}
                                        </td>
                                        <td style={{
                                            padding: '14px 20px'
                                        }}>
                                            <span style={{
                                                background: '#F3F0FF',
                                                color: '#6B4E9E',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.7rem',
                                                fontWeight: '500'
                                            }}>
                                                {getAssetCategories(asset.asset_id)}
                                            </span>
                                        </td>
                                        <td style={{
                                            padding: '14px 20px'
                                        }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                background: '#EAB56F20',
                                                color: '#E37239',
                                                fontSize: '0.7rem',
                                                fontWeight: '500'
                                            }}>
                                                {getCombinedComponent(asset.asset_component_id)}
                                            </span>
                                        </td>
                                        <td style={{
                                            padding: '14px 20px',
                                            color: '#4A5B6E',
                                            fontSize: '0.75rem'
                                        }}>
                                            {asset.analysis_date ?
                                                new Date(asset.analysis_date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : '-'
                                            }
                                        </td>
                                        <td style={{
                                            padding: '14px 20px',
                                            color: '#4A5B6E',
                                            fontSize: '0.75rem'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '24px',
                                                    background: '#E9EDF2',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <FeatherIcon icon="user" size={12} color="#8A9AAA" />
                                                </div>
                                                {asset.created_by || 'System'}
                                            </div>
                                        </td>
                                        <td style={{
                                            padding: '14px 20px',
                                            color: '#6C7A8A',
                                            fontSize: '0.75rem'
                                        }}>
                                            {asset.created_at ?
                                                new Date(asset.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : '-'
                                            }
                                        </td>
                                        <td style={{
                                            padding: '14px 20px',
                                            textAlign: 'right'
                                        }} onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleView(asset)}
                                                style={{
                                                    background: 'linear-gradient(135deg, #EAB56F, #F9982F)',
                                                    border: 'none',
                                                    fontSize: '0.75rem',
                                                    cursor: 'pointer',
                                                    padding: '6px 16px',
                                                    borderRadius: '8px',
                                                    transition: 'all 0.2s ease',
                                                    color: '#fff',
                                                    fontWeight: '500'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(234, 181, 111, 0.4)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredAssets.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px'
                            }}>
                                <FeatherIcon icon="inbox" size={48} style={{
                                    color: '#d1b289',
                                    marginBottom: '20px',
                                    opacity: 0.5
                                }} />
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    color: '#333',
                                    marginBottom: '10px'
                                }}>
                                    {searchTerm
                                        ? 'No Matching Submitted Assets Found'
                                        : reportFilter === 'pending'
                                            ? 'No Pending Reports Found'
                                            : 'No Submitted Assets Found'}
                                </h3>
                                <p style={{
                                    color: '#666',
                                    marginBottom: '20px'
                                }}>
                                    {searchTerm
                                        ? `No submitted assets match your search term "${searchTerm}". Try different keywords.`
                                        : reportFilter === 'pending'
                                            ? "There are no pending reports requiring your action at the moment."
                                            : "There are no submitted assets at the moment."}
                                </p>
                                {searchTerm && (
                                    <button
                                        onClick={clearSearch}
                                        style={{
                                            background: 'linear-gradient(45deg, #EAB56F, #F9982F)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '10px 20px',
                                            fontSize: '0.95rem',
                                            fontWeight: '600',
                                            color: '#fff',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {filteredAssets.length > 0 && filteredAssets.length > itemsPerPage && (
                            <div style={{
                                padding: '16px 24px',
                                borderTop: '1px solid #F0F2F5',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '12px'
                            }}>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#6C7A8A'
                                }}>
                                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAssets.length)} of {filteredAssets.length} entries
                                </div>
                                <div style={{
                                    display: 'flex',
                                    gap: '6px'
                                }}>
                                    <button
                                        onClick={prevPage}
                                        disabled={currentPage === 1}
                                        style={{
                                            background: currentPage === 1 ? '#F8F9FC' : '#FFFFFF',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '8px',
                                            padding: '6px 12px',
                                            fontSize: '0.75rem',
                                            color: currentPage === 1 ? '#B0B8C4' : '#3A4B5E',
                                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <FeatherIcon icon="chevron-left" size={12} /> Prev
                                    </button>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNumber;
                                        if (totalPages <= 5) {
                                            pageNumber = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNumber = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNumber = totalPages - 4 + i;
                                        } else {
                                            pageNumber = currentPage - 2 + i;
                                        }
                                        if (pageNumber > totalPages) return null;
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => paginate(pageNumber)}
                                                style={{
                                                    background: currentPage === pageNumber ? '#EAB56F' : '#FFFFFF',
                                                    border: currentPage === pageNumber ? '1px solid #EAB56F' : '1px solid #E2E8F0',
                                                    borderRadius: '8px',
                                                    padding: '6px 12px',
                                                    minWidth: '36px',
                                                    color: currentPage === pageNumber ? '#FFFFFF' : '#3A4B5E',
                                                    fontWeight: currentPage === pageNumber ? '600' : '400',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    })}

                                    <button
                                        onClick={nextPage}
                                        disabled={currentPage === totalPages}
                                        style={{
                                            background: currentPage === totalPages ? '#F8F9FC' : '#FFFFFF',
                                            border: '1px solid #E2E8F0',
                                            borderRadius: '8px',
                                            padding: '6px 12px',
                                            fontSize: '0.75rem',
                                            color: currentPage === totalPages ? '#B0B8C4' : '#3A4B5E',
                                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        Next <FeatherIcon icon="chevron-right" size={12} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>
                {`
                    @keyframes float {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(50px, -50px) rotate(120deg); }
                        66% { transform: translate(-30px, 30px) rotate(240deg); }
                    }
                    
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }

                    /* Hide the default calendar icon in all browsers */
                    input[type="date"]::-webkit-calendar-picker-indicator {
                        opacity: 0;
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        left: 0;
                        top: 0;
                        cursor: pointer;
                        z-index: 2;
                    }

                    input[type="date"] {
                        position: relative;
                    }

                    input[type="date"]::-ms-clear,
                    input[type="date"]::-ms-reveal {
                        display: none;
                    }

                    input[type="date"] {
                        -webkit-appearance: none;
                        appearance: none;
                    }
                `}
            </style>
        </div>
    );
}