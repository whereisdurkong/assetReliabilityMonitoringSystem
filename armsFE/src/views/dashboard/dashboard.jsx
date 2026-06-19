

import { useEffect, useState, useRef } from "react";
import { Container, Row, Col } from "react-bootstrap";
import axios from 'axios';
import config from 'config';
import FeatherIcon from "feather-icons-react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function DataAnalytic() {
    const [totalReports, setTotalReports] = useState(0);
    const [completedReports, setCompletedReports] = useState(0);
    const [incompleteReports, setIncompleteReports] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [completedReportsList, setCompletedReportsList] = useState([]);
    const [assetMap, setAssetMap] = useState({});
    const [trivectorMap, setTrivectorMap] = useState({});
    const [locationMap, setLocationMap] = useState({});
    const [componentMap, setComponentMap] = useState({});
    const [statusStats, setStatusStats] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCriticality, setFilterCriticality] = useState('all');
    const [filterYear, setFilterYear] = useState('all');
    const [filterLocation, setFilterLocation] = useState('all');
    const [availableYears, setAvailableYears] = useState([]);
    const [availableLocations, setAvailableLocations] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [uniqueAssetsCount, setUniqueAssetsCount] = useState(0);
    const [allReportsData, setAllReportsData] = useState([]);
    const [allAssetsData, setAllAssetsData] = useState([]);
    const [lastLoggedLocation, setLastLoggedLocation] = useState('all');
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [parameterDistribution, setParameterDistribution] = useState({
        wearMetals: 0,
        contaminants: 0,
        chemistryAndViscosity: 0
    });
    const [assetComponentDistribution, setAssetComponentDistribution] = useState([]);
    const [isDownloading, setIsDownloading] = useState(false);

    const [showTrivectorModal, setShowTrivectorModal] = useState(false);

    // Date filter states
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Refs for date inputs and PDF
    const fromDateInputRef = useRef(null);
    const toDateInputRef = useRef(null);
    const dashboardRef = useRef(null);

    const itemsPerPage = 8;

    // Parameter definitions
    const wearMetalsParams = {
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
    };

    const contaminantsParams = {
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
    };

    const chemistryParams = {
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
        rotating: [{ label: "TAN", key: "tan", unit: "mg KOH/g" }],
        stationaryMobile: [
            { label: "TBN", key: "tbn", unit: "mg KOH/g" },
            { label: "Nitration", key: "nitration", unit: "abs/cm" },
            { label: "Sulfation", key: "sulfation", unit: "abs/0.1mm" }
        ],
        mobile: [{ label: "Antiwear", key: "antiwear_percent", unit: '%' }]
    };

    // Helper function to format trivector
    const formatTrivector = (value) => {
        const mapping = {
            'rotating-machine': 'Rotating Machine',
            'stationary-engine': 'Stationary Engine',
            'mobile-engine': 'Mobile Engine'
        };
        return mapping[value] || value || '-';
    };

    // Function to get parameters based on trivector
    const getParametersByTrivector = (trivector) => {
        const isRotating = trivector === 'rotating-machine';
        const isStationary = trivector === 'stationary-engine';
        const isMobile = trivector === 'mobile-engine';

        const wearMetals = isRotating ? wearMetalsParams.rotating : wearMetalsParams.stationaryMobile;

        let contaminants = [];
        if (isRotating) contaminants = contaminantsParams.rotating;
        else if (isStationary) contaminants = contaminantsParams.stationary;
        else if (isMobile) contaminants = contaminantsParams.mobile;

        let chemistry = [...chemistryParams.common];
        if (isRotating) chemistry = [...chemistry, ...chemistryParams.rotating];
        else if (isStationary || isMobile) chemistry = [...chemistry, ...chemistryParams.stationaryMobile];
        if (isMobile) chemistry = [...chemistry, ...chemistryParams.mobile];

        return { wearMetals, contaminants, chemistry };
    };

    const countParametersWithData = (report, trivector) => {
        const { wearMetals, contaminants, chemistry } = getParametersByTrivector(trivector);

        let wearMetalCount = 0;
        let contaminantCount = 0;
        let chemistryAndViscosityCount = 0;

        const hasData = (value) => {
            if (value === null || value === undefined || value === '') return false;
            const num = parseFloat(value);
            if (!isNaN(num) && num === 0) return false; // treat literal zero as "no data"
            return true;
        };

        wearMetals.forEach(param => {
            if (hasData(report[param.key])) wearMetalCount++;
        });

        contaminants.forEach(param => {
            if (hasData(report[param.key])) contaminantCount++;
        });

        chemistry.forEach(param => {
            if (hasData(report[param.key])) chemistryAndViscosityCount++;
        });

        return { wearMetalCount, contaminantCount, chemistryAndViscosityCount };
    };

    //XXXXXXX


    // Function to log all parameters for a report
    const logReportParameters = (report, trivector, assetName) => {
        console.group(`🔬 Detailed Parameter Analysis - ${assetName || report.asset_name} (ID: ${report.asset_analysis_id})`);
        console.log(`📍 Location: ${report.asset_location || 'Unknown'}`);
        console.log(`📊 Trivector Type: ${formatTrivector(trivector)}`);
        console.log(`📅 Analysis Date: ${report.analysis_date ? new Date(report.analysis_date).toLocaleDateString() : 'N/A'}`);

        const { wearMetals, contaminants, chemistry } = getParametersByTrivector(trivector);

        console.group(`🛠️ WEAR METALS ${wearMetals.length > 0 ? `(${wearMetals.length} parameters)` : ''}`);
        const wearMetalValues = [];
        wearMetals.forEach(param => {
            const value = report[param.key];
            if (value !== null && value !== undefined && value !== '') {
                const displayValue = param.unit ? `${value} ${param.unit}` : value;
                wearMetalValues.push({ label: param.label, value: displayValue });
                console.log(`   ${param.label.padEnd(25)}: ${displayValue}`);
            }
        });
        if (wearMetalValues.length === 0) {
            console.log('   ⚠️ No wear metals data available');
        }
        console.groupEnd();

        console.group(`🌊 CONTAMINANTS ${contaminants.length > 0 ? `(${contaminants.length} parameters)` : ''}`);
        const contaminantValues = [];
        contaminants.forEach(param => {
            const value = report[param.key];
            if (value !== null && value !== undefined && value !== '') {
                const displayValue = param.unit ? `${value} ${param.unit}` : value;
                contaminantValues.push({ label: param.label, value: displayValue });
                console.log(`   ${param.label.padEnd(25)}: ${displayValue}`);
            }
        });
        if (contaminantValues.length === 0) {
            console.log('   ⚠️ No contaminants data available');
        }
        console.groupEnd();

        console.group(`🧪 CHEMISTRY & VISCOSITY ${chemistry.length > 0 ? `(${chemistry.length} parameters)` : ''}`);
        const chemistryValues = [];
        chemistry.forEach(param => {
            const value = report[param.key];
            if (value !== null && value !== undefined && value !== '') {
                const displayValue = param.unit ? `${value} ${param.unit}` : value;
                chemistryValues.push({ label: param.label, value: displayValue });
                console.log(`   ${param.label.padEnd(25)}: ${displayValue}`);
            }
        });
        if (chemistryValues.length === 0) {
            console.log('   ⚠️ No chemistry data available');
        }
        console.groupEnd();

        console.group('📊 SUMMARY');
        console.log(`✅ Total parameters with data: ${wearMetalValues.length + contaminantValues.length + chemistryValues.length}`);
        console.log(`🛠️ Wear Metals: ${wearMetalValues.length} parameters recorded`);
        console.log(`🌊 Contaminants: ${contaminantValues.length} parameters recorded`);
        console.log(`🧪 Chemistry & Viscosity: ${chemistryValues.length} parameters recorded`);

        const concerningParams = [];

        const ironValue = report.iron;
        if (ironValue && parseFloat(ironValue) > 100) {
            concerningParams.push(`⚠️ High Iron (${ironValue} ppm) - Possible excessive wear`);
        }

        const waterValue = report.water;
        if (waterValue && parseFloat(waterValue) > 0.5) {
            concerningParams.push(`⚠️ High Water (${waterValue}%) - Possible contamination`);
        }

        const visc40 = report.viscosity_at_40c;
        if (visc40) {
            const viscNum = parseFloat(visc40);
            if (viscNum < 40 || viscNum > 80) {
                concerningParams.push(`⚠️ Viscosity out of range (${visc40} cSt) - Oil degradation possible`);
            }
        }

        if (concerningParams.length > 0) {
            console.log('\n🔔 CONCERNS DETECTED:');
            concerningParams.forEach(concern => console.log(`   ${concern}`));
        } else {
            console.log('✅ No immediate concerns detected');
        }

        console.groupEnd();
        console.groupEnd();
    };

    // Function to log only the filtered reports by location
    const logFilteredReportsByLocation = (location, reports) => {
        if (!reports || reports.length === 0) {
            console.log(`%c📍 No reports found for location: ${location === 'all' ? 'ALL LOCATIONS' : location.toUpperCase()}`, 'color: #ff6b6b; font-size: 14px; font-weight: bold');
            return;
        }

        console.clear();
        console.log(`%c📍 REPORTS FILTERED BY LOCATION: ${location === 'all' ? 'ALL LOCATIONS' : location.toUpperCase()}`, 'color: #ffa600; font-size: 16px; font-weight: bold');
        console.log(`📊 Total Reports Found: ${reports.length}`);
        console.log('═'.repeat(80));

        reports.forEach((report, index) => {
            const trivectorColor =
                report.trivector === 'rotating-machine' ? '#00BFFF' :
                    report.trivector === 'stationary-engine' ? '#32CD32' :
                        report.trivector === 'mobile-engine' ? '#FFA500' : '#999';

            console.groupCollapsed(
                `%c📄 Report ${index + 1}/${reports.length} | ${report.asset_name} | ${report.trivector_formatted}`,
                `color: ${trivectorColor}; font-weight: bold`
            );
            logReportParameters(report, report.trivector, report.asset_name);
            console.groupEnd();
        });

        console.group('📈 LOCATION SUMMARY');
        console.log(`✅ Total reports processed: ${reports.length}`);

        const criticalitySummary = {};
        reports.forEach(report => {
            const status = report.criticality_analysis_status || 'Unknown';
            criticalitySummary[status] = (criticalitySummary[status] || 0) + 1;
        });

        console.log('\n🎯 Criticality Breakdown:');
        Object.entries(criticalitySummary).forEach(([status, count]) => {
            const percentage = ((count / reports.length) * 100).toFixed(1);
            console.log(`   ${status.padEnd(18)}: ${count} (${percentage}%)`);
        });

        console.groupEnd();
        console.log('═'.repeat(80));
        console.log(`✅ Complete parameter analysis for ${location === 'all' ? 'ALL LOCATIONS' : location.toUpperCase()} finished.`);
    };

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

    // Handle location change
    const handleLocationChange = (newLocation) => {
        setFilterLocation(newLocation);
        setCurrentPage(1);
    };


    const handleDownloadDashboardPDF = async () => {
        setIsDownloading(true);
        try {
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const W = 210;
            const H = 297;
            const ML = 14;
            const CONTENT_W = W - ML * 2;
            let y = 0;

            const hexToRgb = (hex) => {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return [r, g, b];
            };
            const setFill = (hex) => pdf.setFillColor(...hexToRgb(hex));
            const setTxt = (hex) => pdf.setTextColor(...hexToRgb(hex));
            const setDraw = (hex) => pdf.setDrawColor(...hexToRgb(hex));

            const filledRect = (x, ry, w, h, color, radius = 2) => {
                setFill(color);
                if (radius > 0) pdf.roundedRect(x, ry, w, h, radius, radius, 'F');
                else pdf.rect(x, ry, w, h, 'F');
            };

            const checkPage = (needed = 20) => {
                if (y + needed > H - 12) { drawFooter(); pdf.addPage(); drawPageBand(); y = 20; }
            };

            const drawPageBand = () => {
                filledRect(0, 0, W, 14, '#171C2D', 0);
                filledRect(0, 14, W, 1.5, '#EAB56F', 0);
                setTxt('#EAB56F'); pdf.setFontSize(7); pdf.setFont('helvetica', 'bold');
                pdf.text('Analytics Dashboard  •  Asset Reliability Monitoring System', ML, 9.5);
                setTxt('#888888'); pdf.setFont('helvetica', 'normal');
                pdf.text(new Date().toLocaleString(), W - ML, 9.5, { align: 'right' });
            };

            const drawFooter = () => {
                const pg = pdf.internal.getCurrentPageInfo().pageNumber;
                const tot = pdf.internal.getNumberOfPages();
                filledRect(0, H - 10, W, 10, '#171C2D', 0);
                setTxt('#888888'); pdf.setFontSize(7); pdf.setFont('helvetica', 'normal');
                pdf.text('Asset Reliability Monitoring System', ML, H - 4);
                pdf.text(`Page ${pg} of ${tot}`, W - ML, H - 4, { align: 'right' });
            };

            const sectionHeader = (title, color = '#254252') => {
                checkPage(14);
                filledRect(ML, y, CONTENT_W, 9, color, 2);
                setTxt('#ffffff'); pdf.setFontSize(10); pdf.setFont('helvetica', 'bold');
                pdf.text(title.toUpperCase(), ML + 4, y + 6);
                y += 12;
            };

            const progressBar = (x, ry, w, pct, filled, track) => {
                filledRect(x, ry, w, 4, track, 2);
                if (pct > 0) filledRect(x, ry, Math.max(0, w * (pct / 100)), 4, filled, 2);
            };

            const statusColor = (status) => {
                const m = { 'Severe': '#ef4444', 'Verify/Abnormal': '#f59e0b', 'Good/Ok': '#10b981' };
                return m[status] || '#6c757d';
            };


            // ── KPI Card ──
            const drawKPI = (label, value, color, bx, by, width, height = 22) => {
                filledRect(bx, by, width, height, '#1e293b', 3);
                filledRect(bx, by, 2, height, color, 1);
                setTxt(color); pdf.setFontSize(7); pdf.setFont('helvetica', 'bold');
                pdf.text(label.toUpperCase(), bx + 5, by + 6.5);
                pdf.setFontSize(18); pdf.setFont('helvetica', 'bold');
                pdf.text(String(value), bx + 5, by + 17);
            };

            // ════════════════ PAGE 1 — KPIs + Progress ════════════════
            drawPageBand();
            y = 20;

            setTxt('#EAB56F'); pdf.setFontSize(18); pdf.setFont('helvetica', 'bold');
            pdf.text('Analytics Dashboard', ML, y + 6);
            setTxt('#888888'); pdf.setFontSize(8); pdf.setFont('helvetica', 'normal');
            pdf.text('Report completion and criticality overview', ML, y + 12);

            if (dateFrom || dateTo || filterLocation !== 'all') {
                const chips = [
                    dateFrom && dateTo ? `From: ${new Date(dateFrom).toLocaleDateString()} - To: ${new Date(dateTo).toLocaleDateString()}` :
                        dateFrom ? `From: ${new Date(dateFrom).toLocaleDateString()}` :
                            dateTo ? `Until: ${new Date(dateTo).toLocaleDateString()}` : null,
                    filterLocation !== 'all' ? `Location: ${filterLocation}` : null,
                ].filter(Boolean).join('   •   ');
                filledRect(W - ML - 85, y + 1, 85, 9, '#f5ead4', 3);
                setTxt('#E37239'); pdf.setFontSize(7); pdf.setFont('helvetica', 'bold');
                pdf.text(chips, W - ML - 42.5, y + 7, { align: 'center' });
            }
            y += 18;

            const kpiList = [
                { label: 'Total Reports', value: totalReports, color: '#F9982F' },
                { label: 'Assets Monitored', value: uniqueAssetsCount, color: '#3B82F6' },
                { label: 'Completed', value: completedReports, color: '#10b981' },
                { label: 'Remaining', value: incompleteReports, color: '#ef4444' },
            ];
            const kW = (CONTENT_W - 6) / 4;
            kpiList.forEach((k, i) => drawKPI(k.label, k.value, k.color, ML + i * (kW + 2), y, kW));
            y += 27;

            sectionHeader('Overall Completion Progress', '#254252');
            filledRect(ML, y, CONTENT_W, 26, '#f0f2f7', 3);
            setDraw('#F9982F'); pdf.setLineWidth(0.4);
            pdf.roundedRect(ML, y, CONTENT_W, 26, 3, 3, 'S');
            setTxt('#171C2D'); pdf.setFontSize(8); pdf.setFont('helvetica', 'bold');
            pdf.text('Progress', ML + 4, y + 7);
            setTxt('#F9982F');
            pdf.text(`${percentage.toFixed(1)}%`, ML + CONTENT_W - 4, y + 7, { align: 'right' });
            progressBar(ML + 4, y + 10, CONTENT_W - 8, percentage, '#F9982F', '#ccced6');

            const pItems = [
                { dot: '#10b981', label: `Completed: ${completedReports}` },
                { dot: '#ef4444', label: `Remaining: ${incompleteReports}` },
                { dot: '#F9982F', label: `Total: ${totalReports}` },
            ];
            let px = ML + 4;
            pItems.forEach(({ dot, label }) => {
                filledRect(px, y + 17, 3, 3, dot, 1);
                setTxt('#171C2D'); pdf.setFontSize(7); pdf.setFont('helvetica', 'normal');
                pdf.text(label, px + 5, y + 20); px += 56;
            });
            y += 32;


            // ════════════════ PAGE 2 — PIE CHARTS ════════════════
            // ════════════════ CHARTS (same page) ════════════════

            sectionHeader('Charts', '#254252');


            const pieRadius = 40;
            const CARD_PAD = 12;
            const titleH = 16;
            const legendRows = 2;
            const legendH = legendRows * 8 + 10;
            const chartAreaH = CARD_PAD + titleH + pieRadius * 2 + legendH + CARD_PAD;
            const cardW = (CONTENT_W - 8) / 2;

            // ── Draw pie (called after card is drawn so it renders on top) ──
            const drawPieChart = (segments, cx, cy, radius, title, titleColor) => {
                const total = segments.reduce((s, d) => s + d.value, 0);
                if (total === 0 || segments.length === 0) {
                    setTxt('#888888'); pdf.setFontSize(8); pdf.setFont('helvetica', 'italic');
                    pdf.text('No data available', cx, cy, { align: 'center' });
                    return;
                }

                // ── Title ──
                setTxt(titleColor);
                pdf.setFontSize(9); pdf.setFont('helvetica', 'bold');
                pdf.text(title, cx, cy - radius - 9, { align: 'center' });
                // Underline
                setDraw(titleColor);
                pdf.setLineWidth(0.5);
                const dw = pdf.getTextWidth(title);
                pdf.line(cx - dw / 2, cy - radius - 6, cx + dw / 2, cy - radius - 6);

                // ── Slices ──
                const STEPS = 72;
                let startAngle = -Math.PI / 2;

                segments.forEach((seg) => {
                    if (seg.value === 0) return;
                    const sweep = (seg.value / total) * 2 * Math.PI;
                    const segSteps = Math.max(6, Math.round((sweep / (2 * Math.PI)) * STEPS));
                    const firstArcX = cx + radius * Math.cos(startAngle);
                    const firstArcY = cy + radius * Math.sin(startAngle);

                    const lines = [];
                    lines.push([firstArcX - cx, firstArcY - cy]);
                    for (let i = 1; i <= segSteps; i++) {
                        const prevA = startAngle + (sweep * (i - 1)) / segSteps;
                        const a = startAngle + (sweep * i) / segSteps;
                        lines.push([
                            cx + radius * Math.cos(a) - (cx + radius * Math.cos(prevA)),
                            cy + radius * Math.sin(a) - (cy + radius * Math.sin(prevA)),
                        ]);
                    }
                    const lastArcX = cx + radius * Math.cos(startAngle + sweep);
                    const lastArcY = cy + radius * Math.sin(startAngle + sweep);
                    lines.push([cx - lastArcX, cy - lastArcY]);

                    setFill(seg.color);
                    setDraw(seg.color);
                    pdf.setLineWidth(0);
                    pdf.lines(lines, cx, cy, [1, 1], 'F', true);

                    // White divider
                    setDraw('#ffffff');
                    pdf.setLineWidth(1.2);
                    pdf.line(cx, cy, firstArcX, firstArcY);

                    startAngle += sweep;
                });

                // Outer ring
                setDraw('#ffffff');
                pdf.setLineWidth(0.8);
                pdf.circle(cx, cy, radius, 'S');

                // ── % Labels inside slices ──
                startAngle = -Math.PI / 2;
                segments.forEach((seg) => {
                    if (seg.value === 0) return;
                    const sweep = (seg.value / total) * 2 * Math.PI;
                    const midAngle = startAngle + sweep / 2;
                    const pct = ((seg.value / total) * 100).toFixed(1);
                    if (sweep > 0.22) {
                        const lx = cx + radius * 0.65 * Math.cos(midAngle);
                        const ly = cy + radius * 0.65 * Math.sin(midAngle);
                        setTxt('#ffffff');
                        pdf.setFontSize(7); pdf.setFont('helvetica', 'bold');
                        pdf.text(`${pct}%`, lx, ly + 1, { align: 'center' });
                    }
                    startAngle += sweep;
                });

                // ── Legend — 2 columns, centered under pie, fully inside card ──
                const legendTopY = cy + radius + 10;
                const cols = 1;
                const colW = cardW - CARD_PAD * 2;
                const legendLeft = cx - cardW / 2 + CARD_PAD;

                segments.forEach((seg, i) => {
                    const pct = ((seg.value / total) * 100).toFixed(1);
                    const col = i % cols;
                    const row = Math.floor(i / cols);
                    const lx = legendLeft + col * colW;
                    const ly = legendTopY + row * 8;

                    filledRect(lx, ly - 3, 5, 5, seg.color, 1.5);
                    setTxt('#cccccc');
                    pdf.setFontSize(6); pdf.setFont('helvetica', 'normal');
                    const short = seg.label;
                    pdf.text(`${short}  ${seg.value} (${pct}%)`, lx + 7, ly + 0.5);
                });
            };

            // ── LEFT CARD ──
            const leftCardX = ML;
            const leftCX = leftCardX + cardW / 2;
            const leftCY = y + CARD_PAD + titleH + pieRadius;

            filledRect(leftCardX, y, cardW, chartAreaH, '#0f1c36', 4);
            filledRect(leftCardX, y, cardW, 3, '#3b82f6', 4);
            setDraw('#3b82f6'); pdf.setLineWidth(0.5);
            pdf.roundedRect(leftCardX, y, cardW, chartAreaH, 4, 4, 'S');

            const critSeg = Object.entries(statusStats).map(([status, data]) => ({
                label: status,
                value: data.count,
                color: statusColor(status),
            }));
            drawPieChart(critSeg, leftCX, leftCY, pieRadius, 'Analysis of Oil Samples', '#3b82f6');

            // ── RIGHT CARD ──
            const rightCardX = ML + cardW + 8;
            const rightCX = rightCardX + cardW / 2;
            const rightCY = leftCY;

            filledRect(rightCardX, y, cardW, chartAreaH, '#0a1f18', 4);
            filledRect(rightCardX, y, cardW, 3, '#10b981', 4);
            setDraw('#10b981'); pdf.setLineWidth(0.5);
            pdf.roundedRect(rightCardX, y, cardW, chartAreaH, 4, 4, 'S');

            const tvSeg = [
                { label: 'Wear Metals', value: parameterDistribution.wearMetals, color: '#8B5CF6' },
                { label: 'Contaminants', value: parameterDistribution.contaminants, color: '#10b981' },
                { label: 'Chemistry & Viscosity', value: parameterDistribution.chemistryAndViscosity, color: '#F59E0B' },
            ].filter(p => p.value > 0);
            drawPieChart(tvSeg, rightCX, rightCY, pieRadius, 'TriVector Chart', '#10b981');

            y += chartAreaH + 10;


            // xxx
            // ════════════════ BAR CHART — Asset Components by Criticality ════════════════
            drawFooter();
            pdf.addPage();
            drawPageBand();
            y = 20;

            sectionHeader('Asset Components by Criticality Analysis Status', '#254252');

            if (assetComponentChartData.length === 0) {
                setTxt('#888888'); pdf.setFontSize(8);
                pdf.text('No component data available.', ML + 4, y + 8);
                y += 20;
            } else {
                // ── Dynamic sizing ──
                const numBars = assetComponentChartData.length;
                const maxTotal = Math.max(
                    ...assetComponentChartData.map(d => (d.good || 0) + (d.abnormal || 0) + (d.severe || 0)),
                    1
                );

                // Allocate bar width based on count; clamp label height
                const chartInnerX = ML + 18;
                const chartInnerW = CONTENT_W - 22;
                const barGroupW = chartInnerW / numBars;
                const barW = Math.max(4, Math.min(barGroupW * 0.55, 22));

                // Estimate max label lines needed
                const maxLabelLines = Math.max(...assetComponentChartData.map(item => {
                    const label = item.component || 'Unknown';
                    return pdf.splitTextToSize(label, Math.max(barGroupW - 2, 12)).length;
                }));
                const labelAreaH = Math.min(maxLabelLines * 5 + 4, 22);

                const BAR_INNER_H = 80; // actual bar drawing area height
                const BAR_AREA_H = BAR_INNER_H + labelAreaH + 20; // card total height (bars + labels + legend)
                const BAR_CARD_H = BAR_AREA_H + 8;

                filledRect(ML, y, CONTENT_W, BAR_CARD_H, '#0f172a', 4);
                setDraw('#ff9900'); pdf.setLineWidth(0.4);
                pdf.roundedRect(ML, y, CONTENT_W, BAR_CARD_H, 4, 4, 'S');

                const chartPadTop = 8;
                const chartInnerY = y + chartPadTop;

                // Y-axis gridlines & labels — nice round steps
                const ySteps = Math.min(maxTotal, 5);
                const stepVal = Math.ceil(maxTotal / ySteps);
                const adjustedMax = stepVal * ySteps;

                for (let i = 0; i <= ySteps; i++) {
                    const val = stepVal * i;
                    const gy = chartInnerY + BAR_INNER_H - (BAR_INNER_H * (val / adjustedMax));
                    setDraw('#2a3a55'); pdf.setLineWidth(0.2);
                    pdf.setLineDashPattern([1.5, 2], 0);
                    pdf.line(chartInnerX, gy, chartInnerX + chartInnerW, gy);
                    pdf.setLineDashPattern([], 0);
                    setTxt('#888888'); pdf.setFontSize(5.5); pdf.setFont('helvetica', 'normal');
                    pdf.text(String(val), chartInnerX - 2, gy + 1.5, { align: 'right' });
                }

                // Bars
                assetComponentChartData.forEach((item, i) => {
                    const bx = chartInnerX + i * barGroupW + (barGroupW - barW) / 2;
                    const total = (item.good || 0) + (item.abnormal || 0) + (item.severe || 0);
                    let stackY = chartInnerY + BAR_INNER_H;

                    const segments = [
                        { value: item.good || 0, color: '#28a745' },
                        { value: item.abnormal || 0, color: '#ec8a2f' },
                        { value: item.severe || 0, color: '#dd3445' },
                    ];

                    let topY = stackY;
                    segments.forEach(seg => {
                        if (seg.value === 0) return;
                        const segH = (seg.value / adjustedMax) * BAR_INNER_H;
                        stackY -= segH;
                        filledRect(bx, stackY, barW, segH, seg.color, 1);
                        topY = stackY;
                    });

                    // Total label above bar
                    if (total > 0) {
                        setTxt('#ffffff'); pdf.setFontSize(5.5); pdf.setFont('helvetica', 'bold');
                        pdf.text(String(total), bx + barW / 2, topY - 2, { align: 'center' });
                    }

                    // X-axis label (wrapped, centered under bar)
                    const label = item.component || 'Unknown';
                    const labelMaxW = Math.max(barGroupW - 2, 12);
                    const wrappedLabel = pdf.splitTextToSize(label, labelMaxW);
                    setTxt('#aaaaaa'); pdf.setFontSize(4.8); pdf.setFont('helvetica', 'normal');
                    const labelBaseY = chartInnerY + BAR_INNER_H + 5;
                    wrappedLabel.slice(0, Math.ceil(labelAreaH / 5)).forEach((line, li) => {
                        pdf.text(line, bx + barW / 2, labelBaseY + li * 4.5, { align: 'center' });
                    });
                });

                // Legend row
                const legendItems2 = [
                    { label: 'Good/Ok', color: '#28a745' },
                    { label: 'Verify/Abnormal', color: '#ec8a2f' },
                    { label: 'Severe', color: '#dd3445' },
                ];
                const legendY2 = y + BAR_CARD_H - 9;
                let lx2 = chartInnerX;
                legendItems2.forEach(({ label, color }) => {
                    filledRect(lx2, legendY2 - 3, 4, 4, color, 1.5);
                    setTxt('#cccccc'); pdf.setFontSize(6); pdf.setFont('helvetica', 'normal');
                    pdf.text(label, lx2 + 6, legendY2 + 0.5);
                    lx2 += pdf.getTextWidth(label) + 14;
                });

                y += BAR_CARD_H + 8;
            }

            // // ════════════════ COMPONENT PIE CHARTS — TriVector Distribution ════════════════
            // checkPage(40);
            // sectionHeader('TriVector Distribution by Component', '#254252');

            // if (assetComponentDistribution.length === 0) {
            //     setTxt('#888888'); pdf.setFontSize(8);
            //     pdf.text('No component data available.', ML + 4, y + 8);
            //     y += 20;
            // } else {
            //     const COMP_COLS = 3;
            //     const COMP_GAP = 4;
            //     const COMP_CARD_W = (CONTENT_W - COMP_GAP * (COMP_COLS - 1)) / COMP_COLS;

            //     // Fixed layout constants
            //     const HEADER_H = 18;    // title + subtitle
            //     const PIE_R = 20;
            //     const PIE_DIAM = PIE_R * 2;
            //     const LEGEND_ROW_H = 7;
            //     const LEGEND_PAD_TOP = 4;
            //     const CARD_PAD_V = 8;

            //     const NUM_LEGEND_ROWS = 3; // always 3 items: Wear Metals, Contaminants, Chem & Visc
            //     const LEGEND_H = NUM_LEGEND_ROWS * LEGEND_ROW_H + LEGEND_PAD_TOP;
            //     const COMP_CARD_H = CARD_PAD_V + HEADER_H + PIE_DIAM + LEGEND_H + CARD_PAD_V;

            //     let compCol = 0;
            //     let compRowStartY = y;

            //     assetComponentDistribution.forEach((item, index) => {
            //         // Start a new row of cards
            //         if (compCol === COMP_COLS) {
            //             compCol = 0;
            //             compRowStartY += COMP_CARD_H + COMP_GAP;
            //             checkPage(COMP_CARD_H + COMP_GAP);
            //         }

            //         const cardX = ML + compCol * (COMP_CARD_W + COMP_GAP);
            //         const cardY = compRowStartY;

            //         // Card background + border
            //         filledRect(cardX, cardY, COMP_CARD_W, COMP_CARD_H, '#0f172a', 3);
            //         filledRect(cardX, cardY, COMP_CARD_W, 2.5, '#10b981', 2);
            //         setDraw('#10b981'); pdf.setLineWidth(0.3);
            //         pdf.roundedRect(cardX, cardY, COMP_CARD_W, COMP_CARD_H, 3, 3, 'S');

            //         // Title — truncate to fit
            //         const titleMaxW = COMP_CARD_W - 8;
            //         let titleText = item.component || 'Unknown';
            //         setTxt('#10b981'); pdf.setFontSize(6.5); pdf.setFont('helvetica', 'bold');
            //         // Truncate if too wide
            //         while (pdf.getTextWidth(titleText) > titleMaxW && titleText.length > 4) {
            //             titleText = titleText.slice(0, -1);
            //         }
            //         if (titleText !== (item.component || 'Unknown')) titleText += '…';
            //         pdf.text(titleText, cardX + COMP_CARD_W / 2, cardY + CARD_PAD_V + 4, { align: 'center' });

            //         const pieData = [
            //             { name: 'Wear Metals', value: item.wearMetals || 0, color: '#8B5CF6' },
            //             { name: 'Contaminants', value: item.contaminants || 0, color: '#10b981' },
            //             { name: 'Chem & Visc', value: item.chemistryAndViscosity || 0, color: '#F59E0B' },
            //         ].filter(d => d.value > 0);

            //         const total = pieData.reduce((s, d) => s + d.value, 0);

            //         // Subtitle: total reports
            //         setTxt('#888888'); pdf.setFontSize(5.5); pdf.setFont('helvetica', 'normal');
            //         pdf.text(`${total} report${total !== 1 ? 's' : ''}`, cardX + COMP_CARD_W / 2, cardY + CARD_PAD_V + 10, { align: 'center' });

            //         // Pie center — horizontally centered in card
            //         const pieCX = cardX + COMP_CARD_W / 2;
            //         const pieCY = cardY + CARD_PAD_V + HEADER_H + PIE_R;

            //         if (pieData.length === 0 || total === 0) {
            //             setTxt('#555555'); pdf.setFontSize(6); pdf.setFont('helvetica', 'normal');
            //             pdf.text('No data', pieCX, pieCY + 2, { align: 'center' });
            //         } else {
            //             // Draw pie slices
            //             const STEPS = 60;
            //             let startAngle = -Math.PI / 2;
            //             pieData.forEach((seg) => {
            //                 const sweep = (seg.value / total) * 2 * Math.PI;
            //                 const segSteps = Math.max(4, Math.round((sweep / (2 * Math.PI)) * STEPS));
            //                 const firstArcX = pieCX + PIE_R * Math.cos(startAngle);
            //                 const firstArcY = pieCY + PIE_R * Math.sin(startAngle);
            //                 const lines = [[firstArcX - pieCX, firstArcY - pieCY]];
            //                 for (let si = 1; si <= segSteps; si++) {
            //                     const prevA = startAngle + (sweep * (si - 1)) / segSteps;
            //                     const a = startAngle + (sweep * si) / segSteps;
            //                     lines.push([
            //                         pieCX + PIE_R * Math.cos(a) - (pieCX + PIE_R * Math.cos(prevA)),
            //                         pieCY + PIE_R * Math.sin(a) - (pieCY + PIE_R * Math.sin(prevA)),
            //                     ]);
            //                 }
            //                 const lastArcX = pieCX + PIE_R * Math.cos(startAngle + sweep);
            //                 const lastArcY = pieCY + PIE_R * Math.sin(startAngle + sweep);
            //                 lines.push([pieCX - lastArcX, pieCY - lastArcY]);
            //                 setFill(seg.color); setDraw(seg.color); pdf.setLineWidth(0);
            //                 pdf.lines(lines, pieCX, pieCY, [1, 1], 'F', true);
            //                 // White divider line
            //                 setDraw('#0f172a'); pdf.setLineWidth(0.8);
            //                 pdf.line(pieCX, pieCY, firstArcX, firstArcY);
            //                 startAngle += sweep;
            //             });
            //             // Outer ring
            //             setDraw('#1e293b'); pdf.setLineWidth(0.5);
            //             pdf.circle(pieCX, pieCY, PIE_R, 'S');

            //             // % labels inside slices
            //             startAngle = -Math.PI / 2;
            //             pieData.forEach((seg) => {
            //                 const sweep = (seg.value / total) * 2 * Math.PI;
            //                 if (sweep > 0.35) {
            //                     const midAngle = startAngle + sweep / 2;
            //                     const lx3 = pieCX + PIE_R * 0.6 * Math.cos(midAngle);
            //                     const ly3 = pieCY + PIE_R * 0.6 * Math.sin(midAngle);
            //                     setTxt('#ffffff'); pdf.setFontSize(5); pdf.setFont('helvetica', 'bold');
            //                     pdf.text(`${((seg.value / total) * 100).toFixed(0)}%`, lx3, ly3 + 1, { align: 'center' });
            //                 }
            //                 startAngle += sweep;
            //             });
            //         }

            //         // Legend — always 3 rows (or however many items), centered below pie
            //         const allLegendItems = [
            //             { name: 'Wear Metals', value: item.wearMetals || 0, color: '#8B5CF6' },
            //             { name: 'Contaminants', value: item.contaminants || 0, color: '#10b981' },
            //             { name: 'Chem & Visc', value: item.chemistryAndViscosity || 0, color: '#F59E0B' },
            //         ];

            //         const legendBlockW = COMP_CARD_W - 10;
            //         const legendBlockX = cardX + 5;
            //         const legendBlockY = cardY + CARD_PAD_V + HEADER_H + PIE_DIAM + LEGEND_PAD_TOP + 2;

            //         allLegendItems.forEach((leg, li) => {
            //             const ly4 = legendBlockY + li * LEGEND_ROW_H;
            //             filledRect(legendBlockX, ly4 - 2.5, 4, 4, leg.color, 1);
            //             setTxt('#aaaaaa'); pdf.setFontSize(5.2); pdf.setFont('helvetica', 'normal');
            //             // Truncate legend name if needed
            //             let legName = leg.name;
            //             const maxLegW = legendBlockW - 20;
            //             while (pdf.getTextWidth(legName) > maxLegW && legName.length > 4) {
            //                 legName = legName.slice(0, -1);
            //             }
            //             if (legName !== leg.name) legName += '…';
            //             pdf.text(legName, legendBlockX + 6, ly4 + 0.5);
            //             // Value right-aligned
            //             setTxt(leg.color); pdf.setFontSize(5.5); pdf.setFont('helvetica', 'bold');
            //             const pct = total > 0 ? `${leg.value} (${((leg.value / total) * 100).toFixed(0)}%)` : '0';
            //             pdf.text(pct, legendBlockX + legendBlockW, ly4 + 0.5, { align: 'right' });
            //         });

            //         compCol++;
            //     });

            //     // Advance y past last row
            //     const totalCompRows = Math.ceil(assetComponentDistribution.length / COMP_COLS);
            //     y = compRowStartY + totalCompRows * (COMP_CARD_H + COMP_GAP) + 4;
            // }

            // ════════════════ PAGE 3+ — REPORTS TABLE ════════════════
            drawFooter();
            pdf.addPage();
            drawPageBand();
            y = 20;

            sectionHeader(`Completed Reports  (${completedReportsList.length} total)`, '#254252');

            if (filterYear !== 'all' || filterLocation !== 'all') {
                const chips = [
                    filterYear !== 'all' ? `Year: ${filterYear}` : null,
                    filterLocation !== 'all' ? `Location: ${filterLocation}` : null,
                ].filter(Boolean).join('   •   ');
                setTxt('#888888'); pdf.setFontSize(7); pdf.setFont('helvetica', 'italic');
                pdf.text(`Active filters — ${chips}`, ML, y); y += 6;
            }

            const COL_W = [8, 28, 52, 34, 30, 30];
            const HEADS = ['#', 'Asset ID', 'Asset / Component', 'Trivector', 'Criticality', 'Date'];
            const ROW_H = 10;

            const drawTableHeader = () => {
                filledRect(ML, y, CONTENT_W, 7, '#1e293b', 2);
                setTxt('#EAB56F'); pdf.setFontSize(7); pdf.setFont('helvetica', 'bold');
                let cx = ML + 2;
                HEADS.forEach((h, i) => { pdf.text(h, cx, y + 5); cx += COL_W[i]; });
                y += 7;
            };

            drawTableHeader();

            completedReportsList.forEach((report, idx) => {
                if (y + ROW_H > H - 14) {
                    drawFooter(); pdf.addPage(); drawPageBand(); y = 20; drawTableHeader();
                }

                filledRect(ML, y, CONTENT_W, ROW_H, idx % 2 === 0 ? '#f0f2f7' : '#ffffff', 1);

                const tvColor =
                    report.trivector === 'rotating-machine' ? '#00BFFF' :
                        report.trivector === 'stationary-engine' ? '#32CD32' :
                            report.trivector === 'mobile-engine' ? '#FFA500' : '#888888';
                filledRect(ML, y, 1.5, ROW_H, tvColor, 0);

                pdf.setFontSize(7); pdf.setFont('helvetica', 'normal');
                let cx = ML + 2;

                setTxt('#888888'); pdf.text(String(idx + 1), cx, y + 6.5); cx += COL_W[0];

                filledRect(cx, y + 1.5, COL_W[1] - 2, 7, '#e6e8f5', 2);
                setTxt('#3a3986'); pdf.setFont('helvetica', 'bold');
                pdf.text(String(report.asset_id ?? '-'), cx + 1.5, y + 6.5);
                pdf.setFont('helvetica', 'normal'); cx += COL_W[1];

                setTxt('#171C2D'); pdf.setFont('helvetica', 'bold');
                pdf.text((pdf.splitTextToSize(report.asset_name ?? '-', COL_W[2] - 2))[0] || '-', cx, y + 5);
                setTxt('#555555'); pdf.setFont('helvetica', 'normal');
                pdf.text((pdf.splitTextToSize(report.asset_component_name ?? '-', COL_W[2] - 2))[0] || '-', cx, y + 9);
                cx += COL_W[2];

                setFill(tvColor); pdf.roundedRect(cx, y + 2, COL_W[3] - 4, 6, 3, 3, 'F');
                setTxt('#ffffff'); pdf.setFont('helvetica', 'bold');
                pdf.text(String(report.trivector_formatted ?? '-'), cx + 2, y + 6.5);
                pdf.setFont('helvetica', 'normal'); cx += COL_W[3];

                filledRect(cx, y + 2, COL_W[4] - 4, 6, statusColor(report.criticality_analysis_status), 3);
                setTxt('#ffffff'); pdf.setFont('helvetica', 'bold');
                pdf.text(String(report.criticality_analysis_status ?? 'Unknown'), cx + 2, y + 6.5);
                pdf.setFont('helvetica', 'normal'); cx += COL_W[4];

                setTxt('#555555');
                pdf.text(
                    report.analysis_date
                        ? new Date(report.analysis_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                        : 'N/A',
                    cx, y + 6.5
                );

                setDraw('#d5d8e0'); pdf.setLineWidth(0.2);
                pdf.line(ML, y + ROW_H, ML + CONTENT_W, y + ROW_H);
                y += ROW_H;
            });

            if (completedReportsList.length === 0) {
                setTxt('#888888'); pdf.setFontSize(8);
                pdf.text('No completed reports to display.', ML + 4, y + 8);
            }

            const totalPages = pdf.internal.getNumberOfPages();
            for (let p = 1; p <= totalPages; p++) { pdf.setPage(p); drawFooter(); }

            pdf.save(`Analytics_Dashboard_${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (err) {
            console.error('PDF generation failed:', err);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };




    // Replace the filterYear state with dateFrom and dateTo for main analytics
    // You already have dateFrom and dateTo states, so we'll use those

    // Update the useEffect dependency array and logic
    useEffect(() => {
        const fetch = async () => {
            try {
                setIsDataLoaded(false);

                const resAsset = await axios.get(`${config.baseApi}/assets/get-all-assets`);
                const dataAsset = resAsset.data || [];
                setAllAssetsData(dataAsset);
                const assetMapping = {};
                const trivectorMapping = {};
                const locationMapping = {};
                dataAsset.forEach(asset => {
                    assetMapping[asset.asset_id] = asset.asset_name;
                    trivectorMapping[asset.asset_id] = asset.trivector || 'unknown';
                    locationMapping[asset.asset_id] = asset.asset_location || 'Unknown';
                });
                setAssetMap(assetMapping);
                setTrivectorMap(trivectorMapping);
                setLocationMap(locationMapping);

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

                const allCompletedReports = data.filter(report =>
                    report.level1 === '1' &&
                    report.level2 === '1' &&
                    report.level3 === '1'
                );

                const years = new Set();
                const locs = new Set();
                allCompletedReports.forEach(report => {
                    if (report.analysis_date) {
                        const year = new Date(report.analysis_date).getFullYear();
                        if (!isNaN(year)) years.add(year);
                    }
                    const fullLoc = locationMapping[report.asset_id] || 'Unknown';
                    const shortLoc = fullLoc.split(' - ')[0].trim();
                    locs.add(shortLoc);
                });
                setAvailableYears(Array.from(years).sort((a, b) => b - a));
                setAvailableLocations(Array.from(locs).sort());

                let filteredCompletedData = allCompletedReports;
                let allFilteredData = data;

                // Replace filterYear with dateFrom and dateTo
                if (dateFrom || dateTo) {
                    filteredCompletedData = filteredCompletedData.filter(report => {
                        if (!report.analysis_date) return false;
                        const reportDate = new Date(report.analysis_date);
                        reportDate.setHours(0, 0, 0, 0);

                        if (dateFrom && dateTo) {
                            const fromDate = new Date(dateFrom);
                            const toDate = new Date(dateTo);
                            fromDate.setHours(0, 0, 0, 0);
                            toDate.setHours(23, 59, 59, 999);
                            return reportDate >= fromDate && reportDate <= toDate;
                        } else if (dateFrom) {
                            const fromDate = new Date(dateFrom);
                            fromDate.setHours(0, 0, 0, 0);
                            return reportDate >= fromDate;
                        } else if (dateTo) {
                            const toDate = new Date(dateTo);
                            toDate.setHours(23, 59, 59, 999);
                            return reportDate <= toDate;
                        }
                        return true;
                    });

                    allFilteredData = allFilteredData.filter(report => {
                        if (!report.analysis_date) return false;
                        const reportDate = new Date(report.analysis_date);
                        reportDate.setHours(0, 0, 0, 0);

                        if (dateFrom && dateTo) {
                            const fromDate = new Date(dateFrom);
                            const toDate = new Date(dateTo);
                            fromDate.setHours(0, 0, 0, 0);
                            toDate.setHours(23, 59, 59, 999);
                            return reportDate >= fromDate && reportDate <= toDate;
                        } else if (dateFrom) {
                            const fromDate = new Date(dateFrom);
                            fromDate.setHours(0, 0, 0, 0);
                            return reportDate >= fromDate;
                        } else if (dateTo) {
                            const toDate = new Date(dateTo);
                            toDate.setHours(23, 59, 59, 999);
                            return reportDate <= toDate;
                        }
                        return true;
                    });
                }

                if (filterLocation !== 'all') {
                    filteredCompletedData = filteredCompletedData.filter(report => {
                        const fullLoc = locationMapping[report.asset_id] || 'Unknown';
                        const shortLoc = fullLoc.split(' - ')[0].trim();
                        return shortLoc === filterLocation;
                    });
                    allFilteredData = allFilteredData.filter(report => {
                        const fullLoc = locationMapping[report.asset_id] || 'Unknown';
                        const shortLoc = fullLoc.split(' - ')[0].trim();
                        return shortLoc === filterLocation;
                    });
                }

                const totalAllReports = allFilteredData.length;
                setTotalReports(totalAllReports);

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
                        count,
                        percentage: completedCount > 0 ? (count / completedCount) * 100 : 0
                    };
                });
                setStatusStats(statusStatsData);

                const completedWithNames = filteredCompletedData.map(report => ({
                    ...report,
                    asset_name: assetMapping[report.asset_id] || 'Unknown Asset',
                    asset_component_name: componentMapping[report.asset_component_id] || 'Unknown Component',
                    asset_location: locationMapping[report.asset_id] || 'Unknown',
                    trivector: trivectorMapping[report.asset_id] || 'unknown',
                    trivector_formatted: formatTrivector(trivectorMapping[report.asset_id] || 'unknown')
                }));
                setCompletedReportsList(completedWithNames);

                const calculateDistributionWithLocalMap = () => {
                    let totalWearMetals = 0;
                    let totalContaminants = 0;
                    let totalChemistryAndViscosity = 0;

                    completedWithNames.forEach(report => {
                        const trivector = trivectorMapping[report.asset_id] || 'unknown';
                        const counts = countParametersWithData(report, trivector);

                        if (counts.wearMetalCount > 0) totalWearMetals += 1;
                        if (counts.contaminantCount > 0) totalContaminants += 1;
                        if (counts.chemistryAndViscosityCount > 0) totalChemistryAndViscosity += 1;
                    });

                    return {
                        wearMetals: totalWearMetals,
                        contaminants: totalContaminants,
                        chemistryAndViscosity: totalChemistryAndViscosity
                    };
                };

                const distribution = calculateDistributionWithLocalMap();
                setParameterDistribution(distribution);

                const calculateAssetComponentDistribution = () => {
                    const componentStats = {};

                    completedWithNames.forEach(report => {
                        const component = report.asset_component_name || "Unknown";

                        if (!componentStats[component]) {
                            componentStats[component] = {
                                component,
                                wearMetals: 0,
                                contaminants: 0,
                                chemistryAndViscosity: 0
                            };
                        }

                        const trivector = trivectorMapping[report.asset_id] || "unknown";
                        const counts = countParametersWithData(report, trivector);

                        if (counts.wearMetalCount > 0)
                            componentStats[component].wearMetals++;

                        if (counts.contaminantCount > 0)
                            componentStats[component].contaminants++;

                        if (counts.chemistryAndViscosityCount > 0)
                            componentStats[component].chemistryAndViscosity++;
                    });

                    return Object.values(componentStats);
                };

                setAssetComponentDistribution(
                    calculateAssetComponentDistribution()
                );

                setIsDataLoaded(true);

                if (filterLocation !== lastLoggedLocation || (filterLocation === 'all' && lastLoggedLocation !== 'all')) {
                    logFilteredReportsByLocation(filterLocation, completedWithNames);
                    setLastLoggedLocation(filterLocation);
                }

            } catch (err) {
                console.log('Unable to fetch all data: ', err);
                setIsDataLoaded(true);
            }
        }
        fetch();
    }, [dateFrom, dateTo, filterLocation]); // Remove filterYear, add dateFrom and dateTo

    const filteredReports = completedReportsList.filter(report => {
        const matchesSearch = searchTerm === '' ||
            report.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.asset_component_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.asset_id.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterCriticality === 'all' ||
            report.criticality_analysis_status === filterCriticality;

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

    const handleRowClick = (report) => {
        console.clear();
        console.log('%c🔬 WEAR METALS, CONTAMINANTS, CHEMISTRY & VISCOSITY ANALYSIS', 'color: #ffa600; font-size: 16px; font-weight: bold');
        console.log('═'.repeat(80));
        logReportParameters(report, report.trivector, report.asset_name);

        console.group('📋 ADDITIONAL INFORMATION');
        console.log(`🚦 Criticality Status: ${report.criticality_analysis_status || 'Not Set'}`);
        console.log(`📍 Location: ${report.asset_location}`);
        console.log(`🆔 Analysis ID: ${report.asset_analysis_id}`);
        if (report.recommendations) {
            console.log(`💡 Recommendations: ${report.recommendations}`);
        }
        console.groupEnd();
    };

    const criticalityChartData = Object.entries(statusStats).map(([status, data]) => ({
        name: status,
        value: data.count
    }));

    const parameterChartData = [
        { name: 'Wear Metals', value: parameterDistribution.wearMetals, color: '#502ead' },
        { name: 'Contaminants', value: parameterDistribution.contaminants, color: '#1d9130' },
        { name: 'Chemistry & Viscosity', value: parameterDistribution.chemistryAndViscosity, color: '#ca7900' }
    ].filter(item => item.value > 0);

    const assetComponentChartData = Object.values(
        completedReportsList.reduce((acc, report) => {
            const component = report.asset_component_name || "Unknown";

            if (!acc[component]) {
                acc[component] = {
                    component,
                    severe: 0,
                    abnormal: 0,
                    good: 0
                };
            }

            switch (report.criticality_analysis_status) {
                case "Severe":
                    acc[component].severe++;
                    break;

                case "Verify/Abnormal":
                    acc[component].abnormal++;
                    break;

                case "Good/Ok":
                    acc[component].good++;
                    break;

                default:
                    break;
            }

            return acc;
        }, {})
    );

    const assetComponentPieData = assetComponentChartData.map(item => ({
        component: item.component,
        data: [
            {
                name: "Good/Ok",
                value: item.good,
                fill: "#28a745"
            },
            {
                name: "Verify/Abnormal",
                value: item.abnormal,
                fill: "#ec8a2f"
            },
            {
                name: "Severe",
                value: item.severe,
                fill: "#dd3445"
            }
        ].filter(x => x.value > 0)
    }));

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
        const RADIAN = Math.PI / 180;
        const radius = outerRadius * 1.1;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="#fff"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                style={{ fontSize: '11px', fontWeight: 500 }}
            >
                {`${(percent * 100).toFixed(1)}%`}
            </text>
        );
    };

    if (!isDataLoaded) {
        return (
            <div style={{
                background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{ color: '#fff', fontSize: '18px' }}>Loading analytics data...</div>
            </div>
        );
    }

    return (
        <div style={{
            background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
            minHeight: '100vh',
            padding: '50px 24px',
            position: 'relative',
            overflow: 'auto',
        }}>
            <style>
                {`
                    @keyframes float {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        33% { transform: translate(50px, -50px) rotate(120deg); }
                        66% { transform: translate(-30px, 30px) rotate(240deg); }
                    }
                    
                    .spinner-border {
                        display: inline-block;
                        width: 1rem;
                        height: 1rem;
                        vertical-align: text-bottom;
                        border: 0.2em solid currentColor;
                        border-right-color: transparent;
                        border-radius: 50%;
                        animation: spinner-border 0.75s linear infinite;
                    }
                    
                    @keyframes spinner-border {
                        to { transform: rotate(360deg); }
                    }
                    
                    .visually-hidden {
                        position: absolute;
                        width: 1px;
                        height: 1px;
                        padding: 0;
                        margin: -1px;
                        overflow: hidden;
                        clip: rect(0, 0, 0, 0);
                        white-space: nowrap;
                        border: 0;
                    }
                    
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
                    
             
                    .pdf-section {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                    
                    @media print {
                        .no-print {
                            display: none !important;
                        }
                        .pdf-section {
                            break-inside: avoid;
                            page-break-inside: avoid;
                        }
                    }
                `}
            </style>

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

            <Container fluid style={{ position: 'relative', zIndex: 2, maxWidth: '2000px', margin: '0 auto' }}>

                <div ref={dashboardRef}>

                    {/* Header Section - Replace the Year dropdown with Date Range picker */}
                    <div className="pdf-section">
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

                                    <div className="no-print" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>


                                        {/* Date Range Picker - Replaces the Year dropdown */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <label style={{ color: 'rgba(255, 187, 0, 0.7)', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                                                Date Range
                                            </label>

                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>From</span>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        background: 'rgba(0,0,0,0.3)',
                                                        borderRadius: '6px',
                                                        padding: '8px 12px',
                                                        gap: '8px',
                                                        border: '2px solid rgba(255,255,255,0.1)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        position: 'relative'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#ff7b00'}
                                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
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
                                                            width: '130px',
                                                            padding: '0',
                                                            position: 'relative',
                                                            zIndex: 1
                                                        }}
                                                        placeholder="From"
                                                    />
                                                </div>
                                                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>To</span>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        background: 'rgba(0,0,0,0.3)',
                                                        borderRadius: '6px',
                                                        padding: '8px 12px',
                                                        gap: '8px',
                                                        border: '2px solid rgba(255,255,255,0.1)',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        position: 'relative'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#ff7b00'}
                                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
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
                                                            width: '130px',
                                                            padding: '0',
                                                            position: 'relative',
                                                            zIndex: 1
                                                        }}
                                                        placeholder="To"
                                                    />
                                                </div>
                                                {(dateFrom || dateTo) && (
                                                    <button
                                                        onClick={() => {
                                                            setDateFrom('');
                                                            setDateTo('');
                                                            setCurrentPage(1);
                                                        }}
                                                        style={{
                                                            background: 'rgba(233, 181, 111, 0.2)',
                                                            border: '1px solid rgba(233, 181, 111, 0.3)',
                                                            borderRadius: '6px',
                                                            padding: '6px 10px',
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
                                                        <FeatherIcon icon="x" size={12} /> Clear
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Location dropdown - keep as is */}
                                        {availableLocations.length > 0 && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <label style={{
                                                    color: 'rgba(255, 187, 0, 0.7)', fontSize: '12px',
                                                    fontWeight: '500', textTransform: 'uppercase',
                                                    letterSpacing: '0.5px', display: 'block'
                                                }}>
                                                    Location:
                                                </label>
                                                <select
                                                    value={filterLocation}
                                                    onChange={(e) => handleLocationChange(e.target.value)}
                                                    style={{
                                                        background: 'rgba(0,0,0,0.3)',
                                                        border: '2px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '6px',
                                                        padding: '8px 60px 8px 12px',
                                                        color: '#ffffff',
                                                        fontSize: '14px',
                                                        cursor: 'pointer',
                                                        outline: 'none',
                                                    }}
                                                    onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                                >
                                                    <option value="all">All Locations</option>
                                                    {availableLocations.map(loc => (
                                                        <option key={loc} value={loc}>{loc}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Download button */}
                                        <div className="no-print" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <button
                                                onClick={handleDownloadDashboardPDF}
                                                disabled={isDownloading}
                                                style={{
                                                    background: 'linear-gradient(135deg, #EAB56F, #F9982F, #E37239)',
                                                    border: '2px solid #EAB56F',
                                                    borderRadius: '15px',
                                                    padding: '10px 24px',
                                                    color: '#ffff',
                                                    fontWeight: '600',
                                                    fontSize: '14px',
                                                    cursor: isDownloading ? 'not-allowed' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 4px 15px rgba(234,181,111,0.2)',
                                                    opacity: isDownloading ? 0.7 : 1
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isDownloading) {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(234,181,111,0.4)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(234,181,111,0.2)';
                                                }}
                                            >
                                                {isDownloading ? (
                                                    <>
                                                        <div className="spinner-border" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                        Generating PDF...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FeatherIcon icon="download" size={18} />
                                                        Download PDF
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    {/* KPI Cards */}
                    <div className="pdf-section">
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
                                            {filterLocation !== 'all' && (
                                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', marginTop: '2px' }}>
                                                    Location: {filterLocation}
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
                    </div>

                    {/* Progress Section */}
                    <div className="pdf-section">
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
                    </div>

                    {/* Bar chart */}
                    <Row className="mb-4">
                        <Col>
                            <div style={{
                                background: "rgba(28, 33, 54, 0.29)",
                                borderRadius: "12px",
                                border: '2px solid #ff9900',
                                padding: "20px"
                            }}>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "20px"
                                    }}
                                >
                                    <h4
                                        style={{
                                            color: "#ce7b0e",
                                            fontSize: '15px', fontWeight: 500, marginBottom: '4px', fontWeight: '800'
                                        }}
                                    >
                                        Asset Components by Criticality Analysis Status
                                    </h4>

                                    <button
                                        style={{
                                            background: "transparent",
                                            border: "none",
                                            color: "#EAB56F",
                                            cursor: "pointer",
                                            fontSize: "14px",
                                            fontWeight: "600",
                                            padding: 0,
                                            textDecoration: "none", // default state
                                        }}
                                        onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                                        onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                                        onClick={() => setShowTrivectorModal(true)}
                                    >
                                        View Component Trivector
                                    </button>
                                </div>


                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={assetComponentChartData}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="rgba(255, 255, 255, 0.1)"
                                        />

                                        <XAxis
                                            dataKey="component"
                                            stroke="#fff"
                                            fontWeight={500}

                                            angle={-10}
                                            textAnchor="end"
                                            interval={0}
                                            height={100}
                                        />

                                        <YAxis stroke="#fff" />

                                        <Tooltip
                                            cursor={{ fill: 'rgba(16, 26, 56, 0.25)' }}
                                            content={({ active, payload, label }) => {
                                                if (!active || !payload || !payload.length) return null;

                                                const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);

                                                // Find the matching component's trivector distribution
                                                const componentDist = assetComponentDistribution.find(
                                                    d => d.component === label
                                                );

                                                const miniPieData = componentDist ? [
                                                    { name: 'Wear Metals', value: componentDist.wearMetals, color: '#8B5CF6' },
                                                    { name: 'Contaminants', value: componentDist.contaminants, color: '#10b981' },
                                                    { name: 'Chemistry & Viscosity', value: componentDist.chemistryAndViscosity, color: '#F59E0B' },
                                                ].filter(d => d.value > 0) : [];

                                                return (
                                                    <div style={{
                                                        background: '#1e293b',
                                                        border: '1px solid rgba(255,255,255,0.15)',
                                                        borderRadius: '10px',
                                                        padding: '10px 12px',
                                                        width: '100%',
                                                        minWidth: '200px',
                                                        maxWidth: '260px',
                                                        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                                                        fontSize: '11px',
                                                        pointerEvents: 'none'
                                                    }}>
                                                        {/* Header */}
                                                        <div style={{
                                                            color: '#EAB56F',
                                                            fontWeight: 700,
                                                            fontSize: '11px',
                                                            marginBottom: '6px',
                                                            borderBottom: '1px solid rgba(255,255,255,0.1)',
                                                            paddingBottom: '5px'
                                                        }}>
                                                            {label}
                                                        </div>

                                                        {/* Criticality rows */}
                                                        {payload.map((entry, index) => (
                                                            <div key={index} style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: '5px',
                                                                gap: '24px'
                                                            }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <div style={{
                                                                        width: '10px',
                                                                        height: '10px',
                                                                        borderRadius: '3px',
                                                                        background: entry.fill,
                                                                        flexShrink: 0
                                                                    }} />
                                                                    <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}>
                                                                        {entry.name}
                                                                    </span>
                                                                </div>
                                                                <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '12px' }}>
                                                                    {entry.value} {entry.value === 1 ? 'report' : 'reports'}
                                                                </span>
                                                            </div>
                                                        ))}

                                                        {/* Total */}
                                                        <div style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            marginTop: '5px',
                                                            paddingTop: '5px',
                                                            borderTop: '1px solid rgba(255,255,255,0.1)',
                                                            marginBottom: '8px'
                                                        }}>
                                                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Total</span>
                                                            <span style={{ color: '#EAB56F', fontWeight: 700, fontSize: '13px' }}>
                                                                {total} {total === 1 ? 'report' : 'reports'}
                                                            </span>
                                                        </div>

                                                        {/* Mini Pie Chart */}
                                                        {miniPieData.length > 0 && (
                                                            <>
                                                                <div style={{
                                                                    color: '#10b981',
                                                                    fontSize: '11px',
                                                                    fontWeight: 600,
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.5px',
                                                                    marginBottom: '6px'
                                                                }}>
                                                                    TriVector Distribution
                                                                </div>

                                                                {(() => {
                                                                    const pieTotal = miniPieData.reduce((s, d) => s + d.value, 0);
                                                                    const SVG_W = 180, SVG_H = 140;
                                                                    const cx = SVG_W / 2, cy = SVG_H / 2, r = Math.min(SVG_W, SVG_H) / 2 - 12;
                                                                    let startAngle = -Math.PI / 2;

                                                                    const slices = miniPieData.map((entry) => {
                                                                        const sweep = (entry.value / pieTotal) * 2 * Math.PI;
                                                                        const x1 = cx + r * Math.cos(startAngle);
                                                                        const y1 = cy + r * Math.sin(startAngle);
                                                                        const endAngle = startAngle + sweep;
                                                                        const x2 = cx + r * Math.cos(endAngle);
                                                                        const y2 = cy + r * Math.sin(endAngle);
                                                                        const largeArc = sweep > Math.PI ? 1 : 0;
                                                                        const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                                                                        startAngle = endAngle;
                                                                        return { ...entry, path, pct: ((entry.value / pieTotal) * 100).toFixed(0) };
                                                                    });

                                                                    return (
                                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                                            <svg width="100%" height="auto" viewBox={`0 0 ${SVG_W} ${SVG_H}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>                                                                              {slices.map((slice, i) => (
                                                                                <path key={i} d={slice.path} fill={slice.color} stroke="#1e293b" strokeWidth="1.5" />
                                                                            ))}
                                                                            </svg>
                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '100%' }}>
                                                                                {slices.map((entry, i) => (
                                                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                        <div style={{
                                                                                            width: '8px', height: '8px',
                                                                                            borderRadius: '2px',
                                                                                            background: entry.color,
                                                                                            flexShrink: 0
                                                                                        }} />
                                                                                        <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px' }}>
                                                                                            {entry.name}
                                                                                        </span>
                                                                                        <span style={{ color: entry.color, fontSize: '11px', fontWeight: 600, marginLeft: 'auto' }}>
                                                                                            {entry.pct}%
                                                                                        </span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            }}
                                        />



                                        <Legend />
                                        <Bar
                                            dataKey="good"
                                            stackId="a"
                                            fill="#28a745"
                                            name="Good/Ok"
                                            activeBar={{ fill: "#28a745", opacity: 0.85 }}
                                        />

                                        <Bar
                                            dataKey="abnormal"
                                            stackId="a"
                                            fill="#ec8a2f"
                                            name="Verify/Abnormal"
                                            activeBar={{ fill: "#ec8a2f", opacity: 0.85 }}
                                        />

                                        <Bar
                                            dataKey="severe"
                                            stackId="a"
                                            fill="#dd3445"
                                            name="Severe"
                                            activeBar={{ fill: "#dd3445", opacity: 0.85 }}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Col>
                    </Row>

                    {/* Component pie charts
                    <Row className="mt-4">
                        {
                            assetComponentDistribution.map((item, index) => {

                                const pieData = [
                                    {
                                        name: "Wear Metals",
                                        value: item.wearMetals,
                                        color: "#8B5CF6"
                                    },
                                    {
                                        name: "Contaminants",
                                        value: item.contaminants,
                                        color: "#10b981"
                                    },
                                    {
                                        name: "Chemistry & Viscosity",
                                        value: item.chemistryAndViscosity,
                                        color: "#F59E0B"
                                    }
                                ].filter(x => x.value > 0);

                                return (
                                    <Col lg={4} md={6} key={index}>
                                        <div
                                            style={{
                                                background: "#1e293b",
                                                border: "2px solid #10b981",
                                                borderRadius: "12px",
                                                padding: "20px",
                                                marginBottom: "20px"
                                            }}
                                        >

                                            <h6
                                                style={{
                                                    color: "#10b981",
                                                    textAlign: "center"
                                                }}
                                            >
                                                {item.component}
                                            </h6>

                                            <ResponsiveContainer
                                                width="100%"
                                                height={220}
                                            >
                                                <PieChart>
                                                    <Pie
                                                        data={pieData}
                                                        dataKey="value"
                                                        outerRadius={70}
                                                        label={false}
                                                    >
                                                        {
                                                            pieData.map((entry, i) => (
                                                                <Cell
                                                                    key={i}
                                                                    fill={entry.color}
                                                                />
                                                            ))
                                                        }
                                                    </Pie>

                                                    <Tooltip />


                                                </PieChart>
                                            </ResponsiveContainer>

                                        </div>
                                    </Col>
                                );
                            })
                        }
                    </Row> */}

                    {showTrivectorModal && (
                        <div
                            onClick={() => setShowTrivectorModal(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0,0,0,0.75)',
                                backdropFilter: 'blur(4px)',
                                zIndex: 9999,
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'center',
                                overflowY: 'auto',
                                padding: '40px 16px',
                            }}
                        >
                            <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                    border: '2px solid #ffae00',
                                    borderRadius: '16px',
                                    width: '100%',
                                    maxWidth: '1100px',
                                    padding: '28px',
                                    boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                                }}
                            >
                                {/* Modal Header */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '24px',
                                    paddingBottom: '16px',
                                    borderBottom: '1px solid rgba(255, 145, 0, 0.3)'
                                }}>
                                    <div>
                                        <div style={{ color: '#ffa600', fontSize: '20px', fontWeight: 700 }}>
                                            TriVector Distribution by Component
                                        </div>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginTop: '4px' }}>
                                            Breakdown of Wear Metals, Contaminants, and Chemistry & Viscosity per component
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowTrivectorModal(false)}
                                        style={{
                                            background: 'rgba(151, 42, 42, 0.6)',
                                            border: '2px solid rgba(255, 0, 0, 0.15)',
                                            borderRadius: '8px',
                                            padding: '8px 14px',
                                            color: '#ffffff',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'background 0.2s',
                                            flexShrink: 0
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(182, 36, 36, 0.15)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(151, 42, 42, 0.6)'}
                                    >
                                        <FeatherIcon icon="x" size={14} /> Close
                                    </button>
                                </div>

                                {/* Pie Charts Grid */}
                                {assetComponentDistribution.length > 0 ? (
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                        gap: '20px'
                                    }}>
                                        {assetComponentDistribution.map((item, index) => {
                                            const pieData = [
                                                { name: 'Wear Metals', value: item.wearMetals, color: '#8B5CF6' },
                                                { name: 'Contaminants', value: item.contaminants, color: '#10b981' },
                                                { name: 'Chemistry & Viscosity', value: item.chemistryAndViscosity, color: '#F59E0B' }
                                            ].filter(x => x.value > 0);

                                            const total = pieData.reduce((s, d) => s + d.value, 0);

                                            return (
                                                <div
                                                    key={index}
                                                    style={{
                                                        background: 'rgba(255, 166, 0, 0.04)',

                                                        border: '2px solid rgba(255, 174, 0, 0.25)',
                                                        borderRadius: '12px',
                                                        padding: '20px',
                                                        transition: 'border-color 0.2s',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#ffae00'}
                                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 174, 0, 0.25)'}
                                                >
                                                    <div style={{ color: '#10b981', fontWeight: 700, fontSize: '13px', textAlign: 'center', marginBottom: '4px' }}>
                                                        {item.component}
                                                    </div>
                                                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', textAlign: 'center', marginBottom: '12px' }}>
                                                        {total} report{total !== 1 ? 's' : ''}
                                                    </div>

                                                    {pieData.length > 0 ? (
                                                        <>
                                                            <ResponsiveContainer width="100%" height={180}>
                                                                <PieChart>
                                                                    <Pie
                                                                        data={pieData}
                                                                        dataKey="value"
                                                                        cx="50%"
                                                                        cy="50%"
                                                                        outerRadius={70}
                                                                        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                                                        labelLine={false}
                                                                    >
                                                                        {pieData.map((entry, i) => (
                                                                            <Cell key={i} fill={entry.color} />
                                                                        ))}
                                                                    </Pie>
                                                                    <Tooltip
                                                                        formatter={(value, name) => [`${value} reports`, name]}
                                                                        contentStyle={{
                                                                            background: '#1e293b',
                                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                                            borderRadius: '6px',
                                                                            fontSize: '11px'
                                                                        }}
                                                                        itemStyle={{ color: '#fff' }}
                                                                    />
                                                                </PieChart>
                                                            </ResponsiveContainer>

                                                            {/* Legend */}
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                                                                {pieData.map((entry, i) => (
                                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <div style={{
                                                                                width: '10px', height: '10px',
                                                                                borderRadius: '3px',
                                                                                background: entry.color,
                                                                                flexShrink: 0
                                                                            }} />
                                                                            <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px' }}>{entry.name}</span>
                                                                        </div>
                                                                        <span style={{ color: entry.color, fontWeight: 700, fontSize: '12px' }}>
                                                                            {entry.value} ({((entry.value / total) * 100).toFixed(0)}%)
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
                                                            No data available
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
                                        <FeatherIcon icon="pie-chart" size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                                        <div>No component data available</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Charts Section */}
                    <div className="pdf-section">
                        <Row className="g-3 mb-4">
                            <Col lg={6}>
                                <div style={{
                                    background: '#1e293b',
                                    border: '2px solid #3b82f6',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    height: '100%'
                                }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ color: '#3b82f6', fontSize: '16px', fontWeight: 600 }}>
                                            Analysis of Oil Samples
                                        </div>
                                        <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', marginTop: '4px' }}>
                                            Breakdown of completed reports by criticality level
                                            {filterYear !== 'all' && ` (from ${filterYear})`}
                                            {filterLocation !== 'all' && ` at ${filterLocation}`}
                                        </div>
                                    </div>
                                    {criticalityChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={320}>
                                            <PieChart>
                                                <Pie
                                                    data={criticalityChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={true}
                                                    label={renderCustomizedLabel}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {criticalityChartData.map((entry, index) => {
                                                        let color;
                                                        switch (entry.name) {
                                                            case 'Severe':
                                                                color = '#dc3545';
                                                                break;
                                                            case 'Verify/Abnormal':
                                                                color = '#fd7e14';
                                                                break;
                                                            case 'Good/Ok':
                                                                color = '#28a745';
                                                                break;
                                                            default:
                                                                color = '#6c757d';
                                                        }
                                                        return <Cell key={`cell-${index}`} fill={color} />;
                                                    })}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value, name) => [`${value} reports`, name]}
                                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #3b82f6', borderRadius: '6px' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Legend
                                                    formatter={(value) => <span style={{ color: '#fff', fontSize: '12px' }}>{value}</span>}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '100px 20px', color: 'rgba(255,255,255,0.5)' }}>
                                            <FeatherIcon icon="pie-chart" size={48} />
                                            <div style={{ marginTop: '12px' }}>No criticality data available</div>
                                        </div>
                                    )}
                                </div>
                            </Col>
                            <Col lg={6}>
                                <div style={{
                                    background: '#1e293b',
                                    border: '2px solid #10b981',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    height: '100%'
                                }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ color: '#10b981', fontSize: '16px', fontWeight: 600 }}>
                                            TriVector Chart
                                        </div>
                                        <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', marginTop: '4px' }}>
                                            Breakdown of all parameters recorded (Wear Metals, Contaminants, Chemistry & Viscosity)
                                            {filterYear !== 'all' && ` (from ${filterYear})`}
                                            {filterLocation !== 'all' && ` at ${filterLocation}`}
                                        </div>
                                    </div>
                                    {parameterChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={320}>
                                            <PieChart>
                                                <Pie
                                                    data={parameterChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={true}
                                                    label={renderCustomizedLabel}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {parameterChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value, name) => [`${value} parameters`, name]}
                                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #10b981', borderRadius: '6px' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Legend
                                                    formatter={(value) => <span style={{ color: '#fff', fontSize: '12px' }}>{value}</span>}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '100px 20px', color: 'rgba(255,255,255,0.5)' }}>
                                            <FeatherIcon icon="pie-chart" size={48} />
                                            <div style={{ marginTop: '12px' }}>No parameter data available</div>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </div>

                    {/* Table Section */}
                    <div className="pdf-section">
                        <Row>
                            <Col>
                                <div style={{
                                    background: '#FFF',
                                    border: '2px solid rgb(255, 102, 0)',
                                    borderRadius: '12px 12px 0px 0px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        background: '#1E293B',
                                        padding: '16px 20px',
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        flexWrap: 'wrap',
                                        gap: '16px'
                                    }}>
                                        <div style={{ flex: '1 1 auto', minWidth: '150px' }}>
                                            <div style={{ color: '#ff7b00', fontSize: '15px', fontWeight: 500, marginBottom: '4px', fontWeight: '800' }}>
                                                Completed Reports
                                            </div>
                                            <div style={{ color: 'rgb(255, 255, 255)', fontSize: '12px' }}>
                                                {filteredReports.length} fully completed analyses
                                                {filterYear !== 'all' && ` in ${filterYear}`}
                                                {filterLocation !== 'all' && ` at ${filterLocation}`}
                                            </div>
                                        </div>

                                        <div className="no-print" style={{
                                            display: 'flex',
                                            gap: '12px',
                                            flexWrap: 'wrap',
                                            alignItems: 'flex-end',
                                            flex: '3 1 500px'
                                        }}>
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
                                                    <option value="Severe">Severe</option>
                                                </select>
                                            </div>

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
                                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: 'rgb(255, 255, 255)', textTransform: 'uppercase' }}>Trivector</th>
                                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: 'rgb(255, 255, 255)', textTransform: 'uppercase' }}>Criticality</th>
                                                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: 'rgb(255, 255, 255)', textTransform: 'uppercase' }}>Analysis Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedReports.length > 0 ? (
                                                    paginatedReports.map((report, index) => {
                                                        const trivectorColor =
                                                            report.trivector === 'rotating-machine' ? '#00BFFF' :
                                                                report.trivector === 'stationary-engine' ? '#32CD32' :
                                                                    report.trivector === 'mobile-engine' ? '#FFA500' : '#999';

                                                        return (
                                                            <tr
                                                                key={index}
                                                                style={{
                                                                    borderBottom: '1px solid rgba(58, 58, 58, 0.12)',
                                                                    transition: 'background 0.2s',
                                                                    cursor: 'pointer'
                                                                }}
                                                                onClick={() => handleRowClick(report)}
                                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                            >
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
                                                                    <div style={{
                                                                        display: 'inline-block',
                                                                        padding: '4px 12px',
                                                                        borderRadius: '20px',
                                                                        background: `${trivectorColor}20`,
                                                                        color: trivectorColor,
                                                                        fontSize: '12px',
                                                                        fontWeight: '600'
                                                                    }}>
                                                                        {report.trivector_formatted}
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
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" style={{ padding: '60px 20px', textAlign: 'center', color: 'rgba(0,0,0,0.4)' }}>
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


                                </div>
                                {totalPages > 1 && (
                                    <div className="no-print" style={{
                                        padding: '12px 20px',

                                        border: ' 2px solid rgb(255, 102, 0)',
                                        borderRadius: '0px 0px 12px 12px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '12px',
                                        background: 'rgba(21, 20, 37, 0.07)'
                                    }}>
                                        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
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
                            </Col>
                        </Row>
                    </div>

                </div>
            </Container>
        </div>
    );
} 