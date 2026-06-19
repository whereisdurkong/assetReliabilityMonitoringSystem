var express = require('express');
const multer = require('multer');
var bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const router = express.Router();
var Sequelize = require('sequelize');
const { DataTypes } = Sequelize;
require('dotenv').config();
const fs = require('fs');
const path = require('path');

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

//Storage configuration for multer - to handle file uploads for documentation
const DIR = './documentation';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Use absolute path
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        // Create unique filename with timestamp to avoid conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
    fileFilter: (req, file, cb) => {
        // Accept images and videos
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images and videos are allowed'), false);
        }
    }
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
    criticality_analysis_status: {
        type: DataTypes.STRING
    },
    appropriate_action: {
        type: DataTypes.STRING
    },
    action_notes: {
        type: DataTypes.STRING
    },
    resampling_schedule: {
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
    no_asset_trivector: {
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
    documentation: {
        type: DataTypes.STRING
    },
    action_taken: {
        type: DataTypes.STRING
    },
    results: {
        type: DataTypes.STRING
    },
    actions: {
        type: DataTypes.STRING
    },
    asset_before: {
        type: DataTypes.STRING
    },
    asset_after: {
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

// const NoAssetsAnalysis = db.define('no_asset_analysis_master', {
//     analysis_id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true
//     },
//     oil_batch_code: {
//         type: DataTypes.STRING
//     },
//     manufacturing_date: {
//         type: DataTypes.STRING
//     },
//     input_drum_number: {
//         type: DataTypes.STRING
//     },
//     analysis_status: {
//         type: DataTypes.STRING
//     },
//     status_failed_first: {
//         type: DataTypes.STRING
//     },
//     status_failed_second: {
//         type: DataTypes.STRING
//     },
//     recommendations: {
//         type: DataTypes.STRING
//     },
//     resampling_schedule: {
//         type: DataTypes.STRING
//     },
//     analysis_date: {
//         type: DataTypes.STRING
//     },
//     created_by: {
//         type: DataTypes.STRING
//     },
//     created_at: {
//         type: DataTypes.STRING
//     },
//     updated_by: {
//         type: DataTypes.STRING
//     },
//     updated_at: {
//         type: DataTypes.STRING
//     },
//     trivector: {
//         type: DataTypes.STRING
//     },
//     is_active: {
//         type: DataTypes.STRING
//     },
//     documentation: {
//         type: DataTypes.STRING
//     },
//     resolution: {
//         type: DataTypes.STRING
//     },
//     iron: {
//         type: DataTypes.STRING
//     },
//     chrome: {
//         type: DataTypes.STRING
//     },
//     nickel: {
//         type: DataTypes.STRING
//     },
//     aluminium: {
//         type: DataTypes.STRING
//     },
//     lead: {
//         type: DataTypes.STRING
//     },
//     copper: {
//         type: DataTypes.STRING
//     },
//     tin: {
//         type: DataTypes.STRING
//     },
//     titanium: {
//         type: DataTypes.STRING
//     },
//     silver: {
//         type: DataTypes.STRING
//     },
//     antimony: {
//         type: DataTypes.STRING
//     },
//     cadmium: {
//         type: DataTypes.STRING
//     },
//     manganese: {
//         type: DataTypes.STRING
//     },
//     fatigue_gt_20um: {
//         type: DataTypes.STRING
//     },
//     non_metallic_gt_20um: {
//         type: DataTypes.STRING
//     },
//     large_fe: {
//         type: DataTypes.STRING
//     },
//     fe_wear_severity_index: {
//         type: DataTypes.STRING
//     },
//     total_fe_lt_100um: {
//         type: DataTypes.STRING
//     },
//     cutting_gt_20um: {
//         type: DataTypes.STRING
//     },
//     sliding_gt_20um: {
//         type: DataTypes.STRING
//     },
//     large_fe_percent: {
//         type: DataTypes.STRING
//     },
//     iso_4406_code_gt4um: {
//         type: DataTypes.STRING
//     },
//     iso_4406_code_gt6um: {
//         type: DataTypes.STRING
//     },
//     iso_4406_code_gt14um: {
//         type: DataTypes.STRING
//     },
//     cnts_gt4: {
//         type: DataTypes.STRING
//     },
//     cnts_gt6: {
//         type: DataTypes.STRING
//     },
//     cnts_gt14: {
//         type: DataTypes.STRING
//     },
//     particles_5_15um: {
//         type: DataTypes.STRING
//     },
//     particles_15_25um: {
//         type: DataTypes.STRING
//     },
//     particles_25_50um: {
//         type: DataTypes.STRING
//     },
//     particles_50_100um: {
//         type: DataTypes.STRING
//     },
//     particles_gt100um: {
//         type: DataTypes.STRING
//     },
//     molybdenum: {
//         type: DataTypes.STRING
//     },
//     calcium: {
//         type: DataTypes.STRING
//     },
//     magnesium: {
//         type: DataTypes.STRING
//     },
//     phosphorus: {
//         type: DataTypes.STRING
//     },
//     zinc: {
//         type: DataTypes.STRING
//     },
//     barium: {
//         type: DataTypes.STRING
//     },
//     boron: {
//         type: DataTypes.STRING
//     },
//     sodium: {
//         type: DataTypes.STRING
//     },
//     vanadium: {
//         type: DataTypes.STRING
//     },
//     potassium: {
//         type: DataTypes.STRING
//     },
//     lithium: {
//         type: DataTypes.STRING
//     },
//     silicon: {
//         type: DataTypes.STRING
//     },
//     total_water: {
//         type: DataTypes.STRING
//     },
//     bubbles: {
//         type: DataTypes.STRING
//     },
//     water: {
//         type: DataTypes.STRING
//     },
//     glycol_percent: {
//         type: DataTypes.STRING
//     },
//     soot_percent: {
//         type: DataTypes.STRING
//     },
//     biodiesel_fuel_dilution: {
//         type: DataTypes.STRING
//     },
//     tan: {
//         type: DataTypes.STRING
//     },
//     tbn: {
//         type: DataTypes.STRING
//     },
//     oxidation: {
//         type: DataTypes.STRING
//     },
//     nitration: {
//         type: DataTypes.STRING
//     },
//     sulfation: {
//         type: DataTypes.STRING
//     },
//     viscosity_at_40c: {
//         type: DataTypes.STRING
//     },
//     viscosity_at_100c: {
//         type: DataTypes.STRING
//     },
//     fluid_integrity: {
//         type: DataTypes.STRING
//     },
//     antiwear_percent: {
//         type: DataTypes.STRING
//     },
// }, {
//     freezeTableName: false,
//     timestamps: false,
//     createdAt: false,
//     updatedAt: false,
//     tableName: 'no_asset_analysis_master'
// });

const NoAssetsAnalysis = db.define('no_asset_analysis_master', {
    analysis_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    oil_batch_code: {
        type: DataTypes.STRING
    },
    manufacturing_date: {
        type: DataTypes.STRING
    },
    input_drum_number: {
        type: DataTypes.STRING
    },
    analysis_status: {
        type: DataTypes.STRING
    },
    status_failed_first: {
        type: DataTypes.STRING
    },
    status_failed_second: {
        type: DataTypes.STRING
    },
    trivector: {
        type: DataTypes.STRING
    },
    recommendations: {
        type: DataTypes.STRING
    },
    resampling_schedule: {
        type: DataTypes.STRING
    },
    analysis_date: {
        type: DataTypes.STRING
    },
    documentation: {
        type: DataTypes.STRING
    },
    resolution: {
        type: DataTypes.STRING
    },
    actions: {
        type: DataTypes.STRING
    },
    oil_after: {
        type: DataTypes.STRING
    },
    oil_before: {
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

    // ISO Cleanliness Codes — Gear / Hydraulic / Transmission
    iso_4406_code_gt4um: {
        type: DataTypes.STRING
    },
    iso_4406_code_gt6um: {
        type: DataTypes.STRING
    },
    iso_4406_code_gt14um: {
        type: DataTypes.STRING
    },

    // Additives
    molybdenum: {
        type: DataTypes.DECIMAL(18, 4)  // Engine
    },
    calcium: {
        type: DataTypes.DECIMAL(18, 4)  // Engine, Compressors
    },
    magnesium: {
        type: DataTypes.DECIMAL(18, 4)  // Engine, Gear/Hyd/Trans
    },
    phosphorus: {
        type: DataTypes.DECIMAL(18, 4)  // All
    },
    zinc: {
        type: DataTypes.DECIMAL(18, 4)  // All
    },
    boron: {
        type: DataTypes.DECIMAL(18, 4)  // Engine, Compressors
    },

    // Fluid / Contaminants
    water: {
        type: DataTypes.DECIMAL(18, 4)  // All
    },

    // Chemical Properties
    tan: {
        type: DataTypes.DECIMAL(18, 4)  // Gear/Hyd/Trans, Compressors
    },
    tbn: {
        type: DataTypes.DECIMAL(18, 4)  // Engine
    },
    oxidation: {
        type: DataTypes.DECIMAL(18, 4)  // All
    },
    nitration: {
        type: DataTypes.DECIMAL(18, 4)  // Engine
    },
    sulfation: {
        type: DataTypes.DECIMAL(18, 4)  // Engine
    },

    // Viscosity
    viscosity_at_40c: {
        type: DataTypes.DECIMAL(18, 2)  // All
    },
    viscosity_at_100c: {
        type: DataTypes.DECIMAL(18, 2)  // Engine
    },

}, {
    freezeTableName: false,
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    tableName: 'no_asset_analysis_master'
});

const SetupOption = db.define('option_master', {
    option_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    option_asset_location: {
        type: DataTypes.STRING
    },
    option_asset_type: {
        type: DataTypes.STRING
    },
    option_asset_location: {
        type: DataTypes.STRING
    },
    option_asset_category: {
        type: DataTypes.STRING
    },
    option_component_types: {
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
    }
}, {
    freezeTableName: false,
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    tableName: 'option_master'
});

//ADD NO ASSET ANALYSIS
// router.post('/add-no-assets-analysis', async (req, res) => {
//     const currentTimestamp = new Date();
//     const {
//         oil_batch_code,
//         manufacturing_date,
//         input_drum_number,
//         oil_type,
//         oil_analysis_results,
//         trivector,
//         recommendations,
//         analysis_date,
//         created_by,
//         analysis_status,
//     } = req.body;

//     try {

//         //Get count for id
//         const analysislength = await knex('no_asset_analysis_master').count('* as count').first();
//         const analysis_id = (analysislength.count || 0) + 1;


//         // Parse the JSON string from frontend
//         let parsedResults = {};
//         if (oil_analysis_results) {
//             try {
//                 parsedResults = typeof oil_analysis_results === 'string'
//                     ? JSON.parse(oil_analysis_results)
//                     : oil_analysis_results;
//             } catch (e) {
//                 console.error('Error parsing oil_analysis_results:', e);
//             }
//         }

//         // Prepare the insert data with all the new columns
//         const insertData = {
//             oil_batch_code,
//             manufacturing_date,
//             input_drum_number,
//             oil_type,
//             analysis_id: analysis_id,
//             recommendations,
//             analysis_date,
//             trivector,
//             created_by,
//             analysis_status,  // Add additional notes

//             level1: '1',
//             // level2: l2,
//             // level3: l3,
//             is_active: '1',
//             created_at: currentTimestamp,

//             // Map all the parsed values to their respective columns
//             // Wear Metals
//             iron: parsedResults.iron,
//             chrome: parsedResults.chrome,
//             nickel: parsedResults.nickel,
//             aluminium: parsedResults.aluminum || parsedResults.aluminium,
//             lead: parsedResults.lead,
//             copper: parsedResults.copper,
//             tin: parsedResults.tin,
//             titanium: parsedResults.titanium,
//             silver: parsedResults.silver,
//             antimony: parsedResults.antimony,
//             cadmium: parsedResults.cadmium,
//             manganese: parsedResults.manganese,

//             // Particle & Wear Indicators
//             fatigue_gt_20um: parsedResults.fatigue20,
//             non_metallic_gt_20um: parsedResults.nonMetallic20,
//             large_fe: parsedResults.largeFe,
//             fe_wear_severity_index: parsedResults.feWearSeverity,
//             total_fe_lt_100um: parsedResults.totalFe100,
//             cutting_gt_20um: parsedResults.cutting20,
//             sliding_gt_20um: parsedResults.sliding20,
//             large_fe_percent: parsedResults.largeFePercent,

//             // ISO Codes
//             iso_4406_code_gt4um: parsedResults.iso4406_4,
//             iso_4406_code_gt6um: parsedResults.iso4406_6,
//             iso_4406_code_gt14um: parsedResults.iso4406_14,
//             cnts_gt4: parsedResults.cnts4,
//             cnts_gt6: parsedResults.cnts6,
//             cnts_gt14: parsedResults.cnts14,

//             // Particle Counts
//             particles_5_15um: parsedResults.particles5_15,
//             particles_15_25um: parsedResults.particles15_25,
//             particles_25_50um: parsedResults.particles25_50,
//             particles_50_100um: parsedResults.particles50_100,
//             particles_gt100um: parsedResults.particles100,

//             // Additives
//             molybdenum: parsedResults.molybdenum,
//             calcium: parsedResults.calcium,
//             magnesium: parsedResults.magnesium,
//             phosphorus: parsedResults.phosphorus,
//             zinc: parsedResults.zinc,
//             barium: parsedResults.barium,
//             boron: parsedResults.boron,

//             // Contaminants
//             sodium: parsedResults.sodium,
//             vanadium: parsedResults.vanadium,
//             potassium: parsedResults.potassium,
//             lithium: parsedResults.lithium,
//             silicon: parsedResults.silicon,

//             // Fluid Properties
//             total_water: parsedResults.totalWater,
//             bubbles: parsedResults.bubbles,
//             water: parsedResults.waterContent || parsedResults.water,
//             glycol_percent: parsedResults.glycol,
//             soot_percent: parsedResults.sootPercent,
//             biodiesel_fuel_dilution: parsedResults.biodieselFuelDilution,

//             // Chemical Properties
//             tan: parsedResults.tan,
//             tbn: parsedResults.tbn,
//             oxidation: parsedResults.oxidation,
//             nitration: parsedResults.nitration,
//             sulfation: parsedResults.sulfation,

//             // Viscosity
//             viscosity_at_40c: parsedResults.viscosity40,
//             viscosity_at_100c: parsedResults.viscosity100,

//             // Integrity
//             fluid_integrity: parsedResults.fluidIntegrity,
//             antiwear_percent: parsedResults.antiwear
//         };

//         // Remove undefined values to avoid SQL errors
//         Object.keys(insertData).forEach(key => {
//             if (insertData[key] === undefined) {
//                 delete insertData[key];
//             }
//         });

//         console.log('Inserting data with parsed values:', insertData);

//         await knex('no_asset_analysis_master').insert(insertData);


//         // Create change log
//         await knex('no_asset_analysis_logs').insert({
//             asset_analysis_id: analysis_id,
//             changes_made: `${created_by} has added an asset analysis.`,
//             created_at: currentTimestamp,
//             created_by: created_by
//         });

//         res.status(200).json({
//             message: 'successfully submitted',
//             asset_analysis_id: analysis_id
//         });

//         console.log('Successfully added asset analysis with ID:', analysis_id);
//         console.log('@@@ TRIGGERED /add-assets-analysis');

//     } catch (err) {
//         console.error('INTERNAL ERROR UNABLE TO PUT ASSETS ANALYSIS: ', err);
//         res.status(500).json({
//             error: 'Internal server error',
//             message: err.message
//         });
//     }
// });

router.post('/add-no-assets-analysis', async (req, res) => {
    const currentTimestamp = new Date();
    const {
        oil_batch_code, manufacturing_date, input_drum_number,
        oil_analysis_results, trivector, recommendations,
        analysis_date, created_by, analysis_status,
        status_failed_first,
    } = req.body;

    try {
        const analysislength = await knex('no_asset_analysis_master').count('* as count').first();
        const analysis_id = (analysislength.count || 0) + 1;

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

        const insertData = {
            analysis_id,
            oil_batch_code,
            manufacturing_date,
            input_drum_number,
            trivector,
            recommendations,
            analysis_date,
            status_failed_first: status_failed_first || null,
            created_by,
            analysis_status,
            level1: '1',
            level2: '1',
            is_active: '1',
            created_at: currentTimestamp,

            // Viscosity — all types use 40c; only Engine uses 100c
            viscosity_at_40c: parsedResults.viscosity40 || null,
            viscosity_at_100c: parsedResults.viscosity100 || null,

            // Chemical properties
            tbn: parsedResults.tbn || null,  // Engine
            tan: parsedResults.tan || null,  // Gear/Hyd/Trans, Compressors
            oxidation: parsedResults.oxidation || null,  // All
            sulfation: parsedResults.sulfation || null,  // Engine
            nitration: parsedResults.nitration || null,  // Engine

            // Additives
            calcium: parsedResults.calcium || null,  // Engine, Compressors
            magnesium: parsedResults.magnesium || null,  // Engine, Gear/Hyd/Trans
            boron: parsedResults.boron || null,  // Engine, Compressors
            molybdenum: parsedResults.molybdenum || null,  // Engine
            zinc: parsedResults.zinc || null,  // All
            phosphorus: parsedResults.phosphorus || null,  // All

            // Fluid / contaminants
            water: parsedResults.water || null,  // All

            // ISO Cleanliness Codes — Gear / Hydraulic / Transmission only
            iso_4406_code_gt4um: parsedResults.iso4406_4 || null,
            iso_4406_code_gt6um: parsedResults.iso4406_6 || null,
            iso_4406_code_gt14um: parsedResults.iso4406_14 || null,
        };

        // Strip nulls so SQL Server doesn't complain about missing columns
        Object.keys(insertData).forEach(key => {
            if (insertData[key] === undefined) delete insertData[key];
        });

        await knex('no_asset_analysis_master').insert(insertData);

        await knex('no_asset_analysis_logs').insert({
            asset_analysis_id: analysis_id,
            changes_made: `${created_by} has added an asset analysis.`,
            created_at: currentTimestamp,
            created_by,
        });

        //----------------------------------EMAIL FUNCTION----------------------------------------------
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                secure: false,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const level2_users = await knex('users_master').select('*').where('emp_position', 'l2');
            const level2_email = level2_users.map(email => email.emp_email);

            const analysis = await knex('no_asset_analysis_master').where('analysis_id', analysis_id).first();

            // Start
            var start =
                'Good Day,<br><br>' +
                'This is to inform you that a <b>New Oil Analysis Report</b> has been successfully created and submitted for review. ' +
                'The report provides the latest oil analysis and findings for the monitored asset. ' +
                'Please find the report details below:<br><br>';

            // Body
            var body =
                `<b>Report ID:</b> ${analysis_id}<br>
                <b>Oil Batch Code:</b> ${analysis.oil_batch_code}<br>
                <b>Drum Number:</b> ${analysis.input_drum_number}<br>
                <b>Created By:</b> ${created_by}<br>
                <b>Manufacturing Date:</b> ${manufacturing_date}<br>
                <b>Analysis Date:</b> ${analysis_date}<br>
                <b>Recommendations:</b><br>
                ${recommendations}<br><br>`;

            var link =
                `To view the complete report, please click the following link:
                <a href="${process.env.REACT_CLIENT}/view-submitted-asset-no-asset?id=${analysis_id}">
                View New Oil Analysis Report
                 </a><br><br>`;

            // Footer
            var footer =
                'The information contained in this report is intended to support asset reliability and maintenance planning. ' +
                'We encourage you to review the findings and recommendations and take the necessary actions as appropriate.<br><br>' +
                'If you have any questions or require further clarification regarding this report, please contact the Asset Monitoring Team.<br><br>' +
                'Thank you for your attention and cooperation.<br><br>' +
                'Best regards,<br><br>' +
                '<b>Asset Reliability Monitoring System</b>';

            var norep =
                '<br><hr style="border:0; border-top:1px solid #d3d3d3;"><br>' +
                '<div style="color:#808080; font-size:12px; font-family:Arial, sans-serif; line-height:1.5;">' +
                '<b>This is an automated email from the Asset Reliability Monitoring System.</b><br>' +
                'Please do not reply to this email, as this mailbox is not monitored and responses will not be received.<br><br>' +
                'If you have any questions or require assistance regarding this report, please contact the Asset Reliability Monitoring Team through the appropriate support channels.<br><br>' +
                '&copy; ' + new Date().getFullYear() + ' Asset Reliability Monitoring System. All rights reserved.' +
                '</div>';

            var emailContent = start + body + link + footer + norep;

            // Email for all helpdesk personnel
            const mailOption = {
                from: process.env.EMAIL,
                to: level2_email,
                subject: `ARMS Notification - New Oil Analysis Report`,
                html: emailContent
            }
            await transporter.sendMail(mailOption);
            console.log('EEEEEEEEEEEEEEEEEEEEEMMMMMMMMMMMMMMMMMMAAAAAAAAAAAAAAAAAIIIIIIIIIIIILLLLLLLLLLLLLLLLLLLL SEEEEEEEEEEEEEEEENNNNNNNNNNNNNNNT')
        } catch (err) {
            console.log('UNABLE TO SEND EMAILLLLL!!!! : ', err)
        }


        res.status(200).json({ message: 'successfully submitted', asset_analysis_id: analysis_id });
        console.log('Successfully added analysis ID:', analysis_id);

    } catch (err) {
        console.error('INTERNAL ERROR:', err);
        res.status(500).json({ error: 'Internal server error', message: err.message });
    }
});

// ADD ASSET ANALYSIS
router.post('/add-assets-analysis', async (req, res) => {
    const currentTimestamp = new Date();
    const {
        asset_id,
        trivector,
        component_id,  // Add this - it's in your frontend but missing in backend
        asset_running_hours,
        oil_running_hours,
        oil_analysis_results,
        recommendations,
        created_by_user_id,
        analysis_date,
        created_by,
        additional_notes,  // Add this
        // l1,
        // l2,
        // l3
    } = req.body;

    try {

        //Get count for id
        const analysislength = await knex('asset_analysis_master').count('* as count').first();
        const asset_analysis_id = (analysislength.count || 0) + 1;

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
            no_asset_trivector: trivector,
            asset_component_id: component_id,  // Add component_id
            asset_analysis_id: asset_analysis_id,
            asset_running_hours,
            oil_running_hours,
            recommendations,
            analysis_date,
            created_by,
            additional_notes,  // Add additional notes
            level1: '1',
            // level1: l1,
            // level2: l2,
            // level3: l3,
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
        await knex('asset_analysis_master').insert(insertData);

        // Create change log
        await knex('asset_analysis_logs').insert({
            asset_analysis_id: asset_analysis_id,
            changes_made: `${created_by} has added an asset analysis.`,
            created_at: currentTimestamp,
            created_by: created_by
        });

        // ✅ FIX 1: Get L2 users here BEFORE sending email
        const level2_users = await knex('users_master')
            .select('*')
            .where('emp_position', 'l2');

        // console.log('2112', level2_users);
        // console.log(`✅ Found ${level2_users.length} L2 users`);

        //----------------------------------EMAIL FUNCTION----------------------------------------------
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                secure: false,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const level2_users = await knex('users_master').select('*').where('emp_position', 'l2');
            const level2_email = level2_users.map(email => email.emp_email);

            const asset = await knex('assets_master').where('asset_id', asset_id).first();

            // Start
            var start =
                'Good Day,<br><br>' +
                'This is to inform you that an <b>Asset Analysis Report</b> has been successfully created and submitted for review. ' +
                'The report provides the latest analysis and findings for the monitored asset. ' +
                'Please find the report details below:<br><br>';

            // Body
            var body =
                `<b>Report ID:</b> ${asset_analysis_id}<br>
                <b>Asset Name:</b> ${asset.asset_name}<br>
                <b>Asset Location:</b> ${asset.asset_location}<br>
                <b>Created By:</b> ${created_by}<br>
                <b>Analysis Date:</b> ${analysis_date}<br>
                <b>Recommendations:</b><br>
                ${recommendations}<br><br>`;

            var link =
                `To view the complete report, please click the following link:
                <a href="${process.env.REACT_CLIENT}/view-submitted-asset?id=${asset_analysis_id}">
                View Asset Analysis Report
                 </a><br><br>`;

            // Footer
            var footer =
                'The information contained in this report is intended to support asset reliability and maintenance planning. ' +
                'We encourage you to review the findings and recommendations and take the necessary actions as appropriate.<br><br>' +
                'If you have any questions or require further clarification regarding this report, please contact the Asset Monitoring Team.<br><br>' +
                'Thank you for your attention and cooperation.<br><br>' +
                'Best regards,<br><br>' +
                '<b>Asset Reliability Monitoring System</b>';

            var norep =
                '<br><hr style="border:0; border-top:1px solid #d3d3d3;"><br>' +
                '<div style="color:#808080; font-size:12px; font-family:Arial, sans-serif; line-height:1.5;">' +
                '<b>This is an automated email from the Asset Reliability Monitoring System.</b><br>' +
                'Please do not reply to this email, as this mailbox is not monitored and responses will not be received.<br><br>' +
                'If you have any questions or require assistance regarding this report, please contact the Asset Reliability Monitoring Team through the appropriate support channels.<br><br>' +
                '&copy; ' + new Date().getFullYear() + ' Asset Reliability Monitoring System. All rights reserved.' +
                '</div>';

            var emailContent = start + body + link + footer + norep;

            // Email for all helpdesk personnel
            const mailOption = {
                from: process.env.EMAIL,
                to: level2_email,
                subject: `ARMS Notification - New Asset Analysis Report`,
                html: emailContent
            }
            await transporter.sendMail(mailOption);
            console.log('EEEEEEEEEEEEEEEEEEEEEMMMMMMMMMMMMMMMMMMAAAAAAAAAAAAAAAAAIIIIIIIIIIIILLLLLLLLLLLLLLLLLLLL SEEEEEEEEEEEEEEEENNNNNNNNNNNNNNNT')
        } catch (err) {
            console.log('UNABLE TO SEND EMAILLLLL!!!! : ', err)
        }

        res.status(200).json({
            message: 'successfully submitted',
            asset_analysis_id: asset_analysis_id
        });

        console.log('Successfully added asset analysis with ID:', asset_analysis_id);
        console.log('@@@ TRIGGERED /add-assets-analysis');

    } catch (err) {
        console.error('INTERNAL ERROR UNABLE TO PUT ASSETS ANALYSIS: ', err);
        res.status(500).json({
            error: 'Internal server error',
            message: err.message
        });
    }
});


// UPDATE CRITICALITY ANALYSIS STATUS
router.post('/update-criticality', async (req, res) => {
    const currentTimestamp = new Date()
    try {
        const {
            asset_analysis_id,
            criticality_analysis_report,
            updated_by
        } = req.body;

        await knex('asset_analysis_master').where('asset_analysis_id', asset_analysis_id).update({
            asset_analysis_id,
            criticality_analysis_status: criticality_analysis_report,
            updated_by,
            updated_at: currentTimestamp
        });
        console.log('WWWWWWWWWWWWWWWWWWWOOORRRKINNNGGGG: ', { asset_analysis_id, criticality_analysis_report, updated_by });

        await knex('asset_analysis_logs').insert({
            asset_analysis_id,
            changes_made: updated_by + ' updated criticality status of id: ' + asset_analysis_id + ' to ' + criticality_analysis_report,
            created_by: updated_by,
            created_at: currentTimestamp
        })
        console.log(' @@@ TRIGGERED /update-criticality')
        res.status(200).json({ message: 'Updated successfully' });

    } catch (err) {
        console.log('Unable to update criticality: ', err)
    }
})


// UPDATE RESAMPLING SCHEDULE
router.post('/update-resampling-schedule', async (req, res) => {
    const currentTimestamp = new Date();
    try {
        const {
            asset_analysis_id,
            resampling_schedule,
            updated_by
        } = req.body;

        await knex('asset_analysis_master').where('asset_analysis_id', asset_analysis_id).update({
            resampling_schedule,
            updated_by,
            updated_at: currentTimestamp
        });

        await knex('asset_analysis_logs').insert({
            asset_analysis_id,
            changes_made: updated_by + ' updated resampling schedule of id: ' + asset_analysis_id + ' to ' + resampling_schedule,
            created_by: updated_by,
            created_at: currentTimestamp
        })
        console.log(' @@@ TRIGGERED /update-resampling-schedule')
        res.status(200).json({ message: 'Updated successfully' });
    } catch (err) {
        console.log('Unable to update resampling schedule: ', err)
    }
});

// UPDATE RESAMPLING SCHEDULE - no asset
router.post('/update-resampling-schedule-no-asset', async (req, res) => {
    const currentTimestamp = new Date();
    try {
        const {
            analysis_id,
            resampling_schedule,
            status_failed_second,
            updated_by
        } = req.body;

        await knex('no_asset_analysis_master').where('analysis_id', analysis_id).update({
            resampling_schedule,
            status_failed_second,
            updated_by,
            updated_at: currentTimestamp
        });

        await knex('no_asset_analysis_logs').insert({
            asset_analysis_id: analysis_id,
            changes_made: updated_by + ' updated resampling schedule of id: ' + analysis_id + ' to ' + resampling_schedule,
            created_by: updated_by,
            created_at: currentTimestamp
        })

        //----------------------------------EMAIL FUNCTION----------------------------------------------
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                secure: false,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const level2_users = await knex('users_master').select('*').where('emp_position', 'l1');
            const level2_email = level2_users.map(email => email.emp_email);

            const analysis = await knex('no_asset_analysis_master').where('analysis_id', analysis_id).first();

            // Start
            var start =
                'Good Day,<br><br>' +
                'This is to inform you that an <b>Oil Analysis Report</b> has been updated and submitted for review. ' +
                'The report provides the latest analysis and findings for the monitored new oil. ' +
                'Please find the report details below:<br><br>';

            // Body
            var body =
                `<b>Report ID:</b> ${analysis_id}<br>
                <b>Oil Batch Code:</b> ${analysis.oil_batch_code}<br>
                <b>Drum Number:</b> ${analysis.input_drum_number}<br>
                
                <b>Manufacturing Date:</b> ${analysis.manufacturing_date}<br>
                <b>Analysis Date:</b> ${analysis.analysis_date}<br>
                <b>Created By:</b> ${analysis.created_by}<br>
                <b>Updated By:</b> ${updated_by}<br>
                <b>Recommendations:</b><br>
                ${analysis.recommendations}<br><br>`;

            var link =
                `To view the complete report, please click the following link:
                <a href="${process.env.REACT_CLIENT}/view-submitted-asset-no-asset?id=${analysis_id}">
                View Asset Analysis Report
                 </a><br><br>`;

            // Footer
            var footer =
                'The information contained in this report is intended to support asset reliability and maintenance planning. ' +
                'We encourage you to review the findings and recommendations and take the necessary actions as appropriate.<br><br>' +
                'If you have any questions or require further clarification regarding this report, please contact the Asset Monitoring Team.<br><br>' +
                'Thank you for your attention and cooperation.<br><br>' +
                'Best regards,<br><br>' +
                '<b>Asset Reliability Monitoring System</b>';

            var norep =
                '<br><hr style="border:0; border-top:1px solid #d3d3d3;"><br>' +
                '<div style="color:#808080; font-size:12px; font-family:Arial, sans-serif; line-height:1.5;">' +
                '<b>This is an automated email from the Asset Reliability Monitoring System.</b><br>' +
                'Please do not reply to this email, as this mailbox is not monitored and responses will not be received.<br><br>' +
                'If you have any questions or require assistance regarding this report, please contact the Asset Reliability Monitoring Team through the appropriate support channels.<br><br>' +
                '&copy; ' + new Date().getFullYear() + ' Asset Reliability Monitoring System. All rights reserved.' +
                '</div>';

            var emailContent = start + body + link + footer + norep;

            // Email for all helpdesk personnel
            const mailOption = {
                from: process.env.EMAIL,
                to: level2_email,
                subject: `ARMS Notification - Oil Analysis for Level 1`,
                html: emailContent
            }
            await transporter.sendMail(mailOption);
            console.log('EEEEEEEEEEEEEEEEEEEEEMMMMMMMMMMMMMMMMMMAAAAAAAAAAAAAAAAAIIIIIIIIIIIILLLLLLLLLLLLLLLLLLLL SEEEEEEEEEEEEEEEENNNNNNNNNNNNNNNT')
        } catch (err) {
            console.log('UNABLE TO SEND EMAILLLLL!!!! : ', err)
        }


        console.log(' @@@ TRIGGERED /update-resampling-schedule--------- no asset')
        res.status(200).json({ message: 'Updated successfully' });
    } catch (err) {
        console.log('Unable to update resampling schedule: ', err)
    }
})

// UPDATE ANALYSIS STATUS TO EMPTY - no asset
router.post('/update-analysis-status-no-asset', async (req, res, next) => {

    try {
        const {
            analysis_id,
            updated_by,
            analysis_status,
            status_failed_second
        } = req.body;

        const updateData = {
            analysis_status,
            updated_by,
            updated_at: new Date(),

        };
        console.log('update-analysis-status-no-asset has been triggered: ', updateData);
        // Only update status_failed_second if it was explicitly sent
        if (status_failed_second !== undefined) {
            updateData.status_failed_second = status_failed_second;
        }

        await knex('no_asset_analysis_master')
            .where('analysis_id', analysis_id)
            .update(updateData);

        res.status(200).json({ message: 'Updated successfully' });

    } catch (err) {
        console.log('Unable to update analysis status: ', err);
        res.status(500).json({ error: 'Internal server error', message: err.message });
    }
});

// UPDATE ANALYSIS STATUS TO EMPTY - no asset
router.post('/update-analysis-status-no-asset-select', async (req, res, next) => {

    try {
        const {
            analysis_id,
            updated_by,
            analysis_status,
            status_failed_second
        } = req.body;

        const updateData = {
            analysis_status,
            updated_by,
            updated_at: new Date(),

        };
        console.log('update-analysis-status-no-asset has been triggered: ', updateData);
        // Only update status_failed_second if it was explicitly sent
        if (status_failed_second !== undefined) {
            updateData.status_failed_second = status_failed_second;
        }

        await knex('no_asset_analysis_master')
            .where('analysis_id', analysis_id)
            .update(updateData);

        //----------------------------------EMAIL FUNCTION----------------------------------------------
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                secure: false,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const level2_users = await knex('users_master').select('*').where('emp_position', 'l2');
            const level2_email = level2_users.map(email => email.emp_email);

            const analysis = await knex('no_asset_analysis_master').where('analysis_id', analysis_id).first();

            // Start
            var start =
                'Good Day,<br><br>' +
                'This is to inform you that an <b>Oil Analysis Report</b> has been updated and submitted for review. ' +
                'The report provides the latest analysis and findings for the monitored new oil. ' +
                'Please find the report details below:<br><br>';

            // Body
            var body =
                `<b>Report ID:</b> ${analysis_id}<br>
                <b>Oil Batch Code:</b> ${analysis.oil_batch_code}<br>
                <b>Drum Number:</b> ${analysis.input_drum_number}<br>
                
                <b>Manufacturing Date:</b> ${analysis.manufacturing_date}<br>
                <b>Analysis Date:</b> ${analysis.analysis_date}<br>
                <b>Created By:</b> ${analysis.created_by}<br>
                <b>Updated By:</b> ${updated_by}<br>
                <b>Recommendations:</b><br>
                ${analysis.recommendations}<br><br>`;

            var link =
                `To view the complete report, please click the following link:
                <a href="${process.env.REACT_CLIENT}/view-submitted-asset-no-asset?id=${analysis_id}">
                View Asset Analysis Report
                 </a><br><br>`;

            // Footer
            var footer =
                'The information contained in this report is intended to support asset reliability and maintenance planning. ' +
                'We encourage you to review the findings and recommendations and take the necessary actions as appropriate.<br><br>' +
                'If you have any questions or require further clarification regarding this report, please contact the Asset Monitoring Team.<br><br>' +
                'Thank you for your attention and cooperation.<br><br>' +
                'Best regards,<br><br>' +
                '<b>Asset Reliability Monitoring System</b>';

            var norep =
                '<br><hr style="border:0; border-top:1px solid #d3d3d3;"><br>' +
                '<div style="color:#808080; font-size:12px; font-family:Arial, sans-serif; line-height:1.5;">' +
                '<b>This is an automated email from the Asset Reliability Monitoring System.</b><br>' +
                'Please do not reply to this email, as this mailbox is not monitored and responses will not be received.<br><br>' +
                'If you have any questions or require assistance regarding this report, please contact the Asset Reliability Monitoring Team through the appropriate support channels.<br><br>' +
                '&copy; ' + new Date().getFullYear() + ' Asset Reliability Monitoring System. All rights reserved.' +
                '</div>';

            var emailContent = start + body + link + footer + norep;

            // Email for all helpdesk personnel
            const mailOption = {
                from: process.env.EMAIL,
                to: level2_email,
                subject: `ARMS Notification - Oil Analysis for Level 2`,
                html: emailContent
            }
            await transporter.sendMail(mailOption);
            console.log('EEEEEEEEEEEEEEEEEEEEEMMMMMMMMMMMMMMMMMMAAAAAAAAAAAAAAAAAIIIIIIIIIIIILLLLLLLLLLLLLLLLLLLL SEEEEEEEEEEEEEEEENNNNNNNNNNNNNNNT')
        } catch (err) {
            console.log('UNABLE TO SEND EMAILLLLL!!!! : ', err)
        }


        res.status(200).json({ message: 'Updated successfully' });

    } catch (err) {
        console.log('Unable to update analysis status: ', err);
        res.status(500).json({ error: 'Internal server error', message: err.message });
    }
});

router.post('/update-no-asset-clear-l2', async (req, res, next) => {
    try {
        const {
            analysis_id,
            updated_by,
        } = req.body;

        await knex('no_asset_analysis_master').where('analysis_id', analysis_id).update({
            level2: null,
            updated_by,
            updated_at: new Date()
        });
        res.status(200).json({ message: 'Updated successfully' });
    } catch (err) {
        console.log('Unable to update analysis status: ', err);
        res.status(500).json({ error: 'Internal server error', message: err.message });
    }
})

router.post('/update-no-asset-add-l2', async (req, res, next) => {
    try {
        const {
            analysis_id,
            updated_by,
        } = req.body;

        await knex('no_asset_analysis_master').where('analysis_id', analysis_id).update({
            level2: '1',
            updated_by,
            updated_at: new Date()
        });
        res.status(200).json({ message: 'Updated successfully' });
    } catch (err) {
        console.log('Unable to update analysis status: ', err);
        res.status(500).json({ error: 'Internal server error', message: err.message });
    }
})

// //UPDATE SEVERE ACTION AND DOCUMENTATION - no asset
// router.post('/update-severe-action', upload.array('documentation'), async (req, res) => {
//     const currentTimestamp = new Date();

//     try {
//         const {
//             asset_analysis_id,
//             severe_action,
//             updated_by
//         } = req.body;

//         let documentationPaths = [];

//         // Handle uploaded files
//         if (req.files && req.files.length > 0) {
//             documentationPaths = req.files.map(file => ({
//                 originalName: file.originalname,
//                 storedName: file.filename,
//                 path: file.path,
//                 size: file.size,
//                 mimetype: file.mimetype
//             }));

//             // Store relative paths or just filenames in database
//             const fileNamesString = req.files.map(file => file.filename).join(',');

//             await knex('no_asset_analysis_master').where('asset_analysis_id', asset_analysis_id).update({
//                 action_taken: severe_action,
//                 documentation: fileNamesString, // Store comma-separated filenames
//                 updated_by,
//                 updated_at: currentTimestamp
//             });
//         } else {
//             await knex('no_asset_analysis_master').where('asset_analysis_id', asset_analysis_id).update({
//                 action_taken: severe_action,
//                 updated_by,
//                 updated_at: currentTimestamp
//             });
//         }

//         await knex('no_asset_analysis_logs').insert({
//             asset_analysis_id,
//             changes_made: `${updated_by} updated severe action for id: ${asset_analysis_id}`,
//             created_by: updated_by,
//             created_at: currentTimestamp
//         });

//         console.log('@@@ TRIGGERED /update-severe-action');
//         res.status(200).json({
//             message: 'Updated successfully',
//             files: documentationPaths
//         });
//     } catch (err) {
//         console.error('Unable to update severe action: ', err);
//         res.status(500).json({
//             error: 'Failed to update severe action',
//             details: err.message
//         });
//     }
// });

//UPDATE SEVERE ACTION AND DOCUMENTATION
router.post('/update-severe-action', upload.array('documentation'), async (req, res) => {
    const currentTimestamp = new Date();

    try {
        const {
            asset_analysis_id,
            severe_action,
            updated_by
        } = req.body;

        let documentationPaths = [];

        // Handle uploaded files
        if (req.files && req.files.length > 0) {
            documentationPaths = req.files.map(file => ({
                originalName: file.originalname,
                storedName: file.filename,
                path: file.path,
                size: file.size,
                mimetype: file.mimetype
            }));

            // Store relative paths or just filenames in database
            const fileNamesString = req.files.map(file => file.filename).join(',');

            await knex('asset_analysis_master').where('asset_analysis_id', asset_analysis_id).update({
                action_taken: severe_action,
                documentation: fileNamesString, // Store comma-separated filenames
                updated_by,
                updated_at: currentTimestamp
            });
        } else {
            await knex('asset_analysis_master').where('asset_analysis_id', asset_analysis_id).update({
                action_taken: severe_action,
                updated_by,
                updated_at: currentTimestamp
            });
        }

        await knex('asset_analysis_logs').insert({
            asset_analysis_id,
            changes_made: `${updated_by} updated severe action for id: ${asset_analysis_id}`,
            created_by: updated_by,
            created_at: currentTimestamp
        });

        console.log('@@@ TRIGGERED /update-severe-action');
        res.status(200).json({
            message: 'Updated successfully',
            files: documentationPaths
        });
    } catch (err) {
        console.error('Unable to update severe action: ', err);
        res.status(500).json({
            error: 'Failed to update severe action',
            details: err.message
        });
    }
});

// UPDATE - REMOVE SEVERE ACTION AND DOCUMENTATION
router.post('/update-remove-severe-action', async (req, res) => {
    const currentTimestamp = new Date();

    try {
        const {
            asset_analysis_id,
            updated_by
        } = req.body;

        // First, get the current record to get the documentation files
        const currentRecord = await knex('asset_analysis_master')
            .where('asset_analysis_id', asset_analysis_id)
            .first();

        if (!currentRecord) {
            return res.status(404).json({ error: 'Record not found' });
        }

        // Get documentation files from the record
        const documentationFiles = currentRecord.documentation ? currentRecord.documentation.split(',') : [];

        // USE THE SAME RELATIVE PATH as your storage
        const documentationPath = './documentation';  // Same as DIR
        const deletedFiles = [];
        const failedFiles = [];

        console.log('Documentation path:', documentationPath);
        console.log('Current working directory:', process.cwd());
        console.log('Files to delete:', documentationFiles);

        for (const file of documentationFiles) {
            const cleanFile = file.trim();
            if (cleanFile) {
                const filePath = path.join(documentationPath, cleanFile);
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        deletedFiles.push(cleanFile);
                        console.log(`✅ Deleted file: ${filePath}`);
                    } else {
                        console.log(`❌ File not found: ${filePath}`);
                        failedFiles.push({ file: cleanFile, reason: 'File not found' });
                    }
                } catch (err) {
                    console.error(`❌ Error deleting file ${cleanFile}:`, err);
                    failedFiles.push({ file: cleanFile, reason: err.message });
                }
            }
        }

        // Update the database - set documentation and action_taken to NULL
        await knex('asset_analysis_master')
            .where('asset_analysis_id', asset_analysis_id)
            .update({
                action_taken: null,
                documentation: null,
                updated_by: updated_by,
                updated_at: currentTimestamp
            });

        // Create log entry
        await knex('asset_analysis_logs').insert({
            asset_analysis_id,
            changes_made: `${updated_by} removed severe action and documentation for ID: ${asset_analysis_id}. Deleted ${deletedFiles.length} file(s).`,
            created_by: updated_by,
            created_at: currentTimestamp
        });

        console.log('@@@ TRIGGERED /update-remove-severe-action');
        res.status(200).json({
            message: 'Severe action and documentation removed successfully',
            deletedFiles: deletedFiles,
            failedFiles: failedFiles,
            deletedCount: deletedFiles.length,
            failedCount: failedFiles.length
        });

    } catch (err) {
        console.error('Unable to remove severe action:', err);
        res.status(500).json({
            error: 'Failed to remove severe action',
            details: err.message
        });
    }
});

//UPDATE APPROPRIATE ACTION AND ACTION NOTES
router.post('/update-appropriate-actions', async (req, res) => {
    const currentTimestamp = new Date();
    try {
        const {
            asset_analysis_id,
            appropriate_action,
            action_notes,
            updated_by
        } = req.body;

        await knex('asset_analysis_master').where('asset_analysis_id', asset_analysis_id).update({
            level3: '1',
            appropriate_action,
            action_notes,
            updated_by,
            updated_at: currentTimestamp
        });

        //----------------------------------EMAIL FUNCTION----------------------------------------------
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                secure: false,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const level2_users = await knex('users_master').select('*').where('emp_position', 'l2');
            const level2_email = level2_users.map(email => email.emp_email);

            const analysis_report = await knex('asset_analysis_master').where('asset_analysis_id', asset_analysis_id).first();

            const asset = await knex('assets_master').where('asset_id', analysis_report.asset_id).first();

            // Start
            var start =
                'Good Day,<br><br>' +
                'This is to inform you that the <b>Asset Analysis Report</b> has been reviewed and approved by the Level 3 evaluator. ' +
                'The report is now pending final documentation to complete the asset analysis report. ' +
                'Please find the report details below:<br><br>';

            // Body
            var body =
                `<b>Report ID:</b> ${asset_analysis_id}<br>
                <b>Asset Name:</b> ${asset.asset_name}<br>
                <b>Asset Location:</b> ${asset.asset_location}<br>
                <b>Approved By:</b> ${updated_by} <br>
                <b>Recommendations:</b><br>
                ${analysis_report.recommendations}<br><br>`;

            // Link
            var link =
                'Kindly proceed with the final documentation process by accessing the report through this link: ' +
                `<a href="${process.env.REACT_CLIENT}/view-submitted-asset?id=${asset_analysis_id}">
                View Asset Analysis Report 
                </a><br><br>`;

            // Footer
            var footer =
                'The Asset Analysis Report has successfully completed the technical review and approval process. ' +
                'Your timely completion of the final documentation will ensure proper record management and facilitate any required follow-up actions.<br><br>' +
                'Should you require additional information or clarification, please contact the Asset Reliability Monitoring Team.<br><br>' +
                'Thank you for your cooperation.<br><br>' +
                'Best regards,<br><br>' +
                '<b>Asset Reliability Monitoring System</b>';

            // No Reply
            var norep =
                '<br><hr style="border:0; border-top:1px solid #d3d3d3;"><br>' +
                '<div style="color:#808080; font-size:12px; font-family:Arial, sans-serif; line-height:1.5;">' +
                '<b>This is an automated email from the Asset Reliability Monitoring System.</b><br>' +
                'Please do not reply to this email, as this mailbox is not monitored and responses will not be received.<br><br>' +
                'For assistance regarding this report or the final documentation process, please contact the Asset Reliability Monitoring Team through the appropriate support channels.<br><br>' +
                '&copy; ' + new Date().getFullYear() + ' Asset Reliability Monitoring System. All rights reserved.' +
                '</div>';

            var emailContent = start + body + link + footer + norep;

            // Email for all helpdesk personnel
            const mailOption = {
                from: process.env.EMAIL,
                to: level2_email,
                subject: `ARMS Notification - Awaiting Level 2 Review`,
                html: emailContent
            }
            await transporter.sendMail(mailOption);
            console.log('EEEEEEEEEEEEEEEEEEEEEMMMMMMMMMMMMMMMMMMAAAAAAAAAAAAAAAAAIIIIIIIIIIIILLLLLLLLLLLLLLLLLLLL SEEEEEEEEEEEEEEEENNNNNNNNNNNNNNNT')
        } catch (err) {
            console.log('UNABLE TO SEND EMAILLLLL!!!! : ', err)
        }

        console.log(' @@@ TRIGGERED /update-appropriate-actions')
        res.status(200).json({
            message: 'Updated successfully'
        });
    } catch (err) {
        console.log('Unable to update: ', err)
    }
})

//UpdaTE TO LEVEL 2 (REQUIRES APPROPRIATE ACTIONS AND ACTION NOTES TO BE FILLED IN)
router.post('/update-level-two', async (req, res) => {
    const currentTimestamp = new Date();
    try {
        const {
            asset_analysis_id,
            updated_by,

        } = req.body;

        await knex('asset_analysis_master').where('asset_analysis_id', asset_analysis_id).update({
            level2: '1',
            updated_by: updated_by,
            updated_at: currentTimestamp,

        })

        console.log(' @@@ TRIGGERED /update-level-two')
        res.status(200).json({ message: 'Updated successfully' });

    } catch (err) {
        console.log('Unable to update to level2: ', err)
    }
})

// UPDATE TO LEVEL 2 WITHOUT REQUIRING APPROPRIATE ACTIONS AND ACTION NOTES TO BE FILLED IN (FOR USER TO BYPASS AND GO STRAIGHT TO LEVEL 2 IF THEY WANT)
router.post('/update-level-two-user', async (req, res) => {
    const currentTimestamp = new Date();
    try {
        const {
            asset_analysis_id,
            updated_by,

        } = req.body;

        await knex('asset_analysis_master').where('asset_analysis_id', asset_analysis_id).update({
            level2: '1',
            updated_by: updated_by,
            updated_at: currentTimestamp,
            appropriate_action: '',
            action_notes: ''
        });

        //----------------------------------EMAIL FUNCTION----------------------------------------------
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                secure: false,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const level2_users = await knex('users_master').select('*').where('emp_position', 'l3');
            const level3_email = level2_users.map(email => email.emp_email);

            const analysis_report = await knex('asset_analysis_master').where('asset_analysis_id', asset_analysis_id).first();

            const asset = await knex('assets_master').where('asset_id', analysis_report.asset_id).first();

            // Start
            var start =
                'Good Day,<br><br>' +
                'This is to notify you that an <b>Asset Analysis Report</b> has been updated by the assigned analyst and is pending your evaluation. ' +
                'Your review of the updated findings and recommendations is requested to facilitate the appropriate follow-up actions. ' +
                'Please find the report details below:<br><br>';

            // Body
            var body =
                `<b>Report ID:</b> ${asset_analysis_id}<br>
                <b>Asset Name:</b> ${asset.asset_name}<br>
                <b>Asset Location:</b> ${asset.asset_location}<br>
                <b>Updated By:</b> ${updated_by}<br>
                <b>Analysis Date:</b> ${analysis_report.analysis_date}<br>
                <b>Recommendations:</b><br>
                ${analysis_report.recommendations}<br><br>`;

            var link =
                `To view the complete report, please click the following link:
                <a href="${process.env.REACT_CLIENT}/view-submitted-asset?id=${asset_analysis_id}">
                View Asset Analysis Report
                 </a><br><br>`;

            // Footer
            var footer =
                'The information contained in this report is intended to support asset reliability and maintenance planning. ' +
                'Kindly review the updated findings and recommendations and take the appropriate actions as necessary.<br><br>' +
                'If you require additional information or clarification regarding this report, please contact the Asset Reliability Monitoring Team through the designated support channels.<br><br>' +
                'Thank you for your prompt attention and cooperation.<br><br>' +
                'Best regards,<br><br>' +
                '<b>Asset Reliability Monitoring System</b>';

            var norep =
                '<br><hr style="border:0; border-top:1px solid #d3d3d3;"><br>' +
                '<div style="color:#808080; font-size:12px; font-family:Arial, sans-serif; line-height:1.5;">' +
                '<b>This is an automated email from the Asset Reliability Monitoring System.</b><br>' +
                'Please do not reply to this email, as this mailbox is not monitored and responses will not be received.<br><br>' +
                'If you have any questions or require assistance regarding this report, please contact the Asset Reliability Monitoring Team through the appropriate support channels.<br><br>' +
                '&copy; ' + new Date().getFullYear() + ' Asset Reliability Monitoring System. All rights reserved.' +
                '</div>';

            var emailContent = start + body + link + footer + norep;

            // Email for all helpdesk personnel
            const mailOption = {
                from: process.env.EMAIL,
                to: level3_email,
                subject: `ARMS Notification - Awaiting Level 3 Review`,
                html: emailContent
            }
            await transporter.sendMail(mailOption);
            console.log('EEEEEEEEEEEEEEEEEEEEEMMMMMMMMMMMMMMMMMMAAAAAAAAAAAAAAAAAIIIIIIIIIIIILLLLLLLLLLLLLLLLLLLL SEEEEEEEEEEEEEEEENNNNNNNNNNNNNNNT')
        } catch (err) {
            console.log('UNABLE TO SEND EMAILLLLL!!!! : ', err)
        }

        console.log(' @@@ TRIGGERED /update-level-two-user')
        res.status(200).json({ message: 'Updated successfully' });

    } catch (err) {
        console.log('Unable to update to level2: ', err)
    }
})

// UPDATE TO LEVEL 1 WITHOUT REQUIRING APPROPRIATE ACTIONS AND ACTION NOTES TO BE FILLED IN (FOR USER TO BYPASS AND GO STRAIGHT TO LEVEL 1 IF THEY WANT)
router.post('/update-level-one', async (req, res) => {
    const currentTimestamp = new Date();
    try {
        const {
            asset_analysis_id,
            updated_by,
            appropriate_action,
            action_notes

        } = req.body;

        await knex('asset_analysis_master').where('asset_analysis_id', asset_analysis_id).update({
            level1: '1',
            level2: '',
            level3: '',
            appropriate_action,
            action_notes,
            updated_by: updated_by,
            updated_at: currentTimestamp
        })


        //----------------------------------EMAIL FUNCTION----------------------------------------------
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                secure: false,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const level2_users = await knex('users_master').select('*').where('emp_position', 'l2');
            const level2_email = level2_users.map(email => email.emp_email);

            const analysis_report = await knex('asset_analysis_master').where('asset_analysis_id', asset_analysis_id).first();

            const asset = await knex('assets_master').where('asset_id', analysis_report.asset_id).first();

            // Start
            var start =
                'Good Day,<br><br>' +
                'This is to notify you that an <b>Asset Analysis Report</b> has been updated by the assigned analyst and is pending your evaluation. ' +
                'Your review of the updated findings and recommendations is requested to facilitate the appropriate follow-up actions. ' +
                'Please find the report details below:<br><br>';

            // Body
            var body =
                `<b>Report ID:</b> ${asset_analysis_id}<br>
                <b>Asset Name:</b> ${asset.asset_name}<br>
                <b>Asset Location:</b> ${asset.asset_location}<br>
                <b>Updated By:</b> ${updated_by}<br>
                <b>Analysis Date:</b> ${analysis_report.analysis_date}<br>
                <b>Recommendations:</b><br>
                ${analysis_report.recommendations}<br><br>`;

            var link =
                `To view the complete report, please click the following link:
                <a href="${process.env.REACT_CLIENT}/view-submitted-asset?id=${asset_analysis_id}">
                View Asset Analysis Report
                 </a><br><br>`;

            // Footer
            var footer =
                'The information contained in this report is intended to support asset reliability and maintenance planning. ' +
                'Kindly review the updated findings and recommendations and take the appropriate actions as necessary.<br><br>' +
                'If you require additional information or clarification regarding this report, please contact the Asset Reliability Monitoring Team through the designated support channels.<br><br>' +
                'Thank you for your prompt attention and cooperation.<br><br>' +
                'Best regards,<br><br>' +
                '<b>Asset Reliability Monitoring System</b>';

            var norep =
                '<br><hr style="border:0; border-top:1px solid #d3d3d3;"><br>' +
                '<div style="color:#808080; font-size:12px; font-family:Arial, sans-serif; line-height:1.5;">' +
                '<b>This is an automated email from the Asset Reliability Monitoring System.</b><br>' +
                'Please do not reply to this email, as this mailbox is not monitored and responses will not be received.<br><br>' +
                'If you have any questions or require assistance regarding this report, please contact the Asset Reliability Monitoring Team through the appropriate support channels.<br><br>' +
                '&copy; ' + new Date().getFullYear() + ' Asset Reliability Monitoring System. All rights reserved.' +
                '</div>';

            var emailContent = start + body + link + footer + norep;

            // Email for all helpdesk personnel
            const mailOption = {
                from: process.env.EMAIL,
                to: level2_email,
                subject: `ARMS Notification - Awaiting Level 2 Review`,
                html: emailContent
            }
            await transporter.sendMail(mailOption);
            console.log('EEEEEEEEEEEEEEEEEEEEEMMMMMMMMMMMMMMMMMMAAAAAAAAAAAAAAAAAIIIIIIIIIIIILLLLLLLLLLLLLLLLLLLL SEEEEEEEEEEEEEEEENNNNNNNNNNNNNNNT')
        } catch (err) {
            console.log('UNABLE TO SEND EMAILLLLL!!!! : ', err)
        }


        console.log(' @@@ TRIGGERED /update-level-one')
        res.status(200).json({ message: 'Updated successfully' });

    } catch (err) {
        console.log('Unable to update to level2: ', err)
    }
});

// GET ALL SUBMITTED NO ASSETS ANALYSIS REPORT
router.get('/get-all-submitted-no-assets', async (req, res) => {
    try {
        const fetch = await knex('no_asset_analysis_master').select('*');
        res.json(fetch);
        console.log(' @@@ TRIGGERED /get-all-submitted-no-assets')
    } catch (err) {
        console.log('INTERNAL ERROR, UNABLE TO FETCH ALL ASSETS', err)
    }
})

// GET ALL SUBMITTED ASSETS ANALYSIS
router.get('/get-all-submitted-assets', async (req, res) => {
    try {
        const fetch = await knex('asset_analysis_master').select('*');
        res.json(fetch);
        console.log(' @@@ TRIGGERED /get-all-submitted-assets')
    } catch (err) {
        console.log('INTERNAL ERROR, UNABLE TO FETCH ALL ASSETS', err)
    }
})

// GET ASSET ANALYSIS BY ID
router.get('/get-submitted-assets-by-id', async (req, res, next) => {
    try {
        const getbyID = await AssetsAnalysis.findAll({
            where: {
                asset_analysis_id: req.query.id
            }
        })
        console.log(' @@@ TRIGGERED /get-submitted-assets-by-id');
        res.json(getbyID[0])
    } catch (err) {
        console.log('INTERNAL ERROR: ', err)
    }
})

router.get('/get-submitted-no-assets-by-id', async (req, res, next) => {
    try {
        const getbyID = await NoAssetsAnalysis.findAll({
            where: {
                analysis_id: req.query.id
            }
        })
        console.log(' @@@ TRIGGERED /get-submitted-no-assets-by-id');
        res.json(getbyID[0])
    } catch (err) {
        console.log('INTERNAL ERROR: ', err)
    }
})

// ADD OPTION FOR ASSET SETUP
router.post('/add-option', async (req, res) => {
    try {

        const optionlength = await knex('option_master').count('* as count').first();
        const option_id = (optionlength.count || 0) + 1;

        const {
            option_asset_location,
            option_asset_type,
            option_asset_category,
            option_component_types,
            created_by
        } = req.body;

        console.log(
            option_asset_location,
            option_asset_type,
            option_asset_category,
            option_component_types,
            created_by
        )
        await knex('option_master').insert({
            option_id: option_id,
            option_asset_location: option_asset_location.join(','),
            option_asset_type: option_asset_type.join(','),
            option_asset_category: option_asset_category.join(','),
            option_component_types: option_component_types.join('/'),
            created_by: created_by,
            created_at: new Date(),

        })
        console.log('@@@ TRIGGERED /add-option')
        res.json(200)

        console.log(option_asset_location)

    } catch (err) {
        console.log(err)
    }
});

// UPDATE OPTION FOR ASSET SETUP
router.post('/update-option', async (req, res) => {
    try {
        const {
            option_id,
            option_asset_location,
            option_asset_type,
            option_asset_category,
            option_component_types,
            updated_by
        } = req.body;

        await knex('option_master').where({ option_id: option_id }).update({
            option_asset_location: option_asset_location,
            option_asset_type: option_asset_type,
            option_asset_category: option_asset_category,
            option_component_types: option_component_types,
            updated_by: updated_by,
            updated_at: new Date(),

        })
        console.log('@@@ TRIGGERED /update-option')
        res.json(200)

    } catch (err) {
        console.log('UNABLE TO UPDATE OPTION: ', err)
    }
})

//delete option for asset setup
router.post('/delete-option', async (req, res) => {
    try {
        const {
            option_id
        } = req.body;
        console.log('@@@ TRIGGERED /delete-option')
        await knex('option_master').where({ option_id: option_id }).del();
        res.json(200)
    } catch (err) {
        console.log('UNABLE TO DELETE OPTION: ', err)
    }
})

// GET ALL OPTIONS FOR ASSET SETUP
router.get('/get-all-options', async (req, res) => {
    try {
        const fetch = await knex('option_master').select('*');
        res.json(fetch);
        console.log(' @@@ TRIGGERED /get-all-options')
    } catch (err) {
        console.log('UNABLE TO GET ALL OPTIONS: ', err);
    }
})

// GET OPTION BY ID FOR ASSET SETUP
router.get('/get-option-by-id', async (req, res) => {
    try {
        const getbyID = await SetupOption.findAll({
            where: {
                option_id: req.query.id
            }
        })
        console.log(' @@@ TRIGGERED /get-option-by-id');
        res.json(getbyID[0])
    } catch (err) {
        console.log('UNABLE TO GET OPTION BY ID: ', err);
    }
})

// ADD WEAR METAL OPTION
router.post('/add-wear-metal', async (req, res) => {

    const { parameter, unit, trivector_id } = req.body;
    console.log(req.body)
    try {

        // Insert and return the ID
        const [id_wearMetal] = await knex('option_trivector_wear_metals').insert({
            parameter,
            unit,
            trivector_id
        }).returning('option_trivector_wear_metal_id'); // Use returning('id') for PostgreSQL or for MSSQL use:

        const id = id_wearMetal.option_trivector_wear_metals || id_wearMetal
        console.log('@@@ TRIGGERED /add-wear-metal')
        res.status(200).json({
            success: true,
            id: id,
            message: 'Wear metal saved successfully'
        });
    } catch (err) {
        console.error(err);
    }
});

// ADD CONTAMINANT OPTION
router.post('/add-contaminant', async (req, res) => {

    const { parameter, unit, trivector_id } = req.body;
    console.log(req.body)
    try {

        // Insert and return the ID
        const [id_wearMetal] = await knex('option_trivector_contaminants').insert({
            parameter,
            unit,
            trivector_id
        }).returning('option_trivector_contaminants_id'); // Use returning('id') for PostgreSQL or for MSSQL use:

        const id = id_wearMetal.option_trivector_contaminants_id || id_wearMetal
        console.log('@@@ TRIGGERED /add-contaminant')
        res.status(200).json({
            success: true,
            id: id,
            message: 'contaminants saved successfully'
        });
    } catch (err) {
        console.error(err);
    }
});

// ADD CHEMICAL VISCOSITY OPTION
router.post('/add-chemviscosity', async (req, res) => {

    const { parameter, unit, trivector_id } = req.body;
    console.log(req.body)
    try {

        // Insert and return the ID
        const [id_wearMetal] = await knex('option_trivector_chem_viscosity').insert({
            parameter,
            unit,
            trivector_id
        }).returning('option_trivector_chem_viscosity_id'); // Use returning('id') for PostgreSQL or for MSSQL use:

        const id = id_wearMetal.option_trivector_chem_viscosity_id || id_wearMetal
        console.log('@@@ TRIGGERED /add-chemviscosity')
        res.status(200).json({
            success: true,
            id: id,
            message: 'chem visco saved successfully'
        });
    } catch (err) {
        console.error(err);
    }
});

// GET ALL OPTIONS FOR ASSET SETUP
router.get('/get-all-options-master', async (req, res) => {
    try {
        const fetch = await knex('option_master').select('*');
        res.json(fetch);
        console.log('@@@ TRIGGERED /get-all-options-master')
    } catch (err) {
        console.log('UNABLE TO GET ALL OPTION MASTER: ', err)
    }
});

// UPDATE ASSET DETAILS IN ASSETS MASTER
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
    console.log('@@@ TRIGGERED /update-assets')
    res.status(200).json({ message: 'Asset updated successfully' });

});

// ADD TRIVECTOR
router.post('/add-trivector', async (req, res) => {
    try {
        const {
            trivectorName,
            option_trivector_wear_metal,
            option_trivector_contaminants,
            option_trivector_chemical_viscosity,
            created_by,
        } = req.body;

        const [trivectorId] = await knex('option_trivector_master').insert({
            trivector_name: trivectorName,
            trivector_wear_metal: option_trivector_wear_metal.join(','),
            trivector_contaminants: option_trivector_contaminants.join(','),
            trivector_chemical_viscosity: option_trivector_chemical_viscosity.join(','),
            created_by
        }).returning('trivector_id');

        const trivector_id = trivectorId.trivector_id || trivectorId

        // Send proper response back to client
        res.status(200).json({
            success: true,
            message: 'Successfully added trivector',
            data: {
                trivectorName,
                trivectorId: trivector_id,
                wearMetalCount: option_trivector_wear_metal?.length || 0,
                contaminantsCount: option_trivector_contaminants?.length || 0,
                chemViscosityCount: option_trivector_chemical_viscosity?.length || 0
            }
        });
        console.log('@@@ TRIGGERED /add-trivector');
    } catch (err) {
        console.log('UNABLE TO ADD TRIVECTOR: ', err)
        res.status(500).json({
            error: 'Failed to add trivector',
            details: err.message
        });
    }
})

// UPDATE TRIVECTOR
router.post('/update-trivector', async (req, res) => {
    try {
        const {
            trivector_id,
            option_trivector_wear_metal,
            option_trivector_contaminants,
            option_trivector_chemical_viscosity
        } = req.body;

        // Check if trivector exists
        const trivectorExists = await knex('option_trivector_master')
            .where({ trivector_id: trivector_id })
            .first();

        if (!trivectorExists) {
            return res.status(404).json({
                success: false,
                error: 'Trivector not found'
            });
        }

        // Update the trivector with the collected IDs
        const updated = await knex('option_trivector_master')
            .where({ trivector_id: trivector_id })
            .update({
                trivector_wear_metal: option_trivector_wear_metal.join(','),
                trivector_contaminants: option_trivector_contaminants.join(','),
                trivector_chemical_viscosity: option_trivector_chemical_viscosity.join(','),
                updated_at: knex.fn.now() // If you have an updated_at timestamp column
            });

        if (updated) {
            console.log('@@@ TRIGGERED /update-trivector');
            res.status(200).json({
                success: true,
                message: 'Successfully updated trivector',
                data: {
                    trivector_id: trivector_id,
                    wearMetalCount: option_trivector_wear_metal?.length || 0,
                    contaminantsCount: option_trivector_contaminants?.length || 0,
                    chemViscosityCount: option_trivector_chemical_viscosity?.length || 0
                }
            });
        } else {
            console.log('Failed to update trivector');
            res.status(400).json({
                success: false,
                error: 'Failed to update trivector'
            });
        }
    } catch (err) {
        console.log('UNABLE TO UPDATE TRIVECTOR: ', err);
        res.status(500).json({
            success: false,
            error: 'Failed to update trivector',
            details: err.message
        });
    }
});

//
router.get('/get-all-trivector', async (req, res) => {
    try {
        const fetch = await knex('option_trivector_master').select('*');
        res.json(fetch);
        console.log('triggered-get-all-trivector')
    } catch (err) {
        console.log('UNABLE TO GET TRIVECTOR BY ID: ', err);
    }
})

router.post('/update-no-asset-resolution', async (req, res, next) => {
    try {

        const {
            analysis_id,
            resolution,
            updated_by,
            actions
        } = req.body;

        await knex('no_asset_analysis_master').where('analysis_id', analysis_id).update({
            resolution,
            actions,
            updated_by,
            updated_at: new Date()
        });

        console.log('update-no-asset-resolution has been triggered: ', { analysis_id, resolution, updated_by, actions });

        res.json({ success: true, message: 'No asset resolution updated successfully' });
    } catch (err) {
        console.log('Unable to update no asset resolution: ', err);
        res.status(500).json({ success: false, message: 'Failed to update no asset resolution' });
    }
})

router.post('/upload-documentation-report', upload.fields([
    { name: 'oil_before', maxCount: 1 },
    { name: 'oil_after', maxCount: 1 }
]), async (req, res) => {
    const currentTimestamp = new Date();

    try {
        const {
            analysis_id,
            updated_by
        } = req.body;

        if (!req.files || !req.files['oil_before'] || !req.files['oil_after']) {
            return res.status(400).json({ error: 'Both oil_before and oil_after files are required.' });
        }

        const oilBeforePath = `documentation/${req.files['oil_before'][0].filename}`;
        const oilAfterPath = `documentation/${req.files['oil_after'][0].filename}`;

        await knex('no_asset_analysis_master').where('analysis_id', analysis_id).update({
            oil_before: oilBeforePath,
            oil_after: oilAfterPath,
            updated_by,

            updated_at: currentTimestamp
        });

        await knex('no_asset_analysis_logs').insert({
            asset_analysis_id: analysis_id,
            changes_made: `${updated_by} uploaded documentation for analysis ID: ${analysis_id}`,
            created_by: updated_by,
            created_at: currentTimestamp
        });

        console.log('@@@ TRIGGERED /upload-documentation-report');


        //----------------------------------EMAIL FUNCTION----------------------------------------------
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                secure: false,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const level2_users = await knex('users_master').select('*').where('emp_position', 'l3');
            const level2_email = level2_users.map(email => email.emp_email);

            const analysis = await knex('no_asset_analysis_master').where('analysis_id', analysis_id).first();

            // const asset = await knex('assets_master').where('asset_id', analysis_report.asset_id).first();

            // Start
            var start =
                'Good Day,<br><br>' +
                'This is to notify you that the <b>Oil Analysis Report</b> has been fully reviewed, approved, and finalized with the completion of the final documentation process. ' +
                'Please find the report details below for your reference.<br><br>';


            // Body
            var body =
                `<b>Report ID:</b> ${analysis_id}<br>
                <b>Oil Batch Code:</b> ${analysis.oil_batch_code}<br>
                <b>Drum Number:</b> ${analysis.input_drum_number}<br>
                
                <b>Manufacturing Date:</b> ${analysis.manufacturing_date}<br>
                <b>Analysis Date:</b> ${analysis.analysis_date}<br>
                <b>Created By:</b> ${analysis.created_by}<br>
                <b>Updated By:</b> ${updated_by}<br>
                <b>Recommendations:</b><br>
                ${analysis.recommendations}<br><br>`;

            // Link
            var link =
                'The finalized New Oil Analysis Report is now available for your reference. ' +
                'Please use the link below to view the completed report:<br>' +
                `<a href="${process.env.REACT_CLIENT}/view-submitted-asset-no-asset?id=${analysis_id}">
                View Oil Analysis Report
                 </a><br><br>`;

            // Footer
            var footer =
                'The Oil Analysis Report has been successfully finalized and documented in accordance with the Asset Reliability workflow. ' +
                'Please retain this report for your records and implement any necessary follow-up actions as appropriate.<br><br>' +
                'For additional information or assistance regarding this report, please contact the Asset Reliability Monitoring Team.<br><br>' +
                'Thank you for your attention and cooperation.<br><br>' +
                'Best regards,<br><br>' +
                '<b>Asset Reliability Monitoring System</b>';

            // No Reply
            var norep =
                '<br><hr style="border:0; border-top:1px solid #d3d3d3;"><br>' +
                '<div style="color:#808080; font-size:12px; font-family:Arial, sans-serif; line-height:1.5;">' +
                '<b>This is an automated email from the Asset Reliability Monitoring System.</b><br>' +
                'Please do not reply to this email, as this mailbox is not monitored and responses will not be received.<br><br>' +
                'For assistance regarding this report or the final documentation process, please contact the Asset Reliability Monitoring Team through the appropriate support channels.<br><br>' +
                '&copy; ' + new Date().getFullYear() + ' Asset Reliability Monitoring System. All rights reserved.' +
                '</div>';

            var emailContent = start + body + link + footer + norep;

            // Email for all helpdesk personnel
            const mailOption = {
                from: process.env.EMAIL,
                to: level2_email,
                subject: `ARMS Notification - New Oil Analysis Report Completed - ${analysis.oil_batch_code}`,
                html: emailContent
            }
            await transporter.sendMail(mailOption);
            console.log('EEEEEEEEEEEEEEEEEEEEEMMMMMMMMMMMMMMMMMMAAAAAAAAAAAAAAAAAIIIIIIIIIIIILLLLLLLLLLLLLLLLLLLL SEEEEEEEEEEEEEEEENNNNNNNNNNNNNNNT')
        } catch (err) {
            console.log('UNABLE TO SEND EMAILLLLL!!!! : ', err)
        }



        res.status(200).json({
            message: 'Documentation uploaded successfully',
            oil_before: oilBeforePath,
            oil_after: oilAfterPath
        });

    } catch (err) {
        console.error('Unable to upload documentation report:', err);
        res.status(500).json({ error: 'Internal server error', message: err.message });
    }
});


router.post('/upload-documentation-report-assets', upload.fields([
    { name: 'asset_before', maxCount: 1 },
    { name: 'asset_after', maxCount: 1 }
]), async (req, res) => {
    const currentTimestamp = new Date();

    try {
        const { asset_analysis_id, results, actions, updated_by } = req.body;

        if (!asset_analysis_id) {
            return res.status(400).json({ error: 'asset_analysis_id is required.' });
        }

        const updateData = {
            results,
            actions,
            updated_by,
            updated_at: currentTimestamp
        };

        if (req.files?.['asset_before']?.[0]) {
            updateData.asset_before = `documentation/${req.files['asset_before'][0].filename}`;
        }
        if (req.files?.['asset_after']?.[0]) {
            updateData.asset_after = `documentation/${req.files['asset_after'][0].filename}`;
        }

        await knex('asset_analysis_master')
            .where('asset_analysis_id', asset_analysis_id)
            .update(updateData);

        await knex('asset_analysis_logs').insert({
            asset_analysis_id,
            changes_made: `${updated_by} submitted report documentation for analysis ID: ${asset_analysis_id}`,
            created_by: updated_by,
            created_at: currentTimestamp
        });

        console.log('@@@ TRIGGERED /upload-documentation-report-assets');

        //----------------------------------EMAIL FUNCTION----------------------------------------------
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                secure: false,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const level2_users = await knex('users_master').select('*').where('emp_position', 'l2');
            const level2_email = level2_users.map(email => email.emp_email);

            const analysis_report = await knex('asset_analysis_master').where('asset_analysis_id', asset_analysis_id).first();

            const asset = await knex('assets_master').where('asset_id', analysis_report.asset_id).first();

            // Start
            var start =
                'Good Day,<br><br>' +
                'This is to notify you that the <b>Asset Analysis Report</b> has been fully reviewed, approved, and finalized with the completion of the final documentation process. ' +
                'Please find the report details below for your reference.<br><br>';
            // Body
            var body =
                `<b>Report ID:</b> ${asset_analysis_id}<br>
                <b>Asset Name:</b> ${asset.asset_name}<br>
                <b>Asset Location:</b> ${asset.asset_location}<br>
                <b>Approved By:</b> ${updated_by} <br>
                <b>Recommendations:</b><br>
                ${analysis_report.recommendations}<br><br>`;

            // Link
            var link =
                'The finalized Asset Analysis Report is now available for your reference. ' +
                'Please use the link below to view the completed report:<br>' +
                `<a href="${process.env.REACT_CLIENT}/view-submitted-asset?id=${asset_analysis_id}">
                View Asset Analysis Report
                 </a><br><br>`;

            // Footer
            var footer =
                'The Asset Analysis Report has been successfully finalized and documented in accordance with the Asset Reliability workflow. ' +
                'Please retain this report for your records and implement any necessary follow-up actions as appropriate.<br><br>' +
                'For additional information or assistance regarding this report, please contact the Asset Reliability Monitoring Team.<br><br>' +
                'Thank you for your attention and cooperation.<br><br>' +
                'Best regards,<br><br>' +
                '<b>Asset Reliability Monitoring System</b>';

            // No Reply
            var norep =
                '<br><hr style="border:0; border-top:1px solid #d3d3d3;"><br>' +
                '<div style="color:#808080; font-size:12px; font-family:Arial, sans-serif; line-height:1.5;">' +
                '<b>This is an automated email from the Asset Reliability Monitoring System.</b><br>' +
                'Please do not reply to this email, as this mailbox is not monitored and responses will not be received.<br><br>' +
                'For assistance regarding this report or the final documentation process, please contact the Asset Reliability Monitoring Team through the appropriate support channels.<br><br>' +
                '&copy; ' + new Date().getFullYear() + ' Asset Reliability Monitoring System. All rights reserved.' +
                '</div>';

            var emailContent = start + body + link + footer + norep;

            // Email for all helpdesk personnel
            const mailOption = {
                from: process.env.EMAIL,
                to: level2_email,
                subject: `ARMS Notification - Asset Analysis Report Completed - ${asset.asset_name}`,
                html: emailContent
            }
            await transporter.sendMail(mailOption);
            console.log('EEEEEEEEEEEEEEEEEEEEEMMMMMMMMMMMMMMMMMMAAAAAAAAAAAAAAAAAIIIIIIIIIIIILLLLLLLLLLLLLLLLLLLL SEEEEEEEEEEEEEEEENNNNNNNNNNNNNNNT')
        } catch (err) {
            console.log('UNABLE TO SEND EMAILLLLL!!!! : ', err)
        }

        res.status(200).json({
            message: 'Report documentation saved successfully',
            asset_before: updateData.asset_before || null,
            asset_after: updateData.asset_after || null
        });

    } catch (err) {
        console.error('Unable to upload documentation report (assets):', err);
        res.status(500).json({ error: 'Internal server error', message: err.message });
    }
});



module.exports = router;