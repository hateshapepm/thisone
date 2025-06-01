#!/bin/bash
## INFO ###########################################################################
# Input: n/a
# Output: sls_db tables populated
# Dependencies: MySQL
# shellcheck disable=SC1087,SC2128,SC2155

## IMPORTS ########################################################################
. /home/dd/my/scriptz/funcomm/commons.sh

## Pretty Colors ##################################################################
l1_purewhite='\e[38;5;231m'
l2_jordyblue='\e[38;5;111m'
l3_goldmetallic='\e[38;5;179m'
bold_red='\e[1;31m'
black_bg='\e[40m'
LEVEL_BLACKBG=$black_bg
LEVEL1=$l1_purewhite
LEVEL2=$l2_jordyblue
LEVEL3=$l3_goldmetallic
RESET='\033[00m'

count_num_db() {
  db_count=$(mysql -u "$mysql_user" -p"$mysql_password" -N -B -e "SELECT COUNT(SCHEMA_NAME) FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$mysql_db';")
  echo "$db_count"
}

handle_existing_procedures() {
  # Drop all existing stored procedures in the database to prevent duplicate errors
  local procedures=$(mysql -u "$mysql_user" -p"$mysql_password" -N -B -e "SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE' AND ROUTINE_SCHEMA = '$mysql_db';")
  local procedure
  for procedure in $procedures; do
    mysql -u "$mysql_user" -p"$mysql_password" -e "DROP PROCEDURE IF EXISTS $mysql_db.$procedure;"
  done
}

handle_existing_triggers() {
  # Drop all existing triggers in the database to prevent duplicate trigger errors
  local triggers=$(mysql -u "$mysql_user" -p"$mysql_password" -N -B -e "SELECT TRIGGER_NAME FROM INFORMATION_SCHEMA.TRIGGERS WHERE TRIGGER_SCHEMA = '$mysql_db';")
  local trigger
  for trigger in $triggers; do
    mysql -u "$mysql_user" -p"$mysql_password" -e "DROP TRIGGER IF EXISTS $mysql_db.$trigger;"
  done
}

import_csv() {
  local file=$1
  local columns=$2
  if [[ -s "$file" ]]; then
    echo -e "\n${LEVEL_BLACKBG}${LEVEL1}$init_file_basename ${LEVEL2}line:${LEVEL3}$LINENO${RESET}${LEVEL1} Importing file: ${LEVEL3}$file${RESET}"
    if [[ "$file" == "$deeplike_dir/init/csv/sls_tpls.csv" ]]; then
      echo 11112345345
      if [[ "$mysql_db" == "deeplike_db" ]]; then
        echo 22222345345
        python3 "$deeplike_dir/init/load_tpls.py"
      elif [[ "$mysql_db" == "deeplike_db_test_db" ]]; then
        python3 "$deeplike_dir/init/load_tpls.py" --test
      fi
    else
      mysqlimport --fields-terminated-by=',' --columns="$columns" --local -u "$mysql_user" -p"$mysql_password" "$mysql_db" "$file"
    fi
  else
    echo -e "${LEVEL1}error: ${LEVEL2}$init_file_basename ${LEVEL1}line:${LEVEL2}$LINENO ${LEVEL1}File not found: ${LEVEL3}$file${RESET}"
    exit 1
  fi
}

howitdone() {
  echo -e "${LEVEL3}  Usage:${LEVEL2}${init_file_basename}${LEVEL1}${RESET} [actions] ${RESET}"

  echo -e "\n${LEVEL3}  Script options${RESET}"
  local how_script_options_done=$(
    cat <<EOF
    ${RESET}-t,  --test           ${LEVEL3}Use test database instead of prod [default:${LEVEL2}${mysql_db}${RESET}${LEVEL3}]

EOF
  )
  echo -e "$how_script_options_done"
  echo -e "\n${LEVEL3}  Helpful options${RESET}"
  local how_helpful_options_done=$(
    cat <<EOF
    ${RESET}-h,  --help           ${LEVEL3}Print this help and exit
    ${RESET}-vv, --very-verbose   ${LEVEL3}Set client name [default:${LEVEL2}0${RESET}${LEVEL3}]
EOF
  )
  echo -e "$how_helpful_options_done"

  echo && exit
}

cleanup() {
  trap - SIGINT SIGTERM ERR EXIT
}

die() {
  local msg=\$1
  local code=${2-1} # default exit status 1
  echo -e "We got us an error. It's your bad no doubt ... try again or just quit please"
  echo -e "If you care, error information: $msg"
  exit "$code"
}

parse_params() {
  # default values of variables set from params
  init_file_basename=$(basename "${BASH_SOURCE[0]}")

  # Default to production database
  mysql_db="deeplike_db"
  mysql_user="dd"
  mysql_password="this"
  local codes_dir="/home/dd/my/codes"
  deeplike_dir="$codes_dir/deeplike"

  while :; do
    case "${1-}" in
    -h | --help) howitdone ;;
    -t | --test)
      mysql_db="deeplike_test_db"
      ;;
    -vv | --very-verbose) set -x ;;
    *) break ;;
    esac
    shift
  done

  return 0
}

parse_params "$@"

db_count=$(count_num_db)

echo -e "${LEVEL1}Using database: ${LEVEL3}$mysql_db${RESET}"

if [[ "$db_count" == 0 ]]; then
  mysql -u "$mysql_user" -p"$mysql_password" -e "CREATE DATABASE $mysql_db;"
elif [[ "$db_count" == 1 ]]; then
  shopt -s nocasematch
  echo -e "\n${LEVEL_BLACKBG}${LEVEL1}$init_file_basename ${LEVEL2}line:${LEVEL3}$LINENO${RESET} ${bold_red}[!!]${LEVEL1} You will be deleting: ${LEVEL3}$mysql_db${RESET}"
  read -r -p "you sure? (y/n) " answer
  if [[ "$answer" == "y" ]]; then
    echo mysql -u "$mysql_user" -p"$mysql_password" -e "DROP DATABASE $mysql_db;"
    echo mysql -u "$mysql_user" -p"$mysql_password" -e "CREATE DATABASE $mysql_db;"
  else
    echo -e "\n${LEVEL_BLACKBG}${LEVEL1}$init_file_basename ${LEVEL2}line:${LEVEL3}$LINENO${RESET}${LEVEL1}${bold_red} [!!] ${LEVEL1}canceled deleting db: ${LEVEL3}$mysql_db${RESET}"
    exit
  fi
  shopt -u nocasematch
fi

db_count=$(count_num_db)
echo -e "${LEVEL1}db_count: ${LEVEL2}$db_count${RESET}"

if [[ "$db_count" != 1 ]]; then
  echo -e "${LEVEL1}error: ${LEVEL2}$init_file_basename ${LEVEL1}line:${LEVEL2}$LINENO ${LEVEL1}Database creation failed for: ${LEVEL3}$mysql_db${RESET}"
  exit 1
fi

# List of required files (sourceable and non-sourceable)
required_files=(
  "$deeplike_dir/init/shared.sql"
  "$deeplike_dir/init/deeper.sql"
  "$deeplike_dir/init/sls.sql"
)

handle_existing_procedures
handle_existing_triggers

# Loop through files and decide to source or just check existence
for file2source in "${required_files[@]}"; do
  if [[ -s "$file2source" ]]; then
    echo -e "${LEVEL_BLACKBG}${LEVEL1}$init_file_basename ${LEVEL2}line:${LEVEL3}$LINENO${RESET}${LEVEL1} importing schema: ${LEVEL3}$file2source${RESET}"
    if [[ "$file2source" != *.py ]]; then
      mysql -u "$mysql_user" -p"$mysql_password" "$mysql_db" <"$file2source"
    else
      echo -e "${LEVEL1}error: ${LEVEL2}$init_file_basename ${LEVEL1}line:${LEVEL2}$LINENO ${LEVEL1} schema file not found: ${LEVEL3}$file2source"
      exit 1
    fi
  else
    messageme "error" "$init_file_basename() line:$LINENO" "Missing or empty required file:" "$file2source"
  fi
done

# Import shared CSV files
import_csv "$deeplike_dir/init/csv/shared_platforms.csv" "platform,platform_url"
import_csv "$deeplike_dir/init/csv/shared_programs.csv" "program,fk_bb_site,program_visibility"
import_csv "$deeplike_dir/init/csv/shared_inscope_apex_domains.csv" "inscope_apex_domain,is_active,fk_programs_id"
import_csv "$deeplike_dir/init/csv/shared_program_types.csv" "program_type"
import_csv "$deeplike_dir/init/csv/shared_program_visibility.csv" "program_visibility"

# Import sls CSV files
import_csv "$deeplike_dir/init/csv/sls_ignore_apex_emails.csv" "ignore_apex_email,is_active"
import_csv "$deeplike_dir/init/csv/sls_ignore_domains.csv" "ignore_domain,is_active"
import_csv "$deeplike_dir/init/csv/sls_tg_channels.csv" "tg_channel,channel_id,access_hash,tg_title,tg_url,active,last_scanned,created_at"
import_csv "$deeplike_dir/init/csv/sls_tg_channel_statuses.csv" "status,description"
import_csv "$deeplike_dir/init/csv/sls_tpls.csv" "fk_category_id,apex_domain,protocol,domain,url_path,alive,twofa_required,high_value,description,notes"
import_csv "$deeplike_dir/init/csv/sls_tpl_categories.csv" "category"

# Import deeper CSV files
# TBD

echo -e "\n${LEVEL1}Database setup complete!${RESET}"
