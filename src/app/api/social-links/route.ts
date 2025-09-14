
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');

export async function GET() {
  try {
    const file = await fs.readFile(dbPath, 'utf8');
    const data = JSON.parse(file);
    return NextResponse.json(data.socialLinks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const file = await fs.readFile(dbPath, 'utf8');
    const data = JSON.parse(file);
    const newLink = await req.json();
    newLink.id = data.socialLinks.length > 0 ? Math.max(...data.socialLinks.map((l: any) => l.id)) + 1 : 1;
    data.socialLinks.push(newLink);
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
    return NextResponse.json(newLink, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
  }
}
