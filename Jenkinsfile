pipeline {

    agent any

    environment {
        DB_HOST = "URL DO SEU DB"
    }
    
    stages {
        
        stage('Cloning Git') {
            steps {
                git branch: 'master',
                    credentialsId: 'd1dff7cf-e8ec-4a5b-895d-fc3467eb34de',
                    url: 'URL DO SEU REPOSITÓRIO'
                sh "ls -lat"
            }
        }

        stage('Build') {
            steps {
                sh 'npm i'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        
    }

    post {
        
        always {
            step([$class: 'CoberturaPublisher', coberturaReportFile: 'coverage/cobertura-coverage.xml'])
        }
        
        failure {
            updateGitlabCommitStatus name: 'build', state: 'failed'
        }
        
        success {
            updateGitlabCommitStatus name: 'build', state: 'success'
        }
        
    }
}