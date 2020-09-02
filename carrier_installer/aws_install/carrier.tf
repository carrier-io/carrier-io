provider "aws" {
  access_key = "${var.access_key}"
  secret_key = "${var.secret_key}"
  region     = "${var.region}"
}

resource "aws_security_group" "Carrier_security_group" {
  name         = "Carrier security group"
  description  = "Carrier security group"

  ingress {
    cidr_blocks = "${var.ingressCIDRblock}"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
  }
  ingress {
    cidr_blocks = "${var.ingressCIDRblock}"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
  }
  ingress {
    cidr_blocks = "${var.ingressCIDRblock}"
    from_port   = 3100
    to_port     = 3100
    protocol    = "tcp"
  }
  ingress {
    cidr_blocks = "${var.ingressCIDRblock}"
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
  }
  ingress {
    cidr_blocks = "${var.ingressCIDRblock}"
    from_port   = 8086
    to_port     = 8086
    protocol    = "tcp"
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "carrier" {
  ami            = "${var.ami}"
  instance_type  = "${var.vm_type}"
  key_name       = "${var.key_name}"
  vpc_security_group_ids = [aws_security_group.Carrier_security_group.id]
}
