import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        attendances: { orderBy: { date: "desc" }, take: 30 },
      },
    });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json({ employee });
  } catch {
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const employee = await prisma.employee.update({
      where: { id },
      data: {
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
    return NextResponse.json({ employee });
  } catch {
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.employee.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}
