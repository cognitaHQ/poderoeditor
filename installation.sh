#!/bin/bash

#languages
ES=0
EN=1

START_SCRIPT="startPoderoeditor.sh"
END_SCRIPT="stopPoderoeditor.sh"
INSTALL_LOG="poderoeditor_install.log"
#INTERNAL VARS
DB=db
ENDPOINT=poderoeditor
P_REPO=git@github.com:cognitaHQ/poderoeditor.git
FUSEKI_VERSION=1.1.1
FUSEKI_DOWNLOAD_URL=http://mirrors.ibiblio.org/apache/jena/binaries/jena-fuseki-$FUSEKI_VERSION-distribution.tar.gz 
FUSEKI_DOWNLOAD_TAR_NAME=fuseki.tar.gz
FUSEKI_DOWNLOAD_FILENAME=jena-fuseki-$FUSEKI_VERSION
LANG=$ES
DIR=$(pwd)"/poderoeditor"
S_PUT=./s-put
echo -n "Español [0] / English [1] (default [0]): "
read _LANG
if [ "$_LANG" != "" ]; then
	LANG=$_LANG
fi

if [ "$LANG" != "$EN" ] && [ "$LANG" != "$ES" ]; then
	echo "Wrong language code / Código de lenguaje equivocado"
	exit 1
fi

MSG_REQ=("La instalación de Poderoeditor requiere de JAVA, PYTHON y RUBY. Asegúrese que los tiene instalados antes de proseguir." "The installation of Poderoeditor requires of JAVA, PYTHON and RUBY. Please make sure you have them installed in your computer before continuing.")
MSG_CONTINUE=("Presione Enter para seguir " "Press Enter to continue ")
MSG_HELLO=("Este script instalará Poderoeditor." "This script will install Poderoeditor.")
MSG_DIR=("Poderoeditor se instalará en " "Poderoeditor will be installed at ")
MSG_DIR_ERROR=("Directorio de instalación ya existe. Instalación abortada." "Installation directory already exists. Aborting installation.")
MSG_FLOD_ERROR=("Ocurrió un error instalando FLOD. Instalación abortada." "An error ocurred when installing FLOD. Aborting installation.")
MSG_INSTALL_FLOD=("Instalando FLOD y Poderoeditor", "Intalling FLOD and Poderoeditor")
MSG_INSTALL_FUSEKI=("Instalando la base de datos Fuseki", "Intalling the Fuseki database")
MSG_FUSEKI_ERROR=("Error descagando Fuseki. Instalación abortada.", "Error downloading Fuseki. Installation aborted.")
MSG_FUSEKI_TAR_ERROR=("Error descomprimiendo Fuseki. Instalación abortada.", "Error uncompressing Fuseki. Installation aborted.")
MSG_ADD_RDF=("Cargando datos iniciales.", "Loading initial data.")
MSG_FUSEKI_INIT_ERROR=("Error iniciando Fuseki. Por favor chequear que JAVA y Ruby estén instalados.", "Error starting Fuseki. Make sure you have Java and Ruby installed.")
MSG_WAIT_FUSEKI=("Esperando 10 segundos para inicio de Fuseki." "Waiting 10 seconds for Fuseki to start")
MSG_FUSEKI_RUN_ERROR=("Fuseki no está corriendo. Instalación abortada.", "Fuseki is not running. Installation aborted.")
MSG_SCRIPTS=("Agregando scripts" "Adding scripts")
MSG_FUSEKI_OK=("Fuseki instalado" "Fuseki installed")
MSG_INSTALL_OK=("Instalación terminada. En tu browser anda a http://localhost:54321 e ingresa con usuario 'admin' y password 'flod'" "Installation complete. Go to http://localhost:54321 and log in with user 'admin' and password 'flod'")
echo
echo
echo ${MSG_REQ[$LANG]}
echo
echo
echo ${MSG_HELLO[$LANG]}
echo
echo
echo ${MSG_DIR[$LANG]} $DIR
echo
echo
echo ${MSG_CONTINUE[$LANG]}
read

if [ -e $DIR ]; then
	echo ${MSG_DIR_ERROR[$LANG]}
	exit 2
fi

mkdir $DIR
cd $DIR

echo
echo
echo ===================== ${MSG_INSTALL_FLOD[$LANG]} =====================
echo
echo

bash -s repo-url=$P_REPO < <(curl -skL http://flod.info/install) 2> $INSTALL_LOG

if [ $? != 0 ]; then
	echo ${MSG_FLOD_ERROR[$LANG]}
	exit 3
fi

echo
echo
echo ===================== ${MSG_INSTALL_FUSEKI[$LANG]} =====================
echo
echo


wget -O $FUSEKI_DOWNLOAD_TAR_NAME $FUSEKI_DOWNLOAD_URL 2> $INSTALL_LOG

if [ $? != 0 ]; then
	echo ${MSG_FUSEKI_ERROR[$LANG]}
	exit 4
fi

tar zxvf $FUSEKI_DOWNLOAD_TAR_NAME 2> $INSTALL_LOG

if [ $? != 0 ]; then
	echo ${MSG_FUSEKI_TAR_ERROR[$LANG]}
	exit 5
fi


mv $FUSEKI_DOWNLOAD_FILENAME $DB
rm $FUSEKI_DOWNLOAD_TAR_NAME

echo ${MSG_FUSEKI_OK[$LANG]}

echo
echo
echo ===================== ${MSG_ADD_RDF[$LANG]} =====================
echo
echo

cd $DB


mkdir $ENDPOINT
./fuseki-server  -loc $ENDPOINT --update /poderoeditor & echo $! > .pid

if [ $? != 0 ]; then
	echo ${MSG_FUSEKI_INIT_ERROR[$LANG]}
	exit 6
fi

echo ${MSG_WAIT_FUSEKI[$LANG]}
sleep 10

kill -0 `cat .pid`
if [ $? != 0 ]; then
	echo ${MSG_FUSEKI_RUN_ERROR[$LANG]}
	exit 7
fi

$S_PUT http://localhost:3030/$ENDPOINT/data http://cognita.io/poderoEditor/dataOntology ../flod/components/ontologies/dataOntology.ttl 2> ../$INSTALL_LOG

if [ $? != 0 ]; then
	echo ${MSG_FUSEKI_INIT_ERROR[$LANG]}
	exit 8
fi


$S_PUT http://localhost:3030/$ENDPOINT/data http://cognita.io/poderoEditor/layoutOntology ../flod/components/ontologies/layoutOntology.ttl 2> ../$INSTALL_LOG
$S_PUT http://localhost:3030/$ENDPOINT/data http://cognita.io/poderoEditor/layout ../flod/components/ontologies/layout.ttl 2> ../$INSTALL_LOG
$S_PUT http://localhost:3030/$ENDPOINT/data http://cognita.io/poderoEditor/data ../flod/components/ontologies/data.ttl 2> ../$INSTALL_LOG

kill `cat .pid`

cd ..


echo
echo
echo ===================== ${MSG_SCRIPTS[$LANG]} =====================
echo
echo

echo "#!/bin/bash" > $START_SCRIPT
echo "#Fuseki">> $START_SCRIPT
echo "cd $DB">> $START_SCRIPT
echo "./fuseki-server  -loc $ENDPOINT --update /poderoeditor & echo \$! > .pid" >> $START_SCRIPT
echo "#FLOD">> $START_SCRIPT
echo "cd ../flod">> $START_SCRIPT
echo "./start.sh & echo \$! > .pid">> $START_SCRIPT
echo "#!/bin/bash" > $END_SCRIPT
echo "#Fuseki">> $END_SCRIPT
echo "cd $DB">> $END_SCRIPT
echo "kill \`cat .pid\`">> $END_SCRIPT
echo "#FLOD">> $END_SCRIPT
echo "cd ../flod">> $END_SCRIPT
echo "kill -INT \`cat .pid\`">> $END_SCRIPT

chmod +x $START_SCRIPT
chmod +x $END_SCRIPT

echo 
echo
echo
echo ${MSG_INSTALL_OK[$LANG]}
echo
echo