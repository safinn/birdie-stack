module "remote-state" {
  source     = "../modules/remote-state"
  name       = var.name
  aws_region = var.aws_region
}

module "oidc" {
  source   = "../modules/oidc"
  reponame = var.reponame
}
