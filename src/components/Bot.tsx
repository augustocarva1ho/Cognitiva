export default function Bot() {
  return (
    <footer className="bottom-0 flex justify-between items-center bg-green-300 text-zinc-50 w-screen h-20 px-8 text-sm">
      <span>&copy; {new Date().getFullYear()} COGNITIVA. Todos os direitos reservados.</span>
      <div className="flex gap-6">
        <a href="#" className="hover:underline">Política de Privacidade</a>
        <a href="#" className="hover:underline">Termos de Uso</a>
      </div>
    </footer>
  );
}
