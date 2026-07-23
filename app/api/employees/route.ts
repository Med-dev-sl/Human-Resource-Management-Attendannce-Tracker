import { prisma } from "@/lib/prisma";
import { success, error, withRateLimit } from "@/lib/api-utils";
import { parsePagination, paginate } from "@/lib/pagination";
import { employeeSchema } from "@/lib/validation";
import { getCached, setCache, generateCacheKey } from "@/lib/cache";

export async function GET(request: Request) {
  const rateLimitResult = withRateLimit(request, 120, 60_000);
  if (rateLimitResult) return rateLimitResult.response;

  try {
    const { searchParams } = new URL(request.url);
    const pag = parsePagination(searchParams);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    const cacheKey = generateCacheKey("employees:list", search, category, status, String(pag.page), String(pag.limit));
    const cached = await getCached<unknown>(cacheKey);
    if (cached) return success(cached, 200, 15);

    const where: Record<string, unknown> = {};
    if (category) where.staffCategory = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { employeeId: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip: pag.skip,
        take: pag.limit,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { attendances: true } } },
      }),
      prisma.employee.count({ where }),
    ]);

    const result = paginate(employees, total, pag);
    await setCache(cacheKey, result, 15_000);
    return success(result, 200, 15);
  } catch (err) {
    return error("Failed to fetch employees", 500);
  }
}

export async function POST(request: Request) {
  const rateLimitResult = withRateLimit(request, 30, 60_000);
  if (rateLimitResult) return rateLimitResult.response;

  try {
    const body = await request.json();
    const parsed = employeeSchema.safeParse(body);
    if (!parsed.success) {
      return error("Validation failed", 400, parsed.error.flatten().fieldErrors);
    }

    const count = await prisma.employee.count();
    const year = new Date().getFullYear();
    const seq = String(count + 1).padStart(3, "0");
    const prefix = parsed.data.staffCategory === "academic" ? "FAC" : "STA";
    const employeeId = `${prefix}/${year}/${seq}`;

    const employee = await prisma.employee.create({
      data: { ...parsed.data, employeeId, dateOfBirth: parsed.data.dateOfBirth ? new Date(parsed.data.dateOfBirth) : null, dateOfEmployment: parsed.data.dateOfEmployment ? new Date(parsed.data.dateOfEmployment) : null },
    });

    return success({ employee }, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create employee";
    return error(message, 500);
  }
}
