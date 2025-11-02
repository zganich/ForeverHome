#!/bin/bash

# InterpWhat SSL & DNS Verification Script
# Checks HTTPS certificates, DNS resolution, and connectivity

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

DOMAIN="3000-iinx3otu9hzt0gmwzovcq-ba7ae41d.manusvm.computer"

echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${CYAN}  SSL Certificate & DNS Verification${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}🌐 Checking: ${CYAN}${DOMAIN}${NC}"
echo ""

# DNS Resolution Check
echo -e "${BOLD}📡 DNS Resolution${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

DNS_RESULT=$(dig +short "$DOMAIN" 2>/dev/null | head -1)

if [ ! -z "$DNS_RESULT" ]; then
    echo -e "${GREEN}✅ DNS resolves successfully${NC}"
    echo -e "   IP Address(es):"
    dig +short "$DOMAIN" 2>/dev/null | while read ip; do
        echo -e "      ${CYAN}${ip}${NC}"
    done
    
    # Reverse DNS check
    echo ""
    echo -e "   Reverse DNS:"
    dig +short "$DOMAIN" 2>/dev/null | head -1 | xargs -I {} dig +short -x {} 2>/dev/null | while read rdns; do
        echo -e "      ${CYAN}${rdns}${NC}"
    done || echo -e "      ${YELLOW}No reverse DNS record${NC}"
else
    echo -e "${RED}❌ DNS resolution failed${NC}"
    echo -e "   ${YELLOW}Domain may not be configured or DNS is not propagating${NC}"
fi

echo ""

# SSL Certificate Check
echo -e "${BOLD}🔒 SSL Certificate Check${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Get certificate details
CERT_INFO=$(timeout 10 openssl s_client -connect "${DOMAIN}:443" -servername "$DOMAIN" 2>/dev/null | openssl x509 -noout -dates -issuer -subject -fingerprint 2>/dev/null)

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
    
    # Check if certificate is expired or expiring soon
    EXPIRY_DATE=$(echo "$NOT_AFTER" | xargs -I {} date -j -f "%b %d %H:%M:%S %Y %Z" "{}" +%s 2>/dev/null || echo "$NOT_AFTER")
    CURRENT_DATE=$(date +%s)
    
    if [ ! -z "$EXPIRY_DATE" ] && [ "$EXPIRY_DATE" != "$NOT_AFTER" ]; then
        DAYS_UNTIL_EXPIRY=$(( ($EXPIRY_DATE - $CURRENT_DATE) / 86400 ))
        
        if [ $DAYS_UNTIL_EXPIRY -lt 0 ]; then
            echo -e "   ${RED}⚠️  Certificate is EXPIRED${NC}"
        elif [ $DAYS_UNTIL_EXPIRY -lt 30 ]; then
            echo -e "   ${YELLOW}⚠️  Certificate expires in ${DAYS_UNTIL_EXPIRY} days (renew soon)${NC}"
        else
            echo -e "   ${GREEN}✅ Certificate expires in ${DAYS_UNTIL_EXPIRY} days${NC}"
        fi
    fi
    
    # Check certificate chain
    echo ""
    echo -e "   ${BOLD}Certificate Chain:${NC}"
    timeout 10 openssl s_client -connect "${DOMAIN}:443" -servername "$DOMAIN" 2>/dev/null | grep -A 2 "Certificate chain" | tail -1
else
    echo -e "${RED}❌ Could not retrieve SSL certificate${NC}"
    echo -e "   ${YELLOW}Possible issues:${NC}"
    echo -e "   - Server is not responding on port 443"
    echo -e "   - SSL/TLS is not configured"
    echo -e "   - Firewall blocking connection"
fi

echo ""

# HTTPS Connectivity Check
echo -e "${BOLD}🌐 HTTPS Connectivity${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://${DOMAIN}" 2>/dev/null)

if [ ! -z "$HTTP_CODE" ]; then
    if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 400 ]; then
        echo -e "${GREEN}✅ HTTPS connection successful${NC}"
        echo -e "   HTTP Status Code: ${CYAN}${HTTP_CODE}${NC}"
        
        # Check for redirects
        REDIRECT=$(curl -s -o /dev/null -w "%{redirect_url}" --max-time 10 "https://${DOMAIN}" 2>/dev/null)
        if [ ! -z "$REDIRECT" ] && [ "$REDIRECT" != "" ]; then
            echo -e "   Redirects to: ${CYAN}${REDIRECT}${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  HTTPS connection returned status: ${HTTP_CODE}${NC}"
        echo -e "   ${YELLOW}Site may be temporarily unavailable${NC}"
    fi
else
    echo -e "${RED}❌ Could not connect via HTTPS${NC}"
fi

echo ""

# Check certificate SAN (Subject Alternative Names)
echo -e "${BOLD}📋 Certificate Coverage${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

SAN=$(timeout 10 openssl s_client -connect "${DOMAIN}:443" -servername "$DOMAIN" 2>/dev/null | openssl x509 -noout -text 2>/dev/null | grep -A 1 "Subject Alternative Name" | grep DNS: | sed 's/DNS://g' | tr ',' '\n' | sed 's/^ *//')

if [ ! -z "$SAN" ]; then
    echo -e "   ${BOLD}Certificate covers these domains:${NC}"
    echo "$SAN" | while read domain; do
        if [[ "$domain" == *"*"* ]]; then
            echo -e "      ${GREEN}✅ ${domain}${NC} (wildcard)"
        else
            echo -e "      ${GREEN}✅ ${domain}${NC}"
        fi
    done
    
    # Check if our domain is covered
    if echo "$SAN" | grep -q "$DOMAIN\|\\*\.manusvm\.computer"; then
        echo -e "   ${GREEN}✅ Domain is covered by certificate${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Domain may not be explicitly covered${NC}"
    fi
else
    echo -e "   ${YELLOW}Could not retrieve SAN information${NC}"
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
    fi
    
    if echo "$HEADERS" | grep -qi "x-frame-options"; then
        XFO=$(echo "$HEADERS" | grep -i "x-frame-options" | cut -d: -f2- | sed 's/^ *//')
        echo -e "   ${GREEN}✅ X-Frame-Options: ${CYAN}${XFO}${NC}"
    else
        echo -e "   ${YELLOW}⚠️  X-Frame-Options not found${NC}"
    fi
else
    echo -e "   ${YELLOW}Could not retrieve headers${NC}"
fi

echo ""
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${CYAN}  SSL/DNS Check Complete${NC}"
echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

