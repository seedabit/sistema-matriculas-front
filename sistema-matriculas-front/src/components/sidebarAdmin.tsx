import React from "react";
import { useRouter, usePathname } from "next/navigation";

const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { name: "Início", route: "/inicio" },
    { name: "Criar turmas", route: "/criarTurma" },
    { name: "Visualizar turmas", route: "/visualizarTurmas" },
    { name: "Gerar relatórios", route: "/gerarRelatorios" },
  ];

  return (
    <aside className="fixed top-0 left-0 w-64 bg-blue-900 text-white h-full p-6 flex flex-col justify-between">
      <div>

        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Logo" className="w-24 h-24 mb-4" />
          <h1 className="text-lg font-bold text-center">
            Vanilma Karla B. de Freitas
          </h1>
          <p className="text-sm text-center">Administrador</p>
        </div>

        <nav>
          <ul className="space-y-4">
            {menuItems.map((item) => (
              <li key={item.route}>
                <button
                  onClick={() => router.push(item.route)}
                  className={`w-full text-center border-2 rounded px-4 py-2 font-medium ${
                    pathname === item.route
                      ? "bg-orange-500 text-blue-900 border-orange-500"
                      : "bg-transparent text-white border-orange-500 hover:bg-orange-500 hover:text-blue-900"
                  }`}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;