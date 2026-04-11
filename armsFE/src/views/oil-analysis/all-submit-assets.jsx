import { useEffect, useState } from "react";
import axios from 'axios';
import config from 'config';

import FeatherIcon from 'feather-icons-react';
import { useNavigate } from 'react-router';

export default function AllSubmitAssets() {
    const [assets, setAssets] = useState([]);
    const [submittedReport, setSubmittedReport] = useState([]);
    const [allAssets, setAllAssets] = useState([]); // State for all assets
    const [allComponents, setAllComponents] = useState([]); // State for all components
    const [filteredAssets, setFilteredAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
    const [searchTerm, setSearchTerm] = useState(''); // Search term

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8); // Show 8 items per page

    const [postion, setPosition] = useState('');

    const navigate = useNavigate();
    const empInfo = JSON.parse(localStorage.getItem("user"));

    // Helper function to get asset name by asset_id
    const getAssetName = (assetId) => {
        if (!assetId) return '-';
        const asset = allAssets.find(a => a.asset_id === parseInt(assetId));
        return asset ? asset.asset_name : '-';
    };

    // Helper function to get component name by component_id
    const getComponentName = (componentId) => {
        if (!componentId) return '-';
        const component = allComponents.find(c => c.asset_component_id === parseInt(componentId));
        return component ? component.asset_component_name : '-';
    };

    // Helper function to get component type by component_id
    const getComponentType = (componentId) => {
        if (!componentId) return '-';
        const component = allComponents.find(c => c.asset_component_id === parseInt(componentId));
        return component ? component.asset_component_type || '-' : '-';
    };

    // Helper function to get combined component name and type
    const getCombinedComponent = (componentId) => {
        const componentName = getComponentName(componentId);
        const componentType = getComponentType(componentId);

        if (componentName === '-' && componentType === '-') return '-';
        if (componentName === '-') return componentType;
        if (componentType === '-') return componentName;
        return `${componentName} (${componentType})`;
    };

    // Helper function to get asset details by asset_id
    const getAssetDetails = (assetId) => {
        if (!assetId) return null;
        const asset = allAssets.find(a => a.asset_id === parseInt(assetId));
        return asset || null;
    };

    useEffect(() => {
        console.log(empInfo)
        if (empInfo.emp_position === 'l1') {
            setPosition('Level 1');
        } else if (empInfo.emp_position === 'l2') {
            setPosition('Level 2')
        } else if (empInfo.emp_position === 'l3') {
            setPosition('Level 3')
        }
    }, [empInfo])


    // Fetch submitted assets
    useEffect(() => {
        const fetchSubmittedAssets = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${config.baseApi}/assetsAnalysis/get-all-submitted-assets`);
                const oilreportdata = res.data || [];

                if (empInfo.emp_position === 'l1') {
                    const levelOne = oilreportdata.filter(e => e.level1 == 1 || e.level1 == true || e.level1 == "1")
                    setSubmittedReport(levelOne);
                    setFilteredAssets(levelOne); // Initially show all submitted assets
                }
                else if (empInfo.emp_postion === 'l2') {
                    const levelTwo = oilreportdata.filter(e => e.level2 == 1 || e.level2 == true || e.level2 == "1")
                    setSubmittedReport(levelTwo);
                    setFilteredAssets(levelTwo); // Initially show all submitted assets
                }
                else if (empInfo.emp_postion === 'l3') {
                    const levelThree = oilreportdata.filter(e => e.level3 == 1 || e.level3 == true || e.level3 == "1")
                    setSubmittedReport(levelThree);
                    setFilteredAssets(levelThree); // Initially show all submitted assets
                }

                const resgetallasset = await axios.get(`${config.baseApi}/assets/get-all-assets`);
                const allassetsdata = resgetallasset.data || [];

                console.log('ALL ASSETS', allassetsdata);
                setAllAssets(allassetsdata);

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
    }, []);

    // Filter, search, and sort assets when any filter changes
    useEffect(() => {
        let filtered = [...submittedReport]; // Start with all assets

        // Apply search filter if search term exists
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

        // Then sort by created_at date
        filtered.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);

            if (sortOrder === 'newest') {
                return dateB - dateA; // Newest first (descending)
            } else {
                return dateA - dateB; // Oldest first (ascending)
            }
        });

        setFilteredAssets(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [submittedReport, sortOrder, searchTerm, allAssets, allComponents]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    const handleSubmitAsset = () => {
        navigate('/submit-asset');
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

    // Show loading state
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
                    }}>All Asset Analysis Report {postion} </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        color: '#F9982F',
                        opacity: '0.9',
                        fontWeight: '400',
                        maxWidth: '600px',
                        margin: '0'
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
                    Submit Asset
                </button>
            </div>

            {/* Search and Sort Controls Section */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                marginBottom: '20px',
                gap: '20px',
            }}>
                <div style={{
                    display: 'flex',
                    gap: '15px',
                    alignItems: 'center'
                }}>
                    {/* Search input */}
                    <div style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <input
                            type="text"
                            placeholder="Search by asset name, component name, component type, ID, recommendations..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={{
                                padding: '10px 40px 10px 40px',
                                borderRadius: '30px',
                                border: '1px solid rgba(234, 181, 111, 0.3)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#fff',
                                fontSize: '0.95rem',
                                width: '550px',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#EAB56F';
                                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(234, 181, 111, 0.3)';
                                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                            }}
                        />
                        <span style={{
                            position: 'absolute',
                            left: '15px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#EAB56F',
                            fontSize: '1.2rem',
                            opacity: 0.7,
                            pointerEvents: 'none'
                        }}>
                            <FeatherIcon icon="search" size={18} />
                        </span>

                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    background: 'none',
                                    border: 'none',
                                    color: '#EAB56F',
                                    cursor: 'pointer',
                                    padding: '0',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <FeatherIcon icon="x" size={18} />
                            </button>
                        )}
                    </div>

                    {/* Sort button */}
                    <button
                        onClick={toggleSortOrder}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            borderRadius: '30px',
                            border: '1px solid rgba(234, 181, 111, 0.3)',
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: '#F9982F',
                            fontWeight: '500',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(234, 181, 111, 0.1)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <FeatherIcon
                            icon={sortOrder === 'newest' ? 'arrow-down' : 'arrow-up'}
                            size={18}
                        />
                        {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                    </button>
                </div>
            </div>

            {/* Table container */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                background: '#f1ddc2',
                borderRadius: '24px',
                padding: '10px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(10px)',
                overflowX: 'auto'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    minWidth: '1200px'
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
                            }}>ID</th>
                            <th style={{
                                padding: '16px 20px',
                                textAlign: 'left',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>Asset</th>
                            <th style={{
                                padding: '16px 20px',
                                textAlign: 'left',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>Component</th>
                            <th style={{
                                padding: '16px 20px',
                                textAlign: 'left',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>Analysis Date</th>
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
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}>
                                    Created At
                                    <span style={{
                                        fontSize: '1rem',
                                        opacity: 0.8
                                    }}>
                                        {sortOrder === 'newest' ?
                                            <FeatherIcon icon="arrow-down" size={16} /> :
                                            <FeatherIcon icon="arrow-up" size={16} />}
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
                                key={asset.asset_analysis_id}
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
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontWeight: '500'
                                    }}>
                                        {asset.asset_analysis_id || '-'}
                                    </div>
                                </td>
                                <td style={{
                                    padding: '16px 20px',
                                    color: '#333',
                                    fontSize: '0.95rem'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontWeight: '500'
                                    }}>
                                        {/* Asset Name only */}
                                        {getAssetName(asset.asset_id)}
                                    </div>
                                </td>
                                <td style={{
                                    padding: '16px 20px',
                                    color: '#333',
                                    fontSize: '0.95rem'
                                }}>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        background: '#EAB56F20',
                                        color: '#E37239',
                                        fontSize: '0.85rem',
                                        fontWeight: '500'
                                    }}>
                                        {/* Combined component name and type */}
                                        {getCombinedComponent(asset.asset_component_id)}
                                    </span>
                                </td>
                                <td style={{
                                    padding: '16px 20px',
                                    color: '#333',
                                    fontSize: '0.95rem'
                                }}>
                                    <span style={{
                                        fontSize: '0.85rem'
                                    }}>
                                        {asset.analysis_date ?
                                            new Date(asset.analysis_date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : '-'
                                        }
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
                                                background: 'linear-gradient(135deg, #EAB56F, #F9982F)',
                                                border: 'none',
                                                fontSize: '0.85rem',
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
                                            title="View Details"
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
                                : 'No Submitted Assets Found'}
                        </h3>
                        <p style={{
                            color: '#666',
                            marginBottom: '20px'
                        }}>
                            {searchTerm
                                ? `No submitted assets match your search term "${searchTerm}". Try different keywords.`
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
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                }}
                            >
                                Clear Search
                            </button>
                        )}
                    </div>
                )}

                {/* Pagination Controls */}
                {filteredAssets.length > 0 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '20px',
                        borderTop: '1px solid #e7cfaf'
                    }}>
                        <div style={{
                            color: '#666',
                            fontSize: '0.9rem'
                        }}>
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAssets.length)} of {filteredAssets.length} entries
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center'
                        }}>
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #EAB56F',
                                    background: currentPage === 1 ? '#f5e5d0' : '#EAB56F',
                                    color: currentPage === 1 ? '#999' : '#fff',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    fontWeight: '500'
                                }}
                            >
                                Previous
                            </button>

                            <div style={{
                                display: 'flex',
                                gap: '8px'
                            }}>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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

                                    return (
                                        <button
                                            key={pageNumber}
                                            onClick={() => paginate(pageNumber)}
                                            style={{
                                                width: '35px',
                                                height: '35px',
                                                borderRadius: '8px',
                                                border: 'none',
                                                background: currentPage === pageNumber ? '#EAB56F' : 'transparent',
                                                color: currentPage === pageNumber ? '#fff' : '#666',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                transition: 'all 0.3s ease',
                                                border: currentPage === pageNumber ? 'none' : '1px solid #EAB56F'
                                            }}
                                        >
                                            {pageNumber}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    border: '1px solid #EAB56F',
                                    background: currentPage === totalPages ? '#f5e5d0' : '#EAB56F',
                                    color: currentPage === totalPages ? '#999' : '#fff',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    fontWeight: '500'
                                }}
                            >
                                Next
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
                    
                    @keyframes pulse {
                        0%, 100% { opacity: 0.6; }
                        50% { opacity: 1; }
                    }

                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                  
                `}
            </style>
        </div>
    );
}