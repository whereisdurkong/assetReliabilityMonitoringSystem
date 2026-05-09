import Loading from '../../components/personalComponents/loading';
import AlertModal from '../../components/personalComponents/alertModal';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import axios from 'axios';
import config from 'config';
import { useNavigate } from 'react-router-dom';

export default function AddMonitoringLog() {
    const asset_id = new URLSearchParams(window.location.search).get('id');
    const navigate = useNavigate();

    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        type: 'success',
        title: '',
        description: ''
    });

    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [monitoringDate, setMonitoringDate] = useState('');
    const [monitoringTime, setMonitoringTime] = useState('');
    const [equipmentStatus, setEquipmentStatus] = useState('');
    const [runningHours, setRunningHours] = useState('');
    const [assetData, setAssetData] = useState([]);
    const [latestMonitoring, setLatestMonitoring] = useState(null);

    const statusOptions = [
        { value: 'repair', label: 'Repair', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
        { value: 'spare', label: 'Spare', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
        { value: 'running', label: 'Running', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' }
    ];

    // Helper function to get status display info
    const getStatusDisplay = (status) => {
        switch (status) {
            case 'running':
                return { color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', icon: 'play', label: 'Running' };
            case 'spare':
                return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', icon: 'pause', label: 'Spare' };
            case 'repair':
                return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', icon: 'alert-triangle', label: 'Repair' };
            default:
                return { color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.1)', icon: 'circle', label: 'Unknown' };
        }
    };

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${config.baseApi}/assets/get-asset-by-id`, {
                    params: { id: asset_id }
                });
                const data = res.data || [];
                setAssetData(data);
                console.log(data)
            } catch (err) {
                console.log('Unable to fetch asset data: ', err)
            }
        }
        fetch()
    }, [asset_id])

    useEffect(() => {
        const fetchLatestMonitoring = async () => {
            try {
                const getAll = await axios.get(`${config.baseApi}/assets/all-monitoring`);
                const dataAll = getAll.data || [];

                // Filter data for the specific asset
                const assetMonitoring = dataAll.filter(e => e.asset_id === asset_id);

                if (assetMonitoring.length > 0) {
                    // Find the latest record based on monitoring_date and monitoring_time
                    const latest = assetMonitoring.reduce((latest, current) => {
                        const currentDate = new Date(`${current.monitoring_date} ${current.monitoring_time}`);
                        const latestDate = new Date(`${latest.monitoring_date} ${latest.monitoring_time}`);
                        return currentDate > latestDate ? current : latest;
                    });

                    setLatestMonitoring(latest);

                    console.log('=== LATEST MONITORING DATA ===');
                    console.log('Asset ID:', latest.asset_id);
                    console.log('Monitoring Date:', latest.monitoring_date);
                    console.log('Monitoring Time:', latest.monitoring_time);
                    console.log('Status:', latest.monitoring_status);
                    console.log('Running Hours:', latest.monitoring_running_hours || 'N/A');
                    console.log('Created By:', latest.created_by);
                    console.log('Created At:', latest.created_at);
                    console.log('Full object:', latest);
                    console.log('================================');
                } else {
                    console.log('No monitoring records found for asset:', asset_id);
                    setLatestMonitoring(null);
                }
            } catch (err) {
                console.log('Unable to fetch monitoring data: ', err);
                setLatestMonitoring(null);
            }
        };

        fetchLatestMonitoring();
    }, [asset_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const empInfo = JSON.parse(localStorage.getItem("user"));
        if (!monitoringDate || !monitoringTime || !equipmentStatus) {
            setAlertConfig({
                type: 'error',
                title: 'Missing Fields',
                description: 'Please fill in all required fields.'
            });
            setShowAlert(true);
            return;
        }

        if (equipmentStatus === 'running' && !runningHours) {
            setAlertConfig({
                type: 'error',
                title: 'Missing Running Hours',
                description: 'Please enter the running hours for the equipment.'
            });
            setShowAlert(true);
            return;
        }

        console.log({ asset_id, monitoringDate, monitoringTime, equipmentStatus, runningHours: equipmentStatus === 'running' ? runningHours : null });

        try {
            await axios.post(`${config.baseApi}/assets/add-monitoring-log`, {
                asset_id,
                monitoringDate,
                monitoringTime,
                equipmentStatus,
                runningHours,
                created_by: empInfo.user_name
            })
            setAlertConfig({
                type: 'success',
                title: 'Success',
                description: 'Monitoring log has been added successfully.'
            });

            setTimeout(() => {
                navigate(`/asset-monitoring?id=${asset_id}`)
            }, 2000)
        } catch (err) {
            console.log('Unable to save monitoring logs: ', err)
        }

        setShowAlert(true);
    };

    const getStatusStyle = (value) => {
        const option = statusOptions.find(opt => opt.value === value);
        return option || { color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.1)' };
    };

    const handleView = () => {
        navigate(`/view-asset?id=${asset_id}`)
    }

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
                {/* Modern Header with Stats */}
                <div style={{ marginBottom: '65px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    background: 'rgba(234, 181, 111, 0.15)',
                                    borderRadius: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <FeatherIcon icon="clipboard" size={24} color="#EAB56F" strokeWidth={1.6} />
                                </div>
                                <h1 style={{
                                    fontSize: '2.5rem',
                                    fontWeight: '700',
                                    color: '#EAB56F',
                                    textShadow: '0 4px 20px rgba(234, 181, 111, 0.2)',
                                    margin: 0,
                                    letterSpacing: '-0.5px'
                                }}>
                                    Add Monitoring Log
                                </h1>
                            </div>
                            <p style={{
                                fontSize: '1rem',
                                color: 'rgba(255,255,255,0.7)',
                                margin: 0,
                                paddingLeft: '64px'
                            }}>
                                Document equipment performance and operational status
                            </p>
                        </div>

                        {/* Quick Stats Cards */}
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '12px',
                                padding: '12px 20px',
                                border: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Asset ID</div>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#EAB56F' }}>{asset_id || '—'}</div>
                            </div>
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '12px',
                                padding: '12px 20px',
                                border: '1px solid rgba(255,255,255,0.08)'
                            }}>
                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</div>
                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#10B981' }}>Active</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout for Productivity */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.9fr', gap: '28px' }}>
                    {/* Main Form Card */}
                    <div style={{
                        background: '#FFFFFF',
                        borderRadius: '20px',
                        boxShadow: '0 20px 35px -12px rgba(0, 0, 0, 0.25)',
                        overflow: 'hidden',
                    }}>
                        {/* Asset Info Header */}
                        <div style={{
                            padding: '20px 28px',
                            borderBottom: '1px solid #EFF3F6',
                            background: '#FCFDFE'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        background: '#FFF8F0',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FeatherIcon icon="box" size={18} color="#EAB56F" strokeWidth={1.6} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Selected Asset</div>
                                        <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1E293B' }}>{assetData.asset_name || 'No asset selected'}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleView}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.8rem',
                                        color: '#EAB56F',
                                        background: 'transparent',
                                        border: 'none',
                                        fontWeight: '500',
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFF8F0'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <FeatherIcon icon="external-link" size={14} strokeWidth={1.6} />
                                    View Full Details
                                </button>
                            </div>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleSubmit} style={{ padding: '28px' }}>
                            {/* Date & Time Row */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '20px',
                                marginBottom: '28px'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        color: '#5B6E8C',
                                        marginBottom: '8px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={monitoringDate}
                                        onChange={(e) => setMonitoringDate(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            background: '#FFFFFF',
                                            border: '2px solid #E2E8F0',
                                            borderRadius: '12px',
                                            color: '#1E293B',
                                            fontSize: '0.9rem',
                                            fontFamily: 'inherit',
                                            transition: 'all 0.2s',
                                            outline: 'none',
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = '#ff8800'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                                    />
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        color: '#5B6E8C',
                                        marginBottom: '8px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        value={monitoringTime}
                                        onChange={(e) => setMonitoringTime(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px 14px',
                                            background: '#FFFFFF',
                                            border: '2px solid #E2E8F0',
                                            borderRadius: '12px',
                                            color: '#1E293B',
                                            fontSize: '0.9rem',
                                            fontFamily: 'inherit',
                                            transition: 'all 0.2s',
                                            outline: 'none',
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = '#ff8800'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                                    />
                                </div>
                            </div>

                            {/* Status Selection */}
                            <div style={{ marginBottom: '28px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    color: '#5B6E8C',
                                    marginBottom: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    Equipment Status
                                </label>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {statusOptions.map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => {
                                                setEquipmentStatus(option.value);
                                                if (option.value !== 'running') setRunningHours('');
                                            }}
                                            style={{
                                                flex: '1',
                                                minWidth: '100px',
                                                padding: '12px 16px',
                                                borderRadius: '12px',
                                                background: equipmentStatus === option.value ? option.bg : '#F8FAFE',
                                                border: equipmentStatus === option.value ? `1.5px solid ${option.color}` : '1.5px solid #E2E8F0',
                                                color: equipmentStatus === option.value ? option.color : '#94A3B8',
                                                fontWeight: '600',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <FeatherIcon
                                                icon={option.value === 'running' ? 'play' : option.value === 'spare' ? 'pause' : 'alert-triangle'}
                                                size={14}
                                                strokeWidth={1.8}
                                            />
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Running Hours - Slide in effect */}
                            {equipmentStatus === 'running' && (
                                <div style={{
                                    marginBottom: '28px',
                                    padding: '20px',
                                    background: '#F0FDF4',
                                    borderRadius: '16px',
                                    borderLeft: '3px solid #10B981',
                                    animation: 'slideIn 0.25s ease-out'
                                }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        color: '#065F46',
                                        marginBottom: '12px'
                                    }}>
                                        <FeatherIcon icon="clock" size={14} strokeWidth={1.8} />
                                        Running Hours
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={runningHours}
                                            onChange={(e) => setRunningHours(e.target.value)}
                                            placeholder="0.0"
                                            style={{
                                                width: '160px',
                                                padding: '12px 14px',
                                                background: '#FFFFFF',
                                                border: '2px solid #D1FAE5',
                                                borderRadius: '12px',
                                                color: '#065F46',
                                                fontSize: '0.9rem',
                                                fontFamily: 'inherit',
                                                outline: 'none',
                                                fontWeight: '500'
                                            }}
                                            onFocus={(e) => e.currentTarget.style.borderColor = '#ff8800'}
                                            onBlur={(e) => e.currentTarget.style.borderColor = '#D1FAE5'}
                                        />
                                        <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '500' }}>operating hours</span>
                                    </div>
                                    <p style={{ margin: '10px 0 0', fontSize: '0.7rem', color: '#047857' }}>Total accumulated runtime for this equipment</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'flex-end',
                                paddingTop: '20px',
                                borderTop: '1px solid #EFF3F6',
                                marginTop: equipmentStatus === 'running' ? '0' : '8px'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMonitoringDate('');
                                        setMonitoringTime('');
                                        setEquipmentStatus('');
                                        setRunningHours('');
                                    }}
                                    style={{
                                        background: '#F1F5F9',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '12px 24px',
                                        fontSize: '0.85rem',
                                        fontWeight: '500',
                                        color: '#475569',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#E2E8F0'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#F1F5F9'}
                                >
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        background: 'linear-gradient(135deg, #EAB56F, #F9982F)',
                                        border: 'none', borderRadius: '12px', padding: '14px 28px',
                                        fontSize: '0.95rem', fontWeight: '600', color: '#fff',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                                        gap: '10px', boxShadow: '0 4px 15px rgba(233, 150, 40, 0.3)',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(233, 150, 40, 0.4)'; }}
                                    onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(233, 150, 40, 0.3)'; }}

                                >
                                    <FeatherIcon icon="check-circle" size={16} strokeWidth={1.8} />
                                    Submit Log
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Panel - Information & Tips */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Status Legend Card */}
                        <div style={{
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '20px',
                            padding: '24px',
                            boxShadow: '0 20px 35px -12px rgba(0, 0, 0, 0.15)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <FeatherIcon icon="info" size={18} color="#EAB56F" strokeWidth={1.6} />
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#1E293B' }}>Status Reference</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FeatherIcon icon="play" size={14} color="#10B981" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#10B981', fontSize: '0.85rem' }}>Running</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Equipment is operational and active</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FeatherIcon icon="pause" size={14} color="#F59E0B" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#F59E0B', fontSize: '0.85rem' }}>Spare</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Equipment is idle but functional</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FeatherIcon icon="alert-triangle" size={14} color="#EF4444" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600', color: '#EF4444', fontSize: '0.85rem' }}>Repair</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Equipment requires maintenance</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Previous Logs - Updated with latest monitoring data */}
                        <div style={{
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '20px',
                            padding: '24px',
                            boxShadow: '0 20px 35px -12px rgba(0, 0, 0, 0.15)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <FeatherIcon icon="file-text" size={18} color="#EAB56F" strokeWidth={1.6} />
                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#1E293B' }}>Previous Monitoring Record</h3>
                            </div>

                            {latestMonitoring ? (
                                <div>

                                    {/* Status card */}
                                    <div style={{
                                        marginBottom: '16px',
                                        padding: '16px',
                                        background: getStatusDisplay(latestMonitoring.monitoring_status).bg,
                                        borderRadius: '12px',
                                        border: `1px solid ${getStatusDisplay(latestMonitoring.monitoring_status).color}20`
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                background: getStatusDisplay(latestMonitoring.monitoring_status).bg,
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: `1px solid ${getStatusDisplay(latestMonitoring.monitoring_status).color}`
                                            }}>
                                                <FeatherIcon
                                                    icon={getStatusDisplay(latestMonitoring.monitoring_status).icon}
                                                    size={20}
                                                    color={getStatusDisplay(latestMonitoring.monitoring_status).color}
                                                    strokeWidth={1.6}
                                                />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginBottom: '2px' }}>Equipment Status</div>
                                                <div style={{
                                                    fontSize: '1.1rem',
                                                    fontWeight: '600',
                                                    color: getStatusDisplay(latestMonitoring.monitoring_status).color
                                                }}>
                                                    {getStatusDisplay(latestMonitoring.monitoring_status).label}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Show running hours if status is running */}
                                        {latestMonitoring.monitoring_status === 'running' && latestMonitoring.monitoring_running_hours && (
                                            <div style={{
                                                marginTop: '12px',
                                                paddingTop: '12px',
                                                borderTop: `1px solid ${getStatusDisplay(latestMonitoring.monitoring_status).color}20`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}>
                                                <FeatherIcon icon="clock" size={14} color={getStatusDisplay(latestMonitoring.monitoring_status).color} />
                                                <div>
                                                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Running Hours: </span>
                                                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: getStatusDisplay(latestMonitoring.monitoring_status).color }}>
                                                        {latestMonitoring.monitoring_running_hours} hrs
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Additional info in bullet points */}
                                    <div style={{
                                        padding: '12px',
                                        background: '#F8FAFE',
                                        borderRadius: '12px'
                                    }}>
                                        <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FeatherIcon icon="info" size={12} />
                                            Additional Information
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                                                <div style={{ width: '4px', height: '4px', background: '#EAB56F', borderRadius: '50%' }} />
                                                <span style={{ color: '#64748B' }}>Created by:</span>
                                                <span style={{ color: '#1E293B', fontWeight: '500' }}>{latestMonitoring.created_by}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                                                <div style={{ width: '4px', height: '4px', background: '#EAB56F', borderRadius: '50%' }} />
                                                <span style={{ color: '#64748B' }}>Recorded on:</span>
                                                <span style={{ color: '#1E293B', fontWeight: '500' }}>
                                                    {latestMonitoring.monitoring_date} at {latestMonitoring.monitoring_time}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: '#94A3B8'
                                }}>
                                    <FeatherIcon icon="inbox" size={32} strokeWidth={1.4} />
                                    <p style={{ marginTop: '12px', fontSize: '0.85rem' }}>No monitoring records yet</p>
                                </div>
                            )}
                        </div>

                        {/* Quick Action Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(234, 181, 111, 0.1), rgba(234, 181, 111, 0.05))',
                            borderRadius: '20px',
                            padding: '20px',
                            border: '1px solid rgba(234, 181, 111, 0.2)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: '0.7rem', color: '#EAB56F', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quick Tip</div>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>Set running hours to zero for new equipment</div>
                                </div>
                                <FeatherIcon icon="zap" size={20} color="#EAB56F" strokeWidth={1.6} />
                            </div>
                        </div>
                    </div>
                </div>
            </Container>

            <Loading show={isLoading} />

            {showAlert && (
                <div style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    zIndex: 9999
                }}>
                    <AlertModal
                        type={alertConfig.type}
                        title={alertConfig.title}
                        description={alertConfig.description}
                        onClose={() => setShowAlert(false)}
                        autoClose={5000}
                    />
                </div>
            )}

            <style>
                {`
                    @keyframes float {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(40px, -40px) rotate(120deg); }
                        66% { transform: translate(-20px, 20px) rotate(240deg); }
                    }
                    
                    @keyframes slideIn {
                        from {
                            opacity: 0;
                            transform: translateY(-8px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    * {
                        box-sizing: border-box;
                    }
                    
                    input, button {
                        font-family: inherit;
                    }
                    
                    input[type="date"]::-webkit-calendar-picker-indicator,
                    input[type="time"]::-webkit-calendar-picker-indicator {
                        cursor: pointer;
                        filter: opacity(0.5);
                    }
                `}
            </style>
        </div>
    )
}