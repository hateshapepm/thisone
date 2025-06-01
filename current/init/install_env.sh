#!/bin/bash
# dependencies: n/a
# shellcheck disable=SC1087 disable=SC2128 disable=SC2155
. /home/dd/my/scriptz/funcomm/commons.sh
#if [[ -n "$venv_name" && -d "$sls_dir/$venv_name" && -s "$sls_dir/$venv_name/bin/activate" ]]; then
#  echo -e "${LEVEL1}Virtual environment already exists! To ${LEVEL2}activate${LEVEL1}, run${LEVEL3} 'source $venv_name/bin/activate'${RESET}"
#  exit
#else
#  echo -e "${LEVEL1}no : ${LEVEL2}$venv_name${RESET}"
#  # Create a new virtual environment in the current directory
#  echo python3 -m venv "$sls_dir/$venv_name"
#  exit
#fi
venv_exists() {
  local function_name="${FUNCNAME[0]}"
  local venv_test=$1

  if [[ -n "$venv_name" && -d "$sls_dir/$venv_name" && -s "$sls_dir/$venv_name/bin/activate" ]]; then
    if [[ "$messageme_flagv" == 1 ]]; then
      printfunbutunnecessarydashes "${LEVEL1}$(basename "${BASH_SOURCE[0]}") ${LEVEL2}$function_name ${LEVEL3}${LINENO}$RESET"
      echo -e "${LEVEL1}Virtual environment already exists! To ${LEVEL2}activate${LEVEL1}, run${LEVEL3} 'source $venv_name/bin/activate'${RESET}"
    fi
    venv_exists=1
    exit
  else
    printfunbutunnecessarydashes "${LEVEL1}$(basename "${BASH_SOURCE[0]}") ${LEVEL2}$function_name ${LEVEL3}${LINENO}$RESET"
    echo -e "${LEVEL1}Virtual environment does not exist! ${LEVEL2}Creating ${LEVEL1}venv:${LEVEL3} $venv_test${RESET}"
    venv_exists=0
    venv_create "$venv_name"
  fi
}

venv_create() {
  local function_name="${FUNCNAME[0]}"
  local venv_test=$1
  if [[ "$venv_exists" == 0 ]]; then
    printfunbutunnecessarydashes "${LEVEL1}$(basename "${BASH_SOURCE[0]}") ${LEVEL2}$function_name ${LEVEL3}${LINENO}$RESET"
    if [[ -s "$sls_dir/init/requirements.txt" ]]; then
      # Install the packages from requirements.txt
      python3 -m venv "$sls_dir/$venv_test"
      source "$sls_dir/$venv_test/bin/activate"
      pip install -r "$sls_dir/init/requirements.txt"
      if [[ -n "$venv_test" && -d "$sls_dir/$venv_test" && -s "$sls_dir/$venv_test/bin/activate" ]]; then
        venv_exists=1
        venv_exists "$venv_test"
      else
        printfunbutunnecessarydashes "${LEVEL1}$(basename "${BASH_SOURCE[0]}") ${LEVEL2}$function_name ${LEVEL3}${LINENO}$RESET"
        echo -e "${LEVEL1}venv_exists does not exist! ${LEVEL2}Something bad happened!"
        exit
      fi
      exit
    elif [[ ! -s "$sls_dir/init/requirements.txt" ]]; then
      printfunbutunnecessarydashes "${LEVEL1}$(basename "${BASH_SOURCE[0]}") ${LEVEL2}$function_name ${LEVEL3}${LINENO}$RESET"
      echo -e "${LEVEL1}$sls_dir/init/requirements.txt ${LEVEL2}does not exist!"
    fi
    exit
  fi
}

howitdone() {
  echo -e "${LEVEL2}  Usage: ${LEVEL_BLACKBG}${INIT_FILE_BASENAME}${LEVEL1}${RESET} [actions] ${RESET}"

  echo -e "\n${LEVEL2}  Script options${RESET}"
  local how_script_options_done=$(
    cat <<EOF
    ${RESET}-p, --pyvenv-name   ${LEVEL2}Set venv name [default:${LEVEL_BLACKBG}${venv_name}${RESET}${LEVEL2}]

EOF
  )
  echo -e "$how_script_options_done"
  echo -e "\n${LEVEL2}  Helpful options${RESET}"
  local how_helpful_options_done=$(
    cat <<EOF
    ${RESET}-v, --verbose       ${LEVEL3}Print verbose messages [default:${LEVEL2}$messageme_flagv${RESET}${LEVEL3}]
    ${RESET}-h, --help          ${LEVEL2}Print this help and exit
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
  INIT_FILE_BASENAME=$(basename "${BASH_SOURCE[0]}")
  local scriptz_dir="/home/dd/my/scriptz"
  sls_dir="$scriptz_dir/sls"
  venv_exists=0
  venv_name="sls"

  # Pretty colors
  local l1_purewhite='\e[38;5;231m'
  local l2_jordyblue='\e[38;5;111m'
  local l3_goldmetallic='\e[38;5;179m'
  local black_bg='\e[40m'

  LEVEL_BLACKBG=$black_bg
  LEVEL1=$l1_purewhite
  LEVEL2=$l2_jordyblue
  LEVEL3=$l3_goldmetallic
  RESET='\033[00m'

  messageme_flagv=0

  if [[ "$#" -eq 0 ]]; then
    howitdone
    exit
  fi
  while :; do
    case "${1-}" in
    -h | --help) howitdone ;;
    -p | --pyvenv-name)
      if [[ -n "${2-}" && "${2-}" != -* ]]; then
        venv_name="${2-}"
        export venv_name
        shift
      fi
      ;;
    -v | --verbose)
      messageme_flagv=1
      export messageme_flagv
      ;;
    -?*) die "Unknown option: \$1" ;;
    *) break ;;
    esac
    shift
  done
  [[ -z "$venv_name" ]] && die "Missing required parameter: -p | --pyvenv-name"

  return 0
}

parse_params "$@"

if [[ "$messageme_flagv" == 1 ]]; then
  echo -e "${LEVEL1}sls_dir   : ${LEVEL2}$sls_dir${RESET}"
  echo -e "${LEVEL1}venv_name : ${LEVEL2}$venv_name${RESET}"
  echo -e "${LEVEL1}sls_venv  : ${LEVEL2}$sls_dir/$venv_name${RESET}"
  echo
fi

venv_exists "$venv_name"
