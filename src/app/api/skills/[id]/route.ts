
import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const file = await fs.readFile(dbPath, 'utf8');
    const data = JSON.parse(file);
    const skill = data.skills.find((s: any) => s.id === parseInt(params.id));
    if (skill) {
      return NextResponse.json(skill);
    } else {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const file = await fs.readFile(dbPath, 'utf8');
    const data = JSON.parse(file);
    const updatedSkill = await req.json();
    const skillIndex = data.skills.findIndex((s: any) => s.id === parseInt(params.id));
    if (skillIndex !== -1) {
      data.skills[skillIndex] = { ...data.skills[skillIndex], ...updatedSkill };
      await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
      return NextResponse.json(data.skills[skillIndex], { status: 200 });
    } else {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const file = await fs.readFile(dbPath, 'utf8');
    const data = JSON.parse(file);
    const skillIndex = data.skills.findIndex((s: any) => s.id === parseInt(params.id));
    if (skillIndex !== -1) {
      data.skills.splice(skillIndex, 1);
      await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
      return NextResponse.json({ message: 'Skill deleted' }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
  }
}
