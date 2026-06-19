import { useEffect, useState, useCallback } from "react";
import axios from 'axios';
import config from 'config';
import { Col, Form, Row } from "react-bootstrap";
import FeatherIcon from "feather-icons-react";
import { useNavigate } from "react-router-dom";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ─── Constants ────────────────────────────────────────────────────────────────
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

// ─── Parameter sets keyed by trivector ───────────────────────────────────────
const PARAM_SETS = {
    engine: [
        { label: "Viscosity at 40°C", key: "viscosity_at_40c", unit: "cSt" },
        { label: "Viscosity at 100°C", key: "viscosity_at_100c", unit: "cSt" },
        { label: "TBN", key: "tbn", unit: "mg KOH/g" },
        { label: "Oxidation", key: "oxidation", unit: "abs/0.1mm" },
        { label: "Sulfation", key: "sulfation", unit: "abs/0.1mm" },
        { label: "Nitration", key: "nitration", unit: "abs/cm" },
        { label: "Calcium", key: "calcium", unit: "ppm" },
        { label: "Magnesium", key: "magnesium", unit: "ppm" },
        { label: "Boron", key: "boron", unit: "ppm" },
        { label: "Molybdenum", key: "molybdenum", unit: "ppm" },
        { label: "Zinc", key: "zinc", unit: "ppm" },
        { label: "Phosphorus", key: "phosphorus", unit: "ppm" },
        { label: "Water", key: "water", unit: "%" },
    ],
    gear: [
        { label: "Viscosity at 40°C", key: "viscosity_at_40c", unit: "cSt" },
        { label: "Zinc", key: "zinc", unit: "ppm" },
        { label: "Phosphorus", key: "phosphorus", unit: "ppm" },
        { label: "Magnesium", key: "magnesium", unit: "ppm" },
        { label: "Oxidation", key: "oxidation", unit: "abs/0.1mm" },
        { label: "TAN", key: "tan", unit: "" },
        { label: "ISO 4406 (>4μm)", key: "iso_4406_code_gt4um", unit: "" },
        { label: "ISO 4406 (>6μm)", key: "iso_4406_code_gt6um", unit: "" },
        { label: "ISO 4406 (>14μm)", key: "iso_4406_code_gt14um", unit: "" },
        { label: "Water", key: "water", unit: "%" },
    ],
    compressor: [
        { label: "Viscosity at 40°C", key: "viscosity_at_40c", unit: "cSt" },
        { label: "Oxidation", key: "oxidation", unit: "abs/0.1mm" },
        { label: "TAN", key: "tan", unit: "" },
        { label: "Zinc", key: "zinc", unit: "ppm" },
        { label: "Phosphorus", key: "phosphorus", unit: "ppm" },
        { label: "Boron", key: "boron", unit: "ppm" },
        { label: "Calcium", key: "calcium", unit: "ppm" },
        { label: "Water", key: "water", unit: "%" },
    ],
};

function getTrivectorKey(trivector) {
    if (!trivector) return null;
    const v = trivector.toLowerCase();
    if (v.includes('engine')) return 'engine';
    if (v.includes('compressor')) return 'compressor';
    if (v.includes('gear') || v.includes('hydraulic') || v.includes('transmission')) return 'gear';
    return null;
}

function getParams(trivector) {
    const key = getTrivectorKey(trivector);
    return key ? PARAM_SETS[key] : [];
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NewOilDashboard() {

    const [allData, setAllData] = useState([]);
    const [uniqueGroups, setUniqueGroups] = useState([]); // deduplicated dropdown options
    const [selectedGroup, setSelectedGroup] = useState(null); // the selected composite key group
    const [selectedNewOil, setSelectedNewOil] = useState(null); // representative record for KPI cards / metrics
    const [selectedYear, setSelectedYear] = useState('all');

    // Test Results state
    const [matchData, setMatchData] = useState([]);
    const [filteredMatchData, setFilteredMatchData] = useState([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [activeTab, setActiveTab] = useState('metrics');
    const [modalData, setModalData] = useState(null);
    const [hiddenLines, setHiddenLines] = useState(new Set());

    const navigate = useNavigate();

    /** Build a stable composite key string from the 4 fields */
    const makeGroupKey = (r) =>
        `${r.oil_batch_code}||${r.input_drum_number}||${r.manufacturing_date}||${r.trivector}`;

    // ── Fetch all data ────────────────────────────────────────────────────────
    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${config.baseApi}/assetsAnalysis/get-all-submitted-no-assets`);
                const resdata = res.data || [];
                const data = resdata.filter(
                    e => e.is_active === 1 || e.is_active === true || e.is_active === '1'
                );
                setAllData(data);

                // Build unique groups — one representative record per composite key
                const seen = new Map();
                data.forEach(r => {
                    const key = makeGroupKey(r);
                    if (!seen.has(key)) seen.set(key, r);
                });
                const groups = Array.from(seen.values());
                setUniqueGroups(groups);

                if (groups.length > 0) {
                    setSelectedGroup(groups[0]);
                    setSelectedNewOil(groups[0]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetch();
    }, []);

    // ── When selectedGroup changes, build historical match set ────────────────
    useEffect(() => {
        if (!selectedGroup) { setMatchData([]); setFilteredMatchData([]); return; }

        const matched = allData
            .filter(r => makeGroupKey(r) === makeGroupKey(selectedGroup))
            .sort((a, b) => new Date(a.analysis_date) - new Date(b.analysis_date));

        setMatchData(matched);
        setFilteredMatchData(matched);
        setHiddenLines(new Set());

        // Use the most recent record as the representative for KPI cards & metric values
        if (matched.length > 0) {
            setSelectedNewOil(matched[matched.length - 1]);
            setFromDate(new Date(matched[0].analysis_date).toISOString().split('T')[0]);
            setToDate(new Date(matched[matched.length - 1].analysis_date).toISOString().split('T')[0]);
        }
    }, [selectedGroup, allData]);

    // ── Date range filter ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!matchData.length) return;
        let filtered = [...matchData];
        if (fromDate) {
            const from = new Date(fromDate); from.setHours(0, 0, 0, 0);
            filtered = filtered.filter(r => new Date(r.analysis_date) >= from);
        }
        if (toDate) {
            const to = new Date(toDate); to.setHours(23, 59, 59, 999);
            filtered = filtered.filter(r => new Date(r.analysis_date) <= to);
        }
        setFilteredMatchData(filtered);
    }, [fromDate, toDate, matchData]);

    // ── Selectors ─────────────────────────────────────────────────────────────
    const handleAssetChange = (event) => {
        const groupKey = event.target.value;
        const group = uniqueGroups.find(g => makeGroupKey(g) === groupKey);
        if (group) { setSelectedGroup(group); }
        setSelectedYear('all');
        setActiveTab('metrics');
    };

    const getAvailableYears = () => {
        if (!selectedGroup) return [];
        const years = new Set();
        matchData.forEach(r => {
            if (r.analysis_date) years.add(new Date(r.analysis_date).getFullYear());
        });
        return Array.from(years).sort((a, b) => b - a);
    };

    // All reports sharing the same 4-field composite key, optionally filtered by year
    const getAssetReports = () => {
        if (!selectedGroup) return [];
        const groupKey = makeGroupKey(selectedGroup);
        let filtered = allData.filter(r => makeGroupKey(r) === groupKey);
        if (selectedYear !== 'all') {
            filtered = filtered.filter(r => {
                if (!r.analysis_date) return false;
                return new Date(r.analysis_date).getFullYear() === parseInt(selectedYear);
            });
        }
        return filtered.sort((a, b) => new Date(b.analysis_date) - new Date(a.analysis_date));
    };

    const newOilReports = getAssetReports();
    const availableYears = getAvailableYears();

    const handleYearChange = (e) => setSelectedYear(e.target.value);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const calculateReportStatus = (report) => {
        const level1Valid = report.level1 === '1';
        const level2Valid = report.level2 === '1';
        const resultsValid = report.resolution && String(report.resolution).trim() !== '';
        const actionsValid = report.actions && String(report.actions).trim() !== '';
        const oilBeforeValid = report.oil_before && String(report.oil_before).trim() !== '';
        const oilAfterValid = report.oil_after && String(report.oil_after).trim() !== '';
        if (level1Valid && level2Valid && resultsValid && actionsValid && oilBeforeValid && oilAfterValid) return "Done";
        return "On-going";
    };

    const handleSubmittedAssetView = (id) => navigate(`/view-submitted-asset-no-asset?id=${id}`);

    // ── Chart helpers ─────────────────────────────────────────────────────────
    const getSingleChartData = useCallback((paramKey) => {
        if (filteredMatchData.length <= 1) return [];
        return filteredMatchData
            .filter(r => r[paramKey] !== null && r[paramKey] !== undefined && r[paramKey] !== '')
            .map(r => ({
                date: new Date(r.analysis_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                value: parseFloat(r[paramKey]) || 0,
                fullDate: new Date(r.analysis_date)
            }))
            .sort((a, b) => a.fullDate - b.fullDate);
    }, [filteredMatchData]);

    const getMultiChartData = useCallback((params) => {
        if (filteredMatchData.length <= 1) return [];
        const sorted = [...filteredMatchData].sort((a, b) => new Date(a.analysis_date) - new Date(b.analysis_date));
        return sorted.map(r => {
            const point = {
                date: new Date(r.analysis_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                fullDate: new Date(r.analysis_date)
            };
            params.forEach(p => {
                const v = r[p.key];
                point[p.key] = (v !== null && v !== undefined && v !== '')
                    ? (typeof v === 'number' ? v : parseFloat(v) || 0)
                    : null;
            });
            return point;
        });
    }, [filteredMatchData]);

    const toggleLine = useCallback((key) => {
        setHiddenLines(prev => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    }, []);

    // ── Derived values ────────────────────────────────────────────────────────
    const params = getParams(selectedNewOil?.trivector);
    const hasCharts = params.length > 0;

    const tabGradients = {
        metrics: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
        trends: 'linear-gradient(135deg, #6949a5 0%, #3F1D7D 100%)',
    };

    // ── Sub-components ────────────────────────────────────────────────────────

    const MetricTile = ({ label, value, unit, paramKey }) => {
        const chartData = getSingleChartData(paramKey);
        const showChart = chartData.length > 1;
        return (
            <div
                style={{ cursor: showChart ? 'pointer' : 'default' }}
                onClick={() => showChart && setModalData({ label, unit, data: chartData, paramKey })}
            >
                <div style={{
                    background: 'linear-gradient(135deg, #ffd698 0%, #ffb347 100%)',
                    borderRadius: showChart ? '16px 16px 0 0' : '16px',
                    padding: 'clamp(12px, 3vw, 16px)',
                    border: '1.5px solid #6e6e6e',
                    display: 'flex', flexDirection: 'row',
                    justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px'
                }}>
                    <div style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', color: '#303030', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', wordBreak: 'break-word' }}>
                        {label}
                    </div>
                    <div style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 'bold', color: COLORS.dark, display: 'flex', flexDirection: 'row', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                        <span>{(value !== null && value !== undefined && value !== '') ? value : '—'}</span>
                        {unit && value !== null && value !== undefined && value !== '' && (
                            <span style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: COLORS.gray }}>{unit}</span>
                        )}
                    </div>
                </div>
                {showChart && (
                    <div style={{ padding: 'clamp(8px, 2vw, 12px)', background: '#fff2d6', borderRadius: '0 0 12px 12px', border: '1.5px solid #6e6e6e', borderTop: 'none' }}>
                        <div style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: COLORS.gray, marginBottom: '8px' }}>
                            Trend ({chartData.length} records) — click to enlarge
                        </div>
                        <div style={{ height: 'clamp(120px, 20vw, 160px)', width: '100%' }}>
                            <ResponsiveContainer>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}30`} />
                                    <XAxis dataKey="date" tick={{ fontSize: 8 }} interval="preserveStartEnd" angle={-20} textAnchor="end" height={50} />
                                    <YAxis tick={{ fontSize: 8 }} label={{ value: unit || '', angle: -90, position: 'insideLeft', fontSize: 8 }} />
                                    <Tooltip formatter={(v) => [`${v} ${unit || ''}`, label]} labelFormatter={(l) => `Date: ${l}`} />
                                    <Line type="linear" dataKey="value" stroke={COLORS.accent} strokeWidth={2} dot={{ fill: COLORS.accent, r: 2 }} activeDot={{ r: 4 }} name={label} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const OverviewChart = ({ params }) => {
        const chartData = getMultiChartData(params);
        const validParams = params.filter(p =>
            filteredMatchData.some(r => r[p.key] !== null && r[p.key] !== undefined && r[p.key] !== '')
        );
        const hasData = chartData.length > 0 && validParams.length > 0;

        const renderLegend = ({ payload }) => (
            <ul style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 16px', padding: '10px 0 0', margin: 0, listStyle: 'none' }}>
                {payload.map(entry => {
                    const hidden = hiddenLines.has(entry.dataKey);
                    return (
                        <li key={entry.dataKey} onClick={() => toggleLine(entry.dataKey)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', opacity: hidden ? 0.5 : 1, textDecoration: hidden ? 'line-through' : 'none', background: hidden ? '#f5f5f5' : 'transparent' }}>
                            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', backgroundColor: entry.color }} />
                            <span style={{ color: COLORS.dark }}>{entry.value}</span>
                        </li>
                    );
                })}
            </ul>
        );

        if (!hasData) {
            return (
                <div style={{ background: '#fff2d6', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1.5px solid #6e6e6e', color: COLORS.gray }}>
                    Not enough historical data to display trends. Submit more analyses with the same Oil Batch Code and Drum Number.
                </div>
            );
        }

        return (
            <div style={{ background: '#fff2d6', borderRadius: '16px', padding: '20px', border: '1.5px solid #6e6e6e' }}>
                <div style={{ height: '450px', width: '100%' }}>
                    <ResponsiveContainer>
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}30`} />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" angle={-25} textAnchor="end" height={70} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip
                                formatter={(v, name) => {
                                    const p = params.find(x => x.key === name);
                                    return [`${v} ${p?.unit || ''}`, p?.label || name];
                                }}
                                labelFormatter={(l) => `Date: ${l}`}
                            />
                            <Legend content={renderLegend} verticalAlign="bottom" height={80} />
                            {validParams.map((p, i) => (
                                <Line key={p.key} type="linear" dataKey={p.key}
                                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                    strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }}
                                    name={p.label} connectNulls hide={hiddenLines.has(p.key)} />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div style={{ padding: '8px', backgroundColor: `${COLORS.primary}10`, borderRadius: '8px', fontSize: '12px', color: COLORS.gray, textAlign: 'center', marginTop: '8px' }}>
                    <FeatherIcon icon="info" size={14} color={COLORS.accent} style={{ marginRight: '6px' }} />
                    Click any parameter in the legend to show / hide it
                </div>
            </div>
        );
    };

    const DateFilterRow = () => {
        if (matchData.length <= 1) return null;
        return (
            <div style={{ background: COLORS.white, borderRadius: '0 0 16px 16px', padding: 'clamp(12px, 3vw, 16px)', marginBottom: '24px', border: `2px solid ${COLORS.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FeatherIcon icon="calendar" size={16} color={COLORS.accent} />
                        <span style={{ fontSize: '14px', fontWeight: '600', color: COLORS.dark }}>Date Range:</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: COLORS.gray }}>From:</span>
                        <Form.Control type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                            style={{ width: '150px', borderRadius: '8px', border: `1px solid ${COLORS.primary}40`, fontSize: '13px' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: COLORS.gray }}>To:</span>
                        <Form.Control type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                            style={{ width: '150px', borderRadius: '8px', border: `1px solid ${COLORS.primary}40`, fontSize: '13px' }} />
                    </div>
                    <button onClick={() => {
                        if (matchData.length > 0) {
                            setFromDate(new Date(matchData[0].analysis_date).toISOString().split('T')[0]);
                            setToDate(new Date(matchData[matchData.length - 1].analysis_date).toISOString().split('T')[0]);
                        }
                    }} style={{ padding: '6px 16px', background: `${COLORS.primary}20`, border: `1px solid ${COLORS.primary}40`, borderRadius: '8px', fontSize: '13px', fontWeight: '500', color: COLORS.dark, cursor: 'pointer' }}>
                        Reset
                    </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: `${COLORS.primary}10`, borderRadius: '20px' }}>
                    <FeatherIcon icon="bar-chart-2" size={12} color={COLORS.accent} />
                    <span style={{ fontSize: '12px', fontWeight: '500', color: COLORS.dark }}>
                        {filteredMatchData.length} / {matchData.length} records
                    </span>
                </div>
            </div>
        );
    };

    const EnlargedChartModal = () => {
        if (!modalData) return null;
        return (
            <div onClick={() => setModalData(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
                <div onClick={e => e.stopPropagation()} style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fff7db 100%)', borderRadius: '20px', width: '90%', maxWidth: '1200px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '3px solid #ffbb00' }}>
                    <div style={{ background: 'linear-gradient(135deg, #ffd698 0%, #ffb347 100%)', padding: 'clamp(12px, 3vw, 16px)', borderBottom: `1px solid ${COLORS.light}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                            <h3 style={{ margin: 0, color: '#252525', fontSize: '16px', fontWeight: '600' }}>{modalData.label} — Historical Trend</h3>
                            <p style={{ margin: '5px 0 0', color: COLORS.gray, fontSize: '14px' }}>{modalData.data.length} records</p>
                        </div>
                        <button onClick={() => setModalData(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px' }}>
                            <FeatherIcon icon="x" size={24} color={COLORS.dark} />
                        </button>
                    </div>
                    <div style={{ padding: '30px', height: '500px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={modalData.data}>
                                <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}30`} />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" angle={-25} textAnchor="end" height={70} />
                                <YAxis tick={{ fontSize: 12 }} label={{ value: modalData.unit || '', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                                <Tooltip formatter={v => [`${v} ${modalData.unit || ''}`, modalData.label]} labelFormatter={l => `Date: ${l}`} />
                                <Line type="linear" dataKey="value" stroke={COLORS.accent} strokeWidth={3} dot={{ fill: COLORS.accent, r: 4 }} activeDot={{ r: 6 }} name={modalData.label} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={{
            background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
            minHeight: '100vh', position: 'relative', overflow: 'hidden', paddingTop: '50px'
        }}>
            {/* Animated background blobs */}
            <div style={{ position: 'fixed', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', top: '-200px', right: '-200px', animation: 'float 25s infinite ease-in-out', zIndex: 0 }} />
            <div style={{ position: 'fixed', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', bottom: '-150px', left: '-150px', animation: 'float 20s infinite ease-in-out reverse', zIndex: 0 }} />
            <div style={{ position: 'fixed', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', top: '50%', left: '20%', animation: 'float 18s infinite ease-in-out', zIndex: 0 }} />

            {/* ── Header ── */}
            <div style={{ position: 'relative', zIndex: 2, maxWidth: '2000px' }}>
                <div style={{ margin: '0 auto', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.8rem', fontWeight: '700', color: '#EAB56F', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                            New Oil Analytics Dashboard
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                            Report completion and criticality overview
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                        {/* Oil Batch Code selector */}
                        <div>
                            <label style={{ color: 'rgba(255,187,0,0.7)', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                                Select Oil Batch Code
                            </label>
                            <select
                                value={selectedGroup ? makeGroupKey(selectedGroup) : ''}
                                onChange={handleAssetChange}
                                style={{ padding: '10px 32px 10px 16px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.4)', color: 'white', fontSize: '14px', cursor: 'pointer', minWidth: '240px', outline: 'none' }}
                                onFocus={e => e.target.style.borderColor = '#ff7b00'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                            >
                                {uniqueGroups.map(g => (
                                    <option key={makeGroupKey(g)} value={makeGroupKey(g)} style={{ background: '#1a2a35' }}>
                                        {g.oil_batch_code}
                                        {g.input_drum_number ? ` — ${g.input_drum_number}` : ''}

                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Year filter */}
                        {availableYears.length > 0 && (
                            <div>
                                <label style={{ color: 'rgba(255,187,0,0.7)', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                                    Filter by Year
                                </label>
                                <select
                                    value={selectedYear}
                                    onChange={handleYearChange}
                                    style={{ padding: '10px 32px 10px 16px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.4)', color: 'white', fontSize: '14px', cursor: 'pointer', minWidth: '140px', outline: 'none' }}
                                    onFocus={e => e.target.style.borderColor = '#ff7b00'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                                >
                                    <option value="all" style={{ background: '#1a2a35' }}>All Years</option>
                                    {availableYears.map(year => (
                                        <option key={year} value={year} style={{ background: '#1a2a35' }}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div style={{ position: 'relative', zIndex: 2, maxWidth: '2000px', margin: '0 auto', padding: '32px' }}>

                {/* KPI Cards */}
                {selectedNewOil && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(16px, 3vw, 24px)', marginBottom: 'clamp(24px, 4vw, 32px)' }}>
                        {/* Oil Batch Code */}
                        <div style={{ background: 'rgba(9,255,0,0.08)', backdropFilter: 'blur(12px)', borderRadius: 'clamp(12px, 2vw, 16px)', border: '2px solid rgb(56,196,56)', padding: 'clamp(16px, 3vw, 20px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'clamp(12px, 2vw, 16px)', flexWrap: 'wrap' }}>
                                <div style={{ width: 'clamp(60px, 10vw, 80px)', height: 'clamp(60px, 10vw, 80px)', borderRadius: 'clamp(8px, 1.5vw, 10px)', background: 'rgba(33,243,61,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <FeatherIcon icon="droplet" color={'#5ce957'} style={{ width: 'clamp(24px, 5vw, 40px)', height: 'clamp(24px, 5vw, 40px)' }} />
                                </div>
                                <div style={{ textAlign: 'right', flex: 1, minWidth: '120px' }}>
                                    <p style={{ color: 'rgb(3,160,29)', fontSize: 'clamp(0.875rem, 2vw, 1rem)', margin: 0, fontWeight: '800', wordBreak: 'break-word' }}>Oil Batch Code</p>
                                    <p style={{ color: '#018a0c', fontSize: 'clamp(20px, 5vw, 32px)', fontWeight: '800', margin: 0, wordBreak: 'break-word' }}>{selectedNewOil.oil_batch_code}</p>
                                </div>
                            </div>
                        </div>
                        {/* Oil Drum Number */}
                        <div style={{ background: 'rgba(0,68,255,0.08)', backdropFilter: 'blur(12px)', borderRadius: 'clamp(12px, 2vw, 16px)', border: '2px solid rgb(56,70,196)', padding: 'clamp(16px, 3vw, 20px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'clamp(12px, 2vw, 16px)', flexWrap: 'wrap' }}>
                                <div style={{ width: 'clamp(60px, 10vw, 80px)', height: 'clamp(60px, 10vw, 80px)', borderRadius: 'clamp(8px, 1.5vw, 10px)', background: 'rgba(33,150,243,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <FeatherIcon icon="box" color={'#5779e9'} style={{ width: 'clamp(24px, 5vw, 40px)', height: 'clamp(24px, 5vw, 40px)' }} />
                                </div>
                                <div style={{ textAlign: 'right', flex: 1, minWidth: '120px' }}>
                                    <p style={{ color: 'rgb(62,123,255)', fontSize: 'clamp(0.875rem, 2vw, 1rem)', margin: 0, fontWeight: '800', wordBreak: 'break-word' }}>Oil Drum Number</p>
                                    <p style={{ color: '#2196F3', fontSize: 'clamp(20px, 5vw, 32px)', fontWeight: '800', margin: 0, wordBreak: 'break-word' }}>{selectedNewOil.input_drum_number || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        {/* Manufacturing Date */}
                        <div style={{ background: 'rgba(162,0,255,0.19)', backdropFilter: 'blur(12px)', borderRadius: 'clamp(12px, 2vw, 16px)', border: '2px solid rgba(123,0,172,0.77)', padding: 'clamp(16px, 3vw, 20px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'clamp(12px, 2vw, 16px)', flexWrap: 'wrap' }}>
                                <div style={{ width: 'clamp(60px, 10vw, 80px)', height: 'clamp(60px, 10vw, 80px)', borderRadius: 'clamp(8px, 1.5vw, 10px)', background: 'rgba(162,0,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <FeatherIcon icon="calendar" color={'#cc7eff'} style={{ width: 'clamp(24px, 5vw, 40px)', height: 'clamp(24px, 5vw, 40px)' }} />
                                </div>
                                <div style={{ textAlign: 'right', flex: 1, minWidth: '120px' }}>
                                    <p style={{ color: 'rgb(184,40,219)', fontSize: 'clamp(0.875rem, 2vw, 1rem)', margin: 0, fontWeight: '800', wordBreak: 'break-word' }}>Manufacturing Date</p>
                                    <p style={{ color: '#b700ff', fontSize: 'clamp(20px, 5vw, 32px)', fontWeight: '800', margin: 0, wordBreak: 'break-word' }}>{selectedNewOil.manufacturing_date ? formatDate(selectedNewOil.manufacturing_date) : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        {/* Analysis Date */}
                        <div style={{ background: 'rgba(255,145,0,0.19)', backdropFilter: 'blur(12px)', borderRadius: 'clamp(12px, 2vw, 16px)', border: '2px solid rgba(172,92,0,0.77)', padding: 'clamp(16px, 3vw, 20px)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'clamp(12px, 2vw, 16px)', flexWrap: 'wrap' }}>
                                <div style={{ width: 'clamp(60px, 10vw, 80px)', height: 'clamp(60px, 10vw, 80px)', borderRadius: 'clamp(8px, 1.5vw, 10px)', background: 'rgba(255,152,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <FeatherIcon icon="calendar" color={'#ffa835'} style={{ width: 'clamp(24px, 5vw, 40px)', height: 'clamp(24px, 5vw, 40px)' }} />
                                </div>
                                <div style={{ textAlign: 'right', flex: 1, minWidth: '120px' }}>
                                    <p style={{ color: 'rgba(255,172,47,0.6)', fontSize: 'clamp(0.875rem, 2vw, 1rem)', margin: 0, fontWeight: '800', wordBreak: 'break-word' }}>Analysis Date</p>
                                    <p style={{ color: '#FF9800', fontSize: 'clamp(20px, 5vw, 32px)', fontWeight: '800', margin: 0, wordBreak: 'break-word' }}>{selectedNewOil.analysis_date ? formatDate(selectedNewOil.analysis_date) : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Reports + Test Results two-column layout ── */}
                <div style={{ display: 'linear', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '32px', marginBottom: '32px' }}>

                    {/* Reports Section */}
                    {selectedNewOil && (
                        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                                <h2 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                                    New Oil Analysis Reports
                                    <span style={{ marginLeft: '10px', background: '#2196F3', padding: '2px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                                        {newOilReports.length}
                                    </span>
                                </h2>
                            </div>
                            <div style={{ maxHeight: '500px', overflowY: 'auto', padding: '16px' }}>
                                {newOilReports.length > 0 ? (
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {newOilReports.map((report) => (
                                            <div key={report.analysis_id} style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '16px', borderLeft: `3px solid #FF9800` }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                                                            <div style={{ color: '#4CAF50', fontSize: '12px', fontWeight: '600' }}>Report #{report.analysis_id}</div>
                                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{formatDate(report.analysis_date)}</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', color: calculateReportStatus(report) === 'Done' ? '#4CAF50' : '#FF9800', fontSize: '12px', fontWeight: '600', gap: '6px' }}>
                                                            <FeatherIcon icon='alert-circle' size={14} color={calculateReportStatus(report) === 'Done' ? '#4CAF50' : '#FF9800'} />
                                                            {calculateReportStatus(report)}
                                                        </div>
                                                        <div style={{ cursor: 'pointer' }}>
                                                            <FeatherIcon icon="external-link" size={23} color={'#636363'} onClick={() => handleSubmittedAssetView(report.analysis_id)} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '24px' }}>
                                                    <div>
                                                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '2px' }}>Trivector</p>
                                                        <p style={{ color: 'white', fontSize: '14px', fontWeight: '500', margin: 0 }}>{report.trivector || 'No Trivector'}</p>
                                                    </div>
                                                    <div>
                                                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '2px' }}>Analysis Status</p>
                                                        <p style={{ color: '#FF9800', fontSize: '14px', fontWeight: '500', margin: 0 }}>{report.analysis_status || 'no status'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.5)' }}>
                                        No reports available
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Test Results Section (placeholder column if no oil selected) ── */}
                    {selectedNewOil && !hasCharts && selectedNewOil.trivector && (
                        <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '32px' }}>
                                <FeatherIcon icon="info" size={32} color={COLORS.accent} style={{ marginBottom: '12px' }} />
                                <p style={{ margin: 0, fontSize: '15px' }}>
                                    No parameter set defined for trivector "<strong style={{ color: 'white' }}>{selectedNewOil.trivector}</strong>".
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Test Results Section (full width, below the grid) ── */}
                {selectedNewOil && hasCharts && (
                    <div style={{ background: '#fcf6ee', padding: 'clamp(16px, 4vw, 25px)', borderRadius: '20px', marginBottom: '32px' }}>

                        {/* Section header + tabs */}
                        <div style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', marginBottom: '0' }}>
                            <div style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: '600', color: '#444444', marginBottom: '8px' }}>
                                <FeatherIcon icon="trending-up" size={20} style={{ marginRight: '8px', color: COLORS.accent, verticalAlign: 'middle' }} />
                                Test Results
                                {matchData.length > 1 && (
                                    <span style={{ fontSize: '13px', fontWeight: '400', color: COLORS.gray, marginLeft: '12px' }}>
                                        — {matchData.length} records for this batch / drum
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {['metrics', 'trends'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        style={{
                                            padding: 'clamp(8px, 2vw, 10px) clamp(16px, 4vw, 24px)',
                                            border: 'none',
                                            background: activeTab === tab ? tabGradients[tab] : 'transparent',
                                            color: activeTab === tab ? COLORS.white : COLORS.gray,
                                            fontWeight: '600',
                                            borderRadius: '20px 20px 5px 5px',
                                            fontSize: 'clamp(12px, 2.5vw, 14px)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            flex: '0 0 auto'
                                        }}
                                    >
                                        {tab === 'metrics' ? 'Metrics' : 'Historical Trends'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date filter — trends tab only */}
                        {activeTab === 'trends' && <DateFilterRow />}

                        {/* Metrics tab */}
                        {activeTab === 'metrics' && (
                            <div style={{ marginTop: '20px' }}>
                                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
                                        <FeatherIcon icon="droplet" size={20} color="white" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 'bold', color: '#d19547' }}>
                                            {selectedNewOil.trivector} Parameters
                                        </h3>
                                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: COLORS.gray }}>
                                            {params.length} metrics
                                        </p>
                                    </div>
                                </div>
                                <Row>
                                    {params.map((p, i) => (
                                        <Col xs={12} sm={6} lg={4} key={i} style={{ marginBottom: '16px' }}>
                                            <MetricTile
                                                label={p.label}
                                                value={selectedNewOil[p.key]}
                                                unit={p.unit}
                                                paramKey={p.key}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        )}

                        {/* Trends tab */}
                        {activeTab === 'trends' && (
                            <div style={{ marginTop: '20px' }}>
                                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #6949a5 0%, #3F1D7D 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FeatherIcon icon="activity" size={20} color="white" />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 'bold', color: '#3F1D7D' }}>
                                            Historical Trends — {selectedNewOil.trivector}
                                        </h3>
                                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: COLORS.gray }}>
                                            Filtered: {filteredMatchData.length} of {matchData.length} records for batch
                                        </p>
                                    </div>
                                </div>
                                <OverviewChart params={params} />
                            </div>
                        )}
                    </div>
                )}

            </div>

            <EnlargedChartModal />

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    33%       { transform: translate(50px, -50px) rotate(120deg); }
                    66%       { transform: translate(-30px, 30px) rotate(240deg); }
                }
            `}</style>
        </div>
    );
}