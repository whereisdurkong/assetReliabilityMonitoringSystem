{/* Bar chart */ }
<Row className="mb-4">
    <Col>
        <div style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "12px",
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
                        color: "#EAB56F",
                        margin: 0
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
                        stroke="rgba(255,255,255,0.1)"
                    />

                    <XAxis
                        dataKey="component"
                        stroke="#fff"
                        angle={-20}
                        textAnchor="end"
                        interval={0}
                        height={80}
                    />

                    <YAxis stroke="#fff" />

                    <Tooltip
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
                    />

                    <Bar
                        dataKey="abnormal"
                        stackId="a"
                        fill="#ec8a2f"
                        name="Verify/Abnormal"
                    />

                    <Bar
                        dataKey="severe"
                        stackId="a"
                        fill="#dd3445"
                        name="Severe"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </Col>
</Row>
