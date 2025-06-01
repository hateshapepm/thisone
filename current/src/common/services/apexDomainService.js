// src/common/services/apexDomainService.js
import db from '../../db';

export const getApexDomains = async (programId) => {
  return db.query(
    `SELECT inscope_apex_domains_id, inscope_apex_domain, is_active, fk_programs_id
     FROM inscope_apex_domains
     WHERE fk_programs_id = ?
     ORDER BY inscope_apex_domain`,
    [programId]
  );
};

export const addApexDomain = async (programId, domain, isActive = 1) => {
  return db.query(
    `INSERT INTO inscope_apex_domains (inscope_apex_domain, is_active, fk_programs_id)
     VALUES (?, ?, ?)`,
    [domain, isActive, programId]
  );
};

// Add other apex domain methods