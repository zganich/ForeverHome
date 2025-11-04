#!/usr/bin/env tsx
/**
 * Generate Beta Codes for Phase 1 Beta Testing
 * 
 * Usage:
 *   pnpm tsx scripts/generate-beta-codes.ts [count] [maxUses] [notes]
 * 
 * Examples:
 *   pnpm tsx scripts/generate-beta-codes.ts 10              # Generate 10 single-use codes
 *   pnpm tsx scripts/generate-beta-codes.ts 5 5              # Generate 5 codes, each usable 5 times
 *   pnpm tsx scripts/generate-beta-codes.ts 1 1 "For tester John"  # Generate 1 code with notes
 */

import { generateBetaCode } from '../server/credits';

async function main() {
  const count = parseInt(process.argv[2] || '1', 10);
  const maxUses = parseInt(process.argv[3] || '1', 10);
  const notes = process.argv[4] || 'Phase 1 Beta Testing';

  if (isNaN(count) || count < 1) {
    console.error('Error: Count must be a positive number');
    process.exit(1);
  }

  if (isNaN(maxUses) || maxUses < 1) {
    console.error('Error: Max uses must be a positive number');
    process.exit(1);
  }

  console.log(`\n🔑 Generating ${count} beta code(s)...`);
  console.log(`   Max uses per code: ${maxUses}`);
  console.log(`   Notes: ${notes}\n`);

  const codes: string[] = [];

  for (let i = 0; i < count; i++) {
    try {
      const code = await generateBetaCode({
        maxUses,
        notes: notes,
      });
      codes.push(code);
      console.log(`✅ ${i + 1}. ${code}`);
    } catch (error) {
      console.error(`❌ Failed to generate code ${i + 1}:`, error);
    }
  }

  console.log(`\n📋 Generated ${codes.length} beta code(s):\n`);
  codes.forEach((code, index) => {
    console.log(`${index + 1}. ${code}`);
  });

  console.log(`\n💡 Copy these codes and share them with beta testers.`);
  console.log(`   They can enter the code during signup or redeem it in their dashboard.\n`);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

