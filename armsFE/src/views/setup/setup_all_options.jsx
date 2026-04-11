// import axios from 'axios';
// import config from 'config';
// import { useEffect } from 'react';


// export default function SetupAllOptions() {
//     useEffect(() => {
//         const fetch = async () => {
//             const res = await axios.get(`${config.baseApi}/assetsAnalysis/get-all-options`);
//             const data = res.data || [];

//             console.log('Fetched options:', data);
//         }
//         fetch();
//     }, [])
// }



import { useEffect, useState } from "react";
import axios from 'axios';
import config from 'config';

import FeatherIcon from 'feather-icons-react';
import { useNavigate } from 'react-router';

export default function SetupAllOptions() {
    const [assets, setAssets] = useState([]);
    const [filteredAssets, setFilteredAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showActive, setShowActive] = useState(true);
    const [sortOrder, setSortOrder] = useState('newest');
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const res = await axios.get(`${config.baseApi}/assetsAnalysis/get-all-options`);
                const data = res.data || [];

                console.log('Fetched options:', data);
                setAssets(data); // ← Store the fetched data
            } catch (error) {
                console.error('Error fetching assets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssets();
    }, []);

    // Filter, search, and sort assets when any filter changes
    useEffect(() => {
        let filtered = [...assets]; // Start with all assets

        // You can add filtering logic here if needed
        // For now, just sort
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
    }, [sortOrder, assets]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    const handleAddAssetOption = () => {
        navigate('/add-setup');
    };

    const handleView = (asset) => {
        const params = new URLSearchParams({ id: asset.option_id });
        navigate(`/view-setup-options?${params.toString()}`);
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
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

            {/* Header with title and add button */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                padding: '0 10px'
            }}>
                <div>
                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: '800',
                        color: '#EAB56F',
                        marginBottom: '10px',
                        letterSpacing: '-0.5px',
                        textShadow: '0 4px 20px rgba(234, 181, 111, 0.2)'
                    }}>All Asset Options</h1>
                    <p style={{
                        fontSize: '1.2rem',
                        color: '#F9982F',
                        opacity: '0.9',
                        fontWeight: '400',
                        maxWidth: '600px',
                        margin: '0'
                    }}>View and manage all options for adding an asset</p>
                </div>
                <button
                    onClick={handleAddAssetOption}
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
                        fontWeight: 'bold'
                    }}>+</span>
                    Add New Asset Options
                </button>
            </div>

            {/* Table container */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                background: '#f1ddc2',
                borderRadius: '24px',
                padding: '10px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    borderRadius: '16px',
                    overflow: 'hidden'
                }}>
                    <thead>
                        <tr style={{
                            background: '#d1b289'
                        }}>
                            <th style={{
                                padding: '16px 20px',
                                textAlign: 'left',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>Asset Type</th>
                            <th style={{
                                padding: '16px 20px',
                                textAlign: 'left',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>Asset Location</th>
                            <th style={{
                                padding: '16px 20px',
                                textAlign: 'left',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>Asset Category</th>
                            <th style={{
                                padding: '16px 20px',
                                textAlign: 'left',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>Component Types</th>
                            <th style={{
                                padding: '16px 20px',
                                textAlign: 'left',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>Created By</th>
                            <th style={{
                                padding: '16px 20px',
                                textAlign: 'left',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                cursor: 'pointer'
                            }} onClick={toggleSortOrder}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    Created At
                                    <span style={{ fontSize: '1rem', opacity: 0.8 }}>
                                        {sortOrder === 'newest' ?
                                            <FeatherIcon icon="arrow-down" size={14} /> :
                                            <FeatherIcon icon="arrow-up" size={14} />
                                        }
                                    </span>
                                </div>
                            </th>
                            <th style={{
                                padding: '16px 20px',
                                textAlign: 'left',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((asset, index) => (
                            <tr
                                key={asset.option_id}
                                style={{
                                    borderBottom: '1px solid #e7cfaf',
                                    transition: 'background-color 0.3s ease',
                                    cursor: 'pointer',
                                    animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0ccb2'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                onClick={() => handleView(asset)}
                            >
                                <td style={{
                                    padding: '16px 20px',
                                    color: '#333',
                                    fontSize: '0.95rem'
                                }}>
                                    {asset.option_asset_type || '-'}
                                </td>
                                <td style={{
                                    padding: '16px 20px',
                                    color: '#333',
                                    fontSize: '0.95rem'
                                }}>
                                    {asset.option_asset_location || '-'}
                                </td>
                                <td style={{
                                    padding: '16px 20px',
                                    color: '#333',
                                    fontSize: '0.95rem'
                                }}>
                                    <span style={{
                                        background: '#f3e8ff',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '0.85rem',
                                        color: '#764ba2'
                                    }}>
                                        {asset.option_asset_category || '-'}
                                    </span>
                                </td>
                                <td style={{
                                    padding: '16px 20px',
                                    color: '#333',
                                    fontSize: '0.85rem',
                                    maxWidth: '300px',
                                    wordBreak: 'break-word'
                                }}>
                                    {asset.option_component_types || '-'}
                                </td>
                                <td style={{
                                    padding: '16px 20px',
                                    color: '#333',
                                    fontSize: '0.95rem'
                                }}>
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        color: '#666'
                                    }}>
                                        {asset.created_by || 'System'}
                                    </span>
                                </td>
                                <td style={{
                                    padding: '16px 20px',
                                    color: '#333',
                                    fontSize: '0.95rem'
                                }}>
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        color: '#666'
                                    }}>
                                        {asset.created_at ?
                                            new Date(asset.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : '-'
                                        }
                                    </span>
                                </td>
                                <td style={{
                                    padding: '16px 20px',
                                    color: '#333',
                                    fontSize: '0.95rem'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        gap: '8px'
                                    }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleView(asset);
                                            }}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                fontSize: '1rem',
                                                cursor: 'pointer',
                                                padding: '6px 10px',
                                                borderRadius: '8px',
                                                transition: 'all 0.2s ease',
                                                opacity: '0.7',
                                                color: '#4a5568'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.opacity = '1';
                                                e.currentTarget.style.background = '#e0c3a2';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.opacity = '0.7';
                                                e.currentTarget.style.background = 'none';
                                            }}
                                            title="View"
                                        >
                                            View
                                        </button>
                                    </div>
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
                        <h3 style={{
                            fontSize: '1.5rem',
                            color: '#333',
                            marginBottom: '10px'
                        }}>
                            No Asset Options Found
                        </h3>
                        <p style={{
                            color: '#666',
                            marginBottom: '20px'
                        }}>
                            There are no asset options available at the moment.
                        </p>
                    </div>
                )}

                {/* Pagination Controls */}
                {filteredAssets.length > itemsPerPage && (
                    <div style={{
                        position: 'relative',
                        zIndex: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: '30px',
                        padding: '20px',
                    }}>
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center'
                        }}>
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                style={{
                                    background: currentPage === 1 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(234, 181, 111, 0.47)',
                                    border: '1px solid rgba(133, 104, 67, 0.3)',
                                    borderRadius: '8px',
                                    padding: '10px 16px',
                                    color: currentPage === 1 ? '#666' : '#664e30',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <FeatherIcon icon="chevron-left" size={16} />
                                Previous
                            </button>

                            {/* Page Numbers */}
                            <div style={{
                                display: 'flex',
                                gap: '5px'
                            }}>
                                {[...Array(totalPages)].map((_, index) => {
                                    const pageNumber = index + 1;
                                    if (
                                        pageNumber === 1 ||
                                        pageNumber === totalPages ||
                                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNumber}
                                                onClick={() => paginate(pageNumber)}
                                                style={{
                                                    background: currentPage === pageNumber ?
                                                        'linear-gradient(45deg, #EAB56F, #F9982F)' :
                                                        'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid rgba(234, 181, 111, 0.3)',
                                                    borderRadius: '8px',
                                                    padding: '10px 16px',
                                                    color: currentPage === pageNumber ? '#fff' : '#81623a',
                                                    cursor: 'pointer',
                                                    fontWeight: currentPage === pageNumber ? '600' : '400',
                                                    transition: 'all 0.3s ease',
                                                    minWidth: '40px'
                                                }}
                                            >
                                                {pageNumber}
                                            </button>
                                        );
                                    } else if (
                                        pageNumber === currentPage - 2 ||
                                        pageNumber === currentPage + 2
                                    ) {
                                        return <span key={pageNumber} style={{ color: '#EAB56F', padding: '0 5px' }}>...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                style={{
                                    background: currentPage === totalPages ? 'rgba(255, 255, 255, 0.05)' : 'rgba(234, 181, 111, 0.47)',
                                    border: '1px solid rgba(133, 104, 67, 0.3)',
                                    borderRadius: '8px',
                                    padding: '10px 16px',
                                    color: currentPage === totalPages ? '#666' : '#664e30',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Next
                                <FeatherIcon icon="chevron-right" size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style>
                {`
                    @keyframes float {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(50px, -50px) rotate(120deg); }
                        66% { transform: translate(-30px, 30px) rotate(240deg); }
                    }
                    
                    @keyframes slideIn {
                        from {
                            opacity: 0;
                            transform: translateX(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }
                `}
            </style>
        </div>
    );
}