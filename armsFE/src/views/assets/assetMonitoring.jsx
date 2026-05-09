import { useEffect, useState, useRef } from "react";
import axios from 'axios';
import config from 'config';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert } from "react-bootstrap";
import { Plus, Calendar, Clock, Activity, BarChart3, Archive, CheckCircle, AlertTriangle, Power, X } from 'lucide-react';
import FeatherIcon from "feather-icons-react";

export default function AssetMonitoring() {
    const asset_id = new URLSearchParams(window.location.search).get('id');
    const navigate = useNavigate();

    const [assetData, setAssetData] = useState(null);
    const [monitoringLogs, setMonitoringLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Date filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Refs for date pickers
    const fromDateInputRef = useRef(null);
    const toDateInputRef = useRef(null);

    // Fetch asset details
    useEffect(() => {
        const fetchAsset = async () => {
            try {
                const res = await axios.get(`${config.baseApi}/assets/get-asset-by-id`, {
                    params: { id: asset_id }
                });
                setAssetData(res.data);
            } catch (err) {
                console.error('Unable to fetch asset data:', err);
            }
        };
        if (asset_id) fetchAsset();
    }, [asset_id]);

    // Fetch monitoring logs
    useEffect(() => {
        const fetchMonitoring = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${config.baseApi}/assets/all-monitoring`);
                const allLogs = response.data || [];

                // Filter logs for specific asset
                const assetLogs = allLogs.filter(log => log.asset_id === asset_id);
                setMonitoringLogs(assetLogs);
                setFilteredLogs(assetLogs);

                if (assetLogs.length === 0) {
                    setError('No monitoring logs found for this asset');
                }
            } catch (err) {
                console.error('Unable to fetch monitoring logs:', err);
                setError('Failed to load monitoring data');
            } finally {
                setLoading(false);
            }
        };

        if (asset_id) fetchMonitoring();
    }, [asset_id]);

    // Filter logs based on date range - FIXED VERSION
    useEffect(() => {
        if (!monitoringLogs.length) {
            setFilteredLogs([]);
            return;
        }

        let filtered = [...monitoringLogs];

        // Apply date filters
        if (startDate || endDate) {
            filtered = filtered.filter(log => {
                // Use monitoring_date for filtering (the date when monitoring was done)
                const logDateStr = log.monitoring_date || log.created_at;
                if (!logDateStr) return false;

                const logDate = new Date(logDateStr);

                // Check if date is valid
                if (isNaN(logDate.getTime())) return false;

                // Check start date
                if (startDate) {
                    const startDateTime = new Date(startDate);
                    startDateTime.setHours(0, 0, 0, 0);
                    if (logDate < startDateTime) return false;
                }

                // Check end date
                if (endDate) {
                    const endDateTime = new Date(endDate);
                    endDateTime.setHours(23, 59, 59, 999);
                    if (logDate > endDateTime) return false;
                }

                return true;
            });
        }

        setFilteredLogs(filtered);
    }, [startDate, endDate, monitoringLogs]);

    const handleAddLog = () => {
        navigate(`/add-monitoring-log?id=${asset_id}`);
    };

    const clearDateFilters = () => {
        setStartDate('');
        setEndDate('');
    };

    // Helper: Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Helper: Get status badge variant and icon
    const getStatusConfig = (status) => {
        const statusLower = (status || '').toLowerCase();
        switch (statusLower) {
            case 'operational':
            case 'running':
                return { variant: 'success', icon: <CheckCircle size={14} />, label: 'Running' };
            case 'maintenance':
            case 'repair':
                return { variant: 'warning', icon: <AlertTriangle size={14} />, label: 'Maintenance' };
            case 'spare':
                return { variant: 'secondary', icon: <Archive size={14} />, label: 'Spare' };
            case 'offline':
            case 'inactive':
                return { variant: 'danger', icon: <Power size={14} />, label: 'Offline' };
            default:
                return { variant: 'info', icon: <Activity size={14} />, label: status || 'Unknown' };
        }
    };

    // Calculate statistics based on filtered logs
    const totalLogs = filteredLogs.length;
    const latestLog = filteredLogs.length > 0
        ? filteredLogs.reduce((latest, log) =>
            new Date(log.monitoring_date || log.created_at) > new Date(latest.monitoring_date || latest.created_at) ? log : latest
        )
        : null;

    // Status distribution
    const statusDistribution = filteredLogs.reduce((acc, log) => {
        const status = log.monitoring_status || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div style={{
            background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
            minHeight: '100vh',
            padding: '65px 24px',
            position: 'relative',
            overflow: 'auto',
        }}>
            {/* Animated background elements */}
            <div style={{
                position: 'fixed', width: '600px', height: '600px', borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.03)', top: '-200px', right: '-200px',
                animation: 'float 25s infinite ease-in-out', zIndex: 0
            }} />
            <div style={{
                position: 'fixed', width: '400px', height: '400px', borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.03)', bottom: '-150px', left: '-150px',
                animation: 'float 20s infinite ease-in-out reverse', zIndex: 0
            }} />
            <div style={{
                position: 'fixed', width: '300px', height: '300px', borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.02)', top: '50%', left: '20%',
                animation: 'float 18s infinite ease-in-out', zIndex: 0
            }} />
            <Container fluid style={{ position: 'relative', zIndex: 2, maxWidth: '2000px', margin: '0 auto', padding: '0 24px' }}>

                {/* Header Section */}
                <Row className="mb-4 g-3 align-items-start align-items-md-center">
                    <Col xs={12} md={8} lg={9}>
                        <div style={{ textAlign: 'center' }} className="text-md-start">
                            <h1 style={{
                                fontSize: '2.5rem',
                                fontWeight: '700',
                                color: '#EAB56F',
                                textShadow: '0 4px 20px rgba(234, 181, 111, 0.2)',
                                margin: 0,
                                letterSpacing: '-0.5px'
                            }}>
                                Asset Monitoring Dashboard
                            </h1>
                            <p style={{
                                color: '#c1cbd4',
                                marginBottom: 0,
                                fontSize: window.innerWidth < 768 ? '0.875rem' : '1rem'
                            }}>
                                Monitoring logs for Asset ID: <strong className="text-primary">{asset_id}</strong>
                            </p>
                        </div>
                    </Col>
                    <Col xs={12} md={4} lg={3}>
                        <div style={{ display: 'flex', justifyContent: 'center' }} className="justify-content-md-end">
                            <Button
                                variant="primary"
                                onClick={handleAddLog}
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
                                <Plus size={window.innerWidth < 768 ? 16 : 18} className="me-2" />
                                Add Monitoring Log
                            </Button>
                        </div>
                    </Col>
                </Row>

                {/* Stats Cards */}
                <Row className="mb-4">
                    <Col md={4} className="mb-3">
                        <Card className="h-100 shadow-sm" style={{ border: '2px solid #ff7300', background: '#ff910010', borderRadius: '25px' }}>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div className="mb-2" style={{ color: '#EAB56F' }}>Total Logs</div>
                                        <div className="mb-0" style={{ fontSize: '2rem', fontWeight: '700', color: '#bd7100' }}>{totalLogs}</div>
                                    </div>
                                    <div className="bg-primary bg-opacity-10 rounded p-2">
                                        <BarChart3 size={24} className="text-primary" />
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4} className="mb-3">
                        <Card className="h-100 shadow-sm" style={{ border: '2px solid #09ff00', background: '#00ff2a10', borderRadius: '25px' }}>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div className="mb-2" style={{ color: '#a7fdb2' }}>Latest Record</div>
                                        <div className="mb-0 fw-semibold" style={{ fontSize: '2rem', fontWeight: '700', color: '#2a9226' }}>
                                            {latestLog ? formatDate(latestLog.monitoring_date || latestLog.created_at) : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="bg-success bg-opacity-10 rounded p-2">
                                        <Calendar size={24} className="text-success" />
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={4} className="mb-3">
                        <Card className="h-100 shadow-sm" style={{ border: '2px solid rgb(212, 0, 255)', background: '#9900ff10', borderRadius: '25px' }}>
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div className="mb-2" style={{ color: '#cb72ff' }}>Common Status</div>
                                        <div className="mb-0 fw-semibold" style={{ fontSize: '2rem', fontWeight: '700', color: '#8114ca' }}>
                                            {Object.entries(statusDistribution)
                                                .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="rounded p-2" style={{ background: '#8a04d833' }}>
                                        <Clock size={24} color="#9900ff" />
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Date Filter Section - Styled like AllAssets page */}
                <Row className="mb-4">
                    <Col>

                        <div>
                            <div className="d-flex flex-wrap align-items-center justify-content-end gap-3">
                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <span style={{
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: '#ffae00'
                                    }}>Filter by Monitoring Date:</span>

                                    {/* From Date Picker */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            background: 'rgba(0,0,0,0.3)',
                                            borderRadius: '40px',
                                            padding: '8px 16px',
                                            gap: '8px',
                                            border: '2px solid #53535375',
                                            transition: 'all 0.2s'
                                        }}
                                        onClick={() => fromDateInputRef.current?.showPicker()}
                                        onFocus={(e) => {
                                            e.target.closest('div').style.borderColor = '#E37239';
                                        }}
                                        onBlur={(e) => {
                                            e.target.closest('div').style.borderColor = '#53535375';
                                        }}
                                    >
                                        <FeatherIcon icon="calendar" size={16} color="rgb(255, 153, 0)" />
                                        <input
                                            ref={fromDateInputRef}
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            style={{
                                                border: 'none',
                                                background: 'transparent',
                                                color: '#fff',
                                                padding: '2px 8px',
                                                outline: 'none',
                                                fontSize: '14px',
                                                cursor: 'pointer'
                                            }}
                                            placeholder="From Date"
                                        />
                                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>From</span>
                                    </div>

                                    {/* To Date Picker */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            background: 'rgba(0,0,0,0.3)',
                                            borderRadius: '40px',
                                            padding: '8px 16px',
                                            gap: '8px',
                                            border: '2px solid #53535375',
                                            transition: 'all 0.2s'
                                        }}
                                        onClick={() => toDateInputRef.current?.showPicker()}
                                        onFocus={(e) => {
                                            e.target.closest('div').style.borderColor = '#E37239';
                                        }}
                                        onBlur={(e) => {
                                            e.target.closest('div').style.borderColor = '#53535375';
                                        }}
                                    >
                                        <FeatherIcon icon="calendar" size={16} color="rgb(255, 153, 0)" />
                                        <input
                                            ref={toDateInputRef}
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            style={{
                                                border: 'none',
                                                background: 'transparent',
                                                color: '#fff',
                                                padding: '2px 8px',
                                                outline: 'none',
                                                fontSize: '14px',
                                                cursor: 'pointer'
                                            }}
                                            placeholder="To Date"
                                        />
                                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>To</span>
                                    </div>

                                    {(startDate || endDate) && (
                                        <Button
                                            variant="outline-secondary"
                                            onClick={clearDateFilters}
                                            size="sm"
                                            style={{
                                                borderRadius: '40px',
                                                borderColor: 'rgba(234, 181, 111, 0.5)',
                                                color: '#EAB56F',
                                                padding: '8px 20px'
                                            }}
                                        >
                                            <X size={16} className="me-1" />
                                            Clear
                                        </Button>
                                    )}
                                </div>

                            </div>
                        </div>

                    </Col>
                </Row>
                {/* Main Data Table */}
                <Row>
                    <Col>
                        <Card className="shadow-sm border-0" style={{ borderRadius: '29px' }}>
                            <Card.Body className="p-0">
                                {loading ? (
                                    <div className="text-center py-5">
                                        <Spinner variant="primary" animation="border" />
                                        <p className="mt-3 text-muted">Loading monitoring logs...</p>
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-5">
                                        <Alert variant="warning" className="m-3">
                                            {error}
                                        </Alert>
                                    </div>
                                ) : filteredLogs.length === 0 ? (
                                    <div className="text-center py-5">
                                        <Activity size={48} className="text-muted mb-3" />
                                        <h5 className="text-muted">
                                            {monitoringLogs.length > 0
                                                ? 'No logs found for selected date range'
                                                : 'No monitoring logs found'}
                                        </h5>
                                        {monitoringLogs.length === 0 && (
                                            <Button variant="primary" onClick={handleAddLog} className="mt-3">
                                                <Plus size={16} className="me-1" />
                                                Add First Log
                                            </Button>
                                        )}
                                        {(startDate || endDate) && (
                                            <Button variant="outline-secondary" onClick={clearDateFilters} className="mt-3 ms-2">
                                                Clear Filters
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="table-responsive" style={{ borderRadius: '25px' }}>
                                        <Table hover className="mb-0">
                                            <thead style={{ backgroundColor: '#1E293B' }}>
                                                <tr>
                                                    <th style={{ padding: '16px', color: '#fff' }}>#</th>
                                                    <th style={{ padding: '16px', color: '#fff' }}>Monitoring Date</th>
                                                    <th style={{ padding: '16px', color: '#fff' }}>Time</th>
                                                    <th style={{ padding: '16px', color: '#fff' }}>Status</th>
                                                    <th style={{ padding: '16px', color: '#fff' }}>Running Hours</th>
                                                    <th style={{ padding: '16px', color: '#fff' }}>Created At</th>
                                                    <th style={{ padding: '16px', color: '#fff' }}>Created By</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredLogs.map((log, index) => {
                                                    const statusConfig = getStatusConfig(log.monitoring_status);
                                                    return (
                                                        <tr key={log.id_master || index}>
                                                            <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                                                                {index + 1}
                                                            </td>
                                                            <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <Calendar size={14} className="text-muted" />
                                                                    {formatDate(log.monitoring_date)}
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <Clock size={14} className="text-muted" />
                                                                    {log.monitoring_time || '—'}
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                                                                <Badge bg={statusConfig.variant}>
                                                                    <span className="d-flex align-items-center gap-1">
                                                                        {statusConfig.icon}
                                                                        {statusConfig.label}
                                                                    </span>
                                                                </Badge>
                                                            </td>
                                                            <td style={{ padding: '16px', verticalAlign: 'middle' }}>
                                                                {log.monitoring_running_hours || '—'}
                                                            </td>
                                                            <td style={{ padding: '16px', verticalAlign: 'middle', fontSize: '0.85rem' }}>
                                                                {formatDate(log.created_at)}
                                                            </td>
                                                            <td style={{ padding: '16px', verticalAlign: 'middle', fontSize: '0.85rem' }}>
                                                                {log.created_by || '—'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </Card.Body>
                            {filteredLogs.length > 0 && (
                                <Card.Footer className="bg-white text-muted" style={{ borderRadius: '25px' }}>
                                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                                        <small>Showing {filteredLogs.length} of {monitoringLogs.length} monitoring log(s)</small>
                                        <div>
                                            {startDate && (
                                                <small className="me-2">📅 From: {formatDate(startDate)}</small>
                                            )}
                                            {endDate && (
                                                <small>📅 To: {formatDate(endDate)}</small>
                                            )}
                                        </div>
                                    </div>
                                </Card.Footer>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Container>

            <style>
                {`
                    @keyframes float {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(40px, -40px) rotate(120deg); }
                        66% { transform: translate(-20px, 20px) rotate(240deg); }
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
                        cursor: pointer;
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