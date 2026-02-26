import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/** Minimal CSV serialiser — handles commas, quotes, newlines in values */
function toCSV(rows, columns) {
  const escape = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.join(',');
  const body = rows.map((r) => columns.map((c) => escape(r[c])).join(',')).join('\n');
  return `${header}\n${body}`;
}

export default async function adminRoutes(fastify) {
  // ────────────────────────────────────────────────────────────────
  // GET /api/v1/admin/stats  — aggregate platform metrics
  // ────────────────────────────────────────────────────────────────
  fastify.get('/api/v1/admin/stats', async (_req, reply) => {
    const [
      totalUsers,
      totalChurches,
      totalMemberships,
      openRequests,
      pendingApproval,
      assignedRequests,
      resolvedRequests,
      hiddenRequests,
      totalAssignments,
      completedAssignments,
      pendingReports,
      totalReports,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.church.count(),
      prisma.churchMembership.count(),
      prisma.request.count({ where: { status: 'open', hidden: false } }),
      prisma.request.count({ where: { status: 'pending_approval', hidden: false } }),
      prisma.request.count({ where: { status: 'assigned', hidden: false } }),
      prisma.request.count({ where: { status: 'resolved' } }),
      prisma.request.count({ where: { hidden: true } }),
      prisma.volunteerAssignment.count(),
      prisma.volunteerAssignment.count({ where: { status: 'completed' } }),
      prisma.contentReport.count({ where: { status: 'pending' } }),
      prisma.contentReport.count(),
    ]);

    const totalRequests = openRequests + pendingApproval + assignedRequests + resolvedRequests;
    const requestResolutionRate =
      totalRequests > 0 ? Math.round((resolvedRequests / totalRequests) * 100) : 0;
    const volunteerCompletionRate =
      totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

    // Requests by urgency (visible only)
    const urgencyCounts = await prisma.request.groupBy({
      by: ['urgency'],
      where: { hidden: false },
      _count: { _all: true },
    });
    const byUrgency = Object.fromEntries(urgencyCounts.map((r) => [r.urgency, r._count._all]));

    // Requests by status (all)
    const byStatus = { open: openRequests, pending_approval: pendingApproval, assigned: assignedRequests, resolved: resolvedRequests };

    return reply.send({
      data: {
        users: { total: totalUsers },
        churches: { total: totalChurches },
        memberships: { total: totalMemberships },
        requests: {
          total: totalRequests,
          byStatus,
          byUrgency,
          hidden: hiddenRequests,
          requestResolutionRate,
        },
        assignments: {
          total: totalAssignments,
          completed: completedAssignments,
          volunteerCompletionRate,
        },
        moderation: {
          pendingReports,
          totalReports,
        },
      },
    });
  });

  // ────────────────────────────────────────────────────────────────
  // GET /api/v1/admin/export/requests.csv
  // ────────────────────────────────────────────────────────────────
  fastify.get('/api/v1/admin/export/requests.csv', async (_req, reply) => {
    const rows = await prisma.request.findMany({
      include: {
        author: { select: { id: true, displayName: true, email: true } },
        church: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const flat = rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
      urgency: r.urgency,
      visibility: r.visibility,
      anonymous: r.anonymous,
      hidden: r.hidden,
      authorId: r.authorId,
      authorName: r.author?.displayName ?? '',
      authorEmail: r.author?.email ?? '',
      churchId: r.churchId ?? '',
      churchName: r.church?.name ?? '',
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    const columns = [
      'id', 'title', 'description', 'status', 'urgency',
      'visibility', 'anonymous', 'hidden',
      'authorId', 'authorName', 'authorEmail',
      'churchId', 'churchName',
      'createdAt', 'updatedAt',
    ];

    reply
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', 'attachment; filename="requests.csv"')
      .send(toCSV(flat, columns));
  });

  // ────────────────────────────────────────────────────────────────
  // GET /api/v1/admin/export/assignments.csv
  // ────────────────────────────────────────────────────────────────
  fastify.get('/api/v1/admin/export/assignments.csv', async (_req, reply) => {
    const rows = await prisma.volunteerAssignment.findMany({
      include: {
        request: { select: { id: true, title: true, status: true } },
        volunteer: { select: { id: true, displayName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const flat = rows.map((r) => ({
      id: r.id,
      requestId: r.requestId,
      requestTitle: r.request?.title ?? '',
      requestStatus: r.request?.status ?? '',
      volunteerId: r.volunteerId,
      volunteerName: r.volunteer?.displayName ?? '',
      volunteerEmail: r.volunteer?.email ?? '',
      status: r.status,
      note: r.note ?? '',
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    const columns = [
      'id', 'requestId', 'requestTitle', 'requestStatus',
      'volunteerId', 'volunteerName', 'volunteerEmail',
      'status', 'note', 'createdAt', 'updatedAt',
    ];

    reply
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', 'attachment; filename="assignments.csv"')
      .send(toCSV(flat, columns));
  });
}
