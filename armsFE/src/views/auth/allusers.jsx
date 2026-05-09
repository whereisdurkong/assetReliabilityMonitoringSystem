/**
 * AllUsers Component - User Directory with Pagination
 * 
 * Features:
 * - Fetches and displays all users from the API
 * - Search functionality (by name, email, username)
 * - Role-based filtering (Admin/User)
 * - Responsive statistics cards showing totals
 * - Pagination to handle large datasets efficiently
 * - Loading states and empty states
 * - Modern UI with animations and gradients
 */

import { useEffect, useState } from "react";
import axios from 'axios';
import config from 'config';
import FeatherIcon from 'feather-icons-react';
import { useNavigate } from 'react-router';

export default function AllUsers() {
    // ===== STATE MANAGEMENT =====
    const [users, setUsers] = useState([]);           // All users from API
    const [loading, setLoading] = useState(true);     // Loading indicator
    const [searchTerm, setSearchTerm] = useState(""); // Search input value
    const [roleFilter, setRoleFilter] = useState("all"); // Role filter value
    const [currentPage, setCurrentPage] = useState(1);   // Current pagination page
    const [usersPerPage] = useState(10);                  // Users per page (adjustable)
    const [statusFilter, setStatusFilter] = useState("all");
    const navigate = useNavigate();

    // ===== API CALL =====
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${config.baseApi}/authentication/get-all-users`);
                const data = res.data || [];
                setUsers(data);
                console.log('Users fetched:', data.length);
            } catch (err) {
                console.error('Unable to fetch data: ', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // ===== FILTERING LOGIC =====
    // Filter users based on search term and role selection
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.emp_firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.emp_lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.emp_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.user_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === "all" || user.emp_role === roleFilter;

        // Add status filtering
        const matchesStatus = statusFilter === "all" ||
            (statusFilter === "active" && user.is_active === true) ||
            (statusFilter === "inactive" && user.is_active === false);

        return matchesSearch && matchesRole && matchesStatus;
    });

    // Reset to page 1 whenever filters change (prevents showing empty pages)
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter, statusFilter]);

    // ===== PAGINATION LOGIC =====
    // Calculate current page users
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Change page handler
    const paginate = (pageNumber) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            // Optional: Scroll to top of table on page change
            document.querySelector('.users-table-container')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // ===== HELPER FUNCTIONS =====
    const getRoleBadgeStyle = (role) => {
        switch (role) {
            case 'admin': return { background: '#8B5CF6', color: '#fff' };    // Purple for admin
            case 'manager': return { background: '#3B82F6', color: '#fff' };   // Blue for manager
            default: return { background: '#10B981', color: '#fff' };          // Green for regular users
        }
    };

    const getStatusStyle = (isActive) => ({
        background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
        color: isActive ? '#10B981' : '#EF4444',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        display: 'inline-block'
    });

    const handleReg = () => {
        navigate('/register');
    }

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // ===== PAGINATION COMPONENTS =====
    const PaginationControls = () => {
        // Don't show pagination if no data or only one page
        if (filteredUsers.length === 0 || totalPages <= 1) return null;

        const maxPageButtons = 5;  // Maximum number of page buttons to show
        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        // Adjust if we're near the end
        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        const pageNumbers = [];
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="pagination-container" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                marginTop: '24px',
                padding: '16px',
                flexWrap: 'wrap'
            }}>
                {/* Previous Button */}
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 153, 0, 0.3)',
                        background: currentPage === 1 ? 'rgba(30, 41, 59, 0.4)' : 'rgba(30, 41, 59, 0.7)',
                        color: currentPage === 1 ? '#64748B' : '#E2E8F0',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <FeatherIcon icon="chevron-left" size={16} />
                </button>

                {/* First Page */}
                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => paginate(1)}
                            style={paginationButtonStyle(1)}
                        >
                            1
                        </button>
                        {startPage > 2 && <span style={{ color: '#64748B' }}>...</span>}
                    </>
                )}

                {/* Page Numbers */}
                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => paginate(number)}
                        style={paginationButtonStyle(number)}
                    >
                        {number}
                    </button>
                ))}

                {/* Last Page */}
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span style={{ color: '#64748B' }}>...</span>}
                        <button
                            onClick={() => paginate(totalPages)}
                            style={paginationButtonStyle(totalPages)}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                {/* Next Button */}
                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 153, 0, 0.3)',
                        background: currentPage === totalPages ? 'rgba(30, 41, 59, 0.4)' : 'rgba(30, 41, 59, 0.7)',
                        color: currentPage === totalPages ? '#64748B' : '#E2E8F0',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <FeatherIcon icon="chevron-right" size={16} />
                </button>
            </div>
        );
    };

    // Helper for pagination button styles
    const paginationButtonStyle = (pageNumber) => ({
        padding: '8px 14px',
        borderRadius: '8px',
        border: currentPage === pageNumber ? '2px solid rgb(255, 153, 0)' : '1px solid rgba(255, 153, 0, 0.3)',
        background: currentPage === pageNumber ? 'rgba(255, 153, 0, 0.2)' : 'rgba(30, 41, 59, 0.7)',
        color: currentPage === pageNumber ? '#EAB56F' : '#E2E8F0',
        cursor: 'pointer',
        fontWeight: currentPage === pageNumber ? '600' : '400',
        transition: 'all 0.2s ease'
    });

    const PaginationInfo = () => (
        <div style={{
            textAlign: 'center',
            marginTop: '16px',
            color: '#64748B',
            fontSize: '13px'
        }}>
            Showing {filteredUsers.length === 0 ? 0 : indexOfFirstUser + 1} to{' '}
            {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
        </div>
    );

    const handleView = (user) => {
        navigate(`/view-user?id=${user.id_master}`)
    }

    // ===== STATS CARDS DATA =====
    const statsCards = [
        {
            label: 'Total Users',
            value: users.length,
            icon: 'users',
            color: '#3B82F6',
            border: '#5046dd',
            bg: '#6f96ea10',
            box: 'linear-gradient(135deg, #504aa0, #2f3cf9)'
        },
        {
            label: 'Active',
            value: users.filter(u => u.is_active).length,
            icon: 'check-circle',
            color: '#10B981',
            border: '#2f923d',
            bg: '#6fea8a10',
            box: 'linear-gradient(135deg, #3c7e4d, #2ff94a)'
        },
        {
            label: 'Admins',
            value: users.filter(u => u.emp_role === 'admin').length,
            icon: 'shield',
            color: '#8B5CF6',
            border: '#8526aa',
            bg: '#c76fea10',
            box: 'linear-gradient(135deg, #743f8d, #b92ff9)'
        },
    ];

    // ===== MAIN RENDER =====
    return (
        <div style={{
            background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
            minHeight: '100vh',
            padding: '40px',
            position: 'relative',
            overflow: 'hidden',
            paddingTop: '50px'
        }}>
            {/* ===== ANIMATED BACKGROUND ELEMENTS ===== */}
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

            <style>
                {`
                    @keyframes float {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(50px, -50px) rotate(120deg); }
                        66% { transform: translate(-30px, 30px) rotate(240deg); }
                    }
                `}
            </style>

            {/* ===== MAIN CONTENT ===== */}
            <div className="users-table-container" style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 2 }}>

                {/* ===== HEADER SECTION ===== */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '30px', flexWrap: 'wrap', gap: '20px'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '2.8rem',
                            fontWeight: '700',
                            color: '#EAB56F',
                            marginBottom: '8px',
                            letterSpacing: '-0.5px',
                            textShadow: '0 4px 20px rgba(234, 181, 111, 0.2)'
                        }}>
                            User Directory
                        </h1>
                        <p style={{
                            fontSize: '1rem',
                            color: 'rgba(255,255,255,0.7)',
                            margin: 0
                        }}>
                            View and manage all registered users
                        </p>
                    </div>

                    {/* Submit Report Button */}
                    <button
                        onClick={handleReg}
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
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', marginRight: '8px' }}>+</span>
                        Register User
                    </button>
                </div>

                {/* ===== STATS CARDS ===== */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '32px'
                }}>
                    {statsCards.map(stat => (
                        <div key={stat.label} style={{
                            background: stat.bg,
                            backdropFilter: 'blur(12px)',
                            borderRadius: '20px',
                            padding: '20px',
                            border: `2px solid ${stat.border}`,
                            transition: 'transform 0.2s, border-color 0.2s'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <p style={{
                                        color: stat.color,
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        margin: '0 0 8px 0'
                                    }}>
                                        {stat.label}
                                    </p>
                                    <p style={{
                                        color: stat.color,
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        margin: 0
                                    }}>
                                        {stat.value}
                                    </p>
                                </div>
                                <div style={{
                                    background: stat.box,
                                    borderRadius: '15px',
                                    padding: '20px',
                                    display: 'inline-flex'
                                }}>
                                    <FeatherIcon icon={stat.icon} size={40} color={'#fff'} opacity={0.7} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ===== FILTER SECTION ===== */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '24px',
                    justifyContent: 'flex-end',
                    flexWrap: 'wrap',
                    alignItems: 'center'  // Add this to align all items vertically
                }}>
                    {/* Search Input */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.7)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '12px',
                        padding: '0 24px',  // Changed from '8px 24px' to '0 24px'
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: '2px solid #53535375',
                        height: '48px'  // Fixed height
                    }}
                        onFocus={(e) => {
                            e.target.closest('div').style.borderColor = '#E37239';
                        }}
                        onBlur={(e) => {
                            e.target.closest('div').style.borderColor = '#53535375';
                        }}
                    >
                        <FeatherIcon icon="search" size={18} color="#ffae00" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: '#E2E8F0',
                                fontSize: '14px',
                                minWidth: '240px',
                                height: '100%'  // Match parent height
                            }}

                        />
                    </div>

                    {/* Role Filter Dropdown */}
                    <div style={{ position: 'relative', height: '48px' }}>  {/* Fixed height wrapper */}
                        <FeatherIcon
                            icon="user"
                            size={16}
                            color="#ffae00"
                            style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 1,
                                pointerEvents: 'none',

                            }}
                        />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            style={{
                                background: 'rgba(30, 41, 59, 0.7)',
                                backdropFilter: 'blur(12px)',
                                border: '2px solid #53535375',
                                borderRadius: '12px',
                                padding: '0 22px 0 36px',  // Changed to vertical padding 0
                                color: '#E2E8F0',
                                fontSize: '14px',
                                outline: 'none',
                                cursor: 'pointer',
                                height: '48px',  // Fixed height
                                width: '100%',

                            }}
                            onFocus={(e) => e.target.style.borderColor = '#E37239'}
                            onBlur={(e) => e.target.style.borderColor = '#53535375'}
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                        </select>
                    </div>

                    {/* Status Filter Buttons */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.7)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '12px',
                        padding: '4px',
                        border: '2px solid #53535375',
                        display: 'flex',
                        gap: '4px',
                        height: '48px'  // Fixed height
                    }}
                        onFocus={(e) => {
                            e.target.closest('div').style.borderColor = '#E37239';
                        }}
                        onBlur={(e) => {
                            e.target.closest('div').style.borderColor = '#53535375';
                        }}
                    >
                        <button
                            onClick={() => setStatusFilter("all")}
                            style={{
                                padding: '0 16px',  // Changed from '8px 16px' to '0 16px'
                                borderRadius: '8px',
                                border: 'none',
                                background: statusFilter === "all" ? 'rgb(255, 153, 0)' : 'transparent',
                                color: statusFilter === "all" ? '#1E293B' : '#E2E8F0',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                height: '100%'  // Match parent height
                            }}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setStatusFilter("active")}
                            style={{
                                padding: '0 16px',  // Changed from '8px 16px' to '0 16px'
                                borderRadius: '8px',
                                border: 'none',
                                background: statusFilter === "active" ? '#10B981' : 'transparent',
                                color: statusFilter === "active" ? '#fff' : '#E2E8F0',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                height: '100%',  // Match parent height
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <FeatherIcon icon="check-circle" size={14} />
                            Active
                        </button>
                        <button
                            onClick={() => setStatusFilter("inactive")}
                            style={{
                                padding: '0 16px',  // Changed from '8px 16px' to '0 16px'
                                borderRadius: '8px',
                                border: 'none',
                                background: statusFilter === "inactive" ? '#EF4444' : 'transparent',
                                color: statusFilter === "inactive" ? '#fff' : '#E2E8F0',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease',
                                height: '100%',  // Match parent height
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <FeatherIcon icon="x-circle" size={14} />
                            Inactive
                        </button>
                    </div>
                </div>

                {/* ===== USERS TABLE ===== */}
                <div style={{
                    background: '#FFFFFF',
                    borderRadius: '24px',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                    overflow: 'hidden'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(71, 85, 105, 0.3)', background: '#1E293B' }}>
                                    {['User', 'Contact', 'Role', 'Position', 'Status', 'Created', ''].map(header => (
                                        <th key={header} style={{
                                            textAlign: 'left',
                                            padding: '16px 20px',
                                            color: '#FFFFFF',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* Loading State */}
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid rgba(71, 85, 105, 0.15)', background: '#FFFFFF' }}>
                                            {Array(7).fill(0).map((_, j) => (
                                                <td key={j} style={{ padding: '16px 20px' }}>
                                                    <div className="shimmer-text" style={{
                                                        height: '20px',
                                                        width: j === 0 ? '120px' : '100px',
                                                        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                                                        backgroundSize: '200% 100%',
                                                        animation: 'shimmer 1.5s infinite'
                                                    }} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                ) : currentUsers.length === 0 ? (
                                    // Empty State
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B', background: '#FFFFFF' }}>
                                            <FeatherIcon icon="users" size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                            <p>No users found matching your criteria</p>
                                            {(searchTerm || roleFilter !== 'all') && (
                                                <button
                                                    onClick={() => {
                                                        setSearchTerm('');
                                                        setRoleFilter('all');
                                                    }}
                                                    style={{
                                                        marginTop: '12px',
                                                        background: 'transparent',
                                                        border: '1px solid #EAB56F',
                                                        borderRadius: '8px',
                                                        padding: '6px 12px',
                                                        color: '#EAB56F',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Clear Filters
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    // User Rows - Using currentUsers (paginated) instead of filteredUsers
                                    currentUsers.map((user, index) => (
                                        <tr key={user.id_master || index} style={{
                                            borderBottom: '1px solid rgba(71, 85, 105, 0.15)',
                                            transition: 'background 0.2s',
                                            cursor: 'pointer',
                                            background: '#FFFFFF'
                                        }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
                                            onClick={() => handleView(user)}
                                        >
                                            {/* User Info */}
                                            < td style={{ padding: '16px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '12px',
                                                        background: `linear-gradient(135deg, ${getRoleBadgeStyle(user.emp_role).background}40, ${getRoleBadgeStyle(user.emp_role).background}20)`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <FeatherIcon icon="user" size={20} color={getRoleBadgeStyle(user.emp_role).background} />
                                                    </div>
                                                    <div>
                                                        <div style={{ color: '#1E293B', fontWeight: '600', fontSize: '14px' }}>
                                                            {user.emp_firstname} {user.emp_lastname}
                                                        </div>
                                                        <div style={{ color: '#64748B', fontSize: '12px' }}>
                                                            @{user.user_name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Contact Info */}
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ color: '#334155', fontSize: '14px' }}>{user.emp_email}</div>
                                                <div style={{ color: '#64748B', fontSize: '11px' }}>ID: {user.id_master}</div>
                                            </td>

                                            {/* Role Badge */}
                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={{
                                                    ...getRoleBadgeStyle(user.emp_role),
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    display: 'inline-block'
                                                }}>
                                                    {user.emp_role?.charAt(0).toUpperCase() + user.emp_role?.slice(1)}
                                                </span>
                                            </td>

                                            {/* Position */}
                                            <td style={{ padding: '16px 20px', color: '#334155', fontSize: '14px' }}>
                                                {user.emp_position || '—'}
                                            </td>

                                            {/* Status */}
                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={getStatusStyle(user.is_active)}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>

                                            {/* Created Date */}
                                            <td style={{ padding: '16px 20px', color: '#64748B', fontSize: '13px' }}>
                                                {formatDate(user.created_at)}
                                            </td>

                                            {/* Actions Menu */}
                                            <td style={{ padding: '16px 20px' }}>
                                                <button style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '6px',
                                                    borderRadius: '8px',
                                                    color: '#64748B',
                                                    transition: 'all 0.2s'
                                                }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)';
                                                        e.currentTarget.style.color = '#38BDF8';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                        e.currentTarget.style.color = '#64748B';
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Add dropdown menu or modal here
                                                        console.log('Open actions for user:', user.id_master);
                                                    }}>
                                                    <FeatherIcon icon="more-vertical" size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ===== PAGINATION CONTROLS ===== */}
                {
                    !loading && filteredUsers.length > 0 && (
                        <>
                            <PaginationInfo />
                            <PaginationControls />
                        </>
                    )
                }

                {/* ===== FOOTER NOTE ===== */}
                <div style={{ marginTop: '24px', textAlign: 'center', color: '#475569', fontSize: '12px' }}>
                    <FeatherIcon icon="shield" size={12} style={{ display: 'inline', marginRight: '6px' }} />
                    Secure directory • Showing {usersPerPage} users per page • Last synced in real-time
                </div>
            </div >

            {/* Add shimmer animation for loading state */}
            < style >
                {`
                    @keyframes shimmer {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                    }
                `}
            </style >
        </div >
    );
}