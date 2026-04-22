<!-- Page: 1 -->

```
#!/bin/bash

# Script para instalar ferramentas Unix necessárias para extração de dados da CONAB
# Deve ser executado com privilégios sudo para instalação de pacotes

set -e # interrompe em caso de erro

echo "π Iniciando instalação das dependências..."
echo "------------------"

# Verifica se está sendo executado com sudo (necessário para apt)
if [ "$EUID" -ne 0 ]; then
    echo "✗ Por favor, execute com sudo: sudo ./instalar_dependencies.sh"
    exit 1
fi

# Atualizar lista de pacotes
echo "₯ Atualizando repositórios..."
apt update -y

# Instalar pacotes via apt
echo "₯ Instalando pacotes via apt..."
apt install -y curl jq sqlite3 wget unzip gawk

# Verificar instalação dos pacotes apt
echo "✓ Verificando instalações..."
for pkg in curl jq sqlite3 wget unzip gawk; do
    if command -v $pkg &> /dev/null; then
        echo "✓ $pkg instalado"
    else
        echo "✗ $pkg NÃO encontrado"
    exit 1
fi

done

# Instalar pup (parse HTML) manualmente
echo "₯ Baixando e instalando pup..."
PUP_VERSION="0.4.0"
PUP_URL="https://github.com/ericchiang/pup/releases/download/v${PUP_VERSION}/pup_v${PUP_VERSION}_linux_amd64.zip"
wget -q "$PUP_URL" -O /tmp/pup.zip
unzip -q /tmp/pup.zip -d /tmp
chmod +x /tmp/pup
mv /tmp/pup /usr/local/bin/pup

# Verificar pup
if command -v pup &> /dev/null; then
```

<!-- Page: 2 -->

```
echo " ✓ pup instalado (versão $(pup --version 2>&1 | head -1))"
else
echo " ✗ pup NÃO instalado"
exit 1
fi
```

## fi

```
echo "------------------"
```