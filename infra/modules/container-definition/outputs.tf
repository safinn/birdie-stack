output "container_definition" {
  value = local.container_definition
}

output "ecr_repository_name" {
  value = length(aws_ecr_repository.image) == 1 ? aws_ecr_repository.image[0].name : ""
}
