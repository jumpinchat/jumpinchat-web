#!/usr/bin/env groovy
pipeline {
  agent any
  tools {
      nodejs 'LTS10'
  }
  stages {
    stage('Clear workspace') {
      steps {
        slackSend color: 'good', message: 'Web - Start master build'
        deleteDir()
      }
    }
    stage('Checkout') {
      steps {
        checkout scm
      }
    }
    stage('Setup') {
      steps {
        withCredentials([string(credentialsId: 'FONT_AWESOME_NPM_TOKEN', variable: 'FONT_AWESOME_NPM_TOKEN')]) {
          sh 'printf "@fortawesome:registry=https://npm.fontawesome.com/\n//npm.fontawesome.com/:_authToken=${FONT_AWESOME_NPM_TOKEN}" > ~/.npmrc'
        }
        sh 'yarn install --frozen-lockfile'
      }
    }
    stage('Test') {
      steps {
        parallel (
          "clientTests" : {
            sh './node_modules/.bin/jest'
          },
          "serverTests" : {
            sh 'yarn test'
          }
        )
      }
    }
    stage('Build') {
      steps {
        sh 'gulp build'
      }
    }
    stage('Publish artifact') {
      environment {
        AWS_ACCESS_KEY_ID = 'access key'
        AWS_SECRET_ACCESS_KEY = 'secrey key'
        AWS_BUCKET_NAME = 'jic-artifacts'
        REGION = 'us-east-1'
      }
      steps {
        sh 'build/publish-artifact.sh'
      }
    }
  }
  post {
    success {
      slackSend color: 'good', message: 'Web - Master build complete'
    }
    failure {
      slackSend color: 'bad', message: 'Web - Master build failed'
    }
  }
}
