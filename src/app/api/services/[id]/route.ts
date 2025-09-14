
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const file = await fs.readFile(dbPath, 'utf8');
    const data = JSON.parse(file);
    const service = data.services.find((s: any) => s.id === parseInt(params.id));
    if (service) {
      return NextResponse.json(service);
    } else {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const file = await fs.readFile(dbPath, 'utf8');
    const data = JSON.parse(file);
    const updatedService = await req.json();
    const serviceIndex = data.services.findIndex((s: any) => s.id === parseInt(params.id));
    if (serviceIndex !== -1) {
      data.services[serviceIndex] = { ...data.services[serviceIndex], ...updatedService };
      await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
      return NextResponse.json(data.services[serviceIndex], { status: 200 });
    } else {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const file = await fs.readFile(dbPath, 'utf8');
    const data = JSON.parse(file);
    const serviceIndex = data.services.findIndex((s: any) => s.id === parseInt(params.id));
    if (serviceIndex !== -1) {
      data.services.splice(serviceIndex, 1);
      await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
      return NextResponse.json({ message: 'Service deleted' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
  }
}
