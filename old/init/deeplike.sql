-- Database setup
USE deeplike_db;

-- --------------------------------------
-- Shared Tables
-- --------------------------------------
DELIMITER //

-- Platforms for bug bounty programs
CREATE TABLE IF NOT EXISTS shared_platforms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  platform VARCHAR(255) NOT NULL UNIQUE,
  url VARCHAR(2048), -- Increased from 255 for longer URLs
  INDEX idx_platform ( platform )
)//

-- Bug bounty programs
CREATE TABLE IF NOT EXISTS shared_programs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  program VARCHAR(255) NOT NULL UNIQUE,
  visibility ENUM ('any', 'n/a', 'private', 'public') NOT NULL DEFAULT 'public',
  is_active BOOLEAN DEFAULT 1,
  fk_bb_site INT,
  FOREIGN KEY ( fk_bb_site ) REFERENCES shared_platforms ( id ) ON DELETE SET NULL,
  INDEX idx_program ( program )
)//

-- Program types (engagements or pentest)
CREATE TABLE IF NOT EXISTS shared_program_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category ENUM ('engagements', 'pentest') NOT NULL,
  fk_platform_id INT NOT NULL,
  FOREIGN KEY ( fk_platform_id ) REFERENCES shared_platforms ( id ) ON DELETE CASCADE,
  UNIQUE ( category, fk_platform_id )
)//

-- Apex domains
CREATE TABLE IF NOT EXISTS shared_program_apex_domains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  apex_domain VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT 1,
  is_promoted BOOLEAN DEFAULT 0,
  fk_programs_id INT NOT NULL,
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  INDEX idx_status_program ( status, fk_programs_id ),
  INDEX idx_apex_domain ( apex_domain )
)//

-- --------------------------------------
-- SLS-Specific Tables
-- --------------------------------------

-- Telegram files
CREATE TABLE IF NOT EXISTS sls_tg_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_id INT UNIQUE,
  filename VARCHAR(255) NOT NULL,
  guid BIGINT,
  file_size BIGINT,
  file_date TIMESTAMP,
  file_type VARCHAR(50),
  sha256 VARCHAR(64),
  downloaded INT DEFAULT 0,
  processed INT DEFAULT 0,
  queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  alt_channel_tg_files_id INT DEFAULT NULL,
  alt_download_timestamp TIMESTAMP DEFAULT NULL,
  fk_tg_channels_id INT,
  FOREIGN KEY ( fk_tg_channels_id ) REFERENCES sls_tg_channels ( id ) ON DELETE CASCADE,
  UNIQUE ( fk_tg_channels_id, file_id ),
  INDEX idx_guid ( guid )
)//

-- Telegram channels
CREATE TABLE IF NOT EXISTS sls_tg_channels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  channel VARCHAR(255) NOT NULL UNIQUE,
  channel_id BIGINT,
  access_hash VARCHAR(100),
  url VARCHAR(2048),
  title VARCHAR(255),
  is_active BOOLEAN DEFAULT 0,
  last_scanned TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_channel ( channel )
)//

-- Credentials
CREATE TABLE IF NOT EXISTS sls_credentials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  protocol VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL, -- TODO: Hash passwords
  is_inscope BOOLEAN DEFAULT 0,
  is_corp_email BOOLEAN DEFAULT 0,
  is_probable_password BOOLEAN DEFAULT 0,
  is_tparty_login BOOLEAN DEFAULT 0,
  UNIQUE ( protocol, email, password ),
  INDEX idx_email ( email )
)//

-- Program-credential mappings
CREATE TABLE IF NOT EXISTS sls_program_credentials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curr_found INT DEFAULT 0,
  prev_found INT DEFAULT 0,
  viewed TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fk_credentials_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  FOREIGN KEY ( fk_credentials_id ) REFERENCES sls_credentials ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  UNIQUE ( fk_programs_id, fk_credentials_id ),
  INDEX idx_cred_program ( fk_credentials_id, fk_programs_id )
)//

CREATE TABLE IF NOT EXISTS sls_submitted_credentials (
  id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  fk_credentials_id INT(11) NOT NULL,
  fk_programs_id INT(11) NOT NULL,
  fk_login_domains_id INT(11) NOT NULL,
  fk_platform_id INT(11) NOT NULL,
  submitted TINYINT(1) NOT NULL DEFAULT 0,
  accepted TINYINT(1) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(10, 2) DEFAULT NULL,
  notes VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_credentials_id ( fk_credentials_id ),
  KEY idx_programs_id ( fk_programs_id ),
  KEY idx_login_domains_id ( fk_login_domains_id ),
  KEY idx_platform_id ( fk_platform_id ),
  CONSTRAINT fk_submitted_cred FOREIGN KEY ( fk_credentials_id ) REFERENCES sls_credentials ( id ) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_submitted_prog FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_submitted_login FOREIGN KEY ( fk_login_domains_id ) REFERENCES sls_login_domains ( id ) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_submitted_platform FOREIGN KEY ( fk_platform_id ) REFERENCES shared_platforms ( id ) ON DELETE CASCADE ON UPDATE CASCADE
)//

-- Credential-Telegram file mappings
CREATE TABLE IF NOT EXISTS sls_credentials_tg_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_credentials_id INT NOT NULL,
  fk_tg_files_id INT NOT NULL,
  FOREIGN KEY ( fk_credentials_id ) REFERENCES sls_credentials ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_tg_files_id ) REFERENCES sls_tg_files ( id ) ON DELETE CASCADE,
  UNIQUE ( fk_credentials_id, fk_tg_files_id )
)//

-- Login domains
CREATE TABLE IF NOT EXISTS sls_login_domains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domain VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_domain ( domain )
)//

-- Credential-login domain mappings
CREATE TABLE IF NOT EXISTS sls_credentials_login_domains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_credentials_id INT NOT NULL,
  fk_login_domains_id INT NOT NULL,
  is_working BOOLEAN DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ( fk_credentials_id ) REFERENCES sls_credentials ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_login_domains_id ) REFERENCES sls_login_domains ( id ) ON DELETE CASCADE,
  UNIQUE ( fk_credentials_id, fk_login_domains_id ),
  INDEX idx_cred_domain ( fk_credentials_id, fk_login_domains_id )
)//

-- Working credentials
CREATE TABLE IF NOT EXISTS sls_working_credentials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  verified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes VARCHAR(255),
  submission BOOLEAN DEFAULT 0 NOT NULL,
  fk_login_domains_id INT NOT NULL,
  fk_credentials_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  FOREIGN KEY ( fk_login_domains_id ) REFERENCES sls_login_domains ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_credentials_id ) REFERENCES sls_credentials ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  UNIQUE ( fk_programs_id, fk_credentials_id, fk_login_domains_id ),
  INDEX idx_login_domain ( fk_login_domains_id ),
  INDEX idx_program ( fk_programs_id ),
  INDEX idx_verified ( verified )
)//

-- Credential statistics
CREATE TABLE IF NOT EXISTS sls_credential_stats (
  table_name VARCHAR(255) PRIMARY KEY,
  row_count BIGINT NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)//

-- TPL categories
CREATE TABLE IF NOT EXISTS sls_tpl_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(255) UNIQUE
)//

-- TPLs (third-party logins)
CREATE TABLE IF NOT EXISTS sls_tpls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  apex_domain VARCHAR(255) NOT NULL,
  protocol VARCHAR(50),
  domain VARCHAR(255) NOT NULL,
  url_path VARCHAR(255) NOT NULL,
  is_alive BOOLEAN DEFAULT 1,
  twofa_required BOOLEAN DEFAULT 0,
  high_value BOOLEAN DEFAULT 0,
  notes TEXT NOT NULL,
  description TEXT,
  fk_category_id INT,
  FOREIGN KEY ( fk_category_id ) REFERENCES sls_tpl_categories ( id ) ON DELETE CASCADE,
  UNIQUE ( fk_category_id, domain ),
  INDEX idx_domain ( domain )
)//

-- Ignored apex emails
CREATE TABLE IF NOT EXISTS sls_ignore_apex_emails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ignore_apex_email VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT 1,
  INDEX idx_email ( ignore_apex_email )
)//

-- Ignored domains
CREATE TABLE IF NOT EXISTS sls_ignore_domains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ignore_domain VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT 1,
  INDEX idx_domain ( ignore_domain )
)//

-- Trigger log table
CREATE TABLE IF NOT EXISTS sls_trigger_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)//

-- Telegram channel stats
CREATE TABLE IF NOT EXISTS sls_tg_channel_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_tg_channels_id INT NOT NULL,
  total_files INT DEFAULT 0,
  downloaded_files INT DEFAULT 0,
  need_to_download_files INT DEFAULT 0,
  need_to_process_files INT DEFAULT 0,
  processed_files INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY ( fk_tg_channels_id ) REFERENCES sls_tg_channels ( id ) ON DELETE CASCADE,
  UNIQUE ( fk_tg_channels_id )
)//

-- Telegram channel statuses
CREATE TABLE IF NOT EXISTS sls_tg_channel_statuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  status INT NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL
)//

-- --------------------------------------
-- Deeper Tables (Reconnaissance Data)
-- --------------------------------------
-- Create deeper_source_types table
CREATE TABLE IF NOT EXISTS deeper_source_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(255) NOT NULL UNIQUE,
  description TEXT
)//

-- Create deeper_sources table
CREATE TABLE IF NOT EXISTS deeper_sources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type_id INT NOT NULL,
  name VARCHAR(255) NOT NULL UNIQUE,
  source VARCHAR(255) UNIQUE,
  description TEXT,
  is_url BOOLEAN DEFAULT 1,
  is_active BOOLEAN DEFAULT 1,
  is_used BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ( type_id ) REFERENCES deeper_source_types ( id )
)//

-- Create deeper_core_addresses table
CREATE TABLE IF NOT EXISTS deeper_core_addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)//

-- Create deeper_core_emails table
CREATE TABLE IF NOT EXISTS deeper_core_emails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email ( email )
)//

-- Create deeper_core_emails table
CREATE TABLE IF NOT EXISTS deeper_core_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  group_name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_group ( group_name )
)//

-- Create deeper_core_mx table
CREATE TABLE IF NOT EXISTS deeper_core_mx (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mx VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_mx ( mx )
)//

-- Create deeper_core_names table
CREATE TABLE deeper_core_names (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name ( name )
);

-- Create deeper_core_nameservers table
CREATE TABLE IF NOT EXISTS deeper_core_nameservers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nameserver VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_nameserver ( nameserver )
)//

-- Create deeper_core_organizations table
CREATE TABLE IF NOT EXISTS deeper_core_organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  org VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_org ( org )
)//

-- Create deeper_core_phones table
CREATE TABLE IF NOT EXISTS deeper_core_phones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone ( phone )
)//

-- Create deeper_core_txt table
CREATE TABLE IF NOT EXISTS deeper_core_txt (
  id INT AUTO_INCREMENT PRIMARY KEY,
  txt VARCHAR(512) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_txt ( txt )
)//


-- Table for apex domains that recon thinks may be owned by a company
CREATE TABLE IF NOT EXISTS deeper_possible_apex_domains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  apex_domain VARCHAR(255) NOT NULL,
  viewed TINYINT(1) DEFAULT 0,
  status BOOLEAN DEFAULT 0, -- 0 for possible, 1 for confirmed
  fk_programs_id INT NOT NULL,
  discovery_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE ( apex_domain, fk_programs_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  CHECK (apex_domain != '' AND TRIM(apex_domain) != ''),
  INDEX idx_status_program ( status, fk_programs_id ),
  INDEX idx_apex_domain ( apex_domain )
)//

CREATE TABLE IF NOT EXISTS deeper_asn (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asn VARCHAR(255) NOT NULL,
  viewed TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status BOOLEAN DEFAULT 0,
  fk_programs_id INT NOT NULL,
  UNIQUE ( asn, fk_programs_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  CHECK (asn != ''),
  INDEX idx_status_program ( status, fk_programs_id ),
  INDEX idx_asn ( asn )
)//

CREATE TABLE IF NOT EXISTS deeper_asn_metadatas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source VARCHAR(255) NOT NULL DEFAULT 'manual',
  name VARCHAR(255) NULL,
  country VARCHAR(25) NULL,
  is_ipv4 BOOLEAN NOT NULL DEFAULT 1,
  is_checked BOOLEAN NOT NULL DEFAULT 0,
  is_inscope BOOLEAN NOT NULL DEFAULT 0,
  fk_asn_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  UNIQUE ( source, fk_programs_id, fk_asn_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_asn_id ) REFERENCES deeper_asn ( id ) ON DELETE CASCADE
)//

-- CIDR ranges table
CREATE TABLE IF NOT EXISTS deeper_cidr_ranges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cidr_range VARCHAR(255) NOT NULL,
  viewed TINYINT(1) DEFAULT 0,
  status BOOLEAN DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  fk_programs_id INT NOT NULL,
  UNIQUE ( cidr_range, fk_programs_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  CHECK (cidr_range != ''),
  INDEX idx_status_program ( status, fk_programs_id ),
  INDEX idx_cidr_range ( cidr_range )
)//

-- CIDR ranges metadata
CREATE TABLE IF NOT EXISTS deeper_cidr_ranges_metadatas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source VARCHAR(255) NOT NULL DEFAULT 'manual',
  is_ipv4 BOOLEAN NOT NULL DEFAULT 1,
  is_checked BOOLEAN NOT NULL DEFAULT 0,
  is_inscope BOOLEAN NOT NULL DEFAULT 0,
  fk_cidr_ranges_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  UNIQUE ( source, fk_programs_id, fk_cidr_ranges_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_cidr_ranges_id ) REFERENCES deeper_cidr_ranges ( id ) ON DELETE CASCADE
)//

-- Subdomains
CREATE TABLE IF NOT EXISTS deeper_subdomains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subdomain VARCHAR(255) NOT NULL UNIQUE,
  viewed TINYINT(1) DEFAULT 0,
  is_inscope BOOLEAN NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT 1,
  discovery_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  status_code INT,
  status BOOLEAN DEFAULT 0,
  fk_apex_domains_id INT NOT NULL,
  FOREIGN KEY ( fk_apex_domains_id ) REFERENCES shared_program_apex_domains ( id ) ON DELETE CASCADE,
  UNIQUE ( subdomain, fk_apex_domains_id ),
  CHECK (subdomain != '' AND TRIM(subdomain) != ''),
  INDEX idx_status_apex ( status, fk_apex_domains_id ),
  INDEX idx_subdomain ( subdomain )
)//

CREATE TABLE IF NOT EXISTS deeper_subdomain_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  is_alive BOOLEAN NOT NULL DEFAULT 1,
  first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  fk_programs_id INT NOT NULL,
  fk_subdomain_id INT NOT NULL,
  UNIQUE ( fk_subdomain_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_subdomain_id ) REFERENCES deeper_subdomains ( id ) ON DELETE CASCADE
)//

-- Subdomain metadata
CREATE TABLE IF NOT EXISTS deeper_subdomains_metadatas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source VARCHAR(255),
  fk_programs_id INT NOT NULL,
  fk_subdomains_id INT NOT NULL,
  UNIQUE ( source, fk_programs_id, fk_subdomains_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_subdomains_id ) REFERENCES deeper_subdomains ( id ) ON DELETE CASCADE
)//

CREATE TABLE IF NOT EXISTS deeper_subdomains_sources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  url VARCHAR(255) UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)//

-- Subdomain multilevels
CREATE TABLE IF NOT EXISTS deeper_subdomains_multilevels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  multilevel VARCHAR(255),
  viewed TINYINT(1) DEFAULT 0,
  fk_programs_id INT NOT NULL,
  fk_apex_domains_id INT NOT NULL,
  UNIQUE ( multilevel, fk_programs_id, fk_apex_domains_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_apex_domains_id ) REFERENCES shared_program_apex_domains ( id ) ON DELETE CASCADE
)//

-- URLs
CREATE TABLE IF NOT EXISTS deeper_urls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  url VARCHAR(2048) NOT NULL UNIQUE,
  viewed TINYINT(1) DEFAULT 0,
  is_inscope BOOLEAN NOT NULL DEFAULT 1,
  fk_programs_id INT NOT NULL,
  fk_subdomains_id INT NOT NULL,
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_subdomains_id ) REFERENCES deeper_subdomains ( id ) ON DELETE CASCADE,
  CHECK (url != '')
)//

-- URL details
CREATE TABLE IF NOT EXISTS deeper_url_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  is_alive BOOLEAN NOT NULL DEFAULT 1,
  first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  title VARCHAR(512),
  notes TEXT,
  fk_programs_id INT NOT NULL,
  fk_subdomains_id INT NOT NULL,
  UNIQUE ( fk_subdomains_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_subdomains_id ) REFERENCES deeper_subdomains ( id ) ON DELETE CASCADE
)//

-- URL technologies
CREATE TABLE IF NOT EXISTS deeper_url_technologies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category ENUM ('cdn', 'cms', 'ecommerce', 'js', 'misc', 'multi', 'notmine', 'os', 'tech', 'webserver') NOT NULL,
  source ENUM ('brief', 'deep', 'httpx', 'manual') NOT NULL,
  technology VARCHAR(255),
  version VARCHAR(100),
  fk_programs_id INT NOT NULL,
  fk_subdomains_id INT NOT NULL,
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_subdomains_id ) REFERENCES deeper_subdomains ( id ) ON DELETE CASCADE
)//


-- Blacklists
CREATE TABLE IF NOT EXISTS deeper_blacklists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category ENUM ('domain', 'email', 'ip') NOT NULL,
  value VARCHAR(255) NOT NULL,
  source VARCHAR(255),
  fk_programs_id INT NOT NULL,
  fk_subdomains_id INT,
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_subdomains_id ) REFERENCES deeper_subdomains ( id ) ON DELETE SET NULL,
  UNIQUE ( category, value, fk_programs_id ),
  INDEX idx_subdomain ( fk_subdomains_id )
)//

-- Port details
CREATE TABLE IF NOT EXISTS deeper_port_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  port INT NOT NULL,
  protocol ENUM ('tcp', 'udp') NOT NULL,
  service VARCHAR(255),
  banner TEXT,
  fk_subdomains_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_subdomains_id ) REFERENCES deeper_subdomains ( id ) ON DELETE CASCADE,
  UNIQUE ( port, protocol, fk_subdomains_id )
)//

CREATE TABLE IF NOT EXISTS deeper_associated_domains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domain VARCHAR(255) NOT NULL UNIQUE,
  source VARCHAR(255) DEFAULT 'company-associated-domains',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)//

CREATE TABLE IF NOT EXISTS deeper_connected_websites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domain VARCHAR(255) NOT NULL UNIQUE,
  source VARCHAR(255) DEFAULT 'connected-websites',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)//

CREATE TABLE IF NOT EXISTS deeper_tag_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  domain VARCHAR(255) NOT NULL UNIQUE,
  tag VARCHAR(255),
  source VARCHAR(255) DEFAULT 'tag-domain-history',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)//

CREATE TABLE IF NOT EXISTS deeper_tracking_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tag VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ( tag )
)//

CREATE TABLE IF NOT EXISTS deeper_rdap_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category ENUM ('address', 'email', 'group', 'name', 'nameserver', 'org', 'phone') NOT NULL,
  fk_name_id INT NULL,
  fk_org_id INT NULL,
  fk_email_id INT NULL,
  fk_address_id INT NULL,
  fk_nameserver_id INT NULL,
  fk_phone_id INT NULL,
  fk_group_id INT NULL,
  fk_programs_id INT NOT NULL,
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_name_id ) REFERENCES deeper_core_names ( id ) ON DELETE SET NULL,
  FOREIGN KEY ( fk_org_id ) REFERENCES deeper_core_organizations ( id ) ON DELETE SET NULL,
  FOREIGN KEY ( fk_email_id ) REFERENCES deeper_core_emails ( id ) ON DELETE SET NULL,
  FOREIGN KEY ( fk_address_id ) REFERENCES deeper_core_addresses ( id ) ON DELETE SET NULL,
  FOREIGN KEY ( fk_nameserver_id ) REFERENCES deeper_core_nameservers ( id ) ON DELETE SET NULL,
  FOREIGN KEY ( fk_phone_id ) REFERENCES deeper_core_phones ( id ) ON DELETE SET NULL,
  FOREIGN KEY ( fk_group_id ) REFERENCES deeper_core_groups ( id ) ON DELETE SET NULL,
  INDEX idx_category ( category )
)//

CREATE TABLE IF NOT EXISTS deeper_whois_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category ENUM ('address', 'email', 'group', 'name', 'nameserver', 'org', 'phone') NOT NULL,
  fk_name_id INT NULL,
  fk_org_id INT NULL,
  fk_email_id INT NULL,
  fk_address_id INT NULL,
  fk_nameserver_id INT NULL,
  fk_phone_id INT NULL,
  fk_group_id INT NULL,
  fk_programs_id INT NOT NULL,
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_name_id ) REFERENCES deeper_core_names ( id ) ON DELETE SET NULL,
  FOREIGN KEY ( fk_org_id ) REFERENCES deeper_core_organizations ( id ) ON DELETE SET NULL,
  FOREIGN KEY ( fk_email_id ) REFERENCES deeper_core_emails ( id ) ON DELETE SET NULL,
  FOREIGN KEY ( fk_address_id ) REFERENCES deeper_core_addresses ( id ) ON DELETE SET NULL,
  FOREIGN KEY ( fk_nameserver_id ) REFERENCES deeper_core_nameservers ( id ) ON DELETE SET NULL,
  FOREIGN KEY ( fk_phone_id ) REFERENCES deeper_core_phones ( id ) ON DELETE SET NULL,
  FOREIGN KEY ( fk_group_id ) REFERENCES deeper_core_groups ( id ) ON DELETE SET NULL,
  INDEX idx_category ( category )
)//

CREATE TABLE IF NOT EXISTS deeper_dns_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_programs_id INT NOT NULL,
  fk_apex_domains_id INT NOT NULL,
  record_type ENUM ('NS', 'MX', 'TXT', 'A', 'AAAA', 'CNAME', 'SOA', 'SRV', 'CAA', 'PTR', 'OTHER') NOT NULL,
  value VARCHAR(512) NOT NULL,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1,
  fk_nameserver_id INT NULL,
  fk_mx_id INT NULL,
  fk_txt_id INT NULL,
  UNIQUE ( fk_programs_id, fk_apex_domains_id, record_type, value ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_apex_domains_id ) REFERENCES shared_program_apex_domains ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_nameserver_id ) REFERENCES deeper_core_nameservers ( id ) ON DELETE SET NULL,
  FOREIGN KEY ( fk_mx_id ) REFERENCES deeper_core_mx ( id ) ON DELETE SET NULL,
  FOREIGN KEY ( fk_txt_id ) REFERENCES deeper_core_txt ( id ) ON DELETE SET NULL,
  INDEX idx_dns_record ( fk_programs_id, fk_apex_domains_id, record_type )
)//
CREATE TABLE IF NOT EXISTS deeper_attribution_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_programs_id INT NOT NULL,
  target_domain VARCHAR(255) NOT NULL,
  known_apex_domain VARCHAR(255) NOT NULL,
  score INT,
  confidence ENUM ('LOW', 'MEDIUM', 'HIGH', 'UNKNOWN') DEFAULT 'UNKNOWN',
  matched_ns_count INT DEFAULT 0,
  matched_mx_count INT DEFAULT 0,
  matched_txt_count INT DEFAULT 0,
  ip_in_company_range BOOLEAN DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  INDEX idx_attribution ( fk_programs_id, target_domain, known_apex_domain )
)//
CREATE TABLE IF NOT EXISTS deeper_attribution_match_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_attribution_result_id INT NOT NULL,
  match_type ENUM ('NS', 'MX', 'TXT', 'IP', 'OTHER') NOT NULL,
  value VARCHAR(512) NOT NULL,
  match_kind ENUM ('exact', 'partial', 'in_company_range', 'other') NOT NULL,
  FOREIGN KEY ( fk_attribution_result_id ) REFERENCES deeper_attribution_results ( id ) ON DELETE CASCADE,
  INDEX idx_match_detail ( fk_attribution_result_id, match_type )
)//

-- --------------------------------------
-- Linking Tables
-- --------------------------------------
-- Link to associated domains
CREATE TABLE IF NOT EXISTS link_apex_domains_associated_domains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_apex_domains_id INT NOT NULL,
  fk_associated_domain_id INT NOT NULL,
  FOREIGN KEY ( fk_apex_domains_id ) REFERENCES shared_program_apex_domains ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_associated_domain_id ) REFERENCES deeper_associated_domains ( id ) ON DELETE CASCADE,
  UNIQUE ( fk_apex_domains_id, fk_associated_domain_id )
)//

-- Link to connected websites
CREATE TABLE IF NOT EXISTS link_apex_domains_connected_websites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_apex_domains_id INT NOT NULL,
  fk_connected_website_id INT NOT NULL,
  FOREIGN KEY ( fk_apex_domains_id ) REFERENCES shared_program_apex_domains ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_connected_website_id ) REFERENCES deeper_connected_websites ( id ) ON DELETE CASCADE,
  UNIQUE ( fk_apex_domains_id, fk_connected_website_id )
)//

-- Link to tag history
CREATE TABLE IF NOT EXISTS link_apex_domains_tag_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_apex_domains_id INT NOT NULL,
  fk_tag_history_id INT NOT NULL,
  FOREIGN KEY ( fk_apex_domains_id ) REFERENCES shared_program_apex_domains ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_tag_history_id ) REFERENCES deeper_tag_history ( id ) ON DELETE CASCADE,
  UNIQUE ( fk_apex_domains_id, fk_tag_history_id )
)//

-- Link to tracking tags
CREATE TABLE IF NOT EXISTS link_apex_domains_tracking_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_apex_domains_id INT NOT NULL,
  fk_tracking_tag_id INT NOT NULL,
  FOREIGN KEY ( fk_apex_domains_id ) REFERENCES shared_program_apex_domains ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_tracking_tag_id ) REFERENCES deeper_tracking_tags ( id ) ON DELETE CASCADE,
  UNIQUE ( fk_apex_domains_id, fk_tracking_tag_id )
)//


-- Unified link table for emails
CREATE TABLE IF NOT EXISTS link_entity_emails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_type ENUM ('apex_domain', 'asn', 'cidr_range', 'subdomain', 'organization') NOT NULL,
  fk_entity_id INT NOT NULL,
  fk_email_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  source ENUM ('manual', 'rdap', 'whois') NOT NULL,
  UNIQUE ( entity_type, fk_programs_id, fk_entity_id, fk_email_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_email_id ) REFERENCES deeper_core_emails ( id ) ON DELETE CASCADE,
  INDEX idx_entity_email ( entity_type, fk_entity_id, fk_email_id )
)//

-- Unified link table for names
CREATE TABLE IF NOT EXISTS link_entity_names (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_type ENUM ('apex_domain', 'asn', 'cidr_range', 'organization') NOT NULL,
  fk_entity_id INT NOT NULL,
  fk_name_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  source ENUM ('manual', 'rdap', 'whois') NOT NULL,
  UNIQUE ( entity_type, fk_programs_id, fk_entity_id, fk_name_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_name_id ) REFERENCES deeper_core_names ( id ) ON DELETE CASCADE,
  INDEX idx_entity_name ( entity_type, fk_entity_id, fk_name_id )
)//

-- Unified link table for organizations
CREATE TABLE IF NOT EXISTS link_entity_organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_type ENUM ('apex_domain', 'asn', 'cidr_range') NOT NULL,
  fk_entity_id INT NOT NULL,
  fk_org_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  source ENUM ('manual', 'rdap', 'whois') NOT NULL,
  UNIQUE ( entity_type, fk_programs_id, fk_entity_id, fk_org_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_org_id ) REFERENCES deeper_core_organizations ( id ) ON DELETE CASCADE,
  INDEX idx_entity_org ( entity_type, fk_entity_id, fk_org_id )
)//

-- Unified link table for phones
CREATE TABLE IF NOT EXISTS link_entity_phones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_type ENUM ('apex_domain', 'asn', 'cidr_range', 'organization') NOT NULL,
  fk_entity_id INT NOT NULL,
  fk_phone_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  source ENUM ('manual', 'rdap', 'whois') NOT NULL,
  UNIQUE ( entity_type, fk_programs_id, fk_entity_id, fk_phone_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_phone_id ) REFERENCES deeper_core_phones ( id ) ON DELETE CASCADE,
  INDEX idx_entity_phone ( entity_type, fk_entity_id, fk_phone_id )
)//

-- Unified link table for addresses
CREATE TABLE IF NOT EXISTS link_entity_addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  entity_type ENUM ('apex_domain', 'asn', 'cidr_range', 'organization') NOT NULL,
  fk_entity_id INT NOT NULL,
  fk_address_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  source ENUM ('manual', 'rdap', 'whois') NOT NULL,
  UNIQUE ( entity_type, fk_programs_id, fk_entity_id, fk_address_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_address_id ) REFERENCES deeper_core_addresses ( id ) ON DELETE CASCADE,
  INDEX idx_entity_address ( entity_type, fk_entity_id, fk_address_id )
)//

CREATE TABLE IF NOT EXISTS link_apex_domains_cidr_ranges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_apex_domains_id INT NOT NULL,
  fk_cidr_ranges_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  source ENUM ('asnmap', 'rdap', 'whois', 'manual') NOT NULL,
  UNIQUE ( fk_programs_id, fk_apex_domains_id, fk_cidr_ranges_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_apex_domains_id ) REFERENCES deeper_possible_apex_domains ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_cidr_ranges_id ) REFERENCES deeper_cidr_ranges ( id ) ON DELETE CASCADE
)//

CREATE TABLE IF NOT EXISTS link_apex_domains_port_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_apex_domains_id INT NOT NULL,
  fk_port_details_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  UNIQUE ( fk_programs_id, fk_apex_domains_id, fk_port_details_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_apex_domains_id ) REFERENCES shared_program_apex_domains ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_port_details_id ) REFERENCES deeper_port_details ( id ) ON DELETE CASCADE,
  INDEX idx_apex_port ( fk_apex_domains_id, fk_port_details_id )
)//

CREATE TABLE IF NOT EXISTS link_cidr_ranges_port_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_cidr_ranges_id INT NOT NULL,
  fk_port_details_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  UNIQUE ( fk_programs_id, fk_cidr_ranges_id, fk_port_details_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_cidr_ranges_id ) REFERENCES deeper_cidr_ranges ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_port_details_id ) REFERENCES deeper_port_details ( id ) ON DELETE CASCADE,
  INDEX idx_cidr_port ( fk_cidr_ranges_id, fk_port_details_id )
)//

CREATE TABLE IF NOT EXISTS link_apex_asn (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_apex_domains_id INT NOT NULL,
  fk_asn_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  source ENUM ('asnmap', 'rdap', 'whois', 'manual') NOT NULL,
  UNIQUE ( fk_programs_id, fk_apex_domains_id, fk_asn_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_apex_domains_id ) REFERENCES shared_program_apex_domains ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_asn_id ) REFERENCES deeper_asn ( id ) ON DELETE CASCADE
)//

CREATE TABLE IF NOT EXISTS link_apex_domains_subdomains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_apex_domains_id INT NOT NULL,
  fk_subdomains_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  UNIQUE ( fk_programs_id, fk_apex_domains_id, fk_subdomains_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_apex_domains_id ) REFERENCES shared_program_apex_domains ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_subdomains_id ) REFERENCES deeper_subdomains ( id ) ON DELETE CASCADE,
  INDEX idx_apex_subdomain ( fk_apex_domains_id, fk_subdomains_id )
)//

CREATE TABLE IF NOT EXISTS link_asn_cidr_ranges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_asn_id INT NOT NULL,
  fk_cidr_ranges_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  source ENUM ('asnmap', 'rdap', 'whois', 'manual') NOT NULL,
  UNIQUE ( fk_programs_id, fk_asn_id, fk_cidr_ranges_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_asn_id ) REFERENCES deeper_asn ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_cidr_ranges_id ) REFERENCES deeper_cidr_ranges ( id ) ON DELETE CASCADE
)//

CREATE TABLE IF NOT EXISTS link_cidr_ranges_apex_domains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_cidr_ranges_id INT NOT NULL,
  fk_apex_domains_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  UNIQUE ( fk_programs_id, fk_cidr_ranges_id, fk_apex_domains_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_cidr_ranges_id ) REFERENCES deeper_cidr_ranges ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_apex_domains_id ) REFERENCES shared_program_apex_domains ( id ) ON DELETE CASCADE
)//

CREATE TABLE IF NOT EXISTS link_cidr_ranges_subdomains (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_cidr_ranges_id INT NOT NULL,
  fk_subdomains_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  UNIQUE ( fk_programs_id, fk_cidr_ranges_id, fk_subdomains_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_cidr_ranges_id ) REFERENCES deeper_cidr_ranges ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_subdomains_id ) REFERENCES deeper_subdomains ( id ) ON DELETE CASCADE
)//

CREATE TABLE link_subdomains_emails (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_subdomains_id INT,
  fk_email_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  source ENUM ('manual', 'rdap', 'whois') NOT NULL,
  UNIQUE ( fk_programs_id, fk_subdomains_id, fk_email_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_subdomains_id ) REFERENCES deeper_subdomains ( id ) ON DELETE SET NULL,
  FOREIGN KEY ( fk_email_id ) REFERENCES deeper_core_emails ( id ) ON DELETE CASCADE,
  INDEX idx_subdomain_email ( fk_subdomains_id, fk_email_id )
)//

CREATE TABLE IF NOT EXISTS link_subdomains_url_technologies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_subdomains_id INT NOT NULL,
  fk_url_technologies_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  UNIQUE ( fk_programs_id, fk_subdomains_id, fk_url_technologies_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_subdomains_id ) REFERENCES deeper_subdomains ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_url_technologies_id ) REFERENCES deeper_url_technologies ( id ) ON DELETE CASCADE,
  INDEX idx_subdomain_tech ( fk_subdomains_id, fk_url_technologies_id )
)//

CREATE TABLE IF NOT EXISTS link_subdomains_urls (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fk_subdomains_id INT NOT NULL,
  fk_urls_id INT NOT NULL,
  fk_programs_id INT NOT NULL,
  UNIQUE ( fk_programs_id, fk_subdomains_id, fk_urls_id ),
  FOREIGN KEY ( fk_programs_id ) REFERENCES shared_programs ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_subdomains_id ) REFERENCES deeper_subdomains ( id ) ON DELETE CASCADE,
  FOREIGN KEY ( fk_urls_id ) REFERENCES deeper_urls ( id ) ON DELETE CASCADE,
  INDEX idx_subdomain_url ( fk_subdomains_id, fk_urls_id )
)//

-- --------------------------------------
-- Function
-- --------------------------------------

CREATE FUNCTION NET_CONTAINS(cidr VARCHAR(255), ip VARCHAR(45))
  RETURNS BOOLEAN
  DETERMINISTIC
BEGIN
  DECLARE network BIGINT;
  DECLARE mask BIGINT;
  DECLARE ip_num BIGINT;

  SET network = INET_ATON(SUBSTRING_INDEX(cidr, '/', 1));
  SET mask = POW(2, 32) - POW(2, 32 - SUBSTRING_INDEX(cidr, '/', -1));
  SET ip_num = INET_ATON(ip);

  RETURN (ip_num & mask) = (network & mask);
END//

-- --------------------------------------
-- Triggers: Drop Existing
-- --------------------------------------

-- Triggers: Drop existing sls triggers
DROP TRIGGER IF EXISTS sls_trg_check_inscope_domain//
DROP TRIGGER IF EXISTS sls_trg_add_program_credentials//
DROP TRIGGER IF EXISTS sls_before_credentials_insert_validation//
DROP TRIGGER IF EXISTS sls_trg_log_inscope_matches//
DROP TRIGGER IF EXISTS sls_after_credentials_login_domains_insert//
DROP TRIGGER IF EXISTS sls_trg_after_inscope_domain_insert//
DROP TRIGGER IF EXISTS sls_trg_after_inscope_domain_delete//
DROP TRIGGER IF EXISTS sls_trg_new_channel_last_scanned//
DROP TRIGGER IF EXISTS sls_before_credentials_insert_or_update//
DROP TRIGGER IF EXISTS sls_after_working_credentials_insert//
DROP TRIGGER IF EXISTS after_working_credentials_delete//

DROP TRIGGER IF EXISTS sls_handle_credential_insert//
DROP TRIGGER IF EXISTS sls_after_tg_channels_insert//
DROP TRIGGER IF EXISTS sls_after_tg_channels_delete//
DROP TRIGGER IF EXISTS sls_after_tg_files_insert//
DROP TRIGGER IF EXISTS sls_after_tg_files_delete//
DROP TRIGGER IF EXISTS sls_after_credentials_insert//
DROP TRIGGER IF EXISTS sls_after_credentials_delete//
DROP TRIGGER IF EXISTS sls_after_program_credentials_insert//
DROP TRIGGER IF EXISTS sls_after_program_credentials_delete//
DROP TRIGGER IF EXISTS sls_after_tpls_insert//
DROP TRIGGER IF EXISTS sls_after_tpls_delete//
DROP TRIGGER IF EXISTS sls_after_working_credentials_stats_increase//
DROP TRIGGER IF EXISTS sls_after_working_credentials_stats_decrease//

-- Triggers: Drop existing deeper triggers
DROP TRIGGER IF EXISTS deeper_after_asn_insert_rdap_orgs//
DROP TRIGGER IF EXISTS deeper_cidr_ranges_insert_asn//
DROP TRIGGER IF EXISTS deeper_cidr_ranges_insert_apex//
DROP TRIGGER IF EXISTS deeper_after_port_details_insert_apex//
DROP TRIGGER IF EXISTS deeper_after_port_details_insert_cidr//

DROP TRIGGER IF EXISTS deeper_after_subdomains_insert//
DROP TRIGGER IF EXISTS deeper_after_subdomain_insert_cidr//
DROP TRIGGER IF EXISTS deeper_after_subdomains_insert_details//

DROP TRIGGER IF EXISTS deeper_after_url_technologies_insert//
DROP TRIGGER IF EXISTS deeper_after_urls_insert//

-- Triggers: Drop existing shared triggers
DROP TRIGGER IF EXISTS shared_after_programs_insert//
DROP TRIGGER IF EXISTS shared_after_programs_delete//
DROP TRIGGER IF EXISTS after_shared_program_apex_domains_insert//
DROP TRIGGER IF EXISTS after_shared_program_apex_domains_delete//

CREATE TRIGGER IF NOT EXISTS set_is_ipv4_before_insert
  BEFORE INSERT
  ON deeper_cidr_ranges_metadatas
  FOR EACH ROW
BEGIN
  DECLARE cidr VARCHAR(255);
  -- Get the cidr_range from deeper_cidr_ranges using fk_cidr_ranges_id
  SELECT cidr_range
  INTO cidr
  FROM deeper_cidr_ranges
  WHERE id = NEW.fk_cidr_ranges_id;

  -- Set is_ipv4 based on the cidr_range
  SET NEW.is_ipv4 = CASE
    WHEN cidr REGEXP '^[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}/[0-9]{1,2}$' THEN 1
    WHEN cidr REGEXP '^[0-9a-fA-F:]+/[0-9]{1,3}$' THEN 0
    ELSE 1 -- Default to IPv4 if unsure
    END;
END//

-- Trigger to check inscope domains for credentials
CREATE TRIGGER IF NOT EXISTS sls_trg_check_inscope_domain
  BEFORE INSERT
  ON sls_credentials
  FOR EACH ROW
BEGIN
  DECLARE email_domain VARCHAR(255);
  SET email_domain = SUBSTRING_INDEX(NEW.email, '@', -1);

  SET NEW.is_inscope = EXISTS (SELECT 1
  FROM shared_program_apex_domains
  WHERE is_active = 1
    AND (email_domain = apex_domain OR email_domain LIKE CONCAT('%.', apex_domain)));

  SET NEW.is_tparty_login = EXISTS (SELECT 1
  FROM sls_tpls t
       JOIN sls_login_domains ld ON t.domain = ld.domain
  WHERE ld.domain = email_domain);
END//

CREATE TRIGGER IF NOT EXISTS sls_trg_add_program_credentials
  AFTER INSERT
  ON sls_credentials
  FOR EACH ROW
BEGIN
  DECLARE email_domain VARCHAR(255);
  DECLARE email_id INT;

  IF NEW.email REGEXP '^[^@]+@[^@]+\.[^@]+$' THEN
    SET email_domain = SUBSTRING_INDEX(NEW.email, '@', -1);

    INSERT IGNORE INTO deeper_core_emails (email) VALUES (NEW.email);
    SELECT id INTO email_id FROM deeper_core_emails WHERE email = NEW.email;

    INSERT INTO link_entity_emails (entity_type, fk_entity_id, fk_email_id, fk_programs_id, source)
    SELECT DISTINCT 'apex_domain', iad.id, email_id, iad.fk_programs_id, 'manual'
    FROM shared_program_apex_domains iad
         JOIN shared_programs p ON iad.fk_programs_id = p.id
    WHERE iad.is_active = 1 AND p.is_active = 1
      AND (email_domain = iad.apex_domain OR email_domain LIKE CONCAT('%.', iad.apex_domain))
      AND NOT EXISTS (SELECT 1
    FROM link_entity_emails le
    WHERE le.entity_type = 'apex_domain'
      AND le.fk_entity_id = iad.id
      AND le.fk_email_id = email_id
      AND le.fk_programs_id = iad.fk_programs_id);

    INSERT INTO sls_program_credentials (fk_credentials_id, fk_programs_id, curr_found, prev_found, viewed)
    SELECT DISTINCT NEW.id, iad.fk_programs_id, 0, 0, 0
    FROM shared_program_apex_domains iad
         JOIN shared_programs p ON iad.fk_programs_id = p.id
    WHERE iad.is_active = 1 AND p.is_active = 1
      AND (email_domain = iad.apex_domain OR email_domain LIKE CONCAT('%.', iad.apex_domain))
      AND NOT EXISTS (SELECT 1
    FROM sls_program_credentials pc
    WHERE pc.fk_credentials_id = NEW.id
      AND pc.fk_programs_id = iad.fk_programs_id);
  ELSE
    INSERT INTO sls_trigger_log (message)
    VALUES (CONCAT('Invalid email format: ', NEW.email));
  END IF;
END//

-- Trigger to validate credentials
CREATE TRIGGER IF NOT EXISTS sls_before_credentials_insert_validation
  BEFORE INSERT
  ON sls_credentials
  FOR EACH ROW
BEGIN
  IF NEW.password = NEW.email OR
     CHAR_LENGTH(NEW.password) < 8 OR
     NEW.password REGEXP '^[0-9]+$' OR
     NEW.password REGEXP '^[A-Za-z]+$' THEN
    SET NEW.password = '';
  END IF;
END//

-- Trigger to log inscope matches
CREATE TRIGGER IF NOT EXISTS sls_trg_log_inscope_matches
  AFTER INSERT
  ON sls_credentials
  FOR EACH ROW
BEGIN
  DECLARE email_domain VARCHAR(255);
  DECLARE matching_domains TEXT;

  IF NEW.is_inscope = 1 THEN
    SET email_domain = SUBSTRING_INDEX(NEW.email, '@', -1);
    SELECT GROUP_CONCAT(apex_domain)
    INTO matching_domains
    FROM shared_program_apex_domains
    WHERE is_active = 1
      AND (email_domain = apex_domain OR email_domain LIKE CONCAT('%.', apex_domain));

    INSERT INTO sls_trigger_log (message)
    VALUES (CONCAT('Inscope match found - Email: ', NEW.email,
                   ', Domain: ', email_domain,
                   ', Matching inscope domains: ', COALESCE(matching_domains, 'None')));
  END IF;
END//

-- Trigger to update credentials_login_domains
CREATE TRIGGER IF NOT EXISTS sls_after_credentials_login_domains_insert
  AFTER INSERT
  ON sls_credentials_login_domains
  FOR EACH ROW
BEGIN
  DECLARE domain_match INT DEFAULT 0;

  SELECT COUNT(*)
  INTO domain_match
  FROM sls_tpls t
       JOIN sls_login_domains ld ON t.domain = ld.domain
  WHERE ld.id = NEW.fk_login_domains_id;

  IF domain_match > 0 THEN
    UPDATE sls_credentials
    SET is_tparty_login = 1
    WHERE id = NEW.fk_credentials_id;
  END IF;
END//

-- Trigger to update program credentials after apex domain insert
CREATE TRIGGER IF NOT EXISTS sls_trg_after_inscope_domain_insert
  AFTER INSERT
  ON shared_program_apex_domains
  FOR EACH ROW
BEGIN
  IF NEW.is_active = 1 THEN
    INSERT INTO sls_program_credentials (fk_credentials_id, fk_programs_id, curr_found, prev_found, viewed)
    SELECT DISTINCT c.id, NEW.fk_programs_id, 0, 0, 0
    FROM sls_credentials c
    WHERE c.email REGEXP '^[^@]+@[^@]+\.[^@]+$'
      AND (SUBSTRING_INDEX(c.email, '@', -1) = NEW.apex_domain
      OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', NEW.apex_domain))
      AND NOT EXISTS (SELECT 1
    FROM sls_program_credentials pc
    WHERE pc.fk_credentials_id = c.id
      AND pc.fk_programs_id = NEW.fk_programs_id);
  END IF;
END//

-- Trigger to clean up program credentials after apex domain delete
CREATE TRIGGER IF NOT EXISTS sls_trg_after_inscope_domain_delete
  AFTER DELETE
  ON shared_program_apex_domains
  FOR EACH ROW
BEGIN
  DELETE pc
  FROM sls_program_credentials pc
       JOIN sls_credentials c ON pc.fk_credentials_id = c.id
  WHERE pc.fk_programs_id = OLD.fk_programs_id
    AND (SUBSTRING_INDEX(c.email, '@', -1) = OLD.apex_domain
    OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', OLD.apex_domain))
    AND NOT EXISTS (SELECT 1
  FROM shared_program_apex_domains iad
  WHERE iad.fk_programs_id = OLD.fk_programs_id
    AND iad.is_active = 1
    AND iad.id != OLD.id
    AND (SUBSTRING_INDEX(c.email, '@', -1) = iad.apex_domain
    OR SUBSTRING_INDEX(c.email, '@', -1) LIKE CONCAT('%.', iad.apex_domain)));
END//

-- Trigger for Telegram channel last scanned
CREATE TRIGGER IF NOT EXISTS sls_trg_new_channel_last_scanned
  BEFORE INSERT
  ON sls_tg_channels
  FOR EACH ROW
BEGIN
  IF NEW.last_scanned IS NULL THEN
    SET NEW.last_scanned = DATE_SUB(NOW(), INTERVAL 30 DAY);
  END IF;
END//

-- Trigger to set probable password flag
CREATE TRIGGER IF NOT EXISTS sls_before_credentials_insert_or_update
  BEFORE INSERT
  ON sls_credentials
  FOR EACH ROW
BEGIN
  IF LENGTH(NEW.password) >= 8 AND (
    (NEW.password REGEXP '[A-Z]' AND NEW.password REGEXP '[a-z]' AND NEW.password REGEXP '[0-9]')
      OR (NEW.password REGEXP '[A-Z]' AND NEW.password REGEXP '[a-z]' AND NEW.password REGEXP '[^a-zA-Z0-9]')
      OR (NEW.password REGEXP '[A-Z]' AND NEW.password REGEXP '[0-9]' AND NEW.password REGEXP '[^a-zA-Z0-9]')
      OR (NEW.password REGEXP '[a-z]' AND NEW.password REGEXP '[0-9]' AND NEW.password REGEXP '[^a-zA-Z0-9]')
    ) THEN
    SET NEW.is_probable_password = 1;
  ELSE
    SET NEW.is_probable_password = 0;
  END IF;
END//

-- Trigger to update credentials_login_domains for working credentials
CREATE TRIGGER IF NOT EXISTS sls_after_working_credentials_insert
  AFTER INSERT
  ON sls_working_credentials
  FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
      INSERT INTO sls_trigger_log (message)
      VALUES (CONCAT('Error in sls_after_working_credentials_insert for ID: ', NEW.id));
    END;

  UPDATE sls_credentials_login_domains
  SET is_working = TRUE
  WHERE fk_credentials_id = NEW.fk_credentials_id
    AND fk_login_domains_id = NEW.fk_login_domains_id;
END//

CREATE TRIGGER IF NOT EXISTS after_working_credentials_delete
  AFTER DELETE
  ON sls_working_credentials
  FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
      INSERT INTO sls_trigger_log (message)
      VALUES (CONCAT('Error in after_working_credentials_delete for ID: ', OLD.id));
    END;

  UPDATE sls_credentials_login_domains
  SET is_working = FALSE
  WHERE fk_credentials_id = OLD.fk_credentials_id
    AND fk_login_domains_id = OLD.fk_login_domains_id;
END//

-- Trigger to handle duplicate credentials
CREATE TRIGGER IF NOT EXISTS sls_handle_credential_insert
  AFTER INSERT
  ON sls_credentials
  FOR EACH ROW
BEGIN
  DECLARE existing_cred_id INT;
  SELECT c.id
  INTO existing_cred_id
  FROM sls_credentials c
  WHERE c.email = NEW.email
    AND c.password = NEW.password
    AND c.protocol = NEW.protocol
    AND c.id < NEW.id
  LIMIT 1;

  IF existing_cred_id IS NOT NULL THEN
    INSERT INTO sls_trigger_log (message)
    VALUES (CONCAT('Duplicate credential found for ID: ', NEW.id, ', existing ID: ', existing_cred_id));
  END IF;
END//

CREATE TRIGGER IF NOT EXISTS before_update_deeper_whois_details
  BEFORE INSERT
  ON deeper_whois_details
  FOR EACH ROW
BEGIN
  IF NEW.category = 'name' AND (NEW.fk_name_id IS NULL OR NEW.fk_org_id IS NOT NULL OR NEW.fk_email_id IS NOT NULL OR
                                NEW.fk_address_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For name category, fk_name_id must be set and others NULL';
  ELSEIF NEW.category = 'org' AND (NEW.fk_org_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_email_id IS NOT NULL OR
                                   NEW.fk_address_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For org category, fk_org_id must be set and others NULL';
  ELSEIF NEW.category = 'email' AND
         (NEW.fk_email_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_org_id IS NOT NULL OR
          NEW.fk_address_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For email category, fk_email_id must be set and others NULL';
  ELSEIF NEW.category = 'address' AND
         (NEW.fk_address_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_org_id IS NOT NULL OR
          NEW.fk_email_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For address category, fk_address_id must be set and others NULL';
  ELSEIF NEW.category = 'nameserver' AND
         (NEW.fk_nameserver_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_org_id IS NOT NULL OR
          NEW.fk_email_id IS NOT NULL OR NEW.fk_address_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For nameserver category, fk_nameserver_id must be set and others NULL';
  END IF;
END//

CREATE TRIGGER before_insert_deeper_rdap_details
  BEFORE INSERT
  ON deeper_rdap_details
  FOR EACH ROW
BEGIN
  IF NEW.category = 'name' AND (NEW.fk_name_id IS NULL OR NEW.fk_org_id IS NOT NULL OR NEW.fk_email_id IS NOT NULL OR
                                NEW.fk_address_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL OR
                                NEW.fk_phone_id IS NOT NULL OR NEW.fk_group_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For name category, fk_name_id must be set and others NULL';
  ELSEIF NEW.category = 'org' AND (NEW.fk_org_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_email_id IS NOT NULL OR
                                   NEW.fk_address_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL OR
                                   NEW.fk_phone_id IS NOT NULL OR NEW.fk_group_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For org category, fk_org_id must be set and others NULL';
  ELSEIF NEW.category = 'email' AND
         (NEW.fk_email_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_org_id IS NOT NULL OR
          NEW.fk_address_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL OR NEW.fk_phone_id IS NOT NULL OR
          NEW.fk_group_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For email category, fk_email_id must be set and others NULL';
  ELSEIF NEW.category = 'address' AND
         (NEW.fk_address_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_org_id IS NOT NULL OR
          NEW.fk_email_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL OR NEW.fk_phone_id IS NOT NULL OR
          NEW.fk_group_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For address category, fk_address_id must be set and others NULL';
  ELSEIF NEW.category = 'nameserver' AND
         (NEW.fk_nameserver_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_org_id IS NOT NULL OR
          NEW.fk_email_id IS NOT NULL OR NEW.fk_address_id IS NOT NULL OR NEW.fk_phone_id IS NOT NULL OR
          NEW.fk_group_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For nameserver category, fk_nameserver_id must be set and others NULL';
  ELSEIF NEW.category = 'phone' AND
         (NEW.fk_phone_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_org_id IS NOT NULL OR
          NEW.fk_email_id IS NOT NULL OR NEW.fk_address_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL OR
          NEW.fk_group_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For phone category, fk_phone_id must be set and others NULL';
  ELSEIF NEW.category = 'group' AND
         (NEW.fk_group_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_org_id IS NOT NULL OR
          NEW.fk_email_id IS NOT NULL OR NEW.fk_address_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL OR
          NEW.fk_phone_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For group category, fk_group_id must be set and others NULL';
  END IF;
END//

CREATE TRIGGER before_update_deeper_whois_details
  BEFORE UPDATE
  ON deeper_whois_details
  FOR EACH ROW
BEGIN
  IF NEW.category = 'name' AND (NEW.fk_name_id IS NULL OR NEW.fk_org_id IS NOT NULL OR NEW.fk_email_id IS NOT NULL OR
                                NEW.fk_address_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL OR
                                NEW.fk_phone_id IS NOT NULL OR NEW.fk_group_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For name category, fk_name_id must be set and others NULL';
  ELSEIF NEW.category = 'org' AND (NEW.fk_org_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_email_id IS NOT NULL OR
                                   NEW.fk_address_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL OR
                                   NEW.fk_phone_id IS NOT NULL OR NEW.fk_group_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For org category, fk_org_id must be set and others NULL';
  ELSEIF NEW.category = 'email' AND
         (NEW.fk_email_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_org_id IS NOT NULL OR
          NEW.fk_address_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL OR NEW.fk_phone_id IS NOT NULL OR
          NEW.fk_group_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For email category, fk_email_id must be set and others NULL';
  ELSEIF NEW.category = 'address' AND
         (NEW.fk_address_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_org_id IS NOT NULL OR
          NEW.fk_email_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL OR NEW.fk_phone_id IS NOT NULL OR
          NEW.fk_group_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For address category, fk_address_id must be set and others NULL';
  ELSEIF NEW.category = 'nameserver' AND
         (NEW.fk_nameserver_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_org_id IS NOT NULL OR
          NEW.fk_email_id IS NOT NULL OR NEW.fk_address_id IS NOT NULL OR NEW.fk_phone_id IS NOT NULL OR
          NEW.fk_group_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For nameserver category, fk_nameserver_id must be set and others NULL';
  ELSEIF NEW.category = 'phone' AND
         (NEW.fk_phone_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_org_id IS NOT NULL OR
          NEW.fk_email_id IS NOT NULL OR NEW.fk_address_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL OR
          NEW.fk_group_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For phone category, fk_phone_id must be set and others NULL';
  ELSEIF NEW.category = 'group' AND
         (NEW.fk_group_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_org_id IS NOT NULL OR
          NEW.fk_email_id IS NOT NULL OR NEW.fk_address_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL OR
          NEW.fk_phone_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For group category, fk_group_id must be set and others NULL';
  END IF;
END//

CREATE TRIGGER before_update_deeper_rdap_details
  BEFORE UPDATE
  ON deeper_rdap_details
  FOR EACH ROW
BEGIN
  IF NEW.category = 'name' AND (NEW.fk_name_id IS NULL OR NEW.fk_org_id IS NOT NULL OR NEW.fk_email_id IS NOT NULL OR
                                NEW.fk_address_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL OR
                                NEW.fk_phone_id IS NOT NULL OR NEW.fk_group_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For name category, fk_name_id must be set and others NULL';
  ELSEIF NEW.category = 'org' AND (NEW.fk_org_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_email_id IS NOT NULL OR
                                   NEW.fk_address_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL OR
                                   NEW.fk_phone_id IS NOT NULL OR NEW.fk_group_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For org category, fk_org_id must be set and others NULL';
  ELSEIF NEW.category = 'email' AND
         (NEW.fk_email_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_org_id IS NOT NULL OR
          NEW.fk_address_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL OR NEW.fk_phone_id IS NOT NULL OR
          NEW.fk_group_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For email category, fk_email_id must be set and others NULL';
  ELSEIF NEW.category = 'address' AND
         (NEW.fk_address_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_org_id IS NOT NULL OR
          NEW.fk_email_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL OR NEW.fk_phone_id IS NOT NULL OR
          NEW.fk_group_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For address category, fk_address_id must be set and others NULL';
  ELSEIF NEW.category = 'nameserver' AND
         (NEW.fk_nameserver_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_org_id IS NOT NULL OR
          NEW.fk_email_id IS NOT NULL OR NEW.fk_address_id IS NOT NULL OR NEW.fk_phone_id IS NOT NULL OR
          NEW.fk_group_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For nameserver category, fk_nameserver_id must be set and others NULL';
  ELSEIF NEW.category = 'phone' AND
         (NEW.fk_phone_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_org_id IS NOT NULL OR
          NEW.fk_email_id IS NOT NULL OR NEW.fk_address_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL OR
          NEW.fk_group_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For phone category, fk_phone_id must be set and others NULL';
  ELSEIF NEW.category = 'group' AND
         (NEW.fk_group_id IS NULL OR NEW.fk_name_id IS NOT NULL OR NEW.fk_org_id IS NOT NULL OR
          NEW.fk_email_id IS NOT NULL OR NEW.fk_address_id IS NOT NULL OR NEW.fk_nameserver_id IS NOT NULL OR
          NEW.fk_phone_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For group category, fk_group_id must be set and others NULL';
  END IF;
END//

CREATE TRIGGER IF NOT EXISTS deeper_cidr_ranges_insert_asn
  AFTER INSERT
  ON deeper_cidr_ranges
  FOR EACH ROW
BEGIN
  DECLARE done INT DEFAULT 0;
  DECLARE asn_id INT;
  DECLARE cur CURSOR FOR
    SELECT a.id
    FROM deeper_asn a
         JOIN deeper_asn_metadatas am ON a.id = am.fk_asn_id
    WHERE a.fk_programs_id = NEW.fk_programs_id
      AND am.source = 'asnmap';
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

  OPEN cur;
  read_loop:
  LOOP
    FETCH cur INTO asn_id;
    IF done THEN
      LEAVE read_loop;
    END IF;
    INSERT INTO link_asn_cidr_ranges (fk_asn_id, fk_cidr_ranges_id, fk_programs_id)
    VALUES (asn_id, NEW.id, NEW.fk_programs_id)
    ON DUPLICATE KEY UPDATE fk_programs_id = fk_programs_id;
  END LOOP;
  CLOSE cur;

  IF NOT EXISTS (SELECT 1 FROM link_asn_cidr_ranges WHERE fk_cidr_ranges_id = NEW.id) THEN
    INSERT INTO sls_trigger_log (message)
    VALUES (CONCAT('No matching ASN found for CIDR range ID: ', NEW.id, ', fk_programs_id: ', NEW.fk_programs_id));
  END IF;
END//

CREATE TRIGGER IF NOT EXISTS deeper_cidr_ranges_insert_apex
  AFTER INSERT
  ON deeper_cidr_ranges
  FOR EACH ROW
BEGIN
  DECLARE apex_id INT;
  DECLARE source_id INT;

  -- Get appropriate source ID for automatic linking (assuming a source named 'trigger_auto_link' exists)
  SELECT id INTO source_id FROM deeper_sources WHERE name = 'trigger_auto_link' LIMIT 1;

  -- If source doesn't exist, use a default one related to CIDR/ASN operations
  IF source_id IS NULL THEN
    SELECT id
    INTO source_id
    FROM deeper_sources
    WHERE type_id = 2 AND is_active = 1
    LIMIT 1; -- Type 2 is 'ipcidr' from your schema
  END IF;

  -- Find apex domains linked to ASNs that are linked to this CIDR range
  SELECT apd.id
  INTO apex_id
  FROM deeper_possible_apex_domains apd
       JOIN link_apex_asn laa ON apd.id = laa.fk_apex_domains_id
       JOIN link_asn_cidr_ranges lacr ON laa.fk_asn_id = lacr.fk_asn_id
  WHERE lacr.fk_cidr_ranges_id = NEW.id
    AND apd.fk_programs_id = NEW.fk_programs_id
  LIMIT 1;

  IF apex_id IS NOT NULL THEN
    INSERT INTO link_apex_domains_cidr_ranges (fk_apex_domains_id, fk_cidr_ranges_id, fk_programs_id)
    VALUES (apex_id, NEW.id, NEW.fk_programs_id)
    ON DUPLICATE KEY UPDATE fk_programs_id = fk_programs_id;

    -- Also insert into deeper_cidr_ranges_metadatas with the source
    INSERT INTO deeper_cidr_ranges_metadatas
      (source, is_checked, is_inscope, fk_cidr_ranges_id, fk_programs_id)
    SELECT ds.name, 0, 0, NEW.id, NEW.fk_programs_id
    FROM deeper_sources ds
    WHERE ds.id = source_id
    ON DUPLICATE KEY UPDATE source = VALUES(source);
  ELSE
    -- If no apex domain found through ASN link, check for recent apex domain inserts
    -- This helps when domain and CIDR are both being processed
    SELECT id
    INTO apex_id
    FROM deeper_possible_apex_domains
    WHERE fk_programs_id = NEW.fk_programs_id
    ORDER BY discovery_date DESC
    LIMIT 1;

    IF apex_id IS NOT NULL THEN
      INSERT INTO link_apex_domains_cidr_ranges (fk_apex_domains_id, fk_cidr_ranges_id, fk_programs_id)
      VALUES (apex_id, NEW.id, NEW.fk_programs_id)
      ON DUPLICATE KEY UPDATE fk_programs_id = fk_programs_id;

      -- Also insert into deeper_cidr_ranges_metadatas with the source
      INSERT INTO deeper_cidr_ranges_metadatas
        (source, is_checked, is_inscope, fk_cidr_ranges_id, fk_programs_id)
      SELECT ds.name, 0, 0, NEW.id, NEW.fk_programs_id
      FROM deeper_sources ds
      WHERE ds.id = source_id
      ON DUPLICATE KEY UPDATE source = VALUES(source);
    ELSE
      INSERT INTO sls_trigger_log (message)
      VALUES (CONCAT('No matching apex domain found for CIDR range ID: ', NEW.id));
    END IF;
  END IF;
END//

-- Trigger to link port details to apex domains
CREATE TRIGGER IF NOT EXISTS deeper_after_port_details_insert_apex
  AFTER INSERT
  ON deeper_port_details
  FOR EACH ROW
BEGIN
  DECLARE apex_id INT;

  SELECT fk_apex_domains_id
  INTO apex_id
  FROM deeper_subdomains
  WHERE id = NEW.fk_subdomains_id
  LIMIT 1;

  IF apex_id IS NOT NULL THEN
    INSERT INTO link_apex_domains_port_details (fk_apex_domains_id, fk_port_details_id, fk_programs_id)
    VALUES (apex_id, NEW.id, NEW.fk_programs_id)
    ON DUPLICATE KEY UPDATE fk_programs_id = fk_programs_id;
  ELSE
    INSERT INTO sls_trigger_log (message)
    VALUES (CONCAT('No matching apex domain found for port_details ID: ', NEW.id));
  END IF;
END//

-- Trigger to link port details to CIDR ranges
CREATE TRIGGER IF NOT EXISTS deeper_after_port_details_insert_cidr
  AFTER INSERT
  ON deeper_port_details
  FOR EACH ROW
BEGIN
  DECLARE cidr_id INT;

  SELECT cr.id
  INTO cidr_id
  FROM deeper_cidr_ranges cr
       JOIN deeper_subdomains s ON s.id = NEW.fk_subdomains_id
  WHERE NET_CONTAINS(cr.cidr_range, s.ip_address)
    AND cr.fk_programs_id = NEW.fk_programs_id
  LIMIT 1;

  IF cidr_id IS NOT NULL THEN
    INSERT INTO link_cidr_ranges_port_details (fk_cidr_ranges_id, fk_port_details_id, fk_programs_id)
    VALUES (cidr_id, NEW.id, NEW.fk_programs_id)
    ON DUPLICATE KEY UPDATE fk_programs_id = fk_programs_id;
  ELSE
    INSERT INTO sls_trigger_log (message)
    VALUES (CONCAT('No matching CIDR range found for port_details ID: ', NEW.id));
  END IF;
END//

-- Trigger to link subdomains to apex domains
CREATE TRIGGER IF NOT EXISTS deeper_after_subdomains_insert
  AFTER INSERT
  ON deeper_subdomains
  FOR EACH ROW
BEGIN
  DECLARE program_id INT;
  SELECT fk_programs_id
  INTO program_id
  FROM shared_program_apex_domains
  WHERE id = NEW.fk_apex_domains_id;

  INSERT INTO link_apex_domains_subdomains (fk_apex_domains_id, fk_subdomains_id, fk_programs_id)
  VALUES (NEW.fk_apex_domains_id, NEW.id, program_id)
  ON DUPLICATE KEY UPDATE fk_programs_id = fk_programs_id;
END//

-- Trigger to link subdomains to CIDR ranges
CREATE TRIGGER IF NOT EXISTS deeper_after_subdomain_insert_cidr
  AFTER INSERT
  ON deeper_subdomains
  FOR EACH ROW
BEGIN
  DECLARE cidr_id INT;
  DECLARE program_id INT;

  -- Get fk_programs_id from deeper_possible_apex_domains
  SELECT fk_programs_id
  INTO program_id
  FROM shared_program_apex_domains
  WHERE id = NEW.fk_apex_domains_id;

  -- Find matching CIDR based on ip and program
  SELECT id
  INTO cidr_id
  FROM deeper_cidr_ranges
  WHERE NET_CONTAINS(cidr_range, NEW.ip_address)
    AND fk_programs_id = program_id
  LIMIT 1;

  -- Link if CIDR found
  IF cidr_id IS NOT NULL THEN
    INSERT INTO link_cidr_ranges_subdomains (fk_cidr_ranges_id, fk_subdomains_id, fk_programs_id)
    VALUES (cidr_id, NEW.id, program_id)
    ON DUPLICATE KEY UPDATE fk_programs_id = fk_programs_id;
  ELSE
    INSERT INTO sls_trigger_log (message)
    VALUES (CONCAT('No matching CIDR range found for subdomain ID: ', NEW.id));
  END IF;
END//

-- Trigger to link URL technologies to subdomains
CREATE TRIGGER IF NOT EXISTS deeper_after_url_technologies_insert
  AFTER INSERT
  ON deeper_url_technologies
  FOR EACH ROW
BEGIN
  INSERT INTO link_subdomains_url_technologies (fk_subdomains_id, fk_url_technologies_id, fk_programs_id)
  VALUES (NEW.fk_subdomains_id, NEW.id, NEW.fk_programs_id)
  ON DUPLICATE KEY UPDATE fk_programs_id = fk_programs_id;
END//

-- Trigger to link URLs to subdomains
CREATE TRIGGER IF NOT EXISTS deeper_after_urls_insert
  AFTER INSERT
  ON deeper_urls
  FOR EACH ROW
BEGIN
  INSERT INTO link_subdomains_urls (fk_subdomains_id, fk_urls_id, fk_programs_id)
  VALUES (NEW.fk_subdomains_id, NEW.id, NEW.fk_programs_id)
  ON DUPLICATE KEY UPDATE fk_programs_id = fk_programs_id;
END//

CREATE TRIGGER IF NOT EXISTS deeper_after_subdomains_insert_details
  AFTER INSERT
  ON deeper_subdomains
  FOR EACH ROW
BEGIN
  DECLARE program_id INT;

  -- Get the program ID from the apex domain
  SELECT fk_programs_id
  INTO program_id
  FROM shared_program_apex_domains
  WHERE id = NEW.fk_apex_domains_id
  LIMIT 1;

  -- Insert into deeper_subdomain_details
  INSERT INTO deeper_subdomain_details (is_alive, first_seen, last_seen, fk_programs_id, fk_subdomain_id)
  VALUES (NEW.is_active,
          NEW.discovery_date,
          COALESCE(NEW.last_seen, NEW.discovery_date),
          program_id,
          NEW.id);
END//


CREATE TRIGGER before_insert_deeper_dns_records
  BEFORE INSERT
  ON deeper_dns_records
  FOR EACH ROW
BEGIN
  IF NEW.record_type = 'NS' AND
     (NEW.fk_nameserver_id IS NULL OR NEW.fk_mx_id IS NOT NULL OR NEW.fk_txt_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For NS record, fk_nameserver_id must be set and others NULL';
  ELSEIF NEW.record_type = 'MX' AND
         (NEW.fk_mx_id IS NULL OR NEW.fk_nameserver_id IS NOT NULL OR NEW.fk_txt_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For MX record, fk_mx_id must be set and others NULL';
  ELSEIF NEW.record_type = 'TXT' AND
         (NEW.fk_txt_id IS NULL OR NEW.fk_nameserver_id IS NOT NULL OR NEW.fk_mx_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For TXT record, fk_txt_id must be set and others NULL';
  ELSEIF NEW.record_type NOT IN ( 'NS', 'MX', 'TXT' ) AND NEW.value IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For non-NS/MX/TXT records, value must be set';
  END IF;
END//

CREATE TRIGGER before_update_deeper_dns_records
  BEFORE UPDATE
  ON deeper_dns_records
  FOR EACH ROW
BEGIN
  IF NEW.record_type = 'NS' AND
     (NEW.fk_nameserver_id IS NULL OR NEW.fk_mx_id IS NOT NULL OR NEW.fk_txt_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For NS record, fk_nameserver_id must be set and others NULL';
  ELSEIF NEW.record_type = 'MX' AND
         (NEW.fk_mx_id IS NULL OR NEW.fk_nameserver_id IS NOT NULL OR NEW.fk_txt_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For MX record, fk_mx_id must be set and others NULL';
  ELSEIF NEW.record_type = 'TXT' AND
         (NEW.fk_txt_id IS NULL OR NEW.fk_nameserver_id IS NOT NULL OR NEW.fk_mx_id IS NOT NULL) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For TXT record, fk_txt_id must be set and others NULL';
  ELSEIF NEW.record_type NOT IN ( 'NS', 'MX', 'TXT' ) AND NEW.value IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For non-NS/MX/TXT records, value must be set';
  END IF;
END//
-- --------------------------------------
-- Shared Triggers
-- --------------------------------------

-- Trigger for programs insert
CREATE TRIGGER IF NOT EXISTS shared_after_programs_insert
  AFTER INSERT
  ON shared_programs
  FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
      INSERT INTO sls_trigger_log (message)
      VALUES (CONCAT('Error in shared_after_programs_insert for ID: ', NEW.id));
    END;

  UPDATE sls_credential_stats
  SET row_count = row_count + 1
  WHERE table_name = 'shared_programs';
END//

-- Trigger for programs delete
CREATE TRIGGER IF NOT EXISTS shared_after_programs_delete
  AFTER DELETE
  ON shared_programs
  FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
      INSERT INTO sls_trigger_log (message)
      VALUES (CONCAT('Error in shared_after_programs_delete for ID: ', OLD.id));
    END;

  UPDATE sls_credential_stats
  SET row_count = row_count - 1
  WHERE table_name = 'shared_programs';
END//

-- Trigger for apex domains insert
CREATE TRIGGER IF NOT EXISTS after_shared_program_apex_domains_insert
  AFTER INSERT
  ON shared_program_apex_domains
  FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
      INSERT INTO sls_trigger_log (message)
      VALUES (CONCAT('Error in after_shared_program_apex_domains_insert for ID: ', NEW.id));
    END;

  UPDATE sls_credential_stats
  SET row_count = row_count + 1
  WHERE table_name = 'shared_program_apex_domains';
END//

-- Trigger for apex domains delete
CREATE TRIGGER IF NOT EXISTS after_shared_program_apex_domains_delete
  AFTER DELETE
  ON shared_program_apex_domains
  FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
      INSERT INTO sls_trigger_log (message)
      VALUES (CONCAT('Error in after_shared_program_apex_domains_delete for ID: ', OLD.id));
    END;

  UPDATE sls_credential_stats
  SET row_count = row_count - 1
  WHERE table_name = 'shared_program_apex_domains';
END//

-- Trigger for Telegram channels insert
CREATE TRIGGER IF NOT EXISTS sls_after_tg_channels_insert
  AFTER INSERT
  ON sls_tg_channels
  FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
      INSERT INTO sls_trigger_log (message)
      VALUES (CONCAT('Error in sls_after_tg_channels_insert for ID: ', NEW.id));
    END;

  UPDATE sls_credential_stats
  SET row_count = row_count + 1
  WHERE table_name = 'sls_tg_channels';
END//

-- Trigger for Telegram channels delete
CREATE TRIGGER IF NOT EXISTS sls_after_tg_channels_delete
  AFTER DELETE
  ON sls_tg_channels
  FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
      INSERT INTO sls_trigger_log (message)
      VALUES (CONCAT('Error in sls_after_tg_channels_delete for ID: ', OLD.id));
    END;

  UPDATE sls_credential_stats
  SET row_count = row_count - 1
  WHERE table_name = 'sls_tg_channels';
END//

-- Trigger for Telegram files insert
CREATE TRIGGER IF NOT EXISTS sls_after_tg_files_insert
  AFTER INSERT
  ON sls_tg_files
  FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
      INSERT INTO sls_trigger_log (message)
      VALUES (CONCAT('Error in sls_after_tg_files_insert for ID: ', NEW.id));
    END;

  UPDATE sls_credential_stats
  SET row_count = row_count + 1
  WHERE table_name = 'sls_tg_files';
END//

-- Trigger for Telegram files delete
CREATE TRIGGER IF NOT EXISTS sls_after_tg_files_delete
  AFTER DELETE
  ON sls_tg_files
  FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
      INSERT INTO sls_trigger_log (message)
      VALUES (CONCAT('Error in sls_after_tg_files_delete for ID: ', OLD.id));
    END;

  UPDATE sls_credential_stats
  SET row_count = row_count - 1
  WHERE table_name = 'sls_tg_files';
END//

-- Trigger for credentials insert
CREATE TRIGGER IF NOT EXISTS sls_after_credentials_insert
  AFTER INSERT
  ON sls_credentials
  FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
      INSERT INTO sls_trigger_log (message)
      VALUES (CONCAT('Error in sls_after_credentials_insert for ID: ', NEW.id));
    END;

  UPDATE sls_credential_stats
  SET row_count = row_count + 1
  WHERE table_name = 'sls_credentials';
END//

-- Trigger for credentials delete
CREATE TRIGGER IF NOT EXISTS sls_after_credentials_delete
  AFTER DELETE
  ON sls_credentials
  FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
      INSERT INTO sls_trigger_log (message)
      VALUES (CONCAT('Error in sls_after_credentials_delete for ID: ', OLD.id));
    END;

  UPDATE sls_credential_stats
  SET row_count = row_count - 1
  WHERE table_name = 'sls_credentials';
END//

-- Trigger for program credentials insert
CREATE TRIGGER IF NOT EXISTS sls_after_program_credentials_insert
  AFTER INSERT
  ON sls_program_credentials
  FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
      INSERT INTO sls_trigger_log (message)
      VALUES (CONCAT('Error in sls_after_program_credentials_insert for ID: ', NEW.id));
    END;

  UPDATE sls_credential_stats
  SET row_count = row_count + 1
  WHERE table_name = 'sls_program_credentials';
END//

-- Trigger for program credentials delete
CREATE TRIGGER IF NOT EXISTS sls_after_program_credentials_delete
  AFTER DELETE
  ON sls_program_credentials
  FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
      INSERT INTO sls_trigger_log (message)
      VALUES (CONCAT('Error in sls_after_program_credentials_delete for ID: ', OLD.id));
    END;

  UPDATE sls_credential_stats
  SET row_count = row_count - 1
  WHERE table_name = 'sls_program_credentials';
END//

-- Trigger for TPLs insert
CREATE TRIGGER IF NOT EXISTS sls_after_tpls_insert
  AFTER INSERT
  ON sls_tpls
  FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
      INSERT INTO sls_trigger_log (message)
      VALUES (CONCAT('Error in sls_after_tpls_insert for ID: ', NEW.id));
    END;

  UPDATE sls_credential_stats
  SET row_count = row_count + 1
  WHERE table_name = 'sls_tpls';
END//

-- Trigger for TPLs delete
CREATE TRIGGER IF NOT EXISTS sls_after_tpls_delete
  AFTER DELETE
  ON sls_tpls
  FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
      INSERT INTO sls_trigger_log (message)
      VALUES (CONCAT('Error in sls_after_tpls_delete for ID: ', OLD.id));
    END;

  UPDATE sls_credential_stats
  SET row_count = row_count - 1
  WHERE table_name = 'sls_tpls';
END//

-- Trigger for working credentials insert
CREATE TRIGGER IF NOT EXISTS sls_after_working_credentials_stats_increase
  AFTER INSERT
  ON sls_working_credentials
  FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
      INSERT INTO sls_trigger_log (message)
      VALUES (CONCAT('Error in after_working_credentials_insert for ID: ', NEW.id));
    END;

  UPDATE sls_credential_stats
  SET row_count = row_count + 1
  WHERE table_name = 'sls_working_credentials';
END//

-- Trigger for working credentials delete
CREATE TRIGGER IF NOT EXISTS sls_after_working_credentials_stats_decrease
  AFTER DELETE
  ON sls_working_credentials
  FOR EACH ROW
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
      INSERT INTO sls_trigger_log (message)
      VALUES (CONCAT('Error in after_working_credentials_delete for ID: ', OLD.id));
    END;

  UPDATE sls_credential_stats
  SET row_count = row_count - 1
  WHERE table_name = 'sls_working_credentials';
END//

-- --------------------------------------
-- Procedures
-- --------------------------------------

CREATE PROCEDURE sls_delete_duplicate_files()
BEGIN
  DELETE t1
  FROM sls_tg_files t1
       INNER JOIN (SELECT filename, fk_tg_channels_id, file_size, MAX(id) AS keep_id
    FROM sls_tg_files
    GROUP BY filename, fk_tg_channels_id, file_size
    HAVING COUNT(*) > 1) t2 ON t1.filename = t2.filename
      AND t1.fk_tg_channels_id = t2.fk_tg_channels_id
      AND t1.file_size = t2.file_size
      AND t1.id != t2.keep_id;
END//

CREATE PROCEDURE handle_duplicate_guids()
BEGIN
  DECLARE cur_guid BIGINT;
  DECLARE done INT DEFAULT FALSE;

  DECLARE guid_cursor CURSOR FOR
    SELECT guid
    FROM sls_tg_files
    WHERE guid IS NOT NULL
    GROUP BY guid
    HAVING COUNT(*) > 1;

  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  START TRANSACTION;

  OPEN guid_cursor;

  read_loop:
  LOOP
    FETCH guid_cursor INTO cur_guid;
    IF done THEN
      LEAVE read_loop;
    END IF;

    SET @first_id = (SELECT MIN(id) FROM sls_tg_files WHERE guid = cur_guid);

    UPDATE sls_tg_files
    SET downloaded = -9, processed = -9
    WHERE guid = cur_guid AND id <> @first_id;
  END LOOP read_loop;

  CLOSE guid_cursor;
  COMMIT;

  SELECT COUNT(*) AS updated_records
  FROM sls_tg_files
  WHERE downloaded = -9 AND processed = -9;
END//


-- --------------------------------------
-- Initial Data
-- --------------------------------------
INSERT IGNORE INTO sls_credential_stats (table_name, row_count)
VALUES ('platforms', 0),
       ('programs', 0),
       ('apex_domains', 0),
       ('tg_channels', 0),
       ('tg_files', 0),
       ('credentials', 0),
       ('working_credentials', 0),
       ('tpls', 0),
       ('program_credentials', 0)//

INSERT IGNORE INTO shared_programs (program, visibility)
VALUES ('manual', 'n/a')//

INSERT IGNORE INTO sls_tg_channels (channel, title, is_active)
VALUES ('manual', 'no home channel', 1)//

INSERT IGNORE INTO sls_tg_files (file_id, fk_tg_channels_id, filename, downloaded, processed)
SELECT -1, id, 'manual', 1, 0
FROM sls_tg_channels
WHERE channel = 'manual'//

INSERT INTO deeper_source_types (type, description)
VALUES ('asn', 'Autonomous system number data'),
       ('ipcidr', 'IP block and CIDR range info'),
       ('multi', 'Multi information types returned'),
       ('misc', 'Misc information returned'),
       ('rdap', 'Registration data access protocol'),
       ('subdomain', 'Subdomain enumeration results'),
       ('web', 'General website or page data'),
       ('whois', 'Domain registration records')//

# INSERT IGNORE INTO deeper_possible_apex_domains  (apex_domain, status, fk_programs_id) SELECT apex_domain, 1, fk_programs_id FROM shared_program_apex_domains;

DELIMITER ;
