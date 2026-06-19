import FeatherIcon from "feather-icons-react";
import { Col, Container, Form, Modal, Row, Spinner } from "react-bootstrap";
import axios from 'axios';
import config from 'config';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Loading from '../../components/personalComponents/loading';
import AlertModal from '../../components/personalComponents/alertModal';
import logoArms from "assets/images/logo-arms-white.png";
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

// ─── Parameter definitions keyed by trivector ───────────────────────────────
// trivector values from your DB: "Engine Oil", "Gear", "Hydraulic", "Transmission", "Compressor"
// We normalise to lowercase for matching.

const PARAM_SETS = {
    // Engine Oils
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
    // Gear / Hydraulic / Transmission share the same params
    gear: [
        { label: "Viscosity at 40°C", key: "viscosity_at_40c", unit: "cSt" },
        { label: "Zinc", key: "zinc", unit: "ppm" },
        { label: "Phosphorus", key: "phosphorus", unit: "ppm" },
        { label: "Magnesium", key: "magnesium", unit: "ppm" },
        { label: "Oxidation", key: "oxidation", unit: "abs/0.1mm" },
        { label: "TAN", key: "tan", unit: "" },
        { label: "ISO 4406 (>4um)", key: "iso_4406_code_gt4um", unit: "" },
        { label: "ISO 4406 (>6um)", key: "iso_4406_code_gt6um", unit: "" },
        { label: "ISO 4406 (>14um)", key: "iso_4406_code_gt14um", unit: "" },
        { label: "Water", key: "water", unit: "%" },
    ],
    // Compressor
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

/** Map raw trivector string → param-set key */
function getTrivectorKey(trivector) {
    if (!trivector) return null;
    const v = trivector.toLowerCase();
    if (v.includes('engine')) return 'engine';
    if (v.includes('compressor')) return 'compressor';
    // gear / hydraulic / transmission all share "gear" params
    if (v.includes('gear') || v.includes('hydraulic') || v.includes('transmission')) return 'gear';
    return null;
}

/** Get the parameter list for a trivector string */
function getParams(trivector) {
    const key = getTrivectorKey(trivector);
    return key ? PARAM_SETS[key] : [];
}

// ✅ PASTE THIS ABOVE "export default function ViewSubmittedNoAsset()"
const DocumentationModal = ({
    show,
    onHide,
    isUploadingDoc,
    reportData,
    documentationData,
    setDocumentationData,
    handleDocumentationUpload,
    hideResolution
}) => {
    const [localOilBefore, setLocalOilBefore] = useState(null);
    const [localOilAfter, setLocalOilAfter] = useState(null);

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            size="xl"
            backdrop="static"
            keyboard={false}
            contentClassName="border-0 bg-transparent"
        >
            <div style={{ borderRadius: '20px', overflow: 'hidden' }}>
                <Modal.Header style={{
                    background: 'linear-gradient(135deg, #ffd698 0%, #ffb347 100%)',
                    borderBottom: `2px solid ${COLORS.primary}`,
                    borderTopLeftRadius: '20px', borderTopRightRadius: '20px'
                }}>
                    <Modal.Title style={{ color: '#383838', fontWeight: 'bold' }}>
                        <FeatherIcon icon="file-text" size={20} style={{ marginRight: '10px' }} />
                        Documentation Required
                    </Modal.Title>
                </Modal.Header>



                <Modal.Body style={{ padding: '28px 32px', background: 'white' }}>
                    <div style={{
                        background: '#fef3c7', padding: '12px', borderRadius: '8px',
                        marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <FeatherIcon icon="alert-triangle" size={20} color={COLORS.warning} />
                        <span style={{ fontSize: '14px', color: '#92400e' }}>
                            Please upload documentation for the  action taken.
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                        <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '16px', border: `1px solid ${COLORS.primary}30` }}>
                            <h6 style={{ marginBottom: '12px', color: COLORS.dark, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FeatherIcon icon="info" size={14} />
                                Auto-filled Information
                            </h6>
                            <div style={{ display: 'grid', gap: '10px', fontSize: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${COLORS.primary}20` }}>
                                    <span style={{ fontWeight: '600', color: COLORS.gray }}>Oil Batch Code:</span>
                                    <span style={{ color: COLORS.dark }}>{reportData.oil_batch_code || '—'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${COLORS.primary}20` }}>
                                    <span style={{ fontWeight: '600', color: COLORS.gray }}>Drum Number:</span>
                                    <span style={{ color: COLORS.dark }}>{reportData.input_drum_number || '—'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${COLORS.primary}20` }}>
                                    <span style={{ fontWeight: '600', color: COLORS.gray }}>Manufacturing Date:</span>
                                    <span style={{ color: COLORS.dark }}>
                                        {reportData.manufacturing_date
                                            ? new Date(reportData.manufacturing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                            : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ flex: 1, padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: `1px solid ${COLORS.success}30` }}>
                                <h6 style={{ marginBottom: '8px', color: COLORS.success, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FeatherIcon icon="message-circle" size={14} />
                                    Actions
                                </h6>
                                <p style={{ margin: 0, fontSize: '14px', color: COLORS.dark }}>
                                    {reportData.actions || 'No actions available.'}
                                </p>
                            </div>
                            {/* in the right column of the info grid */}
                            {!hideResolution && (
                                <div style={{ flex: 1, padding: '12px', background: '#fff1f1', borderRadius: '8px', border: `1px solid ${COLORS.danger}30` }}>
                                    <h6 style={{ marginBottom: '8px', color: COLORS.danger, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FeatherIcon icon="check-circle" size={14} />
                                        Report
                                    </h6>
                                    <p style={{ margin: 0, fontSize: '14px', color: COLORS.dark }}>
                                        {reportData.resolution || 'No resolution provided.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: COLORS.dark, marginBottom: '16px', display: 'block' }}>
                            Upload Documentation
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                            {/* Oil Before */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <FeatherIcon icon="upload-cloud" size={16} color={COLORS.primary} />
                                    <span style={{ fontWeight: '500', fontSize: '13px' }}>New Oil Before</span>
                                    <span style={{ color: COLORS.danger, fontSize: '12px' }}>*</span>
                                </div>
                                <div style={{
                                    border: `2px dashed ${localOilBefore ? COLORS.success : COLORS.primary}40`,
                                    borderRadius: '12px', padding: '20px', textAlign: 'center',
                                    background: localOilBefore ? '#f0fdf4' : '#fafafa',
                                    cursor: 'pointer', transition: 'all 0.2s ease'
                                }} onClick={() => document.getElementById('oil-before-input').click()}>
                                    <input
                                        id="oil-before-input"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            if (e.target.files[0]) {
                                                setLocalOilBefore(e.target.files[0]);
                                                setDocumentationData(prev => ({ ...prev, oil_before: e.target.files[0] }));
                                            }
                                        }}
                                    />
                                    {localOilBefore ? (
                                        <>
                                            <FeatherIcon icon="file" size={32} color={COLORS.success} />
                                            <p style={{ margin: '8px 0 0', fontSize: '12px', color: COLORS.success }}>{localOilBefore.name}</p>
                                            <button onClick={(e) => { e.stopPropagation(); setLocalOilBefore(null); setDocumentationData(prev => ({ ...prev, oil_before: null })); }}
                                                style={{ marginTop: '8px', background: 'none', border: 'none', color: COLORS.danger, fontSize: '11px', cursor: 'pointer' }}>
                                                Remove
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <FeatherIcon icon="cloud" size={32} color={COLORS.primary} />
                                            <p style={{ margin: '8px 0 0', fontSize: '12px', color: COLORS.gray }}>Click to upload or drag and drop</p>
                                            <p style={{ margin: '4px 0 0', fontSize: '10px', color: COLORS.gray }}>PDF, JPG, PNG (Max 10MB)</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Oil After */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <FeatherIcon icon="upload-cloud" size={16} color={COLORS.primary} />
                                    <span style={{ fontWeight: '500', fontSize: '13px' }}>New Oil After</span>
                                    <span style={{ color: COLORS.danger, fontSize: '12px' }}>*</span>
                                </div>
                                <div style={{
                                    border: `2px dashed ${localOilAfter ? COLORS.success : COLORS.primary}40`,
                                    borderRadius: '12px', padding: '20px', textAlign: 'center',
                                    background: localOilAfter ? '#f0fdf4' : '#fafafa',
                                    cursor: 'pointer', transition: 'all 0.2s ease'
                                }} onClick={() => document.getElementById('oil-after-input').click()}>
                                    <input
                                        id="oil-after-input"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            if (e.target.files[0]) {
                                                setLocalOilAfter(e.target.files[0]);
                                                setDocumentationData(prev => ({ ...prev, oil_after: e.target.files[0] }));
                                            }
                                        }}
                                    />
                                    {localOilAfter ? (
                                        <>
                                            <FeatherIcon icon="file" size={32} color={COLORS.success} />
                                            <p style={{ margin: '8px 0 0', fontSize: '12px', color: COLORS.success }}>{localOilAfter.name}</p>
                                            <button onClick={(e) => { e.stopPropagation(); setLocalOilAfter(null); setDocumentationData(prev => ({ ...prev, oil_after: null })); }}
                                                style={{ marginTop: '8px', background: 'none', border: 'none', color: COLORS.danger, fontSize: '11px', cursor: 'pointer' }}>
                                                Remove
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <FeatherIcon icon="cloud" size={32} color={COLORS.primary} />
                                            <p style={{ margin: '8px 0 0', fontSize: '12px', color: COLORS.gray }}>Click to upload or drag and drop</p>
                                            <p style={{ margin: '4px 0 0', fontSize: '10px', color: COLORS.gray }}>PDF, JPG, PNG (Max 10MB)</p>
                                        </>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer style={{ borderTop: `1px solid ${COLORS.primary}40`, padding: '16px 32px', background: 'white', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
                    <button onClick={onHide} disabled={isUploadingDoc}
                        style={{ background: 'linear-gradient(45deg, #6b7280, #9ca3af)', border: 'none', borderRadius: '12px', padding: '12px 32px', color: 'white', fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: isUploadingDoc ? 'not-allowed' : 'pointer', opacity: isUploadingDoc ? 0.7 : 1 }}>
                        Cancel
                    </button>
                    <button onClick={handleDocumentationUpload} disabled={isUploadingDoc}
                        style={{ background: 'linear-gradient(45deg, #EAB56F, #F9982F, #E37239)', border: 'none', borderRadius: '12px', padding: '12px 32px', color: 'white', fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: isUploadingDoc ? 'not-allowed' : 'pointer', opacity: isUploadingDoc ? 0.7 : 1 }}>
                        {isUploadingDoc
                            ? <><Spinner animation="border" size="sm" /> Uploading...</>
                            : <><FeatherIcon icon="save" size={18} /> Submit Documentation</>}
                    </button>
                </Modal.Footer>
            </div>
        </Modal>
    );
};


export default function ViewSubmittedNoAsset() {
    const analysis_id = new URLSearchParams(window.location.search).get('id');
    const empInfo = JSON.parse(localStorage.getItem("user"));

    const [showResolutionModal, setShowResolutionModal] = useState(false);
    const [resolution, setResolution] = useState('');
    const [actions, setActions] = useState('');
    const [isSavingResolution, setIsSavingResolution] = useState(false);

    const [reportData, setReportData] = useState({});
    const [creatorAvatar, setCreatorAvatar] = useState(null);
    const [allRecords, setAllRecords] = useState([]);        // all no-asset submissions
    const [matchData, setMatchData] = useState([]);          // filtered by same batch+drum
    const [filteredMatchData, setFilteredMatchData] = useState([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [activeTab, setActiveTab] = useState('metrics');   // 'metrics' | 'trends'
    const [modalData, setModalData] = useState(null);
    const [hiddenLines, setHiddenLines] = useState(new Set());

    const [alertConfig, setAlertConfig] = useState({ type: 'success', title: '', description: '' });
    const [showAlert, setShowAlert] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [resamplingSchedule, setResamplingSchedule] = useState('');
    const [showSamplingModal, setShowSamplingModal] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [isSavingStatus, setIsSavingStatus] = useState(false);
    const statusDropdownRef = useRef(null);

    const [showPassedCombinedModal, setShowPassedCombinedModal] = useState(false);
    const [passedModalAutoOpened, setPassedModalAutoOpened] = useState(false);

    const [documentationData, setDocumentationData] = useState({
        oil_before: null,
        oil_after: null
    });
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);
    const [showViewDocModal, setShowViewDocModal] = useState(false);

    const permissions = useMemo(() => {
        const pos = empInfo?.emp_position;
        const l1Approved = reportData.level1 === '1';
        const l2Approved = reportData.level2 === '1';

        if (pos === 'l1') {
            const fullyApproved = l1Approved && (reportData.level2 === '0' || reportData.level2 === null);
            return {
                canSetStatus: fullyApproved,
                canSetResampling: false,
                canAddResolution: false,
                canUploadDocumentation: false,
            };
        }
        if (pos === 'l2') {
            const ready = l2Approved;
            return {
                canSetStatus: false,
                canSetResampling: ready,
                canAddResolution: ready,
                canUploadDocumentation: ready,
            };
        }
        return {
            canSetStatus: false,
            canSetResampling: false,
            canAddResolution: false,
            canUploadDocumentation: false,
        };
    }, [empInfo, reportData]);


    // ── Fetch data ────────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchAll = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(`${config.baseApi}/assetsAnalysis/get-submitted-no-assets-by-id`, {
                    params: { id: analysis_id }
                });
                const data = res.data || {};
                setReportData(data);
                setResamplingSchedule(data.resampling_schedule || '');
                console.log('Fetched report data:', data);
                // fetch all no-asset records for historical trending
                const resAll = await axios.get(`${config.baseApi}/assetsAnalysis/get-all-submitted-no-assets`);
                const allData = resAll.data || [];
                setAllRecords(allData);

                // filter: same oil_batch_code AND same input_drum_number
                const matched = allData
                    .filter(r =>
                        r.oil_batch_code === data.oil_batch_code &&
                        r.input_drum_number === data.input_drum_number
                    )
                    .sort((a, b) => new Date(a.analysis_date) - new Date(b.analysis_date));

                setMatchData(matched);
                setFilteredMatchData(matched);

                if (matched.length > 0) {
                    setFromDate(new Date(matched[0].analysis_date).toISOString().split('T')[0]);
                    setToDate(new Date(matched[matched.length - 1].analysis_date).toISOString().split('T')[0]);
                }

                // fetch creator avatar
                try {
                    const usersRes = await axios.get(`${config.baseApi}/authentication/get-all-users`);
                    const usersData = usersRes.data || [];
                    const creator = usersData.find(u => u.user_name === data.created_by);
                    setCreatorAvatar(creator?.avatar || null);
                } catch (err) {
                    console.log('Unable to fetch creator avatar:', err);
                }

            } catch (err) {
                console.log('Error fetching data:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAll();
    }, [analysis_id]);



    // ACCESS VALIDATION

    useEffect(() => {
        if (empInfo.emp_position === 'l1') {
            if (reportData.level1 === '1' && reportData.level2 === '1') {
                //Disable the select resampling scheadule button
                //Disale the Resolution button
                // Disable the documentation button
                // enable the access for changeing status to "Passed" or "Failed"
            }
        }
        else if (empInfo.emp_position === 'l2') {
            if (reportData.level2 === '1') {
                //Enable the select resampling scheadule button
                //Enable the Resolution button
                // Enable the documentation button
                //disbale the access for changing stuts to "Passed" or "Failed"
            }
        }
    }, [reportData, empInfo]);



    ////RESOLUTION

    // AFTER
    useEffect(() => {
        if (!permissions.canAddResolution) return;
        if (
            reportData.analysis_status === 'Failed' &&
            reportData.status_failed_first === '1' &&
            reportData.status_failed_second === '1' &&
            !reportData.resolution &&
            !passedModalAutoOpened
        ) {
            setPassedModalAutoOpened(true);
            setShowPassedCombinedModal(true);
        }
    }, [reportData.analysis_status, reportData.status_failed_first, reportData.status_failed_second, reportData.resolution, permissions.canAddResolution]);

    const handleSaveResolution = async () => {
        setIsLoading(true)
        if (!resolution.trim()) {
            showAlertMessage('error', 'Resolution Required', 'Please enter a resolution before saving.');
            return;
        }
        if (!actions.trim()) {
            showAlertMessage('error', 'Actions Required', 'Please enter the actions taken before saving.');
            return;
        }
        setIsLoading(true);
        setIsSavingResolution(true);
        try {
            await axios.post(`${config.baseApi}/assetsAnalysis/update-no-asset-resolution`, {
                analysis_id: analysis_id,
                resolution: resolution,
                actions: actions,
                updated_by: empInfo.user_name
            });

            console.log({
                analysis_id: analysis_id,
                resolution: resolution,
                actions: actions,
                updated_by: empInfo.user_name
            })


            setReportData(prev => ({ ...prev, resolution: resolution.trim() }));
            showAlertMessage('success', 'Resolution Saved', 'Resolution has been saved successfully.');
            setShowResolutionModal(false);
            setTimeout(() => {
                window.location.reload();
            }, 3000);
        } catch (err) {
            setIsLoading(false)
            console.error('Unable to save resolution:', err);
            showAlertMessage('error', 'Save Failed', 'Something went wrong, please try again.');
        } finally {
            setIsSavingResolution(false);
        }
    };


    //DOCUMENTATION

    useEffect(() => {
        if (!permissions.canUploadDocumentation) return;
        if (
            reportData.analysis_status === 'Passed' &&
            !reportData.oil_before &&
            !reportData.oil_after &&
            !reportData.resolution &&
            !passedModalAutoOpened
        ) {
            setPassedModalAutoOpened(true);
            setShowPassedCombinedModal(true);
        }
    }, [reportData.analysis_status, reportData.oil_before, reportData.oil_after, reportData.resolution, permissions.canUploadDocumentation]);

    // AFTER
    const handlePassedCombinedSubmit = async ({ resolution: passedResolution, actions: passedActions, oilBefore, oilAfter }) => {
        if (!passedResolution.trim()) {
            showAlertMessage('error', 'Results Required', 'Please enter results before submitting.');
            return;
        }
        if (!passedActions.trim()) {
            showAlertMessage('error', 'Actions Required', 'Please enter actions taken before submitting.');
            return;
        }
        if (!oilBefore || !oilAfter) {
            showAlertMessage('error', 'Files Required', 'Please upload both "New Oil Before" and "New Oil After" documents.');
            return;
        }

        setIsUploadingDoc(true);
        try {
            // Step 1 — save resolution + actions
            await axios.post(`${config.baseApi}/assetsAnalysis/update-no-asset-resolution`, {
                analysis_id: analysis_id,
                resolution: passedResolution,
                actions: passedActions,
                updated_by: empInfo.user_name
            });

            // Step 2 — upload documentation
            const formData = new FormData();
            formData.append('analysis_id', analysis_id);
            formData.append('oil_before', oilBefore);
            formData.append('oil_after', oilAfter);
            formData.append('oil_batch_code', reportData.oil_batch_code || '');
            formData.append('input_drum_number', reportData.input_drum_number || '');
            formData.append('manufacturing_date', reportData.manufacturing_date || '');
            formData.append('recommendations', reportData.recommendations || '');
            formData.append('resolution', passedResolution);
            formData.append('updated_by', empInfo?.user_name || empInfo?.username || '');

            await axios.post(`${config.baseApi}/assetsAnalysis/upload-documentation-report`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setReportData(prev => ({ ...prev, resolution: passedResolution, actions: passedActions, documentation_completed: '1' }));
            showAlertMessage('success', 'Report Completed', 'Results, actions, and documentation have been saved successfully.');
            setShowPassedCombinedModal(false);

            setTimeout(() => { window.location.reload(); }, 3000);
        } catch (err) {
            console.error('Unable to submit passed report:', err);
            showAlertMessage('error', 'Submission Failed', 'Something went wrong, please try again.');
        } finally {
            setIsUploadingDoc(false);
        }
    };




    // ── Date range filter ────────────────────────────────────────────────────
    useEffect(() => {
        if (!matchData.length) return;
        let filtered = [...matchData];
        if (fromDate) {
            const from = new Date(fromDate);
            from.setHours(0, 0, 0, 0);
            filtered = filtered.filter(r => new Date(r.analysis_date) >= from);
        }
        if (toDate) {
            const to = new Date(toDate);
            to.setHours(23, 59, 59, 999);
            filtered = filtered.filter(r => new Date(r.analysis_date) <= to);
        }
        setFilteredMatchData(filtered);
    }, [fromDate, toDate, matchData]);

    // ── Helpers ───────────────────────────────────────────────────────────────
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
                setShowStatusDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleStatusSelect = async (selectedStatus) => {
        setIsLoading(true)
        setIsSavingStatus(true);
        setShowStatusDropdown(false);
        try {
            await axios.post(`${config.baseApi}/assetsAnalysis/update-analysis-status-no-asset-select`, {
                analysis_id: analysis_id,
                analysis_status: selectedStatus,
                // status_failed_second: '1',
                ...(selectedStatus === 'Failed' && { status_failed_second: '1' }),
                updated_by: empInfo.user_name
            });

            await axios.post(`${config.baseApi}/assetsAnalysis/update-no-asset-add-l2`, {
                analysis_id: analysis_id,
                updated_by: empInfo.user_name
            });

            setReportData(prev => ({ ...prev, analysis_status: selectedStatus }));
            showAlertMessage('success', 'Status Updated', `Analysis status set to "${selectedStatus}".`);
            setTimeout(() => {
                window.location.reload()
            }, 2000);
        } catch (err) {
            setIsLoading(false)
            console.error('Unable to update analysis status:', err);
            showAlertMessage('error', 'Update Failed', 'Something went wrong, please try again.');
        } finally {
            setIsSavingStatus(false);
        }
    };

    // ── Chart helpers ─────────────────────────────────────────────────────────
    /** Single-param trend data for the small inline chart & modal */
    const getSingleChartData = useCallback((paramKey) => {
        if (filteredMatchData.length <= 1) return [];
        return filteredMatchData
            .filter(r => r[paramKey] !== null && r[paramKey] !== undefined && r[paramKey] !== '')
            .map(r => ({
                date: new Date(r.analysis_date).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                }),
                value: parseFloat(r[paramKey]) || 0,
                fullDate: new Date(r.analysis_date)
            }))
            .sort((a, b) => a.fullDate - b.fullDate);
    }, [filteredMatchData]);

    /** Multi-param trend data for the overview chart */
    const getMultiChartData = useCallback((params) => {
        if (filteredMatchData.length <= 1) return [];
        const sorted = [...filteredMatchData].sort(
            (a, b) => new Date(a.analysis_date) - new Date(b.analysis_date)
        );
        return sorted.map(r => {
            const point = {
                date: new Date(r.analysis_date).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                }),
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

    // ─── Sub-components ───────────────────────────────────────────────────────

    const StatCard = ({ label, value, icon, bgColor, borderColor, accentColor }) => (
        <div style={{ position: 'relative', height: '90%', minWidth: 0, containerType: 'inline-size' }}>
            <div style={{
                position: 'absolute', top: '-20px', right: '5px',
                width: 'min(70px, 200cqw)', height: 'min(70px, 200cqw)',
                background: accentColor || COLORS.accent, borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10,
            }}>
                <FeatherIcon icon={icon} size={32} color="#fff" />
            </div>
            <div style={{
                background: bgColor || '#fdf4e2', borderRadius: '24px',
                padding: 'clamp(20px, 4vw, 28px)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: `3px solid ${borderColor || 'rgb(214, 180, 105)'}`,
                height: '100%', position: 'relative', zIndex: 1
            }}>
                <div style={{ containerType: 'inline-size' }}>
                    <div style={{
                        fontSize: 'clamp(14px, 8cqw, 32px)', fontWeight: '800', color: COLORS.dark,
                        marginBottom: '8px', letterSpacing: '-0.02em', lineHeight: 1.2,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {value || '—'}
                    </div>
                </div>
                <div style={{
                    fontSize: 'clamp(12px, 3vw, 14px)', color: accentColor || COLORS.accent,
                    fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                    {label}
                </div>
            </div>
        </div>
    );

    /** Individual metric tile — shows value + mini sparkline if history exists */
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
                    <div style={{
                        fontSize: 'clamp(10px, 2.5vw, 12px)', color: '#303030',
                        textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600',
                        wordBreak: 'break-word'
                    }}>
                        {label}
                    </div>
                    <div style={{
                        fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 'bold', color: COLORS.dark,
                        display: 'flex', flexDirection: 'row', alignItems: 'baseline',
                        gap: '10px', flexWrap: 'wrap'
                    }}>
                        <span>{(value !== null && value !== undefined && value !== '') ? value : '—'}</span>
                        {unit && value !== null && value !== undefined && value !== '' && (
                            <span style={{ fontSize: 'clamp(9px, 2vw, 11px)', color: COLORS.gray }}>{unit}</span>
                        )}
                    </div>
                </div>
                {showChart && (
                    <div style={{
                        padding: 'clamp(8px, 2vw, 12px)', background: '#fff2d6',
                        borderRadius: '0 0 12px 12px', border: '1.5px solid #6e6e6e', borderTop: 'none'
                    }}>
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
                                    <Line type="linear" dataKey="value" stroke={COLORS.accent} strokeWidth={2}
                                        dot={{ fill: COLORS.accent, r: 2 }} activeDot={{ r: 4 }} name={label} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    /** Multi-line overview chart */
    const OverviewChart = ({ params }) => {
        const chartData = getMultiChartData(params);
        const validParams = params.filter(p =>
            filteredMatchData.some(r => r[p.key] !== null && r[p.key] !== undefined && r[p.key] !== '')
        );
        const hasData = chartData.length > 0 && validParams.length > 0;

        const renderLegend = ({ payload }) => (
            <ul style={{
                display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
                gap: '8px 16px', padding: '10px 0 0', margin: 0, listStyle: 'none'
            }}>
                {payload.map(entry => {
                    const hidden = hiddenLines.has(entry.dataKey);
                    return (
                        <li key={entry.dataKey} onClick={() => toggleLine(entry.dataKey)} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            cursor: 'pointer', fontSize: '11px', padding: '4px 8px',
                            borderRadius: '4px', opacity: hidden ? 0.5 : 1,
                            textDecoration: hidden ? 'line-through' : 'none',
                            background: hidden ? '#f5f5f5' : 'transparent'
                        }}>
                            <span style={{
                                display: 'inline-block', width: '12px', height: '12px',
                                borderRadius: '2px', backgroundColor: entry.color
                            }} />
                            <span style={{ color: COLORS.dark }}>{entry.value}</span>
                        </li>
                    );
                })}
            </ul>
        );

        if (!hasData) {
            return (
                <div style={{
                    background: '#fff2d6', borderRadius: '16px', padding: '40px',
                    textAlign: 'center', border: '1.5px solid #6e6e6e', color: COLORS.gray
                }}>
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
                                <Line
                                    key={p.key}
                                    type="linear"
                                    dataKey={p.key}
                                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 5 }}
                                    name={p.label}
                                    connectNulls
                                    hide={hiddenLines.has(p.key)}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div style={{
                    padding: '8px', backgroundColor: `${COLORS.primary}10`, borderRadius: '8px',
                    fontSize: '12px', color: COLORS.gray, textAlign: 'center', marginTop: '8px'
                }}>
                    <FeatherIcon icon="info" size={14} color={COLORS.accent} style={{ marginRight: '6px' }} />
                    Click any parameter in the legend to show / hide it
                </div>
            </div>
        );
    };

    /** Date range + record count row above charts */
    const DateFilterRow = () => {
        if (matchData.length <= 1) return null;
        return (
            <div style={{
                background: COLORS.white, borderRadius: '0 0 16px 16px',
                padding: 'clamp(12px, 3vw, 16px)', marginBottom: '24px',
                border: `2px solid ${COLORS.primary}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '15px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FeatherIcon icon="calendar" size={clampNumber(14, 18)} color={COLORS.accent} />
                        <span style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: '600', color: COLORS.dark }}>Date Range:</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: COLORS.gray }}>From:</span>
                        <Form.Control type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                            style={{ width: 'clamp(120px, 25vw, 150px)', borderRadius: '8px', border: `1px solid ${COLORS.primary}40`, fontSize: 'clamp(11px, 2vw, 13px)' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 'clamp(11px, 2vw, 13px)', color: COLORS.gray }}>To:</span>
                        <Form.Control type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                            style={{ width: 'clamp(120px, 25vw, 150px)', borderRadius: '8px', border: `1px solid ${COLORS.primary}40`, fontSize: 'clamp(11px, 2vw, 13px)' }} />
                    </div>
                    <button onClick={() => {
                        if (matchData.length > 0) {
                            setFromDate(new Date(matchData[0].analysis_date).toISOString().split('T')[0]);
                            setToDate(new Date(matchData[matchData.length - 1].analysis_date).toISOString().split('T')[0]);
                        }
                    }} style={{
                        padding: '6px clamp(12px, 3vw, 16px)',
                        background: `linear-gradient(135deg, ${COLORS.primary}20 0%, ${COLORS.secondary}20 100%)`,
                        border: `1px solid ${COLORS.primary}40`, borderRadius: '8px',
                        fontSize: 'clamp(11px, 2.5vw, 13px)', fontWeight: '500',
                        color: COLORS.dark, cursor: 'pointer'
                    }}>
                        Reset
                    </button>
                </div>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '4px 12px', background: `${COLORS.primary}10`, borderRadius: '20px'
                }}>
                    <FeatherIcon icon="bar-chart-2" size={clampNumber(12, 14)} color={COLORS.accent} />
                    <span style={{ fontSize: 'clamp(10px, 2vw, 12px)', fontWeight: '500', color: COLORS.dark }}>
                        {filteredMatchData.length} / {matchData.length} records
                    </span>
                </div>
            </div>
        );
    };

    /** Enlarged single-param modal */
    const EnlargedChartModal = () => {
        if (!modalData) return null;
        return (
            <div onClick={() => setModalData(null)} style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                zIndex: 9999, padding: '20px'
            }}>
                <div onClick={e => e.stopPropagation()} style={{
                    background: 'linear-gradient(180deg, #ffffff 0%, #fff7db 100%)',
                    borderRadius: '20px', width: '90%', maxWidth: '1200px',
                    maxHeight: '90vh', overflow: 'auto',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    border: '3px solid #ffbb00'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #ffd698 0%, #ffb347 100%)',
                        padding: 'clamp(12px, 3vw, 16px)',
                        borderBottom: `1px solid ${COLORS.light}`,
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', flexWrap: 'wrap', gap: '10px'
                    }}>
                        <div>
                            <h3 style={{ margin: 0, color: '#252525', fontSize: '16px', fontWeight: '600' }}>
                                {modalData.label} — Historical Trend
                            </h3>
                            <p style={{ margin: '5px 0 0', color: COLORS.gray, fontSize: '14px' }}>
                                {modalData.data.length} records
                            </p>
                        </div>
                        <button onClick={() => setModalData(null)} style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px'
                        }}>
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
                                <Line type="linear" dataKey="value" stroke={COLORS.accent} strokeWidth={3}
                                    dot={{ fill: COLORS.accent, r: 4 }} activeDot={{ r: 6 }} name={modalData.label} />
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
            setIsLoading(true)
            if (!localSelectedSamplingDate) {
                showAlertMessage('error', 'Date Required', 'Please select a sampling schedule date before saving.');
                return;
            }
            const empInfo = JSON.parse(localStorage.getItem("user"));
            setIsLocalSaving(true);
            try {
                await axios.post(`${config.baseApi}/assetsAnalysis/update-resampling-schedule-no-asset`, {
                    analysis_id: analysis_id,
                    resampling_schedule: localSelectedSamplingDate,
                    updated_by: empInfo.username
                });
                setResamplingSchedule(localSelectedSamplingDate);
                showAlertMessage('success', 'Success', `Sampling schedule date set to ${new Date(localSelectedSamplingDate).toLocaleDateString()}`);
                setShowSamplingModal(false);
                setLocalSelectedSamplingDate('');
            } catch (err) {
                setIsLoading(false)
                console.error('Unable to save sampling schedule:', err);
                showAlertMessage('error', 'Unable to Save', 'Something went wrong, please try again.');
            } finally {
                setIsLocalSaving(false);
                setIsLoading(true)
                try {
                    await axios.post(`${config.baseApi}/assetsAnalysis/update-analysis-status-no-asset`, {
                        analysis_id: analysis_id,
                        analysis_status: '',
                        updated_by: empInfo.user_name
                    })

                    await axios.post(`${config.baseApi}/assetsAnalysis/update-no-asset-clear-l2`, {
                        analysis_id: analysis_id,
                        updated_by: empInfo.user_name
                    })

                    setTimeout(() => { window.location.reload(); }, 3000);

                } catch (err) {
                    setIsLoading(false)
                    console.log('Unable to fetch updated data:', err);
                    showAlertMessage('error', 'Unable to Save', 'Something went wrong, please try again.');
                }

            }
        };

        return (
            <Modal show={showSamplingModal} onHide={() => { setShowSamplingModal(false); setLocalSelectedSamplingDate(''); }}
                centered size="md" backdrop="static" keyboard={false} contentClassName="border-0 bg-transparent">
                <div style={{ borderRadius: '20px', overflow: 'hidden' }}>
                    <Modal.Header closeButton style={{
                        background: 'linear-gradient(135deg, #ffd698 0%, #ffb347 100%)',
                        borderBottom: `2px solid ${COLORS.primary}`,
                        borderTopLeftRadius: '20px', borderTopRightRadius: '20px'
                    }}>
                        <Modal.Title style={{ color: '#383838', fontWeight: 'bold' }}>
                            <FeatherIcon icon="calendar" size={18} style={{ marginRight: '8px' }} />
                            Schedule Resampling Date
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ padding: '24px', background: 'white' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{
                                background: '#fef3c7', padding: '12px', borderRadius: '8px',
                                marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                <FeatherIcon icon="alert-triangle" size={20} color={COLORS.warning} />
                                <span style={{ fontSize: '14px', color: '#92400e' }}>
                                    Critical analysis status is "Verify/Abnormal". Please schedule a resampling date.
                                </span>
                            </div>
                            <label style={{ fontSize: '14px', fontWeight: '600', color: COLORS.dark, marginBottom: '8px', display: 'block' }}>
                                Select Sampling Schedule Date
                            </label>
                            <Form.Control
                                type="date"
                                value={localSelectedSamplingDate}
                                onChange={e => setLocalSelectedSamplingDate(e.target.value)}
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
                    <Modal.Footer style={{
                        borderTop: `1px solid ${COLORS.primary}40`, padding: '16px 24px',
                        background: 'white', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px'
                    }}>
                        <button onClick={() => { setShowSamplingModal(false); setLocalSelectedSamplingDate(''); }}
                            style={{
                                background: 'linear-gradient(45deg, #ea6f6f, #f92f2f, #e33939)',
                                border: 'none', borderRadius: '12px', padding: '12px 48px',
                                color: 'white', fontWeight: '600', fontSize: '1rem',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                            Cancel
                        </button>
                        <button onClick={handleLocalSave} disabled={isLocalSaving}
                            style={{
                                background: 'linear-gradient(45deg, #EAB56F, #F9982F, #E37239)',
                                border: 'none', borderRadius: '12px', padding: '12px 48px',
                                color: 'white', fontWeight: '600', fontSize: '1rem',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                            {isLocalSaving
                                ? <><Spinner animation="border" size="sm" /> Saving...</>
                                : <><FeatherIcon icon="save" size={18} /> Save Schedule</>}
                        </button>
                    </Modal.Footer>
                </div>
            </Modal>
        );
    };

    // ── Derived values ────────────────────────────────────────────────────────
    const params = getParams(reportData.trivector);
    const trivectorKey = getTrivectorKey(reportData.trivector);
    const hasCharts = params.length > 0;

    // Tab gradient colours mirroring the asset page
    const tabGradients = {
        metrics: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
        trends: 'linear-gradient(135deg, #6949a5 0%, #3F1D7D 100%)',
    };

    const PassedCombinedModal = ({
        show,
        onHide,
        isSubmitting,
        reportData,
        handleSubmit,
    }) => {
        const [localResolution, setLocalResolution] = useState('');
        const [localActions, setLocalActions] = useState('');
        const [localOilBefore, setLocalOilBefore] = useState(null);
        const [localOilAfter, setLocalOilAfter] = useState(null);

        return (
            <Modal
                show={show}
                onHide={onHide}
                centered
                size="xl"
                backdrop="static"
                keyboard={false}
                contentClassName="border-0 bg-transparent"
            >
                <div style={{ borderRadius: '20px', overflow: 'hidden' }}>
                    <Modal.Header style={{
                        background: 'linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)',
                        borderBottom: `2px solid ${COLORS.success}`,
                        borderTopLeftRadius: '20px', borderTopRightRadius: '20px'
                    }}>
                        <Modal.Title style={{ color: '#065f46', fontWeight: 'bold' }}>
                            <FeatherIcon icon="check-circle" size={20} style={{ marginRight: '10px' }} />
                            {reportData.analysis_status === 'Failed' ? 'Analysis Failed — Complete Report' : 'Analysis Passed — Complete Report'}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body style={{ padding: '28px 32px', background: 'white' }}>
                        {/* Info strip */}
                        <div style={{
                            background: '#f0fdf4', padding: '12px 16px', borderRadius: '8px',
                            marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px',
                            border: `1px solid ${COLORS.success}30`
                        }}>
                            <FeatherIcon icon="info" size={16} color={COLORS.success} />
                            <span style={{ fontSize: '14px', color: '#166534' }}>
                                This analysis has been marked as <strong>{reportData.analysis_status}</strong>. Please fill in the results, actions taken, and upload the oil documentation to complete the report.
                            </span>
                        </div>

                        {/* Auto-filled info */}
                        <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '16px', border: `1px solid ${COLORS.primary}30`, marginBottom: '24px' }}>
                            <h6 style={{ marginBottom: '12px', color: COLORS.dark, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FeatherIcon icon="info" size={14} /> Auto-filled Information
                            </h6>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '14px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontWeight: '600', color: COLORS.gray, fontSize: '12px', textTransform: 'uppercase' }}>Oil Batch Code</span>
                                    <span style={{ color: COLORS.dark, fontWeight: '500' }}>{reportData.oil_batch_code || '—'}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontWeight: '600', color: COLORS.gray, fontSize: '12px', textTransform: 'uppercase' }}>Drum Number</span>
                                    <span style={{ color: COLORS.dark, fontWeight: '500' }}>{reportData.input_drum_number || '—'}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontWeight: '600', color: COLORS.gray, fontSize: '12px', textTransform: 'uppercase' }}>Manufacturing Date</span>
                                    <span style={{ color: COLORS.dark, fontWeight: '500' }}>
                                        {reportData.manufacturing_date
                                            ? new Date(reportData.manufacturing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                            : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Result + Actions text fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#e08702', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Results <span style={{ color: COLORS.danger }}>*</span>
                                </label>
                                <Form.Control
                                    as="textarea"
                                    rows={5}
                                    value={localResolution}
                                    onChange={e => setLocalResolution(e.target.value)}
                                    placeholder="Describe what was found and what outcome occurred..."
                                    style={{ borderRadius: '8px', border: '2px solid #E2E8F0', background: '#f9f9f9', fontSize: '13px', padding: '10px 12px', resize: 'vertical', lineHeight: '1.5' }}
                                    onFocus={e => e.target.style.borderColor = '#10b981'}
                                    onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#e08702', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Actions <span style={{ color: COLORS.danger }}>*</span>
                                </label>
                                <Form.Control
                                    as="textarea"
                                    rows={5}
                                    value={localActions}
                                    onChange={e => setLocalActions(e.target.value)}
                                    placeholder="Describe the steps taken or planned..."
                                    style={{ borderRadius: '8px', border: '2px solid #E2E8F0', background: '#f9f9f9', fontSize: '13px', padding: '10px 12px', resize: 'vertical', lineHeight: '1.5' }}
                                    onFocus={e => e.target.style.borderColor = '#10b981'}
                                    onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                                />
                            </div>
                        </div>

                        {/* File uploads */}
                        <div>
                            <label style={{ fontSize: '14px', fontWeight: '600', color: COLORS.dark, marginBottom: '16px', display: 'block' }}>
                                Upload Documentation <span style={{ color: COLORS.danger }}>*</span>
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                                {/* Oil Before */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <FeatherIcon icon="upload-cloud" size={16} color={COLORS.success} />
                                        <span style={{ fontWeight: '500', fontSize: '13px' }}>New Oil Before</span>
                                        <span style={{ color: COLORS.danger, fontSize: '12px' }}>*</span>
                                    </div>
                                    <div style={{
                                        border: `2px dashed ${localOilBefore ? COLORS.success : '#10b981'}`,
                                        borderRadius: '12px', padding: '20px', textAlign: 'center',
                                        background: localOilBefore ? '#f0fdf4' : '#fafafa',
                                        cursor: 'pointer', transition: 'all 0.2s ease'
                                    }} onClick={() => document.getElementById('passed-oil-before-input').click()}>
                                        <input
                                            id="passed-oil-before-input"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            style={{ display: 'none' }}
                                            onChange={e => {
                                                if (e.target.files[0]) {
                                                    setLocalOilBefore(e.target.files[0]);
                                                }
                                            }}
                                        />
                                        {localOilBefore ? (
                                            <>
                                                <FeatherIcon icon="file" size={32} color={COLORS.success} />
                                                <p style={{ margin: '8px 0 0', fontSize: '12px', color: COLORS.success }}>{localOilBefore.name}</p>
                                                <button onClick={e => { e.stopPropagation(); setLocalOilBefore(null); }}
                                                    style={{ marginTop: '8px', background: 'none', border: 'none', color: COLORS.danger, fontSize: '11px', cursor: 'pointer' }}>
                                                    Remove
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <FeatherIcon icon="cloud" size={32} color={COLORS.success} />
                                                <p style={{ margin: '8px 0 0', fontSize: '12px', color: COLORS.gray }}>Click to upload or drag and drop</p>
                                                <p style={{ margin: '4px 0 0', fontSize: '10px', color: COLORS.gray }}>PDF, JPG, PNG (Max 10MB)</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Oil After */}
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <FeatherIcon icon="upload-cloud" size={16} color={COLORS.success} />
                                        <span style={{ fontWeight: '500', fontSize: '13px' }}>New Oil After</span>
                                        <span style={{ color: COLORS.danger, fontSize: '12px' }}>*</span>
                                    </div>
                                    <div style={{
                                        border: `2px dashed ${localOilAfter ? COLORS.success : '#10b981'}`,
                                        borderRadius: '12px', padding: '20px', textAlign: 'center',
                                        background: localOilAfter ? '#f0fdf4' : '#fafafa',
                                        cursor: 'pointer', transition: 'all 0.2s ease'
                                    }} onClick={() => document.getElementById('passed-oil-after-input').click()}>
                                        <input
                                            id="passed-oil-after-input"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            style={{ display: 'none' }}
                                            onChange={e => {
                                                if (e.target.files[0]) {
                                                    setLocalOilAfter(e.target.files[0]);
                                                }
                                            }}
                                        />
                                        {localOilAfter ? (
                                            <>
                                                <FeatherIcon icon="file" size={32} color={COLORS.success} />
                                                <p style={{ margin: '8px 0 0', fontSize: '12px', color: COLORS.success }}>{localOilAfter.name}</p>
                                                <button onClick={e => { e.stopPropagation(); setLocalOilAfter(null); }}
                                                    style={{ marginTop: '8px', background: 'none', border: 'none', color: COLORS.danger, fontSize: '11px', cursor: 'pointer' }}>
                                                    Remove
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <FeatherIcon icon="cloud" size={32} color={COLORS.success} />
                                                <p style={{ margin: '8px 0 0', fontSize: '12px', color: COLORS.gray }}>Click to upload or drag and drop</p>
                                                <p style={{ margin: '4px 0 0', fontSize: '10px', color: COLORS.gray }}>PDF, JPG, PNG (Max 10MB)</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </Modal.Body>

                    <Modal.Footer style={{ borderTop: `1px solid ${COLORS.success}20`, padding: '16px 32px', background: 'white', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
                        <button onClick={onHide} disabled={isSubmitting}
                            style={{ background: 'linear-gradient(45deg, #6b7280, #9ca3af)', border: 'none', borderRadius: '12px', padding: '12px 32px', color: 'white', fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                            Cancel
                        </button>
                        <button
                            onClick={() => handleSubmit({ resolution: localResolution, actions: localActions, oilBefore: localOilBefore, oilAfter: localOilAfter })}
                            disabled={isSubmitting}
                            style={{ background: 'linear-gradient(45deg, #10b981, #059669)', border: 'none', borderRadius: '12px', padding: '12px 32px', color: 'white', fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                            {isSubmitting
                                ? <><Spinner animation="border" size="sm" /> Submitting...</>
                                : <><FeatherIcon icon="save" size={18} /> Submit Report</>}
                        </button>
                    </Modal.Footer>
                </div>
            </Modal>
        );
    };


    const handleDownloadPDF = useCallback(async () => {
        setIsLoading(true);
        try {
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const W = 210;
            const H = 297;
            const margin = 14;
            const contentW = W - margin * 2;
            let y = 0;

            // ── helpers ──────────────────────────────────────────────────────────
            const hexToRgb = (hex) => {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return [r, g, b];
            };
            const setFill = (hex) => pdf.setFillColor(...hexToRgb(hex));
            const setTxt = (hex) => pdf.setTextColor(...hexToRgb(hex));
            const setDraw = (hex) => pdf.setDrawColor(...hexToRgb(hex));

            const newPage = () => { pdf.addPage(); y = margin; };
            const checkPage = (needed = 20) => { if (y + needed > H - 10) newPage(); };

            const filledRect = (x, ry, w, h, color, radius = 3) => {
                setFill(color);
                pdf.roundedRect(x, ry, w, h, radius, radius, 'F');
            };

            const sectionHeader = (title, color = '#254252') => {
                checkPage(14);
                filledRect(margin, y, contentW, 9, color, 2);
                setTxt('#ffffff');
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                pdf.text(title.toUpperCase(), margin + 4, y + 6);
                y += 12;
            };

            const kvRow = (label, value, x, ry, w) => {
                pdf.setFontSize(7.5);
                pdf.setFont('helvetica', 'bold');
                setTxt('#888888');
                pdf.text(label.toUpperCase(), x, ry);
                pdf.setFont('helvetica', 'normal');
                setTxt('#171C2D');
                pdf.setFontSize(9);
                const lines = pdf.splitTextToSize(String(value || '—'), w - 2);
                pdf.text(lines, x, ry + 4.5);
                return ry + 4.5 + lines.length * 4;
            };

            // ── chart drawer (multi-line or single-record table) ─────────────────
            const pdfData = filteredMatchData.length > 0 ? filteredMatchData : matchData;

            const drawLineChart = async (params, chartX, chartY, chartW, chartH, title, titleColor) => {
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'bold');
                setTxt(titleColor || '#E37239');
                pdf.text(title, chartX, chartY - 2);

                filledRect(chartX, chartY, chartW, chartH, '#fff8ee', 2);
                setDraw('#dddddd');
                pdf.setLineWidth(0.2);
                pdf.rect(chartX, chartY, chartW, chartH);

                if (pdfData.length < 1) {
                    pdf.setFontSize(8); setTxt('#999999');
                    pdf.setFont('helvetica', 'italic');
                    pdf.text('No historical data available', chartX + chartW / 2 - 20, chartY + chartH / 2);
                    return;
                }

                // single record → table
                if (pdfData.length === 1) {
                    const record = pdfData[0];
                    const dateLabel = new Date(record.analysis_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                    const colWidths = [chartW * 0.45, chartW * 0.25, chartW * 0.30];
                    const rowH = 7;
                    const headerY = chartY + 6;
                    filledRect(chartX + 2, headerY - 4, chartW - 4, rowH, '#f5e4c0', 1);
                    ['Parameter', 'Value', 'Date'].forEach((h, i) => {
                        const cx = chartX + 4 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
                        setTxt('#4a3728'); pdf.setFontSize(7.5); pdf.setFont('helvetica', 'bold');
                        pdf.text(h, cx, headerY);
                    });
                    setDraw('#e8d0a0'); pdf.setLineWidth(0.3);
                    pdf.line(chartX + 2, headerY + 2, chartX + chartW - 2, headerY + 2);
                    let rowY = headerY + rowH;
                    params.forEach((param, pi) => {
                        const val = record[param.key];
                        if (val === null || val === undefined || val === '') return;
                        filledRect(chartX + 2, rowY - 4, chartW - 4, rowH, pi % 2 === 0 ? '#ffffff' : '#fff8ee', 0);
                        setDraw('#eeeeee'); pdf.setLineWidth(0.1);
                        pdf.line(chartX + 2, rowY + 2, chartX + chartW - 2, rowY + 2);
                        [param.label, `${val}${param.unit ? ' ' + param.unit : ''}`, dateLabel].forEach((cell, ci) => {
                            const cx = chartX + 4 + colWidths.slice(0, ci).reduce((a, b) => a + b, 0);
                            setTxt(ci === 1 ? '#E37239' : ci === 0 ? '#2d1f0f' : '#888888');
                            pdf.setFontSize(7.5); pdf.setFont('helvetica', ci === 1 ? 'bold' : 'normal');
                            const mc = Math.floor(colWidths[ci] / 2.2);
                            pdf.text(String(cell).length > mc ? String(cell).slice(0, mc - 1) + '…' : String(cell), cx, rowY);
                        });
                        rowY += rowH;
                        if (rowY > chartY + chartH - 4) return;
                    });
                    setTxt('#aaaaaa'); pdf.setFontSize(6.5); pdf.setFont('helvetica', 'italic');
                    pdf.text('Single record — trend chart requires 2+ data points', chartX + 4, chartY + chartH - 3);
                    return;
                }

                // multi-record → line chart
                const colors = ['#E37239', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4', '#84CC16'];
                const sorted = [...pdfData].sort((a, b) => new Date(a.analysis_date) - new Date(b.analysis_date));
                const visibleParams = params.filter(p => sorted.some(item => !isNaN(parseFloat(item[p.key]))));
                const legendRows = Math.ceil((visibleParams.length || 1) / 6);
                const legendH = legendRows * 6 + 4;
                const padL = 12, padR = 6, padT = 6, padB = 18 + legendH;
                const plotW = chartW - padL - padR;
                const plotH = chartH - padT - padB;

                const allVals = [];
                params.forEach(p => sorted.forEach(item => { const v = parseFloat(item[p.key]); if (!isNaN(v)) allVals.push(v); }));
                if (allVals.length === 0) {
                    pdf.setFontSize(8); setTxt('#999999'); pdf.setFont('helvetica', 'italic');
                    pdf.text('No data', chartX + chartW / 2 - 8, chartY + chartH / 2); return;
                }

                const minVal = Math.min(...allVals);
                const maxVal = Math.max(...allVals);
                const valRange = maxVal - minVal || 1;
                const gridLines = 4;

                for (let g = 0; g <= gridLines; g++) {
                    const gy = chartY + padT + (plotH / gridLines) * g;
                    setDraw('#eeeeee'); pdf.setLineWidth(0.1);
                    pdf.line(chartX + padL, gy, chartX + padL + plotW, gy);
                    const gVal = maxVal - (valRange / gridLines) * g;
                    setTxt('#999999'); pdf.setFontSize(6); pdf.setFont('helvetica', 'normal');
                    pdf.text(gVal.toFixed(1), chartX + 1, gy + 1.5);
                }

                const xStep = sorted.length > 1 ? plotW / (sorted.length - 1) : plotW;
                sorted.forEach((item, i) => {
                    if (i % Math.ceil(sorted.length / 5) === 0 || i === sorted.length - 1) {
                        const px = chartX + padL + i * xStep;
                        const dl = new Date(item.analysis_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        setTxt('#999999'); pdf.setFontSize(5.5);
                        pdf.text(dl, px - 4, chartY + chartH - 2);
                    }
                });

                const legendStartY = chartY + chartH - legendH + 2;
                visibleParams.forEach((param, pi) => {
                    const lineColor = colors[params.indexOf(param) % colors.length];
                    const col = pi % 6; const row = Math.floor(pi / 6);
                    const legendItemW = (chartW - padL - padR) / Math.min(params.length, 6);
                    const lx = chartX + padL + col * legendItemW;
                    const ly = legendStartY + row * 6;
                    setFill(lineColor); pdf.roundedRect(lx, ly, 7, 2.5, 0.5, 0.5, 'F');
                    setTxt('#333333'); pdf.setFontSize(5.5); pdf.setFont('helvetica', 'normal');
                    const tr = param.label.length > 14 ? param.label.slice(0, 13) + '…' : param.label;
                    pdf.text(tr, lx + 9, ly + 2);
                });

                params.forEach((param, pi) => {
                    const lineColor = colors[pi % colors.length];
                    const points = sorted.map((item, i) => {
                        const v = parseFloat(item[param.key]);
                        if (isNaN(v)) return null;
                        return { x: chartX + padL + i * xStep, y: chartY + padT + plotH - ((v - minVal) / valRange) * plotH };
                    }).filter(Boolean);
                    if (points.length < 1) return;
                    setDraw(lineColor); pdf.setLineWidth(0.8);
                    for (let i = 1; i < points.length; i++) pdf.line(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y);
                    points.forEach(pt => { setFill(lineColor); pdf.circle(pt.x, pt.y, 0.8, 'F'); });
                });
            };

            // ── PAGE 1: HEADER ────────────────────────────────────────────────────
            filledRect(0, 0, W, 22, '#171C2D', 0);
            filledRect(0, 22, W, 2, '#EAB56F', 0);
            filledRect(margin, 4, 14, 14, '#F59E0B', 2);

            // Load logo from bundled asset
            const logoBase64 = await new Promise((resolve) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth || 128;
                    canvas.height = img.naturalHeight || 128;
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                };
                img.onerror = () => resolve(null);
                img.src = logoArms;
            });
            if (logoBase64) {
                pdf.addImage(logoBase64, 'PNG', margin + 1, 5, 12, 12);
            }

            setTxt('#EAB56F');
            pdf.setFontSize(16); pdf.setFont('helvetica', 'bold');
            pdf.text('Oil Analysis Report — No Asset', margin + 18, 11);



            setTxt('#aaaaaa');
            pdf.setFontSize(7.5); pdf.setFont('helvetica', 'normal');
            pdf.text(`ID: #${analysis_id}  •  Generated: ${new Date().toLocaleString()}`, margin + 18, 17);

            // Analysis status badge
            const statusColors = { Passed: '#10b981', Failed: '#ef4444' };
            const sc = statusColors[reportData.analysis_status] || { bg: '#64748b', text: '#ffffff' };
            const statusLabel = reportData.analysis_status || 'Pending';
            pdf.setFontSize(6.5); pdf.setFont('helvetica', 'normal'); setTxt('#aaaaaa');
            pdf.text('ANALYSIS STATUS', W - margin, 6, { align: 'right' });
            pdf.setFontSize(8.5); pdf.setFont('helvetica', 'bold');
            const slw = pdf.getTextWidth(statusLabel) + 12;
            setFill(statusColors[reportData.analysis_status] || '#64748b');
            pdf.roundedRect(W - margin - slw, 8, slw, 11, 3, 3, 'F');
            setTxt('#ffffff');
            pdf.text(statusLabel, W - margin - slw / 2, 15, { align: 'center' });

            y = 28;

            // ── Stat cards ────────────────────────────────────────────────────────
            const cards = [
                { label: 'Oil Batch Code', value: reportData.oil_batch_code },
                { label: 'Drum Number', value: reportData.input_drum_number },
                { label: 'Trivector', value: reportData.trivector },
                { label: 'Manufacturing Date', value: reportData.manufacturing_date ? new Date(reportData.manufacturing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                { label: 'Analysis Date', value: reportData.analysis_date ? new Date(reportData.analysis_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
            ];
            const cardW = contentW / cards.length - 1.5;
            cards.forEach((c, i) => {
                const cx = margin + i * (cardW + 1.8);
                filledRect(cx, y, cardW, 16, '#f0f4ff', 2);
                setDraw('#3b82f6'); pdf.setLineWidth(0.3);
                pdf.roundedRect(cx, y, cardW, 16, 2, 2);
                kvRow(c.label, c.value, cx + 3, y + 4, cardW - 3);
            });
            y += 20;

            // ── Report Info ───────────────────────────────────────────────────────
            sectionHeader('Report Information', '#254252');
            const infoItems = [
                { label: 'Created By', value: reportData.created_by },
                { label: 'Analysis Status', value: reportData.analysis_status || 'Pending' },
                { label: 'Resampling Schedule', value: resamplingSchedule ? new Date(resamplingSchedule).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not scheduled' },
                { label: 'Trivector', value: reportData.trivector || 'N/A' },
            ];
            const halfW = (contentW - 4) / 2;
            infoItems.forEach((item, i) => {
                const col = i % 2; const row = Math.floor(i / 2);
                const ix = margin + col * (halfW + 4);
                const iy = y + row * 14;
                filledRect(ix, iy, halfW, 12, '#fafafa', 2);
                kvRow(item.label, item.value, ix + 3, iy + 3, halfW - 3);
            });
            y += Math.ceil(infoItems.length / 2) * 14 + 4;

            // ── Recommendations ───────────────────────────────────────────────────
            checkPage(20);
            sectionHeader('Recommendations', '#4a3728');
            if (reportData.recommendations) {
                const recLines = pdf.splitTextToSize(reportData.recommendations, contentW - 6);
                const recH = recLines.length * 4.5 + 6;
                filledRect(margin, y, contentW, recH, '#fffaf0', 2);
                setDraw('#f0e4c8'); pdf.setLineWidth(0.3);
                pdf.roundedRect(margin, y, contentW, recH, 2, 2);
                pdf.setFontSize(8.5); pdf.setFont('helvetica', 'normal'); setTxt('#3e2c1f');
                pdf.text(recLines, margin + 3, y + 5);
                y += recH + 6;
            } else {
                pdf.setFontSize(8); setTxt('#999999'); pdf.setFont('helvetica', 'italic');
                pdf.text('No recommendations available.', margin + 3, y + 4);
                y += 10;
            }

            // ── Resolution / Results ──────────────────────────────────────────────
            if (reportData.resolution) {
                checkPage(20);
                sectionHeader('Results & Actions', '#145a14');
                const resLines = pdf.splitTextToSize(reportData.resolution, contentW - 6);
                const resH = resLines.length * 4.5 + 6;
                filledRect(margin, y, contentW, resH, '#f0fff4', 2);
                setDraw('#bbf7d0'); pdf.setLineWidth(0.3); pdf.roundedRect(margin, y, contentW, resH, 2, 2);
                pdf.setFontSize(7.5); pdf.setFont('helvetica', 'bold'); setTxt('#145a14');
                pdf.text('RESULTS', margin + 3, y + 4);
                pdf.setFont('helvetica', 'normal'); setTxt('#1f3e21'); pdf.setFontSize(8.5);
                pdf.text(resLines, margin + 3, y + 9);
                y += resH + 6;

                if (reportData.actions) {
                    checkPage(16);
                    const actLines = pdf.splitTextToSize(reportData.actions, contentW - 6);
                    const actH = actLines.length * 4.5 + 6;
                    filledRect(margin, y, contentW, actH, '#f0fff4', 2);
                    setDraw('#bbf7d0'); pdf.setLineWidth(0.3); pdf.roundedRect(margin, y, contentW, actH, 2, 2);
                    pdf.setFontSize(7.5); pdf.setFont('helvetica', 'bold'); setTxt('#145a14');
                    pdf.text('ACTIONS', margin + 3, y + 4);
                    pdf.setFont('helvetica', 'normal'); setTxt('#1f3e21'); pdf.setFontSize(8.5);
                    pdf.text(actLines, margin + 3, y + 9);
                    y += actH + 6;
                }
            }

            // ── Oil Documentation images ──────────────────────────────────────────
            if (reportData.oil_before || reportData.oil_after) {
                const loadImageAsBase64 = (url) => new Promise(async (resolve) => {
                    try {
                        const response = await fetch(url);
                        if (!response.ok) { resolve(null); return; }
                        const blob = await response.blob();
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const img = new Image();
                            img.onload = () => {
                                const canvas = document.createElement('canvas');
                                canvas.width = img.naturalWidth || 800;
                                canvas.height = img.naturalHeight || 600;
                                const ctx = canvas.getContext('2d');
                                ctx.fillStyle = '#ffffff';
                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                                ctx.drawImage(img, 0, 0);
                                resolve({ data: canvas.toDataURL('image/jpeg', 0.85), w: canvas.width, h: canvas.height });
                            };
                            img.onerror = () => resolve(null);
                            img.src = reader.result;
                        };
                        reader.onerror = () => resolve(null);
                        reader.readAsDataURL(blob);
                    } catch { resolve(null); }
                });

                checkPage(110);
                sectionHeader('Oil Documentation', '#145a14');

                const imgPairs = [
                    { key: 'oil_before', label: 'NEW OIL BEFORE', color: '#327eca', badgeBg: '#E6F1FB' },
                    { key: 'oil_after', label: 'NEW OIL AFTER', color: '#0092ac', badgeBg: '#E1F5EE' },
                ].filter(p => reportData[p.key]);

                const docCardW = imgPairs.length === 2 ? (contentW - 6) / 2 : contentW;
                const imgH = 75; const hdrH = 10; const ftrH = 8;
                const docCardH = hdrH + imgH + ftrH;

                for (let i = 0; i < imgPairs.length; i++) {
                    const { key, label, color, badgeBg } = imgPairs[i];
                    const cx = margin + i * (docCardW + 6);

                    filledRect(cx + 1.5, y + 1.5, docCardW, docCardH, '#e0e0e0', 3);
                    filledRect(cx, y, docCardW, docCardH, '#ffffff', 3);
                    filledRect(cx, y, docCardW, hdrH, color, 3);
                    filledRect(cx, y + hdrH - 3, docCardW, 3, color, 0);

                    setTxt('#ffffff'); pdf.setFontSize(8); pdf.setFont('helvetica', 'bold');
                    pdf.text(label, cx + docCardW / 2, y + 7, { align: 'center' });

                    filledRect(cx, y + hdrH, docCardW, imgH, '#f8f9fa', 0);

                    const fileUrl = `${config.baseApi}/${reportData[key]}`;
                    const imgResult = await loadImageAsBase64(fileUrl);
                    if (imgResult) {
                        const aspect = imgResult.w / imgResult.h;
                        let dW = docCardW - 6; let dH = dW / aspect;
                        if (dH > imgH - 4) { dH = imgH - 4; dW = dH * aspect; }
                        const imgX = cx + (docCardW - dW) / 2;
                        const imgY = y + hdrH + (imgH - dH) / 2;
                        pdf.addImage(imgResult.data, 'JPEG', imgX, imgY, dW, dH);
                    } else {
                        filledRect(cx, y + hdrH, docCardW, imgH, '#f5f0e8', 0);
                        pdf.setFontSize(8); setTxt('#aaaaaa'); pdf.setFont('helvetica', 'italic');
                        pdf.text('Image unavailable', cx + docCardW / 2, y + hdrH + imgH / 2, { align: 'center' });
                    }

                    filledRect(cx, y + hdrH + imgH, docCardW, ftrH, badgeBg, 0);
                    filledRect(cx, y + hdrH + imgH, docCardW, 2, badgeBg, 0);
                    filledRect(cx, y + docCardH - 3, docCardW, 3, badgeBg, 3);

                    setTxt(color); pdf.setFontSize(6.5); pdf.setFont('helvetica', 'normal');
                    pdf.text(key === 'oil_before' ? 'Oil Before' : 'Oil After', cx + docCardW / 2, y + hdrH + imgH + ftrH - 2, { align: 'center' });

                    setDraw(color); pdf.setLineWidth(0.5);
                    pdf.roundedRect(cx, y, docCardW, docCardH, 3, 3);
                }
                y += docCardH + 10;
            }

            // ── Test Results table (current values) ───────────────────────────────
            const currentParams = getParams(reportData.trivector);
            if (currentParams.length > 0) {
                checkPage(20);
                sectionHeader('Test Results — Current Values', '#254252');

                const colW = [contentW * 0.42, contentW * 0.3, contentW * 0.28];
                filledRect(margin, y, contentW, 7, '#254252', 2);
                ['Parameter', 'Current Value', 'Unit'].forEach((col, i) => {
                    const cx = margin + colW.slice(0, i).reduce((a, b) => a + b, 0);
                    setTxt('#ffffff'); pdf.setFontSize(7.5); pdf.setFont('helvetica', 'bold');
                    pdf.text(col, cx + 2, y + 5);
                });
                y += 8;

                currentParams.forEach((param, i) => {
                    checkPage(7);
                    const val = reportData[param.key];
                    if (val === null || val === undefined || val === '') return;
                    filledRect(margin, y, contentW, 6, i % 2 === 0 ? '#ffffff' : '#f8f9fa', 0);
                    setDraw('#eeeeee'); pdf.setLineWidth(0.1);
                    pdf.line(margin, y + 6, margin + contentW, y + 6);
                    [param.label, String(val), param.unit || '—'].forEach((cell, ci) => {
                        const cx = margin + colW.slice(0, ci).reduce((a, b) => a + b, 0);
                        setTxt(ci === 1 ? '#171C2D' : '#555555');
                        pdf.setFontSize(7.5); pdf.setFont('helvetica', ci === 1 ? 'bold' : 'normal');
                        pdf.text(String(cell), cx + 2, y + 4.5);
                    });
                    y += 6.5;
                });
                y += 4;
            }

            // ── Historical Trends ─────────────────────────────────────────────────
            if (currentParams.length > 0) {
                if (pdfData.length <= 1) {
                    // // single record: already shown in table above — add a note page
                    // newPage();
                    // filledRect(0, 0, W, 14, '#254252', 0);
                    // setTxt('#ffffff'); pdf.setFontSize(12); pdf.setFont('helvetica', 'bold');
                    // pdf.text('Historical Trends — Single Record', margin, 10);
                    // pdf.setFontSize(8); pdf.setFont('helvetica', 'normal'); setTxt('#aaaaaa');
                    // pdf.text('Trend charts require 2 or more records for the same batch / drum.', margin, 20);
                    // y = 28;
                } else {
                    // overview page: all params on one chart
                    newPage();
                    filledRect(0, 0, W, 14, '#254252', 0);
                    setTxt('#ffffff'); pdf.setFontSize(12); pdf.setFont('helvetica', 'bold');
                    pdf.text(`Historical Trends — ${reportData.trivector || 'Parameters'}`, margin, 10);

                    const overviewH = H - 14 - margin * 2 - 10;
                    await drawLineChart(currentParams, margin, 18, contentW, overviewH, `All Parameters (${pdfData.length} records)`, '#E37239');

                    // individual charts, 3 per page
                    const chartsPerPage = 3;
                    const titleH = 8; const gapH = 4;
                    const indH = Math.floor((H - 18 - margin - (titleH + gapH) * chartsPerPage) / chartsPerPage);

                    for (let i = 0; i < currentParams.length; i++) {
                        if (i % chartsPerPage === 0) {
                            newPage();
                            filledRect(0, 0, W, 14, '#EAB56F', 0);
                            setTxt('#171C2D'); pdf.setFontSize(10); pdf.setFont('helvetica', 'bold');
                            const pg = Math.floor(i / chartsPerPage) + 1;
                            const tp = Math.ceil(currentParams.length / chartsPerPage);
                            pdf.text(`Parameter Trends (${pg}/${tp}) — ${reportData.trivector || ''}`, margin, 10);
                            y = 18;
                        }
                        const slotIndex = i % chartsPerPage;
                        const slotTop = y + slotIndex * (titleH + indH + gapH);
                        await drawLineChart(
                            [currentParams[i]], margin, slotTop + titleH, contentW, indH,
                            `${currentParams[i].label}${currentParams[i].unit ? '  (' + currentParams[i].unit + ')' : ''}`,
                            '#E37239'
                        );
                    }
                }
            }

            // ── Save ──────────────────────────────────────────────────────────────
            const batchSafe = (reportData.oil_batch_code || 'Report').replace(/\s+/g, '_');
            const fileName = `Oil_Analysis_Report_${batchSafe}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
            showAlertMessage('success', 'Downloaded', 'PDF report saved successfully.');

        } catch (err) {
            console.error('PDF generation failed:', err);
            showAlertMessage('error', 'Download Failed', 'Could not generate PDF. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [reportData, filteredMatchData, matchData, analysis_id, resamplingSchedule, showAlertMessage]);



    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={{
            background: 'radial-gradient(circle at 10% 30%, #254252 0%, #171C2D 100%)',
            minHeight: '100vh', padding: 'clamp(20px, 5vw, 40px)',
            position: 'relative', overflow: 'hidden',
            paddingTop: 'clamp(30px, 6vw, 50px)'
        }}>
            <Loading show={isLoading} />

            {/* Decorative blobs */}
            <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'rgb(255,255,255)', opacity: '0.05', top: '-200px', right: '-200px', animation: 'float 25s infinite ease-in-out', zIndex: 1 }} />
            <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgb(255,255,255)', opacity: '0.05', bottom: '-150px', left: '-150px', animation: 'float 20s infinite ease-in-out reverse', zIndex: 1 }} />
            <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgb(255,255,255)', opacity: '0.03', top: '50%', left: '20%', animation: 'float 18s infinite ease-in-out', zIndex: 1 }} />

            <SamplingScheduleModal />
            // AFTER
            <PassedCombinedModal
                show={showPassedCombinedModal}
                onHide={() => {
                    if (!isUploadingDoc) {
                        setShowPassedCombinedModal(false);
                    }
                }}
                isSubmitting={isUploadingDoc}
                reportData={reportData}
                handleSubmit={handlePassedCombinedSubmit}
            />

            {showAlert && (
                <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
                    <AlertModal
                        type={alertConfig.type}
                        title={alertConfig.title}
                        description={alertConfig.description}
                        onClose={() => setShowAlert(false)}
                        autoClose={5000}
                    />
                </div>
            )}

            <div style={{ position: 'relative', zIndex: 2 }}>
                <Container fluid style={{
                    paddingBottom: '60px',
                    paddingLeft: 'clamp(8px, 3vw, 15px)',
                    paddingRight: 'clamp(8px, 3vw, 15px)'
                }}>

                    {/* ── Header ── */}
                    <div style={{ marginBottom: '32px' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            flexWrap: 'wrap', gap: '16px', marginBottom: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '75px', height: '75px',
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                                    borderRadius: '18px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', boxShadow: '0 8px 20px rgba(245,158,11,0.3)'
                                }}>
                                    <FeatherIcon icon="activity" size={28} color="white" />
                                </div>
                                <div>
                                    <h1 style={{
                                        fontSize: 'clamp(28px, 6vw, 36px)', color: '#EAB56F',
                                        letterSpacing: '-0.5px',
                                        textShadow: '0 4px 20px rgba(234,181,111,0.2)',
                                        fontWeight: '800',
                                    }}>
                                        Asset Analysis Report
                                    </h1>
                                    <p style={{ fontSize: '14px', color: '#ffffff', margin: '4px 0 0' }}>
                                        ID: #{analysis_id} • Real-time diagnostic data
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleDownloadPDF}
                                style={{
                                    background: 'linear-gradient(135deg, #EAB56F, #F9982F, #E37239)',
                                    border: '2px solid #EAB56F',
                                    borderRadius: '50px',
                                    padding: '10px 20px',
                                    color: '#ffffff',
                                    fontWeight: '600',
                                    fontSize: 'clamp(12px, 2.5vw, 14px)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 15px rgba(234,181,111,0.2)',
                                    letterSpacing: '0.3px',
                                    marginLeft: 'auto'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(234,181,111,0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(234,181,111,0.2)';
                                }}
                            >
                                <FeatherIcon icon="download" size={16} />
                                Download PDF
                            </button>
                        </div>
                        <div style={{ height: '4px', background: 'linear-gradient(90deg, #f59e0b 0%, #f97316 50%, #fef3c7 100%)', borderRadius: '2px' }} />

                    </div>

                    {/* ── Stat Cards ── */}
                    <Row style={{ flexWrap: 'nowrap' }}>
                        <Col xs={12} sm={6} lg={3} style={{ marginBottom: '16px', flex: 1 }}>
                            <StatCard label="Oil Batch Code" value={reportData.oil_batch_code} icon="droplet" bgColor="#e6f3ff" borderColor="#3b82f6" accentColor="#3b82f6" />
                        </Col>
                        <Col xs={12} sm={6} lg={3} style={{ marginBottom: '16px', flex: 1 }}>
                            <StatCard label="Drum Number" value={reportData.input_drum_number} icon="box" bgColor="#e6ffe8" borderColor="#62c543" accentColor="#21a81d" />
                        </Col>
                        <Col xs={12} sm={6} lg={3} style={{ marginBottom: '16px', flex: 1 }}>
                            <StatCard
                                label="Manufacturing Date"
                                value={reportData.manufacturing_date
                                    ? new Date(reportData.manufacturing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                    : '—'}
                                icon="calendar" bgColor="#f7e3ff" borderColor="#5a00c0" accentColor="#4c0094"
                            />
                        </Col>
                        <Col xs={12} sm={6} lg={3} style={{ marginBottom: '16px', flex: 1 }}>
                            <StatCard
                                label="Analysis Date"
                                value={reportData.analysis_date
                                    ? new Date(reportData.analysis_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                    : '—'}
                                icon="calendar"
                            />
                        </Col>
                    </Row>

                    {/* ── Info Bar (Created By / Trivector / Status / Resampling) ── */}
                    <div style={{
                        background: 'linear-gradient(185deg, #f5f5f5 0%, #fcf8f3 100%)',
                        borderRadius: '20px', padding: 'clamp(4px, 4vw, 12px)',
                        marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                        border: '2px solid rgb(214, 180, 105)'
                    }}>
                        <Row className="align-items-center">
                            <Col xs={12}>
                                <div style={{
                                    display: 'flex', alignItems: 'stretch',
                                    gap: 'clamp(16px, 4vw, 24px)', flexWrap: 'wrap',
                                    flexDirection: 'row', padding: 'clamp(4px, 2vw, 6px)',
                                    background: '#fafafa', borderRadius: '12px', transition: 'all 0.2s ease'
                                }}>

                                    {/* Created By */}
                                    <div style={{ flex: '1 1 160px', minWidth: 'clamp(140px, 22vw, 180px)', padding: '8px 0' }}>
                                        <div style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', color: COLORS.gray, marginBottom: '8px', fontWeight: '500', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                                            <FeatherIcon icon="user" size={clampNumber(10, 12)} style={{ marginRight: '6px', color: COLORS.accent, verticalAlign: 'middle' }} />
                                            Created By
                                        </div>
                                        <div style={{ fontSize: 'clamp(13px, 4vw, 18px)', fontWeight: '600', color: COLORS.dark, wordBreak: 'break-word', display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1.4, marginLeft: '25px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${COLORS.primary}`, background: '#E9EDF2', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {creatorAvatar ? (
                                                    <img src={`${config.baseApi}/${creatorAvatar}`} alt={reportData.created_by}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML = `<span style="font-size:11px;font-weight:700;color:#EAB56F">${reportData.created_by?.charAt(0)?.toUpperCase() || '?'}</span>`; }}
                                                    />
                                                ) : (
                                                    <span style={{ fontSize: '11px', fontWeight: 700, color: COLORS.primary }}>
                                                        {reportData.created_by?.charAt(0)?.toUpperCase() || '?'}
                                                    </span>
                                                )}
                                            </div>
                                            <span>{reportData.created_by || 'Unknown'}</span>
                                        </div>
                                    </div>

                                    {/* Trivector */}
                                    <div style={{ flex: '1 1 160px', minWidth: 'clamp(140px, 22vw, 180px)', padding: '8px 0', position: 'relative' }}>
                                        <div style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', color: COLORS.gray, marginBottom: '8px', fontWeight: '500', letterSpacing: '0.3px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <FeatherIcon icon="layers" size={clampNumber(10, 12)} style={{ marginRight: '6px', color: COLORS.accent, verticalAlign: 'middle' }} />
                                            Trivector
                                            <div style={{ position: 'relative', display: 'inline-block', cursor: 'help' }}>
                                                <FeatherIcon icon="info" size={12} color={COLORS.gray} />
                                                <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', background: COLORS.dark, color: 'white', fontSize: '11px', padding: '4px 8px', borderRadius: '4px', whiteSpace: 'nowrap', display: 'none', zIndex: 100, pointerEvents: 'none' }} className="tooltip-text">
                                                    Oil type classification
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: 'clamp(13px, 4vw, 18px)', fontWeight: '600', color: COLORS.dark, wordBreak: 'break-word', display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1.4, marginLeft: '25px' }}>
                                            <span>{reportData.trivector || 'N/A'}</span>
                                        </div>
                                    </div>

                                    {/* Analysis Status */}
                                    <div style={{ flex: '1 1 160px', minWidth: 'clamp(140px, 22vw, 180px)', padding: '8px 0', position: 'relative' }}>
                                        <div style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', color: COLORS.gray, marginBottom: '8px', fontWeight: '500', letterSpacing: '0.3px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <FeatherIcon icon="alert-triangle" size={clampNumber(10, 12)} style={{ marginRight: '6px', color: COLORS.accent, verticalAlign: 'middle' }} />
                                            Analysis Status
                                        </div>
                                        <div style={{ fontSize: 'clamp(13px, 4vw, 18px)', fontWeight: '600', color: COLORS.dark, wordBreak: 'break-word', display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1.4, marginLeft: '25px' }}>
                                            {(!reportData.analysis_status || reportData.analysis_status === '') && reportData.status_failed_first === '1' && permissions.canSetStatus ? (

                                                <div ref={statusDropdownRef} style={{ position: 'relative' }}>
                                                    <button
                                                        onClick={() => setShowStatusDropdown(prev => !prev)}
                                                        disabled={isSavingStatus}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #fff8ee 0%, #fff3e0 100%)', border: `2px dashed ${COLORS.primary}`, borderRadius: '10px', padding: '7px 14px', cursor: isSavingStatus ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: '600', color: COLORS.dark, outline: 'none', opacity: isSavingStatus ? 0.7 : 1 }}
                                                    >
                                                        {isSavingStatus ? (
                                                            <><Spinner animation="border" size="sm" style={{ color: COLORS.accent }} /> Saving...</>
                                                        ) : (
                                                            <>
                                                                <FeatherIcon icon="edit-2" size={14} color={COLORS.accent} />
                                                                <span style={{ color: COLORS.gray }}>Set Status</span>
                                                                <FeatherIcon icon="chevron-down" size={14} color={COLORS.accent} style={{ transform: showStatusDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                                                            </>
                                                        )}
                                                    </button>
                                                    {showStatusDropdown && (
                                                        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 999, background: '#ffffff', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: `1px solid ${COLORS.primary}50`, overflow: 'hidden', minWidth: '150px', animation: 'dropdownFadeIn 0.15s ease' }}>
                                                            <button onClick={() => handleStatusSelect('Failed')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: COLORS.danger, textAlign: 'left', borderBottom: '1px solid #f0f0f0' }} onMouseEnter={e => e.currentTarget.style.background = '#fff1f1'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS.danger, flexShrink: 0 }} /> Failed
                                                            </button>
                                                            <button onClick={() => handleStatusSelect('Passed')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: COLORS.success, textAlign: 'left' }} onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS.success, flexShrink: 0 }} /> Passed
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span>{reportData.analysis_status || 'N/A'}</span>
                                            )}
                                        </div>
                                    </div>


                                    {/* Resampling Schedule - Hide when status is Passed */}
                                    {reportData.analysis_status !== 'Passed' && (
                                        <div style={{ flex: '1 1 160px', minWidth: 'clamp(140px, 22vw, 180px)', padding: '8px 0' }}>
                                            <div style={{ fontSize: 'clamp(11px, 2.5vw, 13px)', color: COLORS.gray, marginBottom: '8px', fontWeight: '500', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                                                <FeatherIcon icon="calendar" size={clampNumber(10, 12)} style={{ marginRight: '6px', color: COLORS.accent, verticalAlign: 'middle' }} />
                                                Resampling Schedule
                                            </div>
                                            <div style={{ fontSize: 'clamp(13px, 4vw, 18px)', fontWeight: '600', color: COLORS.dark, wordBreak: 'break-word', display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 1.4, marginLeft: '25px' }}>
                                                {resamplingSchedule ? (
                                                    <span style={{ color: COLORS.success, background: `${COLORS.success}15`, padding: '4px 12px', borderRadius: '20px' }}>
                                                        {new Date(resamplingSchedule).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </span>
                                                ) : reportData.analysis_status === 'Failed' && reportData.status_failed_first === '1' && permissions.canSetResampling ? (

                                                    <button onClick={() => setShowSamplingModal(true)} style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)', border: `2px dashed ${COLORS.warning}`, borderRadius: '12px', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: COLORS.dark }}>
                                                        <FeatherIcon icon="calendar" size={16} color={COLORS.warning} />
                                                        <span>Select Resampling Date</span>
                                                    </button>
                                                ) : (
                                                    <span style={{ color: COLORS.warning }}>Not scheduled</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </Col>
                        </Row>
                    </div>

                    {/* ── Recommendations ── */}
                    <div className="modern-card" style={{ marginBottom: '24px', padding: '20px', background: 'linear-gradient(145deg, #fffaf0 0%, #fff7e8 100%)', border: '1px solid #f0e4c8', borderRadius: '4px', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', backgroundImage: `repeating-linear-gradient(transparent 0px, transparent 28px, rgba(200,180,140,0.15) 28px, rgba(200,180,140,0.15) 29px)`, borderRadius: '4px' }} />
                        <div style={{ position: 'absolute', top: '-3px', left: '10%', width: '80%', height: '6px', background: 'radial-gradient(ellipse at center, rgba(220,190,120,0.3) 0%, transparent 70%)', borderRadius: '50%' }} />

                        {/* ── 1. DOCUMENTATION (TOP) ── */}

                        {/* Docs already uploaded — show preview card */}
                        {reportData.oil_before && reportData.oil_after && (
                            <div style={{
                                marginBottom: '24px', padding: '16px 20px',
                                background: 'linear-gradient(145deg, #f0fdf4 0%, #f0fff4 100%)',
                                border: `2px solid ${COLORS.success}40`,
                                borderRadius: '16px', position: 'relative', zIndex: 1
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FeatherIcon icon="file-text" size={20} color={COLORS.success} />
                                        <div>
                                            <h4 style={{ margin: 0, fontWeight: '700', color: '#166534', fontSize: '15px' }}>Documentation</h4>
                                            <p style={{ margin: '2px 0 0', fontSize: '12px', color: COLORS.gray }}>Oil before & after photos uploaded</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowViewDocModal(true)}
                                        style={{
                                            background: `linear-gradient(45deg, #10b981, #059669)`,
                                            border: 'none', borderRadius: '10px', padding: '10px 20px',
                                            color: 'white', fontWeight: '600', fontSize: '13px',
                                            display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                                        }}>
                                        <FeatherIcon icon="eye" size={14} /> View Documentation
                                    </button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px' }}>
                                    <div style={{ borderRadius: '10px', overflow: 'hidden', border: `1px solid ${COLORS.success}30`, background: 'white', padding: '8px' }}>
                                        <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '600', color: COLORS.gray, textTransform: 'uppercase' }}>Oil Before</p>
                                        {reportData.oil_before.match(/\.(jpg|jpeg|png)$/i) ? (
                                            <img
                                                src={`${config.baseApi}/${reportData.oil_before}`}
                                                alt="Oil Before"
                                                style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' }}
                                                onClick={() => setShowViewDocModal(true)}
                                            />
                                        ) : (
                                            <a href={`${config.baseApi}/${reportData.oil_before}`} target="_blank" rel="noreferrer"
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: COLORS.success, fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
                                                <FeatherIcon icon="file" size={16} /> View PDF
                                            </a>
                                        )}
                                    </div>
                                    <div style={{ borderRadius: '10px', overflow: 'hidden', border: `1px solid ${COLORS.success}30`, background: 'white', padding: '8px' }}>
                                        <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: '600', color: COLORS.gray, textTransform: 'uppercase' }}>Oil After</p>
                                        {reportData.oil_after.match(/\.(jpg|jpeg|png)$/i) ? (
                                            <img
                                                src={`${config.baseApi}/${reportData.oil_after}`}
                                                alt="Oil After"
                                                style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' }}
                                                onClick={() => setShowViewDocModal(true)}
                                            />
                                        ) : (
                                            <a href={`${config.baseApi}/${reportData.oil_after}`} target="_blank" rel="noreferrer"
                                                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: COLORS.success, fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
                                                <FeatherIcon icon="file" size={16} /> View PDF
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Docs NOT yet uploaded — show upload prompt */}

                        {permissions.canUploadDocumentation &&
                            ((reportData.analysis_status === 'Passed' && reportData.resolution) ||
                                (reportData.analysis_status === 'Failed' &&
                                    reportData.status_failed_first === '1' &&
                                    reportData.status_failed_second === '1' &&
                                    reportData.resolution &&
                                    reportData.resolution !== '')) &&
                            !reportData.oil_before &&
                            !reportData.oil_after && (
                                <div style={{
                                    marginBottom: '24px', padding: '16px 20px',
                                    background: 'linear-gradient(145deg, #fef3c7 0%, #fffbeb 100%)',
                                    border: `2px dashed ${COLORS.warning}`,
                                    borderRadius: '16px', position: 'relative', zIndex: 1,
                                    cursor: 'pointer'
                                }}
                                    onClick={() => setShowDocumentationModal(true)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '44px', height: '44px', borderRadius: '12px',
                                                background: `${COLORS.warning}20`, display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                            }}>
                                                <FeatherIcon icon="upload-cloud" size={22} color={COLORS.warning} />
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, fontWeight: '700', color: '#92400e', fontSize: '15px' }}>Documentation Required</h4>
                                                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#b45309' }}>
                                                    Please upload oil before & after photos to complete this report
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowDocumentationModal(true); }}
                                            style={{
                                                background: `linear-gradient(45deg, #EAB56F, #F9982F, #E37239)`,
                                                border: 'none', borderRadius: '10px', padding: '10px 20px',
                                                color: 'white', fontWeight: '600', fontSize: '13px',
                                                display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                                            }}>
                                            <FeatherIcon icon="upload" size={14} /> Upload Now
                                        </button>
                                    </div>
                                </div>
                            )}
                        {/* ── Complete Report Button — always visible when eligible ── */}
                        {permissions.canAddResolution && (
                            reportData.analysis_status === 'Passed' ||
                            (reportData.analysis_status === 'Failed' &&
                                reportData.status_failed_first === '1' &&
                                reportData.status_failed_second === '1')
                        ) && !(reportData.oil_before && reportData.oil_after) && (
                                <div
                                    onClick={() => setShowPassedCombinedModal(true)}
                                    style={{
                                        marginBottom: '24px',
                                        padding: '16px 20px',
                                        background: reportData.resolution
                                            ? 'linear-gradient(145deg, #fef3c7 0%, #fffbeb 100%)'
                                            : 'linear-gradient(145deg, #fff1f1 0%, #fff5f5 100%)',
                                        border: `2px solid ${reportData.resolution ? COLORS.warning : COLORS.danger}`,
                                        borderRadius: '16px',
                                        position: 'relative',
                                        zIndex: 1,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '44px', height: '44px', borderRadius: '12px',
                                                background: reportData.resolution ? `${COLORS.warning}20` : `${COLORS.danger}20`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                            }}>
                                                <FeatherIcon
                                                    icon={reportData.resolution ? 'upload-cloud' : 'clipboard'}
                                                    size={22}
                                                    color={reportData.resolution ? COLORS.warning : COLORS.danger}
                                                />
                                            </div>
                                            <div>
                                                <h4 style={{
                                                    margin: 0, fontWeight: '700', fontSize: '15px',
                                                    color: reportData.resolution ? '#92400e' : '#7f1d1d'
                                                }}>
                                                    {reportData.resolution ? 'Upload Documentation' : 'Complete Report Required'}
                                                </h4>
                                                <p style={{
                                                    margin: '2px 0 0', fontSize: '12px',
                                                    color: reportData.resolution ? '#b45309' : '#991b1b'
                                                }}>
                                                    {reportData.resolution
                                                        ? 'Results & actions saved — please upload oil before & after photos'
                                                        : 'Please fill in results, actions, and upload documentation'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={e => { e.stopPropagation(); setShowPassedCombinedModal(true); }}
                                            style={{
                                                background: reportData.resolution
                                                    ? `linear-gradient(45deg, #EAB56F, #F9982F, #E37239)`
                                                    : `linear-gradient(45deg, #ef4444, #dc2626)`,
                                                border: 'none', borderRadius: '10px', padding: '10px 20px',
                                                color: 'white', fontWeight: '600', fontSize: '13px',
                                                display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                                            }}>
                                            <FeatherIcon icon={reportData.resolution ? 'upload' : 'edit-3'} size={14} />
                                            {reportData.resolution ? 'Upload Now' : 'Complete Report'}
                                        </button>
                                    </div>
                                </div>
                            )}



                        {/* ── 2. RESOLUTION ── */}
                        {reportData.resolution && reportData.resolution.trim() !== '' && (
                            <div style={{
                                marginBottom: '24px', padding: '20px',
                                background: 'linear-gradient(145deg, #f0fdf4 0%, #f0fff4 100%)',
                                border: `2px solid ${COLORS.success}40`,
                                borderRadius: '16px', position: 'relative'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <FeatherIcon icon="check-circle" size={20} color={COLORS.success} />
                                        <h4 style={{ margin: 0, fontWeight: '700', color: '#166534', fontSize: '15px' }}>Report</h4>
                                    </div>
                                    {permissions.canAddResolution && (!reportData.resolution || !reportData.actions) && (
                                        <button
                                            onClick={() => { setShowPassedCombinedModal(true); }}
                                            style={{
                                                background: 'none', border: `1px solid ${COLORS.success}40`,
                                                borderRadius: '8px', padding: '4px 10px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                fontSize: '12px', color: COLORS.success, fontWeight: '600'
                                            }}>
                                            <FeatherIcon icon="edit-2" size={12} /> Edit
                                        </button>
                                    )}
                                </div>

                                {/* Resolution */}
                                <div style={{ marginBottom: reportData.actions ? '16px' : '0' }}>
                                    <p style={{ fontSize: '12px', fontWeight: '600', color: COLORS.gray, textTransform: 'uppercase', marginBottom: '4px' }}>Results</p>
                                    <div style={{
                                        fontSize: 'clamp(14px, 3vw, 15px)', color: '#14532d', lineHeight: '1.7',
                                        fontWeight: '500', whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                                    }}>
                                        {reportData.resolution}
                                    </div>
                                </div>

                                {/* Actions */}
                                {reportData.actions && reportData.actions.trim() !== '' && (
                                    <div style={{ borderTop: `1px solid ${COLORS.success}20`, paddingTop: '16px' }}>
                                        <p style={{ fontSize: '12px', fontWeight: '600', color: COLORS.gray, textTransform: 'uppercase', marginBottom: '4px' }}>Actions</p>
                                        <div style={{
                                            fontSize: 'clamp(14px, 3vw, 15px)', color: '#14532d', lineHeight: '1.7',
                                            fontWeight: '500', whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                                        }}>
                                            {reportData.actions}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}



                        {/* ── 3. RECOMMENDATIONS (BOTTOM) ── */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
                            <FeatherIcon icon="message-square" size={20} color="#b85c00" />
                            <h4 style={{ margin: 0, fontWeight: '700', color: '#4a3728', fontFamily: "'Courier New', 'Segoe UI', monospace", letterSpacing: '-0.3px', borderBottom: '1px dashed #e2d4b5', paddingBottom: '4px' }}>
                                Recommendations
                            </h4>
                        </div>
                        <div style={{ fontSize: 'clamp(14px, 3vw, 16px)', color: '#3e2c1f', lineHeight: '1.7', fontWeight: '500', whiteSpace: 'pre-wrap', wordBreak: 'break-word', position: 'relative', zIndex: 1, fontFamily: "'Segoe UI', 'Roboto', 'Georgia', serif", padding: '4px 2px' }}>
                            {reportData.recommendations || 'No recommendations available for this asset analysis.'}
                        </div>
                        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: '0 0 24px 24px', borderColor: 'transparent transparent #efe0c6 transparent', pointerEvents: 'none', borderRadius: '0 0 4px 0' }} />
                    </div>

                    {/* ── Test Results (charts section) — only when trivector is known ── */}
                    {
                        hasCharts && (
                            <div style={{ background: '#fcf6ee', padding: 'clamp(16px, 4vw, 25px)', borderRadius: '20px' }}>

                                {/* Tab bar */}
                                <div style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', marginBottom: '0' }}>
                                    <div style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: '600', color: '#444444', marginBottom: '8px' }}>
                                        <FeatherIcon icon="trending-up" size={clampNumber(16, 20)} style={{ marginRight: '8px', color: COLORS.accent, verticalAlign: 'middle' }} />
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

                                {/* Date filter row — only for trends tab */}
                                {activeTab === 'trends' && <DateFilterRow />}

                                {/* ── Metrics tab: individual tiles ── */}
                                {activeTab === 'metrics' && (
                                    <div style={{ marginTop: '20px' }}>
                                        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}>
                                                <FeatherIcon icon="droplet" size={20} color="white" />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 'bold', color: '#d19547' }}>
                                                    {reportData.trivector} Parameters
                                                </h3>
                                                <p style={{ margin: '2px 0 0', fontSize: '12px', color: COLORS.gray }}>
                                                    {params.length} metrics •
                                                </p>
                                            </div>
                                        </div>
                                        <Row>
                                            {params.map((p, i) => (
                                                <Col xs={12} sm={6} lg={4} key={i} style={{ marginBottom: '16px' }}>
                                                    <MetricTile
                                                        label={p.label}
                                                        value={reportData[p.key]}
                                                        unit={p.unit}
                                                        paramKey={p.key}
                                                    />
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                )}

                                {/* ── Trends tab: multi-line overview chart ── */}
                                {activeTab === 'trends' && (
                                    <div style={{ marginTop: '20px' }}>
                                        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #6949a5 0%, #3F1D7D 100%)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FeatherIcon icon="activity" size={20} color="white" />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: 'clamp(16px, 4vw, 20px)', fontWeight: 'bold', color: '#3F1D7D' }}>
                                                    Historical Trends — {reportData.trivector}
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
                        )
                    }

                    {/* Fallback when trivector is unrecognised */}
                    {!hasCharts && reportData.trivector && (
                        <div style={{ background: '#fcf6ee', borderRadius: '20px', padding: '32px', textAlign: 'center', color: COLORS.gray }}>
                            <FeatherIcon icon="info" size={32} color={COLORS.accent} style={{ marginBottom: '12px' }} />
                            <p style={{ margin: 0, fontSize: '15px' }}>
                                No parameter set defined for trivector "<strong>{reportData.trivector}</strong>".
                            </p>
                        </div>
                    )
                    }

                </Container >
            </div >

            <EnlargedChartModal />
            <Modal
                show={showResolutionModal}
                onHide={() => setShowResolutionModal(false)}
                centered
                size="lg"
                backdrop="static"
                keyboard={false}
                contentClassName="border-0 bg-transparent"
                style={{ zIndex: 10050, }}
            >
                <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgb(201, 85, 85)' }}>
                    <Modal.Header closeButton style={{
                        background: 'linear-gradient(145deg, #dd9090 0%, #ee5050 100%)',
                        borderBottom: '0.5px solid rgba(220,53,69,0.3)',
                        padding: '16px 24px'
                    }}>
                        <Modal.Title style={{ color: '#a02020', fontWeight: '500', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FeatherIcon icon="alert-octagon" size={18} />
                            Resolution required

                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body style={{ padding: '24px', background: 'white' }}>
                        {/* Alert strip */}
                        <div style={{
                            background: 'rgba(220,53,69,0.06)', border: '0.5px solid rgba(220,53,69,0.25)',
                            borderRadius: '8px', padding: '12px 16px', display: 'flex',
                            alignItems: 'flex-start', gap: '10px', marginBottom: '24px'
                        }}>
                            <FeatherIcon icon="info" size={16} color="#a02020" style={{ flexShrink: 0, marginTop: '1px' }} />
                            <span style={{ fontSize: '13px', color: '#a02020', lineHeight: '1.5' }}>
                                This analysis has been marked as <strong>failed</strong>. Provide a resolution and corrective actions and results before proceeding — this will be recorded alongside the report.
                            </span>
                        </div>

                        {/* Two-column fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{
                                    fontSize: '13px', fontWeight: '600', color: '#e08702',
                                    textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block'
                                }}>
                                    Results
                                </label>
                                <Form.Control
                                    as="textarea"
                                    rows={5}
                                    value={resolution}
                                    onChange={(e) => setResolution(e.target.value)}
                                    placeholder="Describe what was found and what outcome occurred..."
                                    style={{
                                        borderRadius: '8px', border: '2px solid #E2E8F0',
                                        background: '#f9f9f9', fontSize: '13px', padding: '10px 12px',
                                        resize: 'vertical', lineHeight: '1.5'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{
                                    fontSize: '13px', fontWeight: '600', color: '#e08702',
                                    textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block'
                                }}>
                                    Actions
                                </label>
                                <Form.Control
                                    as="textarea"
                                    rows={5}
                                    value={actions}
                                    onChange={(e) => setActions(e.target.value)}
                                    placeholder="Describe the steps taken or planned to resolve this..."
                                    style={{
                                        borderRadius: '8px', border: '2px solid #E2E8F0',
                                        background: '#f9f9f9', fontSize: '13px', padding: '10px 12px',
                                        resize: 'vertical', lineHeight: '1.5'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#ff7b00'}
                                    onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                                />
                            </div>
                        </div>
                    </Modal.Body>

                    <Modal.Footer style={{
                        borderTop: '0.5px solid rgba(0,0,0,0.08)', padding: '14px 24px',
                        background: 'white', display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end'
                    }}>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => setShowResolutionModal(false)}
                                style={{
                                    background: 'linear-gradient(135deg, #ea6f6f, #f92f2f)',
                                    border: 'none', borderRadius: '12px', padding: '10px 28px',
                                    fontSize: '0.85rem', fontWeight: '600', color: '#fff',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    gap: '10px', boxShadow: '0 4px 15px rgba(233, 150, 40, 0.3)',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(233, 40, 40, 0.4)'; }}
                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(233, 40, 40, 0.3)'; }}
                            >
                                <FeatherIcon icon="x" size={14} /> Cancel
                            </button>
                            <button
                                onClick={handleSaveResolution}
                                disabled={isSavingResolution}
                                style={{
                                    background: 'linear-gradient(135deg, #EAB56F, #F9982F)',
                                    border: 'none', borderRadius: '12px', padding: '10px 28px',
                                    fontSize: '0.85rem', fontWeight: '600', color: '#fff',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center',
                                    gap: '10px', boxShadow: '0 4px 15px rgba(233, 150, 40, 0.3)',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(233, 150, 40, 0.4)'; }}
                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(233, 150, 40, 0.3)'; }}

                            >
                                {isSavingResolution
                                    ? <><Spinner animation="border" size="sm" /> Saving...</>
                                    : <><FeatherIcon icon="save" size={14} /> Save resolution</>}
                            </button>
                        </div>
                    </Modal.Footer>
                </div>
            </Modal>

            {/* ── View Documentation Report Modal ── */}
            <Modal
                show={showViewDocModal}
                onHide={() => setShowViewDocModal(false)}
                centered
                size="xl"
                contentClassName="border-0 bg-transparent"
            >
                <div style={{ borderRadius: '20px', overflow: 'hidden' }}>
                    <Modal.Header closeButton style={{
                        background: 'linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)',
                        borderBottom: `2px solid ${COLORS.success}`,
                        borderTopLeftRadius: '20px', borderTopRightRadius: '20px'
                    }}>
                        <Modal.Title style={{ color: '#065f46', fontWeight: 'bold' }}>
                            <FeatherIcon icon="file-text" size={20} style={{ marginRight: '10px' }} />
                            Documentation Report
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body style={{ padding: '28px 32px', background: 'white' }}>

                        {/* Auto-filled info + Recommendations/Resolution */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                            <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '16px', border: `1px solid ${COLORS.primary}30` }}>
                                <h6 style={{ marginBottom: '12px', color: COLORS.dark, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FeatherIcon icon="info" size={14} /> Auto-filled Information
                                </h6>
                                <div style={{ display: 'grid', gap: '10px', fontSize: '14px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${COLORS.primary}20` }}>
                                        <span style={{ fontWeight: '600', color: COLORS.gray }}>Oil Batch Code:</span>
                                        <span style={{ color: COLORS.dark }}>{reportData.oil_batch_code || '—'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${COLORS.primary}20` }}>
                                        <span style={{ fontWeight: '600', color: COLORS.gray }}>Drum Number:</span>
                                        <span style={{ color: COLORS.dark }}>{reportData.input_drum_number || '—'}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${COLORS.primary}20` }}>
                                        <span style={{ fontWeight: '600', color: COLORS.gray }}>Manufacturing Date:</span>
                                        <span style={{ color: COLORS.dark }}>
                                            {reportData.manufacturing_date
                                                ? new Date(reportData.manufacturing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                : '—'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                                        <span style={{ fontWeight: '600', color: COLORS.gray }}>Analysis Status:</span>
                                        <span style={{ color: COLORS.danger, fontWeight: '600' }}>{reportData.analysis_status || '—'}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ flex: 1, padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: `1px solid ${COLORS.success}30` }}>
                                    <h6 style={{ marginBottom: '8px', color: COLORS.success, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FeatherIcon icon="message-circle" size={14} /> Actions
                                    </h6>
                                    <p style={{ margin: 0, fontSize: '14px', color: COLORS.dark, lineHeight: 1.6 }}>
                                        {reportData.actions || 'No actions available.'}
                                    </p>
                                </div>
                                <div style={{ flex: 1, padding: '12px', background: '#fff1f1', borderRadius: '8px', border: `1px solid ${COLORS.danger}30` }}>
                                    <h6 style={{ marginBottom: '8px', color: COLORS.danger, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FeatherIcon icon="check-circle" size={14} /> Results
                                    </h6>
                                    <p style={{ margin: 0, fontSize: '14px', color: COLORS.dark, lineHeight: 1.6 }}>
                                        {reportData.resolution || 'No resolution provided.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Documentation Images */}
                        <div>
                            <h6 style={{ fontWeight: '600', fontSize: '14px', color: COLORS.dark, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FeatherIcon icon="image" size={14} /> Uploaded Documentation
                            </h6>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                {/* Oil Before */}
                                <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '14px', border: `1px solid ${COLORS.success}30` }}>
                                    <p style={{ fontWeight: '600', fontSize: '13px', color: COLORS.dark, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FeatherIcon icon="upload-cloud" size={14} color={COLORS.success} /> New Oil Before
                                    </p>
                                    {reportData.oil_before?.match(/\.(jpg|jpeg|png)$/i) ? (
                                        <>
                                            <img
                                                src={`${config.baseApi}/${reportData.oil_before}`}
                                                alt="Oil Before"
                                                style={{ width: '100%', borderRadius: '8px', maxHeight: '300px', objectFit: 'contain', border: `1px solid ${COLORS.success}20`, background: 'white' }}
                                            />
                                            <a href={`${config.baseApi}/${reportData.oil_before}`} target="_blank" rel="noreferrer"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '12px', color: COLORS.success }}>
                                                <FeatherIcon icon="external-link" size={12} /> Open full image
                                            </a>
                                        </>
                                    ) : (
                                        <a href={`${config.baseApi}/${reportData.oil_before}`} target="_blank" rel="noreferrer"
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: COLORS.success, fontWeight: '600', fontSize: '13px', textDecoration: 'none', padding: '12px', background: 'white', borderRadius: '8px', border: `1px solid ${COLORS.success}20` }}>
                                            <FeatherIcon icon="file" size={20} /> Open PDF Document
                                        </a>
                                    )}
                                </div>

                                {/* Oil After */}
                                <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '14px', border: `1px solid ${COLORS.success}30` }}>
                                    <p style={{ fontWeight: '600', fontSize: '13px', color: COLORS.dark, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FeatherIcon icon="upload-cloud" size={14} color={COLORS.success} /> New Oil After
                                    </p>
                                    {reportData.oil_after?.match(/\.(jpg|jpeg|png)$/i) ? (
                                        <>
                                            <img
                                                src={`${config.baseApi}/${reportData.oil_after}`}
                                                alt="Oil After"
                                                style={{ width: '100%', borderRadius: '8px', maxHeight: '300px', objectFit: 'contain', border: `1px solid ${COLORS.success}20`, background: 'white' }}
                                            />
                                            <a href={`${config.baseApi}/${reportData.oil_after}`} target="_blank" rel="noreferrer"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '8px', fontSize: '12px', color: COLORS.success }}>
                                                <FeatherIcon icon="external-link" size={12} /> Open full image
                                            </a>
                                        </>
                                    ) : (
                                        <a href={`${config.baseApi}/${reportData.oil_after}`} target="_blank" rel="noreferrer"
                                            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: COLORS.success, fontWeight: '600', fontSize: '13px', textDecoration: 'none', padding: '12px', background: 'white', borderRadius: '8px', border: `1px solid ${COLORS.success}20` }}>
                                            <FeatherIcon icon="file" size={20} /> Open PDF Document
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Modal.Body>

                    <Modal.Footer style={{ borderTop: `1px solid ${COLORS.success}20`, padding: '16px 32px', background: 'white', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px' }}>
                        <button onClick={() => setShowViewDocModal(false)}
                            style={{ background: 'linear-gradient(45deg, #6b7280, #9ca3af)', border: 'none', borderRadius: '12px', padding: '12px 32px', color: 'white', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' }}>
                            Close
                        </button>
                    </Modal.Footer>
                </div>
            </Modal>

            <style>{`
                div:hover > .tooltip-text { display: block !important; }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50%       { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes dropdownFadeIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div >
    );
}



