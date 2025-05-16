## Getting Started

## Requisitos Previos

- Node.js 18 o superior
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/alexisfelixr/energy-monitoring-frontend.git
cd energy-monitoring-frontend
```

2. Instalar dependencias:
```bash
npm install
# o
yarn install
```

3. Configuración del entorno:
Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
# App
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Ejecución:
Primero, iniciar el servidor de desarrollo (backend local):

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
