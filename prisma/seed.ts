// Prisma seed — Phase 1 populates 1 admin + 5+ employees across all entities.
// Phase 0: placeholder so `npm run seed` resolves without error.

async function main() {
  // Populated in Phase 1.
}

main().catch((e) => {
  // eslint-disable-next-line no-console -- seed script runs standalone, not in the request path
  console.error(e);
  process.exit(1);
});
