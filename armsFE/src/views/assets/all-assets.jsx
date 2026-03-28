import { useEffect, useState } from "react";
import axios from 'axios';
import config from 'config';

import FeatherIcon from 'feather-icons-react';
import { useNavigate } from 'react-router';

export default function AllAssets() {
    const [assets, setAssets] = useState([]);
    const [filteredAssets, setFilteredAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showActive, setShowActive] = useState(true); // true for active, false for inactive
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'
    const [searchTerm, setSearchTerm] = useState(''); // Search term

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8); // Show 8 items per page

    const navigate = useNavigate()

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const res = await axios.get(`${config.baseApi}/assets/get-all-assets`);
                const data = res.data || [];

                const active = data.filter(a => a.is_active === '1')
                const inactive = data.filter(a => a.is_active === '0')

                console.log('active: ', active);
                console.log('in-active: ', inactive)
                setAssets(data);
                setFilteredAssets(data); // Initially show all assets
                console.log(data);
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
        let filtered = [];

        // First filter by active status
        if (showActive) {
            filtered = assets.filter(asset => asset.is_active === '1');
        } else {
            filtered = assets.filter(asset => asset.is_active === '0');
        }

        // Then apply search filter if search term exists
        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(asset => {
                return (
                    (asset.asset_name && asset.asset_name.toLowerCase().includes(term)) ||
                    (asset.asset_type && asset.asset_type.toLowerCase().includes(term)) ||
                    (asset.asset_location && asset.asset_location.toLowerCase().includes(term)) ||
                    (asset.asset_category && asset.asset_category.toLowerCase().includes(term)) ||
                    (asset.created_by && asset.created_by.toLowerCase().includes(term)) ||
                    (asset.asset_id && asset.asset_id.toString().includes(term))
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
    }, [showActive, assets, sortOrder, searchTerm]);

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    const handleAddAsset = () => {
        navigate('/add-asset')
    };

    const handleViewAsset = (assetId) => {
        // Add your view logic here
        console.log('View asset:', assetId);
    };

    const toggleFilter = () => {
        setShowActive(!showActive);
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

    //SAMPLLLLEEEE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // const HandleView = (ticket) => {
    //     const params = new URLSearchParams({ id: ticket.ticket_id });
    //     const user = JSON.parse(localStorage.getItem('user'));

    //     if (user.emp_tier === 'helpdesk') {
    //         navigate(`/view-hd-ticket?${params.toString()}`);
    //     } else if (user.emp_tier === 'user') {
    //         navigate(`/view-ticket?${params.toString()}`);
    //     }
    // };

    const handleView = (asset) => {
        const params = new URLSearchParams({ id: asset.asset_id });

        navigate(`/view-asset?${params.toString()}`);
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
                    }}>Asset Management</h1>
                    <p style={{
                        fontSize: '1.2rem',
                        color: '#F9982F',
                        opacity: '0.9',
                        fontWeight: '400',
                        maxWidth: '600px',
                        margin: '0'
                    }}>View and manage all your assets in one place</p>
                </div>
                <button
                    onClick={handleAddAsset}
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
                    Add New Asset
                </button>
            </div>

            {/* Filter, Search and Sort Controls Section */}
            <div style={{
                position: 'relative',
                zIndex: 2,
                marginBottom: '20px',
                padding: '0 10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '15px'
            }}>
                {/* Left side controls */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    flexWrap: 'wrap'
                }}>
                    {/* Active/Inactive Toggle */}
                    <div
                        onClick={toggleFilter}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '40px',
                            padding: '4px',
                            width: '300px',
                            position: 'relative',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(234, 181, 111, 0.3)'
                        }}
                    >
                        {/* Sliding background indicator */}
                        <div style={{
                            position: 'absolute',
                            width: 'calc(50% - 4px)',
                            height: 'calc(100% - 8px)',
                            background: 'linear-gradient(45deg, #EAB56F, #F9982F)',
                            borderRadius: '30px',
                            transition: 'transform 0.3s ease',
                            transform: showActive ? 'translateX(0)' : 'translateX(100%)',
                            top: '4px',
                            left: '4px',
                            zIndex: 1
                        }} />

                        {/* Active option */}
                        <div style={{
                            flex: 1,
                            textAlign: 'center',
                            padding: '10px 0',
                            borderRadius: '30px',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            position: 'relative',
                            zIndex: 2,
                            color: showActive ? '#ffffff' : '#F9982F',
                            transition: 'color 0.3s ease',
                            whiteSpace: 'nowrap'
                        }}>
                            Active Assets
                        </div>

                        {/* Inactive option */}
                        <div style={{
                            flex: 1,
                            textAlign: 'center',
                            padding: '10px 0',
                            borderRadius: '30px',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            position: 'relative',
                            zIndex: 2,
                            color: !showActive ? '#ffffff' : '#F9982F',
                            transition: 'color 0.3s ease',
                            whiteSpace: 'nowrap'
                        }}>
                            Inactive Assets
                        </div>
                    </div>

                    {/* Sort Toggle Button */}
                    <button
                        onClick={toggleSortOrder}
                        style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(234, 181, 111, 0.3)',
                            borderRadius: '40px',
                            padding: '12px 24px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            color: '#F9982F',
                            cursor: 'pointer',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(234, 181, 111, 0.2)';
                            e.target.style.borderColor = '#EAB56F';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.target.style.borderColor = 'rgba(234, 181, 111, 0.3)';
                        }}
                    >
                        <span style={{
                            fontSize: '1.2rem'
                        }}>
                            {sortOrder === 'newest' ? <FeatherIcon icon="arrow-down" /> : <FeatherIcon icon="arrow-up" />}
                        </span>
                        Sort by: {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                    </button>
                </div>

                {/* Search Bar */}
                <div style={{
                    position: 'relative',
                    minWidth: '650px'
                }}>
                    <input
                        type="text"
                        placeholder="Search assets by name, type, location, category..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={{
                            width: '100%',
                            padding: '12px 24px',
                            paddingRight: searchTerm ? '80px' : '45px', // Adjusted padding for icon
                            borderRadius: '40px',
                            border: '1px solid rgba(234, 181, 111, 0.3)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            color: '#fff',
                            fontSize: '0.95rem',
                            outline: 'none',
                            transition: 'all 0.3s ease'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#EAB56F';
                            e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(234, 181, 111, 0.3)';
                            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                        }}
                    />

                    {/* Search Icon */}
                    <span style={{
                        position: 'absolute',
                        right: searchTerm ? '45px' : '15px', // Adjust position when clear button is present
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#EAB56F',
                        fontSize: '1.2rem',
                        opacity: 0.7,
                        pointerEvents: 'none', // Makes the icon non-interactive
                        transition: 'right 0.3s ease'
                    }}>
                        <FeatherIcon icon="search" />
                    </span>

                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            style={{
                                position: 'absolute',
                                right: '15px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: '#F9982F',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                padding: '5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                transition: 'all 0.2s ease',
                                zIndex: 1 // Ensure button is above the icon
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(234, 181, 111, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'none';
                            }}
                            title="Clear search"
                        >
                            <FeatherIcon icon="x" />
                        </button>
                    )}
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
                            }}>Asset Name</th>
                            <th style={{
                                padding: '16px 20px',
                                textAlign: 'left',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>Type</th>
                            <th style={{
                                padding: '16px 20px',
                                textAlign: 'left',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>Location</th>
                            <th style={{
                                padding: '16px 20px',
                                textAlign: 'left',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>Category</th>
                            <th style={{
                                padding: '16px 20px',
                                textAlign: 'left',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>Date Commissioned</th>
                            <th style={{
                                padding: '16px 20px',
                                textAlign: 'left',
                                color: '#fff',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>Status</th>
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
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }} onClick={toggleSortOrder}>
                                Created At
                                <span style={{
                                    fontSize: '1rem',
                                    opacity: 0.8
                                }}>
                                    {sortOrder === 'newest' ?
                                        <FeatherIcon icon="arrow-down" /> : <FeatherIcon icon="arrow-up" />}
                                </span>
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
                                key={asset.asset_id}
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
                                        {asset.asset_name}
                                    </div>
                                </td>
                                <td style={{
                                    padding: '16px 20px',
                                    color: '#333',
                                    fontSize: '0.95rem'
                                }}>
                                    <span style={{
                                        fontSize: '0.85rem'
                                    }}>
                                        {asset.asset_type || '-'}
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
                                        {asset.asset_location || '-'}
                                    </span>
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
                                        {asset.asset_category || '-'}
                                    </span>
                                </td>
                                <td style={{
                                    padding: '16px 20px',
                                    color: '#333',
                                    fontSize: '0.95rem'
                                }}>
                                    {asset.date_commisioning ?
                                        new Date(asset.date_commisioning).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        }) : '-'
                                    }
                                </td>
                                <td style={{
                                    padding: '16px 20px',
                                    color: '#333',
                                    fontSize: '0.95rem'
                                }}>
                                    <span style={{
                                        ...{
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.85rem',
                                            fontWeight: '500',
                                            display: 'inline-block'
                                        },
                                        backgroundColor: asset.is_active === '1' ? '#10b98120' : '#ef444420',
                                        color: asset.is_active === '1' ? '#10b981' : '#ef4444',
                                        border: `1px solid ${asset.is_active === '1' ? '#10b981' : '#ef4444'}`
                                    }}>
                                        {asset.is_active === '1' ? '● Active' : '○ Inactive'}
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
                                    <div style={{
                                        display: 'flex',
                                        gap: '8px'
                                    }}>
                                        <button
                                            onClick={() => handleViewAsset(asset.asset_id)}
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
                            {searchTerm
                                ? 'No Matching Assets Found'
                                : `No ${showActive ? 'Active' : 'Inactive'} Assets Found`}
                        </h3>
                        <p style={{
                            color: '#666',
                            marginBottom: '20px'
                        }}>
                            {searchTerm
                                ? `No assets match your search term "${searchTerm}". Try different keywords.`
                                : showActive
                                    ? "There are no active assets at the moment."
                                    : "There are no inactive assets at the moment."}
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
                                    color: currentPage === totalPages ? '#666' : '#664e30',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    if (currentPage !== 1) {
                                        e.target.style.background = 'rgba(234, 181, 111, 0.3)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (currentPage !== 1) {
                                        e.target.style.background = 'rgba(234, 181, 111, 0.2)';
                                    }
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
                                    // Show first page, last page, and pages around current page
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
                                                onMouseEnter={(e) => {
                                                    if (currentPage !== pageNumber) {
                                                        e.target.style.background = 'rgba(234, 181, 111, 0.2)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (currentPage !== pageNumber) {
                                                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                                    }
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
                                onMouseEnter={(e) => {
                                    if (currentPage !== totalPages) {
                                        e.target.style.background = 'rgba(234, 181, 111, 0.3)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (currentPage !== totalPages) {
                                        e.target.style.background = 'rgba(234, 181, 111, 0.2)';
                                    }
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
                    
                    @keyframes pulse {
                        0%, 100% { opacity: 0.6; }
                        50% { opacity: 1; }
                    }
                `}
            </style>
        </div>
    );
}