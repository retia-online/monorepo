#!/bin/bash

# Requirements checking for environment scripts
# Source this file in your scripts: source "$(dirname "$0")/../common/requirements.sh"

# Source utils first
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/utils.sh"

# Check if a command exists
check_command() {
    local cmd="$1"
    local required="${2:-true}"
    
    if command -v "$cmd" &> /dev/null; then
        print_success "$cmd"
        return 0
    else
        if [ "$required" = "true" ]; then
            print_error "$cmd (no encontrado)"
            return 1
        else
            print_warning "$cmd (no encontrado, opcional)"
            return 0
        fi
    fi
}

# Check Node.js version
check_node_version() {
    local min_version="$1"
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js no instalado"
        return 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2)
    local node_major=$(echo "$node_version" | cut -d'.' -f1)
    
    if [ "$node_major" -ge "$min_version" ]; then
        print_success "Node.js v$node_version (>= $min_version)"
        return 0
    else
        print_error "Node.js v$node_version (necesita >= $min_version)"
        return 1
    fi
}

# Check npm version
check_npm_version() {
    local min_version="$1"
    
    if ! command -v npm &> /dev/null; then
        print_error "npm no instalado"
        return 1
    fi
    
    local npm_version=$(npm --version)
    local npm_major=$(echo "$npm_version" | cut -d'.' -f1)
    
    if [ "$npm_major" -ge "$min_version" ]; then
        print_success "npm v$npm_version (>= $min_version)"
        return 0
    else
        print_error "npm v$npm_version (necesita >= $min_version)"
        return 1
    fi
}

# Check yarn version
check_yarn_version() {
    local min_version="$1"
    
    if ! command -v yarn &> /dev/null; then
        print_error "Yarn no instalado"
        return 1
    fi
    
    local yarn_version=$(yarn --version)
    local yarn_major=$(echo "$yarn_version" | cut -d'.' -f1)
    
    if [ "$yarn_major" -ge "$min_version" ]; then
        print_success "Yarn v$yarn_version (>= $min_version)"
        return 0
    else
        print_error "Yarn v$yarn_version (necesita >= $min_version)"
        return 1
    fi
}

# Check git
check_git_installed() {
    check_command "git"
}

# Check Docker
check_docker_installed() {
    check_command "docker"
}

# Check Docker Compose
check_docker_compose_installed() {
    check_command "docker-compose"
}

# Check Vercel CLI
check_vercel_installed() {
    check_command "vercel"
}

# Check Expo CLI
check_expo_installed() {
    check_command "expo"
}

# Check MongoDB Shell
check_mongosh_installed() {
    check_command "mongosh"
}

# Check MongoDB service (macOS with Homebrew)
check_mongodb_service() {
    if [[ "$OSTYPE" == "darwin"* ]] && command -v brew &> /dev/null; then
        if brew services list | grep -q "mongodb-community.*started"; then
            print_success "MongoDB servicio corriendo (Homebrew)"
            return 0
        else
            print_warning "MongoDB servicio no iniciado (Homebrew)"
            return 1
        fi
    else
        print_info "MongoDB service check solo disponible en macOS con Homebrew"
        return 0
    fi
}

# Check MongoDB connection
check_mongodb_connection() {
    local connection_string="${1:-mongodb://localhost:27017}"
    
    if command -v mongosh &> /dev/null; then
        if mongosh "$connection_string" --eval "db.version()" --quiet &> /dev/null; then
            print_success "MongoDB conectado: $connection_string"
            return 0
        else
            print_error "MongoDB no responde: $connection_string"
            return 1
        fi
    else
        print_warning "mongosh no instalado, no se puede verificar conexión MongoDB"
        return 0
    fi
}

# Check if port is available
check_port() {
    local port="$1"
    local service="$2"
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Puerto $port en uso ($service)"
        return 1
    else
        print_success "Puerto $port disponible ($service)"
        return 0
    fi
}

# Check common ports
check_common_ports() {
    print_subsection "Verificación de puertos comunes"
    
    local ports=(
        "9001:Web App"
        "8081:Expo Metro"
        "27017:MongoDB"
        "3000:Next.js (alternativo)"
        "1025:MailHog (SMTP testing)"
    )
    
    local all_available=true
    
    for port_info in "${ports[@]}"; do
        local port=$(echo "$port_info" | cut -d':' -f1)
        local service=$(echo "$port_info" | cut -d':' -f2)
        
        if ! check_port "$port" "$service"; then
            all_available=false
        fi
    done
    
    if [ "$all_available" = "true" ]; then
        return 0
    else
        return 1
    fi
}

# Check disk space
check_disk_space() {
    local min_gb="${1:-5}"
    local available_gb=$(df -h . | awk 'NR==2 {print $4}' | sed 's/G//')
    
    if [ "$(echo "$available_gb >= $min_gb" | bc)" -eq 1 ]; then
        print_success "Espacio en disco: ${available_gb}GB (>= ${min_gb}GB)"
        return 0
    else
        print_error "Espacio en disco: ${available_gb}GB (necesita >= ${min_gb}GB)"
        return 1
    fi
}

# Check memory
check_memory() {
    local min_gb="${1:-4}"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        local total_mem=$(sysctl hw.memsize | awk '{print $2}')
        local total_gb=$(echo "$total_mem / 1024 / 1024 / 1024" | bc)
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        local total_gb=$(free -g | awk 'NR==2 {print $2}')
    else
        print_warning "Verificación de memoria no disponible para $OSTYPE"
        return 0
    fi
    
    if [ "$total_gb" -ge "$min_gb" ]; then
        print_success "Memoria: ${total_gb}GB (>= ${min_gb}GB)"
        return 0
    else
        print_warning "Memoria: ${total_gb}GB (recomendado >= ${min_gb}GB)"
        return 1
    fi
}

# Check internet connection
check_internet() {
    if ping -c 1 -W 2 8.8.8.8 &> /dev/null; then
        print_success "Conexión a internet"
        return 0
    else
        print_error "Sin conexión a internet"
        return 1
    fi
}

# Check domain resolution
check_domain() {
    local domain="$1"
    
    if nslookup "$domain" &> /dev/null; then
        print_success "Dominio resuelve: $domain"
        return 0
    else
        print_error "Dominio no resuelve: $domain"
        return 1
    fi
}

# Check SSL certificate
check_ssl() {
    local domain="$1"
    
    if openssl s_client -connect "$domain:443" -servername "$domain" < /dev/null 2>/dev/null | openssl x509 -noout -dates &> /dev/null; then
        print_success "SSL válido: $domain"
        return 0
    else
        print_error "SSL inválido o no encontrado: $domain"
        return 1
    fi
}

# Comprehensive environment check
check_environment() {
    local environment="$1"
    
    print_section "Verificación de entorno: $environment"
    
    case "$environment" in
        "local")
            check_local_environment
            ;;
        "staging")
            check_staging_environment
            ;;
        "production")
            check_production_environment
            ;;
        *)
            print_error "Entorno no reconocido: $environment"
            return 1
            ;;
    esac
}

# Local environment requirements
check_local_environment() {
    print_subsection "Requisitos para desarrollo local"
    
    local missing_requirements=0
    
    # Required tools
    print_info "Herramientas requeridas:"
    check_node_version 18 || missing_requirements=1
    check_yarn_version 1 || missing_requirements=1
    check_git_installed || missing_requirements=1
    
    # Optional but recommended
    print_info "Herramientas recomendadas:"
    check_mongosh_installed
    check_docker_installed
    check_expo_installed
    
    # Services
    print_info "Servicios:"
    check_mongodb_service
    check_common_ports
    
    # System resources
    print_info "Recursos del sistema:"
    check_disk_space 5
    check_memory 4
    
    return $missing_requirements
}

# Staging environment requirements
check_staging_environment() {
    print_subsection "Requisitos para staging"
    
    local missing_requirements=0
    
    # Required tools
    print_info "Herramientas requeridas:"
    check_node_version 18 || missing_requirements=1
    check_yarn_version 1 || missing_requirements=1
    check_git_installed || missing_requirements=1
    check_vercel_installed || missing_requirements=1
    
    # Services
    print_info "Servicios externos:"
    check_internet || missing_requirements=1
    
    # Optional
    print_info "Herramientas opcionales:"
    check_expo_installed
    check_mongosh_installed
    
    return $missing_requirements
}

# Production environment requirements
check_production_environment() {
    print_subsection "Requisitos para producción"
    
    local missing_requirements=0
    
    # Required tools
    print_info "Herramientas requeridas:"
    check_node_version 18 || missing_requirements=1
    check_yarn_version 1 || missing_requirements=1
    check_git_installed || missing_requirements=1
    check_vercel_installed || missing_requirements=1
    
    # Services
    print_info "Servicios externos:"
    check_internet || missing_requirements=1
    
    # Security
    print_info "Seguridad:"
    # Domain and SSL checks would require domain parameter
    # check_domain "$domain" || missing_requirements=1
    # check_ssl "$domain" || missing_requirements=1
    
    return $missing_requirements
}

# Installation helpers
install_node() {
    print_subsection "Instalando Node.js"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        print_info "macOS: Instalando con Homebrew..."
        brew install node
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_info "Linux: Instalando con apt..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        print_error "Sistema operativo no soportado: $OSTYPE"
        print_info "Descarga Node.js desde: https://nodejs.org"
        return 1
    fi
    
    check_node_version 18
}

install_yarn() {
    print_subsection "Instalando Yarn"
    
    if command -v npm &> /dev/null; then
        npm install -g yarn
        check_yarn_version 1
    else
        print_error "npm no encontrado, instala Node.js primero"
        return 1
    fi
}

install_git() {
    print_subsection "Instalando Git"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install git
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo apt-get install -y git
    else
        print_error "Sistema operativo no soportado: $OSTYPE"
        print_info "Descarga Git desde: https://git-scm.com"
        return 1
    fi
    
    check_git_installed
}

install_vercel() {
    print_subsection "Instalando Vercel CLI"
    
    if command -v npm &> /dev/null; then
        npm install -g vercel
        check_vercel_installed
    else
        print_error "npm no encontrado, instala Node.js primero"
        return 1
    fi
}

install_expo() {
    print_subsection "Instalando Expo CLI"
    
    if command -v npm &> /dev/null; then
        npm install -g expo-cli
        check_expo_installed
    else
        print_error "npm no encontrado, instala Node.js primero"
        return 1
    fi
}

# Export functions
export -f check_command check_node_version check_npm_version check_yarn_version
export -f check_git_installed check_docker_installed check_docker_compose_installed
export -f check_vercel_installed check_expo_installed check_mongosh_installed
export -f check_mongodb_service check_mongodb_connection check_port check_common_ports
export -f check_disk_space check_memory check_internet check_domain check_ssl
export -f check_environment check_local_environment check_staging_environment check_production_environment
export -f install_node install_yarn install_git install_vercel install_expo

print_debug "Requirements cargadas correctamente"