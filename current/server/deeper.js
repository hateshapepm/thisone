// ~/my/codes/deeplike/server/deeper.js

const express = require('express');
const router = express.Router();
const db = require('./db');
const {spawn} = require('child_process');

// Generic WHOIS handler for all types
const whoisTypes = {
    orgs: {
        coreTable: 'deeper_core_organizations',
        coreField: 'org',
        linkTable: 'deeper_whois_details',
        linkField: 'fk_org_id',
        category: 'org'
    },
    names: {
        coreTable: 'deeper_core_names',
        coreField: 'name',
        linkTable: 'deeper_whois_details',
        linkField: 'fk_name_id',
        category: 'name'
    },
    emails: {
        coreTable: 'deeper_core_emails',
        coreField: 'email',
        linkTable: 'deeper_whois_details',
        linkField: 'fk_email_id',
        category: 'email'
    },
    addresses: {
        coreTable: 'deeper_core_addresses',
        coreField: 'address',
        linkTable: 'deeper_whois_details',
        linkField: 'fk_address_id',
        category: 'address'
    },
    nameservers: {
        coreTable: 'deeper_core_nameservers',
        coreField: 'nameserver',
        linkTable: 'deeper_whois_details',
        linkField: 'fk_nameserver_id',
        category: 'nameserver'
    },
    phones: {
        coreTable: 'deeper_core_phones',
        coreField: 'phone',
        linkTable: 'deeper_whois_details',
        linkField: 'fk_phone_id',
        category: 'phone'
    },
};

// Generic RDAP handler for all types
const rdapTypes = {
    orgs: {
        coreTable: 'deeper_core_organizations',
        coreField: 'org',
        linkTable: 'deeper_rdap_details',
        linkField: 'fk_org_id',
        category: 'org'
    },
    names: {
        coreTable: 'deeper_core_names',
        coreField: 'name',
        linkTable: 'deeper_rdap_details',
        linkField: 'fk_name_id',
        category: 'name'
    },
    emails: {
        coreTable: 'deeper_core_emails',
        coreField: 'email',
        linkTable: 'deeper_rdap_details',
        linkField: 'fk_email_id',
        category: 'email'
    },
    addresses: {
        coreTable: 'deeper_core_addresses',
        coreField: 'address',
        linkTable: 'deeper_rdap_details',
        linkField: 'fk_address_id',
        category: 'address'
    },
    nameservers: {
        coreTable: 'deeper_core_nameservers',
        coreField: 'nameserver',
        linkTable: 'deeper_rdap_details',
        linkField: 'fk_nameserver_id',
        category: 'nameserver'
    },
    phones: {
        coreTable: 'deeper_core_phones',
        coreField: 'phone',
        linkTable: 'deeper_rdap_details',
        linkField: 'fk_phone_id',
        category: 'phone'
    },
    groups: {
        coreTable: 'deeper_core_groups',
        coreField: 'group_name',
        linkTable: 'deeper_rdap_details',
        linkField: 'fk_group_id',
        category: 'group'
    },
};

// Helper function to validate CIDR format
function validateCIDR(cidr) {
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    if (!cidrRegex.test(cidr)) return false;

    const [ip, prefix] = cidr.split('/');
    const octets = ip.split('.').map(Number);
    const prefixNum = parseInt(prefix, 10);

    if (octets.length !== 4 || prefixNum < 0 || prefixNum > 32) return false;
    return octets.every(octet => octet >= 0 && octet <= 255);
}

// Helper function to validate ASN format
function validateASN(asn) {
    const asnNum = parseInt(asn, 10);
    return !isNaN(asnNum) && asnNum >= 1 && asnNum <= 4294967295;
}

// Fetch all programs
router.get('/programs', async (req, res) => {
    try {
        const query = `
          SELECT id, program
          FROM shared_programs
          WHERE is_active = 1
          ORDER BY program ASC
        `;
        const [programs] = await db.query(query);
        res.json(programs);
    } catch (err) {
        console.error('Error fetching programs:', err.stack);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Fetch all ASNs with pagination and search
router.get('/asn', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;

    try {
        let countQuery = `
          SELECT COUNT(DISTINCT da.id) AS total
          FROM deeper_asn da
               JOIN shared_programs sp ON da.fk_programs_id = sp.id
               LEFT JOIN deeper_asn_metadatas dam ON da.id = dam.fk_asn_id
        `;

        let dataQuery = `
          SELECT da.id,
                 da.asn,
                 da.last_updated,
                 da.fk_programs_id,
                 sp.program                         AS program_name,
                 sp.fk_bb_site                      AS platform_id,
                 p.platform                         AS platform_name,
                 GROUP_CONCAT(DISTINCT dam.name)    AS names,
                 GROUP_CONCAT(DISTINCT dam.country) AS countries
          FROM deeper_asn da
               JOIN shared_programs sp ON da.fk_programs_id = sp.id
               LEFT JOIN shared_platforms p ON sp.fk_bb_site = p.id
               LEFT JOIN deeper_asn_metadatas dam ON da.id = dam.fk_asn_id
        `;

        const searchCondition = search
            ? ` WHERE (da.asn LIKE ? OR dam.country LIKE ? OR dam.name LIKE ? OR sp.program LIKE ?)`
            : '';
        const countParams = search ? [search, search, search, search] : [];
        const dataParams = search ? [search, search, search, search, limit, offset] : [limit, offset];

        countQuery += searchCondition;
        dataQuery += searchCondition + ` GROUP BY da.id, sp.program ORDER BY da.id DESC LIMIT ? OFFSET ?`;

        const [[countRow]] = await db.query(countQuery, countParams);
        const [dataRows] = await db.query(dataQuery, dataParams);

        const total = countRow.total || 0;

        // Process names and countries into arrays
        const enrichedData = dataRows.map(row => ({
            ...row,
            names: row.names ? row.names.split(',').filter(Boolean) : [],
            countries: row.countries ? row.countries.split(',').filter(Boolean) : []
        }));

        res.json({
            data: enrichedData,
            pagination: {
                total,
                current_page: page,
                total_pages: Math.max(1, Math.ceil(total / limit)),
                per_page: limit,
            },
        });
    } catch (err) {
        console.error('Error fetching ASNs:', err.stack);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Create a new ASN
router.post('/asn', async (req, res) => {
    const {asn, name, country, fk_programs_id} = req.body;

    if (!asn) {
        return res.status(400).json({success: false, error: 'ASN number is required'});
    }

    if (!fk_programs_id) {
        return res.status(400).json({success: false, error: 'Program ID is required'});
    }

    try {
        await db.query('START TRANSACTION');

        // Insert into deeper_asn
        const asnQuery = `
          INSERT INTO deeper_asn (asn, fk_programs_id, last_updated)
          VALUES (?, ?, NOW())
        `;
        const [asnResult] = await db.query(asnQuery, [asn, fk_programs_id]);

        const asnId = asnResult.insertId;

        // Insert into deeper_asn_metadatas if name or country is provided
        if (name || country) {
            const metadataQuery = `
              INSERT INTO deeper_asn_metadatas (source, name, country, is_ipv4, is_checked, is_inscope, fk_asn_id,
                                                fk_programs_id)
              VALUES ('manual', ?, ?, 1, 0, 0, ?, ?)
            `;
            await db.query(metadataQuery, [
                name || null,
                country || null,
                asnId,
                fk_programs_id
            ]);
        }

        await db.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'ASN created successfully',
            id: asnId,
        });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Error creating ASN:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Update an existing ASN
router.put('/asn/:id', async (req, res) => {
    const {id} = req.params;
    const {asn, name, country, fk_programs_id} = req.body;

    if (!asn) {
        return res.status(400).json({success: false, error: 'Valid ASN number is required'});
    }

    if (!fk_programs_id) {
        return res.status(400).json({success: false, error: 'Program ID is required'});
    }

    try {
        await db.query('START TRANSACTION');

        // Update deeper_asn
        const asnQuery = `
          UPDATE deeper_asn
          SET asn = ?,
              fk_programs_id = ?,
              last_updated = NOW()
          WHERE id = ?
        `;
        const [asnResult] = await db.query(asnQuery, [asn, fk_programs_id, id]);

        if (asnResult.affectedRows === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({success: false, error: 'ASN not found'});
        }

        // Update or insert into deeper_asn_metadatas for 'manual' source
        if (name || country) {
            const metadataQuery = `
              INSERT INTO deeper_asn_metadatas (source, name, country, is_ipv4, is_checked, is_inscope, fk_asn_id,
                                                fk_programs_id)
              VALUES ('manual', ?, ?, 1, 0, 0, ?, ?)
              ON DUPLICATE KEY UPDATE name = VALUES(name), country = VALUES(country)
            `;
            await db.query(metadataQuery, [name || null, country || null, id, fk_programs_id]);
        } else {
            // If no name or country provided, remove the 'manual' metadata entry (optional)
            await db.query(`
              DELETE
              FROM deeper_asn_metadatas
              WHERE fk_asn_id = ? AND source = 'manual'
            `, [id]);
        }

        await db.query('COMMIT');

        res.json({
            success: true,
            message: 'ASN updated successfully',
        });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Error updating ASN:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Delete an ASN
router.delete('/asn/:id', async (req, res) => {
    const {id} = req.params;

    try {
        await db.query('START TRANSACTION');

        // Delete dependent records in deeper_asn_metadatas
        await db.query('DELETE FROM deeper_asn_metadatas WHERE fk_asn_id = ?', [id]);

        // Delete dependent records in link_asn_cidr_ranges
        await db.query('DELETE FROM link_asn_cidr_ranges WHERE fk_asn_id = ?', [id]);

        // Delete dependent records in link_apex_asn
        await db.query('DELETE FROM link_apex_asn WHERE fk_asn_id = ?', [id]);

        // Delete the ASN itself
        const [result] = await db.query('DELETE FROM deeper_asn WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({success: false, error: 'ASN not found'});
        }

        await db.query('COMMIT');

        res.json({
            success: true,
            message: 'ASN deleted successfully',
        });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Error deleting ASN:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Fetch ASN metrics
router.get('/asn-metrics', async (req, res) => {
    try {
        const results = await Promise.all([
            db.query('SELECT COUNT(*) AS count FROM deeper_asn'),
            db.query(`
              SELECT COUNT(DISTINCT fk_asn_id) AS count
              FROM deeper_asn_metadatas
              WHERE name IS NOT NULL
            `),
            db.query(`
              SELECT COUNT(*) AS count
              FROM deeper_asn_metadatas
              WHERE name IS NOT NULL
            `),
            db.query(`
              SELECT COUNT(DISTINCT fk_asn_id) AS count
              FROM deeper_asn_metadatas
              WHERE country IS NOT NULL
            `),
            db.query(`
              SELECT MAX(cnt) AS max_count
              FROM (SELECT fk_asn_id, COUNT(*) AS cnt
              FROM deeper_asn_metadatas
              WHERE name IS NOT NULL
              GROUP BY fk_asn_id) AS counts
            `),
            db.query(`
              SELECT COUNT(*) AS count
              FROM deeper_asn
              WHERE DATE(last_updated) = CURDATE()
            `),
        ]);

        res.json({
            total_asns: results[0][0][0].count || 0,
            asns_with_names: results[1][0][0].count || 0,
            total_names: results[2][0][0].count || 0,
            asns_with_country: results[3][0][0].count || 0,
            most_names_for_single_asn: results[4][0][0].max_count || 0,
            added_today: results[5][0][0].count || 0,
        });
    } catch (err) {
        console.error('Error fetching ASN metrics:', err);
        res.status(500).json({
            error: 'Database error',
            details: err.message,
        });
    }
});

// --- CIDR Routes (for CIDR page) ---
// Fetch all CIDRs with pagination and search
router.get('/cidr', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;

    try {
        let countQuery = `
          SELECT COUNT(DISTINCT dcr.id) AS total
          FROM deeper_cidr_ranges dcr
               JOIN shared_programs sp ON dcr.fk_programs_id = sp.id
               LEFT JOIN deeper_cidr_ranges_metadatas dcrm ON dcr.id = dcrm.fk_cidr_ranges_id
        `;
        let dataQuery = `
          SELECT dcr.id,
                 dcr.cidr_range               AS cidr,
                 COALESCE(dcrm.is_ipv4, 1)    AS isIPv4,
                 COALESCE(dcrm.is_inscope, 0) AS isInScope,
                 dcr.fk_programs_id,
                 sp.program                   AS program_name,
                 sp.fk_bb_site                AS platform_id,
                 p.platform                   AS platform_name
          FROM deeper_cidr_ranges dcr
               JOIN shared_programs sp ON dcr.fk_programs_id = sp.id
               LEFT JOIN shared_platforms p ON sp.fk_bb_site = p.id
               LEFT JOIN deeper_cidr_ranges_metadatas dcrm ON dcr.id = dcrm.fk_cidr_ranges_id
        `;

        const searchCondition = search
            ? ` WHERE (dcr.cidr_range LIKE ? OR sp.program LIKE ?)`
            : '';
        const countParams = search ? [search, search] : [];
        const dataParams = search ? [search, search, limit, offset] : [limit, offset];

        countQuery += searchCondition;
        dataQuery += searchCondition + ` GROUP BY dcr.id, sp.program ORDER BY dcr.id DESC LIMIT ? OFFSET ?`;

        const [[countRow]] = await db.query(countQuery, countParams);
        const [dataRows] = await db.query(dataQuery, dataParams);

        const total = countRow.total || 0;

        res.json({
            data: dataRows,
            pagination: {
                total,
                current_page: page,
                total_pages: Math.max(1, Math.ceil(total / limit)),
                per_page: limit,
            },
        });
    } catch (error) {
        console.error('Error fetching CIDRs:', error);
        res.status(500).json({error: 'Internal server error'});
    }
});

// Create a new CIDR range
router.post('/cidr', async (req, res) => {
    const {cidr_range, cidr_range_ipv4, cidr_range_inscope, fk_programs_id} = req.body;

    if (!cidr_range) {
        return res.status(400).json({success: false, error: 'CIDR range is required'});
    }

    if (!fk_programs_id) {
        return res.status(400).json({success: false, error: 'Program ID is required'});
    }

    try {
        await db.query('START TRANSACTION');

        const [cidrResult] = await db.query(`
          INSERT INTO deeper_cidr_ranges (cidr_range, fk_programs_id)
          VALUES (?, ?)
        `, [cidr_range, fk_programs_id]);

        const cidrId = cidrResult.insertId;

        await db.query(`
          INSERT INTO deeper_cidr_ranges_metadatas (source, is_ipv4, is_inscope, fk_cidr_ranges_id, fk_programs_id)
          VALUES ('manual', ?, ?, ?, ?)
        `, [cidr_range_ipv4 ? 1 : 0, cidr_range_inscope ? 1 : 0, cidrId, fk_programs_id]);

        await db.query('COMMIT');

        res.status(201).json({success: true, message: 'CIDR created successfully', cidrId});
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error creating CIDR:', error);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
});

// Update a CIDR range
router.put('/cidr/:id', async (req, res) => {
    const {id} = req.params;
    const {cidr_range, cidr_range_ipv4, cidr_range_inscope, fk_programs_id} = req.body;

    if (!cidr_range) {
        return res.status(400).json({success: false, error: 'CIDR range is required'});
    }

    if (!fk_programs_id) {
        return res.status(400).json({success: false, error: 'Program ID is required'});
    }

    try {
        await db.query('START TRANSACTION');

        const [cidrResult] = await db.query(`
          UPDATE deeper_cidr_ranges
          SET cidr_range = ?,
              fk_programs_id = ?
          WHERE id = ?
        `, [cidr_range, fk_programs_id, id]);

        if (cidrResult.affectedRows === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({success: false, error: 'CIDR not found'});
        }

        await db.query(`
          INSERT INTO deeper_cidr_ranges_metadatas (source, is_ipv4, is_inscope, fk_cidr_ranges_id, fk_programs_id)
          VALUES ('manual', ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE is_ipv4 = VALUES(is_ipv4), is_inscope = VALUES(is_inscope)
        `, [cidr_range_ipv4 ? 1 : 0, cidr_range_inscope ? 1 : 0, id, fk_programs_id]);

        await db.query('COMMIT');

        res.json({success: true, message: 'CIDR updated successfully'});
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error updating CIDR:', error);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
});

// Delete a CIDR range
router.delete('/cidr/:id', async (req, res) => {
    const {id} = req.params;

    try {
        // Start transaction to handle related records
        await db.query('START TRANSACTION');

        // Delete metadata (includes name and country)
        await db.query('DELETE FROM deeper_cidr_ranges_metadatas WHERE fk_cidr_ranges_id = ?', [id]);

        // Delete related records in link_asn_cidr_ranges
        await db.query('DELETE FROM link_asn_cidr_ranges WHERE fk_cidr_ranges_id = ?', [id]);

        // Delete related records in link_apex_cidr_ranges
        await db.query('DELETE FROM link_apex_cidr_ranges WHERE fk_cidr_ranges_id = ?', [id]);

        // Delete the CIDR range itself
        const [result] = await db.query('DELETE FROM deeper_cidr_ranges WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({success: false, error: 'CIDR not found'});
        }

        await db.query('COMMIT');

        res.json({
            success: true,
            message: 'CIDR deleted successfully',
        });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Error deleting CIDR:', error);
        res.status(500).json({success: false, error: 'Internal server error'});
    }
});

// Fetch CIDR metrics
router.get('/cidr-metrics', async (req, res) => {
    try {
        const results = await Promise.all([
            db.query('SELECT COUNT(*) AS count FROM deeper_cidr_ranges'),
            db.query(`
              SELECT COUNT(*) AS count
              FROM deeper_cidr_ranges_metadatas
              WHERE is_ipv4 = 1
            `),
            db.query(`
              SELECT COUNT(*) AS count
              FROM deeper_cidr_ranges_metadatas
              WHERE is_ipv4 = 0
            `),
            db.query(`
              SELECT COUNT(*) AS count
              FROM deeper_cidr_ranges_metadatas
              WHERE is_inscope = 1
            `),
        ]);

        res.json({
            total_cidr_ranges: results[0][0][0].count || 0,
            ipv4_cidr_ranges: results[1][0][0].count || 0,
            ipv6_cidr_ranges: results[2][0][0].count || 0,
            inscope_cidr_ranges: results[3][0][0].count || 0,
        });
    } catch (err) {
        console.error('Error fetching CIDR metrics:', err);
        res.status(500).json({
            error: 'Database error',
            details: err.message,
        });
    }
});

// --- RDAP Routes (for RDAP page) ---
// Fetch all RDAP orgs (normalized)
router.get('/rdap', async (req, res) => {
    try {
        const {page = 1, limit = 10, search = '', programId} = req.query;
        const offset = (page - 1) * limit;
        // Normalized: join deeper_core_organizations and deeper_rdap_details
        const orgsQuery = `
          SELECT o.id,
                 'orgs'       AS type,
                 o.org        AS value,
                 d.fk_programs_id,
                 p.program,
                 plt.platform AS platform_name
          FROM deeper_core_organizations o
               JOIN deeper_rdap_details d ON d.fk_org_id = o.id AND d.category = 'org'
               JOIN shared_programs p ON d.fk_programs_id = p.id
               LEFT JOIN shared_platforms plt ON p.fk_bb_site = plt.id
          WHERE 1 = 1
            ${programId ? 'AND d.fk_programs_id = ?' : ''} ${search ? 'AND o.org LIKE ?' : ''}
          ORDER BY d.fk_programs_id, o.org
          LIMIT ? OFFSET ?
        `;
        const countOrgsQuery = `
          SELECT COUNT(*) AS total
          FROM deeper_core_organizations o
               JOIN deeper_rdap_details d ON d.fk_org_id = o.id AND d.category = 'org'
               JOIN shared_programs p ON d.fk_programs_id = p.id
          WHERE 1 = 1
            ${programId ? 'AND d.fk_programs_id = ?' : ''} ${search ? 'AND o.org LIKE ?' : ''}
        `;
        const searchParam = `%${search}%`;
        const orgsParams = programId ? [programId, ...(search ? [searchParam] : []), parseInt(limit), offset] : [...(search ? [searchParam] : []), parseInt(limit), offset];
        const countParams = programId ? [programId, ...(search ? [searchParam] : [])] : [...(search ? [searchParam] : [])];
        const [orgsData] = await db.query(orgsQuery, orgsParams);
        const [countResult] = await db.query(countOrgsQuery, countParams);
        res.json({
            success: true,
            data: orgsData,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(countResult[0].total / limit),
                total: countResult[0].total,
            },
        });
    } catch (err) {
        console.error('Error fetching RDAP data:', err);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Create a new RDAP record
router.post('/rdap', async (req, res) => {
    const {type, value, fk_programs_id, fk_org_id} = req.body;
    if (!type || !rdapTypes[type]) {
        return res.status(400).json({error: 'Invalid RDAP type. Must be one of: orgs, names, emails, addresses, nameservers, phones, groups'});
    }
    if (!value || typeof value !== 'string' || value.trim() === '') {
        return res.status(400).json({success: false, error: 'Value must be a non-empty string'});
    }
    if (!fk_programs_id) {
        return res.status(400).json({success: false, error: 'fk_programs_id is required'});
    }

    // For non-org types, fk_org_id is required to establish relationship
    if (type !== 'orgs' && !fk_org_id) {
        return res.status(400).json({success: false, error: 'fk_org_id is required for non-organization types'});
    }

    const {coreTable, coreField, linkTable, linkField, category} = rdapTypes[type];

    try {
        // Start a transaction
        await db.query('START TRANSACTION');

        if (type === 'orgs') {
            // Insert or find the organization
            const [checkResult] = await db.query(
                `SELECT id
                FROM ${coreTable}
                WHERE ${coreField} = ? AND fk_programs_id = ?`,
                [value, fk_programs_id]
            );
            let coreId;

            if (checkResult.length > 0) {
                coreId = checkResult[0].id;
                console.log(`[RDAP] Found existing ${type} with ID: ${coreId}`);
            } else {
                const [insertResult] = await db.query(
                    `INSERT INTO ${coreTable} (${coreField}, fk_programs_id)
                    VALUES (?, ?)`,
                    [value, fk_programs_id]
                );
                coreId = insertResult.insertId;
                console.log(`[RDAP] Created new ${type} with ID: ${coreId}`);
            }

            // Create link record for organization
            const [linkResult] = await db.query(
                `INSERT INTO ${linkTable} (category, ${linkField}, fk_programs_id)
                VALUES (?, ?, ?)`,
                [category, coreId, fk_programs_id]
            );

            await db.query('COMMIT');
            res.status(201).json({
                success: true,
                message: `RDAP ${type.slice(0, -1)} created successfully`,
                id: coreId
            });
        } else {
            // Handle non-org types
            // First check if the org exists
            const [orgCheck] = await db.query(`SELECT id
            FROM deeper_core_organizations
            WHERE id = ?`, [fk_org_id]);
            if (orgCheck.length === 0) {
                await db.query('ROLLBACK');
                return res.status(400).json({success: false, error: 'Organization not found'});
            }

            // Insert or find the core record (name, email, etc.)
            console.log(`[RDAP] Inserting into ${coreTable} ${coreField} ${value}`);
            const [checkResult] = await db.query(`SELECT id
            FROM ${coreTable}
            WHERE ${coreField} = ?`, [value]);
            let coreRow;

            if (checkResult.length > 0) {
                coreRow = checkResult[0];
                console.log(`[RDAP] Found existing ${type} with ID: ${coreRow.id}`);
            } else {
                // Include fk_programs_id in the core table insert
                const [insertResult] = await db.query(
                    `INSERT INTO ${coreTable} (${coreField}, fk_programs_id)
                    VALUES (?, ?)`,
                    [value, fk_programs_id]
                );
                coreRow = {id: insertResult.insertId};
                console.log(`[RDAP] Selected coreRow: ${JSON.stringify(coreRow)}`);
            }

            // Create the entity record without org reference
            try {
                // Generic approach for all types using dynamic SQL construction
                // We create a record that links only the specific entity type
                const fields = ['category', linkField, 'fk_programs_id'];
                const values = [category, coreRow.id, fk_programs_id];
                const placeholders = Array(fields.length).fill('?').join(', ');

                const insertSQL = `INSERT INTO ${linkTable} (${fields.join(', ')})
                VALUES (${placeholders})`;
                await db.query(insertSQL, values);

                // Now we need to create the relationship between org and this entity
                // This would be done in a join/relation table if it exists

                // For RDAP, we use the related table structure to reference from related item back to org
                const relatedSql = `
                  SELECT id
                  FROM ${linkTable}
                  WHERE category = ? AND ${linkField} = ? AND fk_programs_id = ?
                `;
                const [relatedResult] = await db.query(relatedSql, [category, coreRow.id, fk_programs_id]);

                if (relatedResult.length > 0) {
                    const entityId = relatedResult[0].id;

                    // Now update the entity to link it to the organization
                    // This uses a special relation field specific to each category
                    const updateSql = `
                      UPDATE ${linkTable}
                      SET fk_org_id = ?
                      WHERE id = ?
                    `;
                    await db.query(updateSql, [fk_org_id, entityId]);
                }

                await db.query('COMMIT');
                res.status(201).json({
                    success: true,
                    message: `RDAP ${type.slice(0, -1)} created successfully`,
                    id: coreRow.id
                });
            } catch (error) {
                console.error(`Error creating RDAP ${type} record:`, error);
                await db.query('ROLLBACK');
                return res.status(500).json({success: false, error: error.message || 'Database error'});
            }
        }
    } catch (err) {
        console.error(`Error in RDAP ${type} creation:`, err);
        try {
            await db.query('ROLLBACK');
        } catch (rollbackErr) {
            console.error('Error during rollback:', rollbackErr);
        }
        return res.status(500).json({
            success: false,
            error: err.message || 'An error occurred during record creation',
        });
    }
});

router.get('/whois', async (req, res) => {
    try {
        const {page = 1, limit = 10, search = '', programId} = req.query;
        const offset = (page - 1) * limit;
        // Normalized: join deeper_core_organizations and deeper_whois_details
        const orgsQuery = `
          SELECT o.id,
                 'orgs'       AS type,
                 o.org        AS value,
                 d.fk_programs_id,
                 p.program,
                 plt.platform AS platform_name
          FROM deeper_core_organizations o
               JOIN deeper_whois_details d ON d.fk_org_id = o.id AND d.category = 'org'
               JOIN shared_programs p ON d.fk_programs_id = p.id
               LEFT JOIN shared_platforms plt ON p.fk_bb_site = plt.id
          WHERE 1 = 1
            ${programId ? 'AND d.fk_programs_id = ?' : ''} ${search ? 'AND o.org LIKE ?' : ''}
          ORDER BY d.fk_programs_id, o.org
          LIMIT ? OFFSET ?
        `;
        const countOrgsQuery = `
          SELECT COUNT(*) AS total
          FROM deeper_core_organizations o
               JOIN deeper_whois_details d ON d.fk_org_id = o.id AND d.category = 'org'
               JOIN shared_programs p ON d.fk_programs_id = p.id
          WHERE 1 = 1
            ${programId ? 'AND d.fk_programs_id = ?' : ''} ${search ? 'AND o.org LIKE ?' : ''}
        `;
        const searchParam = `%${search}%`;
        const orgsParams = programId ? [programId, ...(search ? [searchParam] : []), parseInt(limit), offset] : [...(search ? [searchParam] : []), parseInt(limit), offset];
        const countParams = programId ? [programId, ...(search ? [searchParam] : [])] : [...(search ? [searchParam] : [])];
        const [orgsData] = await db.query(orgsQuery, orgsParams);
        const [countResult] = await db.query(countOrgsQuery, countParams);
        // Step 2: For each org, fetch all its related items
        const orgsWithRelated = await Promise.all(orgsData.map(async (org) => {
            // Fetch all related items for this org from normalized tables
            const queries = [];
            // Names
            queries.push(db.query(`
              SELECT n.id, 'names' AS type, n.name AS value
              FROM deeper_core_names n
                   JOIN deeper_whois_details d ON d.fk_name_id = n.id AND d.category = 'name'
              WHERE d.fk_programs_id = ? AND d.fk_org_id = ?
            `, [org.fk_programs_id, org.id]));
            // Emails
            queries.push(db.query(`
              SELECT e.id, 'emails' AS type, e.email AS value
              FROM deeper_core_emails e
                   JOIN deeper_whois_details d ON d.fk_email_id = e.id AND d.category = 'email'
              WHERE d.fk_programs_id = ? AND d.fk_org_id = ?
            `, [org.fk_programs_id, org.id]));
            // Addresses
            queries.push(db.query(`
              SELECT a.id, 'addresses' AS type, a.address AS value
              FROM deeper_core_addresses a
                   JOIN deeper_whois_details d ON d.fk_address_id = a.id AND d.category = 'address'
              WHERE d.fk_programs_id = ? AND d.fk_org_id = ?
            `, [org.fk_programs_id, org.id]));
            // Nameservers
            queries.push(db.query(`
              SELECT ns.id, 'nameservers' AS type, ns.nameserver AS value
              FROM deeper_core_nameservers ns
                   JOIN deeper_whois_details d ON d.fk_nameserver_id = ns.id AND d.category = 'nameserver'
              WHERE d.fk_programs_id = ? AND d.fk_org_id = ?
            `, [org.fk_programs_id, org.id]));
            // Phones
            queries.push(db.query(`
              SELECT p.id, 'phones' AS type, p.phone AS value
              FROM deeper_core_phones p
                   JOIN deeper_whois_details d ON d.fk_phone_id = p.id AND d.category = 'phone'
              WHERE d.fk_programs_id = ? AND d.fk_org_id = ?
            `, [org.fk_programs_id, org.id]));
            const results = await Promise.all(queries);
            const relatedItems = [
                ...results[0][0], // names
                ...results[1][0], // emails
                ...results[2][0], // addresses
                ...results[3][0], // nameservers
                ...results[4][0]  // phones
            ];
            return {
                ...org,
                related: relatedItems
            };
        }));
        res.json({
            success: true,
            data: orgsWithRelated,
            pagination: {
                current_page: parseInt(page),
                total_pages: Math.ceil(countResult[0].total / limit),
                total: countResult[0].total,
            },
        });
    } catch (err) {
        console.error('Error fetching WHOIS data:', err);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Update WHOIS item
router.put('/whois/:type/:id', async (req, res) => {
    const {type, id} = req.params;
    const {value, fk_programs_id} = req.body;
    if (!type || !whoisTypes[type]) {
        return res.status(400).json({error: 'Invalid WHOIS type'});
    }
    if (!id || !value || !fk_programs_id) {
        return res.status(400).json({error: 'ID, value, and fk_programs_id are required'});
    }
    const {coreTable, coreField} = whoisTypes[type];
    try {
        let query, params;
        if (type === 'orgs') {
            query = `UPDATE ${coreTable}
            SET ${coreField} = ?
            WHERE id = ? AND fk_programs_id = ?`;
            params = [value, id, fk_programs_id];
        } else {
            query = `UPDATE ${coreTable}
            SET ${coreField} = ?
            WHERE id = ?`;
            params = [value, id];
        }
        const [result] = await db.query(query, params);
        if (result.affectedRows === 0) {
            // Check if the value is already the same (no change)
            let checkQuery, checkParams;
            if (type === 'orgs') {
                checkQuery = `SELECT ${coreField}
                FROM ${coreTable}
                WHERE id = ? AND fk_programs_id = ?`;
                checkParams = [id, fk_programs_id];
            } else {
                checkQuery = `SELECT ${coreField}
                FROM ${coreTable}
                WHERE id = ?`;
                checkParams = [id];
            }
            const [[row]] = await db.query(checkQuery, checkParams);
            if (row && row[coreField] === value) {
                return res.status(200).json({success: true, message: 'No changes made (value is already the same)'});
            } else {
                return res.status(404).json({error: `${type.slice(0, -1)} not found or duplicate value`});
            }
        }
        res.json({success: true, message: `${type.slice(0, -1)} updated successfully`});
    } catch (err) {
        // Duplicate key error
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({error: 'Duplicate organization name for this program'});
        }
        console.error(`Error updating WHOIS ${type}:`, err);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Delete WHOIS item
router.delete('/whois/:type/:id', async (req, res) => {
    const {type, id} = req.params;
    const {fk_programs_id} = req.query;
    if (!type || !whoisTypes[type]) {
        return res.status(400).json({error: 'Invalid WHOIS type'});
    }
    if (!fk_programs_id) {
        return res.status(400).json({error: 'fk_programs_id is required'});
    }
    const {linkTable, linkField, category} = whoisTypes[type];
    try {
        // If deleting an org, also delete all related link records for that org/program
        if (type === 'orgs') {
            // Remove all links to names, emails, addresses, nameservers, phones for this org/program
            await db.query(`DELETE
            FROM deeper_whois_details
            WHERE fk_org_id = ? AND fk_programs_id = ?`, [id, fk_programs_id]);
        }
        // Delete the main link record (org or other type)
        const [result] = await db.query(`DELETE
        FROM ${linkTable}
        WHERE category = ? AND ${linkField} = ? AND fk_programs_id = ?`, [category, id, fk_programs_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({error: `${type.slice(0, -1)} not found`});
        }
        res.json({success: true, message: `${type.slice(0, -1)} deleted successfully`});
    } catch (err) {
        console.error(`Error deleting WHOIS ${type}:`, err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// --- Whois Metrics (normalized) ---
router.get('/whois-metrics', async (req, res) => {
    try {
        const queries = [
            "SELECT COUNT(DISTINCT d.fk_org_id) AS count FROM deeper_whois_details d WHERE d.category = 'org'",
            "SELECT COUNT(DISTINCT d.fk_name_id) AS count FROM deeper_whois_details d WHERE d.category = 'name'",
            "SELECT COUNT(DISTINCT d.fk_email_id) AS count FROM deeper_whois_details d WHERE d.category = 'email'",
            "SELECT COUNT(DISTINCT d.fk_address_id) AS count FROM deeper_whois_details d WHERE d.category = 'address'",
            "SELECT COUNT(DISTINCT d.fk_nameserver_id) AS count FROM deeper_whois_details d WHERE d.category = 'nameserver'"
        ];
        const results = await Promise.all(queries.map((query) => db.query(query)));
        res.json({
            orgs: results[0][0][0]?.count || 0,
            names: results[1][0][0]?.count || 0,
            emails: results[2][0][0]?.count || 0,
            addresses: results[3][0][0]?.count || 0,
            nameservers: results[4][0][0]?.count || 0
        });
    } catch (err) {
        console.error('Error fetching WHOIS metrics:', err);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Get dashboard metrics
router.get('/dashboard-metrics', async (req, res) => {
    try {
        const category = req.query.category || 'all';

        // Base queries without WHERE clauses
        let whereClause = '';
        if (category !== 'all') {
            if (category === 'domain') {
                whereClause = "WHERE type = 'domain'";
            } else if (category === 'subdomain') {
                whereClause = "WHERE type = 'subdomain'";
            } else if (category === 'ip') {
                whereClause = "WHERE type = 'ip'";
            } else if (category === 'url') {
                whereClause = "WHERE type = 'url'";
            }
        }

        const results = await Promise.all([
            // Total unviewed discoveries
            db.query(`
              SELECT COUNT(*) AS count
              FROM (SELECT id, 'domain' AS type
              FROM deeper_possible_apex_domains
              WHERE viewed = 0
              UNION ALL
              SELECT id, 'subdomain' AS type
              FROM deeper_subdomains
              WHERE viewed = 0
              UNION ALL
              SELECT id, 'ip' AS type
              FROM deeper_cidr_ranges
              WHERE viewed = 0
              UNION ALL
              SELECT id, 'url' AS type
              FROM deeper_urls
              WHERE viewed = 0) AS combined ${whereClause}
            `),

            // New domains in the last 7 days
            db.query(`
              SELECT COUNT(*) AS count
              FROM deeper_possible_apex_domains ${category === 'all' || category === 'domain' ? 'WHERE discovery_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)' : 'WHERE 1=0'}
            `),

            // New subdomains in the last 7 days
            db.query(`
              SELECT COUNT(*) AS count
              FROM deeper_subdomains ${category === 'all' || category === 'subdomain' ? 'WHERE discovery_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)' : 'WHERE 1=0'}
            `),

            db.query(`
              SELECT COUNT(*) AS count
              FROM deeper_cidr_ranges ${category === 'all' || category === 'ip' ? 'WHERE viewed = 0' : 'WHERE 1=0'}
            `),

            db.query(`
              SELECT COUNT(*) AS count
              FROM deeper_urls ${category === 'all' || category === 'url' ? 'WHERE viewed = 0' : 'WHERE 1=0'}
            `),

            // Total discoveries
            db.query(`
              SELECT COUNT(*) AS count
              FROM (SELECT id, 'domain' AS type
              FROM deeper_possible_apex_domains
              UNION ALL
              SELECT id, 'subdomain' AS type
              FROM deeper_subdomains
              UNION ALL
              SELECT id, 'ip' AS type
              FROM deeper_cidr_ranges
              UNION ALL
              SELECT id, 'url' AS type
              FROM deeper_urls) AS combined ${whereClause}
            `),

        ]);

        res.json({
            unviewed_alerts: results[0][0][0].count || 0,
            new_domains: results[1][0][0].count || 0,
            new_subdomains: results[2][0][0].count || 0,
            new_ips: results[3][0][0].count || 0,
            active_scans: results[5][0][0].count || 0,
            total_discoveries: results[4][0][0].count || 0,
        });
    } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
        res.status(500).json({
            error: 'Database error',
            details: err.message,
        });
    }
});

// Fetch all possible apex domains with pagination and search
router.get('/possible-apex-domains', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;

    try {
        let countQuery = `
          SELECT COUNT(*) AS total
          FROM deeper_possible_apex_domains d
               JOIN shared_programs p ON d.fk_programs_id = p.id
        `;

        let dataQuery = `
          SELECT d.id,
                 d.apex_domain,
                 d.viewed,
                 d.status,
                 d.fk_programs_id,
                 p.program    AS program_name,
                 plt.platform AS platform_name
          FROM deeper_possible_apex_domains d
               JOIN shared_programs p ON d.fk_programs_id = p.id
               LEFT JOIN shared_platforms plt ON p.fk_bb_site = plt.id
        `;

        const searchCondition = search
            ? ` WHERE (d.apex_domain LIKE ? OR p.program LIKE ?)`
            : '';
        const countParams = search ? [search, search] : [];
        const dataParams = search ? [search, search, limit, offset] : [limit, offset];

        countQuery += searchCondition;
        dataQuery += searchCondition + ` ORDER BY d.id DESC LIMIT ? OFFSET ?`;

        const [[countRow]] = await db.query(countQuery, countParams);
        const [dataRows] = await db.query(dataQuery, dataParams);

        const total = countRow.total || 0;

        res.json({
            data: dataRows,
            pagination: {
                total,
                current_page: page,
                total_pages: Math.max(1, Math.ceil(total / limit)),
                per_page: limit,
            },
        });
    } catch (err) {
        console.error('Error fetching possible apex domains:', err.stack);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Create a new possible apex domain
router.post('/possible-apex-domains', async (req, res) => {
    const {apex_domain, viewed, status, fk_programs_id} = req.body;

    if (!apex_domain || !fk_programs_id) {
        return res.status(400).json({success: false, error: 'Apex domain and program ID are required'});
    }

    try {
        const query = `
          INSERT INTO deeper_possible_apex_domains (apex_domain, viewed, status, fk_programs_id, discovery_date)
          VALUES (?, ?, ?, ?, NOW())
        `;

        const [result] = await db.query(query, [
            apex_domain,
            viewed || 0,
            status || 0,
            fk_programs_id
        ]);

        res.status(201).json({
            success: true,
            message: 'Possible apex domain created successfully',
            id: result.insertId,
        });
    } catch (err) {
        console.error('Error creating possible apex domain:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Update an existing possible apex domain
router.put('/possible-apex-domains/:id', async (req, res) => {
    const {id} = req.params;
    const {apex_domain, viewed, status, fk_programs_id} = req.body;

    if (!apex_domain || !fk_programs_id) {
        return res.status(400).json({success: false, error: 'Apex domain and program ID are required'});
    }

    try {
        const query = `
          UPDATE deeper_possible_apex_domains
          SET apex_domain = ?,
              viewed = ?,
              status = ?,
              fk_programs_id = ?,
              last_updated = NOW()
          WHERE id = ?
        `;

        const [result] = await db.query(query, [
            apex_domain,
            viewed !== undefined ? viewed : 0,
            status !== undefined ? status : 0,
            fk_programs_id,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({success: false, error: 'Possible apex domain not found'});
        }

        res.json({
            success: true,
            message: 'Possible apex domain updated successfully',
        });
    } catch (err) {
        console.error('Error updating possible apex domain:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Delete a possible apex domain
router.delete('/possible-apex-domains/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const [result] = await db.query('DELETE FROM deeper_possible_apex_domains WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({success: false, error: 'Possible apex domain not found'});
        }

        res.json({
            success: true,
            message: 'Possible apex domain deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting possible apex domain:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Fetch alerts with pagination and search
router.get('/alerts', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;
    const category = req.query.category || 'all';

    try {
        let countQuery = '';
        let dataQuery = '';
        let countParams = [];
        let dataParams = [];

        // Build queries based on category
        if (category === 'all' || category === 'domain') {
            // For domains
            const domainCountQuery = `
              SELECT COUNT(*) AS count
              FROM deeper_possible_apex_domains d
                   JOIN shared_programs p ON d.fk_programs_id = p.id
              WHERE d.viewed = 0 ${search ? 'AND d.apex_domain LIKE ?' : ''}
            `;

            // Remove individual LIMIT/OFFSET for 'all' category
            const domainDataQuery = `(
          SELECT d.id,
                 'domain'      AS type,
                 d.apex_domain AS value,
                 p.program,
                 d.discovery_date,
                 NULL          AS details,
                 d.viewed,
                 plt.platform  AS platform_name
          FROM deeper_possible_apex_domains d
               JOIN shared_programs p ON d.fk_programs_id = p.id
               LEFT JOIN shared_platforms plt ON p.fk_bb_site = plt.id
          WHERE d.viewed = 0 ${search ? 'AND d.apex_domain LIKE ?' : ''}
          ORDER BY d.discovery_date DESC
        )`;

            if (search) {
                countParams.push(search);
                dataParams.push(search);
            }

            if (countQuery) countQuery += ' UNION ALL ';
            countQuery += domainCountQuery;

            if (dataQuery) dataQuery += ' UNION ALL ';
            dataQuery += domainDataQuery;
        }

        if (category === 'all' || category === 'subdomain') {
            // For subdomains
            const subdomainCountQuery = `
              SELECT COUNT(*) AS count
              FROM deeper_subdomains s
                   JOIN shared_program_apex_domains a ON s.fk_apex_domains_id = a.id
                   JOIN shared_programs p ON a.fk_programs_id = p.id
              WHERE s.viewed = 0 ${search ? 'AND s.subdomain LIKE ?' : ''}
            `;

            // Remove individual LIMIT/OFFSET for 'all' category
            const subdomainDataQuery = `(
          SELECT s.id,
                 'subdomain'                                     AS type,
                 s.subdomain                                     AS value,
                 p.program,
                 s.discovery_date,
                 CONCAT('IP: ', IFNULL(s.ip_address, 'Unknown')) AS details,
                 s.viewed,
                 plt.platform                                     AS platform_name
          FROM deeper_subdomains s
               JOIN shared_program_apex_domains a ON s.fk_apex_domains_id = a.id
               JOIN shared_programs p ON a.fk_programs_id = p.id
               LEFT JOIN shared_platforms plt ON p.fk_bb_site = plt.id
          WHERE s.viewed = 0 ${search ? 'AND s.subdomain LIKE ?' : ''}
          ORDER BY s.discovery_date DESC
        )`;

            if (search) {
                countParams.push(search);
                dataParams.push(search);
            }

            if (countQuery) countQuery += ' UNION ALL ';
            countQuery += subdomainCountQuery;

            if (dataQuery) dataQuery += ' UNION ALL ';
            dataQuery += subdomainDataQuery;
        }

        if (category === 'all' || category === 'ip') {
            // For IPs/CIDR
            const cidrCountQuery = `
              SELECT COUNT(*) AS count
              FROM deeper_cidr_ranges c
                   JOIN shared_programs p ON c.fk_programs_id = p.id
              WHERE c.viewed = 0 ${search ? 'AND c.cidr_range LIKE ?' : ''}
            `;

            // Remove individual LIMIT/OFFSET for 'all' category
            const cidrDataQuery = `(
          SELECT c.id,
                 'ip'           AS type,
                 c.cidr_range   AS value,
                 p.program,
                 c.last_updated AS discovery_date,
                 NULL           AS details,
                 c.viewed,
                 plt.platform   AS platform_name
          FROM deeper_cidr_ranges c
               JOIN shared_programs p ON c.fk_programs_id = p.id
               LEFT JOIN shared_platforms plt ON p.fk_bb_site = plt.id
          WHERE c.viewed = 0 ${search ? 'AND c.cidr_range LIKE ?' : ''}
          ORDER BY c.last_updated DESC
        )`;

            if (search) {
                countParams.push(search);
                dataParams.push(search);
            }

            if (countQuery) countQuery += ' UNION ALL ';
            countQuery += cidrCountQuery;

            if (dataQuery) dataQuery += ' UNION ALL ';
            dataQuery += cidrDataQuery;
        }

        if (category === 'all' || category === 'url') {
            // For URLs
            const urlCountQuery = `
              SELECT COUNT(*) AS count
              FROM deeper_urls u
                   JOIN deeper_subdomains s ON u.fk_subdomains_id = s.id
                   JOIN shared_programs p ON u.fk_programs_id = p.id
              WHERE u.viewed = 0 ${search ? 'AND u.url LIKE ?' : ''}
            `;

            const urlDataQuery = `(
          SELECT u.id,
                 'url'        AS type,
                 u.url        AS value,
                 p.program,
                 COALESCE(ud.last_seen, NOW()) AS discovery_date,
                 NULL        AS details,
                 u.viewed,
                 plt.platform AS platform_name
          FROM deeper_urls u
               JOIN deeper_subdomains s ON u.fk_subdomains_id = s.id
               JOIN shared_programs p ON u.fk_programs_id = p.id
               LEFT JOIN shared_platforms plt ON p.fk_bb_site = plt.id
               LEFT JOIN deeper_url_details ud ON u.fk_subdomains_id = ud.fk_subdomains_id
          WHERE u.viewed = 0 ${search ? 'AND u.url LIKE ?' : ''}
          ORDER BY discovery_date DESC
        )`;

            if (search) {
                countParams.push(search);
                dataParams.push(search);
            }

            if (countQuery) countQuery += ' UNION ALL ';
            countQuery += urlCountQuery;

            if (dataQuery) dataQuery += ' UNION ALL ';
            dataQuery += urlDataQuery;
        }

        // Apply LIMIT and OFFSET to the entire combined result for all categories
        // or to the single category if not 'all'
        dataQuery += ` ORDER BY discovery_date DESC LIMIT ? OFFSET ?`;
        dataParams.push(limit, offset);

        // Get the total count
        const countResults = await Promise.all(countQuery.split('UNION ALL').map((query, index) => {
            const start = index * (search ? 1 : 0);
            const end = start + (search ? 1 : 0);
            return db.query(query, countParams.slice(start, end));
        }));

        let total = 0;
        // Sum up counts from all queries
        countResults.forEach(result => {
            total += result[0][0].count;
        });

        // Get the data
        const [dataRows] = await db.query(dataQuery, dataParams);

        res.json({
            data: dataRows,
            pagination: {
                total,
                current_page: page,
                total_pages: Math.ceil(total / limit),
                per_page: limit,
            },
        });
    } catch (err) {
        console.error('Error fetching alerts:', err);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Mark alert as viewed
router.post('/alerts/:id/viewed', async (req, res) => {
    const {id} = req.params;
    const {type} = req.body;

    if (!id || !type) {
        return res.status(400).json({success: false, error: 'ID and type are required'});
    }

    try {
        let table;
        switch (type) {
            case 'domain':
                table = 'deeper_possible_apex_domains';
                break;
            case 'subdomain':
                table = 'deeper_subdomains';
                break;
            case 'ip':
                table = 'deeper_cidr_ranges';
                break;
            case 'url':
                table = 'deeper_urls';
                break;
            default:
                return res.status(400).json({success: false, error: 'Invalid type'});
        }

        const query = `UPDATE ${table}
        SET viewed = 1
        WHERE id = ?`;
        const [result] = await db.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({success: false, error: 'Alert not found'});
        }

        res.json({
            success: true,
            message: 'Alert marked as viewed',
        });
    } catch (err) {
        console.error('Error marking alert as viewed:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Mark all alerts on the current page as viewed
router.post('/alerts/mark-page-viewed', async (req, res) => {
    const {ids, types} = req.body;

    if (!ids || !types || ids.length !== types.length) {
        return res.status(400).json({success: false, error: 'Invalid request format'});
    }

    try {
        const promises = ids.map((id, index) => {
            const type = types[index];
            let table;
            switch (type) {
                case 'domain':
                    table = 'deeper_possible_apex_domains';
                    break;
                case 'subdomain':
                    table = 'deeper_subdomains';
                    break;
                case 'ip':
                    table = 'deeper_cidr_ranges';
                    break;
                case 'url':
                    table = 'deeper_urls';
                    break;
                default:
                    return Promise.reject(new Error('Invalid type'));
            }

            return db.query(`UPDATE ${table}
            SET viewed = 1
            WHERE id = ?`, [id]);
        });

        await Promise.all(promises);

        res.json({
            success: true,
            message: `${ids.length} alerts marked as viewed`,
        });
    } catch (err) {
        console.error('Error marking page alerts as viewed:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Mark all unviewed alerts as viewed
router.post('/alerts/mark-all-viewed', async (req, res) => {
    try {
        // Add explicit transaction to ensure all updates succeed or fail together
        await db.query('START TRANSACTION');

        const updates = [
            db.query(`UPDATE deeper_possible_apex_domains
            SET viewed = 1
            WHERE viewed = 0`),
            db.query(`UPDATE deeper_subdomains
            SET viewed = 1
            WHERE viewed = 0`),
            db.query(`UPDATE deeper_urls
            SET viewed = 1
            WHERE viewed = 0`),
            db.query(`UPDATE deeper_cidr_ranges
            SET viewed = 1
            WHERE viewed = 0`)
        ];

        const results = await Promise.all(updates);

        await db.query('COMMIT');

        // Sum up the affected rows
        const totalUpdated = results.reduce((sum, result) => {
            return sum + result[0].affectedRows;
        }, 0);

        // Return the count in the response
        res.json({
            success: true,
            count: totalUpdated,
            message: `${totalUpdated} alerts marked as viewed`,
        });
    } catch (err) {
        // Roll back on any error
        await db.query('ROLLBACK');
        console.error('Error marking all alerts as viewed:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Fetch ASN details by ASN number
router.get('/asn/:asn/details', async (req, res) => {
    const {asn} = req.params;

    if (!validateASN(asn)) {
        return res.status(400).json({error: 'Invalid ASN format'});
    }

    try {
        // Get ASN details including metadata and CIDR ranges
        const query = `
          SELECT da.id,
                 da.asn,
                 da.last_updated,
                 da.fk_programs_id,
                 sp.program                            AS program_name,
                 sp.fk_bb_site                         AS platform_id,
                 p.platform                            AS platform_name,
                 GROUP_CONCAT(DISTINCT dam.name)       AS names,
                 GROUP_CONCAT(DISTINCT dam.country)    AS countries,
                 GROUP_CONCAT(DISTINCT dcr.cidr_range) AS cidr_ranges,
                 GROUP_CONCAT(DISTINCT
                              CASE
                                WHEN dcrm.is_ipv4 = 1 THEN 'IPv4'
                                WHEN dcrm.is_ipv4 = 0 THEN 'IPv6'
                                ELSE NULL
                                END
                 )                                     AS ip_versions,
                 GROUP_CONCAT(DISTINCT
                              CASE
                                WHEN dcrm.is_inscope = 1 THEN 'In Scope'
                                WHEN dcrm.is_inscope = 0 THEN 'Out of Scope'
                                ELSE NULL
                                END
                 )                                     AS scope_statuses
          FROM deeper_asn da
               JOIN shared_programs sp ON da.fk_programs_id = sp.id
               LEFT JOIN shared_platforms p ON sp.fk_bb_site = p.id
               LEFT JOIN deeper_asn_metadatas dam ON da.id = dam.fk_asn_id
               LEFT JOIN link_asn_cidr_ranges lacr ON da.id = lacr.fk_asn_id
               LEFT JOIN deeper_cidr_ranges dcr ON lacr.fk_cidr_ranges_id = dcr.id
               LEFT JOIN deeper_cidr_ranges_metadatas dcrm ON dcr.id = dcrm.fk_cidr_ranges_id
          WHERE da.asn = ?
          GROUP BY da.id, sp.program, p.platform
        `;

        const [rows] = await db.query(query, [asn]);

        if (rows.length === 0) {
            return res.status(404).json({error: 'ASN not found'});
        }

        const row = rows[0];

        // Process the results
        const details = {
            id: row.id,
            asn: row.asn,
            last_updated: row.last_updated,
            program: {
                id: row.fk_programs_id,
                name: row.program_name,
                platform: row.platform_name
            },
            names: row.names ? row.names.split(',').filter(Boolean) : [],
            countries: row.countries ? row.countries.split(',').filter(Boolean) : [],
            cidr_ranges: row.cidr_ranges ? row.cidr_ranges.split(',').filter(Boolean) : [],
            additional_data: {
                ip_versions: row.ip_versions ? [...new Set(row.ip_versions.split(',').filter(Boolean))] : [],
                scope_statuses: row.scope_statuses ? [...new Set(row.scope_statuses.split(',').filter(Boolean))] : []
            }
        };

        res.json(details);
    } catch (err) {
        console.error('Error fetching ASN details:', err);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Get details for a single CIDR range
router.get('/cidr/:cidr/details', async (req, res) => {
    const {cidr} = req.params;
    try {
        const detailsQuery = `
          SELECT dcr.id,
                 dcr.cidr_range               AS cidr,
                 COALESCE(dcrm.is_ipv4, 1)    AS isIPv4,
                 COALESCE(dcrm.is_inscope, 0) AS isInScope,
                 dcr.fk_programs_id,
                 sp.program                   AS program_name,
                 sp.fk_bb_site                AS platform_id,
                 p.platform                   AS platform_name
          FROM deeper_cidr_ranges dcr
               JOIN shared_programs sp ON dcr.fk_programs_id = sp.id
               LEFT JOIN shared_platforms p ON sp.fk_bb_site = p.id
               LEFT JOIN deeper_cidr_ranges_metadatas dcrm ON dcr.id = dcrm.fk_cidr_ranges_id
          WHERE dcr.cidr_range = ?
          LIMIT 1
        `;
        const [rows] = await db.query(detailsQuery, [cidr]);
        if (!rows.length) {
            return res.status(404).json({error: 'CIDR not found'});
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching CIDR details:', error);
        res.status(500).json({error: 'Internal server error'});
    }
});

// --- Subdomains Routes (for Subdomains page) ---
// Fetch all subdomains with pagination and search
router.get('/subdomains', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;
    const program = req.query.program || null;
    const apex_domain_id = req.query.apex_domain_id || null;
    const status = req.query.status || null;

    try {
        let countQuery = `
          SELECT COUNT(*) AS total
          FROM deeper_subdomains s
               LEFT JOIN shared_program_apex_domains iad ON s.fk_apex_domains_id = iad.id
               LEFT JOIN shared_programs p ON iad.fk_programs_id = p.id
               LEFT JOIN deeper_subdomain_details sd ON s.id = sd.fk_subdomain_id
        `;

        let dataQuery = `
          SELECT s.id,
                 s.subdomain,
                 s.ip_address,
                 s.is_active,
                 s.is_inscope,
                 s.discovery_date,
                 s.last_seen,
                 COALESCE(sd.is_alive, s.is_active) AS alive,
                 iad.apex_domain,
                 iad.fk_programs_id,
                 p.program,
                 p.fk_bb_site                       AS platform_id,
                 plt.platform                       AS platform_name
          FROM deeper_subdomains s
               LEFT JOIN shared_program_apex_domains iad ON s.fk_apex_domains_id = iad.id
               LEFT JOIN shared_programs p ON iad.fk_programs_id = p.id
               LEFT JOIN shared_platforms plt ON p.fk_bb_site = plt.id
               LEFT JOIN deeper_subdomain_details sd ON s.id = sd.fk_subdomain_id
        `;

        const conditions = [];
        const params = [];

        if (search) {
            conditions.push(`(s.subdomain LIKE ? OR s.ip_address LIKE ? OR iad.apex_domain LIKE ? OR p.program LIKE ?)`);
            params.push(search, search, search, search);
        }

        if (program) {
            conditions.push(`p.id = ?`);
            params.push(program);
        }

        if (apex_domain_id) {
            conditions.push(`iad.id = ?`);
            params.push(apex_domain_id);
        }

        if (status) {
            switch (status) {
                case 'active':
                    conditions.push(`(s.is_active = 1 OR sd.is_alive = 1)`);
                    break;
                case 'inactive':
                    conditions.push(`(s.is_active = 0 AND (sd.is_alive = 0 OR sd.is_alive IS NULL))`);
                    break;
                case 'inscope':
                    conditions.push(`s.is_inscope = 1`);
                    break;
            }
        }

        if (conditions.length > 0) {
            const whereClause = ` WHERE ${conditions.join(' AND ')}`;
            countQuery += whereClause;
            dataQuery += whereClause;
        }

        dataQuery += ` ORDER BY s.id DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [[countRow]] = await db.query(countQuery, params.slice(0, params.length - 2));
        const [dataRows] = await db.query(dataQuery, params);

        const total = countRow.total || 0;

        res.json({
            data: dataRows,
            pagination: {
                total,
                current_page: page,
                total_pages: Math.max(1, Math.ceil(total / limit)),
                per_page: limit,
            },
        });
    } catch (err) {
        console.error('Error fetching subdomains:', err.stack);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Get subdomain details by subdomain ID
router.get('/subdomains/:id/details', async (req, res) => {
    const {id} = req.params;
    try {
        // Basic subdomain info
        const [subdomainRows] = await db.query(`
          SELECT s.id, s.subdomain, s.ip_address, s.is_active, s.is_inscope, s.discovery_date, s.last_seen,
                 iad.apex_domain, iad.fk_programs_id, p.program, plt.platform AS platform_name
          FROM deeper_subdomains s
               LEFT JOIN shared_program_apex_domains iad ON s.fk_apex_domains_id = iad.id
               LEFT JOIN shared_programs p ON iad.fk_programs_id = p.id
               LEFT JOIN shared_platforms plt ON p.fk_bb_site = plt.id
          WHERE s.id = ?
          LIMIT 1
        `, [id]);

        if (!subdomainRows.length) {
            return res.status(404).json({success: false, error: 'Subdomain not found'});
        }
        const subdomain = subdomainRows[0];

        // Details (if any)
        const [detailsRows] = await db.query(`
          SELECT is_alive, first_seen, last_seen, fk_programs_id
          FROM deeper_subdomain_details
          WHERE fk_subdomain_id = ?
          LIMIT 1
        `, [id]);
        const details = detailsRows[0] || {};

        // URLs for this subdomain
        const [urls] = await db.query(`
          SELECT u.id, u.url
          FROM deeper_urls u
          WHERE u.fk_subdomains_id = ?
        `, [id]);

        res.json({
            ...subdomain,
            ...details,
            urls,
        });
    } catch (err) {
        console.error('Error fetching subdomain details:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Create a new subdomain
router.post('/subdomains', async (req, res) => {
    const {subdomain, ip_address, fk_apex_domains_id, is_alive} = req.body;

    if (!subdomain || !fk_apex_domains_id) {
        return res.status(400).json({success: false, error: 'Subdomain and apex domain ID are required'});
    }

    try {
        // Insert into deeper_subdomains (the trigger will handle deeper_subdomain_details)
        const query = `
          INSERT INTO deeper_subdomains (subdomain, ip_address, fk_apex_domains_id, is_active, discovery_date,
                                         last_seen)
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `;

        const [result] = await db.query(query, [
            subdomain,
            ip_address || null,
            fk_apex_domains_id,
            is_alive !== undefined ? is_alive : 1,
        ]);

        res.status(201).json({
            success: true,
            message: 'Subdomain created successfully',
            subdomain_id: result.insertId,
        });
    } catch (err) {
        console.error('Error creating subdomain:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Update an existing subdomain
router.put('/subdomains/:id', async (req, res) => {
    const {id} = req.params;
    const {subdomain, ip_address, is_active, is_inscope, fk_apex_domains_id} = req.body;

    if (!subdomain) {
        return res.status(400).json({success: false, error: 'Subdomain is required'});
    }

    try {
        await db.query('START TRANSACTION');

        // First check if the subdomain exists
        const [[existingSubdomain]] = await db.query(
            `SELECT id, fk_apex_domains_id
            FROM deeper_subdomains
            WHERE id = ?`,
            [id]
        );

        if (!existingSubdomain) {
            await db.query('ROLLBACK');
            return res.status(404).json({success: false, error: 'Subdomain not found'});
        }

        // Update deeper_subdomains
        const query = `
          UPDATE deeper_subdomains
          SET subdomain = ?,
              ip_address = ?,
              is_active = ?,
              is_inscope = ?,
              fk_apex_domains_id = ?,
              last_seen = NOW()
          WHERE id = ?
        `;

        await db.query(query, [
            subdomain,
            ip_address || null,
            is_active !== undefined ? is_active : 1,
            is_inscope !== undefined ? is_inscope : 1,
            fk_apex_domains_id || existingSubdomain.fk_apex_domains_id,
            id
        ]);

        // Get program ID for deeper_subdomain_details
        const [[apexDomain]] = await db.query(
            `SELECT fk_programs_id
            FROM shared_program_apex_domains
            WHERE id = ?`,
            [fk_apex_domains_id || existingSubdomain.fk_apex_domains_id]
        );

        // Check if details record exists
        const [[existingDetails]] = await db.query(
            `SELECT id
            FROM deeper_subdomain_details
            WHERE fk_subdomain_id = ?`,
            [id]
        );

        if (existingDetails) {
            // Update existing details
            await db.query(
                `UPDATE deeper_subdomain_details
                SET is_alive = ?, last_seen = NOW()
                WHERE fk_subdomain_id = ?`,
                [is_active !== undefined ? is_active : 1, id]
            );
        } else {
            // Create new details
            await db.query(
                `INSERT INTO deeper_subdomain_details (is_alive, first_seen, last_seen, fk_programs_id, fk_subdomain_id)
                VALUES (?, NOW(), NOW(), ?, ?)`,
                [is_active !== undefined ? is_active : 1, apexDomain.fk_programs_id, id]
            );
        }

        await db.query('COMMIT');

        res.json({
            success: true,
            message: 'Subdomain updated successfully',
        });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Error updating subdomain:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Delete a subdomain
router.delete('/subdomains/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const [result] = await db.query('DELETE FROM deeper_subdomains WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({success: false, error: 'Subdomain not found'});
        }

        res.json({
            success: true,
            message: 'Subdomain deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting subdomain:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

router.get('/subdomains-metrics', async (req, res) => {
    try {
        const programId = req.query.programId || null;

        // 1. Total Subdomains
        const [totalSubdomainsResult] = await db.query(`
              SELECT COUNT(*) AS total_subdomains
              FROM deeper_subdomains s
                ${programId ? 'WHERE s.fk_apex_domains_id IN (SELECT id FROM shared_program_apex_domains WHERE fk_programs_id = ?)' : ''}
            `,
            programId ? [programId] : []
        );

        // 2. Active Subdomains
        const [activeSubdomainsResult] = await db.query(`
              SELECT COUNT(*) AS active_subdomains
              FROM deeper_subdomains s
                   LEFT JOIN deeper_subdomain_details sd ON s.id = sd.fk_subdomain_id
              WHERE (s.is_active = 1 OR sd.is_alive = 1)
                ${programId ? 'AND s.fk_apex_domains_id IN (SELECT id FROM shared_program_apex_domains WHERE fk_programs_id = ?)' : ''}
            `,
            programId ? [programId] : []
        );

        // 3. New Subdomains Today
        const [newTodayResult] = await db.query(`
              SELECT COUNT(*) AS new_today
              FROM deeper_subdomains s
              WHERE DATE(s.discovery_date) = CURRENT_DATE()
                ${programId ? 'AND s.fk_apex_domains_id IN (SELECT id FROM shared_program_apex_domains WHERE fk_programs_id = ?)' : ''}
            `,
            programId ? [programId] : []
        );

        // 4. Total Apex Domains
        const [totalApexDomainsResult] = await db.query(`
              SELECT COUNT(DISTINCT apex_domain) AS total_apex_domains
              FROM shared_program_apex_domains ${programId ? 'WHERE fk_programs_id = ?' : ''}
            `,
            programId ? [programId] : []
        );

        // 5. HTTP Servers (using status from URLs)
        const [httpServersResult] = await db.query(`
              SELECT COUNT(DISTINCT s.id) AS http_servers
              FROM deeper_subdomains s
                   JOIN deeper_urls u ON s.id = u.fk_subdomains_id
                   JOIN deeper_url_details ud ON u.fk_subdomains_id = ud.fk_subdomains_id
              WHERE ud.is_alive = 1
                ${programId ? 'AND s.fk_apex_domains_id IN (SELECT id FROM shared_program_apex_domains WHERE fk_programs_id = ?)' : ''}
            `,
            programId ? [programId] : []
        );

        // 6. HTTPS Servers (using URL protocol)
        const [httpsServersResult] = await db.query(`
              SELECT COUNT(DISTINCT s.id) AS https_servers
              FROM deeper_subdomains s
                   JOIN deeper_urls u ON s.id = u.fk_subdomains_id
              WHERE u.url LIKE 'https://%'
                ${programId ? 'AND s.fk_apex_domains_id IN (SELECT id FROM shared_program_apex_domains WHERE fk_programs_id = ?)' : ''}
            `,
            programId ? [programId] : []
        );

        // 7. In-Scope Subdomains
        const [inscopeSubdomainsResult] = await db.query(`
              SELECT COUNT(*) AS in_scope_subdomains
              FROM deeper_subdomains s
              WHERE s.is_inscope = 1
                ${programId ? 'AND s.fk_apex_domains_id IN (SELECT id FROM shared_program_apex_domains WHERE fk_programs_id = ?)' : ''}
            `,
            programId ? [programId] : []
        );

        // Extract results
        const totalSubdomains = totalSubdomainsResult[0]?.total_subdomains || 0;
        const activeSubdomains = activeSubdomainsResult[0]?.active_subdomains || 0;
        const newToday = newTodayResult[0]?.new_today || 0;
        const totalApexDomains = totalApexDomainsResult[0]?.total_apex_domains || 0;
        const httpServers = httpServersResult[0]?.http_servers || 0;
        const httpsServers = httpsServersResult[0]?.https_servers || 0;
        const inscopeSubdomains = inscopeSubdomainsResult[0]?.in_scope_subdomains || 0;

        // Response
        res.json({
            total_subdomains: totalSubdomains,
            active_subdomains: activeSubdomains,
            new_today: newToday,
            total_apex_domains: totalApexDomains,
            http_servers: httpServers,
            https_servers: httpsServers,
            in_scope_subdomains: inscopeSubdomains
        });
    } catch (err) {
        console.error('Error fetching subdomain metrics:', err);
        res.status(500).json({
            error: 'Database error',
            details: err.message,
        });
    }
});

// --- URL Management Routes (for Urls page) ---
// Fetch all URLs with pagination and search
router.get('/urls', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;

    try {
        let countQuery = `
          SELECT COUNT(*) AS total
          FROM deeper_urls u
               LEFT JOIN deeper_subdomains s ON u.fk_subdomains_id = s.id
               LEFT JOIN shared_program_apex_domains iad ON s.fk_apex_domains_id = iad.id
               LEFT JOIN shared_programs p ON iad.fk_programs_id = p.id
        `;

        let dataQuery = `
          SELECT u.id,
                 u.url,
                 u.is_inscope,
                 s.subdomain,
                 p.program,
                 p.id         AS fk_programs_id,
                 p.fk_bb_site AS platform_id,
                 plt.platform AS platform_name,
                 s.id         AS fk_subdomains_id
          FROM deeper_urls u
               LEFT JOIN deeper_subdomains s ON u.fk_subdomains_id = s.id
               LEFT JOIN shared_program_apex_domains iad ON s.fk_apex_domains_id = iad.id
               LEFT JOIN shared_programs p ON iad.fk_programs_id = p.id
               LEFT JOIN shared_platforms plt ON p.fk_bb_site = plt.id
        `;

        const searchCondition = search
            ? ` WHERE (u.url LIKE ? OR s.subdomain LIKE ? OR p.program LIKE ?)`
            : '';
        const countParams = search ? [search, search, search] : [];
        const dataParams = search ? [search, search, search, limit, offset] : [limit, offset];

        countQuery += searchCondition;
        dataQuery += searchCondition + ` ORDER BY u.id DESC LIMIT ? OFFSET ?`;

        const [[countRow]] = await db.query(countQuery, countParams);
        const [dataRows] = await db.query(dataQuery, dataParams);

        const total = countRow.total || 0;

        res.json({
            data: dataRows,
            pagination: {
                total,
                current_page: page,
                total_pages: Math.max(1, Math.ceil(total / limit)),
                per_page: limit,
            },
        });
    } catch (err) {
        console.error('Error fetching URLs:', err.stack);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Create a new URL
router.post('/urls', async (req, res) => {
    const {url, fk_subdomains_id, is_inscope} = req.body;

    if (!url || !fk_subdomains_id) {
        return res.status(400).json({success: false, error: 'URL and subdomain ID are required'});
    }

    try {
        // Start transaction
        await db.query('START TRANSACTION');

        // First retrieve the program ID through the subdomain's apex domain
        const [[programResult]] = await db.query(`
          SELECT a.fk_programs_id
          FROM deeper_subdomains s
               JOIN shared_program_apex_domains a ON s.fk_apex_domains_id = a.id
          WHERE s.id = ?
        `, [fk_subdomains_id]);

        if (!programResult) {
            await db.query('ROLLBACK');
            return res.status(404).json({success: false, error: 'Subdomain not found or has no associated program'});
        }

        // Now insert into deeper_urls with the correct program ID
        const urlQuery = `
          INSERT INTO deeper_urls (url,
                                   fk_subdomains_id,
                                   is_inscope,
                                   fk_programs_id,
                                   viewed)
          VALUES (?, ?, ?, ?, 0)
        `;

        const [urlResult] = await db.query(urlQuery, [
            url,
            fk_subdomains_id,
            is_inscope !== undefined ? is_inscope : 1,
            programResult.fk_programs_id
        ]);

        const urlId = urlResult.insertId;

        // Insert into deeper_url_details if needed
        if (req.body.is_active !== undefined) {
            const detailsQuery = `
              INSERT INTO deeper_url_details (is_alive,
                                              first_seen,
                                              last_seen,
                                              fk_programs_id,
                                              fk_subdomains_id)
              VALUES (?, NOW(), NOW(), ?, ?)
            `;

            await db.query(detailsQuery, [
                req.body.is_active ? 1 : 0,
                programResult.fk_programs_id,
                fk_subdomains_id
            ]);
        }

        await db.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'URL created successfully',
            id: urlId,
        });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Error creating URL:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Update the existing URL
router.put('/urls/:id', async (req, res) => {
    const {id} = req.params;
    const {url, fk_subdomains_id, status_code, is_active} = req.body;

    if (!url || !fk_subdomains_id) {
        return res.status(400).json({success: false, error: 'URL and subdomain ID are required'});
    }

    try {
        await db.query('START TRANSACTION');

        // Extract the subdomain from the URL
        let subdomain = null;
        if (url.startsWith('http://')) {
            subdomain = url.substring(7).split('/')[0];
        } else if (url.startsWith('https://')) {
            subdomain = url.substring(8).split('/')[0];
        }

        // Update the URL
        const urlQuery = `
          UPDATE deeper_urls
          SET url = ?,
              fk_subdomains_id = ?,
              is_active = ?
          WHERE id = ?
        `;

        const [urlResult] = await db.query(urlQuery, [
            url,
            fk_subdomains_id,
            is_active !== undefined ? is_active : 1,
            id
        ]);

        // Update the subdomain if we extracted one
        if (subdomain) {
            const subdomainQuery = `
              UPDATE deeper_subdomains
              SET subdomain = ?,
                  last_seen = NOW()
              WHERE id = ?
            `;

            await db.query(subdomainQuery, [subdomain, fk_subdomains_id]);
        }

        await db.query('COMMIT');

        if (urlResult.affectedRows === 0) {
            return res.status(404).json({success: false, error: 'URL not found'});
        }

        res.json({
            success: true,
            message: 'URL updated successfully',
        });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Error updating URL:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Delete a URL
router.delete('/urls/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const [result] = await db.query('DELETE FROM deeper_urls WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({success: false, error: 'URL not found'});
        }

        res.json({
            success: true,
            message: 'URL deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting URL:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

router.get('/urls/:id/details', async (req, res) => {
    const {id} = req.params;

    try {
        const query = `
          SELECT ud.id,
                 ud.is_alive,
                 ud.first_seen,
                 ud.last_seen,
                 ud.title,
                 ud.notes,
                 u.url,
                 u.id,
                 u.fk_subdomains_id,
                 ud.fk_programs_id
          FROM deeper_url_details ud
               JOIN deeper_urls u ON ud.fk_subdomains_id = u.fk_subdomains_id
          WHERE u.id = ?
        `;

        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({success: false, error: 'URL details not found'});
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching URL details:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

router.get('/urls/:id/technologies', async (req, res) => {
    const {id} = req.params;

    try {
        const query = `
          SELECT ut.id,
                 ut.category,
                 ut.technology,
                 ut.version,
                 ut.source
          FROM deeper_url_technologies ut
               JOIN deeper_urls u ON ut.fk_subdomains_id = u.fk_subdomains_id
          WHERE u.id = ?
        `;

        const [rows] = await db.query(query, [id]);

        res.json({
            success: true,
            data: rows
        });
    } catch (err) {
        console.error('Error fetching URL technologies:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Fetch urls metrics
router.get('/urls-metrics', async (req, res) => {
    try {
        const programId = req.query.programId || null;

        // Total URLs
        const [totalUrlsResult] = await db.query(`
              SELECT COUNT(*) AS total_urls
              FROM deeper_urls u ${programId ? 'WHERE fk_programs_id = ? ' : ''}
            `,
            programId ? [programId] : []
        );

        // Active URLs
        let query = `
          SELECT COUNT(*) AS active_urls
          FROM deeper_urls u
               JOIN deeper_url_details ud ON u.fk_subdomains_id = ud.fk_subdomains_id
          WHERE ud.is_alive = 1
        `;
        let params = [];

        if (programId) {
            query = `
              SELECT COUNT(*) AS active_urls
              FROM deeper_urls u
                   JOIN deeper_url_details ud ON u.fk_subdomains_id = ud.fk_subdomains_id
              WHERE u.fk_programs_id = ? AND ud.is_alive = 1
            `;
            params = [programId];
        }

        const [activeUrlsResult] = await db.query(query, params);

        // In-Scope URLs
        const [inscopeUrlsResult] = await db.query(`
              SELECT COUNT(*) AS in_scope_urls
              FROM deeper_urls u
              WHERE ${programId ? 'fk_programs_id = ? AND ' : ''}u.is_inscope = 1
            `,
            programId ? [programId] : []
        );

        // URLs with technologies
        const [urlsWithTechResult] = await db.query(`
              SELECT COUNT(DISTINCT u.id) AS urls_with_technologies
              FROM deeper_urls u
                   JOIN deeper_url_technologies ut ON u.fk_subdomains_id = ut.fk_subdomains_id
                ${programId ? 'WHERE u.fk_programs_id = ? ' : ''}
            `,
            programId ? [programId] : []
        );

        // URLs added today
        const [addedTodayResult] = await db.query(`
              SELECT COUNT(*) AS urls_added_today
              FROM deeper_urls u
                   JOIN deeper_url_details ud ON u.fk_subdomains_id = ud.fk_subdomains_id
              WHERE ${programId ? 'u.fk_programs_id = ? AND ' : ''}DATE(ud.first_seen) = CURRENT_DATE()
            `,
            programId ? [programId] : []
        );

        // Average technologies per URL
        const [avgTechResult] = await db.query(`
              SELECT AVG(tech_count) AS average_technologies_per_url
              FROM (SELECT u.id, COUNT(ut.id) AS tech_count
              FROM deeper_urls u
                   LEFT JOIN deeper_url_technologies ut ON u.fk_subdomains_id = ut.fk_subdomains_id
                ${programId ? 'WHERE u.fk_programs_id = ? ' : ''}
              GROUP BY u.id) AS url_tech_counts
            `,
            programId ? [programId] : []
        );

        // Extract values from query results (corrected structure)
        const totalUrls = totalUrlsResult[0]?.total_urls || 0;
        const activeUrls = activeUrlsResult[0]?.active_urls || 0;
        const inscopeUrls = inscopeUrlsResult[0]?.in_scope_urls || 0;
        const urlsWithTech = urlsWithTechResult[0]?.urls_with_technologies || 0;
        const urlsAddedToday = addedTodayResult[0]?.urls_added_today || 0;
        const avgTechnologies = avgTechResult[0]?.average_technologies_per_url || 0;

        res.json({
            total_urls: totalUrls,
            active_urls: activeUrls,
            in_scope_urls: inscopeUrls,
            urls_with_technologies: urlsWithTech,
            urls_added_today: urlsAddedToday,
            average_technologies_per_url: avgTechnologies,
        });
    } catch (err) {
        console.error('Error fetching URL metrics:', err);
        res.status(500).json({
            error: 'Database error',
            details: err.message,
        });
    }
});
// Route to execute deepv2/deep with flexible arguments
router.post('/deep/run', async (req, res) => {
    const {mode, program, target, setRun, lastRun, verbose} = req.body;

    // Basic validation (expand as needed)
    if (!mode || !program || !target) {
        return res.status(400).json({success: false, error: 'mode, program, and target are required'});
    }

    // Build argument array
    const args = [];
    if (verbose) args.push('-v');
    args.push('-m', mode);
    args.push('-p', program);
    args.push('-t', target);
    if (setRun) args.push('-sr', setRun);
    if (lastRun) args.push('-lr');

    const deepPath = '/home/dd/my/codes/deepv2/deep';
    const deepProcess = spawn(deepPath, args);

    let output = '';
    let error = '';

    deepProcess.stdout.on('data', (data) => {
        output += data.toString();
    });
    deepProcess.stderr.on('data', (data) => {
        error += data.toString();
    });

    deepProcess.on('close', (code) => {
        if (code === 0) {
            res.json({success: true, output});
        } else {
            res.status(500).json({success: false, error, code, output});
        }
    });
});

// --- RDAP Metrics (normalized) ---
router.get('/rdap-metrics', async (req, res) => {
    try {
        const queries = [
            "SELECT COUNT(DISTINCT d.fk_org_id) AS count FROM deeper_whois_details d WHERE d.category = 'org'",
            "SELECT COUNT(DISTINCT d.fk_name_id) AS count FROM deeper_whois_details d WHERE d.category = 'name'",
            "SELECT COUNT(DISTINCT d.fk_email_id) AS count FROM deeper_whois_details d WHERE d.category = 'email'",
            "SELECT COUNT(DISTINCT d.fk_address_id) AS count FROM deeper_whois_details d WHERE d.category = 'address'",
            "SELECT COUNT(DISTINCT d.fk_nameserver_id) AS count FROM deeper_whois_details d WHERE d.category = 'nameserver'"
        ];
        const results = await Promise.all(queries.map((query) => db.query(query)));
        res.json({
            orgs: results[0][0][0]?.count || 0,
            names: results[1][0][0]?.count || 0,
            emails: results[2][0][0]?.count || 0,
            addresses: results[3][0][0]?.count || 0,
            nameservers: results[4][0][0]?.count || 0
        });
    } catch (err) {
        console.error('Error fetching RDAP metrics:', err);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Fetch related RDAP items for an organization
router.get('/rdap/related/:orgId', async (req, res) => {
    const {orgId} = req.params;
    const {programId} = req.query;

    if (!orgId || !programId) {
        return res.status(400).json({
            success: false,
            error: 'Organization ID and Program ID are required'
        });
    }

    try {
        // Get all related items for this organization from all the core tables
        const queries = [];

        // Names
        queries.push(db.query(`
          SELECT n.id, 'names' AS type, n.name AS value
          FROM deeper_core_names n
               JOIN deeper_rdap_details d ON d.fk_name_id = n.id AND d.category = 'name'
          WHERE d.fk_programs_id = ? AND d.fk_org_id = ?
        `, [programId, orgId]));

        // Emails
        queries.push(db.query(`
          SELECT e.id, 'emails' AS type, e.email AS value
          FROM deeper_core_emails e
               JOIN deeper_rdap_details d ON d.fk_email_id = e.id AND d.category = 'email'
          WHERE d.fk_programs_id = ? AND d.fk_org_id = ?
        `, [programId, orgId]));

        // Addresses
        queries.push(db.query(`
          SELECT a.id, 'addresses' AS type, a.address AS value
          FROM deeper_core_addresses a
               JOIN deeper_rdap_details d ON d.fk_address_id = a.id AND d.category = 'address'
          WHERE d.fk_programs_id = ? AND d.fk_org_id = ?
        `, [programId, orgId]));

        // Nameservers
        queries.push(db.query(`
          SELECT ns.id, 'nameservers' AS type, ns.nameserver AS value
          FROM deeper_core_nameservers ns
               JOIN deeper_rdap_details d ON d.fk_nameserver_id = ns.id AND d.category = 'nameserver'
          WHERE d.fk_programs_id = ? AND d.fk_org_id = ?
        `, [programId, orgId]));

        // Phones
        queries.push(db.query(`
          SELECT p.id, 'phones' AS type, p.phone AS value
          FROM deeper_core_phones p
               JOIN deeper_rdap_details d ON d.fk_phone_id = p.id AND d.category = 'phone'
          WHERE d.fk_programs_id = ? AND d.fk_org_id = ?
        `, [programId, orgId]));

        // Execute all queries
        const results = await Promise.all(queries);

        // Combine all results
        const combined = [
            ...results[0][0], // names
            ...results[1][0], // emails
            ...results[2][0], // addresses
            ...results[3][0], // nameservers
            ...results[4][0]  // phones
        ];

        res.json({
            success: true,
            data: combined
        });
    } catch (err) {
        console.error('Error fetching related RDAP items:', err);
        res.status(500).json({
            success: false,
            error: 'Database error',
            details: err.message
        });
    }
});

// Fetch related WHOIS items for an organization
router.get('/whois/related/:orgId', async (req, res) => {
    const {orgId} = req.params;
    const {programId} = req.query;

    if (!orgId || !programId) {
        return res.status(400).json({
            success: false,
            error: 'Organization ID and Program ID are required'
        });
    }

    try {
        // Get all related items for this organization from all the core tables
        const queries = [];

        // Names
        queries.push(db.query(`
          SELECT n.id, 'names' AS type, n.name AS value
          FROM deeper_core_names n
               JOIN deeper_whois_details d ON d.fk_name_id = n.id AND d.category = 'name'
          WHERE d.fk_programs_id = ? AND d.fk_org_id = ?
        `, [programId, orgId]));

        // Emails
        queries.push(db.query(`
          SELECT e.id, 'emails' AS type, e.email AS value
          FROM deeper_core_emails e
               JOIN deeper_whois_details d ON d.fk_email_id = e.id AND d.category = 'email'
          WHERE d.fk_programs_id = ? AND d.fk_org_id = ?
        `, [programId, orgId]));

        // Addresses
        queries.push(db.query(`
          SELECT a.id, 'addresses' AS type, a.address AS value
          FROM deeper_core_addresses a
               JOIN deeper_whois_details d ON d.fk_address_id = a.id AND d.category = 'address'
          WHERE d.fk_programs_id = ? AND d.fk_org_id = ?
        `, [programId, orgId]));

        // Nameservers
        queries.push(db.query(`
          SELECT ns.id, 'nameservers' AS type, ns.nameserver AS value
          FROM deeper_core_nameservers ns
               JOIN deeper_whois_details d ON d.fk_nameserver_id = ns.id AND d.category = 'nameserver'
          WHERE d.fk_programs_id = ? AND d.fk_org_id = ?
        `, [programId, orgId]));

        // Phones
        queries.push(db.query(`
          SELECT p.id, 'phones' AS type, p.phone AS value
          FROM deeper_core_phones p
               JOIN deeper_whois_details d ON d.fk_phone_id = p.id AND d.category = 'phone'
          WHERE d.fk_programs_id = ? AND d.fk_org_id = ?
        `, [programId, orgId]));

        // Execute all queries
        const results = await Promise.all(queries);

        // Combine all results
        const combined = [
            ...results[0][0], // names
            ...results[1][0], // emails
            ...results[2][0], // addresses
            ...results[3][0], // nameservers
            ...results[4][0]  // phones
        ];

        res.json({
            success: true,
            data: combined
        });
    } catch (err) {
        console.error('Error fetching related WHOIS items:', err);
        res.status(500).json({
            success: false,
            error: 'Database error',
            details: err.message
        });
    }
});

// Create a new WHOIS record
router.post('/whois', async (req, res) => {
    const {type, value, fk_programs_id, fk_org_id} = req.body;
    if (!type || !whoisTypes[type]) {
        return res.status(400).json({
            success: false,
            error: 'Invalid WHOIS type. Must be one of: orgs, names, emails, addresses, nameservers, phones'
        });
    }
    if (!value || typeof value !== 'string' || value.trim() === '') {
        return res.status(400).json({success: false, error: 'Value must be a non-empty string'});
    }
    if (!fk_programs_id) {
        return res.status(400).json({success: false, error: 'fk_programs_id is required'});
    }

    // For non-org types, fk_org_id is required to establish relationship
    if (type !== 'orgs' && !fk_org_id) {
        return res.status(400).json({success: false, error: 'fk_org_id is required for non-organization types'});
    }

    const {coreTable, coreField, linkTable, linkField, category} = whoisTypes[type];

    try {
        // Start transaction
        await db.query('START TRANSACTION');

        if (type === 'orgs') {
            // Insert or find the organization
            const [checkResult] = await db.query(
                `SELECT id
                FROM ${coreTable}
                WHERE ${coreField} = ? AND fk_programs_id = ?`,
                [value, fk_programs_id]
            );
            let coreId;

            if (checkResult.length > 0) {
                coreId = checkResult[0].id;
                console.log(`[WHOIS] Found existing ${type} with ID: ${coreId}`);
            } else {
                const [insertResult] = await db.query(
                    `INSERT INTO ${coreTable} (${coreField}, fk_programs_id)
                    VALUES (?, ?)`,
                    [value, fk_programs_id]
                );
                coreId = insertResult.insertId;
                console.log(`[WHOIS] Created new ${type} with ID: ${coreId}`);
            }

            // Create link record for organization
            const [linkResult] = await db.query(
                `INSERT INTO ${linkTable} (category, ${linkField}, fk_programs_id)
                VALUES (?, ?, ?)`,
                [category, coreId, fk_programs_id]
            );

            await db.query('COMMIT');
            res.status(201).json({
                success: true,
                message: `WHOIS ${type.slice(0, -1)} created successfully`,
                id: coreId
            });
        } else {
            // Handle non-org types
            // First check if the org exists
            const [orgCheck] = await db.query(`SELECT id
            FROM deeper_core_organizations
            WHERE id = ?`, [fk_org_id]);
            if (orgCheck.length === 0) {
                await db.query('ROLLBACK');
                return res.status(400).json({success: false, error: 'Organization not found'});
            }

            // Insert or find the core record (name, email, etc.)
            console.log(`[WHOIS] Inserting into ${coreTable} ${coreField} ${value}`);
            const [checkResult] = await db.query(`SELECT id
            FROM ${coreTable}
            WHERE ${coreField} = ?`, [value]);
            let coreRow;

            if (checkResult.length > 0) {
                coreRow = checkResult[0];
                console.log(`[WHOIS] Found existing ${type} with ID: ${coreRow.id}`);
            } else {
                // Only insert the value for non-org types (no fk_programs_id)
                const [insertResult] = await db.query(
                    `INSERT INTO ${coreTable} (${coreField})
                    VALUES (?)`,
                    [value]
                );
                coreRow = {id: insertResult.insertId};
                console.log(`[WHOIS] Selected coreRow: ${JSON.stringify(coreRow)}`);
            }

            // Create the entity record without org reference
            try {
                // Generic approach for all types using dynamic SQL construction
                // We create a record that links only the specific entity type
                const fields = ['category', linkField, 'fk_programs_id'];
                const values = [category, coreRow.id, fk_programs_id];
                const placeholders = Array(fields.length).fill('?').join(', ');

                const insertSQL = `INSERT INTO ${linkTable} (${fields.join(', ')})
                VALUES (${placeholders})`;
                await db.query(insertSQL, values);

                // Now we need to create the relationship between org and this entity
                // For WHOIS, we use the same approach as RDAP
                const relatedSql = `
                  SELECT id
                  FROM ${linkTable}
                  WHERE category = ? AND ${linkField} = ? AND fk_programs_id = ?
                `;
                const [relatedResult] = await db.query(relatedSql, [category, coreRow.id, fk_programs_id]);

                if (relatedResult.length > 0) {
                    const entityId = relatedResult[0].id;

                    // Now update the entity to link it to the organization
                    const updateSql = `
                      UPDATE ${linkTable}
                      SET fk_org_id = ?
                      WHERE id = ?
                    `;
                    await db.query(updateSql, [fk_org_id, entityId]);
                }

                await db.query('COMMIT');
                res.status(201).json({
                    success: true,
                    message: `WHOIS ${type.slice(0, -1)} created successfully`,
                    id: coreRow.id
                });
            } catch (error) {
                console.error(`Error creating WHOIS ${type} record:`, error);
                await db.query('ROLLBACK');
                return res.status(500).json({success: false, error: error.message || 'Database error'});
            }
        }
    } catch (err) {
        console.error(`Error in WHOIS ${type} creation:`, err);
        try {
            await db.query('ROLLBACK');
        } catch (rollbackErr) {
            console.error('Error during rollback:', rollbackErr);
        }
        return res.status(500).json({
            success: false,
            error: err.message || 'An error occurred during record creation',
        });
    }
});

// Update a RDAP record
router.put('/rdap/:type/:id', async (req, res) => {
    const {type, id} = req.params;
    const {value, fk_programs_id} = req.body;

    if (!type || !rdapTypes[type]) {
        return res.status(400).json({
            success: false,
            error: 'Invalid RDAP type. Must be one of: orgs, names, emails, addresses, nameservers, phones, groups'
        });
    }

    if (!id) {
        return res.status(400).json({
            success: false,
            error: 'ID is required'
        });
    }

    if (!value || typeof value !== 'string' || value.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'Value must be a non-empty string'
        });
    }

    if (!fk_programs_id) {
        return res.status(400).json({
            success: false,
            error: 'fk_programs_id is required'
        });
    }

    const {coreTable, coreField} = rdapTypes[type];

    try {
        // Start a transaction
        await db.query('START TRANSACTION');

        // Update the core record
        const [updateResult] = await db.query(
            `UPDATE ${coreTable}
            SET ${coreField} = ?
            WHERE id = ?`,
            [value, id]
        );

        if (updateResult.affectedRows === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                error: `RDAP ${type.slice(0, -1)} with ID ${id} not found`
            });
        }

        await db.query('COMMIT');

        res.json({
            success: true,
            message: `RDAP ${type.slice(0, -1)} updated successfully`
        });
    } catch (err) {
        // Ensure transaction is rolled back on error
        try {
            await db.query('ROLLBACK');
        } catch (rollbackErr) {
            console.error('Error rolling back transaction:', rollbackErr);
        }

        console.error(`Error updating RDAP ${type} record:`, err);
        res.status(500).json({
            success: false,
            error: 'Database error',
            details: err.message
        });
    }
});

// Delete a RDAP record
router.delete('/rdap/:type/:id', async (req, res) => {
    const {type, id} = req.params;
    const {fk_programs_id} = req.query;

    if (!type || !rdapTypes[type]) {
        return res.status(400).json({
            success: false,
            error: 'Invalid RDAP type. Must be one of: orgs, names, emails, addresses, nameservers, phones, groups'
        });
    }

    if (!id) {
        return res.status(400).json({
            success: false,
            error: 'ID is required'
        });
    }

    if (!fk_programs_id) {
        return res.status(400).json({
            success: false,
            error: 'fk_programs_id is required'
        });
    }

    const {coreTable, linkTable, linkField, category} = rdapTypes[type];

    try {
        // Start a transaction
        await db.query('START TRANSACTION');

        // For orgs, first delete all related records
        if (type === 'orgs') {
            // Remove links to email, name, address, etc.
            await db.query(`DELETE
            FROM ${linkTable}
            WHERE ${linkField} = ? AND fk_programs_id = ?`, [id, fk_programs_id]);
        } else {
            // Delete the link record
            await db.query(
                `DELETE
                FROM ${linkTable}
                WHERE category = ? AND ${linkField} = ? AND fk_programs_id = ?`,
                [category, id, fk_programs_id]
            );
        }

        // Delete the core record
        const [deleteResult] = await db.query(`DELETE
        FROM ${coreTable}
        WHERE id = ?`, [id]);

        if (deleteResult.affectedRows === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                error: `RDAP ${type.slice(0, -1)} with ID ${id} not found`
            });
        }

        await db.query('COMMIT');

        res.json({
            success: true,
            message: `RDAP ${type.slice(0, -1)} deleted successfully`
        });
    } catch (err) {
        // Ensure transaction is rolled back on error
        try {
            await db.query('ROLLBACK');
        } catch (rollbackErr) {
            console.error('Error rolling back transaction:', rollbackErr);
        }

        console.error(`Error deleting RDAP ${type} record:`, err);
        res.status(500).json({
            success: false,
            error: 'Database error',
            details: err.message
        });
    }
});

// Network diagram endpoint - fetch network data for an apex domain
router.get('/visual-recon/:domain', async (req, res) => {
    const { domain } = req.params;

    try {
        // 1. Get apex domain info
        const [apexRows] = await db.query(`
            SELECT iad.id AS id, iad.apex_domain as domain, iad.fk_programs_id, p.program as program_name
            FROM shared_program_apex_domains iad
            JOIN shared_programs p ON iad.fk_programs_id = p.id
            WHERE iad.apex_domain = ? AND iad.is_active = 1
            LIMIT 1
        `, [domain]);

        if (!apexRows.length) {
            return res.status(404).json({ error: 'Apex domain not found' });
        }

        const apex = apexRows[0];

        // 2. Get linked subdomains
        const [subdomains] = await db.query(`
            SELECT s.id AS id, s.subdomain, s.ip_address, s.fk_apex_domains_id
            FROM deeper_subdomains s
            WHERE s.fk_apex_domains_id = ? AND s.is_active = 1
        `, [apex.id]);

        // 3. Get URLs for these subdomains
        const subdomainIds = subdomains.map(s => s.id);
        let urls = [];
        if (subdomainIds.length > 0) {
            const placeholders = subdomainIds.map(() => '?').join(',');
            const [urlRows] = await db.query(`
                SELECT u.id AS id, u.url, u.fk_subdomains_id
                FROM deeper_urls u
                WHERE u.fk_subdomains_id IN (${placeholders}) AND u.is_inscope = 1
            `, subdomainIds);
            urls = urlRows;
        }

        // 4. Get linked ASNs
        const [asns] = await db.query(`
            SELECT a.id AS id, a.asn, GROUP_CONCAT(DISTINCT am.name) as names, 
                   GROUP_CONCAT(DISTINCT am.country) as countries
            FROM deeper_asn a
            JOIN link_apex_asn laa ON a.id = laa.fk_asn_id
            LEFT JOIN deeper_asn_metadatas am ON a.id = am.fk_asn_id
            WHERE laa.fk_apex_domains_id = ?
            GROUP BY a.id, a.asn
        `, [apex.id]);

        // Process ASN data
        const processedAsns = asns.map(asn => ({
            ...asn,
            names: asn.names ? asn.names.split(',').filter(Boolean) : [],
            countries: asn.countries ? asn.countries.split(',').filter(Boolean) : []
        }));

        // 5. Get linked CIDR ranges
        const [cidrs] = await db.query(`
            SELECT c.id AS id, c.cidr_range, cm.is_inscope, cm.is_ipv4
            FROM deeper_cidr_ranges c
            JOIN link_apex_domains_cidr_ranges lac ON c.id = lac.fk_cidr_ranges_id
            LEFT JOIN deeper_cidr_ranges_metadatas cm ON c.id = cm.fk_cidr_ranges_id
            WHERE lac.fk_apex_domains_id = ?
        `, [apex.id]);

        // Add IP containment check for subdomains
        const processedCidrs = cidrs.map(cidr => ({
            ...cidr,
            contains_ip: subdomains.some(sub =>
                sub.ip_address && isIPInCIDR(sub.ip_address, cidr.cidr_range)
            )
        }));

        res.json({
            apex,
            subdomains,
            urls,
            asns: processedAsns,
            cidrs: processedCidrs
        });

    } catch (err) {
        console.error('Error fetching network data:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});

// Helper function to check if IP is in CIDR range
function isIPInCIDR(ip, cidr) {
    try {
        const [network, bits] = cidr.split('/');
        const mask = ~(2 ** (32 - parseInt(bits)) - 1);

        const ipNum = ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
        const networkNum = network.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);

        return (ipNum & mask) === (networkNum & mask);
    } catch (e) {
        return false;
    }
}

module.exports = router;
