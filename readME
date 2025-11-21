minikuibe commands:
minikube start --driver=docker (if error -> minikube delete , start again)
kubectl create deployment mynginx --image=nginx
kubectl expose deployment mynginx --type=NodePort --port=80
minikube service mynginx (or) kubectl port-forward service/mynginx 8085:80
kubectl delete service service_name
kubectl get service ->get list of services

for specific port:
kubectl expose deployment mynginx --type=NodePort --port=8090 --target-port=80

kubectl get pods
kubectl get deployment
kubectl describe pod
kubectl describe pod pod_name




nagios command:
nagios docker image:=>
docker pull jasonrivers/nagios:latest
docker run --name nagiosdemo -p 8888:80 -d jasonrivers/nagios:latest

username:nagiosadmin
password:nagios

or try:
docker pull jasonrivers/nagios:latest
docker run --name nagiosdemo -p 8888:80 jasonrivers/nagios:latest



aws commands:
AWS:
create instance->select connect -> ssh client ->go to  folder where.pem file is there -> copy path->open cmd in ad mode->navigatr to that folder->copy the ssh ->copy and paste the ssh command

sudo apt update
sudo apt-get install docker.io
 sudo apt-get install git
sudo apt-get install nano
create a small example index.html:
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>First HEading</h1>
</body>
</html>
open git bash 
git init
gid add .
git commit -m ""
create empty repo
paste those commands
git clone <https>
ls
cd <repo>
ls
nano Dockerfile (write this)=>
FROM nginx:alpine
COPY . /usr/share/nginx/html

sudo docker build -t myserver .
sudo docker run -d -p 80:80

go to instances and open ipv4 web

stp: sudo docker ps (copy id)
sudo docker stop id
terminate and delete instance



pipeline:
pipeline ani annadu ani manam pipeline tho cheyalsina avasaram edhanta if use scripts ani mention chesthe pipeline {
    agent any

    tools {
        maven 'Maven'
        jdk 'JDK21'
    }

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/yourname/WebAppProject.git'
            }
        }

        stage('Maven Build') {
            steps {
                bat "mvn clean package"
            }
        }

        stage('Run Tests') {
            steps {
                bat "mvn test"
            }
        }

        stage('List WAR File') {
            steps {
                bat "dir target\\*.war"
            }
        }

        stage('Deploy to Tomcat') {
            steps {
                echo "Deploying WAR to Tomcat..."
                // example: copy file to tomcat webapps
                bat 'copy target\\yourapp.war C:\\tomcat\\webapps\\'
            }
        }
    }

    post {
        success {
            echo "Deployment completed successfully!"
        }
    }
}

ilanti script tho cheyyali



checkout ([$class:'GITSCM',branches: [[name: '*/master']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/suryaakshaya/mavenweb.git']]])


webhook:
create pipeline -> sample html->build->configure->pipeline->pipeline syntax->version control->git url->geberate pipeline script->save->webhook->payload url (ngrok http 8080/github-webhook)->test->commit
checkout scmGit(branches: [[name: '*/master']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/suryaakshaya/mavenweb.git']])
checkout([
    $class: 'GitSCM',
    branches: [[name: '*/master']],
    extensions: [],
    userRemoteConfigs: [[url: 'https://github.com/suryaakshaya/mavenweb.git']]
])





email-trigger:
jenkins->configure system->last lo smtp ->stmp.gmail.com(@gmail.com)->advanced:smtp (username:gmail,pass:key generated)->tls->smtpport(587)and enter reciepent email->test
extended email notification -> smtp.gamil.com 465->cred (gmail, passkey generated)->ssl




tomcat:
pipeline {
    agent any

    environment {
        TOMCAT_HOME = "C:/Program Files/Apache Software Foundation/Tomcat 9.0"
    }

    stages {
        stage('Checkout') {
            steps {
                // Clone your GitHub repo
                git branch: 'master', url: 'https://github.com/suryaakshaya/mavenweb.git'
            }
        }

        stage('Build') {
            steps {
                // Run Maven build
                bat 'mvn clean package'
            }
        }

        stage('Deploy to Tomcat') {
            steps {
                // Copy WAR file to Tomcat webapps folder
                bat "copy target\\mavenweb.war \"${TOMCAT_HOME}\\webapps\\\""
            }
        }

        stage('Start Tomcat') {
            steps {
                // Start Tomcat server
                bat "\"${TOMCAT_HOME}\\bin\\startup.bat\""
            }
        }

        stage('Verify Deployment') {
            steps {
                echo 'Application deployed! Open http://localhost:8080/mavenweb'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished!'
        }
    }
}
