pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "harshinielamvaluthy"
        BACKEND_IMAGE = "po-generator-backend"
        FRONTEND_IMAGE = "po-generator-frontend"
        KUBECONFIG_CREDENTIALS_ID = 'kubeconfig'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend - Build & Push') {
            steps {
                script {
                    println "Building Backend Image..."
                    def backendImg = docker.build("${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${env.BUILD_NUMBER}", "./backend")
                    
                    docker.withRegistry('', 'docker-hub-credentials') {
                        backendImg.push()
                        backendImg.push('latest')
                    }
                }
            }
        }

        stage('Frontend - Build & Push') {
            steps {
                script {
                    println "Building Frontend Image..."
                    def frontendImg = docker.build("${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${env.BUILD_NUMBER}", "./frontend")
                    
                    docker.withRegistry('', 'docker-hub-credentials') {
                        frontendImg.push()
                        frontendImg.push('latest')
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    sh "sed -i 's|IMAGE_TAG|${env.BUILD_NUMBER}|g' k8s/*.yaml"
                    
                    withKubeConfig([credentialsId: "${KUBECONFIG_CREDENTIALS_ID}"]) {
                        sh "kubectl apply -f k8s/"
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
