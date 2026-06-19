import { useEffect, useState, useRef } from "react";
import axios from 'axios';
import config from 'config';
import FeatherIcon from 'feather-icons-react';
import { useNavigate } from 'react-router';

export default function AllSubmitAssets() {
    const [submittedReport, setSubmittedReport] = useState([]);
    const [allAssets, setAllAssets] = useState([]);
    const [allComponents, setAllComponents] = useState([]);
    const [filteredAssets, setFilteredAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('newest');
    const [searchTerm, setSearchTerm] = useState('');
    const [reportFilter, setReportFilter] = useState('pending');
    const [usersMap, setUsersMap] = useState({});
    // Date filter states
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Refs for date inputs
    const fromDateInputRef = useRef(null);
    const toDateInputRef = useRef(null);

    // Stats states
    const [totalAssets, setTotalAssets] = useState(0);
    const [totalCategories, setTotalCategories] = useState(0);
    const [totalLocations, setTotalLocations] = useState(0);

    // Pagination states - Asset Reports
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);

    // Tab state
    const [activeTab, setActiveTab] = useState('asset'); // 'asset' | 'oil'

    // New Oil Reports states
    const [allOilReports, setAllOilReports] = useState([]);
    const [filteredOilReports, setFilteredOilReports] = useState([]);
    const [oilCurrentPage, setOilCurrentPage] = useState(1);

    const [position, setPosition] = useState('');

    const navigate = useNavigate();
    const empInfo = JSON.parse(localStorage.getItem("user"));
    const [oilReportFilter, setOilReportFilter] = useState('pending');
    // ─── Helpers ───────────────────────────────────────────────────────────────

    const getAssetName = (assetId) => {
        if (!assetId) return '-';
        const asset = allAssets.find(a => a.asset_id === assetId);
        return asset ? asset.asset_name : '-';
    };

    const getAssetLocation = (assetId) => {
        if (!assetId) return '-';
        const asset = allAssets.find(a => a.asset_id === assetId);
        return asset ? asset.asset_location : '-';
    };

    const getAssetCategories = (assetId) => {
        if (!assetId) return '-';
        const asset = allAssets.find(a => a.asset_id === assetId);
        return asset ? asset.asset_category : '-';
    };

    const getComponentName = (componentId) => {
        if (!componentId) return '-';
        const component = allComponents.find(c => c.asset_component_id === componentId);
        return component ? component.asset_component_name : '-';
    };

    const getComponentType = (componentId) => {
        if (!componentId) return '-';
        const component = allComponents.find(c => c.asset_component_id === componentId);
        return component ? component.asset_component_type || '-' : '-';
    };

    const getCombinedComponent = (componentId) => {
        const componentName = getComponentName(componentId);
        const componentType = getComponentType(componentId);
        if (componentName === '-' && componentType === '-') return '-';
        if (componentName === '-') return componentType;
        if (componentType === '-') return componentName;
        return `${componentName} (${componentType})`;
    };

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

    // ─── Position label ─────────────────────────────────────────────────────────

    useEffect(() => {
        if (empInfo.emp_position === 'l1') setPosition('Level 1');
        else if (empInfo.emp_position === 'l2') setPosition('Level 2');
        else if (empInfo.emp_position === 'l3') setPosition('Level 3');
    }, []);

    // ─── Fetch New Oil Reports ───────────────────────────────────────────────────

    useEffect(() => {
        const fetchOilReports = async () => {
            try {
                const res = await axios.get(`${config.baseApi}/assetsAnalysis/get-all-submitted-no-assets`);
                const resdata = res.data || [];
                const data = resdata.filter(
                    e => e.is_active === 1 || e.is_active === true || e.is_active === '1'
                );
                setAllOilReports(data);
            } catch (err) {
                console.log('Unable to fetch submitted reports no assets: ', err);
            }
        };
        fetchOilReports();
    }, []);

    // ─── Fetch Asset Reports ─────────────────────────────────────────────────────

    useEffect(() => {
        const fetchSubmittedAssets = async () => {
            try {
                let assetsID = [];
                setLoading(true);
                const res = await axios.get(`${config.baseApi}/assetsAnalysis/get-all-submitted-assets`);
                const oilreportdata = res.data || [];
                console.log('Fetched asset reports:', oilreportdata);
                let reports = [];
                if (
                    empInfo.emp_position === 'l1' ||
                    empInfo.emp_position === 'l2' ||
                    empInfo.emp_position === 'l3'
                ) {
                    reports = oilreportdata.filter(
                        e => e.level1 == 1 || e.level1 == true || e.level1 == "1"
                    );
                    setSubmittedReport(reports);
                    setFilteredAssets(reports);
                    assetsID = reports;
                }

                const asset_ids = assetsID.map(r => r.asset_id).filter(Boolean);
                const resgetallasset = await axios.get(`${config.baseApi}/assets/get-all-assets`);
                const allassetsdata = resgetallasset.data || [];
                const matchedAssets = allassetsdata.filter(a => asset_ids.includes(a.asset_id));
                setAllAssets(matchedAssets);

                const uniqueAssets = new Set();
                const uniqueCategories = new Set();
                const uniqueLocations = new Set();
                matchedAssets.forEach(asset => {
                    if (asset.asset_id) uniqueAssets.add(asset.asset_id);
                    if (asset.asset_category) uniqueCategories.add(asset.asset_category);
                    if (asset.asset_location) uniqueLocations.add(asset.asset_location);
                });
                setTotalAssets(uniqueAssets.size);
                setTotalCategories(uniqueCategories.size);
                setTotalLocations(uniqueLocations.size);

                const resgetallassetcomponent = await axios.get(`${config.baseApi}/assets/get-all-components`);
                setAllComponents(resgetallassetcomponent.data || []);


                const resUsers = await axios.get(`${config.baseApi}/authentication/get-all-users`);
                const usersData = resUsers.data || [];
                const avatarMap = {};
                usersData.forEach(user => {
                    if (user.user_name) avatarMap[user.user_name] = user.avatar || null;
                });
                setUsersMap(avatarMap);

            } catch (err) {
                console.log('Unable to fetch queue all-submitted-assets', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmittedAssets();
    }, [empInfo.emp_position]);


    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get(`${config.baseApi}/authentication/get-all-users`);
                const data = res.data || [];


            } catch (err) {
                console.log('Unable to fetch queue allusers', err);
            }
        }
        fetch();
    }, [])



    // ─── Filter: Asset Reports ───────────────────────────────────────────────────

    useEffect(() => {
        if (!submittedReport.length) return;

        let filtered = [...submittedReport];

        console.log(submittedReport);

        if (reportFilter === 'pending') {
            if (empInfo.emp_position === 'l2') {
                filtered = filtered.filter(r => {
                    const level1Approved = r.level1 == 1 || r.level1 == true || r.level1 == "1";
                    const level2NotApproved = !r.level2 || r.level2 === '' || r.level2 === null || r.level2 === '0' || r.level2 === 0 || r.level2 === false;

                    const missingResolutionData =
                        (r.level3 === '1') &&
                        (!r.results || r.results === '' || r.results === null || r.results === '0' || r.results === 0) &&
                        (!r.actions || r.actions === '' || r.actions === null || r.actions === '0' || r.actions === 0) &&
                        (!r.asset_before || r.asset_before === '' || r.asset_before === null || r.asset_before === '0' || r.asset_before === 0) &&
                        (!r.asset_after || r.asset_after === '' || r.asset_after === null || r.asset_after === '0' || r.asset_after === 0);

                    return level1Approved && (level2NotApproved || missingResolutionData);
                });
            } else if (empInfo.emp_position === 'l3') {
                filtered = filtered.filter(r =>
                    (r.level1 == 1 || r.level1 == true || r.level1 == "1") &&
                    (r.level2 == 1 || r.level2 == true || r.level2 == "1") &&
                    (!r.level3 || r.level3 === '' || r.level3 === null || r.level3 === '0' || r.level3 === 0 || r.level3 === false)
                );
            }
        }

        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(a => a.created_at && new Date(a.created_at) >= fromDate);
        }
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(a => a.created_at && new Date(a.created_at) <= toDate);
        }

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

        filtered.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        setFilteredAssets(filtered);
        setCurrentPage(1);
    }, [submittedReport, reportFilter, sortOrder, searchTerm, allAssets, allComponents, empInfo.emp_position, dateFrom, dateTo]);

    // ─── Filter: New Oil Reports ─────────────────────────────────────────────────

    useEffect(() => {
        let filtered = [...allOilReports];

        // Only apply pending filter for L1 and L2
        if (oilReportFilter === 'pending') {
            if (empInfo.emp_position === 'l1') {
                // For L1: Show reports where level1 = '1' and level2 is not approved (0, null, or empty)
                filtered = filtered.filter(r =>
                    (r.level1 == 1 || r.level1 == true || r.level1 == "1") &&
                    (r.level2 == 0 || r.level2 === '0' || r.level2 === false || r.level2 === null || r.level2 === '')
                );
            }
            else if (empInfo.emp_position === 'l2') {
                filtered = filtered.filter(r => {
                    const isApprovedByBoth =
                        (r.level1 == 1 || r.level1 == true || r.level1 == "1") &&
                        (r.level2 == 1 || r.level2 == true || r.level2 == "1");

                    const missingResolution = !r.resolution || r.resolution.trim() === '';
                    const missingOilBefore = !r.oil_before || r.oil_before === '' || r.oil_before === null || r.oil_before === '0' || r.oil_before === 0;
                    const missingOilAfter = !r.oil_after || r.oil_after === '' || r.oil_after === null || r.oil_after === '0' || r.oil_after === 0;

                    // Only show if level1+level2 approved AND (resolution OR oil data is still missing)
                    return isApprovedByBoth && (missingResolution || missingOilBefore || missingOilAfter);
                });
            }
            // For L3: No filter applied, shows all reports even when 'pending' is selected
        }

        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(r => r.created_at && new Date(r.created_at) >= fromDate);
        }
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(r => r.created_at && new Date(r.created_at) <= toDate);
        }

        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(r =>
                (r.asset_analysis_id && r.asset_analysis_id.toString().includes(term)) ||
                (r.asset_id && r.asset_id.toString().includes(term)) ||
                (r.created_by && r.created_by.toLowerCase().includes(term)) ||
                (r.oil_analysis_results && r.oil_analysis_results.toLowerCase().includes(term)) ||
                (r.recommendations && r.recommendations.toLowerCase().includes(term)) ||
                (r.additional_notes && r.additional_notes.toLowerCase().includes(term)) ||
                (r.oil_batch_code && r.oil_batch_code.toLowerCase().includes(term)) ||
                (r.input_drum_number && r.input_drum_number.toLowerCase().includes(term))
            );
        }

        filtered.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        setFilteredOilReports(filtered);
        setOilCurrentPage(1);
    }, [allOilReports, oilReportFilter, searchTerm, dateFrom, dateTo, sortOrder, empInfo.emp_position]);

    // ─── Count helpers ───────────────────────────────────────────────────────────

    const getAllReportsCount = () => submittedReport.length;

    const getPendingReportsCount = () => {
        if (empInfo.emp_position === 'l2') {
            return submittedReport.filter(r => {
                const level1Approved = r.level1 == 1 || r.level1 == true || r.level1 == "1";
                const level2NotApproved = !r.level2 || r.level2 === '' || r.level2 === null || r.level2 === '0' || r.level2 === 0 || r.level2 === false;

                const missingResolutionData =
                    (r.level3 === '1') &&
                    (!r.results || r.results === '' || r.results === null || r.results === '0' || r.results === 0) &&
                    (!r.actions || r.actions === '' || r.actions === null || r.actions === '0' || r.actions === 0) &&
                    (!r.asset_before || r.asset_before === '' || r.asset_before === null || r.asset_before === '0' || r.asset_before === 0) &&
                    (!r.asset_after || r.asset_after === '' || r.asset_after === null || r.asset_after === '0' || r.asset_after === 0);

                return level1Approved && (level2NotApproved || missingResolutionData);
            }



            ).length;
        } else if (empInfo.emp_position === 'l3') {
            return submittedReport.filter(r =>
                (r.level2 == 1 || r.level2 == true || r.level2 == "1") &&
                (!r.level3 || r.level3 === '' || r.level3 === null || r.level3 === '0' || r.level3 === 0 || r.level3 === false)
            ).length;
        }
        return 0;
    };

    const getAllOilReportsCount = () => allOilReports.length;

    const getPendingOilReportsCount = () => {
        if (empInfo.emp_position === 'l1') {
            // For L1: Count reports where level1 = '1' and level2 is not approved (0, null, or empty)
            return allOilReports.filter(r =>
                (r.level1 == 1 || r.level1 == true || r.level1 == "1") &&
                (r.level2 == 0 || r.level2 === '0' || r.level2 === false || r.level2 === null || r.level2 === '')
            ).length;
        } else if (empInfo.emp_position === 'l2') {
            return allOilReports.filter(r => {
                const isApprovedByBoth =
                    (r.level1 == 1 || r.level1 == true || r.level1 == "1") &&
                    (r.level2 == 1 || r.level2 == true || r.level2 == "1");

                const missingResolution = !r.resolution || r.resolution.trim() === '';
                const missingOilBefore = !r.oil_before || r.oil_before === '' || r.oil_before === null || r.oil_before === '0' || r.oil_before === 0;
                const missingOilAfter = !r.oil_after || r.oil_after === '' || r.oil_after === null || r.oil_after === '0' || r.oil_after === 0;

                return isApprovedByBoth && (missingResolution || missingOilBefore || missingOilAfter);
            }).length;

        } else if (empInfo.emp_position === 'l3') {
            // For L3: Return 0 since there's no pending filter
            return 0;
        }
        return 0;
    };

    // ─── Asset pagination ────────────────────────────────────────────────────────

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAssets.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
    const paginate = (n) => setCurrentPage(n);
    const nextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages));
    const prevPage = () => setCurrentPage(p => Math.max(p - 1, 1));

    // ─── Oil pagination ──────────────────────────────────────────────────────────

    const oilIndexOfLastItem = oilCurrentPage * itemsPerPage;
    const oilIndexOfFirstItem = oilIndexOfLastItem - itemsPerPage;
    const oilCurrentItems = filteredOilReports.slice(oilIndexOfFirstItem, oilIndexOfLastItem);
    const oilTotalPages = Math.ceil(filteredOilReports.length / itemsPerPage);
    const oilNextPage = () => setOilCurrentPage(p => Math.min(p + 1, oilTotalPages));
    const oilPrevPage = () => setOilCurrentPage(p => Math.max(p - 1, 1));

    // ─── Navigation ─────────────────────────────────────────────────────────────

    const handleSubmitAsset = () => navigate('/add-A-R');
    const handleSubmitAssetNewOil = () => navigate('/submit-new-oil-analysis');
    const toggleSortOrder = () => setSortOrder(p => p === 'newest' ? 'oldest' : 'newest');
    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const clearSearch = () => setSearchTerm('');
    const handleView = (asset) => {
        const params = new URLSearchParams({ id: asset.asset_analysis_id });
        navigate(`/view-submitted-asset?id=${asset.asset_analysis_id}`);
    };
    const handleViewOilReport = (report) => {
        const params = new URLSearchParams({ id: report.analysis_id });
        navigate(`/view-submitted-asset-no-asset?${params.toString()}`);
    };

    // ─── Shared table header style ───────────────────────────────────────────────

    const thStyle = (align = 'left') => ({
        padding: '14px 20px',
        textAlign: align,
        color: '#fff',
        fontWeight: '600',
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap'
    });

    // ─── Pagination renderer (reusable) ──────────────────────────────────────────

    const renderPagination = ({ current, total, onPrev, onNext, onPage, firstIdx, lastIdx, totalCount, accentColor = '#EAB56F' }) => (
        <div style={{ padding: '16px 24px', borderTop: '1px solid #F0F2F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '0.75rem', color: '#6C7A8A' }}>
                Showing {firstIdx + 1} to {Math.min(lastIdx, totalCount)} of {totalCount} entries
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
                <button
                    onClick={onPrev}
                    disabled={current === 1}
                    style={{ background: current === 1 ? '#F8F9FC' : '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', color: current === 1 ? '#B0B8C4' : '#3A4B5E', cursor: current === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    <FeatherIcon icon="chevron-left" size={12} /> Prev
                </button>
                {Array.from({ length: Math.min(5, total) }, (_, i) => {
                    let p = total <= 5 ? i + 1 : current <= 3 ? i + 1 : current >= total - 2 ? total - 4 + i : current - 2 + i;
                    if (p > total || p < 1) return null;
                    return (
                        <button
                            key={p}
                            onClick={() => onPage(p)}
                            style={{ background: current === p ? accentColor : '#FFF', border: `1px solid ${current === p ? accentColor : '#E2E8F0'}`, borderRadius: '8px', padding: '6px 12px', minWidth: '36px', color: current === p ? '#FFF' : '#3A4B5E', fontWeight: current === p ? '600' : '400', cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                            {p}
                        </button>
                    );
                })}
                <button
                    onClick={onNext}
                    disabled={current === total}
                    style={{ background: current === total ? '#F8F9FC' : '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', color: current === total ? '#B0B8C4' : '#3A4B5E', cursor: current === total ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    Next <FeatherIcon icon="chevron-right" size={12} />
                </button>
            </div>
        </div>
    );

    // ─── Loading ─────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div style={{ background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', color: '#EAB56F' }}>
                    <div style={{ width: '50px', height: '50px', border: '3px solid rgba(234, 181, 111, 0.3)', borderTop: '3px solid #EAB56F', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
                    <p>Loading submitted assets...</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Add this after your existing helper functions
    const calculateReportStatus = (report) => {
        // Check if all required fields are present and not empty
        const level1Valid = report.level1 === '1';
        const level2Valid = report.level2 === '1';
        const level3Valid = report.level3 === '1';

        const resultsValid = report.results &&
            report.results !== null &&
            String(report.results).trim() !== '';

        const actionsValid = report.actions &&
            report.actions !== null &&
            String(report.actions).trim() !== '';

        const assetBeforeValid = report.asset_before &&
            report.asset_before !== null &&
            String(report.asset_before).trim() !== '';

        const assetAfterValid = report.asset_after &&
            report.asset_after !== null &&
            String(report.asset_after).trim() !== '';

        // Return "Done" only if ALL conditions are met
        if (level1Valid && level2Valid && level3Valid &&
            resultsValid && actionsValid &&
            assetBeforeValid && assetAfterValid) {
            return "Done";
        }

        return "On-going";
    };

    const calculateReportStatus1 = (report) => {
        const level1Valid = report.level1 === '1';
        const level2Valid = report.level2 === '1';
        const resultsValid = report.resolution && String(report.resolution).trim() !== '';
        const actionsValid = report.actions && String(report.actions).trim() !== '';
        const oilBeforeValid = report.oil_before && String(report.oil_before).trim() !== '';
        const oilAfterValid = report.oil_after && String(report.oil_after).trim() !== '';
        if (level1Valid && level2Valid && resultsValid && actionsValid && oilBeforeValid && oilAfterValid) return "Done";
        return "On-going";
    };

    // ─── Render ──────────────────────────────────────────────────────────────────

    return (
        <div style={{ background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)', minHeight: '100vh', padding: '40px', position: 'relative', overflow: 'hidden', paddingTop: '50px' }}>

            {/* Background blobs */}
            {[
                { w: 600, h: 600, t: -200, r: -200, dur: 25 },
                { w: 400, h: 400, b: -150, l: -150, dur: 20, rev: true },
                { w: 300, h: 300, t: '50%', l: '20%', dur: 18, op: 0.03 }
            ].map((b, i) => (
                <div key={i} style={{ position: 'absolute', width: b.w, height: b.h, borderRadius: '50%', background: `rgba(255,255,255,${b.op || 0.05})`, top: b.t, right: b.r, bottom: b.b, left: b.l, animation: `float ${b.dur}s infinite ease-in-out${b.rev ? ' reverse' : ''}`, zIndex: 1 }} />
            ))}

            <div style={{ position: 'relative', zIndex: 2, maxWidth: '2000px', margin: '0 auto' }}>

                {/* ── Header ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'nowrap', gap: '20px' }}>
                    <div style={{ minWidth: 0 }}>
                        <h1 style={{ marginBottom: '8px', fontSize: 'clamp(1.4rem, 2.5vw, 2.8rem)', fontWeight: '700', color: '#EAB56F', letterSpacing: '-0.5px', textShadow: '0 4px 20px rgba(234,181,111,0.2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            All Asset Analysis Report
                            <span style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2.8rem)', fontWeight: '700', color: '#ff9100', paddingLeft: '10px', textShadow: '0 4px 20px rgba(255,145,0,0.55)' }}>{position}</span>
                        </h1>
                        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>View and manage all submitted asset analyses</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', flexShrink: 0, gap: '16px', alignItems: 'center' }}>
                        {/* Submit New Oil Report Button - Premium Purple/Magenta */}
                        <button
                            onClick={handleSubmitAssetNewOil}
                            style={{
                                background: 'linear-gradient(120deg, #ffa600 0%, #c77b25 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '14px 28px',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                letterSpacing: '0.3px',
                                color: '#fff',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 4px 15px rgba(255, 238, 0, 0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 174, 0, 0.5)';
                                e.currentTarget.style.background = 'linear-gradient(120deg, #ffc400 0%, #ff8800 100%)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 238, 0, 0.25)';
                                e.currentTarget.style.background = 'linear-gradient(120deg, #ffa600 0%, #c77b25 100%)';
                            }}
                        >
                            <span style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>+</span>
                            Submit New Oil Report
                        </button>

                        {/* Submit Report Button - Modern Teal */}
                        <button
                            onClick={handleSubmitAsset}
                            style={{
                                background: 'linear-gradient(135deg, #3199b1 0%, #13637e 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '14px 28px',
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                letterSpacing: '0.3px',
                                color: '#fff',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 4px 15px rgba(0, 180, 219, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 180, 219, 0.5)';
                                e.currentTarget.style.background = 'linear-gradient(135deg, #0083b0 0%, #00b4db 100%)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 180, 219, 0.4)';
                                e.currentTarget.style.background = 'linear-gradient(135deg, #3199b1 0%, #13637e 100%)';
                            }}
                        >
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>✓</span>
                            Submit Asset Report
                        </button>
                    </div>
                </div>

                {/* ── Stats Cards ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '30px', padding: '0 10px' }}>
                    {[
                        { bg: '#EAB56F10', border: '#EAB56F', icon: 'package', iconBg: 'linear-gradient(135deg, #EAB56F, #F9982F)', val: totalAssets, label: 'Total Assets', color: '#EAB56F', labelColor: '#F9982F' },
                        { bg: '#8B5CF610', border: '#8B5CF6', icon: 'grid', iconBg: '#8B5CF6', val: totalCategories, label: 'Total Categories', color: '#8B5CF6', labelColor: '#8B5CF6' },
                        { bg: '#10B98110', border: '#10B981', icon: 'map-pin', iconBg: 'linear-gradient(135deg, #10B981, #10B981)', val: totalLocations, label: 'Total Locations', color: '#10B981', labelColor: '#10B981' },
                    ].map(card => (
                        <div key={card.label}
                            style={{ background: card.bg, backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '24px', border: `2px solid ${card.border}`, transition: 'all 0.3s ease', cursor: 'pointer' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{ background: card.iconBg, borderRadius: '15px', padding: '12px', display: 'inline-flex' }}>
                                    <FeatherIcon icon={card.icon} size={28} color="#fff" />
                                </div>
                                <span style={{ fontSize: '3rem', fontWeight: 'bold', color: card.color }}>{card.val}</span>
                            </div>
                            <h3 style={{ color: card.labelColor, marginBottom: '8px', fontSize: '1rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{card.label}</h3>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '4px', marginBottom: '0', position: 'relative', zIndex: 2 }}>
                    {[
                        { key: 'asset', label: 'Asset Reports', count: filteredAssets.length, icon: 'package', activeColor: '#EAB56F' },
                        { key: 'oil', label: 'New Oil Reports', count: filteredOilReports.length, icon: 'droplet', activeColor: '#3B82F6' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                padding: '11px 24px',
                                borderRadius: '12px 12px 0 0',
                                border: 'none',
                                background: activeTab === tab.key ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
                                color: activeTab === tab.key ? '#1A2C3E' : 'rgba(255,255,255,0.55)',
                                fontWeight: activeTab === tab.key ? '700' : '500',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                borderBottom: activeTab === tab.key ? `3px solid ${tab.activeColor}` : '3px solid transparent',
                            }}
                        >
                            <FeatherIcon icon={tab.icon} size={14} color={activeTab === tab.key ? tab.activeColor : 'rgba(255,255,255,0.4)'} />
                            {tab.label}
                            <span style={{
                                background: activeTab === tab.key ? tab.activeColor : 'rgba(255,255,255,0.15)',
                                color: '#fff',
                                borderRadius: '20px',
                                padding: '1px 8px',
                                fontSize: '0.68rem',
                                fontWeight: '700',
                                minWidth: '20px',
                                textAlign: 'center'
                            }}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* ── Filters Bar ── */}
                <div style={{ position: 'relative', zIndex: 2, background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)', borderRadius: '0px 16px 16px 16px ', padding: '16px 20px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', flexWrap: 'nowrap', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

                        {/* Search */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 180px', minWidth: '160px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#F9982F', fontWeight: '500', letterSpacing: '0.5px' }}>SEARCH</span>
                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '40px', padding: '8px 16px', gap: '8px', border: '2px solid #53535375' }}>
                                <FeatherIcon icon="search" size={16} color="rgb(255,153,0)" />
                                <input
                                    type="text"
                                    placeholder="Search by asset name, component, ID..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    style={{ background: 'none', border: 'none', width: '100%', color: '#FFFFFF', fontSize: '0.85rem', outline: 'none' }}
                                />
                                {searchTerm && (
                                    <button onClick={clearSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                                        <FeatherIcon icon="x" size={14} color="rgba(255,255,255,0.4)" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Date From */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.75rem', color: '#F9982F', fontWeight: '500', letterSpacing: '0.5px' }}>DATE FROM</span>
                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '40px', padding: '8px 14px', gap: '8px', border: '2px solid #53535375', cursor: 'pointer' }} onClick={() => openDatePicker(fromDateInputRef)}>
                                <FeatherIcon icon="calendar" size={16} color="rgb(255,153,0)" />
                                <input ref={fromDateInputRef} type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} onClick={e => e.stopPropagation()}
                                    style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '0.85rem', outline: 'none', cursor: 'pointer', width: '120px' }} />
                            </div>
                        </div>

                        {/* Date To */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.75rem', color: '#F9982F', fontWeight: '500', letterSpacing: '0.5px' }}>DATE TO</span>
                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '40px', padding: '8px 14px', gap: '8px', border: '2px solid #53535375', cursor: 'pointer' }} onClick={() => openDatePicker(toDateInputRef)}>
                                <FeatherIcon icon="calendar" size={16} color="rgb(255,153,0)" />
                                <input ref={toDateInputRef} type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} onClick={e => e.stopPropagation()}
                                    style={{ background: 'none', border: 'none', color: '#FFFFFF', fontSize: '0.85rem', outline: 'none', cursor: 'pointer', width: '120px' }} />
                            </div>
                        </div>

                        {/* Clear Dates */}
                        {(dateFrom || dateTo) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                                <span style={{ fontSize: '0.75rem', color: 'transparent', letterSpacing: '0.5px' }}>‎</span>
                                <button onClick={clearDateFilters}
                                    style={{ background: 'rgba(233,181,111,0.2)', border: '2px solid #53535375', borderRadius: '40px', padding: '8px 14px', color: '#EAB56F', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                                    <FeatherIcon icon="x" size={14} /> Clear Dates
                                </button>
                            </div>
                        )}

                        {/* Sort */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.75rem', color: '#F9982F', fontWeight: '500', letterSpacing: '0.5px' }}>SORT</span>
                            <button onClick={toggleSortOrder}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '40px', border: '2px solid #53535375', background: 'rgba(0,0,0,0.3)', color: '#EAB56F', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                <FeatherIcon icon={sortOrder === 'newest' ? 'arrow-down' : 'arrow-up'} size={14} />
                                {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                            </button>
                        </div>

                        {/* Report Filter — L2/L3 only */}
                        {empInfo.emp_position !== 'l1' && activeTab === 'asset' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                                <span style={{ fontSize: '0.75rem', color: '#F9982F', fontWeight: '500', letterSpacing: '0.5px' }}>REPORT</span>
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <select value={reportFilter} onChange={e => setReportFilter(e.target.value)}
                                        style={{ padding: '8px 36px 8px 16px', borderRadius: '40px', border: '2px solid #53535375', background: 'rgba(0,0,0,0.3)', color: '#EAB56F', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', appearance: 'none', outline: 'none', whiteSpace: 'nowrap' }}>
                                        <option value="all" style={{ background: '#254252', color: '#EAB56F' }}>All Reports ({getAllReportsCount()})</option>
                                        <option value="pending" style={{ background: '#254252', color: '#F9982F' }}>Pending ({getPendingReportsCount()})</option>
                                    </select>
                                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#EAB56F' }}>
                                        <FeatherIcon icon="chevron-down" size={14} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'oil' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                                <span style={{ fontSize: '0.75rem', color: '#F9982F', fontWeight: '500', letterSpacing: '0.5px' }}>REPORT</span>
                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                    <select value={oilReportFilter} onChange={e => setOilReportFilter(e.target.value)}
                                        style={{ padding: '8px 36px 8px 16px', borderRadius: '40px', border: '2px solid #53535375', background: 'rgba(0,0,0,0.3)', color: '#F9982F', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer', appearance: 'none', outline: 'none', whiteSpace: 'nowrap' }}>
                                        <option value="all" style={{ background: '#254252', color: '#F9982F' }}>All Reports ({getAllOilReportsCount()})</option>
                                        <option value="pending" style={{ background: '#254252', color: '#F9982F' }}>Pending ({getPendingOilReportsCount()})</option>
                                    </select>
                                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#F9982F' }}>
                                        <FeatherIcon icon="chevron-down" size={14} />
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* ── Tabs ── */}


                {/* ── Table Container ── */}
                <div style={{ position: 'relative', zIndex: 2, background: '#FFFFFF', borderRadius: '0 20px 20px 20px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>

                        {/* ════ ASSET REPORTS TABLE ════ */}
                        {activeTab === 'asset' && (
                            <>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
                                    <thead>
                                        <tr style={{ background: '#1E293B' }}>
                                            <th style={thStyle()}>Asset</th>
                                            <th style={thStyle()}>Status</th>
                                            <th style={thStyle()}>Location</th>

                                            {/* <th style={thStyle()}>Category</th> */}

                                            <th style={thStyle()}>Component</th>
                                            <th style={thStyle()}>Analysis Date</th>
                                            <th style={thStyle()}>Created By</th>
                                            <th style={{ ...thStyle(), cursor: 'pointer' }} onClick={toggleSortOrder}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    Created At <FeatherIcon icon={sortOrder === 'newest' ? 'arrow-down' : 'arrow-up'} size={12} />
                                                </div>
                                            </th>
                                            <th style={thStyle('right')}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map(asset => (
                                            <tr key={asset.asset_analysis_id}
                                                style={{ borderBottom: '1px solid #F0F2F5', transition: 'background 0.15s', cursor: 'pointer' }}
                                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                                onClick={() => handleView(asset)}
                                            >
                                                <td style={{ padding: '14px 20px', color: '#1A2C3E', fontSize: '0.85rem', fontWeight: '500' }}>{getAssetName(asset.asset_id)}</td>
                                                <td style={{ padding: '14px 20px' }}>
                                                    {/* <span style={{ background: '#F3F0FF', color: '#6B4E9E', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '500' }}>
                                                        {getAssetCategories(asset.asset_id)}
                                                    </span> */}
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        color: calculateReportStatus(asset) === 'Done' ? '#4CAF50' : '#FF9800',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        gap: '6px',
                                                    }}>
                                                        <FeatherIcon
                                                            icon='alert-circle'
                                                            size={14}
                                                            color={calculateReportStatus(asset) === 'Done' ? '#4CAF50' : '#FF9800'}
                                                        />
                                                        {calculateReportStatus(asset)}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px 20px', color: '#4A5B6E', fontSize: '0.8rem' }}>{getAssetLocation(asset.asset_id)}</td>

                                                <td style={{ padding: '14px 20px' }}>
                                                    <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '20px', background: '#EAB56F20', color: '#E37239', fontSize: '0.7rem', fontWeight: '500' }}>
                                                        {getCombinedComponent(asset.asset_component_id)}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 20px', color: '#4A5B6E', fontSize: '0.75rem' }}>
                                                    {asset.analysis_date ? new Date(asset.analysis_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                                                </td>
                                                <td style={{ padding: '14px 20px', color: '#4A5B6E', fontSize: '0.75rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <div style={{
                                                            width: '26px', height: '26px', borderRadius: '50%',
                                                            overflow: 'hidden', border: '1px solid #EAB56F',
                                                            background: '#E9EDF2', flexShrink: 0,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}>
                                                            {usersMap[asset.created_by] ? (
                                                                <img
                                                                    src={`${config.baseApi}/${usersMap[asset.created_by]}`}
                                                                    alt={asset.created_by}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.parentNode.innerHTML = `<span style="font-size:9px;font-weight:700;color:#EAB56F">${asset.created_by?.charAt(0)?.toUpperCase() || '?'}</span>`;
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span style={{ fontSize: '9px', fontWeight: 700, color: '#EAB56F' }}>
                                                                    {asset.created_by?.charAt(0)?.toUpperCase() || '?'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {asset.created_by || 'System'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px 20px', color: '#6C7A8A', fontSize: '0.75rem' }}>
                                                    {asset.created_at ? new Date(asset.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                                                </td>
                                                <td style={{ padding: '14px 20px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => handleView(asset)}
                                                        style={{ background: 'linear-gradient(135deg, #EAB56F, #F9982F)', border: 'none', fontSize: '0.75rem', cursor: 'pointer', padding: '6px 16px', borderRadius: '8px', color: '#fff', fontWeight: '500', transition: 'all 0.2s' }}
                                                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(234,181,111,0.4)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                                                    >View</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {filteredAssets.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                        <FeatherIcon icon="inbox" size={48} color="#d1b289" style={{ opacity: 0.4, marginBottom: '16px' }} />
                                        <h3 style={{ fontSize: '1.2rem', color: '#333', marginBottom: '8px' }}>
                                            {searchTerm ? 'No Matching Asset Reports Found' : reportFilter === 'pending' ? 'No Pending Reports Found' : 'No Asset Reports Found'}
                                        </h3>
                                        <p style={{ color: '#666', marginBottom: '16px' }}>
                                            {searchTerm ? `No results for "${searchTerm}".` : reportFilter === 'pending' ? 'No pending reports at the moment.' : 'No submitted asset reports at the moment.'}
                                        </p>
                                        {searchTerm && (
                                            <button onClick={clearSearch} style={{ background: 'linear-gradient(45deg, #EAB56F, #F9982F)', border: 'none', borderRadius: '8px', padding: '10px 20px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                                                Clear Search
                                            </button>
                                        )}
                                    </div>
                                )}

                                {filteredAssets.length > itemsPerPage && renderPagination({
                                    current: currentPage, total: totalPages,
                                    onPrev: prevPage, onNext: nextPage, onPage: paginate,
                                    firstIdx: indexOfFirstItem, lastIdx: indexOfLastItem,
                                    totalCount: filteredAssets.length, accentColor: '#EAB56F'
                                })}
                            </>
                        )}

                        {/* ════ NEW OIL REPORTS TABLE ════ */}
                        {activeTab === 'oil' && (
                            <>
                                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1100px' }}>
                                    <thead>
                                        <tr style={{ background: '#1E293B' }}>
                                            <th style={thStyle()}>Oil Batch Code</th>
                                            <th style={thStyle()}>Status</th>
                                            <th style={thStyle()}>Drum Number</th>
                                            <th style={thStyle()}>Manufacturing Date</th>
                                            <th style={thStyle()}>Analysis Date</th>
                                            <th style={thStyle()}>Created By</th>
                                            <th style={{ ...thStyle(), cursor: 'pointer' }} onClick={toggleSortOrder}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    Created At <FeatherIcon icon={sortOrder === 'newest' ? 'arrow-down' : 'arrow-up'} size={12} />
                                                </div>
                                            </th>
                                            <th style={thStyle('right')}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {oilCurrentItems.map(report => (
                                            <tr key={report.analysis_id || report.id}
                                                style={{ borderBottom: '1px solid #F0F2F5', transition: 'background 0.15s', cursor: 'pointer' }}
                                                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F0F7FF'}
                                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                                onClick={() => handleViewOilReport(report)}
                                            >
                                                <td style={{ padding: '14px 20px', color: '#1A2C3E', fontSize: '0.85rem', fontWeight: '500' }}>
                                                    {report.oil_batch_code}
                                                </td>
                                                <td style={{ padding: '14px 20px', color: '#1A2C3E', fontSize: '0.85rem', fontWeight: '500' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', color: calculateReportStatus1(report) === 'Done' ? '#4CAF50' : '#FF9800', fontSize: '12px', fontWeight: '600', gap: '6px' }}>
                                                        <FeatherIcon icon='alert-circle' size={14} color={calculateReportStatus1(report) === 'Done' ? '#4CAF50' : '#FF9800'} />
                                                        {calculateReportStatus1(report)}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px 20px', color: '#4A5B6E', fontSize: '0.8rem' }}>
                                                    {report.input_drum_number}
                                                </td>
                                                <td style={{ padding: '14px 20px', color: '#4A5B6E', fontSize: '0.75rem' }}>
                                                    {report.manufacturing_date ? new Date(report.manufacturing_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                                                </td>
                                                <td style={{ padding: '14px 20px', color: '#4A5B6E', fontSize: '0.75rem' }}>
                                                    {report.analysis_date ? new Date(report.analysis_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                                                </td>
                                                <td style={{ padding: '14px 20px', color: '#4A5B6E', fontSize: '0.75rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <div style={{
                                                            width: '26px', height: '26px', borderRadius: '50%',
                                                            overflow: 'hidden', border: '1px solid #3B82F6',
                                                            background: '#EFF6FF', flexShrink: 0,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}>
                                                            {usersMap[report.created_by] ? (
                                                                <img
                                                                    src={`${config.baseApi}/${usersMap[report.created_by]}`}
                                                                    alt={report.created_by}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.parentNode.innerHTML = `<span style="font-size:9px;font-weight:700;color:#3B82F6">${report.created_by?.charAt(0)?.toUpperCase() || '?'}</span>`;
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span style={{ fontSize: '9px', fontWeight: 700, color: '#3B82F6' }}>
                                                                    {report.created_by?.charAt(0)?.toUpperCase() || '?'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {report.created_by || 'System'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px 20px', color: '#6C7A8A', fontSize: '0.75rem' }}>
                                                    {report.created_at ? new Date(report.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                                                </td>
                                                <td style={{ padding: '14px 20px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => handleViewOilReport(report)}
                                                        style={{ background: 'linear-gradient(135deg, #3B82F6, #6366F1)', border: 'none', fontSize: '0.75rem', cursor: 'pointer', padding: '6px 16px', borderRadius: '8px', color: '#fff', fontWeight: '500', transition: 'all 0.2s' }}
                                                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.4)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                                                    >View</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {filteredOilReports.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                        <FeatherIcon icon="droplet" size={48} color="#3B82F6" style={{ opacity: 0.35, marginBottom: '16px' }} />
                                        <h3 style={{ fontSize: '1.2rem', color: '#333', marginBottom: '8px' }}>
                                            {searchTerm ? 'No Matching Oil Reports Found' : 'No New Oil Reports Found'}
                                        </h3>
                                        <p style={{ color: '#666', marginBottom: '16px' }}>
                                            {searchTerm ? `No results for "${searchTerm}".` : 'No new oil reports submitted yet.'}
                                        </p>
                                        {searchTerm && (
                                            <button onClick={clearSearch} style={{ background: 'linear-gradient(45deg, #3B82F6, #6366F1)', border: 'none', borderRadius: '8px', padding: '10px 20px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                                                Clear Search
                                            </button>
                                        )}
                                    </div>
                                )}

                                {filteredOilReports.length > itemsPerPage && renderPagination({
                                    current: oilCurrentPage, total: oilTotalPages,
                                    onPrev: oilPrevPage, onNext: oilNextPage, onPage: setOilCurrentPage,
                                    firstIdx: oilIndexOfFirstItem, lastIdx: oilIndexOfLastItem,
                                    totalCount: filteredOilReports.length, accentColor: '#3B82F6'
                                })}
                            </>
                        )}

                    </div>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translate(0,0) rotate(0deg); }
                    33%  { transform: translate(50px,-50px) rotate(120deg); }
                    66%  { transform: translate(-30px,30px) rotate(240deg); }
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                input[type="date"]::-webkit-calendar-picker-indicator {
                    opacity: 0; position: absolute; width: 100%; height: 100%; left: 0; top: 0; cursor: pointer; z-index: 2;
                }
                input[type="date"] { position: relative; -webkit-appearance: none; appearance: none; }
            `}</style>
        </div>
    );
}