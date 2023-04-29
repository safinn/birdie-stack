name       = "birdie-stack"
aws_region = "eu-west-1"
env        = "prod"
create_vpc = true
reponame   = null # required
domain     = null # required
simple     = true

# ECS/EC2
ec2_instance_type = "t4g.micro"
min_instances     = 0 # no tasks = no instances
max_instances     = 1 # ignored if simple = true

# DB
instance_class    = "db.t4g.micro"
allocated_storage = 5

# App
app_instance_count = 1 # ignored if simple = true
