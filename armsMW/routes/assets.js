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

const Assets = db.define('assets_master', {
    asset_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    asset_name: {
        type: DataTypes.STRING
    },
    asset_type: {
        type: DataTypes.STRING
    },
    asset_location: {
        type: DataTypes.STRING
    },
    asset_category: {
        type: DataTypes.STRING
    },
    date_commisioning: {
        type: DataTypes.STRING
    },
    asset_notes: {
        type: DataTypes.STRING
    },
    has_components: {
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
}, {
    freezeTableName: false,
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    tableName: 'assets_master'
});


const AssetsComponents = db.define('assets_component_master', {
    asset_component_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    asset_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    asset_name: {
        type: DataTypes.STRING
    },
    asset_component_type: {
        type: DataTypes.STRING
    },
    asset_component_name: {
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
}, {
    freezeTableName: false,
    timestamps: false,
    createdAt: false,
    updatedAt: false,
    tableName: 'assets_component_master'
});




//Add Announcement
// router.post('/add-assets', async (req, res) => {
//     const currentTimestamp = new Date();
//     const { asset_name,
//         asset_type,
//         asset_location,
//         asset_category,
//         date_commisioning,
//         asset_notes,
//         created_by
//     } = req.body;

//     try {
//         const [add] = await knex('assets_master').insert({
//             asset_name,
//             asset_type,
//             asset_location,
//             asset_category,
//             date_commisioning,
//             asset_notes,
//             created_by,
//             created_at: currentTimestamp
//         }).returning('asset_id');

//         const asset_id = add.asset_id || add;

//         await knex('assets_logs').insert({
//             asset_id: asset_id,
//             changes_made: `${created_by} has added an asset.`,
//             created_at: currentTimestamp,
//             created_by: created_by
//         })

//         res.json(200);
//         console.log('triggered /add-anc')

//     } catch (err) {
//         console.log('INTERNAL ERROR UNABLE TO PUT ASSETS: ', err)
//     }

// });

router.post('/add-assets', async (req, res) => {
    const currentTimestamp = new Date();
    const {
        asset_name,
        asset_type,
        asset_location,
        asset_category,
        date_commisioning,
        asset_notes,
        created_by,
        components,
        has_components // Add this field
    } = req.body;

    try {
        // Start a transaction to ensure all operations succeed or fail together
        await knex.transaction(async (trx) => {
            // Insert into assets_master with has_components field
            const [add] = await trx('assets_master').insert({
                asset_name,
                asset_type,
                asset_location,
                asset_category,
                date_commisioning,
                asset_notes,
                created_by,
                is_active: '1',
                has_components: has_components || (components && components.length > 0 ? '1' : '0'), // Store 1 if components exist, else 0
                created_at: currentTimestamp
            }).returning('asset_id');

            const asset_id = add.asset_id || add;

            // Insert into assets_logs
            await trx('assets_logs').insert({
                asset_id: asset_id,
                changes_made: `${created_by} has added an asset.`,
                created_at: currentTimestamp,
                created_by: created_by
            });

            // Insert components if they exist
            if (components && components.length > 0) {
                // Prepare all component records for bulk insert
                const componentRecords = components.map(component => ({
                    asset_id: asset_id,
                    asset_name: asset_name,
                    asset_component_type: component.componentType,
                    asset_component_name: component.componentName,
                    created_by: created_by,
                    created_at: currentTimestamp
                }));

                // Bulk insert all components
                await trx('assets_component_master').insert(componentRecords);

                console.log(`Added ${components.length} components for asset ID: ${asset_id}`);
            }

            res.status(200).json({
                message: 'Asset added successfully',
                asset_id: asset_id,
                components_added: components ? components.length : 0,
                has_components: has_components || (components && components.length > 0 ? '1' : '0')
            });
            console.log('Asset added successfully:', asset_id);
        });

    } catch (err) {
        console.log('INTERNAL ERROR UNABLE TO ADD ASSET: ', err);
        res.status(500).json({
            error: 'Unable to add asset',
            details: err.message
        });
    }
});

router.get('/get-all-assets', async (req, res) => {
    try {
        const fetch = await knex('assets_master').select('*');
        res.json(fetch);
        console.log('triggered /get-all-assets')
    } catch (err) {
        console.log('INTERNAL ERROR, UNABLE TO FETCH ALL ASSETS', err)
    }
})

router.get('/get-all-components', async (req, res) => {
    try {
        const fetch = await knex('assets_component_master').select('*');
        res.json(fetch);
        console.log('triggered /get-all-components')
    } catch (err) {
        console.log('INTERNAL ERROR, UNABLE TO FETCH ALL ASSETS', err)
    }
})

router.get('/get-asset-component-by-id', async (req, res) => {
    try {
        // Get the component by ID
        const components = await AssetsComponents.findAll({
            where: {
                asset_component_id: req.query.id
            }
        });

        console.log('/get-asset-component-by-id was triggered.')
        res.json(components[0])
    } catch (err) {
        console.log('INTERNAL ERROR: ', err)
    }
})

router.get('/get-asset-by-id', async (req, res, next) => {
    try {
        // Get the asset by ID
        const assets = await Assets.findAll({
            where: {
                asset_id: req.query.id
            }
        });

        console.log('11111111111111111');
        console.log(assets);

        // Get the first asset from the array
        const asset = assets[0];

        // Initialize components array
        let components = [];
        let components_count = 0;

        // Only fetch components if has_components is '1'
        if (asset.has_components === '1') {
            console.log('Fetching components for asset...');

            components = await knex('assets_component_master')
                .where({ asset_id: req.query.id })
                .select(
                    'asset_component_id',
                    'asset_component_type as componentType',
                    'asset_component_name as componentName',
                    'created_by',
                    'created_at'
                )


            components_count = components.length;

            console.log(`Found ${components_count} components`);
        } else {
            console.log('Asset has no components (has_components = 0)');
        }

        // Combine asset with its components
        const assetWithComponents = {
            ...asset.dataValues, // Use dataValues to get the plain object from Sequelize model
            components: components,
            components_count: components_count
        };

        console.log('triggered /get-asset-by-id');
        res.json(assetWithComponents);

    } catch (err) {
        console.log('INTERNAL ERROR: ', err);
        res.status(500).json({
            error: 'Unable to fetch asset',
            details: err.message
        });
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

})

module.exports = router;