import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { attendances: true } } },
    });
    return NextResponse.json({ employees });
  } catch {
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await prisma.employee.count();
    const year = new Date().getFullYear();
    const seq = String(count + 1).padStart(3, "0");
    const staffCategory = body.staffCategory || "academic";
    const prefix = staffCategory === "academic" ? "FAC" : "STA";
    const employeeId = `${prefix}/${year}/${seq}`;

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        staffCategory: body.staffCategory,
        title: body.title,
        lastName: body.lastName,
        firstName: body.firstName,
        middleName: body.middleName || null,
        gender: body.gender,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        phone: body.phone || null,
        email: body.email,
        address: body.address || null,
        faculty: body.faculty || null,
        school: body.school || null,
        department: body.department || null,
        designation: body.designation,
        employmentType: body.employmentType,
        dateOfEmployment: body.dateOfEmployment ? new Date(body.dateOfEmployment) : null,
        qualification: body.qualification || null,
        specialization: body.specialization || null,
        nextOfKinName: body.nextOfKinName || null,
        nextOfKinPhone: body.nextOfKinPhone || null,
        nextOfKinRelation: body.nextOfKinRelation || null,
      },
    });

    return NextResponse.json({ employee }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create employee";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
