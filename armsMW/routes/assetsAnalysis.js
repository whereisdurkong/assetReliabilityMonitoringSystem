var express = require('express');
var bcrypt = require('bcrypt');
const router = express.Router();
var Sequelize = require('sequelize');
const { DataTypes } = Sequelize;
require('dotenv').config();

var knex = require("knex")({
    client: 'mssql',
    connection: {
        user: process.env.USER,
        password: process.env.PASSWORD,
        server: process.env.SERVER,
        database: process.env.DATABASE,
        port: parseInt(process.env.APP_SERVER_PORT),
        options: {
            enableArithAbort: true,

        }
    },
});

var db = new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASSWORD, {
    host: process.env.SERVER,
    dialect: "mssql",
    port: parseInt(process.env.APP_SERVER_PORT),
});

const AssetsAnalysis = db.define('asset_analysis_master', {
    asset_analysis_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    asset_id: {
        type: DataTypes.STRING
    },
    asset_running_hours: {
        type: DataTypes.STRING
    },
    oil_running_hours: {
        type: DataTypes.STRING
    },
    recommendations: {
        type: DataTypes.STRING
    },
    analysis_date: {
        type: DataTypes.STRING
    },
    created_by: {
        type: DataTypes.STRING
    },
    created_at: {
        type: DataTypes.STRING
    },
    updated_by: {
        type: DataTypes.STRING
    },
    updated_at: {
        type: DataTypes.STRING
    },
    is_active: {
        type: DataTypes.STRING
    },
    level1: {
        type: DataTypes.STRING
    },
    level2: {
        type: DataTypes.STRING
    },
    level3: {
        type: DataTypes.STRING
    },
    additional_notes: {
        type: DataTypes.STRING
    },
    asset_name: {
        type: DataTypes.STRING
    },
    asset_component_id: {
        type: DataTypes.STRING
    },
    iron: {
        type: DataTypes.STRING
    },
    chrome: {
        type: DataTypes.STRING
    },
    nickel: {
        type: DataTypes.STRING
    },
    aluminium: {
        type: DataTypes.STRING
    },
    lead: {
        type: DataTypes.STRING
    },
    copper: {
        type: DataTypes.STRING
    },
    tin: {
        type: DataTypes.STRING
    },
    titanium: {
        type: DataTypes.STRING
    },
    silver: {
        type: DataTypes.STRING
    },
    antimony: {
        type: DataTypes.STRING
    },
    cadmium: {
        type: DataTypes.STRING
    },
    manganese: {
        type: DataTypes.STRING
    },
    fatigue_gt_20um: {
        type: DataTypes.STRING
    },
    non_metallic_gt_20um: {
        type: DataTypes.STRING
    },
    large_fe: {
        type: DataTypes.STRING
    },
    fe_wear_severity_index: {
        type: DataTypes.STRING
    },
    total_fe_lt_100um: {
        type: DataTypes.STRING
    },
    cutting_gt_20um: {
        type: DataTypes.STRING
    },
    sliding_gt_20um: {
        type: DataTypes.STRING
    },
    large_fe_percent: {
        type: DataTypes.STRING
    },
    iso_4406_code_gt4um: {
        type: DataTypes.STRING
    },
    iso_4406_code_gt6um: {
        type: DataTypes.STRING
    },
    iso_4406_code_gt14um: {
        type: DataTypes.STRING
    },
    cnts_gt4: {
        type: DataTypes.STRING
    },
    cnts_gt6: {
        type: DataTypes.STRING
    },
    cnts_gt14: {
        type: DataTypes.STRING
    },
    particles_5_15um: {
        type: DataTypes.STRING
    },
    particles_15_25um: {
        type: DataTypes.STRING
    },
    particles_25_50um: {
        type: DataTypes.STRING
    },
    particles_50_100um: {
        type: DataTypes.STRING
    },
    particles_gt100um: {
        type: DataTypes.STRING
    },
    molybdenum: {
        type: DataTypes.STRING
    },
    calcium: {
        type: DataTypes.STRING
    },
    magnesium: {
        type: DataTypes.STRING
    },
    phosphorus: {
        type: DataTypes.STRING
    },
    zinc: {
        type: DataTypes.STRING
    },
    barium: {
        type: DataTypes.STRING
    },
    boron: {
        type: DataTypes.STRING
    },
    sodium: {
        type: DataTypes.STRING
    },
    vanadium: {
        type: DataTypes.STRING
    },
    potassium: {
        type: DataTypes.STRING
    },
    lithium: {
        type: DataTypes.STRING
    },
    silicon: {
        type: DataTypes.STRING
    },
    total_water: {
        type: DataTypes.STRING
    },
    bubbles: {
        type: DataTypes.STRING
    },
    water: {
        type: DataTypes.STRING
    },
    glycol_percent: {
        type: DataTypes.STRING
    },
    soot_percent: {
        type: DataTypes.STRING
    },
    biodiesel_fuel_dilution: {
        type: DataTypes.STRING
    },
    tan: {
        type: DataTypes.STRING
    },
    tbn: {
        type: DataTypes.STRING
    },
    oxidation: {
        type: DataTypes.STRING
    },
    nitration: {
        type: DataTypes.STRING
    },
    sulfation: {
        type: DataTypes.STRING
    },
    viscosity_at_40c: {
        type: DataTypes.STRING
    },
    viscosity_at_100c: {
        type: DataTypes.STRING
    },
    fluid_integrity: {
        type: DataTypes.STRING
    },
    antiwear_percent: {
        type: DataTypes.STRING
    },
}, {
    freezeTableName: false,
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    tableName: 'asset_analysis_master'
});


// Update your POST endpoint
router.post('/add-assets-analysis', async (req, res) => {
    const currentTimestamp = new Date();
    const {
        asset_id,
        component_id,  // Add this - it's in your frontend but missing in backend
        asset_running_hours,
        oil_running_hours,
        oil_analysis_results,
        recommendations,
        analysis_date,
        created_by,
        additional_notes,  // Add this
        l1,
        l2,
        l3
    } = req.body;

    try {
        // Parse the JSON string from frontend
        let parsedResults = {};
        if (oil_analysis_results) {
            try {
                parsedResults = typeof oil_analysis_results === 'string'
                    ? JSON.parse(oil_analysis_results)
                    : oil_analysis_results;
            } catch (e) {
                console.error('Error parsing oil_analysis_results:', e);
            }
        }

        // Prepare the insert data with all the new columns
        const insertData = {
            asset_id,
            asset_component_id: component_id,  // Add component_id
            asset_running_hours,
            oil_running_hours,
            recommendations,
            analysis_date,
            created_by,
            additional_notes,  // Add additional notes
            level1: l1,
            level2: l2,
            level3: l3,
            is_active: '1',
            created_at: currentTimestamp,

            // Map all the parsed values to their respective columns
            // Wear Metals
            iron: parsedResults.iron,
            chrome: parsedResults.chrome,
            nickel: parsedResults.nickel,
            aluminium: parsedResults.aluminum || parsedResults.aluminium,
            lead: parsedResults.lead,
            copper: parsedResults.copper,
            tin: parsedResults.tin,
            titanium: parsedResults.titanium,
            silver: parsedResults.silver,
            antimony: parsedResults.antimony,
            cadmium: parsedResults.cadmium,
            manganese: parsedResults.manganese,

            // Particle & Wear Indicators
            fatigue_gt_20um: parsedResults.fatigue20,
            non_metallic_gt_20um: parsedResults.nonMetallic20,
            large_fe: parsedResults.largeFe,
            fe_wear_severity_index: parsedResults.feWearSeverity,
            total_fe_lt_100um: parsedResults.totalFe100,
            cutting_gt_20um: parsedResults.cutting20,
            sliding_gt_20um: parsedResults.sliding20,
            large_fe_percent: parsedResults.largeFePercent,

            // ISO Codes
            iso_4406_code_gt4um: parsedResults.iso4406_4,
            iso_4406_code_gt6um: parsedResults.iso4406_6,
            iso_4406_code_gt14um: parsedResults.iso4406_14,
            cnts_gt4: parsedResults.cnts4,
            cnts_gt6: parsedResults.cnts6,
            cnts_gt14: parsedResults.cnts14,

            // Particle Counts
            particles_5_15um: parsedResults.particles5_15,
            particles_15_25um: parsedResults.particles15_25,
            particles_25_50um: parsedResults.particles25_50,
            particles_50_100um: parsedResults.particles50_100,
            particles_gt100um: parsedResults.particles100,

            // Additives
            molybdenum: parsedResults.molybdenum,
            calcium: parsedResults.calcium,
            magnesium: parsedResults.magnesium,
            phosphorus: parsedResults.phosphorus,
            zinc: parsedResults.zinc,
            barium: parsedResults.barium,
            boron: parsedResults.boron,

            // Contaminants
            sodium: parsedResults.sodium,
            vanadium: parsedResults.vanadium,
            potassium: parsedResults.potassium,
            lithium: parsedResults.lithium,
            silicon: parsedResults.silicon,

            // Fluid Properties
            total_water: parsedResults.totalWater,
            bubbles: parsedResults.bubbles,
            water: parsedResults.waterContent || parsedResults.water,
            glycol_percent: parsedResults.glycol,
            soot_percent: parsedResults.sootPercent,
            biodiesel_fuel_dilution: parsedResults.biodieselFuelDilution,

            // Chemical Properties
            tan: parsedResults.tan,
            tbn: parsedResults.tbn,
            oxidation: parsedResults.oxidation,
            nitration: parsedResults.nitration,
            sulfation: parsedResults.sulfation,

            // Viscosity
            viscosity_at_40c: parsedResults.viscosity40,
            viscosity_at_100c: parsedResults.viscosity100,

            // Integrity
            fluid_integrity: parsedResults.fluidIntegrity,
            antiwear_percent: parsedResults.antiwear
        };

        // Remove undefined values to avoid SQL errors
        Object.keys(insertData).forEach(key => {
            if (insertData[key] === undefined) {
                delete insertData[key];
            }
        });

        console.log('Inserting data with parsed values:', insertData);

        const [add] = await knex('asset_analysis_master').insert(insertData).returning('asset_analysis_id');

        const asset_analysis_id = add.asset_analysis_id || add;

        // Create change log
        await knex('asset_analysis_logs').insert({
            asset_analysis_id: asset_analysis_id,
            changes_made: `${created_by} has added an asset analysis.`,
            created_at: currentTimestamp,
            created_by: created_by
        });

        res.status(200).json({
            message: 'successfully submitted',
            asset_analysis_id: asset_analysis_id
        });

        console.log('Successfully added asset analysis with ID:', asset_analysis_id);

    } catch (err) {
        console.error('INTERNAL ERROR UNABLE TO PUT ASSETS ANALYSIS: ', err);
        res.status(500).json({
            error: 'Internal server error',
            message: err.message
        });
    }
});

router.get('/get-all-submitted-assets', async (req, res) => {
    try {
        const fetch = await knex('asset_analysis_master').select('*');
        res.json(fetch);
        console.log('triggered /get-all-assets')
    } catch (err) {
        console.log('INTERNAL ERROR, UNABLE TO FETCH ALL ASSETS', err)
    }
})

router.get('/get-submitted-assets-by-id', async (req, res, next) => {
    try {
        const getbyID = await AssetsAnalysis.findAll({
            where: {
                asset_analysis_id: req.query.id
            }
        })
        console.log('triggered /get-asset-by-id');
        res.json(getbyID[0])
    } catch (err) {
        console.log('INTERNAL ERROR: ', err)
    }
})

router.post('/update-assets', async (req, res) => {
    const currentTimestamp = new Date()
    const {
        asset_id,
        asset_name,
        asset_type,
        asset_location,
        asset_category,
        date_commisioning,
        asset_notes,
        is_active,
        updated_by,
        changes_made
    } = req.body

    await knex('assets_master').where('asset_id', asset_id).update({
        asset_name,
        asset_type,
        asset_location,
        asset_category,
        date_commisioning,
        asset_notes,
        is_active,
        updated_by,
        updated_at: currentTimestamp
    })

    await knex('assets_logs').insert({
        asset_id,
        changes_made,
        created_by: updated_by,
        created_at: currentTimestamp

    })
    res.status(200).json({ message: 'Asset updated successfully' });

})

module.exports = router;