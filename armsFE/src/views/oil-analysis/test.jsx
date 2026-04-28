

import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import axios from 'axios';
import config from 'config';
import { Container, Row, Col, Badge, Spinner, Form, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import FeatherIcon from "feather-icons-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

import water from "assets/images/water.png";
import gear from "assets/images/gear-box.png";
import lab from "assets/images/lab.png";

import Loading from '../../components/personalComponents/loading';
import AlertModal from '../../components/personalComponents/alertModal';

// Constants
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

const tabColors = {
    'wear-metals': '#00BFFF',
    'contaminants': '#32CD32',
    'chemistry': '#FFA500',
    'overview': COLORS.primary
};

const tabGradients = {
    'wear-metals': 'linear-gradient(135deg, #6949a5 0%, #3F1D7D 100%)',
    'contaminants': 'linear-gradient(135deg, #228B22 0%, #32CD32 100%)',
    'chemistry': 'linear-gradient(135deg, #C14E26 0%, #ff4000 100%)',
    'overview': `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`
};

const getCriticalityColor = (status) => {
    if (!status || status === 'Select') return '#f5f5f5';

    const colorMap = {
        'Good/Ok': '#10b981',
        'Verify/Abnormal': '#f59e0b',
        'Severe': '#ef4444',
        'Critical': '#dc2626',
        'Warning': '#f97316'
    };

    return colorMap[status] || '#6b7280';
};

export default function ViewSubmittedAsset() {
    const asset_analysis_id = new URLSearchParams(window.location.search).get('id');

    // State management
    const [data, setData] = useState([]);
    const [assetData, setAssetData] = useState([]);
    const [componentData, setComponentData] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [matchData, setMatchData] = useState([]);
    const [filteredMatchData, setFilteredMatchData] = useState([]);
    const [rotating, setRotating] = useState(false);
    const [mobile, setMobile] = useState(false);
    const [stationary, setStationary] = useState(false);
    const [assetRunningHours, setAssetRunningHours] = useState(0);
    const [oilRunningHours, setOilRunningHours] = useState(0);
    const [maxAssetRunningHours, setMaxAssetRunningHours] = useState(100);
    const [maxOilRunningHours, setMaxOilRunningHours] = useState(100);
    const [wearMetalsFilter, setWearMetalsFilter] = useState('all');
    const [contaminantsFilter, setContaminantsFilter] = useState('all');
    const [chemistryFilter, setChemistryFilter] = useState('all');
    const [hiddenWearMetals, setHiddenWearMetals] = useState(new Set());
    const [hiddenContaminants, setHiddenContaminants] = useState(new Set());
    const [hiddenChemistry, setHiddenChemistry] = useState(new Set());
    const [criticalityStatus, setCriticalityStatus] = useState('');
    const [originalCriticalityStatus, setOriginalCriticalityStatus] = useState('');
    const [showCriticalityModal, setShowCriticalityModal] = useState(false);
    const [showSamplingModal, setShowSamplingModal] = useState(false);
    const [showSevereModal, setShowSevereModal] = useState(false);
    const [resamplingSchedule, setResamplingSchedule] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [modalData, setModalData] = useState(null);
    const [overviewCategory, setOverviewCategory] = useState('all');
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ type: 'success', title: '', description: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState(new Date());
    const [hoursInconsistency, setHoursInconsistency] = useState(false);
    const [showActionsTakenModal, setShowActionsTakenModal] = useState(false);

    const [actionDocumentation, setActionDocumentation] = useState('');
    const [documentationFiles, setDocumentationFiles] = useState([]);
    const [showDocumentationModal, setShowDocumentationModal] = useState(false);
    const [selectedDocFile, setSelectedDocFile] = useState(null);

    // Parameter definitions
    const wearMetalsParams = useMemo(() => ({
        rotating: [
            { label: "Iron", key: "iron", unit: "ppm" },
            { label: "Chrome", key: "chrome", unit: "ppm" },
            { label: "Nickel", key: "nickel", unit: "ppm" },
            { label: "Aluminium", key: "aluminium", unit: "ppm" },
            { label: "Lead", key: "lead", unit: "ppm" },
            { label: "Copper", key: "copper", unit: "ppm" },
            { label: "Tin", key: "tin", unit: "ppm" },
            { label: "Titanium", key: "titanium", unit: "ppm" },
            { label: "Silver", key: "silver", unit: "ppm" },
            { label: "Antimony", key: "antimony", unit: "ppm" },
            { label: "Cadmium", key: "cadmium", unit: "ppm" },
            { label: "Manganese", key: "manganese", unit: "ppm" },
            { label: "Fatigue >20um", key: "fatigue_gt_20um", unit: "count" },
            { label: "Non-Metallic >20um", key: "non_metallic_gt_20um", unit: "count" },
            { label: "Large Fe", key: "large_fe", unit: "%" },
            { label: "Fe Wear Severity Index", key: "fe_wear_severity_index", unit: "index" },
            { label: "Total Fe <100u", key: "total_fe_lt_100um", unit: "ppm" }
        ],
        stationaryMobile: [
            { label: "Iron", key: "iron", unit: "ppm" },
            { label: "Chrome", key: "chrome", unit: "ppm" },
            { label: "Nickel", key: "nickel", unit: "ppm" },
            { label: "Aluminium", key: "aluminium", unit: "ppm" },
            { label: "Lead", key: "lead", unit: "ppm" },
            { label: "Copper", key: "copper", unit: "ppm" },
            { label: "Tin", key: "tin", unit: "ppm" },
            { label: "Titanium", key: "titanium", unit: "ppm" },
            { label: "Silver", key: "silver", unit: "ppm" },
            { label: "Antimony", key: "antimony", unit: "ppm" },
            { label: "Cadmium", key: "cadmium", unit: "ppm" },
            { label: "Manganese", key: "manganese", unit: "ppm" }
        ]
    }), []);

    const contaminantsParams = useMemo(() => ({
        rotating: [
            { label: "Silicon", key: "silicon", unit: "ppm" },
            { label: "Sodium", key: "sodium", unit: "ppm" },
            { label: "Vanadium", key: "vanadium", unit: "ppm" },
            { label: "Potassium", key: "potassium", unit: "ppm" },
            { label: "Lithium", key: "lithium", unit: "ppm" },
            { label: "ISO 4406 (>4μm)", key: "iso_4406_code_gt4um" },
            { label: "ISO 4406 (>6μm)", key: "iso_4406_code_gt6um" },
            { label: "ISO 4406 (>14μm)", key: "iso_4406_code_gt14um" },
            { label: "Cnts >4", key: "cnts_gt4", unit: "particles/ml" },
            { label: "Cnts >6", key: "cnts_gt6", unit: "particles/ml" },
            { label: "Cnts >14", key: "cnts_gt14", unit: "particles/ml" },
            { label: "Particles 5-15um", key: "particles_5_15um", unit: "particles/100" },
            { label: "Particles 15-25um", key: "particles_15_25um", unit: "particles/100" },
            { label: "Particles 25-50um", key: "particles_25_50um", unit: "particles/100" },
            { label: "Particles 50-100um", key: "particles_50_100um", unit: "particles/100" },
            { label: "Particles >100um", key: "particles_gt100um", unit: "particles/100" },
            { label: "Cutting >20um", key: "cutting_gt_20um", unit: "particles/ml" },
            { label: "Sliding >20um", key: "sliding_gt_20um", unit: "particles/ml" },
            { label: "Total Water", key: "total_water", unit: "%" },
            { label: "Bubbles", key: "bubbles" },
            { label: "Water", key: "water", unit: "%" },
            { label: "Large Fe", key: "large_fe_percent", unit: "%" }
        ],
        stationary: [
            { label: "Silicon", key: "silicon", unit: "ppm" },
            { label: "Sodium", key: "sodium", unit: "ppm" },
            { label: "Vanadium", key: "vanadium", unit: "ppm" },
            { label: "Potassium", key: "potassium", unit: "ppm" },
            { label: "Lithium", key: "lithium", unit: "ppm" },
            { label: "Glycol %", key: "glycol_percent", unit: "%" },
            { label: "Bubbles", key: "bubbles" },
            { label: "Antiwear", key: "antiwear_percent", unit: "%" },
            { label: "Water", key: "water", unit: "ppm" },
            { label: "Soot %", key: "soot_percent", unit: "%" },
            { label: "Biodiesel Fuel Dilution", key: "biodiesel_fuel_dilution", unit: "wt%" }
        ],
        mobile: [
            { label: "Silicon", key: "silicon", unit: "ppm" },
            { label: "Sodium", key: "sodium", unit: "ppm" },
            { label: "Vanadium", key: "vanadium", unit: "ppm" },
            { label: "Potassium", key: "potassium", unit: "ppm" },
            { label: "Lithium", key: "lithium", unit: "ppm" },
            { label: "Glycol %", key: "glycol_percent", unit: "%" },
            { label: "Bubbles", key: "bubbles" },
            { label: "Water", key: "water", unit: "%" },
            { label: "Soot %", key: "soot_percent", unit: "%" },
            { label: "Biodiesel Fuel Dilution", key: "biodiesel_fuel_dilution", unit: "wt%" }
        ]
    }), []);

    const chemistryParams = useMemo(() => ({
        common: [
            { label: "Molybdenum", key: "molybdenum", unit: "ppm" },
            { label: "Calcium", key: "calcium", unit: "ppm" },
            { label: "Magnesium", key: "magnesium", unit: "ppm" },
            { label: "Phosphorus", key: "phosphorus", unit: "ppm" },
            { label: "Zinc", key: "zinc", unit: "ppm" },
            { label: "Barium", key: "barium", unit: "ppm" },
            { label: "Boron", key: "boron", unit: "ppm" },
            { label: "Viscosity 40°C", key: "viscosity_at_40c", unit: "cSt" },
            { label: "Viscosity 100°C", key: "viscosity_at_100c", unit: "cSt" },
            { label: "Oxidation", key: "oxidation", unit: "abs/0.1mm" },
            { label: "Fluid Integrity", key: "fluid_integrity" }
        ],
        rotating: [{ label: "TAN", key: "tan" }],
        stationaryMobile: [
            { label: "TBN", key: "tbn", unit: "mg KOH/g" },
            { label: "Nitration", key: "nitration", unit: "abs/cm" },
            { label: "Sulfation", key: "sulfation", unit: "abs/0.1mm" }
        ],
        mobile: [{ label: "Antiwear", key: "antiwear_percent", unit: '%' }]
    }), []);

    const actionOptions = [
        { value: "immediate maintenance", label: "Immediate Maintenance Required" },
        { value: "component replacement", label: "Component Replacement" },
        { value: "oil_change", label: "Immediate Oil Change" },
        { value: "shutdown inspection", label: "Shutdown & Inspection" },
        { value: "schedule maintenance", label: "Schedule Maintenance" },
        { value: "monitor closely", label: "Monitor Closely" }
    ];

    // Helper functions
    const showAlertMessage = useCallback((type, title, description) => {
        setAlertConfig({ type, title, description });
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 5000);
    }, []);

    const clampNumber = useCallback((min, max) => {
        if (typeof window !== 'undefined') {
            const width = window.innerWidth;
            if (width < 576) return min;
            if (width > 768) return max;
            return min + (max - min) * ((width - 576) / 192);
        }
        return min;
    }, []);

    const formatTrivector = useCallback((value) => {
        const mapping = {
            'rotating-machine': 'Rotating Machine',
            'stationary-engine': 'Stationary Engine',
            'mobile-engine': 'Mobile Engine'
        };
        return mapping[value] || value || '-';
    }, []);

    // Data fetching
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`${config.baseApi}/assetsAnalysis/get-submitted-assets-by-id`, {
                    params: { id: asset_analysis_id }
                });
                const data = res.data || {};
                console.log('DATA: ', data);
                setData(data);
                setResamplingSchedule(data.resampling_schedule || '');
                setAssetRunningHours(data.asset_running_hours || 0);
                setOilRunningHours(data.oil_running_hours || 0);

                const assetres = await axios.get(`${config.baseApi}/assets/get-asset-by-id`, {
                    params: { id: data.asset_id }
                });
                const assetData = assetres.data || {};
                setAssetData(assetData);

                if (assetData.expected_life_hours) setMaxAssetRunningHours(assetData.expected_life_hours);
                if (assetData.oil_change_interval_hours) setMaxOilRunningHours(assetData.oil_change_interval_hours);

                if (data.criticality_analysis_status) {
                    setCriticalityStatus(data.criticality_analysis_status);
                    setOriginalCriticalityStatus(data.criticality_analysis_status);
                    if (data.criticality_analysis_status === "Verify/Abnormal" && !data.resampling_schedule) {
                        setShowSamplingModal(true);
                    }
                    if (data.criticality_analysis_status === "Severe" && !data.action_taken) {
                        setShowSevereModal(true);
                    }
                }

                if (data.action_taken !== null) {
                    setActionDocumentation(true);
                }

                // Parse documentation files
                if (data.documentation) {
                    const files = data.documentation.split(',').filter(f => f.trim());
                    setDocumentationFiles(files);
                } else {
                    setDocumentationFiles([]);
                }

                const componentRes = await axios.get(`${config.baseApi}/assets/get-asset-component-by-id`, {
                    params: { id: data.asset_component_id }
                });
                setComponentData(componentRes.data || {});

                const res1 = await axios.get(`${config.baseApi}/assetsAnalysis/get-all-submitted-assets`);
                const data1 = res1.data || [];
                const filteredMatchData = data1.filter(item =>
                    item.asset_id === data.asset_id &&
                    item.asset_component_id === data.asset_component_id
                ).sort((a, b) => new Date(a.analysis_date) - new Date(b.analysis_date));

                setMatchData(filteredMatchData);
                setFilteredMatchData(filteredMatchData);

                if (filteredMatchData.length > 0) {
                    const firstDate = new Date(filteredMatchData[0].analysis_date);
                    const lastDate = new Date(filteredMatchData[filteredMatchData.length - 1].analysis_date);
                    setFromDate(firstDate.toISOString().split('T')[0]);
                    setToDate(lastDate.toISOString().split('T')[0]);
                }

            } catch (err) {
                console.error('UNABLE TO FETCH DATA:', err);
                showAlertMessage('error', 'Error', 'Failed to load asset data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [asset_analysis_id, showAlertMessage]);

    useEffect(() => {
        if (assetData.trivector === 'rotating-machine') {
            setRotating(true);
            setStationary(false);
            setMobile(false);
        } else if (assetData.trivector === 'stationary-engine') {
            setStationary(true);
            setRotating(false);
            setMobile(false);
        } else if (assetData.trivector === 'mobile-engine') {
            setMobile(true);
            setRotating(false);
            setStationary(false);
        }
    }, [assetData]);

    useEffect(() => {
        if (matchData.length === 0) return;
        let filtered = [...matchData];
        if (fromDate) {
            const fromDateTime = new Date(fromDate);
            fromDateTime.setHours(0, 0, 0, 0);
            filtered = filtered.filter(item => new Date(item.analysis_date) >= fromDateTime);
        }
        if (toDate) {
            const toDateTime = new Date(toDate);
            toDateTime.setHours(23, 59, 59, 999);
            filtered = filtered.filter(item => new Date(item.analysis_date) <= toDateTime);
        }
        setFilteredMatchData(filtered);
    }, [fromDate, toDate, matchData]);

    // Handlers
    const handleCriticalitySave = async (selectedStatus) => {
        const empInfo = JSON.parse(localStorage.getItem("user"));
        setIsLoading(true);
        if (!selectedStatus || selectedStatus === 'Select') {
            showAlertMessage('error', 'Empty Field', 'Unable to save empty Critical Analysis Report!');
            setIsLoading(false);
            return;
        }

        if (originalCriticalityStatus === 'Verify/Abnormal' && selectedStatus !== 'Verify/Abnormal') {
            try {
                await axios.post(`${config.baseApi}/assetsAnalysis/update-resampling-schedule`, {
                    asset_analysis_id: asset_analysis_id,
                    resampling_schedule: null,
                    updated_by: empInfo.username
                });
            } catch (err) {
                console.log('Unable to remove resampling schedule:', err);
            }
        }

        if (originalCriticalityStatus === 'Severe' && selectedStatus !== 'Severe') {
            try {
                const response = await axios.post(`${config.baseApi}/assetsAnalysis/update-remove-severe-action`, {
                    asset_analysis_id: asset_analysis_id,
                    updated_by: empInfo.username
                });

                console.log('Remove severe action response:', response.data);

                if (response.data.deletedCount > 0) {
                    console.log(` Deleted ${response.data.deletedCount} file(s):`, response.data.deletedFiles);
                }
                if (response.data.failedCount > 0) {
                    console.log(`Failed to delete ${response.data.failedCount} file(s):`, response.data.failedFiles);
                }
            } catch (err) {
                console.log('Unable to remove severe action:', err);
            }
        }

        try {
            await axios.post(`${config.baseApi}/assetsAnalysis/update-criticality`, {
                asset_analysis_id: asset_analysis_id,
                criticality_analysis_report: selectedStatus,
                updated_by: empInfo.username
            });
            setCriticalityStatus(selectedStatus);
            setOriginalCriticalityStatus(selectedStatus);
            setShowCriticalityModal(false);

            showAlertMessage('success', 'Success', 'Criticality status updated successfully');

            setTimeout(() => {
                window.location.reload();
            }, 2000);

            if (selectedStatus === "Verify/Abnormal" && !resamplingSchedule) {
                setShowSamplingModal(true);
            }
        } catch (err) {
            console.error('Unable to save criticality_status:', err);
            showAlertMessage('error', 'Unable to save', 'Something went wrong, please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getChartData = useCallback((parameterKey) => {
        if (filteredMatchData.length <= 1) return [];
        const hasData = filteredMatchData.some(item =>
            item[parameterKey] !== null && item[parameterKey] !== undefined && item[parameterKey] !== ''
        );
        if (!hasData) return [];

        return filteredMatchData.map(item => ({
            date: new Date(item.analysis_date).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
            }),
            value: item[parameterKey] || 0,
            fullDate: new Date(item.analysis_date)
        })).sort((a, b) => a.fullDate - b.fullDate);
    }, [filteredMatchData]);

    const getMultiLineChartData = useCallback((parametersList) => {
        if (filteredMatchData.length <= 1) return [];
        const validParams = parametersList.filter(param =>
            filteredMatchData.some(item =>
                item[param.key] !== null && item[param.key] !== undefined && item[param.key] !== ''
            )
        );
        if (validParams.length === 0) return [];

        const sortedData = [...filteredMatchData].sort((a, b) =>
            new Date(a.analysis_date) - new Date(b.analysis_date)
        );

        return sortedData.map(item => {
            const dataPoint = {
                date: new Date(item.analysis_date).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                }),
                fullDate: new Date(item.analysis_date)
            };
            validParams.forEach(param => {
                const value = item[param.key];
                if (value !== null && value !== undefined && value !== '') {
                    dataPoint[param.key] = typeof value === 'number' ? value : parseFloat(value) || 0;
                } else {
                    dataPoint[param.key] = null;
                }
            });
            return dataPoint;
        });
    }, [filteredMatchData]);

    // Get current parameters based on filters
    const getCurrentWearMetals = useCallback(() => {
        let allParams = rotating ? wearMetalsParams.rotating : wearMetalsParams.stationaryMobile;
        if (wearMetalsFilter === 'all') return allParams;
        return allParams.filter(param => param.label.toLowerCase() === wearMetalsFilter.toLowerCase());
    }, [rotating, wearMetalsFilter, wearMetalsParams]);

    const getCurrentContaminants = useCallback(() => {
        let allParams = [];
        if (rotating) allParams = contaminantsParams.rotating;
        else if (stationary) allParams = contaminantsParams.stationary;
        else if (mobile) allParams = contaminantsParams.mobile;

        if (contaminantsFilter === 'all') return allParams;
        return allParams.filter(param => param.label.toLowerCase() === contaminantsFilter.toLowerCase());
    }, [rotating, stationary, mobile, contaminantsFilter, contaminantsParams]);

    const getCurrentChemistry = useCallback(() => {
        let allParams = [...chemistryParams.common];
        if (rotating) allParams = [...allParams, ...chemistryParams.rotating];
        else if (stationary || mobile) allParams = [...allParams, ...chemistryParams.stationaryMobile];
        if (mobile) allParams = [...allParams, ...chemistryParams.mobile];

        if (chemistryFilter === 'all') return allParams;
        return allParams.filter(param => param.label.toLowerCase() === chemistryFilter.toLowerCase());
    }, [rotating, stationary, mobile, chemistryFilter, chemistryParams]);

    const getAllWearMetals = useCallback(() => {
        return rotating ? wearMetalsParams.rotating : wearMetalsParams.stationaryMobile;
    }, [rotating, wearMetalsParams]);

    const getAllContaminants = useCallback(() => {
        if (rotating) return contaminantsParams.rotating;
        if (stationary) return contaminantsParams.stationary;
        if (mobile) return contaminantsParams.mobile;
        return [];
    }, [rotating, stationary, mobile, contaminantsParams]);

    const getAllChemistry = useCallback(() => {
        let allParams = [...chemistryParams.common];
        if (rotating) allParams = [...allParams, ...chemistryParams.rotating];
        else if (stationary || mobile) allParams = [...allParams, ...chemistryParams.stationaryMobile];
        if (mobile) allParams = [...allParams, ...chemistryParams.mobile];
        return allParams;
    }, [rotating, stationary, mobile, chemistryParams]);

    // Get filter options for dropdown
    const getFilterOptions = useCallback(() => {
        if (activeTab === 'wear-metals') {
            const allParams = rotating ? wearMetalsParams.rotating : wearMetalsParams.stationaryMobile;
            return allParams.map(param => ({
                value: param.label.toLowerCase(),
                label: param.label
            }));
        } else if (activeTab === 'contaminants') {
            let allParams = [];
            if (rotating) allParams = contaminantsParams.rotating;
            else if (stationary) allParams = contaminantsParams.stationary;
            else if (mobile) allParams = contaminantsParams.mobile;
            return allParams.map(param => ({
                value: param.label.toLowerCase(),
                label: param.label
            }));
        } else if (activeTab === 'chemistry') {
            let allParams = [...chemistryParams.common];
            if (rotating) allParams = [...allParams, ...chemistryParams.rotating];
            else if (stationary || mobile) allParams = [...allParams, ...chemistryParams.stationaryMobile];
            if (mobile) allParams = [...allParams, ...chemistryParams.mobile];
            return allParams.map(param => ({
                value: param.label.toLowerCase(),
                label: param.label
            }));
        }
        return [];
    }, [activeTab, rotating, stationary, mobile, wearMetalsParams, contaminantsParams, chemistryParams]);

    const StatCard = ({ label, value, icon, bgColor, borderColor, accentColor }) => (
        <div style={{
            position: 'relative',
            height: '90%',
            minWidth: 0,
            containerType: 'inline-size',
        }}>
            <div style={{
                position: 'absolute',
                top: '-20px',
                right: '5px',
                width: 'min(70px, 200cqw)',
                height: 'min(70px, 200cqw)',
                background: accentColor || COLORS.accent,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 10,
            }}>
                <FeatherIcon icon={icon} size={32} color="#fff" />
            </div>
            <div style={{
                background: bgColor || '#fdf4e2',
                borderRadius: '24px',
                padding: 'clamp(20px, 4vw, 28px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: `3px solid ${borderColor || 'rgb(214, 180, 105)'}`,
                height: '100%',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    containerType: 'inline-size',
                }}>
                    <div style={{
                        fontSize: 'clamp(14px, 8cqw, 32px)',
                        fontWeight: '800',
                        color: COLORS.dark,
                        marginBottom: '8px',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}>
                        {value || '—'}
                    </div>
                </div>
                <div style={{
                    fontSize: 'clamp(12px, 3vw, 14px)',
                    color: accentColor || COLORS.accent,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {label}
                </div>
            </div>
        </div>
    );

    const MetricTile = ({ label, value, unit, parameterKey, }) => {
        const chartData = getChartData(parameterKey);
        const showChart = chartData.length > 0 && chartData.some(d => d.value !== 0);

        return (
            <div style={{ cursor: showChart ? 'pointer' : 'default' }}
                onClick={() => showChart && setModalData({ label, unit, data: chartData, parameterKey })}>
                <div style={{
                    background: 'linear-gradient(135deg, #ffd698 0%, #ffb347 100%)',
                    borderRadius: '16px 16px 0px 0px',
                    padding: 'clamp(12px, 3vw, 16px)',
                    transition: 'all 0.2s ease',
                    border: `1.5px solid #6e6e6e`,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px'
                }}>
                    <div style={{
                        fontSize: 'clamp(10px, 2.5vw, 12px)',
                        color: '#303030',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: '600',
                        wordBreak: 'break-word'
                    }}>
                        {label}
                    </div>
                    <div style={{
                        fontSize: 'clamp(18px, 4vw, 24px)',
                        fontWeight: 'bold',
                        color: COLORS.dark,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'baseline',
                        gap: '10px',
                        flexWrap: 'wrap'
                    }}>
                        <span>{value || '—'}</span>
                        {unit && (
                            <span style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: COLORS.gray }}>
                                {unit}
                            </span>
                        )}
                    </div>
                </div>
                {showChart && (
                    <div style={{
                        padding: 'clamp(8px, 2vw, 12px)',
                        background: '#fff2d6',
                        borderRadius: '0px 0px 12px 12px',
                        border: `1.5px solid #6e6e6e`,
                        borderTop: 'none'
                    }}>
                        <div style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: COLORS.gray, marginBottom: '8px' }}>
                            Historical Trend (Last {chartData.length} records) - Click to enlarge
                        </div>
                        <div style={{ height: 'clamp(150px, 25vw, 200px)', width: '100%' }}>
                            <ResponsiveContainer>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}30`} />
                                    <XAxis dataKey="date" tick={{ fontSize: clampNumber(8, 10) }} interval="preserveStartEnd" angle={-25} textAnchor="end" height={60} />
                                    <YAxis tick={{ fontSize: clampNumber(8, 10) }} label={{ value: unit || 'ppm', angle: -90, position: 'insideLeft', fontSize: clampNumber(8, 10) }} />
                                    <Tooltip formatter={(value) => [`${value} ${unit || ''}`, label]} labelFormatter={(label) => `Date: ${label}`} />
                                    <Line type="monotone" dataKey="value" stroke={COLORS.accent} strokeWidth={2} dot={{ fill: COLORS.accent, r: clampNumber(2, 3) }} activeDot={{ r: clampNumber(4, 5) }} name={label} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const SectionTitle = ({ title, icon, count, titleColor }) => (
        <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div style={{ width: 'clamp(32px, 6vw, 40px)', height: 'clamp(32px, 6vw, 40px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={icon} width='25px' alt={title} />
                </div>
                <h3 style={{ margin: 0, fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 'bold', color: titleColor || '#d19547' }}>
                    {title}
                </h3>
                {count && <Badge style={{ background: COLORS.light, color: COLORS.dark, padding: '4px 10px' }}>{count} metrics</Badge>}
            </div>
        </div>
    );

    const OverviewMultiChart = ({ title, icon, parameters, unit = "ppm", yAxisLabel, hiddenSet, onToggle, titleColor }) => {
        const chartData = getMultiLineChartData(parameters);
        const hasData = chartData.length > 0 && parameters.some(p =>
            filteredMatchData.some(item => item[p.key] !== null && item[p.key] !== undefined && item[p.key] !== '')
        );

        const renderLegend = ({ payload }) => (
            <ul style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 16px', padding: '10px 0 0 0', margin: 0, listStyle: 'none' }}>
                {payload.map((entry) => {
                    const isHidden = hiddenSet.has(entry.dataKey);
                    return (
                        <li key={`item-${entry.dataKey}`} onClick={() => onToggle(entry.dataKey)} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '11px',
                            padding: '4px 8px', borderRadius: '4px', transition: 'all 0.2s ease', opacity: isHidden ? 0.6 : 1,
                            textDecoration: isHidden ? 'underline' : 'none', backgroundColor: isHidden ? '#f5f5f5' : 'transparent'
                        }}>
                            <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', backgroundColor: entry.color }} />
                            <span style={{ color: COLORS.dark }}>{entry.value}</span>
                        </li>
                    );
                })}
            </ul>
        );

        if (!hasData) {
            return (
                <div style={{ marginBottom: '32px' }}>
                    <SectionTitle title={title} icon={icon} count={parameters.length.toString()} titleColor={titleColor} />
                    <div style={{ background: '#fff2d6', borderRadius: '16px', padding: '40px', textAlign: 'center', border: `1.5px solid #6e6e6e`, color: COLORS.gray }}>
                        No historical data available for {title.toLowerCase()} parameters
                    </div>
                </div>
            );
        }

        return (
            <div style={{ marginBottom: '40px' }}>
                <SectionTitle titleColor={titleColor} title={title} icon={icon} count={parameters.length.toString()} />
                <div style={{ background: '#fff2d6', borderRadius: '16px', padding: '20px', border: `1.5px solid #6e6e6e` }}>
                    <div style={{ height: '450px', width: '100%' }}>
                        <ResponsiveContainer>
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}30`} />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" angle={-25} textAnchor="end" height={70} />
                                <YAxis tick={{ fontSize: 11 }} label={{ value: yAxisLabel || unit, angle: -90, position: 'insideLeft', fontSize: 11 }} />
                                <Tooltip formatter={(value, name) => {
                                    const param = parameters.find(p => p.key === name);
                                    return [`${value} ${param?.unit || unit}`, param?.label || name];
                                }} labelFormatter={(label) => `Date: ${label}`} />
                                <Legend content={renderLegend} verticalAlign="bottom" height={80} />
                                {parameters.map((param, index) => {
                                    const hasParamData = filteredMatchData.some(item => item[param.key] !== null && item[param.key] !== undefined && item[param.key] !== '');
                                    if (!hasParamData) return null;
                                    return <Line key={param.key} type="monotone" dataKey={param.key} stroke={CHART_COLORS[index % CHART_COLORS.length]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name={param.label} connectNulls={true} hide={hiddenSet.has(param.key)} />;
                                })}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ padding: '8px', backgroundColor: `${COLORS.primary}10`, borderRadius: '8px', fontSize: '12px', color: COLORS.gray, textAlign: 'center' }}>
                        <FeatherIcon icon="info" size={14} color={COLORS.accent} style={{ marginRight: '6px' }} />
                        Click on any parameter in the legend to show/hide it on the chart
                    </div>
                </div>
            </div>
        );
    };

    const SemiCircleGauge = ({ value, maxValue, label, unit, icon, color, valueColor, bgColor, gaugeColor }) => {
        const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
        const angle = (percentage / 100) * 180;
        const radius = 120;
        const centerX = 150;
        const centerY = 150;
        const startAngle = Math.PI;
        const endAngle = startAngle + (angle * Math.PI / 180);
        const startX = centerX + radius * Math.cos(startAngle);
        const startY = centerY + radius * Math.sin(startAngle);
        const endX = centerX + radius * Math.cos(endAngle);
        const endY = centerY + radius * Math.sin(endAngle);
        const largeArcFlag = angle > 180 ? 1 : 0;
        const arcPath = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;

        const getColor = () => {
            if (color) return color;
            if (percentage >= 80) return '#ef4444';
            if (percentage >= 60) return '#f59e0b';
            return '#10b981';
        };

        return (
            <div style={{
                background: `${bgColor || '#fdf4e2'}`,
                borderRadius: '24px',
                padding: '20px',
                textAlign: 'center',
                height: '100%',
                border: `2px solid ${color || '#EAB56F'}`,
                transition: 'all 0.3s ease',
                position: 'relative'
            }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <svg width="300" height="180" viewBox="0 0 300 180" style={{ margin: '0 auto', display: 'block' }}>
                        <path d="M 30 150 A 120 120 0 0 1 270 150" fill="none" stroke={gaugeColor || '#474747'} strokeWidth="20" strokeLinecap="round" />
                        <path d={arcPath} fill="none" stroke={getColor()} strokeWidth="20" strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
                        <text x="150" y="130" textAnchor="middle" fontSize="48" fontWeight="bold" fill={valueColor || COLORS.dark}>{Math.round(percentage)}<tspan fontSize="24" fill={valueColor || COLORS.dark}>%</tspan></text>
                    </svg>
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#171C2D', marginTop: '8px' }}>
                    <div style={{ gap: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffff' }}>
                        <FeatherIcon icon={icon} size={24} color={color || '#EAB56F'} />
                        {label}
                    </div>
                </div>
                <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>
                    {value?.toLocaleString() || '0'} / {maxValue?.toLocaleString()} {unit}
                </div>
                {value > maxValue && (
                    <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: COLORS.danger,
                        color: 'white',
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '12px'
                    }}>
                        Exceeds limit
                    </div>
                )}
            </div>
        );
    };

    const FilterAndDateRow = () => {
        const showFilters = matchData.length > 1;
        const showParameterFilter = activeTab !== 'overview';
        const filterOptions = getFilterOptions();

        if (!showFilters) return null;

        return (
            <div style={{ background: COLORS.white, borderRadius: '0px 0px 16px 16px', padding: 'clamp(12px, 3vw, 16px)', marginBottom: '24px', border: `2px solid ${COLORS.primary}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                {showParameterFilter && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <FeatherIcon icon="filter" size={clampNumber(14, 18)} color={COLORS.accent} />
                        <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: '600', color: COLORS.dark }}>Filter by Parameter:</span>
                        <Form.Select
                            value={activeTab === 'wear-metals' ? wearMetalsFilter : activeTab === 'contaminants' ? contaminantsFilter : chemistryFilter}
                            onChange={(e) => {
                                if (activeTab === 'wear-metals') setWearMetalsFilter(e.target.value);
                                else if (activeTab === 'contaminants') setContaminantsFilter(e.target.value);
                                else setChemistryFilter(e.target.value);
                            }}
                            style={{ width: 'clamp(160px, 30vw, 200px)', borderRadius: '8px', border: `2px solid ${COLORS.primary}`, fontSize: 'clamp(12px, 2.5vw, 14px)', cursor: 'pointer' }}>
                            <option value="all">All Parameters</option>
                            {filterOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Form.Select>
                    </div>
                )}
                {!showParameterFilter && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <FeatherIcon icon="grid" size={clampNumber(14, 18)} color={COLORS.accent} />
                        <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: '600', color: COLORS.dark }}>Show Categories:</span>
                        <Form.Select value={overviewCategory} onChange={(e) => setOverviewCategory(e.target.value)} style={{ width: 'clamp(160px, 30vw, 200px)', borderRadius: '8px', border: `2px solid ${COLORS.primary}`, fontSize: 'clamp(12px, 2.5vw, 14px)', cursor: 'pointer' }}>
                            <option value="all">All</option>
                            <option value="wear-metals">Wear Metals</option>
                            <option value="contaminants">Contaminants</option>
                            <option value="chemistry">Chemistry</option>
                        </Form.Select>
                    </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FeatherIcon icon="calendar" size={clampNumber(14, 18)} color={COLORS.accent} />
                        <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: '600', color: COLORS.dark }}>Date Range:</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: COLORS.gray }}>From:</span>
                        <Form.Control type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ width: 'clamp(120px, 25vw, 150px)', borderRadius: '8px', border: `1px solid ${COLORS.primary}40`, fontSize: 'clamp(11px, 2vw, 13px)' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: COLORS.gray }}>To:</span>
                        <Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ width: 'clamp(120px, 25vw, 150px)', borderRadius: '8px', border: `1px solid ${COLORS.primary}40`, fontSize: 'clamp(11px, 2vw, 13px)' }} />
                    </div>
                    <button onClick={() => {
                        if (matchData.length > 0) {
                            const firstDate = new Date(matchData[0].analysis_date);
                            const lastDate = new Date(matchData[matchData.length - 1].analysis_date);
                            setFromDate(firstDate.toISOString().split('T')[0]);
                            setToDate(lastDate.toISOString().split('T')[0]);
                        }
                    }} style={{ padding: '6px clamp(12px, 3vw, 16px)', background: `linear-gradient(135deg, ${COLORS.primary}20 0%, ${COLORS.secondary}20 100%)`, border: `1px solid ${COLORS.primary}40`, borderRadius: '8px', fontSize: 'clamp(11px, 2.5vw, 13px)', fontWeight: '500', color: COLORS.dark, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                        Reset Dates
                    </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: `${COLORS.primary}10`, borderRadius: '20px' }}>
                    <FeatherIcon icon="bar-chart-2" size={clampNumber(12, 14)} color={COLORS.accent} />
                    <span style={{ fontSize: 'clamp(10px, 2vw, 12px)', fontWeight: '500', color: COLORS.dark }}>{filteredMatchData.length} / {matchData.length} records</span>
                </div>
            </div>
        );
    };

    const toggleWearMetalsVisibility = useCallback((parameterKey) => {
        setHiddenWearMetals(prev => {
            const newSet = new Set(prev);
            if (newSet.has(parameterKey)) {
                newSet.delete(parameterKey);
            } else {
                newSet.add(parameterKey);
            }
            return newSet;
        });
    }, []);

    const toggleContaminantsVisibility = useCallback((parameterKey) => {
        setHiddenContaminants(prev => {
            const newSet = new Set(prev);
            if (newSet.has(parameterKey)) {
                newSet.delete(parameterKey);
            } else {
                newSet.add(parameterKey);
            }
            return newSet;
        });
    }, []);

    const toggleChemistryVisibility = useCallback((parameterKey) => {
        setHiddenChemistry(prev => {
            const newSet = new Set(prev);
            if (newSet.has(parameterKey)) {
                newSet.delete(parameterKey);
            } else {
                newSet.add(parameterKey);
            }
            return newSet;
        });
    }, []);

    const EnlargedChartModal = () => {
        if (!modalData) return null;
        return (
            <div onClick={() => setModalData(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'modalFadeIn 0.3s ease-out', padding: '20px' }}>
                <div onClick={(e) => e.stopPropagation()} style={{ background: 'linear-gradient(180deg, #ffffff 0%, #fff7db 100%)', borderRadius: '20px', width: '90%', maxWidth: '1200px', maxHeight: '90vh', overflow: 'auto', animation: 'modalFadeIn 0.3s ease-out', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: `3px solid #ffbb00` }}>
                    <div style={{ background: 'linear-gradient(135deg, #ffd698 0%, #ffb347 100%)', padding: 'clamp(12px, 3vw, 16px)', borderBottom: `1px solid ${COLORS.light}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: '5px', alignItems: 'center' }}>
                                <h3 style={{ fontSize: 'clamp(20px, 2.5vw, 12px)', margin: 0, color: '#252525', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', wordBreak: 'break-word' }}>{modalData.label}</h3>
                                <h3 style={{ margin: 0, color: COLORS.dark, fontSize: 'clamp(20px, 2.5vw, 12px)' }}>- Historical Trend</h3>
                            </div>
                            <p style={{ margin: '5px 0 0', color: COLORS.gray, fontSize: '14px' }}>Showing trend over {modalData.data.length} records</p>
                        </div>
                        <button onClick={() => setModalData(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'all 0.2s ease' }}>
                            <FeatherIcon icon="x" size={24} color={COLORS.dark} />
                        </button>
                    </div>
                    <div style={{ padding: '30px', height: '500px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={modalData.data}>
                                <CartesianGrid strokeDasharray="3 3" stroke={`${COLORS.gray}30`} />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" angle={-25} textAnchor="end" height={70} />
                                <YAxis tick={{ fontSize: 12 }} label={{ value: modalData.unit || 'ppm', angle: -90, position: 'insideLeft', fontSize: 12 }} />
                                <Tooltip formatter={(value) => [`${value} ${modalData.unit || ''}`, modalData.label]} labelFormatter={(label) => `Date: ${label}`} />
                                <Line type="monotone" dataKey="value" stroke={COLORS.accent} strokeWidth={3} dot={{ fill: COLORS.accent, r: 4 }} activeDot={{ r: 6 }} name={modalData.label} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const SamplingScheduleModal = () => {
        const [localSelectedSamplingDate, setLocalSelectedSamplingDate] = useState('');
        const [isLocalSaving, setIsLocalSaving] = useState(false);

        const handleLocalSave = async () => {
            if (!localSelectedSamplingDate) {
                showAlertMessage('error', 'Date Required', 'Please select a sampling schedule date before saving.');
                return;
            }

            const empInfo = JSON.parse(localStorage.getItem("user"));
            setIsLocalSaving(true);
            try {
                await axios.post(`${config.baseApi}/assetsAnalysis/update-resampling-schedule`, {
                    asset_analysis_id: asset_analysis_id,
                    resampling_schedule: localSelectedSamplingDate,
                    updated_by: empInfo.username
                });
                setResamplingSchedule(localSelectedSamplingDate);
                showAlertMessage('success', 'Success', `Sampling schedule date set to ${new Date(localSelectedSamplingDate).toLocaleDateString()}`);
                setShowSamplingModal(false);
                setLocalSelectedSamplingDate('');
            } catch (err) {
                console.error('Unable to save sampling schedule:', err);
                showAlertMessage('error', 'Unable to Save', 'Something went wrong, please try again.');
            } finally {
                setIsLocalSaving(false);
                setTimeout(() => {
                    window.location.reload();
                }, 2000)

            }
        };

        return (
            <Modal show={showSamplingModal} onHide={() => {
                setShowSamplingModal(false);
                setLocalSelectedSamplingDate('');
            }} centered size="md" backdrop="static" keyboard={false} contentClassName="border-0 bg-transparent">
                <div style={{ borderRadius: '20px', overflow: 'hidden' }}>
                    <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #ffd698 0%, #ffb347 100%)', borderBottom: `2px solid ${COLORS.primary}`, borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                        <Modal.Title style={{ color: '#383838', fontWeight: 'bold' }}>
                            <FeatherIcon icon="calendar" size={18} style={{ marginRight: '8px' }} />
                            Schedule Resampling Date
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '24px', background: 'white', borderRadius: '0px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FeatherIcon icon="alert-triangle" size={20} color={COLORS.warning} />
                                <span style={{ fontSize: '14px', color: '#92400e' }}>Critical analysis status is "Verify/Abnormal". Please schedule a resampling date.</span>
                            </div>
                            <label style={{ fontSize: '14px', fontWeight: '600', color: COLORS.dark, marginBottom: '8px', display: 'block' }}>Select Sampling Schedule Date</label>
                            <Form.Control
                                type="date"
                                value={localSelectedSamplingDate}
                                onChange={(e) => setLocalSelectedSamplingDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                style={{ borderRadius: '10px', border: `2px solid ${COLORS.primary}`, fontSize: '14px', padding: '10px' }}
                                autoFocus
                            />
                            <div style={{ fontSize: '12px', color: COLORS.gray, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FeatherIcon icon="info" size={12} />
                                <span>Please select a future date for resampling</span>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer style={{ borderTop: `1px solid ${COLORS.primary}40`, padding: '16px 24px', background: 'white', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
                        <button onClick={() => {
                            setShowSamplingModal(false);
                            setLocalSelectedSamplingDate('');
                        }} style={{ background: 'linear-gradient(45deg, #ea6f6f, #f92f2f, #e33939)', border: 'none', borderRadius: '12px', padding: '12px 48px', color: 'white', fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Cancel
                        </button>
                        <button onClick={handleLocalSave} disabled={isLocalSaving} style={{ background: 'linear-gradient(45deg, #EAB56F, #F9982F, #E37239)', border: 'none', borderRadius: '12px', padding: '12px 48px', color: 'white', fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isLocalSaving ? <><Spinner animation="border" size="sm" /> Saving...</> : <><FeatherIcon icon="save" size={18} /> Save Schedule</>}
                        </button>
                    </Modal.Footer>
                </div>
            </Modal>
        );
    };

    const CriticalityEditModal = () => {
        const [selectedStatus, setSelectedStatus] = useState(criticalityStatus);
        const [isSaving, setIsSaving] = useState(false);

        const handleSave = async () => {
            setIsSaving(true);
            await handleCriticalitySave(selectedStatus);
            setIsSaving(false);
        };

        return (
            <Modal show={showCriticalityModal} onHide={() => setShowCriticalityModal(false)} centered size="md" backdrop="static" keyboard={false} contentClassName="border-0 bg-transparent">
                <div style={{ borderRadius: '20px', overflow: 'hidden' }}>
                    <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #ffd698 0%, #ffb347 100%)', borderBottom: `2px solid ${COLORS.primary}`, borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                        <Modal.Title style={{ color: '#383838', fontWeight: 'bold' }}>
                            <FeatherIcon icon="edit-2" size={18} style={{ marginRight: '8px' }} />
                            Edit Criticality Status
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '24px', background: 'white', borderRadius: '0px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ fontSize: '14px', fontWeight: '600', color: COLORS.dark, marginBottom: '8px', display: 'block' }}>Select Criticality Status</label>
                            <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} style={{ borderRadius: '10px', border: `2px solid ${COLORS.primary}`, fontSize: '14px', cursor: 'pointer', padding: '10px' }} autoFocus>
                                <option value="Select">Select Status</option>
                                <option value="Severe">Severe</option>
                                <option value="Verify/Abnormal">Verify/Abnormal</option>
                                <option value="Good/Ok">Good/Ok</option>
                            </Form.Select>
                            <div style={{ fontSize: '12px', color: COLORS.gray, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FeatherIcon icon="info" size={12} />
                                <span>Current status: <strong>{criticalityStatus || 'Not Set'}</strong></span>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer style={{ borderTop: `1px solid ${COLORS.primary}40`, padding: '16px 24px', background: 'white', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
                        <button onClick={() => setShowCriticalityModal(false)} style={{ background: 'linear-gradient(45deg, #ea6f6f, #f92f2f, #e33939)', border: 'none', borderRadius: '12px', padding: '12px 48px', color: 'white', fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>Cancel</button>
                        <button onClick={handleSave} disabled={isSaving} style={{ background: 'linear-gradient(45deg, #EAB56F, #F9982F, #E37239)', border: 'none', borderRadius: '12px', padding: '12px 48px', color: 'white', fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isSaving ? <><Spinner animation="border" size="sm" /> Saving...</> : <>Save Changes</>}
                        </button>
                    </Modal.Footer>
                </div>
            </Modal>
        );
    };

    const SevereActionModal = React.memo(() => {
        const [severeSelectedAction, setSevereSelectedAction] = useState('');
        const [uploadedFiles, setUploadedFiles] = useState([]);
        const [isSevereSaving, setIsSevereSaving] = useState(false);
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);
        const [customAction, setCustomAction] = useState('');
        const [customActions, setCustomActions] = useState([]);
        const dropdownRef = useRef(null);
        const fileInputRef = useRef(null);
        const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

        useEffect(() => {
            const handleResize = () => {
                setIsMobile(window.innerWidth <= 768);
            };
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }, []);

        useEffect(() => {
            const handleClickOutside = (event) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setIsDropdownOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        useEffect(() => {
            const savedCustomActions = localStorage.getItem('severeActionCustomActions');
            if (savedCustomActions) {
                setCustomActions(JSON.parse(savedCustomActions));
            }
        }, []);

        const saveCustomActions = useCallback((actions) => {
            localStorage.setItem('severeActionCustomActions', JSON.stringify(actions));
            setCustomActions(actions);
        }, []);

        const handleActionToggle = useCallback((actionValue) => {
            setSevereSelectedAction(prev => {
                const selectedArray = prev ? prev.split(',') : [];
                if (selectedArray.includes(actionValue)) {
                    const newArray = selectedArray.filter(item => item !== actionValue);
                    return newArray.join(',');
                } else {
                    const newArray = [...selectedArray, actionValue];
                    return newArray.join(',');
                }
            });
        }, []);

        const handleAddCustomAction = useCallback(() => {
            if (customAction.trim() === '') {
                showAlertMessage('error', 'Empty Field', 'Please enter a custom action');
                return;
            }

            const actionId = `${customAction}`;
            const newAction = {
                value: actionId,
                label: customAction.trim(),
                isCustom: true
            };

            const updatedCustomActions = [...customActions, newAction];
            saveCustomActions(updatedCustomActions);

            setSevereSelectedAction(prev => {
                const selectedArray = prev ? prev.split(',') : [];
                if (!selectedArray.includes(actionId)) {
                    return [...selectedArray, actionId].join(',');
                }
                return prev;
            });

            setCustomAction('');


        }, [customAction, customActions, saveCustomActions]);

        const handleDeleteCustomAction = useCallback((actionValue) => {
            setSevereSelectedAction(prev => {
                const selectedArray = prev ? prev.split(',') : [];
                const newSelectedArray = selectedArray.filter(item => item !== actionValue);
                return newSelectedArray.join(',');
            });

            const updatedCustomActions = customActions.filter(action => action.value !== actionValue);
            saveCustomActions(updatedCustomActions);
        }, [customActions, saveCustomActions]);

        // Handle file upload (images & videos)
        const handleFileUpload = useCallback((event) => {
            const files = Array.from(event.target.files);
            const newFiles = [];

            files.forEach(file => {
                const isImage = file.type.startsWith('image/');
                const isVideo = file.type.startsWith('video/');

                if (isImage || isVideo) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        newFiles.push({
                            id: Date.now() + Math.random(),
                            dataUrl: reader.result,
                            file: file,
                            type: isImage ? 'image' : 'video',
                            fileName: file.name
                        });
                        if (newFiles.length === files.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/')).length) {
                            setUploadedFiles(prev => [...prev, ...newFiles]);
                        }
                    };
                    reader.readAsDataURL(file);
                } else {
                    showAlertMessage('error', 'Invalid File', `${file.name} is not an image or video file`);
                }
            });

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }, [showAlertMessage]);

        // Remove file
        const handleRemoveFile = useCallback((fileId) => {
            setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
        }, []);

        const allActionOptions = useMemo(() => [...actionOptions, ...customActions], [customActions]);

        const getSelectedLabels = useCallback(() => {
            const selectedArray = severeSelectedAction ? severeSelectedAction.split(',') : [];
            if (selectedArray.length === 0) return 'Select actions...';
            if (selectedArray.length === 1) {
                const selected = allActionOptions.find(opt => opt.value === selectedArray[0]);
                return selected ? selected.label : 'Select actions...';
            }
            return `${selectedArray.length} actions selected`;
        }, [severeSelectedAction, allActionOptions]);

        const getSelectedCount = useCallback(() => {
            return severeSelectedAction ? severeSelectedAction.split(',').filter(a => a).length : 0;
        }, [severeSelectedAction]);

        const isActionSelected = useCallback((actionValue) => {
            const selectedArray = severeSelectedAction ? severeSelectedAction.split(',') : [];
            return selectedArray.includes(actionValue);
        }, [severeSelectedAction]);

        // const handleSevereSave = useCallback(async () => {
        //     if (!severeSelectedAction || severeSelectedAction === '') {
        //         showAlertMessage('error', 'Empty Field', 'Please select at least one action before saving.');
        //         return;
        //     }

        //     const empInfo = JSON.parse(localStorage.getItem("user"));
        //     setIsSevereSaving(true);

        //     try {
        //         // Prepare file data for storage
        //         const fileData = uploadedFiles.map(file => ({
        //             fileName: file.file.name,
        //             fileType: file.type,
        //             fileSize: file.file.size,
        //             dataUrl: file.dataUrl // Include base64 data for storage
        //         }));

        //         const fileNamesString = uploadedFiles.map(file => file.file.name).join(',');
        //         console.log({
        //             asset_analysis_id: asset_analysis_id,
        //             severe_action: severeSelectedAction,
        //             documentation_files: fileNamesString,
        //             uploaded_files: uploadedFiles.length,
        //             updated_by: empInfo.user_name
        //         });

        //         // Uncomment for actual API call
        //         await axios.post(`${config.baseApi}/assetsAnalysis/update-severe-action`, {
        //             asset_analysis_id: asset_analysis_id,
        //             severe_action: severeSelectedAction,
        //             documentation: fileNamesString,
        //             updated_by: empInfo.user_name
        //         });

        //         showAlertMessage('success', 'Success', 'Severe actions and documentation saved successfully');
        //         setShowSevereModal(false);
        //         setSevereSelectedAction('');
        //         setUploadedFiles([]);
        //         setCustomAction('');
        //         setIsDropdownOpen(false);

        //     } catch (err) {
        //         console.error('Unable to save severe action:', err);
        //         showAlertMessage('error', 'Unable to Save', 'Something went wrong, please try again.');
        //     } finally {
        //         setIsSevereSaving(false);
        //     }
        // }, [severeSelectedAction, uploadedFiles, asset_analysis_id, showAlertMessage]);

        // Get file icon based on type

        const handleSevereSave = useCallback(async () => {
            if (!severeSelectedAction || severeSelectedAction === '') {
                showAlertMessage('error', 'Empty Field', 'Please select at least one action before saving.');
                return;
            }

            const empInfo = JSON.parse(localStorage.getItem("user"));
            setIsSevereSaving(true);

            try {
                // Create FormData to send files
                const formData = new FormData();
                formData.append('asset_analysis_id', asset_analysis_id);
                formData.append('severe_action', severeSelectedAction);
                formData.append('updated_by', empInfo.user_name);

                // Append all files
                uploadedFiles.forEach((file, index) => {
                    formData.append('documentation', file.file);
                });

                // Send as multipart/form-data
                await axios.post(`${config.baseApi}/assetsAnalysis/update-severe-action`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                showAlertMessage('success', 'Success', 'Severe actions and documentation saved successfully');
                setShowSevereModal(false);
                setSevereSelectedAction('');
                setUploadedFiles([]);
                setCustomAction('');
                setIsDropdownOpen(false);

            } catch (err) {
                console.error('Unable to save severe action:', err);
                showAlertMessage('error', 'Unable to Save', 'Something went wrong, please try again.');
            } finally {
                setIsSevereSaving(false);
                setTimeout(() => {
                    window.location.reload();
                }, 2000)

            }
        }, [severeSelectedAction, uploadedFiles, asset_analysis_id, showAlertMessage]);

        const getFileIcon = (fileType) => {
            if (fileType === 'image') return 'image';
            return 'video';
        };

        return (
            <Modal
                show={showSevereModal}
                onHide={() => {
                    if (!isSevereSaving) {
                        setShowSevereModal(false);
                        setSevereSelectedAction('');
                        setUploadedFiles([]);
                        setCustomAction('');
                        setIsDropdownOpen(false);
                    }
                }}
                centered
                size={isMobile ? "md" : "lg"}
                backdrop="static"
                keyboard={false}
                contentClassName="border-0 bg-transparent"
                fullscreen={isMobile ? "sm-down" : false}
            >
                <div style={{
                    borderRadius: isMobile ? '0px' : '20px',
                    overflow: 'hidden',
                    height: isMobile ? '100%' : 'auto',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <Modal.Header
                        closeButton={!isSevereSaving}
                        style={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            borderBottom: `2px solid ${COLORS.danger}`,
                            borderTopLeftRadius: isMobile ? '0px' : '20px',
                            borderTopRightRadius: isMobile ? '0px' : '20px',
                            flexShrink: 0
                        }}
                    >
                        <Modal.Title style={{ color: 'white', fontWeight: 'bold', fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
                            <FeatherIcon icon="alert-triangle" size={isMobile ? 18 : 20} style={{ marginRight: '8px' }} />
                            Severe Criticality - Actions Taken & Documentation
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body style={{
                        padding: isMobile ? '16px' : '24px',
                        background: 'white',
                        borderRadius: '0px',
                        overflowY: 'auto',
                        flex: 1
                    }}>
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{
                                background: '#fef2f2',
                                padding: isMobile ? '10px 12px' : '12px 16px',
                                borderRadius: '12px',
                                marginBottom: '20px',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px',
                                border: `1px solid ${COLORS.danger}30`
                            }}>
                                <FeatherIcon icon="alert-circle" size={isMobile ? 20 : 24} color={COLORS.danger} style={{ flexShrink: 0 }} />
                                <span style={{ fontSize: isMobile ? '12px' : '14px', color: '#991b1b', fontWeight: '500', lineHeight: '1.4' }}>
                                    This asset has been marked as SEVERE. Please select the required actions and upload documentation.
                                </span>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: COLORS.dark, marginBottom: '8px', display: 'block' }}>
                                    <FeatherIcon icon="check-square" size={isMobile ? 12 : 14} color={'#ffa600'} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                    Actions Taken <span style={{ color: COLORS.danger }}>*</span>
                                </label>

                                <div ref={dropdownRef} style={{ position: 'relative' }}>
                                    <div
                                        onClick={() => !isSevereSaving && setIsDropdownOpen(!isDropdownOpen)}
                                        style={{
                                            borderRadius: '10px',
                                            border: '2px solid #E2E8F0',
                                            fontSize: isMobile ? '13px' : '14px',
                                            cursor: isSevereSaving ? 'not-allowed' : 'pointer',
                                            padding: isMobile ? '10px 12px' : '10px',
                                            transition: 'all 0.2s ease',
                                            background: 'white',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            opacity: isSevereSaving ? 0.6 : 1,
                                            minHeight: '44px'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ff7b00'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                                    >
                                        <span style={{ color: getSelectedCount() > 0 ? COLORS.dark : COLORS.gray }}>
                                            {getSelectedLabels()}
                                        </span>
                                        <FeatherIcon
                                            icon={isDropdownOpen ? "chevron-up" : "chevron-down"}
                                            size={18}
                                            color={COLORS.gray}
                                            style={{ flexShrink: 0 }}
                                        />
                                    </div>

                                    {isDropdownOpen && !isSevereSaving && (
                                        <div style={{
                                            position: isMobile ? 'fixed' : 'absolute',
                                            top: isMobile ? '50%' : '100%',
                                            left: isMobile ? '50%' : 0,
                                            right: isMobile ? '50%' : 0,
                                            transform: isMobile ? 'translate(-50%, -50%)' : 'none',
                                            marginTop: isMobile ? 0 : '4px',
                                            width: isMobile ? 'calc(100% - 32px)' : 'auto',
                                            maxWidth: isMobile ? '500px' : 'none',
                                            maxHeight: isMobile ? '80vh' : '400px',
                                            background: 'white',
                                            borderRadius: isMobile ? '16px' : '10px',
                                            border: `2px solid ${COLORS.primary}`,
                                            boxShadow: '0 4px 20px rgba(255, 153, 0, 0.25)',
                                            zIndex: 1050,
                                            overflowY: 'auto',
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}>
                                            <div style={{
                                                padding: isMobile ? '12px' : '12px',
                                                borderBottom: `2px solid ${COLORS.primary}`,
                                                background: `${COLORS.primary}05`,
                                                position: 'sticky',
                                                top: 0,
                                                backgroundColor: 'white',
                                                zIndex: 1
                                            }}>
                                                <div style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: '600', color: COLORS.dark, marginBottom: '8px' }}>
                                                    Add Custom Action:
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    <input
                                                        type="text"
                                                        value={customAction}
                                                        onChange={(e) => setCustomAction(e.target.value)}
                                                        placeholder="Type custom action..."
                                                        style={{
                                                            flex: 1,
                                                            minWidth: isMobile ? '150px' : 'auto',
                                                            padding: isMobile ? '10px 12px' : '8px 12px',
                                                            borderRadius: '8px',
                                                            border: `2px solid #E2E8F0`,
                                                            fontSize: isMobile ? '14px' : '14px',
                                                            outline: 'none'
                                                        }}
                                                        onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                        onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                                        onKeyPress={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleAddCustomAction();
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={handleAddCustomAction}
                                                        style={{
                                                            padding: isMobile ? '10px 16px' : '8px 16px',
                                                            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            color: 'white',
                                                            fontSize: isMobile ? '13px' : '14px',
                                                            fontWeight: '500',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        <FeatherIcon icon="plus" size={14} />
                                                        Add
                                                    </button>
                                                </div>
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                {allActionOptions.map(option => (
                                                    <div
                                                        key={option.value}
                                                        style={{
                                                            padding: isMobile ? '12px' : '10px 12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s ease',
                                                            background: isActionSelected(option.value) ? `${COLORS.success}10` : 'transparent',
                                                            borderBottom: `1px solid ${COLORS.primary}20`,
                                                            position: 'relative',
                                                            minHeight: '48px'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = isActionSelected(option.value) ? `${COLORS.success}20` : '#f5f5f5';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = isActionSelected(option.value) ? `${COLORS.success}10` : 'transparent';
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isActionSelected(option.value)}
                                                            onChange={() => handleActionToggle(option.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            style={{
                                                                width: isMobile ? '20px' : '18px',
                                                                height: isMobile ? '20px' : '18px',
                                                                cursor: 'pointer',
                                                                accentColor: '#ffbb00',
                                                                flexShrink: 0
                                                            }}
                                                        />
                                                        <label style={{
                                                            fontSize: isMobile ? '13px' : '14px',
                                                            color: COLORS.dark,
                                                            cursor: 'pointer',
                                                            margin: 0,
                                                            flex: 1,
                                                            lineHeight: '1.4',
                                                            wordBreak: 'break-word'
                                                        }}>
                                                            {option.label}
                                                        </label>
                                                        {option.isCustom && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteCustomAction(option.value);
                                                                }}
                                                                style={{
                                                                    background: 'none',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    padding: '8px',
                                                                    borderRadius: '4px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    color: COLORS.danger,
                                                                    flexShrink: 0
                                                                }}
                                                            >
                                                                <FeatherIcon icon="x" size={isMobile ? 16 : 14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {isMobile && (
                                                <div style={{
                                                    padding: '12px',
                                                    borderTop: `1px solid ${COLORS.primary}20`,
                                                    position: 'sticky',
                                                    bottom: 0,
                                                    backgroundColor: 'white'
                                                }}>
                                                    <button
                                                        onClick={() => setIsDropdownOpen(false)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '12px',
                                                            background: COLORS.primary,
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            color: 'white',
                                                            fontWeight: '600',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {getSelectedCount() > 0 && (
                                    <div style={{
                                        marginTop: '8px',
                                        fontSize: isMobile ? '11px' : '12px',
                                        color: COLORS.success,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        flexWrap: 'wrap'
                                    }}>
                                        <FeatherIcon icon="check-circle" size={isMobile ? 10 : 12} />
                                        <span>{getSelectedCount()} action(s) selected</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                {/* File Upload Section - Documentation */}
                                <div>
                                    <label style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '600', color: COLORS.dark, marginBottom: '8px', display: 'block' }}>
                                        <FeatherIcon icon="folder" size={isMobile ? 12 : 14} color={'#ffa600'} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                        Documentation (Images & Videos)
                                    </label>

                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isSevereSaving}
                                        style={{
                                            background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)',
                                            border: `2px dashed ${COLORS.primary}`,
                                            borderRadius: '10px',
                                            padding: isMobile ? '10px 16px' : '12px 20px',
                                            cursor: isSevereSaving ? 'not-allowed' : 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: isMobile ? '13px' : '14px',
                                            fontWeight: '500',
                                            color: COLORS.dark,
                                            transition: 'all 0.2s ease',
                                            opacity: isSevereSaving ? 0.6 : 1,
                                            width: '100%',
                                            justifyContent: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSevereSaving) {
                                                e.currentTarget.style.background = 'linear-gradient(135deg, #e8e8e8 0%, #d8d8d8 100%)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSevereSaving) {
                                                e.currentTarget.style.background = 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)';
                                            }
                                        }}
                                    >
                                        <FeatherIcon icon="upload-cloud" size={18} color={COLORS.accent} />
                                        Upload Documentation (Images & Videos)
                                    </button>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*,video/*"
                                        multiple
                                        onChange={handleFileUpload}
                                        style={{ display: 'none' }}
                                        disabled={isSevereSaving}
                                    />

                                    {uploadedFiles.length > 0 && (
                                        <div style={{
                                            marginTop: '16px',
                                            display: 'grid',
                                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))',
                                            gap: '12px'
                                        }}>
                                            {uploadedFiles.map((file) => (
                                                <div
                                                    key={file.id}
                                                    style={{
                                                        position: 'relative',
                                                        borderRadius: '10px',
                                                        overflow: 'hidden',
                                                        border: `2px solid ${COLORS.primary}40`,
                                                        background: '#f9f9f9'
                                                    }}
                                                >
                                                    {file.type === 'image' ? (
                                                        <img
                                                            src={file.dataUrl}
                                                            alt={file.fileName}
                                                            style={{
                                                                width: '100%',
                                                                height: '150px',
                                                                objectFit: 'cover',
                                                                display: 'block'
                                                            }}
                                                        />
                                                    ) : (
                                                        <video
                                                            src={file.dataUrl}
                                                            style={{
                                                                width: '100%',
                                                                height: '150px',
                                                                objectFit: 'cover',
                                                                display: 'block'
                                                            }}
                                                            controls
                                                            preload="metadata"
                                                        >
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    )}
                                                    <button
                                                        onClick={() => handleRemoveFile(file.id)}
                                                        disabled={isSevereSaving}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '8px',
                                                            right: '8px',
                                                            background: 'rgba(239, 68, 68, 0.9)',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            width: '32px',
                                                            height: '32px',
                                                            cursor: isSevereSaving ? 'not-allowed' : 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            transition: 'all 0.2s ease',
                                                            color: 'white'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 1)';
                                                            e.currentTarget.style.transform = 'scale(1.05)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
                                                            e.currentTarget.style.transform = 'scale(1)';
                                                        }}
                                                    >
                                                        <FeatherIcon icon="x" size={16} />
                                                    </button>
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '8px',
                                                        left: '8px',
                                                        background: 'rgba(0, 0, 0, 0.7)',
                                                        borderRadius: '6px',
                                                        padding: '4px 8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                    }}>
                                                        <FeatherIcon icon={getFileIcon(file.type)} size={12} color="white" />
                                                        <span style={{ color: 'white', fontSize: '10px', fontWeight: '500' }}>
                                                            {file.type === 'image' ? 'Image' : 'Video'}
                                                        </span>
                                                    </div>
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        left: 0,
                                                        right: 0,
                                                        background: 'rgba(0, 0, 0, 0.6)',
                                                        color: 'white',
                                                        fontSize: '10px',
                                                        padding: '4px 8px',
                                                        textAlign: 'center',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {file.fileName}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    fontSize: isMobile ? '11px' : '12px',
                                    color: COLORS.gray,
                                    marginTop: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    flexWrap: 'wrap'
                                }}>
                                    <FeatherIcon icon="info" size={isMobile ? 10 : 12} />
                                    <span>Upload supporting documentation including images (JPG, PNG, GIF) and videos (MP4, MOV, AVI, etc.). This is optional but recommended.</span>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>

                    <Modal.Footer style={{
                        borderTop: `1px solid ${COLORS.danger}20`,
                        padding: isMobile ? '12px 16px' : '16px 24px',
                        background: 'white',
                        borderBottomLeftRadius: isMobile ? '0px' : '20px',
                        borderBottomRightRadius: isMobile ? '0px' : '20px',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? '10px' : '0px',
                        flexShrink: 0
                    }}>
                        <button
                            onClick={() => {
                                if (!isSevereSaving) {
                                    setShowSevereModal(false);
                                    setSevereSelectedAction('');
                                    setUploadedFiles([]);
                                    setCustomAction('');
                                    setIsDropdownOpen(false);
                                }
                            }}
                            disabled={isSevereSaving}
                            style={{
                                background: 'linear-gradient(45deg, #cf4e4e, #cf3737)',
                                border: 'none',
                                borderRadius: '12px',
                                padding: isMobile ? '10px 20px' : '12px 32px',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: isMobile ? '0.9rem' : '0.95rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                opacity: isSevereSaving ? 0.6 : 1,
                                cursor: isSevereSaving ? 'not-allowed' : 'pointer',
                                width: isMobile ? '100%' : 'auto'
                            }}
                        >
                            <FeatherIcon icon="x" size={18} />
                            Cancel
                        </button>
                        <button
                            onClick={handleSevereSave}
                            disabled={isSevereSaving || getSelectedCount() === 0}
                            style={{
                                background: 'linear-gradient(135deg, #EAB56F, #F9982F)',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '12px 32px',
                                color: 'white',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                opacity: (isSevereSaving || getSelectedCount() === 0) ? 0.6 : 1,
                                cursor: (isSevereSaving || getSelectedCount() === 0) ? 'not-allowed' : 'pointer',
                                width: isMobile ? '100%' : 'auto'
                            }} onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(233, 150, 40, 0.4)'; }}
                            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(233, 150, 40, 0.3)'; }}
                        >
                            {isSevereSaving ? (
                                <><Spinner animation="border" size="sm" /> Saving...</>
                            ) : (
                                <><FeatherIcon icon="save" size={18} /> Save Actions & Documentation</>
                            )}
                        </button>
                    </Modal.Footer>
                </div>
            </Modal>
        );
    });

    // Documentation Viewer Component
    const DocumentationViewer = () => {
        const [imageLoadErrors, setImageLoadErrors] = useState({});
        const [videoLoadErrors, setVideoLoadErrors] = useState({});
        const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'images', 'videos'
        const [searchTerm, setSearchTerm] = useState('');
        const [sortBy, setSortBy] = useState('name'); // 'name', 'date', 'type'
        const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'

        const getFileUrl = (filename) => {
            let cleanFilename = filename.trim();
            if (cleanFilename.includes('\\') || cleanFilename.includes('/')) {
                cleanFilename = cleanFilename.split('\\').pop().split('/').pop();
            }
            return `${config.baseApi}/documentation/${encodeURIComponent(cleanFilename)}`;
        };

        const isImage = (filename) => {
            const ext = filename.split('.').pop().toLowerCase();
            return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext);
        };

        const isVideo = (filename) => {
            const ext = filename.split('.').pop().toLowerCase();
            return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext);
        };

        const getFileIcon = (filename) => {
            if (isImage(filename)) return 'image';
            if (isVideo(filename)) return 'video';
            return 'file';
        };

        const getFileSize = (filename) => {
            // This would need actual file size from API, returning placeholder
            const sizes = ['1.2 MB', '2.5 MB', '0.8 MB', '3.1 MB', '1.5 MB'];

            return sizes[Math.floor(Math.random() * sizes.length)];
        };

        const handleImageError = (filename) => {
            setImageLoadErrors(prev => ({ ...prev, [filename]: true }));
        };

        const handleVideoError = (filename) => {
            setVideoLoadErrors(prev => ({ ...prev, [filename]: true }));
        };

        // Filter and sort files
        const getFilteredFiles = () => {
            let files = [...documentationFiles];

            // Filter by category
            if (selectedCategory === 'images') {
                files = files.filter(f => isImage(f));
            } else if (selectedCategory === 'videos') {
                files = files.filter(f => isVideo(f));
            }

            // Filter by search term
            if (searchTerm) {
                files = files.filter(f =>
                    f.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            // Sort files
            files.sort((a, b) => {
                if (sortBy === 'name') {
                    return a.localeCompare(b);
                } else if (sortBy === 'type') {
                    const typeA = isImage(a) ? 'image' : (isVideo(a) ? 'video' : 'other');
                    const typeB = isImage(b) ? 'image' : (isVideo(b) ? 'video' : 'other');
                    return typeA.localeCompare(typeB);
                }
                return 0;
            });

            return files;
        };

        const filteredFiles = getFilteredFiles();
        const imageCount = documentationFiles.filter(f => isImage(f)).length;
        const videoCount = documentationFiles.filter(f => isVideo(f)).length;

        if (documentationFiles.length === 0) return null;

        return (
            <>
                <div
                    className="modern-card"
                    style={{
                        marginBottom: '24px',
                        background: 'linear-gradient(135deg, #ffffff 0%, #fef9f0 100%)',
                        borderRadius: '20px',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(245,158,11,0.15)'
                    }}
                >
                    {/* Animated gradient border */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: 'linear-gradient(90deg, #f59e0b 0%, #f97316 50%, #fbbf24 100%)',
                        }}
                    />

                    {/* Header Section */}
                    <div style={{ padding: '24px 24px 0 24px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: '16px',
                            marginBottom: '20px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 6px 14px rgba(245,158,11,0.25)'
                                }}>
                                    <FeatherIcon icon="folder" size={22} color="white" />
                                </div>
                                <div>
                                    <h4
                                        style={{
                                            margin: 0,
                                            fontWeight: '700',
                                            color: '#2d1f0f',
                                            fontSize: '20px',
                                            letterSpacing: '-0.3px'
                                        }}
                                    >
                                        Documentation
                                    </h4>
                                    <p style={{
                                        margin: '4px 0 0',
                                        fontSize: '13px',
                                        color: '#8b7355',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <span>
                                            <FeatherIcon icon="image" size={12} style={{ marginRight: '4px' }} />
                                            {imageCount} Images
                                        </span>
                                        <span>
                                            <FeatherIcon icon="video" size={12} style={{ marginRight: '4px' }} />
                                            {videoCount} Videos
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* View Toggle */}
                            <div style={{ display: 'flex', gap: '8px', background: '#f5f0e8', padding: '4px', borderRadius: '12px' }}>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    style={{
                                        padding: '6px 12px',
                                        background: viewMode === 'grid' ? 'white' : 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: viewMode === 'grid' ? '#f59e0b' : '#8b7355',
                                        boxShadow: viewMode === 'grid' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                                    }}
                                >
                                    <FeatherIcon icon="grid" size={14} />
                                    Grid
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    style={{
                                        padding: '6px 12px',
                                        background: viewMode === 'list' ? 'white' : 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: viewMode === 'list' ? '#f59e0b' : '#8b7355',
                                        boxShadow: viewMode === 'list' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                                    }}
                                >
                                    <FeatherIcon icon="list" size={14} />
                                    List
                                </button>
                            </div>
                        </div>

                        {/* Filters Bar */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '12px',
                            padding: '16px 0',
                            borderTop: '1px solid rgba(245,158,11,0.1)',
                            borderBottom: '1px solid rgba(245,158,11,0.1)'
                        }}>
                            {/* Category Filters */}
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    style={{
                                        padding: '6px 14px',
                                        background: selectedCategory === 'all' ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' : 'white',
                                        border: selectedCategory === 'all' ? 'none' : '1px solid #e8dcc8',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: selectedCategory === 'all' ? 'white' : '#8b7355',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    All Files ({documentationFiles.length})
                                </button>
                                <button
                                    onClick={() => setSelectedCategory('images')}
                                    style={{
                                        padding: '6px 14px',
                                        background: selectedCategory === 'images' ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' : 'white',
                                        border: selectedCategory === 'images' ? 'none' : '1px solid #e8dcc8',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: selectedCategory === 'images' ? 'white' : '#8b7355'
                                    }}
                                >
                                    <FeatherIcon icon="image" size={12} style={{ marginRight: '4px' }} />
                                    Images ({imageCount})
                                </button>
                                <button
                                    onClick={() => setSelectedCategory('videos')}
                                    style={{
                                        padding: '6px 14px',
                                        background: selectedCategory === 'videos' ? 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' : 'white',
                                        border: selectedCategory === 'videos' ? 'none' : '1px solid #e8dcc8',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: selectedCategory === 'videos' ? 'white' : '#8b7355'
                                    }}
                                >
                                    <FeatherIcon icon="video" size={12} style={{ marginRight: '4px' }} />
                                    Videos ({videoCount})
                                </button>
                            </div>


                        </div>
                    </div>

                    {/* Files Grid/List */}
                    <div style={{ padding: '24px' }}>
                        {filteredFiles.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                color: '#c4b5a0'
                            }}>
                                <FeatherIcon icon="folder" size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                <p>No files match your filters</p>
                                <button
                                    onClick={() => {
                                        setSelectedCategory('all');
                                        setSearchTerm('');
                                    }}
                                    style={{
                                        marginTop: '12px',
                                        padding: '6px 16px',
                                        background: '#f5f0e8',
                                        border: 'none',
                                        borderRadius: '20px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        color: '#8b7355'
                                    }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '20px'
                            }}>
                                {filteredFiles.map((filename, index) => {
                                    const fileUrl = getFileUrl(filename);
                                    const isImageFile = isImage(filename);
                                    const isVideoFile = isVideo(filename);
                                    const hasImageError = imageLoadErrors[filename];
                                    const hasVideoError = videoLoadErrors[filename];

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => {
                                                if (!hasImageError && !hasVideoError) {
                                                    setSelectedDocFile({
                                                        filename,
                                                        type: isImageFile ? 'image' : isVideoFile ? 'video' : 'other',
                                                        url: fileUrl
                                                    });
                                                    setShowDocumentationModal(true);
                                                }
                                            }}
                                            style={{
                                                cursor: (!hasImageError && !hasVideoError) ? 'pointer' : 'default',
                                                borderRadius: '16px',
                                                overflow: 'hidden',
                                                background: 'white',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                border: '1px solid #f0e4d0',
                                                position: 'relative'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!hasImageError && !hasVideoError) {
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
                                                    e.currentTarget.style.borderColor = '#f59e0b';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                                                e.currentTarget.style.borderColor = '#f0e4d0';
                                            }}
                                        >
                                            {/* File Type Badge */}
                                            <div style={{
                                                position: 'absolute',
                                                top: '12px',
                                                right: '12px',
                                                zIndex: 2,
                                                background: 'rgba(0,0,0,0.7)',
                                                backdropFilter: 'blur(8px)',
                                                borderRadius: '20px',
                                                padding: '4px 10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                color: 'white'
                                            }}>
                                                <FeatherIcon icon={getFileIcon(filename)} size={12} />
                                                {isImageFile ? 'IMAGE' : isVideoFile ? 'VIDEO' : 'FILE'}
                                            </div>

                                            {/* Preview Area */}
                                            <div style={{ position: 'relative', background: '#faf8f4', minHeight: '200px' }}>
                                                {isImageFile && !hasImageError && (
                                                    <img
                                                        src={fileUrl}
                                                        alt={filename}
                                                        style={{
                                                            width: '100%',
                                                            height: '200px',
                                                            objectFit: 'cover',
                                                            display: 'block'
                                                        }}
                                                        onError={() => handleImageError(filename)}
                                                    />
                                                )}
                                                {isImageFile && hasImageError && (
                                                    <div style={{
                                                        width: '100%',
                                                        height: '200px',
                                                        background: 'linear-gradient(135deg, #f5f0e8 0%, #ede5d8 100%)',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '12px'
                                                    }}>
                                                        <FeatherIcon icon="alert-circle" size={48} color="#c4b5a0" />
                                                        <span style={{ color: '#8b7355', fontSize: '13px' }}>Preview not available</span>
                                                    </div>
                                                )}
                                                {isVideoFile && !hasVideoError && (
                                                    <div style={{
                                                        width: '100%',
                                                        height: '200px',
                                                        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '12px',
                                                        cursor: 'pointer'
                                                    }}>
                                                        <div style={{
                                                            width: '60px',
                                                            height: '60px',
                                                            background: 'rgba(245,158,11,0.9)',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            transition: 'transform 0.2s ease'
                                                        }}>
                                                            <FeatherIcon icon="play" size={28} color="white" style={{ marginLeft: '4px' }} />
                                                        </div>
                                                        <span style={{ color: 'white', fontSize: '12px', fontWeight: '500' }}>Click to play video</span>
                                                    </div>
                                                )}
                                                {isVideoFile && hasVideoError && (
                                                    <div style={{
                                                        width: '100%',
                                                        height: '200px',
                                                        background: '#f5f0e8',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '12px'
                                                    }}>
                                                        <FeatherIcon icon="alert-circle" size={48} color="#c4b5a0" />
                                                        <span style={{ color: '#8b7355', fontSize: '13px' }}>Video failed to load</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* File Info */}
                                            <div style={{ padding: '14px' }}>
                                                <div style={{
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: '#2d1f0f',
                                                    marginBottom: '8px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {filename.length > 40 ? filename.substring(0, 40) + '...' : filename}
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    fontSize: '11px',
                                                    color: '#a89880'
                                                }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <FeatherIcon icon="maximize-2" size={10} />
                                                        Click to view full size
                                                    </span>
                                                    <span>{getFileSize(filename)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            // List View
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {filteredFiles.map((filename, index) => {
                                    const fileUrl = getFileUrl(filename);
                                    const isImageFile = isImage(filename);
                                    const isVideoFile = isVideo(filename);
                                    const hasImageError = imageLoadErrors[filename];
                                    const hasVideoError = videoLoadErrors[filename];

                                    return (
                                        <div
                                            key={index}
                                            onClick={() => {
                                                if (!hasImageError && !hasVideoError) {
                                                    setSelectedDocFile({
                                                        filename,
                                                        type: isImageFile ? 'image' : isVideoFile ? 'video' : 'other',
                                                        url: fileUrl
                                                    });
                                                    setShowDocumentationModal(true);
                                                }
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px',
                                                padding: '12px 16px',
                                                background: 'white',
                                                borderRadius: '12px',
                                                cursor: (!hasImageError && !hasVideoError) ? 'pointer' : 'default',
                                                transition: 'all 0.2s ease',
                                                border: '1px solid #f0e4d0'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!hasImageError && !hasVideoError) {
                                                    e.currentTarget.style.background = '#fef9f0';
                                                    e.currentTarget.style.borderColor = '#f59e0b';
                                                    e.currentTarget.style.transform = 'translateX(4px)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'white';
                                                e.currentTarget.style.borderColor = '#f0e4d0';
                                                e.currentTarget.style.transform = 'translateX(0)';
                                            }}
                                        >
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '10px',
                                                background: 'linear-gradient(135deg, #f5f0e8 0%, #ede5d8 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <FeatherIcon
                                                    icon={getFileIcon(filename)}
                                                    size={24}
                                                    color={isImageFile ? '#3b82f6' : isVideoFile ? '#ef4444' : '#8b7355'}
                                                />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '600', fontSize: '14px', color: '#2d1f0f', marginBottom: '4px' }}>
                                                    {filename}
                                                </div>
                                                <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#a89880' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <FeatherIcon icon={isImageFile ? 'image' : 'video'} size={10} />
                                                        {isImageFile ? 'Image' : 'Video'}
                                                    </span>
                                                    <span>{getFileSize(filename)}</span>
                                                </div>
                                            </div>
                                            <FeatherIcon icon="chevron-right" size={18} color="#c4b5a0" />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Stats Footer */}
                    <div style={{
                        padding: '16px 24px',
                        background: 'rgba(245,158,11,0.03)',
                        borderTop: '1px solid rgba(245,158,11,0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                        color: '#8b7355'
                    }}>
                        <span>
                            Showing {filteredFiles.length} of {documentationFiles.length} files
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FeatherIcon icon="info" size={12} />
                            Click any file to view in full screen
                        </span>
                    </div>
                </div>

                {/* Modal for viewing documentation - Enhanced */}
                <Modal
                    show={showDocumentationModal}
                    onHide={() => {
                        setShowDocumentationModal(false);
                        setSelectedDocFile(null);
                    }}
                    centered
                    size="lg"
                    contentClassName="border-0 bg-transparent"
                >
                    <div style={{
                        borderRadius: '24px',
                        overflow: 'hidden',
                        background: '#1a1a1a',
                        position: 'relative',
                        animation: 'modalFadeIn 0.3s ease-out'
                    }}>
                        <Modal.Header
                            closeButton
                            style={{
                                background: 'rgba(0,0,0,0.9)',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                zIndex: 10,
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <Modal.Title style={{
                                color: 'white',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <FeatherIcon icon={selectedDocFile?.type === 'image' ? 'image' : 'video'} size={16} />
                                {selectedDocFile?.filename || 'Documentation Viewer'}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{
                            padding: 0,
                            minHeight: '500px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#000'
                        }}>
                            {selectedDocFile?.type === 'image' && (
                                <img
                                    src={selectedDocFile.url}
                                    alt={selectedDocFile.filename}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '80vh',
                                        objectFit: 'contain'
                                    }}
                                    onError={(e) => {
                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\'%3E%3Crect width=\'400\' height=\'300\' fill=\'%23333\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23fff\'%3EImage failed to load%3C/text%3E%3C/svg%3E';
                                    }}
                                />
                            )}
                            {selectedDocFile?.type === 'video' && (
                                <video
                                    controls
                                    autoPlay
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '80vh'
                                    }}
                                    onError={() => {
                                        setShowDocumentationModal(false);
                                        showAlertMessage('error', 'Error', 'Failed to load video file');
                                    }}
                                >
                                    <source src={selectedDocFile.url} />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                            {selectedDocFile?.type === 'other' && (
                                <div style={{
                                    textAlign: 'center',
                                    color: 'white',
                                    padding: '60px 40px'
                                }}>
                                    <FeatherIcon icon="file" size={64} style={{ marginBottom: '20px', opacity: 0.5 }} />
                                    <p style={{ marginBottom: '20px', fontSize: '14px' }}>This file type cannot be previewed</p>
                                    <a
                                        href={selectedDocFile.url}
                                        download
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '10px 24px',
                                            background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                                            color: 'white',
                                            textDecoration: 'none',
                                            borderRadius: '12px',
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        <FeatherIcon icon="download" size={16} />
                                        Download File
                                    </a>
                                </div>
                            )}
                        </Modal.Body>
                    </div>
                </Modal>
            </>
        );
    };


    const [continueButton, setContinueButton] = useState(false);
    useEffect(() => {
        if (data.criticality_analysis_status === 'Good/Ok') {
            setContinueButton(true);
        }
        if (data.criticality_analysis_status === 'Verify/Abnormal' && data.resampling_schedule) {
            setContinueButton(true);
        }
        if (data.criticality_analysis_status === 'Severe' && data.action_taken) {
            setContinueButton(true);
        }
    }, [data.criticality_analysis_status, data.resampling_schedule])

    // XXX
    const ContinueLevel = async () => {
        try {
            if (data.criticality_analysis_status) {
                //Good/Ok
                if (data.criticality_analysis_status === 'Good/Ok') {
                    try {
                        const empInfo = JSON.parse(localStorage.getItem("user"));

                        await axios.post(`${config.baseApi}/assetsAnalysis/update-level-two`, {
                            asset_analysis_id: asset_analysis_id,
                            updated_by: empInfo.user_name,
                        });

                        window.location.replace('/AssetReliabilityMonitoringSystem/all-submit-asset')
                    } catch (err) {
                        console.log('Error checking for resampling schedule: ', err);
                    }

                    console.log('Asset is in good condition. No further analysis needed.');
                    showAlertMessage('success', 'Good Condition', 'Proceeding to level 3 analysis.');
                }

                //Verify/Abnormal
                if (data.criticality_analysis_status === 'Verify/Abnormal' && data.resampling_schedule) {
                    try {
                        const empInfo = JSON.parse(localStorage.getItem("user"));

                        await axios.post(`${config.baseApi}/assetsAnalysis/update-level-two`, {
                            asset_analysis_id: asset_analysis_id,
                            updated_by: empInfo.user_name,
                        });

                        window.location.replace('/AssetReliabilityMonitoringSystem/all-submit-asset')
                    } catch (err) {
                        console.log('Error checking for resampling schedule: ', err);
                    }

                    console.log('Asset is in Verify/Abnormal condition. Proceeding to level 3 analysis.');
                    showAlertMessage('success', 'Verify/Abnormal Condition', 'Proceeding to level 3 analysis.');
                }
                else if (data.criticality_analysis_status === 'Verify/Abnormal' && !data.resampling_schedule) {
                    console.log('Asset is in Verify/Abnormal condition but no resampling schedule found. Prompting user to set up resampling schedule.');
                    showAlertMessage('warning', 'Resampling Schedule Required', 'The asset is in Verify/Abnormal condition but no resampling schedule was found. Please set up a resampling schedule to proceed.');
                }

                //Severe
                if (data.criticality_analysis_status === 'Severe' && data.action_taken) {
                    try {
                        const empInfo = JSON.parse(localStorage.getItem("user"));

                        await axios.post(`${config.baseApi}/assetsAnalysis/update-level-two`, {
                            asset_analysis_id: asset_analysis_id,
                            updated_by: empInfo.user_name,
                        });

                        window.location.replace('/AssetReliabilityMonitoringSystem/all-submit-asset')
                    } catch (err) {
                        console.log('Error checking for resampling schedule: ', err);
                    }

                    console.log('Asset is in Severe condition. Proceeding to level 3 analysis and recommending severe action.');
                    showAlertMessage('success', 'Severe Condition', 'Proceeding to level 3 analysis and recommending severe action.');
                }
                else if (data.criticality_analysis_status === 'Severe' && !data.action_taken) {
                    console.log('Asset is in Severe condition but no action taken found. Prompting user to take severe action.');
                    showAlertMessage('warning', 'Action Required', 'The asset is in Severe condition but no action taken was found. Please take the recommended severe action to proceed.');
                }
            }
        } catch (err) {
            console.log('Unable tp continue to level 3: ', err);
            showAlertMessage('error', 'Error', 'Unable to continue to level 3. Please try again later.');
        }
    }

    return (
        <div style={{ background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)', minHeight: '100vh', padding: 'clamp(20px, 5vw, 40px)', position: 'relative', overflow: 'hidden', paddingTop: 'clamp(30px, 6vw, 50px)' }}>
            <Loading show={isLoading} />
            <SamplingScheduleModal />
            <CriticalityEditModal />
            <SevereActionModal />
            {showAlert && (
                <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
                    <AlertModal type={alertConfig.type} title={alertConfig.title} description={alertConfig.description} onClose={() => setShowAlert(false)} autoClose={5000} />
                </div>
            )}
            <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'rgb(255, 255, 255)', opacity: '0.05', top: '-200px', right: '-200px', animation: 'float 25s infinite ease-in-out', zIndex: 1 }} />
            <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgb(255, 255, 255)', opacity: '0.05', bottom: '-150px', left: '-150px', animation: 'float 20s infinite ease-in-out reverse', zIndex: 1 }} />
            <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgb(255, 255, 255)', opacity: '0.03', top: '50%', left: '20%', animation: 'float 18s infinite ease-in-out', zIndex: 1 }} />

            <div style={{ position: 'relative', zIndex: 2 }}>
                <Container fluid style={{ paddingBottom: '60px', paddingLeft: 'clamp(8px, 3vw, 15px)', paddingRight: 'clamp(8px, 3vw, 15px)' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '75px',
                                    height: '75px',
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                                    borderRadius: '18px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)'
                                }}>
                                    <FeatherIcon icon="activity" size={28} color="white" />
                                </div>
                                <div>
                                    <h1 style={{
                                        fontSize: 'clamp(28px, 6vw, 36px)', color: '#EAB56F',
                                        letterSpacing: '-0.5px',
                                        textShadow: '0 4px 20px rgba(234, 181, 111, 0.2)',
                                        fontWeight: '800',
                                    }}>
                                        Asset Analysis Report
                                    </h1>
                                    <p style={{ fontSize: '14px', color: '#ffffff', margin: '4px 0 0' }}>
                                        ID: #{asset_analysis_id} • Real-time diagnostic data
                                    </p>
                                </div>
                            </div>

                            {continueButton && (
                                <button
                                    onClick={ContinueLevel}
                                    style={{
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        padding: '12px 28px',
                                        color: 'white',
                                        fontWeight: '700',
                                        fontSize: 'clamp(14px, 3vw, 16px)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                                        letterSpacing: '0.5px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
                                        e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                                    }}
                                >
                                    <FeatherIcon icon="arrow-right-circle" size={20} />
                                    Continue to Level 3
                                </button>
                            )}

                        </div>
                        <div style={{ height: '4px', background: 'linear-gradient(90deg, #f59e0b 0%, #f97316 50%, #fef3c7 100%)', borderRadius: '2px' }} />
                    </div>

                    <Row style={{ flexWrap: 'nowrap' }}>
                        <Col xs={12} sm={6} lg={3} style={{ marginBottom: '16px', flex: 1 }}>
                            <StatCard label="Asset Name" value={assetData.asset_name} icon="package" bgColor="#e6f3ff" borderColor="#3b82f6" accentColor="#3b82f6" />
                        </Col>
                        <Col xs={12} sm={6} lg={3} style={{ marginBottom: '16px', flex: 1 }}>
                            <StatCard label="Component" value={componentData.asset_component_name} icon="cpu" bgColor="#e6ffe8" borderColor="#62c543" accentColor="#21a81d" />
                        </Col>
                        <Col xs={12} sm={6} lg={3} style={{ marginBottom: '16px', flex: 1 }}>
                            <StatCard label="Category" value={assetData.asset_category} icon="grid" bgColor="#fffce3" borderColor="#c0b300" accentColor="#948500" />
                        </Col>
                        <Col xs={12} sm={6} lg={3} style={{ marginBottom: '16px', flex: 1 }}>
                            <StatCard label="Type" value={assetData.asset_type} icon="sliders" bgColor="#f7e3ff" borderColor="#5a00c0" accentColor="#4c0094" />
                        </Col>
                        <Col xs={12} sm={6} lg={3} style={{ marginBottom: '16px', flex: 1 }}>
                            <StatCard label="Analysis Date" value={new Date(data.analysis_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} icon="calendar" />
                        </Col>
                    </Row>
                    <div style={{ background: 'linear-gradient(185deg, #f5f5f5 0%, #fcf8f3 100%)', borderRadius: '20px', padding: 'clamp(4px, 4vw, 12px)', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '2px solid rgb(214, 180, 105)' }}>
                        <Row className="align-items-center">
                            <Col xs={12}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'stretch',
                                    gap: 'clamp(16px, 4vw, 24px)',
                                    flexWrap: 'wrap',
                                    flexDirection: 'row',
                                    padding: 'clamp(4px, 2vw, 6px)',
                                    background: '#fafafa',
                                    borderRadius: '12px',
                                    transition: 'all 0.2s ease'
                                }}>
                                    <div style={{
                                        flex: '1 1 180px',
                                        minWidth: 'clamp(160px, 25vw, 200px)',
                                        padding: '8px 0'
                                    }}>
                                        <div style={{
                                            fontSize: 'clamp(11px, 2.5vw, 13px)',
                                            color: COLORS.gray,
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            letterSpacing: '0.3px',
                                            textTransform: 'uppercase'
                                        }}>
                                            <FeatherIcon icon="map-pin" size={clampNumber(10, 12)} style={{ marginRight: '6px', color: COLORS.accent, verticalAlign: 'middle' }} />
                                            Asset Location
                                        </div>
                                        <div style={{
                                            fontSize: 'clamp(13px, 4vw, 18px)',
                                            fontWeight: '600',
                                            color: COLORS.dark,
                                            wordBreak: 'break-word',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            lineHeight: 1.4,
                                            marginLeft: '25px'
                                        }}>
                                            <span>{assetData.asset_location || 'Not specified'}</span>
                                        </div>
                                    </div>

                                    <div style={{
                                        flex: '1 1 160px',
                                        minWidth: 'clamp(140px, 22vw, 180px)',
                                        padding: '8px 0'
                                    }}>
                                        <div style={{
                                            fontSize: 'clamp(11px, 2.5vw, 13px)',
                                            color: COLORS.gray,
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            letterSpacing: '0.3px',
                                            textTransform: 'uppercase'
                                        }}>
                                            <FeatherIcon icon="user" size={clampNumber(10, 12)} style={{ marginRight: '6px', color: COLORS.accent, verticalAlign: 'middle' }} />
                                            Created By
                                        </div>
                                        <div style={{
                                            fontSize: 'clamp(13px, 4vw, 18px)',
                                            fontWeight: '600',
                                            color: COLORS.dark,
                                            wordBreak: 'break-word',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            lineHeight: 1.4,
                                            marginLeft: '25px'
                                        }}>
                                            <span>{data.created_by || 'Unknown'}</span>
                                        </div>
                                    </div>

                                    <div style={{
                                        flex: '1 1 160px',
                                        minWidth: 'clamp(140px, 22vw, 180px)',
                                        padding: '8px 0',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            fontSize: 'clamp(11px, 2.5vw, 13px)',
                                            color: COLORS.gray,
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            letterSpacing: '0.3px',
                                            textTransform: 'uppercase',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <FeatherIcon icon="layers" size={clampNumber(10, 12)} style={{ marginRight: '6px', color: COLORS.accent, verticalAlign: 'middle' }} />
                                            Trivector
                                            <div style={{ position: 'relative', display: 'inline-block', cursor: 'help' }}>
                                                <FeatherIcon icon="info" size={12} color={COLORS.gray} />
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '100%',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    background: COLORS.dark,
                                                    color: 'white',
                                                    fontSize: '11px',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    whiteSpace: 'nowrap',
                                                    display: 'none',
                                                    zIndex: 100,
                                                    pointerEvents: 'none'
                                                }} className="tooltip-text">
                                                    Equipment type classification
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{
                                            fontSize: 'clamp(13px, 4vw, 18px)',
                                            fontWeight: '600',
                                            color: COLORS.dark,
                                            wordBreak: 'break-word',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            lineHeight: 1.4,
                                            marginLeft: '25px'
                                        }}>
                                            <span>{formatTrivector(assetData.trivector) || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div style={{
                                        flex: '1 1 160px',
                                        minWidth: 'clamp(140px, 22vw, 180px)',
                                        padding: '8px 0'
                                    }}>
                                        <div style={{
                                            fontSize: 'clamp(11px, 2.5vw, 13px)',
                                            color: COLORS.gray,
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            letterSpacing: '0.3px',
                                            textTransform: 'uppercase'
                                        }}>
                                            <FeatherIcon icon="calendar" size={clampNumber(10, 12)} style={{ marginRight: '6px', color: COLORS.accent, verticalAlign: 'middle' }} />
                                            Resampling Schedule
                                        </div>
                                        <div style={{
                                            fontSize: 'clamp(13px, 4vw, 18px)',
                                            fontWeight: '600',
                                            color: COLORS.dark,
                                            wordBreak: 'break-word',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            lineHeight: 1.4,
                                            marginLeft: '25px'
                                        }}>
                                            {resamplingSchedule ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                    <span style={{ color: COLORS.success, background: `${COLORS.success}15`, padding: '4px 12px', borderRadius: '20px' }}>
                                                        {new Date(resamplingSchedule).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            ) : criticalityStatus === 'Verify/Abnormal' ? (
                                                <button onClick={() => setShowSamplingModal(true)} style={{
                                                    background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
                                                    border: `2px dashed ${COLORS.warning}`,
                                                    borderRadius: '12px',
                                                    padding: '8px 16px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    color: COLORS.dark,
                                                    transition: 'all 0.2s ease'
                                                }}>
                                                    <FeatherIcon icon="calendar" size={16} color={COLORS.warning} />
                                                    <span>Select Resampling Date</span>
                                                </button>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ color: COLORS.warning }}>Not scheduled</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{
                                        flex: '1 1 220px',
                                        minWidth: 'clamp(200px, 30vw, 260px)',
                                        padding: '8px 0'
                                    }}>
                                        <div style={{
                                            fontSize: 'clamp(11px, 2.5vw, 13px)',
                                            color: COLORS.gray,
                                            marginBottom: '8px',
                                            fontWeight: '500',
                                            letterSpacing: '0.3px',
                                            textTransform: 'uppercase'
                                        }}>
                                            <FeatherIcon icon="alert-triangle" size={clampNumber(10, 12)} style={{ marginRight: '6px', color: COLORS.accent, verticalAlign: 'middle' }} />
                                            Criticality Analysis
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            flexWrap: 'wrap',
                                            minHeight: '42px'
                                        }}>
                                            <div style={{
                                                fontSize: 'clamp(13px, 4vw, 16px)',
                                                fontWeight: '600',
                                                color: criticalityStatus && criticalityStatus !== 'Select' ? '#ffffff' : COLORS.gray,
                                                padding: '6px 16px',
                                                background: getCriticalityColor(criticalityStatus),
                                                borderRadius: '20px',
                                                wordBreak: 'break-word',
                                                boxShadow: criticalityStatus && criticalityStatus !== 'Select'
                                                    ? '0 2px 8px rgba(0,0,0,0.12)'
                                                    : 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                                                transition: 'all 0.2s ease',
                                                letterSpacing: '0.3px',
                                                marginLeft: '25px'
                                            }}>
                                                {criticalityStatus && criticalityStatus !== 'Select' ? criticalityStatus : 'Not Set'}
                                            </div>
                                            <button
                                                onClick={() => setShowCriticalityModal(true)}
                                                style={{
                                                    background: 'rgba(0,0,0,0.05)',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '8px',
                                                    borderRadius: '40px',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'all 0.2s ease',
                                                    width: '36px',
                                                    height: '36px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                                aria-label="Edit criticality status"
                                            >
                                                <FeatherIcon icon="edit-2" size={clampNumber(14, 18)} color={COLORS.accent} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <Row>
                        <Col xs={12} md={6} style={{ marginBottom: '16px' }}>
                            <SemiCircleGauge
                                value={assetRunningHours}
                                maxValue={maxAssetRunningHours}
                                label="Asset Running Hours"
                                unit="hours"
                                icon="clock"
                                color="#3b82f6"
                                valueColor={'#ffffff'}
                                bgColor={'#1e293b'}
                                gaugeColor={'#475569'}
                            />
                        </Col>
                        <Col xs={12} md={6} style={{ marginBottom: '16px' }}>
                            <SemiCircleGauge
                                value={oilRunningHours}
                                maxValue={maxOilRunningHours}
                                label="Oil Running Hours"
                                unit="hours"
                                icon="droplet"
                                color="#f59e0b"
                                valueColor={'#ffffff'}
                                bgColor={'#1e293b'}
                                gaugeColor={'#475569'}
                            />
                        </Col>
                    </Row>

                    {data.action_taken && (
                        <>
                            <div
                                className="modern-card"
                                style={{
                                    marginBottom: '24px',
                                    padding: '0',
                                    background: 'linear-gradient(135deg, #fcf5ff 0%, #f6e8ff 100%)',
                                    border: '1px solid #dcc8e8',
                                    borderRadius: '16px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                }}
                            >
                                {/* Decorative top accent bar */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: 'linear-gradient(90deg, #b30bf5 0%, #a616f9 50%, #a524fb 100%)',
                                    }}
                                />

                                {/* Subtle background pattern */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        pointerEvents: 'none',
                                        backgroundImage: `radial-gradient(circle at 20% 30%, rgba(140, 11, 245, 0.03) 0%, transparent 50%)`,
                                        borderRadius: '16px',
                                    }}
                                />

                                <div style={{ padding: '24px', position: 'relative', zIndex: 1 }}>
                                    {/* Header Section */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginBottom: '20px',
                                        paddingBottom: '12px',
                                        borderBottom: '2px solid rgba(140, 11, 245, 0.38)'
                                    }}>
                                        <div style={{
                                            background: 'linear-gradient(135deg, #562f70 0%, #ae00ff 100%)',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 12px rgba(245,158,11,0.3)'
                                        }}>
                                            <FeatherIcon icon="check-square" size={20} color="white" />
                                        </div>
                                        <div>
                                            <h4
                                                style={{
                                                    margin: 0,
                                                    fontWeight: '700',
                                                    color: '#2d1f0f',
                                                    fontSize: '18px',
                                                    letterSpacing: '-0.3px',
                                                }}
                                            >
                                                Actions Taken
                                            </h4>
                                            <p style={{
                                                margin: '4px 0 0',
                                                fontSize: '12px',
                                                color: '#8b7355',
                                                fontWeight: '500'
                                            }}>
                                                Recommended maintenance actions based on analysis
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions List */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px'
                                    }}>
                                        {data.action_taken.split(',').map((action, index) => {
                                            // Determine icon based on action type
                                            const getActionIcon = (actionText) => {
                                                const text = actionText.toLowerCase();
                                                if (text.includes('maintenance')) return 'tool';
                                                if (text.includes('replace') || text.includes('replacement')) return 'refresh-cw';
                                                if (text.includes('oil')) return 'droplet';
                                                if (text.includes('shutdown')) return 'power';
                                                if (text.includes('monitor')) return 'eye';
                                                if (text.includes('schedule')) return 'calendar';
                                                return 'check-circle';
                                            };

                                            const getActionColor = (actionText) => {
                                                const text = actionText.toLowerCase();
                                                if (text.includes('immediate')) return '#ef4444';
                                                if (text.includes('shutdown')) return '#dc2626';
                                                if (text.includes('replace')) return '#f59e0b';
                                                if (text.includes('maintenance')) return '#3b82f6';
                                                if (text.includes('monitor')) return '#10b981';
                                                return '#8b7355';
                                            };

                                            const iconName = getActionIcon(action);
                                            const actionColor = getActionColor(action);
                                            const isUrgent = action.toLowerCase().includes('immediate') || action.toLowerCase().includes('shutdown');

                                            return (
                                                <div
                                                    key={index}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: '14px',
                                                        padding: '14px 16px',
                                                        background: 'white',
                                                        borderRadius: '12px',
                                                        border: `2px solid ${isUrgent ? '#ff9100' : '#f0e4d0'}`,
                                                        transition: 'all 0.2s ease',
                                                        cursor: 'pointer',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateX(4px)';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                                        e.currentTarget.style.borderColor = '#ffa600';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateX(0)';
                                                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                                                        e.currentTarget.style.borderColor = isUrgent ? '#fee2e2' : '#f0e4d0';
                                                    }}
                                                >
                                                    {/* Icon Circle */}
                                                    <div style={{
                                                        flexShrink: 0,
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '10px',
                                                        background: `#ffff`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: `1px solid ${actionColor}30`
                                                    }}>
                                                        <FeatherIcon
                                                            icon={iconName}
                                                            size={16}
                                                            color={actionColor}
                                                        />
                                                    </div>

                                                    {/* Action Text */}
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{
                                                            fontSize: '15px',
                                                            fontWeight: '600',
                                                            color: '#2d1f0f',
                                                            lineHeight: '1.4',

                                                        }}>
                                                            {action.trim()}
                                                        </div>

                                                    </div>

                                                    {/* Priority Badge */}
                                                    {/* <div style={{ flexShrink: 0 }}>
                                                        {isUrgent ? (
                                                            <div style={{
                                                                background: '#ef4444',
                                                                color: 'white',
                                                                padding: '2px 8px',
                                                                borderRadius: '20px',
                                                                fontSize: '10px',
                                                                fontWeight: '700',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.5px'
                                                            }}>
                                                                High Priority
                                                            </div>
                                                        ) : (
                                                            <FeatherIcon icon="chevron-right" size={18} color="#d4c5b0" />
                                                        )}
                                                    </div> */}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Footer Note */}
                                    <div style={{
                                        marginTop: '16px',
                                        padding: '12px',
                                        background: 'rgba(245,158,11,0.05)',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '12px',
                                        color: '#8b7355',
                                        borderLeft: `3px solid #f59e0b`
                                    }}>
                                        <FeatherIcon icon="info" size={14} color="#f59e0b" />
                                        <span>Follow these recommended actions to ensure optimal asset performance and prevent potential failures.</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {documentationFiles.length > 0 && <DocumentationViewer />}
                    {/* RECOMMENDATION */}
                    <div
                        className="modern-card"
                        style={{
                            marginBottom: '24px',
                            padding: '20px',
                            background: 'linear-gradient(145deg, #fffaf0 0%, #fff7e8 100%)',
                            border: '1px solid #f0e4c8',
                            borderRadius: '4px',
                            position: 'relative',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                pointerEvents: 'none',
                                backgroundImage: `repeating-linear-gradient(
        transparent 0px,
        transparent 28px,
        rgba(200, 180, 140, 0.15) 28px,
        rgba(200, 180, 140, 0.15) 29px
      )`,
                                borderRadius: '4px',
                            }}
                        />

                        <div
                            style={{
                                position: 'absolute',
                                top: '-3px',
                                left: '10%',
                                width: '80%',
                                height: '6px',
                                background: 'radial-gradient(ellipse at center, rgba(220,190,120,0.3) 0%, transparent 70%)',
                                borderRadius: '50%',
                            }}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
                            <FeatherIcon icon="message-square" size={20} color="#b85c00" />
                            <h4
                                style={{
                                    margin: 0,
                                    fontWeight: '700',
                                    color: '#4a3728',
                                    fontFamily: "'Courier New', 'Segoe UI', monospace",
                                    letterSpacing: '-0.3px',
                                    borderBottom: '1px dashed #e2d4b5',
                                    paddingBottom: '4px',
                                }}
                            >
                                Recommendations
                            </h4>
                        </div>

                        <div
                            style={{
                                fontSize: 'clamp(14px, 3vw, 16px)',
                                color: '#3e2c1f',
                                lineHeight: '1.7',
                                fontWeight: '500',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                position: 'relative',
                                zIndex: 1,
                                fontFamily: "'Segoe UI', 'Roboto', 'Georgia', serif",
                                padding: '4px 2px',
                            }}
                        >
                            {data.recommendations
                                ? data.recommendations
                                : 'No recommendations available for this asset analysis.'}
                        </div>


                        <div
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: 0,
                                height: 0,
                                borderStyle: 'solid',
                                borderWidth: '0 0 24px 24px',
                                borderColor: 'transparent transparent #efe0c6 transparent',
                                pointerEvents: 'none',
                                borderRadius: '0 0 4px 0',
                            }}
                        />
                    </div>

                    <div style={{ background: '#fcf6ee', padding: 'clamp(16px, 4vw, 25px)', borderRadius: '20px' }}>
                        <div style={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            <div style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: '600', color: '#444444', marginBottom: '8px' }}>
                                <FeatherIcon icon="trending-up" size={clampNumber(16, 20)} style={{ marginRight: '8px', color: COLORS.accent, verticalAlign: 'middle' }} />
                                Test Results
                            </div>

                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {['overview', 'wear-metals', 'contaminants', 'chemistry'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        style={{
                                            padding: 'clamp(8px, 2vw, 10px) clamp(16px, 4vw, 24px)',
                                            border: 'none',
                                            background: activeTab === tab
                                                ? tabGradients[tab] || `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`
                                                : 'transparent',
                                            color: activeTab === tab ? COLORS.white : COLORS.gray,
                                            fontWeight: '600',
                                            borderRadius: '20px 20px 5px 5px',
                                            fontSize: 'clamp(12px, 2.5vw, 14px)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            flex: '0 0 auto'
                                        }}
                                    >
                                        {tab === 'overview' ? 'Overview' : tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <FilterAndDateRow />

                        <div>
                            {activeTab === 'wear-metals' && (
                                <div>
                                    <SectionTitle titleColor={'#3F1D7D'} title="Wear Metals Analysis" icon={gear} count={rotating ? "17" : "12"} />
                                    <Row>
                                        {getCurrentWearMetals().map((param, index) => (
                                            <Col xs={12} sm={6} lg={4} key={index} style={{ marginBottom: '16px' }}>
                                                <MetricTile label={param.label} value={data[param.key]} unit={param.unit} parameterKey={param.key} />
                                            </Col>
                                        ))}
                                        {getCurrentWearMetals().length === 0 && <Col><div style={{ textAlign: 'center', padding: '40px', color: COLORS.gray }}>No parameters match the selected filter</div></Col>}
                                    </Row>
                                </div>
                            )}

                            {activeTab === 'contaminants' && (
                                <div>
                                    <SectionTitle titleColor={'#1CC500'} title="Contaminants Analysis" icon={water} count={rotating ? "22" : stationary ? "11" : "10"} />
                                    <Row>
                                        {getCurrentContaminants().map((param, index) => (
                                            <Col xs={12} sm={6} lg={4} key={index} style={{ marginBottom: '16px' }}>
                                                <MetricTile label={param.label} value={data[param.key]} unit={param.unit} parameterKey={param.key} />
                                            </Col>
                                        ))}
                                        {getCurrentContaminants().length === 0 && <Col><div style={{ textAlign: 'center', padding: '40px', color: COLORS.gray }}>No parameters match the selected filter</div></Col>}
                                    </Row>
                                </div>
                            )}

                            {activeTab === 'chemistry' && (
                                <div>
                                    <SectionTitle titleColor={'#C14D25'} title="Chemistry & Viscosity" icon={lab} count="12" />
                                    <Row>
                                        {getCurrentChemistry().map((param, index) => (
                                            <Col xs={12} sm={6} lg={4} key={index} style={{ marginBottom: '16px' }}>
                                                <MetricTile label={param.label} value={data[param.key]} unit={param.unit} parameterKey={param.key} />
                                            </Col>
                                        ))}
                                        {getCurrentChemistry().length === 0 && <Col><div style={{ textAlign: 'center', padding: '40px', color: COLORS.gray }}>No parameters match the selected filter</div></Col>}
                                    </Row>
                                </div>
                            )}

                            {activeTab === 'overview' && (
                                <div>
                                    {(overviewCategory === 'all' || overviewCategory === 'wear-metals') && (
                                        <OverviewMultiChart titleColor={'#3F1D7D'} title="Wear Metals Analysis" icon={gear} parameters={getAllWearMetals()} unit="ppm" yAxisLabel="Concentration (ppm)" hiddenSet={hiddenWearMetals} onToggle={toggleWearMetalsVisibility} />
                                    )}
                                    {(overviewCategory === 'all' || overviewCategory === 'contaminants') && (
                                        <OverviewMultiChart titleColor={'#1CC500'} title="Contaminants Analysis" icon={water} parameters={getAllContaminants()} unit="ppm" yAxisLabel="Value" hiddenSet={hiddenContaminants} onToggle={toggleContaminantsVisibility} />
                                    )}
                                    {(overviewCategory === 'all' || overviewCategory === 'chemistry') && (
                                        <OverviewMultiChart titleColor={'#C14D25'} title="Chemistry & Viscosity" icon={lab} parameters={getAllChemistry()} unit="cSt" yAxisLabel="Value" hiddenSet={hiddenChemistry} onToggle={toggleChemistryVisibility} />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </Container>
            </div>
            <EnlargedChartModal />

            <style>{`
    div:hover > .tooltip-text {
        display: block !important;
    }
    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
    }
    @keyframes modalFadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
    }
`}</style>
        </div>
    );
}