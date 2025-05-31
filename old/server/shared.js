const express = require('express');
const router = express.Router();
const db = require('./db');

// Get all programs with pagination and search
router.get('/programs', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;

    try {
        let countQuery = `
          SELECT COUNT(*) AS total
          FROM shared_programs p
               LEFT JOIN shared_platforms pl ON p.fk_bb_site = pl.id
        `;

        let dataQuery = `
          SELECT p.id,
                 p.program,
                 p.visibility,
                 p.is_active,
                 p.fk_bb_site                                                AS platform_id,
                 pl.platform                                                 AS platform_name,
                 pl.url                                                      AS platform_url,
                 spt.category,
                 CASE
                   WHEN pl.id = 2 THEN CONCAT(pl.url, '/', spt.category, '/', p.program)
                   WHEN pl.id = 3 THEN CONCAT(pl.url, '/', p.program)
                   ELSE NULL
                 END AS program_url,
                 (SELECT COUNT(*)
                 FROM shared_program_apex_domains iad
                 WHERE iad.fk_programs_id = p.id)                            AS domains,
                 CASE WHEN p.is_active = 1 THEN 'active' ELSE 'inactive' END AS status
          FROM shared_programs p
               LEFT JOIN shared_platforms pl ON p.fk_bb_site = pl.id
               LEFT JOIN shared_program_types spt ON spt.id = p.fk_program_type
        `;
        const searchCondition = search
            ? ` WHERE (p.program LIKE ? OR p.visibility LIKE ? OR IFNULL(pl.platform, '') LIKE ?)`
            : '';
        const countParams = search ? [search, search, search] : [];
        const dataParams = search ? [search, search, search, limit, offset] : [limit, offset];

        countQuery += searchCondition;
        dataQuery += searchCondition + ` ORDER BY p.id ASC LIMIT ? OFFSET ?`;

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
        console.error('Error fetching programs:', err.stack);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Get all apex domains with pagination and search
router.get('/apex-domains', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search}%` : null;

    // Add orderBy and orderDir parameters
    const orderBy = req.query.orderBy || 'id'; // Default to id
    const orderDir = req.query.orderDir || 'asc'; // Default to ascending

    try {
        let countQuery = `
          SELECT COUNT(*) AS total
          FROM shared_program_apex_domains iad
               LEFT JOIN shared_programs p ON iad.fk_programs_id = p.id
        `;

        let dataQuery = `
          SELECT iad.id,
                 iad.apex_domain,
                 iad.is_active,
                 iad.fk_programs_id,
                 p.program    AS program_name,
                 p.fk_bb_site AS platform_id,
                 pl.platform  AS platform_name
          FROM shared_program_apex_domains iad
               LEFT JOIN shared_programs p ON iad.fk_programs_id = p.id
               LEFT JOIN shared_platforms pl ON p.fk_bb_site = pl.id
        `;

        const searchCondition = search
            ? ` WHERE iad.apex_domain LIKE ? OR p.program LIKE ?`
            : '';
        const countParams = search ? [search, search] : [];
        const dataParams = search ? [search, search, limit, offset] : [limit, offset];

        countQuery += searchCondition;

        // Add ORDER BY clause based on parameters
        let orderByClause = '';
        if (orderBy.includes(',')) {
            // Handle multiple columns for sorting
            const columns = orderBy.split(',');
            orderByClause = ` ORDER BY iad.${columns[0]} ${orderDir}, iad.${columns[1]} ${orderDir}`;
        } else {
            orderByClause = ` ORDER BY iad.${orderBy} ${orderDir}`;
        }

        dataQuery += searchCondition + orderByClause + ` LIMIT ? OFFSET ?`;

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
        console.error('Error fetching apex domains:', err.stack);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

router.get('/programs/dropdown', async (req, res) => {
    try {
        const query = `
          SELECT id, program
          FROM shared_programs
          WHERE is_active = 1
          ORDER BY program
        `;
        const [programs] = await db.query(query);
        res.json(programs);
    } catch (err) {
        console.error('Error fetching programs for dropdown:', err.stack);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Get a specific program
router.get('/programs/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const query = `
          SELECT p.id,
                 p.program,
                 p.visibility,
                 p.is_active,
                 p.fk_bb_site,
                 pl.platform AS platform_name,
                 pl.url AS platform_url,
                 spt.category,
                 CASE
                   WHEN pl.id = 2 THEN CONCAT(pl.url, '/', spt.category, '/', p.program)
                   WHEN pl.id = 3 THEN CONCAT(pl.url, '/', p.program)
                   ELSE NULL
                 END AS program_url
          FROM shared_programs p
               LEFT JOIN shared_platforms pl ON p.fk_bb_site = pl.id
               LEFT JOIN shared_program_types spt ON spt.id = p.fk_program_type
          WHERE p.id = ?
        `;

        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({success: false, error: 'Program not found'});
        }

        res.json({
            success: true,
            data: rows[0],
        });
    } catch (err) {
        console.error('Error fetching program:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Create a new program
router.post('/programs', async (req, res) => {
    const {program, visibility, fk_bb_site, is_active} = req.body;

    if (!program) {
        return res.status(400).json({success: false, error: 'Program name is required'});
    }

    try {
        const query = `
          INSERT INTO shared_programs (program, visibility, fk_bb_site, is_active)
          VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            program,
            visibility || 'public',
            fk_bb_site || null,
            is_active !== undefined ? is_active : 1,
        ]);

        res.status(201).json({
            success: true,
            message: 'Program created successfully',
            program_id: result.insertId,
        });
    } catch (err) {
        console.error('Error creating program:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Update an existing program
router.put('/programs/:id', async (req, res) => {
    const {id} = req.params;
    const {program, visibility, fk_bb_site, is_active, status, platform} = req.body;

    try {
        const query = `
          UPDATE shared_programs
          SET program = ?,
              visibility = ?,
              fk_bb_site = ?,
              is_active = ?
          WHERE id = ?
        `;

        // Convert status to is_active if provided
        const activeStatus = status ? (status === 'active' ? 1 : 0) :
            is_active !== undefined ? is_active : 1;

        // Handle platform - find platform ID if provided as string
        let platformId = fk_bb_site;
        if (platform && !fk_bb_site) {
            const [platformRows] = await db.query(
                'SELECT id FROM shared_platforms WHERE platform = ?',
                [platform]
            );
            if (platformRows.length > 0) {
                platformId = platformRows[0].id;
            }
        }

        const [result] = await db.query(query, [
            program,
            visibility,
            platformId,
            activeStatus,
            id,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({success: false, error: 'Program not found'});
        }

        res.json({
            success: true,
            message: 'Program updated successfully',
        });
    } catch (err) {
        console.error('Error updating program:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Delete a program
router.delete('/programs/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const [checkResult] = await db.query('SELECT id FROM shared_programs WHERE id = ?', [id]);

        if (checkResult.length === 0) {
            return res.status(404).json({success: false, error: 'Program not found'});
        }

        const [deleteResult] = await db.query('DELETE FROM shared_programs WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Program deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting program:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Get platform information for a program
router.get('/programs/:id/platform', async (req, res) => {
    const {id} = req.params;

    try {
        const query = `
          SELECT p.id,
                 p.fk_bb_site AS platform_id,
                 pl.platform  AS platform_name
          FROM shared_programs p
               LEFT JOIN shared_platforms pl ON p.fk_bb_site = pl.id
          WHERE p.id = ?
        `;

        const [programInfo] = await db.query(query, [id]);

        if (programInfo.length === 0) {
            return res.status(404).json({success: false, error: 'Program not found'});
        }

        res.json({
            success: true,
            data: programInfo[0],
        });
    } catch (err) {
        console.error('Error fetching program platform info:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Get a program's scope domains
router.get('/programs/:id/scope', async (req, res) => {
    const {id} = req.params;

    try {
        const query = `
          SELECT sad.id,
                 sad.apex_domain,
                 sad.is_active,
                 sad.fk_programs_id,
                 p.fk_bb_site AS platform_id,
                 pl.platform AS platform_name
          FROM shared_program_apex_domains sad
               JOIN shared_programs p ON sad.fk_programs_id = p.id
               LEFT JOIN shared_platforms pl ON p.fk_bb_site = pl.id
          WHERE sad.fk_programs_id = ?
          ORDER BY sad.apex_domain
        `;

        const [domains] = await db.query(query, [id]);

        res.json({
            success: true,
            data: domains,
        });
    } catch (err) {
        console.error('Error fetching program scope domains:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Add a scope domain to a program
router.post('/programs/:id/scope', async (req, res) => {
    const {id} = req.params;
    const {apex_domain, is_active} = req.body;

    if (!apex_domain) {
        return res.status(400).json({success: false, error: 'Apex domain is required'});
    }

    try {
        const query = `
          INSERT INTO shared_program_apex_domains (apex_domain, is_active, fk_programs_id)
          VALUES (?, ?, ?)
        `;

        const [result] = await db.query(query, [
            apex_domain,
            is_active !== undefined ? is_active : 1,
            id,
        ]);

        res.status(201).json({
            success: true,
            message: 'Scope domain added successfully',
            domain_id: result.insertId,
        });
    } catch (err) {
        console.error('Error adding scope domain:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Update a scope domain
router.put('/programs/scope/:domain_id', async (req, res) => {
    const {domain_id} = req.params;
    const {apex_domain, is_active} = req.body;

    try {
        const query = `
          UPDATE shared_program_apex_domains
          SET apex_domain = ?,
              is_active = ?
          WHERE id = ?
        `;

        const [result] = await db.query(query, [
            apex_domain,
            is_active,
            domain_id,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({success: false, error: 'Scope domain not found'});
        }

        res.json({
            success: true,
            message: 'Scope domain updated successfully',
        });
    } catch (err) {
        console.error('Error updating scope domain:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Delete a scope domain
router.delete('/programs/scope/:domain_id', async (req, res) => {
    const {domain_id} = req.params;

    try {
        const query = `
          DELETE
          FROM shared_program_apex_domains
          WHERE id = ?
        `;

        const [result] = await db.query(query, [domain_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({success: false, error: 'Scope domain not found'});
        }

        res.json({
            success: true,
            message: 'Scope domain deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting scope domain:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Get platforms for dropdown
router.get('/platforms', async (req, res) => {
    try {
        const query = `
          SELECT id, platform, url
          FROM shared_platforms
          ORDER BY platform
        `;

        const [platforms] = await db.query(query);

        res.json({
            success: true,
            data: platforms,
        });
    } catch (err) {
        console.error('Error fetching platforms:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Get program metrics
router.get('/programs-metrics', async (req, res) => {
    try {
        const results = await Promise.all([
            db.query('SELECT COUNT(*) AS total FROM shared_programs'),
            db.query('SELECT COUNT(*) AS active FROM shared_programs WHERE is_active = 1'),
            db.query('SELECT COUNT(*) AS inactive FROM shared_programs WHERE is_active = 0'),
            db.query(`
              SELECT COUNT(*) AS with_domains
              FROM shared_programs p
              WHERE EXISTS (SELECT 1
              FROM shared_program_apex_domains d
              WHERE d.fk_programs_id = p.id)
            `),
            db.query(`
              SELECT COUNT(*) AS public_programs
              FROM shared_programs
              WHERE visibility = 'public'
            `),
            db.query(`
              SELECT COUNT(*) AS private_programs
              FROM shared_programs
              WHERE visibility = 'private'
            `)
        ]);

        res.json({
            total_programs: results[0][0][0].total || 0,
            active_programs: results[1][0][0].active || 0,
            inactive_programs: results[2][0][0].inactive || 0,
            with_domains: results[3][0][0].with_domains || 0,
            public_programs: results[4][0][0].public_programs || 0,
            private_programs: results[5][0][0].private_programs || 0
        });
    } catch (err) {
        console.error('Error fetching program metrics:', err);
        res.status(500).json({
            error: 'Database error',
            details: err.message,
        });
    }
});

// Import CSV programs endpoint
router.post('/programs/import-csv', async (req, res) => {
    const { programs } = req.body;
    if (!Array.isArray(programs) || programs.length === 0) {
        return res.status(400).json({ success: false, error: 'No programs provided' });
    }
    // Helper to sanitize string
    const sanitize = (str) => {
        if (typeof str !== 'string') return '';
        return str.replace(/[<>"'\\]/g, '').trim();
    };
    // Group by program name
    const programMap = new Map();
    for (const row of programs) {
        const program = sanitize(row.program);
        const platform = sanitize(row.platform);
        const visibility = sanitize(row.visibility) || 'public';
        const status = sanitize(row.status) || 'active';
        const apex_domain = sanitize(row.apex_domain);
        if (!program || !apex_domain) continue;
        const key = program.toLowerCase();
        if (!programMap.has(key)) {
            programMap.set(key, {
                program,
                platform,
                visibility,
                status,
                apex_domains: new Set(),
            });
        }
        programMap.get(key).apex_domains.add(apex_domain);
    }
    const addedPrograms = [];
    const updatedPrograms = [];
    const errors = [];
    try {
        for (const [key, entry] of programMap.entries()) {
            // Check if program exists
            const [existingRows] = await db.query('SELECT id FROM shared_programs WHERE program = ?', [entry.program]);
            let programId;
            if (existingRows.length > 0) {
                // Program exists, add new apex domains if needed
                programId = existingRows[0].id;
                let addedDomains = 0;
                for (const domain of entry.apex_domains) {
                    const [domainRows] = await db.query('SELECT id FROM shared_program_apex_domains WHERE fk_programs_id = ? AND apex_domain = ?', [programId, domain]);
                    if (domainRows.length === 0) {
                        await db.query('INSERT INTO shared_program_apex_domains (apex_domain, is_active, fk_programs_id) VALUES (?, 1, ?)', [domain, programId]);
                        addedDomains++;
                    }
                }
                updatedPrograms.push({ program: entry.program, addedDomains });
            } else {
                // Insert new program
                let platformId = null;
                if (entry.platform) {
                    const [platformRows] = await db.query('SELECT id FROM shared_platforms WHERE platform = ?', [entry.platform]);
                    if (platformRows.length > 0) platformId = platformRows[0].id;
                }
                const is_active = entry.status.toLowerCase() === 'active' ? 1 : 0;
                const [result] = await db.query(
                    'INSERT INTO shared_programs (program, visibility, fk_bb_site, is_active) VALUES (?, ?, ?, ?)',
                    [entry.program, entry.visibility, platformId, is_active]
                );
                programId = result.insertId;
                let addedDomains = 0;
                for (const domain of entry.apex_domains) {
                    await db.query('INSERT INTO shared_program_apex_domains (apex_domain, is_active, fk_programs_id) VALUES (?, 1, ?)', [domain, programId]);
                    addedDomains++;
                }
                addedPrograms.push({ program: entry.program, addedDomains });
            }
        }
        res.json({
            success: true,
            addedPrograms,
            updatedPrograms,
            errors,
            message: `Added ${addedPrograms.length} new programs, updated ${updatedPrograms.length} existing.`
        });
    } catch (err) {
        console.error('CSV import error:', err);
        errors.push(err.message);
        res.status(500).json({ success: false, error: 'Database error', details: err.message });
    }
});

module.exports = router;