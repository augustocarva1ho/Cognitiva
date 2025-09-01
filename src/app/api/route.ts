import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET() {
  console.log('Entrou na API')
  try {
    const nomes = await prisma.teste.findMany({ select: { Nome: true } })
    console.log('Nomes:', nomes)
    return NextResponse.json(nomes)
  } catch (error) {
    console.error('Erro no GET /api:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

  
