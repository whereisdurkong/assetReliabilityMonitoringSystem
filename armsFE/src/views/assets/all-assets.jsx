import { useEffect, useState } from "react";
import axios from 'axios';
import config from 'config';
import { Button, Form } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

export default function AllAssets() {
    const [assets, setAssets] = useState([]);
    const [filteredAssets, setFilteredAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showActive, setShowActive] = useState(true);
    const [sortOrder, setSortOrder] = useState('newest');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedLocation, setSelectedLocation] = useState('all');
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const res = await axios.get(`${config.baseApi}/assets/get-all-assets`);
                const data = res.data || [];
                setAssets(data);

                // Extract unique categories and locations for filters
                const uniqueCategories = [...new Set(data.map(a => a.asset_category).filter(Boolean))];
                const uniqueLocations = [...new Set(data.map(a => a.asset_location).filter(Boolean))];
                setCategories(uniqueCategories);
                setLocations(uniqueLocations);
            } catch (error) {
                console.error('Error fetching assets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssets();
    }, []);

    useEffect(() => {
        let filtered = assets.filter(asset =>
            showActive ? asset.is_active === '1' : asset.is_active === '0'
        );

        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(asset =>
                (asset.asset_name?.toLowerCase().includes(term)) ||
                (asset.asset_type?.toLowerCase().includes(term)) ||
                (asset.asset_location?.toLowerCase().includes(term)) ||
                (asset.asset_category?.toLowerCase().includes(term)) ||
                (asset.created_by?.toLowerCase().includes(term)) ||
                (asset.asset_id?.toString().includes(term))
            );
        }

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(asset => asset.asset_category === selectedCategory);
        }

        if (selectedLocation !== 'all') {
            filtered = filtered.filter(asset => asset.asset_location === selectedLocation);
        }

        filtered.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        setFilteredAssets(filtered);
        setCurrentPage(1);
    }, [showActive, assets, sortOrder, searchTerm, selectedCategory, selectedLocation]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    const handleAddAsset = () => navigate('/add-asset');
    const handleView = (asset) => navigate(`/view-asset?id=${asset.asset_id}`);
    const clearSearch = () => setSearchTerm('');
    const clearFilters = () => {
        setSelectedCategory('all');
        setSelectedLocation('all');
        setSearchTerm('');
    };

    const getStatusColor = (isActive) => isActive === '1' ? '#10B981' : '#EF4444';
    const getStatusBg = (isActive) => isActive === '1' ? '#10B98110' : '#EF444410';

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const formatDisplayName = (value) => {
        if (!value) return '-';
        return value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const totalAssets = filteredAssets.length;
    const activeCount = assets.filter(a => a.is_active === '1').length;
    const inactiveCount = assets.filter(a => a.is_active === '0').length;

    return (
        <div style={{
            background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
            minHeight: '100vh',
            padding: '40px',
            position: 'relative',
            overflow: 'hidden',
            paddingTop: '50px'
        }}>
            {/* Animated background elements - retained */}
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

            <div style={{ position: 'relative', zIndex: 2, maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '30px', flexWrap: 'wrap', gap: '20px'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '2.8rem', fontWeight: '700', color: '#EAB56F',
                            marginBottom: '8px', letterSpacing: '-0.5px'
                        }}>
                            All Assets
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                            Manage and track all equipment assets
                        </p>
                    </div>
                    <button
                        onClick={handleAddAsset}
                        style={{
                            background: 'linear-gradient(135deg, #EAB56F, #F9982F)',
                            border: 'none', borderRadius: '12px', padding: '14px 28px',
                            fontSize: '0.95rem', fontWeight: '600', color: '#fff',
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                            gap: '10px', boxShadow: '0 4px 15px rgba(233, 150, 40, 0.3)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(233, 150, 40, 0.4)'; }}
                        onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(233, 150, 40, 0.3)'; }}
                    >
                        <FeatherIcon icon="plus" size={18} />
                        Add New Asset
                    </button>
                </div>

                {/* Stats Cards */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px', marginBottom: '24px'
                }}>
                    {[
                        { label: 'Total Assets', value: assets.length, icon: 'box', color: '#EAB56F', bg: '#EAB56F10' },
                        { label: 'Active Assets', value: activeCount, icon: 'check-circle', color: '#10B981', bg: '#10B98110' },
                        { label: 'Inactive Assets', value: inactiveCount, icon: 'x-circle', color: '#EF4444', bg: '#EF444410' },
                        { label: 'Categories', value: categories.length, icon: 'grid', color: '#8B5CF6', bg: '#8B5CF610' }
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            style={{
                                background: stat.bg,
                                borderRadius: '16px', padding: '16px 20px',
                                border: `2px solid ${stat.color}`
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{stat.label}</div>
                                    <div style={{ fontSize: '2rem', fontWeight: '700', color: stat.color }}>{stat.value}</div>
                                </div>
                                <FeatherIcon icon={stat.icon} size={32} style={{ opacity: 0.6, color: stat.color }} />
                            </div>
                        </motion.div>
                    ))}
                </div>



                {/* Filters Bar */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
                    borderRadius: '20px', padding: '16px 20px', marginBottom: '24px',
                    border: '1px solid rgba(234, 181, 111, 0.2)'
                }}>
                    <div style={{
                        display: 'flex', flexWrap: 'wrap', gap: '20px',
                        alignItems: 'flex-start', justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                            {/* Active/Inactive Toggle with Label on Top */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ fontSize: '0.75rem', color: '#F9982F', fontWeight: '500', letterSpacing: '0.5px' }}>
                                    STATUS
                                </span>
                                <div style={{
                                    display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '20px',
                                    alignItems: 'center',
                                    padding: '4px', height: '42px', border: '1px solid rgba(255, 174, 0, 0.33)'
                                }}>
                                    {['Active', 'Inactive'].map((label, idx) => (
                                        <Button
                                            key={label}
                                            onClick={() => setShowActive(idx === 0)}
                                            style={{
                                                padding: '8px 20px', borderRadius: '20px', border: 'none',
                                                fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer', height: '34px',
                                                background: (idx === 0 && showActive) || (idx === 1 && !showActive)
                                                    ? 'linear-gradient(135deg, #EAB56F, #F9982F)' : 'transparent',
                                                color: (idx === 0 && showActive) || (idx === 1 && !showActive) ? '#fff' : 'rgba(255,255,255,0.7)',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Category Filter with Label on Top */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ fontSize: '0.75rem', color: '#F9982F', fontWeight: '500', letterSpacing: '0.5px' }}>
                                    CATEGORY
                                </span>
                                <Form.Select
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
                                    style={{
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255, 174, 0, 0.33)',
                                        borderRadius: '10px',
                                        color: '#fff',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        minWidth: '150px',
                                        height: '42px',
                                        padding: '0 20px'
                                    }}
                                >
                                    <option value="all" style={{ background: '#254252' }}>All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat} style={{ background: '#254252' }}>{formatDisplayName(cat)}</option>
                                    ))}
                                </Form.Select>
                            </div>

                            {/* Location Filter with Label on Top */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ fontSize: '0.75rem', color: '#F9982F', fontWeight: '500', letterSpacing: '0.5px' }}>
                                    LOCATION
                                </span>
                                <Form.Select
                                    value={selectedLocation}
                                    onChange={e => setSelectedLocation(e.target.value)}
                                    style={{
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255, 174, 0, 0.33)',
                                        borderRadius: '10px',
                                        color: '#fff',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        minWidth: '150px',
                                        height: '42px',
                                        padding: '0 20px'
                                    }}
                                >
                                    <option value="all" style={{ background: '#254252' }}>All Locations</option>
                                    {locations.map(loc => (
                                        <option key={loc} value={loc} style={{ background: '#254252' }}>{formatDisplayName(loc)}</option>
                                    ))}
                                </Form.Select>
                            </div>

                            {/* Search with Label on Top */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '280px', flex: 1 }}>
                                <span style={{ fontSize: '0.75rem', color: '#F9982F', fontWeight: '500', letterSpacing: '0.5px' }}>
                                    SEARCH
                                </span>
                                <div style={{ position: 'relative', width: '100%', height: '42px' }}>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search assets..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        style={{
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255, 174, 0, 0.33)',
                                            borderRadius: '10px',
                                            color: '#fff',
                                            fontSize: '0.85rem',
                                            height: '42px',
                                            padding: '10px 40px 10px 40px'
                                        }}
                                    />
                                    <FeatherIcon icon="search" size={16} style={{
                                        color: '#F9982F',
                                        position: 'absolute',
                                        left: '15px',
                                        top: '50%',
                                        transform: 'translateY(-50%)'
                                    }} />
                                    {searchTerm && (
                                        <Button
                                            onClick={clearSearch}
                                            variant="link"
                                            style={{
                                                position: 'absolute',
                                                right: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                padding: 0,
                                                color: '#EAB56F',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <FeatherIcon icon="x" size={16} />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Sort Order */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ fontSize: '0.75rem', color: '#F9982F', fontWeight: '500', letterSpacing: '0.5px' }}>
                                    SORT BY
                                </span>
                                <Button
                                    onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                                    style={{
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(255, 174, 0, 0.33)',
                                        borderRadius: '10px',
                                        color: '#F9982F',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        height: '42px',
                                        padding: '0 20px'
                                    }}
                                >
                                    <FeatherIcon icon={sortOrder === 'newest' ? 'arrow-down' : 'arrow-up'} size={14} />
                                    {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                                </Button>
                            </div>

                            {/* View Mode Toggle */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ fontSize: '0.75rem', color: '#F9982F', fontWeight: '500', letterSpacing: '0.5px' }}>
                                    VIEW
                                </span>
                                <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '4px', height: '42px', alignItems: 'center', border: '1px solid rgba(255, 174, 0, 0.33)' }}>
                                    <Button
                                        onClick={() => setViewMode('table')}
                                        variant={viewMode === 'table' ? 'primary' : 'secondary'}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            height: '34px',
                                            background: viewMode === 'table' ? 'linear-gradient(135deg, #EAB56F, #F9982F)' : 'transparent',
                                            color: viewMode === 'table' ? '#fff' : 'rgba(255,255,255,0.5)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FeatherIcon icon="list" size={16} />
                                    </Button>
                                    <Button
                                        onClick={() => setViewMode('cards')}
                                        variant={viewMode === 'cards' ? 'primary' : 'secondary'}
                                        style={{
                                            padding: '6px 14px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            height: '34px',
                                            background: viewMode === 'cards' ? 'linear-gradient(135deg, #EAB56F, #F9982F)' : 'transparent',
                                            color: viewMode === 'cards' ? '#fff' : 'rgba(255,255,255,0.5)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <FeatherIcon icon="grid" size={16} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(selectedCategory !== 'all' || selectedLocation !== 'all' || searchTerm) && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Active filters:</span>
                            {selectedCategory !== 'all' && (
                                <span style={{ background: 'rgba(139,92,246,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', color: '#A78BFA' }}>
                                    Category: {formatDisplayName(selectedCategory)}
                                </span>
                            )}
                            {selectedLocation !== 'all' && (
                                <span style={{ background: 'rgba(139,92,246,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', color: '#A78BFA' }}>
                                    Location: {formatDisplayName(selectedLocation)}
                                </span>
                            )}
                            <Button
                                onClick={clearFilters}
                                variant="link"
                                style={{ color: '#F9982F', fontSize: '0.7rem', textDecoration: 'none', padding: '4px 12px' }}
                            >
                                Clear all
                            </Button>
                        </div>
                    )}
                </div>

                {/* Results Summary */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAssets.length)} of {filteredAssets.length} assets
                    </span>
                </div>

                {/* Main Content */}
                <div style={{
                    background: 'rgba(255,255,255,0.95)', borderRadius: '20px',
                    overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
                }}>
                    {viewMode === 'table' ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#1E293B' }}>
                                        {['Asset', 'Type', 'Location', 'Category', 'Commissioned', 'Status', 'Created', 'Actions'].map(head => (
                                            <th key={head} style={{
                                                padding: '16px 20px', textAlign: 'left', color: '#EAB56F',
                                                fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>{head}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody >
                                    {currentItems.map((asset, idx) => (
                                        <motion.tr
                                            key={asset.asset_id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            onClick={() => handleView(asset)}
                                            style={{
                                                borderBottom: '1px solid #E2E8F0', cursor: 'pointer',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a7560b2c'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            <td style={{ padding: '14px 20px', fontWeight: '500', color: '#1E293B' }}>{asset.asset_name || '-'}</td>
                                            <td style={{ padding: '14px 20px', color: '#475569' }}>{formatDisplayName(asset.asset_type)}</td>
                                            <td style={{ padding: '14px 20px', color: '#475569' }}>{formatDisplayName(asset.asset_location)}</td>
                                            <td style={{ padding: '14px 20px' }}>
                                                <span style={{ background: '#F3E8FF', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', color: '#7C3AED' }}>
                                                    {formatDisplayName(asset.asset_category)}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 20px', color: '#475569', fontSize: '0.85rem' }}>{formatDate(asset.date_commisioning)}</td>
                                            <td style={{ padding: '14px 20px' }}>
                                                <span style={{
                                                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '500',
                                                    background: getStatusBg(asset.is_active), color: getStatusColor(asset.is_active)
                                                }}>
                                                    {asset.is_active === '1' ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 20px', color: '#475569', fontSize: '0.85rem' }}>{asset.created_by || 'System'}</td>
                                            <td style={{ padding: '14px 20px' }}>
                                                <button style={{
                                                    background: 'none', border: 'none', color: '#EAB56F', cursor: 'pointer',
                                                    padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem'
                                                }}>
                                                    View →
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', padding: '20px' }}>
                            {currentItems.map((asset, idx) => (
                                <motion.div
                                    key={asset.asset_id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => handleView(asset)}
                                    style={{
                                        background: 'white', borderRadius: '16px', padding: '16px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer',
                                        border: '1px solid #E2E8F0', transition: 'all 0.2s'
                                    }}
                                    whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#1E293B', marginBottom: '4px' }}>{asset.asset_name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748B' }}>ID: {asset.asset_id}</div>
                                        </div>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem',
                                            background: getStatusBg(asset.is_active), color: getStatusColor(asset.is_active)
                                        }}>
                                            {asset.is_active === '1' ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px', fontSize: '0.75rem', color: '#475569' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FeatherIcon icon="tag" size={12} /> {formatDisplayName(asset.asset_type)}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FeatherIcon icon="map-pin" size={12} /> {formatDisplayName(asset.asset_location)}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FeatherIcon icon="grid" size={12} /> {formatDisplayName(asset.asset_category)}</span>
                                    </div>
                                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Commissioned: {formatDate(asset.date_commisioning)}</span>
                                        <span style={{ fontSize: '0.7rem', color: '#EAB56F' }}>View details →</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {filteredAssets.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                            <FeatherIcon icon="box" size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                            <h3 style={{ color: '#333', marginBottom: '8px' }}>No assets found</h3>
                            <p style={{ color: '#666' }}>Try adjusting your filters or add a new asset</p>
                            <button onClick={clearFilters} style={{
                                marginTop: '16px', background: 'linear-gradient(135deg, #EAB56F, #F9982F)',
                                border: 'none', borderRadius: '10px', padding: '10px 24px', color: 'white', cursor: 'pointer'
                            }}>Clear Filters</button>
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredAssets.length > itemsPerPage && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '20px', borderTop: '1px solid #E2E8F0' }}>
                            <button onClick={prevPage} disabled={currentPage === 1} style={{
                                padding: '8px 16px', borderRadius: '8px', border: '1px solid #E2E8F0',
                                background: currentPage === 1 ? '#F1F5F9' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                            }}><FeatherIcon icon="chevron-left" size={16} /></button>
                            {[...Array(totalPages)].map((_, i) => {
                                const page = i + 1;
                                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                    return (
                                        <button key={page} onClick={() => paginate(page)} style={{
                                            padding: '8px 16px', borderRadius: '8px', border: '1px solid #E2E8F0',
                                            background: currentPage === page ? '#EAB56F' : 'white',
                                            color: currentPage === page ? 'white' : '#333', cursor: 'pointer'
                                        }}>{page}</button>
                                    );
                                } else if (page === currentPage - 2 || page === currentPage + 2) {
                                    return <span key={page} style={{ padding: '8px 8px' }}>...</span>;
                                }
                                return null;
                            })}
                            <button onClick={nextPage} disabled={currentPage === totalPages} style={{
                                padding: '8px 16px', borderRadius: '8px', border: '1px solid #E2E8F0',
                                background: currentPage === totalPages ? '#F1F5F9' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                            }}><FeatherIcon icon="chevron-right" size={16} /></button>
                        </div>
                    )}
                </div>
            </div>

            <style>
                {`
                    @keyframes float {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(50px, -50px) rotate(120deg); }
                        66% { transform: translate(-30px, 30px) rotate(240deg); }
                    }
                `}
            </style>
        </div >
    );
}