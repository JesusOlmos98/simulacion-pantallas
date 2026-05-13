# Despliegue Docker - simulacion-pantallas

Apuntes para construir, subir y arrancar el simulador de pantallas en la VPS.

La app Next escucha en el puerto `3005`. COMMAC queda como backend externo en:

```txt
http://37.187.180.179:8080/api
```

## Windows local

En PowerShell, desde la raiz del proyecto:

```powershell
$VERSION = "0.0.1"
$IMAGEN_REMOTA = "cticontrol/simulacion-pantallas:$VERSION"

# Verificacion local opcional antes de construir
yarn build

# Construir imagen local
docker build -t simulacion-pantallas-local .

# Etiquetar imagen local con el nombre remoto
docker tag simulacion-pantallas-local "$IMAGEN_REMOTA"

# Subir imagen al registry
docker push "$IMAGEN_REMOTA"
```

## VPS

En Linux:

```bash
VERSION="0.0.1"
IMAGEN_REMOTA="cticontrol/simulacion-pantallas:$VERSION"

# Bajar la nueva version
docker pull "$IMAGEN_REMOTA"

# Detener y eliminar el contenedor antiguo si existe
docker rm -f simulacion-pantallas-app

# Arrancar el nuevo contenedor
docker run -d \
  --name simulacion-pantallas-app \
  --network portal-net \
  -p 3005:3005 \
  -e NEXT_PUBLIC_COMMAC_BASE_URL=http://37.187.180.179:8080/api \
  "$IMAGEN_REMOTA"
```

Despues deberia estar accesible en:

```txt
http://IP_DE_LA_VPS:3005
```

## Comprobaciones utiles

Ver contenedor:

```bash
docker ps | grep simulacion-pantallas
```

Ver logs:

```bash
docker logs -f simulacion-pantallas-app
```

Probar desde la VPS:

```bash
curl -I http://localhost:3005
```

## Notas

- El puerto publicado es `3005:3005`: izquierda VPS, derecha contenedor.
- Si hay firewall activo, abrir el puerto `3005`.
- Para usar dominio o HTTPS, poner Nginx/Caddy delante apuntando a `http://localhost:3005`.
- El contenedor de COMMAC actual publica `8080 -> 8020`, por eso el simulador usa `http://37.187.180.179:8080/api`.
- Aunque el Dockerfile tiene un valor por defecto para `NEXT_PUBLIC_COMMAC_BASE_URL`, conviene pasarlo en `docker run` para que quede claro que entorno usa cada despliegue.
