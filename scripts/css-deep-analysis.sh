#!/bin/bash

# CSS DEEP ANALYSIS SCRIPT
# Анализирует CSS файл на проблемы, дубликаты, конфликты

CSS_FILE="/Users/PotapovViS/Downloads/Discord-Telegram-Bridge-development/xmlPZ/src/renderer/css/main.css"

echo "🔍 === CSS DEEP ANALYSIS === 🔍"
echo ""

# 1. BASIC STATS
echo "📊 1. BASIC STATS"
echo "  Total lines: $(wc -l < "$CSS_FILE")"
echo "  Total selectors: $(grep -c '^\.' "$CSS_FILE")"
echo "  Total CSS rules: $(grep -c '{' "$CSS_FILE")"
echo "  File size: $(du -h "$CSS_FILE" | cut -f1)"
echo ""

# 2. POSITION ANALYSIS
echo "📌 2. POSITIONED ELEMENTS"
echo "  position: fixed: $(grep -c 'position: fixed' "$CSS_FILE")"
echo "  position: absolute: $(grep -c 'position: absolute' "$CSS_FILE")"
echo "  position: sticky: $(grep -c 'position: sticky' "$CSS_FILE")"
echo ""

# 3. Z-INDEX ANALYSIS
echo "🎨 3. Z-INDEX ANALYSIS"
echo "  Total z-index declarations: $(grep -c 'z-index:' "$CSS_FILE")"
echo ""
echo "  Z-index values used:"
grep -o 'z-index: [0-9]*' "$CSS_FILE" | sort -u | while read line; do
  count=$(grep -c "$line" "$CSS_FILE")
  echo "    $line (используется $count раз)"
done
echo ""

# 4. OVERFLOW ANALYSIS
echo "📜 4. OVERFLOW ANALYSIS"
echo "  overflow: hidden: $(grep -c 'overflow: hidden' "$CSS_FILE")"
echo "  overflow: auto: $(grep -c 'overflow: auto' "$CSS_FILE")"
echo "  overflow: scroll: $(grep -c 'overflow: scroll' "$CSS_FILE")"
echo "  overflow-y: auto: $(grep -c 'overflow-y: auto' "$CSS_FILE")"
echo "  overflow-y: scroll: $(grep -c 'overflow-y: scroll' "$CSS_FILE")"
echo ""

# 5. !IMPORTANT USAGE
echo "⚠️ 5. !IMPORTANT USAGE"
important_count=$(grep -c '!important' "$CSS_FILE")
echo "  Total !important: $important_count"
if [ "$important_count" -gt 0 ]; then
  echo "  ⚠️ Использование !important найдено - может указывать на specificity issues"
fi
echo ""

# 6. HARDCODED VALUES
echo "📏 6. HARDCODED VALUES"
echo "  Hardcoded px widths: $(grep -o 'width: [0-9]*px' "$CSS_FILE" | wc -l)"
echo "  Hardcoded px heights: $(grep -o 'height: [0-9]*px' "$CSS_FILE" | wc -l)"
echo "  Hardcoded px margins: $(grep -o 'margin[^:]*: [0-9]*px' "$CSS_FILE" | wc -l)"
echo "  Hardcoded px paddings: $(grep -o 'padding[^:]*: [0-9]*px' "$CSS_FILE" | wc -l)"
echo ""

# 7. CSS VARIABLES
echo "🎨 7. CSS VARIABLES"
var_count=$(grep -c '^  --' "$CSS_FILE")
echo "  Total CSS variables defined: $var_count"
var_usage=$(grep -o 'var(--[a-z0-9-]*)' "$CSS_FILE" | wc -l)
echo "  Total var() usages: $var_usage"
echo ""

# 8. MEDIA QUERIES
echo "📱 8. MEDIA QUERIES"
media_count=$(grep -c '@media' "$CSS_FILE")
echo "  Total media queries: $media_count"
if [ "$media_count" -eq 0 ]; then
  echo "  ⚠️ Нет media queries - не responsive!"
fi
echo ""

# 9. ANIMATIONS
echo "🎬 9. ANIMATIONS"
echo "  @keyframes: $(grep -c '@keyframes' "$CSS_FILE")"
echo "  animation: property: $(grep -c 'animation:' "$CSS_FILE")"
echo "  transition: property: $(grep -c 'transition:' "$CSS_FILE")"
echo ""

# 10. DUPLICATE SELECTORS
echo "🔄 10. DUPLICATE SELECTORS CHECK"
duplicates=$(grep -o '^\.[a-zA-Z0-9_-]* {' "$CSS_FILE" | sort | uniq -d | wc -l)
echo "  Potential duplicate selectors: $duplicates"
if [ "$duplicates" -gt 0 ]; then
  echo "  ⚠️ Найдены дублирующиеся селекторы!"
  echo "  Top duplicates:"
  grep -o '^\.[a-zA-Z0-9_-]* {' "$CSS_FILE" | sort | uniq -d | head -5
fi
echo ""

# 11. SPECIFICITY ISSUES
echo "⚡ 11. SPECIFICITY ANALYSIS"
echo "  ID selectors (#): $(grep -c '^#' "$CSS_FILE")"
echo "  Deep nesting (4+ levels): $(grep -o '\.[^ ]* \.[^ ]* \.[^ ]* \.[^ ]*' "$CSS_FILE" | wc -l)"
echo ""

# 12. VENDOR PREFIXES
echo "🔧 12. VENDOR PREFIXES"
echo "  -webkit-: $(grep -c '\-webkit-' "$CSS_FILE")"
echo "  -moz-: $(grep -c '\-moz-' "$CSS_FILE")"
echo "  -ms-: $(grep -c '\-ms-' "$CSS_FILE")"
echo ""

echo "🔍 === ANALYSIS COMPLETE === 🔍"
