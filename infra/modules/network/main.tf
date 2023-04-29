################################################################################
# VPC
################################################################################

resource "aws_vpc" "vpc" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name        = "${var.env}-${var.name}-vpc"
    Environment = "${var.env}"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  availability_zone_length = length(data.aws_availability_zones.available.names)
  availability_zone_names  = data.aws_availability_zones.available.names
}

################################################################################
# Internet Gateway
################################################################################

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    Name        = "${var.env}-${var.name}-igw"
    Environment = "${var.env}"
  }
}

################################################################################
# Public Subnet
################################################################################

resource "aws_subnet" "public" {
  count = local.availability_zone_length

  vpc_id     = aws_vpc.vpc.id
  cidr_block = format("10.0.%s.0/24", count.index)

  tags = {
    Name        = "${var.env}-${var.name}-${local.availability_zone_names[count.index]}-public-subnet"
    Environment = "${var.env}"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    Name        = "${var.env}-${var.name}-public-subnet"
    Environment = "${var.env}"
  }
}

resource "aws_route_table_association" "public" {
  count          = local.availability_zone_length
  subnet_id      = element(aws_subnet.public.*.id, count.index)
  route_table_id = aws_route_table.public.id
}

resource "aws_route" "public_internet_gateway" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.igw.id
}

################################################################################
# Private Subnet
################################################################################

resource "aws_subnet" "private" {
  count = local.availability_zone_length

  vpc_id     = aws_vpc.vpc.id
  cidr_block = format("10.0.%s.0/24", count.index + local.availability_zone_length)

  tags = {
    Name        = "${var.env}-${var.name}-${local.availability_zone_names[count.index]}-private-subnet"
    Environment = "${var.env}"
  }
}

resource "aws_route_table" "private" {
  vpc_id = aws_vpc.vpc.id

  tags = {
    Name        = "${var.env}-${var.name}-private-subnet"
    Environment = "${var.env}"
  }
}

resource "aws_route_table_association" "private" {
  count          = local.availability_zone_length
  subnet_id      = element(aws_subnet.private.*.id, count.index)
  route_table_id = aws_route_table.private.id
}
