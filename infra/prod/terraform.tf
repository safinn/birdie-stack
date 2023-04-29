terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  backend "s3" {
    bucket         = "birdie-stack-tfstate"
    key            = "prod.tfstate"
    region         = "eu-west-1"
    encrypt        = true
    dynamodb_table = "birdie-stack-state"
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = var.aws_region
}
