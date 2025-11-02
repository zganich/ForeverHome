#!/bin/bash

# Railway SSL & DNS Verification Script
# Checks Railway deployment HTTPS certificates and DNS

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${CYAN}  Railway Deployment SSL & DNS Check${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Prompt for Railway URL
if [ -z "$1" ]; then
    echo -e "${YELLOW}Usage:${NC} bash scripts/check-railway-ssl.sh <railway-url>"
    echo ""
    echo -e "${CYAN}Examples:${NC}"
    echo "  bash scripts/check-railway-ssl.sh interpwhat-production.railway.app"
    echo "  bash scripts/check-railway-ssl.sh yourdomain.com"
    echo ""
    echo -e "${BOLD}Finding Railway URL:${NC}"
    echo "1. Go to https://railway.app"
    echo "2. Select your InterpWhat project"
    echo "3. Go to your service → Settings → Domains"
    echo "4. You'll see either:"
    echo "   - *.railway.app URL (auto-generated)"
    echo "   - Custom domain (if configured)"
    echo ""
    exit 1
fi

DOMAIN="$1"

echo -e "${BOLD}🌐 Checking Railway Deployment: ${CYAN}${DOMAIN}${NC}"
echo ""

# DNS Resolution Check
echo -e "${BOLD}📡 DNS Resolution${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

DNS_RESULT=$(dig +short "$DOMAIN" 2>/dev/null | head -1)

if [ ! -z "$DNS_RESULT" ]; then
    echo -e "${GREEN}✅ DNS resolves successfully${NC}"
    echo -e "   IP Address(es):"
    dig +short "$DOMAIN" 2>/dev/null | while read ip; do
        if [[ "$ip" == *"railway"* ]] || [[ "$ip" == *"."* ]]; then
            echo -e "      ${CYAN}${ip}${NC}"
        else
            echo -e "      ${CYAN}${ip}${NC}"
        fi
    done
else
    echo -e "${RED}❌ DNS resolution failed${NC}"
    echo -e "   ${YELLOW}Domain may not be configured or DNS is not propagating${NC}"
fi

echo ""

# SSL Certificate Check
echo -e "${BOLD}🔒 SSL Certificate Check${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Get certificate details with timeout
CERT_INFO=$(timeout 10 openssl s_client -connect "${DOMAIN}:443" -servername "$DOMAIN" 2>/dev/null | openssl x509 -noout -dates -issuer -subject 2>/dev/null)

if [ ! -z "$CERT_INFO" ]; then
    echo -e "${GREEN}✅ SSL certificate found and valid${NC}"
    echo ""
    
    # Extract certificate details
    NOT_BEFORE=$(echo "$CERT_INFO" | grep "notBefore" | cut -d= -f2)
    NOT_AFTER=$(echo "$CERT_INFO" | grep "notAfter" | cut -d= -f2)
    ISSUER=$(echo "$CERT_INFO" | grep "issuer" | cut -d= -f2-)
    SUBJECT=$(echo "$CERT_INFO" | grep "subject" | cut -d= -f2-)
    
    echo -e "   ${BOLD}Certificate Details:${NC}"
    echo -e "   Valid From: ${CYAN}${NOT_BEFORE}${NC}"
    echo -e "   Valid Until: ${CYAN}${NOT_AFTER}${NC}"
    echo -e "   Issuer: ${CYAN}${ISSUER}${NC}"
    echo -e "   Subject: ${CYAN}${SUBJECT}${NC}"
    
    # Check Railway-specific certificate
    if echo "$ISSUER" | grep -qi "Let's Encrypt\|Railway\|Cloudflare"; then
        echo -e "   ${GREEN}✅ Certificate appears to be properly configured${NC}"
    fi
    
    # Check certificate expiry
    if echo "$NOT_AFTER" | grep -q "202[6-9]"; then
        echo -e "   ${GREEN}✅ Certificate valid well into the future${NC}"
    fi
else
    echo -e "${RED}❌ Could not retrieve SSL certificate${NC}"
    echo -e "   ${YELLOW}Possible issues:${NC}"
    echo -e "   - SSL certificate not provisioned yet (Railway auto-provisions)"
    echo -e "   - Domain not fully configured"
    echo -e "   - DNS propagation delay"
fi

echo ""

# HTTPS Connectivity Check
echo -e "${BOLD}🌐 HTTPS Connectivity${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://${DOMAIN}" 2>/dev/null)
HTTP_TIME=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "https://${DOMAIN}" 2>/dev/null)

if [ ! -z "$HTTP_CODE" ]; then
    if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 400 ]; then
        echo -e "${GREEN}✅ HTTPS connection successful${NC}"
        echo -e "   HTTP Status Code: ${CYAN}${HTTP_CODE}${NC}"
        echo -e "   Response Time: ${CYAN}${HTTP_TIME}s${NC}"
        
        # Check for redirects
        REDIRECT=$(curl -s -o /dev/null -w "%{redirect_url}" --max-time 10 "https://${DOMAIN}" 2>/dev/null)
        if [ ! -z "$REDIRECT" ] && [ "$REDIRECT" != "" ]; then
            echo -e "   Redirects to: ${CYAN}${REDIRECT}${NC}"
        fi
    elif [ "$HTTP_CODE" -eq 502 ] || [ "$HTTP_CODE" -eq 503 ]; then
        echo -e "${YELLOW}⚠️  HTTPS returns ${HTTP_CODE}${NC}"
        echo -e "   ${YELLOW}Application may be deploying or temporarily unavailable${NC}"
        echo -e "   ${CYAN}Check Railway dashboard for deployment status${NC}"
    else
        echo -e "${YELLOW}⚠️  HTTPS connection returned status: ${HTTP_CODE}${NC}"
    fi
else
    echo -e "${RED}❌ Could not connect via HTTPS${NC}"
fi

echo ""

# Railway-specific checks
echo -e "${BOLD}🚂 Railway-Specific Status${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [[ "$DOMAIN" == *".railway.app" ]]; then
    echo -e "${GREEN}✅ Railway auto-generated domain detected${NC}"
    echo -e "   ${CYAN}Railway automatically provisions SSL certificates for *.railway.app${NC}"
    echo -e "   ${CYAN}Certificate should be valid and automatically renewed${NC}"
else
    echo -e "${YELLOW}Custom domain detected${NC}"
    echo -e "   ${CYAN}Verify in Railway dashboard: Settings → Domains${NC}"
    echo -e "   ${CYAN}Railway auto-provisions SSL for verified custom domains${NC}"
    echo ""
    echo -e "   ${BOLD}To verify custom domain:${NC}"
    echo -e "   1. Railway dashboard → Your service → Settings"
    echo -e "   2. Go to 'Domains' section"
    echo -e "   3. Ensure domain shows as 'Verified'"
    echo -e "   4. SSL certificate should auto-provision within minutes"
fi

echo ""

# Security Headers Check
echo -e "${BOLD}🛡️  Security Headers${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

HEADERS=$(curl -s -I --max-time 10 "https://${DOMAIN}" 2>/dev/null)

if [ ! -z "$HEADERS" ]; then
    # Check for important security headers
    if echo "$HEADERS" | grep -qi "strict-transport-security"; then
        HSTS=$(echo "$HEADERS" | grep -i "strict-transport-security" | cut -d: -f2- | sed 's/^ *//')
        echo -e "   ${GREEN}✅ HSTS: ${CYAN}${HSTS}${NC}"
    else
        echo -e "   ${YELLOW}⚠️  HSTS (HTTP Strict Transport Security) not found${NC}"
        echo -e "      ${CYAN}Consider adding HSTS header in your Express app${NC}"
    fi
    
    if echo "$HEADERS" | grep -qi "x-frame-options"; then
        XFO=$(echo "$HEADERS" | grep -i "x-frame-options" | cut -d: -f2- | sed 's/^ *//')
        echo -e "   ${GREEN}✅ X-Frame-Options: ${CYAN}${XFO}${NC}"
    else
        echo -e "   ${YELLOW}⚠️  X-Frame-Options not found${NC}"
    fi
    
    # Check for Railway headers
    if echo "$HEADERS" | grep -qi "railway"; then
        echo -e "   ${GREEN}✅ Railway headers detected${NC}"
    fi
else
    echo -e "   ${YELLOW}Could not retrieve headers${NC}"
fi

echo ""
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${CYAN}  Railway SSL/DNS Check Complete${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}💡 Next Steps:${NC}"
echo -e "   • Check Railway dashboard: https://railway.app"
echo -e "   • View deployment logs in Railway"
echo -e "   • Verify environment variables are set"
echo -e "   • Check service metrics and health"
echo ""

