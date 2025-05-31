// ~/my/codes/deeplike/server/sls.js

const express = require('express');
const router = express.Router();
const db = require('./db');
const {spawn} = require('child_process');

// Helper function to strip protocol from URLs
function stripProtocol(url) {
    if (!url) return '';
    return url.replace(/^(https?|ftp|sftp|file):\/\//, '');
}

// Helper function to check if a domain is a subdomain
function isDomainOrSubdomain(testDomain, rootDomain) {
    if (!testDomain || !rootDomain) return false;
    testDomain = testDomain.toLowerCase().trim();
    rootDomain = rootDomain.toLowerCase().trim();
    if (testDomain === rootDomain) return true;
    if (testDomain.endsWith('.' + rootDomain)) return true;
    return false;
}

// Helper function to get or create a TPLSS category
async function getOrCreateTPLCategory(categoryName) {
    if (!categoryName || typeof categoryName !== 'string') {
        throw new Error('Valid category name is required');
    }

    const standardizedName = categoryName.toLowerCase().trim().replace(/\s+/g, '_');

    try {
        const [existingRows] = await db.query(
            'SELECT id FROM sls_tpl_categories WHERE category = ?',
            [standardizedName]
        );

        if (existingRows && existingRows.length > 0) {
            return existingRows[0].id;
        }

        const [insertResult] = await db.query(
            'INSERT INTO sls_tpl_categories (category) VALUES (?)',
            [standardizedName]
        );

        return insertResult.insertId;
    } catch (error) {
        console.error('Error in getOrCreateTPLCategory:', error);
        throw error;
    }
}

// --- Alert Routes ---

// Fetch alert counts (for Dashboard)
router.get('/alerts/counts', async (req, res) => {
    try {
        const results = await Promise.all([
            db.query(`
              SELECT COUNT(DISTINCT pc.id) AS unviewed_credentials
              FROM sls_program_credentials pc
                   JOIN sls_credentials c ON pc.fk_credentials_id = c.id
                   JOIN shared_programs p ON pc.fk_programs_id = p.id
                   JOIN shared_program_apex_domains iad ON p.id = iad.fk_programs_id
              WHERE pc.viewed = 0
                AND (SUBSTRING_INDEX(c.email, '@', -1) = iad.apex_domain
                     OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', iad.apex_domain))
            `),
            db.query('SELECT COUNT(*) AS total_credentials_fallback FROM sls_credentials'),
            db.query(`
              SELECT COUNT(DISTINCT pc.id) AS program_credentials_count
              FROM sls_program_credentials pc
                   JOIN sls_credentials c ON pc.fk_credentials_id = c.id
                   JOIN shared_programs p ON pc.fk_programs_id = p.id
                   JOIN shared_program_apex_domains iad ON p.id = iad.fk_programs_id
              WHERE (SUBSTRING_INDEX(c.email, '@', -1) = iad.apex_domain
                     OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', iad.apex_domain))
            `),
            db.query(`
              SELECT COUNT(DISTINCT wc.id) AS working_credentials
              FROM sls_working_credentials wc
                   JOIN sls_credentials c ON wc.fk_credentials_id = c.id
                   JOIN shared_programs p ON wc.fk_programs_id = p.id
                   JOIN shared_program_apex_domains iad ON p.id = iad.fk_programs_id
              WHERE (SUBSTRING_INDEX(c.email, '@', -1) = iad.apex_domain
                     OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', iad.apex_domain))
            `),
            db.query('SELECT COUNT(*) AS active_channels FROM sls_tg_channels WHERE is_active = 1'),
            db.query('SELECT COUNT(*) AS pending_files FROM sls_tg_files WHERE downloaded = 0'),
            db.query('SELECT row_count FROM sls_credential_stats WHERE table_name = "credentials" ORDER BY last_updated DESC LIMIT 1'),
        ]);

        const [
            [unviewedRows],
            [totalFallbackRows],
            [programRows],
            [workingRows],
            [channelsRows],
            [pendingRows],
            [statRows],
        ] = results;

        const result = {
            unviewed_credentials: unviewedRows[0].unviewed_credentials || 0,
            total_credentials: statRows ? statRows[0].row_count || totalFallbackRows[0].total_credentials_fallback || 0 : totalFallbackRows[0].total_credentials_fallback || 0,
            program_credentials_count: programRows[0].program_credentials_count || 0,
            working_credentials: workingRows[0].working_credentials || 0,
            active_channels: channelsRows[0].active_channels || 0,
            pending_files: pendingRows[0].pending_files || 0,
        };

        res.json(result);
    } catch (err) {
        console.error('Error executing alert counts:', err.stack);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Fetch program credential alerts with pagination and search (for ProgramCredentials page)
router.get('/alerts/program-credentials', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || null;
    const searchPattern = search ? `%${search}%` : null;

    try {
        let countQuery = `
          SELECT COUNT(DISTINCT pc.id) AS total
          FROM sls_program_credentials pc
               LEFT JOIN sls_credentials c ON pc.fk_credentials_id = c.id
               LEFT JOIN shared_programs p ON pc.fk_programs_id = p.id
               LEFT JOIN sls_credentials_login_domains cld ON c.id = cld.fk_credentials_id
               LEFT JOIN sls_login_domains ld ON cld.fk_login_domains_id = ld.id
               LEFT JOIN sls_working_credentials wc ON pc.fk_credentials_id = wc.fk_credentials_id
               LEFT JOIN shared_platforms pl ON p.fk_bb_site = pl.id
          WHERE pc.viewed = 0 AND wc.id IS NULL
        `;
        let dataQuery = `
          SELECT pc.id,
                 p.program,
                 pc.viewed,
                 pc.fk_credentials_id,
                 IFNULL(CONCAT('https://', ld.domain), 'N/A') AS protocolDomain,
                 IFNULL(CONCAT('https://', ld.domain), 'N/A') AS 'protocol/domain',
                 c.email,
                 IFNULL(c.password, 'N/A')                    AS password,
                 p.fk_bb_site                                 AS platform_id,
                 pl.platform                                  AS platform_name
          FROM sls_program_credentials pc
               LEFT JOIN sls_credentials c ON pc.fk_credentials_id = c.id
               LEFT JOIN shared_programs p ON pc.fk_programs_id = p.id
               LEFT JOIN sls_credentials_login_domains cld ON c.id = cld.fk_credentials_id
               LEFT JOIN sls_login_domains ld ON cld.fk_login_domains_id = ld.id
               LEFT JOIN sls_working_credentials wc ON pc.fk_credentials_id = wc.fk_credentials_id
               LEFT JOIN shared_platforms pl ON p.fk_bb_site = pl.id
          WHERE pc.viewed = 0 AND wc.id IS NULL
        `;

        const searchCondition = search
            ? ` AND (p.program LIKE ? OR IFNULL(ld.domain, '') LIKE ? OR c.email LIKE ?)`
            : '';
        const countParams = search ? [searchPattern, searchPattern, searchPattern] : [];
        const dataParams = search ? [searchPattern, searchPattern, searchPattern, limit, offset] : [limit, offset];

        countQuery += searchCondition;
        dataQuery += searchCondition + ` ORDER BY pc.id DESC LIMIT ? OFFSET ?`;

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
        console.error('Error fetching program credential alerts:', err.stack);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Get sls_program_credentials(id) from fk_credentials_id
router.get('/alerts/program-credentials/for-credential/:id', async (req, res) => {
    const {id} = req.params;

    const query = `
      SELECT id
      FROM sls_program_credentials
      WHERE fk_credentials_id = ?
      LIMIT 1
    `;

    try {
        const [results] = await db.query(query, [id]);

        if (!results || results.length === 0) {
            return res.status(404).json({error: 'Program credential not found'});
        }

        res.json({id: results[0].id});
    } catch (err) {
        console.error('Error fetching program credential ID:', err);
        res.status(500).json({error: 'Database error'});
    }
});

// Mark all alerts as viewed
router.put('/alerts/program-credentials/mark-all-viewed', async (req, res) => {
    try {
        const query = `
          UPDATE sls_program_credentials
          SET viewed = 1
          WHERE viewed = 0
        `;

        const [result] = await db.query(query);

        res.json({
            success: true,
            count: result.affectedRows,
            message: `Marked ${result.affectedRows} alerts as viewed`,
        });
    } catch (err) {
        console.error('Error marking all program credentials as viewed:', err);
        res.status(500).json({
            success: false,
            error: 'Database error',
            details: err.message,
        });
    }
});

// Mark page alerts as viewed
router.put('/alerts/program-credentials/mark-page-viewed', async (req, res) => {
    const {credentialIds} = req.body;

    if (!credentialIds || !Array.isArray(credentialIds) || credentialIds.length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Invalid or empty credential IDs array',
        });
    }

    try {
        const findProgramCredentialsQuery = `
          SELECT id
          FROM sls_program_credentials
          WHERE fk_credentials_id IN (${credentialIds.map(() => '?').join(',')})
            AND viewed = 0
        `;

        const [programCredRows] = await db.query(findProgramCredentialsQuery, credentialIds);

        if (!programCredRows || programCredRows.length === 0) {
            return res.json({
                success: true,
                count: 0,
                message: 'No matching program credentials found to update',
            });
        }

        const programCredIds = programCredRows.map(row => row.id);

        const updateQuery = `
          UPDATE sls_program_credentials
          SET viewed = 1
          WHERE id IN (${programCredIds.map(() => '?').join(',')})
        `;

        const [result] = await db.query(updateQuery, programCredIds);

        res.json({
            success: true,
            count: result.affectedRows,
            message: `Marked ${result.affectedRows} alerts as viewed`,
        });
    } catch (err) {
        console.error('Error marking page alerts as viewed:', err);
        res.status(500).json({
            success: false,
            error: 'Database error',
            details: err.message,
        });
    }
});

// Mark a single alert as viewed by credentials_id
router.put('/alerts/program-credentials/mark-credential-viewed/:credentials_id', async (req, res) => {
    const {credentials_id} = req.params;

    try {
        const [programCredResults] = await db.query(`
          SELECT id
          FROM sls_program_credentials
          WHERE fk_credentials_id = ?
          LIMIT 1
        `, [credentials_id]);

        if (!programCredResults || programCredResults.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No program credential found for this credentials ID',
            });
        }

        const id = programCredResults[0].id;

        const [updateResult] = await db.query(`
          UPDATE sls_program_credentials
          SET viewed = 1
          WHERE id = ?
        `, [id]);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Program credential not found or already marked as viewed',
            });
        }

        res.json({
            success: true,
            message: 'Program credential marked as viewed successfully',
            id: id,
            credentials_id: credentials_id,
        });
    } catch (err) {
        console.error('Error marking program credential as viewed:', err);
        res.status(500).json({
            success: false,
            error: 'Database error',
            details: err.message,
        });
    }
});

// --- Credentials Routes ---
// Fetch all credentials with pagination (for Credentials page)
router.get('/credentials', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    try {
        const searchPattern = `%${search}%`;
        let countQuery, dataQuery, countParams, dataParams;

        if (search) {
            countQuery = `
              SELECT COUNT(*) AS total
              FROM sls_credentials
              WHERE email LIKE ? OR password LIKE ? OR protocol LIKE ?
            `;
            dataQuery = `
              SELECT id,
                     protocol,
                     email,
                     password,
                     is_probable_password
              FROM sls_credentials
              WHERE email LIKE ? OR password LIKE ? OR protocol LIKE ?
              ORDER BY id DESC
              LIMIT ? OFFSET ?
            `;
            countParams = [searchPattern, searchPattern, searchPattern];
            dataParams = [searchPattern, searchPattern, searchPattern, limit, offset];
        } else {
            countQuery = `SELECT COUNT(*) AS total
            FROM sls_credentials`;
            dataQuery = `
              SELECT id,
                     protocol,
                     email,
                     password,
                     is_probable_password
              FROM sls_credentials
              ORDER BY id DESC
              LIMIT ? OFFSET ?
            `;
            countParams = [];
            dataParams = [limit, offset];
        }

        const [countResults] = await db.query(countQuery, countParams);
        const [dataRows] = await db.query(dataQuery, dataParams);

        const total = countResults[0].total || 0;

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
        console.error('Error fetching credentials:', err.message);
        res.status(500).json({
            error: 'Database error',
            message: err.message,
            details: err.stack,
        });
    }
});

// Delete a credential
router.delete('/credentials/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const [result] = await db.query('DELETE FROM sls_credentials WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            res.status(404).json({success: false, error: 'Credential not found'});
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Credential deleted successfully',
            deletedId: id,
        });
    } catch (err) {
        console.error('Error deleting credential:', err);
        res.status(500).json({
            success: false,
            error: 'Database error',
            details: err.message,
        });
    }
});

// Verify a credential
router.post('/credentials/:id/verify', async (req, res) => {
    const {id} = req.params;
    const {domain, program, login_domain, notes, submission} = req.body;

    try {
        let emailDomain = '';
        const [credentialResults] = await db.query('SELECT email FROM sls_credentials WHERE id = ?', [id]);

        if (credentialResults && credentialResults.length > 0) {
            const email = credentialResults[0].email;
            if (email && email.includes('@')) {
                emailDomain = email.split('@')[1];
            }
        }

        const domainToCheck = domain || emailDomain;
        if (!domainToCheck) {
            return res.status(400).json({success: false, error: 'No domain provided or found in email'});
        }

        const [inscope_domains] = await db.query(`
          SELECT iad.apex_domain, iad.fk_programs_id, p.program
          FROM shared_program_apex_domains iad
               JOIN shared_programs p ON iad.fk_programs_id = p.id
          WHERE p.is_active = 1
        `);

        let matchedProgram = null;
        for (const item of inscope_domains) {
            if (isDomainOrSubdomain(domainToCheck, item.apex_domain)) {
                matchedProgram = item;
                break;
            }
        }

        if (!matchedProgram && program) {
            const [programResults] = await db.query('SELECT id FROM shared_programs WHERE program = ?', [program]);
            if (programResults && programResults.length > 0) {
                matchedProgram = {
                    fk_programs_id: programResults[0].id,
                    program: program,
                    apex_domain: domainToCheck,
                };
            }
        }

        if (!matchedProgram) {
            return res.status(404).json({
                success: false,
                error: 'No matching program found for domain',
                checkedDomain: domainToCheck,
                availableDomains: inscope_domains.map(d => d.apex_domain),
            });
        }

        const programId = matchedProgram.fk_programs_id;
        let loginDomainId = null;
        const loginDomainToUse = stripProtocol(login_domain || domain || '');

        if (loginDomainToUse) {
            const [existingDomain] = await db.query(
                'SELECT id FROM sls_login_domains WHERE domain = ?',
                [loginDomainToUse]
            );

            if (existingDomain && existingDomain.length > 0) {
                loginDomainId = existingDomain[0].id;
            } else {
                const [newDomain] = await db.query(
                    'INSERT INTO sls_login_domains (domain, is_active) VALUES (?, 1)',
                    [loginDomainToUse]
                );
                loginDomainId = newDomain.insertId;

                await db.query(
                    'INSERT INTO sls_credentials_login_domains (fk_credentials_id, fk_login_domains_id) VALUES (?, ?)',
                    [id, loginDomainId]
                );
            }
        } else {
            return res.status(400).json({
                success: false,
                error: 'Login domain is required for verification',
            });
        }

        const [existingCheck] = await db.query(
            'SELECT id, notes, submission FROM sls_working_credentials WHERE fk_credentials_id = ? AND fk_programs_id = ? AND fk_login_domains_id = ?',
            [id, programId, loginDomainId]
        );

        if (existingCheck && existingCheck.length > 0) {
            const [updateResult] = await db.query(
                'UPDATE sls_working_credentials SET notes = ?, submission = ? WHERE id = ?',
                [
                    notes || existingCheck[0].notes,
                    submission ? 1 : 0,
                    existingCheck[0].id,
                ]
            );

            return res.json({
                success: true,
                message: 'Working credential updated successfully',
                id: existingCheck[0].id,
            });
        }

        const insertQuery = `
          INSERT INTO sls_working_credentials
          (fk_credentials_id, fk_programs_id, fk_login_domains_id, notes, submission)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE notes = VALUES(notes),
                                  submission = VALUES(submission)
        `;

        const [insertResult] = await db.query(
            insertQuery,
            [id, programId, loginDomainId, notes, submission ? 1 : 0]
        );

        return res.json({
            success: true,
            message: 'Credential verified successfully',
            id: insertResult.insertId,
            program: matchedProgram.program,
            domain: domainToCheck,
            login_domain: loginDomainToUse,
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            const [dupeCheck] = await db.query(
                'SELECT id FROM sls_working_credentials WHERE fk_credentials_id = ? AND fk_programs_id = ? AND fk_login_domains_id = ?',
                [id, programId, loginDomainId]
            );

            if (dupeCheck && dupeCheck.length > 0) {
                return res.json({
                    success: true,
                    message: 'Credential already verified',
                    id: dupeCheck[0].id,
                });
            }
        }

        console.error('Error in verify credential process:', err);
        res.status(500).json({
            success: false,
            error: 'Database error',
            details: err.message,
        });
    }
});

// --- Telegram Routes (for Telegram page) ---

// Fetch Telegram channels
router.get('/telegram-channels', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || null;
    const searchPattern = search ? `%${search}%` : null;

    try {
        let countQuery = `SELECT COUNT(*) AS total
        FROM sls_tg_channels`;
        let dataQuery = `
          SELECT id,
                 channel,
                 channel_id,
                 access_hash,
                 title,
                 url,
                 is_active
          FROM sls_tg_channels
        `;

        const searchCondition = search
            ? ` WHERE (channel LIKE ? OR title LIKE ? OR url LIKE ?)`
            : '';
        const countParams = search ? [searchPattern, searchPattern, searchPattern] : [];
        const dataParams = search ? [searchPattern, searchPattern, searchPattern, limit, offset] : [limit, offset];

        countQuery += searchCondition;
        dataQuery += searchCondition + ` ORDER BY id ASC LIMIT ? OFFSET ?`;

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
        console.error('Error fetching telegram channels:', err.stack);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Create a new Telegram channel
router.post('/telegram-channels', async (req, res) => {
    const {channel, title, url, channel_id, access_hash, active} = req.body;

    if (!channel) {
        return res.status(400).json({success: false, error: 'Channel name is required'});
    }

    try {
        const query = `
          INSERT INTO sls_tg_channels (channel, title, url, channel_id, access_hash, is_active)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            channel,
            title || null,
            url || null,
            channel_id || null,
            access_hash || null,
            active !== undefined ? active : 1,
        ]);

        res.status(201).json({
            success: true,
            message: 'Telegram channel created successfully',
            id: result.insertId,
        });
    } catch (err) {
        console.error('Error creating Telegram channel:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Update a Telegram channel
router.put('/telegram-channels/:id', async (req, res) => {
    const {id} = req.params;
    const {channel, title, url, channel_id, access_hash, active} = req.body;

    try {
        const query = `
          UPDATE sls_tg_channels
          SET channel = ?,
              title = ?,
              url = ?,
              channel_id = ?,
              access_hash = ?,
              is_active = ?
          WHERE id = ?
        `;

        const [result] = await db.query(query, [
            channel,
            title,
            url,
            channel_id,
            access_hash,
            active,
            id,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({success: false, error: 'Telegram channel not found'});
        }

        res.json({
            success: true,
            message: 'Telegram channel updated successfully',
        });
    } catch (err) {
        console.error('Error updating Telegram channel:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Delete a Telegram channel
router.delete('/telegram-channels/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const [result] = await db.query('DELETE FROM sls_tg_channels WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({success: false, error: 'Telegram channel not found'});
        }

        res.json({
            success: true,
            message: 'Telegram channel deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting Telegram channel:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Fetch Telegram files
router.get('/telegram-files', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || null;
    const searchPattern = search ? `%${search}%` : null;

    try {
        let query = `
          SELECT tf.id,
                 tf.file_id,
                 tf.filename,
                 tf.guid,
                 tf.file_size,
                 tf.file_date,
                 tf.downloaded,
                 tf.processed,
                 tf.queued_at,
                 tf.sha256,
                 tc.channel,
                 tc.title
          FROM sls_tg_files tf
               JOIN sls_tg_channels tc ON tf.fk_tg_channels_id = tc.id
        `;

        let countQuery = `
          SELECT COUNT(*) AS total
          FROM sls_tg_files tf
               JOIN sls_tg_channels tc ON tf.fk_tg_channels_id = tc.id
        `;

        const searchCondition = search
            ? `WHERE (tf.filename LIKE ? OR tf.guid LIKE ? OR tc.channel LIKE ? OR tc.title LIKE ?)`
            : '';

        query += searchCondition;
        query += ` ORDER BY tf.id DESC LIMIT ? OFFSET ?`;
        countQuery += searchCondition;

        const searchParams = search ? [search, search, search, search] : [];
        const dataParams = search ? [...searchParams, limit, offset] : [limit, offset];

        const [[countRow]] = await db.query(countQuery, searchParams);
        const [dataRows] = await db.query(query, dataParams);

        const total = countRow.total || 0;
        const totalPages = Math.max(1, Math.ceil(total / limit));

        res.json({
            data: dataRows || [],
            pagination: {
                total,
                current_page: page,
                total_pages: totalPages,
                per_page: limit,
            },
        });
    } catch (err) {
        console.error('Error fetching telegram files:', err.stack);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Create a new Telegram file
router.post('/telegram-files', async (req, res) => {
    const {
        file_id,
        fk_tg_channels_id,
        filename,
        guid,
        file_size,
        file_date,
        file_type,
        downloaded,
        processed
    } = req.body;

    if (!filename || !fk_tg_channels_id) {
        return res.status(400).json({success: false, error: 'Filename and channel ID are required'});
    }

    try {
        const query = `
          INSERT INTO sls_tg_files (file_id, fk_tg_channels_id, filename, guid, file_size,
                                    file_date, file_type, downloaded, processed, queued_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const [result] = await db.query(query, [
            file_id || null,
            fk_tg_channels_id,
            filename,
            guid || null,
            file_size || null,
            file_date || null,
            file_type || null,
            downloaded !== undefined ? downloaded : 0,
            processed !== undefined ? processed : 0,
        ]);

        res.status(201).json({
            success: true,
            message: 'Telegram file created successfully',
            id: result.insertId,
        });
    } catch (err) {
        console.error('Error creating Telegram file:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Update a Telegram file
router.put('/telegram-files/:id', async (req, res) => {
    const {id} = req.params;
    const {
        file_id,
        fk_tg_channels_id,
        filename,
        guid,
        file_size,
        file_date,
        file_type,
        downloaded,
        processed
    } = req.body;

    if (!filename) {
        return res.status(400).json({success: false, error: 'Filename is required'});
    }

    try {
        const query = `
          UPDATE sls_tg_files
          SET file_id = ?,
              fk_tg_channels_id = ?,
              filename = ?,
              guid = ?,
              file_size = ?,
              file_date = ?,
              file_type = ?,
              downloaded = ?,
              processed = ?
          WHERE id = ?
        `;

        const [result] = await db.query(query, [
            file_id || null,
            fk_tg_channels_id,
            filename,
            guid || null,
            file_size || null,
            file_date || null,
            file_type || null,
            downloaded !== undefined ? downloaded : 0,
            processed !== undefined ? processed : 0,
            id,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({success: false, error: 'Telegram file not found'});
        }

        res.json({
            success: true,
            message: 'Telegram file updated successfully',
        });
    } catch (err) {
        console.error('Error updating Telegram file:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Delete a Telegram file
router.delete('/telegram-files/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const [result] = await db.query('DELETE FROM sls_tg_files WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({success: false, error: 'Telegram file not found'});
        }

        res.json({
            success: true,
            message: 'Telegram file deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting Telegram file:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// --- TPLS Routes (for TPLS page) ---
// Get all TPLSS with pagination and search
// Get all TPLs with pagination and search
router.get('/tpls', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || null;
    const searchPattern = search ? `%${search}%` : null;

    try {
        let countQuery = `
          SELECT COUNT(*) AS total
          FROM sls_tpls t
        `;

        let dataQuery = `
          SELECT t.*, c.category
          FROM sls_tpls t
               LEFT JOIN sls_tpl_categories c ON t.fk_category_id = c.id
        `;

        const searchCondition = search ? ` WHERE t.domain LIKE ?` : '';
        const countParams = search ? [search] : [];
        const dataParams = search ? [search, limit, offset] : [limit, offset];

        countQuery += searchCondition;
        dataQuery += searchCondition + ` ORDER BY t.id DESC LIMIT ? OFFSET ?`;

        const [countRows] = await db.query(countQuery, countParams);
        const [dataRows] = await db.query(dataQuery, dataParams);

        const total = countRows.length > 0 ? countRows[0].total : 0;
        const totalPages = Math.max(1, Math.ceil(total / limit));

        res.json({
            data: dataRows,
            pagination: {
                total,
                current_page: page,
                total_pages: totalPages,
                per_page: limit,
            },
        });
    } catch (err) {
        console.error('Error fetching TPLs:', err);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Get a specific TPLS
router.get('/tpls/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const query = `
          SELECT t.*, c.category
          FROM sls_tpls t
               LEFT JOIN sls_tpl_categories c ON t.fk_category_id = c.id
          WHERE t.id = ?
        `;

        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({success: false, error: 'TPL not found'});
        }

        res.json({
            success: true,
            data: rows[0],
        });
    } catch (err) {
        console.error('Error fetching TPL:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Create a new TPLS
router.post('/tpls', async (req, res) => {
    const {
        fk_category_id,
        category_name,
        domain,
        apex_domain,
        protocol,
        url_path,
        is_alive,
        is_twofa_required,
        is_high_value,
        notes,
        description,
    } = req.body;

    if (!domain) {
        return res.status(400).json({success: false, error: 'Domain is required'});
    }

    if (!notes) {
        return res.status(400).json({success: false, error: 'Notes are required'});
    }

    try {
        let categoryId = fk_category_id || null;
        if (!categoryId && category_name) {
            categoryId = await getOrCreateTPLCategory(category_name);
        }

        const query = `
          INSERT INTO sls_tpls (fk_category_id,
                                apex_domain,
                                protocol,
                                domain,
                                url_path,
                                is_alive,
                                is_twofa_required,
                                is_high_value,
                                notes,
                                description)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
            categoryId,
            apex_domain || domain,
            protocol || 'https',
            domain,
            url_path || '/login',
            is_alive !== undefined ? alive : 1,
            is_twofa_required ? 1 : 0,
            is_high_value ? 1 : 0,
            notes,
            description || '',
        ]);

        res.status(201).json({
            success: true,
            message: 'TPL created successfully',
            tpl_id: result.insertId,
        });
    } catch (err) {
        console.error('Error creating TPLS:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Update an existing TPLS
router.put('/tpls/:id', async (req, res) => {
    const {id} = req.params;
    const {
        protocol, domain, url_path, is_high_value, is_twofa_required, is_alive,
        fk_category_id, notes, description
    } = req.body;

    if (!domain) {
        return res.status(400).json({error: 'Domain is required'});
    }

    try {
        const [result] = await db.query(
            `
              UPDATE sls_tpls
              SET protocol = ?,
                  domain = ?,
                  url_path = ?,
                  is_high_value = ?,
                  is_twofa_required = ?,
                  is_alive = ?,
                  fk_category_id = ?,
                  notes = ?,
                  description = ?
              WHERE id = ?
            `,
            [
                protocol || 'https',
                domain,
                url_path || '/login',
                is_high_value ? 1 : 0,
                is_twofa_required ? 1 : 0,
                is_alive ? 1 : 0,
                fk_category_id || null,
                notes || '',
                description || '',
                id,
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({error: 'TPL not found'});
        }

        res.json({success: true});
    } catch (err) {
        console.error('Error updating TPL:', err);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Delete a TPLS
router.delete('/tpls/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const [result] = await db.query(
            `
              DELETE
              FROM sls_tpls
              WHERE id = ?
            `,
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({error: 'TPL not found'});
        }

        res.json({success: true});
    } catch (err) {
        console.error('Error deleting TPLS:', err);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// --- TPLS Categories Routes ---
// Get all TPLS categories
router.get('/tpl-categories', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || null;
    const searchPattern = search ? `%${search}%` : null;

    try {
        let countQuery = `
          SELECT COUNT(*) AS total
          FROM sls_tpl_categories tc
        `;

        let dataQuery = `
          SELECT tc.id                                                        AS id,
                 tc.category,
                 (SELECT COUNT(*) FROM sls_tpls WHERE fk_category_id = tc.id) AS count
          FROM sls_tpl_categories tc
        `;

        const searchCondition = search
            ? ` WHERE tc.category LIKE ?`
            : '';
        const countParams = search ? [search] : [];
        const dataParams = search ? [search, limit, offset] : [limit, offset];

        countQuery += searchCondition;
        dataQuery += searchCondition + ` ORDER BY tc.category ASC LIMIT ? OFFSET ?`;

        const [[countRow]] = await db.query(countQuery, countParams);
        const [dataRows] = await db.query(dataQuery, dataParams);

        const total = countRow.total || 0;
        const totalPages = Math.max(1, Math.ceil(total / limit));

        res.json({
            success: true,
            data: dataRows,
            pagination: {
                total,
                current_page: page,
                total_pages: totalPages,
                per_page: limit,
            },
        });
    } catch (err) {
        console.error('Error fetching TPLS categories:', err.stack);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Get a specific TPLS category
router.get('/tpl-categories/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const query = `
          SELECT id                                                        AS id,
                 category,
                 (SELECT COUNT(*) FROM sls_tpls WHERE fk_category_id = id) AS count
          FROM sls_tpl_categories
          WHERE id = ?
        `;

        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            return res.status(404).json({success: false, error: 'Category not found'});
        }

        res.json({
            success: true,
            data: rows[0],
        });
    } catch (err) {
        console.error('Error fetching TPLS category:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Create a new TPLS category
router.post('/tpl-categories', async (req, res) => {
    const {category} = req.body;

    if (!category) {
        return res.status(400).json({success: false, error: 'Category name is required'});
    }

    try {
        const query = `
          INSERT INTO sls_tpl_categories (category)
          VALUES (?)
        `;

        const [result] = await db.query(query, [category]);

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category_id: result.insertId,
        });
    } catch (err) {
        console.error('Error creating TPLS category:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Update an existing TPLS category
router.put('/tpl-categories/:id', async (req, res) => {
    const {id} = req.params;
    const {category} = req.body;

    if (!category) {
        return res.status(400).json({success: false, error: 'Category name is required'});
    }

    try {
        const query = `
          UPDATE sls_tpl_categories
          SET category = ?
          WHERE id = ?
        `;

        const [result] = await db.query(query, [category, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({success: false, error: 'Category not found'});
        }

        res.json({
            success: true,
            message: 'Category updated successfully',
        });
    } catch (err) {
        console.error('Error updating TPLS category:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Delete a TPLS category
router.delete('/tpl-categories/:id', async (req, res) => {
    const {id} = req.params;

    try {
        const [checkResult] = await db.query('SELECT id FROM sls_tpl_categories WHERE id = ?', [id]);

        if (checkResult.length === 0) {
            return res.status(404).json({success: false, error: 'Category not found'});
        }

        const [usageCheck] = await db.query('SELECT COUNT(*) AS count FROM sls_tpls WHERE fk_category_id = ?', [id]);

        if (usageCheck[0].count > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete category that is in use',
                count: usageCheck[0].count,
            });
        }

        const [deleteResult] = await db.query('DELETE FROM sls_tpl_categories WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'Category deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting TPLS category:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// --- TPLS Credentials Routes (for TPLSCredentials page) ---

// Fetch TPLS credentials
router.get('/tpls-credentials', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || null;
    const searchPattern = search ? `%${search}%` : null;

    try {
        let countQuery = `
          SELECT COUNT(*) AS total
          FROM sls_credentials c
               JOIN sls_credentials_login_domains cld ON c.id = cld.fk_credentials_id
               JOIN sls_login_domains ld ON cld.fk_login_domains_id = ld.id
               JOIN sls_tpls t ON ld.domain = t.domain
               LEFT JOIN sls_tpl_categories tc ON t.fk_category_id = tc.id
          WHERE c.is_tparty_login = 1
        `;

        let dataQuery = `
          SELECT c.id,
                 c.email,
                 c.password,
                 ld.domain,
                 t.is_high_value,
                 t.is_twofa_required,
                 IFNULL(tc.category, 'Uncategorized') AS category,
                 t.id
          FROM sls_credentials c
               JOIN sls_credentials_login_domains cld ON c.id = cld.fk_credentials_id
               JOIN sls_login_domains ld ON cld.fk_login_domains_id = ld.id
               JOIN sls_tpls t ON ld.domain = t.domain
               LEFT JOIN sls_tpl_categories tc ON t.fk_category_id = tc.id
          WHERE c.is_tparty_login = 1
        `;

        const searchCondition = search
            ? ` AND (ld.domain LIKE ? OR c.email LIKE ? OR IFNULL(tc.category, '') LIKE ?)`
            : '';
        const countParams = search ? [searchPattern, searchPattern, searchPattern] : [];
        const dataParams = search ? [searchPattern, searchPattern, searchPattern, limit, offset] : [limit, offset];

        countQuery += searchCondition;
        dataQuery += searchCondition + ` ORDER BY c.id DESC LIMIT ? OFFSET ?`;

        const [[countRow]] = await db.query(countQuery, countParams);
        const [dataRows] = await db.query(dataQuery, dataParams);

        const total = countRow.total || 0;

        res.json({
            data: dataRows || [],
            pagination: {
                total,
                current_page: page,
                total_pages: Math.max(1, Math.ceil(total / limit)),
                per_page: limit,
            },
        });
    } catch (err) {
        console.error('Error fetching TPLS credentials:', err);
        res.status(500).json({
            error: 'Database error',
            details: err.message,
            query_issue: err.sql || 'Query not available',
        });
    }
});

// --- Program Credentials Routes (for ProgramCredentials page) ---
// Fetch program credentials
router.get('/program-credentials', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || null;
    const searchPattern = search ? `%${search}%` : null;

    console.log('Search Parameter:', search); // Debug log

    try {
        let countQuery = `
          SELECT COUNT(*) AS total
          FROM sls_program_credentials pc
               JOIN sls_credentials c ON pc.fk_credentials_id = c.id
               JOIN shared_programs p ON pc.fk_programs_id = p.id
               JOIN shared_program_apex_domains iad ON p.id = iad.fk_programs_id
               LEFT JOIN sls_credentials_login_domains cld ON c.id = cld.fk_credentials_id
               LEFT JOIN sls_login_domains ld ON cld.fk_login_domains_id = ld.id
               LEFT JOIN shared_platforms pl ON p.fk_bb_site = pl.id
          WHERE (SUBSTRING_INDEX(c.email, '@', -1) = iad.apex_domain
            OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', iad.apex_domain))
        `;

        let dataQuery = `
          SELECT pc.id,
                 pc.viewed               AS verified,
                 pc.viewed,
                 c.email,
                 c.password,
                 p.program,
                 iad.apex_domain         AS email_apex,
                 ld.domain               AS login_domain,
                 cld.fk_login_domains_id AS fk_login_domains_id,
                 p.fk_bb_site            AS platform_id,
                 pl.platform             AS platform_name
          FROM sls_program_credentials pc
               JOIN sls_credentials c ON pc.fk_credentials_id = c.id
               JOIN shared_programs p ON pc.fk_programs_id = p.id
               JOIN shared_program_apex_domains iad ON p.id = iad.fk_programs_id
               LEFT JOIN sls_credentials_login_domains cld ON c.id = cld.fk_credentials_id
               LEFT JOIN sls_login_domains ld ON cld.fk_login_domains_id = ld.id
               LEFT JOIN shared_platforms pl ON p.fk_bb_site = pl.id
          WHERE (SUBSTRING_INDEX(c.email, '@', -1) = iad.apex_domain
            OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', iad.apex_domain))
        `;

        const searchCondition = search
            ? ` AND (c.email LIKE ? OR p.program LIKE ? OR COALESCE(ld.domain, '') LIKE ?)`
            : '';
        const countParams = search ? [searchPattern, searchPattern, searchPattern] : [];
        const dataParams = search ? [searchPattern, searchPattern, searchPattern, limit, offset] : [limit, offset];

        countQuery += searchCondition;
        dataQuery += searchCondition + ` ORDER BY pc.id DESC LIMIT ? OFFSET ?`;

        const [countRows] = await db.query(countQuery, countParams);
        const [dataRows] = await db.query(dataQuery, dataParams);

        const total = countRows.length > 0 ? countRows[0].total : 0;
        const totalPages = Math.max(1, Math.ceil(total / limit));

        res.json({
            data: dataRows,
            pagination: {
                total,
                current_page: page,
                total_pages: totalPages,
                per_page: limit,
            },
        });
    } catch (err) {
        console.error('Error fetching program credentials:', err);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Create a new program credential
router.post('/program-credentials', async (req, res) => {
    const {program, email_apex, login_domain, email, password, verified} = req.body;

    if (!email || !password) {
        return res.status(400).json({success: false, error: 'Email address and password are required'});
    }

    if (!program) {
        return res.status(400).json({success: false, error: 'Program is required'});
    }

    try {
        // Step 1: Find or create the program
        let programId;
        const [programRows] = await db.query('SELECT id FROM shared_programs WHERE program = ?', [program]);
        if (programRows.length > 0) {
            programId = programRows[0].id;
        } else {
            const [newProgram] = await db.query('INSERT INTO shared_programs (program, visibility) VALUES (?, ?)', [program, 'n/a']);
            programId = newProgram.insertId;
        }

        // Step 2: Create the credential
        const [credentialResult] = await db.query(
            'INSERT INTO sls_credentials (email, password) VALUES (?, ?)',
            [email, password]
        );
        const credentialId = credentialResult.insertId;

        // Step 3: Find or create the login domain (if provided)
        let loginDomainId = null;
        if (login_domain) {
            const strippedDomain = stripProtocol(login_domain);
            const [domainRows] = await db.query('SELECT id FROM sls_login_domains WHERE domain = ?', [strippedDomain]);
            if (domainRows.length > 0) {
                loginDomainId = domainRows[0].id;
            } else {
                const [newDomain] = await db.query('INSERT INTO sls_login_domains (domain, is_active) VALUES (?, 1)', [strippedDomain]);
                loginDomainId = newDomain.insertId;
            }

            // Step 4: Link the credential to the login domain
            await db.query(
                'INSERT INTO sls_credentials_login_domains (fk_credentials_id, fk_login_domains_id) VALUES (?, ?)',
                [credentialId, loginDomainId]
            );
        }

        // Step 5: Create the program credential
        const viewed = verified ? 1 : 0; // Using viewed as a proxy for verified
        const [programCredentialResult] = await db.query(
            'INSERT INTO sls_program_credentials (fk_credentials_id, fk_programs_id, viewed) VALUES (?, ?, ?)',
            [credentialId, programId, viewed]
        );

        res.status(201).json({
            success: true,
            message: 'Program credential created successfully',
            id: programCredentialResult.insertId,
        });
    } catch (err) {
        console.error('Error creating program credential:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Update a program credential
router.put('/program-credentials/:id', async (req, res) => {
    const {id} = req.params;
    const {program, email_apex, login_domain, email, password, verified} = req.body;

    if (!email || !password) {
        return res.status(400).json({success: false, error: 'Email address and password are required'});
    }

    if (!program) {
        return res.status(400).json({success: false, error: 'Program is required'});
    }

    try {
        // Step 1: Find the program credential
        const [programCredRows] = await db.query(
            'SELECT fk_credentials_id FROM sls_program_credentials WHERE id = ?',
            [id]
        );
        if (programCredRows.length === 0) {
            return res.status(404).json({success: false, error: 'Program credential not found'});
        }

        const {fk_credentials_id} = programCredRows[0];

        // Step 2: Update the program (if changed)
        let programId;
        const [programRows] = await db.query('SELECT id FROM shared_programs WHERE program = ?', [program]);
        if (programRows.length > 0) {
            programId = programRows[0].id;
        } else {
            const [newProgram] = await db.query('INSERT INTO shared_programs (program, visibility) VALUES (?, ?)', [program, 'n/a']);
            programId = newProgram.insertId;
        }

        // Step 3: Update the login domain (if changed)
        let loginDomainId = null;
        const [existingLoginDomain] = await db.query(
            'SELECT fk_login_domains_id FROM sls_credentials_login_domains WHERE fk_credentials_id = ?',
            [fk_credentials_id]
        );
        if (login_domain) {
            const strippedDomain = stripProtocol(login_domain);
            const [domainRows] = await db.query('SELECT id FROM sls_login_domains WHERE domain = ?', [strippedDomain]);
            if (domainRows.length > 0) {
                loginDomainId = domainRows[0].id;
            } else {
                const [newDomain] = await db.query('INSERT INTO sls_login_domains (domain, is_active) VALUES (?, 1)', [strippedDomain]);
                loginDomainId = newDomain.insertId;
            }

            if (existingLoginDomain.length > 0) {
                // Update existing login domain association
                await db.query(
                    'UPDATE sls_credentials_login_domains SET fk_login_domains_id = ? WHERE fk_credentials_id = ?',
                    [loginDomainId, fk_credentials_id]
                );
            } else {
                // Create new login domain association
                await db.query(
                    'INSERT INTO sls_credentials_login_domains (fk_credentials_id, fk_login_domains_id) VALUES (?, ?)',
                    [fk_credentials_id, loginDomainId]
                );
            }
        } else if (existingLoginDomain.length > 0) {
            // Remove the login domain association if login_domain is not provided
            await db.query(
                'DELETE FROM sls_credentials_login_domains WHERE fk_credentials_id = ?',
                [fk_credentials_id]
            );
        }

        // Step 4: Update the credential
        await db.query(
            'UPDATE sls_credentials SET email = ?, password = ? WHERE id = ?',
            [email, password, fk_credentials_id]
        );

        // Step 5: Update the program credential
        const viewed = verified ? 1 : 0; // Using viewed as a proxy for verified
        const [updateResult] = await db.query(
            'UPDATE sls_program_credentials SET fk_programs_id = ?, viewed = ? WHERE id = ?',
            [programId, viewed, id]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({success: false, error: 'Program credential not found'});
        }

        res.json({
            success: true,
            message: 'Program credential updated successfully',
        });
    } catch (err) {
        console.error('Error updating program credential:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Delete a program credential
router.delete('/program-credentials/:id', async (req, res) => {
    const {id} = req.params;

    try {
        // Step 1: Find the program credential
        const [programCredRows] = await db.query(
            'SELECT fk_credentials_id FROM sls_program_credentials WHERE id = ?',
            [id]
        );
        if (programCredRows.length === 0) {
            return res.status(404).json({success: false, error: 'Program credential not found'});
        }

        const {fk_credentials_id} = programCredRows[0];

        // Step 2: Delete the program credential
        await db.query('DELETE FROM sls_program_credentials WHERE id = ?', [id]);

        // Step 3: Check if the credential is used by other program credentials
        const [otherUses] = await db.query(
            'SELECT COUNT(*) AS count FROM sls_program_credentials WHERE fk_credentials_id = ?',
            [fk_credentials_id]
        );

        if (otherUses[0].count === 0) {
            // Step 4: Delete the associated login domain association
            await db.query('DELETE FROM sls_credentials_login_domains WHERE fk_credentials_id = ?', [fk_credentials_id]);

            // Step 5: Delete the credential
            await db.query('DELETE FROM sls_credentials WHERE id = ?', [fk_credentials_id]);
        }

        res.json({
            success: true,
            message: 'Program credential deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting program credential:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// --- Working Credentials Routes (for WorkingCredentials page) ---
router.get('/working-credentials', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || null;
    const searchPattern = search ? `%${search}%` : null;

    try {
        let countQuery = `
          SELECT COUNT(*) AS total
          FROM sls_working_credentials wc
               JOIN sls_credentials c ON wc.fk_credentials_id = c.id
               JOIN shared_programs p ON wc.fk_programs_id = p.id
               JOIN shared_program_apex_domains iad ON p.id = iad.fk_programs_id
               LEFT JOIN sls_login_domains ld ON wc.fk_login_domains_id = ld.id
               LEFT JOIN shared_platforms pl ON p.fk_bb_site = pl.id
          WHERE (SUBSTRING_INDEX(c.email, '@', -1) = iad.apex_domain
             OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', iad.apex_domain))
        `;

        let dataQuery = `
          SELECT wc.id,
                 wc.verified,
                 wc.notes,
                 wc.submission,
                 c.email,
                 c.password,
                 p.program,
                 iad.apex_domain AS email_apex,
                 ld.domain       AS login_domain,
                 wc.fk_login_domains_id,
                 p.fk_bb_site    AS platform_id,
                 pl.platform     AS platform_name
          FROM sls_working_credentials wc
               JOIN sls_credentials c ON wc.fk_credentials_id = c.id
               JOIN shared_programs p ON wc.fk_programs_id = p.id
               JOIN shared_program_apex_domains iad ON p.id = iad.fk_programs_id
               LEFT JOIN sls_login_domains ld ON wc.fk_login_domains_id = ld.id
               LEFT JOIN shared_platforms pl ON p.fk_bb_site = pl.id
          WHERE (SUBSTRING_INDEX(c.email, '@', -1) = iad.apex_domain
             OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', iad.apex_domain))
        `;

        const searchCondition = search
            ? ` AND (c.email LIKE ? OR p.program LIKE ? OR COALESCE(ld.domain, '') LIKE ?)`
            : '';
        const countParams = search ? [searchPattern, searchPattern, searchPattern] : [];
        const dataParams = search ? [searchPattern, searchPattern, searchPattern, limit, offset] : [limit, offset];

        countQuery += searchCondition;
        dataQuery += searchCondition + ` ORDER BY wc.id DESC LIMIT ? OFFSET ?`;

        const [countRows] = await db.query(countQuery, countParams);
        const [dataRows] = await db.query(dataQuery, dataParams);

        const total = countRows.length > 0 ? countRows[0].total : 0;
        const totalPages = Math.max(1, Math.ceil(total / limit));

        res.json({
            data: dataRows,
            pagination: {
                total,
                current_page: page,
                total_pages: totalPages,
                per_page: limit,
            },
        });
    } catch (err) {
        console.error('Error fetching working credentials:', err);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Create a new working credential
router.post('/working-credentials', async (req, res) => {
    const {program, email_apex, login_domain, email, password, notes, submission} = req.body;

    if (!email || !password) {
        return res.status(400).json({success: false, error: 'Email address and password are required'});
    }
    if (!program) {
        return res.status(400).json({success: false, error: 'Program is required'});
    }
    if (!login_domain) {
        return res.status(400).json({success: false, error: 'Login domain is required'});
    }
    if (submission !== undefined && typeof submission !== 'boolean') {
        return res.status(400).json({success: false, error: 'Submission must be a boolean'});
    }
    if (notes !== undefined && typeof notes !== 'string') {
        return res.status(400).json({success: false, error: 'Notes must be a string'});
    }

    try {
        // Step 1: Find or create the program
        let programId;
        const [programRows] = await db.query('SELECT id FROM shared_programs WHERE program = ?', [program]);
        if (programRows.length > 0) {
            programId = programRows[0].id;
        } else {
            const [newProgram] = await db.query('INSERT INTO shared_programs (program, visibility) VALUES (?, ?)', [program, 'n/a']);
            programId = newProgram.insertId;
        }

        // Step 2: Create the credential
        const [credentialResult] = await db.query(
            'INSERT INTO sls_credentials (email, password) VALUES (?, ?)',
            [email, password]
        );
        const credentialId = credentialResult.insertId;

        // Step 3: Find or create the login domain
        const strippedDomain = stripProtocol(login_domain);
        let loginDomainId;
        const [domainRows] = await db.query('SELECT id FROM sls_login_domains WHERE domain = ?', [strippedDomain]);
        if (domainRows.length > 0) {
            loginDomainId = domainRows[0].id;
        } else {
            const [newDomain] = await db.query('INSERT INTO sls_login_domains (domain, is_active) VALUES (?, 1)', [strippedDomain]);
            loginDomainId = newDomain.insertId;
        }

        // Step 4: Link the credential to the login domain
        await db.query(
            'INSERT INTO sls_credentials_login_domains (fk_credentials_id, fk_login_domains_id) VALUES (?, ?)',
            [credentialId, loginDomainId]
        );

        // Step 5: Create the working credential
        const [workingCredentialResult] = await db.query(
            'INSERT INTO sls_working_credentials (fk_credentials_id, fk_programs_id, fk_login_domains_id, notes, submission) VALUES (?, ?, ?, ?, ?)',
            [credentialId, programId, loginDomainId, notes || null, submission ? 1 : 0]
        );

        res.status(201).json({
            success: true,
            message: 'Working credential created successfully',
            id: workingCredentialResult.insertId,
        });
    } catch (err) {
        console.error('Error creating working credential:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Update a working credential
router.put('/working-credentials/:id', async (req, res) => {
    const {id} = req.params;
    const {notes, submission} = req.body;

    // Validate input
    if (notes === undefined && submission === undefined) {
        return res.status(400).json({
            success: false,
            error: 'At least one field (notes or submission) must be provided'
        });
    }
    if (submission !== undefined && typeof submission !== 'boolean') {
        return res.status(400).json({success: false, error: 'Submission must be a boolean'});
    }
    if (notes !== undefined && typeof notes !== 'string') {
        return res.status(400).json({success: false, error: 'Notes must be a string'});
    }

    try {
        // Build the update query dynamically based on provided fields
        const updates = [];
        const params = [];
        if (notes !== undefined) {
            updates.push('notes = ?');
            params.push(notes);
        }
        if (submission !== undefined) {
            updates.push('submission = ?');
            params.push(submission ? 1 : 0);
        }
        params.push(id);

        const query = `
          UPDATE sls_working_credentials
          SET ${updates.join(', ')}
          WHERE id = ?
        `;

        const [result] = await db.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({success: false, error: 'Working credential not found'});
        }

        res.json({success: true, message: 'Working credential updated successfully'});
    } catch (err) {
        console.error('Error updating working credential:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// Delete a working credential
router.delete('/working-credentials/:id', async (req, res) => {
    const {id} = req.params;

    try {
        // Step 1: Find the working credential
        const [workingCredRows] = await db.query(
            'SELECT fk_credentials_id FROM sls_working_credentials WHERE id = ?',
            [id]
        );
        if (workingCredRows.length === 0) {
            return res.status(404).json({success: false, error: 'Working credential not found'});
        }

        const {fk_credentials_id} = workingCredRows[0];

        // Step 2: Delete the working credential
        await db.query('DELETE FROM sls_working_credentials WHERE id = ?', [id]);

        // Step 3: Check if the credential is used by other working or program credentials
        const [otherWorkingUses] = await db.query(
            'SELECT COUNT(*) AS count FROM sls_working_credentials WHERE fk_credentials_id = ?',
            [fk_credentials_id]
        );
        const [otherProgramUses] = await db.query(
            'SELECT COUNT(*) AS count FROM sls_program_credentials WHERE fk_credentials_id = ?',
            [fk_credentials_id]
        );

        if (otherWorkingUses[0].count === 0 && otherProgramUses[0].count === 0) {
            // Step 4: Delete the associated login domain association
            await db.query('DELETE FROM sls_credentials_login_domains WHERE fk_credentials_id = ?', [fk_credentials_id]);

            // Step 5: Delete the credential
            await db.query('DELETE FROM sls_credentials WHERE id = ?', [fk_credentials_id]);
        }

        res.json({
            success: true,
            message: 'Working credential deleted successfully',
        });
    } catch (err) {
        console.error('Error deleting working credential:', err);
        res.status(500).json({success: false, error: 'Database error', details: err.message});
    }
});

// --- Submitted Credentials Routes (for SubmittedCredentials page) ---
// Fetch submitted credentials
router.get('/submitted-credentials', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || null;
    const searchPattern = search ? `%${search}%` : null;

    try {
        let countQuery = `
          SELECT COUNT(*) AS total
          FROM sls_submitted_credentials sc
               JOIN sls_credentials c ON sc.fk_credentials_id = c.id
               JOIN shared_programs p ON sc.fk_programs_id = p.id
               JOIN sls_login_domains ld ON sc.fk_login_domains_id = ld.id
               JOIN shared_platforms sp ON sc.fk_platform_id = sp.id
        `;
        let dataQuery = `
          SELECT sc.id, c.email, c.password, p.program, ld.domain AS login_domain, sp.platform AS platform_name,
                 sc.submitted, sc.accepted, sc.amount_paid, sc.notes, sc.created_at, sc.updated_at
          FROM sls_submitted_credentials sc
               JOIN sls_credentials c ON sc.fk_credentials_id = c.id
               JOIN shared_programs p ON sc.fk_programs_id = p.id
               JOIN sls_login_domains ld ON sc.fk_login_domains_id = ld.id
               JOIN shared_platforms sp ON sc.fk_platform_id = sp.id
        `;

        const searchCondition = search
            ? ` WHERE (c.email LIKE ? OR p.program LIKE ? OR ld.domain LIKE ? OR sp.platform LIKE ?)`
            : '';
        const countParams = search ? [search, search, search, search] : [];
        const dataParams = search ? [search, search, search, search, limit, offset] : [limit, offset];

        countQuery += searchCondition;
        dataQuery += searchCondition + ` ORDER BY sc.id DESC LIMIT ? OFFSET ?`;

        const [countRows] = await db.query(countQuery, countParams);
        const [dataRows] = await db.query(dataQuery, dataParams);

        const total = countRows.length > 0 ? countRows[0].total : 0;
        const totalPages = Math.max(1, Math.ceil(total / limit));

        res.json({
            data: dataRows,
            pagination: {
                total,
                current_page: page,
                total_pages: totalPages,
                per_page: limit,
            },
        });
    } catch (err) {
        console.error('Error fetching submitted credentials:', err);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Fetch single submitted credential
router.get('/submitted-credentials/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const [[row]] = await db.query(`
          SELECT sc.*, c.email, c.password, p.program, ld.domain AS login_domain, sp.platform AS platform_name
          FROM sls_submitted_credentials sc
               JOIN sls_credentials c ON sc.fk_credentials_id = c.id
               JOIN shared_programs p ON sc.fk_programs_id = p.id
               JOIN sls_login_domains ld ON sc.fk_login_domains_id = ld.id
               JOIN shared_platforms sp ON sc.fk_platform_id = sp.id
          WHERE sc.id = ?
        `, [id]);
        if (!row) return res.status(404).json({error: 'Not found'});
        res.json(row);
    } catch (err) {
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Add a submitted credential
router.post('/submitted-credentials', async (req, res) => {
    const {
        fk_credentials_id,
        fk_programs_id,
        fk_login_domains_id,
        fk_platform_id,
        submitted,
        accepted,
        amount_paid,
        notes
    } = req.body;
    try {
        const [result] = await db.query(
            `INSERT INTO sls_submitted_credentials
            (fk_credentials_id, fk_programs_id, fk_login_domains_id, fk_platform_id, submitted, accepted, amount_paid,
             notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [fk_credentials_id, fk_programs_id, fk_login_domains_id, fk_platform_id, submitted, accepted, amount_paid, notes]
        );
        res.status(201).json({success: true, id: result.insertId});
    } catch (err) {
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Update a submitted credential
router.put('/submitted-credentials/:id', async (req, res) => {
    const {id} = req.params;
    const {submitted, accepted, amount_paid, notes} = req.body;
    try {
        const [result] = await db.query(
            'UPDATE sls_submitted_credentials SET submitted=?, accepted=?, amount_paid=?, notes=? WHERE id=?',
            [submitted, accepted, amount_paid, notes, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({error: 'Not found'});
        res.json({success: true});
    } catch (err) {
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

router.delete('/submitted-credentials/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const [result] = await db.query('DELETE FROM sls_submitted_credentials WHERE id=?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({error: 'Not found'});
        res.json({success: true});
    } catch (err) {
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

router.get('/submitted-credentials-metrics', async (req, res) => {
    try {
        const [[totalRow]] = await db.query('SELECT COUNT(*) AS total FROM sls_submitted_credentials');
        const [[submittedRow]] = await db.query('SELECT COUNT(*) AS submitted FROM sls_submitted_credentials WHERE submitted = 1');
        const [[acceptedRow]] = await db.query('SELECT COUNT(*) AS accepted FROM sls_submitted_credentials WHERE accepted = 1');
        const [[paidRow]] = await db.query('SELECT SUM(amount_paid) AS total_paid FROM sls_submitted_credentials WHERE amount_paid IS NOT NULL');
        const [[avgPaidRow]] = await db.query('SELECT AVG(amount_paid) AS avg_paid FROM sls_submitted_credentials WHERE amount_paid IS NOT NULL');
        const [[newTodayRow]] = await db.query('SELECT COUNT(*) AS new_today FROM sls_submitted_credentials WHERE DATE(created_at) = CURDATE()');

        res.json({
            total: totalRow.total || 0,
            submitted: submittedRow.submitted || 0,
            accepted: acceptedRow.accepted || 0,
            total_paid: paidRow.total_paid || 0,
            avg_paid: avgPaidRow.avg_paid || 0,
            new_today: newTodayRow.new_today || 0,
        });
    } catch (err) {
        console.error('Error fetching submitted credentials metrics:', err);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// --- API Calls: Metrics ---
// Fetch program credential metrics
router.get('/program-credentials-metrics', async (req, res) => {
    try {
        // Total program credentials
        const [[totalRow]] = await db.query(`
            SELECT COUNT(DISTINCT pc.id) AS total_program_credentials
            FROM sls_program_credentials pc
                 JOIN sls_credentials c ON pc.fk_credentials_id = c.id
                 JOIN shared_programs p ON pc.fk_programs_id = p.id
                 JOIN shared_program_apex_domains iad ON p.id = iad.fk_programs_id
            WHERE (SUBSTRING_INDEX(c.email, '@', -1) = iad.apex_domain
                   OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', iad.apex_domain))
        `);
        // Recently used (viewed in last 7 days)
        const [[recentlyUsedRow]] = await db.query(`
            SELECT COUNT(DISTINCT pc.id) AS recently_used
            FROM sls_program_credentials pc
                 JOIN sls_credentials c ON pc.fk_credentials_id = c.id
                 JOIN shared_programs p ON pc.fk_programs_id = p.id
                 JOIN shared_program_apex_domains iad ON p.id = iad.fk_programs_id
            WHERE pc.viewed = 1
              AND pc.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
              AND (SUBSTRING_INDEX(c.email, '@', -1) = iad.apex_domain
                   OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', iad.apex_domain))
        `);
        // Flagged credentials (curr_found > prev_found)
        const [[flaggedRow]] = await db.query(`
            SELECT COUNT(DISTINCT pc.id) AS flagged_credentials
            FROM sls_program_credentials pc
                 JOIN sls_credentials c ON pc.fk_credentials_id = c.id
                 JOIN shared_programs p ON pc.fk_programs_id = p.id
                 JOIN shared_program_apex_domains iad ON p.id = iad.fk_programs_id
            WHERE pc.curr_found > pc.prev_found
              AND (SUBSTRING_INDEX(c.email, '@', -1) = iad.apex_domain
                   OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', iad.apex_domain))
        `);
        // Unviewed credentials
        const [[unviewedRow]] = await db.query(`
            SELECT COUNT(DISTINCT pc.id) AS unviewed_credentials
            FROM sls_program_credentials pc
                 JOIN sls_credentials c ON pc.fk_credentials_id = c.id
                 JOIN shared_programs p ON pc.fk_programs_id = p.id
                 JOIN shared_program_apex_domains iad ON p.id = iad.fk_programs_id
            WHERE pc.viewed = 0
              AND (SUBSTRING_INDEX(c.email, '@', -1) = iad.apex_domain
                   OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', iad.apex_domain))
        `);
        // Recently added (last 7 days)
        const [[recentlyAddedRow]] = await db.query(`
            SELECT COUNT(DISTINCT pc.id) AS recently_added
            FROM sls_program_credentials pc
                 JOIN sls_credentials c ON pc.fk_credentials_id = c.id
                 JOIN shared_programs p ON pc.fk_programs_id = p.id
                 JOIN shared_program_apex_domains iad ON p.id = iad.fk_programs_id
            WHERE pc.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
              AND (SUBSTRING_INDEX(c.email, '@', -1) = iad.apex_domain
                   OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', iad.apex_domain))
        `);
        // New today
        const [[newTodayRow]] = await db.query(`
            SELECT COUNT(DISTINCT pc.id) AS new_today
            FROM sls_program_credentials pc
                 JOIN sls_credentials c ON pc.fk_credentials_id = c.id
                 JOIN shared_programs p ON pc.fk_programs_id = p.id
                 JOIN shared_program_apex_domains iad ON p.id = iad.fk_programs_id
            WHERE DATE(pc.created_at) = CURDATE()
              AND (SUBSTRING_INDEX(c.email, '@', -1) = iad.apex_domain
                   OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', iad.apex_domain))
        `);
        res.json({
            total_program_credentials: totalRow.total_program_credentials || 0,
            recently_used: recentlyUsedRow.recently_used || 0,
            flagged_credentials: flaggedRow.flagged_credentials || 0,
            unviewed_credentials: unviewedRow.unviewed_credentials || 0,
            recently_added: recentlyAddedRow.recently_added || 0,
            new_today: newTodayRow.new_today || 0,
        });
    } catch (err) {
        console.error('Error fetching program credential metrics:', err);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Fetch Telegram channel metrics
router.get('/tg-channels-metrics', async (req, res) => {
    try {
        // Query for total channels
        const [totalChannelsRows] = await db.query(`
          SELECT COUNT(*) AS total_channels
          FROM sls_tg_channels
        `);

        // Query for active channels
        const [activeChannelsRows] = await db.query(`
          SELECT COUNT(*) AS active_channels
          FROM sls_tg_channels
          WHERE is_active = 1
        `);

        // Query for monitored channels (same as active for now)
        const [monitoredChannelsRows] = await db.query(`
          SELECT COUNT(*) AS monitored_channels
          FROM sls_tg_channels
          WHERE is_active = 1
        `);

        // Query for new messages (messages from today)
        const [newMessagesRows] = await db.query(`
          SELECT COUNT(*) AS new_channels
          FROM sls_tg_channels
          WHERE DATE(created_at) = CURDATE()
        `);

        // Query for archived channels (inactive channels)
        const [archivedChannelsRows] = await db.query(`
          SELECT COUNT(*) AS archived_channels
          FROM sls_tg_channels
          WHERE is_active = 0
        `);

        // Query for flagged channels
        const [flaggedChannelsRows] = await db.query(`
          SELECT COUNT(*) AS flagged_channels
          FROM sls_tg_channels
        `);

        res.json({
            total_channels: totalChannelsRows[0].total_channels || 0,
            active_channels: activeChannelsRows[0].active_channels || 0,
            monitored_channels: monitoredChannelsRows[0].monitored_channels || 0,
            new_channels: newMessagesRows[0].new_channels || 0,
            archived_channels: archivedChannelsRows[0].archived_channels || 0,
            flagged_channels: flaggedChannelsRows[0].flagged_channels || 0,
        });
    } catch (err) {
        console.error('Error fetching Telegram channel metrics:', err);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Fetch Telegram file metrics
router.get('/tg-files-metrics', async (req, res) => {
    try {
        // Query for total files
        const [totalFilesRows] = await db.query(`
          SELECT COUNT(*) AS total_files
          FROM sls_tg_files
        `);

        // Query for pending files (not downloaded)
        const [pendingFilesRows] = await db.query(`
          SELECT COUNT(*) AS pending_files
          FROM sls_tg_files
          WHERE downloaded = 0
        `);

        // Query for processed files
        const [processedFilesRows] = await db.query(`
          SELECT COUNT(*) AS processed_files
          FROM sls_tg_files
          WHERE processed = 1
        `);

        // Query for failed files
        const [failedFilesRows] = await db.query(`
          SELECT COUNT(*) AS failed_files
          FROM sls_tg_files
        `);

        // Query for files downloaded today
        const [downloadedTodayRows] = await db.query(`
          SELECT COUNT(*) AS downloaded_today
          FROM sls_tg_files
          WHERE downloaded = 1 AND DATE(file_date) = CURDATE()
        `);

        // Query for total storage used
        const [storageRows] = await db.query(`
          SELECT file_size
          FROM sls_tg_files
        `);

        let totalSize = 0;
        storageRows.forEach(row => {
            if (row.file_size) {
                const sizeMatch = row.file_size.match(/(\d+(?:\.\d+)?)\s*([KMGT]?B)/i);
                if (sizeMatch) {
                    const size = parseFloat(sizeMatch[1]);
                    const unit = sizeMatch[2].toUpperCase();
                    switch (unit) {
                        case 'B':
                            totalSize += size;
                            break;
                        case 'KB':
                            totalSize += size * 1024;
                            break;
                        case 'MB':
                            totalSize += size * 1024 * 1024;
                            break;
                        case 'GB':
                            totalSize += size * 1024 * 1024 * 1024;
                            break;
                        case 'TB':
                            totalSize += size * 1024 * 1024 * 1024 * 1024;
                            break;
                    }
                }
            }
        });

        let storageUsed;
        if (totalSize < 1024) {
            storageUsed = `${Math.round(totalSize)} B`;
        } else if (totalSize < 1024 * 1024) {
            storageUsed = `${Math.round(totalSize / 1024)} KB`;
        } else if (totalSize < 1024 * 1024 * 1024) {
            storageUsed = `${Math.round(totalSize / (1024 * 1024))} MB`;
        } else {
            storageUsed = `${(totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB`;
        }

        res.json({
            total_files: totalFilesRows[0].total_files || 0,
            pending_files: pendingFilesRows[0].pending_files || 0,
            processed_files: processedFilesRows[0].processed_files || 0,
            failed_files: failedFilesRows[0].failed_files || 0,
            downloaded_today: downloadedTodayRows[0].downloaded_today || 0,
            storage_used: storageUsed,
        });
    } catch (err) {
        console.error('Error fetching Telegram file metrics:', err);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Fetch TPLS metrics
router.get('/tpls-metrics', async (req, res) => {
    try {
        // Query for total TPLS
        const [totalTplsRows] = await db.query(`SELECT COUNT(*) AS total_tpls
        FROM sls_tpls`);

        // Query for active TPLS
        const [activeTplsRows] = await db.query(`SELECT COUNT(*) AS active_tpls
        FROM sls_tpls
        WHERE is_alive = 1
        `);

        // Query for high-value TPLS
        const [highValueTplsRows] = await db.query(`SELECT COUNT(*) AS high_value_tpls
        FROM sls_tpls
        WHERE is_high_value = 1`);

        // Query for TPLS with 2FA required
        const [twofaTplsRows] = await db.query(`SELECT COUNT(*) AS twofa_required
        FROM sls_tpls
        WHERE is_twofa_required = 1`);

        // Query for total categories
        const [totalCategoriesRows] = await db.query(`SELECT COUNT(*) AS total_categories
        FROM sls_tpl_categories`);

        // Query for uncategorized TPLS
        const [uncategorizedTplsRows] = await db.query(`SELECT COUNT(*) AS uncategorized_tpls
        FROM sls_tpls
        WHERE fk_category_id IS NULL`);

        res.json({
            total_tpls: totalTplsRows[0].total_tpls || 0,
            active_tpls: activeTplsRows[0].active_tpls || 0,
            high_value_tpls: highValueTplsRows[0].high_value_tpls || 0,
            twofa_required: twofaTplsRows[0].twofa_required || 0,
            total_categories: totalCategoriesRows[0].total_categories || 0,
            uncategorized_tpls: uncategorizedTplsRows[0].uncategorized_tpls || 0,
        });
    } catch (err) {
        console.error('Error fetching TPLS metrics:', err);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// Fetch TPLS category metrics
router.get('/tpl-categories-metrics', async (req, res) => {
    try {
        // Query for total categories
        const [totalCategoriesRows] = await db.query(`
          SELECT COUNT(*) AS total_categories
          FROM sls_tpl_categories
        `);

        // Query for categories with TPLS and other metrics
        const [categoriesRows] = await db.query(`
          SELECT c.id, c.category,
                 COUNT(t.id) AS count
          FROM sls_tpl_categories c
               LEFT JOIN sls_tpls t ON c.id = t.fk_category_id
          GROUP BY c.id, c.category
        `);

        // Query for uncategorized TPLS
        const [uncategorizedTplsRows] = await db.query(`
          SELECT COUNT(*) AS uncategorized_tpls
          FROM sls_tpls
          WHERE fk_category_id IS NULL
        `);

        const totalCategories = categoriesRows.length;
        const categoriesWithTpls = categoriesRows.filter(c => c.count > 0).length;
        const emptyCategories = categoriesRows.filter(c => c.count === 0).length;
        const largestCategory = Math.max(...categoriesRows.map(c => c.count || 0), 0);
        const totalTplsInCategories = categoriesRows.reduce((sum, c) => sum + (c.count || 0), 0);
        const avgTplsPerCategory = categoriesWithTpls > 0 ? (totalTplsInCategories / categoriesWithTpls).toFixed(1) : 0;

        res.json({
            total_categories: totalCategoriesRows[0].total_categories || 0,
            categories_with_tpls: categoriesWithTpls,
            empty_categories: emptyCategories,
            avg_tpls_per_category: avgTplsPerCategory,
            largest_category: largestCategory,
            uncategorized_tpls: uncategorizedTplsRows[0].uncategorized_tpls || 0,
        });
    } catch (err) {
        console.error('Error fetching TPLS category metrics:', err);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// --- Debug Routes ---
// Debug route for TPLS
router.get('/debug/tpls', async (req, res) => {
    try {
        const [tplCount] = await db.query('SELECT COUNT(*) AS count FROM sls_tpls');
        const [catCount] = await db.query('SELECT COUNT(*) AS count FROM sls_tpl_categories');

        res.json({
            success: true,
            tpl_count: tplCount[0].count,
            category_count: catCount[0].count,
            db_connection: 'working',
        });
    } catch (err) {
        console.error('Debug route error:', err);
        res.status(500).json({
            success: false,
            error: err.message,
            stack: err.stack,
        });
    }
});

// Route to execute sls.py with flexible arguments for SLS Launcher
router.post('/launcher/run', async (req, res) => {
    const {command, limit, query, rawQuery, fileId, manual, channel, downloadOnly} = req.body;
    // Validate command
    const allowed = ['update-channels', 'download-files', 'process-files', 'query', 'download-by-id', 'process-file', 'channel-enum'];
    if (!allowed.includes(command)) {
        return res.status(400).json({success: false, error: 'Invalid command'});
    }

    // Map command to args
    let args = ['-v'];
    if (command === 'update-channels') {
        args.push('-uc');
    } else if (command === 'download-files') {
        args.push('-d');
        if (downloadOnly) args.push('-do');
        if (limit) args.push('-l', String(limit));
        if (channel) args.push('-c', channel);
    } else if (command === 'process-files') {
        args.push('-p');
        if (limit) args.push('-l', String(limit));
        if (manual) args.push('-m');
        if (channel) args.push('-c', channel);
    } else if (command === 'download-by-id') {
        args.push('-di', String(fileId));
    } else if (command === 'process-file') {
        args.push('-f', String(fileId));
        if (manual) args.push('-m');
    } else if (command === 'query') {
        if (query) args.push('-q', query);
        if (limit) args.push('-l', String(limit));
        if (rawQuery) args.push('-qr', rawQuery);
    } else if (command === 'channel-enum') {
        args.push('-ce');
        if (channel) args.push('-c', channel);
    }

    // Activate venv and run sls.py
    const slsPath = '/home/dd/my/codes/sls/sls.py';
    const venvPath = '/home/dd/my/codes/sls/sls/bin/activate';

    // Use bash to source venv and run python
    const bashCmd = `source ${venvPath} && python3 ${slsPath} ${args.join(' ')}`;
    const proc = spawn('bash', ['-c', bashCmd], {cwd: '/home/dd/my/codes/sls'});

    let output = '';
    let error = '';

    proc.stdout.on('data', (data) => {
        output += data.toString();
    });
    proc.stderr.on('data', (data) => {
        error += data.toString();
    });

    proc.on('close', (code) => {
        if (code === 0) {
            res.json({success: true, output});
        } else {
            res.status(500).json({success: false, error, code, output});
        }
    });
});

// Add a batch of submitted credentials
router.post('/submitted-credentials/batch', async (req, res) => {
    const { credentials } = req.body; // Array of credential objects
    if (!Array.isArray(credentials)) {
        return res.status(400).json({ error: 'credentials must be an array' });
    }
    const results = [];
    const errors = [];
    for (const cred of credentials) {
        try {
            const [result] = await db.query(
                `INSERT INTO sls_submitted_credentials
                (fk_credentials_id, fk_programs_id, fk_login_domains_id, fk_platform_id, submitted, accepted, amount_paid, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    cred.fk_credentials_id,
                    cred.fk_programs_id || null,
                    cred.fk_login_domains_id || null,
                    cred.fk_platform_id || null,
                    cred.submitted || 0,
                    cred.accepted || 0,
                    cred.amount_paid || null,
                    cred.notes || null
                ]
            );
            results.push({ id: result.insertId });
        } catch (err) {
            errors.push({ error: err.message, credential: cred });
        }
    }
    if (errors.length > 0) {
        return res.status(207).json({ success: false, results, errors });
    }
    res.json({ success: true, results });
});

// Fetch working credentials metrics (schema-safe)
router.get('/working-credentials-metrics', async (req, res) => {
    try {
        const [[totalRow]] = await db.query(`
            SELECT COUNT(DISTINCT wc.id) AS total_working
            FROM sls_working_credentials wc
            JOIN sls_credentials c ON wc.fk_credentials_id = c.id
            JOIN shared_programs p ON wc.fk_programs_id = p.id
            JOIN shared_program_apex_domains iad ON p.id = iad.fk_programs_id
            WHERE (SUBSTRING_INDEX(c.email, '@', -1) = iad.apex_domain
                OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', iad.apex_domain))
        `);
        const [[verifiedRow]] = await db.query(`
            SELECT COUNT(DISTINCT wc.id) AS verified_working
            FROM sls_working_credentials wc
            JOIN sls_credentials c ON wc.fk_credentials_id = c.id
            JOIN shared_programs p ON wc.fk_programs_id = p.id
            JOIN shared_program_apex_domains iad ON p.id = iad.fk_programs_id
            WHERE (SUBSTRING_INDEX(c.email, '@', -1) = iad.apex_domain
                OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', iad.apex_domain))
                AND wc.verified IS NOT NULL
        `);
        const [[submittedRow]] = await db.query(`
            SELECT COUNT(DISTINCT wc.id) AS submitted_working
            FROM sls_working_credentials wc
            JOIN sls_credentials c ON wc.fk_credentials_id = c.id
            JOIN shared_programs p ON wc.fk_programs_id = p.id
            JOIN shared_program_apex_domains iad ON p.id = iad.fk_programs_id
            WHERE (SUBSTRING_INDEX(c.email, '@', -1) = iad.apex_domain
                OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', iad.apex_domain))
                AND wc.submission = 1
        `);
        const [[recentlyAddedRow]] = await db.query(`
            SELECT COUNT(DISTINCT wc.id) AS recently_added
            FROM sls_working_credentials wc
            JOIN sls_credentials c ON wc.fk_credentials_id = c.id
            JOIN shared_programs p ON wc.fk_programs_id = p.id
            JOIN shared_program_apex_domains iad ON p.id = iad.fk_programs_id
            WHERE wc.verified >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                AND (SUBSTRING_INDEX(c.email, '@', -1) = iad.apex_domain
                    OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', iad.apex_domain))
        `);
        res.json({
            total_working: totalRow.total_working || 0,
            verified_working: verifiedRow.verified_working || 0,
            submitted_working: submittedRow.submitted_working || 0,
            recently_added: recentlyAddedRow.recently_added || 0,
            active_working: 0,
            expires_soon: 0,
            recently_used: 0,
            shared_credentials: 0,
        });
    } catch (err) {
        console.error('Error fetching working credentials metrics:', err);
        res.status(500).json({error: 'Database error', details: err.message});
    }
});

// --- Add Ignore Apex Endpoint ---
router.post('/ignore-apex', async (req, res) => {
    const { domain } = req.body;
    if (!domain) {
        return res.status(400).json({ success: false, error: 'Domain is required' });
    }
    // Helper to extract apex domain (simple version: last two labels)
    function getApexDomain(input) {
        try {
            let d = input.trim().toLowerCase();
            d = d.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
            const parts = d.split('.');
            if (parts.length < 2) return d;
            return parts.slice(-2).join('.');
        } catch {
            return input;
        }
    }
    const apex = getApexDomain(domain);
    try {
        // Insert into sls_ignore_domains if not exists
        await db.query(
            'INSERT IGNORE INTO sls_ignore_domains (ignore_domain, is_active) VALUES (?, 1)',
            [apex]
        );
        // Set viewed=1 for all sls_program_credentials whose email domain matches this apex or subdomain
        // Find all credentials whose email domain = apex or ends with .apex
        const [credRows] = await db.query(
            `SELECT c.id FROM sls_credentials c WHERE SUBSTRING_INDEX(c.email, '@', -1) = ? OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', ?)`,
            [apex, apex]
        );
        if (credRows.length > 0) {
            const credIds = credRows.map(row => row.id);
            // Find all sls_program_credentials for these credentials
            if (credIds.length > 0) {
                await db.query(
                    `UPDATE sls_program_credentials SET viewed=1 WHERE fk_credentials_id IN (${credIds.map(() => '?').join(',')})`,
                    credIds
                );
            }
        }
        res.json({ success: true, apex_domain: apex });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
