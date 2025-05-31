// src/common/services/programService.js
import db from '../../db';

export const getPrograms = async (page = 1, limit = 10, search = null) => {
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.id, p.program, p.program_visibility, p.is_active,
             pl.platform                                                                     AS platform_name,
             (SELECT COUNT(*) FROM inscope_apex_domains iad WHERE iad.fk_programs_id = p.id) AS scope_count
      FROM programs p
           LEFT JOIN platforms pl ON p.fk_bb_site = pl.id
    `;

    const params = [];

    if (search) {
        query += ` WHERE (p.program LIKE ? OR p.program_visibility LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY p.id ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return db.query(query, params);
};

export const getProgramById = async (id) => {
    return db.query(
        `SELECT p.*, pl.platform AS platform_name
        FROM programs p
             LEFT JOIN platforms pl ON p.fk_bb_site = pl.id
        WHERE p.id = ?`,
        [id]
    );
};

// Add other program-related methods (create, update, delete)