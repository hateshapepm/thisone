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

export_to_csv() {
  local table_name="$1"
  local columns="$2" # Comma-separated column names
  local output_file="$3"
  local joins_or_suffix="$4" # Optional JOINs or WHEREs

  IFS=',' read -ra col_array <<<"$columns"

  local col sql_fields=""
  for col in "${col_array[@]}"; do
    # Trim any accidental spaces
    col=$(echo "$col" | xargs)
    sql_fields+="IFNULL($col, ''),"
  done
  # Remove trailing comma
  sql_fields="${sql_fields%,}"

  local query="SELECT CONCAT_WS(',', $sql_fields) FROM $table_name $joins_or_suffix"
  mysql -u "$mysql_user" -p"$mysql_password" "$mysql_db" --batch --silent -e "$query" >"$output_file"
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
  # mysql_db="deeplike_db"
  mysql_db="deeplike_db"
  mysql_user="dd"
  mysql_password="this"
  local codes_dir="/home/dd/my/codes"
  local deeplike_dir="$codes_dir/deeplike"
  deeplike_csv_dir="$deeplike_dir/init/csv"

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

echo -e "${LEVEL1}Using database: ${LEVEL3}$mysql_db${RESET}"

# === CSV Export Section ===
export_to_csv "deeper_source_types" "type,description" "$deeplike_csv_dir/deeper_source_types.csv"
export_to_csv "deeper_sources" "type_id,name,source,description,is_url,is_active,is_used,created_at" "$deeplike_csv_dir/deeper_sources.csv"
export_to_csv "deeper_subdomains_sources" "name,url,description,is_active,created_at" "$deeplike_csv_dir/deeper_subdomains_sources.csv"
export_to_csv "ignore_apex_emails" "ignore_apex_email,is_active" "$deeplike_csv_dir/ignore_apex_emails.csv"
export_to_csv "ignore_domains" "ignore_domain,is_active" "$deeplike_csv_dir/ignore_domains.csv"
export_to_csv "inscope_apex_domains i" "i.inscope_apex_domain,i.is_active,i.fk_programs_id" "$deeplike_csv_dir/inscope_apex_domains.csv" "LEFT JOIN programs p ON i.fk_programs_id = p.programs_id"
export_to_csv "platforms" "platform,platform_url" "$deeplike_csv_dir/platforms.csv"
export_to_csv "program_types" "program_type" "$deeplike_csv_dir/program_types.csv"
export_to_csv "program_visibility" "program_visibility" "$deeplike_csv_dir/program_visibility.csv"
export_to_csv "programs" "program,fk_bb_site,program_visibility,is_active" "$deeplike_csv_dir/programs.csv"
export_to_csv "tg_channel_statuses" "status,description" "$deeplike_csv_dir/tg_channel_statuses.csv"
export_to_csv "tg_channels" "tg_channel,channel_id,access_hash,tg_title,tg_url,active,last_scanned,created_at" "$deeplike_csv_dir/tg_channels.csv"
export_to_csv "tpl_categories" "category" "$deeplike_csv_dir/tpl_categories.csv"
export_to_csv "tpls t" "t.fk_category_id,c.category,t.apex_domain,t.protocol,t.domain,t.url_path,t.alive,t.twofa_required,t.high_value,t.notes,t.description" "$deeplike_csv_dir/tpls.csv.tmp" "LEFT JOIN tpl_categories c ON t.fk_category_id = c.tpl_categories_id"
if [[ -s "$deeplike_csv_dir/tpls.csv.tmp" ]]; then
  cut -d, -f2- "$deeplike_csv_dir/tpls.csv.tmp" >"$deeplike_csv_dir/sls_tpls.csv"
  if [[ -s "$deeplike_csv_dir/sls_tpls.csv" ]]; then
    sed -i 's#,#|#g' "$deeplike_csv_dir/sls_tpls.csv"
  fi
fi

echo -e "\n${LEVEL1}Export to CSV complete!${RESET}"
