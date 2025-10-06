-- CreateTable
CREATE TABLE "public"."Turma" (
    "id" TEXT NOT NULL,
    "Nome" TEXT NOT NULL,

    CONSTRAINT "Turma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Aluno" (
    "id" TEXT NOT NULL,
    "Nome" TEXT NOT NULL,
    "Matricula" TEXT NOT NULL,
    "Idade" INTEGER,
    "turmaId" TEXT NOT NULL,

    CONSTRAINT "Aluno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Laudo" (
    "id" TEXT NOT NULL,
    "dataEmissao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alunoId" TEXT NOT NULL,

    CONSTRAINT "Laudo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Neurodivergencia" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Neurodivergencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NeurodivergenciaOnLaudo" (
    "laudoId" TEXT NOT NULL,
    "neurodivergenciaId" TEXT NOT NULL,

    CONSTRAINT "NeurodivergenciaOnLaudo_pkey" PRIMARY KEY ("laudoId","neurodivergenciaId")
);

-- CreateTable
CREATE TABLE "public"."Acesso" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Acesso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Docente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "registo" TEXT NOT NULL,
    "nivelAcesso" TEXT NOT NULL,

    CONSTRAINT "Docente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_Matricula_key" ON "public"."Aluno"("Matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Neurodivergencia_nome_key" ON "public"."Neurodivergencia"("nome");

-- AddForeignKey
ALTER TABLE "public"."Aluno" ADD CONSTRAINT "Aluno_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "public"."Turma"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Laudo" ADD CONSTRAINT "Laudo_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "public"."Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NeurodivergenciaOnLaudo" ADD CONSTRAINT "NeurodivergenciaOnLaudo_laudoId_fkey" FOREIGN KEY ("laudoId") REFERENCES "public"."Laudo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NeurodivergenciaOnLaudo" ADD CONSTRAINT "NeurodivergenciaOnLaudo_neurodivergenciaId_fkey" FOREIGN KEY ("neurodivergenciaId") REFERENCES "public"."Neurodivergencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Docente" ADD CONSTRAINT "Docente_nivelAcesso_fkey" FOREIGN KEY ("nivelAcesso") REFERENCES "public"."Acesso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
