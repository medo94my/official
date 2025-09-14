
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const file = await fs.readFile(dbPath, 'utf8');
    const data = JSON.parse(file);
    const link = data.socialLinks.find((l: any) => l.id === parseInt(params.id));
    if (link) {
      return NextResponse.json(link);
    } else {
      return NextResponse.json({ error: 'Social link not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const file = await fs.readFile(dbPath, 'utf8');
    const data = JSON.parse(file);
    const updatedLink = await req.json();
    const linkIndex = data.socialLinks.findIndex((l: any) => l.id === parseInt(params.id));
    if (linkIndex !== -1) {
      data.socialLinks[linkIndex] = { ...data.socialLinks[linkIndex], ...updatedLink };
      await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
      return NextResponse.json(data.socialLinks[linkIndex], { status: 200 });
    } else {
      return NextResponse.json({ error: 'Social link not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const file = await fs.readFile(dbPath, 'utf8');
    const data = JSON.parse(file);
    const linkIndex = data.socialLinks.findIndex((l: any) => l.id === parseInt(params.id));
    if (linkIndex !== -1) {
      data.socialLinks.splice(linkIndex, 1);
      await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
      return NextResponse.json({ message: 'Social link deleted' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Social link not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
  }
}
