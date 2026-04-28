var express = require('express');
const multer = require('multer');
var bcrypt = require('bcrypt');
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

        await knex('asset_analysis_logs').insert({
            asset_analysis_id,
            changes_made: updated_by + ' updated criticality status of id: ' + asset_analysis_id + ' to ' + criticality_analysis_report,
            created_by: updated_by,
            created_at: currentTimestamp
        })

        res.status(200).json({ message: 'Updated successfully' });

    } catch (err) {
        console.log('Unable to update criticality: ', err)
    }
})

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

        res.status(200).json({ message: 'Updated successfully' });
    } catch (err) {
        console.log('Unable to update resampling schedule: ', err)
    }
});

// router.post('/update-severe-action', upload.array('documentation'), async (req, res) => {
//     const currentTimestamp = new Date();

//     try {
//         const {
//             asset_analysis_id,
//             severe_action,
//             documentation,
//             updated_by
//         } = req.body;

//         let documentationPath = null;
//         if (req.files && req.files.length > 0) {
//             documentationPath = req.files.map(file => file.path).join(';'); // Save multiple paths separated by ;
//         }

//         await knex('asset_analysis_master').where('asset_analysis_id', asset_analysis_id).update({
//             action_taken: severe_action,
//             documentation: documentation,
//             updated_by,
//             updated_at: currentTimestamp
//         });

//         await knex('asset_analysis_logs').insert({
//             asset_analysis_id,
//             changes_made: updated_by + ' updated resampling schedule of id: ' + asset_analysis_id,
//             created_by: updated_by,
//             created_at: currentTimestamp
//         })

//         res.status(200).json({ message: 'Updated successfully' });
//     } catch (err) {
//         console.log('Unable to update severe action: ', err)
//     }
// })
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
        })


        res.status(200).json({
            message: 'Updated successfully'
        });
    } catch (err) {
        console.log('Unable to update: ', err)
    }
})

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

        res.status(200).json({ message: 'Updated successfully' });

    } catch (err) {
        console.log('Unable to update to level2: ', err)
    }
})
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
        })

        res.status(200).json({ message: 'Updated successfully' });

    } catch (err) {
        console.log('Unable to update to level2: ', err)
    }
})

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

        res.status(200).json({ message: 'Updated successfully' });

    } catch (err) {
        console.log('Unable to update to level2: ', err)
    }
})

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

        res.json(200)

        console.log(option_asset_location)

    } catch (err) {
        console.log(err)
    }
});

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
        res.json(200)

    } catch (err) {
        console.log('UNABLE TO UPDATE OPTION: ', err)
    }
})

router.post('/delete-option', async (req, res) => {
    try {
        const {
            option_id
        } = req.body;
        await knex('option_master').where({ option_id: option_id }).del();
        res.json(200)
    } catch (err) {
        console.log('UNABLE TO DELETE OPTION: ', err)
    }
})

router.get('/get-all-options', async (req, res) => {
    try {
        const fetch = await knex('option_master').select('*');
        res.json(fetch);
        console.log('triggered-get-all-options')
    } catch (err) {
        console.log('UNABLE TO GET ALL OPTIONS: ', err);
    }
})


router.get('/get-option-by-id', async (req, res) => {
    try {
        const getbyID = await SetupOption.findAll({
            where: {
                option_id: req.query.id
            }
        })
        console.log('triggered /get-asset-by-id');
        res.json(getbyID[0])
    } catch (err) {
        console.log('UNABLE TO GET OPTION BY ID: ', err);
    }
})

// For individual wear metal items - returns the inserted ID
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
        res.status(200).json({
            success: true,
            id: id,
            message: 'Wear metal saved successfully'
        });
    } catch (err) {
        console.error(err);
    }
});

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
        res.status(200).json({
            success: true,
            id: id,
            message: 'contaminants saved successfully'
        });
    } catch (err) {
        console.error(err);
    }
});

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
        res.status(200).json({
            success: true,
            id: id,
            message: 'chem visco saved successfully'
        });
    } catch (err) {
        console.error(err);
    }
});

router.get('/get-all-options-master', async (req, res) => {
    try {
        const fetch = await knex('option_master').select('*');
        res.json(fetch);
        console.log('triggered-get-all-options-master')
    } catch (err) {
        console.log('UNABLE TO GET ALL OPTION MASTER: ', err)
    }
});

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

});

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
        console.log('Successfully added trivector');
    } catch (err) {
        console.log('UNABLE TO ADD TRIVECTOR: ', err)
        res.status(500).json({
            error: 'Failed to add trivector',
            details: err.message
        });
    }
})

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

router.get('/get-all-trivector', async (req, res) => {
    try {
        const fetch = await knex('option_trivector_master').select('*');
        res.json(fetch);
        console.log('triggered-get-all-trivector')
    } catch (err) {
        console.log('UNABLE TO GET TRIVECTOR BY ID: ', err);
    }
})

module.exports = router;