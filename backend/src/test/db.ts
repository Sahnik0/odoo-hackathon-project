// Test helper: purge users (and all dependent rows) matching an email fragment,
// so integration tests are isolated from seed data and from each other.

import { prisma } from '../lib/prisma';

export async function purgeUsers(emailContains: string): Promise<void> {
  const users = await prisma.user.findMany({
    where: { email: { contains: emailContains } },
    include: { profile: true },
  });
  const userIds = users.map((u) => u.id);
  const profileIds = users.map((u) => u.profile?.id).filter((id): id is string => !!id);
  if (userIds.length === 0) return;

  await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
  if (profileIds.length) {
    await prisma.document.deleteMany({ where: { employeeProfileId: { in: profileIds } } });
    await prisma.payroll.deleteMany({ where: { employeeProfileId: { in: profileIds } } });
    await prisma.salaryStructure.deleteMany({ where: { employeeProfileId: { in: profileIds } } });
    await prisma.attendance.deleteMany({ where: { employeeProfileId: { in: profileIds } } });
    await prisma.leaveRequest.deleteMany({ where: { employeeProfileId: { in: profileIds } } });
    await prisma.leaveBalance.deleteMany({ where: { employeeProfileId: { in: profileIds } } });
  }
  await prisma.employeeProfile.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
}
