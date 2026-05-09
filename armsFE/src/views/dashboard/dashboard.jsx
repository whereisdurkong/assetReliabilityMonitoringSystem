import { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Card, Table, Badge, ProgressBar } from "react-bootstrap";
import axios from 'axios';
import config from 'config';
import FeatherIcon from "feather-icons-react";
import Feather from "../ui-elements/icons/Feather";

export default function DataAnalytic() {
    const [totalReports, setTotalReports] = useState(0);
    const [completedReports, setCompletedReports] = useState(0);
    const [incompleteReports, setIncompleteReports] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [completedReportsList, setCompletedReportsList] = useState([]);
    const [assetMap, setAssetMap] = useState({});
    const [componentMap, setComponentMap] = useState({});
    const [statusStats, setStatusStats] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCriticality, setFilterCriticality] = useState('all');
    const [filterYear, setFilterYear] = useState('all');
    const [availableYears, setAvailableYears] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalAssetsOnReports, setTotalAssetsOnReports] = useState(0);
    const [uniqueAssetsCount, setUniqueAssetsCount] = useState(0);
    const [allReportsData, setAllReportsData] = useState([]);

    // Date filter states
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Refs for date inputs
    const fromDateInputRef = useRef(null);
    const toDateInputRef = useRef(null);

    const itemsPerPage = 8;

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
        const fetch = async () => {
            try {
                const resAsset = await axios.get(`${config.baseApi}/assets/get-all-assets`);
                const dataAsset = resAsset.data || [];
                const assetMapping = {};
                dataAsset.forEach(asset => {
                    assetMapping[asset.asset_id] = asset.asset_name;
                });
                setAssetMap(assetMapping);

                const resCompo = await axios.get(`${config.baseApi}/assets/get-all-components`);
                const dataCompo = resCompo.data || [];
                const componentMapping = {};
                dataCompo.forEach(component => {
                    componentMapping[component.asset_component_id] = component.asset_component_name;
                });
                setComponentMap(componentMapping);

                const res = await axios.get(`${config.baseApi}/assetsAnalysis/get-all-submitted-assets`);
                const data = res.data || [];
                setAllReportsData(data);

                // First, identify completed reports
                const allCompletedReports = data.filter(report =>
                    report.level1 === '1' &&
                    report.level2 === '1' &&
                    report.level3 === '1'
                );

                // Extract unique years from completed reports only
                const years = new Set();
                allCompletedReports.forEach(report => {
                    if (report.analysis_date) {
                        const year = new Date(report.analysis_date).getFullYear();
                        if (!isNaN(year)) {
                            years.add(year);
                        }
                    }
                });
                const sortedYears = Array.from(years).sort((a, b) => b - a);
                setAvailableYears(sortedYears);

                // Apply year filter to completed reports
                let filteredCompletedData = allCompletedReports;
                if (filterYear !== 'all') {
                    filteredCompletedData = allCompletedReports.filter(report => {
                        if (!report.analysis_date) return false;
                        const reportYear = new Date(report.analysis_date).getFullYear();
                        return reportYear === parseInt(filterYear);
                    });
                }

                // Get all reports (including incomplete) that match the year filter
                let allFilteredData = data;
                if (filterYear !== 'all') {
                    allFilteredData = data.filter(report => {
                        if (!report.analysis_date) return false;
                        const reportYear = new Date(report.analysis_date).getFullYear();
                        return reportYear === parseInt(filterYear);
                    });
                }

                const totalAllReports = allFilteredData.length;
                setTotalReports(totalAllReports);
                setTotalAssetsOnReports(totalAllReports);

                const completedCount = filteredCompletedData.length;
                setCompletedReports(completedCount);
                setIncompleteReports(totalAllReports - completedCount);

                const calculatedPercentage = totalAllReports > 0
                    ? (completedCount / totalAllReports) * 100
                    : 0;
                setPercentage(calculatedPercentage);

                const uniqueAssets = new Set(filteredCompletedData.map(report => report.asset_id));
                setUniqueAssetsCount(uniqueAssets.size);

                const statusMap = {};
                filteredCompletedData.forEach(report => {
                    const status = report.criticality_analysis_status || 'Unknown';
                    statusMap[status] = (statusMap[status] || 0) + 1;
                });

                const statusStatsData = {};
                Object.entries(statusMap).forEach(([status, count]) => {
                    statusStatsData[status] = {
                        count: count,
                        percentage: completedCount > 0 ? (count / completedCount) * 100 : 0
                    };
                });
                setStatusStats(statusStatsData);

                const completedWithNames = filteredCompletedData.map(report => ({
                    ...report,
                    asset_name: assetMapping[report.asset_id] || 'Unknown Asset',
                    asset_component_name: componentMapping[report.asset_component_id] || 'Unknown Component',
                }));
                setCompletedReportsList(completedWithNames);

            } catch (err) {
                console.log('Unable to fetch all data: ', err);
            }
        }
        fetch();
    }, [filterYear]);

    // Apply date filters to the completed reports list
    const filteredReports = completedReportsList.filter(report => {
        const matchesSearch = searchTerm === '' ||
            report.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.asset_component_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.asset_id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterCriticality === 'all' ||
            report.criticality_analysis_status === filterCriticality;

        // Apply date range filter
        let matchesDate = true;
        if (dateFrom || dateTo) {
            if (!report.analysis_date) {
                matchesDate = false;
            } else {
                const reportDate = new Date(report.analysis_date);
                reportDate.setHours(0, 0, 0, 0);

                if (dateFrom && dateTo) {
                    const fromDate = new Date(dateFrom);
                    const toDate = new Date(dateTo);
                    fromDate.setHours(0, 0, 0, 0);
                    toDate.setHours(23, 59, 59, 999);
                    matchesDate = reportDate >= fromDate && reportDate <= toDate;
                } else if (dateFrom) {
                    const fromDate = new Date(dateFrom);
                    fromDate.setHours(0, 0, 0, 0);
                    matchesDate = reportDate >= fromDate;
                } else if (dateTo) {
                    const toDate = new Date(dateTo);
                    toDate.setHours(23, 59, 59, 999);
                    matchesDate = reportDate <= toDate;
                }
            }
        }

        return matchesSearch && matchesFilter && matchesDate;
    });

    const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
    const paginatedReports = filteredReports.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Severe': 'rgb(221, 52, 69)',
            'Verify/Abnormal': 'rgb(236, 138, 47)',
            'Good/Ok': 'rgb(40, 167, 70)',
            'Unknown': '#6c757d'
        };

        const bgColor = statusConfig[status] || statusConfig['Unknown'];

        return (
            <div style={{
                background: bgColor,
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '6px',
                fontWeight: 500,
                fontSize: '0.75rem',
                display: 'inline-block'
            }}>
                {status}
            </div>
        );
    };

    return (
        <div style={{
            background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
            minHeight: '100vh',
            padding: '50px 24px',
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

            <Container fluid style={{ position: 'relative', zIndex: 2, maxWidth: '2000px', margin: '0 auto', }}>

                {/* Compact Header */}
                <Row className="mb-4">
                    <Col>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px',
                            flexWrap: 'wrap',
                            gap: '12px'
                        }}>
                            <div>
                                <h1 style={{
                                    fontSize: '2.8rem', fontWeight: '700', color: '#EAB56F',
                                    marginBottom: '8px', letterSpacing: '-0.5px'
                                }}>
                                    Analytics Dashboard
                                </h1>
                                <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                                    Report completion and criticality overview
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                {availableYears.length > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={{ color: 'rgba(255, 187, 0, 0.7)', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>

                                            Year:</label>
                                        <select
                                            value={filterYear}
                                            onChange={(e) => {
                                                setFilterYear(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            style={{
                                                background: 'rgba(0,0,0,0.3)',
                                                border: '2px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '6px',
                                                padding: '8px 99px 8px 12px',
                                                color: '#ffffff',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                outline: 'none',
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                        >
                                            <option value="all">All Years</option>
                                            {availableYears.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div style={{ paddingTop: '20px' }}>
                                    <div style={{
                                        background: 'rgba(255, 136, 0, 0.22)',
                                        padding: '8px 10px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        color: 'rgba(255, 210, 168, 0.7)'
                                    }}>
                                        Last updated: {new Date().toLocaleString()}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </Col>
                </Row>

                {/* KPI Cards */}
                <Row className="g-3 mb-4">
                    <Col lg={4} md={6}>
                        <div style={{
                            background: 'rgba(255, 166, 0, 0.14)',
                            border: '2px solid rgb(255, 152, 68)',
                            borderRadius: '12px',
                            padding: '20px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ color: 'rgb(255, 166, 0)', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '800' }}>
                                        Total Reports
                                    </div>
                                    <div style={{ color: 'rgb(255, 166, 0)', fontSize: '32px', fontWeight: 700 }}>
                                        {totalReports.toLocaleString()}
                                    </div>
                                    {filterYear !== 'all' && (
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '4px' }}>
                                            Year: {filterYear}
                                        </div>
                                    )}
                                </div>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '8px',
                                    background: 'rgba(205, 146, 78, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FeatherIcon icon="file-text" size={23} color={'#ffa600'} />
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col lg={4} md={6}>
                        <div style={{
                            background: 'rgba(0, 132, 255, 0.13)',
                            border: '2px solid rgb(80, 141, 255)',
                            borderRadius: '12px',
                            padding: '20px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ color: 'rgb(77, 174, 253)', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '800' }}>
                                        Total Assets (Taken appropriate)
                                    </div>
                                    <div style={{ color: 'rgb(77, 174, 253)', fontSize: '32px', fontWeight: 700 }}>
                                        {uniqueAssetsCount}
                                    </div>
                                </div>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '8px',
                                    background: 'rgba(76, 144, 223, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FeatherIcon icon="box" size={23} color={'#4485ff'} />
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col lg={4} md={6}>
                        <div style={{
                            background: 'rgba(30, 255, 0, 0.28)',
                            border: '2px solid rgb(59, 184, 48)',
                            borderRadius: '12px',
                            padding: '20px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ color: 'rgb(127, 255, 101)', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '800' }}>
                                        Completed Oil Analysis
                                    </div>
                                    <div style={{ color: 'rgb(127, 255, 101)', fontSize: '32px', fontWeight: 700 }}>
                                        {completedReports.toLocaleString()}
                                    </div>
                                </div>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '8px',
                                    background: 'rgba(106, 255, 118, 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FeatherIcon icon="check" size={23} color={'#66ff58'} />
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Progress Section */}
                <Row className="g-3 mb-4">
                    <Col lg={12}>
                        <div style={{
                            background: 'rgb(221, 221, 221)',
                            border: '2px solid rgb(255, 123, 0)',
                            borderRadius: '12px',
                            padding: '20px'
                        }}>
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ color: '#383838', fontSize: '15px', fontWeight: 500, marginBottom: '4px', fontWeight: '800' }}>
                                    Overall Completion Progress
                                </div>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ color: 'rgb(61, 61, 61)', fontSize: '13px' }}>Progress</span>
                                    <span style={{ color: '#ff7b00', fontWeight: 600, fontSize: '13px' }}>{percentage.toFixed(1)}%</span>
                                </div>
                                <div style={{
                                    height: '6px',
                                    background: 'rgb(182, 182, 182)',
                                    borderRadius: '3px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${percentage}% `,
                                        height: '100%',
                                        background: '#ff9100',
                                        borderRadius: '3px'
                                    }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: '#188b27' }} />
                                    <span style={{ color: 'rgb(51, 51, 51)', fontSize: '12px' }}>
                                        Completed: <strong style={{ color: '#353535' }}>{completedReports}</strong>
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: 'rgb(255, 1, 1)' }} />
                                    <span style={{ color: 'rgb(49, 49, 49)', fontSize: '12px' }}>
                                        Remaining: <strong style={{ color: '#353535' }}>{incompleteReports}</strong>
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '4px', background: 'rgb(255, 123, 0)' }} />
                                    <span style={{ color: 'rgb(49, 49, 49)', fontSize: '12px' }}>
                                        Total Reports: <strong style={{ color: '#353535' }}>{totalReports}</strong>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Criticality Distribution */}
                {Object.keys(statusStats).length > 0 && (
                    <Row className="g-3 mb-4">
                        <Col>
                            <div style={{
                                background: '#1e293b',
                                border: '2px solid #3b82f6',
                                borderRadius: '12px',
                                padding: '20px'
                            }}>
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ color: '#3b82f6', fontSize: '14px', fontWeight: 500 }}>
                                        Criticality Distribution
                                    </div>
                                    <div style={{ color: 'rgb(255, 255, 255)', fontSize: '12px' }}>
                                        Breakdown of completed reports by criticality level
                                        {filterYear !== 'all' && ` (from ${filterYear})`}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                    {Object.entries(statusStats).map(([status, data]) => {
                                        const colors = {
                                            'Severe': '#dc3545',
                                            'Verify/Abnormal': '#fd7e14',
                                            'Good/Ok': '#28a745',
                                            'Unknown': '#6c757d'
                                        };
                                        const color = colors[status] || '#6c757d';

                                        const fcolors = {
                                            'Severe': '#ff4d5f',
                                            'Verify/Abnormal': '#ff943d',
                                            'Good/Ok': '#219c3e',
                                            'Unknown': '#6c757d'
                                        };
                                        const fcolor = fcolors[status] || '#6c757d';
                                        return (
                                            <div key={status} style={{ flex: 1, minWidth: '120px' }}>
                                                <div style={{ marginBottom: '8px' }}>
                                                    {getStatusBadge(status)}
                                                </div>
                                                <div style={{ fontSize: '25px', fontWeight: 1000, color: fcolor, marginBottom: '4px' }}>
                                                    {data.count}
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                                                    {data.percentage.toFixed(1)}% of total
                                                </div>
                                                <div style={{
                                                    height: '4px',
                                                    background: 'rgba(255,255,255,0.1)',
                                                    borderRadius: '2px',
                                                    overflow: 'hidden'
                                                }}>
                                                    <div style={{
                                                        width: `${data.percentage}% `,
                                                        height: '100%',
                                                        background: color,
                                                        borderRadius: '2px'
                                                    }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Col>
                    </Row>
                )}

                {/* Table Section */}
                <Row>
                    <Col>
                        <div style={{
                            background: '#FFF',
                            border: '2px solid rgb(255, 102, 0)',
                            borderRadius: '12px',
                            overflow: 'hidden'
                        }}>
                            {/* Table Header with Controls */}
                            <div style={{
                                background: '#1E293B',
                                padding: '16px 20px',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',  /* Changed from 'center' to 'flex-start' */
                                flexWrap: 'wrap',
                                gap: '16px'  /* Added gap for better spacing when wrapped */
                            }}>
                                {/* Left side - Title and count */}
                                <div style={{ flex: '1 1 auto', minWidth: '150px' }}>
                                    <div style={{ color: '#ff7b00', fontSize: '14px', fontWeight: 800 }}>
                                        Completed Reports
                                    </div>
                                    <div style={{ color: 'rgb(255, 255, 255)', fontSize: '12px' }}>
                                        {filteredReports.length} fully completed analyses
                                        {filterYear !== 'all' && ` in ${filterYear}`}
                                    </div>
                                </div>

                                {/* Filters Container */}
                                <div style={{
                                    display: 'flex',
                                    gap: '12px',  /* Slightly reduced gap for better fit */
                                    flexWrap: 'wrap',
                                    alignItems: 'flex-end',
                                    flex: '3 1 500px'  /* Allow filters to take more space and wrap */
                                }}>
                                    {/* Criticality Filter */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 130px', minWidth: '120px' }}>
                                        <label style={{ color: 'rgba(255, 187, 0, 0.7)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Criticality
                                        </label>
                                        <select
                                            value={filterCriticality}
                                            onChange={(e) => {
                                                setFilterCriticality(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            style={{
                                                background: 'rgba(0,0,0,0.3)',
                                                border: '2px solid rgba(255,255,255,0.1)',
                                                borderRadius: '6px',
                                                padding: '6px 12px',
                                                color: '#ffffff',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                outline: 'none',
                                                width: '100%'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                        >
                                            <option value="all">All Criticality</option>
                                            <option value="Good/Ok">Good/Ok</option>
                                            <option value="Verify/Abnormal">Verify/Abnormal</option>
                                        </select>
                                    </div>

                                    {/* Date Range Filter - From */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 140px', minWidth: '130px' }}>
                                        <label style={{ color: 'rgba(255, 187, 0, 0.7)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            From Date
                                        </label>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                background: 'rgba(0,0,0,0.3)',
                                                borderRadius: '6px',
                                                padding: '4px 12px',
                                                gap: '8px',
                                                border: '2px solid rgba(255,255,255,0.1)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                width: '100%'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
                                            onClick={() => openDatePicker(fromDateInputRef)}
                                        >
                                            <FeatherIcon icon="calendar" size={14} color="#ff7b00" />
                                            <input
                                                ref={fromDateInputRef}
                                                type="date"
                                                value={dateFrom}
                                                onChange={(e) => {
                                                    setDateFrom(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#ffffff',
                                                    fontSize: '12px',
                                                    outline: 'none',
                                                    cursor: 'pointer',
                                                    width: '100%',
                                                    minWidth: '0'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Date Range Filter - To */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 140px', minWidth: '130px' }}>
                                        <label style={{ color: 'rgba(255, 187, 0, 0.7)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            To Date
                                        </label>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                background: 'rgba(0,0,0,0.3)',
                                                borderRadius: '6px',
                                                padding: '4px 12px',
                                                gap: '8px',
                                                border: '2px solid rgba(255,255,255,0.1)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                width: '100%'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
                                            onClick={() => openDatePicker(toDateInputRef)}
                                        >
                                            <FeatherIcon icon="calendar" size={14} color="#ff7b00" />
                                            <input
                                                ref={toDateInputRef}
                                                type="date"
                                                value={dateTo}
                                                onChange={(e) => {
                                                    setDateTo(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#ffffff',
                                                    fontSize: '12px',
                                                    outline: 'none',
                                                    cursor: 'pointer',
                                                    width: '100%',
                                                    minWidth: '0'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Clear Dates Button */}
                                    {(dateFrom || dateTo) && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '0 0 auto' }}>
                                            <label style={{ color: 'transparent', fontSize: '10px' }}>_</label>
                                            <button
                                                onClick={clearDateFilters}
                                                style={{
                                                    background: 'rgba(233, 181, 111, 0.2)',
                                                    border: '1px solid rgba(233, 181, 111, 0.3)',
                                                    borderRadius: '6px',
                                                    padding: '6px 12px',
                                                    color: '#EAB56F',
                                                    fontSize: '11px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    whiteSpace: 'nowrap'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(233, 181, 111, 0.3)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(233, 181, 111, 0.2)'}
                                            >
                                                <FeatherIcon icon="x" size={12} /> Clear Dates
                                            </button>
                                        </div>
                                    )}

                                    {/* Search Input */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: '2 1 180px', minWidth: '160px' }}>
                                        <label style={{ color: 'rgba(255, 187, 0, 0.7)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Search
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Search by asset, component, ID..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            style={{
                                                background: 'rgba(0,0,0,0.3)',
                                                border: '2px solid rgba(255,255,255,0.1)',
                                                borderRadius: '6px',
                                                padding: '6px 12px',
                                                color: '#ffffff',
                                                fontSize: '12px',
                                                width: '100%',
                                                outline: 'none'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Table */}
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    color: '#3d3d3d'
                                }}>
                                    <thead>
                                        <tr style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                            background: '#1E293B'
                                        }}>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: 'rgb(255, 255, 255)', textTransform: 'uppercase' }}>#</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: 'rgb(255, 255, 255)', textTransform: 'uppercase' }}>Asset ID</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: 'rgb(255, 255, 255)', textTransform: 'uppercase' }}>Asset / Component</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: 'rgb(255, 255, 255)', textTransform: 'uppercase' }}>Criticality</th>
                                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: 'rgb(255, 255, 255)', textTransform: 'uppercase' }}>Analysis Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedReports.length > 0 ? (
                                            paginatedReports.map((report, index) => (
                                                <tr key={index} style={{
                                                    borderBottom: '1px solid rgba(58, 58, 58, 0.12)',
                                                    transition: 'background 0.2s'
                                                }}>
                                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'rgb(41, 41, 41)' }}>
                                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                                    </td>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <code style={{
                                                            background: 'rgba(0,0,0,0.3)',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '14px',
                                                            fontFamily: 'monospace',
                                                            color: '#3a3986'
                                                        }}>
                                                            {report.asset_id}
                                                        </code>
                                                    </td>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <div>
                                                            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                                                                {report.asset_name}
                                                            </div>
                                                            <div style={{ fontSize: '11px', color: 'rgb(0, 27, 102)' }}>
                                                                {report.asset_component_name}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px 16px' }}>
                                                        {getStatusBadge(report.criticality_analysis_status || 'Unknown')}
                                                    </td>
                                                    <td style={{ padding: '12px 16px', fontSize: '12px', color: 'rgb(44, 44, 44)' }}>
                                                        {report.analysis_date ? new Date(report.analysis_date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        }) : 'N/A'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" style={{ padding: '60px 20px', textAlign: 'center', color: 'rgba(0,0,0,0.4)' }}>
                                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px' }}>
                                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                                        <line x1="9" y1="9" x2="15" y2="15" />
                                                        <line x1="15" y1="9" x2="9" y2="15" />
                                                    </svg>
                                                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>No results found</div>
                                                    <div style={{ fontSize: '12px' }}>Try adjusting your search or filter</div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{
                                    padding: '12px 20px',
                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '12px',
                                    background: 'rgba(0,0,0,0.2)'
                                }}>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredReports.length)} of {filteredReports.length}
                                    </div>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                background: 'rgba(0,0,0,0.3)',
                                                color: '#ffffff',
                                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                                opacity: currentPage === 1 ? 0.5 : 1,
                                                fontSize: '12px'
                                            }}
                                        >
                                            Previous
                                        </button>
                                        <span style={{
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            background: 'rgba(78, 205, 196, 0.2)',
                                            color: '#4ecdc4',
                                            fontSize: '12px',
                                            fontWeight: 500
                                        }}>
                                            {currentPage} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                background: 'rgba(0,0,0,0.3)',
                                                color: '#ffffff',
                                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                                opacity: currentPage === totalPages ? 0.5 : 1,
                                                fontSize: '12px'
                                            }}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>

            <style>
                {`
                    @keyframes float {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(50px, -50px) rotate(120deg); }
                        66% { transform: translate(-30px, 30px) rotate(240deg); }
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
    )
}