



// import { useEffect, useState } from "react";
// import axios from 'axios';
// import config from 'config';

// import FeatherIcon from 'feather-icons-react';
// import { useNavigate } from 'react-router';

// export default function SetupAllOptions() {
//     const [assets, setAssets] = useState([]);
//     const [filteredAssets, setFilteredAssets] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [showActive, setShowActive] = useState(true);
//     const [sortOrder, setSortOrder] = useState('newest');
//     const [searchTerm, setSearchTerm] = useState('');

//     const [currentPage, setCurrentPage] = useState(1);
//     const [itemsPerPage] = useState(8);

//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchAssets = async () => {
//             try {
//                 const res = await axios.get(`${config.baseApi}/assetsAnalysis/get-all-options`);
//                 const data = res.data || [];

//                 console.log('Fetched options:', data);
//                 setAssets(data); // ← Store the fetched data
//             } catch (error) {
//                 console.error('Error fetching assets:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchAssets();
//     }, []);

//     // Filter, search, and sort assets when any filter changes
//     useEffect(() => {
//         let filtered = [...assets]; // Start with all assets

//         // You can add filtering logic here if needed
//         // For now, just sort
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
//     }, [sortOrder, assets]);

//     // Pagination logic
//     const indexOfLastItem = currentPage * itemsPerPage;
//     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//     const currentItems = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);
//     const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

//     const paginate = (pageNumber) => setCurrentPage(pageNumber);
//     const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
//     const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

//     const handleAddAssetOption = () => {
//         navigate('/add-setup');
//     };

//     const handleView = (asset) => {
//         const params = new URLSearchParams({ id: asset.option_id });
//         navigate(`/view-setup-options?${params.toString()}`);
//     };

//     const toggleSortOrder = () => {
//         setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
//     };

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

//             {/* Header with title and add button */}
//             <div style={{
//                 position: 'relative',
//                 zIndex: 2,
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 marginBottom: '30px',
//                 padding: '0 10px'
//             }}>
//                 <div>
//                     <h1 style={{
//                         fontSize: '3.5rem',
//                         fontWeight: '800',
//                         color: '#EAB56F',
//                         marginBottom: '10px',
//                         letterSpacing: '-0.5px',
//                         textShadow: '0 4px 20px rgba(234, 181, 111, 0.2)'
//                     }}>All Asset Options</h1>
//                     <p style={{
//                         fontSize: '1.2rem',
//                         color: '#F9982F',
//                         opacity: '0.9',
//                         fontWeight: '400',
//                         maxWidth: '600px',
//                         margin: '0'
//                     }}>View and manage all options for adding an asset</p>
//                 </div>
//                 <button
//                     onClick={handleAddAssetOption}
//                     style={{
//                         background: 'linear-gradient(45deg, #EAB56F, #F9982F, #E37239)',
//                         border: 'none',
//                         borderRadius: '16px',
//                         padding: '18px 36px',
//                         fontSize: '1.1rem',
//                         fontWeight: '600',
//                         letterSpacing: '0.5px',
//                         color: '#fff',
//                         cursor: 'pointer',
//                         minWidth: '200px',
//                         transition: 'all 0.3s ease',
//                         boxShadow: '0 10px 20px rgba(227, 114, 57, 0.3)'
//                     }}
//                     onMouseEnter={(e) => {
//                         e.target.style.transform = 'scale(1.02)';
//                         e.target.style.boxShadow = '0 15px 35px -10px #E37239';
//                     }}
//                     onMouseLeave={(e) => {
//                         e.target.style.transform = 'scale(1)';
//                         e.target.style.boxShadow = '0 10px 30px -10px #E37239';
//                     }}
//                 >
//                     <span style={{
//                         fontSize: '1.2rem',
//                         fontWeight: 'bold'
//                     }}>+</span>
//                     Add New Asset Options
//                 </button>
//             </div>

//             {/* Table container */}
//             <div style={{
//                 position: 'relative',
//                 zIndex: 2,
//                 background: '#f1ddc2',
//                 borderRadius: '24px',
//                 padding: '10px',
//                 boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
//                 backdropFilter: 'blur(10px)'
//             }}>
//                 <table style={{
//                     width: '100%',
//                     borderCollapse: 'collapse',
//                     borderRadius: '16px',
//                     overflow: 'hidden'
//                 }}>
//                     <thead>
//                         <tr style={{
//                             background: '#d1b289'
//                         }}>
//                             <th style={{
//                                 padding: '16px 20px',
//                                 textAlign: 'left',
//                                 color: '#fff',
//                                 fontWeight: '600',
//                                 fontSize: '0.9rem',
//                                 textTransform: 'uppercase',
//                                 letterSpacing: '0.5px'
//                             }}>Asset Type</th>
//                             <th style={{
//                                 padding: '16px 20px',
//                                 textAlign: 'left',
//                                 color: '#fff',
//                                 fontWeight: '600',
//                                 fontSize: '0.9rem',
//                                 textTransform: 'uppercase',
//                                 letterSpacing: '0.5px'
//                             }}>Asset Location</th>
//                             <th style={{
//                                 padding: '16px 20px',
//                                 textAlign: 'left',
//                                 color: '#fff',
//                                 fontWeight: '600',
//                                 fontSize: '0.9rem',
//                                 textTransform: 'uppercase',
//                                 letterSpacing: '0.5px'
//                             }}>Asset Category</th>
//                             <th style={{
//                                 padding: '16px 20px',
//                                 textAlign: 'left',
//                                 color: '#fff',
//                                 fontWeight: '600',
//                                 fontSize: '0.9rem',
//                                 textTransform: 'uppercase',
//                                 letterSpacing: '0.5px'
//                             }}>Component Types</th>
//                             <th style={{
//                                 padding: '16px 20px',
//                                 textAlign: 'left',
//                                 color: '#fff',
//                                 fontWeight: '600',
//                                 fontSize: '0.9rem',
//                                 textTransform: 'uppercase',
//                                 letterSpacing: '0.5px'
//                             }}>Created By</th>
//                             <th style={{
//                                 padding: '16px 20px',
//                                 textAlign: 'left',
//                                 color: '#fff',
//                                 fontWeight: '600',
//                                 fontSize: '0.9rem',
//                                 textTransform: 'uppercase',
//                                 letterSpacing: '0.5px',
//                                 cursor: 'pointer'
//                             }} onClick={toggleSortOrder}>
//                                 <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
//                                     Created At
//                                     <span style={{ fontSize: '1rem', opacity: 0.8 }}>
//                                         {sortOrder === 'newest' ?
//                                             <FeatherIcon icon="arrow-down" size={14} /> :
//                                             <FeatherIcon icon="arrow-up" size={14} />
//                                         }
//                                     </span>
//                                 </div>
//                             </th>
//                             <th style={{
//                                 padding: '16px 20px',
//                                 textAlign: 'left',
//                                 color: '#fff',
//                                 fontWeight: '600',
//                                 fontSize: '0.9rem',
//                                 textTransform: 'uppercase',
//                                 letterSpacing: '0.5px'
//                             }}>Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {currentItems.map((asset, index) => (
//                             <tr
//                                 key={asset.option_id}
//                                 style={{
//                                     borderBottom: '1px solid #e7cfaf',
//                                     transition: 'background-color 0.3s ease',
//                                     cursor: 'pointer',
//                                     animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
//                                 }}
//                                 onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0ccb2'}
//                                 onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
//                                 onClick={() => handleView(asset)}
//                             >
//                                 <td style={{
//                                     padding: '16px 20px',
//                                     color: '#333',
//                                     fontSize: '0.95rem'
//                                 }}>
//                                     {asset.option_asset_type || '-'}
//                                 </td>
//                                 <td style={{
//                                     padding: '16px 20px',
//                                     color: '#333',
//                                     fontSize: '0.95rem'
//                                 }}>
//                                     {asset.option_asset_location || '-'}
//                                 </td>
//                                 <td style={{
//                                     padding: '16px 20px',
//                                     color: '#333',
//                                     fontSize: '0.95rem'
//                                 }}>
//                                     <span style={{
//                                         background: '#f3e8ff',
//                                         padding: '4px 8px',
//                                         borderRadius: '6px',
//                                         fontSize: '0.85rem',
//                                         color: '#764ba2'
//                                     }}>
//                                         {asset.option_asset_category || '-'}
//                                     </span>
//                                 </td>
//                                 <td style={{
//                                     padding: '16px 20px',
//                                     color: '#333',
//                                     fontSize: '0.85rem',
//                                     maxWidth: '300px',
//                                     wordBreak: 'break-word'
//                                 }}>
//                                     {asset.option_component_types || '-'}
//                                 </td>
//                                 <td style={{
//                                     padding: '16px 20px',
//                                     color: '#333',
//                                     fontSize: '0.95rem'
//                                 }}>
//                                     <span style={{
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: '4px',
//                                         color: '#666'
//                                     }}>
//                                         {asset.created_by || 'System'}
//                                     </span>
//                                 </td>
//                                 <td style={{
//                                     padding: '16px 20px',
//                                     color: '#333',
//                                     fontSize: '0.95rem'
//                                 }}>
//                                     <span style={{
//                                         display: 'flex',
//                                         alignItems: 'center',
//                                         gap: '4px',
//                                         color: '#666'
//                                     }}>
//                                         {asset.created_at ?
//                                             new Date(asset.created_at).toLocaleDateString('en-US', {
//                                                 year: 'numeric',
//                                                 month: 'short',
//                                                 day: 'numeric',
//                                                 hour: '2-digit',
//                                                 minute: '2-digit'
//                                             }) : '-'
//                                         }
//                                     </span>
//                                 </td>
//                                 <td style={{
//                                     padding: '16px 20px',
//                                     color: '#333',
//                                     fontSize: '0.95rem'
//                                 }}>
//                                     <div style={{
//                                         display: 'flex',
//                                         gap: '8px'
//                                     }}>
//                                         <button
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 handleView(asset);
//                                             }}
//                                             style={{
//                                                 background: 'none',
//                                                 border: 'none',
//                                                 fontSize: '1rem',
//                                                 cursor: 'pointer',
//                                                 padding: '6px 10px',
//                                                 borderRadius: '8px',
//                                                 transition: 'all 0.2s ease',
//                                                 opacity: '0.7',
//                                                 color: '#4a5568'
//                                             }}
//                                             onMouseEnter={(e) => {
//                                                 e.currentTarget.style.opacity = '1';
//                                                 e.currentTarget.style.background = '#e0c3a2';
//                                             }}
//                                             onMouseLeave={(e) => {
//                                                 e.currentTarget.style.opacity = '0.7';
//                                                 e.currentTarget.style.background = 'none';
//                                             }}
//                                             title="View"
//                                         >
//                                             View
//                                         </button>
//                                     </div>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>

//                 {filteredAssets.length === 0 && (
//                     <div style={{
//                         textAlign: 'center',
//                         padding: '60px 20px'
//                     }}>
//                         <h3 style={{
//                             fontSize: '1.5rem',
//                             color: '#333',
//                             marginBottom: '10px'
//                         }}>
//                             No Asset Options Found
//                         </h3>
//                         <p style={{
//                             color: '#666',
//                             marginBottom: '20px'
//                         }}>
//                             There are no asset options available at the moment.
//                         </p>
//                     </div>
//                 )}

//                 {/* Pagination Controls */}
//                 {filteredAssets.length > itemsPerPage && (
//                     <div style={{
//                         position: 'relative',
//                         zIndex: 2,
//                         display: 'flex',
//                         justifyContent: 'center',
//                         alignItems: 'center',
//                         marginTop: '30px',
//                         padding: '20px',
//                     }}>
//                         <div style={{
//                             display: 'flex',
//                             gap: '8px',
//                             alignItems: 'center'
//                         }}>
//                             <button
//                                 onClick={prevPage}
//                                 disabled={currentPage === 1}
//                                 style={{
//                                     background: currentPage === 1 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(234, 181, 111, 0.47)',
//                                     border: '1px solid rgba(133, 104, 67, 0.3)',
//                                     borderRadius: '8px',
//                                     padding: '10px 16px',
//                                     color: currentPage === 1 ? '#666' : '#664e30',
//                                     cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     gap: '5px',
//                                     transition: 'all 0.3s ease'
//                                 }}
//                             >
//                                 <FeatherIcon icon="chevron-left" size={16} />
//                                 Previous
//                             </button>

//                             {/* Page Numbers */}
//                             <div style={{
//                                 display: 'flex',
//                                 gap: '5px'
//                             }}>
//                                 {[...Array(totalPages)].map((_, index) => {
//                                     const pageNumber = index + 1;
//                                     if (
//                                         pageNumber === 1 ||
//                                         pageNumber === totalPages ||
//                                         (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
//                                     ) {
//                                         return (
//                                             <button
//                                                 key={pageNumber}
//                                                 onClick={() => paginate(pageNumber)}
//                                                 style={{
//                                                     background: currentPage === pageNumber ?
//                                                         'linear-gradient(45deg, #EAB56F, #F9982F)' :
//                                                         'rgba(255, 255, 255, 0.05)',
//                                                     border: '1px solid rgba(234, 181, 111, 0.3)',
//                                                     borderRadius: '8px',
//                                                     padding: '10px 16px',
//                                                     color: currentPage === pageNumber ? '#fff' : '#81623a',
//                                                     cursor: 'pointer',
//                                                     fontWeight: currentPage === pageNumber ? '600' : '400',
//                                                     transition: 'all 0.3s ease',
//                                                     minWidth: '40px'
//                                                 }}
//                                             >
//                                                 {pageNumber}
//                                             </button>
//                                         );
//                                     } else if (
//                                         pageNumber === currentPage - 2 ||
//                                         pageNumber === currentPage + 2
//                                     ) {
//                                         return <span key={pageNumber} style={{ color: '#EAB56F', padding: '0 5px' }}>...</span>;
//                                     }
//                                     return null;
//                                 })}
//                             </div>

//                             <button
//                                 onClick={nextPage}
//                                 disabled={currentPage === totalPages}
//                                 style={{
//                                     background: currentPage === totalPages ? 'rgba(255, 255, 255, 0.05)' : 'rgba(234, 181, 111, 0.47)',
//                                     border: '1px solid rgba(133, 104, 67, 0.3)',
//                                     borderRadius: '8px',
//                                     padding: '10px 16px',
//                                     color: currentPage === totalPages ? '#666' : '#664e30',
//                                     cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     gap: '5px',
//                                     transition: 'all 0.3s ease'
//                                 }}
//                             >
//                                 Next
//                                 <FeatherIcon icon="chevron-right" size={16} />
//                             </button>
//                         </div>
//                     </div>
//                 )}
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
//                 `}
//             </style>
//         </div>
//     );
// }
import { useEffect, useState, useMemo, useRef } from "react";
import axios from 'axios';
import config from 'config';
import FeatherIcon from 'feather-icons-react';
import { useNavigate } from 'react-router';

export default function SetupAllOptions() {
    const [assets, setAssets] = useState([]);
    const [filteredAssets, setFilteredAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const navigate = useNavigate();

    // Refs for date inputs
    const fromDateInputRef = useRef(null);
    const toDateInputRef = useRef(null);

    // Fetch data
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const res = await axios.get(`${config.baseApi}/assetsAnalysis/get-all-options`);
                const data = res.data || [];
                setAssets(data);
            } catch (error) {
                console.error('Error fetching assets:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssets();
    }, []);

    // Filter, search, sort logic
    useEffect(() => {
        let filtered = [...assets];

        // Search
        if (searchTerm.trim()) {
            filtered = filtered.filter(asset =>
                (asset.option_asset_type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (asset.option_asset_location?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (asset.option_asset_category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (asset.option_component_types?.toLowerCase() || '').includes(searchTerm.toLowerCase())
            );
        }

        // Date range filter - from
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(asset => {
                if (!asset.created_at) return false;
                const assetDate = new Date(asset.created_at);
                return assetDate >= fromDate;
            });
        }

        // Date range filter - to
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(asset => {
                if (!asset.created_at) return false;
                const assetDate = new Date(asset.created_at);
                return assetDate <= toDate;
            });
        }

        // Sorting
        filtered.sort((a, b) => {
            let valA, valB;
            switch (sortField) {
                case 'asset_type':
                    valA = a.option_asset_type || '';
                    valB = b.option_asset_type || '';
                    break;
                case 'location':
                    valA = a.option_asset_location || '';
                    valB = b.option_asset_location || '';
                    break;
                case 'category':
                    valA = a.option_asset_category || '';
                    valB = b.option_asset_category || '';
                    break;
                case 'created_by':
                    valA = a.created_by || '';
                    valB = b.created_by || '';
                    break;
                default:
                    valA = new Date(a.created_at || 0);
                    valB = new Date(b.created_at || 0);
            }
            if (sortOrder === 'asc') {
                return valA > valB ? 1 : -1;
            } else {
                return valA < valB ? 1 : -1;
            }
        });

        setFilteredAssets(filtered);
        setCurrentPage(1);
    }, [assets, searchTerm, dateFrom, dateTo, sortField, sortOrder]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    const handleAddAssetOption = () => navigate('/add-setup');
    const handleView = (asset) => navigate(`/view-setup-options?id=${asset.option_id}`);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return <FeatherIcon icon="chevron-down" size={14} style={{ opacity: 0.3 }} />;
        return sortOrder === 'asc' ? <FeatherIcon icon="chevron-up" size={14} /> : <FeatherIcon icon="chevron-down" size={14} />;
    };

    const clearDateFilters = () => {
        setDateFrom('');
        setDateTo('');
    };

    // Handle clicking on the date input container to open date picker
    const handleFromDateClick = () => {
        if (fromDateInputRef.current) {
            fromDateInputRef.current.showPicker();
        }
    };

    const handleToDateClick = () => {
        if (toDateInputRef.current) {
            toDateInputRef.current.showPicker();
        }
    };

    // Statistics
    const stats = {
        total: assets.length,
        categories: new Set(assets.map(a => a.option_asset_category)).size,
        locations: new Set(assets.map(a => a.option_asset_location)).size,
        recent: assets.filter(a => new Date(a.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
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

            {/* Header */}
            <div style={{ position: 'relative', zIndex: 2, marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                    <div>
                        <h1 style={{
                            fontSize: '3.5rem',
                            fontWeight: '800',
                            color: '#EAB56F',
                            marginBottom: '10px',
                            letterSpacing: '-0.5px',
                            textShadow: '0 4px 20px rgba(234, 181, 111, 0.2)'
                        }}>
                            Asset Options Library
                        </h1>
                        <p style={{
                            fontSize: '1.2rem',
                            color: '#F9982F',
                            opacity: '0.9',
                            fontWeight: '400'
                        }}>
                            Manage and configure all asset templates across your organization
                        </p>
                    </div>
                    <button onClick={handleAddAssetOption} style={{
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
                        }}>
                        <FeatherIcon icon="plus" size={18} /> New Asset Option
                    </button>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    {[
                        { label: 'Total Options', value: stats.total, icon: 'list', color: '#ff9100', border: '#EAB56F', bg: '#EAB56F10' },
                        { label: 'Categories', value: stats.categories, icon: 'grid', color: '#ae00ff', border: '#8B5CF6', bg: '#8B5CF610' },
                        { label: 'Locations', value: stats.locations, icon: 'map-pin', color: '#2ba72b', border: '#10B981', bg: '#10B98110' },

                    ].map(stat => (
                        <div key={stat.label} style={{
                            background: `${stat.bg}`,
                            backdropFilter: 'blur(10px)',
                            borderRadius: '20px',
                            padding: '24px',
                            border: `2px solid ${stat.border}`,
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: '700', color: `${stat.color}` }}>{stat.value}</div>
                                    <div style={{ fontSize: '0.75rem', color: `${stat.color}`, marginTop: '4px', textTransform: 'uppercase', fontWeight: '600', }}>{stat.label}</div>
                                </div>
                                <FeatherIcon icon={stat.icon} size={28} color={stat.color} opacity={0.7} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters Bar - Search and Date Range */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: 1 }}>
                            {/* Search Input */}
                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '40px', padding: '8px 16px', gap: '8px', minWidth: '240px', flex: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <FeatherIcon icon="search" size={16} color="rgb(255, 153, 0)" />
                                <input type="text" placeholder="Search by type, location, or category..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ background: 'none', border: 'none', width: '100%', color: '#FFFFFF', fontSize: '0.85rem', outline: 'none' }} />
                                {searchTerm && <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FeatherIcon icon="x" size={14} color="rgba(255,255,255,0.4)" /></button>}
                            </div>

                            {/* Date Range Picker - From - No Icon */}
                            <div
                                onClick={handleFromDateClick}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '40px',
                                    padding: '8px 16px',
                                    gap: '8px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
                            >
                                <FeatherIcon icon="calendar" size={16} color="rgb(255, 153, 0)" />
                                <input
                                    ref={fromDateInputRef}
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
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

                            {/* Date Range Picker - To - No Icon */}
                            <div
                                onClick={handleToDateClick}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: 'rgba(0,0,0,0.3)',
                                    borderRadius: '40px',
                                    padding: '8px 16px',
                                    gap: '8px',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
                            >
                                <FeatherIcon icon="calendar" size={16} color="rgb(255, 153, 0)" />
                                <input
                                    ref={toDateInputRef}
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
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

                            {/* Clear Date Filters Button */}
                            {(dateFrom || dateTo) && (
                                <button onClick={clearDateFilters} style={{ background: 'rgba(233, 181, 111, 0.2)', border: '1px solid rgba(233, 181, 111, 0.3)', borderRadius: '40px', padding: '8px 16px', color: '#EAB56F', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(233, 181, 111, 0.3)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(233, 181, 111, 0.2)'}>
                                    <FeatherIcon icon="x" size={14} /> Clear Dates
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Table View Only - No Scrollbars */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                background: '#FFFFFF',
                borderRadius: '20px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                overflow: 'hidden'
            }}>
                <div style={{ overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none' }} className="hide-scrollbar">
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                        <thead>
                            <tr style={{ background: '#F8F9FC', borderBottom: '1px solid #E9EDF2' }}>
                                {[
                                    { field: 'asset_type', label: 'Asset Type', icon: 'sliders' },
                                    { field: 'location', label: 'Location', icon: 'map-pin' },
                                    { field: 'category', label: 'Category', icon: 'grid' },
                                    { field: 'component_types', label: 'Component Types', icon: 'cpu' },
                                    { field: 'created_by', label: 'Created By', icon: 'user' },
                                    { field: 'created_at', label: 'Created Date', icon: 'calendar' }
                                ].map(col => (
                                    <th key={col.field} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '0.7rem', fontWeight: '600', color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.5px', cursor: 'pointer' }} onClick={() => handleSort(col.field)}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FeatherIcon icon={col.icon} size={12} />
                                            {col.label}
                                            {getSortIcon(col.field)}
                                        </div>
                                    </th>
                                ))}
                                <th style={{ padding: '14px 20px', textAlign: 'right', fontSize: '0.7rem', fontWeight: '600', color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '60px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', color: '#8A9AAA' }}>
                                            <div style={{ width: '24px', height: '24px', border: '3px solid #EAB56F', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                            Loading asset options...
                                        </div>
                                    </td>
                                </tr>
                            ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '60px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#8A9AAA' }}>
                                            <FeatherIcon icon="package" size={48} strokeWidth={1} />
                                            <span>No asset options found</span>
                                            <button onClick={handleAddAssetOption} style={{ background: 'none', border: '1px solid #EAB56F', color: '#EAB56F', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', marginTop: '8px' }}>
                                                Create your first option
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((asset, idx) => (
                                    <tr key={asset.option_id} style={{ borderBottom: '1px solid #F0F2F5', transition: 'background 0.15s', cursor: 'pointer' }} onClick={() => handleView(asset)} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAFAFA'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <td style={{ padding: '14px 20px', fontSize: '0.85rem', fontWeight: '500', color: '#1A2C3E' }}>{asset.option_asset_type || '—'}</td>
                                        <td style={{ padding: '14px 20px', fontSize: '0.8rem', color: '#4A5B6E' }}>{asset.option_asset_location || '—'}</td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <span style={{ background: '#F3F0FF', color: '#6B4E9E', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '500' }}>
                                                {asset.option_asset_category || '—'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 20px', fontSize: '0.8rem', color: '#4A5B6E', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={asset.option_component_types}>
                                            {asset.option_component_types || '—'}
                                        </td>
                                        <td style={{ padding: '14px 20px', fontSize: '0.8rem', color: '#4A5B6E' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '24px', background: '#E9EDF2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FeatherIcon icon="user" size={12} color="#8A9AAA" />
                                                </div>
                                                {asset.created_by || 'System'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 20px', fontSize: '0.75rem', color: '#6C7A8A' }}>
                                            {asset.created_at ? new Date(asset.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                        </td>
                                        <td style={{ padding: '14px 20px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => handleView(asset)} style={{ background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '5px 14px', fontSize: '0.7rem', fontWeight: '500', color: '#4A5B6E', cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#EAB56F'; e.currentTarget.style.color = '#EAB56F'; e.currentTarget.style.background = '#FFF8F0'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#4A5B6E'; e.currentTarget.style.background = 'transparent'; }}>
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && filteredAssets.length > itemsPerPage && (
                    <div style={{ padding: '16px 24px', borderTop: '1px solid #F0F2F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#6C7A8A' }}>
                            Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filteredAssets.length)} of {filteredAssets.length}
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={prevPage} disabled={currentPage === 1} style={{ background: currentPage === 1 ? '#F8F9FC' : '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', color: currentPage === 1 ? '#B0B8C4' : '#3A4B5E', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FeatherIcon icon="chevron-left" size={12} /> Prev
                            </button>
                            {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                                let pageNum = idx + 1;
                                if (totalPages > 5 && currentPage > 3 && idx === 0) return <span key="ellipsis1" style={{ padding: '0 4px', color: '#8A9AAA' }}>...</span>;
                                if (totalPages > 5 && currentPage > 3 && idx === 1) pageNum = currentPage - 1;
                                if (totalPages > 5 && currentPage > 3 && idx === 2) pageNum = currentPage;
                                if (totalPages > 5 && currentPage > 3 && idx === 3) pageNum = currentPage + 1;
                                if (totalPages > 5 && currentPage > 3 && idx === 4 && currentPage + 1 < totalPages) return <span key="ellipsis2" style={{ padding: '0 4px', color: '#8A9AAA' }}>...</span>;
                                if (pageNum > totalPages) return null;
                                return (
                                    <button key={pageNum} onClick={() => paginate(pageNum)} style={{ background: currentPage === pageNum ? '#EAB56F' : '#FFFFFF', border: currentPage === pageNum ? '1px solid #EAB56F' : '1px solid #E2E8F0', borderRadius: '8px', padding: '6px 12px', minWidth: '36px', color: currentPage === pageNum ? '#FFFFFF' : '#3A4B5E', fontWeight: currentPage === pageNum ? '600' : '400', cursor: 'pointer' }}>
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button onClick={nextPage} disabled={currentPage === totalPages} style={{ background: currentPage === totalPages ? '#F8F9FC' : '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', color: currentPage === totalPages ? '#B0B8C4' : '#3A4B5E', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                Next <FeatherIcon icon="chevron-right" size={12} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes float { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 33% { transform: translate(50px, -50px) rotate(120deg); } 66% { transform: translate(-30px, 30px) rotate(240deg); } }
                @keyframes spin { to { transform: rotate(360deg); } }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                input[type="date"]::-webkit-calendar-picker-indicator {
                    cursor: pointer;
                    filter: invert(0.6);
                    opacity: 0;
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    left: 0;
                    top: 0;
                }
            `}</style>
        </div>
    );
}