#!/bin/bash

# Infrastructure Verification Script
# Checks that all Week 1 components are in place

echo "🔍 Verifying Week 1 Infrastructure Setup..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $1"
        ((PASSED++))
    else
        echo -e "${RED}❌${NC} $1 (missing)"
        ((FAILED++))
    fi
}

# Check Main Process
echo "📦 Main Process:"
check_file "src/main/main.js"
check_file "src/main/storage-manager.js"

# Check Database
echo ""
echo "🗄️  Database:"
check_file "src/main/database/schema.sql"
check_file "src/main/database/migrations/001-initial.sql"
check_file "src/main/database/migrations/002-templates.sql"
check_file "src/main/database/migrations/003-history.sql"

# Check Preload
echo ""
echo "🔐 Preload Script:"
check_file "src/preload/preload.js"

# Check Renderer
echo ""
echo "🎨 Renderer Process:"
check_file "src/renderer/index.html"
check_file "src/renderer/css/main.css"
check_file "src/renderer/js/app.js"
check_file "src/renderer/js/components/accordion.js"
check_file "src/renderer/js/components/input-field.js"

# Check Documentation
echo ""
echo "📚 Documentation:"
check_file "INFRASTRUCTURE.md"
check_file "WEEK1_COMPLETE.md"
check_file "CLAUDE.md"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Passed: ${GREEN}${PASSED}${NC}"
echo -e "Failed: ${RED}${FAILED}${NC}"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Infrastructure verification complete - all files present!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Infrastructure verification failed - some files are missing!${NC}"
    exit 1
fi
