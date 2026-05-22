#!/bin/bash

# Common utilities for environment scripts
# Source this file in your scripts: source "$(dirname "$0")/../common/utils.sh"

# Color codes for output
if [ -t 1 ]; then
    # Terminal supports colors
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    RED='\033[0;31m'
    BLUE='\033[0;34m'
    MAGENTA='\033[0;35m'
    CYAN='\033[0;36m'
    NC='\033[0m' # No Color
    BOLD='\033[1m'
    DIM='\033[2m'
else
    # Terminal doesn't support colors (e.g., in CI)
    GREEN=''
    YELLOW=''
    RED=''
    BLUE=''
    MAGENTA=''
    CYAN=''
    NC=''
    BOLD=''
    DIM=''
fi

# Logging functions
print_section() {
    echo -e "\n${YELLOW}📋 $1${NC}"
    echo "----------------------------------------"
}

print_subsection() {
    echo -e "\n${BLUE}🔧 $1${NC}"
    echo "------------------------"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}" >&2
}

print_debug() {
    if [ "${DEBUG:-false}" = "true" ]; then
        echo -e "${DIM}🐛 $1${NC}"
    fi
}

# Input functions
confirm() {
    local prompt="$1"
    local default="${2:-N}"
    local response
    
    if [ "$default" = "Y" ]; then
        prompt="$prompt [Y/n]: "
    else
        prompt="$prompt [y/N]: "
    fi
    
    read -p "$prompt" -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        return 0
    elif [[ $REPLY =~ ^[Nn]$ ]] || [ -z "$REPLY" ]; then
        return 1
    else
        print_warning "Respuesta no válida, usando default: $default"
        [ "$default" = "Y" ] && return 0 || return 1
    fi
}

read_input() {
    local prompt="$1"
    local var_name="$2"
    local default="${3:-}"
    local input
    
    if [ -n "$default" ]; then
        prompt="$prompt [$default]: "
    else
        prompt="$prompt: "
    fi
    
    read -p "$prompt" input
    input="${input:-$default}"
    
    if [ -n "$var_name" ]; then
        eval "$var_name=\"$input\""
    fi
    
    echo "$input"
}

read_secret() {
    local prompt="$1"
    local var_name="$2"
    local secret
    
    prompt="$prompt: "
    read -p "$prompt" -s secret
    echo
    
    if [ -n "$var_name" ]; then
        eval "$var_name=\"$secret\""
    fi
    
    echo "$secret"
}

# Validation functions
validate_email() {
    local email="$1"
    if [[ "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
        return 0
    else
        return 1
    fi
}

validate_url() {
    local url="$1"
    if [[ "$url" =~ ^https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(/.*)?$ ]]; then
        return 0
    else
        return 1
    fi
}

validate_port() {
    local port="$1"
    if [[ "$port" =~ ^[0-9]+$ ]] && [ "$port" -ge 1 ] && [ "$port" -le 65535 ]; then
        return 0
    else
        return 1
    fi
}

validate_not_empty() {
    local value="$1"
    local name="$2"
    
    if [ -z "$value" ]; then
        print_error "$name no puede estar vacío"
        return 1
    fi
    return 0
}

# File operations
backup_file() {
    local file="$1"
    if [ -f "$file" ]; then
        local backup="${file}.backup.$(date +%Y%m%d_%H%M%S)"
        cp "$file" "$backup"
        print_debug "Backup creado: $backup"
        echo "$backup"
    fi
}

restore_backup() {
    local backup_file="$1"
    local original_file="${backup_file%.backup.*}"
    
    if [ -f "$backup_file" ]; then
        cp "$backup_file" "$original_file"
        print_success "Restaurado desde backup: $backup_file"
        return 0
    else
        print_error "Backup no encontrado: $backup_file"
        return 1
    fi
}

create_directory() {
    local dir="$1"
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_debug "Directorio creado: $dir"
    fi
}

# System utilities
get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost"
    else
        echo "localhost"
    fi
}

check_port_available() {
    local port="$1"
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Puerto $port en uso"
        return 1
    else
        print_debug "Puerto $port disponible"
        return 0
    fi
}

free_port() {
    local port="$1"
    if check_port_available "$port"; then
        return 0
    fi
    
    print_warning "Intentando liberar puerto $port..."
    local pids=$(lsof -ti:$port 2>/dev/null)
    
    if [ -n "$pids" ]; then
        echo "$pids" | xargs kill -9 2>/dev/null
        sleep 1
        
        if check_port_available "$port"; then
            print_success "Puerto $port liberado"
            return 0
        else
            print_error "No se pudo liberar puerto $port"
            return 1
        fi
    fi
    
    return 1
}

# String utilities
trim() {
    local str="$1"
    str="${str#"${str%%[![:space:]]*}"}"
    str="${str%"${str##*[![:space:]]}"}"
    echo "$str"
}

to_lower() {
    echo "$1" | tr '[:upper:]' '[:lower:]'
}

to_upper() {
    echo "$1" | tr '[:lower:]' '[:upper:]'
}

slugify() {
    echo "$1" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//'
}

# Error handling
setup_error_trap() {
    trap 'error_handler $LINENO' ERR
}

error_handler() {
    local line="$1"
    print_error "Error en línea $line"
    print_error "Comando: $(sed -n "${line}p" "$0")"
    exit 1
}

cleanup_on_exit() {
    trap 'cleanup_handler' EXIT INT TERM
}

cleanup_handler() {
    print_debug "Ejecutando limpieza..."
    # Add cleanup logic here
}

# Progress indicators
show_spinner() {
    local pid=$!
    local delay=0.1
    local spinstr='|/-\'
    
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

progress_bar() {
    local duration=${1}
    local bar_length=50
    local sleep_interval=$(echo "scale=3; $duration / $bar_length" | bc)
    
    printf "["
    for ((i=0; i<bar_length; i++)); do
        printf "▇"
        sleep $sleep_interval
    done
    printf "]"
    echo
}

# Export functions for use in other scripts
export -f print_section print_subsection print_info print_success print_warning print_error print_debug
export -f confirm read_input read_secret
export -f validate_email validate_url validate_port validate_not_empty
export -f backup_file restore_backup create_directory
export -f get_local_ip check_port_available free_port
export -f trim to_lower to_upper slugify
export -f setup_error_trap error_handler cleanup_on_exit cleanup_handler
export -f show_spinner progress_bar

print_debug "Utils cargadas correctamente"