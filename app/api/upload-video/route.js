import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const chunk = formData.get('chunk');     // O pedaço de vídeo
    const salaId = formData.get('salaId');   // ID da sala (ex: a3b8c19d...)
    const role = formData.get('role');       // 'prof' ou 'aluno'

    if (!chunk || !salaId || !role) {
      return NextResponse.json({ erro: 'Dados incompletos' }, { status: 400 });
    }

    // Converte o pedaço de vídeo para o formato do servidor
    const buffer = Buffer.from(await chunk.arrayBuffer());
    
    // ==========================================
    // MUDANÇA AQUI: Criando a subpasta com o ID da sala
    // ==========================================
    const uploadDir = path.join(process.cwd(), 'uploads', salaId);
    
    // O recursive: true é genial porque ele cria a pasta 'uploads' e a subpasta 'salaId' de uma vez só!
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Como já estamos dentro da pasta da sala, o arquivo pode chamar só prof.webm ou aluno.webm
    const filePath = path.join(uploadDir, `${role}.webm`);
    
    // Cola o pedaço de vídeo
    await fs.promises.appendFile(filePath, buffer);

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    console.error('Erro ao salvar chunk de vídeo:', error);
    return NextResponse.json({ erro: 'Falha no upload' }, { status: 500 });
  }
}