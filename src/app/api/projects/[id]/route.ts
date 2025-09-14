
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const file = await fs.readFile(dbPath, 'utf8');
    const data = JSON.parse(file);
    const project = data.projects.find((p: any) => p.id === parseInt(params.id));
    if (project) {
      return NextResponse.json(project);
    } else {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const file = await fs.readFile(dbPath, 'utf8');
    const data = JSON.parse(file);
    const updatedProject = await req.json();
    const projectIndex = data.projects.findIndex((p: any) => p.id === parseInt(params.id));
    if (projectIndex !== -1) {
      data.projects[projectIndex] = { ...data.projects[projectIndex], ...updatedProject };
      await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
      return NextResponse.json(data.projects[projectIndex], { status: 200 });
    } else {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const file = await fs.readFile(dbPath, 'utf8');
    const data = JSON.parse(file);
    const projectIndex = data.projects.findIndex((p: any) => p.id === parseInt(params.id));
    if (projectIndex !== -1) {
      data.projects.splice(projectIndex, 1);
      await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
      return NextResponse.json({ message: 'Project deleted' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
  }
}
